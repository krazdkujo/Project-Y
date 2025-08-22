# 8-Player Multiplayer Performance Testing Protocols

## Overview

This document defines comprehensive performance testing protocols specifically designed for the 8-player multiplayer ASCII roguelike game. The protocols ensure stable, responsive gameplay under maximum load conditions while maintaining data consistency and real-time synchronization.

## Performance Requirements

### Core Performance Targets

| Metric | Target | Critical Threshold | Measurement Method |
|--------|---------|------------------|-------------------|
| Initiative Calculation | <50ms | <100ms | Performance.now() timing |
| Turn Processing | <100ms | <200ms | Server-side timing |
| Real-time Sync Latency | <100ms | <250ms | WebSocket ping-pong |
| Memory per Player | <10MB | <20MB | process.memoryUsage() |
| Database Query Time | <200ms | <500ms | Query execution timing |
| Session Initialization | <5s | <10s | End-to-end timing |
| Concurrent Actions | <500ms | <1000ms | Batch processing timing |

### Scalability Targets

| Scenario | Target | Measurement |
|----------|--------|-------------|
| Concurrent Sessions | 25 sessions (200 players) | System stability |
| Actions per Second | 80 (10 per player) | Throughput measurement |
| Database Connections | 50 concurrent | Connection pool monitoring |
| WebSocket Connections | 200 concurrent | Connection monitoring |
| Memory Usage (Total) | <2GB | Server memory monitoring |

## Test Environment Setup

### Test Infrastructure
```typescript
// src/testing/performance/multiplayer/TestInfrastructure.ts
export class MultiplayerTestInfrastructure {
  private servers: TestServer[] = [];
  private databases: TestDatabase[] = [];
  private loadBalancer: LoadBalancer;
  
  async setupInfrastructure(): Promise<void> {
    // Create test servers
    this.servers = await this.createTestServers(3);
    
    // Setup test databases
    this.databases = await this.setupTestDatabases();
    
    // Configure load balancer
    this.loadBalancer = await this.setupLoadBalancer(this.servers);
    
    // Initialize monitoring
    await this.initializeMonitoring();
  }
  
  async createTestEnvironment(sessionCount: number): Promise<TestEnvironment> {
    return {
      sessions: await this.createGameSessions(sessionCount, 8),
      monitoring: this.createMonitoringInstance(),
      dataCollectors: this.createDataCollectors(),
      performanceTrackers: this.createPerformanceTrackers()
    };
  }
}
```

## Performance Test Suites

### 1. Session Initialization Performance

```typescript
// src/testing/performance/multiplayer/SessionInitializationTests.ts
describe('8-Player Session Initialization Performance', () => {
  let infrastructure: MultiplayerTestInfrastructure;
  let performanceTracker: PerformanceTracker;

  beforeAll(async () => {
    infrastructure = new MultiplayerTestInfrastructure();
    await infrastructure.setupInfrastructure();
    performanceTracker = new PerformanceTracker();
  });

  test('single 8-player session initialization under 5 seconds', async () => {
    const timer = performanceTracker.startTimer('session_init');
    
    const session = await infrastructure.createGameSession('test-session', 8);
    
    const duration = timer.end();
    
    expect(duration).toBeLessThan(5000); // 5 seconds
    expect(session.players).toHaveLength(8);
    expect(session.status).toBe('ready');
    
    // Verify all players are connected
    for (const player of session.players) {
      expect(player.connectionStatus).toBe('connected');
    }
  });

  test('concurrent 10 session initialization performance', async () => {
    const timer = performanceTracker.startTimer('concurrent_session_init');
    
    const sessionPromises = Array.from({ length: 10 }, (_, i) =>
      infrastructure.createGameSession(`test-session-${i}`, 8)
    );
    
    const sessions = await Promise.all(sessionPromises);
    const duration = timer.end();
    
    expect(duration).toBeLessThan(15000); // 15 seconds for 10 sessions
    expect(sessions).toHaveLength(10);
    
    // Verify total player count
    const totalPlayers = sessions.reduce((sum, s) => sum + s.players.length, 0);
    expect(totalPlayers).toBe(80);
    
    // Check memory usage
    const memoryUsage = process.memoryUsage();
    expect(memoryUsage.heapUsed).toBeLessThan(800 * 1024 * 1024); // <800MB
  });
});
```

