import { useEffect, useRef, useState } from 'react'
import { sections } from '../data/sections'
import { useScrollLock } from '../hooks/useScrollLock'
import { trapFocus } from '../utils/focusTrap'
import { inertOutside } from '../utils/inertOutside'
import { trackResumeDownload } from '../utils/trackResumeDownload'
import ThemeToggle from './ThemeToggle'

// section = index in the full registry, so links stay correct if sections reorder
const links = sections
  .map(({ key, anchor, label, inNav }, section) => ({ key, anchor, label, inNav, section }))
  .filter((l) => l.inNav)

export default function Nav({ containerRef, onNavigate }) {
  const [scrolled, setScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navRef = useRef(null)
  const toggleRef = useRef(null)
  const releasePageRef = useRef(null)

  useEffect(() => {
    const container = containerRef?.current
    if (!container) return
    const onScroll = () => setScrolled(container.scrollTop > 20)
    container.addEventListener('scroll', onScroll)
    return () => container.removeEventListener('scroll', onScroll)
  }, [containerRef])

  // Lock background scroll while the mobile menu is open
  useScrollLock(isMenuOpen)

  // While the mobile menu is open: Escape closes it and puts focus back on the
  // toggle, and Tab stays inside the nav instead of reaching the page under the menu
  useEffect(() => {
    if (!isMenuOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false)
        toggleRef.current?.focus()
      }
      trapFocus(e, navRef.current)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isMenuOpen])

  // While the mobile menu is open, everything outside the nav is inert, so a screen
  // reader stays in the menu the way Tab does
  useEffect(() => {
    if (!isMenuOpen) return
    const release = inertOutside(navRef.current)
    releasePageRef.current = release
    return () => {
      release()
      releasePageRef.current = null
    }
  }, [isMenuOpen])

  const handleNavigate = (section) => {
    // A menu link moves focus into the section it jumps to, which an inert page
    // would refuse, so the page comes back first instead of when the menu unmounts
    releasePageRef.current?.()
    setIsMenuOpen(false)
    onNavigate(section)
  }

  // The nav items are real links to each section's #anchor, so they can be crawled,
  // copied and opened in a new tab. A plain click goes through onNavigate instead of
  // the browser's jump (smooth scroll, focus, closing the menu); a modified click is
  // left to the browser.
  const followLink = (e, section) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    handleNavigate(section)
  }

  return (
    <nav ref={navRef} className={`site-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="site-nav-inner">
        <a
          href={`#${sections[0].anchor}`}
          className="hit-area"
          onClick={(e) => followLink(e, 0)}
          style={{ fontFamily: 'var(--font-serif)', fontSize: 15, letterSpacing: '-0.01em', color: 'var(--color-ink)', textDecoration: 'none' }}
        >
          I.A.
        </a>

        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {links.map((l) => (
            <a
              key={l.key}
              href={`#${l.anchor}`}
              onClick={(e) => followLink(e, l.section)}
              style={{ color: 'var(--color-muted)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', textDecoration: 'none' }}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ThemeToggle />
          <a
            href="/Resume_Israel_Alcantara.pdf"
            target="_blank"
            rel="noopener noreferrer"
            onClick={trackResumeDownload}
            style={{ border: '0.5px solid var(--color-line)', borderRadius: 2, padding: '6px 14px', background: 'none', color: 'var(--color-ink)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', textDecoration: 'none' }}
          >
            Resume
            <span className="sr-only"> (opens in a new tab)</span>
          </a>

          <button
            ref={toggleRef}
            className="hamburger-btn hit-area"
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
              <a key={l.key} href={`#${l.anchor}`} onClick={(e) => followLink(e, l.section)}>
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
