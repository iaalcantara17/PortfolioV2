import { WIDTHS, srcSet } from '../data/photos'
import { useLoadFailed } from '../hooks/useLoadFailed'
import MissingImage from './MissingImage'

// AVIF with WebP fallback. The <picture> wrapper is display: contents so the
// <img> keeps its place in the parent's layout (flex item, 100% sizing, etc.).
// width/height attributes reserve the aspect ratio; an image sized only by
// max-width/max-height needs width/height: auto in its style to keep its ratio.
// With showMissing, a file that fails to load leaves a MissingImage in the photo's
// place, sized by missingStyle the way style sizes the image. Off by default: Hero
// and About leave it off, since their frames have a placeholder background of their
// own.
export default function Photo({ photo, thumb = false, sizes, as: Img = 'img', showMissing = false, missingStyle, ...imgProps }) {
  const widths = thumb ? [WIDTHS[0]] : WIDTHS
  const fallback = photo.variants[thumb ? WIDTHS[0] : WIDTHS[1]]
  const largest = photo.variants[widths[widths.length - 1]]
  const [failed, onError] = useLoadFailed(fallback.webp)

  if (failed) {
    return (
      <MissingImage
        width={largest.width}
        height={largest.height}
        alt={imgProps.alt}
        onClick={imgProps.onClick}
        style={missingStyle}
      />
    )
  }

  return (
    <picture style={{ display: 'contents' }}>
      <source type="image/avif" srcSet={srcSet(photo, 'avif', widths)} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(photo, 'webp', widths)} sizes={sizes} />
      <Img
        src={fallback.webp}
        width={largest.width}
        height={largest.height}
        {...imgProps}
        onError={showMissing ? onError : undefined}
      />
    </picture>
  )
}
