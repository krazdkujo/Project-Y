/**
 * Dungeon Visualization Manager
 * 
 * Integrates procedural dungeon generation with ASCII visualization
 * Based on Context7 research:
 * - Infinigen: Modular theme system with real-time rendering
 * - ASCII Art: Efficient character-based display with color support
 * - Node.js: Performance-optimized rendering with memory management
 */

import { DungeonGenerator } from '../game/dungeons/DungeonGenerator.js';
import { 
  DungeonConfig, 
  GeneratedDungeon, 
  CellType, 
  DungeonThemeType, 
  AlgorithmType,
  DungeonSize,
  Room,
  Corridor,
  Coordinate
} from '../shared/DungeonTypes.js';
import { RenderingOptimizer, DetailedMetrics } from './RenderingOptimizer.js';

// Visualization-specific types
export interface ViewportConfig {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface CameraSystem {
  position: Coordinate;
  target: Coordinate | null;
  followPlayer: boolean;
  smoothing: number;
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

export interface ThemeVisualization {
  name: DungeonThemeType;
  cellCharacters: Record<CellType, string>;
  cellColors: Record<CellType, string>;
  ambientColor: string;
  fogColor: string;
  backgroundMusic?: string;
}

export interface RenderingMetrics extends DetailedMetrics {
  // Legacy compatibility fields
  cacheHits: number;
  cacheMisses: number;
  lastUpdate: number;
}

/**
 * Main visualization manager that coordinates dungeon generation and rendering
 */
export class DungeonVisualizationManager {
  private dungeonGenerator: DungeonGenerator;
  private currentDungeon: GeneratedDungeon | null = null;
  private viewport: ViewportConfig;
  private camera: CameraSystem;
  private currentTheme: ThemeVisualization | null = null;
  
  // Performance optimization (Context7 patterns)
  private renderOptimizer: RenderingOptimizer;
  private renderCache: Map<string, HTMLElement> = new Map();
  private dirtyRegions: Set<string> = new Set();
  private isRendering: boolean = false;
  private renderingMetrics: RenderingMetrics = {
    cellsRendered: 0,
    renderTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
    memoryUsage: 0,
    lastUpdate: 0,
    batchCount: 0,
    cellsSkipped: 0,
    cacheHitRate: 0,
    frameRate: 60,
    virtualDomDiffs: 0,
    pooledObjectsReused: 0
  };

  constructor(viewportWidth: number = 60, viewportHeight: number = 20) {
    this.dungeonGenerator = new DungeonGenerator();
    
    // Initialize rendering optimizer with Context7 performance patterns
    this.renderOptimizer = new RenderingOptimizer({
      maxBatchSize: 150,
      frameTargetMs: 16.67, // 60fps target
      enableVirtualDom: true,
      enableObjectPooling: true,
      adaptiveFrameRate: true,
      memoryManagement: true
    });
    
    // Initialize viewport configuration
    this.viewport = {
      width: viewportWidth,
      height: viewportHeight,
      x: 0,
      y: 0
    };

    // Initialize camera system
    this.camera = {
      position: { x: 0, y: 0 },
      target: null,
      followPlayer: false,
      smoothing: 0.1,
      bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 }
    };

    // Set up performance monitoring
    this.initializePerformanceMonitoring();
  }

  /**
   * Generate a new dungeon with specified configuration
   */
  async generateDungeon(config: DungeonConfig): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Generate dungeon using the procedural system
      const result = await this.dungeonGenerator.generate(config);
      
      if (!result.success || !result.dungeon) {
        throw new Error(`Dungeon generation failed: ${result.error}`);
      }

      this.currentDungeon = result.dungeon;
      
      // Update camera bounds for the new dungeon
      this.updateCameraBounds();
      
      // Load theme visualization
      await this.loadThemeVisualization(config.theme);
      
      // Clear render cache for new dungeon
      this.clearRenderCache();
      
      // Center camera on the first room or map center
      this.centerCameraOnDungeon();
      
