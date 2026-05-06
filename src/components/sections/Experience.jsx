import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const roles = [
  {
    title: 'Software Development Engineer Intern',
    company: 'Amazon Web Services, ADC BlackMirror',
    location: 'Arlington, VA',
    period: 'May 2025 — Aug 2025',
    active: false,
    tag: 'Tech',
    tagColor: 'purple',
    desc: (
      <>
        Built a lossless compression algorithm for CloudWatch metric exports across 3 air-gapped regions, reducing payloads by up to{' '}
        <strong style={{ color: '#0d0d0d', fontWeight: 500 }}>60 GB/day</strong>. Instrumented 13 custom metrics, published a cross-region dashboard, and authored 30+ JUnit tests covering round-trip correctness and edge cases.
      </>
    ),
  },
  {
    title: 'Community Assistant',
    company: 'Office of Residential Life, NJIT',
    location: 'Newark, NJ',
    period: 'Jun 2025 — Present',
    active: true,
    tag: 'Leadership',
    tagColor: 'gold',
    desc: (
      <>
        Supervise a <strong style={{ color: '#0d0d0d', fontWeight: 500 }}>400-resident</strong> Greek Village complex. Enforce housing policy, conduct regular rounds, author formal incident reports, and design monthly community events on a sub-$1k semester budget.
      </>
    ),
  },
  {
    title: 'Event Coordination Director',
    company: 'Society of Hispanic Professional Engineers, NJIT Chapter',
    location: '',
    period: 'Mar 2024 — May 2025',
    active: false,
    tag: 'Leadership',
    tagColor: 'gold',
    desc: (
      <>
        Planned and executed{' '}
        <strong style={{ color: '#0d0d0d', fontWeight: 500 }}>12+ networking and professional development events</strong>, coordinating ~10 volunteers. Increased event participation by 50% and cut per-event prep time by 20% through reusable planning templates.
      </>
    ),
  },
  {
    title: 'Delivery and Lab Technician',
    company: 'Media and Technology Support Services, NJIT',
    location: '',
    period: 'Oct 2022 — Present',
    active: true,
    tag: 'Operations',
    tagColor: 'green',
    desc: (
      <>
        Troubleshot AV systems end-to-end across{' '}
        <strong style={{ color: '#0d0d0d', fontWeight: 500 }}>100+ lectures annually</strong>. Standardized equipment setup procedures with a team of 5, improving reliability by 40% and cutting repeat call rate by 30%.
      </>
    ),
  },
  {
    title: 'Beach Attendant and Lifeguard',
    company: 'Adamas Building Services',
    location: 'Long Branch, NJ',
    period: 'Jul 2023 — Sep 2023',
    active: false,
    tag: 'Operations',
    tagColor: 'green',
    desc: (
      <>
        Monitored three pools, ran daily chemical checks, and delivered CPR/first aid when needed, safeguarding{' '}
        <strong style={{ color: '#0d0d0d', fontWeight: 500 }}>~80 swimmers per shift</strong>. Closed the season with zero accidents.
      </>
    ),
  },
]

const tagColors = {
  purple: { bg: 'rgba(127,119,221,0.12)', border: 'rgba(127,119,221,0.3)', text: '#534AB7' },
  gold: { bg: 'rgba(212,175,55,0.12)', border: 'rgba(212,175,55,0.4)', text: '#9a7d1a' },
  green: { bg: 'rgba(29,158,117,0.12)', border: 'rgba(29,158,117,0.3)', text: '#1D9E75' },
}

export default function Experience({ isVisible }) {
  const sectionRef = useRef(null)
  const tlRef = useRef(null)

  // Fix 1 — set initial hidden state on mount
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    gsap.set(section.querySelectorAll('[data-animate]'), { y: 30, opacity: 0 })
    gsap.set(section.querySelectorAll('.exp-card'), { y: 40, opacity: 0 })
    gsap.set(section.querySelectorAll('.timeline-dot'), { scale: 0 })
  }, [])

  // Fix 2 — animate in once, never reverse
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    if (isVisible && !tlRef.current) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.to(section.querySelectorAll('[data-animate]'), { y: 0, opacity: 1, stagger: 0.07, duration: 0.7 })
        .to(section.querySelectorAll('.exp-card'), { y: 0, opacity: 1, stagger: 0.08, duration: 0.6 }, '-=0.4')
        .to(section.querySelectorAll('.timeline-dot'), { scale: 1, stagger: 0.08, duration: 0.3, ease: 'back.out(2)' }, '-=0.3')
      tlRef.current = tl
    }
  }, [isVisible])

  return (
    <section
      ref={sectionRef}
      className="snap-section"
      style={{ background: '#f5f2ec', borderBottom: '0.5px solid #d4cfc5' }}
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
          style={{
            padding: '48px 32px 40px',
            borderRight: '0.5px solid #d4cfc5',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              data-animate
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 'clamp(26px, 2.8vw, 36px)',
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
                color: '#0d0d0d',
                marginBottom: 16,
              }}
            >
              Where I've
              <br />
              shown
              <br />
              up<span style={{ color: '#7F77DD' }}>.</span>
            </div>
            <p data-animate style={{ color: '#666', fontSize: 12, lineHeight: 1.85, marginBottom: 24 }}>
              Not just what I built, but where I was, what I did, and how I carried myself doing it.
            </p>
          </div>
          <div data-animate>
            <div
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 42,
                letterSpacing: '-0.03em',
                color: '#0d0d0d',
                lineHeight: 1,
              }}
            >
              4<span style={{ color: '#D4AF37', fontWeight: 600 }}>+</span>
            </div>
            <div className="eyebrow" style={{ marginTop: 4 }}>Years of experience</div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          {roles.map((role, i) => {
            const tc = tagColors[role.tagColor]
            return (
              <div
                key={role.title}
                className="exp-card"
                style={{
                  flex: 1,
                  padding: '0 48px',
                  borderBottom: i < roles.length - 1 ? '0.5px solid #d4cfc5' : 'none',
                  display: 'flex',
                  gap: 16,
                  alignItems: 'center',
                }}
              >
                {/* Fix 6 — all left dots are neutral #d4cfc5, purely decorative */}
                <div style={{ paddingTop: 5 }}>
                  <div
                    className="timeline-dot"
                    style={{ background: '#d4cfc5' }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#0d0d0d', lineHeight: 1.3, marginBottom: 2 }}>
                        {role.title}
                      </div>
                      <div className="eyebrow" style={{ color: '#666' }}>
                        {role.company}{role.location ? `, ${role.location}` : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '2px 8px',
                          borderRadius: 20,
                          fontSize: 9,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
                          background: tc.bg,
                          border: `0.5px solid ${tc.border}`,
                          color: tc.text,
                        }}
                      >
                        {role.tag}
                      </span>
                      <span className="eyebrow" style={{ color: '#bbbbbb' }}>{role.period}</span>
                    </div>
                  </div>
                  <p style={{ color: '#666', fontSize: 12, lineHeight: 1.85, marginTop: 8 }}>{role.desc}</p>
                </div>
              </div>
            )
          })}

          {/* Legend */}
          <div
            style={{
              padding: '14px 48px',
              borderTop: '0.5px solid #d4cfc5',
              display: 'flex',
              gap: 24,
              alignItems: 'center',
            }}
          >
            {[
              { color: '#7F77DD', label: 'Tech' },
              { color: '#D4AF37', label: 'Leadership' },
              { color: '#1D9E75', label: 'Operations' },
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
