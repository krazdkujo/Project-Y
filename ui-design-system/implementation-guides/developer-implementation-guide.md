# Developer Implementation Guide
## 5-Theme ASCII UI System for Tactical Roguelike

### Overview
This guide provides complete implementation details for all 5 UI themes, ensuring consistent visual standards, accessibility compliance, and optimal performance.

## Quick Implementation Checklist

### Theme Integration Checklist
- [ ] CSS theme variables implemented
- [ ] Box-drawing character support verified
- [ ] Progress bar rendering functional  
- [ ] Quick skill bar format maintained (40-char width)
- [ ] Color contrast ratios validated
- [ ] Keyboard navigation implemented
- [ ] Screen reader compatibility tested
- [ ] Visual regression tests passing

## Core Architecture

### Theme System Structure
```typescript
interface UITheme {
  id: string;
  name: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  characters: ThemeCharacters;
  accessibility: AccessibilityConfig;
}

interface ThemeColors {
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  warning: string;
  error: string;
  success: string;
  muted: string;
}

interface ThemeCharacters {
  borders: {
    primary: BoxDrawingSet;
    secondary: BoxDrawingSet;
  };
  progress: ProgressCharacterSet;
  indicators: StatusIndicatorSet;
}
```

### Theme Manager Implementation
```typescript
class ThemeManager {
  private currentTheme: UITheme;
  private themes: Map<string, UITheme>;
  
  constructor() {
    this.themes = new Map([
      ['classic', CLASSIC_TERMINAL_THEME],
      ['tactical', TACTICAL_COMMAND_THEME], 
      ['minimal', MINIMALIST_EFFICIENCY_THEME],
      ['info-rich', INFORMATION_RICH_THEME],
      ['accessible', ACCESSIBLE_UNIVERSAL_THEME]
    ]);
    
    this.currentTheme = this.themes.get('classic')!;
  }
  
  switchTheme(themeId: string): void {
    const theme = this.themes.get(themeId);
    if (!theme) throw new Error(`Theme ${themeId} not found`);
    
    this.currentTheme = theme;
    this.applyTheme(theme);
    this.validateAccessibility(theme);
  }
  
  private applyTheme(theme: UITheme): void {
    // Update CSS custom properties
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Apply theme class to body
    document.body.className = `theme-${theme.id}`;
    
    // Update character sets
    this.updateCharacterSets(theme.characters);
  }
}
```

## Theme-Specific Implementation

### 1. Classic Terminal Theme
```css
.theme-classic {
  --color-background: #000000;
  --color-primary: #00FF00;
  --color-secondary: #00FF41;
  --color-accent: #FFFF00;
  
  --font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
  --font-size: 11px;
  --line-height: 1.1;
  
  --border-primary: '┌─┐│└┘├┤┬┴┼';
  --border-secondary: '╔═╗║╚╝╠╣╦╩╬';
  --progress-chars: '█▒░▓';
}

.classic-panel {
  background: var(--color-background);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);
}

.classic-skill-bar {
  width: 40ch; /* Protected constraint */
  font-family: monospace;
}
```

### 2. Tactical Command Theme
```css
.theme-tactical {
  --color-background: #001100;
  --color-primary: #00FF41;
  --color-secondary: #00CC33;
  --color-accent: #FFFF00;
  
  --font-family: 'Consolas', 'Monaco', monospace;
  --font-size: 11px;
  --font-weight: 600;
  --line-height: 1.0;
  --letter-spacing: 0.5px;
  
  --border-primary: '┏━┓┃┗┛┣┫┳┻╋';
  --border-secondary: '╔═╗║╚╝╠╣╦╩╬';
  --progress-chars: '████▓▓▒▒░░';
}

.tactical-panel {
  background: var(--color-background);
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  font-weight: var(--font-weight);
  letter-spacing: var(--letter-spacing);
}

.tactical-header {
  text-transform: uppercase;
  color: var(--color-accent);
  font-weight: bold;
}
```

### 3. Minimalist Efficiency Theme
```css
.theme-minimal {
  --color-background: #000000;
  --color-primary: #FFFFFF;
  --color-secondary: #CCCCCC;
  --color-accent: #00FF00;
  
  --font-family: system-ui, -apple-system, sans-serif;
  --font-size: 11px;
  --font-weight: 300;
  --line-height: 1.2;
  
  --border-primary: '┌─┐│└┘';
  --border-secondary: '────';
  --progress-chars: '████▒▒░░';
}

.minimal-panel {
  background: var(--color-background);
  color: var(--color-primary);
  border: 1px solid var(--color-secondary);
  font-weight: var(--font-weight);
  padding: 0.5ch;
}

/* Reduced visual noise */
.minimal-border {
  border-style: solid;
  border-width: 1px;
}
```

