import { Player, Position, PlayerId } from '../shared/types';

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
    ROCK: '*'
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
    BACKGROUND: '#000000'   // Black
  };

  constructor() {
    this.initializeRenderer();
    this.generateDefaultMap();
  }

  /**
   * Initialize the renderer and create display elements
   */
  private initializeRenderer(): void {
    this.createMapCanvas();
    this.createStatsPanel();
    this.createMinimap();
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
   * Generate a default dungeon map
   */
  private generateDefaultMap(): void {
    // Initialize map with floors
    this.gameMap = Array(this.mapHeight).fill(null).map(() => 
      Array(this.mapWidth).fill(this.TERRAIN_CHARS.FLOOR)
    );
    
    // Add walls around the border
    for (let x = 0; x < this.mapWidth; x++) {
      this.gameMap[0][x] = this.TERRAIN_CHARS.WALL;
      this.gameMap[this.mapHeight - 1][x] = this.TERRAIN_CHARS.WALL;
    }
    
    for (let y = 0; y < this.mapHeight; y++) {
      this.gameMap[y][0] = this.TERRAIN_CHARS.WALL;
      this.gameMap[y][this.mapWidth - 1] = this.TERRAIN_CHARS.WALL;
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
    this.gameMap[7][25] = this.TERRAIN_CHARS.DOOR;
    this.gameMap[11][25] = this.TERRAIN_CHARS.DOOR;
    this.gameMap[14][45] = this.TERRAIN_CHARS.DOOR;
    
    // Add some decorative elements
    this.gameMap[5][10] = this.TERRAIN_CHARS.TREE;
    this.gameMap[6][35] = this.TERRAIN_CHARS.ROCK;
    this.gameMap[15][8] = this.TERRAIN_CHARS.CHEST;
    this.gameMap[8][40] = this.TERRAIN_CHARS.STAIRS_DOWN;
    
    // Add water feature
    for (let x = 48; x < 55; x++) {
      for (let y = 16; y < 19; y++) {
        this.gameMap[y][x] = this.TERRAIN_CHARS.WATER;
      }
    }
    
    this.renderMap();
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
            this.gameMap[j][i] = this.TERRAIN_CHARS.WALL;
          }
        } else {
          if (j >= 0 && j < this.mapHeight && i >= 0 && i < this.mapWidth) {
            this.gameMap[j][i] = this.TERRAIN_CHARS.FLOOR;
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
        this.gameMap[y][x] = this.TERRAIN_CHARS.FLOOR;
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
   * Render a single cell
   */
  private renderCell(x: number, y: number): void {
    const cell = document.getElementById(`cell-${x}-${y}`);
    if (!cell) return;
    
    // Check if there's a player at this position
    const playerAtPosition = this.getPlayerAtPosition(x, y);
    
    if (playerAtPosition) {
      cell.textContent = this.ENTITY_CHARS.PLAYER;
      cell.style.color = playerAtPosition.id === this.currentPlayerId ? 
        this.COLORS.CURRENT_PLAYER : this.COLORS.PLAYER;
      cell.style.backgroundColor = 'transparent';
      cell.title = `${playerAtPosition.name} (${playerAtPosition.health}/${playerAtPosition.maxHealth} HP)`;
    } else {
      // Render terrain
      const terrain = this.gameMap[y][x];
      cell.textContent = terrain;
      cell.style.color = this.getTerrainColor(terrain);
      cell.style.backgroundColor = 'transparent';
      cell.title = this.getTerrainDescription(terrain);
    }
  }

  /**
   * Get player at specific position
   */
  private getPlayerAtPosition(x: number, y: number): Player | null {
    for (const player of this.players.values()) {
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
        const terrain = this.gameMap[y][x];
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
    // Update players
    this.players = new Map(Object.entries(gameState.players));
    
    // Re-render all cells that might have changed
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        this.renderCell(x, y);
      }
    }
    
    // Update stats panel
    const statsPanel = document.getElementById(this.STATS_PANEL_ID);
    if (statsPanel) {
      statsPanel.innerHTML = this.generateStatsDisplay();
    }
    
    // Update minimap
    this.renderMinimap();
  }

  /**
   * Set the current player (for highlighting and stats)
   */
  public setCurrentPlayer(playerId: PlayerId): void {
    this.currentPlayerId = playerId;
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
    const player = this.players.get(playerId);
    if (player) {
      player.position = newPosition;
      
      // Re-render affected cells
      this.renderCell(oldPosition.x, oldPosition.y);
      this.renderCell(newPosition.x, newPosition.y);
      
      // Update minimap
      this.renderMinimap();
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
    
    const terrain = this.gameMap[y][x];
    const unwalkable = [this.TERRAIN_CHARS.WALL, this.TERRAIN_CHARS.LAVA];
    
    if (unwalkable.includes(terrain)) {
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
   * Cleanup renderer resources
   */
  public cleanup(): void {
    // Clear any ongoing animations or timers
    const canvas = document.getElementById(this.MAP_CANVAS_ID);
    const statsPanel = document.getElementById(this.STATS_PANEL_ID);
    const minimap = document.getElementById(this.MINIMAP_ID);
    
    if (canvas) canvas.remove();
    if (statsPanel) statsPanel.remove();
    if (minimap) minimap.remove();
  }
}