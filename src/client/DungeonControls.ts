/**
 * Dungeon Generation Controls UI Component
 * 
 * Provides real-time controls for switching dungeon themes, algorithms,
 * and generating new dungeons. Integrates with the DungeonVisualizationManager
 * and GameRenderer for seamless procedural dungeon interaction.
 * 
 * Based on Context7 research:
 * - Modern UI patterns with performance-optimized event handlers
 * - Real-time parameter updates without full page reloads
 * - Accessible UI components with proper ARIA labeling
 */

import { GameRenderer } from './GameRenderer';
import { DungeonThemeType, AlgorithmType, DungeonConfig } from '../shared/DungeonTypes';

export interface DungeonControlsConfig {
  containerId: string;
  gameRenderer: GameRenderer;
  onDungeonGenerated?: (config: DungeonConfig) => void;
  onThemeChanged?: (theme: DungeonThemeType) => void;
  onAlgorithmChanged?: (algorithm: AlgorithmType) => void;
}

export class DungeonControls {
  private gameRenderer: GameRenderer;
  private container: HTMLElement;
  private config: DungeonControlsConfig;
  
  // Current settings
  private currentTheme: DungeonThemeType = 'ancient_ruins';
  private currentAlgorithm: AlgorithmType = 'bsp';
  private currentSize: { width: number; height: number } = { width: 200, height: 100 };
  
  // UI Elements
  private themeSelect: HTMLSelectElement | null = null;
  private algorithmSelect: HTMLSelectElement | null = null;
  private generateButton: HTMLButtonElement | null = null;
  private statusDisplay: HTMLElement | null = null;
  private performanceDisplay: HTMLElement | null = null;
  private sizeControls: { width: HTMLInputElement; height: HTMLInputElement } | null = null;
  
  // Performance monitoring
  private performanceUpdateInterval: number | null = null;

  constructor(config: DungeonControlsConfig) {
    this.config = config;
    this.gameRenderer = config.gameRenderer;
    
    const container = document.getElementById(config.containerId);
    if (!container) {
      throw new Error(`Container not found: ${config.containerId}`);
    }
    this.container = container;
    
    this.initializeControls();
    this.startPerformanceMonitoring();
  }

  /**
   * Initialize the control panel UI
   */
  private initializeControls(): void {
    this.container.innerHTML = `
      <div class="dungeon-controls" role="region" aria-label="Dungeon Generation Controls">
        <h3>Dungeon Generator</h3>
        
        <div class="control-section">
          <div class="control-row">
            <label for="theme-select">Theme:</label>
            <select id="theme-select" class="theme-select" aria-describedby="theme-help">
              ${this.generateThemeOptions()}
            </select>
            <small id="theme-help" class="help-text">Choose visual style and terrain types</small>
          </div>
          
          <div class="control-row">
            <label for="algorithm-select">Algorithm:</label>
            <select id="algorithm-select" class="algorithm-select" aria-describedby="algorithm-help">
              ${this.generateAlgorithmOptions()}
            </select>
            <small id="algorithm-help" class="help-text">Generation method affects room layout</small>
          </div>
          
          <div class="control-row">
            <label>Size:</label>
            <div class="size-controls">
              <input type="number" id="width-input" value="200" min="60" max="400" step="20" aria-label="Dungeon Width">
              <span>×</span>
              <input type="number" id="height-input" value="100" min="20" max="200" step="20" aria-label="Dungeon Height">
            </div>
          </div>
        </div>
        
        <div class="action-section">
          <button id="generate-btn" class="generate-button" type="button">
            Generate New Dungeon
          </button>
          <button id="regenerate-btn" class="regenerate-button" type="button">
            Regenerate Same Settings
          </button>
        </div>
        
        <div class="status-section">
          <div id="generation-status" class="status-display" role="status" aria-live="polite">
            Ready to generate
          </div>
          <div id="performance-display" class="performance-display">
            <div class="performance-metric">
              <span class="metric-label">Render Time:</span>
              <span class="metric-value" id="render-time">--</span>
            </div>
            <div class="performance-metric">
              <span class="metric-label">Cells Rendered:</span>
              <span class="metric-value" id="cells-rendered">--</span>
            </div>
            <div class="performance-metric">
              <span class="metric-label">Cache Efficiency:</span>
              <span class="metric-value" id="cache-efficiency">--</span>
            </div>
          </div>
        </div>
        
        <div class="info-section">
          <details>
            <summary>Dungeon Information</summary>
            <div id="dungeon-info" class="dungeon-info">
              <div class="info-item">
                <span class="info-label">Current Theme:</span>
                <span class="info-value" id="current-theme">${this.currentTheme}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Current Algorithm:</span>
                <span class="info-value" id="current-algorithm">${this.currentAlgorithm}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Dynamic Mode:</span>
                <span class="info-value" id="dynamic-mode">Disabled</span>
              </div>
            </div>
          </details>
        </div>
      </div>
    `;
    
    // Apply CSS styling
    this.applyControlStyles();
    
    // Get references to UI elements
    this.themeSelect = this.container.querySelector('#theme-select') as HTMLSelectElement;
    this.algorithmSelect = this.container.querySelector('#algorithm-select') as HTMLSelectElement;
    this.generateButton = this.container.querySelector('#generate-btn') as HTMLButtonElement;
    this.statusDisplay = this.container.querySelector('#generation-status') as HTMLElement;
    this.performanceDisplay = this.container.querySelector('#performance-display') as HTMLElement;
    
    const widthInput = this.container.querySelector('#width-input') as HTMLInputElement;
    const heightInput = this.container.querySelector('#height-input') as HTMLInputElement;
    this.sizeControls = { width: widthInput, height: heightInput };
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Update initial state
    this.updateDungeonInfo();
  }

