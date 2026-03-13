import { CardFrame } from '../common/CardFrame'
import { useDashboardStore } from '../../store/useDashboardStore'
import { THREAT_PRIORITY } from '../../types/threat.types'

export const ThreatSummaryBar = () => {
  const frames = useDashboardStore((s) => s.frames)
  const getThreatCount = useDashboardStore((s) => s.getThreatCount)

  return (
    <div className="grid grid-cols-6 gap-3">
      {THREAT_PRIORITY.map((level) => (
        <CardFrame key={level} className="border-l-4" >
          <div className="text-2xl font-bold">{getThreatCount(level)}</div>
          <div className="ui-label text-xs">{level}</div>
        </CardFrame>
      ))}
      <CardFrame>
        <div className="text-2xl font-bold">{frames.length}</div>
        <div className="ui-label text-xs">TOTAL FRAMES</div>
      </CardFrame>
    </div>
  )
}
