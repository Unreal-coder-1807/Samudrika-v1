import base64
import cv2
import numpy as np
from typing import Union
from PIL import Image
import io

def image_to_base64(image: Union[np.ndarray, Image.Image]) -> str:
    """
    Converts an image to a base64-encoded JPEG string.

    Args:
        image: The image to convert. Can be a NumPy array (BGR) or a PIL Image.

    Returns:
        A base64-encoded string of the JPEG image.
    """
    if isinstance(image, np.ndarray):
        # Convert BGR to RGB if it's a numpy array
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(image_rgb)
    elif isinstance(image, Image.Image):
        pil_img = image
    else:
        raise TypeError("Image must be a numpy array or a PIL Image")

    buffered = io.BytesIO()
    pil_img.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return img_str
