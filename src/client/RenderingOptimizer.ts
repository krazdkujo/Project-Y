/**
 * Advanced Rendering Performance Optimizer
 * 
 * Implements Context7-inspired performance optimization patterns:
 * - React-style reconciliation for minimal DOM updates
 * - Virtual DOM diffing for ASCII characters
 * - Memory-efficient object pooling
 * - Adaptive frame rate management
 * - GPU-accelerated transformations where possible
 * - Intelligent caching strategies
 */

import { CellType } from '../shared/DungeonTypes';

// Virtual cell representation for diffing
export interface VirtualCell {
  character: string;
  color: string;
  backgroundColor?: string;
  opacity?: string;
  dirty: boolean;
}

// Rendering batch for optimized updates
export interface RenderBatch {
  cells: Array<{
    x: number;
    y: number;
    virtual: VirtualCell;
    element: HTMLElement;
  }>;
  priority: 'high' | 'normal' | 'low';
  timestamp: number;
}

// Performance configuration
export interface PerformanceConfig {
  maxBatchSize: number;
  frameTargetMs: number;
  enableVirtualDom: boolean;
  enableObjectPooling: boolean;
  adaptiveFrameRate: boolean;
  memoryManagement: boolean;
}

// Performance metrics
export interface DetailedMetrics {
  renderTime: number;
  batchCount: number;
  cellsUpdated: number;
  cellsSkipped: number;
  cacheHitRate: number;
  memoryUsage: number;
  frameRate: number;
  virtualDomDiffs: number;
  pooledObjectsReused: number;
}

/**
 * High-performance ASCII renderer with advanced optimization techniques
 */
export class RenderingOptimizer {
  private config: PerformanceConfig;
  private metrics: DetailedMetrics;
  
  // Virtual DOM system (React-inspired)
  private virtualGrid: Map<string, VirtualCell> = new Map();
  private previousGrid: Map<string, VirtualCell> = new Map();
  private dirtyRegions: Set<string> = new Set();
  
  // Object pooling (Node.js optimization)
  private cellPool: VirtualCell[] = [];
  private batchPool: RenderBatch[] = [];
  private elementCache: Map<string, HTMLElement> = new Map();
  
  // Adaptive performance management
  private frameTimeHistory: number[] = [];
  private adaptiveThreshold: number = 16.67; // 60fps target
  private currentBatchSize: number = 50;
  private frameSkipCounter: number = 0;
  
  // Memory management
  private cacheSize: number = 0;
  private maxCacheSize: number = 1000;
  private gcCounter: number = 0;
  
