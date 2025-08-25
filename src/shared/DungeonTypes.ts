/**
 * Dungeon Type Definitions
 * 
 * Core types for procedural dungeon generation system.
 * Defines themes, algorithms, configurations, and cell types.
 */

export type DungeonThemeType = 
  | 'classic'
  | 'volcanic' 
  | 'ice_cavern'
  | 'forest'
  | 'desert'
  | 'underdark'
  | 'mechanical'
  | 'ethereal'
  | 'ancient_ruins'
  | 'fire_caverns'
  | 'ice_crystal_caves'
  | 'shadow_crypts'
  | 'living_forest'
  | 'aberrant_laboratory'
  | 'elemental_nexus'
  | 'underdark_passages';

export type AlgorithmType =
  | 'bsp'
  | 'cellular_automata'
  | 'maze'
  | 'rooms_corridors'
  | 'voronoi'
  | 'drunken_walk'
  | 'recursive_division'
  | 'hybrid';

export type CellType =
  | 'empty'
  | 'wall' 
  | 'floor'
  | 'door'
  | 'stairs_up'
  | 'stairs_down'
  | 'water'
  | 'lava'
  | 'trap'
  | 'treasure'
  | 'monster_spawn'
  | 'ice'
  | 'crystal';

// Enum-like object for compatibility with existing code
export const CellType = {
  EMPTY: 'empty' as const,
  WALL: 'wall' as const,
  FLOOR: 'floor' as const,
  DOOR: 'door' as const,
  STAIRS_UP: 'stairs_up' as const,
  STAIRS_DOWN: 'stairs_down' as const,
  WATER: 'water' as const,
  LAVA: 'lava' as const,
  TRAP: 'trap' as const,
  TREASURE: 'treasure' as const,
  MONSTER_SPAWN: 'monster_spawn' as const,
  ICE: 'ice' as const,
  CRYSTAL: 'crystal' as const
} as const;

export interface DungeonConfig {
  theme: DungeonThemeType;
  algorithm: AlgorithmType;
  width: number;
  height: number;
  roomCount?: number;
  roomMinSize?: number;
  roomMaxSize?: number;
  corridorWidth?: number;
  iterations?: number;
  fillPercent?: number;
  seed?: number;
  size?: { width: number; height: number };
}

export interface DungeonCell {
  type: CellType;
  x: number;
  y: number;
  properties?: Record<string, any>;
}

export interface DungeonRoom {
  id: string;
  x: number;
  y: number; 
  width: number;
  height: number;
  connected: boolean;
}

export interface DungeonMap {
  width: number;
  height: number;
  cells: DungeonCell[][];
  rooms: DungeonRoom[];
  theme: DungeonThemeType;
  algorithm: AlgorithmType;
  seed: number;
}

export interface DungeonMetadata {
  generatedAt: Date;
  config: DungeonConfig;
  stats: {
    roomCount: number;
    corridorLength: number;
    connectivity: number;
  };
}

// Additional types used in the codebase
export interface GeneratedDungeon {
  success: boolean;
  map?: DungeonMap;
  dungeon?: DungeonMap;
  metadata?: DungeonMetadata;
  rooms?: Room[];
  corridors?: Corridor[];
  config: DungeonConfig;
  error?: string;
}

export interface DungeonSize {
  width: number;
  height: number;
  area: number;
}

export interface Room {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  connected: boolean;
  type?: 'normal' | 'entrance' | 'exit' | 'treasure' | 'boss';
}

export interface Corridor {
  id: string;
  startRoom: string;
  endRoom: string;
  path: Coordinate[];
  width: number;
}

export interface Coordinate {
  x: number;
  y: number;
}