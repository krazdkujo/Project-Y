import { Player, Position, PlayerId } from '../shared/types';
import { CellVisibilityState } from '../shared/VisionTypes';

/**
 * Core ASCII character rendering system
 * Handles character mappings, colors, and basic cell rendering
 */
export class ASCIIRenderer {
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
    PLAYER: '@',
    NPC: '&',
    ITEM: '%',
    MONSTER: 'M'
  };

  // Color mappings for ASCII characters
  private readonly COLORS = {
    FLOOR: '#666666',
    WALL: '#ffffff',
    DOOR: '#8b4513',
    STAIRS_UP: '#ffff00',
    STAIRS_DOWN: '#ffff00',
    WATER: '#0000ff',
    LAVA: '#ff4500',
    TREE: '#228b22',
    ROCK: '#696969',
    PLAYER: '#00ff00',
    PLAYER_SELF: '#ffff00',
    NPC: '#ffa500',
    ITEM: '#ff00ff',
    MONSTER: '#ff0000',
    FOG_UNEXPLORED: '#000000',
    FOG_REMEMBERED: '#404040',
    FOG_VISIBLE: '#ffffff'
  };

  private mapWidth: number;
  private mapHeight: number;

  constructor(mapWidth: number = 60, mapHeight: number = 20) {
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
  }

  /**
   * Render a single cell with terrain and entity
   */
  public renderCell(x: number, y: number, terrain: string, entity?: Player): HTMLElement | null {
    const cell = document.getElementById(`cell-${x}-${y}`);
    if (!cell) return null;

    // Determine what to display
    let char = terrain;
    let color = this.getTerrainColor(terrain);

    // Override with entity if present
    if (entity) {
      char = this.TERRAIN_CHARS.PLAYER;
      color = this.COLORS.PLAYER;
    }

    // Update cell content and styling
    if (cell.textContent !== char) {
      cell.textContent = char;
    }
    if (cell.style.color !== color) {
      cell.style.color = color;
    }

    return cell;
  }

  /**
   * Render cell with fog of war state
   */
  public renderCellWithFog(x: number, y: number, terrain: string, visibilityState: CellVisibilityState, entity?: Player): void {
    const cell = document.getElementById(`cell-${x}-${y}`);
    if (!cell) return;

    // Clear previous fog classes
    cell.classList.remove('fog-unexplored', 'fog-remembered', 'fog-visible');

    switch (visibilityState) {
      case 'unexplored':
        cell.textContent = ' ';
        cell.style.color = this.COLORS.FOG_UNEXPLORED;
        cell.classList.add('fog-unexplored');
        break;
      
      case 'remembered':
        const rememberedChar = terrain || this.TERRAIN_CHARS.FLOOR;
        cell.textContent = rememberedChar;
        cell.style.color = this.COLORS.FOG_REMEMBERED;
        cell.classList.add('fog-remembered');
        break;
      
      case 'visible':
        this.renderCell(x, y, terrain, entity);
        cell.classList.add('fog-visible');
        break;
    }
  }

  /**
   * Get color for terrain type
   */
  private getTerrainColor(terrain: string): string {
    switch (terrain) {
      case this.TERRAIN_CHARS.FLOOR: return this.COLORS.FLOOR;
      case this.TERRAIN_CHARS.WALL: return this.COLORS.WALL;
      case this.TERRAIN_CHARS.DOOR: return this.COLORS.DOOR;
      case this.TERRAIN_CHARS.STAIRS_UP: return this.COLORS.STAIRS_UP;
      case this.TERRAIN_CHARS.STAIRS_DOWN: return this.COLORS.STAIRS_DOWN;
      case this.TERRAIN_CHARS.WATER: return this.COLORS.WATER;
      case this.TERRAIN_CHARS.LAVA: return this.COLORS.LAVA;
      case this.TERRAIN_CHARS.TREE: return this.COLORS.TREE;
      case this.TERRAIN_CHARS.ROCK: return this.COLORS.ROCK;
      case this.TERRAIN_CHARS.NPC: return this.COLORS.NPC;
      case this.TERRAIN_CHARS.ITEM: return this.COLORS.ITEM;
      case this.TERRAIN_CHARS.MONSTER: return this.COLORS.MONSTER;
      default: return this.COLORS.FLOOR;
    }
  }

  /**
   * Get terrain character mappings
   */
  public getTerrainChars() {
    return { ...this.TERRAIN_CHARS };
  }

  /**
   * Get color mappings
   */
  public getColors() {
    return { ...this.COLORS };
  }

  /**
   * Update renderer dimensions
   */
  public updateDimensions(width: number, height: number): void {
    this.mapWidth = width;
    this.mapHeight = height;
  }
}