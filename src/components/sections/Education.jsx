import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import StatusPill from '../StatusPill'
import LazyLightbox from '../LazyLightbox'
import HoverPreview from '../HoverPreview'
import MissingImage from '../MissingImage'
import { useLoadFailed } from '../../hooks/useLoadFailed'
import { photoByName } from '../../data/photos'
import { entranceStart, entranceEnd } from '../../utils/motion'
import { handleTilt, resetTilt } from '../../utils/tilt'
import { followPointer, hideFollower } from '../../utils/follower'
import njitLogo from '../../assets/logos/njit.webp'
import montclairLogo from '../../assets/logos/montclair.webp'

// Logos show in their official colors, a deliberate exception to the token palette.
// Dates are static text, updated by hand. A card with a diploma opens it in the Lightbox
// and previews it on hover; a card with a hoverLabel only reacts to hover (tilt plus
// the label). Each card also carries a short blurb and its coursework.
const schools = [
  {
    degree: 'Bachelor of Science in Computer Science',
    school: 'New Jersey Institute of Technology',
    college: 'Ying Wu College of Computing',
    status: 'earned',
    period: 'Sep 2022 — May 2026',
    logo: { src: njitLogo, width: 192, height: 192 },
    diploma: { image: photoByName['njit-diploma'], alt: 'NJIT diploma, Bachelor of Science in Computer Science' },
    blurb: 'Four years built the technical foundation. Java, C, Python and a few others along the way, systems design, algorithms, a compiler project for a cut-down version of Fortran, and a full capstone build from scratch.',
    coursework: 'Advanced Data Structures & Algorithms, Database System Design & Management, Principles of Operating Systems, Introduction to Computer Networks, Introduction to Machine Learning, Introduction to Cybersecurity, Designing the User Experience, Programming Language Concepts, Design in Software Engineering, Intensive Programming in Linux, Introduction to Computer Science I & II, and a Senior Capstone Project.',
  },
  {
    degree: 'Master of Business Administration',
    school: 'Montclair State University',
    college: 'Feliciano School of Business',
    status: 'in-progress',
    period: 'Aug 2026 — Expected Fall 2028',
    logo: { src: montclairLogo, width: 165, height: 192 },
    hoverLabel: 'In progress',
    blurb: 'The MBA picks up from there, covering statistics, information systems, and the business side of technology.',
    coursework: 'Global Economy, Business Statistics, Strategic Information Systems, and Business Essentials.',
  },
]

const diplomas = schools.filter((s) => s.diploma).map((s) => s.diploma)

// Hover behavior of a card with a diploma: the same tilt as the Projects cards, and
// with a mouse a thumbnail of the diploma follows the pointer (HoverPreview). What
// opens the diploma is DiplomaButton, inside the card.
const diplomaCardProps = {
  onMouseMove: (e) => handleTilt(e, e.currentTarget),
  onMouseLeave: (e) => resetTilt(e.currentTarget),
  onPointerMove: followPointer,
  onPointerLeave: hideFollower,
}

// Opens a card's diploma: a real button stretched over the whole card (.edu-card-open),
// beside the card's content rather than around it. With role="button" on the card
// itself, everything inside counted as the button's label, which kept the degree's h3
// out of heading navigation in some screen readers. A click or tap anywhere on the
// card lands on this button, Enter and Space work natively, and it grows the custom
// cursor like any other button.
function DiplomaButton({ school, onOpen }) {
  return (
    <button
      type="button"
      className="edu-card-open"
      aria-label={`View diploma: ${school.degree}, ${school.school}`}
      onClick={(e) => {
        // A tap fires mousemove first, so don't leave the card tilted behind the Lightbox
        resetTilt(e.currentTarget.parentElement)
        onOpen()
      }}
    />
  )
}

