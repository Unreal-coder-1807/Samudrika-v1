from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any, Awaitable, Callable

import uvicorn
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field

from explainability.gradcam import ProxyCNN, batch_generate_heatmaps
from threat_engine.threat_scoring import (
    load_threat_rules,
    score_detection,
    score_frame,
)
from vector_store.faiss_index import (
    create_index,
    get_index_size,
    load_index,
    search_embedding,
)


logger = logging.getLogger("samudrika.track_b")
logging.basicConfig(level=logging.INFO)


class DetectionInput(BaseModel):
    """
    Incoming detection format for API requests.

    The external JSON field name is 'class', which is mapped to the internal
    Pydantic field 'class_name' via an alias for compatibility with the Track A
    output schema.
    """

    class_name: str = Field(alias="class")
    confidence: float
    bbox: list[float]
    embedding: list[float]

    model_config = ConfigDict(populate_by_name=True)


class FrameInput(BaseModel):
    """
    Input model representing a full frame of detections from Track A.
    """

    image_id: str
    detections: list[DetectionInput]


class SingleDetectionInput(BaseModel):
    """
    Input model for threat assessment of a single detection.
    """

    detection: DetectionInput


class ScoredDetectionOutput(BaseModel):
    """
    Output model for a single scored detection.
    """

    class_name: str
    confidence: float
    bbox: list[float]
    threat_level: str
    threat_score: float
    reason: str
    similarity_match: dict


class AnalyzeResponse(BaseModel):
    """
    Response model for the /analyze endpoint.
    """

    image_id: str
    frame_threat_level: str
    scored_detections: list[ScoredDetectionOutput]
    heatmap_paths: list[str]


class ThreatResponse(BaseModel):
    """
    Response model for the /threat endpoint.
    """

    threat_level: str
    threat_score: float
    reason: str
    similarity_match: dict


class HealthResponse(BaseModel):
    """
    Response model for the /health endpoint.
    """

    status: str
    faiss_index_size: int
    rules_loaded: bool
    timestamp: str


@asynccontextmanager
async def lifespan(app: FastAPI) -> Awaitable[None]:
    """
    Application lifespan context for initializing shared state.

    On startup:
        - Loads or creates the FAISS index and metadata store.
        - Loads threat rules from configuration.
        - Initializes the ProxyCNN model used for Grad-CAM.
    """
    # Initialize FAISS index and metadata.
    try:
        index, metadata_store = load_index()
        logger.info("FAISS index loaded successfully.")
    except FileNotFoundError:
        index = create_index()
        metadata_store = []
        logger.info("FAISS index files not found. Created new empty index.")

    # Load threat rules.
    rules = load_threat_rules()
    logger.info("Threat rules loaded from configuration.")

    # Initialize ProxyCNN for Grad-CAM generation.
    proxy_model = ProxyCNN(num_classes=len(rules.get("class_index_map", {})) or 8)

    app.state.faiss_index = index
    app.state.metadata_store = metadata_store
    app.state.threat_rules = rules
    app.state.proxy_model = proxy_model

    logger.info(
        "Track B server initialized — FAISS index loaded, rules loaded, ProxyCNN ready."
    )

    yield


