import { test, expect } from '@playwright/test'

test.describe('Discovery Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should navigate to discovery intake screen', async ({ page }) => {
    await page.goto('/discovery/intake')
    
    await expect(page).toHaveURL('/discovery/intake')
    await expect(page.locator('text=Discovery')).toBeVisible()
  })

  test('should fill discovery form and submit', async ({ page }) => {
    await page.goto('/discovery/intake')
    
    // Fill form fields
    await page.selectOption('select[name="goal_type"]', 'start_business')
    await page.selectOption('select[name="time_commitment"]', 'part_time')
    await page.selectOption('select[name="budget_range"]', 'low')
    await page.selectOption('select[name="interest_area"]', 'technology')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should navigate to discovery results or show loading
    await expect(page.locator('text=Loading') || page.locator('text=Ideas')).toBeVisible({ timeout: 10000 })
  })

  test('should display discovery results', async ({ page }) => {
    // Assuming a discovery run exists, navigate to results
    await page.goto('/discovery')
    
    // Check for common discovery page elements
    const hasResults = await page.locator('text=Ideas').isVisible().catch(() => false)
    const hasProfile = await page.locator('text=Profile').isVisible().catch(() => false)
    
    expect(hasResults || hasProfile).toBeTruthy()
  })
})