### 4. Information Rich Theme
```css
.theme-info-rich {
  --color-background: #0A0A0A;
  --color-primary: #E0E0E0;
  --color-secondary: #B0B0B0;
  --color-accent: #4A90E2;
  --color-success: #7ED321;
  --color-warning: #F5A623;
  --color-error: #D0021B;
  
  --font-family: 'SF Mono', 'Monaco', monospace;
  --font-size: 10px;
  --line-height: 1.1;
  
  --border-primary: '╔═╗║╚╝╠╣╦╩╬';
  --border-secondary: '┌─┐│└┘├┤┬┴┼';
  --progress-chars: '█▓▒░';
}

.info-rich-panel {
  background: var(--color-background);
  color: var(--color-primary);
  border: 1px solid #333333;
  position: relative;
}

.info-rich-data {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5ch;
}
```

### 5. Accessible & Universal Theme
```css
.theme-accessible {
  --color-background: #000000;
  --color-primary: #FFFFFF;
  --color-secondary: #CCCCCC;
  --color-accent: #FFFF00;
  --color-success: #00FF00;
  --color-warning: #FF8800;
  --color-error: #FF0000;
  --color-focus: #0080FF;
  
  --font-family: 'Arial', 'Helvetica', sans-serif;
  --font-size: 14px; /* Larger for accessibility */
  --font-weight: 400;
  --line-height: 1.4;
  
  --border-primary: '┌─┐│└┘';
  --border-secondary: '╔═╗║╚╝';
  --progress-chars: '████▒▒░░';
}

.accessible-panel {
  background: var(--color-background);
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  font-size: var(--font-size);
  line-height: var(--line-height);
  padding: 1ch;
}

/* Enhanced focus indicators */
.accessible-focus {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

/* Screen reader support */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## Protected Quick Skill Bar Implementation

### Core Requirements (MUST NOT CHANGE)
```typescript
interface QuickSkillBar {
  width: 40; // characters - PROTECTED
  format: '[N] SkillName (XAP)'; // PROTECTED  
  hotkeys: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9; // PROTECTED
  apCostDisplay: string; // (XAP) format - PROTECTED
}

// PROTECTED IMPLEMENTATION - DO NOT MODIFY
class QuickSkillBarRenderer {
  private readonly WIDTH = 40; // PROTECTED CONSTRAINT
  private readonly BORDER_WIDTH = 23; // PROTECTED CONSTRAINT
  
  renderSkillBar(skills: Skill[], theme: UITheme): string {
    const { primary, secondary } = theme.characters.borders;
    const header = this.createBorder(primary.top);
    const title = `${primary.vertical}       ACTIONS         ${primary.vertical}`;
    const separator = this.createBorder(primary.middle);
    
    const skillLines = skills.map((skill, index) => {
      const hotkey = index + 1;
      const name = skill.name.padEnd(15).substring(0, 15);
      const cost = skill.apCost > 0 ? `(${skill.apCost}AP)` : '(0AP)';
      return `${primary.vertical} [${hotkey}] ${name} ${cost}${primary.vertical}`;
    });
    
    // Fill empty slots
    while (skillLines.length < 9) {
      const hotkey = skillLines.length + 1;
      skillLines.push(`${primary.vertical} [${hotkey}] ----------   ---- ${primary.vertical}`);
    }
    
    const footer = this.createBorder(primary.bottom);
    
    return [header, title, separator, ...skillLines, footer].join('\n');
  }
}
```

## Performance Optimization

### Character Caching System
```typescript
class ASCIIRenderer {
  private characterCache = new Map<string, HTMLElement>();
  private progressBarCache = new Map<string, string>();
  
  cacheBoxDrawing(theme: UITheme): void {
    const chars = theme.characters.borders.primary;
    Object.values(chars).forEach(char => {
      if (!this.characterCache.has(char)) {
        const element = document.createElement('span');
        element.textContent = char;
        element.className = `box-char theme-${theme.id}`;
        this.characterCache.set(char, element);
      }
    });
  }
  
  renderProgressBar(current: number, max: number, width: number = 12): string {
    const key = `${current}-${max}-${width}`;
    if (this.progressBarCache.has(key)) {
      return this.progressBarCache.get(key)!;
    }
    
    const percentage = Math.min(current / max, 1);
    const filled = Math.floor(percentage * width);
    const empty = width - filled;
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    this.progressBarCache.set(key, bar);
    return bar;
  }
}
```

### Rendering Performance
```typescript
class UIPerformanceManager {
  private renderQueue: RenderTask[] = [];
  private isRendering = false;
  
