import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import SpotifyWidget from '../SpotifyWidget'

const interestTiers = [
  { pills: ['Music', 'Fashion', 'Photography', 'Basketball'], type: 'purple' },
  { pills: ['Gym', 'Running', 'Hiking'], type: 'gold' },
  { pills: ['Drawing', 'Piano'], type: 'plain' },
]

const bodyParagraphs = [
  "I'm a CS grad from NJIT and an AWS alum, but that's just the resume talking. What actually drives me is craft. Not just in code, but in everything I do. How I dress, how I show up, how I approach a problem. The details matter to me, and they always have.",
  "I was raised with a clear set of values. Family, community, hard work, showing up. That's not something I learned in a classroom. It's just how I was brought up, and it shapes how I work, how I treat people, and what I hold myself to.",
  "Music has been with me through all of it. It sets the tone for whatever I'm doing, certain songs are tied to moments I'll never forget, and it connects me to who I am. I pick up a camera when something is worth capturing, still learning what my eye is drawn to. I play basketball and follow it closely. Outside of that, I stay active, whether that's the gym, running, or getting outside. I push myself when I'm locked in and I know when to ease up.",
  "I'm still growing. But I know who I am, and I show up as exactly that.",
]

// Fix 9 — stats with separate num/suffix
const stats = [
  { num: '2', suffix: '×', label: 'Languages' },
  { num: '10', suffix: 'K', label: 'Race finished' },
]

export default function About({ isVisible }) {
  const sectionRef = useRef(null)
  const tlRef = useRef(null)

  // Fix 1 — set initial hidden state on mount
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    gsap.set(section.querySelectorAll('[data-animate]'), { y: 30, opacity: 0 })
    gsap.set(section.querySelectorAll('.body-para'), { y: 20, opacity: 0 })
    gsap.set(section.querySelectorAll('.interest-pill'), { y: 12, opacity: 0, scale: 0.9 })
  }, [])

  // Fix 2 — play/reverse
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    if (isVisible && !tlRef.current) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.to(section.querySelectorAll('[data-animate]'), { y: 0, opacity: 1, stagger: 0.06, duration: 0.7 })
        .to(section.querySelectorAll('.body-para'), { y: 0, opacity: 1, stagger: 0.08, duration: 0.6 }, '-=0.3')
        .to(section.querySelectorAll('.interest-pill'), { y: 0, opacity: 1, scale: 1, stagger: 0.05, duration: 0.4 }, '-=0.2')
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
          gridTemplateColumns: '1fr 1fr',
          height: '100%',
          paddingTop: 56,
        }}
      >
        {/* Left column */}
        <div
          style={{
            padding: '48px 48px 40px',
            borderRight: '0.5px solid #d4cfc5',
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
            overflowY: 'auto',
          }}
        >
          <span className="eyebrow" data-animate>Who I Am</span>

          {/* Pull quote */}
          <div className="pull-quote" data-animate>
            I'm not just someone who builds things.
            <br />
            I'm someone who{' '}
            <em style={{ color: '#7F77DD' }}>notices</em> things.
          </div>

          {/* Body paragraphs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {bodyParagraphs.map((p, i) => (
              <p
                key={i}
                className="body-para"
                style={{ color: '#666', fontSize: 13, lineHeight: 1.9 }}
              >
                {p}
              </p>
            ))}
          </div>

          {/* Gold divider */}
          <div data-animate style={{ width: 32, height: 1, background: '#D4AF37' }} />

          {/* Interests */}
          <div>
            <span className="eyebrow" data-animate>Outside the Screen</span>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {interestTiers.map((tier) => (
                <div key={tier.type} style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {tier.pills.map((p) => (
                    <span key={p} className={`pill interest-pill pill-${tier.type}`}>
                      {p}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <SpotifyWidget />
        </div>

        {/* Right column */}
        <div
          style={{
            padding: '48px 48px 40px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* Main photo */}
          <div
            className="photo-placeholder tilt-card"
            style={{
              flex: 1,
              maxHeight: 340,
              borderRadius: 4,
              border: '0.5px solid #d4cfc5',
              position: 'relative',
              cursor: 'none',
            }}
          >
            <span>Main Portrait Photo</span>
            <div
              className="eyebrow"
              style={{
                position: 'absolute',
                bottom: 10,
                left: 10,
                background: '#f5f2ec',
                padding: '3px 8px',
                borderRadius: 20,
                border: '0.5px solid #d4cfc5',
                color: '#666',
              }}
            >
              Canon SL3
            </div>
          </div>

          {/* Three thumbnails */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {['City', 'Nature', 'Friends'].map((label) => (
              <div
                key={label}
                className="photo-placeholder tilt-card"
                style={{
                  aspectRatio: '1/1',
                  borderRadius: 4,
                  border: '0.5px solid #d4cfc5',
                  position: 'relative',
                  cursor: 'none',
                }}
              >
                <span style={{ fontSize: 10 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Fix 9 — Stats with gold suffixes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '0.5px solid #d4cfc5', borderRadius: 4 }}>
            {stats.map((item, i) => (
              <div
                key={item.label}
                style={{
                  padding: '14px 20px',
                  borderRight: i === 0 ? '0.5px solid #d4cfc5' : 'none',
                }}
              >
                <div
                  style={{
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    fontSize: 26,
                    letterSpacing: '-0.02em',
                    color: '#0d0d0d',
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {item.num}<span style={{ color: '#D4AF37' }}>{item.suffix}</span>
                </div>
                <div className="eyebrow">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
