import { useEffect, useRef, useState } from 'react'

interface PipeStep {
  id: string
  label: string
  track: 'A' | 'B' | 'C'
  icon: string
}

const PIPE_STEPS: PipeStep[] = [
  { id: 'input', label: 'Input Image', track: 'A', icon: 'IMG' },
  { id: 'enhancement', label: 'Enhancement FUnIE-GAN', track: 'A', icon: 'ENH' },
  { id: 'detection', label: 'Detection YOLOv8', track: 'A', icon: 'DET' },
  { id: 'embeddings', label: 'Embeddings Feature Vectors', track: 'B', icon: 'VEC' },
  { id: 'search', label: 'Vector Search FAISS', track: 'B', icon: 'IDX' },
  { id: 'score', label: 'Threat Score Rules Engine', track: 'B', icon: 'RUL' },
  { id: 'xai', label: 'Explainability Grad-CAM', track: 'B', icon: 'XAI' },
  { id: 'dashboard', label: 'Dashboard Operator View', track: 'C', icon: 'UI' },
]

export const PipelineSection = () => {
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const sectionNode = sectionRef.current
    if (!sectionNode) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
          }
        })
      },
      { threshold: 0.2 }
    )
    observer.observe(sectionNode)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="pipeline" className="landing-section reveal" ref={sectionRef}>
      <div className="landing-container">
        <div className="landing-overline">PIPELINE</div>
        <h2 className="landing-headline">From ocean floor to operator.</h2>

        <div className="pipeline-row">
          {PIPE_STEPS.map((step, index) => (
            <div key={step.id} style={{ display: 'contents' }}>
              <article
                className={`pipeline-node ${visible ? 'visible' : ''}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="mono" style={{ color: '#00B4D8', fontSize: 11 }}>
                  {step.icon}
                </div>
                <div className="pipeline-node-label">{step.label}</div>
              </article>
              {index < PIPE_STEPS.length - 1 && (
                <span
                  className={`pipeline-arrow ${visible ? 'draw' : ''}`}
                  style={{ animationDelay: `${index * 90}ms` }}
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>

        <div className="pipeline-tracks">
          <span>TRACK A</span>
          <span>TRACK B</span>
          <span>TRACK C</span>
        </div>
      </div>
    </section>
  )
}
