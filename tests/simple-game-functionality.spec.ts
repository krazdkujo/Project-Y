import { test, expect, Page } from '@playwright/test';

test.describe('Simple Game - Actual Functionality Tests', () => {
  
  test('game loads and connects to server', async ({ page }) => {
    // Monitor console for errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Go to the game
    await page.goto('http://localhost:3000');
    
    // Wait for WebSocket connection
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")', {
      timeout: 5000
    });
    
    // Verify no console errors
    expect(consoleErrors).toHaveLength(0);
    
    // Verify player ID is assigned
    const playerId = await page.locator('#player-id').textContent();
    expect(playerId).toBeTruthy();
    expect(playerId).not.toBe('-');
    
    // Verify game map is displayed
    const gameMap = await page.locator('[data-testid="game-map"]').textContent();
    expect(gameMap).toContain('.');
    expect(gameMap).toContain('@'); // Player symbol
    
    // Verify position is shown
    const position = await page.locator('[data-testid="player-position"]').textContent();
    expect(position).toMatch(/\d+,\d+/); // Format: x,y
  });
  
  test('player can move with arrow keys', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Wait for connection
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    
    // Get initial position
    const initialPos = await page.locator('[data-testid="player-position"]').textContent();
    expect(initialPos).toMatch(/\d+,\d+/);
    
    const [initialX, initialY] = initialPos!.split(',').map(Number);
    
    // Move right
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100); // Wait for server update
    
    // Check position changed
    const newPos = await page.locator('[data-testid="player-position"]').textContent();
    const [newX, newY] = newPos!.split(',').map(Number);
    
    // Player should have moved right (or hit boundary)
    if (initialX < 9) {
      expect(newX).toBe(initialX + 1);
      expect(newY).toBe(initialY);
    } else {
      // Hit right boundary
      expect(newX).toBe(9);
    }
    
    // Move up
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    
    const upPos = await page.locator('[data-testid="player-position"]').textContent();
    const [upX, upY] = upPos!.split(',').map(Number);
    
    if (newY > 0) {
      expect(upY).toBe(newY - 1);
      expect(upX).toBe(newX);
    } else {
      // Hit top boundary
      expect(upY).toBe(0);
    }
  });
  
  test('multiple players can see each other', async ({ browser }) => {
    // Create two browser contexts for two players
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const player1 = await context1.newPage();
    const player2 = await context2.newPage();
    
    try {
      // Both players connect
      await player1.goto('http://localhost:3000');
      await player2.goto('http://localhost:3000');
      
      // Wait for both to connect
      await player1.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
      await player2.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
      
      // Get player IDs
      const player1Id = await player1.locator('#player-id').textContent();
      const player2Id = await player2.locator('#player-id').textContent();
      
      expect(player1Id).toBeTruthy();
      expect(player2Id).toBeTruthy();
      expect(player1Id).not.toBe(player2Id);
      
      // Check that both players see two characters on the map
      const map1 = await player1.locator('[data-testid="game-map"]').textContent();
      const map2 = await player2.locator('[data-testid="game-map"]').textContent();
      
      // Count non-dot characters (players)
      const players1Count = (map1!.match(/[^.\n]/g) || []).length;
      const players2Count = (map2!.match(/[^.\n]/g) || []).length;
      
      expect(players1Count).toBe(2); // Both players visible
      expect(players2Count).toBe(2);
      
      // Move player 1
      await player1.keyboard.press('ArrowLeft');
      await player1.waitForTimeout(200); // Wait for network update
      
      // Player 2 should see the movement
      const player1PosAfter = await player1.locator('[data-testid="player-position"]').textContent();
      
      // The maps should have updated for both players
      const map1After = await player1.locator('[data-testid="game-map"]').textContent();
      const map2After = await player2.locator('[data-testid="game-map"]').textContent();
      
      // Both should still see 2 players
      const players1CountAfter = (map1After!.match(/[^.\n]/g) || []).length;
      const players2CountAfter = (map2After!.match(/[^.\n]/g) || []).length;
      
      expect(players1CountAfter).toBe(2);
      expect(players2CountAfter).toBe(2);
      
    } finally {
      await context1.close();
      await context2.close();
    }
  });
  
  test('WebSocket reconnects after disconnect', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Wait for initial connection
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    
    // Simulate WebSocket disconnect by evaluating in page context
    await page.evaluate(() => {
      // Force close the WebSocket
      if ((window as any).ws) {
        (window as any).ws.close();
      }
    });
    
    // Should show disconnected
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Disconnected")', {
      timeout: 3000
    });
    
    // Should reconnect automatically
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")', {
      timeout: 5000
    });
    
    // Should still be able to move after reconnect
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    
    const position = await page.locator('[data-testid="player-position"]').textContent();
    expect(position).toMatch(/\d+,\d+/);
  });
  
  test('boundary detection works correctly', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    
    // Move to top-left corner (0,0)
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowUp');
    }
    await page.waitForTimeout(200);
    
    let position = await page.locator('[data-testid="player-position"]').textContent();
    expect(position).toBe('0,0');
    
    // Try to move beyond boundaries
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(100);
    position = await page.locator('[data-testid="player-position"]').textContent();
    expect(position).toBe('0,0'); // Should not move
    
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    position = await page.locator('[data-testid="player-position"]').textContent();
    expect(position).toBe('0,0'); // Should not move
    
    // Move to bottom-right corner (9,9)
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowDown');
    }
    await page.waitForTimeout(200);
    
    position = await page.locator('[data-testid="player-position"]').textContent();
    expect(position).toBe('9,9');
    
    // Try to move beyond boundaries
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    position = await page.locator('[data-testid="player-position"]').textContent();
    expect(position).toBe('9,9'); // Should not move
    
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    position = await page.locator('[data-testid="player-position"]').textContent();
    expect(position).toBe('9,9'); // Should not move
  });
  
  test('detects and reports console errors', async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
      if (msg.type() === 'warning') warnings.push(msg.text());
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto('http://localhost:3000');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    
    // Perform some actions
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    
    // No errors should have occurred
    if (errors.length > 0) {
      console.log('Console errors detected:', errors);
    }
    
    expect(errors).toHaveLength(0);
  });
  
  test('WebSocket messages are being sent and received', async ({ page }) => {
    const wsMessages: any[] = [];
    
    // Set up WebSocket monitoring before navigation
    page.on('websocket', ws => {
      ws.on('framesent', event => {
        try {
          wsMessages.push({ 
            type: 'sent', 
            data: JSON.parse(event.payload as string) 
          });
        } catch (e) {
          // Ignore non-JSON messages
        }
      });
      
      ws.on('framereceived', event => {
        try {
          wsMessages.push({ 
            type: 'received', 
            data: JSON.parse(event.payload as string) 
          });
        } catch (e) {
          // Ignore non-JSON messages
        }
      });
    });
    
    await page.goto('http://localhost:3000');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    
    // Should have received init message
    const initMessages = wsMessages.filter(m => 
      m.type === 'received' && m.data.type === 'init'
    );
    expect(initMessages.length).toBeGreaterThan(0);
    
    // Clear messages
    wsMessages.length = 0;
    
    // Move and check message was sent
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    
    const moveMessages = wsMessages.filter(m => 
      m.type === 'sent' && m.data.type === 'move'
    );
    expect(moveMessages.length).toBeGreaterThan(0);
    expect(moveMessages[0].data.dx).toBe(1);
    expect(moveMessages[0].data.dy).toBe(0);
    
    // Should receive playerMoved message
    const movedMessages = wsMessages.filter(m => 
      m.type === 'received' && m.data.type === 'playerMoved'
    );
    expect(movedMessages.length).toBeGreaterThan(0);
  });
});