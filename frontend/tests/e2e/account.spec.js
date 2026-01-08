import { test, expect } from '@playwright/test'

test.describe('Account Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should change password', async ({ page }) => {
    await page.goto('/account')
    
    await page.fill('input[name="currentPassword"]', 'password123')
    await page.fill('input[name="newPassword"]', 'newpassword456')
    await page.fill('input[name="confirmPassword"]', 'newpassword456')
    await page.click('button:has-text("Change Password")')
    
    await expect(page.locator('text=Password changed successfully')).toBeVisible()
  })

  test('should view subscription information', async ({ page }) => {
    await page.goto('/account')
    
    await expect(page.locator('text=Subscription')).toBeVisible()
    await expect(page.locator('text=Active')).toBeVisible()
  })

  test('should cancel subscription', async ({ page }) => {
    await page.goto('/account')
    
    await page.click('button:has-text("Cancel Subscription")')
    await page.selectOption('select[name="cancellation-reason"]', 'too_expensive')
    await page.click('button:has-text("Confirm Cancellation")')
    
    await expect(page.locator('text=Subscription cancelled')).toBeVisible()
  })
})

