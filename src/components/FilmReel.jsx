import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import Photo from './Photo'
import { prefersReducedMotion } from '../utils/motion'
import { LERP as PAGE_LERP } from '../utils/pageScroll'

// Gallery's film reel: one black 35mm band that is both the viewer and the thumbnail
// row. Every frame is the same size; the current photo is the one in the middle, at
// full brightness with the purple ring, with dimmer neighbors on each side and, at
// each end, the next frame cut off by the band's edge (so the part showing is always
// the half nearer the middle) under a fade and a chevron. It loops both ways with no
// start or end.
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

// The largest the reel gets: a 340px photo in a 2px matte, 20px apart. Smaller screens
// scale the whole reel down together, keeping these proportions (the matte stays 2px).
const FRAME = 344
const GAP = 20
// End slices: the visible part of the cut-off frame at each end
const EDGE_RATIO = 70 / 204
// Corner radius of the matte (6px at full size); the photo's is 2/3 of it
const RADIUS_RATIO = 6 / 344
// Chevron height, and its inset from the band's edge
const CHEVRON_RATIO = 128 / 344
const CHEVRON_INSET_RATIO = 40 / 344
// Two neighbors each side, or one, while frames can stay at least this big; below it,
// fewer. With none, on phones, the end slices narrow first, down to MIN_EDGE.
const MIN_FRAME = 200
const MIN_EDGE = 30
// Below the band: 7px position dots, 14px down
const DOTS_ROOM = 14 + 7
// Brightness by distance from the middle: the photo itself, the first and second
// neighbors, then the end slices
const DIM = [1, 0.65, 0.45]
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

// sizes for a photo in a frame: the width it's drawn at under object-fit: cover in
// the square. A landscape photo is drawn wider than the frame (the 3:2 city photo at
// 1.5x), so the frame's own width would fetch a file too small for it.
function coverSizes(photo, frame) {
  const { width, height } = photo.variants[400]
  return `${Math.ceil((frame - 4) * Math.max(1, width / height))}px`
}

// Band width per pixel of frame, with this many neighbors each side of the middle
const widthPerFrame = (neighbors) =>
  2 * EDGE_RATIO + (2 * neighbors + 1) + ((2 * neighbors + 2) * GAP) / FRAME

// The reel at a given frame size, everything else in proportion
function sized(neighbors, frameSize, edgeSize) {
  const frame = Math.floor(frameSize)
  const edge = edgeSize ?? Math.round(frame * EDGE_RATIO)
  const gap = Math.round((frame * GAP) / FRAME)
  const chevron = Math.round(frame * CHEVRON_RATIO)
  const chevronWidth = (chevron * 20) / 76
  return {
    neighbors,
    frame,
    gap,
    edge,
    width: 2 * edge + (2 * neighbors + 1) * frame + (2 * neighbors + 2) * gap,
    radius: frame * RADIUS_RATIO,
    chevron,
    // Clear of the edge, but never past the end slice onto the next frame
    chevronInset: Math.max(4, Math.min(Math.round(frame * CHEVRON_INSET_RATIO), edge - chevronWidth - 4)),
  }
}

// The reel for the space it has. height is the room under the header on desktop, where
// the section is one screen tall; on phones the section grows, so there's no limit.
function layoutFor(width, height = Infinity) {
  const byHeight = height - 2 * (SPROCKET_ROW + RING_ROOM) - DOTS_ROOM
  for (const neighbors of [2, 1]) {
    const byWidth = Math.min(FRAME, width / widthPerFrame(neighbors))
    if (byWidth >= MIN_FRAME) return sized(neighbors, Math.min(byWidth, byHeight))
  }
  // Just the middle frame. The end slices keep their proportion where there's room,
  // and narrow first where there isn't, so the photo stays as big as it can.
  const perFrame = 1 + (2 * GAP) / FRAME
  const frame = Math.floor(Math.min(FRAME, byHeight, (width - 2 * MIN_EDGE) / perFrame))
  const edge = Math.floor(Math.max(MIN_EDGE, Math.min(frame * EDGE_RATIO, (width - frame * perFrame) / 2)))
  return sized(0, frame, edge)
}

const stepOf = (layout) => layout.frame + layout.gap

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
    // Rounded as a full frame, square as an end slice (the band's edge cuts it)
    radius: layout.radius * Math.max(0, Math.min(1, layout.neighbors + 1 - a)),
  }
}

export default function FilmReel({ photos, isVisible, index, onIndexChange, onOpen }) {
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
      el.style.setProperty('--radius', `${f.radius}px`)
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
        <span className="reel-fade reel-fade-left" style={{ width: layout.edge }} aria-hidden="true" />
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
              // touch, and repeat photos, so screen readers and Tab skip them
              tabIndex={isActive ? 0 : -1}
              aria-hidden={isActive ? undefined : true}
              aria-label={isActive ? `Open photo ${i + 1} of ${n}` : undefined}
              onClick={() => (isActive ? onOpen(i) : goTo(k))}
            >
              <Photo
                photo={photos[i]}
                sizes={coverSizes(photos[i], layout.frame)}
                alt=""
                loading="lazy"
                draggable={false}
              />
            </button>
          )
        })}

        <span className="reel-fade reel-fade-right" style={{ width: layout.edge }} aria-hidden="true" />
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
// (viewBox = size) so the stroke stays 1.6px at any height. The shape is the 20x76
// original, scaled.
function Chevron({ height, direction }) {
  const s = height / 76
  const width = 20 * s
  const [outer, inner] = direction === 'left' ? [15 * s, 5 * s] : [5 * s, 15 * s]
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" aria-hidden="true">
      <polyline points={`${outer},${3 * s} ${inner},${38 * s} ${outer},${73 * s}`} />
    </svg>
  )
}
