import { WIDTHS, srcSet } from '../data/photos'

// AVIF with WebP fallback. The <picture> wrapper is display: contents so the
// <img> keeps its place in the parent's layout (flex item, 100% sizing, etc.).
// width/height attributes reserve the aspect ratio; an image sized only by
// max-width/max-height needs width/height: auto in its style to keep its ratio.
export default function Photo({ photo, thumb = false, sizes, as: Img = 'img', ...imgProps }) {
  const widths = thumb ? [WIDTHS[0]] : WIDTHS
  const fallback = photo.variants[thumb ? WIDTHS[0] : WIDTHS[1]]
  const largest = photo.variants[widths[widths.length - 1]]

  return (
    <picture style={{ display: 'contents' }}>
      <source type="image/avif" srcSet={srcSet(photo, 'avif', widths)} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(photo, 'webp', widths)} sizes={sizes} />
      <Img src={fallback.webp} width={largest.width} height={largest.height} {...imgProps} />
    </picture>
  )
}
