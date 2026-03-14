import { useEffect, useMemo, useRef, useState } from 'react'

interface StatItem {
  value: string
  label: string
  sublabel: string
}

const STATIC_STATS: StatItem[] = [
  { value: '2 Tracks', label: 'AI Pipeline Architecture', sublabel: 'A + B + C system map' },
  { value: '8 Classes', label: 'Underwater Object Types', sublabel: 'Mission-critical taxonomy' },
  { value: '3 Stages', label: 'Enhancement -> Detection -> Intelligence', sublabel: 'End-to-end flow' },
  { value: 'Real-Time', label: 'Edge-Optimized Inference', sublabel: 'Streaming-ready outputs' },
]

const extractCount = (rawValue: string) => {
  const match = rawValue.match(/\d+/)
  if (!match) {
    return null
  }
  const count = Number(match[0])
  const suffix = rawValue.replace(match[0], '').trim()
  return { count, suffix }
}

export const StatsBar = () => {
  const [counts, setCounts] = useState<number[]>(() => STATIC_STATS.map(() => 0))
  const [started, setStarted] = useState(false)
  const sectionRef = useRef<HTMLElement | null>(null)
  const parsed = useMemo(() => STATIC_STATS.map((item) => extractCount(item.value)), [])

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStarted(true)
          }
        })
      },
      { threshold: 0.25 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    let frame = 0
    const totalFrames = 45
    const timer = window.setInterval(() => {
      frame += 1
      setCounts((prev) =>
        prev.map((value, index) => {
          const target = parsed[index]?.count
          if (!target) return value
          const next = Math.round((target * frame) / totalFrames)
          return Math.min(target, next)
        })
      )
      if (frame >= totalFrames) {
        window.clearInterval(timer)
      }
    }, 30)
    return () => window.clearInterval(timer)
  }, [parsed, started])

  return (
    <section className="stats-bar reveal" ref={sectionRef}>
      <div className="landing-container stats-grid">
        {STATIC_STATS.map((item, index) => {
          const parsedValue = parsed[index]
          const displayValue = parsedValue ? `${counts[index]} ${parsedValue.suffix}` : item.value
          return (
            <article className="stat-cell" key={item.label}>
              <div className="stat-value">{displayValue}</div>
              <div className="stat-label">{item.label}</div>
              <div className="stat-sublabel">{item.sublabel}</div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
