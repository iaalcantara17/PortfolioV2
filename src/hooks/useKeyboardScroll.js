import { useEffect } from 'react'

const LINE = 40

// The page scrolls inside .page-scroller, and browsers keyboard-scroll only the
// scroller that holds focus. With focus on the body (nothing clicked yet), the nav
// or the section dots, the scroll keys did nothing. This scrolls the container for
// those keys; with focus inside it, the browser's own handling is left alone.
export function useKeyboardScroll(containerRef) {
  useEffect(() => {
    const onKeyDown = (e) => {
      const container = containerRef.current
      if (!container || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
      if (container.contains(e.target)) return
      // A modal (Lightbox, mobile menu) has locked the page
      if (document.documentElement.classList.contains('scroll-locked')) return
      // Space still activates a focused button or link
      if (e.key === ' ' && e.target.closest?.('button, a, [role="button"]')) return

      // Same step as the browser's own page scroll: most of a screen, with overlap
      const page = container.clientHeight * 0.875
      const delta = {
        ArrowDown: LINE,
        ArrowUp: -LINE,
        PageDown: page,
        PageUp: -page,
        ' ': e.shiftKey ? -page : page,
      }[e.key]

      if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault()
        container.scrollTo({ top: e.key === 'Home' ? 0 : container.scrollHeight })
      } else if (delta !== undefined) {
        e.preventDefault()
        container.scrollBy({ top: delta })
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [containerRef])
}
