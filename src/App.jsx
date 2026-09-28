import { useRef, useState, useEffect, useCallback } from 'react'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import SectionIndicator from './components/SectionIndicator'
import SectionCounter from './components/SectionCounter'
import SectionLabel from './components/SectionLabel'
import SectionErrorBoundary from './components/SectionErrorBoundary'
import { sections, sectionIndexForHash } from './data/sections'
import { useActiveSection } from './hooks/useActiveSection'
import { useKeyboardScroll } from './hooks/useKeyboardScroll'
import { initPageScroll, scrollPageTo } from './utils/pageScroll'

export default function App() {
  const containerRef = useRef(null)
  const contentRef = useRef(null)
  const sectionRefs = useRef([])
  // Most recent section to enter the viewport. Gates each section's one-shot
  // entrance (isVisible), so it deliberately fires early.
  const [visibleSection, setVisibleSection] = useState(0)
  // The section the page is on, shown by the dots and the counter.
  const activeSection = useActiveSection(containerRef, sectionRefs)
  useKeyboardScroll(containerRef)

  // Eased wheel scrolling, except under reduced motion (utils/pageScroll.js)
  useEffect(() => initPageScroll(containerRef.current, contentRef.current), [])

  const navigateTo = useCallback((index) => {
    const section = sectionRefs.current[index]
    if (!section) return
    // Focus follows the jump, as it would for an in-page link, so Tab and screen
    // readers carry on from the section (not from the nav, or from the body once
    // the mobile menu that held focus has closed)
    section.focus({ preventScroll: true })
    // Eased, or instant under reduced motion
    scrollPageTo(section)
    // The address bar follows too (#projects), so the section can be linked to and
    // Back returns to the previous one
    const hash = `#${sections[index].anchor}`
    if (window.location.hash !== hash) window.history.pushState(null, '', hash)
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

  // Section links (/#projects): opened directly, the page starts at that section;
  // Back and Forward, or a hash typed into the address bar, move between sections
  // (no hash is the top)
  useEffect(() => {
    const sectionForHash = () => sectionRefs.current[Math.max(0, sectionIndexForHash(window.location.hash))]
    const start = sectionIndexForHash(window.location.hash)
    if (start > 0) sectionRefs.current[start]?.scrollIntoView({ behavior: 'instant' })
    const onHistory = () => {
      const section = sectionForHash()
      if (section) scrollPageTo(section)
    }
    window.addEventListener('popstate', onHistory)
    return () => window.removeEventListener('popstate', onHistory)
  }, [])

  const setRef = (index) => (el) => { sectionRefs.current[index] = el }

  // Focus goes to <main> where the page already is, the way a section jump moves focus
  // without the browser's own scroll. Followed as a plain #main link, the browser
  // would jump, and the hash change would send the page back to the Hero (the
  // popstate handler above).
  const skipToMain = (e) => {
    e.preventDefault()
    contentRef.current?.focus({ preventScroll: true })
  }

  return (
    <>
      <a href="#main" className="skip-link" onClick={skipToMain}>Skip to main content</a>
      <Cursor />
      <Nav containerRef={containerRef} onNavigate={navigateTo} />
      <SectionIndicator current={activeSection} onNavigate={navigateTo} />
      <SectionCounter active={activeSection} containerRef={containerRef} />

      <div ref={containerRef} className="page-scroller">
        {/* Every section in one box: the scroller stays one screen tall, so this is
            the element whose size follows the page's full height. It's also the
            page's <main>, focusable for the skip link. */}
        <main id="main" ref={contentRef} className="page-content" tabIndex={-1}>
          {sections.map(({ key, anchor, Component }, i) => (
            <div
              key={key}
              id={anchor}
              ref={setRef(i)}
              data-section-index={i}
              tabIndex={-1}
              className="section-wrapper"
              style={{ height: '100vh', overflow: 'hidden', position: 'relative' }}
            >
              <SectionErrorBoundary>
                <Component isVisible={visibleSection === i} />
              </SectionErrorBoundary>
              <SectionLabel index={i + 1} />
            </div>
          ))}
        </main>
      </div>
    </>
  )
}
