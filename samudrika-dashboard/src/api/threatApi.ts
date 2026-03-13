import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'
import type { SingleDetectionInput, ThreatResponse } from '../types/api.types'

export const scoreDetection = async (
  payload: SingleDetectionInput,
): Promise<ThreatResponse> => {
  const { data } = await apiClient.post<ThreatResponse>(ENDPOINTS.THREAT, payload)
  return data
}
