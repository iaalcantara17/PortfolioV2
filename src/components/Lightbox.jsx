import { useEffect, useRef } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import Photo from './Photo'
import { useScrollLock } from '../hooks/useScrollLock'
import { trapFocus } from '../utils/focusTrap'

// Round control on the dark backdrop; each control adds its own position
const CONTROL_STYLE = {
  position: 'fixed',
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
}

export default function Lightbox({ photos, index, onClose, onNavigate }) {
  const isOpen = index != null
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  useScrollLock(isOpen)

  const showPrev = () => onNavigate((index - 1 + photos.length) % photos.length)
  const showNext = () => onNavigate((index + 1) % photos.length)

  // Lets the custom cursor switch to a blend mode that shows on the dark backdrop
  useEffect(() => {
    if (!isOpen) return
    document.documentElement.classList.add('lightbox-open')
    return () => document.documentElement.classList.remove('lightbox-open')
  }, [isOpen])

  // Focus moves into the dialog when it opens, and back to whatever opened it (the
  // photo) when it closes
  useEffect(() => {
    if (!isOpen) return
    const opener = document.activeElement
    closeRef.current?.focus()
    return () => opener?.focus({ preventScroll: true })
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onNavigate((index - 1 + photos.length) % photos.length)
      if (e.key === 'ArrowRight') onNavigate((index + 1) % photos.length)
      trapFocus(e, dialogRef.current)
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
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
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
              ref={closeRef}
              onClick={onClose}
              aria-label="Close"
              style={{ ...CONTROL_STYLE, top: 24, right: 32 }}
            >
              ×
            </button>
            {/* Previous/next for mouse and touch; the arrow keys do the same */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); showPrev() }}
                  aria-label="Previous photo"
                  style={{ ...CONTROL_STYLE, top: '50%', left: 32, transform: 'translateY(-50%)' }}
                >
                  &lsaquo;
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); showNext() }}
                  aria-label="Next photo"
                  style={{ ...CONTROL_STYLE, top: '50%', right: 32, transform: 'translateY(-50%)' }}
                >
                  &rsaquo;
                </button>
              </>
            )}
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
