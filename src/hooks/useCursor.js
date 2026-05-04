import { useEffect } from 'react'
import { gsap } from 'gsap'

export function useCursor(cursorEl) {
  useEffect(() => {
    if (!cursorEl) return

    const onMove = (e) => {
      gsap.to(cursorEl, { x: e.clientX, y: e.clientY, duration: 0.12, ease: 'power2.out' })
    }

    const onEnter = () => cursorEl.classList.add('hovering')
    const onLeave = () => cursorEl.classList.remove('hovering')

    window.addEventListener('mousemove', onMove)

    const addListeners = () => {
      const clickables = document.querySelectorAll('a, button, [data-cursor]')
      clickables.forEach((el) => {
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }

    addListeners()

    const observer = new MutationObserver(addListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      observer.disconnect()
    }
  }, [cursorEl])
}
