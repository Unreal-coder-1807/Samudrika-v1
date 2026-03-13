import type { ThreatLevel } from '../types/detection.types'

export const threatColorMap: Record<ThreatLevel, string> = {
  CRITICAL: 'var(--threat-critical)',
  HIGH: 'var(--threat-high)',
  MEDIUM: 'var(--threat-medium)',
  LOW: 'var(--threat-low)',
  NONE: 'var(--threat-none)',
}
