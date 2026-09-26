import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { entranceStart, entranceEnd } from '../../utils/motion'

const roles = [
  {
    title: 'Software Development Engineer Intern',
    company: 'Amazon Web Services, ADC BlackMirror',
    location: 'Arlington, VA',
    period: 'May 2025 — Aug 2025',
    tag: 'Tech',
    tagColor: 'purple',
    desc: (
      <>
        Built a lossless compression algorithm for CloudWatch metric exports across 3 air-gapped regions, reducing payloads by up to{' '}
        <strong style={{ color: 'var(--color-ink)', fontWeight: 500 }}>60 GB/day</strong>. Instrumented 13 custom metrics, published a cross-region dashboard, and authored 30+ JUnit tests covering round-trip correctness and edge cases.
      </>
    ),
  },
  {
    title: 'Community Assistant',
    company: 'Office of Residential Life, NJIT',
    location: 'Newark, NJ',
    period: 'Jun 2025 — May 2026',
    tag: 'Leadership',
    tagColor: 'gold',
    desc: (
      <>
        Supervise a <strong style={{ color: 'var(--color-ink)', fontWeight: 500 }}>400-resident</strong> Greek Village complex. Enforce housing policy, conduct regular rounds, author formal incident reports, and design monthly community events on a sub-$1k semester budget.
      </>
    ),
  },
  {
    title: 'Event Coordination Director',
    company: 'Society of Hispanic Professional Engineers, NJIT Chapter',
    location: '',
    period: 'Mar 2024 — May 2025',
    tag: 'Leadership',
    tagColor: 'gold',
    desc: (
      <>
        Planned and executed{' '}
        <strong style={{ color: 'var(--color-ink)', fontWeight: 500 }}>12+ networking and professional development events</strong>, coordinating ~10 volunteers. Increased event participation by 50% and cut per-event prep time by 20% through reusable planning templates.
      </>
    ),
  },
  {
    title: 'Delivery and Lab Technician',
    company: 'Media and Technology Support Services, NJIT',
    location: '',
    period: 'Oct 2022 — May 2026',
    tag: 'Operations',
    tagColor: 'green',
    desc: (
      <>
        Troubleshot AV systems end-to-end across{' '}
        <strong style={{ color: 'var(--color-ink)', fontWeight: 500 }}>100+ lectures annually</strong>. Standardized equipment setup procedures with a team of 5, improving reliability by 40% and cutting repeat call rate by 30%.
      </>
    ),
  },
  {
    title: 'Beach Attendant and Lifeguard',
    company: 'Adamas Building Services',
    location: 'Long Branch, NJ',
    period: 'Jul 2023 — Sep 2023',
    tag: 'Operations',
    tagColor: 'green',
    desc: (
      <>
        Monitored three pools, ran daily chemical checks, and delivered CPR/first aid when needed, safeguarding{' '}
        <strong style={{ color: 'var(--color-ink)', fontWeight: 500 }}>~80 swimmers per shift</strong>. Closed the season with zero accidents.
      </>
    ),
  },
]

export default function Experience({ isVisible }) {
  const sectionRef = useRef(null)
  const tlRef = useRef(null)

  // Fix 1 — set initial hidden state on mount
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    gsap.set(section.querySelectorAll('[data-animate]'), entranceStart({ y: 30, opacity: 0 }))
    gsap.set(section.querySelectorAll('.exp-card'), entranceStart({ y: 40, opacity: 0 }))
    gsap.set(section.querySelectorAll('.timeline-dot'), entranceStart({ scale: 0 }))
  }, [])

  // Animate in once, on first entrance — never reverses or re-triggers
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    if (isVisible && !tlRef.current) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.to(section.querySelectorAll('[data-animate]'), entranceEnd({ y: 0, opacity: 1, stagger: 0.07, duration: 0.7 }))
        .to(section.querySelectorAll('.exp-card'), entranceEnd({ y: 0, opacity: 1, stagger: 0.08, duration: 0.6 }), '-=0.4')
        .to(section.querySelectorAll('.timeline-dot'), entranceEnd({ scale: 1, stagger: 0.08, duration: 0.3, ease: 'back.out(2)' }), '-=0.3')
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
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 className="sr-only">Experience</h2>
            <div
              data-animate
              className="section-intro-title"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(26px, 2.8vw, 36px)',
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
                color: 'var(--color-ink)',
                marginBottom: 16,
              }}
            >
              Where I've
              <br />
              shown
              <br />
              up<span style={{ color: 'var(--color-purple)' }}>.</span>
            </div>
            <p data-animate style={{ color: 'var(--color-muted)', fontSize: 12, lineHeight: 1.85, marginBottom: 24 }}>
              Not just what I built, but where I was, what I did, and how I carried myself doing it.
            </p>
          </div>
          <div data-animate className="section-stat">
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 42,
                letterSpacing: '-0.03em',
                color: 'var(--color-ink)',
                lineHeight: 1,
              }}
            >
              4<span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>+</span>
            </div>
            <div className="eyebrow" style={{ marginTop: 4 }}>Years of experience</div>
          </div>
        </div>

        {/* Right column */}
        <div className="section-right-col exp-right-col" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          {roles.map((role, i) => {
            return (
              <div
                key={role.title}
                className="exp-card"
                style={{
                  flex: 1,
                  padding: '0 48px',
                  borderBottom: i < roles.length - 1 ? '0.5px solid var(--color-line)' : 'none',
                  display: 'flex',
                  gap: 16,
                  alignItems: 'center',
                }}
              >
                <div style={{ paddingTop: 5 }}>
                  <div className="timeline-dot" />
                </div>

                <div style={{ flex: 1 }}>
                  {/* Header row */}
                  <div className="exp-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
                    <div>
                      <div className="exp-title" style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink)', lineHeight: 1.3, marginBottom: 2 }}>
                        {role.title}
                      </div>
                      <div className="eyebrow" style={{ color: 'var(--color-muted)' }}>
                        {role.company}{role.location ? `, ${role.location}` : ''}
                      </div>
                    </div>
                    <div className="exp-meta" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                      <span className={`tag pill-${role.tagColor}`}>{role.tag}</span>
                      <span className="eyebrow" style={{ color: 'var(--color-faint)' }}>{role.period}</span>
                    </div>
                  </div>
                  <p className="exp-desc" style={{ color: 'var(--color-muted)', fontSize: 12, lineHeight: 1.85, marginTop: 8 }}>{role.desc}</p>
                </div>
              </div>
            )
          })}

          {/* Legend */}
          <div
            className="exp-legend"
            style={{
              padding: '14px 48px',
              borderTop: '0.5px solid var(--color-line)',
              display: 'flex',
              gap: 24,
              alignItems: 'center',
            }}
          >
            {[
              { color: 'var(--color-purple)', label: 'Tech' },
              { color: 'var(--color-gold)', label: 'Leadership' },
              { color: 'var(--color-green)', label: 'Operations' },
            ].map((l) => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                <span className="eyebrow">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
