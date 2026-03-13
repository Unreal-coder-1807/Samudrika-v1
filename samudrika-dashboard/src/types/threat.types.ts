import type { ThreatLevel } from './detection.types'

export type ThreatSummary = Record<ThreatLevel, number>

export const THREAT_PRIORITY: ThreatLevel[] = [
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'LOW',
  'NONE',
]
