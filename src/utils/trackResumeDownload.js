// Counts a resume download (api/track-resume-download.js), from the resume links' clicks.
// Fire and forget: the link opens the PDF on its own either way, nothing waits on this,
// and a failure is never shown. keepalive lets the request finish even if the page is left.
export function trackResumeDownload() {
  fetch('/api/track-resume-download', { method: 'POST', keepalive: true }).catch(() => {})
}
