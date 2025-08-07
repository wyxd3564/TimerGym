import { test, expect } from '@playwright/test';

test.describe('Responsive Design E2E Tests', () => {
  test('should work correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Verify main elements are visible and properly sized
    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible();
    await expect(page.locator('[data-testid="start-button"]')).toBeVisible();
    
    // Check that buttons are large enough for touch (minimum 44px)
    const startButton = page.locator('[data-testid="start-button"]');
    const buttonBox = await startButton.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
    expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
    
    // Test timer functionality on mobile
    await page.locator('[data-testid="time-display"]').click();
    await page.locator('[data-testid="minutes-input"]').fill('0');
    await page.locator('[data-testid="seconds-input"]').fill('3');
    await page.locator('[data-testid="confirm-time"]').click();
    
    await page.locator('[data-testid="start-button"]').click();
    await expect(page.locator('[data-testid="start-button"]')).toContainText('일시정지');
  });

  test('should work correctly on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Verify layout adapts to tablet size
    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible();
    
    // Check that circular progress is appropriately sized
    const circularProgress = page.locator('[data-testid="circular-progress"]');
    const progressBox = await circularProgress.boundingBox();
    expect(progressBox?.width).toBeGreaterThan(200); // Should be larger on tablet
    
    // Test templates modal on tablet
    await page.locator('[data-testid="templates-button"]').click();
    await expect(page.locator('[data-testid="templates-modal"]')).toBeVisible();
    
    // Modal should be appropriately sized for tablet
    const modal = page.locator('[data-testid="templates-modal"]');
    const modalBox = await modal.boundingBox();
    expect(modalBox?.width).toBeLessThan(768); // Should not be full width
  });

  test('should work correctly on desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Verify layout works on desktop
    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible();
    
    // Check that content is centered and not too wide
    const appContainer = page.locator('[data-testid="app-container"]');
    const containerBox = await appContainer.boundingBox();
    expect(containerBox?.width).toBeLessThan(800); // Should have max width
    
    // Test settings modal on desktop
    await page.locator('[data-testid="settings-button"]').click();
    await expect(page.locator('[data-testid="settings-modal"]')).toBeVisible();
  });

  test('should handle orientation changes', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Verify portrait layout
    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible();
    
    // Switch to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    
    // Verify layout adapts to landscape
    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible();
    
    // Test that timer still works in landscape
    await page.locator('[data-testid="time-display"]').click();
    await page.locator('[data-testid="minutes-input"]').fill('0');
    await page.locator('[data-testid="seconds-input"]').fill('3');
    await page.locator('[data-testid="confirm-time"]').click();
    
    await page.locator('[data-testid="start-button"]').click();
    await expect(page.locator('[data-testid="start-button"]')).toContainText('일시정지');
  });

  test('should have proper touch targets on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check all interactive elements meet minimum touch target size (44px)
    const interactiveElements = [
      '[data-testid="templates-button"]',
      '[data-testid="settings-button"]',
      '[data-testid="start-button"]',
      '[data-testid="reset-button"]',
      '[data-testid="increment-reps"]',
      '[data-testid="decrement-reps"]'
    ];
    
    for (const selector of interactiveElements) {
      const element = page.locator(selector);
      const box = await element.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
      expect(box?.width).toBeGreaterThanOrEqual(44);
    }
  });

  test('should handle very small screens', async ({ page }) => {
    // Set very small viewport (like older phones)
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    
    // Verify app still works on very small screens
    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible();
    
    // Check that content doesn't overflow
    const body = page.locator('body');
    const bodyBox = await body.boundingBox();
    expect(bodyBox?.width).toBeLessThanOrEqual(320);
    
    // Test basic functionality
    await page.locator('[data-testid="start-button"]').click();
    await expect(page.locator('[data-testid="start-button"]')).toContainText('일시정지');
  });

  test('should handle very large screens', async ({ page }) => {
    // Set very large viewport
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.goto('/');
    
    // Verify app doesn't become too large
    const appContainer = page.locator('[data-testid="app-container"]');
    const containerBox = await appContainer.boundingBox();
    expect(containerBox?.width).toBeLessThan(1000); // Should have reasonable max width
    
    // Verify content is centered
    const containerLeft = containerBox?.x || 0;
    const viewportCenter = 2560 / 2;
    const containerCenter = containerLeft + (containerBox?.width || 0) / 2;
    
    // Container should be roughly centered (within 100px tolerance)
    expect(Math.abs(containerCenter - viewportCenter)).toBeLessThan(100);
  });

  test('should work with zoom levels', async ({ page }) => {
    await page.goto('/');
    
    // Test with 150% zoom
    await page.evaluate(() => {
      document.body.style.zoom = '1.5';
    });
    
    // Verify app still works with zoom
    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible();
    await expect(page.locator('[data-testid="start-button"]')).toBeVisible();
    
    // Test basic functionality with zoom
    await page.locator('[data-testid="start-button"]').click();
    await expect(page.locator('[data-testid="start-button"]')).toContainText('일시정지');
    
    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '1';
    });
  });
});