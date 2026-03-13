import { useState } from 'react'
import type { AnalyzeResponse } from '../../types/api.types'
import { ThreatBadge } from '../common/ThreatBadge'
import { DetectionRow } from './DetectionRow'
import { HeatmapViewer } from './HeatmapViewer'
import { BoundingBoxOverlay } from './BoundingBoxOverlay'

export const AnalyzeResultCard = ({ result }: { result: AnalyzeResponse }) => {
  const [selectedHeatmap, setSelectedHeatmap] = useState<string | undefined>()

  return (
    <div className="card-frame rounded-md p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm">
          IMAGE ID: {result.image_id} | DETECTIONS: {result.scored_detections.length}
        </div>
        <ThreatBadge level={result.frame_threat_level} />
      </div>
      <BoundingBoxOverlay detections={result.scored_detections} />
      <table className="mt-3 w-full border-collapse">
        <thead className="text-left text-xs ui-label">
          <tr>
            <th>#</th>
            <th>CLASS</th>
            <th>CONFIDENCE</th>
            <th>BBOX</th>
            <th>THREAT</th>
            <th>SCORE</th>
            <th>REASON</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {result.scored_detections.map((det, idx) => (
            <DetectionRow
              key={`${det.class_name}-${idx}`}
              det={det}
              idx={idx}
              onViewHeatmap={
                result.heatmap_paths[idx]
                  ? () => setSelectedHeatmap(result.heatmap_paths[idx])
                  : undefined
              }
            />
          ))}
        </tbody>
      </table>
      <HeatmapViewer
        open={Boolean(selectedHeatmap)}
        imagePath={selectedHeatmap}
        onClose={() => setSelectedHeatmap(undefined)}
      />
    </div>
  )
}
