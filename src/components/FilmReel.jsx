import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import Photo from './Photo'
import { prefersReducedMotion } from '../utils/motion'
import { LERP as PAGE_LERP } from '../utils/pageScroll'

// Gallery's film reel: one black 35mm band that is both the viewer and the thumbnail
// row, as wide as the section's content. Every photo is the same size, square and
// straight on the black; the current one is in the middle, at full brightness with a
// deep purple ring, with a dimmer neighbor on each side and, at each end, the next
// photo cut off by the band's edge (so the part showing is always the part nearer the
// middle) under a fade and a chevron. It loops both ways with no start or end.
//
// The reel's place is a fractional position, pos, in photos: 2.5 is halfway between
// the third and fourth. Frames sit one step (frame + gap) apart and slide as pos
// changes; their dimming and ring follow their distance from pos. Looping is just the
// photo index wrapping around (k mod n); frames are keyed by k, so nothing is ever
// copied or jumps back.
//
// Moves: drag (mouse, pen, touch, sideways only; vertical swipes still scroll the
// page), a sideways trackpad swipe, a click on a side frame, the chevrons, and the
// arrow keys while the section is on screen. Each move ends settled on a photo. A
// click on the middle frame opens it (onOpen). Frames are placed only while the reel
// moves (GSAP tweens pos); nothing runs while it sits still.

// The reel fills the content width (1344px in the 1440px grid): at that width, 340px
// photos with a 130px end sliver each side and 16px between everything. Narrower or
// shorter, the photos shrink and the slivers take up the rest of the width.
const FRAME = 340
const GAP = 16
// The slivers' share of a photo where the width sets the size (130 / 340)
const EDGE_RATIO = 130 / 340
// Chevron height (128px at 340) and its inset from the band's edge (16px at 340)
const CHEVRON_RATIO = 128 / 340
const CHEVRON_INSET_RATIO = 16 / 340
// A neighbor each side while photos can stay at least this big; below it, just the
// current photo, with the slivers narrowing first, down to MIN_EDGE
const MIN_FRAME = 200
const MIN_EDGE = 30
// Below the band: 7px position dots, 20px down
const DOTS_ROOM = 20 + 7
// Brightness by distance from the middle: the photo itself, its neighbor, then the
// end slivers
const DIM = [1, 0.65]
const DIM_EDGE = 0.4
// PR #18's sprocket rows (12px), plus room for the ring and focus outline on the black
const SPROCKET_ROW = 12
const RING_ROOM = 6
const SPROCKET_PITCH = 14
const DRAG_THRESHOLD = 6
// The same glide as the page's scrolling (Lenis, utils/pageScroll.js). Lenis's lerp of
// 0.1 a frame closes the gap exponentially at 6/s (0.1 × 60fps). expo.out is that same
// curve, 1 − 2^(−10t): over 10·ln2/6 ≈ 1.16s its rate is exactly 6/s, and it ends
// within 0.1% of the target, about where Lenis stops. An exponential has no memory,
// so a new glide from wherever the reel is carries on at the same speed, and repeated
// clicks retarget smoothly, as they do in Lenis.
const GLIDE = { duration: (10 * Math.LN2) / (PAGE_LERP * 60), ease: 'expo.out' }

const mod = (k, n) => ((k % n) + n) % n

// sizes for a photo: the width it's drawn at under object-fit: cover in the square. A
// landscape photo is drawn wider than the square (the 3:2 city photo at 1.5x), so the
// square's own width would fetch a file too small for it.
function coverSizes(photo, frame) {
  const { width, height } = photo.variants[400]
  return `${Math.ceil(frame * Math.max(1, width / height))}px`
}

// The reel across a band `width` wide: photos `frame` px, `neighbors` each side, and
// the end slivers taking up what's left
function sized(neighbors, frameSize, width) {
  const frame = Math.floor(frameSize)
  const edge = (width - (2 * neighbors + 1) * frame - (2 * neighbors + 2) * GAP) / 2
  const chevron = Math.round(frame * CHEVRON_RATIO)
  const chevronWidth = (chevron * 34) / 128
  return {
    neighbors,
    frame,
    edge,
    width,
    chevron,
    // Near the edge, but never past the sliver onto the next photo
    chevronInset: Math.max(4, Math.min(Math.round(frame * CHEVRON_INSET_RATIO), edge - chevronWidth - 4)),
  }
}

