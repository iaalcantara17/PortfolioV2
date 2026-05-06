import { useRef, useState, useEffect, useCallback } from 'react'
import Cursor from './components/Cursor'
import ScrollProgress from './components/ScrollProgress'
import Nav from './components/Nav'
import SectionIndicator from './components/SectionIndicator'
import SectionCounter from './components/SectionCounter'
import SectionLabel from './components/SectionLabel'

import Hero from './components/sections/Hero'
import About from './components/sections/About'
import Skills from './components/sections/Skills'
import Experience from './components/sections/Experience'
import Projects from './components/sections/Projects'
import HumanIsrael from './components/sections/HumanIsrael'
import Contact from './components/sections/Contact'

const SECTION_COMPONENTS = [Hero, About, Skills, Experience, Projects, HumanIsrael, Contact]
const SECTION_KEYS = ['hero', 'about', 'skills', 'experience', 'projects', 'human', 'contact']

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
      { root: container, threshold: 0.5 }
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
        {SECTION_COMPONENTS.map((Component, i) => (
          <div
            key={SECTION_KEYS[i]}
            ref={setRef(i)}
            data-section-index={i}
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
