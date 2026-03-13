import { useState } from 'react'
import type { ThreatResponse } from '../../types/api.types'
import { useThreat } from '../../hooks/useThreat'
import { ThreatBadge } from '../common/ThreatBadge'
import { SimilarityMatchCard } from './SimilarityMatchCard'
import { ThreatReasonBox } from './ThreatReasonBox'

const classes = [
  'submarine',
  'naval_mine',
  'diver',
  'rov',
  'torpedo',
  'underwater_drone',
  'underwater_vehicle',
  'unknown',
]

export const ThreatScorePanel = () => {
  const [className, setClassName] = useState('submarine')
  const [confidence, setConfidence] = useState(0.8)
  const [embeddingText, setEmbeddingText] = useState('[]')
  const [result, setResult] = useState<ThreatResponse | null>(null)
  const { loading, runThreatScore } = useThreat()

  const submit = async () => {
    let embedding: number[] = []
    try {
      embedding = JSON.parse(embeddingText)
      if (!Array.isArray(embedding)) embedding = []
    } catch {
      embedding = []
    }
    const response = await runThreatScore({
      detection: {
        class: className,
        confidence,
        bbox: [0, 0, 1, 1],
        embedding,
      },
    })
    setResult(response)
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card-frame rounded p-3">
        <h3 className="mb-2 text-lg">Single Detection Scorer</h3>
        <select value={className} onChange={(e) => setClassName(e.target.value)} className="mb-2 w-full rounded border bg-transparent p-2">
          {classes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label className="mb-2 block text-sm">
          Confidence: {confidence.toFixed(2)}
          <input
            className="w-full"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
          />
        </label>
        <textarea
          className="h-40 w-full rounded border bg-transparent p-2 text-xs"
          value={embeddingText}
          onChange={(e) => setEmbeddingText(e.target.value)}
        />
        <button onClick={submit} disabled={loading} className="mt-2 w-full rounded bg-cyan-600 px-3 py-2">
          {loading ? 'SCORING...' : 'SCORE THREAT'}
        </button>
      </div>

      {result ? (
        <div className="space-y-3">
          <div className="card-frame rounded p-3">
            <div className="mb-2 ui-label">Threat Level</div>
            <ThreatBadge level={result.threat_level} />
            <div className="mt-3 text-2xl">{result.threat_score.toFixed(2)}</div>
          </div>
          <SimilarityMatchCard result={result} />
          <ThreatReasonBox reason={result.reason} />
        </div>
      ) : null}
    </div>
  )
}
