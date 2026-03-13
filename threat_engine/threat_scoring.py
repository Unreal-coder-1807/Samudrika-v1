from __future__ import annotations

from typing import Any

import faiss  # type: ignore
import yaml

from vector_store.faiss_index import load_index, search_embedding


def load_threat_rules(config_path: str = "configs/threat_rules.yaml") -> dict[str, Any]:
    """
    Loads and returns the threat rules YAML as a Python dict.

    Args:
        config_path: Relative path to the YAML configuration file.

    Returns:
        dict[str, Any]: Parsed YAML configuration as a dictionary.
    """
    with open(config_path, "r", encoding="utf-8") as f:
        data: dict[str, Any] = yaml.safe_load(f) or {}
    return data


def _parse_condition(condition: str) -> tuple[str, str, float]:
    """
    Parses a simple condition string of the form 'var < value'.

    Args:
        condition: Condition string from the YAML configuration.

    Returns:
        Tuple[str, str, float]: Variable name, operator, and numeric threshold.

    Raises:
        ValueError: If the condition string is not in the expected format.
    """
    parts = condition.strip().split()
    if len(parts) != 3:
        raise ValueError(f"Unsupported condition format: {condition!r}")
    var, op, value_str = parts
    try:
        value = float(value_str)
    except ValueError as exc:
        raise ValueError(f"Condition value is not a float: {condition!r}") from exc
    return var, op, value


def _apply_overrides(
    base_level: str,
    detection: dict[str, Any],
    similarity_results: list[dict[str, Any]],
    rules: dict[str, Any],
) -> str:
    """
    Applies override rules based on detection confidence and similarity distance.

    The override behavior is fully driven by the YAML rules:
    - For conditions on 'confidence', the detection confidence is evaluated.
    - For conditions on 'similarity_distance', the top-1 similarity distance
      from similarity_results is evaluated.

    Args:
        base_level: Initial threat level derived from the detection class.
        detection: Detection dictionary from Track A output.
        similarity_results: Nearest-neighbor search results.
        rules: Parsed threat rules configuration.

    Returns:
        str: Final threat level after applying all applicable overrides.
    """
    current_level = base_level
    overrides = rules.get("override_rules", []) or []

    # Obtain top-1 similarity distance if available.
    top_similarity = similarity_results[0] if similarity_results else None
    similarity_distance = float(top_similarity["distance"]) if top_similarity else None

    for rule in overrides:
        condition_str = rule.get("condition")
        override_level = rule.get("override_level")
        if not condition_str or not override_level:
            continue

        try:
            variable, operator, threshold = _parse_condition(condition_str)
        except ValueError:
            # Skip malformed conditions rather than failing hard.
            continue

        if variable == "confidence":
            value = float(detection.get("confidence", 0.0))
        elif variable == "similarity_distance":
            if similarity_distance is None:
                continue
            value = similarity_distance
        else:
            # Unsupported variable; ignore the rule.
            continue

        if operator == "<" and value < threshold:
            current_level = str(override_level)

    return current_level


