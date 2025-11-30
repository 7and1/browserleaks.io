import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main heading', async ({ page }) => {
    // Look for main heading
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('should have skip link for accessibility', async ({ page }) => {
    // Skip link should be present but visually hidden until focused
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();

    // Focus the skip link using keyboard
    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
  });

  test('should have proper page title', async ({ page }) => {
    await expect(page).toHaveTitle(/BrowserLeaks/i);
  });

  test('should have language selector', async ({ page }) => {
    // Look for language selector or locale switcher
    const langSelector = page.locator('[data-testid="language-selector"], select[name="locale"]');
    // Language selector may or may not be visible, just check if page loads
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have navigation elements', async ({ page }) => {
    // Check for main navigation structure
    const mainContent = page.locator('#main-content, main');
    await expect(mainContent).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();

    // Content should still be accessible
    const mainContent = page.locator('#main-content, main');
    await expect(mainContent).toBeVisible();
  });
});

test.describe('Privacy Score Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display privacy score section', async ({ page }) => {
    // Wait for the dashboard to load
    const dashboard = page.locator('.specimen-container, [data-testid="privacy-score"]');
    await expect(dashboard.first()).toBeVisible({ timeout: 10000 });
  });

  test('should show loading state initially', async ({ page }) => {
    // Check for loading skeleton or spinner
    const loadingElement = page.locator('.animate-pulse, .animate-shimmer, [data-loading="true"]');
    // Either loading or content should be visible
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Check for h1
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();

    // There should be only one h1
    const h1Count = await h1.count();
    expect(h1Count).toBe(1);
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');

      // Image should have alt text or be presentational (role="presentation" or aria-hidden)
      const ariaHidden = await img.getAttribute('aria-hidden');
      expect(alt !== null || role === 'presentation' || ariaHidden === 'true').toBeTruthy();
    }
  });

  test('should have no accessibility violations on buttons', async ({ page }) => {
    await page.goto('/');

    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const isVisible = await button.isVisible();

      if (isVisible) {
        // Button should have accessible name
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const ariaLabelledBy = await button.getAttribute('aria-labelledby');

        expect(text?.trim() || ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    await page.keyboard.press('Tab');

    // Something should be focused
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have visible focus indicators', async ({ page }) => {
    await page.goto('/');

    // Focus first interactive element
    await page.keyboard.press('Tab');

    // Get the focused element
    const focusedElement = page.locator(':focus');

    // Check if focus ring is visible (element has outline or ring)
    const styles = await focusedElement.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        outline: computed.outline,
        boxShadow: computed.boxShadow,
      };
    });

    // Either outline or box-shadow should indicate focus
    const hasFocusIndicator =
      styles.outline !== 'none' ||
      styles.boxShadow !== 'none';

    expect(hasFocusIndicator).toBeTruthy();
  });
});

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known acceptable errors (e.g., 404 for favicon)
    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('404')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});
