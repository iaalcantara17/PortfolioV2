import { useEffect, useRef } from 'react'
import { SECTION_TOTAL, COUNTER_TOP, COUNTER_PAD_Y } from '../data/sections'
import { prefersReducedMotion } from '../utils/motion'

const TICK_MS = 40
const SCRAMBLE_MS = 200

function scrambleNum(el, target) {
  let frame = 0
  const frames = Math.ceil(SCRAMBLE_MS / TICK_MS)
  const iv = setInterval(() => {
    frame++
    el.textContent = String(Math.floor(Math.random() * 98) + 1).padStart(2, '0')
    if (frame >= frames) {
      clearInterval(iv)
      el.textContent = target
    }
  }, TICK_MS)
  return iv
}

// active: index of the current section, from useActiveSection
// containerRef: the page scroller
export default function SectionCounter({ active, containerRef }) {
  const numRef = useRef(null)

  // Scramble to the new number whenever the active section changes
  useEffect(() => {
    const numEl = numRef.current
    const target = String(active + 1).padStart(2, '0')
    if (!numEl || numEl.textContent === target) return
    // Reduced motion: the new number, no scramble
    if (prefersReducedMotion) {
      numEl.textContent = target
      return
    }
    const iv = scrambleNum(numEl, target)
    return () => clearInterval(iv)
  }, [active])

  // Fade each section's own label while it passes under this floating counter (the
  // fade itself is SectionLabel's transition). A label only moves when the page
  // scrolls, the window resizes or a section changes size, so it's checked then, at
  // most once a frame, and nothing runs while the page sits still.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const labels = [...document.querySelectorAll('[data-fixed-counter]')]
    let rafId = null

    const update = () => {
      rafId = null
      labels.forEach((label) => {
        const { top } = label.getBoundingClientRect()
        const isOverlapping = top >= 24 && top <= 40
        label.style.opacity = isOverlapping ? '0' : '1'
      })
    }
    const schedule = () => {
      if (rafId === null) rafId = requestAnimationFrame(update)
    }

    update()
    container.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    // A section growing or shrinking moves the labels after it without a scroll
    const observer = new ResizeObserver(schedule)
    labels.forEach((label) => observer.observe(label.parentElement))
    return () => {
      container.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      observer.disconnect()
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [containerRef])

  return (
    <div
      className="section-counter"
      style={{
        position: 'fixed',
        top: COUNTER_TOP,
        left: 28,
        // Above the nav (500) and the mobile menu (450), under the Lightbox (1000),
        // whose backdrop covers it like the rest of the page
        zIndex: 999,
        pointerEvents: 'none',
        background: 'var(--color-paper-a72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: 3,
        padding: `${COUNTER_PAD_Y}px 4px`,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 400,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--color-ink)',
          display: 'block',
        }}
      >
        <span ref={numRef}>01</span> / {SECTION_TOTAL}
      </span>
    </div>
  )
}