def score_detection(
    detection: dict[str, Any],
    similarity_results: list[dict[str, Any]],
    rules: dict[str, Any],
) -> dict[str, Any]:
    """
    Scores a single detection dict from Track A output.

    The detection format is expected to be:
        {
            "class": "submarine",
            "confidence": 0.91,
            "bbox": [x1, y1, x2, y2],
            "embedding": [float, ...]
        }

    The similarity_results are obtained from faiss_index.search_embedding()
    and contain nearest-neighbor matches for the detection embedding.

    The scoring logic is:
        Step 1 — Base threat level:
            - Determined from rules["threat_levels"][...]["classes"].
            - If the detection class is not present in any level, the
              "UNKNOWN" configuration is used and its "default_level"
              is applied.

        Step 2 — Confidence override:
            - Driven entirely by rules["override_rules"] entries whose
              conditions refer to "confidence".

        Step 3 — Similarity override:
            - Driven entirely by rules["override_rules"] entries whose
              conditions refer to "similarity_distance" and the top-1
              similarity result distance.

        Step 4 — Compute threat_score (float 0.0–1.0):
            CRITICAL → 1.0
            HIGH     → 0.75
            MEDIUM   → 0.5
            LOW      → 0.25
            NONE     → 0.0

        Step 5 — Build a human-readable reason string.

    Args:
        detection: Single detection dictionary from Track A output.
        similarity_results: Output from faiss_index.search_embedding() (top_k results).
        rules: Parsed threat rules configuration dictionary.

    Returns:
        dict[str, Any]: Structured threat assessment with keys:
            {
                "class": str,
                "confidence": float,
                "bbox": list,
                "threat_level": str,
                "threat_score": float,
                "similarity_match": dict | None,
                "reason": str
            }
    """
    det_class = str(detection.get("class", "unknown"))
    confidence = float(detection.get("confidence", 0.0))
    bbox = detection.get("bbox", [])

    threat_levels = rules.get("threat_levels", {}) or {}

    # Step 1 — Base threat level from class membership.
    base_level: str | None = None
    for level_name, info in threat_levels.items():
        classes = info.get("classes", []) or []
        if det_class in classes:
            base_level = level_name
            break

    if base_level is None:
        unknown_cfg = threat_levels.get("UNKNOWN", {}) or {}
        base_level = str(unknown_cfg.get("default_level", "HIGH"))

    # Apply override rules (confidence and similarity-based).
    final_level = _apply_overrides(base_level, detection, similarity_results, rules)

    # Threat score mapping.
    threat_score_map: dict[str, float] = {
        "CRITICAL": 1.0,
        "HIGH": 0.75,
        "MEDIUM": 0.5,
        "LOW": 0.25,
        "NONE": 0.0,
    }
    threat_score = threat_score_map.get(final_level, 0.0)

    # Similarity match (top-1 if available).
    similarity_match = similarity_results[0] if similarity_results else None

    # Step 5 — Human-readable reason string.
    reason_parts: list[str] = []
    reason_parts.append(
        f"{det_class} detected with {confidence:.2f} confidence."
    )
    if similarity_match is not None:
        distance = float(similarity_match.get("distance", 0.0))
        match_class = similarity_match.get("class", "unknown")
        reason_parts.append(
            f"Similarity distance {distance:.2f} to known {match_class}."
        )

    reason_parts.append(f"Threat evaluated as {final_level}.")
    reason = " ".join(reason_parts)

    return {
        "class": det_class,
        "confidence": confidence,
        "bbox": bbox,
        "threat_level": final_level,
        "threat_score": threat_score,
        "similarity_match": similarity_match,
        "reason": reason,
    }


def score_frame(
    track_a_output: dict[str, Any],
    index: faiss.IndexFlatL2,
    metadata_store: list[dict[str, Any]],
    rules: dict[str, Any],
) -> dict[str, Any]:
    """
    Scores all detections in one Track A output JSON.

    The expected Track A output format is:
        {
            "image_id": "frame_001.jpg",
            "detections": [...]
        }

    For each detection in "detections":
        1. Calls search_embedding() from vector_store.faiss_index.
        2. Calls score_detection() to compute threat assessment.

    The frame_threat_level is the highest threat level across all scored
    detections, with this priority order:
        CRITICAL > HIGH > MEDIUM > LOW > NONE

    If the detections list is empty, frame_threat_level is set to "NONE"
    and scored_detections is an empty list.

    Args:
        track_a_output: Single-frame output JSON from Track A.
        index: FAISS index instance.
        metadata_store: Metadata list aligned with vectors in the index.
        rules: Parsed threat rules configuration dictionary.

    Returns:
        dict[str, Any]: Frame-level threat assessment in the form:
            {
                "image_id": str,
                "frame_threat_level": str,
                "scored_detections": list[dict[str, Any]]
            }
    """
    image_id = str(track_a_output.get("image_id", ""))
    detections = track_a_output.get("detections", []) or []

    if not detections:
        return {
            "image_id": image_id,
            "frame_threat_level": "NONE",
            "scored_detections": [],
        }

    threat_priority: dict[str, int] = {
        "NONE": 0,
        "LOW": 1,
        "MEDIUM": 2,
        "HIGH": 3,
        "CRITICAL": 4,
    }

    scored_detections: list[dict[str, Any]] = []
    highest_level = "NONE"

    for det in detections:
        embedding = det.get("embedding", [])
        similarity_results = search_embedding(
            index=index,
            query_embedding=embedding,
            metadata_store=metadata_store,
        )
        scored = score_detection(det, similarity_results, rules)
        scored_detections.append(scored)

        level = scored.get("threat_level", "NONE")
        if threat_priority.get(level, 0) > threat_priority.get(highest_level, 0):
            highest_level = level

    return {
        "image_id": image_id,
        "frame_threat_level": highest_level,
        "scored_detections": scored_detections,
    }


if __name__ == "__main__":
    # Quick self-test of scoring logic using mock detection and similarity.
    rules_dict = load_threat_rules()

    mock_detection = {
        "class": "submarine",
        "confidence": 0.85,
        "bbox": [10, 20, 100, 200],
        "embedding": [0.0] * 512,
    }

    mock_similarity_results = [
        {"rank": 1, "distance": 0.6, "class": "submarine", "image_id": "ref_001.jpg"}
    ]

    scored = score_detection(
        detection=mock_detection,
        similarity_results=mock_similarity_results,
        rules=rules_dict,
    )
    print("Mock scored detection:", scored)

