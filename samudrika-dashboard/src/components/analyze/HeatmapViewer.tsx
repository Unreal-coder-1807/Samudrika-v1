export const HeatmapViewer = ({
  open,
  imagePath,
  onClose,
}: {
  open: boolean
  imagePath?: string
  onClose: () => void
}) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-5xl rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3>Heatmap Viewer</h3>
          <button onClick={onClose} className="rounded border px-2 py-1">
            CLOSE
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-3 flex min-h-64 items-center justify-center rounded border border-[var(--border-subtle)]">
            {imagePath ? <img src={imagePath} alt="heatmap" className="max-h-[70vh]" /> : 'No heatmap available'}
          </div>
          <div className="rounded border border-[var(--border-subtle)] p-2 text-xs">
            <div className="ui-label mb-1">Detection Metadata</div>
            <div>Path: {imagePath ?? 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
