export const ThreatReasonBox = ({ reason }: { reason: string }) => (
  <div className="card-frame rounded p-3 text-sm">
    <div className="ui-label mb-1">Reason</div>
    <pre className="whitespace-pre-wrap font-mono text-xs">{`> ${reason}`}</pre>
  </div>
)
