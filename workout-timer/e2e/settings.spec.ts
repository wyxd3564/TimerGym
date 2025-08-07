import { test, expect } from '@playwright/test';

test.describe('Settings E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible();
  });

  test('should open and close settings modal', async ({ page }) => {
    // Open settings
    await page.locator('[data-testid="settings-button"]').click();
    
    // Verify settings modal is open
    await expect(page.locator('[data-testid="settings-modal"]')).toBeVisible();
    
    // Close settings
    await page.locator('[data-testid="close-settings"]').click();
    
    // Verify settings modal is closed
    await expect(page.locator('[data-testid="settings-modal"]')).not.toBeVisible();
  });

  test('should toggle sound notifications', async ({ page }) => {
    // Open settings
    await page.locator('[data-testid="settings-button"]').click();
    
    // Get initial state of sound toggle
    const soundToggle = page.locator('[data-testid="sound-toggle"]');
    const initialState = await soundToggle.isChecked();
    
    // Toggle sound setting
    await soundToggle.click();
    
    // Verify state changed
    await expect(soundToggle).toBeChecked({ checked: !initialState });
    
    // Close and reopen settings to verify persistence
    await page.locator('[data-testid="close-settings"]').click();
    await page.locator('[data-testid="settings-button"]').click();
    
    // Verify setting persisted
    await expect(soundToggle).toBeChecked({ checked: !initialState });
  });

  test('should toggle vibration notifications', async ({ page }) => {
    // Open settings
    await page.locator('[data-testid="settings-button"]').click();
    
    // Get initial state of vibration toggle
    const vibrationToggle = page.locator('[data-testid="vibration-toggle"]');
    const initialState = await vibrationToggle.isChecked();
    
    // Toggle vibration setting
    await vibrationToggle.click();
    
    // Verify state changed
    await expect(vibrationToggle).toBeChecked({ checked: !initialState });
    
    // Close and reopen settings to verify persistence
    await page.locator('[data-testid="close-settings"]').click();
    await page.locator('[data-testid="settings-button"]').click();
    
    // Verify setting persisted
    await expect(vibrationToggle).toBeChecked({ checked: !initialState });
  });

  test('should change notification sound', async ({ page }) => {
    // Open settings
    await page.locator('[data-testid="settings-button"]').click();
    
    // Select different sound
    await page.locator('[data-testid="sound-beep"]').click();
    
    // Verify selection
    await expect(page.locator('[data-testid="sound-beep"]')).toBeChecked();
    
    // Close and reopen settings to verify persistence
    await page.locator('[data-testid="close-settings"]').click();
    await page.locator('[data-testid="settings-button"]').click();
    
    // Verify setting persisted
    await expect(page.locator('[data-testid="sound-beep"]')).toBeChecked();
  });

  test('should toggle theme', async ({ page }) => {
    // Open settings
    await page.locator('[data-testid="settings-button"]').click();
    
    // Get initial theme
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    const initialState = await themeToggle.isChecked();
    
    // Toggle theme
    await themeToggle.click();
    
    // Verify theme changed
    await expect(themeToggle).toBeChecked({ checked: !initialState });
    
    // Close settings and verify theme applied to body
    await page.locator('[data-testid="close-settings"]').click();
    
    // Check if dark theme class is applied to body
    if (!initialState) {
      await expect(page.locator('body')).toHaveClass(/dark/);
    } else {
      await expect(page.locator('body')).not.toHaveClass(/dark/);
    }
  });

  test('should toggle keep screen on setting', async ({ page }) => {
    // Open settings
    await page.locator('[data-testid="settings-button"]').click();
    
    // Get initial state of keep screen on toggle
    const keepScreenOnToggle = page.locator('[data-testid="keep-screen-on-toggle"]');
    const initialState = await keepScreenOnToggle.isChecked();
    
    // Toggle keep screen on setting
    await keepScreenOnToggle.click();
    
    // Verify state changed
    await expect(keepScreenOnToggle).toBeChecked({ checked: !initialState });
    
    // Close and reopen settings to verify persistence
    await page.locator('[data-testid="close-settings"]').click();
    await page.locator('[data-testid="settings-button"]').click();
    
    // Verify setting persisted
    await expect(keepScreenOnToggle).toBeChecked({ checked: !initialState });
  });
});