import { Player, Position, PlayerId } from '../shared/types';
import { FogOfWarManager } from './FogOfWarManager';
import {
  CellVisibilityState,
  FogRenderingData,
  FogColorConfig,
  DEFAULT_FOG_COLORS,
  PositionUtils
} from '../shared/VisionTypes';
import { DungeonVisualizationManager } from './DungeonVisualizationManager';
import {
  DungeonConfig,
  DungeonThemeType,
  AlgorithmType,
  CellType
} from '../shared/DungeonTypes';

// Import our new modular components
import { ASCIIRenderer } from './ASCIIRenderer';
import { ViewportManager } from './ViewportManager';
import { PerformanceOptimizer } from './PerformanceOptimizer';

/**
 * Refactored ASCII game renderer for the AP System
 * Now uses modular components for better maintainability
 */
export class GameRenderer {
  // Core components
  private asciiRenderer: ASCIIRenderer;
  private viewportManager: ViewportManager;
  private performanceOptimizer: PerformanceOptimizer;
  
  // Game state
  private players: Map<PlayerId, Player> = new Map();
  private gameMap: string[][] = [];
  private currentPlayerId: PlayerId | null = null;
  
  // ASCII Message system
  private messageHistory: string[] = [];
  private maxMessages = 5;
  
  // Fog of War system
  private fogOfWarManager: FogOfWarManager | null = null;
  private fogRenderingEnabled: boolean = true;
  private fogColors: FogColorConfig = DEFAULT_FOG_COLORS;
  
  // Dungeon Visualization System
  private dungeonVisualizer: DungeonVisualizationManager;
  private isDynamicDungeon: boolean = false;
  private currentDungeonConfig: DungeonConfig | null = null;
  
  // Display elements
  private readonly MAP_CANVAS_ID = 'game-map-canvas';
  private readonly STATS_PANEL_ID = 'stats-panel';
  private readonly MINIMAP_ID = 'minimap';

  constructor() {
    // Initialize core components
    this.asciiRenderer = new ASCIIRenderer(60, 20);
    this.viewportManager = new ViewportManager(60, 20);
    this.performanceOptimizer = new PerformanceOptimizer(16, 100);
    
    this.initializeRenderer();
    
    // Initialize dungeon visualization system
    this.dungeonVisualizer = new DungeonVisualizationManager({
      width: 60, height: 20, theme: 'dungeon', algorithm: 'bsp'
    });
    
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
   * Create the main game map canvas
   */
  private createMapCanvas(): void {
    const canvas = document.createElement('div');
    canvas.id = this.MAP_CANVAS_ID;
    canvas.className = 'game-map-canvas';
    canvas.style.cssText = `
      display: grid;
      grid-template-columns: repeat(60, 1ch);
      grid-template-rows: repeat(20, 1em);
      font-family: monospace;
      font-size: 16px;
      line-height: 1;
      background-color: black;
      color: white;
      border: 2px solid #00ff00;
      padding: 4px;
      overflow: hidden;
    `;

    // Create cells
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 60; x++) {
        const cell = document.createElement('span');
        cell.className = 'map-cell';
        cell.id = `cell-${x}-${y}`;
        cell.style.cssText = `
          display: inline-block;
          width: 1ch;
          height: 1em;
          text-align: center;
        `;
        cell.textContent = '.';
        
        // Add click handler for targeting
        cell.addEventListener('click', (e) => {
          const targetX = parseInt(e.target.dataset.x || '0');
          const targetY = parseInt(e.target.dataset.y || '0');
          this.handleCellClick(targetX, targetY);
        });
        
        cell.dataset.x = x.toString();
        cell.dataset.y = y.toString();
        
        canvas.appendChild(cell);
      }
    }

