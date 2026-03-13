import { format } from 'date-fns'

export const formatConfidence = (value: number): string => value.toFixed(2)
export const formatThreatScore = (value: number): string => value.toFixed(2)
export const formatUtc = (date: Date): string =>
  `${format(date, 'dd MMM yyyy HH:mm:ss')} UTC`
