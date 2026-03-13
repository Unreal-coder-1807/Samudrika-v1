from __future__ import annotations

from typing import Any

import numpy as np
import pytest
from httpx import AsyncClient

from api.server import app
from threat_engine.threat_scoring import load_threat_rules, score_detection, score_frame
from vector_store.faiss_index import (
    EMBEDDING_DIM,
    create_index,
    get_index_size,
    save_index,
    load_index,
    add_embedding,
    search_embedding,
)


def _random_embedding(dim: int = EMBEDDING_DIM) -> list[float]:
    """
    Generates a random embedding vector of the specified dimension.

    Args:
        dim: Length of the embedding vector to generate.

    Returns:
        list[float]: Random float vector.
    """
    return np.random.random(dim).astype("float32").tolist()


def test_faiss_add_and_search() -> None:
    """
    Ensure that embeddings can be added to a FAISS index and retrieved via search.
    """
    index = create_index()
    metadata_store: list[dict[str, Any]] = []

    # Add 5 random embeddings with mock metadata.
    for i in range(5):
        emb = _random_embedding()
        meta = {
            "class": "submarine",
            "image_id": f"img_{i}.jpg",
            "detection_id": i,
        }
        add_embedding(index, emb, meta, metadata_store)

    # Search with a 6th random embedding.
    query_emb = _random_embedding()
    results = search_embedding(index, query_emb, metadata_store, top_k=3)

    assert len(results) == 3
    for res in results:
        assert "rank" in res
        assert "distance" in res
        assert "class" in res
        assert "image_id" in res


def test_faiss_save_and_reload(tmp_path: pytest.TempPathFactory) -> None:
    """
    Verify that a FAISS index and its metadata can be saved and reloaded.
    """
    index = create_index()
    metadata_store: list[dict[str, Any]] = []

    for i in range(3):
        emb = _random_embedding()
        meta = {
            "class": "submarine",
            "image_id": f"img_{i}.jpg",
            "detection_id": i,
        }
        add_embedding(index, emb, meta, metadata_store)

    save_dir = tmp_path.mktemp("faiss_index")
    save_index(index, metadata_store, path=str(save_dir))

    reloaded_index, _ = load_index(path=str(save_dir))
    assert get_index_size(reloaded_index) == 3


def test_threat_scoring_critical() -> None:
    """
    A naval mine with sufficient confidence and similarity should be CRITICAL.
    """
    rules = load_threat_rules()
    detection = {
        "class": "naval_mine",
        "confidence": 0.88,
        "bbox": [10, 20, 100, 200],
        "embedding": _random_embedding(),
    }
    similarity_results = [
        {
            "rank": 1,
            "distance": 0.5,
            "class": "naval_mine",
            "image_id": "ref_001.jpg",
        }
    ]

    scored = score_detection(detection, similarity_results, rules)
    assert scored["threat_level"] == "CRITICAL"


def test_threat_scoring_low_confidence_override() -> None:
    """
    A submarine with low confidence should be downgraded to LOW per override rules.
    """
    rules = load_threat_rules()
    detection = {
        "class": "submarine",
        "confidence": 0.30,
        "bbox": [10, 20, 100, 200],
        "embedding": _random_embedding(),
    }
    similarity_results: list[dict[str, Any]] = []

    scored = score_detection(detection, similarity_results, rules)
    assert scored["threat_level"] == "LOW"


def test_score_frame_empty_detections() -> None:
    """
    Frames with no detections should yield a NONE frame threat level.
    """
    from vector_store.faiss_index import create_index

    index = create_index()
    metadata_store: list[dict[str, Any]] = []
    rules = load_threat_rules()

    track_a_output = {
        "image_id": "frame_empty.jpg",
        "detections": [],
    }

    scored_frame = score_frame(track_a_output, index, metadata_store, rules)
    assert scored_frame["frame_threat_level"] == "NONE"
    assert scored_frame["scored_detections"] == []


@pytest.mark.asyncio
async def test_api_health_endpoint() -> None:
    """
    Health endpoint should respond with status 'ok'.
    """
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_api_analyze_endpoint() -> None:
    """
    Analyze endpoint should process a frame with two detections.
    """
    # Use simple random embeddings for the mock payload.
    detection_payloads = [
        {
            "class": "submarine",
            "confidence": 0.9,
            "bbox": [10, 20, 100, 200],
            "embedding": _random_embedding(),
        },
        {
            "class": "diver",
            "confidence": 0.7,
            "bbox": [50, 60, 150, 220],
            "embedding": _random_embedding(),
        },
    ]
    frame_payload = {
        "image_id": "test_frame.jpg",
        "detections": detection_payloads,
    }

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/analyze", json=frame_payload)
        assert response.status_code == 200
        data = response.json()

        assert "frame_threat_level" in data
        assert "scored_detections" in data
        assert len(data["scored_detections"]) == 2