// A school's logo, fitted inside the card's logo box (.edu-logo). Decorative: the card
// names the school. A logo that fails to load leaves a MissingImage at the logo's
// proportions, as tall as the box.
function SchoolLogo({ logo }) {
  const [failed, onError] = useLoadFailed(logo.src)
  if (failed) {
    return <MissingImage width={logo.width} height={logo.height} alt="" style={{ width: 'auto', height: '100%' }} />
  }
  return (
    <img
      src={logo.src}
      width={logo.width}
      height={logo.height}
      alt=""
      loading="lazy"
      onError={onError}
      style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%', display: 'block' }}
    />
  )
}

// A card that opens nothing gets the same hover tilt, for consistency with the NJIT
// card, but the cursor dot doesn't grow (it's no link or button), since there is
// nothing to click. Its hover label follows the pointer like a tooltip (utils/follower.js).
// Mouse pointers only, so a tap on a phone can't leave the card tilted.
const hoverOnlyProps = {
  onPointerMove: (e) => {
    if (e.pointerType !== 'mouse') return
    handleTilt(e, e.currentTarget)
    followPointer(e)
  },
  onPointerLeave: (e) => {
    resetTilt(e.currentTarget)
    hideFollower(e)
  },
}

export default function Education({ isVisible }) {
  const sectionRef = useRef(null)
  const tlRef = useRef(null)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  // Hidden until the first entrance below: the starting state, set on mount
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
      className="page-section fit-content"
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
          }}
        >
          {/* The visible title is the section's heading; the screen-reader prefix
              keeps its nav label ("Education") first when navigating by heading */}
          <h2
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
            <span className="sr-only">Education: </span>
            Still{' '}
            <br />
            building.{' '}
            <br />
            Still{' '}
            <br />
            learning<span style={{ color: 'var(--color-purple)' }}>.</span>
          </h2>
        </div>

        {/* Right column */}
        <div
          className="section-right-col edu-right-col"
          style={{ padding: '32px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}
        >
          {schools.map((s) => (
            <div
              key={s.school}
              className={s.diploma || s.hoverLabel ? 'edu-card tilt-card' : 'edu-card'}
              {...(s.diploma && diplomaCardProps)}
              {...(s.hoverLabel && hoverOnlyProps)}
              style={{
                display: 'grid',
                gridTemplateColumns: '96px 1fr auto',
                alignItems: 'center',
                gap: 28,
                background: 'var(--color-surface)',
                borderRadius: 4,
                padding: '28px 32px',
                border: '0.5px solid var(--color-line)',
                position: 'relative',
              }}
            >
              <div className="edu-logo" style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SchoolLogo logo={s.logo} />
              </div>

              <div>
                <h3
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
                </h3>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink)', lineHeight: 1.3, marginBottom: 2 }}>
                  {s.school}
                </div>
                <div className="eyebrow" style={{ color: 'var(--color-muted)' }}>{s.college}</div>
                <p style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.85, marginTop: 12 }}>{s.blurb}</p>
                <div className="eyebrow" style={{ color: 'var(--color-muted)', marginTop: 12, marginBottom: 2 }}>Coursework</div>
                <p style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.85 }}>{s.coursework}</p>
              </div>

              <div className="edu-meta" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <StatusPill status={s.status} />
                <span className="eyebrow" style={{ color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>{s.period}</span>
              </div>

              {s.diploma && (
                <DiplomaButton school={s} onOpen={() => setLightboxIndex(diplomas.indexOf(s.diploma))} />
              )}

              {/* Expand icon, shown only where there's no hover tilt to say the card
                  opens (see .tap-hint). Decorative: the button's label already says it. */}
              {s.diploma && (
                <svg className="tap-hint" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M8.5 1.5h4v4M12.5 1.5L8 6M5.5 12.5h-4v-4M1.5 12.5L6 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}

              {s.diploma && <HoverPreview images={[s.diploma.image]} />}

              {/* Hover label, positioned by hoverOnlyProps (see .card-follower).
                  aria-hidden: the status pill already says the same to screen readers. */}
              {s.hoverLabel && (
                <span className="eyebrow card-follower card-hover-label" aria-hidden="true">{s.hoverLabel}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <LazyLightbox
        photos={diplomas}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </section>
  )
}
