# Underwater Maritime Security AI Pipeline

## Overview

This project implements a **computer vision pipeline for underwater maritime security monitoring**. The system enhances underwater imagery, detects potential security-related objects, evaluates threat levels, and explains model decisions using explainable AI techniques.

The pipeline is designed as a **research prototype** to simulate AI-assisted underwater surveillance.

The system processes **images or extracted video frames**, improving visibility before performing object detection and threat analysis.

---

# System Architecture

Pipeline Overview:

```
Input Image / Extracted Video Frame
            ↓
Underwater Image Enhancement
            ↓
Object Detection
            ↓
Vector Embedding Generation
            ↓
Vector Similarity Search
            ↓
Threat Evaluation Engine
            ↓
Explainability Layer
            ↓
Operator Dashboard
```

---

# Core Modules

## 1. Data Ingestion

The pipeline accepts:

* Underwater image datasets
* Frames extracted from underwater videos
* Synthetic underwater scenes

Video support is implemented through **frame extraction** rather than direct video model training.

---

# 2. Image Enhancement

Underwater images typically suffer from:

* low visibility
* color distortion
* light scattering
* turbidity

The enhancement module improves image quality before object detection.

Model Used:

FUnIE-GAN

Framework:

PyTorch

Workflow:

```
Raw Image → Enhancement Model → Enhanced Image
```

---

# 3. Object Detection

Object detection identifies potential maritime security threats.

Model Used:

YOLOv8

Detected object categories may include:

* submarines
* underwater drones
* ROVs
* naval mines
* torpedo-like structures
* divers
* underwater equipment

Outputs:

* bounding boxes
* object class
* confidence score

---

# 4. Feature Embedding

Detected objects are cropped and converted into **feature embeddings**.

Purpose:

* enable similarity comparison
* allow object identity matching
* reduce repeated processing

Feature extractor:

ResNet50

Workflow:

```
Detected Object Crop → Embedding Model → Feature Vector
```

---

# 5. Vector Similarity Search

Object embeddings are stored in a **vector index**.

Vector search enables:

* similarity matching
* identity comparison
* faster retrieval

Vector database used:

FAISS

---

# 6. Threat Evaluation Engine

Detections are converted into **risk assessments**.

Example threat logic:

```
Submarine → HIGH threat
Naval mine → CRITICAL threat
Diver → MEDIUM threat
ROV → LOW threat
```

Threat scoring considers:

* object type
* detection confidence
* similarity matches

---

# 7. Explainability Layer

Explainable AI improves operator trust by showing **why the model made a decision**.

Technique:

Grad-CAM

Output:

Heatmaps highlighting regions responsible for the detection.

Example:

```
Detected Object: Submarine
Explanation: Heatmap highlighting hull region
```

---

# 8. Operator Dashboard

The monitoring dashboard displays results to operators.

Features:

* processed image display
* detected object bounding boxes
* threat level indicator
* explanation heatmaps
* system alerts

Backend:

FastAPI

Frontend:

React

Visualization:

Plotly

---

# Technology Stack

| Component               | Technology |
| ----------------------- | ---------- |
| Programming Language    | Python     |
| Deep Learning Framework | PyTorch    |
| Image Enhancement       | FUnIE-GAN  |
| Object Detection        | YOLOv8     |
| Feature Embedding       | ResNet50   |
| Vector Search           | FAISS      |
| Explainability          | Grad-CAM   |
| Backend API             | FastAPI    |
| Frontend                | React      |
| Visualization           | Plotly     |

---

# Repository Structure

```
underwater-security-ai/

│
├── README.md
├── requirements.txt
│
├── configs/
│   ├── model_config.yaml
│   └── threat_rules.yaml
│
├── datasets/
│   ├── raw/
│   ├── processed/
│   └── extracted_frames/
│
├── models/
│   ├── enhancement/
│   │   └── funie_gan.py
│   │
│   ├── detection/
│   │   └── yolo_detector.py
│   │
│   ├── embeddings/
│   │   └── resnet_embedder.py
│
├── vector_store/
│   └── faiss_index.py
│
├── explainability/
│   └── gradcam.py
│
├── threat_engine/
│   └── threat_scoring.py
│
├── pipelines/
│   └── inference_pipeline.py
│
├── utils/
│   ├── frame_extractor.py
│   ├── image_loader.py
│   └── visualization.py
│
├── api/
│   └── server.py
│
└── dashboard/
    └── frontend/
```

---

# Development Workflow

## 1. Environment Setup

Clone repository

```
git clone https://github.com/Unreal-coder-1807
cd Samudrika-core
```

Create virtual environment

```
python -m venv venv
source venv/bin/activate
```

Install dependencies

```
pip install -r requirements.txt
```

---

# 2. Dataset Preparation

Download underwater datasets.

Place them in:

```
datasets/raw/
```

Optional:

Extract frames from videos:

```
python utils/frame_extractor.py
```

Frames will be saved in:

```
datasets/extracted_frames/
```

---

# 3. Run Enhancement Module

```
python models/enhancement/funie_gan.py
```

Enhanced images will be saved to:

```
datasets/processed/
```

---

# 4. Run Object Detection

```
python models/detection/yolo_detector.py
```

Outputs include bounding boxes and predictions.

---

# 5. Generate Embeddings

```
python models/embeddings/resnet_embedder.py
```

Embeddings are stored in the FAISS vector index.

---

# 6. Run Full Inference Pipeline

```
python pipelines/inference_pipeline.py
```

Pipeline executes:

1. enhancement
2. detection
3. embedding generation
4. vector similarity search
5. threat scoring
6. explainability

---

# 7. Start API Server

```
python api/server.py
```

---

# Future Extensions

Potential improvements include:

Real-Time Monitoring

* live underwater camera feeds
* edge-device inference

Sensor Fusion

* sonar data
* acoustic sensors
* radar inputs

Advanced Analytics

* vessel identity recognition
* trajectory prediction
* anomaly detection

---

# Disclaimer

This project is intended for **academic and research purposes only**.
It simulates underwater surveillance workflows and does not represent operational defense systems.
