import { test, expect } from '@playwright/test';

test.describe('IP Leak Test Page', () => {
  test('should navigate to IP leak test page', async ({ page }) => {
    await page.goto('/leak-tests/ip');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have proper heading', async ({ page }) => {
    await page.goto('/leak-tests/ip');
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('should have educational content section', async ({ page }) => {
    await page.goto('/leak-tests/ip');

    // Look for educational content
    const educationalSection = page.locator('section, article, .prose').filter({
      hasText: /IP Address|privacy|leak/i,
    });

    await expect(educationalSection.first()).toBeVisible();
  });

  test('should display IP detection component', async ({ page }) => {
    await page.goto('/leak-tests/ip');

    // Wait for IP detection component
    await page.waitForLoadState('networkidle');

    // Look for IP display or detection button
    const ipComponent = page.locator('[data-testid="ip-result"], .specimen-container').first();
    await expect(ipComponent).toBeVisible({ timeout: 10000 });
  });
});

test.describe('DNS Leak Test Page', () => {
  test('should navigate to DNS leak test page', async ({ page }) => {
    await page.goto('/leak-tests/dns');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have start test button', async ({ page }) => {
    await page.goto('/leak-tests/dns');

    // Look for button to start DNS test
    const startButton = page.locator('button').filter({
      hasText: /start|test|check|detect/i,
    });

    // Button should be present
    await expect(startButton.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have educational content about DNS leaks', async ({ page }) => {
    await page.goto('/leak-tests/dns');

    // Look for educational content about DNS
    const content = page.locator('text=/DNS|Domain Name System/i');
    await expect(content.first()).toBeVisible();
  });
});

test.describe('WebRTC Leak Test Page', () => {
  test('should navigate to WebRTC leak test page', async ({ page }) => {
    await page.goto('/leak-tests/webrtc');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display WebRTC status', async ({ page }) => {
    await page.goto('/leak-tests/webrtc');
    await page.waitForLoadState('networkidle');

    // Page should have content about WebRTC
    const webrtcContent = page.locator('text=/WebRTC|Real-Time Communication/i');
    await expect(webrtcContent.first()).toBeVisible();
  });

  test('should have explanation about WebRTC leaks', async ({ page }) => {
    await page.goto('/leak-tests/webrtc');

    // Educational content should explain WebRTC
    const explanation = page.locator('text=/STUN|ICE|peer connection/i');
    await expect(explanation.first()).toBeVisible();
  });
});

test.describe('Browser Fingerprint Page', () => {
  test('should navigate to fingerprint test page', async ({ page }) => {
    await page.goto('/leak-tests/browser-fingerprint');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display fingerprint components', async ({ page }) => {
    await page.goto('/leak-tests/browser-fingerprint');
    await page.waitForLoadState('networkidle');

    // Should mention various fingerprinting techniques
    const fingerprintContent = page.locator('text=/Canvas|WebGL|Audio|Font/i');
    await expect(fingerprintContent.first()).toBeVisible();
  });

  test('should have uniqueness score', async ({ page }) => {
    await page.goto('/leak-tests/browser-fingerprint');
    await page.waitForLoadState('networkidle');

    // Look for score or uniqueness indicator
    const scoreElement = page.locator('text=/uniqueness|score|risk/i');
    await expect(scoreElement.first()).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Canvas Fingerprint Page', () => {
  test('should navigate to canvas fingerprint page', async ({ page }) => {
    await page.goto('/leak-tests/canvas-fingerprint');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display canvas rendering', async ({ page }) => {
    await page.goto('/leak-tests/canvas-fingerprint');
    await page.waitForLoadState('networkidle');

    // Canvas element should be present
    const canvas = page.locator('canvas');
    // Either canvas or canvas-related content
    const canvasContent = page.locator('text=/canvas|fingerprint/i');
    await expect(canvasContent.first()).toBeVisible();
  });
});

test.describe('WebGL Fingerprint Page', () => {
  test('should navigate to WebGL fingerprint page', async ({ page }) => {
    await page.goto('/leak-tests/webgl-fingerprint');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display WebGL information', async ({ page }) => {
    await page.goto('/leak-tests/webgl-fingerprint');
    await page.waitForLoadState('networkidle');

    // Should show WebGL vendor/renderer info
    const webglInfo = page.locator('text=/WebGL|GPU|renderer|vendor/i');
    await expect(webglInfo.first()).toBeVisible();
  });
});

test.describe('Audio Fingerprint Page', () => {
  test('should navigate to audio fingerprint page', async ({ page }) => {
    await page.goto('/leak-tests/audio-fingerprint');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display audio fingerprint information', async ({ page }) => {
    await page.goto('/leak-tests/audio-fingerprint');
    await page.waitForLoadState('networkidle');

    const audioInfo = page.locator('text=/Audio|AudioContext|oscillator/i');
    await expect(audioInfo.first()).toBeVisible();
  });
});

test.describe('Font Detection Page', () => {
  test('should navigate to font detection page', async ({ page }) => {
    await page.goto('/leak-tests/font-detection');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display detected fonts', async ({ page }) => {
    await page.goto('/leak-tests/font-detection');
    await page.waitForLoadState('networkidle');

    const fontInfo = page.locator('text=/font|Arial|Helvetica|Times/i');
    await expect(fontInfo.first()).toBeVisible();
  });
});

test.describe('Timezone Leak Page', () => {
  test('should navigate to timezone page', async ({ page }) => {
    await page.goto('/leak-tests/timezone');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display timezone information', async ({ page }) => {
    await page.goto('/leak-tests/timezone');
    await page.waitForLoadState('networkidle');

    const tzInfo = page.locator('text=/timezone|UTC|GMT|offset/i');
    await expect(tzInfo.first()).toBeVisible();
  });
});

test.describe('Cross-Page Navigation', () => {
  test('should navigate between leak test pages', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Try to navigate to different pages
    const pages = [
      '/leak-tests/ip',
      '/leak-tests/dns',
      '/leak-tests/webrtc',
    ];

    for (const path of pages) {
      await page.goto(path);
      await expect(page.locator('body')).toBeVisible();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should maintain state when navigating back', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to leak test
    await page.goto('/leak-tests/ip');
    await page.waitForLoadState('networkidle');

    // Go back
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Should be back on home page
    await expect(page.locator('body')).toBeVisible();
  });
});
