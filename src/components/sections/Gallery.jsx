import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import FilmReel from '../FilmReel'
import LazyLightbox from '../LazyLightbox'
import { galleryPhotos, photoAlt } from '../../data/photos'
import { entranceStart, entranceEnd } from '../../utils/motion'

// Each photo's alt text: its approved description in data/photos.js. City, friends
// and nature appear only here; streetwear is also About's photo, with the same
// description. A photo added without one is named by its place in the set.
const galleryAlt = (photo, index, total) => photoAlt[photo.name] ?? `Photo ${index + 1} of ${total}`

export default function Gallery({ isVisible }) {
  const sectionRef = useRef(null)
  const tlRef = useRef(null)
  // The photo in the middle of the reel. The Lightbox opens on it, and its own
  // previous/next move the reel along behind it.
  const [index, setIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const total = galleryPhotos.length
  const lightboxPhotos = useMemo(
    () => galleryPhotos.map((image, i) => ({ image, alt: galleryAlt(image, i, total) })),
    [total],
  )
  // The reel describes each photo the same way the Lightbox does
  const descriptions = useMemo(() => lightboxPhotos.map((photo) => photo.alt), [lightboxPhotos])

  // Fix 1 — set initial hidden state on mount
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    gsap.set(section.querySelectorAll('[data-animate]'), entranceStart({ y: 30, opacity: 0 }))
    gsap.set(section.querySelector('.film-reel'), entranceStart({ opacity: 0, scale: 0.97 }))
  }, [])

  // Animate in once, on first entrance — never reverses or re-triggers
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    if (isVisible && !tlRef.current) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.to(section.querySelectorAll('[data-animate]'), entranceEnd({ y: 0, opacity: 1, stagger: 0.07, duration: 0.7 }))
        .to(section.querySelector('.film-reel'), entranceEnd({ opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }), '-=0.4')
      tlRef.current = tl
    }
  }, [isVisible])

  if (total === 0) return null

  return (
    <section
      ref={sectionRef}
      className="page-section"
      style={{ background: 'var(--color-paper)', borderBottom: '0.5px solid var(--color-line)' }}
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
            <h2 className="eyebrow" style={{ color: 'var(--color-faint)', fontSize: 9 }}>Full Gallery</h2>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(36px, 4.5vw, 56px)',
              letterSpacing: '-0.03em',
              lineHeight: 0.92,
              color: 'var(--color-ink)',
            }}
          >
            Through
            <br />
            the
            <br />
            lens<span style={{ color: 'var(--color-purple)' }}>.</span>
          </div>
        </div>

        {/* The reel, centered in the space under the header */}
        <FilmReel
          photos={galleryPhotos}
          descriptions={descriptions}
          isVisible={isVisible}
          index={index}
          onIndexChange={setIndex}
          onOpen={setLightboxIndex}
        />
      </div>

      <LazyLightbox
        photos={lightboxPhotos}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(i) => {
          setLightboxIndex(i)
          setIndex(i)
        }}
      />
    </section>
  )
}
