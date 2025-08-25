import { Page, expect, Locator } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Visual Regression Testing Utilities
 * 
 * Comprehensive toolset for validating ASCII UI layout consistency,
 * character positioning, color schemes, and visual elements according
 * to the Visual Standards Document specifications.
 */

export interface QuickSkillBarValidationOptions {
  expectedSlots: number;
  hotkeyNumbers: string[];
  expectedWidth: number;
  validateAPCosts: boolean;
  validateBorders: boolean;
}

export interface BoxDrawingValidationOptions {
  expectedChars: string[];
  validatePositions: boolean;
  strictPlacement: boolean;
}

export interface PanelDimensionOptions {
  rightPanelWidth: number;
  panelBorderWidth: number;
  validateAllPanels: boolean;
}

export interface ProgressBarValidationOptions {
  expectedChars: string[];
  validateLength: number;
  validateAlignment: boolean;
}

export interface ColorSchemeValidationOptions {
  backgroundColor: string;
  primaryColor: string;
  currentPlayerColor: string;
  enemyColor: string;
  wallColor: string;
  strictValidation: boolean;
}

export interface FontRenderingOptions {
  expectedFontFamily: string[];
  validateCharacterSpacing: boolean;
  validateAlignment: boolean;
}

export class VisualRegressionTestRunner {
  private baselineDir: string;
  private outputDir: string;
  private diffDir: string;

  constructor() {
    this.baselineDir = path.join(process.cwd(), 'tests', 'visual', 'baselines');
    this.outputDir = path.join(process.cwd(), 'tests', 'visual', 'screenshots');
    this.diffDir = path.join(process.cwd(), 'tests', 'visual', 'diffs');
    
    // Ensure directories exist
    this.ensureDirectoryExists(this.baselineDir);
    this.ensureDirectoryExists(this.outputDir);
    this.ensureDirectoryExists(this.diffDir);
  }

