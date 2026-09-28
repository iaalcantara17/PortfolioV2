import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import Photo from '../Photo'
import { photoByName, photoAlt } from '../../data/photos'
import { prefersReducedMotion, entranceStart, pulseAvailability } from '../../utils/motion'

// Drawn width of the 3:2 portrait under object-fit: cover in the square box.
// Must match imagesizes on the portrait preload in index.html
const HERO_PHOTO_SIZES = '(max-width: 420px) 150vw, 630px'

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
  { ch: '—', style: { color: 'var(--color-purple)', fontSize: '0.8em', fontWeight: '700' } },
]
const NAME_LINE3 = 'tara.'.split('').map(ch => ({ ch }))

const SUBTEXT_CHARS = [
  ...'Builder. '.split('').map(ch => ({ ch })),
  ...'AWS alum.'.split('').map(ch => ({ ch, style: { fontWeight: '500', color: 'var(--color-ink)' } })),
  ...' NJIT Computer Science.'.split('').map(ch => ({ ch })),
  { ch: '', isBR: true },
  ...'Bilingual.'.split('').map(ch => ({ ch })),
]

const SIEMPRE_CHARS = 'Siempre aprendiendo.'.split('').map(ch => ({ ch }))

// The typed characters are drawn by CSS from data-glyph ([data-glyph]::before in
// index.css), not written as text. The Hero's real text is its screen-reader copy
// (the h1's name, the intro paragraph), so search engines and assistive tech read
// each line once instead of also reading the typed-out copies.
function setGlyph(el, ch) {
  el.dataset.glyph = ch
}

// Static render of a char list, matching what scheduleChars types out
function renderChars(charDefs) {
  return charDefs.map((c, i) => (c.isBR ? <br key={i} /> : <span key={i} style={c.style} data-glyph={c.ch} />))
}

// A char list as one plain string, line breaks as spaces, for screen readers
function plainText(charDefs) {
  return charDefs.map((c) => (c.isBR ? ' ' : c.ch)).join('')
}

// Appends a char's final node: a <br>, or a span with its resolved text and style
function appendFinalChar(container, charDef) {
  if (charDef.isBR) return container.appendChild(document.createElement('br'))
  const span = document.createElement('span')
  if (charDef.style) Object.assign(span.style, charDef.style)
  setGlyph(span, charDef.ch)
  return container.appendChild(span)
}

// Fewest random glyphs a slot scrambles through, even for a narrow final character
const MIN_SLOT_GLYPHS = 6

// POOL's glyph widths per font (a canvas measures them once per font the Hero uses)
const glyphWidthsByFont = new Map()
function measureGlyphs(el) {
  const cs = getComputedStyle(el)
  const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
  if (!glyphWidthsByFont.has(font)) {
    const ctx = document.createElement('canvas').getContext('2d')
    ctx.font = font
    const measure = (ch) => ctx.measureText(ch).width
    glyphWidthsByFont.set(font, { measure, pool: [...POOL].map((ch) => ({ ch, width: measure(ch) })) })
  }
  return glyphWidthsByFont.get(font)
}

// Narrowest random glyph a slot uses, as a share of its final character's width
const MIN_GLYPH_SHARE = 0.7

// The random glyphs a slot scrambles through: close to its final character's width
// but no wider, so a scrambling glyph never runs into the characters beside it and
// leaves little gap. A narrow final character (".") falls back to the narrowest few.
function slotGlyphs(span, finalCh) {
  const { measure, pool } = measureGlyphs(span)
  const target = measure(finalCh)
  const fits = pool.filter((g) => g.width <= target + 0.5).sort((a, b) => b.width - a.width)
  let glyphs = fits.filter((g) => g.width >= target * MIN_GLYPH_SHARE)
  if (glyphs.length < MIN_SLOT_GLYPHS) glyphs = fits.slice(0, MIN_SLOT_GLYPHS)
  if (glyphs.length < MIN_SLOT_GLYPHS) glyphs = [...pool].sort((a, b) => a.width - b.width).slice(0, MIN_SLOT_GLYPHS)
  return glyphs.map((g) => g.ch)
}

