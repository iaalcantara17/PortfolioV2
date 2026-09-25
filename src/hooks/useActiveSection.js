import { useEffect, useState } from 'react'
import { HANDOFF_LINE } from '../data/sections'

// Index of the section whose box covers HANDOFF_LINE, the point where a
// section's own label meets the floating counter. The section dots and the
// counter both read this, so they always agree.
//
// Checked from geometry once per scroll frame. An IntersectionObserver on a
// 1px band looks cheaper but can miss a change: when a fast scroll lands a
// section boundary exactly on the band's edge, both sections count as
// intersecting, and no further callback fires once the new one covers it.
export function useActiveSection(containerRef, sectionRefs) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let rafId = null

    const update = () => {
      rafId = null
      const line = container.getBoundingClientRect().top + HANDOFF_LINE
      const i = sectionRefs.current.findIndex((el) => {
        if (!el) return false
        const r = el.getBoundingClientRect()
        return r.top <= line && r.bottom > line
      })
      // -1 inside the gaps between stacked mobile sections: keep the last one
      if (i !== -1) setActive(i)
    }
    const schedule = () => {
      if (rafId === null) rafId = requestAnimationFrame(update)
    }

    update()
    container.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      container.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [containerRef, sectionRefs])

  return active
}
