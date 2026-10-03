import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import FilmReel from '../FilmReel'
import LazyLightbox from '../LazyLightbox'
import { galleryPhotos, photoAlt } from '../../data/photos'
import { entranceStart, entranceEnd } from '../../utils/motion'

// Each photo's alt text: its approved description in data/photos.js. Every photo but
// streetwear appears only here; streetwear is also About's photo, with the same
// description. A photo added without one is named by its place in the set.
const galleryAlt = (photo, index, total) => photoAlt[photo.name] ?? `Photo ${index + 1} of ${total}`

// A Fisher–Yates shuffle of a copy, so each visit starts the reel somewhere new
function shuffled(items) {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export default function Gallery({ isVisible }) {
  const sectionRef = useRef(null)
  const tlRef = useRef(null)
  // The order is set once, on mount, and never changes after: the reel and the
  // Lightbox share it
  const [photos] = useState(() => shuffled(galleryPhotos))
  // The photo in the middle of the reel. The Lightbox opens on it, and its own
  // previous/next move the reel along behind it.
  const [index, setIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const total = photos.length
  const lightboxPhotos = useMemo(
    () => photos.map((image, i) => ({ image, alt: galleryAlt(image, i, total) })),
    [photos, total],
  )
  // The reel describes each photo the same way the Lightbox does
  const descriptions = useMemo(() => lightboxPhotos.map((photo) => photo.alt), [lightboxPhotos])

  // Hidden until the first entrance below: the starting state, set on mount
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
          {/* The intro sits beside the title, not under it, so the header keeps its
              height: the reel sizes its photos from the space left below it */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24 }}>
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
            <p style={{ color: 'var(--color-muted)', fontSize: 12, lineHeight: 1.85, maxWidth: 360 }}>
              I shoot on a Canon Rebel SL3. Nothing professional, just a habit of chasing good light, whether that's a skyline at sunset or whatever catches my eye on a hike. Mostly I just like noticing something worth stopping for.
            </p>
          </div>
        </div>

        {/* The reel, centered in the space under the header */}
        <FilmReel
          photos={photos}
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
