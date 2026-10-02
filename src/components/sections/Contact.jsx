import { useEffect, useId, useRef } from 'react'
import { gsap } from 'gsap'
import { EMAIL, RESUME_URL } from '../../data/contact'
import { useCopyText } from '../../hooks/useCopyText'
import { entranceStart, entranceEnd, pulseAvailability } from '../../utils/motion'
import { trackResumeDownload } from '../../utils/trackResumeDownload'

// copy: the row copies its value when clicked or tapped, and links nowhere
const links = [
  { label: 'Email', value: EMAIL, copy: true },
  { label: 'LinkedIn', value: 'linkedin.com/in/israel-alcantara', href: 'https://linkedin.com/in/israel-alcantara' },
  { label: 'GitHub', value: 'github.com/iaalcantara17', href: 'https://github.com/iaalcantara17' },
]

// Hover dim for mouse pointers only. A touch tap fires an emulated mouseenter
// with no matching mouseleave, which left the element dimmed after the tap.
const dimOnMouseHover = (opacity) => ({
  onPointerEnter: (e) => { if (e.pointerType === 'mouse') e.currentTarget.style.opacity = opacity },
  onPointerLeave: (e) => { if (e.pointerType === 'mouse') e.currentTarget.style.opacity = '1' },
})

// Selects an element's text, for copying by hand
function selectText(el) {
  const range = document.createRange()
  range.selectNodeContents(el)
  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(range)
}