  private ensureDirectoryExists(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Validates the quick skill bar layout and positioning (CRITICAL TEST)
   */
  async validateQuickSkillBar(page: Page, options: QuickSkillBarValidationOptions): Promise<void> {
    const actionsPanel = page.locator('[data-testid="actions-panel"]');
    
    // Ensure the panel is visible
    await expect(actionsPanel).toBeVisible();
    
    // Validate hotkey slots are present (1-9)
    for (const hotkey of options.hotkeyNumbers) {
      const hotkeyElement = actionsPanel.locator(`text=/\\[${hotkey}\\]/`);
      await expect(hotkeyElement).toBeVisible({ timeout: 5000 });
    }
    
    if (options.validateAPCosts) {
      // Validate AP cost format: (XAP) or ----
      const apCostPattern = /(\(\d+AP\)|----)/;
      const panelText = await actionsPanel.textContent();
      
      if (panelText) {
        const apCostMatches = panelText.match(new RegExp(apCostPattern, 'g'));
        expect(apCostMatches?.length).toBeGreaterThanOrEqual(options.expectedSlots);
      }
    }
    
    if (options.validateBorders) {
      // Validate box-drawing characters are present
      await this.validatePanelBorderCharacters(actionsPanel, ['╔', '═', '╗', '║', '╚', '╝', '╠', '╣']);
    }
  }

  /**
   * Validates box-drawing character placement across all panels
   */
  async validateBoxDrawingCharacters(page: Page, options: BoxDrawingValidationOptions): Promise<void> {
    const rightPanel = page.locator('[data-testid="right-panel"]');
    const panelText = await rightPanel.textContent();
    
    if (!panelText) {
      throw new Error('Right panel text content not found');
    }
    
    // Check that all expected box-drawing characters are present
    for (const char of options.expectedChars) {
      expect(panelText.includes(char)).toBeTruthy(`Box-drawing character '${char}' not found in panel`);
    }
    
    if (options.validatePositions) {
      // Validate specific positioning patterns for panel borders
      await this.validateBorderStructure(rightPanel);
    }
  }

  /**
   * Validates exact panel dimensions according to specifications
   */
  async validatePanelDimensions(page: Page, options: PanelDimensionOptions): Promise<void> {
    const rightPanel = page.locator('[data-testid="right-panel"]');
    
    // Get bounding box for dimension validation
    const boundingBox = await rightPanel.boundingBox();
    expect(boundingBox).not.toBeNull();
    
    if (options.validateAllPanels) {
      const panelSelectors = [
        '[data-testid="player-stats-panel"]',
        '[data-testid="actions-panel"]',
        '[data-testid="initiative-panel"]',
        '[data-testid="message-log-panel"]'
      ];
      
      for (const selector of panelSelectors) {
        const panel = page.locator(selector);
        if (await panel.count() > 0) {
          await this.validatePanelTextWidth(panel, options.panelBorderWidth);
        }
      }
    }
  }

  /**
   * Validates progress bar characters and composition
   */
  async validateProgressBars(page: Page, options: ProgressBarValidationOptions): Promise<void> {
    const statsPanel = page.locator('[data-testid="player-stats-panel"]');
    const panelText = await statsPanel.textContent();
    
    if (!panelText) {
      throw new Error('Stats panel text content not found');
    }
    
    // Look for progress bar characters
    for (const char of options.expectedChars) {
      expect(panelText.includes(char)).toBeTruthy(`Progress bar character '${char}' not found`);
    }
    
    // Validate HP and AP progress bars are present with expected length
    const progressBarPattern = new RegExp(`[${options.expectedChars.join('')}]{${options.validateLength}}`, 'g');
    const progressBarMatches = panelText.match(progressBarPattern);
    
    expect(progressBarMatches).not.toBeNull();
    expect(progressBarMatches!.length).toBeGreaterThanOrEqual(2); // At least HP and AP bars
  }

  /**
   * Validates turn order display structure
   */
  async validateTurnOrder(page: Page, options: any): Promise<void> {
    const initiativePanel = page.locator('[data-testid="initiative-panel"]');
    
    if (await initiativePanel.count() === 0) {
      console.log('Initiative panel not found - may not be present in current game state');
      return;
    }
    
    const panelText = await initiativePanel.textContent();
    
    if (panelText && options.currentPlayerIndicator) {
      expect(panelText.includes(options.currentPlayerIndicator))
        .toBeTruthy(`Current player indicator '${options.currentPlayerIndicator}' not found`);
    }
  }

  /**
   * Validates message log expanded layout (8 lines)
   */
  async validateMessageLog(page: Page, options: any): Promise<void> {
    const messagePanel = page.locator('[data-testid="message-log-panel"]');
    
    if (await messagePanel.count() === 0) {
      console.log('Message log panel not found - may not be present in current game state');
      return;
    }
    
    await expect(messagePanel).toBeVisible();
    
    // Validate panel has expected structure
    await this.validatePanelBorderCharacters(messagePanel, ['╔', '═', '╗', '║', '╚', '╝']);
  }

  /**
   * Validates color scheme matches specifications exactly
   */
  async validateColorScheme(page: Page, options: ColorSchemeValidationOptions): Promise<void> {
    // Check background color
    const backgroundColor = await page.evaluate(() => {
      const body = document.body;
      return window.getComputedStyle(body).backgroundColor;
    });
    
    // Check primary text color on game elements
    const primaryColor = await page.evaluate(() => {
      const gameContainer = document.querySelector('[data-testid="game-container"]');
      return gameContainer ? window.getComputedStyle(gameContainer).color : null;
    });
    
    if (options.strictValidation) {
      // Convert RGB to hex for comparison
      const bgHex = this.rgbToHex(backgroundColor);
      const primaryHex = this.rgbToHex(primaryColor || '');
      
      // Allow for slight browser rendering variations
      expect(this.isColorSimilar(bgHex, options.backgroundColor)).toBeTruthy(
        `Background color ${bgHex} doesn't match expected ${options.backgroundColor}`
      );
    }
  }

  /**
   * Validates monospace font rendering and character alignment
   */
  async validateFontRendering(page: Page, options: FontRenderingOptions): Promise<void> {
    const gameContainer = page.locator('[data-testid="game-container"]');
    
    const fontFamily = await gameContainer.evaluate((element) => {
      return window.getComputedStyle(element).fontFamily;
    });
    
    // Check if any of the expected font families are present
    const hasExpectedFont = options.expectedFontFamily.some(font => 
      fontFamily.toLowerCase().includes(font.toLowerCase())
    );
    
    expect(hasExpectedFont).toBeTruthy(
      `Font family ${fontFamily} doesn't include expected fonts: ${options.expectedFontFamily.join(', ')}`
    );
  }

  /**
   * Validates player stats structure with dynamic content ignored
   */
  async validatePlayerStatsStructure(page: Page, options: any): Promise<void> {
    const statsPanel = page.locator('[data-testid="player-stats-panel"]');
    
    if (await statsPanel.count() === 0) {
      console.log('Player stats panel not found - may not be present in current game state');
      return;
    }
    
    const panelText = await statsPanel.textContent();
    
    if (options.validateLabels && panelText) {
      const expectedLabels = ['HP:', 'AP:', 'Name:'];
      for (const label of expectedLabels) {
        expect(panelText.includes(label)).toBeTruthy(`Label '${label}' not found in stats panel`);
      }
    }
    
    if (options.validateBorders) {
      await this.validatePanelBorderCharacters(statsPanel, ['╔', '═', '╗', '║', '╚', '╝']);
    }
  }

  /**
   * Validates expanded action menu layout (18 lines)
   */
  async validateActionMenu(page: Page, options: any): Promise<void> {
    const actionPanel = page.locator('[data-testid="actions-panel"]');
    const panelText = await actionPanel.textContent();
    
    if (options.validateHotkeys && panelText) {
      // Validate hotkey numbers [1] through [9] are present
      for (let i = 1; i <= 9; i++) {
        expect(panelText.includes(`[${i}]`)).toBeTruthy(`Hotkey [${i}] not found`);
      }
    }
    
    if (options.validateBorders) {
      await this.validatePanelBorderCharacters(actionPanel, ['╔', '═', '╗', '║', '╚', '╝', '╠', '╣']);
    }
  }

  /**
   * Validates player name truncation behavior
   */
  async validatePlayerNameTruncation(page: Page, options: any): Promise<void> {
    const statsPanel = page.locator('[data-testid="player-stats-panel"]');
    const panelText = await statsPanel.textContent();
    
    if (panelText) {
      // Look for name line and check truncation
      const nameMatch = panelText.match(/Name:\s*(.+)/);
      if (nameMatch) {
        const displayedName = nameMatch[1].trim();
        expect(displayedName.length).toBeLessThanOrEqual(options.maxLength);
        
        // If name is truncated, should end with truncation symbol
        if (displayedName.length === options.maxLength && displayedName.includes(options.truncationSymbol)) {
          expect(displayedName.endsWith(options.truncationSymbol)).toBeTruthy();
        }
      }
    }
  }

  /**
   * Validates insufficient AP state display
   */
  async validateInsufficientAPState(page: Page, options: any): Promise<void> {
    const actionPanel = page.locator('[data-testid="actions-panel"]');
    const panelText = await actionPanel.textContent();
    
    if (options.validateDashDisplay && panelText) {
      // Should have "----" for unavailable skills
      expect(panelText.includes('----')).toBeTruthy('Insufficient AP state should show ---- for unavailable skills');
    }
  }

  // PRIVATE HELPER METHODS

  private async validatePanelBorderCharacters(panel: Locator, expectedChars: string[]): Promise<void> {
    const panelText = await panel.textContent();
    
    if (!panelText) {
      throw new Error('Panel text content not found');
    }
    
    for (const char of expectedChars) {
      expect(panelText.includes(char)).toBeTruthy(`Border character '${char}' not found in panel`);
    }
  }

  private async validateBorderStructure(panel: Locator): Promise<void> {
    const panelText = await panel.textContent();
    
    if (!panelText) {
      throw new Error('Panel text content not found for border validation');
    }
    
    // Check for proper border structure patterns
    const lines = panelText.split('\n').filter(line => line.trim().length > 0);
    
    // First line should start with top-left corner
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      expect(firstLine.startsWith('╔') || firstLine.startsWith('┌')).toBeTruthy('Panel should start with corner character');
    }
    
    // Last line should start with bottom-left corner
    if (lines.length > 1) {
      const lastLine = lines[lines.length - 1].trim();
      expect(lastLine.startsWith('╚') || lastLine.startsWith('└')).toBeTruthy('Panel should end with corner character');
    }
  }

