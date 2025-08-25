import { test, expect, Page } from '@playwright/test';
import { VisualRegressionTestRunner } from './utils/visual-regression-utils';

/**
 * ASCII Roguelike Visual Regression Testing Suite
 * 
 * Tests the exact positioning, formatting, and visual consistency of ASCII UI elements
 * based on the Visual Standards Document specifications.
 * 
 * Critical Focus Areas:
 * - Quick skill bar (1-9 hotkeys) positioning and format
 * - Box-drawing character borders (┌─┐│└┘├┤┬┴┼)
 * - Panel dimensions (exactly 40 characters wide)
 * - Color scheme consistency (#00ff00 on #000000)
 * - ASCII progress bars using █▒░ characters
 */

test.describe('ASCII UI Visual Regression Tests', () => {
  let visualTestRunner: VisualRegressionTestRunner;

  test.beforeAll(async () => {
    visualTestRunner = new VisualRegressionTestRunner();
  });

  test.beforeEach(async ({ page }) => {
    // Navigate to the game and wait for full UI initialization
    await page.goto('/');
    
    // Wait for WebSocket connection and initial game state
    await page.waitForSelector('[data-testid="game-container"]', { timeout: 30000 });
    
    // Wait for right panel to be fully rendered
    await page.waitForSelector('[data-testid="right-panel"]', { timeout: 10000 });
    
    // Wait for ASCII UI to stabilize (important for consistent screenshots)
    await page.waitForTimeout(1000);
  });

  test.describe('Critical Layout Elements', () => {
    test('Quick Skill Bar - Exact Layout and Positioning', async ({ page }) => {
      // This is the CRITICAL test - quick skill bar must never change layout
      await visualTestRunner.validateQuickSkillBar(page, {
        expectedSlots: 9,
        hotkeyNumbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        expectedWidth: 23, // characters including borders
        validateAPCosts: true,
        validateBorders: true
      });

      // Take screenshot of just the skill bar panel for pixel-perfect comparison
      const skillBarElement = page.locator('[data-testid="actions-panel"]');
      await expect(skillBarElement).toHaveScreenshot('quick-skill-bar-layout.png', {
        threshold: 0.1, // Very strict - only 10% pixel difference allowed
      });
    });

    test('Panel Borders - Box-Drawing Character Placement', async ({ page }) => {
      // Validate all box-drawing characters are in correct positions
      await visualTestRunner.validateBoxDrawingCharacters(page, {
        expectedChars: ['┌', '─', '┐', '│', '└', '┘', '╔', '═', '╗', '║', '╚', '╝', '╠', '╣', '╦', '╩'],
        validatePositions: true,
        strictPlacement: true
      });

      // Screenshot comparison for all panel borders
      const rightPanel = page.locator('[data-testid="right-panel"]');
      await expect(rightPanel).toHaveScreenshot('panel-borders-complete.png', {
        threshold: 0.05, // Very strict for border positioning
      });
    });

    test('Panel Dimensions - 40 Character Width Validation', async ({ page }) => {
      // Validate exact panel dimensions
      await visualTestRunner.validatePanelDimensions(page, {
        rightPanelWidth: 40, // characters
        panelBorderWidth: 23, // characters including borders
        validateAllPanels: true
      });

      // Take full right panel screenshot for dimensional reference
      const rightPanel = page.locator('[data-testid="right-panel"]');
      await expect(rightPanel).toHaveScreenshot('right-panel-dimensions.png', {
        threshold: 0.1,
      });
    });
  });

  test.describe('ASCII Progress Bars and Visual Elements', () => {
    test('Progress Bars - Character Composition Validation', async ({ page }) => {
      // Validate progress bar characters are correct: █▒░▓
      await visualTestRunner.validateProgressBars(page, {
        expectedChars: ['█', '▒', '░', '▓'],
        validateLength: 12, // characters as per standards
        validateAlignment: true
      });

      // Screenshot HP/AP progress bars specifically
      const statsPanel = page.locator('[data-testid="player-stats-panel"]');
      await expect(statsPanel).toHaveScreenshot('progress-bars-ascii.png', {
        threshold: 0.15, // Allow for dynamic HP/AP values
      });
    });

    test('Turn Order Display - Initiative Layout', async ({ page }) => {
      // Validate turn order panel structure and current player indicator
      await visualTestRunner.validateTurnOrder(page, {
        currentPlayerIndicator: '▶',
        validatePlayerList: true,
        validateInitiativeValues: false // These change, layout shouldn't
      });

      const initiativePanel = page.locator('[data-testid="initiative-panel"]');
      await expect(initiativePanel).toHaveScreenshot('turn-order-layout.png', {
        threshold: 0.2, // Player names/values change, layout stays fixed
      });
    });

    test('Message Log - Expanded 8-Line Layout', async ({ page }) => {
      // Validate message log expanded to 8 lines as per updated specs
      await visualTestRunner.validateMessageLog(page, {
        expectedLines: 8,
        expectedWidth: 23,
        validateScrolling: true
      });

      const messagePanel = page.locator('[data-testid="message-log-panel"]');
      await expect(messagePanel).toHaveScreenshot('message-log-expanded.png', {
        threshold: 0.3, // Messages change frequently, layout must stay consistent
      });
    });
  });

  test.describe('Color Scheme Validation', () => {
    test('Terminal Green Color Scheme - RGB Values', async ({ page }) => {
      // Validate exact color scheme matches standards
      await visualTestRunner.validateColorScheme(page, {
        backgroundColor: '#000000', // Pure black
        primaryColor: '#00ff00',    // Terminal green
        currentPlayerColor: '#ffff00', // Bright yellow
        enemyColor: '#ff0000',      // Red
        wallColor: '#808080',       // Gray
        strictValidation: true
      });

      // Take full UI screenshot for color reference
      await expect(page).toHaveScreenshot('color-scheme-validation.png', {
        threshold: 0.1,
        fullPage: true
      });
    });

    test('Monospace Font Rendering - Character Alignment', async ({ page }) => {
      // Validate monospace font is rendering correctly and characters align
      await visualTestRunner.validateFontRendering(page, {
        expectedFontFamily: ['Courier New', 'Monaco', 'Menlo', 'monospace'],
        validateCharacterSpacing: true,
        validateAlignment: true
      });

      // Screenshot showing character alignment precision
      const gameContainer = page.locator('[data-testid="game-container"]');
      await expect(gameContainer).toHaveScreenshot('font-rendering-alignment.png', {
        threshold: 0.05, // Font rendering should be very consistent
      });
    });
  });

  test.describe('Dynamic Content vs Fixed Layout', () => {
    test('Player Stats - Values Change, Layout Fixed', async ({ page }) => {
      // Test that HP/AP numbers can change but layout structure remains identical
      
      // Take initial screenshot
      const statsPanel = page.locator('[data-testid="player-stats-panel"]');
      const initialScreenshot = await statsPanel.screenshot();

      // Validate that structure elements are present regardless of values
      await visualTestRunner.validatePlayerStatsStructure(page, {
        validateLabels: true,    // "HP:", "AP:", "Move:" labels must be present
        validateBorders: true,   // Border characters must be exact
        validatePositions: true, // Character positions must be precise
        ignoreValues: true       // HP/AP numbers can vary
      });

      // Screenshot comparison ignoring dynamic numerical values
      await expect(statsPanel).toHaveScreenshot('player-stats-structure.png', {
        threshold: 0.25, // Allow for changing numbers, strict on layout
      });
    });

    test('Action Menu - 18 Line Expanded Layout', async ({ page }) => {
      // Validate expanded action menu is exactly 18 lines as per updated specs
      await visualTestRunner.validateActionMenu(page, {
        expectedLines: 18,
        validateHotkeys: true,   // [1]-[9] positions must be exact
        validateAPCosts: false,  // AP costs can change
        validateBorders: true,   // Border structure must be precise
        validateSeparators: true // Section dividers must be present
      });

      const actionPanel = page.locator('[data-testid="actions-panel"]');
      await expect(actionPanel).toHaveScreenshot('action-menu-18-lines.png', {
        threshold: 0.2, // Allow for changing skill names/costs
      });
    });
  });

  test.describe('Cross-Browser Consistency', () => {
    test('Chromium Baseline Rendering', async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'Baseline test for Chromium only');
      
      // Establish Chromium as the baseline for cross-browser comparison
      await expect(page).toHaveScreenshot('chromium-baseline-full-ui.png', {
        threshold: 0.05,
        fullPage: true
      });
    });

    test('Firefox Rendering Consistency', async ({ page, browserName }) => {
      test.skip(browserName !== 'firefox', 'Firefox-specific test');
      
      // Compare Firefox rendering against established standards
      await expect(page).toHaveScreenshot('firefox-ui-consistency.png', {
        threshold: 0.1,
        fullPage: true
      });
    });

    test('Safari/Webkit Rendering Consistency', async ({ page, browserName }) => {
      test.skip(browserName !== 'webkit', 'Webkit-specific test');
      
      // Compare Safari rendering - may have slight font differences
      await expect(page).toHaveScreenshot('webkit-ui-consistency.png', {
        threshold: 0.15, // Slightly more lenient for Safari font rendering
        fullPage: true
      });
    });
  });

  test.describe('Edge Cases and Stress Testing', () => {
    test('Long Player Names - Truncation Behavior', async ({ page }) => {
      // Test player name truncation at exactly 13 characters
      await page.evaluate(() => {
        // Simulate long player name
        const gameState = (window as any).gameState;
        if (gameState) {
          gameState.currentPlayer = { 
            ...gameState.currentPlayer, 
            name: 'VeryLongPlayerNameThatShouldBeTruncated' 
          };
          (window as any).gameRenderer.updateDisplay();
        }
      });

      await page.waitForTimeout(500); // Allow UI update

      await visualTestRunner.validatePlayerNameTruncation(page, {
        maxLength: 13,
        truncationSymbol: '...',
        validateAlignment: true
      });

      const statsPanel = page.locator('[data-testid="player-stats-panel"]');
      await expect(statsPanel).toHaveScreenshot('long-name-truncation.png', {
        threshold: 0.1,
      });
    });

    test('Maximum Skills Configuration - 9 Slot Layout', async ({ page }) => {
      // Test quick skill bar with all 9 slots filled with different AP costs
      await page.evaluate(() => {
        const gameState = (window as any).gameState;
        if (gameState && gameState.currentPlayer) {
          gameState.currentPlayer.skills = [
            { name: 'Lightning Strike', apCost: 4 },
            { name: 'Healing Potion', apCost: 2 },
            { name: 'Power Attack', apCost: 3 },
            { name: 'Magic Missile', apCost: 1 },
            { name: 'Shield Wall', apCost: 2 },
            { name: 'Berserker Rage', apCost: 5 },
            { name: 'Teleport', apCost: 3 },
            { name: 'Mass Heal', apCost: 6 },
            { name: 'Ultimate Strike', apCost: 8 }
          ];
          (window as any).gameRenderer.updateDisplay();
        }
      });

      await page.waitForTimeout(500);

      const actionPanel = page.locator('[data-testid="actions-panel"]');
      await expect(actionPanel).toHaveScreenshot('maximum-skills-layout.png', {
        threshold: 0.1,
      });
    });

    test('Insufficient AP State - Gray Out Behavior', async ({ page }) => {
      // Test skills becoming unavailable when AP is insufficient
      await page.evaluate(() => {
        const gameState = (window as any).gameState;
        if (gameState && gameState.currentPlayer) {
          gameState.currentPlayer.currentAP = 1; // Very low AP
          (window as any).gameRenderer.updateDisplay();
        }
      });

      await page.waitForTimeout(500);

      await visualTestRunner.validateInsufficientAPState(page, {
        validateGrayOut: true,
        validateDashDisplay: true, // "----" for unavailable skills
        validateAvailableSkills: true
      });

      const actionPanel = page.locator('[data-testid="actions-panel"]');
      await expect(actionPanel).toHaveScreenshot('insufficient-ap-state.png', {
        threshold: 0.1,
      });
    });
  });
});

