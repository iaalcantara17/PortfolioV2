// Vercel serverless function for Spotify Now Playing
// Setup: set SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN in Vercel env vars

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'
const NOW_PLAYING_ENDPOINT = 'https://api.spotify.com/v1/me/player/currently-playing'
const RECENTLY_PLAYED_ENDPOINT = 'https://api.spotify.com/v1/me/player/recently-played?limit=1'

// Each request to Spotify gives up after this long, so a hung one can't hold the function open
const SPOTIFY_TIMEOUT_MS = 5000
// A cached access token is replaced this long before it expires
const TOKEN_EXPIRY_MARGIN_MS = 60 * 1000
// Vercel's CDN answers every visitor from one response for this long, so Spotify sees at
// most one request per 20 seconds however many people are on the site. CDN only: browsers
// don't cache it (Cache-Control below), and the widget polls every 30 seconds anyway.
const CDN_CACHE = 'max-age=20'

// The access token, kept between requests while the function instance stays warm, until
// shortly before it expires (Spotify's last an hour). A cold start fetches a new one.
let cachedToken = null

async function getAccessToken(clientId, clientSecret, refreshToken) {
  if (cachedToken && Date.now() < cachedToken.expiresAt - TOKEN_EXPIRY_MARGIN_MS) return cachedToken.value

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    signal: AbortSignal.timeout(SPOTIFY_TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`)
  const { access_token, expires_in } = await res.json()
  cachedToken = { value: access_token, expiresAt: Date.now() + expires_in * 1000 }
  return access_token
}

async function spotifyGet(url, token) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(SPOTIFY_TIMEOUT_MS),
  })
  // A token Spotify no longer accepts is dropped, so the next request gets a new one
  if (res.status === 401) cachedToken = null
  return res
}

function sendTrack(res, track) {
  res.setHeader('Vercel-CDN-Cache-Control', CDN_CACHE)
  return res.status(200).json(track)
}

// Anything but a 200 means "no answer" to the widget, which then keeps the last track it
// showed (or stays hidden if it never had one). Failures are never cached.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0')

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    return res.status(503).json({ error: 'Spotify is not configured' })
  }

  try {
    const token = await getAccessToken(clientId, clientSecret, refreshToken)
    const nowPlayingRes = await spotifyGet(NOW_PLAYING_ENDPOINT, token)

    if (nowPlayingRes.status === 204 || nowPlayingRes.status > 400) {
      // Fall back to recently played
      const recentRes = await spotifyGet(RECENTLY_PLAYED_ENDPOINT, token)
      if (!recentRes.ok) throw new Error(`Recently played failed: ${recentRes.status}`)
      const recentData = await recentRes.json()
      const track = recentData?.items?.[0]?.track
      return sendTrack(res, {
        track: track?.name || null,
        artist: track?.artists?.[0]?.name || null,
        isPlaying: false,
      })
    }

    if (!nowPlayingRes.ok) throw new Error(`Currently playing failed: ${nowPlayingRes.status}`)
    const data = await nowPlayingRes.json()
    return sendTrack(res, {
      track: data?.item?.name || null,
      artist: data?.item?.artists?.[0]?.name || null,
      isPlaying: data?.is_playing || false,
    })
  } catch (err) {
    console.error('Spotify API error:', err)
    return res.status(502).json({ error: 'Spotify is unavailable' })
  }
}
