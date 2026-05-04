import { useEffect, useState } from 'react'

const links = [
  { label: 'About', section: 1 },
  { label: 'Experience', section: 3 },
  { label: 'Projects', section: 4 },
  { label: 'Life', section: 5 },
]

export default function Nav({ containerRef, onNavigate }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const container = containerRef?.current
    if (!container) return
    const onScroll = () => setScrolled(container.scrollTop > 20)
    container.addEventListener('scroll', onScroll)
    return () => container.removeEventListener('scroll', onScroll)
  }, [containerRef])

  return (
    <nav className={`site-nav ${scrolled ? 'scrolled' : ''}`}>
      <button
        onClick={() => onNavigate(0)}
        style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 15, letterSpacing: '-0.01em', color: '#0d0d0d', background: 'none', border: 'none', cursor: 'none' }}
      >
        I.A
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
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

      <button
        onClick={() => window.open('/resume.pdf', '_blank')}
        className="resume-btn"
        style={{ border: '0.5px solid #d4cfc5', borderRadius: 2, padding: '6px 14px', background: 'none', cursor: 'none', color: '#0d0d0d', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
      >
        Resume
      </button>
    </nav>
  )
}
