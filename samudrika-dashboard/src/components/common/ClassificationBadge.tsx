export const ClassificationBadge = ({ label = 'RESTRICTED' }: { label?: string }) => (
  <span className="rounded border border-red-500/50 bg-red-900/20 px-2 py-0.5 text-[10px] ui-label text-red-400">
    [{label}]
  </span>
)