    // Add to game container
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
      font-family: monospace;
      font-size: 14px;
      background-color: black;
      color: #00ff00;
      border: 2px solid #00ff00;
      padding: 8px;
      height: 400px;
      overflow-y: auto;
    `;
    
    const uiContainer = document.getElementById('ui-container');
    if (uiContainer) {
      uiContainer.appendChild(panel);
    }
  }

  /**
   * Create fog of war controls
   */
  private createFogOfWarControls(): void {
    const uiContainer = document.getElementById('ui-container');
    if (!uiContainer) return;

    const fogControlsPanel = document.createElement('div');
    fogControlsPanel.className = 'fog-controls';
    fogControlsPanel.innerHTML = `
      <div class="control-header">🌫️ Fog of War</div>
      
      <div class="fog-toggle">
        <label for="fog-enabled">Enable Fog:</label>
        <div class="fog-switch">
          <input type="checkbox" id="fog-enabled" ${this.fogRenderingEnabled ? 'checked' : ''}>
          <span class="fog-slider"></span>
        </div>
      </div>
      
      <div class="vision-settings ${this.fogRenderingEnabled ? 'active' : ''}" id="vision-settings">
        <div class="vision-setting">
          <label for="vision-radius">Vision Radius:</label>
          <input type="range" id="vision-radius" min="3" max="12" value="8" step="1">
          <span class="vision-value" id="vision-radius-value">8</span>
        </div>
        
