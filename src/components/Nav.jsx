import { useEffect, useState } from 'react'
import { sections } from '../data/sections'
import { useScrollLock } from '../hooks/useScrollLock'

// section = index in the full registry, so links stay correct if sections reorder
const links = sections
  .map(({ key, label, inNav }, section) => ({ key, label, inNav, section }))
  .filter((l) => l.inNav)

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
  useScrollLock(isMenuOpen)

  const handleNavigate = (section) => {
    setIsMenuOpen(false)
    onNavigate(section)
  }

  return (
    <nav className={`site-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="site-nav-inner">
        <button
          onClick={() => handleNavigate(0)}
          aria-label="Israel Alcántara"
          style={{ fontFamily: 'var(--font-serif)', fontSize: 15, letterSpacing: '-0.01em', color: 'var(--color-ink)', background: 'none', border: 'none', cursor: 'none' }}
        >
          I.A
        </button>

        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {links.map((l) => (
            <button
              key={l.key}
              onClick={() => onNavigate(l.section)}
              style={{ background: 'none', border: 'none', cursor: 'none', color: 'var(--color-muted)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)' }}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => window.open('/Resume_Israel_Alcantara.pdf', '_blank')}
            style={{ border: '0.5px solid var(--color-line)', borderRadius: 2, padding: '6px 14px', background: 'none', cursor: 'none', color: 'var(--color-ink)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)' }}
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
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none" style={{ color: 'var(--color-ink)' }}>
              {isMenuOpen ? (
                <>
                  <line x1="1" y1="1" x2="19" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  <line x1="19" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <line x1="0" y1="1" x2="20" y2="1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  <line x1="0" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  <line x1="0" y1="13" x2="20" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
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
              <button key={l.key} onClick={() => handleNavigate(l.section)}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
