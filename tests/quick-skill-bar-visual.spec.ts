import { test, expect } from '@playwright/test';

/**
 * CRITICAL: Quick Skill Bar Visual Regression Tests
 * 
 * This is the MOST IMPORTANT visual test suite as the quick skill bar
 * (1-9 hotkeys) is the signature feature of the ASCII roguelike.
 * 
 * The layout, positioning, and format of this component must NEVER change
 * without explicit approval and standards document updates.
 */

test.describe('Quick Skill Bar - Critical Layout Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for game initialization
    await page.waitForSelector('[data-testid="game-container"]', { timeout: 30000 });
    await page.waitForSelector('[data-testid="right-panel"]', { timeout: 15000 });
    
    // Wait for UI to fully stabilize
    await page.waitForTimeout(2000);
  });

  test('Quick Skill Bar - Pixel Perfect Layout Validation', async ({ page }) => {
    const actionsPanel = page.locator('[data-testid="actions-panel"]');
    
    // Ensure the actions panel is visible and fully rendered
    await expect(actionsPanel).toBeVisible();
    
    // Take screenshot with very strict threshold - layout must be pixel-perfect
    await expect(actionsPanel).toHaveScreenshot('quick-skill-bar-exact.png', {
      threshold: 0.05, // Only 5% pixel difference allowed - extremely strict
      animations: 'disabled'
    });
  });

  test('Hotkey Numbers [1-9] - Exact Positioning', async ({ page }) => {
    const actionsPanel = page.locator('[data-testid="actions-panel"]');
    
    // Validate each hotkey number is in the exact expected position
    const hotkeyNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    
    for (const number of hotkeyNumbers) {
      const hotkeyElement = actionsPanel.locator(`text=/\\[${number}\\]/`);
      await expect(hotkeyElement).toBeVisible();
      
      // Take individual screenshot of each hotkey line for precise validation
      const hotkeyLine = actionsPanel.locator(`text=/\\[${number}\\].*$/`);
      if (await hotkeyLine.count() > 0) {
        await expect(hotkeyLine).toHaveScreenshot(`hotkey-${number}-line.png`, {
          threshold: 0.1
        });
      }
    }
  });

  test('AP Cost Format - (XAP) and ---- Display', async ({ page }) => {
    const actionsPanel = page.locator('[data-testid="actions-panel"]');
    const panelText = await actionsPanel.textContent();
    
    if (panelText) {
      // Validate AP cost formats are exactly as specified
      const apCostMatches = panelText.match(/(\(\d+AP\)|----)/g);
      
      expect(apCostMatches).not.toBeNull();
      expect(apCostMatches!.length).toBeGreaterThanOrEqual(9); // Should have 9 slots
      
      // Each match should be exactly in format (XAP) or ----
      apCostMatches!.forEach(match => {
        expect(match).toMatch(/^(\(\d+AP\)|----)$/);
      });
    }
    
    // Screenshot the AP cost section specifically
    await expect(actionsPanel).toHaveScreenshot('ap-costs-format.png', {
      threshold: 0.15, // Allow for changing AP cost numbers but not format
    });
  });

  test('Skill Bar Borders - Box Drawing Characters', async ({ page }) => {
    const actionsPanel = page.locator('[data-testid="actions-panel"]');
    const panelText = await actionsPanel.textContent();
    
    if (panelText) {
      // Validate all required box-drawing characters are present
      const requiredBorderChars = ['╔', '═', '╗', '║', '╚', '╝', '╠', '╣'];
      
      for (const char of requiredBorderChars) {
        expect(panelText.includes(char)).toBeTruthy(
          `Required border character '${char}' not found in actions panel`
        );
      }
      
      // Validate panel structure
      const lines = panelText.split('\n').filter(line => line.trim().length > 0);
      
      // First line should be top border
      expect(lines[0].trim()).toMatch(/^╔═+╗$/);
      
      // Second line should be header with side borders
      expect(lines[1]).toMatch(/║.*ACTIONS.*║/);
      
      // Should have separator line
      const hasSeparator = lines.some(line => line.includes('╠') && line.includes('╣'));
      expect(hasSeparator).toBeTruthy('Actions panel should have separator line');
      
      // Last line should be bottom border
      const lastLine = lines[lines.length - 1].trim();
      expect(lastLine).toMatch(/^╚═+╝$/);
    }
  });

  test('23 Character Width - Exact Panel Dimensions', async ({ page }) => {
    const actionsPanel = page.locator('[data-testid="actions-panel"]');
    const panelText = await actionsPanel.textContent();
    
    if (panelText) {
      const lines = panelText.split('\n');
      
      // Check border lines are exactly 23 characters
      const borderLines = lines.filter(line => 
        line.includes('╔') || line.includes('╚') || line.includes('╠')
      );
      
      for (const line of borderLines) {
        const trimmedLine = line.trim();
        expect(trimmedLine.length).toBe(23); // Exactly 23 characters as specified
      }
      
      // Check content lines fit within borders (21 chars + 2 border chars)
      const contentLines = lines.filter(line => 
        line.includes('[') && line.includes(']') && line.includes('AP')
      );
      
      for (const line of contentLines) {
        const trimmedLine = line.trim();
        expect(trimmedLine.length).toBeLessThanOrEqual(23);
      }
    }
  });

  test('Skill Name Truncation - 15 Character Limit', async ({ page }) => {
    // Inject long skill names to test truncation
    await page.evaluate(() => {
      const gameState = (window as any).gameState;
      if (gameState && gameState.currentPlayer) {
        gameState.currentPlayer.skills = [
          { name: 'SuperLongSkillNameThatShouldBeTruncated', apCost: 2 },
          { name: 'AnotherVeryLongSkillName', apCost: 3 },
          { name: 'Short', apCost: 1 },
          { name: 'ExtremelyLongSkillNameForTesting', apCost: 4 }
        ];
        (window as any).gameRenderer.updateDisplay();
      }
    });
    
    await page.waitForTimeout(1000);
    
    const actionsPanel = page.locator('[data-testid="actions-panel"]');
    const panelText = await actionsPanel.textContent();
    
    if (panelText) {
      // Look for skill names in hotkey lines
      const hotkeyLines = panelText.split('\n').filter(line => 
        line.includes('[') && line.includes(']') && !line.includes('ACTIONS')
      );
      
      for (const line of hotkeyLines) {
        // Extract skill name (between ] and (
        const skillNameMatch = line.match(/\]\s*([^(]+)\s*\(/);
        if (skillNameMatch) {
          const skillName = skillNameMatch[1].trim();
          
          // Should be 15 characters or less, with ... if truncated
          if (skillName.includes('...')) {
            expect(skillName.length).toBeLessThanOrEqual(18); // 15 chars + "..."
          } else {
            expect(skillName.length).toBeLessThanOrEqual(15);
          }
        }
      }
    }
    
    await expect(actionsPanel).toHaveScreenshot('skill-name-truncation.png', {
      threshold: 0.1
    });
  });

  test('Empty Slots - Dash Display Format', async ({ page }) => {
    // Clear some skills to test empty slot display
    await page.evaluate(() => {
      const gameState = (window as any).gameState;
      if (gameState && gameState.currentPlayer) {
        gameState.currentPlayer.skills = [
          { name: 'Move', apCost: 1 },
          { name: 'Attack', apCost: 0 }
          // Slots 3-9 should be empty
        ];
        (window as any).gameRenderer.updateDisplay();
      }
    });
    
    await page.waitForTimeout(500);
    
    const actionsPanel = page.locator('[data-testid="actions-panel"]');
    const panelText = await actionsPanel.textContent();
    
    if (panelText) {
      // Should have "----------   ----" for empty slots
      const emptySlotPattern = /\[([789])\]\s*-+\s*----/;
      const emptySlotMatches = panelText.match(new RegExp(emptySlotPattern, 'g'));
      
      expect(emptySlotMatches).not.toBeNull();
      expect(emptySlotMatches!.length).toBeGreaterThanOrEqual(1);
    }
    
    await expect(actionsPanel).toHaveScreenshot('empty-slots-display.png', {
      threshold: 0.1
    });
  });

  test('Insufficient AP - Grayed Out Skills', async ({ page }) => {
    // Set very low AP to test grayed out state
    await page.evaluate(() => {
      const gameState = (window as any).gameState;
      if (gameState && gameState.currentPlayer) {
        gameState.currentPlayer.currentAP = 0; // No AP available
        gameState.currentPlayer.skills = [
          { name: 'Move', apCost: 1 },
          { name: 'Power Strike', apCost: 3 },
          { name: 'Fireball', apCost: 2 }
        ];
        (window as any).gameRenderer.updateDisplay();
      }
    });
    
    await page.waitForTimeout(500);
    
    const actionsPanel = page.locator('[data-testid="actions-panel"]');
    const panelText = await actionsPanel.textContent();
    
    if (panelText) {
      // With 0 AP, skills requiring AP should show ---- instead of AP cost
      expect(panelText.includes('----')).toBeTruthy(
        'Skills with insufficient AP should display ---- instead of AP cost'
      );
    }
    
    await expect(actionsPanel).toHaveScreenshot('insufficient-ap-grayed.png', {
      threshold: 0.1
    });
  });

  test('Additional Actions - MADHR Keys Layout', async ({ page }) => {
    const actionsPanel = page.locator('[data-testid="actions-panel"]');
    const panelText = await actionsPanel.textContent();
    
    if (panelText) {
      // Validate additional action keys are present
      const additionalKeys = ['[M]', '[A]', '[D]', '[H]', '[R]'];
      
      for (const key of additionalKeys) {
        expect(panelText.includes(key)).toBeTruthy(
          `Additional action key '${key}' not found in panel`
        );
      }
      
      // These should be below the main 1-9 hotkeys, separated by a border line
      const lines = panelText.split('\n');
      const separatorIndex = lines.findIndex(line => line.includes('╠') && line.includes('╣'));
      const additionalActionsStartIndex = separatorIndex + 1;
      
      if (separatorIndex > 0 && additionalActionsStartIndex < lines.length) {
        const additionalSection = lines.slice(additionalActionsStartIndex).join('\n');
        
        for (const key of additionalKeys) {
          expect(additionalSection.includes(key)).toBeTruthy(
            `Additional action key '${key}' not found in additional actions section`
          );
        }
      }
    }
    
    await expect(actionsPanel).toHaveScreenshot('additional-actions-madhr.png', {
      threshold: 0.1
    });
  });

  test('Full Skill Bar - All 9 Slots Populated', async ({ page }) => {
    // Fill all 9 skill slots
    await page.evaluate(() => {
      const gameState = (window as any).gameState;
      if (gameState && gameState.currentPlayer) {
        gameState.currentPlayer.currentAP = 10; // Enough AP for all skills
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
        (window as any).gameRenderer.updateDisplay();
      }
    });
    
    await page.waitForTimeout(500);
    
    const actionsPanel = page.locator('[data-testid="actions-panel"]');
    
    // Validate all 9 slots have skills
    for (let i = 1; i <= 9; i++) {
      const hotkeyElement = actionsPanel.locator(`text=/\\[${i}\\]/`);
      await expect(hotkeyElement).toBeVisible();
    }
    
    const panelText = await actionsPanel.textContent();
    if (panelText) {
      // Should not have any "----------   ----" empty slot indicators
      expect(panelText.includes('----------')).toBeFalsy(
        'All slots should be filled, no empty slot indicators should be present'
      );
    }
    
    await expect(actionsPanel).toHaveScreenshot('full-skill-bar-all-9.png', {
      threshold: 0.1
    });
  });
});

