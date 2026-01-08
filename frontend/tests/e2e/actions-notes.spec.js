import { test, expect } from '@playwright/test'

test.describe('Actions and Notes', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should create action', async ({ page }) => {
    await page.goto('/results/recommendations/0?sample=true')
    
    await page.click('button:has-text("Add Action")')
    await page.fill('textarea[name="action"]', 'Test action')
    await page.click('button:has-text("Save")')
    
    await expect(page.locator('text=Test action')).toBeVisible()
  })

  test('should create note', async ({ page }) => {
    await page.goto('/results/recommendations/0?sample=true')
    
    await page.click('button:has-text("Add Note")')
    await page.fill('textarea[name="note"]', 'Test note')
    await page.click('button:has-text("Save")')
    
    await expect(page.locator('text=Test note')).toBeVisible()
  })

  test('should edit action', async ({ page }) => {
    // Create action first
    await page.goto('/results/recommendations/0?sample=true')
    await page.click('button:has-text("Add Action")')
    await page.fill('textarea[name="action"]', 'Original action')
    await page.click('button:has-text("Save")')
    
    // Edit it
    await page.click('button:has-text("Edit")')
    await page.fill('textarea[name="action"]', 'Updated action')
    await page.click('button:has-text("Save")')
    
    await expect(page.locator('text=Updated action')).toBeVisible()
  })

  test('should delete action', async ({ page }) => {
    // Create action first
    await page.goto('/results/recommendations/0?sample=true')
    await page.click('button:has-text("Add Action")')
    await page.fill('textarea[name="action"]', 'Action to delete')
    await page.click('button:has-text("Save")')
    
    // Delete it
    await page.click('button:has-text("Delete")')
    await page.click('button:has-text("Confirm")')
    
    await expect(page.locator('text=Action to delete')).not.toBeVisible()
  })
})

