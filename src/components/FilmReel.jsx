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

// A 200px photo in a 2px matte, every frame alike
const FRAME = 204
const GAP = 10
// Visible slice of the cut-off frame at each end
const EDGE = 70
// On the narrowest screens the end slices give way first, down to this
const MIN_EDGE = 30
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
// the 200px square. A landscape photo is drawn wider than the frame (the 3:2 city
// photo at 1.5×), so the frame's own width would fetch a file too small for it.
function coverSizes(photo) {
  const { width, height } = photo.variants[400]
  return `${Math.ceil((FRAME - 4) * Math.max(1, width / height))}px`
}

// Band width with this many neighbors each side of the middle frame
const bandWidth = (neighbors) => 2 * EDGE + (2 * neighbors + 1) * FRAME + (2 * neighbors + 2) * GAP

// As many neighbors as fit: two (1220px), one (792px), or none, where the middle frame
// sits between the end slices (364px). Below that the slices narrow, and past
// MIN_EDGE the frame itself shrinks.
function layoutFor(width) {
  for (const neighbors of [2, 1]) {
    if (width >= bandWidth(neighbors)) return { neighbors, width: bandWidth(neighbors), frame: FRAME, edge: EDGE }
  }
  const band = Math.min(bandWidth(0), width)
  const edge = Math.max(MIN_EDGE, Math.min(EDGE, (band - FRAME - 2 * GAP) / 2))
  return { neighbors: 0, width: band, frame: band - 2 * edge - 2 * GAP, edge }
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

export default function FilmReel({ photos, isVisible, index, onIndexChange, onOpen }) {
  const n = photos.length
  const containerRef = useRef(null)
  const bandRef = useRef(null)
  const frameEls = useRef(new Map())
  // pos: where the reel is; target: the photo (k, unwrapped) it's settled on or heading to
  const reel = useRef({ pos: 0, target: 0, tween: null, drag: null, wheelTimer: null, suppressClick: false })
  const [layout, setLayout] = useState(() => layoutFor(window.innerWidth - 96))
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

  // Narrow or wide, from the width the reel has
  useLayoutEffect(() => {
    const container = containerRef.current
    const observer = new ResizeObserver(() => setLayout(layoutFor(container.clientWidth)))
    observer.observe(container)
    return () => observer.disconnect()
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
          style={{ width: layout.edge }}
          onClick={() => step(-1)}
          aria-label="Previous photo"
        >
          <svg width="20" height="76" viewBox="0 0 20 76" fill="none" aria-hidden="true">
            <polyline points="15,3 5,38 15,73" />
          </svg>
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
                sizes={coverSizes(photos[i])}
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
          style={{ width: layout.edge }}
          onClick={() => step(1)}
          aria-label="Next photo"
        >
          <svg width="20" height="76" viewBox="0 0 20 76" fill="none" aria-hidden="true">
            <polyline points="5,3 15,38 5,73" />
          </svg>
        </button>
      </div>
      <span className="sr-only" aria-live="polite">{announcement}</span>
    </div>
  )
}
