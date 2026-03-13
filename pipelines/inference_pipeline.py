from __future__ import annotations

import argparse
import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from explainability.gradcam import ProxyCNN, batch_generate_heatmaps
from threat_engine.threat_scoring import load_threat_rules, score_frame
from vector_store.faiss_index import get_index_size, load_index


logger = logging.getLogger("samudrika.track_b.pipeline")
logging.basicConfig(level=logging.INFO)


def run_pipeline(
    track_a_output: dict[str, Any],
    image_path: str | None = None,
    save_outputs: bool = True,
) -> dict[str, Any]:
    """
    Runs the complete Track B pipeline for one frame.

    Steps:
        1. Load FAISS index and metadata.
        2. Load threat rules from configuration.
        3. Call score_frame(track_a_output, index, metadata_store, rules).
        4. Initialize the ProxyCNN model used for Grad-CAM.
        5. If an image_path is provided and exists on disk, call
           batch_generate_heatmaps() to generate Grad-CAM overlays.
           Otherwise, set heatmap_paths to an empty list and log a warning.
        6. If save_outputs is True, save the scored result JSON to
           outputs/results/{image_id}_{timestamp}.json.
        7. Log a summary including image_id, frame_threat_level, and the
           number of detections.
        8. Return a dictionary enriched with frame-level threat metadata:
           {
               "image_id": str,
               "frame_threat_level": str,
               "scored_detections": list,
               "heatmap_paths": list,
               "processed_at": ISO timestamp str,
           }

    Args:
        track_a_output: Single-frame output from Track A in JSON-compatible
            dictionary format.
        image_path: Optional path to the original image used for detections;
            used to generate Grad-CAM overlays when available.
        save_outputs: Whether to persist the enriched pipeline results to disk.

    Returns:
        dict[str, Any]: Full enriched result dictionary as described above.
    """
    # 1. Load FAISS index and metadata.
    try:
        index, metadata_store = load_index()
        logger.info(
            "Loaded FAISS index with %d vectors.", get_index_size(index)
        )
    except FileNotFoundError:
        # Inference can still proceed, but similarity-based overrides will be
        # ineffective due to the lack of historical embeddings.
        from vector_store.faiss_index import create_index

        index = create_index()
        metadata_store = []
        logger.warning(
            "FAISS index files not found; proceeding with an empty index."
        )

    # 2. Load threat rules.
    rules = load_threat_rules()

    # 3. Score the frame.
    scored_frame = score_frame(
        track_a_output=track_a_output,
        index=index,
        metadata_store=metadata_store,
        rules=rules,
    )

    image_id = str(scored_frame.get("image_id", track_a_output.get("image_id", "")))
    scored_detections = scored_frame.get("scored_detections", []) or []

    # 4. Initialize ProxyCNN for Grad-CAM.
    proxy_model = ProxyCNN(num_classes=len(rules.get("class_index_map", {})) or 8)

    # 5. Generate Grad-CAM heatmaps when possible.
    heatmap_paths: list[str] = []
    if image_path is not None and os.path.isfile(image_path):
        try:
            heatmap_paths = batch_generate_heatmaps(
                image_path=image_path,
                scored_detections=scored_detections,
                model=proxy_model,
            )
        except Exception as exc:  # pragma: no cover - defensive logging
            logger.error(
                "Failed to generate Grad-CAM heatmaps for '%s': %s",
                image_path,
                exc,
            )
            heatmap_paths = []
    else:
        logger.warning("No image path provided or file missing, skipping Grad-CAM.")
        heatmap_paths = []

    processed_at = datetime.now(timezone.utc).isoformat()

    result = {
        "image_id": image_id,
        "frame_threat_level": str(
            scored_frame.get("frame_threat_level", "NONE")
        ),
        "scored_detections": scored_detections,
        "heatmap_paths": heatmap_paths,
        "processed_at": processed_at,
    }

    # 6. Optionally persist the enriched result.
    if save_outputs:
        outputs_dir = Path("outputs/results/")
        outputs_dir.mkdir(parents=True, exist_ok=True)
        timestamp_str = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        output_filename = f"{image_id}_{timestamp_str}.json" if image_id else f"frame_{timestamp_str}.json"
        output_path = outputs_dir / output_filename

        with output_path.open("w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        logger.info("Saved pipeline result to %s", output_path)

    # 7. Log a concise summary.
    logger.info(
        "Pipeline summary — Image ID: %s | Frame Threat: %s | Detections: %d",
        image_id,
        result["frame_threat_level"],
        len(scored_detections),
    )

    return result


def _print_summary_table(result: dict[str, Any]) -> None:
    """
    Prints a formatted summary table for pipeline results to stdout.

    The table resembles:

        ┌─────────────────────────────────────────────┐
        │ Samudrika-Core | Track B Result Summary    │
        ├──────────────────┬─────────────────────────┤
        │ Image ID         │ frame_001.jpg           │
        │ Frame Threat     │ HIGH                    │
        │ Total Detections │ 3                       │
        │ Heatmaps Saved   │ 2                       │
        └──────────────────┴─────────────────────────┘

    Args:
        result: Enriched pipeline result dictionary returned by run_pipeline().
    """
    image_id = result.get("image_id", "")
    frame_threat = result.get("frame_threat_level", "")
    total_detections = len(result.get("scored_detections", []) or [])
    heatmaps_saved = len(result.get("heatmap_paths", []) or [])

    title = "Samudrika-Core | Track B Result Summary"
    header_width = max(len(title) + 2, 45)

    top_border = "┌" + "─" * header_width + "┐"
    title_line = "│ " + title.ljust(header_width - 1) + "│"
    separator = "├" + "─" * 18 + "┬" + "─" * (header_width - 19) + "┤"
    bottom_border = "└" + "─" * 18 + "┴" + "─" * (header_width - 19) + "┘"

    def row(label: str, value: str) -> str:
        return f"│ {label.ljust(16)} │ {value.ljust(header_width - 21)}│"

    print(top_border)
    print(title_line)
    print(separator)
    print(row("Image ID", str(image_id)))
    print(row("Frame Threat", str(frame_threat)))
    print(row("Total Detections", str(total_detections)))
    print(row("Heatmaps Saved", str(heatmaps_saved)))
    print(bottom_border)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Run the Samudrika-Core Track B inference pipeline "
        "for a single Track A JSON output."
    )
    parser.add_argument(
        "--input",
        required=True,
        help="Path to Track A JSON file.",
    )
    parser.add_argument(
        "--image",
        required=False,
        help="Optional path to original image for Grad-CAM heatmaps.",
    )

    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.is_file():
        raise FileNotFoundError(f"Input Track A JSON file not found: {input_path}")

    with input_path.open("r", encoding="utf-8") as f:
        track_a_output_data: dict[str, Any] = json.load(f)

    result_dict = run_pipeline(
        track_a_output=track_a_output_data,
        image_path=args.image,
        save_outputs=True,
    )

    _print_summary_table(result_dict)

