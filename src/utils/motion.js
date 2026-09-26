import { gsap } from 'gsap'

// Reduced motion. Read once per page load, so an entrance's hidden state and its
// reveal always agree even if the OS setting changes mid-visit.
export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const MOTION_PROPS = ['x', 'y', 'scale', 'scaleX', 'rotateX']

// Under reduced motion an entrance keeps only its opacity fade: movement, scale and
// rotation are dropped, and an entrance that had no fade (a scale-in) gets one.
// Elements still end visible and stay visible, same as the full entrance.
function fadeOnly(vars, opacity) {
  if (!prefersReducedMotion) return vars
  const out = { ...vars }
  MOTION_PROPS.forEach((prop) => delete out[prop])
  if (!('opacity' in out)) out.opacity = opacity
  return out
}

// gsap.set vars for an entrance's hidden state
export const entranceStart = (vars) => fadeOnly(vars, 0)
// gsap.to vars for an entrance's reveal
export const entranceEnd = (vars) => fadeOnly(vars, 1)

// Availability dot: two slow pulses once it's revealed, then it holds still at full
// opacity. Done in 4s, inside WCAG 2.2.2's five-second limit, so it needs no pause
// control. Opacity only, so it runs under reduced motion too.
export const pulseAvailability = (dot) =>
  gsap.to(dot, { opacity: 0.4, duration: 1, ease: 'sine.inOut', yoyo: true, repeat: 3 })
