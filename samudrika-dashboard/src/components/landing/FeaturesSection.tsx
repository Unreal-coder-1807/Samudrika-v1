const WaveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M2 15C4 15 4 9 6 9C8 9 8 15 10 15C12 15 12 9 14 9C16 9 16 15 18 15C20 15 20 9 22 9" stroke="#00B4D8" strokeWidth="1.6" />
  </svg>
)

const TargetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="8" stroke="#00B4D8" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="4" stroke="#00B4D8" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="1.5" fill="#00B4D8" />
  </svg>
)

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3L19 6V11C19 16 15.5 19.5 12 21C8.5 19.5 5 16 5 11V6L12 3Z" stroke="#00B4D8" strokeWidth="1.5" />
    <path d="M9 12L11 14L15 10" stroke="#00B4D8" strokeWidth="1.5" />
  </svg>
)

const FEATURES = [
  {
    title: 'Underwater Enhancement',
    body: 'FUnIE-GAN preprocesses distorted frames - correcting turbidity, color distortion, and low-visibility conditions before analysis.',
    tag: 'FUnIE-GAN',
    icon: <WaveIcon />,
  },
  {
    title: 'Object Detection',
    body: 'YOLOv8 identifies submarines, naval mines, ROVs, divers and underwater drones with bounding boxes and confidence scores.',
    tag: 'YOLOv8',
    icon: <TargetIcon />,
  },
  {
    title: 'Threat Intelligence',
    body: 'FAISS vector similarity search and rule-based scoring assign CRITICAL / HIGH / MEDIUM / LOW threat levels with Grad-CAM explainability heatmaps.',
    tag: 'FAISS + Grad-CAM',
    icon: <ShieldIcon />,
  },
]

export const FeaturesSection = () => (
  <section id="features" className="landing-section reveal">
    <div className="landing-container">
      <div className="landing-overline">CAPABILITIES</div>
      <h2 className="landing-headline">Engineered for the abyss.</h2>

      <div className="feature-grid">
        {FEATURES.map((feature) => (
          <article className="feature-card" key={feature.title}>
            {feature.icon}
            <h3 className="feature-title">{feature.title}</h3>
            <p className="landing-copy">{feature.body}</p>
            <div className="feature-tag mono">{feature.tag}</div>
          </article>
        ))}
      </div>
    </div>
  </section>
)
