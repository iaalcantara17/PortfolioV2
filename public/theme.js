// Sets <html data-theme> before the page first paints, so a dark page never flashes
// light: the visitor's own choice from the nav's toggle (localStorage "theme"), or
// without one, their system setting. A plain script in <head>, since a module would
// run only after the page is parsed, and a file rather than inline code, which the
// Content-Security-Policy doesn't allow. Once the app runs, src/utils/theme.js takes
// over. The 404 page loads it too.
;(function () {
  var stored = null
  try {
    stored = localStorage.getItem('theme')
  } catch {
    // Storage blocked (private mode, site data off): the system setting decides
  }
  var dark = stored === 'dark' || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
})()
