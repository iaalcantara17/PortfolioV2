import { useEffect } from 'react'

// The page scrolls inside .page-scroller, not on body, so locking body does
// nothing. The lock adds .scroll-locked to <html>, which hides the container's
// overflow (see index.css) and stops wheel/touch scrolling. Chrome still
// keyboard-scrolls an overflow: hidden container, so vertical scroll keys are
// blocked too. Counted, so two overlapping locks don't release each other.
const SCROLL_KEYS = new Set([' ', 'PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown'])
let locks = 0

const blockScrollKeys = (e) => {
  if (!SCROLL_KEYS.has(e.key)) return
  // Space still activates a focused button or link
  if (e.key === ' ' && e.target.closest?.('button, a')) return
  e.preventDefault()
}

export function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return
    if (locks++ === 0) {
      document.documentElement.classList.add('scroll-locked')
      window.addEventListener('keydown', blockScrollKeys)
    }
    return () => {
      if (--locks === 0) {
        document.documentElement.classList.remove('scroll-locked')
        window.removeEventListener('keydown', blockScrollKeys)
      }
    }
  }, [locked])
}
