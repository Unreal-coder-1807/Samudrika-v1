import cv2
import albumentations as A
import numpy as np
from pathlib import Path

# Underwater style augmentation pipeline
underwater_aug = A.Compose([
    
    # Blue/Green color shift
    A.RGBShift(
        r_shift_limit=(-20,0),
        g_shift_limit=(0,30),
        b_shift_limit=(10,40),
        p=0.7
    ),

    # Reduce contrast (light scattering underwater)
    A.RandomBrightnessContrast(
        brightness_limit=(-0.2,0.1),
        contrast_limit=(-0.3,-0.1),
        p=0.7
    ),

    # Blur (water turbidity)
    A.GaussianBlur(blur_limit=(3,7), p=0.5),

    # Add noise (particles)
    A.GaussNoise(var_limit=(10,50), p=0.5),

    # Fog-like effect
    A.RandomFog(fog_coef_lower=0.1, fog_coef_upper=0.3, p=0.4),

    # Slight distortion
    A.OpticalDistortion(distort_limit=0.2, shift_limit=0.05, p=0.3),

    A.ColorJitter(p=0.5),
    A.MotionBlur(blur_limit=7, p=0.4),
    A.RandomShadow(p=0.3)


])

input_train_dir = r"C:\Users\manwa\Desktop\Samudrika-v1\datasets\submarines\train_submarines"
output_dir = r"C:\Users\manwa\Desktop\Samudrika-v1\datasets\Augmented_submarines\augmented_train_submarines"

Path(output_dir).mkdir(exist_ok=True)

for img_path in Path(input_train_dir).glob("*"):
    
    img = cv2.imread(str(img_path))
    
    for i in range(5):  # create 5 augmented copies
        
        augmented = underwater_aug(image=img)
        aug_img = augmented["image"]
        
        save_path = f"{output_dir}/{img_path.stem}_aug{i}.jpg"
        cv2.imwrite(save_path, aug_img)