  queueRender(task: RenderTask): void {
    this.renderQueue.push(task);
    if (!this.isRendering) {
      requestAnimationFrame(() => this.processBatch());
    }
  }
  
  private processBatch(): void {
    this.isRendering = true;
    const batchSize = 10; // Process 10 renders per frame
    const batch = this.renderQueue.splice(0, batchSize);
    
    batch.forEach(task => task.execute());
    
    if (this.renderQueue.length > 0) {
      requestAnimationFrame(() => this.processBatch());
    } else {
      this.isRendering = false;
    }
  }
}
```

## Accessibility Implementation

### Screen Reader Support
```typescript
class AccessibilityManager {
  private announcer: HTMLElement;
  
  constructor() {
    this.announcer = this.createScreenReaderAnnouncer();
  }
  
  announceChange(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    this.announcer.setAttribute('aria-live', priority);
    this.announcer.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      this.announcer.textContent = '';
    }, 100);
  }
  
  describePanelStructure(theme: UITheme): string {
    return `Game interface using ${theme.name} theme. ` +
           `Main game area on left, status panels on right. ` +
           `Quick skill bar with numbers 1 through 9 for actions. ` +
           `Use TAB to navigate between sections.`;
  }
  
  describeProgressBar(current: number, max: number, label: string): string {
    const percentage = Math.round((current / max) * 100);
    return `${label}: ${current} out of ${max}. ${percentage} percent.`;
  }
}
```

### Keyboard Navigation
```typescript
class KeyboardNavigationManager {
  private focusableElements: HTMLElement[] = [];
  private currentIndex = 0;
  
  initialize(theme: UITheme): void {
    this.setupKeyboardListeners();
    this.updateFocusableElements();
    this.applyThemeAccessibility(theme);
  }
  
  private setupKeyboardListeners(): void {
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'Tab':
          e.preventDefault();
          this.handleTabNavigation(e.shiftKey);
          break;
        case 'Enter':
          this.activateFocusedElement();
          break;
        case 'Escape':
          this.returnToMainMenu();
          break;
        case '1': case '2': case '3': case '4': case '5':
        case '6': case '7': case '8': case '9':
          this.activateQuickSkill(parseInt(e.key));
          break;
      }
    });
  }
}
```

## Visual Regression Testing Integration

### Test Configuration
```typescript
interface VisualRegressionConfig {
  themes: string[];
  screens: string[];
  viewports: { width: number; height: number }[];
  tolerance: number;
}

class VisualRegressionTester {
  async captureBaselines(config: VisualRegressionConfig): Promise<void> {
    for (const theme of config.themes) {
      await this.switchToTheme(theme);
      for (const screen of config.screens) {
        await this.navigateToScreen(screen);
        await this.captureScreenshot(`${theme}-${screen}-baseline`);
      }
    }
  }
  
  async runRegressionTests(): Promise<TestResults> {
    const results: TestResults = { passed: 0, failed: 0, errors: [] };
    
    // Test critical elements
    const criticalTests = [
      'quick-skill-bar-width',
      'box-drawing-alignment', 
      'color-contrast-ratios',
      'panel-border-integrity',
      'progress-bar-rendering'
    ];
    
    for (const test of criticalTests) {
      try {
        await this.runSingleTest(test);
        results.passed++;
      } catch (error) {
        results.failed++;
        results.errors.push({ test, error: error.message });
      }
    }
    
    return results;
  }
}
```

## Integration with Existing Codebase

### GameRenderer Integration
```typescript
// Modify existing GameRenderer to support themes
class GameRenderer {
  private themeManager: ThemeManager;
  
  constructor(themeManager: ThemeManager) {
    this.themeManager = themeManager;
  }
  
  generateStatsDisplay(): string {
    const theme = this.themeManager.getCurrentTheme();
    return this.renderWithTheme(theme, 'stats-panel');
  }
  
  generateASCIIBar(current: number, max: number): string {
    const theme = this.themeManager.getCurrentTheme();
    const chars = theme.characters.progress;
    
    // Use theme-specific progress characters
    return this.createProgressBar(current, max, chars);
  }
}
```

### APInterface Integration  
```typescript
class APInterface {
  constructor(private themeManager: ThemeManager) {}
  
  generateTurnIndicatorASCII(): string {
    const theme = this.themeManager.getCurrentTheme();
    return this.renderTurnPanel(theme);
  }
  
  generateQuickSkillBar(skills: Skill[]): string {
    const theme = this.themeManager.getCurrentTheme();
    // Use PROTECTED QuickSkillBarRenderer
    return new QuickSkillBarRenderer().renderSkillBar(skills, theme);
  }
}
```

This implementation guide ensures all 5 themes are properly integrated while maintaining the protected quick skill bar format, accessibility standards, and visual regression testing compatibility.