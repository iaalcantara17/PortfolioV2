import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import SpotifyWidget from '../SpotifyWidget'

const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÁÉÍÓÚáéíóúàèâêñüç0123456789!.,'
const SCRAMBLE_MS = 340
const CHAR_STAGGER = 50
const SCRAMBLE_TICK = 40

const NAME_LINE1 = 'Israel'.split('').map(ch => ({ ch }))
const NAME_LINE2 = [
  { ch: 'A' }, { ch: 'l' }, { ch: 'c' },
  { ch: 'á' },
  { ch: 'n' },
  { ch: ' ', noScramble: true },
  { ch: '—', style: { color: '#7F77DD', fontSize: '0.8em', fontWeight: '700' } },
]
const NAME_LINE3 = 'tara.'.split('').map(ch => ({ ch }))

const SUBTEXT_CHARS = [
  ...'Builder. '.split('').map(ch => ({ ch })),
  ...'AWS alum.'.split('').map(ch => ({ ch, style: { fontWeight: '500', color: '#0d0d0d' } })),
  ...' NJIT Computer Science.'.split('').map(ch => ({ ch })),
  { ch: '', isBR: true },
  ...'Bilingual.'.split('').map(ch => ({ ch })),
]

const SIEMPRE_CHARS = 'Siempre aprendiendo.'.split('').map(ch => ({ ch }))

function scheduleChars(charDefs, containerRef, startOffset, timers, intervals) {
  for (let i = 0; i < charDefs.length; i++) {
    const charDef = charDefs[i]
    const startAt = startOffset + i * CHAR_STAGGER

    const t = setTimeout(() => {
      const container = containerRef.current
      if (!container) return

      if (charDef.isBR) {
        container.appendChild(document.createElement('br'))
        return
      }

      const span = document.createElement('span')
      if (charDef.style) Object.assign(span.style, charDef.style)

      if (charDef.noScramble || charDef.ch === ' ') {
        span.textContent = charDef.ch
        container.appendChild(span)
        return
      }

      span.textContent = POOL[Math.floor(Math.random() * POOL.length)]
      container.appendChild(span)

      const iv = setInterval(() => {
        span.textContent = POOL[Math.floor(Math.random() * POOL.length)]
      }, SCRAMBLE_TICK)
      intervals.push(iv)

      const resolveT = setTimeout(() => {
        clearInterval(iv)
        span.textContent = charDef.ch
      }, SCRAMBLE_MS)
      timers.push(resolveT)
    }, startAt)

    timers.push(t)
  }

  return startOffset + (charDefs.length - 1) * CHAR_STAGGER + SCRAMBLE_MS
}

