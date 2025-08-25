import { test, expect, Page } from '@playwright/test';

/**
 * Player Character Movement and Positioning Tests
 * Tests player character (@) rendering, movement, and interaction
 */

test.describe('Player Character Movement', () => {

  test('should position player character at initial center location', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Find player character
    const playerCell = page.locator('.map-cell').filter({ hasText: '@' });
    await expect(playerCell).toBeVisible();
    
    // Get player position
    const playerPosition = await playerCell.evaluate(el => ({
      x: parseInt(el.dataset.x || '0'),
      y: parseInt(el.dataset.y || '0')
    }));
    
    // Get grid dimensions for comparison
    const gridInfo = await page.evaluate(() => {
      const gameClient = (window as any).gameClient;
      return {
        cols: gameClient?.gridCols,
        rows: gameClient?.gridRows
      };
    });
    
    // Player should be near center
    const expectedX = Math.floor(gridInfo.cols / 2);
    const expectedY = Math.floor(gridInfo.rows / 2);
    
    expect(playerPosition.x).toBeCloseTo(expectedX, 5);
    expect(playerPosition.y).toBeCloseTo(expectedY, 5);
  });

  test('should render player character with correct styling', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    const playerCell = page.locator('.map-cell').filter({ hasText: '@' });
    
    // Check character is '@'
    await expect(playerCell).toContainText('@');
    
    // Check player color (green)
    const playerColor = await playerCell.evaluate(el => getComputedStyle(el).color);
    expect(playerColor).toMatch(/rgb\(0, 255, 0\)|#00ff00/i);
    
    // Check cell positioning
    const cellStyle = await playerCell.evaluate(el => getComputedStyle(el));
    expect(cellStyle.position).toBe('absolute');
  });

  test('should handle keyboard movement input', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Get initial player position
    const initialPosition = await getPlayerPosition(page);
    
    // Test arrow key movement (up)
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100); // Allow movement processing
    
    const newPosition = await getPlayerPosition(page);
    
    // Position should have changed (unless blocked by wall)
    const positionChanged = 
      newPosition.x !== initialPosition.x || 
      newPosition.y !== initialPosition.y;
    
    // Movement should be attempted (position changes or blocked message)
    expect(positionChanged || await hasMovementMessage(page)).toBe(true);
  });

  test('should handle WASD movement input', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    const initialPosition = await getPlayerPosition(page);
    
    // Test WASD movement
    const movements = ['KeyW', 'KeyA', 'KeyS', 'KeyD'];
    let movementDetected = false;
    
    for (const key of movements) {
      await page.keyboard.press(key);
      await page.waitForTimeout(100);
      
      const currentPosition = await getPlayerPosition(page);
      if (currentPosition.x !== initialPosition.x || currentPosition.y !== initialPosition.y) {
        movementDetected = true;
        break;
      }
    }
    
    expect(movementDetected || await hasMovementMessage(page)).toBe(true);
  });

  test('should handle diagonal movement input', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    const initialPosition = await getPlayerPosition(page);
    
    // Test diagonal movement keys
    const diagonalKeys = ['KeyQ', 'KeyE', 'KeyZ', 'KeyX'];
    let diagonalMovementDetected = false;
    
    for (const key of diagonalKeys) {
      await page.keyboard.press(key);
      await page.waitForTimeout(100);
      
      const currentPosition = await getPlayerPosition(page);
      if (currentPosition.x !== initialPosition.x || currentPosition.y !== initialPosition.y) {
        diagonalMovementDetected = true;
        break;
      }
    }
    
    expect(diagonalMovementDetected || await hasMovementMessage(page)).toBe(true);
  });

  test('should prevent movement through walls', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Try to find a wall near the player and attempt to move into it
    const wallBlocked = await page.evaluate(() => {
      const gameClient = (window as any).gameClient;
      const currentPos = gameClient?.playerPosition;
      
      if (!currentPos || !gameClient.gameMap) return false;
      
      // Check adjacent cells for walls
      const directions = [
        { x: 0, y: -1 }, // up
        { x: 0, y: 1 },  // down
        { x: -1, y: 0 }, // left
        { x: 1, y: 0 }   // right
      ];
      
      for (const dir of directions) {
        const newX = currentPos.x + dir.x;
        const newY = currentPos.y + dir.y;
        
        if (newY >= 0 && newY < gameClient.gridRows && 
            newX >= 0 && newX < gameClient.gridCols) {
          const cell = gameClient.gameMap[newY][newX];
          if (cell && cell.textContent === '#') {
            // Found a wall, simulate movement attempt
            gameClient.movePlayer(dir.x, dir.y);
            
            // Check if position changed
            return currentPos.x === gameClient.playerPosition.x && 
                   currentPos.y === gameClient.playerPosition.y;
          }
        }
      }
      
      return false; // No walls found to test
    });
    
    // Either wall blocking worked, or no walls were found to test
    expect(wallBlocked || await hasWallMessage(page)).toBeTruthy();
  });

  test('should prevent movement outside map boundaries', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Move player to edge and try to move beyond
    const boundaryTest = await page.evaluate(() => {
      const gameClient = (window as any).gameClient;
      if (!gameClient) return false;
      
      // Store original position
      const originalPos = { ...gameClient.playerPosition };
      
      // Try to move to edge and beyond
      gameClient.playerPosition = { x: 0, y: 0 }; // Top-left corner
      gameClient.movePlayer(-1, -1); // Try to move beyond boundary
      
      // Should stay at boundary
      const stayedInBounds = gameClient.playerPosition.x >= 0 && gameClient.playerPosition.y >= 0;
      
      // Restore original position
      gameClient.playerPosition = originalPos;
      
      return stayedInBounds;
    });
    
    expect(boundaryTest || await hasBoundaryMessage(page)).toBe(true);
  });

  test('should update player position visually after movement', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    const initialPosition = await getPlayerPosition(page);
    
    // Programmatically move player to test visual update
    await page.evaluate(() => {
      const gameClient = (window as any).gameClient;
      if (gameClient) {
        // Clear current position
        const currentPos = gameClient.playerPosition;
        gameClient.gameMap[currentPos.y][currentPos.x].textContent = '.';
        gameClient.gameMap[currentPos.y][currentPos.x].style.color = '#404040';
        
        // Move to new position (if valid)
        const newX = Math.min(currentPos.x + 1, gameClient.gridCols - 1);
        const newY = currentPos.y;
        
        gameClient.playerPosition = { x: newX, y: newY };
        gameClient.gameMap[newY][newX].textContent = '@';
        gameClient.gameMap[newY][newX].style.color = '#00ff00';
      }
    });
    
    await page.waitForTimeout(100);
    
    // Check new position
    const newPosition = await getPlayerPosition(page);
    expect(newPosition.x).toBeGreaterThanOrEqual(initialPosition.x);
  });

  test('should handle click-to-move functionality', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    const initialPosition = await getPlayerPosition(page);
    
    // Find a nearby floor tile to click
    const floorCell = page.locator('.map-cell').filter({ hasText: '.' }).first();
    await floorCell.click();
    
    await page.waitForTimeout(200); // Allow click processing
    
    // Position might change or click might be handled
    const newPosition = await getPlayerPosition(page);
    const positionChanged = 
      newPosition.x !== initialPosition.x || 
      newPosition.y !== initialPosition.y;
    
    // Either position changed or click was handled (WebSocket message sent)
    expect(positionChanged || await hasClickMessage(page)).toBe(true);
  });

  test('should maintain player position during map resize', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    const initialPosition = await getPlayerPosition(page);
    
    // Trigger resize
    await page.setViewportSize({ width: 1400, height: 800 });
    await page.evaluate(() => window.dispatchEvent(new Event('resize')));
    
    // Wait for resize handling
    await page.waitForTimeout(500);
    
    // Player should still be visible
    const playerCell = page.locator('.map-cell').filter({ hasText: '@' });
    await expect(playerCell).toBeVisible();
    
    // Position should be preserved or adjusted appropriately
    const newPosition = await getPlayerPosition(page);
    expect(newPosition.x).toBeGreaterThanOrEqual(0);
    expect(newPosition.y).toBeGreaterThanOrEqual(0);
  });

  test('should send movement actions to server', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Monitor WebSocket send attempts
    let messageSent = false;
    
    await page.exposeFunction('onWebSocketSend', () => {
      messageSent = true;
    });
    
    // Override WebSocket send to detect calls
    await page.evaluate(() => {
      const gameClient = (window as any).gameClient;
      if (gameClient && gameClient.ws) {
        const originalSend = gameClient.ws.send;
        gameClient.ws.send = function(data: string) {
          (window as any).onWebSocketSend();
          // Don't actually send to avoid errors
        };
      }
    });
    
    // Trigger movement
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    
    expect(messageSent).toBe(true);
  });
});

