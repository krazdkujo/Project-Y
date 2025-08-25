import { test, expect } from '@playwright/test';

/**
 * Baseline Screenshot Generation
 * 
 * This test suite generates the reference baseline screenshots that will be used
 * for visual regression testing. Run this when the UI is in a stable, approved state
 * to establish the visual standards for comparison.
 * 
 * Usage:
 * npm run test:visual:baseline
 * 
 * This will generate baseline screenshots in tests/visual/baselines/
 */

test.describe('Baseline Screenshot Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for complete UI initialization
    await page.waitForSelector('[data-testid="game-container"]', { timeout: 30000 });
    await page.waitForSelector('[data-testid="right-panel"]', { timeout: 15000 });
    
    // Wait for WebSocket connection and game state stabilization
    await page.waitForTimeout(3000);
  });

  test('Generate Master Baseline - Full UI State', async ({ page }) => {
    // Set up a known, stable game state for baseline generation
    await page.evaluate(() => {
      const gameState = (window as any).gameState;
      if (gameState && gameState.currentPlayer) {
        // Set predictable player stats
        gameState.currentPlayer.name = 'TestPlayer';
        gameState.currentPlayer.currentHP = 85;
        gameState.currentPlayer.maxHP = 100;
        gameState.currentPlayer.currentAP = 6;
        gameState.currentPlayer.maxAP = 8;
        gameState.currentPlayer.currentMP = 3;
        gameState.currentPlayer.maxMP = 3;
        
        // Set predictable skills for baseline
        gameState.currentPlayer.skills = [
          { name: 'Move', apCost: 1 },
          { name: 'Basic Attack', apCost: 0 },
          { name: 'Power Strike', apCost: 2 },
          { name: 'Fireball', apCost: 3 },
          { name: 'Shield Bash', apCost: 1 },
          { name: 'Quick Shot', apCost: 1 },
          { name: 'Ice Lance', apCost: 2 },
          { name: 'Lightning', apCost: 4 }
          // Slot 9 intentionally empty for testing
        ];
        
        // Set predictable skill levels
        gameState.currentPlayer.skillLevels = {
          'Combat': 50,
          'Swords': 75,
          'Fire Magic': 25,
          'Healing': 60
        };
        
        // Update the display with baseline state
        (window as any).gameRenderer.updateDisplay();
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Generate full page baseline
    await expect(page).toHaveScreenshot('baseline-master-full-ui.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    console.log('✓ Generated master baseline: baseline-master-full-ui.png');
  });

  test('Generate Panel Baselines - Individual Components', async ({ page }) => {
    // Set stable state
    await page.evaluate(() => {
      const gameState = (window as any).gameState;
      if (gameState && gameState.currentPlayer) {
        gameState.currentPlayer.name = 'TestPlayer';
        gameState.currentPlayer.currentHP = 85;
        gameState.currentPlayer.maxHP = 100;
        gameState.currentPlayer.currentAP = 6;
        gameState.currentPlayer.maxAP = 8;
        gameState.currentPlayer.skills = [
          { name: 'Move', apCost: 1 },
          { name: 'Basic Attack', apCost: 0 },
          { name: 'Power Strike', apCost: 2 },
          { name: 'Fireball', apCost: 3 },
          { name: 'Shield Bash', apCost: 1 },
          { name: 'Quick Shot', apCost: 1 }
        ];
        (window as any).gameRenderer.updateDisplay();
      }
    });
    
    await page.waitForTimeout(500);
    
    // Generate baseline for each critical panel
    const panelBaselines = [
      { selector: '[data-testid="right-panel"]', name: 'baseline-right-panel.png' },
      { selector: '[data-testid="actions-panel"]', name: 'baseline-quick-skill-bar.png' },
      { selector: '[data-testid="player-stats-panel"]', name: 'baseline-player-stats.png' },
      { selector: '[data-testid="game-map"]', name: 'baseline-game-map.png' }
    ];
    
    for (const { selector, name } of panelBaselines) {
      const element = page.locator(selector);
      
      if (await element.count() > 0) {
        await expect(element).toHaveScreenshot(name, {
          animations: 'disabled'
        });
        console.log(`✓ Generated baseline: ${name}`);
      } else {
        console.log(`⚠ Skipped baseline (element not found): ${name}`);
      }
    }
  });

  test('Generate Critical Layout Baselines - Exact Positioning', async ({ page }) => {
    // Set up for critical layout testing
    await page.evaluate(() => {
      const gameState = (window as any).gameState;
      if (gameState && gameState.currentPlayer) {
        // Fill all 9 skill slots for complete baseline
        gameState.currentPlayer.skills = [
          { name: 'Move', apCost: 1 },
          { name: 'Basic Attack', apCost: 0 },
          { name: 'Power Strike', apCost: 2 },
          { name: 'Fireball', apCost: 3 },
          { name: 'Shield Bash', apCost: 1 },
          { name: 'Quick Shot', apCost: 1 },
          { name: 'Ice Lance', apCost: 2 },
          { name: 'Lightning', apCost: 4 },
          { name: 'Ultimate', apCost: 8 }
        ];
        gameState.currentPlayer.currentAP = 10; // Full AP for testing
        (window as any).gameRenderer.updateDisplay();
      }
    });
    
    await page.waitForTimeout(500);
    
    const actionsPanel = page.locator('[data-testid="actions-panel"]');
    
    // Generate critical skill bar baseline with all slots filled
    await expect(actionsPanel).toHaveScreenshot('baseline-skill-bar-full.png', {
      animations: 'disabled'
    });
    
    console.log('✓ Generated critical layout baseline: baseline-skill-bar-full.png');
  });

  test('Generate Edge Case Baselines - UI Variations', async ({ page }) => {
    // Test various UI states that need baselines
    
    // 1. Long player name (truncation test)
    await page.evaluate(() => {
      const gameState = (window as any).gameState;
      if (gameState && gameState.currentPlayer) {
        gameState.currentPlayer.name = 'VeryLongPlayerName123';
        gameState.currentPlayer.currentHP = 100;
        gameState.currentPlayer.maxHP = 100;
        gameState.currentPlayer.currentAP = 8;
        gameState.currentPlayer.maxAP = 8;
        (window as any).gameRenderer.updateDisplay();
      }
    });
    
    await page.waitForTimeout(500);
    
    const statsPanel = page.locator('[data-testid="player-stats-panel"]');
    if (await statsPanel.count() > 0) {
      await expect(statsPanel).toHaveScreenshot('baseline-long-name.png');
      console.log('✓ Generated edge case baseline: baseline-long-name.png');
    }
    
    // 2. Low HP/AP state
    await page.evaluate(() => {
      const gameState = (window as any).gameState;
      if (gameState && gameState.currentPlayer) {
        gameState.currentPlayer.name = 'TestPlayer';
        gameState.currentPlayer.currentHP = 5;
        gameState.currentPlayer.maxHP = 100;
        gameState.currentPlayer.currentAP = 1;
        gameState.currentPlayer.maxAP = 8;
        (window as any).gameRenderer.updateDisplay();
      }
    });
    
    await page.waitForTimeout(500);
    
    if (await statsPanel.count() > 0) {
      await expect(statsPanel).toHaveScreenshot('baseline-low-hp-ap.png');
      console.log('✓ Generated edge case baseline: baseline-low-hp-ap.png');
    }
    
    // 3. Insufficient AP state (skills grayed out)
    await page.evaluate(() => {
      const gameState = (window as any).gameState;
      if (gameState && gameState.currentPlayer) {
        gameState.currentPlayer.currentAP = 0; // No AP
        gameState.currentPlayer.skills = [
          { name: 'Move', apCost: 1 },
          { name: 'Basic Attack', apCost: 0 },
          { name: 'Power Strike', apCost: 2 },
          { name: 'Fireball', apCost: 3 }
        ];
        (window as any).gameRenderer.updateDisplay();
      }
    });
    
    await page.waitForTimeout(500);
    
    const actionsPanel = page.locator('[data-testid="actions-panel"]');
    if (await actionsPanel.count() > 0) {
      await expect(actionsPanel).toHaveScreenshot('baseline-insufficient-ap.png');
      console.log('✓ Generated edge case baseline: baseline-insufficient-ap.png');
    }
  });

  test('Generate Cross-Browser Baselines', async ({ page, browserName }) => {
    // Generate browser-specific baselines for comparison
    await page.evaluate(() => {
      const gameState = (window as any).gameState;
      if (gameState && gameState.currentPlayer) {
        // Standard state for cross-browser testing
        gameState.currentPlayer.name = 'TestPlayer';
        gameState.currentPlayer.currentHP = 75;
        gameState.currentPlayer.maxHP = 100;
        gameState.currentPlayer.currentAP = 5;
        gameState.currentPlayer.maxAP = 8;
        gameState.currentPlayer.skills = [
          { name: 'Move', apCost: 1 },
          { name: 'Attack', apCost: 0 },
          { name: 'Fireball', apCost: 3 }
        ];
        (window as any).gameRenderer.updateDisplay();
      }
    });
    
    await page.waitForTimeout(500);
    
    // Generate browser-specific baseline
    await expect(page).toHaveScreenshot(`baseline-${browserName}-full-ui.png`, {
      fullPage: true,
      animations: 'disabled'
    });
    
    console.log(`✓ Generated ${browserName} baseline: baseline-${browserName}-full-ui.png`);
    
    // Generate browser-specific skill bar baseline
    const actionsPanel = page.locator('[data-testid="actions-panel"]');
    if (await actionsPanel.count() > 0) {
      await expect(actionsPanel).toHaveScreenshot(`baseline-${browserName}-skill-bar.png`);
      console.log(`✓ Generated ${browserName} skill bar baseline`);
    }
  });

  test('Generate ASCII Character Reference Baseline', async ({ page }) => {
    // Create a reference for all ASCII characters used in the UI
    const rightPanel = page.locator('[data-testid="right-panel"]');
    
    // Ensure we have a good sampling of ASCII characters
    await page.evaluate(() => {
      const gameState = (window as any).gameState;
      if (gameState && gameState.currentPlayer) {
        // Set up state that will show various ASCII characters
        gameState.currentPlayer.name = 'TestPlayer';
        gameState.currentPlayer.currentHP = 42;  // Partial progress bars
        gameState.currentPlayer.maxHP = 100;
        gameState.currentPlayer.currentAP = 3;
        gameState.currentPlayer.maxAP = 8;
        
        gameState.currentPlayer.skills = [
          { name: 'Move', apCost: 1 },
          { name: 'Attack', apCost: 0 },
          { name: 'Power Strike', apCost: 2 },
          { name: '----------', apCost: 0 }, // Empty slot
          { name: '----------', apCost: 0 }  // Empty slot
        ];
        
        (window as any).gameRenderer.updateDisplay();
      }
    });
    
    await page.waitForTimeout(500);
    
    if (await rightPanel.count() > 0) {
      await expect(rightPanel).toHaveScreenshot('baseline-ascii-character-reference.png');
      console.log('✓ Generated ASCII character reference baseline');
    }
  });

  test('Document Baseline Generation Metadata', async ({ page }) => {
    // Collect metadata about the baseline generation environment
    const metadata = await page.evaluate(() => {
      return {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        devicePixelRatio: window.devicePixelRatio,
        colorDepth: screen.colorDepth,
        gameState: {
          hasGameState: typeof (window as any).gameState !== 'undefined',
          hasGameRenderer: typeof (window as any).gameRenderer !== 'undefined'
        }
      };
    });
    
    console.log('Baseline Generation Metadata:', JSON.stringify(metadata, null, 2));
    
    // This metadata should be saved alongside baselines for reference
    expect(metadata.gameState.hasGameState).toBeTruthy();
    expect(metadata.gameState.hasGameRenderer).toBeTruthy();
  });
});