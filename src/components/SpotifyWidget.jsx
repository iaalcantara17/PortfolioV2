import { useSpotify } from '../hooks/useSpotify'

export default function SpotifyWidget({ dark = false }) {
  const { track, artist, isPlaying, loading } = useSpotify()

  const bg = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'
  const border = dark ? 'rgba(255,255,255,0.1)' : '#d4cfc5'
  const textColor = dark ? '#f5f2ec' : '#0d0d0d'
  const mutedColor = dark ? 'rgba(245,242,236,0.5)' : '#666666'

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        background: bg,
        border: `0.5px solid ${border}`,
        borderRadius: 20,
        padding: '6px 14px',
        maxWidth: 260,
      }}
    >
      {/* Green dot */}
      <div
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: '#1D9E75',
          flexShrink: 0,
        }}
      />

      {/* Bars or pause indicator */}
      {isPlaying ? (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 16, flexShrink: 0 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="spotify-bar"
              style={{
                width: 3,
                background: '#1D9E75',
                borderRadius: 1,
                height: 8,
              }}
            />
          ))}
        </div>
      ) : (
        <div style={{ width: 14, height: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill={mutedColor}>
            <path d="M5 0a5 5 0 100 10A5 5 0 005 0zm-1 7V3l3 2-3 2z"/>
          </svg>
        </div>
      )}

      {/* Text */}
      <div style={{ overflow: 'hidden', minWidth: 0 }}>
        {loading ? (
          <span style={{ fontSize: 10, color: mutedColor, fontFamily: "'Helvetica Neue', Helvetica, sans-serif" }}>Loading...</span>
        ) : (
          <>
            <div style={{ fontSize: 9, color: mutedColor, fontFamily: "'Helvetica Neue', Helvetica, sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 1 }}>
              {isPlaying ? 'Now playing' : 'Last played'}
            </div>
            <div style={{ fontSize: 11, color: textColor, fontFamily: "'Helvetica Neue', Helvetica, sans-serif", fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {track || 'Nothing playing'}
              {artist && <span style={{ fontWeight: 400, color: mutedColor }}> · {artist}</span>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
