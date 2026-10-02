import { test, expect, SECTIONS, expectSectionAtTop, goToSection } from './fixtures'

const RESUME = '/Resume_Israel_Alcantara.pdf'

test.describe('page load', () => {
  test('loads with no console errors and no failed requests', async ({ page }) => {
    const problems = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') problems.push(`console error: ${msg.text()}`)
    })
    page.on('pageerror', (err) => problems.push(`page error: ${err.message}`))
    page.on('requestfailed', (req) => problems.push(`failed: ${req.url()} (${req.failure()?.errorText})`))
    page.on('response', (res) => {
      if (res.status() >= 400) problems.push(`HTTP ${res.status()}: ${res.url()}`)
    })

    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Israel Alcantara')
    // Every section, so lazy images and each section's entrance load and run too
    for (const id of SECTIONS) {
      await goToSection(page, id)
      await page.waitForTimeout(300)
    }
    await page.waitForLoadState('networkidle')

    expect(problems).toEqual([])
  })
})

test.describe('nav', () => {
  test('each nav link scrolls to its section', async ({ page }) => {
    await page.goto('/')
    const links = page.locator('.nav-links a')
    await expect(links).toHaveCount(SECTIONS.length - 1)
    // Down the page and back up: About, ..., Contact, then About again
    const anchors = [...SECTIONS.slice(1), 'about']
    for (const id of anchors) {
      await page.locator(`.nav-links a[href="#${id}"]`).click()
      await expectSectionAtTop(page, id)
      await expect(page).toHaveURL(new RegExp(`#${id}$`))
    }
  })
})

test.describe('mobile menu', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('opens and closes from its toggle and with Escape', async ({ page }) => {
    await page.goto('/')
    const toggle = page.locator('.hamburger-btn')
    const menu = page.locator('.mobile-menu-overlay')

    await toggle.click()
    await expect(menu).toBeVisible()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await toggle.click()
    await expect(menu).toHaveCount(0)
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await toggle.click()
    await expect(menu).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(menu).toHaveCount(0)
    await expect(toggle).toBeFocused()
  })

  // The toggle's three bars turn into the X: the outer two rotate into its strokes,
  // the middle one fades. Under reduced motion they switch without moving.
  const bars = (page) => page.locator('.hamburger-btn .hamburger-line')
  // Clicks the toggle and counts the bars' animations right after React has rendered
  // the click (a macrotask later), inside the page, so a slow machine can't let the
  // 200ms morph finish before it's counted
  const clickAndCount = (page) =>
    page.locator('.hamburger-btn').evaluate(async (button) => {
      button.click()
      await new Promise((resolve) => setTimeout(resolve))
      return button.querySelector('svg').getAnimations({ subtree: true }).length
    })
  const middleOpacity = (page) => bars(page).nth(1).evaluate((el) => getComputedStyle(el).opacity)

  test('its bars morph into an X and back', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/')
    await expect(bars(page)).toHaveCount(3)
    expect(await clickAndCount(page)).toBeGreaterThan(0)
    await expect.poll(() => middleOpacity(page)).toBe('0')
    expect(await clickAndCount(page)).toBeGreaterThan(0)
    await expect.poll(() => middleOpacity(page)).toBe('1')
  })

  test('under reduced motion, its bars switch to the X without the morph', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    expect(await clickAndCount(page)).toBe(0)
    expect(await middleOpacity(page)).toBe('0')
    expect(await bars(page).first().evaluate((el) => getComputedStyle(el).transform)).not.toBe('none')
  })

  test('a menu link closes the menu and scrolls to its section', async ({ page }) => {
    await page.goto('/')
    await page.locator('.hamburger-btn').click()
    await page.locator('.mobile-menu-links a', { hasText: 'Projects' }).click()
    await expect(page.locator('.mobile-menu-overlay')).toHaveCount(0)
    await expectSectionAtTop(page, 'projects')
    // Focus follows the jump into the section
    await expect(page.locator('#projects')).toBeFocused()
  })
})

