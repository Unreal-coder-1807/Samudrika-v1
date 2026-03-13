from __future__ import annotations

from pathlib import Path
from typing import Any

import cv2
import numpy as np
import plotly.graph_objects as go


THREAT_COLORS: dict[str, tuple[int, int, int]] = {
    "CRITICAL": (0, 0, 255),       # BGR Red
    "HIGH": (0, 102, 255),         # BGR Orange
    "MEDIUM": (0, 204, 255),       # BGR Yellow
    "LOW": (68, 204, 0),           # BGR Green
    "NONE": (200, 200, 200),       # BGR Grey
}


def _bgr_to_hex(color_bgr: tuple[int, int, int]) -> str:
    """
    Converts a BGR color tuple to a hexadecimal RGB string.

    Args:
        color_bgr: Color tuple in BGR order (blue, green, red).

    Returns:
        str: Hex color string in the form '#RRGGBB'.
    """
    b, g, r = color_bgr
    return f"#{r:02x}{g:02x}{b:02x}"


def draw_detections(
    image_path: str,
    scored_detections: list[dict[str, Any]],
    save_path: str,
) -> None:
    """
    Draws detection bounding boxes and labels on an image and saves the result.

    For each detection, a bounding box is drawn using a color determined by
    the detection's threat level. A text label is placed above the box in the
    format "{class} | {threat_level} | {confidence:.2f}", with a filled
    rectangle behind the text for improved readability.

    Args:
        image_path: Path to the input image file.
        scored_detections: List of scored detection dictionaries, each expected
            to contain at least "bbox", "class", "threat_level", and
            "confidence" keys.
        save_path: Path where the annotated image will be saved.
    """
    image = cv2.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"Could not read image from path: {image_path}")

    for det in scored_detections:
        bbox = det.get("bbox")
        if bbox is None:
            continue

        x1, y1, x2, y2 = map(int, bbox)
        det_class = str(det.get("class", "unknown"))
        threat_level = str(det.get("threat_level", "NONE"))
        confidence = float(det.get("confidence", 0.0))

        color = THREAT_COLORS.get(threat_level, THREAT_COLORS["NONE"])

        # Draw bounding box.
        cv2.rectangle(image, (x1, y1), (x2, y2), color, thickness=2)

        # Prepare label text.
        label = f"{det_class} | {threat_level} | {confidence:.2f}"
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.5
        thickness = 1
        (text_width, text_height), baseline = cv2.getTextSize(
            label, font, font_scale, thickness
        )

        # Position text above the bounding box, clamped to image bounds.
        text_x = x1
        text_y = max(y1 - 5, text_height + 5)

        # Draw filled rectangle behind text.
        cv2.rectangle(
            image,
            (text_x, text_y - text_height - baseline),
            (text_x + text_width, text_y + baseline),
            color,
            thickness=-1,
        )

        # Draw text in white on top of colored rectangle.
        cv2.putText(
            image,
            label,
            (text_x, text_y),
            font,
            font_scale,
            (255, 255, 255),
            thickness,
            lineType=cv2.LINE_AA,
        )

    save_path_obj = Path(save_path)
    save_path_obj.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(save_path_obj), image)


def plot_threat_distribution(
    scored_frames: list[dict[str, Any]],
    save_path: str = "outputs/visualizations/threat_distribution.html",
) -> None:
    """
    Creates and saves a bar chart showing the distribution of threat levels.

    The function counts occurrences of each frame-level threat category across
    all provided frames and visualizes the results using a Plotly bar chart.
    Bars are colored according to THREAT_COLORS, converted to hexadecimal RGB.

    Args:
        scored_frames: List of frame-level threat assessment dictionaries,
            each expected to include a "frame_threat_level" key.
        save_path: Path where the resulting HTML file will be saved.
    """
    levels = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "NONE"]
    counts: dict[str, int] = {level: 0 for level in levels}

    for frame in scored_frames:
        level = str(frame.get("frame_threat_level", "NONE"))
        if level in counts:
            counts[level] += 1

    x = levels
    y = [counts[level] for level in levels]
    colors = [_bgr_to_hex(THREAT_COLORS[level]) for level in levels]

    fig = go.Figure(
        data=[
            go.Bar(
                x=x,
                y=y,
                marker_color=colors,
            )
        ]
    )
    fig.update_layout(
        title="Threat Level Distribution — Samudrika-Core",
        xaxis_title="Threat Level",
        yaxis_title="Count",
        template="plotly_white",
    )

    save_path_obj = Path(save_path)
    save_path_obj.parent.mkdir(parents=True, exist_ok=True)
    fig.write_html(str(save_path_obj), include_plotlyjs="cdn")


def create_detection_summary_table(
    scored_frames: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """
    Flattens detections from multiple frames into a summary table.

    For every detection within each frame in scored_frames, a summary entry is
    created with the following keys:
        - "image_id"
        - "class"
        - "confidence"
        - "threat_level"
        - "threat_score"

    Args:
        scored_frames: List of frame-level threat assessment dictionaries,
            each expected to contain "image_id" and "scored_detections".

    Returns:
        list[dict[str, Any]]: List of flattened detection summary dictionaries.
    """
    summary: list[dict[str, Any]] = []

    for frame in scored_frames:
        image_id = frame.get("image_id")
        detections = frame.get("scored_detections", []) or []

        for det in detections:
            summary.append(
                {
                    "image_id": image_id,
                    "class": det.get("class"),
                    "confidence": det.get("confidence"),
                    "threat_level": det.get("threat_level"),
                    "threat_score": det.get("threat_score"),
                }
            )

    return summary


if __name__ == "__main__":
    # Basic self-test for visualization utilities.
    # 1. Create a 400x400 black test image.
    test_img = np.zeros((400, 400, 3), dtype="uint8")
    test_input_path = "outputs/visualizations/test_input.jpg"
    Path(test_input_path).parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(test_input_path, test_img)

    # 2. Create two mock scored detections.
    mock_detections = [
        {
            "class": "submarine",
            "confidence": 0.9,
            "bbox": [50, 50, 200, 200],
            "threat_level": "HIGH",
            "threat_score": 0.75,
        },
        {
            "class": "diver",
            "confidence": 0.7,
            "bbox": [220, 100, 350, 300],
            "threat_level": "MEDIUM",
            "threat_score": 0.5,
        },
    ]

    test_output_path = "outputs/visualizations/test_annotated.jpg"
    draw_detections(
        image_path=test_input_path,
        scored_detections=mock_detections,
        save_path=test_output_path,
    )

    # 3. Create mock scored_frames and generate threat distribution plot.
    mock_scored_frames = [
        {
            "image_id": "frame_001.jpg",
            "frame_threat_level": "HIGH",
            "scored_detections": mock_detections,
        },
        {
            "image_id": "frame_002.jpg",
            "frame_threat_level": "MEDIUM",
            "scored_detections": [],
        },
        {
            "image_id": "frame_003.jpg",
            "frame_threat_level": "NONE",
            "scored_detections": [],
        },
    ]

    plot_threat_distribution(mock_scored_frames)

