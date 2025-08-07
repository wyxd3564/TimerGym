import { test, expect } from '@playwright/test';

test.describe('Performance E2E Tests', () => {
  test('should load within performance budget', async ({ page }) => {
    // Start performance monitoring
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Measure page load performance
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
    
    // Performance assertions (based on NFR-2: 0.2s response time)
    expect(performanceMetrics.domContentLoaded).toBeLessThan(200); // 200ms
    expect(performanceMetrics.firstContentfulPaint).toBeLessThan(500); // 500ms
    
    console.log('Performance metrics:', performanceMetrics);
  });

  test('should respond to user interactions within 200ms', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible();
    
    // Test button click response time
    const startTime = Date.now();
    await page.locator('[data-testid="start-button"]').click();
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(200); // NFR-2 requirement
    
    // Verify UI updated
    await expect(page.locator('[data-testid="start-button"]')).toContainText('일시정지');
  });

  test('should handle rapid user interactions without lag', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible();
    
    // Rapidly click repetition buttons
    const startTime = Date.now();
    
    for (let i = 0; i < 10; i++) {
      await page.locator('[data-testid="increment-reps"]').click();
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Should handle 10 clicks in reasonable time
    expect(totalTime).toBeLessThan(1000); // 1 second for 10 clicks
    
    // Verify final state is correct
    await expect(page.locator('[data-testid="repetition-count"]')).toContainText('10');
  });

  test('should maintain smooth animations during timer', async ({ page }) => {
    await page.goto('/');
    
    // Set a timer
    await page.locator('[data-testid="time-display"]').click();
    await page.locator('[data-testid="minutes-input"]').fill('0');
    await page.locator('[data-testid="seconds-input"]').fill('5');
    await page.locator('[data-testid="confirm-time"]').click();
    
    // Start timer
    await page.locator('[data-testid="start-button"]').click();
    
    // Monitor frame rate during animation
    const frameRates: number[] = [];
    let lastTime = performance.now();
    let frameCount = 0;
    
    const measureFrameRate = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= 1000) { // Measure every second
        const fps = frameCount / (deltaTime / 1000);
        frameRates.push(fps);
        frameCount = 0;
        lastTime = currentTime;
      }
      
      frameCount++;
      
      if (frameRates.length < 3) { // Measure for 3 seconds
        requestAnimationFrame(measureFrameRate);
      }
    };
    
    await page.evaluate(measureFrameRate);
    
    // Wait for measurements
    await page.waitForTimeout(4000);
    
    // Check that frame rate is reasonable (should be close to 60fps)
    const avgFrameRate = frameRates.reduce((a, b) => a + b, 0) / frameRates.length;
    expect(avgFrameRate).toBeGreaterThan(30); // At least 30fps
    
    console.log('Average frame rate:', avgFrameRate);
  });

  test('should not have memory leaks during extended use', async ({ page }) => {
    await page.goto('/');
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Simulate extended use - start/stop timer multiple times
    for (let i = 0; i < 5; i++) {
      // Set timer
      await page.locator('[data-testid="time-display"]').click();
      await page.locator('[data-testid="minutes-input"]').fill('0');
      await page.locator('[data-testid="seconds-input"]').fill('2');
      await page.locator('[data-testid="confirm-time"]').click();
      
      // Start and let it run
      await page.locator('[data-testid="start-button"]').click();
      await page.waitForTimeout(2500);
      
      // Reset
      await page.locator('[data-testid="reset-button"]').click();
    }
    
    // Force garbage collection if available
    await page.evaluate(() => {
      if ((window as any).gc) {
        (window as any).gc();
      }
    });
    
    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Memory should not have grown significantly (allow 50% increase)
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = (finalMemory - initialMemory) / initialMemory;
      expect(memoryIncrease).toBeLessThan(0.5); // Less than 50% increase
      
      console.log('Memory usage - Initial:', initialMemory, 'Final:', finalMemory, 'Increase:', memoryIncrease);
    }
  });

  test('should handle background/foreground transitions efficiently', async ({ page, context }) => {
    await page.goto('/');
    
    // Set and start timer
    await page.locator('[data-testid="time-display"]').click();
    await page.locator('[data-testid="minutes-input"]').fill('0');
    await page.locator('[data-testid="seconds-input"]').fill('10');
    await page.locator('[data-testid="confirm-time"]').click();
    await page.locator('[data-testid="start-button"]').click();
    
    // Measure time before background
    const beforeBackground = Date.now();
    
    // Simulate going to background
    const newPage = await context.newPage();
    await newPage.goto('about:blank');
    
    // Wait in background
    await newPage.waitForTimeout(2000);
    
    // Return to foreground and measure response time
    const beforeForeground = Date.now();
    await page.bringToFront();
    
    // Wait for state to sync
    await page.waitForTimeout(100);
    const afterForeground = Date.now();
    
    // Foreground transition should be fast
    const transitionTime = afterForeground - beforeForeground;
    expect(transitionTime).toBeLessThan(500); // Should be fast
    
    // Verify timer continued running
    const timeText = await page.locator('[data-testid="time-display"]').textContent();
    const [minutes, seconds] = timeText?.split(':').map(Number) || [0, 0];
    const remainingSeconds = minutes * 60 + seconds;
    
    expect(remainingSeconds).toBeLessThan(10); // Timer should have continued
    
    await newPage.close();
  });

  test('should efficiently handle modal operations', async ({ page }) => {
    await page.goto('/');
    
    // Test templates modal performance
    let startTime = Date.now();
    await page.locator('[data-testid="templates-button"]').click();
    let endTime = Date.now();
    
    expect(endTime - startTime).toBeLessThan(200); // Modal should open quickly
    await expect(page.locator('[data-testid="templates-modal"]')).toBeVisible();
    
    // Close modal
    startTime = Date.now();
    await page.locator('[data-testid="close-templates"]').click();
    endTime = Date.now();
    
    expect(endTime - startTime).toBeLessThan(200); // Modal should close quickly
    await expect(page.locator('[data-testid="templates-modal"]')).not.toBeVisible();
    
    // Test settings modal performance
    startTime = Date.now();
    await page.locator('[data-testid="settings-button"]').click();
    endTime = Date.now();
    
    expect(endTime - startTime).toBeLessThan(200);
    await expect(page.locator('[data-testid="settings-modal"]')).toBeVisible();
  });

  test('should handle large numbers of custom templates efficiently', async ({ page }) => {
    await page.goto('/');
    
    // Create multiple custom templates
    for (let i = 1; i <= 10; i++) {
      await page.locator('[data-testid="templates-button"]').click();
      await page.locator('[data-testid="add-template"]').click();
      await page.locator('[data-testid="template-name"]').fill(`템플릿 ${i}`);
      await page.locator('[data-testid="template-minutes"]').fill('1');
      await page.locator('[data-testid="template-seconds"]').fill(`${i * 5}`);
      await page.locator('[data-testid="save-template"]').click();
      await page.locator('[data-testid="close-templates"]').click();
    }
    
    // Test opening templates modal with many templates
    const startTime = Date.now();
    await page.locator('[data-testid="templates-button"]').click();
    const endTime = Date.now();
    
    // Should still open quickly even with many templates
    expect(endTime - startTime).toBeLessThan(300);
    
    // Verify all templates are visible
    for (let i = 1; i <= 10; i++) {
      await expect(page.locator(`[data-testid="custom-template-템플릿 ${i}"]`)).toBeVisible();
    }
  });
});