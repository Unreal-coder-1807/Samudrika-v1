import type { AnalyzeResponse, HealthResponse, ThreatResponse } from '../types/api.types'

export const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true'

export const getMockAnalyzeResponse = (): AnalyzeResponse => ({
  image_id: 'mock_frame_001.jpg',
  frame_threat_level: 'HIGH',
  scored_detections: [
    {
      class_name: 'submarine',
      confidence: 0.91,
      bbox: [120, 80, 340, 210],
      threat_level: 'HIGH',
      threat_score: 0.75,
      reason:
        'Submarine detected with 0.91 confidence. Similarity distance 0.52 to known submarine. Threat level assessed as HIGH.',
      similarity_match: {
        rank: 1,
        distance: 0.52,
        class: 'submarine',
        image_id: 'frame_003.jpg',
      },
    },
    {
      class_name: 'naval_mine',
      confidence: 0.78,
      bbox: [400, 150, 480, 230],
      threat_level: 'CRITICAL',
      threat_score: 1,
      reason:
        'Naval mine detected with 0.78 confidence. Classified CRITICAL by object type.',
      similarity_match: {
        rank: 1,
        distance: 0.31,
        class: 'naval_mine',
        image_id: 'frame_007.jpg',
      },
    },
    {
      class_name: 'diver',
      confidence: 0.65,
      bbox: [55, 200, 110, 320],
      threat_level: 'MEDIUM',
      threat_score: 0.5,
      reason: 'Diver detected with 0.65 confidence. Assessed as MEDIUM threat.',
      similarity_match: {
        rank: 1,
        distance: 1.1,
        class: 'diver',
        image_id: 'frame_012.jpg',
      },
    },
  ],
  heatmap_paths: [],
  processed_at: new Date().toISOString(),
})

export const getMockThreatResponse = (): ThreatResponse => ({
  threat_level: 'HIGH',
  threat_score: 0.75,
  reason:
    'submarine detected with 0.91 confidence. Similarity distance 0.45 to known submarine. Threat level assessed as HIGH.',
  similarity_match: {
    rank: 1,
    distance: 0.45,
    class: 'submarine',
    image_id: 'frame_003.jpg',
  },
})

export const getMockHealth = (): HealthResponse => ({
  status: 'ok',
  faiss_index_size: 42,
  rules_loaded: true,
  timestamp: new Date().toISOString(),
})
