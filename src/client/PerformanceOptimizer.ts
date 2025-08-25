/**
 * Performance optimization utilities for rendering
 * Implements Context7 patterns: batching, throttling, and caching
 */
export class PerformanceOptimizer {
  private updateQueue: Set<string> = new Set();
  private renderCache: Map<string, any> = new Map();
  private scheduledUpdateId: number | null = null;
  private lastUpdateTime: number = 0;
  private throttleMs: number = 16; // ~60fps
  private batchSize: number = 100;
  
  // Performance metrics
  private metrics = {
    cellsUpdated: 0,
    lastUpdateTime: 0,
    averageUpdateTime: 0,
    totalUpdates: 0,
    cacheHits: 0,
    cacheMisses: 0
  };

  constructor(throttleMs: number = 16, batchSize: number = 100) {
    this.throttleMs = throttleMs;
    this.batchSize = batchSize;
  }

  /**
   * Schedule an update with throttling
   */
  public scheduleUpdate(key: string, updateFn: () => void): void {
    this.updateQueue.add(key);
    
    if (this.scheduledUpdateId !== null) {
      cancelAnimationFrame(this.scheduledUpdateId);
    }

    const now = performance.now();
    if (now - this.lastUpdateTime < this.throttleMs) {
      // Throttle: schedule for later
      this.scheduledUpdateId = requestAnimationFrame(() => {
        this.processBatchedUpdates(updateFn);
        this.scheduledUpdateId = null;
        this.lastUpdateTime = performance.now();
      });
    } else {
      // Execute immediately
      this.processBatchedUpdates(updateFn);
      this.lastUpdateTime = now;
    }
  }

  /**
   * Process updates in batches for better performance
   */
  private processBatchedUpdates(updateFn: () => void): void {
    const startTime = performance.now();
    const updates = Array.from(this.updateQueue);
    this.updateQueue.clear();

    const processBatch = (startIndex: number) => {
      const endIndex = Math.min(startIndex + this.batchSize, updates.length);
      
      for (let i = startIndex; i < endIndex; i++) {
        updateFn();
      }

      if (endIndex < updates.length) {
        // Continue with next batch
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => processBatch(endIndex));
        } else {
          setTimeout(() => processBatch(endIndex), 0);
        }
      } else {
        // All batches complete
        const updateTime = performance.now() - startTime;
        this.updateMetrics(updateTime, updates.length);
      }
    };

    if (updates.length > 0) {
      processBatch(0);
    }
  }

  /**
   * Cache a computed value
   */
  public cache<T>(key: string, computeFn: () => T): T {
    if (this.renderCache.has(key)) {
      this.metrics.cacheHits++;
      return this.renderCache.get(key);
    }

    this.metrics.cacheMisses++;
    const value = computeFn();
    this.renderCache.set(key, value);
    return value;
  }

  /**
   * Clear cache entry or entire cache
   */
  public clearCache(key?: string): void {
    if (key) {
      this.renderCache.delete(key);
    } else {
      this.renderCache.clear();
    }
  }

  /**
   * Check if cache has entry
   */
  public hasCache(key: string): boolean {
    return this.renderCache.has(key);
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(updateTime: number, cellsUpdated: number): void {
    this.metrics.lastUpdateTime = updateTime;
    this.metrics.cellsUpdated = cellsUpdated;
    this.metrics.totalUpdates++;
    
    // Calculate average using exponential moving average
    if (this.metrics.totalUpdates === 1) {
      this.metrics.averageUpdateTime = updateTime;
    } else {
      this.metrics.averageUpdateTime = 
        (this.metrics.averageUpdateTime * 0.85) + (updateTime * 0.15);
    }

    // Auto-adjust performance settings based on metrics
    this.adjustPerformanceSettings(updateTime, cellsUpdated);
  }

  /**
   * Dynamically adjust performance settings based on current performance
   */
  private adjustPerformanceSettings(renderTime: number, cellsUpdated: number): void {
    const performanceThreshold = 16; // Target 16ms for 60fps
    
    if (renderTime > performanceThreshold) {
      // Performance is suffering - reduce batch size and increase throttling
      if (this.batchSize > 25) {
        this.batchSize = Math.max(25, this.batchSize - 10);
      }
      if (this.throttleMs < 32) {
        this.throttleMs = Math.min(32, this.throttleMs + 4);
      }
      
      console.log(`🐌 Performance: Reducing batch size to ${this.batchSize}, throttle: ${this.throttleMs}ms`);
      
    } else if (renderTime < performanceThreshold * 0.5 && this.batchSize < 200) {
      // Performance is good - can increase quality
      this.batchSize = Math.min(200, this.batchSize + 25);
      if (this.throttleMs > 16) {
        this.throttleMs = Math.max(16, this.throttleMs - 2);
      }
      
      console.log(`🚀 Performance: Increasing batch size to ${this.batchSize}, throttle: ${this.throttleMs}ms`);
    }
  }

  /**
   * Get current performance metrics
   */
  public getMetrics() {
    return {
      ...this.metrics,
      cacheSize: this.renderCache.size,
      updateQueueSize: this.updateQueue.size,
      currentBatchSize: this.batchSize,
      currentThrottleMs: this.throttleMs,
      cacheHitRate: this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) || 0
    };
  }

  /**
   * Reset performance metrics
   */
  public resetMetrics(): void {
    this.metrics = {
      cellsUpdated: 0,
      lastUpdateTime: 0,
      averageUpdateTime: 0,
      totalUpdates: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    if (this.scheduledUpdateId !== null) {
      cancelAnimationFrame(this.scheduledUpdateId);
      this.scheduledUpdateId = null;
    }
    this.updateQueue.clear();
    this.renderCache.clear();
  }
}