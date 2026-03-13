import { ActiveAlertsPanel } from '../components/dashboard/ActiveAlertsPanel'
import { DetectionTimelineChart } from '../components/dashboard/DetectionTimelineChart'
import { LiveFeedPanel } from '../components/dashboard/LiveFeedPanel'
import { MapPanel } from '../components/dashboard/MapPanel'
import { SystemStatusPanel } from '../components/dashboard/SystemStatusPanel'
import { ThreatDistributionChart } from '../components/dashboard/ThreatDistributionChart'
import { ThreatSummaryBar } from '../components/dashboard/ThreatSummaryBar'

export const DashboardPage = () => (
  <div className="grid grid-cols-12 gap-4">
    <div className="col-span-12">
      <ThreatSummaryBar />
    </div>

    <div className="col-span-8">
      <LiveFeedPanel />
    </div>
    <div className="col-span-4">
      <ActiveAlertsPanel />
    </div>

    <div className="col-span-8">
      <ThreatDistributionChart />
    </div>
    <div className="col-span-4">
      <DetectionTimelineChart />
    </div>

    <div className="col-span-4">
      <SystemStatusPanel />
    </div>
    <div className="col-span-8">
      <MapPanel />
    </div>
  </div>
)
