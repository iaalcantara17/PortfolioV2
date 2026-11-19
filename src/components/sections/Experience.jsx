import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { entranceStart, entranceEnd } from '../../utils/motion'

// Each category's tag color (the .pill-* classes in index.css)
const tagPill = { Tech: 'pill-purple', Leadership: 'pill-blue', Operations: 'pill-rust' }

// The 5 roles most relevant to SWE, cloud, IT and project management work, newest
// first by end date. Titles, companies, places and dates follow Israel's master
// profile (LinkedIn, Handshake and the resumes match it); each description is that
// role's master bullets as one paragraph, kept short enough that all 5 fit one screen.
const roles = [
  {
    title: 'Geek Squad Agent',
    company: 'Best Buy',
    location: 'Secaucus, NJ',
    period: 'Nov 2026 to Present',
    tag: 'Tech',
    desc: (
      <>
        Serve as the{' '}
        <strong style={{ color: 'var(--color-ink)', fontWeight: 500 }}>first point of contact</strong> for customers' computer, phone, and device issues, handling check-in and checkout with detailed notes and repair time estimates. Set up new devices, advise customers on whether to repair or replace, and partner with other agents on complex repairs while completing Best Buy's certified training courses.
      </>
    ),
  },
  {
    title: 'Community Assistant, Office of Residential Life',
    company: 'NJIT',
    location: 'Newark, NJ',
    period: 'Jun 2025 to May 2026',
    tag: 'Leadership',
    desc: (
      <>
        Supervised a <strong style={{ color: 'var(--color-ink)', fontWeight: 500 }}>400-resident</strong> Greek Village complex, running regular rounds, enforcing housing policy, and resolving roommate and conduct issues to finish the term with zero major violations. Planned and ran all 8 to 12 community events for the building each semester, from wellness workshops to study groups, on a $150 semester budget.
      </>
    ),
  },
  {
    title: 'Delivery Technician & Lab Technician',
    company: 'NJIT Media and Technology Support Services (MTSS)',
    location: 'Newark, NJ',
    period: 'Sep 2022 to May 2026',
    tag: 'Operations',
    desc: (
      <>
        Worked with a team of 5 technicians to standardize equipment setup and pre-lecture readiness checks across{' '}
        <strong style={{ color: 'var(--color-ink)', fontWeight: 500 }}>100+ lectures a year</strong>, improving estimated equipment reliability by 40%. Diagnosed and fixed AV problems with projectors, Crestron control systems, and wireless microphones, cutting the repeat-call rate by an estimated 30%.
      </>
    ),
  },
  {
    title: 'Software Development Engineer Intern',
    company: 'Amazon Web Services (AWS)',
    location: 'Arlington, VA',
    period: 'May 2025 to Aug 2025',
    tag: 'Tech',
    desc: (
      <>
        Designed and shipped a lossless consecutive-duplicate compression algorithm for the BlackMirror metrics pipeline (Java, XML), cutting export payloads by an average of 38 GB a day and up to{' '}
        <strong style={{ color: 'var(--color-ink)', fontWeight: 500 }}>60 GB a day</strong> across 3 air-gapped regions. Instrumented 13 custom CloudWatch metrics, built a matching decompressor, wrote 30+ JUnit tests for round-trip correctness, and published a cross-region dashboard.
      </>
    ),
  },
  {
    title: 'Event Coordination Director',
    company: 'SHPE, NJIT Chapter',
    location: 'Newark, NJ',
    period: 'Mar 2024 to May 2025',
    tag: 'Leadership',
    desc: (
      <>
        Planned and ran{' '}
        <strong style={{ color: 'var(--color-ink)', fontWeight: 500 }}>12+ networking and professional development events</strong>, leading a team of about 10 student volunteers and building floor plans, time-blocked agendas, and budgets for the larger ones. Grew opening-event attendance from about 60 to 70 people up to 150, and average event attendance from 30 to 50 up to 50 to 80.
      </>
    ),
  },
]

export default function Experience({ isVisible }) {
  const sectionRef = useRef(null)
  const tlRef = useRef(null)

  // Hidden until the first entrance below: the starting state, set on mount
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
          style={{
            padding: '48px 32px 40px',
            borderRight: '0.5px solid var(--color-line)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            {/* The visible title is the section's heading; the screen-reader prefix
                keeps its nav label ("Experience") first when navigating by heading */}
            <h2
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
              <span className="sr-only">Experience: </span>
              Where I've{' '}
              <br />
              shown{' '}
              <br />
              up<span style={{ color: 'var(--color-purple)' }}>.</span>
            </h2>
            <p data-animate style={{ color: 'var(--color-muted)', fontSize: 12, lineHeight: 1.85, marginBottom: 24 }}>
              What I did at each stop, and what came of it.
            </p>
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
                      <h3 className="exp-title" style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink)', lineHeight: 1.3, marginBottom: 2 }}>
                        {role.title}
                      </h3>
                      <div className="eyebrow" style={{ color: 'var(--color-muted)' }}>
                        {role.company}{role.location ? `, ${role.location}` : ''}
                      </div>
                    </div>
                    <div className="exp-meta" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                      <span className={`tag ${tagPill[role.tag]}`}>{role.tag}</span>
                      <span className="eyebrow" style={{ color: 'var(--color-faint)' }}>{role.period}</span>
                    </div>
                  </div>
                  <p className="exp-desc" style={{ color: 'var(--color-muted)', fontSize: 12, lineHeight: 1.85, marginTop: 8 }}>{role.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