### 2. Turn Management Performance

```typescript
// src/testing/performance/multiplayer/TurnManagementTests.ts
describe('8-Player Turn Management Performance', () => {
  let gameSession: GameSession;
  let turnManager: TurnManager;
  let performanceTracker: PerformanceTracker;

  beforeEach(async () => {
    gameSession = await createTestGameSession(8);
    turnManager = gameSession.turnManager;
    performanceTracker = new PerformanceTracker();
  });

  test('initiative calculation performance with 8 players', async () => {
    const players = gameSession.players;
    const timer = performanceTracker.startTimer('initiative_calc');
    
    turnManager.calculateInitiative(players);
    
    const duration = timer.end();
    
    expect(duration).toBeLessThan(50); // 50ms target
    expect(turnManager.getTurnState().turnOrder).toHaveLength(8);
  });

  test('turn processing performance under load', async () => {
    // Setup game in active state
    await setupActiveGameState(gameSession);
    
    const turnTimes: number[] = [];
    const targetTurns = 32; // 4 full rounds
    
    for (let turn = 0; turn < targetTurns; turn++) {
      const timer = performanceTracker.startTimer(`turn_${turn}`);
      
      // Simulate turn with complex actions
      await simulateComplexTurn(gameSession);
      
      const turnTime = timer.end();
      turnTimes.push(turnTime);
      
      expect(turnTime).toBeLessThan(100); // 100ms per turn
    }
    
    // Analyze turn time statistics
    const avgTurnTime = turnTimes.reduce((a, b) => a + b, 0) / turnTimes.length;
    const maxTurnTime = Math.max(...turnTimes);
    
    expect(avgTurnTime).toBeLessThan(75); // Average under 75ms
    expect(maxTurnTime).toBeLessThan(150); // Max under 150ms
    
    console.log(`Turn Performance - Avg: ${avgTurnTime.toFixed(2)}ms, Max: ${maxTurnTime.toFixed(2)}ms`);
  });

  test('concurrent turn processing across multiple sessions', async () => {
    const sessions = await createMultipleGameSessions(5, 8); // 5 sessions, 8 players each
    const timer = performanceTracker.startTimer('concurrent_turns');
    
    // Process turns simultaneously across all sessions
    const turnPromises = sessions.map(session => 
      processConcurrentTurns(session, 8) // 8 turns per session
    );
    
    await Promise.all(turnPromises);
    const totalTime = timer.end();
    
    expect(totalTime).toBeLessThan(10000); // 10 seconds for all concurrent processing
    
    // Verify system stability
    const memoryUsage = process.memoryUsage();
    expect(memoryUsage.heapUsed).toBeLessThan(1.5 * 1024 * 1024 * 1024); // <1.5GB
  });
});
```

### 3. Real-time Synchronization Performance

