import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'
import type { HealthResponse } from '../types/api.types'

export const getHealth = async (): Promise<HealthResponse> => {
  const { data } = await apiClient.get<HealthResponse>(ENDPOINTS.HEALTH)
  return data
}