  /**
   * Generate theme select options
   */
  private generateThemeOptions(): string {
    const themes = this.gameRenderer.getAvailableThemes();
    return themes.map(theme => {
      const displayName = this.formatThemeName(theme);
      const selected = theme === this.currentTheme ? 'selected' : '';
      return `<option value="${theme}" ${selected}>${displayName}</option>`;
    }).join('');
  }

  /**
   * Generate algorithm select options
   */
  private generateAlgorithmOptions(): string {
    const algorithms = this.gameRenderer.getAvailableAlgorithms();
    const algorithmNames: Record<AlgorithmType, string> = {
      'bsp': 'Binary Space Partitioning',
      'cellular_automata': 'Cellular Automata',
      'hybrid': 'Hybrid (BSP + Cellular)',
      'maze': 'Maze Generation',
      'rooms_corridors': 'Rooms & Corridors',
      'voronoi': 'Voronoi Diagrams',
      'drunken_walk': 'Drunken Walk',
      'recursive_division': 'Recursive Division'
    };
    
    return algorithms.map(algorithm => {
      const displayName = algorithmNames[algorithm];
      const selected = algorithm === this.currentAlgorithm ? 'selected' : '';
      return `<option value="${algorithm}" ${selected}>${displayName}</option>`;
    }).join('');
  }

  /**
   * Format theme name for display
   */
  private formatThemeName(theme: DungeonThemeType): string {
    const themeNames: Record<DungeonThemeType, string> = {
      'classic': '🏰 Classic Dungeon',
      'volcanic': '🌋 Volcanic',
      'ice_cavern': '🧊 Ice Cavern', 
      'forest': '🌲 Forest',
      'desert': '🏜️ Desert',
      'underdark': '🕳️ Underdark',
      'mechanical': '⚙️ Mechanical',
      'ethereal': '✨ Ethereal',
      'fire_caverns': '🔥 Fire Caverns',
      'ice_crystal_caves': '❄️ Ice Crystal Caves',
      'shadow_crypts': '🌑 Shadow Crypts',
      'ancient_ruins': '🏛️ Ancient Ruins',
      'living_forest': '🌲 Living Forest',
      'aberrant_laboratory': '🧪 Aberrant Laboratory',
      'elemental_nexus': '⚡ Elemental Nexus',
      'underdark_passages': '🕳️ Underdark Passages'
    };
    
    return themeNames[theme] || theme;
  }

