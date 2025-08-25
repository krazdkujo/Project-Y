/**
 * Fog of War Management System
 * 
 * Handles visibility, exploration state, and dynamic line of sight calculations
 * for tactical gameplay. Integrates with the game renderer for real-time updates.
 */

import { VisionType, VisionState, FogOfWarCell, VisibilityMap, LightLevel, LightSource } from '../shared/VisionTypes';
import { Position } from '../shared/types';

export interface FogOfWarConfig {
  width: number;
  height: number;
  defaultVisionRange: number;
  persistExploration: boolean;
}

export class FogOfWarManager {
  private visibilityMap: VisibilityMap;
  private config: FogOfWarConfig;

  constructor(config: FogOfWarConfig) {
    this.config = config;
    this.visibilityMap = this.initializeVisibilityMap();
  }

  private initializeVisibilityMap(): VisibilityMap {
    const cells: FogOfWarCell[][] = [];
    
    for (let x = 0; x < this.config.width; x++) {
      cells[x] = [];
      for (let y = 0; y < this.config.height; y++) {
        cells[x][y] = {
          x,
          y,
          visible: false,
          explored: false,
          lightLevel: 'darkness',
          lastSeen: null
        };
      }
    }

    return {
      width: this.config.width,
      height: this.config.height,
      cells,
      lightSources: [],
      lastUpdated: new Date()
    };
  }

  public updateVisibility(
    playerPosition: Position,
    visionState: VisionState,
    obstacles: Position[] = []
  ): void {
    // Clear current visibility
    this.clearVisibility();

    // Calculate visible cells based on vision type and range
    const visibleCells = this.calculateLineOfSight(
      playerPosition.x,
      playerPosition.y,
      visionState.range,
      obstacles
    );

    // Update visibility and exploration state
    visibleCells.forEach(pos => {
      const cell = this.getCell(pos.x, pos.y);
      if (cell) {
        cell.visible = true;
        cell.explored = true;
        cell.lastSeen = new Date();
        cell.lightLevel = this.calculateLightLevel(pos.x, pos.y);
      }
    });

    this.visibilityMap.lastUpdated = new Date();
  }

  private clearVisibility(): void {
    for (let x = 0; x < this.config.width; x++) {
      for (let y = 0; y < this.config.height; y++) {
        this.visibilityMap.cells[x][y].visible = false;
      }
    }
  }

  private calculateLineOfSight(
    fromX: number,
    fromY: number,
    range: number,
    obstacles: Position[]
  ): Position[] {
    const visibleCells: Position[] = [];
    const obstacleSet = new Set(obstacles.map(pos => `${pos.x},${pos.y}`));

    // Simple ray casting algorithm
    for (let angle = 0; angle < 360; angle += 0.5) {
      const radians = (angle * Math.PI) / 180;
      const dx = Math.cos(radians);
      const dy = Math.sin(radians);

      for (let distance = 1; distance <= range; distance++) {
        const x = Math.round(fromX + dx * distance);
        const y = Math.round(fromY + dy * distance);

        if (x < 0 || x >= this.config.width || y < 0 || y >= this.config.height) {
          break;
        }

        visibleCells.push({ x, y });

        // Stop if we hit an obstacle
        if (obstacleSet.has(`${x},${y}`)) {
          break;
        }
      }
    }

    return Array.from(new Set(visibleCells.map(pos => `${pos.x},${pos.y}`)))
      .map(key => {
        const [x, y] = key.split(',').map(Number);
        return { x, y };
      });
  }

  private calculateLightLevel(x: number, y: number): LightLevel {
    // Check distance to nearest light source
    let nearestDistance = Infinity;
    
    for (const light of this.visibilityMap.lightSources) {
      const distance = Math.sqrt(
        Math.pow(x - light.x, 2) + Math.pow(y - light.y, 2)
      );
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
      }
    }

    // Determine light level based on distance
    if (nearestDistance <= 2) return 'bright';
    if (nearestDistance <= 5) return 'dim';
    return 'darkness';
  }

  private getCell(x: number, y: number): FogOfWarCell | null {
    if (x < 0 || x >= this.config.width || y < 0 || y >= this.config.height) {
      return null;
    }
    return this.visibilityMap.cells[x][y];
  }

  public isVisible(x: number, y: number): boolean {
    const cell = this.getCell(x, y);
    return cell ? cell.visible : false;
  }

  public isExplored(x: number, y: number): boolean {
    const cell = this.getCell(x, y);
    return cell ? cell.explored : false;
  }

  public addLightSource(lightSource: LightSource): void {
    this.visibilityMap.lightSources.push(lightSource);
  }

  public removeLightSource(lightSourceId: string): void {
    this.visibilityMap.lightSources = this.visibilityMap.lightSources.filter(
      light => light.id !== lightSourceId
    );
  }

  public getVisibilityMap(): VisibilityMap {
    return this.visibilityMap;
  }

  public reset(): void {
    this.visibilityMap = this.initializeVisibilityMap();
  }
}