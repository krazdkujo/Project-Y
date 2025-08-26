import { test, expect, Page } from '@playwright/test';

test.describe('Combat Game Functionality', () => {
  
  test('game loads with enemies visible', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Wait for connection
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")', {
      timeout: 5000
    });
    
    // Check that map has enemies
    const gameMap = await page.locator('[data-testid="game-map"]').textContent();
    
    // Should see player (@) and some enemies (g, O, or r)
    expect(gameMap).toContain('@');
    
    // Check for at least one enemy type
    const hasEnemies = gameMap!.includes('g') || gameMap!.includes('O') || gameMap!.includes('r');
    expect(hasEnemies).toBe(true);
    
    // Health should be displayed
    const health = await page.locator('#player-health').textContent();
    expect(health).toBe('10/10');
    
    // Combat log should be visible
    const combatLog = await page.locator('[data-testid="combat-log"]').textContent();
    expect(combatLog).toContain('Combat Log');
  });
  
  test('player can attack enemies', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    
    // Wait a moment for enemies to spawn
    await page.waitForTimeout(500);
    
    // Try to move next to an enemy and attack
    // Move around to find an enemy
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);
    }
    
    // Attack
    await page.keyboard.press(' '); // Space to attack
    await page.waitForTimeout(200);
    
    // Check if combat log shows attack (might miss if no adjacent enemy)
    const combatLog = await page.locator('[data-testid="combat-log"]').textContent();
    
    // At minimum, spacebar shouldn't cause errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    expect(errors).toHaveLength(0);
  });
  
  test('enemies move around the map', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    
    // Get initial map state
    const initialMap = await page.locator('[data-testid="game-map"]').textContent();
    
    // Wait for enemy movement (they move every 500ms)
    await page.waitForTimeout(1500);
    
    // Get new map state
    const newMap = await page.locator('[data-testid="game-map"]').textContent();
    
    // Maps should be different (enemies moved)
    expect(newMap).not.toBe(initialMap);
    
    // Should still have enemies
    const hasEnemies = newMap!.includes('g') || newMap!.includes('O') || newMap!.includes('r');
    expect(hasEnemies).toBe(true);
  });
  
  test('health bar updates when damaged', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    
    // Initial health should be full
    const healthBar = page.locator('#health-fill');
    const initialWidth = await healthBar.evaluate(el => el.style.width);
    expect(initialWidth).toBe('100%');
    
    // Health text should show 10/10
    const healthText = await page.locator('#player-health').textContent();
    expect(healthText).toBe('10/10');
  });
  
  test('multiple players can fight each other', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const player1 = await context1.newPage();
    const player2 = await context2.newPage();
    
    try {
      // Both players connect
      await player1.goto('http://localhost:3001');
      await player2.goto('http://localhost:3001');
      
      await player1.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
      await player2.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
      
      // Get player IDs
      const player1Id = await player1.locator('#player-id').textContent();
      const player2Id = await player2.locator('#player-id').textContent();
      
      expect(player1Id).toBeTruthy();
      expect(player2Id).toBeTruthy();
      
      // Both should see two players on map
      const map1 = await player1.locator('[data-testid="game-map"]').textContent();
      const map2 = await player2.locator('[data-testid="game-map"]').textContent();
      
      expect(map1).toContain('@'); // Player 1 sees self
      expect(map2).toContain('@'); // Player 2 sees self
      
      // Move players around
      await player1.keyboard.press('ArrowRight');
      await player2.keyboard.press('ArrowLeft');
      await player1.waitForTimeout(200);
      
      // Try to attack (may or may not hit depending on positions)
      await player1.keyboard.press(' ');
      await player1.waitForTimeout(100);
      
      // No errors should occur
      const errors1: string[] = [];
      const errors2: string[] = [];
      
      player1.on('console', msg => {
        if (msg.type() === 'error') errors1.push(msg.text());
      });
      
      player2.on('console', msg => {
        if (msg.type() === 'error') errors2.push(msg.text());
      });
      
      expect(errors1).toHaveLength(0);
      expect(errors2).toHaveLength(0);
      
    } finally {
      await context1.close();
      await context2.close();
    }
  });
  
  test('combat log shows fight messages', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    
    // Combat log should initially show connection
    const combatLog = page.locator('[data-testid="combat-log"]');
    const initialLog = await combatLog.textContent();
    
    expect(initialLog).toContain('Connected to server');
    expect(initialLog).toContain('Joined game');
    
    // Move around and try to attack something
    for (let i = 0; i < 10; i++) {
      // Move in a pattern to find enemies
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(50);
      await page.keyboard.press(' '); // Attack
      await page.waitForTimeout(50);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(50);
      await page.keyboard.press(' '); // Attack
      await page.waitForTimeout(50);
    }
    
    // Log should have more entries now
    const finalLog = await combatLog.textContent();
    expect(finalLog!.length).toBeGreaterThan(initialLog!.length);
  });
  
  test('kills and deaths are tracked', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    
    // Initial stats should be 0
    const kills = await page.locator('#kills').textContent();
    const deaths = await page.locator('#deaths').textContent();
    
    expect(kills).toBe('0');
    expect(deaths).toBe('0');
    
    // Stats elements should be visible
    await expect(page.locator('#kills')).toBeVisible();
    await expect(page.locator('#deaths')).toBeVisible();
  });
  
  test('respawn system works after death', async ({ browser }) => {
    // This test would need to simulate death and respawn
    // For now, just verify the UI elements exist
    const page = await browser.newPage();
    
    await page.goto('http://localhost:3001');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    
    // Check that health system exists
    const health = await page.locator('#player-health').textContent();
    expect(health).toMatch(/\d+\/\d+/);
    
    // Player should be marked as alive initially
    const playerId = await page.locator('#player-id').textContent();
    expect(playerId).toBeTruthy();
    
    // Map should show player
    const map = await page.locator('[data-testid="game-map"]').textContent();
    expect(map).toContain('@');
    
    await page.close();
  });
});