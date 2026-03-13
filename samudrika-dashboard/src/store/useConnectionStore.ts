import { create } from 'zustand'
import type { HealthResponse } from '../types/api.types'

interface ConnectionState {
  isOnline: boolean
  faissIndexSize: number
  rulesLoaded: boolean
  lastChecked: Date | null
  setOnline: (healthData: HealthResponse) => void
  setOffline: () => void
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  isOnline: false,
  faissIndexSize: 0,
  rulesLoaded: false,
  lastChecked: null,
  setOnline: (healthData) =>
    set({
      isOnline: healthData.status === 'ok',
      faissIndexSize: healthData.faiss_index_size,
      rulesLoaded: healthData.rules_loaded,
      lastChecked: new Date(),
    }),
  setOffline: () =>
    set({
      isOnline: false,
      lastChecked: new Date(),
    }),
}))