// The reel for the space it has: the band always spans the full width. height is the
// room under the header on desktop, where the section is one screen tall; on phones
// the section grows, so there's no limit.
function layoutFor(width, height = Infinity) {
  const byHeight = height - 2 * (SPROCKET_ROW + RING_ROOM) - DOTS_ROOM
  const byWidth = (width - 4 * GAP) / (3 + 2 * EDGE_RATIO)
  if (byWidth >= MIN_FRAME) return sized(1, Math.min(FRAME, byWidth, byHeight), width)
  // Just the current photo, as big as it can be: the slivers narrow first
  return sized(0, Math.min(FRAME, byHeight, width - 2 * GAP - 2 * MIN_EDGE), width)
}

const stepOf = (layout) => layout.frame + GAP

// A frame's place and look at distance d (in photos) from the middle
function frameAt(d, layout) {
  const a = Math.abs(d)
  const levels = [...DIM.slice(0, layout.neighbors + 1), DIM_EDGE]
  const i = Math.min(Math.floor(a), levels.length - 1)
  const next = levels[Math.min(i + 1, levels.length - 1)]
  return {
    x: d * stepOf(layout),
    opacity: levels[i] + (next - levels[i]) * (a - i),
    ring: Math.max(0, 1 - 2 * a),
  }
}