app = FastAPI(
    title="Samudrika-Core Track B API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration for operator dashboard access.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_logging_middleware(
    request: Request,
    call_next: Callable[[Request], Awaitable[Response]],
) -> Response:
    """
    Logs basic information about each incoming HTTP request.

    Logs the HTTP method, request path, and response status code.
    """
    method = request.method
    path = request.url.path
    logger.info("Incoming request: %s %s", method, path)

    response = await call_next(request)

    logger.info("Completed request: %s %s -> %s", method, path, response.status_code)
    return response


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_frame(frame: FrameInput, request: Request) -> AnalyzeResponse:
    """
    Analyzes all detections in a frame and returns threat assessments.

    This endpoint:
        1. Converts the incoming FrameInput into the Track A-style dictionary
           expected by the threat scoring engine.
        2. Scores the frame using score_frame().
        3. Generates Grad-CAM heatmaps for each detection (best-effort).
    """
    app_state = request.app.state
    index = app_state.faiss_index
    metadata_store = app_state.metadata_store
    rules = app_state.threat_rules
    proxy_model: ProxyCNN = app_state.proxy_model

    # Convert input to Track A-compatible dictionary.
    track_a_output: dict[str, Any] = {
        "image_id": frame.image_id,
        "detections": [
            {
                "class": det.class_name,
                "confidence": det.confidence,
                "bbox": det.bbox,
                "embedding": det.embedding,
            }
            for det in frame.detections
        ],
    }

    # Edge case: empty detections list.
    if not track_a_output["detections"]:
        return AnalyzeResponse(
            image_id=frame.image_id,
            frame_threat_level="NONE",
            scored_detections=[],
            heatmap_paths=[],
        )

    scored_frame = score_frame(
        track_a_output=track_a_output,
        index=index,
        metadata_store=metadata_store,
        rules=rules,
    )

    scored_detections_raw = scored_frame.get("scored_detections", []) or []

    # Best-effort Grad-CAM heatmap generation. If the underlying image file
    # does not exist or Grad-CAM fails, the server still returns threat scores.
    heatmap_paths: list[str] = []
    try:
        heatmap_paths = batch_generate_heatmaps(
            image_path=frame.image_id,
            scored_detections=scored_detections_raw,
            model=proxy_model,
        )
    except FileNotFoundError:
        logger.warning(
            "Image file '%s' not found for Grad-CAM generation; "
            "returning threat scores without heatmaps.",
            frame.image_id,
        )
        heatmap_paths = []
    except Exception as exc:  # pragma: no cover - defensive logging
        logger.error(
            "Failed to generate Grad-CAM heatmaps for '%s': %s",
            frame.image_id,
            exc,
        )
        heatmap_paths = []

    scored_detections_output = [
        ScoredDetectionOutput(
            class_name=det.get("class", ""),
            confidence=float(det.get("confidence", 0.0)),
            bbox=list(det.get("bbox", [])),
            threat_level=str(det.get("threat_level", "")),
            threat_score=float(det.get("threat_score", 0.0)),
            reason=str(det.get("reason", "")),
            similarity_match=det.get("similarity_match") or {},
        )
        for det in scored_detections_raw
    ]

    return AnalyzeResponse(
        image_id=str(scored_frame.get("image_id", frame.image_id)),
        frame_threat_level=str(scored_frame.get("frame_threat_level", "NONE")),
        scored_detections=scored_detections_output,
        heatmap_paths=heatmap_paths,
    )


@app.post("/threat", response_model=ThreatResponse)
async def assess_threat(
    payload: SingleDetectionInput,
    request: Request,
) -> ThreatResponse:
    """
    Assesses the threat level for a single detection.

    The endpoint:
        1. Performs a similarity search for the detection embedding.
        2. Scores the detection using the shared threat rules.
    """
    app_state = request.app.state
    index = app_state.faiss_index
    metadata_store = app_state.metadata_store
    rules = app_state.threat_rules

    det = payload.detection

    similarity_results = search_embedding(
        index=index,
        query_embedding=det.embedding,
        metadata_store=metadata_store,
    )

    detection_dict: dict[str, Any] = {
        "class": det.class_name,
        "confidence": det.confidence,
        "bbox": det.bbox,
        "embedding": det.embedding,
    }
    scored = score_detection(
        detection=detection_dict,
        similarity_results=similarity_results,
        rules=rules,
    )

    return ThreatResponse(
        threat_level=str(scored.get("threat_level", "")),
        threat_score=float(scored.get("threat_score", 0.0)),
        reason=str(scored.get("reason", "")),
        similarity_match=scored.get("similarity_match") or {},
    )


@app.get("/health", response_model=HealthResponse)
async def health(request: Request) -> HealthResponse:
    """
    Returns the health status of the Track B server.

    Includes FAISS index size, whether threat rules are loaded, and the
    current UTC timestamp in ISO-8601 format.
    """
    app_state = request.app.state
    index = app_state.faiss_index
    rules = app_state.threat_rules

    faiss_size = get_index_size(index)
    rules_loaded = bool(rules)
    timestamp = datetime.now(timezone.utc).isoformat()

    return HealthResponse(
        status="ok",
        faiss_index_size=faiss_size,
        rules_loaded=rules_loaded,
        timestamp=timestamp,
    )


if __name__ == "__main__":
    uvicorn.run("api.server:app", host="0.0.0.0", port=8000, reload=True)

