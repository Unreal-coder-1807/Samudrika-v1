import type { PropsWithChildren } from 'react'

export const CardFrame = ({
  children,
  className = '',
}: PropsWithChildren<{ className?: string }>) => (
  <div className={`card-frame rounded-md p-3 ${className}`}>{children}</div>
)
