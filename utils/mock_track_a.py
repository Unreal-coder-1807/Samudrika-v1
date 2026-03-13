from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Optional

import numpy as np


MOCK_CLASSES: list[str] = [
    "submarine",
    "naval_mine",
    "diver",
    "rov",
    "torpedo",
    "underwater_drone",
    "underwater_vehicle",
    "unknown",
]


def generate_random_embedding(dim: int = 512) -> list[float]:
    """
    Returns a normalized random float vector of length dim.

    The vector is sampled from a standard normal distribution and then
    L2-normalized to unit length. If a zero vector is sampled (extremely
    unlikely), a fallback unit vector along the first dimension is used.

    Args:
        dim: Length of the embedding vector to generate.

    Returns:
        list[float]: A list of floats representing the normalized vector.
    """
    if dim <= 0:
        raise ValueError("Embedding dimension 'dim' must be a positive integer.")

    vec = np.random.normal(size=(dim,)).astype("float32")
    norm = float(np.linalg.norm(vec))
    if norm == 0.0:
        vec = np.zeros(dim, dtype="float32")
        vec[0] = 1.0
    else:
        vec /= norm

    return vec.tolist()


def _random_bbox(
    image_width: int = 640,
    image_height: int = 480,
) -> list[int]:
    """
    Generates a random bounding box within a synthetic image size.

    Args:
        image_width: Width of the synthetic image.
        image_height: Height of the synthetic image.

    Returns:
        list[int]: Bounding box in [x1, y1, x2, y2] format.
    """
    x1 = int(np.random.randint(0, max(1, image_width // 2)))
    y1 = int(np.random.randint(0, max(1, image_height // 2)))
    x2 = int(np.random.randint(x1 + 1, image_width))
    y2 = int(np.random.randint(y1 + 1, image_height))
    return [x1, y1, x2, y2]


def generate_mock_detection(
    class_name: Optional[str] = None,
    confidence: Optional[float] = None,
) -> dict[str, Any]:
    """
    Generates a single mock detection object with random bbox and embedding.

    If class_name is None, a random class is chosen from MOCK_CLASSES.
    If confidence is None, a random confidence value between 0.5 and 0.99
    (inclusive of 0.5, exclusive of 0.99) is generated.

    Args:
        class_name: Optional explicit class name to assign to the detection.
        confidence: Optional explicit confidence score to use.

    Returns:
        dict[str, Any]: Mock detection dictionary compatible with Track A output.
    """
    if class_name is None:
        class_name = np.random.choice(MOCK_CLASSES).item()
    if class_name not in MOCK_CLASSES:
        raise ValueError(f"Invalid class_name '{class_name}'. Must be one of {MOCK_CLASSES}.")

    if confidence is None:
        confidence = float(np.random.uniform(0.5, 0.99))
    if not (0.0 <= confidence <= 1.0):
        raise ValueError("confidence must be in the range [0.0, 1.0].")

    bbox = _random_bbox()
    embedding = generate_random_embedding()

    return {
        "class": class_name,
        "confidence": confidence,
        "bbox": bbox,
        "embedding": embedding,
    }


def generate_mock_frame_output(
    image_id: str = "mock_frame_001.jpg",
    num_detections: int = 3,
) -> dict[str, Any]:
    """
    Generates a full Track A output dict for one image.

    Classes and confidences are randomly sampled so that downstream components
    can exercise a variety of threat-scoring scenarios.

    Args:
        image_id: Identifier of the mock image or frame.
        num_detections: Number of detections to generate for the frame.

    Returns:
        dict[str, Any]: Mock Track A-style output for a single frame.
    """
    if num_detections < 0:
        raise ValueError("num_detections must be non-negative.")

    detections = [generate_mock_detection() for _ in range(num_detections)]
    return {
        "image_id": image_id,
        "detections": detections,
    }


def save_mock_output(
    output: dict[str, Any],
    save_path: str = "utils/mock_track_a_output.json",
) -> None:
    """
    Saves mock output to JSON file for use in pipeline testing.

    Args:
        output: Mock Track A-style output dictionary to save.
        save_path: Relative path to the JSON file where the output is written.
    """
    path = Path(save_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    # Generate a mock frame with 4 detections, print it, and save to disk.
    mock_output = generate_mock_frame_output(
        image_id="mock_frame_main.jpg",
        num_detections=4,
    )
    print(json.dumps(mock_output, indent=2))
    save_mock_output(mock_output)

