import { test, expect } from '@playwright/test';

test.describe('Background Operation E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible();
  });

  test('should maintain timer state when tab becomes hidden', async ({ page, context }) => {
    // Set a timer
    await page.locator('[data-testid="time-display"]').click();
    await page.locator('[data-testid="minutes-input"]').fill('0');
    await page.locator('[data-testid="seconds-input"]').fill('10');
    await page.locator('[data-testid="confirm-time"]').click();
    
    // Start timer
    await page.locator('[data-testid="start-button"]').click();
    
    // Wait a bit
    await page.waitForTimeout(2000);
    
    // Create a new tab to simulate background
    const newPage = await context.newPage();
    await newPage.goto('about:blank');
    
    // Wait for some time while original tab is in background
    await newPage.waitForTimeout(3000);
    
    // Switch back to original tab
    await page.bringToFront();
    
    // Verify timer continued running (should be around 5 seconds or less)
    const timeText = await page.locator('[data-testid="time-display"]').textContent();
    const [minutes, seconds] = timeText?.split(':').map(Number) || [0, 0];
    const totalSeconds = minutes * 60 + seconds;
    
    // Timer should have continued running, so should be less than 8 seconds
    expect(totalSeconds).toBeLessThan(8);
    
    await newPage.close();
  });

  test('should restore timer state after page reload during timer', async ({ page }) => {
    // Set a timer
    await page.locator('[data-testid="time-display"]').click();
    await page.locator('[data-testid="minutes-input"]').fill('0');
    await page.locator('[data-testid="seconds-input"]').fill('15');
    await page.locator('[data-testid="confirm-time"]').click();
    
    // Start timer
    await page.locator('[data-testid="start-button"]').click();
    
    // Wait a bit
    await page.waitForTimeout(3000);
    
    // Reload the page
    await page.reload();
    
    // Wait for app to load
    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible();
    
    // Verify timer state is restored (should be less than 15 seconds)
    const timeText = await page.locator('[data-testid="time-display"]').textContent();
    const [minutes, seconds] = timeText?.split(':').map(Number) || [0, 0];
    const totalSeconds = minutes * 60 + seconds;
    
    // Timer should have continued running during reload
    expect(totalSeconds).toBeLessThan(15);
    expect(totalSeconds).toBeGreaterThan(0);
  });

  test('should handle visibility change events correctly', async ({ page }) => {
    // Set a timer
    await page.locator('[data-testid="time-display"]').click();
    await page.locator('[data-testid="minutes-input"]').fill('0');
    await page.locator('[data-testid="seconds-input"]').fill('8');
    await page.locator('[data-testid="confirm-time"]').click();
    
    // Start timer
    await page.locator('[data-testid="start-button"]').click();
    
    // Simulate tab becoming hidden
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', {
        writable: true,
        value: true
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    
    // Wait while "hidden"
    await page.waitForTimeout(2000);
    
    // Simulate tab becoming visible again
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', {
        writable: true,
        value: false
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    
    // Verify timer continued running
    const timeText = await page.locator('[data-testid="time-display"]').textContent();
    const [minutes, seconds] = timeText?.split(':').map(Number) || [0, 0];
    const totalSeconds = minutes * 60 + seconds;
    
    // Should be less than 8 seconds since timer continued
    expect(totalSeconds).toBeLessThan(8);
  });

  test('should persist settings across page reloads', async ({ page }) => {
    // Open settings and change some values
    await page.locator('[data-testid="settings-button"]').click();
    
    // Toggle sound off
    const soundToggle = page.locator('[data-testid="sound-toggle"]');
    if (await soundToggle.isChecked()) {
      await soundToggle.click();
    }
    
    // Change to beep sound
    await page.locator('[data-testid="sound-beep"]').click();
    
    // Toggle theme
    await page.locator('[data-testid="theme-toggle"]').click();
    
    // Close settings
    await page.locator('[data-testid="close-settings"]').click();
    
    // Reload page
    await page.reload();
    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible();
    
    // Open settings and verify persistence
    await page.locator('[data-testid="settings-button"]').click();
    
    // Verify settings persisted
    await expect(page.locator('[data-testid="sound-toggle"]')).not.toBeChecked();
    await expect(page.locator('[data-testid="sound-beep"]')).toBeChecked();
    await expect(page.locator('[data-testid="theme-toggle"]')).toBeChecked();
  });

  test('should persist custom templates across page reloads', async ({ page }) => {
    // Create a custom template
    await page.locator('[data-testid="templates-button"]').click();
    await page.locator('[data-testid="add-template"]').click();
    await page.locator('[data-testid="template-name"]').fill('지속성 테스트');
    await page.locator('[data-testid="template-minutes"]').fill('2');
    await page.locator('[data-testid="template-seconds"]').fill('15');
    await page.locator('[data-testid="save-template"]').click();
    
    // Close templates modal
    await page.locator('[data-testid="close-templates"]').click();
    
    // Reload page
    await page.reload();
    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible();
    
    // Open templates and verify custom template persisted
    await page.locator('[data-testid="templates-button"]').click();
    await expect(page.locator('[data-testid="custom-template-지속성 테스트"]')).toBeVisible();
    
    // Use the template to verify it works
    await page.locator('[data-testid="custom-template-지속성 테스트"]').click();
    await expect(page.locator('[data-testid="time-display"]')).toContainText('02:15');
  });
});