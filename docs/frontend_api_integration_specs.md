# Specifications Document: Samudrika Core Frontend API Integration

## 1. Project Overview
**Project:** Samudrika Core — Frontend API Integration  
**Objective:** Develop a React-based operator dashboard that integrates with the FastAPI backend to provide an end-to-end workflow for underwater maritime security monitoring. The system will allow users to upload images, trigger the AI pipeline, and visualize the results, including image enhancement, object detection, threat assessment, and explainability (Grad-CAM).

## 2. Technical Stack
- **Frontend:** React (Functional Components, Hooks)
- **State Management:** Zustand (per existing `package.json`) or React Context/State
- **HTTP Client:** Axios
- **Styling:** Tailwind CSS (per existing `package.json`)
- **Backend:** FastAPI (Python)
- **Communication:** REST API via JSON and `multipart/form-data`

## 3. API Specification

### 3.1 Endpoint: `/analyze`
- **Method:** `POST`
- **URL:** `http://localhost:8000/analyze`
- **Content-Type:** `multipart/form-data`
- **Request Parameters:**
  - `file`: The image file to be analyzed (Binary).

- **Response Body (JSON):**
  ```json
  {
    "enhanced_image": "base64_string",
    "detections": [
      {
        "class": "submarine",
        "confidence": 0.91,
        "bbox": [x1, y1, x2, y2]
      }
    ],
    "heatmap": "base64_string",
    "threat_level": "HIGH"
  }
  ```

## 4. Frontend Requirements

### 4.1 Core Functionalities
- **Image Upload:** Ability to select and upload an image file from the local system.
- **Analysis Trigger:** A button to initiate the backend `/analyze` request.
- **Loading State:** Visual feedback (spinner/skeleton) while the backend is processing.
- **Result Visualization:**
  - **Threat Level:** Highly visible indicator of the threat level (color-coded).
  - **Image Gallery:** Display of the Original Image, Enhanced Image, and Grad-CAM Heatmap.
  - **Detection List:** A list of detected objects with their class names and confidence scores.

### 4.2 Component Architecture
- **`ApiService.js`**: A singleton or module handling all Axios requests.
- **`Analyzer.jsx`**: The main orchestrator component for the upload and result flow.
- **`ImageDisplay.jsx`**: A reusable component for rendering base64 images.
- **`DetectionList.jsx`**: A component to render the list of detected threats.
- **`ThreatIndicator.jsx`**: A component to display the threat level with dynamic styling.

## 5. UI/UX Design

### 5.1 Layout Structure
The dashboard should be organized in a logical flow:
1. **Upload Section:** Top area with a file input and "Analyze" button.
2. **Summary Section:** Prominent display of the `threat_level`.
3. **Visual Analysis Grid:**
   - `Original Image` | `Enhanced Image` | `Heatmap Image`
4. **Detailed Results:** A table or list showing all `detections`.

### 5.2 Visual Cues (Threat Levels)
| Level | Color | Meaning |
| :--- | :--- | :--- |
| LOW | Green | Low security risk |
| MEDIUM | Yellow | Potential risk, requires monitoring |
| HIGH | Red | Significant security threat |
| CRITICAL | Dark Red / Purple | Immediate danger/action required |

## 6. Implementation Plan

### Phase 1: API Layer
- [ ] Implement `src/api/api.js` using Axios.
- [ ] Configure `API_BASE_URL` as an environment variable.
- [ ] Create the `analyzeImage(file)` function.

### Phase 2: Core Component Development
- [ ] Build the file upload logic.
- [ ] Implement the `analyzeImage` trigger and handle loading states.
- [ ] Create base64 image rendering logic.

### Phase 3: UI Integration
- [ ] Implement the Threat Level indicator.
- [ ] Build the detection list display.
- [ ] Create the side-by-side image comparison view.

### Phase 4: Error Handling & Refinement
- [ ] Add try-catch blocks for API failures.
- [ ] Implement user-friendly error messages (e.g., "Server unavailable", "Invalid image format").
- [ ] Disable the analyze button during request processing.

## 7. Success Criteria
- [ ] Users can successfully upload an image.
- [ ] The frontend correctly sends a `multipart/form-data` request to the backend.
- [ ] The frontend renders the `enhanced_image` and `heatmap` from base64 strings.
- [ ] The `threat_level` is displayed with the correct associated color.
- [ ] The list of detections is correctly populated from the API response.
- [ ] The UI remains responsive and handles loading/error states gracefully.
