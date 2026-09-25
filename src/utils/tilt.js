// Hover tilt for .tilt-card elements. Wire as onMouseMove={(e) => handleTilt(e, e.currentTarget)} and
// onMouseLeave={(e) => resetTilt(e.currentTarget)}.
export const handleTilt = (e, el) => {
  const rect = el.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const cx = rect.width / 2
  const cy = rect.height / 2
  const rx = ((y - cy) / cy) * -6
  const ry = ((x - cx) / cx) * 6
  el.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(4px)`
}

export const resetTilt = (el) => {
  el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) translateZ(0px)'
}
