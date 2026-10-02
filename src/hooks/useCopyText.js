import { useEffect, useRef, useState } from 'react'

const COPIED_MS = 1500

// Copies text to the clipboard, from a mouse click, a tap or the keyboard alike.
// copied is true for a moment after it worked, for a "Copied" label. If the clipboard
// isn't available or refuses, onFail runs instead (Contact selects the address on screen
// for copying by hand).
export function useCopyText() {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const copy = (text, onFail) => {
    if (!navigator.clipboard) return onFail()
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true)
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => setCopied(false), COPIED_MS)
      },
      onFail,
    )
  }

  return [copied, copy]
}
