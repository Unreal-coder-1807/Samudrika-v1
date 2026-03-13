import type { ScoredDetection } from '../../types/detection.types'
import { ConfidenceBar } from '../common/ConfidenceBar'
import { ThreatBadge } from '../common/ThreatBadge'

export const DetectionRow = ({
  det,
  idx,
  onViewHeatmap,
}: {
  det: ScoredDetection
  idx: number
  onViewHeatmap?: () => void
}) => (
  <tr className="border-b border-[var(--border-subtle)] text-xs">
    <td>{idx + 1}</td>
    <td>{det.class_name}</td>
    <td className="w-40">
      <ConfidenceBar value={det.confidence} />
    </td>
    <td>{det.bbox.join(', ')}</td>
    <td>
      <ThreatBadge level={det.threat_level} />
    </td>
    <td>{det.threat_score.toFixed(2)}</td>
    <td className="max-w-[320px] truncate" title={det.reason}>
      {det.reason}
    </td>
    <td>
      {onViewHeatmap ? (
        <button className="rounded border px-2 py-1" onClick={onViewHeatmap}>
          VIEW HEATMAP
        </button>
      ) : (
        '-'
      )}
    </td>
  </tr>
)
