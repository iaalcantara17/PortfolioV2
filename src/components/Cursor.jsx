import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function Cursor() {
  const cursorRef = useRef(null)
  const pos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    // Same query index.css gates the dot on. The dot stays hidden until the first
    // move with such a pointer, then appears right under it instead of in a corner.
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    let shown = false

    const onMove = (e) => {
      if (!shown) {
        if (!finePointer.matches) return
        gsap.set(cursor, { x: e.clientX, y: e.clientY })
        cursor.classList.add('visible')
        shown = true
      }
      pos.current = { x: e.clientX, y: e.clientY }
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.12,
        ease: 'power2.out',
      })
    }

    const onEnter = () => cursor.classList.add('hovering')
    const onLeave = () => cursor.classList.remove('hovering')

    window.addEventListener('mousemove', onMove)

    const clickables = document.querySelectorAll('a, button, [data-cursor]')
    clickables.forEach((el) => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    return () => {
      window.removeEventListener('mousemove', onMove)
      clickables.forEach((el) => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
    }
  }, [])

  return <div id="custom-cursor" ref={cursorRef} />
}
