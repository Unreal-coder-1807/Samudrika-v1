import { useConnectionStore } from '../../store/useConnectionStore'
import { formatUtc } from '../../utils/formatters'

export const StatusBar = () => {
  const { isOnline, faissIndexSize, lastChecked } = useConnectionStore()
  return (
    <footer className="fixed bottom-0 left-60 right-0 flex h-7 items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 text-[10px]">
      <div>System uptime | FAISS Index: {faissIndexSize} vectors</div>
      <div>Last updated: {lastChecked ? formatUtc(lastChecked) : 'N/A'}</div>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
        API: {isOnline ? 'ONLINE' : 'OFFLINE'} | v0.1.0-MVP
      </div>
    </footer>
  )
}