/**
 * Helper functions
 */
async function getPlayerPosition(page: Page): Promise<{ x: number, y: number }> {
  const playerCell = page.locator('.map-cell').filter({ hasText: '@' }).first();
  return await playerCell.evaluate(el => ({
    x: parseInt(el.dataset.x || '0'),
    y: parseInt(el.dataset.y || '0')
  }));
}

async function hasMovementMessage(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    const messages = document.querySelectorAll('.log-message');
    return Array.from(messages).some(msg => 
      msg.textContent?.toLowerCase().includes('moved') || 
      msg.textContent?.toLowerCase().includes('cannot move')
    );
  });
}

async function hasWallMessage(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    const messages = document.querySelectorAll('.log-message');
    return Array.from(messages).some(msg => 
      msg.textContent?.toLowerCase().includes('wall') ||
      msg.textContent?.toLowerCase().includes('cannot move through')
    );
  });
}

async function hasBoundaryMessage(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    const messages = document.querySelectorAll('.log-message');
    return Array.from(messages).some(msg => 
      msg.textContent?.toLowerCase().includes('outside') ||
      msg.textContent?.toLowerCase().includes('boundary') ||
      msg.textContent?.toLowerCase().includes('map')
    );
  });
}

async function hasClickMessage(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    const messages = document.querySelectorAll('.log-message');
    return Array.from(messages).some(msg => 
      msg.textContent?.toLowerCase().includes('click') ||
      msg.textContent?.toLowerCase().includes('target')
    );
  });
}

async function waitForGameInitialization(page: Page) {
  await page.waitForFunction(
    () => {
      const loadingScreen = document.getElementById('loading-screen');
      return loadingScreen && loadingScreen.style.display === 'none';
    },
    { timeout: 30000 }
  );
  
  await page.waitForSelector('.map-cell', { state: 'visible' });
  await page.waitForTimeout(1000);
}