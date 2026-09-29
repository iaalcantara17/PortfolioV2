import { test, expect } from './fixtures'

// Light and dark: the system setting by default, the nav's toggle to choose, and the
// choice kept in localStorage ("theme"). Each test sets the system setting itself,
// so it runs the same in the light and dark projects.
const html = (page) => page.locator('html')
const toggle = (page) => page.locator('.theme-toggle')
// The toggle's name says what it will do
const LABEL = { light: 'Switch to dark mode', dark: 'Switch to light mode' }
const pageColor = (page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor)
const LIGHT = 'rgb(245, 242, 236)'
const DARK = 'rgb(14, 14, 16)'

test.describe('with no choice stored', () => {
  for (const scheme of ['light', 'dark']) {
    test(`a ${scheme} system setting loads the ${scheme} theme`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme })
      await page.goto('/')
      await expect(html(page)).toHaveAttribute('data-theme', scheme)
      await expect(page.getByRole('button', { name: LABEL[scheme] })).toBeVisible()
      expect(await pageColor(page)).toBe(scheme === 'dark' ? DARK : LIGHT)
    })
  }

  test('the page follows the system setting as it changes', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    await expect(html(page)).toHaveAttribute('data-theme', 'light')
    await page.emulateMedia({ colorScheme: 'dark' })
    await expect(html(page)).toHaveAttribute('data-theme', 'dark')
    await page.emulateMedia({ colorScheme: 'light' })
    await expect(html(page)).toHaveAttribute('data-theme', 'light')
  })
})

test.describe('the toggle', () => {
  test('switches the theme, and the choice outlasts a reload and a system change', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')

    await toggle(page).click()
    await expect(html(page)).toHaveAttribute('data-theme', 'dark')
    await expect(toggle(page)).toHaveAccessibleName(LABEL.dark)
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark')
    expect(await pageColor(page)).toBe(DARK)

    await page.reload()
    await expect(html(page)).toHaveAttribute('data-theme', 'dark')
    // A stored choice wins over the system setting, even when that changes
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.emulateMedia({ colorScheme: 'light' })
    await expect(html(page)).toHaveAttribute('data-theme', 'dark')

    await toggle(page).click()
    await expect(html(page)).toHaveAttribute('data-theme', 'light')
    await expect(toggle(page)).toHaveAccessibleName(LABEL.light)
    await page.reload()
    await expect(html(page)).toHaveAttribute('data-theme', 'light')
    expect(await pageColor(page)).toBe(LIGHT)
  })

  test('a stored choice applies before the page first paints', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    // Recorded the moment <body> exists, before the app's own code has run. The
    // document itself is observed: in some browsers this runs before <html> exists.
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark')
      new MutationObserver((_, observer) => {
        if (!document.body) return
        window.__themeAtBody = document.documentElement.dataset.theme
        observer.disconnect()
      }).observe(document, { childList: true, subtree: true })
    })
    await page.goto('/')
    expect(await page.evaluate(() => window.__themeAtBody)).toBe('dark')
  })

  test('morphs its icon between sun and moon', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'no-preference' })
    await page.goto('/')
    await toggle(page).click()
    // The sun's disc is still on its way to the moon's
    const running = await page.locator('.theme-toggle-disc').evaluate((el) => el.getAnimations().length)
    expect(running).toBeGreaterThan(0)
    await expect(html(page)).toHaveAttribute('data-theme', 'dark')
  })

  test('under reduced motion, swaps the icon without the morph', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
    await page.goto('/')
    await toggle(page).click()
    await expect(html(page)).toHaveAttribute('data-theme', 'dark')
    const disc = page.locator('.theme-toggle-disc')
    expect(await disc.evaluate((el) => el.getAnimations().length)).toBe(0)
    // Already the moon's full disc
    expect(await disc.evaluate((el) => getComputedStyle(el).transform)).toBe('none')
  })
})
