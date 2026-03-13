import { useEffect } from 'react'
import { getHealth } from '../api/healthApi'
import { useConnectionStore } from '../store/useConnectionStore'
import { MOCK_MODE, getMockHealth } from '../utils/mockData'

export const useApiHealth = () => {
  const setOnline = useConnectionStore((state) => state.setOnline)
  const setOffline = useConnectionStore((state) => state.setOffline)

  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        const health = MOCK_MODE ? getMockHealth() : await getHealth()
        if (mounted) setOnline(health)
      } catch {
        if (mounted) setOffline()
      }
    }

    run()
    const interval = setInterval(run, 30_000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [setOnline, setOffline])
}