```typescript
// src/testing/performance/multiplayer/RealtimeSyncTests.ts
describe('8-Player Real-time Synchronization Performance', () => {
  let gameSession: GameSession;
  let realtimeSync: RealtimeSync;
  let performanceTracker: PerformanceTracker;

  test('WebSocket message propagation latency', async () => {
    const session = await createTestGameSession(8);
    const latencies: number[] = [];
    
    // Test message propagation from each player to all others
    for (let senderIndex = 0; senderIndex < 8; senderIndex++) {
      const sender = session.players[senderIndex];
      const recipients = session.players.filter((_, i) => i !== senderIndex);
      
      const timer = performanceTracker.startTimer(`sync_${senderIndex}`);
      
      // Send action from sender
      const action = createTestAction(sender);
      await session.broadcastAction(action);
      
      // Wait for all recipients to receive
      await waitForActionReceipt(recipients, action.id);
      
      const latency = timer.end();
      latencies.push(latency);
      
      expect(latency).toBeLessThan(100); // 100ms target
    }
    
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    expect(avgLatency).toBeLessThan(75); // Average under 75ms
    
    console.log(`Sync Performance - Avg Latency: ${avgLatency.toFixed(2)}ms`);
  });

  test('game state consistency under concurrent actions', async () => {
    const session = await createTestGameSession(8);
    const timer = performanceTracker.startTimer('state_consistency');
    
    // Generate concurrent actions from all players
    const actionPromises = session.players.map(player => 
      generateConcurrentActions(player, 10) // 10 actions per player
    );
    
    const allActions = await Promise.all(actionPromises);
    const flatActions = allActions.flat();
    
    // Execute all actions concurrently
    await Promise.all(flatActions.map(action => session.processAction(action)));
    
    const processingTime = timer.end();
    
    expect(processingTime).toBeLessThan(2000); // 2 seconds for 80 actions
    
    // Verify state consistency across all players
    const gameStates = await Promise.all(
      session.players.map(player => session.getPlayerGameState(player.id))
    );
    
    // All players should have identical game state
    const baseState = gameStates[0];
    gameStates.forEach(state => {
      expect(state.turn).toBe(baseState.turn);
      expect(state.phase).toBe(baseState.phase);
      expect(state.activePlayer).toBe(baseState.activePlayer);
    });
  });

  test('player disconnection and reconnection performance', async () => {
    const session = await createTestGameSession(8);
    const timer = performanceTracker.startTimer('disconnect_reconnect');
    
    // Simulate player disconnections
    const disconnectingPlayers = session.players.slice(0, 3); // Disconnect 3 players
    await Promise.all(
      disconnectingPlayers.map(player => session.disconnectPlayer(player.id))
    );
    
    // Continue game with remaining players
    await processGameTurns(session, 5);
    
    // Reconnect players
    await Promise.all(
      disconnectingPlayers.map(player => session.reconnectPlayer(player.id))
    );
    
    const totalTime = timer.end();
    
    expect(totalTime).toBeLessThan(8000); // 8 seconds for disconnect/reconnect cycle
    expect(session.getActivePlayers()).toHaveLength(8);
    
    // Verify game state synchronization after reconnection
    const reconnectedStates = await Promise.all(
      disconnectingPlayers.map(player => session.getPlayerGameState(player.id))
    );
    
    reconnectedStates.forEach(state => {
      expect(state.synchronized).toBe(true);
      expect(state.missingTurns).toBeLessThan(6); // Should catch up quickly
    });
  });
});
```

### 4. Database Performance Under Load

```typescript
// src/testing/performance/multiplayer/DatabasePerformanceTests.ts
describe('8-Player Database Performance', () => {
  let dbPerformanceTracker: DatabasePerformanceTracker;
  let gameSession: GameSession;

  test('concurrent database operations performance', async () => {
    const session = await createTestGameSession(8);
    dbPerformanceTracker = new DatabasePerformanceTracker();
    
    // Simulate concurrent database operations from all players
    const operations = [
      'skill_update',
      'item_use',
      'ability_trigger',
      'player_state_save',
      'game_action_log'
    ];
    
    const operationPromises = session.players.flatMap(player =>
      operations.map(async operation => {
        const { duration } = await dbPerformanceTracker.measureQuery(
          operation,
          () => executePlayerDatabaseOperation(player, operation)
        );
        
        expect(duration).toBeLessThan(200); // 200ms per operation
        return { player: player.id, operation, duration };
      })
    );
    
    const results = await Promise.all(operationPromises);
    
    // Analyze performance statistics
    const stats = dbPerformanceTracker.getPerformanceStats();
    
    expect(stats.averageQueryTime).toBeLessThan(150); // 150ms average
    expect(stats.maxQueryTime).toBeLessThan(300); // 300ms max
    expect(stats.errorRate).toBeLessThan(0.01); // <1% error rate
    
    console.log('Database Performance Stats:', stats);
  });

  test('database connection pool under stress', async () => {
    const sessions = await createMultipleGameSessions(10, 8); // 80 players total
    const timer = performanceTracker.startTimer('db_connection_stress');
    
    // Generate high-frequency database operations
    const operationPromises = sessions.flatMap(session =>
      session.players.map(player => 
        generateDatabaseOperations(player, 20) // 20 operations per player
      )
    );
    
    await Promise.all(operationPromises.flat());
    const stressTestTime = timer.end();
    
    expect(stressTestTime).toBeLessThan(30000); // 30 seconds for 1600 operations
    
    // Verify connection pool health
    const poolStats = await getConnectionPoolStats();
    expect(poolStats.activeConnections).toBeLessThan(50);
    expect(poolStats.queuedRequests).toBe(0);
    expect(poolStats.errors).toBe(0);
  });

  test('real-time data synchronization performance', async () => {
    const session = await createTestGameSession(8);
    const timer = performanceTracker.startTimer('realtime_data_sync');
    
    // Trigger real-time updates from multiple players
    const updatePromises = session.players.map(async (player, index) => {
      // Stagger updates to simulate realistic gameplay
      await delay(index * 100);
      
      const updates = [
        { type: 'position', data: { x: Math.random() * 20, y: Math.random() * 20 } },
        { type: 'health', data: { current: Math.floor(Math.random() * 100) } },
        { type: 'ap', data: { current: Math.floor(Math.random() * 8) } }
      ];
      
      return Promise.all(
        updates.map(update => session.updatePlayerData(player.id, update))
      );
    });
    
    await Promise.all(updatePromises);
    const syncTime = timer.end();
    
    expect(syncTime).toBeLessThan(3000); // 3 seconds for all sync operations
    
    // Verify all players received all updates
    const finalStates = await Promise.all(
      session.players.map(player => session.getPlayerGameState(player.id))
    );
    
    finalStates.forEach(state => {
      expect(state.lastUpdateTime).toBeGreaterThan(Date.now() - 5000);
      expect(state.syncComplete).toBe(true);
    });
  });
});
```

