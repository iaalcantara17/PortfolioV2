import { useEffect, useId, useRef, useState } from 'react'
import { gsap } from 'gsap'
import LazyLightbox from '../LazyLightbox'
import HoverPreview from '../HoverPreview'
import { photoByName } from '../../data/photos'
import { entranceStart, entranceEnd } from '../../utils/motion'
import { handleTilt, resetTilt } from '../../utils/tilt'
import { placeFollower, followPointer, hideFollower } from '../../utils/follower'

// A project link's address as printed after its label (data-print-url, print.css):
// "linkdup.app", without the https:// or a trailing slash. The ↗ on each link sits in
// its own span (.link-arrow) so print can leave it out, inside one span with the label:
// the links are inline-flex, and a label and arrow as two flex items would lose the
// space between them.
const printUrl = (url) => url.replace(/^https?:\/\//, '').replace(/\/$/, '')

// A project link with a note in a small bubble (.link-tip-bubble, styled like
// Montclair's "In progress" chip) that overlays its card:
// - Shows on mouse hover (by pointer type, like the Education floaters, so a tap
//   can't leave it stuck) and on keyboard focus (:focus-visible, in index.css).
// - Placed like the Education floaters (placeFollower): below and to the right of
//   the pointer in the card's coordinates, following it across the link. Always
//   below (alwaysBelow): the link sits at the card's bottom edge, where the
//   floaters' flip would put it above, over the tech pills. Keyboard focus has no
//   pointer, so it takes the same offset from the link's bottom-left corner.
// - Per WCAG 1.4.13, Escape hides it; it stays for as long as hover or focus does.
// - It's always the link's description (aria-describedby), so screen readers read
//   it with the link on any device. The description comes from a hidden copy in
//   sentence case; the bubble itself is aria-hidden, since its eyebrow style would
//   hand screen readers the text in capitals. Touch shows no bubble: a tap opens
//   the link.
// - Where it would still run off the right edge of the screen (narrow screens), it's
//   pulled back to 8px inside it.
function NoteLink({ link, style }) {
  const noteId = useId()
  const bubbleRef = useRef(null)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // point: the pointer event, or for keyboard focus the link's bottom-left corner
  const place = (point) => {
    const bubble = bubbleRef.current
    const card = bubble.offsetParent
    if (!card) return
    placeFollower(point, card, bubble, { alwaysBelow: true })
    const overflow = bubble.getBoundingClientRect().right - (document.documentElement.clientWidth - 8)
    if (overflow > 0) bubble.style.left = `${parseFloat(bubble.style.left) - overflow}px`
  }

  useEffect(() => {
    if (!hovered && !focused) return
    const onKeyDown = (e) => { if (e.key === 'Escape') setDismissed(true) }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [hovered, focused])

  return (
    <span
      className={`link-tip${hovered ? ' tip-hovered' : ''}${dismissed ? ' tip-dismissed' : ''}`}
      onPointerEnter={(e) => {
        if (e.pointerType !== 'mouse') return
        place(e)
        setHovered(true)
      }}
      onPointerMove={(e) => { if (e.pointerType === 'mouse') place(e) }}
      onPointerLeave={() => {
        setHovered(false)
        if (!focused) setDismissed(false)
      }}
    >
      <a
        href={link.url}
        data-print-url={printUrl(link.url)}
        target="_blank"
        rel="noopener noreferrer"
        style={style}
        aria-describedby={noteId}
        onFocus={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          place({ clientX: r.left, clientY: r.bottom })
          setFocused(true)
        }}
        onBlur={() => {
          setFocused(false)
          if (!hovered) setDismissed(false)
        }}
      >
        <span>{link.label} <span className="link-arrow">↗</span></span>
      </a>
      <span id={noteId} hidden>{link.note}</span>
      <span ref={bubbleRef} className="eyebrow link-tip-bubble" aria-hidden="true">{link.note}</span>
    </span>
  )
}

const featuredStack = ['React Native', 'TypeScript', 'Node.js', 'Supabase', 'Railway', 'Vercel', 'Gemini 2.5']

// LinkdUp's capstone certificate, opened in the Lightbox like the NJIT diploma in Education
const certificates = [
  {
    image: photoByName['linkdup-certificate'],
    alt: 'NJIT Capstone certificate, second place for LinkdUp in the Spring 2026 YWCC Capstone Showcase',
  },
]

// The Certificate button shows its card's hover preview (HoverPreview) the way the NJIT
// card shows the diploma's, but only while the pointer is over the button. The preview
// sits in the card's coordinates, always below the pointer (like the Live Demo note),
// so it never covers the card's content above the button.
const cardOf = (e) => e.currentTarget.closest('.featured-card')
const certificatePreviewProps = {
  onPointerMove: (e) => followPointer(e, cardOf(e), { alwaysBelow: true }),
  onPointerLeave: (e) => hideFollower(e, cardOf(e)),
}

export default function Projects({ isVisible }) {
  const sectionRef = useRef(null)
  const tlRef = useRef(null)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  // Fix 1 — set initial hidden state on mount
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    gsap.set(section.querySelectorAll('[data-animate]'), entranceStart({ y: 30, opacity: 0 }))
    gsap.set(section.querySelector('.featured-card'), { opacity: 0 })
    gsap.set(section.querySelectorAll('.grid-card'), entranceStart({ y: 30, opacity: 0, rotateX: 5 }))
  }, [])

  // Animate in once, on first entrance — never reverses or re-triggers
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    if (isVisible && !tlRef.current) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.to(section.querySelectorAll('[data-animate]'), entranceEnd({ y: 0, opacity: 1, stagger: 0.07, duration: 0.7 }))
        .to(section.querySelector('.featured-card'), { opacity: 1, duration: 0.8 }, '-=0.4')
        .to(section.querySelectorAll('.grid-card'), entranceEnd({ y: 0, opacity: 1, rotateX: 0, stagger: 0.12, duration: 0.7 }), '-=0.3')
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
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            {/* The visible title is the section's heading; the screen-reader prefix
                keeps its nav label ("Projects") first when navigating by heading */}
            <h2
              data-animate
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(26px, 2.8vw, 36px)',
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
                color: 'var(--color-ink)',
                marginBottom: 16,
              }}
            >
              <span className="sr-only">Projects: </span>
              What I've{' '}
              <br />
              actually{' '}
              <br />
              built<span style={{ color: 'var(--color-purple)' }}>.</span>
            </h2>
            <p data-animate style={{ color: 'var(--color-muted)', fontSize: 12, lineHeight: 1.85 }}>
              Projects I can speak to in full, start to finish.
            </p>
          </div>
          <div data-animate>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 42,
                letterSpacing: '-0.03em',
                color: 'var(--color-ink)',
                lineHeight: 1,
              }}
            >
              3
            </div>
            <div className="eyebrow" style={{ marginTop: 4 }}>Projects I own</div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ padding: '32px 48px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Featured card. position: relative makes the card the certificate
              preview's frame (followPointer places it in the card's coordinates). */}
          <div
            className="featured-card tilt-card"
            onMouseMove={(e) => handleTilt(e, e.currentTarget)}
            onMouseLeave={(e) => resetTilt(e.currentTarget)}
            style={{
              background: 'var(--color-feature)',
              borderRadius: 4,
              padding: '28px 32px',
              border: '0.5px solid #2a2a2a', /* one-off: review */
              position: 'relative',
            }}
          >
            {/* Award badge */}
            <div style={{ marginBottom: 14 }}>
              <span className="pill pill-gold" style={{ fontSize: 9 }}>
                2nd Place, NJIT CS491 Capstone 2026
              </span>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 26,
                color: 'var(--color-night-text)',
                letterSpacing: '-0.02em',
                marginBottom: 4,
              }}
            >
              LinkdUp
            </h3>
            <div style={{ fontSize: 12, color: 'var(--color-paper-a50)', marginBottom: 12 }}>
              Mobile-first web app for group meetup coordination
            </div>

            <p style={{ fontSize: 12, color: 'var(--color-paper-a70)', lineHeight: 1.85, marginBottom: 16 }}>
              Lead developer on a{' '}
              <strong style={{ color: 'var(--color-night-text)', fontWeight: 500 }}>production app deployed at linkdup.app</strong> — built a locked-step swipe-voting engine synchronized in real time across all party members via Supabase Realtime websockets. Integrated{' '}
              <strong style={{ color: 'var(--color-night-text)', fontWeight: 500 }}>Google Places API</strong> for geographic midpoint venue discovery,{' '}
              <strong style={{ color: 'var(--color-night-text)', fontWeight: 500 }}>Google Calendar API</strong> for one-click event export, and{' '}
              <strong style={{ color: 'var(--color-night-text)', fontWeight: 500 }}>Gemini 2.5</strong> for AI-generated venue pitches. Includes a TikTok-style social feed, followers/block system, and 27+ schema migrations with row-level security.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
              {featuredStack.map((s) => (
                <span key={s} className="pill pill-dark" style={{ fontSize: 10 }}>{s}</span>
              ))}
            </div>

            {/* Wraps on narrow screens, where the three don't fit on one line */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <a
                href="https://linkdup.app"
                data-print-url={printUrl('https://linkdup.app')}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  background: 'var(--color-night-purple)',
                  borderRadius: 4,
                  fontSize: 11,
                  color: 'var(--color-white)',
                  textDecoration: 'none',
                  letterSpacing: '0.06em',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <span>Live Demo <span className="link-arrow">↗</span></span>
              </a>
              <a
                href="https://github.com/iaalcantara17/LinkdUp"
                data-print-url={printUrl('https://github.com/iaalcantara17/LinkdUp')}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  border: '0.5px solid var(--color-paper-a30)',
                  borderRadius: 4,
                  fontSize: 11,
                  color: 'var(--color-paper-a70)',
                  textDecoration: 'none',
                  letterSpacing: '0.06em',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <span>GitHub <span className="link-arrow">↗</span></span>
              </a>
              {/* Opens the certificate in the Lightbox, not a new tab, so no ↗ */}
              <button
                type="button"
                aria-label="View certificate: LinkdUp, 2nd Place, NJIT CS491 Capstone 2026"
                {...certificatePreviewProps}
                onClick={(e) => {
                  // A tap fires mousemove first, so don't leave the card tilted behind the Lightbox
                  resetTilt(cardOf(e))
                  setLightboxIndex(0)
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  border: '0.5px solid var(--color-paper-a30)',
                  borderRadius: 4,
                  fontSize: 11,
                  color: 'var(--color-paper-a70)',
                  letterSpacing: '0.06em',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Certificate
              </button>
            </div>

            <HoverPreview image={certificates[0].image} />
          </div>

          {/* Grid cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* SFort95 Compiler */}
            <div
              className="grid-card tilt-card"
              onMouseMove={(e) => handleTilt(e, e.currentTarget)}
              onMouseLeave={(e) => resetTilt(e.currentTarget)}
              style={{
                background: 'var(--color-surface)',
                borderRadius: 4,
                padding: '22px 24px',
                border: '0.5px solid var(--color-line)',
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <span className="eyebrow" style={{ color: 'var(--color-muted)' }}>Systems — Compiler</span>
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 18,
                  color: 'var(--color-ink)',
                  letterSpacing: '-0.02em',
                  marginBottom: 8,
                }}
              >
                SFort95 Compiler
              </h3>
              <p style={{ fontSize: 11.5, color: 'var(--color-muted)', lineHeight: 1.85, marginBottom: 12 }}>
                A full three-stage compiler in <strong style={{ color: 'var(--color-ink)', fontWeight: 500 }}>C++</strong> — a state-based lexical analyzer that tokenizes source input, a recursive-descent parser with operator-precedence handling, and an interpreter that executes the parsed AST with Fortran95-compliant semantics. Runtime checks catch undefined variables, type mismatches, and division by zero before they become problems.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                {['C++', 'Git', 'Lexer', 'Parser', 'AST'].map((s) => (
                  <span key={s} className="pill" style={{ fontSize: 9 }}>{s}</span>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[
                  { label: 'Lexer', url: 'https://github.com/iaalcantara17/Lexical-Analyzer-for-SFort95-Language' },
                  { label: 'Parser', url: 'https://github.com/iaalcantara17/Parser-for-SFort95-Language' },
                  { label: 'Interpreter', url: 'https://github.com/iaalcantara17/SFort95-Interpreter' },
                ].map((l) => (
                  <a
                    key={l.label}
                    href={l.url}
                    data-print-url={printUrl(l.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      padding: '4px 10px',
                      border: '0.5px solid var(--color-purple-a40)',
                      borderRadius: 4,
                      fontSize: 10,
                      color: 'var(--color-purple-deep)',
                      textDecoration: 'none',
                      letterSpacing: '0.04em',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    <span>{l.label} <span className="link-arrow">↗</span></span>
                  </a>
                ))}
              </div>
            </div>

            {/* Data Analysis App. position: relative makes the card the Live Demo
                note's frame (NoteLink places it in the card's coordinates). */}
            <div
              className="grid-card tilt-card"
              onMouseMove={(e) => handleTilt(e, e.currentTarget)}
              onMouseLeave={(e) => resetTilt(e.currentTarget)}
              style={{
                background: 'var(--color-surface)',
                borderRadius: 4,
                padding: '22px 24px',
                border: '0.5px solid var(--color-line)',
                position: 'relative',
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <span className="eyebrow" style={{ color: 'var(--color-muted)' }}>Machine Learning — Python</span>
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 18,
                  color: 'var(--color-ink)',
                  letterSpacing: '-0.02em',
                  marginBottom: 8,
                }}
              >
                Data Analysis App
              </h3>
              <p style={{ fontSize: 11.5, color: 'var(--color-muted)', lineHeight: 1.85, marginBottom: 12 }}>
                Upload any CSV, pick your target, and watch it go. The app handles the messy part — missing values, scaling, encoding — automatically, so you can focus on what actually matters: understanding your data. Built a full regression pipeline using a{' '}
                <strong style={{ color: 'var(--color-ink)', fontWeight: 500 }}>Gradient Boosting Regressor</strong> with real-time prediction and dynamic visualizations that update as you explore.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                {['Python', 'Streamlit', 'Scikit-learn', 'Pandas', 'NumPy'].map((s) => (
                  <span key={s} className="pill" style={{ fontSize: 9 }}>{s}</span>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[
                  // The demo runs on Streamlit, which puts idle apps to sleep
                  { label: 'Live Demo', url: 'https://milestone-4-data-analysis.streamlit.app/', note: 'The demo can take a few seconds to wake up.' },
                  { label: 'GitHub', url: 'https://github.com/iaalcantara17/Data-Analysis-App' },
                ].map((l) => {
                  const style = {
                    display: 'inline-flex',
                    padding: '4px 10px',
                    border: '0.5px solid var(--color-purple-a40)',
                    borderRadius: 4,
                    fontSize: 10,
                    color: 'var(--color-purple-deep)',
                    textDecoration: 'none',
                    letterSpacing: '0.04em',
                    fontFamily: 'var(--font-sans)',
                  }
                  return l.note ? (
                    <NoteLink key={l.label} link={l} style={style} />
                  ) : (
                    <a key={l.label} href={l.url} data-print-url={printUrl(l.url)} target="_blank" rel="noopener noreferrer" style={style}>
                      <span>{l.label} <span className="link-arrow">↗</span></span>
                    </a>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Bottom note */}
          <div style={{ borderTop: '0.5px solid var(--color-line)', paddingTop: 14 }}>
            <span className="eyebrow" style={{ color: 'var(--color-faint)' }}>Only projects I built and can fully speak to.</span>
          </div>
        </div>
      </div>

      <LazyLightbox
        photos={certificates}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </section>
  )
}
