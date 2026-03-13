import axios from 'axios'
import { useConnectionStore } from '../store/useConnectionStore'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  console.log(`[SAMUDRIKA API] ${config.method?.toUpperCase()} ${config.url}`)
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    useConnectionStore.getState().setOffline()
    return Promise.reject(error)
  },
)
