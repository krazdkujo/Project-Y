import { Player, Position, PlayerId } from '../shared/types';
import { FogOfWarManager } from './FogOfWarManager';
import {
  CellVisibilityState,
  FogRenderingData,
  FogColorConfig,
  DEFAULT_FOG_COLORS,
  PositionUtils
} from '../shared/VisionTypes';
import { DungeonVisualizationManager } from './DungeonVisualizationManager.js';
import {
  DungeonConfig,
  DungeonThemeType,
  AlgorithmType,
  CellType
} from '../shared/DungeonTypes.js';

/**
 * ASCII game renderer for the AP System
 * Handles 60x20 map display and 20x20 stats panel with proper ASCII character rendering
 */
export class GameRenderer {
  private mapWidth = 60;
  private mapHeight = 20;
  private statsWidth = 20;
  private statsHeight = 20;
  
  // Game state
  private players: Map<PlayerId, Player> = new Map();
  private gameMap: string[][] = [];
  private currentPlayerId: PlayerId | null = null;
  
  // Fog of War system
  private fogOfWarManager: FogOfWarManager | null = null;
  private fogRenderingEnabled: boolean = true;
  private fogColors: FogColorConfig = DEFAULT_FOG_COLORS;
  
  // Dungeon Visualization System
  private dungeonVisualizer: DungeonVisualizationManager;
  private isDynamicDungeon: boolean = false;
  private currentDungeonConfig: DungeonConfig | null = null;
  
  // Performance optimization (Context7-inspired)
  private fogRenderCache: Map<string, HTMLElement> = new Map();
  private fogUpdateQueue: Set<string> = new Set();
  private fogRenderingActive: boolean = false;
  private lastFogUpdate: number = 0;
  private fogPerformanceMetrics = {
    cellsUpdated: 0,
    lastUpdateTime: 0,
    averageUpdateTime: 0,
    totalUpdates: 0
  };
  
  // Advanced Context7 performance patterns
  private fogUpdateSchedulerId: number | null = null;
  private visibilityStateCache: Map<string, CellVisibilityState> = new Map();
  private renderBatchSize: number = 100; // Batch render updates for better performance
  private frameSkipCounter: number = 0;
  private fogRenderThrottleMs: number = 16; // ~60fps throttling
  
  /**
   * Safe access to gameMap with bounds checking
   */
  private getMapCell(x: number, y: number): string | undefined {
    return this.gameMap[y]?.[x];
  }
  
  /**
   * Safe setting of gameMap with bounds checking
   */
  private setMapCell(x: number, y: number, value: string): void {
    if (y >= 0 && y < this.mapHeight && x >= 0 && x < this.mapWidth) {
      const row = this.gameMap[y];
      if (row) {
        row[x] = value;
      }
    }
  }
  
  // Display elements
  private readonly MAP_CANVAS_ID = 'game-map-canvas';
  private readonly STATS_PANEL_ID = 'stats-panel';
  private readonly MINIMAP_ID = 'minimap';
  
  // ASCII character mappings
  private readonly TERRAIN_CHARS = {
    FLOOR: '.',
    WALL: '#',
    DOOR: '+',
    STAIRS_UP: '<',
    STAIRS_DOWN: '>',
    WATER: '~',
    LAVA: '^',
    TREE: 'T',
    ROCK: '*',
    CHEST: '&'
  };
  
  private readonly ENTITY_CHARS = {
    PLAYER: '@',
    ENEMY: 'E',
    NPC: 'N',
    ITEM: '!',
    CHEST: '&',
    TRAP: '^'
  };
  
  // Color mappings for ASCII display
  private readonly COLORS = {
    PLAYER: '#00ff00',      // Bright green
    CURRENT_PLAYER: '#ffff00', // Bright yellow
    ENEMY: '#ff0000',       // Red
    NPC: '#00ffff',         // Cyan
    WALL: '#808080',        // Gray
    FLOOR: '#404040',       // Dark gray
    ITEM: '#ff00ff',        // Magenta
    WATER: '#0080ff',       // Blue
    LAVA: '#ff8000',        // Orange
    TREE: '#008000',        // Dark green
    BACKGROUND: '#000000',  // Black
    
    // Fog of War colors
    FOG_UNEXPLORED: '#000000',    // Black - completely unexplored
    FOG_REMEMBERED: '#202020',    // Very dark gray - previously seen
    FOG_VISIBLE: 'transparent',   // Transparent - currently visible
    FOG_OVERLAY: '#000000'        // Black overlay for fog effects
  };

  constructor() {
    this.initializeRenderer();
    
    // Initialize dungeon visualization system
    this.dungeonVisualizer = new DungeonVisualizationManager(this.mapWidth, this.mapHeight);
    
    // Generate default map (fallback for legacy compatibility)
    this.generateDefaultMap();
    this.initializeFogOfWar();
  }

  /**
   * Initialize the renderer and create display elements
   */
  private initializeRenderer(): void {
    this.createMapCanvas();
    this.createStatsPanel();
    this.createMinimap();
    this.createFogOfWarControls();
  }

