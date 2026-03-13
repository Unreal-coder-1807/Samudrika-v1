export const ConfidenceBar = ({ value }: { value: number }) => {
  const pct = Math.max(0, Math.min(100, value * 100))
  return (
    <div className="h-2 w-full rounded bg-slate-700/40">
      <div
        className="h-2 rounded bg-cyan-400 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
