import { test, expect } from '@playwright/test';

test.describe('Template System E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible();
  });

  test('should use default templates correctly', async ({ page }) => {
    // Open templates modal
    await page.locator('[data-testid="templates-button"]').click();
    
    // Verify default templates are present
    await expect(page.locator('[data-testid="template-30s"]')).toBeVisible();
    await expect(page.locator('[data-testid="template-1m"]')).toBeVisible();
    await expect(page.locator('[data-testid="template-3m"]')).toBeVisible();
    
    // Select 1 minute template
    await page.locator('[data-testid="template-1m"]').click();
    
    // Verify timer is set to 1 minute
    await expect(page.locator('[data-testid="time-display"]')).toContainText('01:00');
    
    // Start timer to verify it works
    await page.locator('[data-testid="start-button"]').click();
    await expect(page.locator('[data-testid="start-button"]')).toContainText('일시정지');
  });

  test('should create and use custom templates', async ({ page }) => {
    // Open templates modal
    await page.locator('[data-testid="templates-button"]').click();
    
    // Click add new template
    await page.locator('[data-testid="add-template"]').click();
    
    // Fill template form
    await page.locator('[data-testid="template-name"]').fill('내 운동');
    await page.locator('[data-testid="template-minutes"]').fill('2');
    await page.locator('[data-testid="template-seconds"]').fill('30');
    
    // Save template
    await page.locator('[data-testid="save-template"]').click();
    
    // Verify template appears in list
    await expect(page.locator('[data-testid="custom-template-내 운동"]')).toBeVisible();
    
    // Use the custom template
    await page.locator('[data-testid="custom-template-내 운동"]').click();
    
    // Verify timer is set correctly
    await expect(page.locator('[data-testid="time-display"]')).toContainText('02:30');
  });

  test('should edit custom templates', async ({ page }) => {
    // Create a template first
    await page.locator('[data-testid="templates-button"]').click();
    await page.locator('[data-testid="add-template"]').click();
    await page.locator('[data-testid="template-name"]').fill('테스트 템플릿');
    await page.locator('[data-testid="template-minutes"]').fill('1');
    await page.locator('[data-testid="template-seconds"]').fill('0');
    await page.locator('[data-testid="save-template"]').click();
    
    // Edit the template
    await page.locator('[data-testid="edit-template-테스트 템플릿"]').click();
    
    // Modify the template
    await page.locator('[data-testid="template-name"]').fill('수정된 템플릿');
    await page.locator('[data-testid="template-minutes"]').fill('1');
    await page.locator('[data-testid="template-seconds"]').fill('45');
    
    // Save changes
    await page.locator('[data-testid="save-template"]').click();
    
    // Verify template is updated
    await expect(page.locator('[data-testid="custom-template-수정된 템플릿"]')).toBeVisible();
    
    // Use updated template
    await page.locator('[data-testid="custom-template-수정된 템플릿"]').click();
    await expect(page.locator('[data-testid="time-display"]')).toContainText('01:45');
  });

  test('should delete custom templates', async ({ page }) => {
    // Create a template first
    await page.locator('[data-testid="templates-button"]').click();
    await page.locator('[data-testid="add-template"]').click();
    await page.locator('[data-testid="template-name"]').fill('삭제할 템플릿');
    await page.locator('[data-testid="template-minutes"]').fill('0');
    await page.locator('[data-testid="template-seconds"]').fill('30');
    await page.locator('[data-testid="save-template"]').click();
    
    // Verify template exists
    await expect(page.locator('[data-testid="custom-template-삭제할 템플릿"]')).toBeVisible();
    
    // Delete the template
    await page.locator('[data-testid="delete-template-삭제할 템플릿"]').click();
    
    // Confirm deletion if there's a confirmation dialog
    const confirmButton = page.locator('[data-testid="confirm-delete"]');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
    
    // Verify template is removed
    await expect(page.locator('[data-testid="custom-template-삭제할 템플릿"]')).not.toBeVisible();
  });

  test('should not allow deletion of default templates', async ({ page }) => {
    // Open templates modal
    await page.locator('[data-testid="templates-button"]').click();
    
    // Verify default templates don't have delete buttons
    await expect(page.locator('[data-testid="delete-template-30초"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="delete-template-1분"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="delete-template-3분"]')).not.toBeVisible();
  });
});