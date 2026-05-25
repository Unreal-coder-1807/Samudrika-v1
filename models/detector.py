import numpy as np
from typing import List, Dict, Any
from ultralytics import YOLO

class ObjectDetector:
    """
    Wrapper for the YOLOv11 object detection model.
    """
    def __init__(self, checkpoint_path: str = "models/best.pt"):
        self.checkpoint_path = checkpoint_path
        try:
            self.model = YOLO(self.checkpoint_path)
            print(f"ObjectDetector initialized successfully with weights: {self.checkpoint_path}")
        except Exception as e:
            print(f"Error loading YOLO model from {self.checkpoint_path}: {e}")
            self.model = None

    def detect(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """
        Performs object detection on the input image.
        """
        if self.model is None:
            print("YOLO model not loaded, returning mock detections.")
            return self._get_mock_detections()

        results = self.model(image)[0]
        detections = []

        for box in results.boxes:
            # Get class name from model names dictionary
            cls_id = int(box.cls[0])
            class_name = self.model.names[cls_id]

            # Bbox format: [x1, y1, x2, y2]
            coords = box.xyxy[0].tolist()

            detections.append({
                "class": class_name,
                "confidence": float(box.conf[0]),
                "bbox": coords
            })

        return detections

    def _get_mock_detections(self) -> List[Dict[str, Any]]:
        return [
            {
                "class": "submarine",
                "confidence": 0.92,
                "bbox": [100, 100, 400, 300]
            },
            {
                "class": "naval_mine",
                "confidence": 0.85,
                "bbox": [500, 200, 600, 300]
            }
        ]
