import { useEffect, useRef } from 'react'
import { sections, SECTION_TOTAL, COUNTER_TOP, COUNTER_PAD_Y } from '../data/sections'

const TOTAL = sections.length
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

// active: index of the current section, from useActiveSection (shared with the dots)
export default function SectionCounter({ active }) {
  const numRef = useRef(null)

  // Scramble to the new number whenever the active section changes
  useEffect(() => {
    const numEl = numRef.current
    const target = String(active + 1).padStart(2, '0')
    if (!numEl || numEl.textContent === target) return
    const iv = scrambleNum(numEl, target)
    return () => clearInterval(iv)
  }, [active])

  // Fade each section's own label while it passes under this floating counter
  useEffect(() => {
    let rafId = null

    const tick = () => {
      for (let i = 1; i <= TOTAL; i++) {
        const fixedEl = document.querySelector(`[data-fixed-counter="${i}"]`)
        if (!fixedEl) continue

        const rect = fixedEl.getBoundingClientRect()
        const isOverlapping = rect.top >= 24 && rect.top <= 40
        fixedEl.style.transition = 'opacity 100ms ease'
        fixedEl.style.opacity = isOverlapping ? '0' : '1'
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: COUNTER_TOP,
        left: 28,
        zIndex: 9999,
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
