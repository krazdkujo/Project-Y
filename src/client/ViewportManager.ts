import { Position } from '../shared/types';

/**
 * Manages viewport, camera positioning, and map scrolling
 * Handles dynamic map sizes larger than the display area
 */
export class ViewportManager {
  private viewportWidth: number;
  private viewportHeight: number;
  private mapWidth: number;
  private mapHeight: number;
  private cameraPosition: Position = { x: 0, y: 0 };
  private followTarget: Position | null = null;

  constructor(viewportWidth: number = 60, viewportHeight: number = 20) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.mapWidth = viewportWidth;
    this.mapHeight = viewportHeight;
  }

  /**
   * Set the full map dimensions
   */
  public setMapDimensions(width: number, height: number): void {
    this.mapWidth = width;
    this.mapHeight = height;
    this.clampCamera();
  }

  /**
   * Update viewport dimensions
   */
  public setViewportDimensions(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
    this.clampCamera();
  }

  /**
   * Move camera to specific position
   */
  public setCameraPosition(x: number, y: number): void {
    this.cameraPosition = { x, y };
    this.clampCamera();
  }

  /**
   * Center camera on a position
   */
  public centerCameraOn(position: Position): void {
    this.cameraPosition = {
      x: position.x - Math.floor(this.viewportWidth / 2),
      y: position.y - Math.floor(this.viewportHeight / 2)
    };
    this.clampCamera();
  }

  /**
   * Set target to automatically follow
   */
  public setFollowTarget(position: Position | null): void {
    this.followTarget = position;
    if (position) {
      this.centerCameraOn(position);
    }
  }

  /**
   * Update follow target position
   */
  public updateFollowTarget(position: Position): void {
    if (this.followTarget) {
      this.followTarget = position;
      this.centerCameraOn(position);
    }
  }

  /**
   * Move camera by offset
   */
  public moveCamera(deltaX: number, deltaY: number): void {
    this.cameraPosition.x += deltaX;
    this.cameraPosition.y += deltaY;
    this.clampCamera();
  }

  /**
   * Get current camera position
   */
  public getCameraPosition(): Position {
    return { ...this.cameraPosition };
  }

  /**
   * Get viewport bounds in world coordinates
   */
  public getViewportBounds(): { left: number, top: number, right: number, bottom: number } {
    return {
      left: this.cameraPosition.x,
      top: this.cameraPosition.y,
      right: this.cameraPosition.x + this.viewportWidth,
      bottom: this.cameraPosition.y + this.viewportHeight
    };
  }

  /**
   * Convert world coordinates to screen coordinates
   */
  public worldToScreen(worldPos: Position): Position | null {
    const screenX = worldPos.x - this.cameraPosition.x;
    const screenY = worldPos.y - this.cameraPosition.y;

    // Check if position is within viewport
    if (screenX >= 0 && screenX < this.viewportWidth && 
        screenY >= 0 && screenY < this.viewportHeight) {
      return { x: screenX, y: screenY };
    }

    return null; // Position is outside viewport
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  public screenToWorld(screenPos: Position): Position {
    return {
      x: screenPos.x + this.cameraPosition.x,
      y: screenPos.y + this.cameraPosition.y
    };
  }

  /**
   * Check if a world position is visible in current viewport
   */
  public isPositionVisible(worldPos: Position): boolean {
    const screenPos = this.worldToScreen(worldPos);
    return screenPos !== null;
  }

  /**
   * Get all world positions currently visible in viewport
   */
  public getVisiblePositions(): Position[] {
    const positions: Position[] = [];
    const bounds = this.getViewportBounds();
    
    for (let y = bounds.top; y < bounds.bottom; y++) {
      for (let x = bounds.left; x < bounds.right; x++) {
        // Ensure position is within map bounds
        if (x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
          positions.push({ x, y });
        }
      }
    }
    
    return positions;
  }

  /**
   * Clamp camera position to map bounds
   */
  private clampCamera(): void {
    // Ensure camera doesn't go beyond map boundaries
    this.cameraPosition.x = Math.max(0, Math.min(this.cameraPosition.x, 
      Math.max(0, this.mapWidth - this.viewportWidth)));
    this.cameraPosition.y = Math.max(0, Math.min(this.cameraPosition.y, 
      Math.max(0, this.mapHeight - this.viewportHeight)));
  }

  /**
   * Check if viewport needs scrolling for large maps
   */
  public needsScrolling(): boolean {
    return this.mapWidth > this.viewportWidth || this.mapHeight > this.viewportHeight;
  }

  /**
   * Get viewport info for debugging
   */
  public getViewportInfo(): any {
    return {
      viewport: { width: this.viewportWidth, height: this.viewportHeight },
      map: { width: this.mapWidth, height: this.mapHeight },
      camera: this.cameraPosition,
      followTarget: this.followTarget,
      needsScrolling: this.needsScrolling(),
      visibleArea: this.getViewportBounds()
    };
  }
}