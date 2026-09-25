import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

// copyOnTouch: on touch devices, tapping copies the value instead of following href
const links = [
  { label: 'Email', value: 'ialcantara2003@gmail.com', href: 'mailto:ialcantara2003@gmail.com', copyOnTouch: true },
  { label: 'LinkedIn', value: 'linkedin.com/in/israel-alcantara', href: 'https://linkedin.com/in/israel-alcantara' },
  { label: 'GitHub', value: 'github.com/iaalcantara17', href: 'https://github.com/iaalcantara17' },
]

// Hover dim for mouse pointers only. A touch tap fires an emulated mouseenter
// with no matching mouseleave, which left the element dimmed after the tap.
const dimOnMouseHover = (opacity) => ({
  onPointerEnter: (e) => { if (e.pointerType === 'mouse') e.currentTarget.style.opacity = opacity },
  onPointerLeave: (e) => { if (e.pointerType === 'mouse') e.currentTarget.style.opacity = '1' },
})

const COPIED_MS = 1500

export default function Contact({ isVisible }) {
  const sectionRef = useRef(null)
  const tlRef = useRef(null)
  const [copied, setCopied] = useState(false)
  const copiedTimerRef = useRef(null)

  useEffect(() => () => clearTimeout(copiedTimerRef.current), [])

  // Touch only: a mail app is rarely what someone wants from a tap on their phone.
  // If the clipboard isn't available or refuses, fall back to the mailto link.
  const handleCopyTap = (e, link) => {
    if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches || !navigator.clipboard) return
    e.preventDefault()
    navigator.clipboard.writeText(link.value).then(
      () => {
        setCopied(true)
        clearTimeout(copiedTimerRef.current)
        copiedTimerRef.current = setTimeout(() => setCopied(false), COPIED_MS)
      },
      () => { window.location.href = link.href }
    )
  }

  // Fix 1 — set initial hidden state on mount
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    gsap.set(section.querySelectorAll('.headline-char'), { y: 40, opacity: 0 })
    gsap.set(section.querySelectorAll('[data-animate]'), { y: 20, opacity: 0 })
    gsap.set(section.querySelectorAll('.link-row'), { x: 30, opacity: 0 })
  }, [])

  // Animate in once, on first entrance — never reverses or re-triggers
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
            {/* Headline with letter reveal */}
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(40px, 5vw, 52px)',
                letterSpacing: '-0.03em',
                lineHeight: 0.95,
                color: 'var(--color-ink)',
                marginBottom: 32,
              }}
              aria-label="Let's talk."
            >
              {"Let's".split('').map((c, i) => (
                <span key={i} className="headline-char" style={{ display: 'inline-block' }}>{c}</span>
              ))}
              <br />
              {'talk.'.split('').map((c, i) => (
                <span key={i} className="headline-char" style={{ display: 'inline-block', color: c === '.' ? 'var(--color-purple)' : 'var(--color-ink)' }}>{c}</span>
              ))}
            </div>

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
          <div data-animate style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
            {links.map((l) => (
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
                  borderBottom: '0.5px solid var(--color-line)',
                  textDecoration: 'none',
                  cursor: 'none',
                  transition: 'opacity 0.2s ease',
                }}
                {...dimOnMouseHover('0.6')}
                onClick={l.copyOnTouch ? (e) => handleCopyTap(e, l) : undefined}
              >
                <div>
                  <div className="eyebrow" style={{ marginBottom: 3 }} aria-live={l.copyOnTouch ? 'polite' : undefined}>
                    {l.copyOnTouch && copied ? 'Copied' : l.label}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>{l.value}</div>
                </div>
                <span style={{ color: 'var(--color-purple)', fontSize: 18, lineHeight: 1 }}>↗</span>
              </a>
            ))}

            {/* Resume download */}
            <div style={{ marginTop: 32 }}>
              <a
                href="/Resume_Israel_Alcantara.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 24px',
                  background: 'var(--color-ink)',
                  borderRadius: 4,
                  textDecoration: 'none',
                  cursor: 'none',
                  transition: 'opacity 0.2s ease',
                }}
                {...dimOnMouseHover('0.8')}
              >
                <span style={{ fontSize: 12, color: 'var(--color-paper)', fontFamily: 'var(--font-sans)', letterSpacing: '0.06em' }}>
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
          borderTop: '0.5px solid var(--color-line)',
          padding: '16px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span className="eyebrow" style={{ color: 'var(--color-faint)' }}>Israel Alcántara, 2026</span>
        <span className="eyebrow" style={{ color: 'var(--color-faint)' }}>Built with craft.</span>
      </div>
    </section>
  )
}
