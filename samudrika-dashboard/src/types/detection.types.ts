export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'

export interface Detection {
  class: string
  confidence: number
  bbox: [number, number, number, number]
  embedding: number[]
}

export interface SimilarityMatch {
  rank: number
  distance: number
  class: string
  image_id: string
}

export interface ScoredDetection {
  class_name: string
  confidence: number
  bbox: [number, number, number, number]
  threat_level: ThreatLevel
  threat_score: number
  reason: string
  similarity_match: SimilarityMatch
}

export interface ScoredFrame {
  image_id: string
  frame_threat_level: ThreatLevel
  scored_detections: ScoredDetection[]
  heatmap_paths: string[]
  processed_at?: string
}