// descriptions: each photo's alt text, by index, the same as the Lightbox's
export default function FilmReel({ photos, descriptions, isVisible, index, onIndexChange, onOpen }) {
  const n = photos.length
  const containerRef = useRef(null)
  const bandRef = useRef(null)
  const frameEls = useRef(new Map())
  // pos: where the reel is; target: the photo (k, unwrapped) it's settled on or heading to
  const reel = useRef({ pos: 0, target: 0, tween: null, drag: null, wheelTimer: null, suppressClick: false })
  const [layout, setLayout] = useState(() => layoutFor(window.innerWidth - 96, window.innerHeight / 2))
  // Frames are mounted around Math.round(pos), enough each side to fill the band
  // while it moves
  const [base, setBase] = useState(0)
  const [activeK, setActiveK] = useState(0)
  const [announcement, setAnnouncement] = useState('')
  // The latest of each for place(), which a running tween keeps calling. Updated
  // before the layout effect below places the frames.
  const latest = useRef({ base, layout })
  useLayoutEffect(() => {
    latest.current = { base, layout }
  }, [base, layout])

  const place = useCallback(() => {
    const { pos } = reel.current
    const { base, layout } = latest.current
    const rounded = Math.round(pos)
    if (rounded !== base) {
      latest.current.base = rounded
      setBase(rounded)
    }
    const half = layout.width / 2
    frameEls.current.forEach((el, k) => {
      const f = frameAt(k - pos, layout)
      const visible = Math.abs(f.x) - layout.frame / 2 < half
      el.style.visibility = visible ? '' : 'hidden'
      if (!visible) return
      el.style.opacity = f.opacity
      el.style.transform = `translate(-50%, -50%) translateX(${f.x}px)`
      el.style.setProperty('--ring', f.ring)
    })
    // The sprockets travel with the film
    const shift = 4 - mod(pos * stepOf(layout), SPROCKET_PITCH)
    bandRef.current.style.backgroundPosition = `${shift}px 3px, ${shift}px calc(100% - 3px)`
  }, [])

  // Frames just mounted (base moved) or resized (layout) get placed before paint
  useLayoutEffect(place, [place, base, layout])

  // Sized to the space the reel has: its width, and on desktop (one-screen sections,
  // the same breakpoint as index.css) the height under the header gap
  useLayoutEffect(() => {
    const container = containerRef.current
    const desktop = window.matchMedia('(min-width: 1024px)')
    const measure = () => {
      const padTop = parseFloat(getComputedStyle(container).paddingTop)
      setLayout(layoutFor(container.clientWidth, desktop.matches ? container.clientHeight - padTop : Infinity))
    }
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    desktop.addEventListener('change', measure)
    return () => {
      observer.disconnect()
      desktop.removeEventListener('change', measure)
    }
  }, [])

  const goTo = useCallback((k, { instant = false } = {}) => {
    const r = reel.current
    r.tween?.kill()
    if (k !== r.target) {
      r.target = k
      setActiveK(k)
      onIndexChange(mod(k, n))
      setAnnouncement(`Photo ${mod(k, n) + 1} of ${n}`)
    }
    if (instant || prefersReducedMotion) {
      r.pos = k
      place()
      return
    }
    r.tween = gsap.to(r, { pos: k, ...GLIDE, onUpdate: place })
  }, [n, onIndexChange, place])

  const step = useCallback((dir) => goTo(reel.current.target + dir), [goTo])

  // index changed from outside (the Lightbox's own previous/next): follow it at once,
  // the short way round
  useEffect(() => {
    const r = reel.current
    const current = mod(r.target, n)
    if (index === current) return
    let delta = mod(index - current, n)
    if (delta > n / 2) delta -= n
    goTo(r.target + delta, { instant: true })
  }, [index, n, goTo])

  // Arrow keys, while the section is on screen and nothing (Lightbox, mobile menu) has
  // locked the page
  useEffect(() => {
    if (!isVisible) return
    const onKeyDown = (e) => {
      if (document.documentElement.classList.contains('scroll-locked')) return
      if (e.key === 'ArrowLeft') step(-1)
      if (e.key === 'ArrowRight') step(1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isVisible, step])

  // Keyboard focus stays on the middle frame as the reel moves under it
  useEffect(() => {
    const focused = document.activeElement
    if (!focused?.classList.contains('reel-frame') || !bandRef.current?.contains(focused)) return
    frameEls.current.get(activeK)?.focus({ preventScroll: true })
  }, [activeK, base])

  // Focus that lands on a side frame goes to the middle one instead: side frames are
  // hidden from screen readers. (The Lightbox hands focus back to the frame that
  // opened it, which its own previous/next may have moved off the middle.)
  const onFocus = (e) => {
    if (!e.target.classList.contains('reel-frame')) return
    const middle = frameEls.current.get(reel.current.target)
    if (middle && e.target !== middle) middle.focus({ preventScroll: true })
  }

  // Drag. The pointer is only captured once it has moved past the threshold, so a
  // plain click still lands on the frame under it.
  const onPointerDown = (e) => {
    if (e.button !== 0 || e.target.closest('.reel-arrow')) return
    const r = reel.current
    r.drag = { id: e.pointerId, x0: e.clientX, pos0: r.pos, moved: false, samples: [[e.timeStamp, e.clientX]] }
  }
  const onPointerMove = (e) => {
    const r = reel.current
    const drag = r.drag
    if (!drag || e.pointerId !== drag.id) return
    const dx = e.clientX - drag.x0
    if (!drag.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return
      drag.moved = true
      r.tween?.kill()
      bandRef.current.setPointerCapture(e.pointerId)
    }
    drag.samples.push([e.timeStamp, e.clientX])
    if (drag.samples.length > 6) drag.samples.shift()
    r.pos = drag.pos0 - dx / stepOf(layout)
    place()
  }
  const onPointerUp = (e) => {
    const r = reel.current
    const drag = r.drag
    if (!drag || e.pointerId !== drag.id) return
    r.drag = null
    if (!drag.moved) return
    r.suppressClick = true
    setTimeout(() => { r.suppressClick = false }, 0)
    // A flick carries on a little, in proportion to its speed at release, but never
    // more than one photo past where it was let go: with four photos, more would spin
    // most of the way round
    const [t0, x0] = drag.samples[0]
    const [t1, x1] = drag.samples[drag.samples.length - 1]
    const velocity = t1 > t0 ? (x1 - x0) / (t1 - t0) : 0
    const carry = Math.max(-1, Math.min(1, -(velocity * 120) / stepOf(layout)))
    goTo(Math.round(r.pos + carry))
  }

  // Sideways trackpad swipes (and shift-wheel) move the reel; vertical ones scroll the
  // page as usual. data-lenis-prevent-horizontal keeps Lenis out of the sideways ones.
  useEffect(() => {
    const band = bandRef.current
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      e.preventDefault()
      const r = reel.current
      r.tween?.kill()
      r.pos += e.deltaX / stepOf(layout)
      place()
      clearTimeout(r.wheelTimer)
      r.wheelTimer = setTimeout(() => goTo(Math.round(r.pos)), 140)
    }
    band.addEventListener('wheel', onWheel, { passive: false })
    return () => band.removeEventListener('wheel', onWheel)
  }, [layout, place, goTo])

  useEffect(() => () => {
    reel.current.tween?.kill()
    clearTimeout(reel.current.wheelTimer)
  }, [])

  const bandHeight = layout.frame + 2 * (SPROCKET_ROW + RING_ROOM)
  // Over the end sliver, the photo's height
  const fadeStyle = { width: layout.edge, height: layout.frame, top: SPROCKET_ROW + RING_ROOM }
  const reach = layout.neighbors + 2
  const frames = []
  for (let k = base - reach; k <= base + reach; k++) frames.push(k)

  return (
    <div ref={containerRef} className="film-reel">
      <div
        ref={bandRef}
        className="reel-band"
        data-lenis-prevent-horizontal
        style={{ width: layout.width, height: bandHeight }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onFocus={onFocus}
        onClickCapture={(e) => {
          if (!reel.current.suppressClick) return
          e.stopPropagation()
          e.preventDefault()
        }}
      >
        {/* The left chevron comes first so Tab runs previous, the middle frame, next */}
        <span className="reel-fade reel-fade-left" style={fadeStyle} aria-hidden="true" />
        <button
          type="button"
          className="reel-arrow reel-arrow-left"
          style={{ width: layout.edge, paddingLeft: layout.chevronInset }}
          onClick={() => step(-1)}
          aria-label="Previous photo"
        >
          <Chevron height={layout.chevron} direction="left" />
        </button>
        {frames.map((k) => {
          const i = mod(k, n)
          const isActive = k === activeK
          return (
            <button
              key={k}
              ref={(el) => {
                if (el) frameEls.current.set(k, el)
                else frameEls.current.delete(k)
              }}
              type="button"
              className="reel-frame"
              style={{ width: layout.frame, height: layout.frame }}
              // The middle frame is the one control; side frames are for mouse and
              // touch, and repeat photos, so screen readers and Tab skip them. The
              // photo's description is the button's name.
              tabIndex={isActive ? 0 : -1}
              aria-hidden={isActive ? undefined : true}
              aria-haspopup="dialog"
              onClick={() => (isActive ? onOpen(i) : goTo(k))}
            >
              <Photo
                photo={photos[i]}
                sizes={coverSizes(photos[i], layout.frame)}
                alt={descriptions[i]}
                loading="lazy"
                draggable={false}
              />
            </button>
          )
        })}

        <span className="reel-fade reel-fade-right" style={fadeStyle} aria-hidden="true" />
        <button
          type="button"
          className="reel-arrow reel-arrow-right"
          style={{ width: layout.edge, paddingRight: layout.chevronInset }}
          onClick={() => step(1)}
          aria-label="Next photo"
        >
          <Chevron height={layout.chevron} direction="right" />
        </button>
      </div>
      {/* Which photo of the set is showing. Decorative: the middle frame's label and
          the announcement say the same to screen readers. */}
      <div className="reel-dots" aria-hidden="true">
        {photos.map((photo, i) => (
          <span key={photo.name} className={i === mod(activeK, n) ? 'active' : undefined} />
        ))}
      </div>
      <span className="sr-only" aria-live="polite">{announcement}</span>
    </div>
  )
}

// A chevron: one polyline (two strokes would show a seam at the point), drawn 1:1
// (viewBox = size) so the stroke keeps its width at any height. The shape is the
// mockup's 34x128, scaled.
function Chevron({ height, direction }) {
  const s = height / 128
  const width = 34 * s
  const [outer, inner] = direction === 'left' ? [25 * s, 9 * s] : [9 * s, 25 * s]
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" aria-hidden="true">
      <polyline points={`${outer},${5 * s} ${inner},${64 * s} ${outer},${124 * s}`} />
    </svg>
  )
}
