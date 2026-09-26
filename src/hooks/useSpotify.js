import { useEffect, useSyncExternalStore } from 'react'

const POLL_MS = 30000
// A request with no answer by then counts as failed, instead of leaving "Loading..." up
const TIMEOUT_MS = 8000

// One poll for the whole page, shared by every widget (Hero and Life), so they always
// agree. status: 'loading' until the first answer, 'ready' once a track has loaded
// (kept through later failures, which leave the last track showing), 'unavailable' if
// the first request failed: the widgets hide, and polling stops for this visit.
let state = { status: 'loading', track: null, artist: null, isPlaying: false }
const listeners = new Set()
let widgetsOnScreen = 0
let inFlight = false
let lastRequestAt = 0
let timer = null
let started = false

function setState(next) {
  state = next
  listeners.forEach((listener) => listener())
}

async function poll() {
  inFlight = true
  lastRequestAt = Date.now()
  try {
    const res = await fetch('/api/spotify', { signal: AbortSignal.timeout(TIMEOUT_MS) })
    if (!res.ok) throw new Error(`Spotify API error ${res.status}`)
    const json = await res.json()
    setState({
      status: 'ready',
      track: json.track || null,
      artist: json.artist || null,
      isPlaying: json.isPlaying || false,
    })
  } catch {
    if (state.status === 'loading') setState({ ...state, status: 'unavailable' })
  } finally {
    inFlight = false
    schedule()
  }
}

// Sets up the next request. Never while one is still out, and never while the tab is
// hidden. The first goes out at once, on screen or not, so a widget has its track when
// it's scrolled to; after that, every POLL_MS while at least one widget is on screen.
function schedule() {
  clearTimeout(timer)
  timer = null
  if (inFlight || state.status === 'unavailable' || document.hidden) return
  if (lastRequestAt && widgetsOnScreen === 0) return
  const wait = lastRequestAt ? Math.max(0, lastRequestAt + POLL_MS - Date.now()) : 0
  timer = setTimeout(poll, wait)
}

function subscribe(listener) {
  listeners.add(listener)
  if (!started) {
    started = true
    document.addEventListener('visibilitychange', schedule)
    schedule()
  }
  return () => listeners.delete(listener)
}

const getSnapshot = () => state

// onScreen: whether this widget is on screen now. Polling runs while any widget is.
export function useSpotify(onScreen) {
  const data = useSyncExternalStore(subscribe, getSnapshot)

  useEffect(() => {
    if (!onScreen) return
    widgetsOnScreen++
    schedule()
    return () => {
      widgetsOnScreen--
      schedule()
    }
  }, [onScreen])

  return data
}
