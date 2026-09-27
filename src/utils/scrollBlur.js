// Speed blur: while the page scrolls fast, its content (.page-content) blurs a little;
// at reading speed and at rest it's perfectly sharp. The speed is Lenis's own
// velocity, so this runs only where Lenis does: never under reduced motion.
// Everything fixed on screen (the nav, the cursor, the section dots and counter)
// sits outside .page-content and never blurs.
//
// Tuning. Speeds are how fast the page is moving, in px per second.

// Below this, no blur at all (reading speed)
export const BLUR_START = 1500
// At and above this, the full MAX_BLUR
export const BLUR_FULL = 5000
// The most blur there ever is, in px
export const MAX_BLUR = 2.5
// How long the blur takes to catch up as the page speeds up, in ms
export const RISE_MS = 60
// How long it takes to fade back to nothing once the page slows or stops, in ms
export const DECAY_MS = 130
// Off on touch screens for now: phones and tablets scroll natively, and blurring the
// whole page during a momentum scroll there is the likeliest place for it to stutter
export const ON_TOUCH_SCREENS = false

// Below this the filter comes off entirely (not blur(0)): a filter on .page-content
// makes it what position: fixed inside it is placed against, and the Lightboxes are
// fixed and live inside it
const OFF = 0.05
// Updates further apart than this aren't one continuous scroll; the first one after a
// pause counts as no speed, so a single jump (a link to a section, the Gallery reel
// following the Lightbox) never flashes a blur
const CONTINUOUS_MS = 100

export function initScrollBlur(lenis, content) {
  if (!ON_TOUCH_SCREENS && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return null

  let speed = 0
  let blur = 0
  let lastUpdate = -Infinity
  let lastFrame = 0
  let frame = null
  const debug = new URLSearchParams(window.location.search).has('blurdebug') ? debugReadout() : null

  const apply = () => {
    content.style.filter = blur > OFF ? `blur(${blur.toFixed(2)}px)` : ''
  }

  // Frames run only while there's speed or blur left, then stop
  const tick = (now) => {
    frame = null
    const dt = Math.min(64, now - lastFrame)
    lastFrame = now
    // No updates for a moment: the page has stopped
    if (now - lastUpdate > CONTINUOUS_MS) speed = 0
    const t = Math.min(1, Math.max(0, (speed - BLUR_START) / (BLUR_FULL - BLUR_START)))
    const goal = MAX_BLUR * t
    // Eases toward the goal, most of the way (95%) in RISE_MS or DECAY_MS
    const ms = goal > blur ? RISE_MS : DECAY_MS
    blur += (goal - blur) * (1 - Math.exp((-3 * dt) / ms))
    if (goal === 0 && blur <= OFF) blur = 0
    apply()
    debug?.(speed, blur)
    if (blur > 0 || speed > 0) frame = requestAnimationFrame(tick)
  }

  // Lenis's velocity is px per update: a frame while it eases, a native scroll event
  // otherwise. Per second, it's divided by the time between updates, averaged over the
  // last few, since one update landing a few ms early would read as a spike. The
  // average follows the display's rate (16.7ms at 60Hz, 8.3ms at 120Hz).
  let interval = 1000 / 60
  const offScroll = lenis.on('scroll', ({ velocity }) => {
    const now = performance.now()
    const gap = now - lastUpdate
    lastUpdate = now
    if (gap < CONTINUOUS_MS) {
      interval += (Math.min(Math.max(gap, 4), 50) - interval) * 0.25
      speed = (Math.abs(velocity) * 1000) / interval
    } else {
      speed = 0
    }
    if (frame === null) {
      lastFrame = now
      frame = requestAnimationFrame(tick)
    }
  })

  return {
    // At once, no fade: the page is being locked for a modal (see OFF)
    clear() {
      if (frame !== null) cancelAnimationFrame(frame)
      frame = null
      speed = 0
      blur = 0
      apply()
    },
    destroy() {
      offScroll()
      this.clear()
    },
  }
}

// TEMPORARY, for tuning on real hardware: ?blurdebug shows the speed Lenis reports,
// the fastest in the last second, and the blur. It comes out once the numbers are set.
function debugReadout() {
  const el = document.createElement('div')
  el.style.cssText =
    'position:fixed;left:12px;bottom:12px;z-index:10000;padding:6px 10px;background:#0d0d0d;color:#f5f2ec;font:12px/1.4 ui-monospace,monospace;border-radius:4px;pointer-events:none'
  document.body.appendChild(el)
  const recent = []
  const stats = { speed: 0, peak: 0, blur: 0, maxBlur: 0 }
  window.__scrollBlur = stats
  return (speed, blur) => {
    const now = performance.now()
    recent.push([now, speed])
    while (recent[0][0] < now - 1000) recent.shift()
    stats.speed = speed
    stats.peak = Math.max(...recent.map(([, s]) => s))
    stats.blur = blur
    stats.maxBlur = Math.max(stats.maxBlur, blur)
    el.textContent = `speed ${Math.round(speed)} px/s · peak (1s) ${Math.round(stats.peak)} · blur ${blur.toFixed(2)} px`
  }
}
