// Light or dark, once the app runs. public/theme.js has already set <html data-theme>
// before the first paint; this keeps it current:
// - toggleTheme: the nav's toggle. The choice is kept in localStorage for later
//   visits. The page cross-fades to it with a view transition (timed by
//   ::view-transition in index.css); under reduced motion, or without view
//   transitions, it switches at once.
// - With no choice stored, the page follows the system setting as it changes.
// - A choice made in another tab applies here too.
// The address bar's color (<meta name="theme-color">) follows the page's own
// --color-paper.
const KEY = 'theme'
const root = document.documentElement
const system = window.matchMedia('(prefers-color-scheme: dark)')
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const listeners = new Set()
// The theme the toggle last asked for, until it's applied. The cross-fade applies it
// a frame or so later, after its snapshot, and a click before then toggles from it.
let requested = null

function storedTheme() {
  try {
    const value = localStorage.getItem(KEY)
    return value === 'dark' || value === 'light' ? value : null
  } catch {
    return null
  }
}

const systemTheme = () => (system.matches ? 'dark' : 'light')

function apply(theme) {
  if (theme === requested) requested = null
  root.dataset.theme = theme
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.content = getComputedStyle(root).getPropertyValue('--color-paper').trim()
  listeners.forEach((listener) => listener())
}

export const currentTheme = () => (root.dataset.theme === 'dark' ? 'dark' : 'light')

export function toggleTheme() {
  const theme = (requested ?? currentTheme()) === 'dark' ? 'light' : 'dark'
  requested = theme
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // Storage blocked: the choice holds for this page view only
  }
  if (reducedMotion.matches || !document.startViewTransition) apply(theme)
  else document.startViewTransition(() => apply(theme))
}

export function subscribeTheme(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

system.addEventListener('change', () => {
  if (!storedTheme()) apply(systemTheme())
})
window.addEventListener('storage', (e) => {
  if (e.key === KEY) apply(storedTheme() ?? systemTheme())
})
apply(storedTheme() ?? systemTheme())
