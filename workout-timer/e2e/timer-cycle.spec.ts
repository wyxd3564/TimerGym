import { test, expect } from '@playwright/test';

test.describe('Complete Timer Cycle E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load
    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible();
  });

  test('should complete full timer cycle with default settings', async ({ page }) => {
    // Set a short timer for testing (5 seconds)
    await page.locator('[data-testid="time-display"]').click();
    
    // Set minutes to 0
    const minutesInput = page.locator('[data-testid="minutes-input"]');
    await minutesInput.fill('0');
    
    // Set seconds to 5
    const secondsInput = page.locator('[data-testid="seconds-input"]');
    await secondsInput.fill('5');
    
    // Confirm time setting
    await page.locator('[data-testid="confirm-time"]').click();
    
    // Verify time is set correctly
    await expect(page.locator('[data-testid="time-display"]')).toContainText('00:05');
    
    // Start the timer
    await page.locator('[data-testid="start-button"]').click();
    
    // Verify timer is running
    await expect(page.locator('[data-testid="start-button"]')).toContainText('정지');
    
    // Wait for timer to complete (with some buffer)
    await page.waitForTimeout(6000);
    
    // Wait for timer completion state to be reflected
    await expect(page.locator('[data-testid="time-display"]')).toContainText('00:00', { timeout: 10000 });
    
    // Wait a bit more for state to update
    await page.waitForTimeout(500);
    
    // Verify timer completed and button shows correct text
    await expect(page.locator('[data-testid="start-button"]')).toContainText('시작');
  });

  test('should handle repetition counting during timer cycle', async ({ page }) => {
    // Set a short timer
    await page.locator('[data-testid="time-display"]').click();
    await page.locator('[data-testid="minutes-input"]').fill('0');
    await page.locator('[data-testid="seconds-input"]').fill('3');
    await page.locator('[data-testid="confirm-time"]').click();
    
    // Start timer
    await page.locator('[data-testid="start-button"]').click();
    
    // Increment repetitions during timer
    await page.locator('[data-testid="increment-reps"]').click();
    await page.locator('[data-testid="increment-reps"]').click();
    
    // Verify repetition count
    await expect(page.locator('[data-testid="repetition-count"]')).toContainText('2');
    
    // Wait for timer to complete
    await page.waitForTimeout(4000);
    
    // Wait for completion state to be reflected
    await expect(page.locator('[data-testid="time-display"]')).toContainText('00:00', { timeout: 5000 });
    
    // Wait a bit more for state to update
    await page.waitForTimeout(500);
    
    // Verify repetitions are maintained after completion (should be incremented by 1 on completion)
    await expect(page.locator('[data-testid="repetition-count"]')).toContainText('3');
  });

  test('should handle pause and resume functionality', async ({ page }) => {
    // Set timer
    await page.locator('[data-testid="time-display"]').click();
    await page.locator('[data-testid="minutes-input"]').fill('0');
    await page.locator('[data-testid="seconds-input"]').fill('10');
    await page.locator('[data-testid="confirm-time"]').click();
    
    // Start timer
    await page.locator('[data-testid="start-button"]').click();
    
    // Wait a bit then pause
    await page.waitForTimeout(2000);
    await page.locator('[data-testid="start-button"]').click();
    
    // Verify timer is paused
    await expect(page.locator('[data-testid="start-button"]')).toContainText('재개');
    
    // Get current time
    const pausedTime = await page.locator('[data-testid="time-display"]').textContent();
    
    // Wait and verify time hasn't changed
    await page.waitForTimeout(2000);
    await expect(page.locator('[data-testid="time-display"]')).toContainText(pausedTime || '');
    
    // Resume timer
    await page.locator('[data-testid="start-button"]').click();
    
    // Verify timer is running again
    await expect(page.locator('[data-testid="start-button"]')).toContainText('정지');
  });

  test('should reset timer correctly', async ({ page }) => {
    // Set timer
    await page.locator('[data-testid="time-display"]').click();
    await page.locator('[data-testid="minutes-input"]').fill('1');
    await page.locator('[data-testid="seconds-input"]').fill('30');
    await page.locator('[data-testid="confirm-time"]').click();
    
    // Start timer and add repetitions
    await page.locator('[data-testid="start-button"]').click();
    await page.locator('[data-testid="increment-reps"]').click();
    await page.locator('[data-testid="increment-reps"]').click();
    
    // Wait a bit
    await page.waitForTimeout(2000);
    
    // Reset timer
    await page.locator('[data-testid="reset-button"]').click();
    
    // Wait for reset to complete
    await page.waitForTimeout(200);
    
    // Verify timer is reset
    await expect(page.locator('[data-testid="time-display"]')).toContainText('01:30');
    await expect(page.locator('[data-testid="repetition-count"]')).toContainText('0');
    await expect(page.locator('[data-testid="start-button"]')).toContainText('시작');
  });

  test('should work with keyboard shortcuts', async ({ page }) => {
    // Set timer
    await page.locator('[data-testid="time-display"]').click();
    await page.locator('[data-testid="minutes-input"]').fill('0');
    await page.locator('[data-testid="seconds-input"]').fill('5');
    await page.locator('[data-testid="confirm-time"]').click();
    
    // Start timer with spacebar
    await page.keyboard.press('Space');
    
    // Verify timer started
    await expect(page.locator('[data-testid="start-button"]')).toContainText('정지');
    
    // Pause with spacebar
    await page.keyboard.press('Space');
    
    // Verify timer paused
    await expect(page.locator('[data-testid="start-button"]')).toContainText('재개');
    
    // Reset with 'r' key
    await page.keyboard.press('r');
    
    // Verify timer reset
    await expect(page.locator('[data-testid="time-display"]')).toContainText('00:05');
  });
});