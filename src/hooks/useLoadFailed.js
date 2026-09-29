import { useState } from 'react'

// Whether an image's file failed to load, and the onError handler that records it, so
// the caller can show a MissingImage in its place. Kept per src: a component that
// moves on to another image starts over.
export function useLoadFailed(src) {
  const [failedSrc, setFailedSrc] = useState(null)
  return [failedSrc === src, () => setFailedSrc(src)]
}
