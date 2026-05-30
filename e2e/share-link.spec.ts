import { test, expect, type Page } from '@playwright/test'
import { encodeLabsShareQueryValue } from '../src/labsShareCodec'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('tower-export-first-run-hint-v1', '1')
    localStorage.setItem('tower-export-whats-new-seen-v1', '2.8.11')
  })
})

async function openLabPanel(page: Page) {
  await page.locator('#inpanel-tab-lab').click()
  const panel = page.locator('#inpanel-panel-lab')
  await panel.waitFor({ state: 'visible', timeout: 90_000 })
  await panel
    .locator('.research-card:not(.research-card--hidden) .research-card__levelInput')
    .first()
    .waitFor({ state: 'visible', timeout: 90_000 })
}

test.describe('lab share link', () => {
  test('copy link restores lab levels in a new session', async ({ page, context }) => {
    test.setTimeout(90_000)
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await page.goto('/')
    await page.locator('#inpanel-tab-lab').waitFor({ state: 'visible', timeout: 90_000 })
    await openLabPanel(page)

    const card = page
      .locator('#inpanel-panel-lab .research-card:not(.research-card--hidden)')
      .first()
    const levelInput = card.locator('.research-card__levelInput')
    const increase = card.getByRole('button', { name: 'Increase level' })

    await increase.click()
    await increase.click()
    await expect(levelInput).toHaveValue('2')

    await page
      .getByRole('button', {
        name: /copy a short url that opens this build/i,
      })
      .click()

    await expect
      .poll(async () => page.evaluate(() => navigator.clipboard.readText()))
      .toMatch(/tower=/)
    const shareUrl = await page.evaluate(() => navigator.clipboard.readText())

    await page.goto(shareUrl)
    await page.locator('#inpanel-tab-lab').waitFor({ state: 'visible', timeout: 90_000 })
    await openLabPanel(page)

    const reopened = page
      .locator('#inpanel-panel-lab .research-card:not(.research-card--hidden)')
      .first()
      .locator('.research-card__levelInput')
    await expect(reopened).toHaveValue('2')
  })

  test('?tower= on mount applies encoded overrides', async ({ page }) => {
    test.setTimeout(90_000)
    const enc = await encodeLabsShareQueryValue({ '0-0': 5 })
    await page.goto(`/?tower=${encodeURIComponent(enc)}`)
    await page.locator('#inpanel-tab-lab').waitFor({ state: 'visible', timeout: 90_000 })
    await openLabPanel(page)

    await expect(
      page.locator('#inpanel-panel-lab .research-card__levelInput[value="5"]').first(),
    ).toBeVisible()
  })
})
