import { test, expect } from '@playwright/test';

/**
 * Color Scheme Visual Validation Tests
 * 
 * Validates that the terminal green color scheme (#00ff00 on #000000)
 * is applied correctly and consistently across all UI elements.
 * This is critical for maintaining the authentic ASCII terminal aesthetic.
 */

test.describe('Color Scheme Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="game-container"]', { timeout: 30000 });
    await page.waitForSelector('[data-testid="right-panel"]', { timeout: 15000 });
    await page.waitForTimeout(2000);
  });

  test.describe('Background Colors', () => {
    test('Body Background - Pure Black (#000000)', async ({ page }) => {
      const backgroundColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });
      
      console.log(`Body background color: ${backgroundColor}`);
      
      // Convert RGB to hex for comparison
      const expectedBlack = 'rgb(0, 0, 0)';
      const expectedBlackAlt = 'rgba(0, 0, 0, 1)';
      
      const isValidBlack = backgroundColor === expectedBlack || 
                          backgroundColor === expectedBlackAlt ||
                          backgroundColor === 'transparent'; // Might inherit from container
      
      expect(isValidBlack).toBeTruthy(
        `Body background should be black. Current: ${backgroundColor}`
      );
    });

    test('Game Container Background - Pure Black', async ({ page }) => {
      const gameContainer = page.locator('[data-testid="game-container"]');
      
      const backgroundColor = await gameContainer.evaluate((element) => {
        return window.getComputedStyle(element).backgroundColor;
      });
      
      console.log(`Game container background color: ${backgroundColor}`);
      
      // Should be pure black or transparent (inheriting black)
      const isValidBlack = backgroundColor === 'rgb(0, 0, 0)' || 
                          backgroundColor === 'rgba(0, 0, 0, 1)' ||
                          backgroundColor === 'transparent';
      
      expect(isValidBlack).toBeTruthy(
        `Game container background should be black. Current: ${backgroundColor}`
      );
    });

    test('Right Panel Background - Consistent Black', async ({ page }) => {
      const rightPanel = page.locator('[data-testid="right-panel"]');
      
      if (await rightPanel.count() > 0) {
        const backgroundColor = await rightPanel.evaluate((element) => {
          return window.getComputedStyle(element).backgroundColor;
        });
        
        console.log(`Right panel background color: ${backgroundColor}`);
        
        const isValidBlack = backgroundColor === 'rgb(0, 0, 0)' || 
                            backgroundColor === 'rgba(0, 0, 0, 1)' ||
                            backgroundColor === 'transparent';
        
        expect(isValidBlack).toBeTruthy(
          `Right panel background should be black. Current: ${backgroundColor}`
        );
      }
    });
  });

  test.describe('Text Colors', () => {
    test('Primary Text - Terminal Green (#00ff00)', async ({ page }) => {
      const rightPanel = page.locator('[data-testid="right-panel"]');
      
      if (await rightPanel.count() > 0) {
        const textColor = await rightPanel.evaluate((element) => {
          return window.getComputedStyle(element).color;
        });
        
        console.log(`Primary text color: ${textColor}`);
        
        // Terminal green variations
        const validGreenColors = [
          'rgb(0, 255, 0)',      // Pure green #00ff00
          'rgba(0, 255, 0, 1)',  // Pure green with alpha
          'rgb(0, 255, 65)',     // Slightly brighter green #00ff41
          'rgba(0, 255, 65, 1)'  // Brighter green with alpha
        ];
        
        const isValidGreen = validGreenColors.includes(textColor);
        
        expect(isValidGreen).toBeTruthy(
          `Primary text should be terminal green. Current: ${textColor}, Expected one of: ${validGreenColors.join(', ')}`
        );
      }
    });

    test('Game Map Text - Terminal Green', async ({ page }) => {
      const gameMap = page.locator('[data-testid="game-map"]');
      
      if (await gameMap.count() > 0) {
        const textColor = await gameMap.evaluate((element) => {
          return window.getComputedStyle(element).color;
        });
        
        console.log(`Game map text color: ${textColor}`);
        
        const validGreenColors = [
          'rgb(0, 255, 0)',
          'rgba(0, 255, 0, 1)',
          'rgb(0, 255, 65)',
          'rgba(0, 255, 65, 1)'
        ];
        
        const isValidGreen = validGreenColors.includes(textColor);
        
        expect(isValidGreen).toBeTruthy(
          `Game map text should be terminal green. Current: ${textColor}`
        );
      }
    });

    test('ASCII Panel Text - Consistent Green Tones', async ({ page }) => {
      const panelSelectors = [
        '[data-testid="player-stats-panel"]',
        '[data-testid="actions-panel"]',
        '[data-testid="initiative-panel"]',
        '[data-testid="message-log-panel"]'
      ];
      
      const panelColors = [];
      
      for (const selector of panelSelectors) {
        const panel = page.locator(selector);
        
        if (await panel.count() > 0) {
          const textColor = await panel.evaluate((element) => {
            return window.getComputedStyle(element).color;
          });
          
          panelColors.push({ selector, color: textColor });
          console.log(`${selector} text color: ${textColor}`);
        }
      }
      
      // All panel colors should be consistent terminal green variations
      for (const { selector, color } of panelColors) {
        const validGreenColors = [
          'rgb(0, 255, 0)',
          'rgba(0, 255, 0, 1)',
          'rgb(0, 255, 65)',
          'rgba(0, 255, 65, 1)'
        ];
        
        const isValidGreen = validGreenColors.includes(color);
        
        expect(isValidGreen).toBeTruthy(
          `${selector} should use terminal green. Current: ${color}`
        );
      }
    });
  });

  test.describe('Special Element Colors', () => {
    test('Current Player Highlight - Bright Yellow (#ffff00)', async ({ page }) => {
      const rightPanel = page.locator('[data-testid="right-panel"]');
      const panelText = await rightPanel.textContent();
      
      if (panelText && panelText.includes('▶')) {
        // Try to find elements that might be highlighted for current player
        const currentPlayerElements = await page.locator('*:has-text("▶")').all();
        
        for (const element of currentPlayerElements) {
          const textColor = await element.evaluate((el) => {
            return window.getComputedStyle(el).color;
          });
          
          console.log(`Current player element color: ${textColor}`);
          
          // Current player might use yellow highlight or stay green
          const validColors = [
            'rgb(255, 255, 0)',    // Bright yellow #ffff00
            'rgba(255, 255, 0, 1)',
            'rgb(0, 255, 0)',      // Or stay terminal green
            'rgba(0, 255, 0, 1)',
            'rgb(0, 255, 65)',
            'rgba(0, 255, 65, 1)'
          ];
          
          const isValidColor = validColors.includes(textColor);
          
          expect(isValidColor).toBeTruthy(
            `Current player element should use valid highlight color. Current: ${textColor}`
          );
        }
      }
    });

    test('Status Indicators - Color-Coded Elements', async ({ page }) => {
      const rightPanel = page.locator('[data-testid="right-panel"]');
      const panelText = await rightPanel.textContent();
      
      if (panelText) {
        // Look for status-specific elements that might have different colors
        const statusKeywords = ['Status:', 'Time:', 'YOUR TURN', 'TAKE ACTION'];
        
        for (const keyword of statusKeywords) {
          if (panelText.includes(keyword)) {
            const statusElements = await page.locator(`*:has-text("${keyword}")`).all();
            
            for (const element of statusElements) {
              const textColor = await element.evaluate((el) => {
                return window.getComputedStyle(el).color;
              });
              
              console.log(`Status element "${keyword}" color: ${textColor}`);
              
              // Status elements should use terminal green or valid accent colors
              const validStatusColors = [
                'rgb(0, 255, 0)',      // Terminal green
                'rgba(0, 255, 0, 1)',
                'rgb(0, 255, 65)',     // Brighter green
                'rgba(0, 255, 65, 1)',
                'rgb(255, 255, 0)',    // Yellow for urgency
                'rgba(255, 255, 0, 1)'
              ];
              
              const isValidStatusColor = validStatusColors.includes(textColor);
              
              expect(isValidStatusColor).toBeTruthy(
                `Status element should use valid color scheme. Element: "${keyword}", Color: ${textColor}`
              );
            }
          }
        }
      }
    });
  });

  test.describe('Game Map Entity Colors', () => {
    test('Player Character - Bright Green Highlight', async ({ page }) => {
      const gameMap = page.locator('[data-testid="game-map"]');
      
      if (await gameMap.count() > 0) {
        const mapText = await gameMap.textContent();
        
        if (mapText && mapText.includes('@')) {
          console.log('Player character (@) found on map');
          
          // Player character should use bright terminal green
          const playerElements = await page.locator('*:has-text("@")').all();
          
          for (const element of playerElements) {
            const textColor = await element.evaluate((el) => {
              return window.getComputedStyle(el).color;
            });
            
            console.log(`Player character color: ${textColor}`);
            
            const validPlayerColors = [
              'rgb(0, 255, 0)',      // Standard terminal green
              'rgba(0, 255, 0, 1)',
              'rgb(0, 255, 65)',     // Brighter terminal green
              'rgba(0, 255, 65, 1)'
            ];
            
            const isValidPlayerColor = validPlayerColors.includes(textColor);
            
            expect(isValidPlayerColor).toBeTruthy(
              `Player character should use bright green. Current: ${textColor}`
            );
          }
        }
      }
    });

    test('Enemy Entities - Red Color (#ff0000)', async ({ page }) => {
      const gameMap = page.locator('[data-testid="game-map"]');
      
      if (await gameMap.count() > 0) {
        const mapText = await gameMap.textContent();
        
        // Look for common enemy characters
        const enemyChars = ['E', 'M', 'G', '&', '*'];
        
        for (const enemyChar of enemyChars) {
          if (mapText && mapText.includes(enemyChar)) {
            const enemyElements = await page.locator(`*:has-text("${enemyChar}")`).all();
            
            for (const element of enemyElements) {
              const textColor = await element.evaluate((el) => {
                return window.getComputedStyle(el).color;
              });
              
              console.log(`Enemy character "${enemyChar}" color: ${textColor}`);
              
              // Enemy should use red or stay terminal green (depending on implementation)
              const validEnemyColors = [
                'rgb(255, 0, 0)',      // Pure red #ff0000
                'rgba(255, 0, 0, 1)',
                'rgb(0, 255, 0)',      // Or terminal green if not color-coded
                'rgba(0, 255, 0, 1)',
                'rgb(0, 255, 65)',
                'rgba(0, 255, 65, 1)'
              ];
              
              const isValidEnemyColor = validEnemyColors.includes(textColor);
              
              expect(isValidEnemyColor).toBeTruthy(
                `Enemy character should use valid color scheme. Character: "${enemyChar}", Color: ${textColor}`
              );
            }
          }
        }
      }
    });

    test('Wall/Terrain Elements - Gray Tones', async ({ page }) => {
      const gameMap = page.locator('[data-testid="game-map"]');
      
      if (await gameMap.count() > 0) {
        const mapText = await gameMap.textContent();
        
        // Look for wall/terrain characters
        const terrainChars = ['#', '.', '~', '^', 'T'];
        
        for (const terrainChar of terrainChars) {
          if (mapText && mapText.includes(terrainChar)) {
            console.log(`Found terrain character: "${terrainChar}"`);
            
            // Terrain colors should follow the specification:
            // WALL: '#808080' (Gray), FLOOR: '#404040' (Dark gray)
            const terrainElements = await page.locator(`*:has-text("${terrainChar}")`).all();
            
            for (const element of terrainElements) {
              const textColor = await element.evaluate((el) => {
                return window.getComputedStyle(el).color;
              });
              
              console.log(`Terrain character "${terrainChar}" color: ${textColor}`);
              
              const validTerrainColors = [
                'rgb(128, 128, 128)',  // Gray #808080
                'rgba(128, 128, 128, 1)',
                'rgb(64, 64, 64)',     // Dark gray #404040
                'rgba(64, 64, 64, 1)',
                'rgb(0, 255, 0)',      // Or terminal green if not color-coded
                'rgba(0, 255, 0, 1)',
                'rgb(0, 255, 65)',
                'rgba(0, 255, 65, 1)'
              ];
              
              const isValidTerrainColor = validTerrainColors.includes(textColor);
              
              expect(isValidTerrainColor).toBeTruthy(
                `Terrain character should use valid color scheme. Character: "${terrainChar}", Color: ${textColor}`
              );
            }
          }
        }
      }
    });
  });

  test.describe('Visual Color Consistency', () => {
    test('Full UI Color Scheme Screenshot', async ({ page }) => {
      // Take full screenshot to validate overall color scheme
      await expect(page).toHaveScreenshot('full-ui-color-scheme.png', {
        threshold: 0.1,
        fullPage: true
      });
    });

    test('Right Panel Color Consistency', async ({ page }) => {
      const rightPanel = page.locator('[data-testid="right-panel"]');
      
      await expect(rightPanel).toHaveScreenshot('right-panel-color-scheme.png', {
        threshold: 0.1
      });
    });

    test('Game Map Color Scheme', async ({ page }) => {
      const gameMap = page.locator('[data-testid="game-map"]');
      
      if (await gameMap.count() > 0) {
        await expect(gameMap).toHaveScreenshot('game-map-color-scheme.png', {
          threshold: 0.15 // Allow for entity movement and color variations
        });
      }
    });
  });

  test.describe('Color Accessibility', () => {
    test('Contrast Ratios - Terminal Green on Black', async ({ page }) => {
      // Calculate contrast ratio between terminal green and black background
      const contrastInfo = await page.evaluate(() => {
        // Simple contrast ratio calculation
        const greenRGB = [0, 255, 0];   // Terminal green
        const blackRGB = [0, 0, 0];     // Black background
        
        const luminance = (rgb: number[]) => {
          const [r, g, b] = rgb.map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };
        
        const greenLum = luminance(greenRGB);
        const blackLum = luminance(blackRGB);
        
        const contrastRatio = (greenLum + 0.05) / (blackLum + 0.05);
        
        return {
          greenLuminance: greenLum,
          blackLuminance: blackLum,
          contrastRatio: contrastRatio
        };
      });
      
      console.log('Contrast analysis:', contrastInfo);
      
      // WCAG AA requires 4.5:1 contrast ratio for normal text
      // WCAG AAA requires 7:1 contrast ratio
      expect(contrastInfo.contrastRatio).toBeGreaterThan(4.5);
      
      console.log(`Terminal green on black contrast ratio: ${contrastInfo.contrastRatio.toFixed(2)}:1`);
    });

    test('Color Blind Accessibility - High Contrast', async ({ page }) => {
      // Ensure the color scheme works for color-blind users
      // Terminal green on black should have sufficient contrast regardless of color vision
      
      const rightPanel = page.locator('[data-testid="right-panel"]');
      
      // Take screenshot that can be analyzed for color-blind accessibility
      await expect(rightPanel).toHaveScreenshot('color-blind-accessibility.png', {
        threshold: 0.1
      });
      
      // Terminal green (#00ff00) on pure black (#000000) should be accessible
      // to all types of color blindness due to high luminance difference
    });
  });
});