// While a char scrambles, its final character holds its place in the line, invisible,
// and the random glyphs are drawn over it. The characters after it then never move
// (they were pushed along by each glyph's width, a layout shift). line-height normal
// puts the drawn glyph on the same baseline as the text around it. The span must be
// in the page, for its font. Returns a function that shows the next random glyph.
function holdSlot(span, finalCh) {
  const glyphs = slotGlyphs(span, finalCh)
  span.style.position = 'relative'
  const hold = document.createElement('span')
  hold.style.visibility = 'hidden'
  setGlyph(hold, finalCh)
  const glyph = document.createElement('span')
  Object.assign(glyph.style, { position: 'absolute', left: '0', top: '0', lineHeight: 'normal' })
  const scramble = () => setGlyph(glyph, glyphs[Math.floor(Math.random() * glyphs.length)])
  scramble()
  span.append(hold, glyph)
  return scramble
}

// Ends a scramble: the span holds only its final character, as if never scrambled
function resolveSlot(span, finalCh) {
  span.style.position = ''
  span.replaceChildren()
  setGlyph(span, finalCh)
}

function scheduleChars(charDefs, containerRef, startOffset, timers, intervals, resolvers) {
  // Spaces waiting to go in with the next character
  let waitingSpaces = []

  for (let i = 0; i < charDefs.length; i++) {
    const charDef = charDefs[i]
    const startAt = startOffset + i * CHAR_STAGGER
    const state = { span: null, iv: null, resolveT: null, done: false }

    const finishNow = () => {
      if (state.done) return
      state.done = true
      if (state.iv) clearInterval(state.iv)
      if (state.resolveT) clearTimeout(state.resolveT)
      const container = containerRef.current
      if (!state.span) {
        if (container) state.span = appendFinalChar(container, charDef)
      } else if (!charDef.isBR) {
        resolveSlot(state.span, charDef.ch)
      }
    }
    resolvers.push(finishNow)

    // A space goes in with the character after it, in the same task. Alone, it sat at
    // the end of the line for a moment, where the browser collapses it, and it counted
    // as a layout shift once the next character arrived. A space at the end of a line
    // draws nothing, so this changes nothing on screen.
    if (charDef.ch === ' ' && i < charDefs.length - 1) {
      waitingSpaces.push(finishNow)
      continue
    }
    const spacesBefore = waitingSpaces
    waitingSpaces = []

    const t = setTimeout(() => {
      const container = containerRef.current
      if (!container) return
      spacesBefore.forEach((appendSpace) => appendSpace())

      if (charDef.isBR) {
        container.appendChild(document.createElement('br'))
        state.span = true
        state.done = true
        return
      }

      const span = document.createElement('span')
      if (charDef.style) Object.assign(span.style, charDef.style)
      state.span = span

      if (charDef.noScramble || charDef.ch === ' ') {
        setGlyph(span, charDef.ch)
        container.appendChild(span)
        state.done = true
        return
      }

      container.appendChild(span)
      const scramble = holdSlot(span, charDef.ch)

      const iv = setInterval(scramble, SCRAMBLE_TICK)
      state.iv = iv
      intervals.push(iv)

      const resolveT = setTimeout(() => {
        clearInterval(iv)
        resolveSlot(span, charDef.ch)
        state.done = true
      }, SCRAMBLE_MS)
      state.resolveT = resolveT
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
  const siempreRef = useRef(null)
  const eyebrowRef = useRef(null)
  const bottomRef = useRef(null)
  const statsRef = useRef(null)
  const statusRef = useRef(null)
  const completedRef = useRef(false)

  // Set initial hidden state on mount, before the first paint, so nothing shows for
  // a frame and then disappears. Skipped once resolved, so a StrictMode (dev-only)
  // remount doesn't re-hide elements the early resolve already revealed.
  useLayoutEffect(() => {
    if (completedRef.current) return
    gsap.set(eyebrowRef.current, { opacity: 0 })
    gsap.set(statsRef.current, entranceStart({ opacity: 0, x: 20 }))
    gsap.set(statusRef.current, entranceStart({ opacity: 0, y: 10 }))
    gsap.set(bottomRef.current, { opacity: 0 })
  }, [])

  useEffect(() => {
    // Already resolved (naturally or early, on scroll-away) — everything is visible, nothing to replay
    if (!isVisible || completedRef.current) return

    // Always-rendered nodes, captured so the cleanup below acts on the same elements
    const eyebrow = eyebrowRef.current
    const stats = statsRef.current
    const status = statusRef.current
    const bottom = bottomRef.current

    // Reduced motion: no typewriter or scramble. The final text goes in at once and
    // the whole Hero fades in together.
    if (prefersReducedMotion) {
      const typed = [
        [NAME_LINE1, word1Ref], [NAME_LINE2, word2Ref], [NAME_LINE3, word3Ref],
        [SUBTEXT_CHARS, subtextBodyRef], [SIEMPRE_CHARS, siempreRef],
      ]
      typed.forEach(([charDefs, ref]) => charDefs.forEach((charDef) => appendFinalChar(ref.current, charDef)))
      completedRef.current = true
      gsap.fromTo(typed.map(([, ref]) => ref.current), { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' })
      gsap.to([eyebrow, stats, status, bottom], {
        opacity: 1, duration: 0.6, ease: 'power2.out',
        onComplete: () => pulseAvailability(status.querySelector('.availability-dot')),
      })
      return
    }

    const timers = []
    const intervals = []
    const resolvers = []

    // Eyebrow fades in before typing starts
    gsap.to(eyebrow, { opacity: 1, duration: 0.4, ease: 'power2.out', delay: 0.15 })

    // Schedule name lines back-to-back
    let offset = 0
    scheduleChars(NAME_LINE1, word1Ref, offset, timers, intervals, resolvers)
    offset = NAME_LINE1.length * CHAR_STAGGER
    scheduleChars(NAME_LINE2, word2Ref, offset, timers, intervals, resolvers)
    offset = (NAME_LINE1.length + NAME_LINE2.length) * CHAR_STAGGER
    const nameDoneAt = scheduleChars(NAME_LINE3, word3Ref, offset, timers, intervals, resolvers)

    // Right column's stats fade in right after name resolves — not gated on full
    // animation. The portrait above them is shown from the start.
    const statsFadeT = setTimeout(() => {
      gsap.to(stats, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' })
    }, nameDoneAt + 150)
    timers.push(statsFadeT)

    // Subtext after 400ms pause from name end
    const subtextDoneAt = scheduleChars(
      SUBTEXT_CHARS, subtextBodyRef,
      nameDoneAt + 400,
      timers, intervals, resolvers
    )

    // Siempre after 300ms pause from subtext end
    const siempreDoneAt = scheduleChars(
      SIEMPRE_CHARS, siempreRef,
      subtextDoneAt + 300,
      timers, intervals, resolvers
    )

    // Status bar and bottom fade in after full animation
    const finalFadeT = setTimeout(() => {
      completedRef.current = true
      gsap.to(status, {
        opacity: 1, y: 0, duration: 0.5, ease: 'power3.out',
        onComplete: () => pulseAvailability(status.querySelector('.availability-dot')),
      })
      gsap.to(bottom, { opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 })
    }, siempreDoneAt + 150)
    timers.push(finalFadeT)

    return () => {
      timers.forEach(clearTimeout)
      intervals.forEach(clearInterval)

      // If we're tearing down mid-scramble (scrolled away before it finished),
      // resolve every character to its final text at once instead of leaving it stuck.
      if (!completedRef.current) {
        resolvers.forEach((finishNow) => finishNow())
        gsap.set(eyebrow, { opacity: 1 })
        gsap.set(stats, { opacity: 1, x: 0 })
        gsap.set(status, { opacity: 1, y: 0 })
        gsap.set(bottom, { opacity: 1 })
        completedRef.current = true
      }
    }
  }, [isVisible])

  const wordStyle = {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(52px, 6vw, 72px)',
    lineHeight: 0.92,
    letterSpacing: '-0.03em',
    color: 'var(--color-ink)',
    display: 'block',
    minHeight: '0.92em',
  }

  return (
    // fit-content: on a desktop screen too short for the columns plus the status bar,
    // the Hero grows past one screen (same as About and Projects) and the status bar
    // ends up below the fold, instead of overlapping the columns
    <section
      className="page-section fit-content"
      style={{ background: 'var(--color-paper)', borderBottom: '0.5px solid var(--color-line)' }}
    >
      <div
        className="hero-grid"
        style={{
          display: 'grid',
          height: '100%',
          paddingTop: 56,
        }}
      >
        {/* Left column. 20px bottom padding keeps the scroll hint 20px above the
            status bar, which now sits below the columns rather than over them. */}
        <div
          className="hero-left"
          style={{
            padding: '60px 48px 20px',
            borderRight: '0.5px solid var(--color-line)',
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
              <div style={{ width: 32, height: 1, background: 'var(--color-purple)', flexShrink: 0 }} />
              <span className="eyebrow">Software Engineer · MBA Candidate</span>
            </div>

            {/* Name — empty on mount, chars appended by typewriter. Screen readers get
                the plain name; the typed-out lines (split surname, dash, scramble) are
                hidden from them. */}
            <h1 style={{ marginBottom: 32 }}>
              <span className="sr-only">Israel Alcántara</span>
              <span aria-hidden="true" style={{ display: 'block' }}>
                <span ref={word1Ref} style={wordStyle} />
                <span ref={word2Ref} style={wordStyle} />
                <span ref={word3Ref} style={wordStyle} />
              </span>
            </h1>

            {/* Subtext — the typewriter appends chars to the overlay. The hidden copy
                underneath reserves the final text's height from the start, so the
                stacked mobile layout doesn't shift down when the text resolves.
                Screen readers get the plain text, never the scrambling overlay. */}
            <div style={{ position: 'relative', color: 'var(--color-muted)', fontSize: 13, lineHeight: 1.9, maxWidth: 360 }}>
              <p className="sr-only">
                {plainText(SUBTEXT_CHARS)} <em>{plainText(SIEMPRE_CHARS)}</em>
              </p>
              <div aria-hidden="true" style={{ visibility: 'hidden' }}>
                <span>{renderChars(SUBTEXT_CHARS)}</span>
                <br />
                <em>{renderChars(SIEMPRE_CHARS)}</em>
              </div>
              <div aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
                <span ref={subtextBodyRef} />
                <br />
                <em ref={siempreRef} style={{ color: 'var(--color-purple-deep)', fontStyle: 'italic' }} />
              </div>
            </div>
          </div>

          {/* Bottom — scroll indicator + counter, fades in after full animation */}
          <div ref={bottomRef} className="hero-bottom">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 1, height: 32, background: 'var(--color-gold)' }} />
                <div style={{ width: 0, height: 0, borderLeft: '3px solid transparent', borderRight: '3px solid transparent', borderTop: '5px solid var(--color-gold)' }} />
              </div>
              <span className="eyebrow" style={{ color: 'var(--color-gold)' }}>Scroll</span>
            </div>
          </div>
        </div>

        {/* Right column — always rendered. The portrait (the page's largest image, so
            its LCP) shows from the first paint; the stats fade in after the name
            resolves. */}
        <div
          className="hero-right"
          style={{
            padding: '60px 0 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
          }}
        >
          {/* Photo placeholder */}
          <div
            className="photo-placeholder"
            style={{
              width: '100%',
              maxWidth: 420,
              aspectRatio: '1 / 1',
              borderRadius: 4,
              border: '0.5px solid var(--color-line)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Photo
              photo={photoByName.portrait}
              sizes={HERO_PHOTO_SIZES}
              fetchPriority="high"
              alt={photoAlt.portrait}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', display: 'block' }}
            />
          </div>

          {/* Stats with gold suffixes */}
          <div ref={statsRef} style={{ width: '100%', maxWidth: 420, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: '0.5px solid var(--color-line)', borderRadius: 4 }}>
            {[
              { num: '12', suffix: 'W', label: 'AWS Internship' },
              { num: '6', suffix: '+', label: 'Projects shipped' },
            ].map((item, i) => (
              <div
                key={item.label}
                style={{
                  padding: '16px 20px',
                  borderRight: i === 0 ? '0.5px solid var(--color-line)' : 'none',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 28,
                    letterSpacing: '-0.02em',
                    color: 'var(--color-ink)',
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {item.num}<span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>{item.suffix}</span>
                </div>
                <div className="eyebrow">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status bar — always rendered, fades in after full animation. In the page
          flow after the columns, so they can't run underneath it. */}
      <div
        ref={statusRef}
        className="hero-status"
        style={{
          borderTop: '0.5px solid var(--color-line)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
        }}
      >
        {[
          'Available now',
          'Open to relocation',
          'Bilingual EN / ES',
        ].map((text, i) => (
          <div
            key={text}
            style={{
              padding: '12px 48px',
              borderRight: i < 2 ? '0.5px solid var(--color-line)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {text === 'Available now'
              ? <div className="availability-dot" />
              : <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-gold)', flexShrink: 0 }} />}
            <span className="eyebrow">{text}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