export default function Hero({ isVisible }) {
  const word1Ref = useRef(null)
  const word2Ref = useRef(null)
  const word3Ref = useRef(null)
  const subtextBodyRef = useRef(null)
  const siepreRef = useRef(null)
  const eyebrowRef = useRef(null)
  const bottomRef = useRef(null)
  const rightColRef = useRef(null)
  const statusRef = useRef(null)

  // Set initial hidden state on mount
  useEffect(() => {
    gsap.set(eyebrowRef.current, { opacity: 0 })
    gsap.set(rightColRef.current, { opacity: 0, x: 20 })
    gsap.set(statusRef.current, { opacity: 0, y: 10 })
    gsap.set(bottomRef.current, { opacity: 0 })
  }, [])

  useEffect(() => {
    if (!isVisible) return

    // If already animated (text in DOM), restore visibility and exit
    if (word1Ref.current && word1Ref.current.childNodes.length > 0) {
      gsap.to(eyebrowRef.current, { opacity: 1, duration: 0.3 })
      gsap.to(rightColRef.current, { opacity: 1, x: 0, duration: 0.4 })
      gsap.to(statusRef.current, { opacity: 1, y: 0, duration: 0.3 })
      gsap.to(bottomRef.current, { opacity: 1, duration: 0.3 })
      return
    }

    const timers = []
    const intervals = []

    // Eyebrow fades in before typing starts
    gsap.to(eyebrowRef.current, { opacity: 1, duration: 0.4, ease: 'power2.out', delay: 0.15 })

    // Schedule name lines back-to-back
    let offset = 0
    const line1End = scheduleChars(NAME_LINE1, word1Ref, offset, timers, intervals)
    offset = NAME_LINE1.length * CHAR_STAGGER
    const line2End = scheduleChars(NAME_LINE2, word2Ref, offset, timers, intervals)
    offset = (NAME_LINE1.length + NAME_LINE2.length) * CHAR_STAGGER
    const nameDoneAt = scheduleChars(NAME_LINE3, word3Ref, offset, timers, intervals)

    // Right column fades in right after name resolves — not gated on full animation
    const rightFadeT = setTimeout(() => {
      gsap.to(rightColRef.current, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' })
    }, nameDoneAt + 150)
    timers.push(rightFadeT)

    // Subtext after 400ms pause from name end
    const subtextDoneAt = scheduleChars(
      SUBTEXT_CHARS, subtextBodyRef,
      nameDoneAt + 400,
      timers, intervals
    )

    // Siempre after 300ms pause from subtext end
    const siempreDoneAt = scheduleChars(
      SIEMPRE_CHARS, siepreRef,
      subtextDoneAt + 300,
      timers, intervals
    )

    // Status bar and bottom fade in after full animation
    const finalFadeT = setTimeout(() => {
      gsap.to(statusRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' })
      gsap.to(bottomRef.current, { opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 })
    }, siempreDoneAt + 150)
    timers.push(finalFadeT)

    return () => {
      timers.forEach(clearTimeout)
      intervals.forEach(clearInterval)
    }
  }, [isVisible])

  const wordStyle = {
    fontFamily: "'DM Serif Display', Georgia, serif",
    fontSize: 'clamp(52px, 6vw, 72px)',
    lineHeight: 0.92,
    letterSpacing: '-0.03em',
    color: '#0d0d0d',
    display: 'block',
    minHeight: '0.92em',
  }

  return (
    <section
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
            padding: '60px 48px 64px',
            borderRight: '0.5px solid #d4cfc5',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'visible',
          }}
        >
          <div>
            {/* Eyebrow */}
            <div
              ref={eyebrowRef}
              style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}
            >
              <div style={{ width: 32, height: 1, background: '#7F77DD', flexShrink: 0 }} />
              <span className="eyebrow">Software Engineer · Class of '26</span>
            </div>

            {/* Name — empty on mount, chars appended by typewriter */}
            <div style={{ marginBottom: 32 }}>
              <div ref={word1Ref} style={wordStyle} />
              <div ref={word2Ref} style={wordStyle} />
              <div ref={word3Ref} style={wordStyle} />
            </div>

            {/* Subtext — empty on mount, chars appended by typewriter */}
            <div style={{ color: '#666666', fontSize: 13, lineHeight: 1.9, maxWidth: 360 }}>
              <span ref={subtextBodyRef} />
              <br />
              <em ref={siepreRef} style={{ color: '#7F77DD', fontStyle: 'italic' }} />
            </div>
          </div>

          {/* Bottom — scroll indicator + counter, fades in after full animation */}
          <div ref={bottomRef}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 1, height: 32, background: '#D4AF37' }} />
                <div style={{ width: 0, height: 0, borderLeft: '3px solid transparent', borderRight: '3px solid transparent', borderTop: '5px solid #D4AF37' }} />
              </div>
              <span className="eyebrow" style={{ color: '#D4AF37' }}>Scroll</span>
            </div>
            <span className="eyebrow" style={{ color: '#bbbbbb' }}>01 / 07</span>
          </div>
        </div>

        {/* Right column — always rendered, fades in after name resolves */}
        <div
          ref={rightColRef}
          className="hero-right"
          style={{
            padding: '60px 48px 48px',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          {/* Photo placeholder */}
          <div
            className="photo-placeholder"
            style={{
              flex: 1,
              maxHeight: 360,
              aspectRatio: '3/4',
              borderRadius: 4,
              border: '0.5px solid #d4cfc5',
              position: 'relative',
            }}
          >
            <span>Portrait Photo</span>
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
              Photo Placeholder
            </div>
          </div>

          {/* Stats with gold suffixes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: '0.5px solid #d4cfc5', borderRadius: 4 }}>
            {[
              { num: '12', suffix: 'W', label: 'AWS Internship' },
              { num: '6', suffix: '+', label: 'Projects shipped' },
            ].map((item, i) => (
              <div
                key={item.label}
                style={{
                  padding: '16px 20px',
                  borderRight: i === 0 ? '0.5px solid #d4cfc5' : 'none',
                }}
              >
                <div
                  style={{
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    fontSize: 28,
                    letterSpacing: '-0.02em',
                    color: '#0d0d0d',
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {item.num}<span style={{ color: '#D4AF37', fontWeight: 600 }}>{item.suffix}</span>
                </div>
                <div className="eyebrow">{item.label}</div>
              </div>
            ))}
          </div>

          {/* Spotify */}
          <SpotifyWidget />
        </div>
      </div>

      {/* Status bar — always rendered, fades in after full animation */}
      <div
        ref={statusRef}
        className="hero-status"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: '0.5px solid #d4cfc5',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
        }}
      >
        {[
          'Available May 2026',
          'Open to relocation',
          'Bilingual EN / ES',
        ].map((text, i) => (
          <div
            key={text}
            style={{
              padding: '12px 48px',
              borderRight: i < 2 ? '0.5px solid #d4cfc5' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#D4AF37', flexShrink: 0 }} />
            <span className="eyebrow">{text}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
