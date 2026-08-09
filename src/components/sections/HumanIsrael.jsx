import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { AnimatePresence, motion } from 'framer-motion'
import SpotifyWidget from '../SpotifyWidget'

const photos = [
  { src: '/photos/streetwear.jpg', alt: 'Israel — streetwear', label: 'Streetwear' },
  { src: '/photos/city.jpg', alt: 'Israel — city', label: 'NYC' },
  { src: '/photos/nature.jpg', alt: 'Israel — nature', label: 'Outdoors' },
  { src: '/photos/friends.jpg', alt: 'Israel — friends', label: 'People' },
]

const pills = ['Music', 'Fashion', 'Photography', 'Basketball', 'Gym', 'Running', 'Hiking', 'Drawing', 'Piano']

export default function HumanIsrael({ isVisible }) {
  const sectionRef = useRef(null)
  const tlRef = useRef(null)
  const [lightboxPhoto, setLightboxPhoto] = useState(null)

  // Fix 1 — set initial hidden state on mount
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    gsap.set(section.querySelectorAll('[data-animate]'), { y: 30, opacity: 0 })
    gsap.set(section.querySelectorAll('.gallery-cell'), { opacity: 0, scale: 0.97 })
  }, [])

  // Fix 2 — animate in once, never reverse
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    if (isVisible && !tlRef.current) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.to(section.querySelectorAll('[data-animate]'), { y: 0, opacity: 1, stagger: 0.07, duration: 0.7 })
        .to(section.querySelectorAll('.gallery-cell'), { opacity: 1, scale: 1, stagger: 0.08, duration: 0.6, ease: 'power2.out' }, '-=0.4')
      tlRef.current = tl
    }
  }, [isVisible])

  // Close lightbox on Escape
  useEffect(() => {
    if (!lightboxPhoto) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxPhoto(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [lightboxPhoto])

  return (
    <section
      ref={sectionRef}
      className="snap-section"
      style={{ background: '#f5f2ec', borderBottom: '0.5px solid #d4cfc5' }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          height: '100%',
          paddingTop: 56,
        }}
      >
        {/* Left — gallery */}
        <div style={{ padding: '40px 48px', borderRight: '0.5px solid #d4cfc5', display: 'flex', flexDirection: 'column', gap: 24, overflow: 'hidden' }}>
          {/* Header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 4 }}>
              <span
                className="eyebrow"
                style={{ color: '#bbbbbb', fontSize: 9 }}
              >
                Shot on Canon SL3
              </span>
            </div>
            <div
              data-animate
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 'clamp(36px, 4.5vw, 56px)',
                letterSpacing: '-0.03em',
                lineHeight: 0.92,
                color: '#0d0d0d',
              }}
            >
              Beyond
              <br />
              the
              <br />
              code<span style={{ color: '#7F77DD' }}>.</span>
            </div>
          </div>

          {/* Photo grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              alignItems: 'start',
            }}
          >
            {/* Streetwear — tall left */}
            <div
              className="gallery-cell gallery-cell-streetwear photo-placeholder"
              onClick={() => setLightboxPhoto(photos[0])}
              style={{
                width: '100%',
                height: 676,
                borderRadius: 4,
                border: '0.5px solid #d4cfc5',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'none',
              }}
            >
              <img
                src="/photos/streetwear.jpg"
                alt="Israel — streetwear"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '40% 25%', display: 'block' }}
              />
              <div className="eyebrow" style={{ position: 'absolute', bottom: 8, left: 8, background: '#f5f2ec', padding: '2px 6px', borderRadius: 20, border: '0.5px solid #d4cfc5', color: '#666', fontSize: 8 }}>
                Streetwear
              </div>
            </div>

            {/* City + Nature wrapper */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* City */}
              <div
                className="gallery-cell gallery-cell-city photo-placeholder"
                onClick={() => setLightboxPhoto(photos[1])}
                style={{
                  width: '100%',
                  height: 284,
                  borderRadius: 4,
                  border: '0.5px solid #d4cfc5',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'none',
                }}
              >
                <img
                  src="/photos/city.jpg"
                  alt="Israel — city"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%', display: 'block' }}
                />
                <div className="eyebrow" style={{ position: 'absolute', bottom: 8, left: 8, background: '#f5f2ec', padding: '2px 6px', borderRadius: 20, border: '0.5px solid #d4cfc5', color: '#666', fontSize: 8 }}>
                  NYC
                </div>
              </div>

              {/* Nature */}
              <div
                className="gallery-cell gallery-cell-nature photo-placeholder"
                onClick={() => setLightboxPhoto(photos[2])}
                style={{
                  width: '100%',
                  height: 380,
                  borderRadius: 4,
                  border: '0.5px solid #d4cfc5',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'none',
                  background: '#e8e4dc',
                }}
              >
                <img
                  src="/photos/nature.jpg"
                  alt="Israel — nature"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%', display: 'block' }}
                />
                <div className="eyebrow" style={{ position: 'absolute', bottom: 8, left: 8, background: '#f5f2ec', padding: '2px 6px', borderRadius: 20, border: '0.5px solid #d4cfc5', color: '#666', fontSize: 8 }}>
                  Outdoors
                </div>
              </div>
            </div>

            {/* Friends — wide */}
            <div
              className="gallery-cell gallery-cell-friends photo-placeholder"
              onClick={() => setLightboxPhoto(photos[3])}
              style={{
                gridColumn: 'span 2',
                width: '100%',
                height: 560,
                borderRadius: 4,
                border: '0.5px solid #d4cfc5',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'none',
              }}
            >
              <img
                src="/photos/friends.jpg"
                alt="Israel — friends"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 38%', display: 'block' }}
              />
              <div className="eyebrow" style={{ position: 'absolute', bottom: 8, left: 8, background: '#f5f2ec', padding: '2px 6px', borderRadius: 20, border: '0.5px solid #d4cfc5', color: '#666', fontSize: 8 }}>
                People
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="human-sidebar" style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div data-animate>
            <span className="eyebrow" style={{ marginBottom: 12, display: 'block' }}>Interests</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {pills.map((p, i) => (
                <span
                  key={p}
                  className={`pill ${i < 4 ? 'pill-purple' : i < 7 ? 'pill-gold' : ''}`}
                  style={{ fontSize: 10 }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div data-animate style={{ borderTop: '0.5px solid #d4cfc5', paddingTop: 24 }}>
            <span className="eyebrow" style={{ marginBottom: 12, display: 'block' }}>Now playing</span>
            <SpotifyWidget />
          </div>

          <div data-animate style={{ borderTop: '0.5px solid #d4cfc5', paddingTop: 24 }}>
            <p style={{ color: '#666', fontSize: 12, lineHeight: 1.85, fontStyle: 'italic' }}>
              "I'm still growing. But I know who I am, and I show up as exactly that."
            </p>
          </div>

          <div data-animate style={{ marginTop: 'auto', borderTop: '0.5px solid #d4cfc5', paddingTop: 16 }}>
            <span className="eyebrow" style={{ color: '#bbbbbb', fontSize: 9 }}>All photos shot on Canon SL3. Placeholder images shown.</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={() => setLightboxPhoto(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(13,13,13,0.92)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'auto',
            }}
          >
            <button
              onClick={() => setLightboxPhoto(null)}
              aria-label="Close"
              style={{
                position: 'fixed',
                top: 24,
                right: 32,
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: '0.5px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.06)',
                color: '#f5f2ec',
                fontSize: 18,
                lineHeight: 1,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ×
            </button>
            <motion.img
              key={lightboxPhoto.src}
              src={lightboxPhoto.src}
              alt={lightboxPhoto.alt}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
                cursor: 'default',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
