import { test as base, expect } from '@playwright/test'

// `vite preview` serves the build but not what only Vercel has: the /api functions
// and Web Analytics' /_vercel/insights script. Every test's page answers those here,
// so a missing Vercel endpoint never reads as a failure of the site's own.
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route('**/_vercel/insights/**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }),
    )
    await page.route('**/api/spotify', (route) =>
      route.fulfill({ json: { isPlaying: false, track: 'Test Track', artist: 'Test Artist' } }),
    )
    await page.route('**/api/track-resume-download', (route) => route.fulfill({ status: 204 }))
    await use(page)
  },
})

export { expect }

// Every section's id (its anchor), in page order
export const SECTIONS = ['hero', 'experience', 'projects', 'skills', 'education', 'about', 'gallery', 'contact']

// Waits until a section's top is at the top of the screen: the page scrolls inside
// .page-scroller, eased by Lenis, so it takes a moment to arrive. Within 2px: an eased
// scroll can settle a pixel off, and on phones, where sections grow as their images
// load, the target can shift slightly while the page is on its way.
export async function expectSectionAtTop(page, id) {
  await expect
    .poll(() => page.locator(`#${id}`).evaluate((el) => Math.abs(el.getBoundingClientRect().top)), {
      message: `#${id} should reach the top of the screen`,
    })
    .toBeLessThanOrEqual(2)
}

// Scrolls a section into view at once, for tests that need to be on it
export async function goToSection(page, id) {
  await page.locator(`#${id}`).evaluate((el) => el.scrollIntoView({ behavior: 'instant' }))
}
