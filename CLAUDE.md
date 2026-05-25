# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Backend (Python)
- **Install dependencies**: `pip install -r requirements.txt`
- **Run inference pipeline**: `python pipelines/inference_pipeline.py --input <path_to_track_a_json> [--image <path_to_image>]`
- **Start API server**: `python api/server.py`

### Frontend (React)
- **Install dependencies**: `cd samudrika-dashboard && npm install`
- **Development mode**: `cd samudrika-dashboard && npm run dev`
- **Build for production**: `cd samudrika-dashboard && npm run build`
- **Linting**: `cd samudrika-dashboard && npm run lint`

## Architecture Overview

The repository implements **Track B** of the Underwater Maritime Security AI Pipeline, which processes detections from "Track A" to assess threats and provide explainability.

### High-Level Data Flow
`Track A JSON Output` $\to$ `FAISS Vector Search` $\to$ `Threat Scoring Engine` $\to$ `Grad-CAM Heatmap Generation` $\to$ `Enriched Result JSON / API Response`

### Core Components
- **`pipelines/`**: Orchestrates the full sequence from loading data to saving results.
- **`threat_engine/`**: Contains logic for mapping detections to threat levels based on rules in `configs/threat_rules.yaml`.
- **`vector_store/`**: Manages FAISS index for embedding-based similarity search of detected objects.
- **`explainability/`**: Implements Grad-CAM using a proxy model to visualize why a specific threat was detected.
- **`api/`**: FastAPI server providing endpoints for real-time analysis (`/analyze`), single-detection assessment (`/threat`), and system health (`/health`).
- **`samudrika-dashboard/`**: React-based operator dashboard for visualizing processed imagery, threat levels, and heatmaps.

### Key Files
- `pipelines/inference_pipeline.py`: Main entry point for batch processing.
- `api/server.py`: API server implementation.
- `threat_engine/threat_scoring.py`: Core threat evaluation logic.
- `vector_store/faiss_index.py`: Vector index management.
- `explainability/gradcam.py`: Heatmap generation logic.
