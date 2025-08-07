import { test, expect } from '@playwright/test';

test.describe('Debug Tests', () => {
  test('should debug app structure and elements', async ({ page }) => {
    await page.goto('/');
    
    // Wait for app to load
    await page.waitForTimeout(2000);
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-screenshot.png' });
    
    // Check if main elements exist
    const timerDisplay = page.locator('[data-testid="timer-display"]');
    const timeDisplay = page.locator('[data-testid="time-display"]');
    const startButton = page.locator('[data-testid="start-button"]');
    
    console.log('Timer display exists:', await timerDisplay.count());
    console.log('Time display exists:', await timeDisplay.count());
    console.log('Start button exists:', await startButton.count());
    
    if (await timeDisplay.count() > 0) {
      const timeText = await timeDisplay.textContent();
      console.log('Time display text:', timeText);
    }
    
    if (await startButton.count() > 0) {
      const buttonText = await startButton.textContent();
      console.log('Start button text:', buttonText);
    }
    
    // Check all elements with data-testid
    const allTestIds = await page.locator('[data-testid]').all();
    console.log('Found elements with data-testid:', allTestIds.length);
    
    for (const element of allTestIds) {
      const testId = await element.getAttribute('data-testid');
      const text = await element.textContent();
      console.log(`Element [data-testid="${testId}"] text: "${text}"`);
    }
  });

  test('should test basic timer functionality', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Try to click time display
    const timeDisplay = page.locator('[data-testid="time-display"]');
    if (await timeDisplay.count() > 0) {
      await timeDisplay.click();
      await page.waitForTimeout(1000);
      
      // Check if modal opened
      const minutesInput = page.locator('[data-testid="minutes-input"]');
      const secondsInput = page.locator('[data-testid="seconds-input"]');
      
      console.log('Minutes input exists:', await minutesInput.count());
      console.log('Seconds input exists:', await secondsInput.count());
      
      if (await minutesInput.count() > 0 && await secondsInput.count() > 0) {
        await minutesInput.fill('0');
        await secondsInput.fill('3');
        
        const confirmButton = page.locator('[data-testid="confirm-time"]');
        if (await confirmButton.count() > 0) {
          await confirmButton.click();
          await page.waitForTimeout(500);
          
          const newTimeText = await timeDisplay.textContent();
          console.log('New time text:', newTimeText);
        }
      }
    }
    
    // Try to start timer
    const startButton = page.locator('[data-testid="start-button"]');
    if (await startButton.count() > 0) {
      const initialText = await startButton.textContent();
      console.log('Initial button text:', initialText);
      
      await startButton.click();
      await page.waitForTimeout(500);
      
      const afterStartText = await startButton.textContent();
      console.log('After start button text:', afterStartText);
    }
  });
});