test.describe('Quick Skill Bar - Cross Browser Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="game-container"]', { timeout: 30000 });
    await page.waitForSelector('[data-testid="actions-panel"]', { timeout: 15000 });
    await page.waitForTimeout(1500);
  });

  test('Chrome - Quick Skill Bar Reference', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chrome reference test');
    
    const actionsPanel = page.locator('[data-testid="actions-panel"]');
    
    await expect(actionsPanel).toHaveScreenshot('quick-skill-bar-chrome-ref.png', {
      threshold: 0.05
    });
  });

  test('Firefox - Layout Consistency Check', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'Firefox-specific test');
    
    const actionsPanel = page.locator('[data-testid="actions-panel"]');
    
    // Firefox should render identically to Chrome
    await expect(actionsPanel).toHaveScreenshot('quick-skill-bar-firefox-check.png', {
      threshold: 0.1 // Slightly more lenient for Firefox rendering differences
    });
  });

  test('Safari/Webkit - Font Rendering Validation', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'Safari/Webkit-specific test');
    
    const actionsPanel = page.locator('[data-testid="actions-panel"]');
    
    // Safari may have different font rendering, but layout should be consistent
    await expect(actionsPanel).toHaveScreenshot('quick-skill-bar-safari-check.png', {
      threshold: 0.15 // More lenient for Safari font rendering differences
    });
  });
});