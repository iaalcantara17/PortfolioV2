import { useEffect } from 'react'

export default function ScrollProgress({ containerRef }) {
  useEffect(() => {
    const bar = document.getElementById('scroll-progress')
    if (!bar) return

    const container = containerRef?.current || window
    const isWindow = container === window

    const onScroll = () => {
      const el = isWindow ? document.documentElement : container
      const scrollTop = isWindow ? window.scrollY : el.scrollTop
      const scrollHeight = isWindow
        ? el.scrollHeight - el.clientHeight
        : el.scrollHeight - el.clientHeight
      const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
      bar.style.width = pct + '%'
    }

    container.addEventListener('scroll', onScroll)
    return () => container.removeEventListener('scroll', onScroll)
  }, [containerRef])

  return <div id="scroll-progress" />
}
