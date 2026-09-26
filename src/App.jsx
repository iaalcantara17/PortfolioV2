import { useRef, useState, useEffect, useCallback } from 'react'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import SectionIndicator from './components/SectionIndicator'
import SectionCounter from './components/SectionCounter'
import SectionLabel from './components/SectionLabel'
import { sections } from './data/sections'
import { useActiveSection } from './hooks/useActiveSection'
import { useKeyboardScroll } from './hooks/useKeyboardScroll'

export default function App() {
  const containerRef = useRef(null)
  const sectionRefs = useRef([])
  // Most recent section to enter the viewport. Gates each section's one-shot
  // entrance (isVisible), so it deliberately fires early.
  const [visibleSection, setVisibleSection] = useState(0)
  // The section the page is on, shown by the dots and the counter.
  const activeSection = useActiveSection(containerRef, sectionRefs)
  useKeyboardScroll(containerRef)

  const navigateTo = useCallback((index) => {
    const section = sectionRefs.current[index]
    if (!section) return
    // Focus follows the jump, as it would for an in-page link, so Tab and screen
    // readers carry on from the section (not from the nav, or from the body once
    // the mobile menu that held focus has closed)
    section.focus({ preventScroll: true })
    // No behavior given, so it follows the scroller's CSS scroll-behavior:
    // smooth, or instant under reduced motion
    section.scrollIntoView()
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.dataset.sectionIndex, 10)
            setVisibleSection(idx)
          }
        })
      },
      // 0.01 — entrances only need to fire once, so the threshold is kept low
      // to reliably register even a fast, brief pass through the viewport
      // (and on mobile, stacked sections can grow taller than the viewport,
      // making a higher ratio unreachable).
      { root: container, threshold: 0.01 }
    )

    sectionRefs.current.forEach((el) => { if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [])

  const setRef = (index) => (el) => { sectionRefs.current[index] = el }

  return (
    <>
      <Cursor />
      <Nav containerRef={containerRef} onNavigate={navigateTo} />
      <SectionIndicator current={activeSection} onNavigate={navigateTo} />
      <SectionCounter active={activeSection} />

      <div ref={containerRef} className="page-scroller">
        {sections.map(({ key, Component }, i) => (
          <div
            key={key}
            ref={setRef(i)}
            data-section-index={i}
            tabIndex={-1}
            className="section-wrapper"
            style={{ height: '100vh', overflow: 'hidden', position: 'relative' }}
          >
            <Component isVisible={visibleSection === i} />
            <SectionLabel index={i + 1} />
          </div>
        ))}
      </div>
    </>
  )
}
