const OFFSET_X = 14
const OFFSET_Y = 18

// Places a hover follower (a .card-follower inside a position: relative card) just
// below and to the right of the pointer, flipping left or above near the card's
// edges so it stays on the card. Call from the card's pointermove.
export function placeFollower(e, card, follower) {
  const rect = card.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const fitsRight = x + OFFSET_X + follower.offsetWidth <= card.offsetWidth
  const fitsBelow = y + OFFSET_Y + follower.offsetHeight <= card.offsetHeight
  follower.style.left = `${fitsRight ? x + OFFSET_X : x - OFFSET_X - follower.offsetWidth}px`
  follower.style.top = `${fitsBelow ? y + OFFSET_Y : y - OFFSET_Y - follower.offsetHeight}px`
}
