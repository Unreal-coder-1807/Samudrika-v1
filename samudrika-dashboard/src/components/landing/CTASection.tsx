export const CTASection = () => (
  <section id="contact" className="cta-section reveal">
    <div className="landing-container">
      <div className="cta-pill">RESTRICTED ACCESS</div>
      <h2 className="cta-title">Ready to deploy?</h2>
      <p className="cta-sub">Built for Indian Navy and DRDO research operations.</p>

      <div className="cta-actions">
        <button className="btn btn-outline">Request Briefing</button>
        <button className="btn btn-primary" onClick={() => (window.location.href = '/dashboard')}>
          Access Dashboard &#8594;
        </button>
      </div>

      <div className="cta-disclaimer mono">
        Academic and research prototype. Not for operational deployment.
      </div>
    </div>
  </section>
)
