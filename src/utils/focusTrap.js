const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Call from a Tab keydown while a modal is open: keeps Tab and Shift+Tab cycling
// through the container's visible focusable elements instead of escaping to the
// page underneath.
export function trapFocus(e, container) {
  if (e.key !== 'Tab' || !container) return
  const items = [...container.querySelectorAll(FOCUSABLE)].filter((el) => el.getClientRects().length > 0)
  if (items.length === 0) return
  const first = items[0]
  const last = items[items.length - 1]
  const active = document.activeElement
  if (!container.contains(active)) {
    e.preventDefault()
    ;(e.shiftKey ? last : first).focus()
  } else if (e.shiftKey && active === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && active === last) {
    e.preventDefault()
    first.focus()
  }
}
