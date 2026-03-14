import { useEffect, useState } from "react";

const ringSizes = [200, 320, 460, 680, 900];

export const HeroSection = () => {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setHasScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="top" className="hero">
      <div className="sonar-wrapper" aria-hidden="true">
        {ringSizes.map((size, index) => (
          <div
            key={size}
            className="sonar-ring"
            style={{
              width: size,
              height: size,
              animationDelay: `${index * 0.45}s`,
              borderColor: `rgba(0,180,216,${Math.max(0.02, 0.08 - index * 0.012)})`,
            }}
          />
        ))}
      </div>

      <div className="landing-container hero-content">
        <div className="hero-badge mono">
          <span className="badge-dot" />
          RESTRICTED
        </div>

        <h1 className="hero-title">
          <span className="hero-line-1">Underwater Threat</span>
          <br />
          <span className="hero-line-2">
            <span className="accent">Intelligence.</span>
          </span>
        </h1>

        <p className="hero-subtitle hero-sub">
          A deep-sea AI surveillance pipeline developed for Indian Navy and
          DRDO. Detect. Classify. Respond.
        </p>

        <div className="hero-cta-row hero-cta">
          <button
            className="btn btn-outline"
            onClick={() =>
              document
                .getElementById("contact")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Request Briefing
          </button>
          <button
            className="btn btn-primary"
            onClick={() => (window.location.href = "/dashboard")}
          >
            Access Dashboard &#8594;
          </button>
        </div>
      </div>

      <span
        className={`scroll-indicator ${hasScrolled ? "hidden" : ""}`}
        aria-hidden="true"
      />
    </section>
  );
};
