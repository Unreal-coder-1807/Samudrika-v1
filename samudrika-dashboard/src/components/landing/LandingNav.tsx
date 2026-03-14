import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const links = [
  { href: '#features', label: 'Products' },
  { href: '#pipeline', label: 'Pipeline' },
  { href: '#architecture', label: 'Research' },
  { href: '#about', label: 'About' },
]

const SonarIcon = () => (
  <svg className="landing-brand-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="2" stroke="#00B4D8" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="6" stroke="rgba(0,180,216,0.6)" strokeWidth="1.2" />
    <circle cx="12" cy="12" r="10" stroke="rgba(0,180,216,0.4)" strokeWidth="1" />
  </svg>
)

export const LandingNav = () => {
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => setIsOpen(false)

  return (
    <>
      <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="landing-nav-inner">
          <a href="#top" className="landing-brand">
            <SonarIcon />
            <span>SAMUDRIKA</span>
          </a>

          <div className="landing-nav-links">
            {links.map((link) => (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>

          <div className="landing-nav-right">
            <a href="#contact">Contact</a>
            <button className="btn btn-primary nav-cta" onClick={() => navigate('/dashboard')}>
              Try Samudrika &#8594;
            </button>
          </div>

          <button
            className="mobile-menu-btn"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7H20" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4 12H20" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4 17H20" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </nav>

      {isOpen && (
        <div className="mobile-overlay">
          <div className="mobile-overlay-links">
            {links.map((link) => (
              <a key={link.label} href={link.href} onClick={closeMenu}>
                {link.label}
              </a>
            ))}
            <a href="#contact" onClick={closeMenu}>
              Contact
            </a>
            <button
              className="btn btn-primary"
              onClick={() => {
                closeMenu()
                navigate('/dashboard')
              }}
            >
              Try Samudrika &#8594;
            </button>
          </div>
        </div>
      )}
    </>
  )
}
