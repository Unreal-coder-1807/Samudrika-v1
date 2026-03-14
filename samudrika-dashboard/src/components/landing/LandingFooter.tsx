const SonarIcon = () => (
  <svg className="landing-brand-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="2" stroke="#00B4D8" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="6" stroke="rgba(0,180,216,0.6)" strokeWidth="1.2" />
    <circle cx="12" cy="12" r="10" stroke="rgba(0,180,216,0.4)" strokeWidth="1" />
  </svg>
)

export const LandingFooter = () => (
  <footer id="about" className="landing-footer">
    <div className="landing-container">
      <div className="footer-grid">
        <div>
          <div className="landing-brand">
            <SonarIcon />
            <span>SAMUDRIKA</span>
          </div>
          <p className="landing-copy" style={{ marginTop: 14, fontSize: 13, color: '#475569' }}>
            Underwater Threat Intelligence System
          </p>
          <p className="landing-copy" style={{ marginTop: 8, fontSize: 13, color: '#475569' }}>
            Indian Navy x DRDO
          </p>
          <p className="landing-copy" style={{ marginTop: 2, fontSize: 13, color: '#475569' }}>
            Academic Research Prototype
          </p>
          <div className="hero-badge mono" style={{ margin: '14px 0 0', fontSize: 10 }}>
            <span className="badge-dot" />
            RESTRICTED
          </div>
        </div>

        <div>
          <div className="footer-label">PIPELINE</div>
          <div className="footer-links">
            <a href="#features">Enhancement</a>
            <a href="#features">Detection</a>
            <a href="#architecture">Intelligence</a>
            <a href="/dashboard">Dashboard</a>
          </div>
        </div>

        <div>
          <div className="footer-label">TECHNOLOGY</div>
          <div className="footer-links">
            <a href="#architecture">PyTorch</a>
            <a href="#architecture">FUnIE-GAN</a>
            <a href="#architecture">YOLOv8</a>
            <a href="#architecture">FAISS</a>
            <a href="#architecture">FastAPI</a>
            <a href="#architecture">React</a>
          </div>
        </div>

        <div>
          <div className="footer-label">PROJECT</div>
          <div className="footer-links">
            <a href="#architecture">Track A - Vision</a>
            <a href="#architecture">Track B - Intelligence</a>
            <a href="#architecture">Track C - Dashboard</a>
            <a href="/dashboard" style={{ color: '#00B4D8' }}>
              Access Dashboard &#8594;
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom mono">
        <span>&#169; 2026 Samudrika-Core. Academic Research Prototype.</span>
        <span>v0.1.0-MVP | Python 3.10 | React 18</span>
      </div>
    </div>
  </footer>
)
