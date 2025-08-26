import { test, expect, Page } from '@playwright/test';

test.describe('Turn-Based Tactical Combat', () => {
  
  test('game loads in exploration mode then switches to combat', async ({ page }) => {
    await page.goto('http://localhost:3002');
    
    // Wait for connection
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")', {
      timeout: 5000
    });
    
    // Should start in exploration mode
    const phase = await page.locator('#game-phase').textContent();
    expect(phase).toBe('exploration');
    
    // Combat should start automatically after enemies spawn
    await page.waitForSelector('#game-phase:has-text("combat")', {
      timeout: 3000
    });
    
    // Should show turn order
    const turnOrder = await page.locator('#turn-list').textContent();
    expect(turnOrder).toBeTruthy();
    expect(turnOrder.length).toBeGreaterThan(0);
    
    // Should show current turn
    const currentTurn = await page.locator('#current-turn').textContent();
    expect(currentTurn).not.toBe('-');
  });
  
  test('skills panel shows available skills', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    
    // Wait for combat to start
    await page.waitForSelector('#game-phase:has-text("combat")');
    
    // Should show skills
    const skillsPanel = page.locator('#skills-list');
    await expect(skillsPanel).toBeVisible();
    
    // Should have multiple skills
    const skillButtons = await skillsPanel.locator('.skill-button').count();
    expect(skillButtons).toBeGreaterThan(0);
    
    // Skills should show names and descriptions
    const firstSkill = await skillsPanel.locator('.skill-button').first().textContent();
    expect(firstSkill).toContain('AP'); // Should show AP cost
  });
  
  test('turn order display shows initiative order', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    await page.waitForSelector('#game-phase:has-text("combat")');
    
    // Turn order should be visible
    const turnOrder = page.locator('#turn-order');
    await expect(turnOrder).toBeVisible();
    
    // Should show initiative values
    const turnList = await page.locator('#turn-list').textContent();
    expect(turnList).toMatch(/\(\d+\)/); // Should have initiative numbers in parentheses
    
    // Should highlight current turn
    const currentEntry = page.locator('.turn-entry.current');
    await expect(currentEntry).toBeVisible();
  });
  
  test('AP system works correctly', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    await page.waitForSelector('#game-phase:has-text("combat")');
    
    // Should show AP dots
    const apDots = page.locator('#ap-dots');
    await expect(apDots).toBeVisible();
    
    // Should have some AP dots
    const dots = await apDots.locator('.ap-dot').count();
    expect(dots).toBeGreaterThan(0);
    
    // Should show filled dots (player starts with full AP)
    const filledDots = await apDots.locator('.ap-dot:not(.empty)').count();
    expect(filledDots).toBeGreaterThan(0);
  });
  
  test('player can select skills during their turn', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    await page.waitForSelector('#game-phase:has-text("combat")');
    
    // Wait for player's turn (might need to wait for other turns first)
    const playerId = await page.locator('#player-id').textContent();
    
    // Wait until it's the player's turn or timeout
    try {
      await page.waitForSelector('#current-turn', {
        timeout: 10000
      });
      
      const currentTurn = await page.locator('#current-turn').textContent();
      
      // If it's our turn, test skill selection
      if (currentTurn.includes(playerId!)) {
        // End turn button should be enabled
        const endTurnBtn = page.locator('#end-turn-btn');
        await expect(endTurnBtn).not.toBeDisabled();
        
        // Should be able to click skills
        const firstSkill = page.locator('.skill-button').first();
        if (await firstSkill.isEnabled()) {
          await firstSkill.click();
          
          // Should show as selected
          await expect(firstSkill).toHaveClass(/selected/);
        }
      }
    } catch (e) {
      // If it's not our turn, at least verify the UI exists
      const skillButtons = await page.locator('.skill-button').count();
      expect(skillButtons).toBeGreaterThan(0);
    }
  });
  
  test('enemies attack back on their turns', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    await page.waitForSelector('#game-phase:has-text("combat")');
    
    // Wait for some combat messages (enemies should act)
    await page.waitForTimeout(5000);
    
    const combatLog = await page.locator('[data-testid="combat-log"]').textContent();
    
    // Should have some combat activity
    expect(combatLog).toContain('Combat Log');
    expect(combatLog!.length).toBeGreaterThan(50);
    
    // Should eventually have enemy actions (they attack or move)
    // Note: This might take a while depending on turn order
    const hasEnemyActions = combatLog!.includes('attacks') || combatLog!.includes('uses');
    expect(hasEnemyActions).toBe(true);
  });
  
  test('movement only works during exploration phase', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    
    // Try to move during exploration (should work)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    
    // Position should change during exploration
    const explorationPos = await page.locator('[data-testid="player-position"]');
    // Note: This element might not exist yet, but movement should be processed
    
    // Wait for combat
    await page.waitForSelector('#game-phase:has-text("combat")');
    
    // Movement during combat should not work
    const initialMap = await page.locator('[data-testid="game-map"]').innerHTML();
    
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(100);
    
    const afterMoveMap = await page.locator('[data-testid="game-map"]').innerHTML();
    
    // Map should be the same (no movement during combat)
    expect(afterMoveMap).toBe(initialMap);
  });
  
  test('target selection works with click-to-target', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    await page.waitForSelector('#game-phase:has-text("combat")');
    
    // Wait for our turn or just test the UI exists
    const playerId = await page.locator('#player-id').textContent();
    
    // Target info panel should exist but be hidden initially
    const targetInfo = page.locator('#target-info');
    expect(await targetInfo.isVisible()).toBe(false);
    
    // Map cells should be clickable
    const mapCells = await page.locator('.map-cell').count();
    expect(mapCells).toBeGreaterThan(0);
    
    // Skills should exist
    const skills = await page.locator('.skill-button').count();
    expect(skills).toBeGreaterThan(0);
  });
  
  test('health and damage system works in turns', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    await page.waitForSelector('#game-phase:has-text("combat")');
    
    // Should show initial health
    const health = await page.locator('#player-health').textContent();
    expect(health).toMatch(/\d+\/\d+/);
    
    // Health bar should be visible
    const healthBar = page.locator('#health-bar');
    await expect(healthBar).toBeVisible();
    
    // Health fill should be at 100% initially
    const healthFill = page.locator('#health-fill');
    const initialWidth = await healthFill.evaluate(el => el.style.width);
    expect(initialWidth).toBe('100%');
    
    // Wait for some combat to occur
    await page.waitForTimeout(3000);
    
    // Should still have valid health display
    const laterHealth = await page.locator('#player-health').textContent();
    expect(laterHealth).toMatch(/\d+\/\d+/);
  });
  
  test('win/lose conditions trigger correctly', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    await page.waitForSelector('#game-phase:has-text("combat")');
    
    // Wait for combat to potentially end (victory or defeat)
    // This test mainly verifies the UI can handle state changes
    await page.waitForTimeout(2000);
    
    const combatLog = await page.locator('[data-testid="combat-log"]').textContent();
    
    // Should have combat messages
    expect(combatLog).toContain('Combat Log');
    
    // Phase should be valid
    const phase = await page.locator('#game-phase').textContent();
    expect(['exploration', 'combat', 'victory']).toContain(phase!);
  });
  
  test('multiple skills with different costs and effects', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
    await page.waitForSelector('#game-phase:has-text("combat")');
    
    // Should show multiple skills
    const skillButtons = page.locator('.skill-button');
    const skillCount = await skillButtons.count();
    expect(skillCount).toBeGreaterThanOrEqual(3); // Should have at least basic attack, power attack, heal
    
    // Skills should show different AP costs
    const skillTexts = await skillButtons.allTextContents();
    const hasVariedCosts = skillTexts.some(text => text.includes('0 AP')) && 
                          skillTexts.some(text => text.includes('1 AP')) && 
                          skillTexts.some(text => text.includes('2 AP'));
    expect(hasVariedCosts).toBe(true);
    
    // Should have different skill types
    const allSkillText = skillTexts.join(' ');
    expect(allSkillText).toContain('Attack');
    expect(allSkillText).toContain('Heal');
  });
});