import { useState } from 'react'
import type { AnalyzeResponse } from '../types/api.types'
import { AnalyzeUploader } from '../components/analyze/AnalyzeUploader'
import { AnalyzeResultCard } from '../components/analyze/AnalyzeResultCard'

export const AnalyzePage = () => {
  const [result, setResult] = useState<AnalyzeResponse | null>(null)

  return (
    <div className="space-y-4">
      <AnalyzeUploader onResult={setResult} />
      {result ? <AnalyzeResultCard result={result} /> : null}
    </div>
  )
}
