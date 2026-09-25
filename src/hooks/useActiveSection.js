import { useEffect, useState } from 'react'
import { HANDOFF_LINE } from '../data/sections'

// Index of the section whose box covers HANDOFF_LINE, the point where a
// section's own label meets the floating counter. The section dots and the
// counter both read this, so they always agree.
export function useActiveSection(containerRef, sectionRefs) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let observer = null

    // A 1px band at HANDOFF_LINE from the container's top edge. Rebuilt on
    // resize because the bottom margin depends on the container's height.
    const observe = () => {
      observer?.disconnect()
      const bottom = container.clientHeight - HANDOFF_LINE - 1
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // height > 0 skips a section that only touches the band's edge
            if (entry.isIntersecting && entry.intersectionRect.height > 0) {
              setActive(parseInt(entry.target.dataset.sectionIndex, 10))
            }
          })
        },
        { root: container, rootMargin: `-${HANDOFF_LINE}px 0px -${bottom}px 0px` }
      )
      sectionRefs.current.forEach((el) => { if (el) observer.observe(el) })
    }

    observe()
    window.addEventListener('resize', observe)
    return () => {
      window.removeEventListener('resize', observe)
      observer.disconnect()
    }
  }, [containerRef, sectionRefs])

  return active
}
