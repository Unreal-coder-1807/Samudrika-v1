import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useDashboardStore } from '../../store/useDashboardStore'
import { CardFrame } from '../common/CardFrame'

export const DetectionTimelineChart = () => {
  const frames = useDashboardStore((s) => s.frames)
  const data = frames.map((f, idx) => ({
    frame: idx + 1,
    detections: f.scored_detections.length,
  }))

  return (
    <CardFrame className="h-full">
      <h3 className="mb-2 text-lg">Detection Timeline</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.2} />
            <XAxis dataKey="frame" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Area type="monotone" dataKey="detections" stroke="#00B4D8" fill="#00B4D822" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </CardFrame>
  )
}
