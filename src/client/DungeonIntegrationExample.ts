/**
 * Dungeon Visualization System Integration Example
 * 
 * Demonstrates the complete integration of:
 * - Procedural dungeon generation (BSP, Cellular Automata, Hybrid)
 * - 8 themed ASCII visualization systems
 * - Dynamic camera and viewport management
 * - Performance-optimized rendering with Context7 patterns
 * - Real-time theme/algorithm switching
 * - Mini-map navigation for large dungeons
 */

import { GameRenderer } from './GameRenderer.js';
import { DungeonControls } from './DungeonControls.js';
import { DungeonConfig, DungeonThemeType, AlgorithmType } from '../shared/DungeonTypes.js';

export class DungeonIntegrationExample {
  private gameRenderer: GameRenderer;
  private dungeonControls: DungeonControls | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.gameRenderer = new GameRenderer();
  }

  /**
   * Initialize the complete dungeon visualization system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Create the game container
      this.createGameContainer();
      
      // Initialize dungeon controls
      this.dungeonControls = new DungeonControls({
        containerId: 'dungeon-controls-container',
        gameRenderer: this.gameRenderer,
        onDungeonGenerated: this.handleDungeonGenerated.bind(this),
        onThemeChanged: this.handleThemeChanged.bind(this),
        onAlgorithmChanged: this.handleAlgorithmChanged.bind(this)
      });
      
      // Generate initial dungeon with default settings
      await this.generateInitialDungeon();
      
      // Set up demo controls
      this.setupDemoControls();
      
      // Start performance monitoring
      this.startPerformanceMonitoring();
      
      this.isInitialized = true;
      console.log('✅ Dungeon visualization system initialized successfully!');
      
    } catch (error) {
      console.error('❌ Failed to initialize dungeon system:', error);
      throw error;
    }
  }

  /**
   * Create the main game container HTML structure
   */
  private createGameContainer(): void {
    const body = document.body;
    
    // Clear existing content for demo
    body.innerHTML = '';
    
    // Create main container
    const mainContainer = document.createElement('div');
    mainContainer.id = 'main-container';
    mainContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: #1a1a1a;
      color: #ffffff;
      font-family: 'Courier New', monospace;
      padding: 10px;
      gap: 10px;
    `;
    
    // Create header
    const header = document.createElement('div');
    header.innerHTML = `
      <h1>🏰 Procedural Dungeon Visualization System</h1>
      <p>Real-time ASCII dungeon generation with 8 themes, 3 algorithms, and performance optimization</p>
    `;
    header.style.cssText = `
      text-align: center;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
      margin-bottom: 10px;
    `;
    
    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'dungeon-controls-container';
    controlsContainer.style.cssText = `
      flex-shrink: 0;
    `;
    
    // Create game area
    const gameArea = document.createElement('div');
    gameArea.style.cssText = `
      display: flex;
      flex: 1;
      gap: 10px;
      min-height: 400px;
    `;
    
    // Create game container (where the map will be rendered)
    const gameContainer = document.createElement('div');
    gameContainer.id = 'game-container';
    gameContainer.style.cssText = `
      flex: 1;
      background-color: #000000;
      border: 2px solid #333;
      border-radius: 8px;
      padding: 10px;
      overflow: hidden;
      position: relative;
    `;
    
    // Create info panel
    const infoPanel = document.createElement('div');
    infoPanel.id = 'info-panel';
    infoPanel.style.cssText = `
      width: 300px;
      background-color: #2a2a2a;
      border: 1px solid #444;
      border-radius: 8px;
      padding: 15px;
      overflow-y: auto;
    `;
    
    infoPanel.innerHTML = `
      <h3>System Information</h3>
      <div id="system-stats">
        <div class="stat-group">
          <h4>Current Dungeon</h4>
          <div id="dungeon-stats">
            <div>Theme: <span id="current-theme-display">Not generated</span></div>
            <div>Algorithm: <span id="current-algorithm-display">Not generated</span></div>
            <div>Size: <span id="current-size-display">Not generated</span></div>
            <div>Rooms: <span id="current-rooms-display">Not generated</span></div>
          </div>
        </div>
        
        <div class="stat-group">
          <h4>Performance Metrics</h4>
          <div id="performance-stats">
            <div>Render Time: <span id="render-time-display">--</span></div>
            <div>Frame Rate: <span id="frame-rate-display">--</span></div>
            <div>Cells Updated: <span id="cells-updated-display">--</span></div>
            <div>Cache Efficiency: <span id="cache-efficiency-display">--</span></div>
            <div>Virtual DOM Diffs: <span id="vdom-diffs-display">--</span></div>
            <div>Memory Usage: <span id="memory-usage-display">--</span></div>
          </div>
        </div>
        
        <div class="stat-group">
          <h4>Camera Position</h4>
          <div id="camera-stats">
            <div>X: <span id="camera-x-display">0</span></div>
            <div>Y: <span id="camera-y-display">0</span></div>
            <div>Viewport: <span id="viewport-display">60x20</span></div>
          </div>
        </div>
      </div>
    `;
    
    // Create demo controls
    const demoControls = document.createElement('div');
    demoControls.id = 'demo-controls';
    demoControls.style.cssText = `
      background-color: #2a2a2a;
      border: 1px solid #444;
      border-radius: 8px;
      padding: 15px;
      margin-top: 10px;
    `;
    
    demoControls.innerHTML = `
      <h3>Demo Controls</h3>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button id="demo-fire" class="demo-btn">🔥 Fire Caverns</button>
        <button id="demo-ice" class="demo-btn">❄️ Ice Caves</button>
        <button id="demo-shadow" class="demo-btn">🌑 Shadow Crypts</button>
        <button id="demo-ruins" class="demo-btn">🏛️ Ancient Ruins</button>
        <button id="demo-forest" class="demo-btn">🌲 Living Forest</button>
        <button id="demo-lab" class="demo-btn">🧪 Laboratory</button>
        <button id="demo-nexus" class="demo-btn">⚡ Elemental Nexus</button>
        <button id="demo-underdark" class="demo-btn">🕳️ Underdark</button>
      </div>
      <div style="margin-top: 10px; display: flex; gap: 10px;">
        <button id="demo-bsp" class="demo-btn">BSP Algorithm</button>
        <button id="demo-cellular" class="demo-btn">Cellular Automata</button>
        <button id="demo-hybrid" class="demo-btn">Hybrid Algorithm</button>
      </div>
      <div style="margin-top: 10px;">
        <button id="demo-large" class="demo-btn">Large Dungeon (300x150)</button>
        <button id="demo-small" class="demo-btn">Small Dungeon (100x50)</button>
        <button id="performance-test" class="demo-btn">Performance Test</button>
      </div>
    `;
    
    // Assemble the layout
    gameArea.appendChild(gameContainer);
    gameArea.appendChild(infoPanel);
    
    mainContainer.appendChild(header);
    mainContainer.appendChild(controlsContainer);
    mainContainer.appendChild(gameArea);
    mainContainer.appendChild(demoControls);
    
    body.appendChild(mainContainer);
    
    // Add CSS styles
    this.addDemoStyles();
  }

  /**
   * Add CSS styles for the demo
   */
  private addDemoStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      body {
        margin: 0;
        padding: 0;
        background-color: #1a1a1a;
        color: #ffffff;
        font-family: 'Courier New', monospace;
      }
      
      .stat-group {
        margin-bottom: 15px;
        padding: 10px;
        background-color: #1a1a1a;
        border-radius: 4px;
      }
      
      .stat-group h4 {
        margin: 0 0 8px 0;
        color: #00ff00;
        border-bottom: 1px solid #333;
        padding-bottom: 4px;
      }
      
      .stat-group div {
        margin-bottom: 4px;
        display: flex;
        justify-content: space-between;
        font-size: 0.9em;
      }
      
      .stat-group span {
        color: #00ff00;
        font-weight: bold;
      }
      
      .demo-btn {
        background: #0066cc;
        border: none;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-family: inherit;
        font-size: 0.9em;
        transition: background-color 0.2s;
      }
      
      .demo-btn:hover {
        background: #0080ff;
      }
      
      .demo-btn:active {
        background: #004499;
      }
      
      h1 {
        color: #00ff00;
        margin: 0 0 10px 0;
      }
      
      h3 {
        color: #00ff00;
        margin: 0 0 10px 0;
        border-bottom: 1px solid #333;
        padding-bottom: 5px;
      }
      
      @media (max-width: 768px) {
        #main-container {
          padding: 5px;
        }
        
        #game-area {
          flex-direction: column;
        }
        
        #info-panel {
          width: auto;
          max-height: 300px;
        }
        
        .demo-btn {
          font-size: 0.8em;
          padding: 6px 10px;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Generate initial dungeon with default settings
   */
  private async generateInitialDungeon(): Promise<void> {
    const defaultConfig: Partial<DungeonConfig> = {
      size: { width: 200, height: 100 },
      algorithm: 'bsp',
      theme: 'ancient_ruins'
    };
    
    await this.gameRenderer.generateProceduralDungeon(defaultConfig);
    this.updateSystemStats();
  }

  /**
   * Set up demo control button handlers
   */
  private setupDemoControls(): void {
    // Theme buttons
    const themeButtons = [
      { id: 'demo-fire', theme: 'fire_caverns' as DungeonThemeType },
      { id: 'demo-ice', theme: 'ice_crystal_caves' as DungeonThemeType },
      { id: 'demo-shadow', theme: 'shadow_crypts' as DungeonThemeType },
      { id: 'demo-ruins', theme: 'ancient_ruins' as DungeonThemeType },
      { id: 'demo-forest', theme: 'living_forest' as DungeonThemeType },
      { id: 'demo-lab', theme: 'aberrant_laboratory' as DungeonThemeType },
      { id: 'demo-nexus', theme: 'elemental_nexus' as DungeonThemeType },
      { id: 'demo-underdark', theme: 'underdark_passages' as DungeonThemeType }
    ];
    
    themeButtons.forEach(({ id, theme }) => {
      const button = document.getElementById(id);
      if (button) {
        button.addEventListener('click', async () => {
          await this.switchToTheme(theme);
        });
      }
    });
    
    // Algorithm buttons
    const algorithmButtons = [
      { id: 'demo-bsp', algorithm: 'bsp' as AlgorithmType },
      { id: 'demo-cellular', algorithm: 'cellular_automata' as AlgorithmType },
      { id: 'demo-hybrid', algorithm: 'hybrid' as AlgorithmType }
    ];
    
    algorithmButtons.forEach(({ id, algorithm }) => {
      const button = document.getElementById(id);
      if (button) {
        button.addEventListener('click', async () => {
          await this.switchToAlgorithm(algorithm);
        });
      }
    });
    
    // Size buttons
    document.getElementById('demo-large')?.addEventListener('click', async () => {
      await this.generateDungeonWithSize(300, 150);
    });
    
    document.getElementById('demo-small')?.addEventListener('click', async () => {
      await this.generateDungeonWithSize(100, 50);
    });
    
    // Performance test button
    document.getElementById('performance-test')?.addEventListener('click', () => {
      this.runPerformanceTest();
    });
  }

  /**
   * Switch to a specific theme
   */
  private async switchToTheme(theme: DungeonThemeType): Promise<void> {
    try {
      if (this.gameRenderer.isDynamicDungeonActive()) {
        await this.gameRenderer.switchDungeonTheme(theme);
      } else {
        await this.gameRenderer.regenerateDungeon(undefined, theme);
      }
      this.updateSystemStats();
    } catch (error) {
      console.error('Failed to switch theme:', error);
    }
  }

  /**
   * Switch to a specific algorithm
   */
  private async switchToAlgorithm(algorithm: AlgorithmType): Promise<void> {
    try {
      await this.gameRenderer.regenerateDungeon(algorithm);
      this.updateSystemStats();
    } catch (error) {
      console.error('Failed to switch algorithm:', error);
    }
  }

  /**
   * Generate dungeon with specific size
   */
  private async generateDungeonWithSize(width: number, height: number): Promise<void> {
    try {
      const config: Partial<DungeonConfig> = {
        size: { width, height },
        algorithm: 'bsp',
        theme: 'ancient_ruins'
      };
      
      await this.gameRenderer.generateProceduralDungeon(config);
      this.updateSystemStats();
    } catch (error) {
      console.error('Failed to generate dungeon with size:', error);
    }
  }

  /**
   * Update system statistics display
   */
  private updateSystemStats(): void {
    const dungeonInfo = this.gameRenderer.getDungeonInfo();
    const metrics = this.gameRenderer.getRenderingMetrics();
    const visualizer = this.gameRenderer.getDungeonVisualizer();
    const camera = visualizer.getCameraPosition();
    const viewport = visualizer.getViewport();
    
    // Update dungeon stats
    document.getElementById('current-theme-display')!.textContent = dungeonInfo.theme;
    document.getElementById('current-size-display')!.textContent = `${dungeonInfo.size.width}x${dungeonInfo.size.height}`;
    document.getElementById('current-rooms-display')!.textContent = dungeonInfo.rooms.toString();
    
    // Update performance stats
    document.getElementById('render-time-display')!.textContent = `${metrics.renderTime?.toFixed(2) || 0}ms`;
    document.getElementById('frame-rate-display')!.textContent = `${metrics.frameRate?.toFixed(1) || 0} fps`;
    document.getElementById('cells-updated-display')!.textContent = metrics.cellsUpdated?.toString() || '0';
    document.getElementById('cache-efficiency-display')!.textContent = `${(metrics.cacheHitRate * 100)?.toFixed(1) || 0}%`;
    document.getElementById('vdom-diffs-display')!.textContent = metrics.virtualDomDiffs?.toString() || '0';
    document.getElementById('memory-usage-display')!.textContent = `${(metrics.memoryUsage / 1024)?.toFixed(1) || 0}KB`;
    
    // Update camera stats
    document.getElementById('camera-x-display')!.textContent = camera.x.toFixed(1);
    document.getElementById('camera-y-display')!.textContent = camera.y.toFixed(1);
    document.getElementById('viewport-display')!.textContent = `${viewport.width}x${viewport.height}`;
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    setInterval(() => {
      this.updateSystemStats();
    }, 1000);
  }

  /**
   * Run performance test
   */
  private async runPerformanceTest(): Promise<void> {
    console.log('🚀 Starting performance test...');
    
    const testConfigs: Array<{ name: string; config: Partial<DungeonConfig> }> = [
      { name: 'Small BSP', config: { size: { width: 60, height: 40 }, algorithm: 'bsp' } },
      { name: 'Medium Cellular', config: { size: { width: 150, height: 80 }, algorithm: 'cellular_automata' } },
      { name: 'Large Hybrid', config: { size: { width: 300, height: 150 }, algorithm: 'hybrid' } },
      { name: 'Extra Large BSP', config: { size: { width: 400, height: 200 }, algorithm: 'bsp' } }
    ];
    
    const results = [];
    
    for (const { name, config } of testConfigs) {
      console.log(`Testing ${name}...`);
      const startTime = performance.now();
      
      try {
        await this.gameRenderer.generateProceduralDungeon(config);
        const endTime = performance.now();
        const generationTime = endTime - startTime;
        
        // Get rendering metrics after a brief delay
        await new Promise(resolve => setTimeout(resolve, 100));
        const metrics = this.gameRenderer.getRenderingMetrics();
        
        results.push({
          name,
          generationTime: generationTime.toFixed(2),
          renderTime: metrics.renderTime?.toFixed(2) || '0',
          cellsUpdated: metrics.cellsUpdated || 0,
          frameRate: metrics.frameRate?.toFixed(1) || '0'
        });
        
      } catch (error) {
        console.error(`Failed test ${name}:`, error);
        results.push({
          name,
          generationTime: 'FAILED',
          renderTime: 'FAILED',
          cellsUpdated: 0,
          frameRate: '0'
        });
      }
    }
    
    // Display results
    console.table(results);
    alert('Performance test complete! Check console for detailed results.');
  }

  /**
   * Handle dungeon generated event
   */
  private handleDungeonGenerated(config: DungeonConfig): void {
    console.log('Dungeon generated:', config);
    this.updateSystemStats();
  }

  /**
   * Handle theme changed event
   */
  private handleThemeChanged(theme: DungeonThemeType): void {
    console.log('Theme changed to:', theme);
    this.updateSystemStats();
  }

  /**
   * Handle algorithm changed event
   */
  private handleAlgorithmChanged(algorithm: AlgorithmType): void {
    console.log('Algorithm changed to:', algorithm);
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.dungeonControls) {
      this.dungeonControls.cleanup();
    }
    this.gameRenderer.cleanup();
    this.isInitialized = false;
  }
}

// Auto-initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const demo = new DungeonIntegrationExample();
    await demo.initialize();
    
    // Make it available globally for debugging
    (window as any).dungeonDemo = demo;
    
  } catch (error) {
    console.error('Failed to initialize dungeon demo:', error);
    document.body.innerHTML = `
      <div style="color: red; padding: 20px; text-align: center;">
        <h1>Failed to Initialize Dungeon System</h1>
        <p>Error: ${error}</p>
        <p>Please check the console for more details.</p>
      </div>
    `;
  }
});