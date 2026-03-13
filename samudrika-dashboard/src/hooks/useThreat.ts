import { useState } from 'react'
import { scoreDetection } from '../api/threatApi'
import type { SingleDetectionInput, ThreatResponse } from '../types/api.types'
import { MOCK_MODE, getMockThreatResponse } from '../utils/mockData'

export const useThreat = () => {
  const [loading, setLoading] = useState(false)

  const runThreatScore = async (
    payload: SingleDetectionInput,
  ): Promise<ThreatResponse> => {
    setLoading(true)
    try {
      return MOCK_MODE ? getMockThreatResponse() : await scoreDetection(payload)
    } finally {
      setLoading(false)
    }
  }

  return { loading, runThreatScore }
}
