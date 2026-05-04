// Vercel serverless function for Spotify Now Playing
// Setup: set SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN in Vercel env vars

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'
const NOW_PLAYING_ENDPOINT = 'https://api.spotify.com/v1/me/player/currently-playing'
const RECENTLY_PLAYED_ENDPOINT = 'https://api.spotify.com/v1/me/player/recently-played?limit=1'

async function getAccessToken(clientId, clientSecret, refreshToken) {
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
  })
  return res.json()
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'no-store, max-age=0')

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    return res.status(200).json({
      track: null,
      artist: null,
      isPlaying: false,
      configured: false,
    })
  }

  try {
    const { access_token } = await getAccessToken(clientId, clientSecret, refreshToken)

    const nowPlayingRes = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    if (nowPlayingRes.status === 204 || nowPlayingRes.status > 400) {
      // Fall back to recently played
      const recentRes = await fetch(RECENTLY_PLAYED_ENDPOINT, {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      const recentData = await recentRes.json()
      const track = recentData?.items?.[0]?.track
      return res.status(200).json({
        track: track?.name || null,
        artist: track?.artists?.[0]?.name || null,
        isPlaying: false,
      })
    }

    const data = await nowPlayingRes.json()
    return res.status(200).json({
      track: data?.item?.name || null,
      artist: data?.item?.artists?.[0]?.name || null,
      isPlaying: data?.is_playing || false,
    })
  } catch (err) {
    console.error('Spotify API error:', err)
    return res.status(200).json({ track: null, artist: null, isPlaying: false })
  }
}
