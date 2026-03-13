import { useMemo } from 'react'
import { useDashboardStore } from '../../store/useDashboardStore'
import { CardFrame } from '../common/CardFrame'
import { PulsingDot } from '../common/PulsingDot'
import { ThreatBadge } from '../common/ThreatBadge'

export const ActiveAlertsPanel = () => {
  const frames = useDashboardStore((s) => s.frames)

  const alerts = useMemo(
    () =>
      frames.flatMap((frame) =>
        frame.scored_detections
          .filter((d) => d.threat_level === 'CRITICAL' || d.threat_level === 'HIGH')
          .map((d) => ({ ...d, image_id: frame.image_id })),
      ),
    [frames],
  )

  return (
    <CardFrame className="h-full">
      <h3 className="mb-2 text-lg">ACTIVE ALERTS</h3>
      {!alerts.length ? (
        <div className="text-sm text-emerald-400">NO ACTIVE ALERTS</div>
      ) : (
        <div className="max-h-72 space-y-2 overflow-auto">
          {alerts.slice(0, 8).map((a, idx) => (
            <div key={`${a.image_id}-${idx}`} className="rounded border border-[var(--border-subtle)] p-2">
              <div className="mb-1 flex items-center gap-2">
                <PulsingDot
                  color={a.threat_level === 'CRITICAL' ? 'var(--threat-critical)' : 'var(--threat-high)'}
                />
                <span className="font-semibold">{a.class_name}</span>
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                Frame: {a.image_id} | Conf: {a.confidence.toFixed(2)}
              </div>
              <ThreatBadge level={a.threat_level} />
            </div>
          ))}
        </div>
      )}
    </CardFrame>
  )
}
