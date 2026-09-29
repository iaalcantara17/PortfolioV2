// What shows where an image's file didn't load (useLoadFailed), instead of the
// browser's broken-image icon: a tile in the placeholder color at the image's own
// proportions, with a small picture outline in the middle (see .missing-image). It
// keeps the image's description for screen readers; one with alt="" stays hidden from
// them, as the image was. --aspect (width / height) is there for a caller that sizes
// the tile from both dimensions, like the Lightbox.
export default function MissingImage({ width, height, alt, style, onClick }) {
  return (
    <span
      className="missing-image"
      {...(alt ? { role: 'img', 'aria-label': alt } : { 'aria-hidden': true })}
      onClick={onClick}
      style={{ aspectRatio: `${width} / ${height}`, '--aspect': width / height, ...style }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3.5" y="4.5" width="17" height="15" rx="1" />
        <circle cx="9" cy="9.5" r="1.5" />
        <polyline points="3.5,17 9,12.5 13,15.5 16,13 20.5,16.5" />
      </svg>
    </span>
  )
}
