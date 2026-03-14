import { useState } from 'react'

type TrackId = 'A' | 'B' | 'C'

interface TrackContent {
  overline: string
  headline: string
  body: string
  tech: string[]
}

const TRACKS: Record<TrackId, TrackContent> = {
  A: {
    overline: 'TRACK A',
    headline: 'Vision Pipeline',
    body: 'Raw underwater imagery is enhanced using FUnIE-GAN and analyzed by YOLOv8 to produce standardized detection outputs with bounding boxes, confidence scores, and 512-dimensional feature embeddings.',
    tech: ['PyTorch 2.2.2', 'FUnIE-GAN (U-Net GAN)', 'YOLOv8', 'OpenCV 4.9'],
  },
  B: {
    overline: 'TRACK B',
    headline: 'Intelligence Engine',
    body: 'Detection embeddings are indexed in FAISS for similarity search. A configurable rules engine assigns threat levels. Grad-CAM generates explainability heatmaps. FastAPI exposes results.',
    tech: ['FAISS Vector Search', 'Threat Rules YAML', 'Grad-CAM XAI', 'FastAPI 0.110'],
  },
  C: {
    overline: 'TRACK C',
    headline: 'Operator Dashboard',
    body: 'A React-based intelligence dashboard provides real-time threat visualization, Grad-CAM heatmap review, FAISS similarity context, and system health monitoring - with full light and dark theme support.',
    tech: ['React 18 + TypeScript', 'Recharts + Leaflet', 'Zustand State', 'Framer Motion'],
  },
}

const ThreatPanel = () => {
  const rows = [
    { color: '#FF2D2D', label: 'CRITICAL', cls: 'naval_mine', value: 100 },
    { color: '#FF6B2B', label: 'HIGH', cls: 'submarine', value: 75 },
    { color: '#FFD60A', label: 'MEDIUM', cls: 'diver', value: 50 },
    { color: '#06D6A0', label: 'LOW', cls: 'rov', value: 25 },
  ]
  return (
    <div className="arch-visual">
      {rows.map((row) => (
        <div className="threat-row" key={row.label}>
          <div className="threat-label">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: row.color }} />
            {row.label}
          </div>
          <div className="threat-bar">
            <div className="threat-bar-fill" style={{ width: `${row.value}%`, background: row.color }} />
          </div>
          <div className="mono" style={{ fontSize: 11, color: '#94A3B8' }}>
            {row.cls}
          </div>
        </div>
      ))}
    </div>
  )
}

const DashboardMini = () => (
  <div className="dashboard-mini">
    <div className="mini-stats">
      <div className="mini-stat">CRITICAL: 2</div>
      <div className="mini-stat">HIGH: 5</div>
      <div className="mini-stat">MEDIUM: 3</div>
      <div className="mini-stat">LOW: 8</div>
    </div>
    <div className="mini-bars">
      <span style={{ width: '26%', background: '#FF2D2D' }} />
      <span style={{ width: '48%', background: '#FF6B2B' }} />
      <span style={{ width: '36%', background: '#FFD60A' }} />
      <span style={{ width: '68%', background: '#06D6A0' }} />
    </div>
  </div>
)

export const ArchSection = () => {
  const [active, setActive] = useState<TrackId>('A')
  const [isSwitching, setIsSwitching] = useState(false)
  const content = TRACKS[active]

  const onSwitch = (track: TrackId) => {
    if (track === active) return
    setIsSwitching(true)
    window.setTimeout(() => {
      setActive(track)
      setIsSwitching(false)
    }, 150)
  }

  return (
    <section id="architecture" className="landing-section reveal">
      <div className="landing-container">
        <div className="arch-tabs">
          <button className={`arch-tab ${active === 'A' ? 'active' : ''}`} onClick={() => onSwitch('A')}>
            Track A - Vision
          </button>
          <button className={`arch-tab ${active === 'B' ? 'active' : ''}`} onClick={() => onSwitch('B')}>
            Track B - Intelligence
          </button>
          <button className={`arch-tab ${active === 'C' ? 'active' : ''}`} onClick={() => onSwitch('C')}>
            Track C - Dashboard
          </button>
        </div>

        <div
          className="arch-panel"
          style={{
            opacity: isSwitching ? 0 : 1,
            transform: isSwitching ? 'translateX(-10px)' : 'translateX(0)',
            transition: 'opacity 250ms ease, transform 250ms ease',
          }}
        >
          <div>
            <div className="landing-overline">{content.overline}</div>
            <h3 className="landing-headline" style={{ marginTop: 10 }}>
              {content.headline}
            </h3>
            <p className="landing-copy" style={{ marginTop: 18 }}>
              {content.body}
            </p>
            <div className="arch-list">
              {content.tech.map((item) => (
                <div className="arch-item" key={item}>
                  <span style={{ color: '#00B4D8' }}>⬡</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {active === 'A' && (
            <div className="arch-visual">
              <pre className="arch-json">
                <span className="json-bracket">{'{'}</span>
                {'\n'}  <span className="json-key">"image_id"</span>: "frame_001.jpg",
                {'\n'}  <span className="json-key">"detections"</span>: [{'{'}
                {'\n'}    <span className="json-key">"class"</span>: "submarine",
                {'\n'}    <span className="json-key">"confidence"</span>: 0.91,
                {'\n'}    <span className="json-key">"bbox"</span>: [120, 80, 340, 210],
                {'\n'}    <span className="json-key">"embedding"</span>: [...]
                {'\n'}  {'}]'}
                {'\n'}
                <span className="json-bracket">{'}'}</span>
              </pre>
            </div>
          )}
          {active === 'B' && <ThreatPanel />}
          {active === 'C' && <DashboardMini />}
        </div>
      </div>
    </section>
  )
}