test.describe('lightbox', () => {
  // Opened from the reel's middle frame with the keyboard, so the frame holds focus
  // in every browser (Safari doesn't focus a clicked button)
  async function openFromReel(page) {
    await page.goto('/#gallery')
    const frame = page.locator('.reel-frame[tabindex="0"]')
    await frame.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog', { name: 'Photo viewer' })).toBeVisible()
    return frame
  }

  test('closes with the close button and returns focus to the frame', async ({ page }) => {
    const frame = await openFromReel(page)
    await page.getByRole('dialog').getByRole('button', { name: 'Close' }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(frame).toBeFocused()
  })

  test('closes with Escape and returns focus to the frame', async ({ page }) => {
    const frame = await openFromReel(page)
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(frame).toBeFocused()
  })

  test('closes on a backdrop click and returns focus to the frame', async ({ page }) => {
    const frame = await openFromReel(page)
    // The bottom-left corner: backdrop, clear of the photo and the controls
    const viewport = page.viewportSize()
    await page.getByRole('dialog').click({ position: { x: 20, y: viewport.height - 20 } })
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(frame).toBeFocused()
  })

  // The cursor dot grows over links and buttons, including ones mounted after the page
  // loaded, like the Lightbox's
  test('the cursor dot grows over its controls', async ({ page }) => {
    await openFromReel(page)
    await page.getByRole('dialog').getByRole('button', { name: 'Close' }).hover()
    await expect(page.locator('#custom-cursor')).toHaveClass(/hovering/)
  })

  // Opened before its chunk has arrived, the Lightbox shows through Suspense. It must be
  // ready the moment it's on the page: focus on Close and the page behind it inert,
  // or a key pressed right away still goes to the page.
  test('is ready as soon as it appears, even when its chunk arrives late', async ({ page }) => {
    let releaseChunk
    const chunkHeld = new Promise((resolve) => { releaseChunk = resolve })
    await page.route(/\/assets\/Lightbox-[^/]+\.js$/, async (route) => {
      await chunkHeld
      await route.continue()
    })
    await page.goto('/#gallery')
    const frame = page.locator('.reel-frame[tabindex="0"]')
    await frame.focus()
    // Read once, right after the task that puts the dialog on the page
    await page.evaluate(() => {
      window.lightboxOnInsert = new Promise((resolve) => {
        new MutationObserver((_, observer) => {
          if (!document.querySelector('[role="dialog"]')) return
          observer.disconnect()
          resolve({
            focused: document.activeElement?.getAttribute('aria-label') ?? null,
            pageInert: document.querySelector('.reel-band').closest('[inert]') !== null,
          })
        }).observe(document.body, { childList: true, subtree: true })
      })
    })
    await page.keyboard.press('Enter')
    releaseChunk()
    expect(await page.evaluate(() => window.lightboxOnInsert)).toEqual({ focused: 'Close', pageInert: true })
  })
})

test.describe('resume', () => {
  test('the nav and Contact resume links point to the PDF, which is served', async ({ page }) => {
    await page.goto('/')
    const links = [page.locator('nav a', { hasText: 'Resume' }), page.locator('#contact a', { hasText: 'Download Resume' })]
    for (const link of links) {
      await expect(link).toHaveAttribute('href', RESUME)
    }
    const res = await page.request.get(RESUME)
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('application/pdf')
    expect((await res.body()).subarray(0, 5).toString()).toBe('%PDF-')
  })
})

test.describe('external links', () => {
  test('every link that opens a new tab has rel="noopener noreferrer"', async ({ page }) => {
    await page.goto('/')
    // The links are read once, not retried, so the app has to have rendered first. The
    // whole page renders in one go, so once the Hero's heading is there, every link is.
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Israel Alcantara')
    const links = await page.locator('a[target="_blank"]').evaluateAll((els) =>
      els.map((a) => ({ href: a.getAttribute('href'), rel: (a.getAttribute('rel') ?? '').split(/\s+/) })),
    )
    expect(links.length).toBeGreaterThan(0)
    const missing = links.filter((l) => !l.rel.includes('noopener') || !l.rel.includes('noreferrer'))
    expect(missing).toEqual([])
  })
})

test.describe('skip link', () => {
  test('moves focus to <main>', async ({ page }) => {
    await page.goto('/')
    const skip = page.getByRole('link', { name: 'Skip to main content' })
    await skip.focus()
    await expect(skip).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(page.locator('main#main')).toBeFocused()
  })
})

test.describe('missing images', () => {
  // The city photo is the reel's first, middle frame; the NJIT logo is Education's first
  const CITY = /\/assets\/city-\d+-[^/]+\.(avif|webp)$/
  const NJIT_LOGO = /\/assets\/njit-(?!diploma)[^/]+\.webp$/

  test.beforeEach(async ({ page }) => {
    await page.route((url) => CITY.test(url.pathname) || NJIT_LOGO.test(url.pathname), (route) =>
      route.fulfill({ status: 404, body: '' }),
    )
  })

  test('a reel frame and the Lightbox show MissingImage for a photo that fails', async ({ page }) => {
    await page.goto('/#gallery')
    const frame = page.locator('.reel-frame[tabindex="0"]')
    const tile = frame.locator('.missing-image')
    await expect(tile).toBeVisible()
    await expect(tile).toHaveAttribute('role', 'img')
    await expect(tile).toHaveAttribute('aria-label', /Brooklyn Bridge/)
    await expect(frame.locator('img')).toHaveCount(0)

    await frame.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog')
    await expect(dialog.locator('.missing-image')).toBeVisible()
    await expect(dialog.locator('img')).toHaveCount(0)
  })

  test('an Education logo shows MissingImage when it fails', async ({ page }) => {
    await page.goto('/#education')
    const logo = page.locator('.edu-logo').first()
    await expect(logo.locator('.missing-image')).toBeVisible()
    await expect(logo.locator('img')).toHaveCount(0)
    // The other logo still loads
    await expect(page.locator('.edu-logo').nth(1).locator('img')).toBeVisible()
  })
})
