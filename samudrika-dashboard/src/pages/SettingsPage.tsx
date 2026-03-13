import { useState } from 'react'
import { getHealth } from '../api/healthApi'
import { useConnectionStore } from '../store/useConnectionStore'
import { MOCK_MODE, getMockHealth } from '../utils/mockData'

export const SettingsPage = () => {
  const [baseUrl, setBaseUrl] = useState(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000')
  const [classification, setClassification] = useState('RESTRICTED')
  const { isOnline, faissIndexSize } = useConnectionStore()
  const setOnline = useConnectionStore((s) => s.setOnline)
  const setOffline = useConnectionStore((s) => s.setOffline)

  const testConnection = async () => {
    try {
      const health = MOCK_MODE ? getMockHealth() : await getHealth()
      setOnline(health)
    } catch {
      setOffline()
    }
  }

  return (
    <div className="space-y-4">
      <div className="card-frame rounded p-3">
        <h3 className="mb-2 text-lg">API Configuration</h3>
        <input
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          className="w-full rounded border bg-transparent p-2"
        />
        <button onClick={testConnection} className="mt-2 rounded bg-cyan-600 px-3 py-2">
          TEST CONNECTION
        </button>
        <div className="mt-2 text-sm">
          {isOnline ? `ONLINE - FAISS: ${faissIndexSize} vectors` : 'OFFLINE'}
        </div>
      </div>

      <div className="card-frame rounded p-3">
        <h3 className="mb-2 text-lg">Display Settings</h3>
        <div className="text-sm">Use top-bar theme toggle for DARK / LIGHT.</div>
      </div>

      <div className="card-frame rounded p-3">
        <h3 className="mb-2 text-lg">Classification Marking</h3>
        <select
          value={classification}
          onChange={(e) => setClassification(e.target.value)}
          className="rounded border bg-transparent p-2"
        >
          <option>UNCLASSIFIED</option>
          <option>RESTRICTED</option>
          <option>CONFIDENTIAL</option>
          <option>SECRET</option>
        </select>
      </div>

      <div className="card-frame rounded p-3 text-sm">
        <h3 className="mb-2 text-lg">About</h3>
        <div>SAMUDRIKA-CORE v0.1.0</div>
        <div>Track B Intelligence Layer</div>
        <div>Indian Navy x DRDO Research Prototype</div>
      </div>
    </div>
  )
}
