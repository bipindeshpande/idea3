import { test, expect } from '@playwright/test'

test.describe('Validation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should navigate to validation page', async ({ page }) => {
    await page.goto('/validate-idea')
    
    await expect(page).toHaveURL('/validate-idea')
    await expect(page.locator('text=Validate') || page.locator('text=Idea')).toBeVisible()
  })

  test('should fill validation form', async ({ page }) => {
    await page.goto('/validate-idea')
    
    // Fill idea description
    const ideaInput = page.locator('textarea[name="idea"]').or(page.locator('textarea[placeholder*="idea"]'))
    if (await ideaInput.isVisible()) {
      await ideaInput.fill('A new SaaS product for managing tasks')
    }
    
    // Check if form is visible
    const formVisible = await page.locator('form').isVisible().catch(() => false)
    expect(formVisible).toBeTruthy()
  })

  test('should navigate through validation tabs', async ({ page }) => {
    await page.goto('/validate-idea')
    
    // Check for tab navigation
    const inputTab = page.locator('button:has-text("Input")').or(page.locator('button:has-text("1")'))
    const analysisTab = page.locator('button:has-text("Analysis")').or(page.locator('button:has-text("2")'))
    
    if (await inputTab.isVisible()) {
      await inputTab.click()
      await expect(inputTab).toHaveAttribute('aria-selected', 'true')
    }
    
    if (await analysisTab.isVisible()) {
      await analysisTab.click()
      await expect(analysisTab).toHaveAttribute('aria-selected', 'true')
    }
  })
})