export default function Contact({ isVisible }) {
  const sectionRef = useRef(null)
  const tlRef = useRef(null)
  const [copied, copy] = useCopyText()
  // The copy button's aria-label replaces its text for screen readers, so the address
  // on screen is attached as its description: "Copy email address, button, <address>"
  const copyValueId = useId()

  // Copies a row's value; the label reads "Copied" for a moment. If the clipboard
  // refuses, the value is selected instead, ready to copy by hand.
  const copyValue = (e, link) => {
    const valueEl = e.currentTarget.querySelector('[data-copy-value]')
    copy(link.value, () => selectText(valueEl))
  }

  // Hidden until the first entrance below: the starting state, set on mount
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    gsap.set(section.querySelectorAll('.headline-char'), entranceStart({ y: 40, opacity: 0 }))
    gsap.set(section.querySelectorAll('[data-animate]'), entranceStart({ y: 20, opacity: 0 }))
    gsap.set(section.querySelectorAll('.link-row'), entranceStart({ x: 30, opacity: 0 }))
  }, [])

  // Animate in once, on first entrance — never reverses or re-triggers
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    if (isVisible && !tlRef.current) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.to(section.querySelectorAll('.headline-char'), entranceEnd({ y: 0, opacity: 1, stagger: 0.04, duration: 0.6 }))
        .to(section.querySelectorAll('[data-animate]'), entranceEnd({ y: 0, opacity: 1, stagger: 0.07, duration: 0.6 }), '-=0.3')
        .to(section.querySelectorAll('.link-row'), entranceEnd({ x: 0, opacity: 1, stagger: 0.1, duration: 0.6 }), '-=0.2')
        .add(pulseAvailability(section.querySelector('.availability-dot')))
      tlRef.current = tl
    }
  }, [isVisible])

  return (
    <section
      ref={sectionRef}
      className="page-section"
      style={{ background: 'var(--color-paper)', display: 'flex', flexDirection: 'column' }}
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
            borderRight: '0.5px solid var(--color-line)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            {/* Headline with letter reveal, and the section's heading. The words exist
                once as text (the screen-reader copy, after the nav-label prefix); the
                per-letter spans are drawn by CSS from data-glyph, so they're neither
                read one letter at a time nor indexed as a second copy. */}
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(40px, 5vw, 52px)',
                letterSpacing: '-0.03em',
                lineHeight: 0.95,
                color: 'var(--color-ink)',
                marginBottom: 32,
              }}
            >
              <span className="sr-only">Contact: Let's talk.</span>
              <span aria-hidden="true">
                {"Let's".split('').map((c, i) => (
                  <span key={i} className="headline-char" style={{ display: 'inline-block' }} data-glyph={c} />
                ))}
                <br />
                {'talk.'.split('').map((c, i) => (
                  <span key={i} className="headline-char" style={{ display: 'inline-block', color: c === '.' ? 'var(--color-purple)' : 'var(--color-ink)' }} data-glyph={c} />
                ))}
              </span>
            </h2>

            <div data-animate style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
              <p style={{ color: 'var(--color-muted)', fontSize: 13, lineHeight: 1.9 }}>
                I'm still growing. But I know who I am, and I show up as exactly that. If that's someone you want on your team, I'd like to hear from you.
              </p>
              <p style={{ color: 'var(--color-muted)', fontSize: 13, lineHeight: 1.9 }}>
                Whether it's a role, a conversation, or just something worth talking about, my inbox is open.
              </p>
            </div>
          </div>

          {/* Availability */}
          <div data-animate className="contact-availability" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="availability-dot" />
            <span className="eyebrow" style={{ color: 'var(--color-purple-ink)' }}>Available now</span>
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
            {links.map((l) => {
              // A copy row is a button (it acts, it doesn't go anywhere), styled to
              // look exactly like the link rows: its button defaults are reset
              const Row = l.copy ? 'button' : 'a'
              const rowProps = l.copy
                ? { type: 'button', 'aria-label': 'Copy email address', 'aria-describedby': copyValueId, onClick: (e) => copyValue(e, l) }
                : { href: l.href, target: '_blank', rel: 'noopener noreferrer' }
              return (
                <Row
                  key={l.label}
                  {...rowProps}
                  className="link-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '20px 0',
                    border: 'none',
                    borderBottom: '0.5px solid var(--color-line)',
                    textAlign: 'left',
                    textDecoration: 'none',
                    transition: 'opacity 0.2s ease',
                  }}
                  {...dimOnMouseHover('0.6')}
                >
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 3 }} aria-live={l.copy ? 'polite' : undefined}>
                      {l.copy && copied ? 'Copied' : l.label}
                    </div>
                    <div data-copy-value={l.copy ? '' : undefined} id={l.copy ? copyValueId : undefined} style={{ fontSize: 13, color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>{l.value}</div>
                  </div>
                  {l.copy ? (
                    // Copy icon (two sheets), in the tap hint's style (14px, round caps,
                    // a "does something" purple) but a lighter 1.1 stroke, so it matches
                    // the thin ↗ arrows on the rows below it, in their color too
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ color: 'var(--color-purple-deep)', flexShrink: 0 }}>
                      <rect x="4.5" y="4.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
                      <path d="M9.5 4.5V3A1.5 1.5 0 0 0 8 1.5H3A1.5 1.5 0 0 0 1.5 3v5A1.5 1.5 0 0 0 3 9.5h1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    // purple-deep: the arrow is text, and the lighter purple is under 4.5:1
                    // on the paper
                    <span style={{ color: 'var(--color-purple-deep)', fontSize: 18, lineHeight: 1 }}>↗</span>
                  )}
                </Row>
              )
            })}

            {/* Resume download */}
            <div style={{ marginTop: 32 }}>
              <a
                href={RESUME_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={trackResumeDownload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 24px',
                  background: 'var(--color-ink)',
                  borderRadius: 4,
                  textDecoration: 'none',
                  transition: 'opacity 0.2s ease',
                }}
                {...dimOnMouseHover('0.8')}
              >
                <span style={{ fontSize: 12, color: 'var(--color-paper)', fontFamily: 'var(--font-sans)', letterSpacing: '0.06em' }}>
                  Download Resume
                </span>
                <span className="pill pill-gold" style={{ fontSize: 9, padding: '2px 6px' }}>PDF</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer. The year and the updated month are the build's (buildDate in
          vite.config.js), so they move together with every deploy. */}
      <div
        className="contact-footer"
        style={{
          borderTop: '0.5px solid var(--color-line)',
          padding: '16px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span className="eyebrow" style={{ color: 'var(--color-faint)' }}>Israel Alcántara, {import.meta.env.BUILD_YEAR}</span>
        <span className="eyebrow" style={{ color: 'var(--color-faint)' }}>Updated {import.meta.env.BUILD_MONTH}</span>
      </div>
    </section>
  )
}