  /**
   * Set up event listeners for all controls
   */
  private setupEventListeners(): void {
    // Theme selection
    if (this.themeSelect) {
      this.themeSelect.addEventListener('change', async (e) => {
        const target = e.target as HTMLSelectElement;
        const newTheme = target.value as DungeonThemeType;
        await this.handleThemeChange(newTheme);
      });
    }

    // Algorithm selection
    if (this.algorithmSelect) {
      this.algorithmSelect.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        const newAlgorithm = target.value as AlgorithmType;
        this.handleAlgorithmChange(newAlgorithm);
      });
    }

    // Size controls
    if (this.sizeControls) {
      this.sizeControls.width.addEventListener('change', (e) => {
        this.currentSize.width = parseInt((e.target as HTMLInputElement).value);
      });
      
      this.sizeControls.height.addEventListener('change', (e) => {
        this.currentSize.height = parseInt((e.target as HTMLInputElement).value);
      });
    }

    // Generate button
    if (this.generateButton) {
      this.generateButton.addEventListener('click', () => {
        this.handleGenerateClick();
      });
    }

    // Regenerate button
    const regenerateButton = this.container.querySelector('#regenerate-btn') as HTMLButtonElement;
    if (regenerateButton) {
      regenerateButton.addEventListener('click', () => {
        this.handleRegenerateClick();
      });
    }
  }

  /**
   * Handle theme change
   */
  private async handleThemeChange(theme: DungeonThemeType): Promise<void> {
    this.updateStatus('Switching theme...', 'loading');
    
    try {
      if (this.gameRenderer.isDynamicDungeonActive()) {
        await this.gameRenderer.switchDungeonTheme(theme);
        this.currentTheme = theme;
        this.updateStatus(`Theme changed to ${this.formatThemeName(theme)}`, 'success');
      } else {
        this.currentTheme = theme;
        this.updateStatus(`Theme selected: ${this.formatThemeName(theme)}`, 'info');
      }
      
      this.updateDungeonInfo();
      this.config.onThemeChanged?.(theme);
      
    } catch (error) {
      console.error('Failed to change theme:', error);
      this.updateStatus('Failed to change theme', 'error');
    }
  }

  /**
   * Handle algorithm change
   */
  private handleAlgorithmChange(algorithm: AlgorithmType): void {
    this.currentAlgorithm = algorithm;
    this.updateDungeonInfo();
    this.config.onAlgorithmChanged?.(algorithm);
    
    if (this.gameRenderer.isDynamicDungeonActive()) {
      this.updateStatus(`Algorithm changed to ${algorithm} (regenerate to apply)`, 'info');
    } else {
      this.updateStatus(`Algorithm selected: ${algorithm}`, 'info');
    }
  }

  /**
   * Handle generate button click
   */
  private async handleGenerateClick(): Promise<void> {
    this.setGenerationInProgress(true);
    this.updateStatus('Generating dungeon...', 'loading');
    
    try {
      const config: Partial<DungeonConfig> = {
        theme: this.currentTheme,
        algorithm: this.currentAlgorithm,
        size: this.currentSize
      };
      
      await this.gameRenderer.generateProceduralDungeon(config);
      
      this.updateStatus('Dungeon generated successfully!', 'success');
      this.updateDungeonInfo();
      this.config.onDungeonGenerated?.(config as DungeonConfig);
      
    } catch (error) {
      console.error('Failed to generate dungeon:', error);
      this.updateStatus('Failed to generate dungeon', 'error');
    } finally {
      this.setGenerationInProgress(false);
    }
  }

  /**
   * Handle regenerate button click
   */
  private async handleRegenerateClick(): Promise<void> {
    this.setGenerationInProgress(true);
    this.updateStatus('Regenerating dungeon...', 'loading');
    
    try {
      await this.gameRenderer.regenerateDungeon(this.currentAlgorithm, this.currentTheme);
      this.updateStatus('Dungeon regenerated successfully!', 'success');
      this.updateDungeonInfo();
      
    } catch (error) {
      console.error('Failed to regenerate dungeon:', error);
      this.updateStatus('Failed to regenerate dungeon', 'error');
    } finally {
      this.setGenerationInProgress(false);
    }
  }

  /**
   * Update status display
   */
  private updateStatus(message: string, type: 'info' | 'loading' | 'success' | 'error' = 'info'): void {
    if (this.statusDisplay) {
      this.statusDisplay.textContent = message;
      this.statusDisplay.className = `status-display status-${type}`;
      
      // Clear success/error messages after 3 seconds
      if (type === 'success' || type === 'error') {
        setTimeout(() => {
          if (this.statusDisplay && this.statusDisplay.className.includes(type)) {
            this.updateStatus('Ready', 'info');
          }
        }, 3000);
      }
    }
  }

  /**
   * Set generation in progress state
   */
  private setGenerationInProgress(inProgress: boolean): void {
    if (this.generateButton) {
      this.generateButton.disabled = inProgress;
      this.generateButton.textContent = inProgress ? 'Generating...' : 'Generate New Dungeon';
    }
    
    const regenerateButton = this.container.querySelector('#regenerate-btn') as HTMLButtonElement;
    if (regenerateButton) {
      regenerateButton.disabled = inProgress;
    }
    
    // Disable controls during generation
    if (this.themeSelect) this.themeSelect.disabled = inProgress;
    if (this.algorithmSelect) this.algorithmSelect.disabled = inProgress;
    if (this.sizeControls) {
      this.sizeControls.width.disabled = inProgress;
      this.sizeControls.height.disabled = inProgress;
    }
  }

  /**
   * Update dungeon information display
   */
  private updateDungeonInfo(): void {
    const themeValue = this.container.querySelector('#current-theme');
    const algorithmValue = this.container.querySelector('#current-algorithm');
    const dynamicModeValue = this.container.querySelector('#dynamic-mode');
    
    if (themeValue) themeValue.textContent = this.formatThemeName(this.currentTheme);
    if (algorithmValue) algorithmValue.textContent = this.currentAlgorithm;
    if (dynamicModeValue) {
      dynamicModeValue.textContent = this.gameRenderer.isDynamicDungeonActive() ? 'Enabled' : 'Disabled';
    }
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    this.performanceUpdateInterval = window.setInterval(() => {
      this.updatePerformanceDisplay();
    }, 1000);
  }

  /**
   * Update performance display
   */
  private updatePerformanceDisplay(): void {
    const metrics = this.gameRenderer.getRenderingMetrics();
    
    const renderTimeEl = this.container.querySelector('#render-time');
    const cellsRenderedEl = this.container.querySelector('#cells-rendered');
    const cacheEfficiencyEl = this.container.querySelector('#cache-efficiency');
    
    if (renderTimeEl) {
      renderTimeEl.textContent = `${metrics.renderTime?.toFixed(2) || 0}ms`;
    }
    
    if (cellsRenderedEl) {
      cellsRenderedEl.textContent = metrics.cellsRendered?.toString() || '0';
    }
    
    if (cacheEfficiencyEl && metrics.cacheHits !== undefined && metrics.cacheMisses !== undefined) {
      const total = metrics.cacheHits + metrics.cacheMisses;
      const efficiency = total > 0 ? ((metrics.cacheHits / total) * 100).toFixed(1) : '0';
      cacheEfficiencyEl.textContent = `${efficiency}%`;
    }
  }

  /**
   * Apply CSS styles to the control panel
   */
  private applyControlStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .dungeon-controls {
        background: #2a2a2a;
        border: 1px solid #444;
        border-radius: 8px;
        padding: 16px;
        font-family: 'Courier New', monospace;
        color: #ffffff;
        max-width: 400px;
        margin: 8px;
      }
      
      .dungeon-controls h3 {
        margin: 0 0 16px 0;
        color: #00ff00;
        border-bottom: 1px solid #444;
        padding-bottom: 8px;
      }
      
      .control-section {
        margin-bottom: 16px;
      }
      
      .control-row {
        display: flex;
        flex-direction: column;
        margin-bottom: 12px;
      }
      
      .control-row label {
        font-weight: bold;
        margin-bottom: 4px;
        color: #cccccc;
      }
      
      .control-row select,
      .control-row input {
        background: #1a1a1a;
        border: 1px solid #555;
        color: #ffffff;
        padding: 6px;
        border-radius: 4px;
        font-family: inherit;
      }
      
      .control-row select:focus,
      .control-row input:focus {
        outline: none;
        border-color: #00ff00;
      }
      
      .size-controls {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .size-controls input {
        flex: 1;
        max-width: 80px;
      }
      
      .help-text {
        color: #888;
        font-size: 0.8em;
        margin-top: 2px;
      }
      
      .action-section {
        margin-bottom: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .generate-button,
      .regenerate-button {
        background: #0066cc;
        border: none;
        color: white;
        padding: 10px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-family: inherit;
        font-weight: bold;
        transition: background-color 0.2s;
      }
      
      .generate-button:hover:not(:disabled) {
        background: #0080ff;
      }
      
      .regenerate-button {
        background: #cc6600;
      }
      
      .regenerate-button:hover:not(:disabled) {
        background: #ff8000;
      }
      
      .generate-button:disabled,
      .regenerate-button:disabled {
        background: #666;
        cursor: not-allowed;
      }
      
      .status-section {
        margin-bottom: 16px;
      }
      
      .status-display {
        padding: 8px;
        border-radius: 4px;
        margin-bottom: 8px;
        font-size: 0.9em;
      }
      
      .status-info {
        background: #2a2a3a;
        border-left: 3px solid #0066cc;
      }
      
      .status-loading {
        background: #3a3a2a;
        border-left: 3px solid #ffcc00;
      }
      
      .status-success {
        background: #2a3a2a;
        border-left: 3px solid #00cc00;
      }
      
      .status-error {
        background: #3a2a2a;
        border-left: 3px solid #cc0000;
      }
      
      .performance-display {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 0.8em;
      }
      
      .performance-metric {
        display: flex;
        justify-content: space-between;
      }
      
      .metric-label {
        color: #aaa;
      }
      
      .metric-value {
        color: #00ff00;
        font-weight: bold;
      }
      
      .info-section details {
        background: #1a1a1a;
        border-radius: 4px;
        padding: 8px;
      }
      
      .info-section summary {
        cursor: pointer;
        font-weight: bold;
        margin-bottom: 8px;
      }
      
      .dungeon-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 0.9em;
      }
      
      .info-item {
        display: flex;
        justify-content: space-between;
      }
      
      .info-label {
        color: #aaa;
      }
      
      .info-value {
        color: #ffffff;
        font-weight: bold;
      }
      
      @media (max-width: 480px) {
        .dungeon-controls {
          margin: 4px;
          padding: 12px;
        }
        
        .action-section {
          flex-direction: column;
        }
        
        .size-controls {
          flex-direction: column;
          align-items: stretch;
        }
        
        .size-controls input {
          max-width: none;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Get current configuration
   */
  public getCurrentConfig(): DungeonConfig {
    return {
      theme: this.currentTheme,
      algorithm: this.currentAlgorithm,
      width: this.currentSize.width,
      height: this.currentSize.height,
      size: this.currentSize,
      seed: Math.floor(Math.random() * 1000000)
    };
  }

  /**
   * Update controls to match external state
   */
  public updateFromState(config: Partial<DungeonConfig>): void {
    if (config.theme && config.theme !== this.currentTheme) {
      this.currentTheme = config.theme;
      if (this.themeSelect) {
        this.themeSelect.value = config.theme;
      }
    }
    
    if (config.algorithm && config.algorithm !== this.currentAlgorithm) {
      this.currentAlgorithm = config.algorithm;
      if (this.algorithmSelect) {
        this.algorithmSelect.value = config.algorithm;
      }
    }
    
    if (config.size) {
      this.currentSize = config.size;
      if (this.sizeControls) {
        this.sizeControls.width.value = config.size.width.toString();
        this.sizeControls.height.value = config.size.height.toString();
      }
    }
    
    this.updateDungeonInfo();
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    if (this.performanceUpdateInterval) {
      clearInterval(this.performanceUpdateInterval);
      this.performanceUpdateInterval = null;
    }
    
    this.container.innerHTML = '';
  }
}