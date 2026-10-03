const OFFSET_X = 14
const OFFSET_Y = 18

// Places a hover follower (a .card-follower inside a position: relative card) just
// below and to the right of the pointer, flipping left or above near the card's
// edges so it stays on the card. Where neither side fits (a follower bigger than
// the room, like an image preview on a short card), it takes the side with more
// room and overhangs the card. Call from the card's pointermove.
// alwaysBelow skips the vertical flip: the follower stays below the pointer and
// overhangs the card's bottom edge where it must (for one whose trigger sits at the
// bottom of its card, where flipping above would cover the content there).
export function placeFollower(e, card, follower, { alwaysBelow = false } = {}) {
  const rect = card.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const right = x + OFFSET_X
  const left = x - OFFSET_X - follower.offsetWidth
  const below = y + OFFSET_Y
  const above = y - OFFSET_Y - follower.offsetHeight
  const useRight = right + follower.offsetWidth <= card.offsetWidth || (left < 0 && x < card.offsetWidth / 2)
  const useBelow = alwaysBelow || below + follower.offsetHeight <= card.offsetHeight || (above < 0 && y < card.offsetHeight / 2)
  follower.style.left = `${useRight ? right : left}px`
  follower.style.top = `${useBelow ? below : above}px`
}

// pointermove handler for a card with a follower: places it and shows it (.is-shown on
// the follower, .follower-shown on the card while any of its followers shows), for
// mouse pointers only. Keyed off the pointer itself rather than a (hover: hover) media
// query, which only describes a device's primary input: an iPad with a trackpad is
// touch-primary, but Safari reports its trackpad as a mouse.
// card is the element that holds the follower and frames it: the one the handler is
// on, unless given (a control inside the card that shows the card's follower).
// follower picks which of the card's followers, by selector, for a card with more than
// one; the rest of the options go to placeFollower.
export function followPointer(e, card = e.currentTarget, { follower = '.card-follower', ...options } = {}) {
  if (e.pointerType !== 'mouse') return
  const el = card.querySelector(follower)
  if (!el) return
  placeFollower(e, card, el, options)
  el.classList.add('is-shown')
  card.classList.add('follower-shown')
}

// pointerleave handler for a card with a follower: hides it (the one picked by
// follower, as in followPointer)
export function hideFollower(e, card = e.currentTarget, { follower = '.card-follower' } = {}) {
  card.querySelector(follower)?.classList.remove('is-shown')
  if (!card.querySelector('.card-follower.is-shown')) card.classList.remove('follower-shown')
}
