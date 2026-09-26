import { useEffect } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import Photo from './Photo'
import { useScrollLock } from '../hooks/useScrollLock'

export default function Lightbox({ photos, index, onClose, onNavigate }) {
  const isOpen = index != null
  useScrollLock(isOpen)

  // Lets the custom cursor switch to a blend mode that shows on the dark backdrop
  useEffect(() => {
    if (!isOpen) return
    document.documentElement.classList.add('lightbox-open')
    return () => document.documentElement.classList.remove('lightbox-open')
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onNavigate((index - 1 + photos.length) % photos.length)
      if (e.key === 'ArrowRight') onNavigate((index + 1) % photos.length)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, index, photos.length, onClose, onNavigate])

  const photo = isOpen ? photos[index] : null

  // reducedMotion="user": under the OS reduced-motion setting the image's zoom is
  // dropped and only the fades run
  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {photo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'var(--color-ink-a92)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                position: 'fixed',
                top: 24,
                right: 32,
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: '0.5px solid var(--color-white-a30)',
                background: 'var(--color-white-a06)',
                color: 'var(--color-paper)',
                fontSize: 18,
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ×
            </button>
            <Photo
              key={photo.image.name}
              as={motion.img}
              photo={photo.image}
              sizes="90vw"
              alt={photo.alt}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{
                width: 'auto',
                height: 'auto',
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}
