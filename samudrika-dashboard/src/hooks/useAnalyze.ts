import { useState } from 'react'
import { analyzeFrame } from '../api/analyzeApi'
import type { AnalyzeResponse, FrameInput } from '../types/api.types'
import { MOCK_MODE, getMockAnalyzeResponse } from '../utils/mockData'
import { useDashboardStore } from '../store/useDashboardStore'

export const useAnalyze = () => {
  const [loading, setLoading] = useState(false)
  const addFrame = useDashboardStore((state) => state.addFrame)

  const runAnalyze = async (payload: FrameInput): Promise<AnalyzeResponse> => {
    setLoading(true)
    try {
      const response = MOCK_MODE ? getMockAnalyzeResponse() : await analyzeFrame(payload)
      addFrame(response)
      return response
    } finally {
      setLoading(false)
    }
  }

  return { loading, runAnalyze }
}
