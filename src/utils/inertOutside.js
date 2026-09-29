// While a modal is open (Lightbox, mobile menu), everything on the page outside it is
// inert: out of reach of a screen reader's virtual cursor, not just of Tab. Each modal
// renders where it's used (the Lightbox inside its section, the menu inside the nav),
// so there's no single wrapper around "the rest of the page": this goes up from the
// modal to <body> and marks every sibling on the way. Anything already inert is left
// as it is. Returns the undo, which is safe to call more than once.
//
// No aria-hidden fallback: every browser the build targets (Vite's default, Chrome and
// Edge 111, Firefox 114, Safari 16.4) supports inert.
export function inertOutside(keep) {
  const marked = []
  for (let node = keep; node?.parentElement && node !== document.body; node = node.parentElement) {
    for (const sibling of node.parentElement.children) {
      if (sibling === node || sibling.hasAttribute('inert')) continue
      sibling.setAttribute('inert', '')
      marked.push(sibling)
    }
  }
  return () => {
    marked.forEach((el) => el.removeAttribute('inert'))
    marked.length = 0
  }
}
