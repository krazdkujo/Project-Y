import { test, expect, Page } from '@playwright/test';

/**
 * Loading Screen and Error Handling Tests
 * Tests loading behavior, error states, and graceful failure handling
 */

test.describe('Loading and Error Handling', () => {

  test('should show loading screen immediately on page load', async ({ page }) => {
    // Don't wait for network idle to catch initial loading state
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Loading screen should be visible immediately
    const loadingScreen = page.locator('#loading-screen');
    await expect(loadingScreen).toBeVisible();
    
    // Check loading components
    await expect(loadingScreen.locator('.loading-text')).toContainText('Loading AP System');
    await expect(loadingScreen.locator('.loading-spinner')).toBeVisible();
    await expect(loadingScreen).toContainText('Connecting to server');
  });

  test('should hide loading screen after successful initialization', async ({ page }) => {
    await page.goto('/');
    
    // Wait for loading screen to disappear
    await page.waitForFunction(
      () => {
        const loadingScreen = document.getElementById('loading-screen');
        return loadingScreen && loadingScreen.style.display === 'none';
      },
      { timeout: 30000 }
    );
    
    // Loading screen should be hidden
    const loadingScreen = page.locator('#loading-screen');
    await expect(loadingScreen).not.toBeVisible();
    
    // Game container should be visible
    const gameContainer = page.locator('.game-container');
    await expect(gameContainer).toBeVisible();
  });

  test('should display error message when GameClient initialization fails', async ({ page }) => {
    // Override GameClient to simulate failure
    await page.addInitScript(() => {
      window.GameClient = class {
        async initialize() {
          throw new Error('Initialization failed');
        }
      };
    });
    
    await page.goto('/');
    
    // Wait for error state
    await page.waitForSelector('.loading-text:has-text("Error Loading Game")', { 
      state: 'visible',
      timeout: 10000 
    });
    
    // Check error message content
    const loadingScreen = page.locator('#loading-screen');
    await expect(loadingScreen.locator('.loading-text')).toContainText('Error Loading Game');
    
    // Should show error description
    await expect(loadingScreen).toContainText('Failed to initialize the game client');
    
    // Should have retry button
    const retryButton = loadingScreen.locator('button:has-text("Retry")');
    await expect(retryButton).toBeVisible();
  });

  test('should handle retry functionality on error', async ({ page }) => {
    let initializationAttempts = 0;
    
    // Override GameClient to fail first time, succeed second time
    await page.addInitScript(() => {
      window.GameClient = class {
        async initialize() {
          (window as any).initializationAttempts = ((window as any).initializationAttempts || 0) + 1;
          if ((window as any).initializationAttempts === 1) {
            throw new Error('First attempt fails');
          }
          // Second attempt succeeds - do minimal setup
          return Promise.resolve();
        }
      };
    });
    
    await page.goto('/');
    
    // Wait for error state
    await page.waitForSelector('button:has-text("Retry")', { state: 'visible' });
    
    // Click retry button
    const retryButton = page.locator('button:has-text("Retry")');
    await retryButton.click();
    
    // Should attempt to reload/reinitialize
    // Page reload will occur, so we need to handle that
    await page.waitForTimeout(2000);
  });

  test('should handle JavaScript errors gracefully', async ({ page }) => {
    const jsErrors: string[] = [];
    
    // Capture JavaScript errors
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    
    // Simulate a JavaScript error in the game client
    await page.evaluate(() => {
      // This should not crash the page
      try {
        (window as any).nonExistentFunction();
      } catch (error) {
        console.error('Simulated error:', error);
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Page should still be functional despite errors
    const gameContainer = page.locator('.game-container');
    await expect(gameContainer).toBeVisible();
    
    // Critical errors should be handled
    const criticalErrors = jsErrors.filter(error => 
      !error.includes('Simulated error') &&
      !error.includes('favicon') &&
      !error.includes('service-worker')
    );
    
    // Should have minimal critical errors
    expect(criticalErrors.length).toBeLessThan(3);
  });

  test('should handle WebSocket connection failure gracefully', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Connection should fail (no WebSocket server running)
    const connectionStatus = page.locator('#connection-status');
    await expect(connectionStatus).toHaveClass(/disconnected/);
    
    // Game should still be playable in offline mode
    const gameMap = page.locator('#game-map');
    await expect(gameMap).toBeVisible();
    
    // Player should still be able to move locally
    const playerCell = page.locator('.map-cell').filter({ hasText: '@' });
    await expect(playerCell).toBeVisible();
  });

  test('should handle missing DOM elements gracefully', async ({ page }) => {
    // Remove critical DOM elements after load to test error handling
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Remove game map container
    await page.evaluate(() => {
      const mapContainer = document.querySelector('.game-map-container');
      if (mapContainer) mapContainer.remove();
    });
    
    // Try to trigger map-related functionality
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    
    // Should not crash - may show error message
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should handle network timeout during initialization', async ({ page }) => {
    // Simulate slow network by delaying responses
    await page.route('**/*.js', route => {
      setTimeout(() => route.continue(), 1000);
    });
    
    await page.goto('/', { timeout: 15000 });
    
    // Should eventually load or show appropriate state
    await page.waitForFunction(
      () => {
        const loadingScreen = document.getElementById('loading-screen');
        return !loadingScreen || loadingScreen.style.display === 'none';
      },
      { timeout: 20000 }
    );
  });

  test('should display appropriate loading messages', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    const loadingScreen = page.locator('#loading-screen');
    
    // Check for main loading message
    await expect(loadingScreen).toContainText('Loading AP System');
    
    // Check for connection message
    await expect(loadingScreen).toContainText('Connecting to server');
    
    // Loading spinner should be animated
    const spinner = loadingScreen.locator('.loading-spinner');
    const spinnerStyle = await spinner.evaluate(el => getComputedStyle(el));
    expect(spinnerStyle.animation).toContain('spin');
  });

  test('should handle page visibility changes', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Simulate page becoming hidden (tab switch)
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: true, writable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    
    await page.waitForTimeout(100);
    
    // Simulate page becoming visible again
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: false, writable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    
    // Game should still be functional
    const gameContainer = page.locator('.game-container');
    await expect(gameContainer).toBeVisible();
  });

  test('should handle window resize during initialization', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Resize during loading
    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(100);
    
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Should complete initialization successfully
    await page.waitForFunction(
      () => {
        const loadingScreen = document.getElementById('loading-screen');
        return loadingScreen && loadingScreen.style.display === 'none';
      },
      { timeout: 30000 }
    );
    
    const gameContainer = page.locator('.game-container');
    await expect(gameContainer).toBeVisible();
  });

  test('should handle memory pressure gracefully', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Create memory pressure by allocating large arrays
    await page.evaluate(() => {
      const arrays: number[][] = [];
      try {
        for (let i = 0; i < 100; i++) {
          arrays.push(new Array(10000).fill(i));
        }
      } catch (error) {
        console.log('Memory pressure simulated');
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Game should still be responsive
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    
    const playerCell = page.locator('.map-cell').filter({ hasText: '@' });
    await expect(playerCell).toBeVisible();
  });

  test('should maintain accessibility during error states', async ({ page }) => {
    // Override GameClient to simulate failure
    await page.addInitScript(() => {
      window.GameClient = class {
        async initialize() {
          throw new Error('Accessibility test failure');
        }
      };
    });
    
    await page.goto('/');
    
    // Wait for error state
    await page.waitForSelector('.loading-text:has-text("Error Loading Game")', { 
      state: 'visible',
      timeout: 10000 
    });
    
    // Error message should be accessible
    const errorMessage = page.locator('.loading-text:has-text("Error Loading Game")');
    await expect(errorMessage).toBeVisible();
    
    // Retry button should be keyboard accessible
    const retryButton = page.locator('button:has-text("Retry")');
    await expect(retryButton).toBeVisible();
    await retryButton.focus();
    
    // Button should have focus
    const focused = await retryButton.evaluate(el => el === document.activeElement);
    expect(focused).toBe(true);
  });
});

/**
 * Helper function to wait for game initialization
 */
async function waitForGameInitialization(page: Page) {
  await page.waitForFunction(
    () => {
      const loadingScreen = document.getElementById('loading-screen');
      return loadingScreen && loadingScreen.style.display === 'none';
    },
    { timeout: 30000 }
  );
  
  await page.waitForTimeout(1000);
}