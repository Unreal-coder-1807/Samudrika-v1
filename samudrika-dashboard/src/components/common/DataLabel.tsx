export const DataLabel = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex items-center justify-between gap-2 text-xs">
    <span className="ui-label text-[var(--text-secondary)]">{label}</span>
    <span className="font-mono text-[var(--text-primary)]">{value}</span>
  </div>
)
