import { useEffect, useRef } from 'react'

const TOTAL = 7
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

export default function SectionCounter({ containerRef }) {
  const floatRef = useRef(null)
  const numRef = useRef(null)
  const activeRef = useRef(1)
  const ivRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let rafId = null
    let prevScrollTop = container.scrollTop

    const tick = () => {
      const float = floatRef.current
      const numEl = numRef.current
      if (!float || !numEl) {
        rafId = requestAnimationFrame(tick)
        return
      }

      const currentScrollTop = container.scrollTop
      const scrollingDown = currentScrollTop >= prevScrollTop
      prevScrollTop = currentScrollTop

      const floatRect = float.getBoundingClientRect()
      const floatingCenterY = floatRect.top + floatRect.height / 2

      let newActive = activeRef.current

      for (let i = 1; i <= TOTAL; i++) {
        const fixedEl = document.querySelector(`[data-fixed-counter="${i}"]`)
        if (!fixedEl) continue

        const rect = fixedEl.getBoundingClientRect()
        const centerY = rect.top + rect.height / 2

        if (scrollingDown && centerY <= floatingCenterY) {
          // Keep updating to highest i whose center has crossed floating center
          newActive = i
        } else if (!scrollingDown && i === activeRef.current && centerY > floatingCenterY) {
          // Active section's counter has receded above the floating center while scrolling up
          newActive = Math.max(1, i - 1)
        }

        const isOverlapping = rect.top >= 24 && rect.top <= 40
        fixedEl.style.transition = 'opacity 100ms ease'
        fixedEl.style.opacity = isOverlapping ? '0' : '1'
      }

      if (newActive !== activeRef.current) {
        activeRef.current = newActive
        if (ivRef.current) clearInterval(ivRef.current)
        ivRef.current = scrambleNum(numEl, String(newActive).padStart(2, '0'))
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      if (ivRef.current) clearInterval(ivRef.current)
    }
  }, [containerRef])

  return (
    <div
      ref={floatRef}
      style={{
        position: 'fixed',
        top: 46,
        left: 28,
        zIndex: 9999,
        pointerEvents: 'none',
        background: 'rgba(245, 242, 236, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: 3,
        padding: '1px 4px',
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 400,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#0d0d0d',
          display: 'block',
        }}
      >
        <span ref={numRef}>01</span> / 07
      </span>
    </div>
  )
}
