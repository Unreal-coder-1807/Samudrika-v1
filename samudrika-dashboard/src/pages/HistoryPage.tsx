import { useDashboardStore } from '../store/useDashboardStore'
import { ThreatBadge } from '../components/common/ThreatBadge'

export const HistoryPage = () => {
  const frames = useDashboardStore((s) => s.frames)

  return (
    <div className="card-frame rounded p-3">
      <h3 className="mb-3 text-lg">Analyzed Frames</h3>
      {!frames.length ? (
        <div className="text-center text-sm text-[var(--text-muted)]">
          NO FRAMES ANALYZED IN THIS SESSION
        </div>
      ) : (
        <table className="w-full text-xs">
          <thead className="text-left ui-label">
            <tr>
              <th>TIMESTAMP</th>
              <th>IMAGE ID</th>
              <th>FRAME THREAT</th>
              <th>DETECTIONS</th>
            </tr>
          </thead>
          <tbody>
            {frames.map((frame, idx) => (
              <tr key={`${frame.image_id}-${idx}`} className="border-t border-[var(--border-subtle)]">
                <td>{frame.processed_at ?? '-'}</td>
                <td>{frame.image_id}</td>
                <td>
                  <ThreatBadge level={frame.frame_threat_level} />
                </td>
                <td>{frame.scored_detections.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
