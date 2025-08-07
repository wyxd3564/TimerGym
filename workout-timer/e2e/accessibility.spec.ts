import { test, expect } from '@playwright/test';

test.describe('Accessibility E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    
    // Should focus on templates button
    await expect(page.locator('[data-testid="templates-button"]')).toBeFocused();
    
    // Continue tabbing
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="settings-button"]')).toBeFocused();
    
    // Tab to time display (should be focusable for editing)
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="time-display"]')).toBeFocused();
    
    // Tab to repetition controls
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="decrement-reps"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="increment-reps"]')).toBeFocused();
    
    // Tab to timer controls
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="start-button"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="reset-button"]')).toBeFocused();
  });

  test('should support keyboard shortcuts', async ({ page }) => {
    // Set a short timer
    await page.locator('[data-testid="time-display"]').click();
    await page.locator('[data-testid="minutes-input"]').fill('0');
    await page.locator('[data-testid="seconds-input"]').fill('5');
    await page.locator('[data-testid="confirm-time"]').click();
    
    // Start timer with spacebar
    await page.keyboard.press('Space');
    await expect(page.locator('[data-testid="start-button"]')).toContainText('일시정지');
    
    // Pause with spacebar
    await page.keyboard.press('Space');
    await expect(page.locator('[data-testid="start-button"]')).toContainText('시작');
    
    // Reset with 'r' key
    await page.keyboard.press('r');
    await expect(page.locator('[data-testid="time-display"]')).toContainText('00:05');
    
    // Increment reps with '+' key
    await page.keyboard.press('+');
    await expect(page.locator('[data-testid="repetition-count"]')).toContainText('1');
    
    // Decrement reps with '-' key
    await page.keyboard.press('-');
    await expect(page.locator('[data-testid="repetition-count"]')).toContainText('0');
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    // Check main timer display has proper role
    await expect(page.locator('[data-testid="timer-display"]')).toHaveAttribute('role', 'timer');
    
    // Check buttons have proper labels
    await expect(page.locator('[data-testid="start-button"]')).toHaveAttribute('aria-label');
    await expect(page.locator('[data-testid="reset-button"]')).toHaveAttribute('aria-label');
    await expect(page.locator('[data-testid="templates-button"]')).toHaveAttribute('aria-label');
    await expect(page.locator('[data-testid="settings-button"]')).toHaveAttribute('aria-label');
    
    // Check repetition controls have labels
    await expect(page.locator('[data-testid="increment-reps"]')).toHaveAttribute('aria-label');
    await expect(page.locator('[data-testid="decrement-reps"]')).toHaveAttribute('aria-label');
    
    // Check time display is announced to screen readers
    await expect(page.locator('[data-testid="time-display"]')).toHaveAttribute('aria-live', 'polite');
  });

  test('should announce timer state changes', async ({ page }) => {
    // Set timer
    await page.locator('[data-testid="time-display"]').click();
    await page.locator('[data-testid="minutes-input"]').fill('0');
    await page.locator('[data-testid="seconds-input"]').fill('3');
    await page.locator('[data-testid="confirm-time"]').click();
    
    // Check for live region that announces timer state
    const liveRegion = page.locator('[aria-live="assertive"]');
    await expect(liveRegion).toBeAttached();
    
    // Start timer
    await page.locator('[data-testid="start-button"]').click();
    
    // Wait for timer to complete
    await page.waitForTimeout(4000);
    
    // Verify completion is announced
    await expect(liveRegion).toContainText('타이머 완료');
  });

  test('should support high contrast mode', async ({ page }) => {
    // Enable high contrast simulation
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    
    // Verify elements are still visible and have sufficient contrast
    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible();
    await expect(page.locator('[data-testid="start-button"]')).toBeVisible();
    
    // Check that focus indicators are visible
    await page.locator('[data-testid="start-button"]').focus();
    
    // Verify button has visible focus indicator
    const focusedButton = page.locator('[data-testid="start-button"]:focus');
    await expect(focusedButton).toBeVisible();
  });

  test('should respect reduced motion preferences', async ({ page }) => {
    // Enable reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    // Set and start timer
    await page.locator('[data-testid="time-display"]').click();
    await page.locator('[data-testid="minutes-input"]').fill('0');
    await page.locator('[data-testid="seconds-input"]').fill('5');
    await page.locator('[data-testid="confirm-time"]').click();
    await page.locator('[data-testid="start-button"]').click();
    
    // Verify circular progress still updates but without excessive animation
    const circularProgress = page.locator('[data-testid="circular-progress"]');
    await expect(circularProgress).toBeVisible();
    
    // Check that animations are reduced (this would need specific CSS checks)
    const computedStyle = await circularProgress.evaluate((el) => {
      return window.getComputedStyle(el).getPropertyValue('animation-duration');
    });
    
    // In reduced motion mode, animations should be faster or disabled
    expect(computedStyle === '0s' || computedStyle === '0.01s').toBeTruthy();
  });

  test('should work with screen reader simulation', async ({ page }) => {
    // Focus on timer display
    await page.locator('[data-testid="time-display"]').focus();
    
    // Verify it can be read by screen reader
    const timeDisplay = page.locator('[data-testid="time-display"]');
    const ariaLabel = await timeDisplay.getAttribute('aria-label');
    expect(ariaLabel).toContain('분');
    expect(ariaLabel).toContain('초');
    
    // Check repetition count is readable
    const repCount = page.locator('[data-testid="repetition-count"]');
    const repLabel = await repCount.getAttribute('aria-label');
    expect(repLabel).toContain('반복');
    
    // Verify progress is announced
    const progress = page.locator('[data-testid="circular-progress"]');
    const progressLabel = await progress.getAttribute('aria-label');
    expect(progressLabel).toContain('진행률');
  });
});