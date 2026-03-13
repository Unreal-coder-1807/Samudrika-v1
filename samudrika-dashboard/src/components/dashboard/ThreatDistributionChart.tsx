import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useDashboardStore } from '../../store/useDashboardStore'
import { CardFrame } from '../common/CardFrame'

export const ThreatDistributionChart = () => {
  const getThreatCount = useDashboardStore((s) => s.getThreatCount)
  const data = [
    { name: 'CRITICAL', count: getThreatCount('CRITICAL'), color: '#FF2D2D' },
    { name: 'HIGH', count: getThreatCount('HIGH'), color: '#FF6B2B' },
    { name: 'MEDIUM', count: getThreatCount('MEDIUM'), color: '#FFD60A' },
    { name: 'LOW', count: getThreatCount('LOW'), color: '#06D6A0' },
    { name: 'NONE', count: getThreatCount('NONE'), color: '#4A5568' },
  ]

  return (
    <CardFrame className="h-full">
      <h3 className="mb-2 text-lg">Threat Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.2} />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#00B4D8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardFrame>
  )
}
