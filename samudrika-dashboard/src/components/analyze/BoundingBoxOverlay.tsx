import type { ScoredDetection } from '../../types/detection.types'
import { threatColorMap } from '../../utils/threatColors'

export const BoundingBoxOverlay = ({
  detections,
}: {
  detections: ScoredDetection[]
}) => (
  <div className="relative h-56 rounded border border-[var(--border-subtle)] bg-slate-900/30">
    {detections.map((d, i) => (
      <div
        key={`${d.class_name}-${i}`}
        className="absolute border-2"
        style={{
          borderColor: threatColorMap[d.threat_level],
          left: `${(d.bbox[0] / 640) * 100}%`,
          top: `${(d.bbox[1] / 480) * 100}%`,
          width: `${((d.bbox[2] - d.bbox[0]) / 640) * 100}%`,
          height: `${((d.bbox[3] - d.bbox[1]) / 480) * 100}%`,
        }}
      />
    ))}
    {!detections.length && (
      <div className="flex h-full items-center justify-center text-sm text-[var(--text-muted)]">
        No detections overlay
      </div>
    )}
  </div>
)