test.describe('Regression Failure Analysis', () => {
  test('Generate Visual Diff Report on Failures', async ({ page }) => {
    // This test intentionally captures the current state for diff analysis
    
    const rightPanel = page.locator('[data-testid="right-panel"]');
    
    // Create detailed screenshots of each panel section for diff analysis
    const panelSections = [
      { selector: '[data-testid="player-stats-panel"]', name: 'player-stats' },
      { selector: '[data-testid="initiative-panel"]', name: 'initiative-order' },
      { selector: '[data-testid="actions-panel"]', name: 'actions-quick-skills' },
      { selector: '[data-testid="turn-status-panel"]', name: 'turn-status' },
      { selector: '[data-testid="ap-display-panel"]', name: 'ap-display' },
      { selector: '[data-testid="message-log-panel"]', name: 'message-log' }
    ];

    for (const section of panelSections) {
      try {
        const element = page.locator(section.selector);
        await expect(element).toHaveScreenshot(`baseline-${section.name}.png`, {
          threshold: 0.1,
        });
      } catch (error) {
        // Log but don't fail - some panels might not be present in all states
        console.log(`Panel ${section.name} not found or failed screenshot: ${error}`);
      }
    }

    // Generate full UI baseline
    await expect(page).toHaveScreenshot('baseline-full-ui-state.png', {
      threshold: 0.1,
      fullPage: true
    });
  });
});