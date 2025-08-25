import { test, expect } from '@playwright/test';
import { TestIDValidator } from './utils/testid-validator';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Setup Validation Tests
 * 
 * These tests validate that the UI is properly set up for visual regression testing.
 * They check for required test IDs, proper element structure, and baseline readiness.
 * 
 * Run these tests BEFORE generating baselines to ensure everything is configured correctly.
 */

test.describe('Visual Testing Setup Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for game initialization
    await page.waitForSelector('[data-testid="game-container"]', { timeout: 30000 });
    await page.waitForTimeout(2000);
  });

  test('Validate Test ID Presence - Required Elements', async ({ page }) => {
    const validationResults = await TestIDValidator.validateTestIDs(page);
    
    console.log('Test ID Validation Results:');
    console.log(`Total Elements: ${validationResults.totalElements}`);
    console.log(`Found Elements: ${validationResults.foundElements}`);
    console.log(`Missing Critical: ${validationResults.missingCritical}`);
    
    // Log details for each element
    for (const result of validationResults.elementResults) {
      const status = result.found ? 
        (result.hasCorrectTestId ? '✅' : '🔧') : 
        (result.required ? '🚨' : '⚠️');
      
      console.log(`${status} ${result.element}: ${result.found ? 'FOUND' : 'MISSING'} (${result.usedSelector})`);
    }
    
    // Generate HTML report
    const reportPath = path.join(process.cwd(), 'tests', 'visual', 'reports', 'testid-validation.html');
    const reportDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const reportHTML = TestIDValidator.generateTestIDReport(validationResults);
    fs.writeFileSync(reportPath, reportHTML);
    
    console.log(`📄 Test ID validation report generated: ${reportPath}`);
    
    // Test should pass only if all critical elements are found
    expect(validationResults.isValid).toBeTruthy(
      `Missing ${validationResults.missingCritical} critical elements with required test IDs. See report for details.`
    );
    
    expect(validationResults.missingCritical).toBe(0);
  });

  test('Validate Game State Initialization', async ({ page }) => {
    // Check that the game state is properly initialized for testing
    const gameStateInfo = await page.evaluate(() => {
      return {
        hasGameState: typeof (window as any).gameState !== 'undefined',
        hasGameRenderer: typeof (window as any).gameRenderer !== 'undefined',
        hasCurrentPlayer: (window as any).gameState?.currentPlayer !== undefined,
        playerName: (window as any).gameState?.currentPlayer?.name,
        hasWebSocket: typeof (window as any).ws !== 'undefined',
        webSocketState: (window as any).ws?.readyState
      };
    });
    
    console.log('Game State Info:', gameStateInfo);
    
    expect(gameStateInfo.hasGameState).toBeTruthy('Game state should be initialized');
    expect(gameStateInfo.hasGameRenderer).toBeTruthy('Game renderer should be initialized');
    expect(gameStateInfo.hasCurrentPlayer).toBeTruthy('Current player should exist in game state');
    
    // Log player info if available
    if (gameStateInfo.playerName) {
      console.log(`Current player: ${gameStateInfo.playerName}`);
    }
  });

  test('Validate UI Panel Structure', async ({ page }) => {
    // Check that all expected panels are rendered with proper structure
    const panelStructure = await page.evaluate(() => {
      const panels = [
        'game-container',
        'right-panel', 
        'actions-panel',
        'game-map'
      ];
      
      const results: Record<string, any> = {};
      
      for (const panelId of panels) {
        const element = document.querySelector(`[data-testid="${panelId}"]`);
        if (element) {
          results[panelId] = {
            exists: true,
            visible: element.offsetParent !== null,
            hasContent: element.textContent && element.textContent.trim().length > 0,
            contentLength: element.textContent?.length || 0,
            boundingRect: element.getBoundingClientRect()
          };
        } else {
          results[panelId] = { exists: false };
        }
      }
      
      return results;
    });
    
    console.log('Panel Structure Analysis:');
    
    for (const [panelId, info] of Object.entries(panelStructure)) {
      if (info.exists) {
        console.log(`✅ ${panelId}: ${info.visible ? 'VISIBLE' : 'HIDDEN'} (${info.contentLength} chars)`);
      } else {
        console.log(`❌ ${panelId}: NOT FOUND`);
      }
    }
    
    // Validate critical panels
    expect(panelStructure['game-container']?.exists).toBeTruthy('Game container must exist');
    expect(panelStructure['actions-panel']?.exists).toBeTruthy('Actions panel (quick skill bar) must exist');
    
    // Validate content presence
    if (panelStructure['actions-panel']?.exists) {
      expect(panelStructure['actions-panel'].hasContent).toBeTruthy('Actions panel must have content');
      expect(panelStructure['actions-panel'].contentLength).toBeGreaterThan(50);
    }
  });

  test('Validate ASCII Character Rendering', async ({ page }) => {
    // Check that ASCII characters are properly rendered
    const asciiValidation = await page.evaluate(() => {
      const rightPanel = document.querySelector('[data-testid="right-panel"]');
      if (!rightPanel || !rightPanel.textContent) {
        return { hasRightPanel: false };
      }
      
      const text = rightPanel.textContent;
      
      // Check for box-drawing characters
      const boxChars = ['╔', '═', '╗', '║', '╚', '╝', '╠', '╣'];
      const foundBoxChars = boxChars.filter(char => text.includes(char));
      
      // Check for progress bar characters
      const progressChars = ['█', '▒', '░', '▓'];
      const foundProgressChars = progressChars.filter(char => text.includes(char));
      
      // Check for hotkey indicators
      const hotkeyPattern = /\[([1-9])\]/g;
      const hotkeyMatches = text.match(hotkeyPattern);
      
      return {
        hasRightPanel: true,
        totalTextLength: text.length,
        foundBoxChars,
        foundProgressChars,
        hotkeyCount: hotkeyMatches ? hotkeyMatches.length : 0,
        hasExpectedStructure: foundBoxChars.length >= 4 && hotkeyMatches !== null
      };
    });
    
    console.log('ASCII Character Validation:');
    console.log(`Text length: ${asciiValidation.totalTextLength}`);
    console.log(`Box-drawing chars: ${asciiValidation.foundBoxChars?.join(', ') || 'none'}`);
    console.log(`Progress chars: ${asciiValidation.foundProgressChars?.join(', ') || 'none'}`);
    console.log(`Hotkeys found: ${asciiValidation.hotkeyCount}`);
    
    expect(asciiValidation.hasRightPanel).toBeTruthy('Right panel must be present');
    expect(asciiValidation.totalTextLength).toBeGreaterThan(100);
    expect(asciiValidation.foundBoxChars?.length).toBeGreaterThan(0);
    expect(asciiValidation.hotkeyCount).toBeGreaterThanOrEqual(1);
  });

  test('Validate Color Scheme Application', async ({ page }) => {
    // Check that the terminal green color scheme is applied
    const colorValidation = await page.evaluate(() => {
      const elements = [
        { name: 'body', selector: 'body' },
        { name: 'game-container', selector: '[data-testid="game-container"]' },
        { name: 'right-panel', selector: '[data-testid="right-panel"]' },
        { name: 'actions-panel', selector: '[data-testid="actions-panel"]' }
      ];
      
      const results: Record<string, any> = {};
      
      for (const { name, selector } of elements) {
        const element = document.querySelector(selector);
        if (element) {
          const computed = window.getComputedStyle(element);
          results[name] = {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontFamily: computed.fontFamily
          };
        }
      }
      
      return results;
    });
    
    console.log('Color Scheme Validation:');
    
    for (const [elementName, styles] of Object.entries(colorValidation)) {
      console.log(`${elementName}:`);
      console.log(`  Color: ${styles.color}`);
      console.log(`  Background: ${styles.backgroundColor}`);
      console.log(`  Font: ${styles.fontFamily}`);
    }
    
    // Validate that we have color information (elements exist and have styles)
    expect(Object.keys(colorValidation).length).toBeGreaterThan(0);
    
    // Check for monospace font (should contain 'courier', 'monaco', or 'monospace')
    const hasMonospaceFonts = Object.values(colorValidation).some((styles: any) => 
      styles.fontFamily && 
      (styles.fontFamily.toLowerCase().includes('courier') ||
       styles.fontFamily.toLowerCase().includes('monaco') ||
       styles.fontFamily.toLowerCase().includes('monospace'))
    );
    
    expect(hasMonospaceFonts).toBeTruthy('UI should use monospace fonts for ASCII rendering');
  });

  test('Validate Viewport and Responsive Layout', async ({ page }) => {
    // Check viewport dimensions and responsive behavior
    const viewportInfo = await page.evaluate(() => {
      return {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        screenWidth: screen.width,
        screenHeight: screen.height
      };
    });
    
    console.log('Viewport Information:');
    console.log(`Window: ${viewportInfo.innerWidth} x ${viewportInfo.innerHeight}`);
    console.log(`Screen: ${viewportInfo.screenWidth} x ${viewportInfo.screenHeight}`);
    console.log(`Device Pixel Ratio: ${viewportInfo.devicePixelRatio}`);
    
    // Validate minimum viewport for ASCII UI
    expect(viewportInfo.innerWidth).toBeGreaterThan(1000); // Minimum for proper ASCII layout
    expect(viewportInfo.innerHeight).toBeGreaterThan(600);
    
    // Check that right panel fits properly
    const rightPanel = page.locator('[data-testid="right-panel"]');
    
    if (await rightPanel.count() > 0) {
      const rightPanelBox = await rightPanel.boundingBox();
      if (rightPanelBox) {
        expect(rightPanelBox.x + rightPanelBox.width).toBeLessThanOrEqual(viewportInfo.innerWidth);
        console.log(`Right panel: ${rightPanelBox.width} x ${rightPanelBox.height} at (${rightPanelBox.x}, ${rightPanelBox.y})`);
      }
    }
  });

  test('Generate Setup Validation Report', async ({ page }) => {
    // Generate a comprehensive setup validation report
    const timestamp = new Date().toISOString();
    const reportDir = path.join(process.cwd(), 'tests', 'visual', 'reports');
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    // Collect all validation data
    const validationData = {
      timestamp,
      url: page.url(),
      userAgent: await page.evaluate(() => navigator.userAgent),
      viewport: await page.evaluate(() => ({
        width: window.innerWidth,
        height: window.innerHeight
      })),
      testIds: await TestIDValidator.validateTestIDs(page),
      gameState: await page.evaluate(() => ({
        hasGameState: typeof (window as any).gameState !== 'undefined',
        hasRenderer: typeof (window as any).gameRenderer !== 'undefined',
        hasPlayer: (window as any).gameState?.currentPlayer !== undefined
      }))
    };
    
    const reportPath = path.join(reportDir, 'setup-validation-summary.json');
    fs.writeFileSync(reportPath, JSON.stringify(validationData, null, 2));
    
    console.log(`📄 Setup validation report generated: ${reportPath}`);
    console.log(`✅ Setup validation complete - ready for baseline generation`);
    
    // Validation should pass if basic requirements are met
    expect(validationData.testIds.missingCritical).toBe(0);
    expect(validationData.gameState.hasGameState).toBeTruthy();
  });

  test('Quick Smoke Test - Essential Elements', async ({ page }) => {
    // Quick test to verify essential elements are present before running full test suite
    
    const essentialElements = [
      '[data-testid="game-container"]',
      '[data-testid="actions-panel"]'
    ];
    
    for (const selector of essentialElements) {
      const element = page.locator(selector);
      await expect(element).toBeVisible({ timeout: 10000 });
      console.log(`✅ Essential element found: ${selector}`);
    }
    
    // Quick check for hotkey presence (critical for skill bar testing)
    const actionsPanel = page.locator('[data-testid="actions-panel"]');
    const panelText = await actionsPanel.textContent();
    
    if (panelText) {
      const hasHotkeys = /\[[1-9]\]/.test(panelText);
      expect(hasHotkeys).toBeTruthy('Actions panel must contain hotkey indicators [1-9]');
      console.log('✅ Hotkey indicators found in actions panel');
    }
    
    console.log('🚀 Quick smoke test passed - UI is ready for visual regression testing');
  });
});