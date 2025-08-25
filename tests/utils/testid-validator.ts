import { Page, Locator } from '@playwright/test';

/**
 * Test ID Validator
 * 
 * Ensures that all critical UI elements have proper data-testid attributes
 * for reliable visual regression testing. This utility validates that the
 * necessary test identifiers are present and properly structured.
 */

export interface TestIDValidation {
  element: string;
  testId: string;
  required: boolean;
  description: string;
  fallbackSelector?: string;
}

export class TestIDValidator {
  private static readonly CRITICAL_ELEMENTS: TestIDValidation[] = [
    {
      element: 'Game Container',
      testId: 'game-container',
      required: true,
      description: 'Main game container holding all UI elements'
    },
    {
      element: 'Right Panel',
      testId: 'right-panel',
      required: true,
      description: 'Right panel containing all ASCII UI panels',
      fallbackSelector: '.right-panel, #right-panel'
    },
    {
      element: 'Player Stats Panel',
      testId: 'player-stats-panel',
      required: true,
      description: 'Player HP/AP stats with progress bars',
      fallbackSelector: '.stats-panel, .player-stats'
    },
    {
      element: 'Actions Panel',
      testId: 'actions-panel',
      required: true,
      description: 'CRITICAL: Quick skill bar with 1-9 hotkeys',
      fallbackSelector: '.actions-panel, .skill-bar'
    },
    {
      element: 'Initiative Panel',
      testId: 'initiative-panel',
      required: false,
      description: 'Turn order display (may not always be visible)',
      fallbackSelector: '.initiative-order, .turn-order'
    },
    {
      element: 'Message Log Panel',
      testId: 'message-log-panel',
      required: false,
      description: 'Message log (8 lines expanded)',
      fallbackSelector: '.message-log, .game-log'
    },
    {
      element: 'Turn Status Panel',
      testId: 'turn-status-panel',
      required: false,
      description: 'Current turn status display',
      fallbackSelector: '.turn-status'
    },
    {
      element: 'AP Display Panel',
      testId: 'ap-display-panel',
      required: false,
      description: 'Action Points display panel',
      fallbackSelector: '.ap-display'
    },
    {
      element: 'Game Map',
      testId: 'game-map',
      required: true,
      description: 'Main game map area with ASCII graphics',
      fallbackSelector: '.game-map, .map-container, #game-map'
    }
  ];

  /**
   * Validate all critical test IDs are present
   */
  static async validateTestIDs(page: Page): Promise<TestIDValidationResult> {
    const results: ElementValidationResult[] = [];
    let missingCritical = 0;
    let foundElements = 0;

    for (const validation of this.CRITICAL_ELEMENTS) {
      const result = await this.validateSingleElement(page, validation);
      results.push(result);

      if (result.found) {
        foundElements++;
      } else if (validation.required) {
        missingCritical++;
      }
    }

    return {
      totalElements: this.CRITICAL_ELEMENTS.length,
      foundElements,
      missingCritical,
      elementResults: results,
      isValid: missingCritical === 0
    };
  }

  /**
   * Validate a single element's test ID
   */
  private static async validateSingleElement(
    page: Page,
    validation: TestIDValidation
  ): Promise<ElementValidationResult> {
    const primarySelector = `[data-testid="${validation.testId}"]`;
    const primaryElement = page.locator(primarySelector);
    
    let found = false;
    let usedSelector = primarySelector;
    let actualElement: Locator | null = null;

    // Check primary test ID
    if (await primaryElement.count() > 0) {
      found = true;
      actualElement = primaryElement;
    } 
    // Try fallback selectors if primary not found
    else if (validation.fallbackSelector) {
      const fallbackElement = page.locator(validation.fallbackSelector);
      if (await fallbackElement.count() > 0) {
        found = true;
        usedSelector = validation.fallbackSelector;
        actualElement = fallbackElement;
      }
    }

    let boundingBox = null;
    let isVisible = false;

    if (found && actualElement) {
      try {
        boundingBox = await actualElement.boundingBox();
        isVisible = await actualElement.isVisible();
      } catch (error) {
        console.log(`Error getting element properties: ${error}`);
      }
    }

    return {
      element: validation.element,
      testId: validation.testId,
      required: validation.required,
      found,
      isVisible,
      usedSelector,
      boundingBox,
      hasCorrectTestId: usedSelector === primarySelector,
      recommendation: this.generateRecommendation(validation, found, usedSelector === primarySelector)
    };
  }

  /**
   * Generate recommendations for missing or incorrect test IDs
   */
  private static generateRecommendation(
    validation: TestIDValidation,
    found: boolean,
    hasCorrectTestId: boolean
  ): string {
    if (!found && validation.required) {
      return `🚨 CRITICAL: Add data-testid="${validation.testId}" to ${validation.element}. This element is required for visual regression testing.`;
    } else if (!found && !validation.required) {
      return `⚠️ OPTIONAL: Consider adding data-testid="${validation.testId}" to ${validation.element} for better test reliability.`;
    } else if (found && !hasCorrectTestId) {
      return `🔧 IMPROVEMENT: Element found using fallback selector. Add data-testid="${validation.testId}" for better reliability.`;
    } else {
      return `✅ GOOD: Element has correct data-testid="${validation.testId}".`;
    }
  }

