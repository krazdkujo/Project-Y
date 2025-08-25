/**
 * Vision and Line of Sight Type Definitions
 * 
 * Defines vision mechanics, fog of war, and sight-based gameplay systems.
 */

export type VisionType = 
  | 'normal'
  | 'darkvision'
  | 'blindsight'
  | 'truesight'
  | 'tremorsense';

export type LightLevel = 
  | 'bright'
  | 'dim' 
  | 'darkness'
  | 'magical_darkness';

export interface VisionRange {
  normal: number;
  darkvision: number;
  blindsight: number;
  truesight: number;
  tremorsense: number;
}

export interface VisionState {
  type: VisionType;
  range: number;
  canSeeThroughWalls: boolean;
  affectedByLight: boolean;
}

export interface FogOfWarCell {
  x: number;
  y: number;
  visible: boolean;
  explored: boolean;
  lightLevel: LightLevel;
  lastSeen: Date | null;
}

export interface LightSource {
  id: string;
  x: number;
  y: number;
  radius: number;
  intensity: number;
  color: string;
  flickering: boolean;
}

export interface VisibilityMap {
  width: number;
  height: number;
  cells: FogOfWarCell[][];
  lightSources: LightSource[];
  lastUpdated: Date;
}

export interface LineOfSight {
  canSee(fromX: number, fromY: number, toX: number, toY: number): boolean;
  getVisibleCells(x: number, y: number, range: number, visionType: VisionType): { x: number; y: number }[];
  calculateLightLevel(x: number, y: number): LightLevel;
}

// Additional types for fog of war rendering
export type CellVisibilityState = 'visible' | 'explored' | 'hidden';

export interface FogRenderingData {
  visibility: CellVisibilityState[][];
  fadeOpacity: number;
  exploredOpacity: number;
}

export interface FogColorConfig {
  fog: string;
  explored: string;
  visible: string;
}

export const DEFAULT_FOG_COLORS: FogColorConfig = {
  fog: 'rgba(0, 0, 0, 0.8)',
  explored: 'rgba(0, 0, 0, 0.4)',
  visible: 'rgba(0, 0, 0, 0)'
};

export class PositionUtils {
  static distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }
  
  static manhattanDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(x2 - x1) + Math.abs(y2 - y1);
  }
}