  /**
   * Create the main map canvas
   */
  private createMapCanvas(): void {
    const canvas = document.createElement('div');
    canvas.id = this.MAP_CANVAS_ID;
    canvas.className = 'game-map-canvas';
    canvas.style.cssText = `
      width: ${this.mapWidth}ch;
      height: ${this.mapHeight}em;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      line-height: 1;
      background-color: ${this.COLORS.BACKGROUND};
      color: ${this.COLORS.FLOOR};
      white-space: pre;
      overflow: hidden;
      border: 1px solid #333;
      position: relative;
    `;
    
    // Create grid for characters
    for (let y = 0; y < this.mapHeight; y++) {
      const row = document.createElement('div');
      row.className = 'map-row';
      row.style.cssText = `
        height: 1em;
        width: 100%;
        position: relative;
      `;
      
      for (let x = 0; x < this.mapWidth; x++) {
        const cell = document.createElement('span');
        cell.className = 'map-cell';
        cell.id = `cell-${x}-${y}`;
        cell.style.cssText = `
          position: absolute;
          left: ${x}ch;
          top: 0;
          width: 1ch;
          height: 1em;
        `;
        cell.textContent = '.';
        row.appendChild(cell);
      }
      
      canvas.appendChild(row);
    }
    
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.appendChild(canvas);
    }
  }

  /**
   * Create the stats panel
   */
  private createStatsPanel(): void {
    const panel = document.createElement('div');
    panel.id = this.STATS_PANEL_ID;
    panel.className = 'stats-panel';
    panel.style.cssText = `
      width: ${this.statsWidth}ch;
      height: ${this.statsHeight}em;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.2;
      background-color: ${this.COLORS.BACKGROUND};
      color: #ffffff;
      border: 1px solid #333;
      padding: 5px;
      overflow-y: auto;
      white-space: pre;
    `;
    
    panel.innerHTML = this.generateStatsDisplay();
    
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.appendChild(panel);
    }
  }

  /**
   * Create fog of war controls panel
   */
  private createFogOfWarControls(): void {
    const uiContainer = document.getElementById('ui-container');
    if (!uiContainer) return;

    const fogControlsPanel = document.createElement('div');
    fogControlsPanel.className = 'fog-controls';
    fogControlsPanel.innerHTML = `
      <div class="control-header">🌫️ Fog of War</div>
      
      <div class="fog-toggle">
        <label for="fog-enabled">Enable Fog</label>
        <div class="fog-switch">
          <input type="checkbox" id="fog-enabled" ${this.fogRenderingEnabled ? 'checked' : ''}>
          <span class="fog-slider"></span>
        </div>
      </div>
      
      <div class="vision-settings ${this.fogRenderingEnabled ? 'active' : ''}" id="vision-settings">
        <div class="vision-setting">
          <label for="vision-radius">Vision Range</label>
          <input type="range" id="vision-radius" min="3" max="15" value="8">
          <span class="vision-value" id="vision-radius-value">8</span>
        </div>
        
        <div class="vision-setting">
          <label for="fog-transparency">Remembered Alpha</label>
          <input type="range" id="fog-transparency" min="10" max="90" value="60">
          <span class="vision-value" id="fog-transparency-value">60%</span>
        </div>
      </div>
      
      <div class="fog-actions">
        <button class="fog-btn" id="fog-refresh">Refresh</button>
        <button class="fog-btn" id="fog-debug" title="Show debug info">Debug</button>
        <button class="fog-btn" id="fog-reset" title="Reset to defaults">Reset</button>
      </div>
      
      <div class="fog-performance" id="fog-performance">
        <div class="fog-metric">
          <span>Cells Updated:</span>
          <span class="value">0</span>
        </div>
        <div class="fog-metric">
          <span>Render Time:</span>
          <span class="value">0ms</span>
        </div>
        <div class="fog-metric">
          <span>Avg Time:</span>
          <span class="value">0ms</span>
        </div>
      </div>
    `;

    // Add event listeners
    const fogToggle = fogControlsPanel.querySelector('#fog-enabled') as HTMLInputElement;
    const visionSettings = fogControlsPanel.querySelector('#vision-settings') as HTMLElement;
    const visionRadius = fogControlsPanel.querySelector('#vision-radius') as HTMLInputElement;
    const visionRadiusValue = fogControlsPanel.querySelector('#vision-radius-value') as HTMLElement;
    const fogTransparency = fogControlsPanel.querySelector('#fog-transparency') as HTMLInputElement;
    const fogTransparencyValue = fogControlsPanel.querySelector('#fog-transparency-value') as HTMLElement;
    
    const refreshBtn = fogControlsPanel.querySelector('#fog-refresh') as HTMLButtonElement;
    const debugBtn = fogControlsPanel.querySelector('#fog-debug') as HTMLButtonElement;
    const resetBtn = fogControlsPanel.querySelector('#fog-reset') as HTMLButtonElement;

    // Fog toggle handler
    fogToggle.addEventListener('change', (e) => {
      const enabled = (e.target as HTMLInputElement).checked;
      this.setFogOfWarEnabled(enabled);
      
      if (enabled) {
        visionSettings.classList.add('active');
      } else {
        visionSettings.classList.remove('active');
      }
    });

    // Vision radius handler
    visionRadius.addEventListener('input', (e) => {
      const value = parseInt((e.target as HTMLInputElement).value);
      visionRadiusValue.textContent = value.toString();
      
      // Update vision radius for current player
      if (this.currentPlayerId && this.fogOfWarManager) {
        const player = this.players.get(this.currentPlayerId);
        if (player) {
          // Remove and re-add player with new vision radius
          this.fogOfWarManager.removePlayer(this.currentPlayerId);
          this.fogOfWarManager.addPlayer(this.currentPlayerId, player.position, value);
        }
      }
    });

    // Fog transparency handler
    fogTransparency.addEventListener('input', (e) => {
      const value = parseInt((e.target as HTMLInputElement).value);
      fogTransparencyValue.textContent = `${value}%`;
      
      // Update CSS custom property for fog transparency
      document.documentElement.style.setProperty('--fog-remembered-opacity', (value / 100).toString());
      this.renderMap(); // Re-render with new transparency
    });

    // Button handlers
    refreshBtn.addEventListener('click', () => {
      this.refreshFogOfWar();
      this.updateFogPerformanceDisplay();
    });

    debugBtn.addEventListener('click', () => {
      this.toggleFogDebugMode();
    });

    resetBtn.addEventListener('click', () => {
      this.resetFogOfWarSettings();
      
      // Update UI controls
      fogToggle.checked = true;
      visionRadius.value = '8';
      visionRadiusValue.textContent = '8';
      fogTransparency.value = '60';
      fogTransparencyValue.textContent = '60%';
      visionSettings.classList.add('active');
    });

    uiContainer.appendChild(fogControlsPanel);
    
    // Initial performance display update
    this.updateFogPerformanceDisplay();
    
    // Set up performance display updates
    setInterval(() => {
      this.updateFogPerformanceDisplay();
    }, 1000);
  }

  /**
   * Create minimap for overview
   */
  private createMinimap(): void {
    const minimap = document.createElement('div');
    minimap.id = this.MINIMAP_ID;
    minimap.className = 'minimap';
    minimap.style.cssText = `
      width: 120px;
      height: 80px;
      font-family: 'Courier New', monospace;
      font-size: 6px;
      line-height: 1;
      background-color: ${this.COLORS.BACKGROUND};
      color: ${this.COLORS.FLOOR};
      border: 1px solid #333;
      overflow: hidden;
      white-space: pre;
    `;
    
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.appendChild(minimap);
    }
  }

  /**
   * Generate a procedural dungeon using the visualization system
   */
  async generateProceduralDungeon(config: Partial<DungeonConfig> = {}): Promise<void> {
    // Default configuration for procedural dungeons
    const defaultConfig: DungeonConfig = {
      size: { width: 200, height: 100 },
      algorithm: 'bsp',
      theme: 'ancient_ruins',
      seed: Math.floor(Math.random() * 1000000),
      ...config
    };
    
    this.currentDungeonConfig = defaultConfig;
    
    try {
      // Generate dungeon using the visualization system
      await this.dungeonVisualizer.generateDungeon(defaultConfig);
      
      // Enable dynamic dungeon mode
      this.isDynamicDungeon = true;
      
      // Update camera to follow players
      if (this.currentPlayerId) {
        const player = this.players.get(this.currentPlayerId);
        if (player) {
          this.dungeonVisualizer.updateCamera(player.position, true);
        }
      }
      
      // Render the dungeon to the map canvas
      await this.renderDynamicDungeon();
      
      console.log('Procedural dungeon generated:', {
        size: `${defaultConfig.size.width}x${defaultConfig.size.height}`,
        theme: defaultConfig.theme,
        algorithm: defaultConfig.algorithm
      });
      
    } catch (error) {
      console.error('Failed to generate procedural dungeon:', error);
      // Fall back to static map
      this.generateDefaultMap();
    }
  }
  
  /**
   * Switch dungeon theme dynamically
   */
  async switchDungeonTheme(theme: DungeonThemeType): Promise<void> {
    if (!this.isDynamicDungeon) {
      console.warn('Cannot switch theme: not using dynamic dungeon');
      return;
    }
    
    try {
      await this.dungeonVisualizer.switchTheme(theme);
      await this.renderDynamicDungeon();
      console.log(`Switched to theme: ${theme}`);
    } catch (error) {
      console.error('Failed to switch theme:', error);
    }
  }
  
  /**
   * Generate a new dungeon with different algorithm
   */
  async regenerateDungeon(algorithm?: AlgorithmType, theme?: DungeonThemeType): Promise<void> {
    if (!this.currentDungeonConfig) {
      console.warn('No current dungeon config to regenerate from');
      return;
    }
    
    const newConfig: DungeonConfig = {
      ...this.currentDungeonConfig,
      ...(algorithm && { algorithm }),
      ...(theme && { theme }),
      seed: Math.floor(Math.random() * 1000000) // Always use new seed for regeneration
    };
    
    await this.generateProceduralDungeon(newConfig);
  }
  
  /**
   * Render dynamic dungeon using visualization system
   */
  private async renderDynamicDungeon(): Promise<void> {
    if (!this.isDynamicDungeon) return;
    
    try {
      await this.dungeonVisualizer.renderToContainer('game-container');
      
      // Update minimap for dynamic dungeon
      this.renderDynamicMinimap();
      
    } catch (error) {
      console.error('Failed to render dynamic dungeon:', error);
    }
  }
  
  /**
   * Render minimap for dynamic dungeon
   */
  private renderDynamicMinimap(): void {
    const minimap = document.getElementById(this.MINIMAP_ID);
    if (!minimap) return;
    
    const dungeonInfo = this.dungeonVisualizer.getDungeonInfo();
    if (!dungeonInfo) return;
    
    const camera = this.dungeonVisualizer.getCameraPosition();
    const viewport = this.dungeonVisualizer.getViewport();
    
    // Calculate minimap scale (show 1/4 of the dungeon)
    const scaleX = Math.ceil(dungeonInfo.size.width / 40);
    const scaleY = Math.ceil(dungeonInfo.size.height / 20);
    
    let minimapContent = '';
    
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 40; x++) {
        const worldX = x * scaleX;
        const worldY = y * scaleY;
        
        // Check if this is the viewport area
        if (worldX >= viewport.x && worldX < viewport.x + viewport.width &&
            worldY >= viewport.y && worldY < viewport.y + viewport.height) {
          minimapContent += '\u25a1'; // Viewport indicator
        } else {
          // Show dungeon structure (simplified)
          minimapContent += '\u00b7';
        }
      }
      minimapContent += '\n';
    }
    
    minimap.textContent = minimapContent;
    minimap.style.color = '#00ff00';
  }
  
  /**
   * Generate a default dungeon map (legacy fallback)
   */
  private generateDefaultMap(): void {
    this.isDynamicDungeon = false;
    // Initialize map with floors
    this.gameMap = [];
    for (let y = 0; y < this.mapHeight; y++) {
      this.gameMap[y] = [];
      for (let x = 0; x < this.mapWidth; x++) {
        this.gameMap[y]![x] = this.TERRAIN_CHARS.FLOOR;
      }
    }
    
    // Add walls around the border
    for (let x = 0; x < this.mapWidth; x++) {
      this.gameMap[0]![x] = this.TERRAIN_CHARS.WALL;
      this.gameMap[this.mapHeight - 1]![x] = this.TERRAIN_CHARS.WALL;
    }
    
    for (let y = 0; y < this.mapHeight; y++) {
      this.gameMap[y]![0] = this.TERRAIN_CHARS.WALL;
      this.gameMap[y]![this.mapWidth - 1] = this.TERRAIN_CHARS.WALL;
    }
    
    // Add some interior walls to create rooms
    this.addRoom(5, 3, 15, 8);
    this.addRoom(25, 5, 20, 10);
    this.addRoom(10, 12, 12, 6);
    this.addRoom(35, 2, 18, 12);
    
    // Add corridors
    this.addCorridor(20, 7, 25, 7);
    this.addCorridor(15, 11, 25, 11);
    this.addCorridor(45, 14, 45, 18);
    
    // Add doors
    this.gameMap[7]![25] = this.TERRAIN_CHARS.DOOR;
    this.gameMap[11]![25] = this.TERRAIN_CHARS.DOOR;
    this.gameMap[14]![45] = this.TERRAIN_CHARS.DOOR;
    
    // Add some decorative elements
    this.gameMap[5]![10] = this.TERRAIN_CHARS.TREE;
    this.gameMap[6]![35] = this.TERRAIN_CHARS.ROCK;
    this.gameMap[15]![8] = this.TERRAIN_CHARS.CHEST;
    this.gameMap[8]![40] = this.TERRAIN_CHARS.STAIRS_DOWN;
    
    // Add water feature
    for (let x = 48; x < 55; x++) {
      for (let y = 16; y < 19; y++) {
        this.gameMap[y]![x] = this.TERRAIN_CHARS.WATER;
      }
    }
    
    this.renderMap();
    
    // Initialize fog of war after map is generated
    if (!this.fogOfWarManager) {
      this.initializeFogOfWar();
    }
    
    // Activate fog rendering for visual integration
    this.fogRenderingActive = true;
  }

  /**
   * Initialize fog of war system
   */
  private initializeFogOfWar(): void {
    if (this.gameMap.length === 0) {
      console.warn('Cannot initialize fog of war: game map not generated yet');
      return;
    }
    
    this.fogOfWarManager = new FogOfWarManager(
      this.mapWidth,
      this.mapHeight,
      this.gameMap
    );
    
    // Register for fog updates
    this.fogOfWarManager.onUpdate((update) => {
      this.handleFogUpdate(update);
    });
  }
  
  /**
   * Handle fog of war updates with performance optimization
   * Applies Context7 patterns for efficient DOM updates
   */
  private handleFogUpdate(update: any): void {
    const startTime = performance.now();
    
    // Only process if fog rendering is active
    if (!this.fogRenderingActive) return;
    
    // Always use batched rendering for consistency and performance
    // Context7 pattern: Consistent rendering pipeline regardless of update type
    this.scheduleFogUpdate();
    
    // Track performance metrics
    const updateTime = performance.now() - startTime;
    this.updateFogPerformanceMetrics(updateTime);
  }
  
  /**
   * Schedule fog update using RAF for optimal performance (Context7 pattern)
   * Enhanced with throttling and batching for multiplayer scenarios
   */
  private scheduleFogUpdate(): void {
    // Cancel existing update if scheduled
    if (this.fogUpdateSchedulerId !== null) {
      cancelAnimationFrame(this.fogUpdateSchedulerId);
    }
    
    // Throttle updates for better performance in multiplayer
    const now = performance.now();
    if (now - this.lastFogUpdate < this.fogRenderThrottleMs) {
      // Skip this frame but schedule for next available slot
      this.frameSkipCounter++;
      setTimeout(() => this.scheduleFogUpdate(), this.fogRenderThrottleMs);
      return;
    }
    
    this.fogUpdateSchedulerId = requestAnimationFrame(() => {
      this.renderFogChangesBatched();
      this.fogUpdateQueue.clear();
      this.fogUpdateSchedulerId = null;
      this.lastFogUpdate = now;
    });
  }
  
  /**
   * Batched fog rendering for optimal performance in multiplayer scenarios
   * Implements Context7 patterns: batching, memoization, and efficient updates
   */
  private renderFogChangesBatched(): void {
    console.time('FogRenderBatched');
    
    const startTime = performance.now();
    let cellsUpdated = 0;
    let batchCount = 0;
    
    // Get fog rendering data
    const fogData = this.fogOfWarManager?.getFogRenderingData();
    if (!fogData || !this.fogRenderingEnabled) {
      console.timeEnd('FogRenderBatched');
      return;
    }
    
    // Create array of cells that need updating for efficient iteration
    const cellsToUpdate: Array<{x: number, y: number, visibility: CellVisibilityState}> = [];
    
    // First pass: identify cells that need updates (Context7 memoization pattern)
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const cellKey = `${x}-${y}`;
        const currentVisibility = this.getCellVisibilityState(x, y);
        const cachedVisibility = this.visibilityStateCache.get(cellKey);
        
        // Only add to update queue if visibility changed (efficient diffing)
        if (cachedVisibility !== currentVisibility) {
          cellsToUpdate.push({ x, y, visibility: currentVisibility });
          this.visibilityStateCache.set(cellKey, currentVisibility);
        }
      }
    }
    
    // Second pass: batch render updates (Context7 batching pattern)
    const renderBatch = (startIndex: number) => {
      const endIndex = Math.min(startIndex + this.renderBatchSize, cellsToUpdate.length);
      
      for (let i = startIndex; i < endIndex; i++) {
        const cellUpdate = cellsToUpdate[i];
        if (cellUpdate) {
          const { x, y, visibility } = cellUpdate;
          this.renderCellWithFogOptimized(x, y, visibility);
          cellsUpdated++;
        }
      }
      
      batchCount++;
      
      // Continue with next batch if there are more cells to update
      if (endIndex < cellsToUpdate.length) {
        // Use requestIdleCallback for non-blocking updates if available
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => renderBatch(endIndex));
        } else {
          setTimeout(() => renderBatch(endIndex), 0);
        }
      } else {
        // All batches complete - update metrics
        const renderTime = performance.now() - startTime;
        this.updateFogPerformanceMetrics(renderTime, cellsUpdated, batchCount);
        console.timeEnd('FogRenderBatched');
        console.log(`Fog batched update: ${cellsUpdated} cells in ${batchCount} batches, ${renderTime.toFixed(2)}ms`);
      }
    };
    
    // Start batch rendering
    if (cellsToUpdate.length > 0) {
      renderBatch(0);
    } else {
      // No updates needed
      console.timeEnd('FogRenderBatched');
    }
  }
  
  /**
   * Render only changed fog areas using dirty region tracking
   * Implements Context7 efficient DOM manipulation patterns
   */
  private renderFogChanges(): void {
    console.time('FogRender');
    
    const startTime = performance.now();
    let cellsUpdated = 0;
    
    // Get fog rendering data
    const fogData = this.fogOfWarManager?.getFogRenderingData();
    if (!fogData || !this.fogRenderingEnabled) {
      console.timeEnd('FogRender');
      return;
    }
    
    // Use memoized cell visibility computation (Context7 useMemo pattern)
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const cellKey = `${x}-${y}`;
        const cellVisibility = this.getCellVisibilityState(x, y);
        
        // Only update if visibility changed (efficient DOM pattern)
        if (this.shouldUpdateCell(x, y, cellVisibility)) {
          this.renderCellWithFogOptimized(x, y, cellVisibility);
          cellsUpdated++;
        }
      }
    }
    
    const renderTime = performance.now() - startTime;
    
    // Update performance metrics
    this.fogPerformanceMetrics.cellsUpdated = cellsUpdated;
    this.fogPerformanceMetrics.lastUpdateTime = renderTime;
    this.fogPerformanceMetrics.totalUpdates++;
    
    // Calculate running average (Context7 performance measurement pattern)
    this.fogPerformanceMetrics.averageUpdateTime = 
      (this.fogPerformanceMetrics.averageUpdateTime * (this.fogPerformanceMetrics.totalUpdates - 1) + renderTime) 
      / this.fogPerformanceMetrics.totalUpdates;
    
    console.timeEnd('FogRender');
    console.log(`Fog update: ${cellsUpdated} cells in ${renderTime.toFixed(2)}ms`);
  }
  
  /**
   * Check if cell needs updating (memoization pattern from Context7)
   */
  private shouldUpdateCell(x: number, y: number, currentVisibility: CellVisibilityState): boolean {
    const cellKey = `${x}-${y}`;
    const cachedElement = this.fogRenderCache.get(cellKey);
    
    // If not cached, definitely needs update
    if (!cachedElement) return true;
    
    // Check if visibility state changed
    const lastVisibility = cachedElement.dataset.visibility as CellVisibilityState;
    return lastVisibility !== currentVisibility;
  }
  
  /**
   * Optimized cell rendering with caching (Context7 memo pattern)
   */
  private renderCellWithFogOptimized(x: number, y: number, visibilityState: CellVisibilityState): void {
    const cell = document.getElementById(`cell-${x}-${y}`);
    if (!cell) return;
    
    const cellKey = `${x}-${y}`;
    
    // Cache the cell element for future optimization
    this.fogRenderCache.set(cellKey, cell);
    cell.dataset.visibility = visibilityState;
    
    // Clear previous fog classes for clean state
    cell.classList.remove('fog-unexplored', 'fog-remembered', 'fog-visible');
    
    // Handle fog of war rendering with CSS classes (Context7 performance pattern)
    if (this.fogRenderingEnabled && visibilityState === 'unexplored') {
      this.renderUnexploredCellOptimized(cell, x, y);
      cell.classList.add('fog-unexplored');
      return;
    }
    
    // Check if there's a player at this position
    const playerAtPosition = this.getPlayerAtPosition(x, y);
    
    if (playerAtPosition) {
      // Only show players if cell is visible or remembered and player is current player
      if (visibilityState === 'currently_visible' || 
          (visibilityState === 'remembered' && playerAtPosition.id === this.currentPlayerId)) {
        cell.textContent = this.ENTITY_CHARS.PLAYER;
        cell.style.color = playerAtPosition.id === this.currentPlayerId ? 
          this.COLORS.CURRENT_PLAYER : this.COLORS.PLAYER;
        cell.title = `${playerAtPosition.name} (${playerAtPosition.health}/${playerAtPosition.maxHealth} HP)`;
        cell.style.backgroundColor = 'transparent';
      } else {
        this.renderRememberedCellOptimized(cell, x, y);
        cell.classList.add('fog-remembered');
        return;
      }
    } else {
      // Render terrain based on visibility
      if (visibilityState === 'currently_visible') {
        this.renderVisibleTerrainOptimized(cell, x, y);
        cell.classList.add('fog-visible');
      } else if (visibilityState === 'remembered') {
        this.renderRememberedCellOptimized(cell, x, y);
        cell.classList.add('fog-remembered');
      }
    }
    
    // Apply fog overlay using CSS classes (more performant than inline styles)
    this.applyFogOverlayOptimized(cell, visibilityState);
  }
  
  /**
   * Optimized unexplored cell rendering
   */
  private renderUnexploredCellOptimized(cell: HTMLElement, x: number, y: number): void {
    // Use efficient property setting
    if (cell.textContent !== ' ') cell.textContent = ' ';
    if (cell.style.color !== this.COLORS.FOG_UNEXPLORED) cell.style.color = this.COLORS.FOG_UNEXPLORED;
    if (cell.style.backgroundColor !== this.COLORS.FOG_UNEXPLORED) cell.style.backgroundColor = this.COLORS.FOG_UNEXPLORED;
    if (cell.title !== 'Unexplored') cell.title = 'Unexplored';
  }
  
  /**
   * Optimized remembered cell rendering
   */
  private renderRememberedCellOptimized(cell: HTMLElement, x: number, y: number): void {
    const cellData = this.fogOfWarManager?.getCellVisibility({ x, y });
    const rememberedTerrain = cellData?.rememberedTerrain || this.TERRAIN_CHARS.FLOOR;
    
    if (cell.textContent !== rememberedTerrain) cell.textContent = rememberedTerrain;
    
    const dimmedColor = this.getDimmedTerrainColor(rememberedTerrain);
    if (cell.style.color !== dimmedColor) cell.style.color = dimmedColor;
    if (cell.style.backgroundColor !== 'transparent') cell.style.backgroundColor = 'transparent';
    
    const title = `${this.getTerrainDescription(rememberedTerrain)} (remembered)`;
    if (cell.title !== title) cell.title = title;
  }
  
  /**
   * Optimized visible terrain rendering
   */
  private renderVisibleTerrainOptimized(cell: HTMLElement, x: number, y: number): void {
    const terrain = this.gameMap[y]?.[x];
    if (terrain) {
      if (cell.textContent !== terrain) cell.textContent = terrain;
      
      const terrainColor = this.getTerrainColor(terrain);
      if (cell.style.color !== terrainColor) cell.style.color = terrainColor;
      if (cell.style.backgroundColor !== 'transparent') cell.style.backgroundColor = 'transparent';
      
      const title = this.getTerrainDescription(terrain);
      if (cell.title !== title) cell.title = title;
    } else {
      if (cell.textContent !== this.TERRAIN_CHARS.FLOOR) cell.textContent = this.TERRAIN_CHARS.FLOOR;
      if (cell.style.color !== this.COLORS.FLOOR) cell.style.color = this.COLORS.FLOOR;
      if (cell.style.backgroundColor !== 'transparent') cell.style.backgroundColor = 'transparent';
      if (cell.title !== 'Floor') cell.title = 'Floor';
    }
  }
  
  /**
   * Optimized fog overlay application using CSS classes
   * Context7 pattern: Use CSS classes instead of inline styles for better performance
   */
  private applyFogOverlayOptimized(cell: HTMLElement, visibilityState: CellVisibilityState): void {
    // CSS classes handle opacity automatically, no need for inline style manipulation
    // This is more performant as the browser can optimize class-based styling
    
    // Reset any inline opacity that might interfere with CSS classes
    if (cell.style.opacity && visibilityState !== 'unexplored') {
      cell.style.opacity = '';
    }
    
    // Add appropriate fog class for CSS-based rendering
    switch (visibilityState) {
      case 'unexplored':
        // fog-unexplored class already applied in caller
        break;
      case 'remembered':
        // fog-remembered class handles opacity via CSS custom property
        break;
      case 'currently_visible':
        // fog-visible class ensures full opacity
        break;
    }
  }
  
  /**
   * Update fog performance metrics with enhanced tracking for multiplayer
   */
  private updateFogPerformanceMetrics(updateTime: number, cellsUpdated?: number, batchCount?: number): void {
    this.fogPerformanceMetrics.lastUpdateTime = updateTime;
    this.fogPerformanceMetrics.totalUpdates++;
    
    if (cellsUpdated !== undefined) {
      this.fogPerformanceMetrics.cellsUpdated = cellsUpdated;
    }
    
    // Calculate running average using exponential moving average for better responsiveness
    if (this.fogPerformanceMetrics.totalUpdates === 1) {
      this.fogPerformanceMetrics.averageUpdateTime = updateTime;
    } else {
      this.fogPerformanceMetrics.averageUpdateTime = 
        (this.fogPerformanceMetrics.averageUpdateTime * 0.85) + (updateTime * 0.15);
    }
    
    // Adaptive performance optimization for multiplayer
    this.adjustPerformanceSettings(updateTime, cellsUpdated || 0, batchCount || 1);
  }
  
  /**
   * Adaptive performance optimization for 8-player multiplayer scenarios
   * Context7 pattern: Dynamic performance adjustment based on metrics
   */
  private adjustPerformanceSettings(renderTime: number, cellsUpdated: number, batchCount: number): void {
    const playersCount = this.players.size;
    
    // Performance thresholds based on player count
    const targetFrameTime = 16.67; // 60fps
    const performanceThreshold = targetFrameTime * (1 + (playersCount * 0.1)); // Adaptive based on player count
    
    if (renderTime > performanceThreshold) {
      // Performance is suffering - reduce quality/increase batching
      if (this.renderBatchSize > 25) {
        this.renderBatchSize = Math.max(25, this.renderBatchSize - 10);
      }
      
      // Increase throttling for high player counts
      if (playersCount >= 6) {
        this.fogRenderThrottleMs = Math.min(33, this.fogRenderThrottleMs + 2); // Max 30fps for 6+ players
      }
      
      console.log(`🐌 Fog performance: Reducing batch size to ${this.renderBatchSize}, throttle: ${this.fogRenderThrottleMs}ms`);
      
    } else if (renderTime < performanceThreshold * 0.5 && this.renderBatchSize < 200) {
      // Performance is good - can increase quality
      this.renderBatchSize = Math.min(200, this.renderBatchSize + 25);
      
      if (playersCount <= 4 && this.fogRenderThrottleMs > 16) {
        this.fogRenderThrottleMs = Math.max(16, this.fogRenderThrottleMs - 2);
      }
      
      console.log(`🚀 Fog performance: Increasing batch size to ${this.renderBatchSize}, throttle: ${this.fogRenderThrottleMs}ms`);
    }
  }
  
  /**
   * Get cell visibility state from fog of war manager
   */
  private getCellVisibilityState(x: number, y: number): CellVisibilityState {
    if (!this.fogOfWarManager) return 'currently_visible';
    
    const cellData = this.fogOfWarManager.getCellVisibility({ x, y });
    return cellData?.state || 'unexplored';
  }
  
  /**
   * Render an unexplored cell (completely hidden)
   */
  private renderUnexploredCell(cell: HTMLElement, x: number, y: number): void {
    cell.textContent = ' ';
    cell.style.color = this.COLORS.FOG_UNEXPLORED;
    cell.style.backgroundColor = this.COLORS.FOG_UNEXPLORED;
    cell.title = 'Unexplored';
  }
  
  /**
   * Render a remembered cell (previously seen, now in fog)
   */
  private renderRememberedCell(cell: HTMLElement, x: number, y: number): void {
    const cellData = this.fogOfWarManager?.getCellVisibility({ x, y });
    const rememberedTerrain = cellData?.rememberedTerrain || this.TERRAIN_CHARS.FLOOR;
    
    cell.textContent = rememberedTerrain;
    cell.style.color = this.getDimmedTerrainColor(rememberedTerrain);
    cell.style.backgroundColor = 'transparent';
    cell.title = `${this.getTerrainDescription(rememberedTerrain)} (remembered)`;
  }
  
  /**
   * Render visible terrain (currently in sight)
   */
  private renderVisibleTerrain(cell: HTMLElement, x: number, y: number): void {
    const terrain = this.gameMap[y]?.[x];
    if (terrain) {
      cell.textContent = terrain;
      cell.style.color = this.getTerrainColor(terrain);
      cell.style.backgroundColor = 'transparent';
      cell.title = this.getTerrainDescription(terrain);
    } else {
      cell.textContent = this.TERRAIN_CHARS.FLOOR;
      cell.style.color = this.COLORS.FLOOR;
      cell.style.backgroundColor = 'transparent';
      cell.title = 'Floor';
    }
  }
  
  /**
   * Apply fog overlay effects based on visibility state
   */
  private applyFogOverlay(cell: HTMLElement, visibilityState: CellVisibilityState): void {
    switch (visibilityState) {
      case 'unexplored':
        // Already handled in renderUnexploredCell
        break;
      case 'remembered':
        // Apply slight opacity to show it's not currently visible
        cell.style.opacity = '0.6';
        break;
      case 'currently_visible':
        // Full visibility
        cell.style.opacity = '1.0';
        break;
    }
  }
  
  /**
   * Get dimmed color for remembered terrain
   */
  private getDimmedTerrainColor(terrain: string): string {
    const originalColor = this.getTerrainColor(terrain);
    // Convert to HSL and reduce lightness for "remembered" effect
    return this.dimColor(originalColor, 0.4);
  }
  
  /**
   * Dim a color by reducing its brightness
   */
  private dimColor(hexColor: string, factor: number): string {
    // Simple brightness reduction - in a full implementation you'd want proper HSL conversion
    const hex = hexColor.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.floor(((num >> 16) & 255) * factor);
    const g = Math.floor(((num >> 8) & 255) * factor);
    const b = Math.floor((num & 255) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Add a room to the map
   */
  private addRoom(x: number, y: number, width: number, height: number): void {
    // Draw room borders
    for (let i = x; i < x + width; i++) {
      for (let j = y; j < y + height; j++) {
        if (i === x || i === x + width - 1 || j === y || j === y + height - 1) {
          if (j >= 0 && j < this.mapHeight && i >= 0 && i < this.mapWidth) {
            this.gameMap[j]![i] = this.TERRAIN_CHARS.WALL;
          }
        } else {
          if (j >= 0 && j < this.mapHeight && i >= 0 && i < this.mapWidth) {
            this.gameMap[j]![i] = this.TERRAIN_CHARS.FLOOR;
          }
        }
      }
    }
  }

  /**
   * Add a corridor to the map
   */
  private addCorridor(x1: number, y1: number, x2: number, y2: number): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    
    for (let i = 0; i <= steps; i++) {
      const x = Math.round(x1 + (dx * i) / steps);
      const y = Math.round(y1 + (dy * i) / steps);
      
      if (x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
        this.gameMap[y]![x] = this.TERRAIN_CHARS.FLOOR;
      }
    }
  }

  /**
   * Render the entire map
   */
  private renderMap(): void {
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        this.renderCell(x, y);
      }
    }
    
    this.renderMinimap();
  }

  /**
   * Render a single cell with fog of war support
   * Uses optimized rendering when fog is active
   */
  private renderCell(x: number, y: number): void {
    const visibilityState = this.getCellVisibilityState(x, y);
    
    // Use optimized rendering if fog system is active
    if (this.fogRenderingActive) {
      this.renderCellWithFogOptimized(x, y, visibilityState);
      return;
    }
    
    // Fallback to legacy rendering
    this.renderCellLegacy(x, y, visibilityState);
  }
  
  /**
   * Legacy cell rendering method (kept for compatibility)
   */
  private renderCellLegacy(x: number, y: number, visibilityState: CellVisibilityState): void {
    const cell = document.getElementById(`cell-${x}-${y}`);
    if (!cell) return;
    
    // Handle fog of war rendering
    if (this.fogRenderingEnabled && visibilityState === 'unexplored') {
      this.renderUnexploredCell(cell, x, y);
      return;
    }
    
    // Check if there's a player at this position
    const playerAtPosition = this.getPlayerAtPosition(x, y);
    
    if (playerAtPosition) {
      // Only show players if cell is visible or remembered and player is current player
      if (visibilityState === 'currently_visible' || 
          (visibilityState === 'remembered' && playerAtPosition.id === this.currentPlayerId)) {
        cell.textContent = this.ENTITY_CHARS.PLAYER;
        cell.style.color = playerAtPosition.id === this.currentPlayerId ? 
          this.COLORS.CURRENT_PLAYER : this.COLORS.PLAYER;
        cell.title = `${playerAtPosition.name} (${playerAtPosition.health}/${playerAtPosition.maxHealth} HP)`;
      } else {
        this.renderRememberedCell(cell, x, y);
        return;
      }
    } else {
      // Render terrain based on visibility
      if (visibilityState === 'currently_visible') {
        this.renderVisibleTerrain(cell, x, y);
      } else if (visibilityState === 'remembered') {
        this.renderRememberedCell(cell, x, y);
      }
    }
    
    // Apply fog overlay if needed
    this.applyFogOverlay(cell, visibilityState);
  }

  /**
   * Get player at specific position
   */
  private getPlayerAtPosition(x: number, y: number): Player | null {
    for (const player of Array.from(this.players.values())) {
      if (player.position.x === x && player.position.y === y) {
        return player;
      }
    }
    return null;
  }

  /**
   * Get color for terrain type
   */
  private getTerrainColor(terrain: string): string {
    switch (terrain) {
      case this.TERRAIN_CHARS.WALL: return this.COLORS.WALL;
      case this.TERRAIN_CHARS.WATER: return this.COLORS.WATER;
      case this.TERRAIN_CHARS.LAVA: return this.COLORS.LAVA;
      case this.TERRAIN_CHARS.TREE: return this.COLORS.TREE;
      case this.TERRAIN_CHARS.CHEST: return this.COLORS.ITEM;
      case this.TERRAIN_CHARS.DOOR: return '#8B4513'; // Brown
      case this.TERRAIN_CHARS.STAIRS_UP: return '#FFD700'; // Gold
      case this.TERRAIN_CHARS.STAIRS_DOWN: return '#FFD700'; // Gold
      default: return this.COLORS.FLOOR;
    }
  }

  /**
   * Get description for terrain type
   */
  private getTerrainDescription(terrain: string): string {
    switch (terrain) {
      case this.TERRAIN_CHARS.FLOOR: return 'Floor';
      case this.TERRAIN_CHARS.WALL: return 'Wall';
      case this.TERRAIN_CHARS.DOOR: return 'Door';
      case this.TERRAIN_CHARS.STAIRS_UP: return 'Stairs Up';
      case this.TERRAIN_CHARS.STAIRS_DOWN: return 'Stairs Down';
      case this.TERRAIN_CHARS.WATER: return 'Water';
      case this.TERRAIN_CHARS.LAVA: return 'Lava';
      case this.TERRAIN_CHARS.TREE: return 'Tree';
      case this.TERRAIN_CHARS.ROCK: return 'Rock';
      case this.TERRAIN_CHARS.CHEST: return 'Treasure Chest';
      default: return 'Unknown';
    }
  }

  /**
   * Render the minimap
   */
  private renderMinimap(): void {
    const minimap = document.getElementById(this.MINIMAP_ID);
    if (!minimap) return;
    
    let minimapContent = '';
    
    // Scale down the map (every 3x1 cells becomes 1 character)
    for (let y = 0; y < this.mapHeight; y += 1) {
      for (let x = 0; x < this.mapWidth; x += 3) {
        const terrain = this.gameMap[y]?.[x];
        const player = this.getPlayerAtPosition(x, y);
        
        if (player) {
          minimapContent += player.id === this.currentPlayerId ? 'Y' : 'P';
        } else if (terrain === this.TERRAIN_CHARS.WALL) {
          minimapContent += '#';
        } else if (terrain === this.TERRAIN_CHARS.WATER) {
          minimapContent += '~';
        } else {
          minimapContent += '.';
        }
      }
      minimapContent += '\n';
    }
    
    minimap.textContent = minimapContent;
  }

  /**
   * Generate the stats display content
   */
  private generateStatsDisplay(): string {
    if (!this.currentPlayerId || !this.players.has(this.currentPlayerId)) {
      return `
╔══════════════════╗
║   PLAYER STATS   ║
╠══════════════════╣
║ No player data   ║
║ available        ║
╚══════════════════╝

╔══════════════════╗
║   PARTY STATUS   ║
╠══════════════════╣
║ Waiting for      ║
║ game to start... ║
╚══════════════════╝`;
    }
    
    const currentPlayer = this.players.get(this.currentPlayerId)!;
    const otherPlayers = Array.from(this.players.values()).filter(p => p.id !== this.currentPlayerId);
    
    let stats = '';
    
    // Current player stats
    stats += '╔══════════════════╗\n';
    stats += '║   PLAYER STATS   ║\n';
    stats += '╠══════════════════╣\n';
    stats += `║ Name: ${this.padString(currentPlayer.name, 10)} ║\n`;
    stats += `║ HP: ${this.padNumber(currentPlayer.health, 3)}/${this.padNumber(currentPlayer.maxHealth, 3)}     ║\n`;
    stats += `║ AP: ${this.padNumber(currentPlayer.currentAP, 3)}/8         ║\n`;
    stats += `║ Pos: (${this.padNumber(currentPlayer.position.x, 2)},${this.padNumber(currentPlayer.position.y, 2)})      ║\n`;
    stats += '╠══════════════════╣\n';
    stats += '║ Skills:          ║\n';
    stats += `║ Combat:     ${this.padNumber(currentPlayer.skills.combat, 3)} ║\n`;
    stats += `║ Swords:     ${this.padNumber(currentPlayer.skills.swords, 3)} ║\n`;
    stats += `║ Fire Magic: ${this.padNumber(currentPlayer.skills.fire_magic, 3)} ║\n`;
    stats += `║ Healing:    ${this.padNumber(currentPlayer.skills.healing_magic, 3)} ║\n`;
    stats += '╚══════════════════╝\n\n';
    
    // Party status
    stats += '╔══════════════════╗\n';
    stats += '║   PARTY STATUS   ║\n';
    stats += '╠══════════════════╣\n';
    
    if (otherPlayers.length === 0) {
      stats += '║ No other players ║\n';
      stats += '║ in party         ║\n';
    } else {
      otherPlayers.slice(0, 5).forEach(player => { // Show max 5 other players
        const name = player.name.length > 8 ? player.name.substring(0, 8) : player.name;
        const hp = `${player.health}/${player.maxHealth}`;
        stats += `║ ${this.padString(name, 8)} ${this.padString(hp, 7)} ║\n`;
      });
    }
    
    stats += '╚══════════════════╝';
    
    return stats;
  }

  /**
   * Pad string to specified length
   */
  private padString(str: string, length: number): string {
    return str.length > length ? str.substring(0, length) : str.padEnd(length);
  }

  /**
   * Pad number to specified length
   */
  private padNumber(num: number, length: number): string {
    return num.toString().padStart(length);
  }

  /**
   * Update the game display with new state
   */
  public updateGameDisplay(gameState: any): void {
    // If using dynamic dungeon, update camera position
    if (this.isDynamicDungeon && this.currentPlayerId) {
      const player = gameState.players[this.currentPlayerId] as Player;
      if (player) {
        this.dungeonVisualizer.updateCamera(player.position, true);
      }
    }

    const previousPlayers = new Set(this.players.keys());
    
    // Update players
    this.players = new Map(Object.entries(gameState.players));
    
    // Update fog of war system with new players
    if (this.fogOfWarManager) {
      const currentPlayers = new Set(this.players.keys());
      
      // Add new players to fog system
      for (const [playerId, player] of this.players) {
        if (!previousPlayers.has(playerId)) {
          this.fogOfWarManager.addPlayer(playerId, (player as Player).position);
        }
      }
      
      // Remove players who left from fog system
      for (const playerId of previousPlayers) {
        if (!currentPlayers.has(playerId)) {
          this.fogOfWarManager.removePlayer(playerId);
        }
      }
    }
    
    // Re-render based on dungeon type
    if (this.isDynamicDungeon) {
      // Re-render dynamic dungeon
      this.renderDynamicDungeon();
    } else {
      // Re-render all cells that might have changed (legacy)
      for (let y = 0; y < this.mapHeight; y++) {
        for (let x = 0; x < this.mapWidth; x++) {
          this.renderCell(x, y);
        }
      }
    }
    
    // Update stats panel
    const statsPanel = document.getElementById(this.STATS_PANEL_ID);
    if (statsPanel) {
      statsPanel.innerHTML = this.generateStatsDisplay();
    }
    
    // Update minimap
    if (this.isDynamicDungeon) {
      this.renderDynamicMinimap();
    } else {
      this.renderMinimap();
    }
  }

  /**
   * Set the current player (for highlighting and stats)
   */
  public setCurrentPlayer(playerId: PlayerId): void {
    this.currentPlayerId = playerId;
    
    // Add player to fog of war system if not already added
    const player = this.players.get(playerId);
    if (player && this.fogOfWarManager) {
      this.fogOfWarManager.addPlayer(playerId, player.position);
    }
    
    this.renderMap();
    
    const statsPanel = document.getElementById(this.STATS_PANEL_ID);
    if (statsPanel) {
      statsPanel.innerHTML = this.generateStatsDisplay();
    }
  }

  /**
   * Update a specific player's position
   */
  public updatePlayerPosition(playerId: PlayerId, oldPosition: Position, newPosition: Position): void {
    // Update camera if this is the current player in dynamic mode
    if (this.isDynamicDungeon && playerId === this.currentPlayerId) {
      this.dungeonVisualizer.updateCamera(newPosition, true);
    }

    const player = this.players.get(playerId);
    if (player) {
      player.position = newPosition;
      
      // Update fog of war if enabled
      if (this.fogOfWarManager) {
        this.fogOfWarManager.updatePlayerPosition(playerId, newPosition);
      }
      
      // Re-render based on dungeon type
      if (this.isDynamicDungeon) {
        this.renderDynamicDungeon();
      } else {
        // Re-render affected cells (legacy)
        this.renderCell(oldPosition.x, oldPosition.y);
        this.renderCell(newPosition.x, newPosition.y);
        
        // Update minimap
        this.renderMinimap();
      }
    }
  }

  /**
   * Highlight a specific position (for targeting)
   */
  public highlightPosition(x: number, y: number, color: string = '#ffff00'): void {
    const cell = document.getElementById(`cell-${x}-${y}`);
    if (cell) {
      cell.style.backgroundColor = color;
      
      // Remove highlight after 1 second
      setTimeout(() => {
        cell.style.backgroundColor = 'transparent';
      }, 1000);
    }
  }

  /**
   * Show an effect at a position (for abilities)
   */
  public showEffect(x: number, y: number, effect: string, duration: number = 500): void {
    const cell = document.getElementById(`cell-${x}-${y}`);
    if (cell) {
      const originalText = cell.textContent;
      const originalColor = cell.style.color;
      
      cell.textContent = effect;
      cell.style.color = '#ff0000';
      
      setTimeout(() => {
        cell.textContent = originalText;
        cell.style.color = originalColor;
      }, duration);
    }
  }

  /**
   * Get map dimensions
   */
  public getMapDimensions(): { width: number; height: number } {
    return { width: this.mapWidth, height: this.mapHeight };
  }

  /**
   * Check if position is walkable
   */
  public isWalkable(x: number, y: number): boolean {
    if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) {
      return false;
    }
    
    const terrain = this.gameMap[y]?.[x];
    const unwalkable = [this.TERRAIN_CHARS.WALL, this.TERRAIN_CHARS.LAVA];
    
    if (terrain && unwalkable.includes(terrain)) {
      return false;
    }
    
    // Check if another player is at this position
    return !this.getPlayerAtPosition(x, y);
  }

  /**
   * Get valid movement positions for a player
   */
  public getValidMoves(fromX: number, fromY: number): Position[] {
    const validMoves: Position[] = [];
    const directions = [
      { x: -1, y: 0 },  // Left
      { x: 1, y: 0 },   // Right
      { x: 0, y: -1 },  // Up
      { x: 0, y: 1 },   // Down
      { x: -1, y: -1 }, // Up-Left
      { x: 1, y: -1 },  // Up-Right
      { x: -1, y: 1 },  // Down-Left
      { x: 1, y: 1 }    // Down-Right
    ];
    
    for (const dir of directions) {
      const newX = fromX + dir.x;
      const newY = fromY + dir.y;
      
      if (this.isWalkable(newX, newY)) {
        validMoves.push({ x: newX, y: newY });
      }
    }
    
    return validMoves;
  }

  /**
   * Enable or disable fog of war rendering
   */
  public setFogOfWarEnabled(enabled: boolean): void {
    this.fogRenderingEnabled = enabled;
    this.renderMap(); // Re-render with new fog settings
  }

  /**
   * Get current fog of war state
   */
  public isFogOfWarEnabled(): boolean {
    return this.fogRenderingEnabled && this.fogOfWarManager !== null;
  }

  /**
   * Add a player to the fog of war system
   */
  public addPlayerToFogSystem(playerId: PlayerId, position: Position, visionRadius?: number): void {
    if (this.fogOfWarManager) {
      this.fogOfWarManager.addPlayer(playerId, position, visionRadius);
    }
  }

  /**
   * Remove a player from the fog of war system
   */
  public removePlayerFromFogSystem(playerId: PlayerId): void {
    if (this.fogOfWarManager) {
      this.fogOfWarManager.removePlayer(playerId);
    }
  }

  /**
   * Update fog of war colors
   */
  public updateFogColors(colors: Partial<FogColorConfig>): void {
    this.fogColors = { ...this.fogColors, ...colors };
    if (this.fogOfWarManager) {
      this.fogOfWarManager.updateFogColors(colors);
    }
    this.renderMap(); // Re-render with new colors
  }

  /**
   * Force refresh all fog of war calculations
   */
  public refreshFogOfWar(): void {
    if (this.fogOfWarManager) {
      this.fogOfWarManager.refreshAllVision();
    }
  }

  /**
   * Get fog of war performance metrics with rendering performance
   */
  public getFogOfWarMetrics(): Record<string, any> {
    const baseMetrics = this.fogOfWarManager?.getPerformanceMetrics() || {};
    
    return {
      ...baseMetrics,
      rendering: {
        ...this.fogPerformanceMetrics,
        cacheSize: this.fogRenderCache.size,
        updateQueueSize: this.fogUpdateQueue.size,
        renderingActive: this.fogRenderingActive
      }
    };
  }
  
  /**
   * Set fog rendering active state
   */
  public setFogRenderingActive(active: boolean): void {
    this.fogRenderingActive = active;
    if (active) {
      // Clear cache and trigger full re-render
      this.fogRenderCache.clear();
      this.renderMap();
    }
  }
  
  /**
   * Get fog rendering active state
   */
  public isFogRenderingActive(): boolean {
    return this.fogRenderingActive;
  }

  /**
   * Check if a position is visible in fog of war
   */
  public isPositionVisible(position: Position): boolean {
    if (!this.fogOfWarManager) return true;
    return this.fogOfWarManager.isPositionVisible(position);
  }

  /**
   * Check if a position has been explored in fog of war
   */
  public isPositionExplored(position: Position): boolean {
    if (!this.fogOfWarManager) return true;
    return this.fogOfWarManager.isPositionExplored(position);
  }

  /**
   * Get the fog of war manager instance (for advanced usage)
   */
  public getFogOfWarManager(): FogOfWarManager | null {
    return this.fogOfWarManager;
  }

  /**
   * Update the game turn counter for fog of war system
   */
  public advanceTurn(): void {
    if (this.fogOfWarManager) {
      this.fogOfWarManager.advanceTurn();
    }
  }

  /**
   * Update fog of war performance display
   */
  private updateFogPerformanceDisplay(): void {
    const performanceElement = document.getElementById('fog-performance');
    if (!performanceElement) return;

    const metrics = this.fogPerformanceMetrics;
    const metricsElements = performanceElement.querySelectorAll('.fog-metric .value');
    
    if (metricsElements.length >= 3) {
      metricsElements[0].textContent = metrics.cellsUpdated.toString();
      metricsElements[1].textContent = `${metrics.lastUpdateTime.toFixed(1)}ms`;
      metricsElements[2].textContent = `${metrics.averageUpdateTime.toFixed(1)}ms`;
    }
  }

  /**
   * Toggle fog of war debug mode
   */
  private fogDebugMode: boolean = false;
  
  private toggleFogDebugMode(): void {
    this.fogDebugMode = !this.fogDebugMode;
    
    if (this.fogDebugMode) {
      // Add debug information to cells
      this.showFogDebugInfo();
    } else {
      // Remove debug information
      this.hideFogDebugInfo();
    }
  }

  /**
   * Show fog debug information on cells
   */
  private showFogDebugInfo(): void {
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const cell = document.getElementById(`cell-${x}-${y}`);
        if (!cell) continue;

        const cellData = this.fogOfWarManager?.getCellVisibility({ x, y });
        if (!cellData) continue;

        // Add debug border based on visibility state
        switch (cellData.state) {
          case 'unexplored':
            cell.style.border = '1px solid #ff0000'; // Red for unexplored
            break;
          case 'remembered':
            cell.style.border = '1px solid #ffff00'; // Yellow for remembered
            break;
          case 'currently_visible':
            cell.style.border = '1px solid #00ff00'; // Green for visible
            break;
        }

        // Update title with debug info
        const debugInfo = `State: ${cellData.state}, Visible to: ${cellData.currentlyVisibleTo.size}, Explored by: ${cellData.exploredBy.size}`;
        cell.title = `${cell.title || this.getTerrainDescription(this.gameMap[y]?.[x] || '.')} | ${debugInfo}`;
      }
    }
  }

  /**
   * Hide fog debug information
   */
  private hideFogDebugInfo(): void {
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const cell = document.getElementById(`cell-${x}-${y}`);
        if (!cell) continue;

        // Remove debug border
        cell.style.border = '';
        
        // Reset title to normal
        const terrain = this.gameMap[y]?.[x] || '.';
        cell.title = this.getTerrainDescription(terrain);
      }
    }
  }

  /**
   * Get current dungeon information
   */
  public getDungeonInfo() {
    if (this.isDynamicDungeon) {
      return this.dungeonVisualizer.getDungeonInfo();
    }
    return {
      size: { width: this.mapWidth, height: this.mapHeight },
      theme: 'ancient_ruins' as DungeonThemeType,
      rooms: 4 // Static map has 4 rooms
    };
  }
  
  /**
   * Get dungeon visualization manager for external use
   */
  public getDungeonVisualizer(): DungeonVisualizationManager {
    return this.dungeonVisualizer;
  }
  
  /**
   * Check if using dynamic dungeon
   */
  public isDynamicDungeonActive(): boolean {
    return this.isDynamicDungeon;
  }
  
  /**
   * Get available themes for UI
   */
  public getAvailableThemes(): DungeonThemeType[] {
    return [
      'fire_caverns',
      'ice_crystal_caves', 
      'shadow_crypts',
      'ancient_ruins',
      'living_forest',
      'aberrant_laboratory',
      'elemental_nexus',
      'underdark_passages'
    ];
  }
  
  /**
   * Get available algorithms for UI
   */
  public getAvailableAlgorithms(): AlgorithmType[] {
    return ['bsp', 'cellular_automata', 'hybrid'];
  }
  
  /**
   * Get rendering performance metrics
   */
  public getRenderingMetrics(): any {
    if (this.isDynamicDungeon) {
      return this.dungeonVisualizer.getRenderingMetrics();
    }
    return {
      cellsRendered: this.mapWidth * this.mapHeight,
      renderTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      memoryUsage: 0,
      lastUpdate: Date.now()
    };
  }
  
  /**
   * Reset fog of war settings to defaults
   */
  private resetFogOfWarSettings(): void {
    // Reset fog system
    this.setFogOfWarEnabled(true);
    this.fogRenderingActive = true;
    
    // Reset CSS custom properties
    document.documentElement.style.setProperty('--fog-remembered-opacity', '0.6');
    
    // Update fog colors to defaults
    this.updateFogColors(DEFAULT_FOG_COLORS);
    
    // Refresh fog system if current player exists
    if (this.currentPlayerId && this.fogOfWarManager) {
      const player = this.players.get(this.currentPlayerId);
      if (player) {
        this.fogOfWarManager.removePlayer(this.currentPlayerId);
        this.fogOfWarManager.addPlayer(this.currentPlayerId, player.position, 8); // Default vision radius
      }
    }
    
    // Re-render map
    this.renderMap();
  }

  /**
   * Cleanup renderer resources with enhanced fog system cleanup
   */
  public cleanup(): void {
    // Cancel any pending fog updates
    if (this.fogUpdateSchedulerId !== null) {
      cancelAnimationFrame(this.fogUpdateSchedulerId);
      this.fogUpdateSchedulerId = null;
    }
    
    // Cleanup fog of war manager
    if (this.fogOfWarManager) {
      this.fogOfWarManager.cleanup();
      this.fogOfWarManager = null;
    }
    
    // Cleanup dungeon visualizer
    if (this.dungeonVisualizer) {
      this.dungeonVisualizer.cleanup();
    }
    
    // Clear fog caches and queues
    this.fogRenderCache.clear();
    this.fogUpdateQueue.clear();
    this.visibilityStateCache.clear();
    
    // Reset fog performance tracking
    this.fogPerformanceMetrics = {
      cellsUpdated: 0,
      lastUpdateTime: 0,
      averageUpdateTime: 0,
      totalUpdates: 0
    };
    
    // Clear any ongoing animations or timers
    const canvas = document.getElementById(this.MAP_CANVAS_ID);
    const statsPanel = document.getElementById(this.STATS_PANEL_ID);
    const minimap = document.getElementById(this.MINIMAP_ID);
    const fogControls = document.querySelector('.fog-controls');
    
    canvas?.remove();
    statsPanel?.remove();
    minimap?.remove();
    fogControls?.remove();
    
    // Clean up CSS custom properties
    document.documentElement.style.removeProperty('--fog-remembered-opacity');
  }
}