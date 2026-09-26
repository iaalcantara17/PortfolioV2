import { useLayoutEffect, useState } from 'react'

// An element's content-box size ({ width, height } in CSS px), kept current with a
// ResizeObserver. Measured before the first paint, so an image sized from it never
// starts loading from a guess. null until measured.
export function useElementSize(ref) {
  const [size, setSize] = useState(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const width = el.clientWidth
      const height = el.clientHeight
      setSize((prev) => (prev?.width === width && prev?.height === height ? prev : { width, height }))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])

  return size
}
