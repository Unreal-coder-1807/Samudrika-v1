import type { ThreatLevel } from '../../types/detection.types'
import { threatColorMap } from '../../utils/threatColors'

export const ThreatBadge = ({ level }: { level: ThreatLevel }) => (
  <span
    className={`rounded px-2 py-1 text-xs font-semibold ui-label ${level === 'CRITICAL' ? 'threat-critical-pulse' : ''}`}
    style={{ background: `${threatColorMap[level]}22`, color: threatColorMap[level] }}
  >
    {level}
  </span>
)