      console.log(`Dungeon generated in ${performance.now() - startTime}ms`, {
        size: `${config.size.width}x${config.size.height}`,
        theme: config.theme,
        algorithm: config.algorithm,
        rooms: result.dungeon.rooms.length,
        corridors: result.dungeon.corridors.length
      });
      
    } catch (error) {
      console.error('Failed to generate dungeon:', error);
      throw error;
    }
  }

  /**
   * Render the current dungeon to the specified container
   */
  async renderToContainer(containerId: string): Promise<void> {
    if (!this.currentDungeon || !this.currentTheme) {
      console.warn('Cannot render: no dungeon or theme loaded');
      return;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container not found: ${containerId}`);
    }

    const startTime = performance.now();
    this.isRendering = true;

    try {
      // Create or get the dungeon canvas
      let canvas = container.querySelector('.dungeon-canvas') as HTMLElement;
      if (!canvas) {
        canvas = this.createDungeonCanvas();
        container.appendChild(canvas);
      }

      // Update viewport position based on camera
      this.updateViewport();
      
      // Render visible cells using optimized batch rendering
      await this.renderVisibleCells(canvas);
      
      // Update rendering metrics
      this.updateRenderingMetrics(performance.now() - startTime);
      
    } finally {
      this.isRendering = false;
    }
  }

  /**
   * Update camera position and target
   */
  updateCamera(targetPosition?: Coordinate, followPlayer: boolean = false): void {
    if (targetPosition) {
      this.camera.target = targetPosition;
    }
    
    this.camera.followPlayer = followPlayer;
    
    if (this.camera.target) {
      // Smooth camera movement using lerp (Context7 animation pattern)
      const dx = this.camera.target.x - this.camera.position.x;
      const dy = this.camera.target.y - this.camera.position.y;
      
      this.camera.position.x += dx * this.camera.smoothing;
      this.camera.position.y += dy * this.camera.smoothing;
      
      // Clamp camera to bounds
      this.clampCameraToBounds();
      
      // Mark viewport as dirty for re-rendering
      this.markViewportDirty();
    }
  }

  /**
   * Get themed ASCII character for a cell type
   */
  getCellCharacter(cellType: CellType): string {
    if (!this.currentTheme) {
      return this.getDefaultCellCharacter(cellType);
    }
    
    return this.currentTheme.cellCharacters[cellType] || '?';
  }

  /**
   * Get themed color for a cell type
   */
  getCellColor(cellType: CellType): string {
    if (!this.currentTheme) {
      return this.getDefaultCellColor(cellType);
    }
    
    return this.currentTheme.cellColors[cellType] || '#ffffff';
  }

  /**
   * Switch to a different theme and re-render
   */
  async switchTheme(theme: DungeonThemeType): Promise<void> {
    if (!this.currentDungeon) return;
    
    await this.loadThemeVisualization(theme);
    this.clearRenderCache();
    this.markAllCellsDirty();
  }

  /**
   * Get current camera position for external use
   */
  getCameraPosition(): Coordinate {
    return { ...this.camera.position };
  }

  /**
   * Get viewport configuration
   */
  getViewport(): ViewportConfig {
    return { ...this.viewport };
  }

  /**
   * Get current dungeon information
   */
  getDungeonInfo(): { size: DungeonSize; theme: DungeonThemeType; rooms: number } | null {
    if (!this.currentDungeon) return null;
    
    return {
      size: this.currentDungeon.config.size,
      theme: this.currentDungeon.config.theme,
      rooms: this.currentDungeon.rooms.length
    };
  }

  /**
   * Get rendering performance metrics
   */
  getRenderingMetrics(): RenderingMetrics {
    return { ...this.renderingMetrics };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.clearRenderCache();
    this.dungeonGenerator.dispose();
    this.renderOptimizer.cleanup();
    this.currentDungeon = null;
    this.currentTheme = null;
    this.dirtyRegions.clear();
  }

  // Private implementation methods

  private updateCameraBounds(): void {
    if (!this.currentDungeon) return;
    
    const { size } = this.currentDungeon.config;
    this.camera.bounds = {
      minX: this.viewport.width / 2,
      minY: this.viewport.height / 2,
      maxX: size.width - this.viewport.width / 2,
      maxY: size.height - this.viewport.height / 2
    };
  }

  private async loadThemeVisualization(theme: DungeonThemeType): Promise<void> {
    // Load theme-specific visualization data
    this.currentTheme = await this.createThemeVisualization(theme);
  }

  private async createThemeVisualization(theme: DungeonThemeType): Promise<ThemeVisualization> {
    const baseCharacters = this.getThemeCharacters(theme);
    const baseColors = this.getThemeColors(theme);
    
    return {
      name: theme,
      cellCharacters: baseCharacters,
      cellColors: baseColors,
      ambientColor: this.getThemeAmbientColor(theme),
      fogColor: this.getThemeFogColor(theme)
    };
  }

  private getThemeCharacters(theme: DungeonThemeType): Record<CellType, string> {
    const baseChars: Record<CellType, string> = {
      [CellType.VOID]: ' ',
      [CellType.FLOOR]: '.',
      [CellType.WALL]: '#',
      [CellType.DOOR]: '+',
      [CellType.STAIRS_UP]: '<',
      [CellType.STAIRS_DOWN]: '>',
      [CellType.TREASURE]: '$',
      [CellType.TRAP]: '^',
      [CellType.WATER]: '~',
      [CellType.LAVA]: '≈',
      [CellType.ICE]: '*',
      [CellType.CRYSTAL]: '◊'
    };

    // Theme-specific character overrides
    switch (theme) {
      case 'fire_caverns':
        return {
          ...baseChars,
          [CellType.FLOOR]: '.',
          [CellType.WALL]: '▓',
          [CellType.LAVA]: '≋',
          [CellType.TRAP]: '♦'
        };
      
      case 'ice_crystal_caves':
        return {
          ...baseChars,
          [CellType.FLOOR]: '·',
          [CellType.WALL]: '█',
          [CellType.ICE]: '❅',
          [CellType.CRYSTAL]: '♦',
          [CellType.WATER]: '≈'
        };
      
      case 'shadow_crypts':
        return {
          ...baseChars,
          [CellType.FLOOR]: '.',
          [CellType.WALL]: '▒',
          [CellType.TRAP]: '☠',
          [CellType.TREASURE]: '※'
        };
      
      case 'ancient_ruins':
        return {
          ...baseChars,
          [CellType.FLOOR]: '·',
          [CellType.WALL]: '▒',
          [CellType.DOOR]: '⧫',
          [CellType.TREASURE]: '⚱'
        };
      
      case 'living_forest':
        return {
          ...baseChars,
          [CellType.FLOOR]: '.',
          [CellType.WALL]: '♠',
          [CellType.WATER]: '~',
          [CellType.TREASURE]: '♣'
        };
      
      case 'aberrant_laboratory':
        return {
          ...baseChars,
          [CellType.FLOOR]: '·',
          [CellType.WALL]: '█',
          [CellType.TRAP]: '⚡',
          [CellType.DOOR]: '▣'
        };
      
      case 'elemental_nexus':
        return {
          ...baseChars,
          [CellType.FLOOR]: '·',
          [CellType.WALL]: '▓',
          [CellType.LAVA]: '♦',
          [CellType.ICE]: '❋',
          [CellType.WATER]: '○'
        };
      
      case 'underdark_passages':
        return {
          ...baseChars,
          [CellType.FLOOR]: '.',
          [CellType.WALL]: '▓',
          [CellType.WATER]: '≈',
          [CellType.STAIRS_DOWN]: '⧨'
        };
      
      default:
        return baseChars;
    }
  }

  private getThemeColors(theme: DungeonThemeType): Record<CellType, string> {
    const baseColors: Record<CellType, string> = {
      [CellType.VOID]: '#000000',
      [CellType.FLOOR]: '#404040',
      [CellType.WALL]: '#808080',
      [CellType.DOOR]: '#8B4513',
      [CellType.STAIRS_UP]: '#FFD700',
      [CellType.STAIRS_DOWN]: '#FFD700',
      [CellType.TREASURE]: '#FFFF00',
      [CellType.TRAP]: '#FF0000',
      [CellType.WATER]: '#0080FF',
      [CellType.LAVA]: '#FF4500',
      [CellType.ICE]: '#87CEEB',
      [CellType.CRYSTAL]: '#E6E6FA'
    };

    // Theme-specific color schemes
    switch (theme) {
      case 'fire_caverns':
        return {
          ...baseColors,
          [CellType.FLOOR]: '#2D1810',
          [CellType.WALL]: '#5C2E04',
          [CellType.LAVA]: '#FF2400',
          [CellType.TRAP]: '#FF6A00'
        };
      
      case 'ice_crystal_caves':
        return {
          ...baseColors,
          [CellType.FLOOR]: '#E0F6FF',
          [CellType.WALL]: '#B0E0E6',
          [CellType.ICE]: '#00CED1',
          [CellType.CRYSTAL]: '#E0FFFF',
          [CellType.WATER]: '#4169E1'
        };
      
      case 'shadow_crypts':
        return {
          ...baseColors,
          [CellType.FLOOR]: '#1C1C1C',
          [CellType.WALL]: '#2F2F2F',
          [CellType.TRAP]: '#8B0000',
          [CellType.TREASURE]: '#DAA520'
        };
      
      case 'ancient_ruins':
        return {
          ...baseColors,
          [CellType.FLOOR]: '#D2B48C',
          [CellType.WALL]: '#A0522D',
          [CellType.DOOR]: '#8B7355',
          [CellType.TREASURE]: '#B8860B'
        };
      
      case 'living_forest':
        return {
          ...baseColors,
          [CellType.FLOOR]: '#228B22',
          [CellType.WALL]: '#006400',
          [CellType.WATER]: '#00CED1',
          [CellType.TREASURE]: '#32CD32'
        };
      
      case 'aberrant_laboratory':
        return {
          ...baseColors,
          [CellType.FLOOR]: '#2F4F4F',
          [CellType.WALL]: '#708090',
          [CellType.TRAP]: '#DC143C',
          [CellType.DOOR]: '#4682B4'
        };
      
      case 'elemental_nexus':
        return {
          ...baseColors,
          [CellType.FLOOR]: '#483D8B',
          [CellType.WALL]: '#6A5ACD',
          [CellType.LAVA]: '#FF1493',
          [CellType.ICE]: '#00FFFF',
          [CellType.WATER]: '#9370DB'
        };
      
      case 'underdark_passages':
        return {
          ...baseColors,
          [CellType.FLOOR]: '#191970',
          [CellType.WALL]: '#2E2E2E',
          [CellType.WATER]: '#000080',
          [CellType.STAIRS_DOWN]: '#4B0082'
        };
      
      default:
        return baseColors;
    }
  }

  private getThemeAmbientColor(theme: DungeonThemeType): string {
    switch (theme) {
      case 'fire_caverns': return '#FF4500';
      case 'ice_crystal_caves': return '#E0FFFF';
      case 'shadow_crypts': return '#2F2F2F';
      case 'ancient_ruins': return '#D2B48C';
      case 'living_forest': return '#228B22';
      case 'aberrant_laboratory': return '#708090';
      case 'elemental_nexus': return '#9370DB';
      case 'underdark_passages': return '#191970';
      default: return '#404040';
    }
  }

  private getThemeFogColor(theme: DungeonThemeType): string {
    switch (theme) {
      case 'fire_caverns': return '#2D1810';
      case 'ice_crystal_caves': return '#B0E0E6';
      case 'shadow_crypts': return '#000000';
      case 'ancient_ruins': return '#8B7355';
      case 'living_forest': return '#006400';
      case 'aberrant_laboratory': return '#2F4F4F';
      case 'elemental_nexus': return '#483D8B';
      case 'underdark_passages': return '#000000';
      default: return '#000000';
    }
  }

  private createDungeonCanvas(): HTMLElement {
    const canvas = document.createElement('div');
    canvas.className = 'dungeon-canvas';
    canvas.style.cssText = `
      width: ${this.viewport.width}ch;
      height: ${this.viewport.height}em;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      line-height: 1;
      background-color: ${this.currentTheme?.ambientColor || '#000000'};
      white-space: pre;
      overflow: hidden;
      position: relative;
      border: 1px solid #333;
    `;
    
    // Create grid for efficient cell rendering
    for (let y = 0; y < this.viewport.height; y++) {
      const row = document.createElement('div');
      row.className = 'dungeon-row';
      row.style.cssText = `
        height: 1em;
        width: 100%;
        position: relative;
      `;
      
      for (let x = 0; x < this.viewport.width; x++) {
        const cell = document.createElement('span');
        cell.className = 'dungeon-cell';
        cell.id = `dungeon-cell-${x}-${y}`;
        cell.style.cssText = `
          position: absolute;
          left: ${x}ch;
          top: 0;
          width: 1ch;
          height: 1em;
        `;
        row.appendChild(cell);
      }
      
      canvas.appendChild(row);
    }
    
    return canvas;
  }

  private updateViewport(): void {
    if (!this.currentDungeon) return;
    
    // Calculate viewport position based on camera
    const halfViewportWidth = Math.floor(this.viewport.width / 2);
    const halfViewportHeight = Math.floor(this.viewport.height / 2);
    
    this.viewport.x = Math.floor(this.camera.position.x - halfViewportWidth);
    this.viewport.y = Math.floor(this.camera.position.y - halfViewportHeight);
    
    // Clamp viewport to dungeon bounds
    const { size } = this.currentDungeon.config;
    this.viewport.x = Math.max(0, Math.min(this.viewport.x, size.width - this.viewport.width));
    this.viewport.y = Math.max(0, Math.min(this.viewport.y, size.height - this.viewport.height));
  }

  private async renderVisibleCells(canvas: HTMLElement): Promise<void> {
    if (!this.currentDungeon || !this.currentTheme) return;

    const { cells, config } = this.currentDungeon;
    
    // Use the performance optimizer for rendering
    const cellProvider = (x: number, y: number) => {
      const worldX = this.viewport.x + x;
      const worldY = this.viewport.y + y;
      
      let cellType: CellType;
      
      // Check if cell is within dungeon bounds
      if (worldX >= 0 && worldX < config.size.width && worldY >= 0 && worldY < config.size.height) {
        const cellIndex = worldY * config.size.width + worldX;
        cellType = cells[cellIndex] as CellType;
      } else {
        // Use void for out-of-bounds areas
        cellType = CellType.VOID;
      }
      
      return {
        character: this.getCellCharacter(cellType),
        color: this.getCellColor(cellType),
        opacity: cellType === CellType.VOID ? '0.3' : '1.0'
      };
    };
    
    // Execute optimized rendering
    const metrics = await this.renderOptimizer.optimizedRender(
      this.viewport.width,
      this.viewport.height,
      cellProvider,
      canvas
    );
    
    // Update rendering metrics with optimizer results
    this.renderingMetrics = {
      ...metrics,
      cacheHits: metrics.cacheHitRate * 100, // Legacy compatibility
      cacheMisses: (1 - metrics.cacheHitRate) * 100, // Legacy compatibility
      lastUpdate: Date.now()
    };
  }

  // Legacy renderCell method removed - now handled by RenderingOptimizer

  private clampCameraToBounds(): void {
    const { bounds } = this.camera;
    this.camera.position.x = Math.max(bounds.minX, Math.min(this.camera.position.x, bounds.maxX));
    this.camera.position.y = Math.max(bounds.minY, Math.min(this.camera.position.y, bounds.maxY));
  }

  private centerCameraOnDungeon(): void {
    if (!this.currentDungeon) return;
    
    const { size } = this.currentDungeon.config;
    
    // If there are rooms, center on the first room
    if (this.currentDungeon.rooms.length > 0) {
      const firstRoom = this.currentDungeon.rooms[0];
      this.camera.position = { ...firstRoom.center };
    } else {
      // Otherwise center on the dungeon
      this.camera.position = {
        x: Math.floor(size.width / 2),
        y: Math.floor(size.height / 2)
      };
    }
    
    this.clampCameraToBounds();
  }

  private markViewportDirty(): void {
    this.dirtyRegions.add('viewport');
  }

  private markAllCellsDirty(): void {
    this.dirtyRegions.add('all');
  }

  private clearRenderCache(): void {
    this.renderCache.clear();
    this.renderingMetrics.cacheHits = 0;
    this.renderingMetrics.cacheMisses = 0;
  }

  private initializePerformanceMonitoring(): void {
    // Set up performance monitoring timer
    setInterval(() => {
      this.renderingMetrics.memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
    }, 1000);
  }

  private updateRenderingMetrics(renderTime: number): void {
    this.renderingMetrics.renderTime = renderTime;
    this.renderingMetrics.lastUpdate = Date.now();
  }

  private getDefaultCellCharacter(cellType: CellType): string {
    switch (cellType) {
      case CellType.VOID: return ' ';
      case CellType.FLOOR: return '.';
      case CellType.WALL: return '#';
      case CellType.DOOR: return '+';
      case CellType.STAIRS_UP: return '<';
      case CellType.STAIRS_DOWN: return '>';
      case CellType.TREASURE: return '$';
      case CellType.TRAP: return '^';
      case CellType.WATER: return '~';
      case CellType.LAVA: return '≈';
      case CellType.ICE: return '*';
      case CellType.CRYSTAL: return '◊';
      default: return '?';
    }
  }

  private getDefaultCellColor(cellType: CellType): string {
    switch (cellType) {
      case CellType.VOID: return '#000000';
      case CellType.FLOOR: return '#404040';
      case CellType.WALL: return '#808080';
      case CellType.DOOR: return '#8B4513';
      case CellType.STAIRS_UP: return '#FFD700';
      case CellType.STAIRS_DOWN: return '#FFD700';
      case CellType.TREASURE: return '#FFFF00';
      case CellType.TRAP: return '#FF0000';
      case CellType.WATER: return '#0080FF';
      case CellType.LAVA: return '#FF4500';
      case CellType.ICE: return '#87CEEB';
      case CellType.CRYSTAL: return '#E6E6FA';
      default: return '#FFFFFF';
    }
  }
}