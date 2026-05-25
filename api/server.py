from __future__ import annotations

import logging
import os
import shutil
import tempfile
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any, Awaitable, Callable, Dict

import uvicorn
from fastapi import FastAPI, Request, Response, UploadFile, File
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
from models.enhancer import UnderwaterEnhancer
from models.detector import ObjectDetector
from utils.image_utils import image_to_base64
from pipelines.inference_pipeline import run_pipeline

logger = logging.getLogger("samudrika.track_b")
logging.basicConfig(level=logging.INFO)


class DetectionInput(BaseModel):
    """
    Incoming detection format for API requests.
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
    enhanced_image: str
    detections: list[Dict[str, Any]]
    heatmap: str
    threat_level: str


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
    """
    try:
        index, metadata_store = load_index()
        logger.info("FAISS index loaded successfully.")
    except FileNotFoundError:
        index = create_index()
        metadata_store = []
        logger.info("FAISS index files not found. Created new empty index.")

    rules = load_threat_rules()
    logger.info("Threat rules loaded from configuration.")

    # Initialize Model Wrappers
    app.state.enhancer = UnderwaterEnhancer()
    app.state.detector = ObjectDetector()

    app.state.faiss_index = index
    app.state.metadata_store = metadata_store
    app.state.threat_rules = rules

    # Grad-CAM proxy model
    app.state.proxy_model = ProxyCNN(num_classes=len(rules.get("class_index_map", {})) or 8)

    logger.info(
        "Track B server initialized — FAISS index loaded, rules loaded, Models ready."
    )

    yield


app = FastAPI(
    title="Samudrika-Core Track B API",
    version="1.0.0",
    lifespan=lifespan,
)

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
    method = request.method
    path = request.url.path
    logger.info("Incoming request: %s %s", method, path)
    response = await call_next(request)
    logger.info("Completed request: %s %s -> %s", method, path, response.status_code)
    return response


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_frame(request: Request, file: UploadFile = File(...)) -> AnalyzeResponse:
    """
    Full Pipeline: Image Upload -> Enhancement -> Detection -> Threat Scoring -> Grad-CAM.
    """
    app_state = request.app.state

    # 1. Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
        shutil.copyfileobj(file.file, temp_file)
        temp_image_path = temp_file.name

    try:
        # Load image for processing
        import cv2
        img = cv2.imread(temp_image_path)
        if img is None:
            raise ValueError("Could not read the uploaded image.")

        # 2. Image Enhancement
        enhanced_img = app_state.enhancer.enhance(img)

        # 3. Object Detection (YOLOv11 Placeholder)
        detections = app_state.detector.detect(enhanced_img)

        # 4. Prepare track_a_output for threat scoring pipeline
        track_a_output = {
            "image_id": os.path.basename(temp_image_path),
            "detections": [
                {
                    "class": det["class"],
                    "confidence": det["confidence"],
                    "bbox": det["bbox"],
                    "embedding": [0.0] * 128, # Placeholder embeddings
                }
                for det in detections
            ],
        }

        # 5. Run Scoring & Explainability Pipeline
        pipeline_result = run_pipeline(
            track_a_output=track_a_output,
            image_path=temp_image_path,
            save_outputs=False
        )

        # 6. Handle Heatmap (Grad-CAM)
        heatmap_b64 = ""
        if pipeline_result["heatmap_paths"]:
            heatmap_path = pipeline_result["heatmap_paths"][0]
            if os.path.exists(heatmap_path):
                heatmap_img = cv2.imread(heatmap_path)
                heatmap_b64 = image_to_base64(heatmap_img)

        # 7. Convert Enhanced Image to Base64
        enhanced_b64 = image_to_base64(enhanced_img)

        return AnalyzeResponse(
            enhanced_image=enhanced_b64,
            detections=detections,
            heatmap=heatmap_b64,
            threat_level=pipeline_result["frame_threat_level"]
        )

    except Exception as e:
        logger.exception("Error during analysis pipeline")
        raise Exception(f"Pipeline error: {str(e)}")
    finally:
        # Cleanup temporary file
        if os.path.exists(temp_image_path):
            os.remove(temp_image_path)


@app.post("/threat", response_model=ThreatResponse)
async def assess_threat(
    payload: SingleDetectionInput,
    request: Request,
) -> ThreatResponse:
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
