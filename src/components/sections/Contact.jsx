import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const links = [
  { label: 'Email', value: 'iaa48@njit.edu', href: 'mailto:iaa48@njit.edu' },
  { label: 'LinkedIn', value: 'linkedin.com/in/israel-alcantara', href: 'https://linkedin.com/in/israel-alcantara' },
  { label: 'GitHub', value: 'github.com/iaalcantara17', href: 'https://github.com/iaalcantara17' },
]

export default function Contact({ isVisible }) {
  const sectionRef = useRef(null)
  const tlRef = useRef(null)

  // Fix 1 — set initial hidden state on mount
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    gsap.set(section.querySelectorAll('.headline-char'), { y: 40, opacity: 0 })
    gsap.set(section.querySelectorAll('[data-animate]'), { y: 20, opacity: 0 })
    gsap.set(section.querySelectorAll('.link-row'), { x: 30, opacity: 0 })
  }, [])

  // Fix 2 — animate in once, never reverse
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    if (isVisible && !tlRef.current) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.to(section.querySelectorAll('.headline-char'), { y: 0, opacity: 1, stagger: 0.04, duration: 0.6 })
        .to(section.querySelectorAll('[data-animate]'), { y: 0, opacity: 1, stagger: 0.07, duration: 0.6 }, '-=0.3')
        .to(section.querySelectorAll('.link-row'), { x: 0, opacity: 1, stagger: 0.1, duration: 0.6 }, '-=0.2')
      tlRef.current = tl
    }
  }, [isVisible])

  return (
    <section
      ref={sectionRef}
      className="snap-section"
      style={{ background: '#f5f2ec', display: 'flex', flexDirection: 'column' }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          flex: 1,
          paddingTop: 56,
        }}
      >
        {/* Left column */}
        <div
          style={{
            padding: '60px 48px 40px',
            borderRight: '0.5px solid #d4cfc5',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            {/* Headline with letter reveal */}
            <div
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 'clamp(40px, 5vw, 52px)',
                letterSpacing: '-0.03em',
                lineHeight: 0.95,
                color: '#0d0d0d',
                marginBottom: 32,
              }}
              aria-label="Let's talk."
            >
              {"Let's".split('').map((c, i) => (
                <span key={i} className="headline-char" style={{ display: 'inline-block' }}>{c}</span>
              ))}
              <br />
              {'talk.'.split('').map((c, i) => (
                <span key={i} className="headline-char" style={{ display: 'inline-block', color: c === '.' ? '#7F77DD' : '#0d0d0d' }}>{c}</span>
              ))}
            </div>

            <div data-animate style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
              <p style={{ color: '#666', fontSize: 13, lineHeight: 1.9 }}>
                I'm still growing. But I know who I am, and I show up as exactly that. If that's someone you want on your team, I'd like to hear from you.
              </p>
              <p style={{ color: '#666', fontSize: 13, lineHeight: 1.9 }}>
                Whether it's a role, a conversation, or just something worth talking about, my inbox is open.
              </p>
            </div>
          </div>

          {/* Availability */}
          <div data-animate style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="availability-dot" />
            <span className="eyebrow" style={{ color: '#1D9E75' }}>Open to opportunities — May 2026</span>
          </div>
        </div>

        {/* Right column */}
        <div
          style={{
            padding: '60px 48px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {links.map((l, i) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith('mailto') ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="link-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px 0',
                  borderBottom: '0.5px solid #d4cfc5',
                  textDecoration: 'none',
                  cursor: 'none',
                  transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                <div>
                  <div className="eyebrow" style={{ marginBottom: 3 }}>{l.label}</div>
                  <div style={{ fontSize: 13, color: '#0d0d0d', fontFamily: "'Helvetica Neue', Helvetica, sans-serif" }}>{l.value}</div>
                </div>
                <span style={{ color: '#7F77DD', fontSize: 18, lineHeight: 1 }}>↗</span>
              </a>
            ))}

            {/* Resume download */}
            <div style={{ marginTop: 32 }}>
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="resume-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 24px',
                  background: '#0d0d0d',
                  borderRadius: 4,
                  textDecoration: 'none',
                  cursor: 'none',
                  transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                <span style={{ fontSize: 12, color: '#f5f2ec', fontFamily: "'Helvetica Neue', Helvetica, sans-serif", letterSpacing: '0.06em' }}>
                  Download Resume
                </span>
                <span className="pill pill-gold" style={{ fontSize: 9, padding: '2px 6px' }}>PDF</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: '0.5px solid #d4cfc5',
          padding: '16px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span className="eyebrow" style={{ color: '#bbbbbb' }}>Israel Alcántara, 2026</span>
        <span className="eyebrow" style={{ color: '#bbbbbb' }}>Built with craft.</span>
      </div>
    </section>
  )
}
