import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'

const modules = import.meta.glob('/src/assets/gallery/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' })

const galleryPhotos = Object.keys(modules)
  .sort()
  .map((path) => ({ src: modules[path], caption: undefined }))

const WINDOW = 15

export default function Gallery({ isVisible }) {
  const sectionRef = useRef(null)
  const tlRef = useRef(null)
  const heroImgRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const total = galleryPhotos.length

  // Fix 1 — set initial hidden state on mount
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    gsap.set(section.querySelectorAll('[data-animate]'), { y: 30, opacity: 0 })
    gsap.set(section.querySelector('.gallery-stage'), { opacity: 0, scale: 0.97 })
  }, [])

  // Animate in once, on first entrance — never reverses or re-triggers
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    if (isVisible && !tlRef.current) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.to(section.querySelectorAll('[data-animate]'), { y: 0, opacity: 1, stagger: 0.07, duration: 0.7 })
        .to(section.querySelector('.gallery-stage'), { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, '-=0.4')
      tlRef.current = tl
    }
  }, [isVisible])

  // Crossfade the hero image on active-photo change
  useEffect(() => {
    if (!heroImgRef.current) return
    gsap.killTweensOf(heroImgRef.current)
    gsap.fromTo(heroImgRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' })
  }, [activeIndex])

  // Preload the neighboring photos at full quality
  useEffect(() => {
    if (total === 0) return
    const next = galleryPhotos[(activeIndex + 1) % total]
    const prev = galleryPhotos[(activeIndex - 1 + total) % total]
    ;[next, prev].forEach((p) => {
      const img = new Image()
      img.src = p.src
    })
  }, [activeIndex, total])

  // Keyboard navigation, only while this section is visible
  useEffect(() => {
    if (!isVisible || total === 0) return
    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft') setActiveIndex((i) => (i - 1 + total) % total)
      if (e.key === 'ArrowRight') setActiveIndex((i) => (i + 1) % total)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isVisible, total])

  const windowed = useMemo(() => {
    const start = Math.max(0, activeIndex - WINDOW)
    const end = Math.min(total, activeIndex + WINDOW + 1)
    return galleryPhotos.slice(start, end).map((p, i) => ({ ...p, index: start + i }))
  }, [activeIndex, total])

  if (total === 0) return null

  const goPrev = () => setActiveIndex((i) => (i - 1 + total) % total)
  const goNext = () => setActiveIndex((i) => (i + 1) % total)

  return (
    <section
      ref={sectionRef}
      className="snap-section"
      style={{ background: '#f5f2ec', borderBottom: '0.5px solid #d4cfc5' }}
    >
      <div
        style={{
          padding: '56px 48px 40px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {/* Header */}
        <div data-animate>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
            <span className="eyebrow" style={{ color: '#bbbbbb', fontSize: 9 }}>Full Gallery</span>
          </div>
          <div
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 'clamp(36px, 4.5vw, 56px)',
              letterSpacing: '-0.03em',
              lineHeight: 0.92,
              color: '#0d0d0d',
            }}
          >
            Through
            <br />
            the
            <br />
            lens<span style={{ color: '#7F77DD' }}>.</span>
          </div>
        </div>

        {/* Fixed-height stage — does not grow with photo count */}
        <div className="gallery-stage" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            className="gallery-hero"
            style={{
              flex: 1,
              minHeight: 0,
              position: 'relative',
              borderRadius: 8,
              border: '0.5px solid #d4cfc5',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#efece5',
            }}
          >
            <img
              key={activeIndex}
              ref={heroImgRef}
              src={galleryPhotos[activeIndex].src}
              alt=""
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
            {total > 1 && (
              <>
                <button
                  type="button"
                  className="gallery-arrow gallery-arrow-left"
                  onClick={goPrev}
                  aria-label="Previous photo"
                >
                  &lsaquo;
                </button>
                <button
                  type="button"
                  className="gallery-arrow gallery-arrow-right"
                  onClick={goNext}
                  aria-label="Next photo"
                >
                  &rsaquo;
                </button>
              </>
            )}
          </div>

          <div className="gallery-filmstrip">
            {windowed.map((p) => (
              <button
                key={p.index}
                type="button"
                className={`filmstrip-thumb${p.index === activeIndex ? ' active' : ''}`}
                onClick={() => setActiveIndex(p.index)}
                aria-label={`View photo ${p.index + 1}`}
              >
                <img src={p.src} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
