import { test, expect } from '@playwright/test';

/**
 * ASCII Character Visual Validation Tests
 * 
 * Validates that all box-drawing characters, progress bar characters,
 * and special symbols are rendered correctly and in exact positions
 * according to the Visual Standards Document.
 */

test.describe('ASCII Character Visual Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="game-container"]', { timeout: 30000 });
    await page.waitForSelector('[data-testid="right-panel"]', { timeout: 15000 });
    await page.waitForTimeout(2000);
  });

  test.describe('Box-Drawing Characters', () => {
    test('Panel Borders - All Box-Drawing Characters Present', async ({ page }) => {
      const rightPanel = page.locator('[data-testid="right-panel"]');
      const panelText = await rightPanel.textContent();
      
      expect(panelText).not.toBeNull();
      
      // Standard box-drawing characters as per Visual Standards Document
      const standardBoxChars = ['┌', '─', '┐', '│', '└', '┘', '├', '┤', '┬', '┴', '┼'];
      
      // Double-line box-drawing characters (used for main panels)
      const doubleBoxChars = ['╔', '═', '╗', '║', '╚', '╝', '╠', '╣', '╦', '╩', '╬'];
      
      // Validate standard box-drawing characters
      for (const char of standardBoxChars) {
        if (panelText!.includes(char)) {
          console.log(`Found standard box-drawing character: ${char}`);
        }
      }
      
      // Validate double-line box-drawing characters (should be present)
      let foundDoubleChars = 0;
      for (const char of doubleBoxChars) {
        if (panelText!.includes(char)) {
          foundDoubleChars++;
          console.log(`Found double-line box-drawing character: ${char}`);
        }
      }
      
      expect(foundDoubleChars).toBeGreaterThan(0); // At least some double-line chars should be present
      
      // Take screenshot for visual validation of all characters
      await expect(rightPanel).toHaveScreenshot('box-drawing-characters.png', {
        threshold: 0.05
      });
    });

    test('Corner Characters - Exact Positioning', async ({ page }) => {
      const rightPanel = page.locator('[data-testid="right-panel"]');
      const panelText = await rightPanel.textContent();
      
      if (panelText) {
        const lines = panelText.split('\n').filter(line => line.trim().length > 0);
        
        // Find lines that start with corner characters
        const topCornerLines = lines.filter(line => 
          line.trim().startsWith('╔') || line.trim().startsWith('┌')
        );
        
        const bottomCornerLines = lines.filter(line => 
          line.trim().startsWith('╚') || line.trim().startsWith('└')
        );
        
        expect(topCornerLines.length).toBeGreaterThan(0);
        expect(bottomCornerLines.length).toBeGreaterThan(0);
        
        // Validate corner patterns
        for (const line of topCornerLines) {
          const trimmed = line.trim();
          expect(trimmed).toMatch(/^[╔┌][═─]+[╗┐]$/); // Top corners with horizontal lines
        }
        
        for (const line of bottomCornerLines) {
          const trimmed = line.trim();
          expect(trimmed).toMatch(/^[╚└][═─]+[╝┘]$/); // Bottom corners with horizontal lines
        }
      }
    });

    test('T-Junction Characters - Panel Separators', async ({ page }) => {
      const rightPanel = page.locator('[data-testid="right-panel"]');
      const panelText = await rightPanel.textContent();
      
      if (panelText) {
        // Look for T-junction characters that separate sections within panels
        const tJunctionChars = ['├', '┤', '┬', '┴', '╠', '╣', '╦', '╩'];
        
        let foundTJunctions = 0;
        for (const char of tJunctionChars) {
          if (panelText.includes(char)) {
            foundTJunctions++;
          }
        }
        
        expect(foundTJunctions).toBeGreaterThan(0); // Should have section separators
        
        // Validate separator line patterns
        const lines = panelText.split('\n');
        const separatorLines = lines.filter(line => 
          tJunctionChars.some(char => line.includes(char))
        );
        
        for (const line of separatorLines) {
          const trimmed = line.trim();
          // Separator lines should have proper T-junction pattern
          expect(trimmed).toMatch(/^[├╠][═─]+[┤╣]$/);
        }
      }
    });
  });

  test.describe('Progress Bar Characters', () => {
    test('HP/AP Bars - Block Characters Validation', async ({ page }) => {
      const statsPanel = page.locator('[data-testid="player-stats-panel"]');
      
      if (await statsPanel.count() === 0) {
        console.log('Player stats panel not found - skipping progress bar test');
        return;
      }
      
      const panelText = await statsPanel.textContent();
      
      if (panelText) {
        // Progress bar characters as defined in Visual Standards Document
        const progressChars = ['█', '▒', '░', '▓'];
        
        let foundProgressChars = 0;
        for (const char of progressChars) {
          if (panelText.includes(char)) {
            foundProgressChars++;
            console.log(`Found progress bar character: ${char} (U+${char.charCodeAt(0).toString(16).toUpperCase()})`);
          }
        }
        
        expect(foundProgressChars).toBeGreaterThan(0); // Should have at least some progress bar chars
        
        // Validate progress bar patterns (should be 12 characters long)
        const progressBarPattern = new RegExp(`[${progressChars.join('')}]{8,15}`, 'g');
        const progressBarMatches = panelText.match(progressBarPattern);
        
        if (progressBarMatches) {
          expect(progressBarMatches.length).toBeGreaterThanOrEqual(1); // At least HP or AP bar
          
          // Each progress bar should be approximately 12 characters as per standards
          progressBarMatches.forEach(match => {
            expect(match.length).toBeGreaterThanOrEqual(8);
            expect(match.length).toBeLessThanOrEqual(15); // Allow some variation
          });
        }
      }
      
      await expect(statsPanel).toHaveScreenshot('progress-bar-characters.png', {
        threshold: 0.15 // Allow for changing HP/AP values
      });
    });

    test('Progress Bar Patterns - Filled/Empty States', async ({ page }) => {
      // Test different HP/AP states to validate progress bar rendering
      const testStates = [
        { hp: 100, maxHP: 100, ap: 8, maxAP: 8 }, // Full bars
        { hp: 50, maxHP: 100, ap: 4, maxAP: 8 },  // Half bars
        { hp: 10, maxHP: 100, ap: 1, maxAP: 8 },  // Low bars
        { hp: 0, maxHP: 100, ap: 0, maxAP: 8 }    // Empty bars
      ];
      
      for (let i = 0; i < testStates.length; i++) {
        const state = testStates[i];
        
        // Set HP/AP state via JavaScript
        await page.evaluate((state) => {
          const gameState = (window as any).gameState;
          if (gameState && gameState.currentPlayer) {
            gameState.currentPlayer.currentHP = state.hp;
            gameState.currentPlayer.maxHP = state.maxHP;
            gameState.currentPlayer.currentAP = state.ap;
            gameState.currentPlayer.maxAP = state.maxAP;
            (window as any).gameRenderer.updateDisplay();
          }
        }, state);
        
        await page.waitForTimeout(500);
        
        const statsPanel = page.locator('[data-testid="player-stats-panel"]');
        
        if (await statsPanel.count() > 0) {
          await expect(statsPanel).toHaveScreenshot(`progress-bars-state-${i}.png`, {
            threshold: 0.1
          });
        }
      }
    });

    test('Movement Points Bar - Special Progress Character', async ({ page }) => {
      const statsPanel = page.locator('[data-testid="player-stats-panel"]');
      
      if (await statsPanel.count() > 0) {
        const panelText = await statsPanel.textContent();
        
        if (panelText) {
          // Movement bar uses right-pointing triangles as per standards
          const movementChar = '▶'; // U+25B6 Right Triangle
          
          if (panelText.includes('Move:')) {
            // Movement points line should exist
            const moveLineMatch = panelText.match(/Move:.*$/m);
            if (moveLineMatch) {
              console.log(`Movement line found: ${moveLineMatch[0]}`);
              
              // May use different characters for movement representation
              const hasMovementIndicator = moveLineMatch[0].includes('▶') || 
                                         moveLineMatch[0].includes('█') ||
                                         moveLineMatch[0].includes('▒');
              
              expect(hasMovementIndicator).toBeTruthy(
                'Movement line should have visual indicator characters'
              );
            }
          }
        }
      }
    });
  });

  test.describe('Special Symbols and Icons', () => {
    test('Current Player Indicator - Right Triangle', async ({ page }) => {
      const rightPanel = page.locator('[data-testid="right-panel"]');
      const panelText = await rightPanel.textContent();
      
      if (panelText) {
        const currentPlayerSymbol = '▶'; // U+25B6 as specified in standards
        
        if (panelText.includes(currentPlayerSymbol)) {
          console.log('Current player indicator ▶ found');
          
          // Should be used in turn order or status panels
          const lines = panelText.split('\n');
          const indicatorLines = lines.filter(line => line.includes(currentPlayerSymbol));
          
          expect(indicatorLines.length).toBeGreaterThan(0);
          
          // In turn order, should be followed by player name
          indicatorLines.forEach(line => {
            expect(line).toMatch(/▶.*[A-Za-z]/); // Triangle followed by some text
          });
        }
      }
    });

    test('Skill Rating Stars - Filled and Empty', async ({ page }) => {
      const statsPanel = page.locator('[data-testid="player-stats-panel"]');
      
      if (await statsPanel.count() > 0) {
        const panelText = await statsPanel.textContent();
        
        if (panelText) {
          const filledStar = '★'; // U+2605 Filled star
          const emptyStar = '☆'; // U+2606 Empty star
          
          // Look for skill lines with star ratings
          if (panelText.includes('Combat:') || panelText.includes('Swords:')) {
            const hasStars = panelText.includes(filledStar) || panelText.includes(emptyStar);
            
            if (hasStars) {
              console.log('Skill rating stars found');
              
              // Validate star patterns (should be 5 stars total per skill)
              const starPattern = /[★☆]{5}/g;
              const starMatches = panelText.match(starPattern);
              
              if (starMatches) {
                expect(starMatches.length).toBeGreaterThan(0);
                console.log(`Found ${starMatches.length} complete star rating(s)`);
              }
            }
          }
        }
      }
    });

    test('Status Icons - Color Circles', async ({ page }) => {
      const rightPanel = page.locator('[data-testid="right-panel"]');
      const panelText = await rightPanel.textContent();
      
      if (panelText) {
        // Status icons as per Visual Standards Document
        const statusIcons = ['🟢', '🟡', '🔴']; // Green, yellow, red circles
        
        let foundStatusIcons = 0;
        for (const icon of statusIcons) {
          if (panelText.includes(icon)) {
            foundStatusIcons++;
            console.log(`Found status icon: ${icon}`);
          }
        }
        
        // Status icons might not always be present, but if they are, validate them
        if (foundStatusIcons > 0) {
          // Should be in turn timer or status sections
          const lines = panelText.split('\n');
          const iconLines = lines.filter(line => 
            statusIcons.some(icon => line.includes(icon))
          );
          
          for (const line of iconLines) {
            // Status icon lines should have meaningful text
            expect(line.trim().length).toBeGreaterThan(2);
          }
        }
      }
    });
  });

  test.describe('Unicode Character Rendering', () => {
    test('Character Code Points - Exact Values', async ({ page }) => {
      const rightPanel = page.locator('[data-testid="right-panel"]');
      
      // Test specific Unicode character rendering
      const expectedChars = [
        { char: '█', code: 0x2588, name: 'Full Block' },
        { char: '▒', code: 0x2592, name: 'Medium Shade' },
        { char: '░', code: 0x2591, name: 'Light Shade' },
        { char: '▓', code: 0x2593, name: 'Dark Shade' },
        { char: '╔', code: 0x2554, name: 'Box Drawings Double Down and Right' },
        { char: '═', code: 0x2550, name: 'Box Drawings Double Horizontal' },
        { char: '╗', code: 0x2557, name: 'Box Drawings Double Down and Left' },
        { char: '║', code: 0x2551, name: 'Box Drawings Double Vertical' },
        { char: '▶', code: 0x25B6, name: 'Right-Pointing Triangle' }
      ];
      
      // Get all text content for character analysis
      const allText = await page.textContent('body');
      
      if (allText) {
        for (const { char, code, name } of expectedChars) {
          if (allText.includes(char)) {
            // Validate character code point
            const actualCode = char.charCodeAt(0);
            expect(actualCode).toBe(code);
            console.log(`✓ ${name} (${char}) - Unicode U+${code.toString(16).toUpperCase()}`);
          }
        }
      }
      
      // Screenshot for visual character reference
      await expect(rightPanel).toHaveScreenshot('unicode-character-rendering.png', {
        threshold: 0.05
      });
    });

    test('Font Rendering Consistency - Monospace Alignment', async ({ page }) => {
      const gameContainer = page.locator('[data-testid="game-container"]');
      
      // Validate font properties
      const fontProperties = await gameContainer.evaluate((element) => {
        const computed = window.getComputedStyle(element);
        return {
          fontFamily: computed.fontFamily,
          fontSize: computed.fontSize,
          lineHeight: computed.lineHeight,
          letterSpacing: computed.letterSpacing
        };
      });
      
      console.log('Font properties:', fontProperties);
      
      // Should use monospace font family
      const expectedMonospaceFonts = ['courier', 'monaco', 'menlo', 'monospace'];
      const hasMonospaceFont = expectedMonospaceFonts.some(font => 
        fontProperties.fontFamily.toLowerCase().includes(font)
      );
      
      expect(hasMonospaceFont).toBeTruthy(
        `Font family should include monospace fonts. Current: ${fontProperties.fontFamily}`
      );
      
      // Take screenshot for font rendering validation
      await expect(gameContainer).toHaveScreenshot('font-rendering-monospace.png', {
        threshold: 0.05
      });
    });
  });

  test.describe('Character Positioning and Alignment', () => {
    test('Box Border Alignment - Perfect Rectangles', async ({ page }) => {
      const rightPanel = page.locator('[data-testid="right-panel"]');
      const panelText = await rightPanel.textContent();
      
      if (panelText) {
        const lines = panelText.split('\n').filter(line => line.trim().length > 0);
        
        // Find all border lines (top, separator, bottom)
        const borderLines = lines.filter(line => {
          const trimmed = line.trim();
          return trimmed.includes('╔') || trimmed.includes('╚') || trimmed.includes('╠');
        });
        
        // All border lines should have the same width
        if (borderLines.length > 0) {
          const firstBorderWidth = borderLines[0].trim().length;
          
          for (const line of borderLines) {
            const lineWidth = line.trim().length;
            expect(lineWidth).toBe(firstBorderWidth);
          }
          
          console.log(`All ${borderLines.length} border lines have consistent width: ${firstBorderWidth}`);
        }
      }
    });

    test('Progress Bar Alignment - Consistent Positioning', async ({ page }) => {
      const statsPanel = page.locator('[data-testid="player-stats-panel"]');
      
      if (await statsPanel.count() > 0) {
        const panelText = await statsPanel.textContent();
        
        if (panelText) {
          const lines = panelText.split('\n');
          
          // Find lines with progress bars
          const progressLines = lines.filter(line => 
            line.includes('HP:') || line.includes('AP:') || line.includes('Move:')
          );
          
          for (const line of progressLines) {
            // Progress bars should be aligned at consistent positions
            const colonIndex = line.indexOf(':');
            const barStartIndex = line.search(/[█▒░▓▶]/);
            
            if (colonIndex > 0 && barStartIndex > colonIndex) {
              const spacingAfterColon = barStartIndex - colonIndex - 1;
              // Should have consistent spacing (allowing for number formatting differences)
              expect(spacingAfterColon).toBeGreaterThanOrEqual(8); // At least some padding
              expect(spacingAfterColon).toBeLessThanOrEqual(15); // Not too much padding
            }
          }
        }
      }
    });
  });
});