        <div class="vision-setting">
          <label for="fog-transparency">Fog Transparency:</label>
          <input type="range" id="fog-transparency" min="10" max="90" value="60" step="5">
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
          <label>Cells:</label>
          <span class="value">0</span>
        </div>
        <div class="fog-metric">
          <label>Last:</label>
          <span class="value">0ms</span>
        </div>
        <div class="fog-metric">
          <label>Avg:</label>
          <span class="value">0ms</span>
        </div>
      </div>
    `;

    // Add event listeners
    const fogEnabledToggle = fogControlsPanel.querySelector('#fog-enabled') as HTMLInputElement;
    const visionSettings = fogControlsPanel.querySelector('#vision-settings');
    
    fogEnabledToggle?.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      this.fogRenderingEnabled = target.checked;
      
      if (this.fogRenderingEnabled) {
        visionSettings?.classList.add('active');
      } else {
        visionSettings?.classList.remove('active');
      }
      
      this.renderMap();
    });

    uiContainer.appendChild(fogControlsPanel);
  }

  /**
   * Create the minimap
   */
  private createMinimap(): void {
    const minimap = document.createElement('div');
    minimap.id = this.MINIMAP_ID;
    minimap.className = 'minimap';
    minimap.style.cssText = `
      font-family: monospace;
      font-size: 8px;
      line-height: 1;
      background-color: black;
      color: #00ff00;
      border: 1px solid #00ff00;
      padding: 4px;
      width: 200px;
      height: 100px;
      white-space: pre;
      overflow: hidden;
    `;
    
    const uiContainer = document.getElementById('ui-container');
    if (uiContainer) {
      uiContainer.appendChild(minimap);
    }
  }

  /**
   * Handle cell click events
   */
  private handleCellClick(x: number, y: number): void {
    // Convert screen coordinates to world coordinates if using viewport
    const worldPos = this.viewportManager.screenToWorld({ x, y });
    console.log(`Cell clicked: screen(${x},${y}) -> world(${worldPos.x},${worldPos.y})`);
    
    // Emit click event for game logic to handle
    const clickEvent = new CustomEvent('cellClick', {
      detail: { position: worldPos }
    });
    document.dispatchEvent(clickEvent);
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
      this.gameMap[0]?.length || 60,
      this.gameMap.length || 20
    );

    // Register for fog updates
    this.fogOfWarManager.onUpdate((update) => {
      this.handleFogUpdate(update);
    });
  }

  /**
   * Handle fog of war updates with performance optimization
   */
  private handleFogUpdate(update: any): void {
    this.performanceOptimizer.scheduleUpdate('fog-update', () => {
      this.renderFogChanges();
    });
  }

  /**
   * Render fog changes using optimized rendering
   */
  private renderFogChanges(): void {
    const fogData = this.fogOfWarManager?.getFogRenderingData();
    if (!fogData || !this.fogRenderingEnabled) return;

    const visiblePositions = this.viewportManager.getVisiblePositions();
    
    for (const worldPos of visiblePositions) {
      const screenPos = this.viewportManager.worldToScreen(worldPos);
      if (!screenPos) continue;

      const cellVisibility = fogData.cellVisibility.get(`${worldPos.x},${worldPos.y}`) || 'unexplored';
      const terrain = this.gameMap[worldPos.y]?.[worldPos.x] || '.';
      
      // Find any player at this position
      const playerAtPos = Array.from(this.players.values()).find(
        p => p.position.x === worldPos.x && p.position.y === worldPos.y
      );

      this.asciiRenderer.renderCellWithFog(screenPos.x, screenPos.y, terrain, cellVisibility, playerAtPos);
    }
  }

  /**
   * Render the entire map
   */
  private renderMap(): void {
    const visiblePositions = this.viewportManager.getVisiblePositions();
    
    for (const worldPos of visiblePositions) {
      const screenPos = this.viewportManager.worldToScreen(worldPos);
      if (!screenPos) continue;

      this.renderCell(screenPos.x, screenPos.y, worldPos);
    }
    
    this.renderMinimap();
  }

  /**
   * Render a single cell
   */
  private renderCell(screenX: number, screenY: number, worldPos: Position): void {
    const cellVisibility = this.getCellVisibilityState(worldPos.x, worldPos.y);
    const terrain = this.gameMap[worldPos.y]?.[worldPos.x] || '.';
    
    // Find any player at this position
    const playerAtPos = Array.from(this.players.values()).find(
      p => p.position.x === worldPos.x && p.position.y === worldPos.y
    );

    if (this.fogRenderingEnabled) {
      this.asciiRenderer.renderCellWithFog(screenX, screenY, terrain, cellVisibility, playerAtPos);
    } else {
      this.asciiRenderer.renderCell(screenX, screenY, terrain, playerAtPos);
    }
  }

  /**
   * Get cell visibility state
   */
  private getCellVisibilityState(x: number, y: number): CellVisibilityState {
    if (this.fogOfWarManager) {
      const cellData = this.fogOfWarManager.getCellVisibility({ x, y });
      return cellData?.state || 'unexplored';
    }
    return 'visible';
  }

  /**
   * Render the minimap
   */
  private renderMinimap(): void {
    const minimap = document.getElementById(this.MINIMAP_ID);
    if (!minimap) return;

    if (this.isDynamicDungeon) {
      this.renderDynamicMinimap();
      return;
    }

    // Simple minimap for static dungeons
    let minimapContent = '';
    const scaleX = Math.ceil(this.gameMap[0]?.length || 60 / 40);
    const scaleY = Math.ceil(this.gameMap.length || 20 / 20);
    
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 40; x++) {
        const worldX = x * scaleX;
        const worldY = y * scaleY;
        const terrain = this.gameMap[worldY]?.[worldX];
        
        if (terrain === '#') {
          minimapContent += '█';
        } else {
          minimapContent += '·';
        }
      }
      minimapContent += '\n';
    }
    
    minimap.textContent = minimapContent;
  }

  /**
   * Render dynamic dungeon minimap
   */
  private renderDynamicMinimap(): void {
    const minimap = document.getElementById(this.MINIMAP_ID);
    if (!minimap) return;
    
    const dungeonInfo = this.dungeonVisualizer.getDungeonInfo();
    if (!dungeonInfo) return;
    
    const viewport = this.dungeonVisualizer.getViewport();
    
    // Calculate minimap scale
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
          minimapContent += '□'; // Viewport indicator
        } else {
          minimapContent += '·';
        }
      }
      minimapContent += '\n';
    }
    
    minimap.textContent = minimapContent;
  }

  /**
   * Generate procedural dungeon
   */
  public async generateProceduralDungeon(config?: Partial<DungeonConfig>): Promise<void> {
    try {
      this.isDynamicDungeon = true;
      this.currentDungeonConfig = config ? { ...this.dungeonVisualizer.getConfig(), ...config } : null;
      
      if (config) {
        this.dungeonVisualizer.updateConfig(config);
      }
      
      // Generate new dungeon
      await this.dungeonVisualizer.generateDungeon();
      
      // Update camera to follow current player if available
      if (this.currentPlayerId) {
        const player = this.players.get(this.currentPlayerId);
        if (player) {
          this.viewportManager.centerCameraOn(player.position);
          this.dungeonVisualizer.updateCamera(player.position, true);
        }
      }
      
      await this.renderDynamicDungeon();
      
      console.log('Procedural dungeon generated:', {
        config: this.currentDungeonConfig,
        size: this.dungeonVisualizer.getDungeonInfo()?.size
      });
      
    } catch (error) {
      console.error('Failed to generate procedural dungeon:', error);
      // Fallback to default map
      this.generateDefaultMap();
    }
  }

  /**
   * Switch dungeon theme
   */
  public async switchDungeonTheme(theme: DungeonThemeType): Promise<void> {
    if (!this.isDynamicDungeon) return;
    
    try {
      this.dungeonVisualizer.updateConfig({ theme });
      await this.renderDynamicDungeon();
      console.log(`Switched to theme: ${theme}`);
    } catch (error) {
      console.error('Failed to switch dungeon theme:', error);
    }
  }

  /**
   * Render dynamic dungeon
   */
  private async renderDynamicDungeon(): Promise<void> {
    if (!this.isDynamicDungeon) return;
    
    try {
      await this.dungeonVisualizer.renderToContainer('game-container');
      this.renderDynamicMinimap();
    } catch (error) {
      console.error('Failed to render dynamic dungeon:', error);
    }
  }

  /**
   * Generate default map (fallback)
   */
  private generateDefaultMap(): void {
    this.isDynamicDungeon = false;
    const terrainChars = this.asciiRenderer.getTerrainChars();
    
    // Initialize map with floors
    this.gameMap = [];
    for (let y = 0; y < 20; y++) {
      this.gameMap[y] = [];
      for (let x = 0; x < 60; x++) {
        this.gameMap[y]![x] = terrainChars.FLOOR;
      }
    }

    // Add walls around border
    for (let x = 0; x < 60; x++) {
      this.gameMap[0]![x] = terrainChars.WALL;
      this.gameMap[19]![x] = terrainChars.WALL;
    }
    for (let y = 0; y < 20; y++) {
      this.gameMap[y]![0] = terrainChars.WALL;
      this.gameMap[y]![59] = terrainChars.WALL;
    }

    // Add some interior structure
    this.addRoom(5, 3, 15, 8);
    this.addRoom(25, 5, 20, 10);
    
    this.renderMap();
    
    // Initialize fog of war after map is generated
    if (!this.fogOfWarManager) {
      this.initializeFogOfWar();
    }
  }

  /**
   * Add a room to the map
   */
  private addRoom(startX: number, startY: number, width: number, height: number): void {
    const terrainChars = this.asciiRenderer.getTerrainChars();
    
    // Add room walls
    for (let x = startX; x < startX + width; x++) {
      for (let y = startY; y < startY + height; y++) {
        if (x === startX || x === startX + width - 1 || 
            y === startY || y === startY + height - 1) {
          this.gameMap[y]![x] = terrainChars.WALL;
        }
      }
    }
    
    // Add door
    const doorX = startX + Math.floor(width / 2);
    this.gameMap[startY]![doorX] = terrainChars.DOOR;
  }

  /**
   * Update game display with new state
   */
  public updateGameDisplay(gameState: any): void {
    // Update players
    this.players.clear();
    if (gameState.players) {
      for (const [playerId, player] of Object.entries(gameState.players)) {
        this.players.set(playerId as PlayerId, player as Player);
      }
    }

    // Update camera if following a player
    if (this.currentPlayerId) {
      const player = this.players.get(this.currentPlayerId);
      if (player) {
        this.viewportManager.updateFollowTarget(player.position);
        if (this.isDynamicDungeon) {
          this.dungeonVisualizer.updateCamera(player.position, true);
        }
      }
    }

    // Update fog of war with new player positions
    if (this.fogOfWarManager) {
      for (const [playerId, player] of this.players) {
        this.fogOfWarManager.updatePlayerPosition(playerId, player.position);
      }
    }

    // Re-render
    if (this.isDynamicDungeon) {
      this.renderDynamicDungeon();
    } else {
      this.renderMap();
    }

    // Update stats panel
    this.updateStatsPanel();
  }

  /**
   * Update stats panel content
   */
  private updateStatsPanel(): void {
    const statsPanel = document.getElementById(this.STATS_PANEL_ID);
    if (!statsPanel) return;

    let content = 'Players:\n';
    for (const [playerId, player] of this.players) {
      const marker = playerId === this.currentPlayerId ? '>' : ' ';
      content += `${marker} ${player.name} (${player.position.x},${player.position.y})\n`;
      content += `  HP: ${player.health}/${player.maxHealth}\n`;
      content += `  AP: ${player.currentAP}/8\n`;
    }

    // Add performance metrics
    const metrics = this.performanceOptimizer.getMetrics();
    content += '\nPerformance:\n';
    content += `Cache hits: ${metrics.cacheHits}\n`;
    content += `Cache misses: ${metrics.cacheMisses}\n`;
    content += `Hit rate: ${(metrics.cacheHitRate * 100).toFixed(1)}%\n`;
    content += `Avg update: ${metrics.averageUpdateTime.toFixed(2)}ms\n`;

    statsPanel.textContent = content;
  }

  /**
   * Update player position
   */
  public updatePlayerPosition(playerId: PlayerId, oldPosition: Position, newPosition: Position): void {
    // Update camera if this is the followed player
    if (this.isDynamicDungeon && playerId === this.currentPlayerId) {
      this.dungeonVisualizer.updateCamera(newPosition, true);
    }

    // Update viewport if following this player
    if (playerId === this.currentPlayerId) {
      this.viewportManager.updateFollowTarget(newPosition);
    }

    // Update fog of war
    if (this.fogOfWarManager) {
      this.fogOfWarManager.updatePlayerPosition(playerId, newPosition);
    }

    // Re-render affected areas
    if (this.isDynamicDungeon) {
      this.renderDynamicDungeon();
    } else {
      // Only re-render changed cells for performance
      const oldScreen = this.viewportManager.worldToScreen(oldPosition);
      const newScreen = this.viewportManager.worldToScreen(newPosition);
      
      if (oldScreen) {
        this.renderCell(oldScreen.x, oldScreen.y, oldPosition);
      }
      if (newScreen) {
        this.renderCell(newScreen.x, newScreen.y, newPosition);
      }
      
      this.renderMinimap();
    }
  }

  /**
   * Set current player (for camera following)
   */
  public setCurrentPlayer(playerId: PlayerId): void {
    this.currentPlayerId = playerId;
    const player = this.players.get(playerId);
    if (player) {
      this.viewportManager.setFollowTarget(player.position);
    }
  }

  /**
   * Add player to renderer
   */
  public addPlayer(playerId: PlayerId, player: Player): void {
    this.players.set(playerId, player);
    
    if (this.fogOfWarManager) {
      this.fogOfWarManager.addPlayer(playerId, player.position);
    }
    
    this.renderMap();
  }

  /**
   * Remove player from renderer
   */
  public removePlayer(playerId: PlayerId): void {
    this.players.delete(playerId);
    
    if (this.fogOfWarManager) {
      this.fogOfWarManager.removePlayer(playerId);
    }
    
    this.renderMap();
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): any {
    return {
      renderer: this.performanceOptimizer.getMetrics(),
      viewport: this.viewportManager.getViewportInfo(),
      fog: this.fogOfWarManager?.getMetrics() || null
    };
  }

  /**
   * Cleanup renderer resources
   */
  public cleanup(): void {
    this.performanceOptimizer.cleanup();
    if (this.fogOfWarManager) {
      this.fogOfWarManager.cleanup();
    }
    this.players.clear();
    this.messageHistory = [];
  }
}