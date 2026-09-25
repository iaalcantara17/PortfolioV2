import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import SpotifyWidget from '../SpotifyWidget'
import Lightbox from '../Lightbox'
import Photo from '../Photo'
import { photoByName } from '../../data/photos'

const photos = [
  { image: photoByName.streetwear, alt: 'Israel — streetwear', label: 'Streetwear' },
  { image: photoByName.city, alt: 'Israel — city', label: 'NYC' },
  { image: photoByName.nature, alt: 'Israel — nature', label: 'Outdoors' },
  { image: photoByName.friends, alt: 'Israel — friends', label: 'People' },
]

const CELL_SIZES = '(max-width: 1023px) 50vw, 35vw'
const WIDE_CELL_SIZES = '(max-width: 1023px) 100vw, 70vw'

export default function HumanIsrael({ isVisible }) {
  const sectionRef = useRef(null)
  const tlRef = useRef(null)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  // Fix 1 — set initial hidden state on mount
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    gsap.set(section.querySelectorAll('[data-animate]'), { y: 30, opacity: 0 })
    gsap.set(section.querySelectorAll('.gallery-cell'), { opacity: 0, scale: 0.97 })
  }, [])

  // Animate in once, on first entrance — never reverses or re-triggers
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

  return (
    <section
      ref={sectionRef}
      className="page-section"
      style={{ background: 'var(--color-paper)', borderBottom: '0.5px solid var(--color-line)' }}
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
        <div style={{ padding: '40px 48px', borderRight: '0.5px solid var(--color-line)', display: 'flex', flexDirection: 'column', gap: 24, overflow: 'hidden' }}>
          {/* Header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 4 }}>
              <span
                className="eyebrow"
                style={{ color: 'var(--color-faint)', fontSize: 9 }}
              >
                Shot on Canon SL3
              </span>
            </div>
            <div
              data-animate
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(36px, 4.5vw, 56px)',
                letterSpacing: '-0.03em',
                lineHeight: 0.92,
                color: 'var(--color-ink)',
              }}
            >
              Beyond
              <br />
              the
              <br />
              code<span style={{ color: 'var(--color-purple)' }}>.</span>
            </div>
          </div>

          {/* Photo grid */}
          <div
            className="human-photo-grid"
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
              onClick={() => setLightboxIndex(0)}
              style={{
                width: '100%',
                height: 676,
                borderRadius: 4,
                border: '0.5px solid var(--color-line)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'none',
              }}
            >
              <Photo
                photo={photoByName.streetwear}
                sizes={CELL_SIZES}
                loading="lazy"
                alt="Israel — streetwear"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '40% 25%', display: 'block' }}
              />
              <div className="eyebrow" style={{ position: 'absolute', bottom: 8, left: 8, background: 'var(--color-paper)', padding: '2px 6px', borderRadius: 20, border: '0.5px solid var(--color-line)', color: 'var(--color-muted)', fontSize: 8 }}>
                Streetwear
              </div>
            </div>

            {/* City + Nature wrapper */}
            <div className="human-photo-stack" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* City */}
              <div
                className="gallery-cell gallery-cell-city photo-placeholder"
                onClick={() => setLightboxIndex(1)}
                style={{
                  width: '100%',
                  height: 284,
                  borderRadius: 4,
                  border: '0.5px solid var(--color-line)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'none',
                }}
              >
                <Photo
                  photo={photoByName.city}
                  sizes={CELL_SIZES}
                  loading="lazy"
                  alt="Israel — city"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%', display: 'block' }}
                />
                <div className="eyebrow" style={{ position: 'absolute', bottom: 8, left: 8, background: 'var(--color-paper)', padding: '2px 6px', borderRadius: 20, border: '0.5px solid var(--color-line)', color: 'var(--color-muted)', fontSize: 8 }}>
                  NYC
                </div>
              </div>

              {/* Nature */}
              <div
                className="gallery-cell gallery-cell-nature photo-placeholder"
                onClick={() => setLightboxIndex(2)}
                style={{
                  width: '100%',
                  height: 380,
                  borderRadius: 4,
                  border: '0.5px solid var(--color-line)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'none',
                  background: 'var(--color-placeholder)',
                }}
              >
                <Photo
                  photo={photoByName.nature}
                  sizes={CELL_SIZES}
                  loading="lazy"
                  alt="Israel — nature"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%', display: 'block' }}
                />
                <div className="eyebrow" style={{ position: 'absolute', bottom: 8, left: 8, background: 'var(--color-paper)', padding: '2px 6px', borderRadius: 20, border: '0.5px solid var(--color-line)', color: 'var(--color-muted)', fontSize: 8 }}>
                  Outdoors
                </div>
              </div>
            </div>

            {/* Friends — wide */}
            <div
              className="gallery-cell gallery-cell-friends photo-placeholder"
              onClick={() => setLightboxIndex(3)}
              style={{
                gridColumn: 'span 2',
                width: '100%',
                height: 560,
                borderRadius: 4,
                border: '0.5px solid var(--color-line)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'none',
              }}
            >
              <Photo
                photo={photoByName.friends}
                sizes={WIDE_CELL_SIZES}
                loading="lazy"
                alt="Israel — friends"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 38%', display: 'block' }}
              />
              <div className="eyebrow" style={{ position: 'absolute', bottom: 8, left: 8, background: 'var(--color-paper)', padding: '2px 6px', borderRadius: 20, border: '0.5px solid var(--color-line)', color: 'var(--color-muted)', fontSize: 8 }}>
                People
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="human-sidebar" style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div data-animate>
            <span className="eyebrow" style={{ marginBottom: 12, display: 'block' }}>Now playing</span>
            <SpotifyWidget />
          </div>

          <div data-animate style={{ borderTop: '0.5px solid var(--color-line)', paddingTop: 24 }}>
            <p style={{ color: 'var(--color-muted)', fontSize: 12, lineHeight: 1.85, fontStyle: 'italic' }}>
              "I'm still growing. But I know who I am, and I show up as exactly that."
            </p>
          </div>

          <div data-animate style={{ marginTop: 'auto', borderTop: '0.5px solid var(--color-line)', paddingTop: 16 }}>
            <span className="eyebrow" style={{ color: 'var(--color-faint)', fontSize: 9 }}>All photos shot on Canon SL3.</span>
          </div>
        </div>
      </div>

      <Lightbox
        photos={photos}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </section>
  )
}
