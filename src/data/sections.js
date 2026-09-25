// Single source of truth for page sections. Order here is page order, dot
// order and counter numbering; inNav controls whether it gets a nav link.
import Hero from '../components/sections/Hero'
import About from '../components/sections/About'
import Skills from '../components/sections/Skills'
import Experience from '../components/sections/Experience'
import Projects from '../components/sections/Projects'
import HumanIsrael from '../components/sections/HumanIsrael'
import Gallery from '../components/sections/Gallery'
import Contact from '../components/sections/Contact'

export const sections = [
  { key: 'hero', label: 'Hero', Component: Hero, inNav: false },
  { key: 'about', label: 'About', Component: About, inNav: true },
  { key: 'skills', label: 'Skills', Component: Skills, inNav: false },
  { key: 'experience', label: 'Experience', Component: Experience, inNav: true },
  { key: 'projects', label: 'Projects', Component: Projects, inNav: true },
  { key: 'human', label: 'Life', Component: HumanIsrael, inNav: true },
  { key: 'gallery', label: 'Gallery', Component: Gallery, inNav: true },
  { key: 'contact', label: 'Contact', Component: Contact, inNav: true },
]

// Zero-padded total for "NN / TT" counters.
export const SECTION_TOTAL = String(sections.length).padStart(2, '0')
