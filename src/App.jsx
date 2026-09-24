import { useRef, useState, useEffect, useCallback } from 'react'
import Cursor from './components/Cursor'
import ScrollProgress from './components/ScrollProgress'
import Nav from './components/Nav'
import SectionIndicator from './components/SectionIndicator'
import SectionCounter from './components/SectionCounter'
import SectionLabel from './components/SectionLabel'
import { sections } from './data/sections'

export default function App() {
  const containerRef = useRef(null)
  const sectionRefs = useRef([])
  const [currentSection, setCurrentSection] = useState(0)

  const navigateTo = useCallback((index) => {
    const section = sectionRefs.current[index]
    if (section) section.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.dataset.sectionIndex, 10)
            setCurrentSection(idx)
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
      <ScrollProgress containerRef={containerRef} />
      <Nav containerRef={containerRef} onNavigate={navigateTo} />
      <SectionIndicator current={currentSection} onNavigate={navigateTo} />
      <SectionCounter containerRef={containerRef} />

      <div ref={containerRef} className="snap-container">
        {sections.map(({ key, Component }, i) => (
          <div
            key={key}
            ref={setRef(i)}
            data-section-index={i}
            className="section-wrapper"
            style={{ height: '100vh', overflow: 'hidden', position: 'relative' }}
          >
            <Component isVisible={currentSection === i} />
            <SectionLabel index={i + 1} />
          </div>
        ))}
      </div>
    </>
  )
}
