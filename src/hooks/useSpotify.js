import { useState, useEffect } from 'react'

export function useSpotify() {
  const [data, setData] = useState({ track: null, artist: null, isPlaying: false, loading: true })

  useEffect(() => {
    let cancelled = false

    const fetchNowPlaying = async () => {
      try {
        const res = await fetch('/api/spotify')
        if (!res.ok) throw new Error('API error')
        const json = await res.json()
        if (!cancelled) {
          setData({
            track: json.track || null,
            artist: json.artist || null,
            isPlaying: json.isPlaying || false,
            loading: false,
          })
        }
      } catch {
        if (!cancelled) {
          setData({ track: 'Spotify', artist: 'Connect your account', isPlaying: false, loading: false })
        }
      }
    }

    fetchNowPlaying()
    const interval = setInterval(fetchNowPlaying, 30000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return data
}
