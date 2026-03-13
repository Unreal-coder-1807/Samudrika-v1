from __future__ import annotations

from pathlib import Path
from typing import Any

import cv2
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
import yaml


class ProxyCNN(nn.Module):
    """
    Lightweight proxy convolutional neural network used as a Grad-CAM target.

    The architecture is:
        - Conv2d(3, 32, 3, padding=1) → ReLU → MaxPool2d(2)
        - Conv2d(32, 64, 3, padding=1) → ReLU → MaxPool2d(2)
        - Conv2d(64, 128, 3, padding=1) → ReLU  (Grad-CAM hooks attached here)
        - AdaptiveAvgPool2d(1)
        - Flatten
        - Linear(128, num_classes)
    """

    def __init__(self, num_classes: int = 8) -> None:
        """
        Initializes the ProxyCNN model.

        Args:
            num_classes: Number of output classes for the final linear layer.
        """
        super().__init__()
        self.conv1 = nn.Conv2d(3, 32, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        self.pool = nn.MaxPool2d(kernel_size=2)
        self.avg_pool = nn.AdaptiveAvgPool2d((1, 1))
        self.classifier = nn.Linear(128, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass through the proxy CNN.

        Args:
            x: Input tensor of shape (N, 3, H, W).

        Returns:
            torch.Tensor: Logits tensor of shape (N, num_classes).
        """
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = F.relu(self.conv3(x))
        x = self.avg_pool(x)
        x = torch.flatten(x, 1)
        x = self.classifier(x)
        return x


def get_gradcam_heatmap(
    model: ProxyCNN,
    image_tensor: torch.Tensor,
    target_class_idx: int,
) -> np.ndarray:
    """
    Computes a Grad-CAM heatmap for the given image tensor and target class.

    The function registers forward and backward hooks on the last convolutional
    layer of the provided ProxyCNN model, performs a forward pass, computes
    gradients with respect to the target class index, and returns a normalized
    heatmap as a NumPy array with values in the range [0.0, 1.0].

    Args:
        model: ProxyCNN model instance used for Grad-CAM.
        image_tensor: Input image tensor of shape (1, 3, H, W), normalized.
        target_class_idx: Index of the target class for which Grad-CAM is
            computed.

    Returns:
        np.ndarray: Heatmap array of shape (H, W) with values in [0.0, 1.0].
    """
    model.eval()

    activations: list[torch.Tensor] = []
    gradients: list[torch.Tensor] = []

    def forward_hook(
        _module: nn.Module,
        _input: tuple[torch.Tensor, ...],
        output: torch.Tensor,
    ) -> None:
        activations.append(output.detach())

    def backward_hook(
        _module: nn.Module,
        grad_input: tuple[torch.Tensor, ...],
        grad_output: tuple[torch.Tensor, ...],
    ) -> None:
        # grad_output[0] corresponds to the gradient w.r.t. the conv output.
        gradients.append(grad_output[0].detach())

    handle_fwd = model.conv3.register_forward_hook(forward_hook)
    handle_bwd = model.conv3.register_full_backward_hook(backward_hook)  # type: ignore[attr-defined]

    try:
        model.zero_grad(set_to_none=True)
        logits = model(image_tensor)

        if target_class_idx < 0 or target_class_idx >= logits.shape[1]:
            raise ValueError("target_class_idx is out of bounds for model outputs.")

        target_score = logits[:, target_class_idx]
        target_score.backward()

        if not activations or not gradients:
            raise RuntimeError("Failed to capture activations or gradients for Grad-CAM.")

        act = activations[0]  # (N, C, H, W)
        grad = gradients[0]   # (N, C, H, W)

        # Use the first (and only) sample in the batch.
        act = act[0]
        grad = grad[0]

        # Global average pooling over spatial dimensions to obtain weights.
        weights = grad.mean(dim=(1, 2))  # (C,)

        # Weighted combination of forward activation maps.
        cam = torch.zeros_like(act[0])
        for c, w in enumerate(weights):
            cam += w * act[c]

        cam = F.relu(cam)
        cam_np = cam.cpu().numpy()

        # Normalize to [0, 1].
        if cam_np.max() > 0:
            cam_np = (cam_np - cam_np.min()) / (cam_np.max() - cam_np.min())
        else:
            cam_np = np.zeros_like(cam_np)

        return cam_np.astype("float32")
    finally:
        handle_fwd.remove()
        handle_bwd.remove()


def overlay_heatmap(
    original_crop: np.ndarray,
    heatmap: np.ndarray,
    alpha: float = 0.4,
) -> np.ndarray:
    """
    Overlays a Grad-CAM heatmap on top of an image crop.

    The heatmap is resized to match the crop size, converted to a BGR color
    representation using the JET color map, and blended with the original crop
    using the specified alpha value.

    Args:
        original_crop: Original image crop as a BGR NumPy array (H, W, 3).
        heatmap: Grad-CAM heatmap array of shape (h, w) with values in [0, 1].
        alpha: Blend factor for the heatmap; higher values emphasize the
            heatmap more strongly.

    Returns:
        np.ndarray: BGR image array representing the overlay.
    """
    if original_crop.ndim != 3 or original_crop.shape[2] != 3:
        raise ValueError("original_crop must be a BGR image array of shape (H, W, 3).")

    h, w = original_crop.shape[:2]

    # Ensure heatmap is in [0, 1].
    heatmap_norm = np.clip(heatmap, 0.0, 1.0)
    heatmap_resized = cv2.resize(heatmap_norm, (w, h))
    heatmap_uint8 = np.uint8(255 * heatmap_resized)

    heatmap_color = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)

    overlay = cv2.addWeighted(heatmap_color, alpha, original_crop, 1 - alpha, 0)
    return overlay


def _preprocess_crop(crop_bgr: np.ndarray) -> torch.Tensor:
    """
    Preprocesses a BGR crop for ProxyCNN input.

    Steps:
        - Convert BGR to RGB.
        - Resize to 224x224.
        - Convert to float32 and scale to [0, 1].
        - Normalize using ImageNet-like statistics.
        - Rearrange to (1, 3, H, W).

    Args:
        crop_bgr: Image crop as a BGR NumPy array.

    Returns:
        torch.Tensor: Preprocessed tensor of shape (1, 3, 224, 224).
    """
    crop_rgb = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2RGB)
    crop_resized = cv2.resize(crop_rgb, (224, 224))

    tensor = crop_resized.astype("float32") / 255.0
    mean = np.array([0.485, 0.456, 0.406], dtype="float32")
    std = np.array([0.229, 0.224, 0.225], dtype="float32")
    tensor = (tensor - mean) / std

    tensor = np.transpose(tensor, (2, 0, 1))  # (3, H, W)
    return torch.from_numpy(tensor).unsqueeze(0)


def generate_gradcam(
    image_path: str,
    bbox: list[int],
    predicted_class_idx: int,
    model: ProxyCNN,
    save_path: str,
) -> np.ndarray:
    """
    Generates a Grad-CAM overlay for a single detection region.

    The function:
        - Loads the image from disk.
        - Crops it according to the provided bounding box.
        - Preprocesses the crop.
        - Computes the Grad-CAM heatmap.
        - Overlays the heatmap on the original crop.
        - Saves the overlay to disk as a PNG.

    Args:
        image_path: Path to the original image file.
        bbox: Bounding box [x1, y1, x2, y2] defining the region of interest.
        predicted_class_idx: Index of the predicted class for Grad-CAM.
        model: ProxyCNN model instance used for Grad-CAM.
        save_path: Path where the resulting overlay image will be saved.

    Returns:
        np.ndarray: BGR NumPy array representing the Grad-CAM overlay.
    """
    image = cv2.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"Could not read image from path: {image_path}")

    x1, y1, x2, y2 = bbox
    h, w = image.shape[:2]
    x1 = max(0, min(w - 1, x1))
    y1 = max(0, min(h - 1, y1))
    x2 = max(x1 + 1, min(w, x2))
    y2 = max(y1 + 1, min(h, y2))

    crop_bgr = image[y1:y2, x1:x2]
    if crop_bgr.size == 0:
        raise ValueError("Computed crop is empty; check bbox coordinates.")

    input_tensor = _preprocess_crop(crop_bgr)

    # Move tensor and model to the same device.
    device = next(model.parameters()).device
    input_tensor = input_tensor.to(device)

    heatmap = get_gradcam_heatmap(model, input_tensor, predicted_class_idx)
    overlay = overlay_heatmap(crop_bgr, heatmap)

    save_path_obj = Path(save_path)
    save_path_obj.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(save_path_obj), overlay)

    return overlay


def _load_class_index_map(
    config_path: str = "configs/threat_rules.yaml",
) -> dict[str, int]:
    """
    Loads the class-to-index mapping from the global threat rules configuration.

    This keeps the class index ordering consistent across the system.

    Args:
        config_path: Path to the threat rules YAML file.

    Returns:
        dict[str, int]: Mapping from class name to integer index.
    """
    with open(config_path, "r", encoding="utf-8") as f:
        config: dict[str, Any] = yaml.safe_load(f) or {}
    return config.get("class_index_map", {}) or {}


def batch_generate_heatmaps(
    image_path: str,
    scored_detections: list[dict[str, Any]],
    model: ProxyCNN,
    output_dir: str = "outputs/heatmaps/",
) -> list[str]:
    """
    Generates Grad-CAM heatmaps for a batch of scored detections.

    For each detection in scored_detections, this function:
        - Derives the class index from the global class_index_map.
        - Calls generate_gradcam() to create an overlay heatmap.
        - Saves the overlay image to the specified output directory.

    The save path format is:
        outputs/heatmaps/{image_id}_{class}_{idx}.png

    Args:
        image_path: Path to the original image used for all detections.
        scored_detections: List of detection dictionaries (output of score_frame).
        model: ProxyCNN model instance used for Grad-CAM.
        output_dir: Base directory where heatmap images will be saved.

    Returns:
        list[str]: List of file paths to the saved heatmap images.
    """
    output_paths: list[str] = []
    output_base = Path(output_dir)
    output_base.mkdir(parents=True, exist_ok=True)

    image_id = Path(image_path).stem
    class_index_map = _load_class_index_map()

    for idx, det in enumerate(scored_detections):
        det_class = str(det.get("class", "unknown"))
        bbox = det.get("bbox")
        if bbox is None:
            continue

        if det_class not in class_index_map:
            continue
        predicted_class_idx = class_index_map[det_class]

        filename = f"{image_id}_{det_class}_{idx}.png"
        save_path = str(output_base / filename)

        generate_gradcam(
            image_path=image_path,
            bbox=bbox,
            predicted_class_idx=predicted_class_idx,
            model=model,
            save_path=save_path,
        )
        output_paths.append(save_path)

    return output_paths


if __name__ == "__main__":
    # Basic self-test: generate a Grad-CAM heatmap for a random test image.
    import os

    # Create a random 224x224 RGB image and save it temporarily.
    rng = np.random.default_rng(seed=0)
    random_image = (rng.random((224, 224, 3)) * 255).astype("uint8")
    test_image_path = "outputs/heatmaps/test_input_image.png"
    Path(test_image_path).parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(test_image_path, random_image)

    # Initialize ProxyCNN and run Grad-CAM over the full image.
    proxy_model = ProxyCNN(num_classes=8)
    full_bbox = [0, 0, 224, 224]
    test_heatmap_path = "outputs/heatmaps/test_heatmap.png"

    # Use class index 0 arbitrarily for this smoke test.
    generate_gradcam(
        image_path=test_image_path,
        bbox=full_bbox,
        predicted_class_idx=0,
        model=proxy_model,
        save_path=test_heatmap_path,
    )

    print("Heatmap saved successfully to", os.path.abspath(test_heatmap_path))

