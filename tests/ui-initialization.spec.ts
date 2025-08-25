import { test, expect, Page } from '@playwright/test';

/**
 * Comprehensive UI Initialization Tests for ASCII Roguelike
 * Tests page load, JavaScript execution, and basic UI component creation
 */

test.describe('ASCII Roguelike UI Initialization', () => {
  
  test('should load page without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    
    // Capture JavaScript errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(`Page error: ${error.message}`);
    });

    // Navigate to the game
    await page.goto('/');
    
    // Wait for initial load
    await page.waitForLoadState('networkidle');
    
    // Check for critical JavaScript errors
    expect(errors.filter(error => 
      !error.includes('favicon') && // Ignore favicon errors
      !error.includes('service-worker') // Ignore SW errors
    )).toHaveLength(0);
  });

  test('should display loading screen initially', async ({ page }) => {
    await page.goto('/');
    
    // Check loading screen is visible
    const loadingScreen = page.locator('#loading-screen');
    await expect(loadingScreen).toBeVisible();
    
    // Verify loading text
    await expect(loadingScreen.locator('.loading-text')).toContainText('Loading AP System');
    
    // Check spinner is present
    await expect(loadingScreen.locator('.loading-spinner')).toBeVisible();
  });

  test('should hide loading screen after initialization', async ({ page }) => {
    await page.goto('/');
    
    // Wait for game initialization (up to 30 seconds)
    await page.waitForFunction(
      () => {
        const loadingScreen = document.getElementById('loading-screen');
        return loadingScreen && loadingScreen.style.display === 'none';
      },
      { timeout: 30000 }
    );
    
    // Verify loading screen is hidden
    const loadingScreen = page.locator('#loading-screen');
    await expect(loadingScreen).not.toBeVisible();
  });

  test('should create main game container structure', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Check main container
    await expect(page.locator('.game-container')).toBeVisible();
    
    // Check left panel (game map)
    await expect(page.locator('.left-panel')).toBeVisible();
    
    // Check right panel (UI)
    await expect(page.locator('.right-panel')).toBeVisible();
    
    // Check game map container
    await expect(page.locator('.game-map-container')).toBeVisible();
  });

  test('should initialize GameClient class successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for GameClient to be available
    await page.waitForFunction(() => window.GameClient);
    
    // Check GameClient class exists
    const gameClientExists = await page.evaluate(() => {
      return typeof window.GameClient === 'function';
    });
    expect(gameClientExists).toBe(true);
  });

  test('should handle initialization errors gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Simulate initialization failure by overriding GameClient
    await page.addInitScript(() => {
      window.GameClient = class {
        async initialize() {
          throw new Error('Simulated initialization failure');
        }
      };
    });
    
    // Reload to trigger error
    await page.reload();
    
    // Wait for error state
    await page.waitForSelector('.loading-text', { state: 'visible' });
    
    // Check error message is displayed
    await expect(page.locator('.loading-text')).toContainText('Error Loading Game');
    
    // Check retry button is present
    await expect(page.locator('button')).toContainText('Retry');
  });

  test('should set up connection status indicator', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Check connection status element exists
    const connectionStatus = page.locator('#connection-status');
    await expect(connectionStatus).toBeVisible();
    
    // Should initially show disconnected state
    await expect(connectionStatus).toHaveClass(/disconnected/);
    await expect(connectionStatus).toContainText('Disconnected');
  });

  test('should create ASCII stats panel in right sidebar', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Check ASCII UI container
    const asciiContainer = page.locator('#ascii-ui-container');
    await expect(asciiContainer).toBeVisible();
    
    // Verify it's displayed (not hidden)
    const display = await asciiContainer.evaluate(el => getComputedStyle(el).display);
    expect(display).not.toBe('none');
  });

  test('should hide modern UI components in ASCII mode', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Check modern UI container is hidden
    const uiContainer = page.locator('#ui-container');
    const display = await uiContainer.evaluate(el => getComputedStyle(el).display);
    expect(display).toBe('none');
  });

  test('should set up help overlay functionality', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Check help overlay exists but is hidden
    const helpOverlay = page.locator('#help-overlay');
    await expect(helpOverlay).not.toBeVisible();
    
    // Test F1 key opens help
    await page.keyboard.press('F1');
    await expect(helpOverlay).toBeVisible();
    
    // Check help content
    await expect(helpOverlay.locator('.help-content h3')).toContainText('AP System Controls');
    
    // Test closing help
    await page.keyboard.press('F1');
    await expect(helpOverlay).not.toBeVisible();
  });

  test('should initialize with proper viewport responsiveness', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Test desktop layout
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(100); // Allow layout to settle
    
    const gameContainer = page.locator('.game-container');
    const containerStyle = await gameContainer.evaluate(el => getComputedStyle(el));
    
    // Should have grid layout
    expect(containerStyle.display).toBe('grid');
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(100);
    
    // Layout should adapt for mobile
    const mobileStyle = await gameContainer.evaluate(el => getComputedStyle(el));
    expect(mobileStyle.display).toBe('grid');
  });
});

/**
 * Helper function to wait for game initialization
 */
async function waitForGameInitialization(page: Page) {
  // Wait for loading screen to disappear
  await page.waitForFunction(
    () => {
      const loadingScreen = document.getElementById('loading-screen');
      return loadingScreen && loadingScreen.style.display === 'none';
    },
    { timeout: 30000 }
  );
  
  // Additional wait for UI components to render
  await page.waitForTimeout(1000);
}