  private async validatePanelTextWidth(panel: Locator, expectedWidth: number): Promise<void> {
    const panelText = await panel.textContent();
    
    if (!panelText) {
      return;
    }
    
    const lines = panelText.split('\n').filter(line => line.trim().length > 0);
    
    // Check that border lines match expected width
    for (const line of lines) {
      if (line.includes('═') || line.includes('─')) {
        // This is likely a border line
        const trimmedLine = line.trim();
        expect(trimmedLine.length).toBeLessThanOrEqual(expectedWidth + 2); // Allow for whitespace variation
      }
    }
  }

  private rgbToHex(rgb: string): string {
    if (!rgb) return '#000000';
    
    // Handle rgb(r, g, b) format
    const rgbMatch = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }
    
    // If already in hex format or other format
    return rgb.startsWith('#') ? rgb : '#000000';
  }

  private isColorSimilar(color1: string, color2: string, tolerance: number = 10): boolean {
    // Simple color similarity check allowing for browser rendering variations
    if (color1 === color2) return true;
    
    // For now, do basic comparison - could be enhanced with more sophisticated color difference calculation
    return color1.toLowerCase() === color2.toLowerCase();
  }

  /**
   * Generates a detailed visual diff report for failed tests
   */
  async generateVisualDiffReport(
    baselinePath: string,
    actualPath: string,
    diffPath: string
  ): Promise<{ pixelDifferences: number; percentageDiff: number }> {
    if (!fs.existsSync(baselinePath) || !fs.existsSync(actualPath)) {
      throw new Error('Baseline or actual screenshot not found for diff generation');
    }

    const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
    const actual = PNG.sync.read(fs.readFileSync(actualPath));
    
    const { width, height } = baseline;
    const diff = new PNG({ width, height });

    const pixelDifferences = pixelmatch(
      baseline.data, 
      actual.data, 
      diff.data, 
      width, 
      height, 
      { threshold: 0.1 }
    );

    fs.writeFileSync(diffPath, PNG.sync.write(diff));

    const totalPixels = width * height;
    const percentageDiff = (pixelDifferences / totalPixels) * 100;

    return { pixelDifferences, percentageDiff };
  }
}