import type { Detection, ScoredFrame, ScoredDetection } from './detection.types'

export interface FrameInput {
  image_id: string
  detections: Detection[]
}

export interface AnalyzeResponse extends ScoredFrame {}

export interface SingleDetectionInput {
  detection: Detection
}

export interface ThreatResponse
  extends Pick<
    ScoredDetection,
    'threat_level' | 'threat_score' | 'reason' | 'similarity_match'
  > {}

export interface HealthResponse {
  status: string
  faiss_index_size: number
  rules_loaded: boolean
  timestamp: string
}
