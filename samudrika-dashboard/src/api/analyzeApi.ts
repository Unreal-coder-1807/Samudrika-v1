import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'
import type { AnalyzeResponse, FrameInput } from '../types/api.types'

export const analyzeFrame = async (payload: FrameInput): Promise<AnalyzeResponse> => {
  const { data } = await apiClient.post<AnalyzeResponse>(ENDPOINTS.ANALYZE, payload)
  return data
}
