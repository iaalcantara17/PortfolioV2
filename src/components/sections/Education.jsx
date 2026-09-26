import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import StatusPill from '../StatusPill'
import { entranceStart, entranceEnd } from '../../utils/motion'
import njitLogo from '../../assets/logos/njit.png'
import montclairLogo from '../../assets/logos/montclair.png'

// Logos show in their official colors, a deliberate exception to the token palette.
// Dates are static text, updated by hand.
const schools = [
  {
    degree: 'Bachelor of Science in Computer Science',
    school: 'New Jersey Institute of Technology',
    college: 'Ying Wu College of Computing',
    status: 'earned',
    period: 'Sep 2022 — May 2026',
    logo: { src: njitLogo, width: 192, height: 192 },
  },
  {
    degree: 'Master of Business Administration',
    school: 'Montclair State University',
    college: 'Feliciano School of Business',
    status: 'in-progress',
    period: 'Aug 2026 — Expected Fall 2028',
    logo: { src: montclairLogo, width: 165, height: 192 },
  },
]

export default function Education({ isVisible }) {
  const sectionRef = useRef(null)
  const tlRef = useRef(null)

  // Fix 1 — set initial hidden state on mount
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    gsap.set(section.querySelectorAll('[data-animate]'), entranceStart({ y: 30, opacity: 0 }))
    gsap.set(section.querySelectorAll('.edu-card'), entranceStart({ y: 40, opacity: 0 }))
  }, [])

  // Animate in once, on first entrance — never reverses or re-triggers
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    if (isVisible && !tlRef.current) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.to(section.querySelectorAll('[data-animate]'), entranceEnd({ y: 0, opacity: 1, stagger: 0.07, duration: 0.7 }))
        .to(section.querySelectorAll('.edu-card'), entranceEnd({ y: 0, opacity: 1, stagger: 0.12, duration: 0.7 }), '-=0.4')
      tlRef.current = tl
    }
  }, [isVisible])

  return (
    <section
      ref={sectionRef}
      className="page-section"
      style={{ background: 'var(--color-paper)', borderBottom: '0.5px solid var(--color-line)' }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          height: '100%',
          paddingTop: 56,
        }}
      >
        {/* Left column */}
        <div
          className="section-left-col"
          style={{
            padding: '48px 32px 40px',
            borderRight: '0.5px solid var(--color-line)',
          }}
        >
          <div
            data-animate
            className="section-intro-title"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(26px, 2.8vw, 36px)',
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
              color: 'var(--color-ink)',
            }}
          >
            Still
            <br />
            building.
            <br />
            Still
            <br />
            learning<span style={{ color: 'var(--color-purple)' }}>.</span>
          </div>
        </div>

        {/* Right column */}
        <div
          className="section-right-col edu-right-col"
          style={{ padding: '32px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}
        >
          {schools.map((s) => (
            <div
              key={s.school}
              className="edu-card"
              style={{
                display: 'grid',
                gridTemplateColumns: '96px 1fr auto',
                alignItems: 'center',
                gap: 28,
                background: 'var(--color-surface)',
                borderRadius: 4,
                padding: '28px 32px',
                border: '0.5px solid var(--color-line)',
              }}
            >
              <div className="edu-logo" style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={s.logo.src}
                  width={s.logo.width}
                  height={s.logo.height}
                  alt=""
                  loading="lazy"
                  style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%', display: 'block' }}
                />
              </div>

              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 22,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                    color: 'var(--color-ink)',
                    marginBottom: 8,
                  }}
                >
                  {s.degree}
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink)', lineHeight: 1.3, marginBottom: 2 }}>
                  {s.school}
                </div>
                <div className="eyebrow" style={{ color: 'var(--color-muted)' }}>{s.college}</div>
              </div>

              <div className="edu-meta" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <StatusPill status={s.status} />
                <span className="eyebrow" style={{ color: 'var(--color-faint)', whiteSpace: 'nowrap' }}>{s.period}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