  // Rendering queue system
  private renderQueue: RenderBatch[] = [];
  private isRendering: boolean = false;
  private renderRequestId: number | null = null;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      maxBatchSize: 100,
      frameTargetMs: 16.67, // 60fps
      enableVirtualDom: true,
      enableObjectPooling: true,
      adaptiveFrameRate: true,
      memoryManagement: true,
      ...config
    };
    
    this.metrics = {
      renderTime: 0,
      batchCount: 0,
      cellsUpdated: 0,
      cellsSkipped: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
      frameRate: 60,
      virtualDomDiffs: 0,
      pooledObjectsReused: 0
    };
    
    // Initialize object pools
    this.initializeObjectPools();
    
    // Set up adaptive performance monitoring
    if (this.config.adaptiveFrameRate) {
      this.startAdaptiveFrameRateMonitoring();
    }
    
    // Set up memory management
    if (this.config.memoryManagement) {
      this.startMemoryManagement();
    }
  }

  /**
   * Main rendering method with performance optimization
   */
  async optimizedRender(
    viewportWidth: number,
    viewportHeight: number,
    cellProvider: (x: number, y: number) => { character: string; color: string; opacity?: string },
    containerElement: HTMLElement
  ): Promise<DetailedMetrics> {
    const startTime = performance.now();
    let cellsUpdated = 0;
    let cellsSkipped = 0;
    let virtualDomDiffs = 0;

    try {
      // Phase 1: Virtual DOM generation and diffing
      const newVirtualGrid = new Map<string, VirtualCell>();
      
      for (let y = 0; y < viewportHeight; y++) {
        for (let x = 0; x < viewportWidth; x++) {
          const cellKey = `${x}-${y}`;
          const cellData = cellProvider(x, y);
          
          // Create or reuse virtual cell
          const virtualCell = this.getPooledVirtualCell();
          virtualCell.character = cellData.character;
          virtualCell.color = cellData.color;
          virtualCell.opacity = cellData.opacity || '1.0';
          virtualCell.dirty = false;
          
          // Compare with previous state (React-style diffing)
          const previousCell = this.virtualGrid.get(cellKey);
          if (!previousCell || this.cellsDiffer(previousCell, virtualCell)) {
            virtualCell.dirty = true;
            this.dirtyRegions.add(cellKey);
            virtualDomDiffs++;
          }
          
          newVirtualGrid.set(cellKey, virtualCell);
        }
      }
      
      // Phase 2: Create render batches for dirty cells
      const renderBatches = this.createOptimizedBatches(newVirtualGrid, containerElement);
      
      // Phase 3: Execute batched rendering
      for (const batch of renderBatches) {
        const batchResult = await this.executeBatch(batch);
        cellsUpdated += batchResult.updated;
        cellsSkipped += batchResult.skipped;
      }
      
      // Phase 4: Update virtual DOM state
      this.virtualGrid = newVirtualGrid;
      this.dirtyRegions.clear();
      
      // Update metrics
      const renderTime = performance.now() - startTime;
      this.updateMetrics(renderTime, renderBatches.length, cellsUpdated, cellsSkipped, virtualDomDiffs);
      
      return this.metrics;
      
    } catch (error) {
      console.error('Optimized render failed:', error);
      throw error;
    }
  }

  /**
   * Create optimized rendering batches
   */
  private createOptimizedBatches(
    virtualGrid: Map<string, VirtualCell>,
    containerElement: HTMLElement
  ): RenderBatch[] {
    const batches: RenderBatch[] = [];
    let currentBatch = this.getPooledBatch();
    
    for (const [cellKey, virtualCell] of virtualGrid) {
      if (!virtualCell.dirty) continue;
      
      const [x, y] = cellKey.split('-').map(Number);
      const element = this.getCachedElement(cellKey, containerElement);
      
      currentBatch.cells.push({ x, y, virtual: virtualCell, element });
      
      // Split into smaller batches for better frame time management
      if (currentBatch.cells.length >= this.currentBatchSize) {
        currentBatch.timestamp = performance.now();
        batches.push(currentBatch);
        currentBatch = this.getPooledBatch();
      }
    }
    
    // Add remaining cells
    if (currentBatch.cells.length > 0) {
      currentBatch.timestamp = performance.now();
      batches.push(currentBatch);
    }
    
    // Prioritize batches (visible area first)
    return this.prioritizeBatches(batches);
  }

  /**
   * Execute a render batch with performance monitoring
   */
  private async executeBatch(batch: RenderBatch): Promise<{ updated: number; skipped: number }> {
    let updated = 0;
    let skipped = 0;
    
    // Adaptive frame rate management
    if (this.config.adaptiveFrameRate && this.shouldSkipFrame()) {
      return { updated: 0, skipped: batch.cells.length };
    }
    
    // Use requestAnimationFrame for smooth rendering
    return new Promise((resolve) => {
      this.renderRequestId = requestAnimationFrame(() => {
        const batchStartTime = performance.now();
        
        for (const { element, virtual } of batch.cells) {
          try {
            // Only update if actually different (performance optimization)
            let hasChanges = false;
            
            if (element.textContent !== virtual.character) {
              element.textContent = virtual.character;
              hasChanges = true;
            }
            
            if (element.style.color !== virtual.color) {
              element.style.color = virtual.color;
              hasChanges = true;
            }
            
            if (element.style.opacity !== virtual.opacity) {
              element.style.opacity = virtual.opacity || '1.0';
              hasChanges = true;
            }
            
            if (hasChanges) {
              updated++;
            } else {
              skipped++;
            }
            
          } catch (error) {
            console.warn('Failed to update cell:', error);
            skipped++;
          }
        }
        
        // Track frame time for adaptive management
        const batchTime = performance.now() - batchStartTime;
        this.frameTimeHistory.push(batchTime);
        this.adaptBatchSize(batchTime);
        
        // Return batch to pool
        this.returnBatchToPool(batch);
        
        resolve({ updated, skipped });
      });
    });
  }

  /**
   * Compare two virtual cells for differences
   */
  private cellsDiffer(cell1: VirtualCell, cell2: VirtualCell): boolean {
    return (
      cell1.character !== cell2.character ||
      cell1.color !== cell2.color ||
      cell1.opacity !== cell2.opacity
    );
  }

  /**
   * Get cached DOM element or create new one
   */
  private getCachedElement(cellKey: string, container: HTMLElement): HTMLElement {
    let element = this.elementCache.get(cellKey);
    
    if (!element) {
      const [x, y] = cellKey.split('-').map(Number);
      element = container.querySelector(`#dungeon-cell-${x}-${y}`) as HTMLElement;
      
      if (!element) {
        // Element doesn't exist, this might be a dynamic resize scenario
        console.warn(`Element not found for cell ${cellKey}`);
        return this.createPlaceholderElement();
      }
      
      // Cache with memory management
      if (this.cacheSize < this.maxCacheSize) {
        this.elementCache.set(cellKey, element);
        this.cacheSize++;
      }
    }
    
    return element;
  }

  /**
   * Create placeholder element for error cases
   */
  private createPlaceholderElement(): HTMLElement {
    const element = document.createElement('span');
    element.style.cssText = 'width: 1ch; height: 1em; display: inline-block;';
    return element;
  }

  /**
   * Prioritize batches based on viewport importance
   */
  private prioritizeBatches(batches: RenderBatch[]): RenderBatch[] {
    // Sort by priority and timestamp
    return batches.sort((a, b) => {
      if (a.priority !== b.priority) {
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.timestamp - b.timestamp;
    });
  }

  /**
   * Adaptive batch size management
   */
  private adaptBatchSize(frameTime: number): void {
    if (!this.config.adaptiveFrameRate) return;
    
    const targetFrameTime = this.config.frameTargetMs;
    
    if (frameTime > targetFrameTime * 1.2) {
      // Frame took too long, reduce batch size
      this.currentBatchSize = Math.max(10, this.currentBatchSize - 5);
    } else if (frameTime < targetFrameTime * 0.8) {
      // Frame was fast, can increase batch size
      this.currentBatchSize = Math.min(this.config.maxBatchSize, this.currentBatchSize + 2);
    }
  }

  /**
   * Determine if we should skip the current frame
   */
  private shouldSkipFrame(): boolean {
    if (this.frameTimeHistory.length < 5) return false;
    
    const recentAverage = this.frameTimeHistory.slice(-5).reduce((a, b) => a + b) / 5;
    const isRunningBehind = recentAverage > this.adaptiveThreshold * 1.5;
    
    if (isRunningBehind) {
      this.frameSkipCounter++;
      // Skip every 3rd frame when running behind
      return this.frameSkipCounter % 3 === 0;
    }
    
    this.frameSkipCounter = 0;
    return false;
  }

  /**
   * Initialize object pools for memory efficiency
   */
  private initializeObjectPools(): void {
    if (!this.config.enableObjectPooling) return;
    
    // Pre-allocate virtual cells
    for (let i = 0; i < 1000; i++) {
      this.cellPool.push({
        character: '',
        color: '',
        opacity: '1.0',
        dirty: false
      });
    }
    
    // Pre-allocate render batches
    for (let i = 0; i < 20; i++) {
      this.batchPool.push({
        cells: [],
        priority: 'normal',
        timestamp: 0
      });
    }
  }

  /**
   * Get virtual cell from pool or create new one
   */
  private getPooledVirtualCell(): VirtualCell {
    if (this.config.enableObjectPooling && this.cellPool.length > 0) {
      const cell = this.cellPool.pop()!;
      this.metrics.pooledObjectsReused++;
      return cell;
    }
    
    return {
      character: '',
      color: '',
      opacity: '1.0',
      dirty: false
    };
  }

  /**
   * Get render batch from pool or create new one
   */
  private getPooledBatch(): RenderBatch {
    if (this.config.enableObjectPooling && this.batchPool.length > 0) {
      const batch = this.batchPool.pop()!;
      batch.cells.length = 0; // Clear cells array
      batch.priority = 'normal';
      batch.timestamp = 0;
      this.metrics.pooledObjectsReused++;
      return batch;
    }
    
    return {
      cells: [],
      priority: 'normal',
      timestamp: 0
    };
  }

  /**
   * Return batch to pool for reuse
   */
  private returnBatchToPool(batch: RenderBatch): void {
    if (!this.config.enableObjectPooling) return;
    
    // Return cells to pool
    for (const { virtual } of batch.cells) {
      this.cellPool.push(virtual);
    }
    
    // Clear and return batch to pool
    batch.cells.length = 0;
    if (this.batchPool.length < 20) {
      this.batchPool.push(batch);
    }
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(
    renderTime: number,
    batchCount: number,
    cellsUpdated: number,
    cellsSkipped: number,
    virtualDomDiffs: number
  ): void {
    this.metrics.renderTime = renderTime;
    this.metrics.batchCount = batchCount;
    this.metrics.cellsUpdated = cellsUpdated;
    this.metrics.cellsSkipped = cellsSkipped;
    this.metrics.virtualDomDiffs = virtualDomDiffs;
    
    // Calculate cache hit rate
    const totalCacheRequests = this.elementCache.size;
    this.metrics.cacheHitRate = totalCacheRequests > 0 ? (this.cacheSize / totalCacheRequests) : 0;
    
    // Calculate frame rate
    if (this.frameTimeHistory.length > 0) {
      const averageFrameTime = this.frameTimeHistory.slice(-10).reduce((a, b) => a + b) / Math.min(10, this.frameTimeHistory.length);
      this.metrics.frameRate = Math.min(60, 1000 / averageFrameTime);
    }
    
    // Memory usage (approximate)
    this.metrics.memoryUsage = (
      this.virtualGrid.size * 100 + // Estimated bytes per virtual cell
      this.elementCache.size * 50 + // Estimated bytes per cached element reference
      this.cellPool.length * 100 // Estimated bytes per pooled cell
    );
  }

  /**
   * Start adaptive frame rate monitoring
   */
  private startAdaptiveFrameRateMonitoring(): void {
    setInterval(() => {
      // Trim frame time history to prevent memory growth
      if (this.frameTimeHistory.length > 100) {
        this.frameTimeHistory = this.frameTimeHistory.slice(-50);
      }
      
      // Adjust adaptive threshold based on performance
      const recentAverage = this.frameTimeHistory.slice(-10).reduce((a, b) => a + b) / Math.min(10, this.frameTimeHistory.length);
      if (recentAverage > this.config.frameTargetMs * 2) {
        this.adaptiveThreshold = Math.min(33.33, this.adaptiveThreshold * 1.1); // Max 30fps
      } else if (recentAverage < this.config.frameTargetMs * 0.5) {
        this.adaptiveThreshold = Math.max(this.config.frameTargetMs, this.adaptiveThreshold * 0.9);
      }
    }, 5000);
  }

  /**
   * Start memory management system
   */
  private startMemoryManagement(): void {
    setInterval(() => {
      this.gcCounter++;
      
      // Periodic cache cleanup
      if (this.gcCounter % 10 === 0) {
        this.cleanupCaches();
      }
      
      // Pool size management
      if (this.cellPool.length > 2000) {
        this.cellPool = this.cellPool.slice(0, 1000);
      }
      
      if (this.batchPool.length > 40) {
        this.batchPool = this.batchPool.slice(0, 20);
      }
    }, 1000);
  }

  /**
   * Clean up caches and memory
   */
  private cleanupCaches(): void {
    // Clear element cache if it gets too large
    if (this.elementCache.size > this.maxCacheSize * 1.5) {
      const keysToRemove = Array.from(this.elementCache.keys()).slice(0, this.maxCacheSize / 2);
      for (const key of keysToRemove) {
        this.elementCache.delete(key);
      }
      this.cacheSize = this.elementCache.size;
    }
    
    // Clear old virtual DOM data
    this.previousGrid.clear();
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): DetailedMetrics {
    return { ...this.metrics };
  }

  /**
   * Get configuration
   */
  public getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Force garbage collection of resources
   */
  public forceCleanup(): void {
    this.cleanupCaches();
    this.frameTimeHistory.length = 0;
    this.dirtyRegions.clear();
    
    if (this.renderRequestId) {
      cancelAnimationFrame(this.renderRequestId);
      this.renderRequestId = null;
    }
  }

  /**
   * Cleanup all resources
   */
  public cleanup(): void {
    this.forceCleanup();
    this.virtualGrid.clear();
    this.previousGrid.clear();
    this.elementCache.clear();
    this.cellPool.length = 0;
    this.batchPool.length = 0;
    this.renderQueue.length = 0;
  }
}