import { gsap } from 'gsap'

// Scramble text content on a text-only element. Fires onComplete when done.
export function scrambleText(el, finalText, duration = 0.8, onComplete = null) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$&'
  let frame = 0
  const totalFrames = Math.max(1, Math.floor(duration * 60))

  const interval = setInterval(() => {
    frame++
    const progress = frame / totalFrames
    const revealed = Math.floor(progress * finalText.length)
    let output = finalText.slice(0, revealed)
    for (let i = revealed; i < finalText.length; i++) {
      output += chars[Math.floor(Math.random() * chars.length)]
    }
    el.textContent = output
    if (frame >= totalFrames) {
      clearInterval(interval)
      el.textContent = finalText
      onComplete?.()
    }
  }, 1000 / 60)
}

// Scramble an element that contains HTML — saves innerHTML and restores it at end.
export function scrambleHTMLElement(el, duration = 0.8, onComplete = null) {
  const savedHTML = el.innerHTML
  const finalText = el.textContent
  scrambleText(el, finalText, duration, () => {
    el.innerHTML = savedHTML
    onComplete?.()
  })
}

export function drawLine(el) {
  return gsap.fromTo(el, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.6, ease: 'power2.out' })
}
