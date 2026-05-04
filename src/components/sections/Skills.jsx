import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const categories = [
  {
    name: 'Languages',
    items: [
      { label: 'Java', type: 'purple' },
      { label: 'Python', type: 'purple' },
      { label: 'C/C++', type: 'purple' },
      { label: 'Kotlin', type: 'purple' },
      { label: 'JavaScript', type: 'purple' },
      { label: 'TypeScript', type: 'purple' },
      { label: 'Bash/Shell', type: 'plain' },
      { label: 'SQL', type: 'plain' },
      { label: 'HTML', type: 'plain' },
      { label: 'CSS', type: 'plain' },
    ],
  },
  {
    name: 'Frameworks and Libraries',
    items: [
      { label: 'Node.js', type: 'purple' },
      { label: 'Express', type: 'purple' },
      { label: 'React Native', type: 'purple' },
      { label: 'Pandas', type: 'plain' },
      { label: 'NumPy', type: 'plain' },
      { label: 'Scikit-learn', type: 'plain' },
      { label: 'Matplotlib', type: 'plain' },
      { label: 'Plotly', type: 'plain' },
      { label: 'Seaborn', type: 'plain' },
    ],
  },
  {
    name: 'Cloud and DevOps',
    items: [
      { label: 'AWS (CloudWatch)', type: 'gold' },
      { label: 'Linux', type: 'gold' },
      { label: 'Git', type: 'gold' },
    ],
  },
  {
    name: 'Databases',
    items: [
      { label: 'Supabase', type: 'green' },
      { label: 'MySQL', type: 'green' },
      { label: 'MongoDB', type: 'green' },
    ],
  },
]

export default function Skills({ isVisible }) {
  const sectionRef = useRef(null)
  const tlRef = useRef(null)

  // Fix 1 — set initial hidden state on mount
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    gsap.set(section.querySelectorAll('[data-animate]'), { y: 30, opacity: 0 })
    gsap.set(section.querySelectorAll('.skill-pill'), { y: 10, opacity: 0, scale: 0.92 })
    gsap.set(section.querySelectorAll('.category-line'), { scaleX: 0, transformOrigin: 'left center' })
  }, [])

  // Fix 2 — play/reverse
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    if (isVisible && !tlRef.current) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.to(section.querySelectorAll('[data-animate]'), { y: 0, opacity: 1, stagger: 0.07, duration: 0.7 })
        .to(section.querySelectorAll('.category-line'), { scaleX: 1, stagger: 0.1, duration: 0.5, ease: 'power2.out' }, '-=0.4')
        .to(section.querySelectorAll('.skill-pill'), { y: 0, opacity: 1, scale: 1, stagger: 0.025, duration: 0.35, ease: 'power2.out' }, '-=0.3')
      tlRef.current = tl
    } else if (tlRef.current) {
      if (isVisible) tlRef.current.play()
      else tlRef.current.reverse()
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
                fontSize: 'clamp(28px, 3vw, 36px)',
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
                color: '#0d0d0d',
                marginBottom: 16,
              }}
            >
              What I{' '}
              <br />
              work{' '}
              <br />
              with<span style={{ color: '#7F77DD' }}>.</span>
            </div>

            <p data-animate style={{ color: '#666', fontSize: 12, lineHeight: 1.85, marginBottom: 24 }}>
              Tools I've used in production, in class, and on projects I actually care about.
            </p>
          </div>

          {/* Stat — 25+ already has gold suffix */}
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
              25<span style={{ color: '#D4AF37' }}>+</span>
            </div>
            <div className="eyebrow" style={{ marginTop: 4 }}>Technologies</div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {categories.map((cat, ci) => (
            <div
              key={cat.name}
              className="skill-row"
              style={{
                padding: '24px 48px',
                borderBottom: ci < categories.length - 1 ? '0.5px solid #d4cfc5' : 'none',
                flex: ci < 2 ? '1.2' : '0.8',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <span className="eyebrow category-line" style={{ display: 'block' }}>{cat.name}</span>
                <div className="category-line" style={{ flex: 1, height: '0.5px', background: '#d4cfc5' }} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {cat.items.map((item) => (
                  <span key={item.label} className={`pill skill-pill pill-${item.type}`}>
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div
            style={{
              padding: '16px 48px',
              borderTop: '0.5px solid #d4cfc5',
              display: 'flex',
              gap: 24,
              alignItems: 'center',
            }}
          >
            {[
              { color: '#7F77DD', label: 'Strong' },
              { color: '#D4AF37', label: 'Cloud/DevOps' },
              { color: '#1D9E75', label: 'Databases' },
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
