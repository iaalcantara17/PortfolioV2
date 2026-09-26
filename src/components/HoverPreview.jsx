import Photo from './Photo'

// A small image preview that follows the pointer while its card is hovered (a
// .card-follower, placed by followPointer in utils/follower.js). Mouse only;
// decorative, since the card itself says what it opens.
export default function HoverPreview({ image }) {
  return (
    <span className="card-follower card-hover-preview" aria-hidden="true">
      <Photo photo={image} thumb sizes="140px" alt="" loading="lazy" />
    </span>
  )
}
