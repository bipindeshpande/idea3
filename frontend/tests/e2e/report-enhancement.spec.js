import { test, expect } from '@playwright/test'

test.describe('Report Enhancement', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should enhance report with all three types', async ({ page }) => {
    // Navigate to a recommendations report
    await page.goto('/results/recommendations?sample=true')
    
    // Click enhance button
    await page.click('button:has-text("Enhance")')
    
    // Wait for enhancement to complete
    await page.waitForSelector('text=Similar Ideas', { timeout: 15000 })
    
    // Verify all three enhancement types are present
    await expect(page.locator('text=Similar Ideas')).toBeVisible()
    await expect(page.locator('text=Market Insights')).toBeVisible()
    await expect(page.locator('text=Validation Suggestions')).toBeVisible()
  })
})

