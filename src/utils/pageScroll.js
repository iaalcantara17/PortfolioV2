import Lenis from 'lenis'
import { prefersReducedMotion } from './motion'

// Wheel and trackpad scrolling is eased by Lenis, which still moves the page by
// setting .page-scroller's real scrollTop, so everything that watches the scroller
// (entrances, the section dots and counter, the nav) works as before. Touch stays
// native. Under reduced motion Lenis isn't created at all: the page scrolls
// natively and these helpers fall back to the browser's own (instant) scrolling.

// The share of the remaining distance each frame covers: Lenis's default glide.
// Named here because scrollPageBy has to pass it to Lenis itself, and exported so the
// Gallery reel (FilmReel.jsx) glides the same way
export const LERP = 0.1

let scroller = null
let lenis = null
let frame = null
// A section asked for while a modal had the page locked (a mobile menu link closes
// the menu and navigates in the same click), scrolled to once the lock lifts
let pending = null

// Lenis listens for both wheel and touch on its events target. Handing it only the
// wheel keeps touch scrolling fully native, with no touch listeners that the
// browser has to wait on before it scrolls.
const wheelOnly = (el) => ({
  addEventListener: (type, fn, options) => type === 'wheel' && el.addEventListener(type, fn, options),
  removeEventListener: (type, fn, options) => type === 'wheel' && el.removeEventListener(type, fn, options),
})

// Frames run only while an eased scroll is under way, not for the life of the page
const tick = (time) => {
  frame = null
  lenis.raf(time)
  if (lenis.isScrolling === 'smooth') frame = requestAnimationFrame(tick)
}
function run() {
  if (!lenis || frame !== null) return
  frame = requestAnimationFrame((time) => {
    // Lenis steps by the time since its last frame, which after a pause would be
    // the whole pause and jump straight to the target: start from one normal frame
    lenis.time = time - 1000 / 60
    tick(time)
  })
}

// Sets up the page's scrolling. content is the one box holding every section, so
// Lenis sees the page grow. Returns the cleanup.
export function initPageScroll(wrapper, content) {
  scroller = wrapper
  if (!prefersReducedMotion) {
    lenis = new Lenis({
      wrapper,
      content,
      eventsTarget: wheelOnly(wrapper),
      lerp: LERP,
      // Called for each wheel event before Lenis eases toward it
      virtualScroll: () => {
        run()
        return true
      },
    })
  }
  return () => {
    if (frame !== null) cancelAnimationFrame(frame)
    frame = null
    lenis?.destroy()
    lenis = null
    scroller = null
    pending = null
  }
}

// Scrolls the page to an element or a scrollTop, eased
export function scrollPageTo(target) {
  if (!lenis) {
    if (typeof target === 'number') scroller?.scrollTo({ top: target })
    else target.scrollIntoView()
    return
  }
  if (lenis.isStopped) {
    pending = target
    return
  }
  lenis.scrollTo(target)
  run()
}

// Moves the page by delta px (a scroll key), from wherever the current eased
// scroll is heading, so repeated or held keys add up the way wheel steps do
export function scrollPageBy(delta) {
  if (!lenis) {
    scroller?.scrollBy({ top: delta })
    return
  }
  lenis.scrollTo(lenis.targetScroll + delta, { programmatic: false, lerp: LERP })
  run()
}

// Modal scroll lock (useScrollLock): .scroll-locked hides the scroller's overflow,
// but Lenis sets scrollTop itself, which overflow: hidden doesn't stop
export function pausePageScroll() {
  lenis?.stop()
}
export function resumePageScroll() {
  if (!lenis) return
  lenis.start()
  if (pending !== null) {
    const target = pending
    pending = null
    scrollPageTo(target)
  }
}
