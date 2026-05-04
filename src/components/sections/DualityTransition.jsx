import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

export default function DualityTransition({ isActive }) {
  const leftRef = useRef(null)
  const rightRef = useRef(null)
  const hasPlayed = useRef(false)

  useEffect(() => {
    if (!isActive || hasPlayed.current) return
    hasPlayed.current = true

    const tl = gsap.timeline()
    tl.fromTo(leftRef.current, { x: '0%' }, { x: '-100%', duration: 0.7, ease: 'power3.inOut' }, 0)
      .fromTo(rightRef.current, { x: '0%' }, { x: '100%', duration: 0.7, ease: 'power3.inOut' }, 0)
      .to({}, { duration: 0.4 })
      .to(leftRef.current, { x: '0%', duration: 0.6, ease: 'power3.inOut' })
      .to(rightRef.current, { x: '0%', duration: 0.6, ease: 'power3.inOut' }, '<')
  }, [isActive])

  return (
    <section className="snap-section" style={{ background: '#f5f2ec', position: 'relative', overflow: 'hidden' }}>
      {/* Left half — WORK */}
      <div
        ref={leftRef}
        className="duality-half duality-left"
        style={{ zIndex: 2 }}
      >
        <span
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 'clamp(48px, 8vw, 96px)',
            color: '#f5f2ec',
            letterSpacing: '-0.03em',
          }}
        >
          WORK.
        </span>
      </div>

      {/* Right half — LIFE */}
      <div
        ref={rightRef}
        className="duality-half duality-right"
        style={{ zIndex: 2 }}
      >
        <span
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 'clamp(48px, 8vw, 96px)',
            color: '#0d0d0d',
            letterSpacing: '-0.03em',
          }}
        >
          LIFE.
        </span>
      </div>

      {/* Center divider */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: '0.5px',
          background: '#d4cfc5',
          zIndex: 1,
        }}
      />
    </section>
  )
}
