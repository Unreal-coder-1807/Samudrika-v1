import { useDashboardStore } from '../../store/useDashboardStore'
import { CardFrame } from '../common/CardFrame'
import { SonarLoader } from '../common/SonarLoader'
import { ThreatBadge } from '../common/ThreatBadge'
import { ConfidenceBar } from '../common/ConfidenceBar'

export const LiveFeedPanel = () => {
  const latest = useDashboardStore((s) => s.getLatestFrame())

  return (
    <CardFrame className="h-full">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SonarLoader />
          <h3 className="text-lg">LATEST DETECTION FRAME</h3>
        </div>
        {latest ? <ThreatBadge level={latest.frame_threat_level} /> : null}
      </div>
      <div className="mb-3 flex h-44 items-center justify-center rounded border border-dashed border-[var(--border-subtle)]">
        {latest ? latest.image_id : 'No frame yet'}
      </div>
      <div className="space-y-2">
        {(latest?.scored_detections ?? []).slice(0, 4).map((det, idx) => (
          <div key={`${det.class_name}-${idx}`} className="rounded border border-[var(--border-subtle)] p-2">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span>{det.class_name}</span>
              <ThreatBadge level={det.threat_level} />
            </div>
            <ConfidenceBar value={det.confidence} />
          </div>
        ))}
      </div>
    </CardFrame>
  )
}