### 5. Memory and Resource Management

```typescript
// src/testing/performance/multiplayer/ResourceManagementTests.ts
describe('8-Player Resource Management', () => {
  let resourceMonitor: ResourceMonitor;

  beforeEach(() => {
    resourceMonitor = new ResourceMonitor();
  });

  test('memory usage scaling with player count', async () => {
    const baselineMemory = process.memoryUsage();
    const sessions: GameSession[] = [];
    
    // Incrementally add players and measure memory
    for (let playerCount = 1; playerCount <= 8; playerCount++) {
      const session = await createTestGameSession(playerCount);
      sessions.push(session);
      
      const currentMemory = process.memoryUsage();
      const memoryPerPlayer = (currentMemory.heapUsed - baselineMemory.heapUsed) / playerCount;
      
      expect(memoryPerPlayer).toBeLessThan(10 * 1024 * 1024); // <10MB per player
      
      console.log(`${playerCount} players: ${(memoryPerPlayer / 1024 / 1024).toFixed(2)}MB per player`);
    }
    
    // Test memory cleanup
    for (const session of sessions) {
      await session.cleanup();
    }
    
    // Force garbage collection
    if (global.gc) global.gc();
    
    const finalMemory = process.memoryUsage();
    const memoryLeak = finalMemory.heapUsed - baselineMemory.heapUsed;
    
    expect(memoryLeak).toBeLessThan(50 * 1024 * 1024); // <50MB memory leak tolerance
  });

  test('CPU usage under concurrent gameplay', async () => {
    const sessions = await createMultipleGameSessions(5, 8); // 40 players
    const cpuMonitor = resourceMonitor.startCPUMonitoring();
    
    // Simulate intensive gameplay
    const gameplayPromises = sessions.map(session =>
      simulateIntensiveGameplay(session, 60000) // 1 minute of gameplay
    );
    
    await Promise.all(gameplayPromises);
    const cpuStats = cpuMonitor.getStats();
    
    expect(cpuStats.averageUsage).toBeLessThan(80); // <80% average CPU
    expect(cpuStats.maxUsage).toBeLessThan(95); // <95% peak CPU
    
    console.log('CPU Usage Stats:', cpuStats);
  });

  test('network bandwidth usage optimization', async () => {
    const session = await createTestGameSession(8);
    const networkMonitor = resourceMonitor.startNetworkMonitoring();
    
    // Generate network traffic through gameplay
    await simulateNetworkIntensiveActions(session, 30000); // 30 seconds
    
    const networkStats = networkMonitor.getStats();
    
    expect(networkStats.totalBandwidth).toBeLessThan(10 * 1024 * 1024); // <10MB total
    expect(networkStats.bandwidthPerPlayer).toBeLessThan(1.5 * 1024 * 1024); // <1.5MB per player
    
    console.log('Network Usage Stats:', networkStats);
  });
});
```

## Load Testing Scenarios

