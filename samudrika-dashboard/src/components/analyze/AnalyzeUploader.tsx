import { useState } from 'react'
import { Scan } from 'lucide-react'
import { useAnalyze } from '../../hooks/useAnalyze'
import type { AnalyzeResponse, FrameInput } from '../../types/api.types'

interface Props {
  onResult: (result: AnalyzeResponse) => void
}

const example = `{
  "image_id": "frame_001.jpg",
  "detections": [{"class": "submarine", "confidence": 0.91, "bbox": [120, 80, 340, 210], "embedding": []}]
}`

export const AnalyzeUploader = ({ onResult }: Props) => {
  const [input, setInput] = useState(example)
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste')
  const { loading, runAnalyze } = useAnalyze()

  const isValid = (() => {
    try {
      JSON.parse(input)
      return true
    } catch {
      return false
    }
  })()

  const submit = async () => {
    if (!isValid) return
    const payload = JSON.parse(input) as FrameInput
    const data = await runAnalyze(payload)
    onResult(data)
  }

  const onFile = async (file: File) => {
    const text = await file.text()
    setInput(text)
    setActiveTab('paste')
  }

  return (
    <div className="card-frame rounded-md p-3">
      <div className="mb-3 flex gap-2">
        <button onClick={() => setActiveTab('paste')} className="rounded border px-3 py-1">
          PASTE JSON
        </button>
        <button onClick={() => setActiveTab('upload')} className="rounded border px-3 py-1">
          UPLOAD FILE
        </button>
      </div>
      {activeTab === 'paste' ? (
        <>
          <textarea
            className="h-64 w-full rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 text-xs"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="mt-2 text-xs">
            {input.length} chars | {isValid ? 'VALID JSON' : 'INVALID JSON'}
          </div>
          <button
            disabled={!isValid || loading}
            onClick={submit}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded bg-cyan-600 px-3 py-2 disabled:opacity-50"
          >
            <Scan size={16} /> {loading ? 'ANALYZING...' : 'ANALYZE'}
          </button>
        </>
      ) : (
        <label className="flex h-40 cursor-pointer items-center justify-center rounded border border-dashed border-[var(--border-subtle)] text-sm">
          Drop Track A output JSON here or click to browse
          <input
            type="file"
            className="hidden"
            accept=".json"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          />
        </label>
      )}
    </div>
  )
}
