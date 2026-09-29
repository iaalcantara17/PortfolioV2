import { useSyncExternalStore } from 'react'
import { currentTheme, setTheme, subscribeTheme } from '../utils/theme'

// Eight rays around the sun, from 9.5 to 11.5 out from the middle of a 24px box
const RAYS = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4
  const at = (r) => [12 + r * Math.cos(a), 12 + r * Math.sin(a)].map((n) => +n.toFixed(2))
  const [[x1, y1], [x2, y2]] = [at(9.5), at(11.5)]
  return { x1, y1, x2, y2 }
})

// The nav's light/dark toggle: a sun in the light theme, a moon in the dark one. The
// sun turns into the moon by its rays drawing in, its disc growing, and a second disc
// (in the mask, so it bites out of whatever is behind the icon) sliding across to
// leave a crescent; the moon turns back the same way in reverse (.theme-toggle in
// index.css). Under reduced motion it just switches. Its label says what it will do,
// which carries the state, so it has no aria-pressed as well.
export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, currentTheme)
  const dark = theme === 'dark'

  return (
    <button
      type="button"
      className={`theme-toggle${dark ? ' is-dark' : ''}`}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <mask id="theme-toggle-bite">
          <rect width="24" height="24" fill="white" />
          <circle className="theme-toggle-bite" cx="15" cy="9" r="7" fill="black" />
        </mask>
        <circle className="theme-toggle-disc" cx="12" cy="12" r="8" fill="currentColor" mask="url(#theme-toggle-bite)" />
        <g className="theme-toggle-rays" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          {RAYS.map((ray, i) => (
            <line key={i} {...ray} />
          ))}
        </g>
      </svg>
    </button>
  )
}
