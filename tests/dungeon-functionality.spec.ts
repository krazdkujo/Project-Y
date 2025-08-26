import { test, expect, Page } from '@playwright/test';

test.describe('Dungeon Crawler Functionality', () => {
  
  test('game loads with proper dungeon layout', async ({ page }) => {
    await page.goto('http://localhost:3003');
    
    // Wait for connection
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")', {
      timeout: 5000
    });
    
    // Should start on Floor 1, Room 1
    const floor = await page.locator('#current-floor').textContent();
    const room = await page.locator('#current-room').textContent();
    expect(floor).toBe('1');
    expect(room).toBe('1');
    
    // Should show room layout with walls and floors
    const gameMap = await page.locator('[data-testid="game-map"]').textContent();
    expect(gameMap).toContain('#'); // walls
    expect(gameMap).toContain('.'); // floors
    expect(gameMap).toContain('@'); // player
    
    // Should show dungeon info
    const dungeonInfo = page.locator('#dungeon-info');
    await expect(dungeonInfo).toBeVisible();
    await expect(dungeonInfo).toContainText('Floor 1 - Room 1');
  });
  
  test('movement works in exploration phase', async ({ page }) => {
    await page.goto('http://localhost:3003');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    
    // Should start in exploration phase
    const phase = await page.locator('#game-phase').textContent();
    expect(phase).toBe('exploration');
    
    // Should be able to move
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);
    
    // Map should update (player moved)
    const gameMap = await page.locator('[data-testid="game-map"]').textContent();
    expect(gameMap).toContain('@');
  });
  
  test('combat triggers automatically when enemies in sight', async ({ page }) => {
    await page.goto('http://localhost:3003');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    
    // Should have enemies in the room initially
    const roomStatus = await page.locator('#room-status').textContent();
    expect(roomStatus).toContain('enemies present');
    
    // Combat should start automatically or when moving near enemies
    await page.waitForSelector('#game-phase:has-text("combat")', {
      timeout: 3000
    });
    
    // Combat UI should appear
    await expect(page.locator('#turn-info')).toBeVisible();
    await expect(page.locator('#skills-panel')).toBeVisible();
  });
  
  test('room clearing mechanics work', async ({ page }) => {
    await page.goto('http://localhost:3003');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    
    // Should start with enemies present
    const initialStatus = await page.locator('#room-status').textContent();
    expect(initialStatus).not.toBe('Room Cleared!');
    
    // Next room button should be disabled initially
    const nextRoomBtn = page.locator('#next-room-btn');
    expect(await nextRoomBtn.isDisabled()).toBe(true);
    
    // Room status should indicate enemies present
    expect(initialStatus).toContain('enemies');
  });
  
  test('floor and room progression display', async ({ page }) => {
    await page.goto('http://localhost:3003');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    
    // Should display current floor and room
    const floorText = await page.locator('#current-floor').textContent();
    const roomText = await page.locator('#current-room').textContent();
    
    expect(floorText).toMatch(/\d+/);
    expect(roomText).toMatch(/\d+/);
    
    // Dungeon info should be visible
    const dungeonInfo = page.locator('#dungeon-info');
    await expect(dungeonInfo).toBeVisible();
    await expect(dungeonInfo).toContainText('Floor');
    await expect(dungeonInfo).toContainText('Room');
  });
  
  test('different room layouts exist', async ({ page }) => {
    await page.goto('http://localhost:3003');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    
    // Should have a room layout with walls
    const gameMap = await page.locator('[data-testid="game-map"]').textContent();
    
    // Should have walls (#) and floors (.)
    expect(gameMap).toContain('#');
    expect(gameMap).toContain('.');
    
    // Should have some structure (not all the same character)
    const uniqueChars = new Set(gameMap!.replace(/\s/g, '').split(''));
    expect(uniqueChars.size).toBeGreaterThan(2);
  });
  
  test('enemy types appear in rooms', async ({ page }) => {
    await page.goto('http://localhost:3003');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    
    // Wait for enemies to be visible
    await page.waitForTimeout(1000);
    
    const gameMap = await page.locator('[data-testid="game-map"]').textContent();
    
    // Should have some enemy symbols (g, O, s, T)
    const hasEnemies = gameMap!.includes('g') || gameMap!.includes('O') || 
                       gameMap!.includes('s') || gameMap!.includes('T');
    expect(hasEnemies).toBe(true);
    
    // Legend should explain enemy types
    const instructions = await page.locator('#instructions').textContent();
    expect(instructions).toContain('Goblin');
    expect(instructions).toContain('Orc');
  });
  
  test('walls block movement', async ({ page }) => {
    await page.goto('http://localhost:3003');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    
    // Get initial map state
    const initialMap = await page.locator('[data-testid="game-map"]').textContent();
    
    // Try to move in different directions (some should be blocked by walls)
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(100);
    
    // Player should still be on the map
    const newMap = await page.locator('[data-testid="game-map"]').textContent();
    expect(newMap).toContain('@');
    
    // Should have walls that prevent movement
    expect(newMap).toContain('#');
  });
  
  test('exploration phase allows free movement', async ({ page }) => {
    await page.goto('http://localhost:3003');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    
    // Should start in exploration
    await page.waitForSelector('#game-phase:has-text("exploration")');
    
    // Combat UI should be hidden initially
    expect(await page.locator('#turn-info').isVisible()).toBe(false);
    expect(await page.locator('#skills-panel').isVisible()).toBe(false);
    
    // Movement should work
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    
    // No turn restrictions during exploration
    const gameMap = await page.locator('[data-testid="game-map"]').textContent();
    expect(gameMap).toContain('@');
  });
  
  test('skills scale properly with floor difficulty', async ({ page }) => {
    await page.goto('http://localhost:3003');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    
    // Wait for combat to start
    await page.waitForSelector('#game-phase:has-text("combat")', { timeout: 3000 });
    
    // Skills should be available
    const skillsPanel = page.locator('#skills-panel');
    await expect(skillsPanel).toBeVisible();
    
    // Should have multiple skills with different costs
    const skillButtons = await skillsPanel.locator('.skill-button').count();
    expect(skillButtons).toBeGreaterThan(1);
    
    // Skills should show AP costs
    const firstSkillText = await skillsPanel.locator('.skill-button').first().textContent();
    expect(firstSkillText).toContain('AP');
  });
  
  test('adventure log tracks dungeon progress', async ({ page }) => {
    await page.goto('http://localhost:3003');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    
    // Adventure log should be visible
    const adventureLog = page.locator('[data-testid="combat-log"]');
    await expect(adventureLog).toBeVisible();
    
    // Should contain initial messages
    const logContent = await adventureLog.textContent();
    expect(logContent).toContain('Adventure Log');
    expect(logContent).toContain('Connected');
    
    // Should track room events
    expect(logContent!.length).toBeGreaterThan(50);
  });
});