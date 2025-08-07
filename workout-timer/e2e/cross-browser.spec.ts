import { test, expect, devices } from '@playwright/test';

test.describe('Cross-Browser Compatibility Tests', () => {
  // Test core functionality across different browsers
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`should work correctly in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
      test.skip(currentBrowser !== browserName, `Skipping ${browserName} test in ${currentBrowser}`);
      
      await page.goto('/');
      await expect(page.locator('[data-testid="timer-display"]')).toBeVisible();
      
      // Test basic timer functionality
      await page.locator('[data-testid="time-display"]').click();
      await page.locator('[data-testid="minutes-input"]').fill('0');
      await page.locator('[data-testid="seconds-input"]').fill('3');
      await page.locator('[data-testid="confirm-time"]').click();
      
      await page.locator('[data-testid="start-button"]').click();
      await expect(page.locator('[data-testid="start-button"]')).toContainText('일시정지');
      
      // Wait for completion
      await page.waitForTimeout(4000);
      await expect(page.locator('[data-testid="time-display"]')).toContainText('00:00');
    });
  });

  test('should handle Web Audio API differences across browsers', async ({ page }) => {
    await page.goto('/');
    
    // Enable sound in settings
    await page.locator('[data-testid="settings-button"]').click();
    const soundToggle = page.locator('[data-testid="sound-toggle"]');
    if (!(await soundToggle.isChecked())) {
      await soundToggle.click();
    }
    await page.locator('[data-testid="close-settings"]').click();
    
    // Set a short timer to test audio
    await page.locator('[data-testid="time-display"]').click();
    await page.locator('[data-testid="minutes-input"]').fill('0');
    await page.locator('[data-testid="seconds-input"]').fill('5');
    await page.locator('[data-testid="confirm-time"]').click();
    
    // Start timer - this should initialize audio context
    await page.locator('[data-testid="start-button"]').click();
    
    // Wait for countdown sounds (should not throw errors)
    await page.waitForTimeout(6000);
    
    // Verify timer completed without audio errors
    await expect(page.locator('[data-testid="time-display"]')).toContainText('00:00');
  });

  test('should handle localStorage differences across browsers', async ({ page }) => {
    await page.goto('/');
    
    // Create a custom template
    await page.locator('[data-testid="templates-button"]').click();
    await page.locator('[data-testid="add-template"]').click();
    await page.locator('[data-testid="template-name"]').fill('브라우저 테스트');
    await page.locator('[data-testid="template-minutes"]').fill('1');
    await page.locator('[data-testid="template-seconds"]').fill('30');
    await page.locator('[data-testid="save-template"]').click();
    
    // Change settings
    await page.locator('[data-testid="close-templates"]').click();
    await page.locator('[data-testid="settings-button"]').click();
    await page.locator('[data-testid="theme-toggle"]').click();
    await page.locator('[data-testid="close-settings"]').click();
    
    // Reload page to test persistence
    await page.reload();
    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible();
    
    // Verify template persisted
    await page.locator('[data-testid="templates-button"]').click();
    await expect(page.locator('[data-testid="custom-template-브라우저 테스트"]')).toBeVisible();
    
    // Verify settings persisted
    await page.locator('[data-testid="close-templates"]').click();
    await page.locator('[data-testid="settings-button"]').click();
    await expect(page.locator('[data-testid="theme-toggle"]')).toBeChecked();
  });

  test('should handle CSS custom properties across browsers', async ({ page }) => {
    await page.goto('/');
    
    // Test theme switching (uses CSS custom properties)
    await page.locator('[data-testid="settings-button"]').click();
    await page.locator('[data-testid="theme-toggle"]').click();
    await page.locator('[data-testid="close-settings"]').click();
    
    // Verify dark theme is applied
    const bodyClass = await page.locator('body').getAttribute('class');
    expect(bodyClass).toContain('dark');
    
    // Check that circular progress uses correct colors
    const circularProgress = page.locator('[data-testid="circular-progress"]');
    await expect(circularProgress).toBeVisible();
    
    // Switch back to light theme
    await page.locator('[data-testid="settings-button"]').click();
    await page.locator('[data-testid="theme-toggle"]').click();
    await page.locator('[data-testid="close-settings"]').click();
    
    // Verify light theme is applied
    const lightBodyClass = await page.locator('body').getAttribute('class');
    expect(lightBodyClass).not.toContain('dark');
  });

  test('should handle touch events on mobile browsers', async ({ page }) => {
    // Simulate mobile device
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Test touch interactions
    await page.locator('[data-testid="increment-reps"]').tap();
    await expect(page.locator('[data-testid="repetition-count"]')).toContainText('1');
    
    // Test drag time input (if implemented)
    const timeDisplay = page.locator('[data-testid="time-display"]');
    await timeDisplay.click();
    
    // Test touch drag on time inputs
    const minutesInput = page.locator('[data-testid="template-minutes"]');
    if (await minutesInput.isVisible()) {
      // Simulate touch drag
      await minutesInput.hover();
      await page.mouse.down();
      await page.mouse.move(0, -50); // Drag up
      await page.mouse.up();
    }
  });

  test('should handle different viewport sizes across browsers', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568 }, // iPhone SE
      { width: 375, height: 667 }, // iPhone 8
      { width: 768, height: 1024 }, // iPad
      { width: 1920, height: 1080 } // Desktop
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      
      // Verify app loads and is usable at this viewport
      await expect(page.locator('[data-testid="timer-display"]')).toBeVisible();
      await expect(page.locator('[data-testid="start-button"]')).toBeVisible();
      
      // Test basic functionality
      await page.locator('[data-testid="start-button"]').click();
      await expect(page.locator('[data-testid="start-button"]')).toContainText('일시정지');
      await page.locator('[data-testid="start-button"]').click(); // Pause
    }
  });
});