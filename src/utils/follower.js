const OFFSET_X = 14
const OFFSET_Y = 18

// Places a hover follower (a .card-follower inside a position: relative card) just
// below and to the right of the pointer, flipping left or above near the card's
// edges so it stays on the card. Where neither side fits (a follower bigger than
// the room, like an image preview on a short card), it takes the side with more
// room and overhangs the card. Call from the card's pointermove.
export function placeFollower(e, card, follower) {
  const rect = card.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const right = x + OFFSET_X
  const left = x - OFFSET_X - follower.offsetWidth
  const below = y + OFFSET_Y
  const above = y - OFFSET_Y - follower.offsetHeight
  const useRight = right + follower.offsetWidth <= card.offsetWidth || (left < 0 && x < card.offsetWidth / 2)
  const useBelow = below + follower.offsetHeight <= card.offsetHeight || (above < 0 && y < card.offsetHeight / 2)
  follower.style.left = `${useRight ? right : left}px`
  follower.style.top = `${useBelow ? below : above}px`
}

// pointermove handler for a card with a follower: places it, for mouse pointers only
export function followPointer(e) {
  if (e.pointerType !== 'mouse') return
  const follower = e.currentTarget.querySelector('.card-follower')
  if (follower) placeFollower(e, e.currentTarget, follower)
}
