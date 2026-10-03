import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function Cursor() {
  const cursorRef = useRef(null)

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
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.12,
        ease: 'power2.out',
      })
    }

    // The dot grows over anything clickable. One listener on the document, so links and
    // buttons that mount later (the Lightbox's controls, reel frames as the reel moves)
    // count too. Every move onto a new element fires mouseover, which settles the state;
    // mouseout with nowhere to go is the pointer leaving the window.
    const onOver = (e) => cursor.classList.toggle('hovering', !!e.target.closest('a, button'))
    const onOut = (e) => {
      if (!e.relatedTarget) cursor.classList.remove('hovering')
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
    }
  }, [])

  return <div id="custom-cursor" ref={cursorRef} />
}
