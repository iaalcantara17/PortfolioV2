import { useEffect, useState } from 'react'

const links = [
  { label: 'About', section: 1 },
  { label: 'Experience', section: 3 },
  { label: 'Projects', section: 4 },
  { label: 'Life', section: 5 },
  { label: 'Contact', section: 6 },
]

export default function Nav({ containerRef, onNavigate }) {
  const [scrolled, setScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const container = containerRef?.current
    if (!container) return
    const onScroll = () => setScrolled(container.scrollTop > 20)
    container.addEventListener('scroll', onScroll)
    return () => container.removeEventListener('scroll', onScroll)
  }, [containerRef])

  // Lock background scroll while the mobile menu is open
  useEffect(() => {
    if (!isMenuOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [isMenuOpen])

  const handleNavigate = (section) => {
    setIsMenuOpen(false)
    onNavigate(section)
  }

  return (
    <nav className={`site-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="site-nav-inner">
        <button
          onClick={() => handleNavigate(0)}
          style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 15, letterSpacing: '-0.01em', color: '#0d0d0d', background: 'none', border: 'none', cursor: 'none' }}
        >
          I.A
        </button>

        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {links.map((l) => (
            <button
              key={l.label}
              onClick={() => onNavigate(l.section)}
              style={{ background: 'none', border: 'none', cursor: 'none', color: '#666666', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => window.open('/resume.pdf', '_blank')}
            className="resume-btn"
            style={{ border: '0.5px solid #d4cfc5', borderRadius: 2, padding: '6px 14px', background: 'none', cursor: 'none', color: '#0d0d0d', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            Resume
          </button>

          <button
            className="hamburger-btn"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            style={{ background: 'none', border: 'none', padding: 4 }}
          >
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
              {isMenuOpen ? (
                <>
                  <line x1="1" y1="1" x2="19" y2="13" stroke="#0d0d0d" strokeWidth="1.4" strokeLinecap="round" />
                  <line x1="19" y1="1" x2="1" y2="13" stroke="#0d0d0d" strokeWidth="1.4" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <line x1="0" y1="1" x2="20" y2="1" stroke="#0d0d0d" strokeWidth="1.4" strokeLinecap="round" />
                  <line x1="0" y1="7" x2="20" y2="7" stroke="#0d0d0d" strokeWidth="1.4" strokeLinecap="round" />
                  <line x1="0" y1="13" x2="20" y2="13" stroke="#0d0d0d" strokeWidth="1.4" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-links">
            {links.map((l) => (
              <button key={l.label} onClick={() => handleNavigate(l.section)}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
