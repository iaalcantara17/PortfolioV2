import { useEffect, useState } from 'react'
import Photo from './Photo'

// Time each image shows while a preview of several cycles
const CYCLE_MS = 1600

// A small image preview that follows the pointer while its card is hovered (a
// .card-follower, placed and shown by followPointer in utils/follower.js). Mouse and
// trackpad only; decorative, since the card itself says what it opens.
// With several images, it shows them one after another while active (the card is
// hovered), cross-fading (.card-hover-preview in index.css), and starts again from
// the first each time. className picks it out when a card holds more than one preview.
export default function HoverPreview({ images, active = false, className = '' }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!active || images.length < 2) return
    const timer = setInterval(() => setCurrent((i) => (i + 1) % images.length), CYCLE_MS)
    return () => {
      clearInterval(timer)
      setCurrent(0)
    }
  }, [active, images.length])

  return (
    <span className={`card-follower card-hover-preview ${className}`} aria-hidden="true" data-current={current}>
      {images.map((image, i) => (
        <span key={image.name} className={i === current ? 'is-current' : undefined}>
          <Photo photo={image} thumb sizes="140px" alt="" loading="lazy" showMissing />
        </span>
      ))}
    </span>
  )
}
