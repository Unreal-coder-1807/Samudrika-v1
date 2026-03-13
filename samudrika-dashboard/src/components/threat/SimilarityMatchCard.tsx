import type { ThreatResponse } from '../../types/api.types'

export const SimilarityMatchCard = ({ result }: { result: ThreatResponse }) => (
  <div className="card-frame rounded p-3 text-sm">
    <div className="ui-label mb-1">Nearest Known Object</div>
    <div>Class: {result.similarity_match?.class ?? '-'}</div>
    <div>Distance: {result.similarity_match?.distance ?? '-'}</div>
    <div>Rank: {result.similarity_match?.rank ?? '-'}</div>
    <div>Image: {result.similarity_match?.image_id ?? '-'}</div>
  </div>
)