  /**
   * Generate HTML report of test ID validation
   */
  static generateTestIDReport(results: TestIDValidationResult): string {
    const timestamp = new Date().toISOString();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test ID Validation Report</title>
    <style>
        body { 
            font-family: 'Courier New', monospace; 
            background: #000; 
            color: #00ff00; 
            margin: 20px; 
        }
        .header { 
            border: 2px solid #00ff00; 
            padding: 20px; 
            margin-bottom: 20px; 
        }
        .summary { 
            background: #001100; 
            padding: 15px; 
            margin-bottom: 20px; 
            border-left: 5px solid #00ff00;
        }
        .element-result {
            background: #001100;
            margin: 10px 0;
            padding: 15px;
            border-left: 4px solid;
        }
        .found { border-left-color: #00ff00; }
        .missing-critical { border-left-color: #ff0000; }
        .missing-optional { border-left-color: #ffff00; }
        .fallback { border-left-color: #ff8800; }
        .critical { color: #ff0000; font-weight: bold; }
        .warning { color: #ffff00; }
        .success { color: #00ff00; }
        .improvement { color: #ff8800; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { 
            border: 1px solid #003300; 
            padding: 8px; 
            text-align: left; 
        }
        th { background: #002200; }
        .status-icon { font-size: 1.2em; margin-right: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎮 Test ID Validation Report</h1>
        <h2>ASCII Roguelike Visual Testing Elements</h2>
        <p>Generated: ${timestamp}</p>
    </div>

    <div class="summary">
        <h3>📊 Summary</h3>
        <p><strong>Total Elements:</strong> ${results.totalElements}</p>
        <p><strong>Found:</strong> ${results.foundElements}</p>
        <p><strong>Missing Critical:</strong> ${results.missingCritical}</p>
        <p><strong>Status:</strong> ${results.isValid ? 
          '<span class="success">✅ VALID - All critical elements found</span>' : 
          '<span class="critical">❌ INVALID - Missing critical elements</span>'
        }</p>
    </div>

    <div class="element-results">
        <h3>🔍 Element Validation Results</h3>
        ${results.elementResults.map(result => `
            <div class="element-result ${this.getElementClass(result)}">
                <h4>
                    <span class="status-icon">${this.getStatusIcon(result)}</span>
                    ${result.element}
                    ${result.required ? '<span class="critical">[REQUIRED]</span>' : '<span class="warning">[OPTIONAL]</span>'}
                </h4>
                <p><strong>Test ID:</strong> data-testid="${result.testId}"</p>
                <p><strong>Found:</strong> ${result.found ? 'Yes' : 'No'}</p>
                ${result.found ? `
                    <p><strong>Visible:</strong> ${result.isVisible ? 'Yes' : 'No'}</p>
                    <p><strong>Selector Used:</strong> ${result.usedSelector}</p>
                    <p><strong>Correct Test ID:</strong> ${result.hasCorrectTestId ? 'Yes' : 'No (using fallback)'}</p>
                    ${result.boundingBox ? `
                        <p><strong>Position:</strong> ${result.boundingBox.x}, ${result.boundingBox.y}</p>
                        <p><strong>Size:</strong> ${result.boundingBox.width} x ${result.boundingBox.height}</p>
                    ` : ''}
                ` : ''}
                <div class="recommendation ${this.getRecommendationClass(result.recommendation)}">
                    ${result.recommendation}
                </div>
            </div>
        `).join('')}
    </div>

    <div class="header">
        <h3>📖 Implementation Guide</h3>
        <p><strong>Add Test IDs:</strong> &lt;div data-testid="element-name"&gt;...&lt;/div&gt;</p>
        <p><strong>Critical Elements:</strong> Must have test IDs for visual regression testing</p>
        <p><strong>Optional Elements:</strong> Recommended for better test reliability</p>
        <h4>Required Test IDs for Visual Testing:</h4>
        <ul>
            ${this.CRITICAL_ELEMENTS.filter(el => el.required).map(el => 
              `<li><code>data-testid="${el.testId}"</code> - ${el.description}</li>`
            ).join('')}
        </ul>
    </div>
</body>
</html>`;
  }

  private static getElementClass(result: ElementValidationResult): string {
    if (!result.found && result.required) return 'missing-critical';
    if (!result.found && !result.required) return 'missing-optional';
    if (result.found && !result.hasCorrectTestId) return 'fallback';
    return 'found';
  }

  private static getStatusIcon(result: ElementValidationResult): string {
    if (!result.found && result.required) return '🚨';
    if (!result.found && !result.required) return '⚠️';
    if (result.found && !result.hasCorrectTestId) return '🔧';
    return '✅';
  }

  private static getRecommendationClass(recommendation: string): string {
    if (recommendation.includes('CRITICAL')) return 'critical';
    if (recommendation.includes('OPTIONAL')) return 'warning';
    if (recommendation.includes('IMPROVEMENT')) return 'improvement';
    return 'success';
  }
}

export interface TestIDValidationResult {
  totalElements: number;
  foundElements: number;
  missingCritical: number;
  elementResults: ElementValidationResult[];
  isValid: boolean;
}

export interface ElementValidationResult {
  element: string;
  testId: string;
  required: boolean;
  found: boolean;
  isVisible: boolean;
  usedSelector: string;
  boundingBox: { x: number; y: number; width: number; height: number } | null;
  hasCorrectTestId: boolean;
  recommendation: string;
}