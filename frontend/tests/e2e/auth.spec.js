import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should register new user', async ({ page }) => {
    await page.goto('/register')
    
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`)
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('/dashboard')
  })

  test('should login existing user', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('/dashboard')
  })

  test('should logout user', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    
    // Logout
    await page.click('button:has-text("Logout")')
    
    await expect(page).toHaveURL('/')
  })

  test('should reset password', async ({ page }) => {
    await page.goto('/forgot-password')
    
    await page.fill('input[name="email"]', 'test@example.com')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=reset link')).toBeVisible()
  })
})