### Scenario 1: Peak Load Simulation
```typescript
export const PEAK_LOAD_SCENARIO = {
  name: 'Peak Load - 200 Concurrent Players',
  setup: {
    sessions: 25,
    playersPerSession: 8,
    duration: 300000, // 5 minutes
    actionsPerSecond: 10,
    actionDistribution: {
      movement: 30,
      abilities: 25,
      items: 20,
      skills: 15,
      social: 10
    }
  },
  expectations: {
    averageLatency: 100, // ms
    maxLatency: 250, // ms
    errorRate: 0.01, // 1%
    memoryUsage: 2048, // MB
    cpuUsage: 80 // %
  }
};
```

### Scenario 2: Stress Testing
```typescript
export const STRESS_TEST_SCENARIO = {
  name: 'Stress Test - Beyond Normal Capacity',
  setup: {
    sessions: 50,
    playersPerSession: 8,
    duration: 180000, // 3 minutes
    actionsPerSecond: 15,
    actionDistribution: {
      abilities: 40, // Heavy ability usage
      items: 30,
      movement: 20,
      skills: 10
    }
  },
  expectations: {
    averageLatency: 200, // ms
    maxLatency: 500, // ms
    errorRate: 0.05, // 5%
    memoryUsage: 4096, // MB
    cpuUsage: 90 // %
  }
};
```

### Scenario 3: Endurance Testing
```typescript
export const ENDURANCE_TEST_SCENARIO = {
  name: 'Endurance Test - Extended Gameplay',
  setup: {
    sessions: 10,
    playersPerSession: 8,
    duration: 3600000, // 1 hour
    actionsPerSecond: 5,
    actionDistribution: {
      movement: 35,
      abilities: 20,
      items: 20,
      skills: 15,
      social: 10
    }
  },
  expectations: {
    memoryGrowth: 500, // MB max growth
    performanceDegradation: 10, // % max degradation
    connectionStability: 99.5 // % uptime
  }
};
```

## Performance Monitoring Dashboard

### Real-time Metrics Collection
```typescript
// src/testing/performance/monitoring/PerformanceMonitor.ts
export class MultiplayerPerformanceMonitor {
  private metrics: MetricsCollector;
  private alerts: AlertManager;
  
  constructor() {
    this.metrics = new MetricsCollector();
    this.alerts = new AlertManager();
  }
  
  startMonitoring(sessions: GameSession[]): void {
    // Monitor key performance indicators
    this.monitorSessionMetrics(sessions);
    this.monitorDatabasePerformance();
    this.monitorNetworkLatency();
    this.monitorResourceUsage();
    
    // Set up alerts for threshold breaches
    this.setupPerformanceAlerts();
  }
  
  generatePerformanceReport(): PerformanceReport {
    return {
      timestamp: Date.now(),
      sessionMetrics: this.metrics.getSessionMetrics(),
      databaseMetrics: this.metrics.getDatabaseMetrics(),
      networkMetrics: this.metrics.getNetworkMetrics(),
      resourceMetrics: this.metrics.getResourceMetrics(),
      recommendations: this.generateOptimizationRecommendations()
    };
  }
  
  private setupPerformanceAlerts(): void {
    this.alerts.addThreshold('session_latency', 200, 'High session latency detected');
    this.alerts.addThreshold('database_query_time', 300, 'Slow database queries detected');
    this.alerts.addThreshold('memory_usage', 1024 * 1024 * 1024 * 2, 'High memory usage detected');
    this.alerts.addThreshold('error_rate', 0.02, 'High error rate detected');
  }
}
```

## Implementation Checklist

### Phase 1: Infrastructure Setup
- [ ] Set up test environment with 8-player capacity
- [ ] Configure database connection pooling
- [ ] Implement performance monitoring tools
- [ ] Create test data generators

### Phase 2: Core Performance Tests
- [ ] Implement session initialization tests
- [ ] Create turn management performance tests
- [ ] Build real-time synchronization tests
- [ ] Develop database performance tests

### Phase 3: Load Testing
- [ ] Implement peak load scenarios
- [ ] Create stress testing protocols
- [ ] Build endurance testing framework
- [ ] Set up automated performance reporting

### Phase 4: Optimization and Monitoring
- [ ] Implement performance optimization recommendations
- [ ] Set up continuous performance monitoring
- [ ] Create alerting system for performance degradation
- [ ] Document performance baselines and targets

This comprehensive protocol ensures that the 8-player multiplayer system can handle expected loads while maintaining excellent performance and user experience.