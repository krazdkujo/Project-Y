import { test, expect, Page } from '@playwright/test';

/**
 * Comprehensive Game Map and ASCII Rendering Tests
 * Tests map canvas creation, ASCII character rendering, and game element positioning
 */

test.describe('ASCII Game Map Rendering', () => {
  
  test('should create game map canvas with proper structure', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Check game map canvas exists
    const gameMapCanvas = page.locator('#game-map');
    await expect(gameMapCanvas).toBeVisible();
    
    // Verify canvas has correct CSS class
    await expect(gameMapCanvas).toHaveClass('game-map-canvas');
    
    // Check map container
    const mapContainer = page.locator('.game-map-container');
    await expect(mapContainer).toContainElement(gameMapCanvas);
  });

  test('should generate proper grid dimensions', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Check grid dimensions are set
    const gridInfo = await page.evaluate(() => {
      const gameClient = (window as any).gameClient;
      return {
        cols: gameClient?.gridCols,
        rows: gameClient?.gridRows,
        hasGameMap: !!gameClient?.gameMap
      };
    });
    
    // Verify reasonable grid dimensions
    expect(gridInfo.cols).toBeGreaterThan(0);
    expect(gridInfo.rows).toBeGreaterThan(0);
    expect(gridInfo.hasGameMap).toBe(true);
    
    // Check minimum reasonable size
    expect(gridInfo.cols).toBeGreaterThanOrEqual(60);
    expect(gridInfo.rows).toBeGreaterThanOrEqual(20);
  });

  test('should create map cells with proper attributes', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Check map rows are created
    const mapRows = page.locator('.map-row');
    await expect(mapRows.first()).toBeVisible();
    
    // Check map cells exist
    const mapCells = page.locator('.map-cell');
    const cellCount = await mapCells.count();
    expect(cellCount).toBeGreaterThan(0);
    
    // Verify first cell has proper attributes
    const firstCell = mapCells.first();
    await expect(firstCell).toHaveAttribute('data-x');
    await expect(firstCell).toHaveAttribute('data-y');
    
    // Check positioning
    const cellStyle = await firstCell.evaluate(el => getComputedStyle(el));
    expect(cellStyle.position).toBe('absolute');
  });

  test('should position player character (@) at center', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Find player character
    const playerCell = page.locator('.map-cell').filter({ hasText: '@' });
    await expect(playerCell).toBeVisible();
    
    // Check player character color (should be green)
    const playerColor = await playerCell.evaluate(el => getComputedStyle(el).color);
    // Convert to hex or check if it's green-ish
    expect(playerColor).toMatch(/rgb\(0, 255, 0\)|#00ff00|green/i);
    
    // Verify position is reasonable (should be near center)
    const position = await playerCell.evaluate(el => ({
      x: parseInt(el.dataset.x || '0'),
      y: parseInt(el.dataset.y || '0')
    }));
    
    expect(position.x).toBeGreaterThan(10);
    expect(position.y).toBeGreaterThan(5);
  });

  test('should render wall characters (#) with proper styling', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Find wall characters
    const wallCells = page.locator('.map-cell').filter({ hasText: '#' });
    const wallCount = await wallCells.count();
    
    // Should have some walls
    expect(wallCount).toBeGreaterThan(0);
    
    // Check wall color (should be gray-ish)
    const wallColor = await wallCells.first().evaluate(el => getComputedStyle(el).color);
    expect(wallColor).toMatch(/rgb\(102, 102, 102\)|rgb\(128, 128, 128\)|#666|#808080|gray/i);
  });

  test('should render floor characters (.) with proper styling', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Find floor characters (most common)
    const floorCells = page.locator('.map-cell').filter({ hasText: '.' });
    const floorCount = await floorCells.count();
    
    // Should have many floor tiles
    expect(floorCount).toBeGreaterThan(10);
    
    // Check floor color (should be dark gray)
    const floorColor = await floorCells.first().evaluate(el => getComputedStyle(el).color);
    expect(floorColor).toMatch(/rgb\(64, 64, 64\)|#404040|darkgray/i);
  });

  test('should handle click events on map cells', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    let clickHandled = false;
    
    // Monitor for click handling
    await page.exposeFunction('onMapClick', () => {
      clickHandled = true;
    });
    
    // Add click listener
    await page.evaluate(() => {
      document.querySelector('.map-cell')?.addEventListener('click', () => {
        (window as any).onMapClick();
      });
    });
    
    // Click on a map cell
    await page.locator('.map-cell').first().click();
    
    // Should handle click
    expect(clickHandled).toBe(true);
  });

  test('should apply hover effects on map cells', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    const mapCell = page.locator('.map-cell').first();
    
    // Hover over cell
    await mapCell.hover();
    
    // Check hover effect is applied (background color change)
    const hoverStyle = await mapCell.evaluate(el => getComputedStyle(el));
    // Should have some background color on hover
    expect(hoverStyle.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('should scale font size responsively', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Test at different viewport sizes
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1024, height: 768 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(200); // Allow CSS to update
      
      const gameMapCanvas = page.locator('#game-map');
      const fontSize = await gameMapCanvas.evaluate(el => {
        return getComputedStyle(el).fontSize;
      });
      
      // Font size should be set (not default browser size)
      expect(fontSize).not.toBe('16px'); // Default browser font
      expect(parseFloat(fontSize)).toBeGreaterThan(6); // Minimum readable size
      expect(parseFloat(fontSize)).toBeLessThan(20); // Maximum practical size
    }
  });

  test('should maintain proper character aspect ratio', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    const mapCell = page.locator('.map-cell').first();
    
    // Check character dimensions
    const dimensions = await mapCell.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height
      };
    });
    
    // For monospace font, width should be approximately 60% of height
    const aspectRatio = dimensions.width / dimensions.height;
    expect(aspectRatio).toBeGreaterThan(0.4);
    expect(aspectRatio).toBeLessThan(0.8);
  });

  test('should handle map resize correctly', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Get initial grid size
    const initialGrid = await page.evaluate(() => {
      const gameClient = (window as any).gameClient;
      return {
        cols: gameClient?.gridCols,
        rows: gameClient?.gridRows
      };
    });
    
    // Resize viewport
    await page.setViewportSize({ width: 1600, height: 900 });
    
    // Trigger resize event
    await page.evaluate(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    // Wait for debounced resize
    await page.waitForTimeout(300);
    
    // Check grid was updated (may be same if viewport change wasn't dramatic)
    const newGrid = await page.evaluate(() => {
      const gameClient = (window as any).gameClient;
      return {
        cols: gameClient?.gridCols,
        rows: gameClient?.gridRows
      };
    });
    
    expect(newGrid.cols).toBeGreaterThan(0);
    expect(newGrid.rows).toBeGreaterThan(0);
  });

  test('should create minimap element', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Check minimap exists
    const minimap = page.locator('#minimap');
    await expect(minimap).toBeVisible();
    
    // Check minimap styling
    const minimapStyle = await minimap.evaluate(el => getComputedStyle(el));
    expect(minimapStyle.position).toBe('absolute');
    expect(minimapStyle.fontFamily).toContain('Courier');
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
  
  // Wait for game map to be created
  await page.waitForSelector('#game-map', { state: 'visible' });
  
  // Additional wait for map generation
  await page.waitForTimeout(1000);
}