import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function Lightbox({ photos, index, onClose, onNavigate }) {
  const isOpen = index != null

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

  return (
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
            background: 'rgba(13,13,13,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'auto',
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
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
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
  )
}
