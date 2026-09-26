import { lazy, Suspense, useEffect, useState } from 'react'

// The Lightbox, and framer-motion with it (nothing else uses it), loads separately
// from the page. It's fetched once the page has loaded and the browser is idle, so
// opening a photo still feels instant; an open before then waits for it to arrive.
let loaded = null
const loadLightbox = () =>
  import('./Lightbox').then((module) => {
    loaded = module.default
    return module
  })
const LightboxOnDemand = lazy(loadLightbox)

let prefetchScheduled = false
function prefetchWhenIdle() {
  if (prefetchScheduled) return
  prefetchScheduled = true
  const whenIdle = () =>
    window.requestIdleCallback ? requestIdleCallback(loadLightbox, { timeout: 5000 }) : setTimeout(loadLightbox, 1000)
  if (document.readyState === 'complete') whenIdle()
  else window.addEventListener('load', whenIdle, { once: true })
}

// Same props as Lightbox. Renders nothing until the first open, then stays mounted,
// so the Lightbox's close animation still plays. The component is picked at that
// first open and kept (a different one later would remount it): the loaded Lightbox
// if its chunk has arrived, drawn at once, else the lazy one, which suspends until
// the chunk arrives. (lazy alone would suspend once even when already loaded, and
// React holds a suspended reveal for about 300ms.)
export default function LazyLightbox(props) {
  const [Lightbox, setLightbox] = useState(null)
  if (props.index != null && !Lightbox) setLightbox(() => loaded ?? LightboxOnDemand)

  useEffect(prefetchWhenIdle, [])

  if (!Lightbox) return null
  return (
    <Suspense fallback={null}>
      <Lightbox {...props} />
    </Suspense>
  )
}
