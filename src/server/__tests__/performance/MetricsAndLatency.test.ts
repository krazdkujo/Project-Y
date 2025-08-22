import { APManager, APAbilityProcessor } from '../../APSystem';
import { TurnManager } from '../../TurnManager';
import { FreeActionProcessor } from '../../FreeActions';
import { Player, FreeAction, APAction, PerformanceMetrics, TestResult } from '../../../shared/types';
import { AP_SYSTEM, GAME_CONFIG } from '../../../shared/constants';
import { 
  createMockPlayers,
  createBalancedParty,
  PerformanceTimer,
  getMemoryUsage,
  delay,
  NetworkSimulator
} from '../utils/testHelpers';

/**
 * Performance metrics and latency testing
 * Measures and validates system responsiveness under various conditions
 */
describe('Performance Metrics and Latency Testing', () => {
  let gameComponents: {
    apManager: APManager;
    turnManager: TurnManager;
    freeActionProcessor: FreeActionProcessor;
    abilityProcessor: APAbilityProcessor;
  };
  let performanceTimer: PerformanceTimer;
  let players: Player[];

  beforeEach(() => {
    performanceTimer = new PerformanceTimer();
    
    gameComponents = {
      apManager: new APManager(),
      turnManager: new TurnManager(),
      freeActionProcessor: new FreeActionProcessor(),
      abilityProcessor: new APAbilityProcessor(new APManager())
    };

    players = createBalancedParty();
    
    // Initialize all systems
    players.forEach(player => {
      gameComponents.apManager.initializePlayer(player.id, player.currentAP);
      gameComponents.freeActionProcessor.addPlayer(player);
    });
  });

  describe('Action Latency Measurements', () => {
    test('should measure free action response times', async () => {
      const actionCount = 100;
      const latencies: number[] = [];

      for (let i = 0; i < actionCount; i++) {
        const player = players[i % players.length]!;
        
        const action: FreeAction = {
          type: 'BASIC_DEFENSE',
          playerId: player.id,
          immediate: true,
          timestamp: Date.now()
        };

        performanceTimer.start();
        const result = gameComponents.freeActionProcessor.executeImmediately(action);
        const latency = performanceTimer.end();

        if (result.success) {
          latencies.push(latency);
        }
      }

      // Calculate latency statistics
      const avgLatency = latencies.reduce((sum, val) => sum + val, 0) / latencies.length;
      const maxLatency = Math.max(...latencies);
      const minLatency = Math.min(...latencies);
      const p95Latency = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)]!;

      console.log('Free Action Latency Stats:');
      console.log(`  Average: ${avgLatency.toFixed(2)}ms`);
      console.log(`  Maximum: ${maxLatency.toFixed(2)}ms`);
      console.log(`  Minimum: ${minLatency.toFixed(2)}ms`);
      console.log(`  95th Percentile: ${p95Latency.toFixed(2)}ms`);

      // Performance targets
      expect(avgLatency).toBeLessThan(5); // Average under 5ms
      expect(maxLatency).toBeLessThan(25); // Max under 25ms
      expect(p95Latency).toBeLessThan(15); // 95% under 15ms
    });

    test('should measure AP ability response times', async () => {
      const abilityCount = 50;
      const latencies = new Map<string, number[]>();

      // Test different ability types
      const abilityTypes = ['power_strike', 'fireball', 'heal', 'shield_bash'];

      for (let i = 0; i < abilityCount; i++) {
        const player = players[i % players.length]!;
        const abilityId = abilityTypes[i % abilityTypes.length]!;

        if (!latencies.has(abilityId)) {
          latencies.set(abilityId, []);
        }

        // Ensure player has enough AP
        gameComponents.apManager.setAP(player.id, 8);

        performanceTimer.start();
        const result = gameComponents.abilityProcessor.executeAPAbility(player.id, abilityId, player);
        const latency = performanceTimer.end();

        if (result.success) {
          latencies.get(abilityId)!.push(latency);
        }
      }

      // Analyze latencies by ability type
      latencies.forEach((abilityLatencies, abilityId) => {
        if (abilityLatencies.length > 0) {
          const avgLatency = abilityLatencies.reduce((sum, val) => sum + val, 0) / abilityLatencies.length;
          const maxLatency = Math.max(...abilityLatencies);

          console.log(`${abilityId} - Avg: ${avgLatency.toFixed(2)}ms, Max: ${maxLatency.toFixed(2)}ms`);

          expect(avgLatency).toBeLessThan(10); // Average under 10ms
          expect(maxLatency).toBeLessThan(50); // Max under 50ms
        }
      });
    });

    test('should measure turn processing latency', async () => {
      const turnCount = 20;
      const turnLatencies: number[] = [];

      // Initialize turn system
      gameComponents.turnManager.calculateInitiative(players);
      players.forEach(player => {
        gameComponents.turnManager.setPlayerReady(player.id, true);
      });
      gameComponents.turnManager.startCombat();

      for (let i = 0; i < turnCount; i++) {
        const currentPlayer = gameComponents.turnManager.getCurrentPlayer();
        
        if (currentPlayer) {
          const player = players.find(p => p.id === currentPlayer.playerId)!;

          performanceTimer.start();

          // Perform turn actions
          const action: FreeAction = {
            type: 'MOVE',
            playerId: player.id,
            target: { 
              x: Math.max(0, Math.min(19, player.position.x + (Math.random() > 0.5 ? 1 : -1))),
              y: Math.max(0, Math.min(19, player.position.y + (Math.random() > 0.5 ? 1 : -1)))
            },
            immediate: true,
            timestamp: Date.now()
          };

          gameComponents.freeActionProcessor.executeImmediately(action);
          gameComponents.apManager.addAPForTurn(player.id);
          gameComponents.turnManager.endTurn();

          const turnLatency = performanceTimer.end();
          turnLatencies.push(turnLatency);
        }
      }

      const avgTurnLatency = turnLatencies.reduce((sum, val) => sum + val, 0) / turnLatencies.length;
      const maxTurnLatency = Math.max(...turnLatencies);

      console.log(`Turn Processing - Avg: ${avgTurnLatency.toFixed(2)}ms, Max: ${maxTurnLatency.toFixed(2)}ms`);

      expect(avgTurnLatency).toBeLessThan(AP_SYSTEM.MAX_TURN_PROCESSING_TIME);
      expect(maxTurnLatency).toBeLessThan(AP_SYSTEM.MAX_TURN_PROCESSING_TIME * 2);
    });
  });

  describe('Network Latency Simulation', () => {
    test('should handle various network conditions', async () => {
      const networkConditions = [
        { name: 'Local', latency: 1, jitter: 0 },
        { name: 'LAN', latency: 5, jitter: 2 },
        { name: 'Broadband', latency: 50, jitter: 10 },
        { name: 'Mobile', latency: 100, jitter: 25 },
        { name: 'Satellite', latency: 500, jitter: 100 }
      ];

      for (const condition of networkConditions) {
        const networkSim = new NetworkSimulator(condition.latency, 0, condition.jitter);
        const responseLatencies: number[] = [];

        // Test 20 actions under this network condition
        for (let i = 0; i < 20; i++) {
          const player = players[0]!;
          
          const action: FreeAction = {
            type: 'BASIC_DEFENSE',
            playerId: player.id,
            immediate: true,
            timestamp: Date.now()
          };

          performanceTimer.start();

          // Simulate network delay for action transmission
          const actionMessage = await networkSim.simulateMessage(JSON.stringify(action));
          
          if (actionMessage) {
            // Process action (server-side)
            const result = gameComponents.freeActionProcessor.executeImmediately(JSON.parse(actionMessage));
            
            // Simulate network delay for response
            await networkSim.simulateMessage(JSON.stringify(result));
          }

          const totalLatency = performanceTimer.end();
          responseLatencies.push(totalLatency);
        }

        const avgResponseLatency = responseLatencies.reduce((sum, val) => sum + val, 0) / responseLatencies.length;
        
        console.log(`${condition.name} Network - Avg Response: ${avgResponseLatency.toFixed(2)}ms`);

        // Response time should be reasonable considering network conditions
        const expectedMaxLatency = (condition.latency * 2) + condition.jitter + 50; // Round trip + processing
        expect(avgResponseLatency).toBeLessThan(expectedMaxLatency);
      }
    });

    test('should measure packet loss impact', async () => {
      const packetLossRates = [0, 1, 5, 10]; // Percentage packet loss
      
      for (const lossRate of packetLossRates) {
        const networkSim = new NetworkSimulator(50, lossRate, 10);
        let successfulActions = 0;
        let totalAttempts = 100;

        for (let i = 0; i < totalAttempts; i++) {
          const player = players[0]!;
          
          const action: FreeAction = {
            type: 'BASIC_DEFENSE',
            playerId: player.id,
            immediate: true,
            timestamp: Date.now()
          };

          const actionMessage = await networkSim.simulateMessage(JSON.stringify(action));
          
          if (actionMessage) {
            successfulActions++;
          }
        }

        const successRate = (successfulActions / totalAttempts) * 100;
        const expectedSuccessRate = 100 - lossRate;

        console.log(`${lossRate}% Packet Loss - Success Rate: ${successRate.toFixed(1)}%`);

        // Success rate should be close to expected (within 5%)
        expect(successRate).toBeGreaterThan(expectedSuccessRate - 5);
      }
    });
  });

  describe('Memory Usage Monitoring', () => {
    test('should track memory usage during gameplay', async () => {
      const memorySnapshots: NodeJS.MemoryUsage[] = [];
      const snapshotInterval = 10; // Take snapshot every 10 operations

      memorySnapshots.push(getMemoryUsage());

      // Simulate extended gameplay
      for (let round = 0; round < 100; round++) {
        // Initialize new turn
        gameComponents.turnManager.calculateInitiative(players);
        
        // Process actions for all players
        players.forEach(player => {
          // Multiple actions per player
          for (let action = 0; action < 5; action++) {
            const freeAction: FreeAction = {
              type: 'BASIC_DEFENSE',
              playerId: player.id,
              immediate: true,
              timestamp: Date.now()
            };

            gameComponents.freeActionProcessor.executeImmediately(freeAction);
            gameComponents.apManager.addAPForTurn(player.id);
          }
        });

        // Take memory snapshot periodically
        if (round % snapshotInterval === 0) {
          memorySnapshots.push(getMemoryUsage());
        }
      }

      // Analyze memory growth
      const initialMemory = memorySnapshots[0]!;
      const finalMemory = memorySnapshots[memorySnapshots.length - 1]!;
      
      const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryGrowthMB = memoryGrowth / (1024 * 1024);

      console.log(`Memory growth over 100 rounds: ${memoryGrowthMB.toFixed(2)} MB`);

      // Memory growth should be reasonable
      expect(memoryGrowthMB).toBeLessThan(10); // Less than 10MB growth

      // Check for memory leaks (continuous growth)
      let growthTrend = 0;
      for (let i = 1; i < memorySnapshots.length; i++) {
        if (memorySnapshots[i]!.heapUsed > memorySnapshots[i - 1]!.heapUsed) {
          growthTrend++;
        }
      }

      const growthPercentage = (growthTrend / (memorySnapshots.length - 1)) * 100;
      console.log(`Memory growth trend: ${growthPercentage.toFixed(1)}% of snapshots showed growth`);

      // Not all snapshots should show growth (would indicate a leak)
      expect(growthPercentage).toBeLessThan(80);
    });

    test('should measure memory efficiency per player', async () => {
      const playerCounts = [10, 50, 100, 500];
      const memoryPerPlayer: number[] = [];

      for (const count of playerCounts) {
        const testPlayers = createMockPlayers(count);
        const memoryBefore = getMemoryUsage();

        // Initialize all systems with players
        testPlayers.forEach(player => {
          gameComponents.apManager.initializePlayer(player.id, player.currentAP);
          gameComponents.freeActionProcessor.addPlayer(player);
        });

        const memoryAfter = getMemoryUsage();
        const memoryIncrease = memoryAfter.heapUsed - memoryBefore.heapUsed;
        const memoryPerPlayerBytes = memoryIncrease / count;

        memoryPerPlayer.push(memoryPerPlayerBytes);

        console.log(`${count} players - ${(memoryPerPlayerBytes / 1024).toFixed(2)} KB per player`);

        // Clean up for next test
        testPlayers.forEach(player => {
          gameComponents.apManager.removePlayer(player.id);
          gameComponents.freeActionProcessor.removePlayer(player.id);
        });

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }

      // Memory efficiency should scale reasonably
      memoryPerPlayer.forEach(memory => {
        expect(memory).toBeLessThan(10 * 1024); // Less than 10KB per player
      });

      // Memory per player should not increase significantly with scale
      const efficiencyRatio = memoryPerPlayer[memoryPerPlayer.length - 1]! / memoryPerPlayer[0]!;
      expect(efficiencyRatio).toBeLessThan(2); // Should not double
    });
  });

  describe('Performance Regression Testing', () => {
    test('should establish performance baselines', async () => {
      const testScenarios: TestResult[] = [];

      // Scenario 1: Single player operations
      const singlePlayerMetrics = await measureScenario('Single Player Operations', () => {
        const player = players[0]!;
        
        for (let i = 0; i < 1000; i++) {
          gameComponents.apManager.addAPForTurn(player.id);
          gameComponents.apManager.spendAP(player.id, 1);
          
          const action: FreeAction = {
            type: 'BASIC_DEFENSE',
            playerId: player.id,
            immediate: true,
            timestamp: Date.now()
          };
          
          gameComponents.freeActionProcessor.executeImmediately(action);
        }
      });

      testScenarios.push({
        scenario: 'Single Player Operations',
        passed: singlePlayerMetrics.status === 'GOOD',
        metrics: singlePlayerMetrics
      });

      // Scenario 2: Multi-player combat
      const multiPlayerMetrics = await measureScenario('Multi-Player Combat', () => {
        gameComponents.turnManager.calculateInitiative(players);
        
        for (let round = 0; round < 50; round++) {
          players.forEach(player => {
            const action: FreeAction = {
              type: 'BASIC_DEFENSE',
              playerId: player.id,
              immediate: true,
              timestamp: Date.now()
            };
            
            gameComponents.freeActionProcessor.executeImmediately(action);
            gameComponents.apManager.addAPForTurn(player.id);
          });
        }
      });

      testScenarios.push({
        scenario: 'Multi-Player Combat',
        passed: multiPlayerMetrics.status === 'GOOD',
        metrics: multiPlayerMetrics
      });

      // Scenario 3: Complex ability processing
      const abilityMetrics = await measureScenario('Complex Ability Processing', () => {
        players.forEach(player => {
          gameComponents.apManager.setAP(player.id, 8);
        });

        for (let i = 0; i < 200; i++) {
          const player = players[i % players.length]!;
          gameComponents.abilityProcessor.executeAPAbility(player.id, 'power_strike', player);
          gameComponents.apManager.setAP(player.id, 8); // Reset AP for next ability
        }
      });

      testScenarios.push({
        scenario: 'Complex Ability Processing',
        passed: abilityMetrics.status === 'GOOD',
        metrics: abilityMetrics
      });

      // Report results
      console.log('\n=== Performance Baseline Results ===');
      testScenarios.forEach(result => {
        console.log(`${result.scenario}: ${result.passed ? 'PASS' : 'FAIL'}`);
        console.log(`  Average: ${result.metrics.averageTurn.toFixed(2)}ms`);
        console.log(`  Maximum: ${result.metrics.maxTurn.toFixed(2)}ms`);
        console.log(`  Target: ${result.metrics.target.toFixed(2)}ms`);
        console.log(`  Status: ${result.metrics.status}`);
        console.log('');
      });

      // All scenarios should pass baseline requirements
      testScenarios.forEach(result => {
        expect(result.passed).toBe(true);
      });
    });

    async function measureScenario(name: string, operation: () => void): Promise<PerformanceMetrics> {
      const measurements: number[] = [];
      const iterations = 10;

      // Warm up
      operation();

      // Measure performance over multiple iterations
      for (let i = 0; i < iterations; i++) {
        performanceTimer.start();
        operation();
        const duration = performanceTimer.end();
        measurements.push(duration);
      }

      const averageTurn = measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
      const maxTurn = Math.max(...measurements);
      const target = name.includes('Single Player') ? 50 : 
                    name.includes('Multi-Player') ? 200 : 
                    name.includes('Ability') ? 100 : 100;

      return {
        currentTurn: measurements[measurements.length - 1]!,
        averageTurn,
        maxTurn,
        target,
        status: averageTurn < target ? 'GOOD' : 'NEEDS_OPTIMIZATION'
      };
    }
  });

  describe('Real-time Performance Monitoring', () => {
    test('should provide real-time performance metrics', async () => {
      const metricsHistory: PerformanceMetrics[] = [];
      const monitoringDuration = 100; // Monitor for 100 operations

      // Simulate real-time monitoring
      for (let i = 0; i < monitoringDuration; i++) {
        performanceTimer.start();

        // Simulate various operations
        const player = players[i % players.length]!;
        
        // Random operation type
        const operationType = i % 3;
        
        switch (operationType) {
          case 0:
            gameComponents.apManager.addAPForTurn(player.id);
            break;
          case 1:
            const action: FreeAction = {
              type: 'BASIC_DEFENSE',
              playerId: player.id,
              immediate: true,
              timestamp: Date.now()
            };
            gameComponents.freeActionProcessor.executeImmediately(action);
            break;
          case 2:
            gameComponents.abilityProcessor.executeAPAbility(player.id, 'power_strike', player);
            break;
        }

        const operationTime = performanceTimer.end();

        // Calculate rolling metrics
        const recentMeasurements = performanceTimer.getMeasurements().slice(-10); // Last 10 measurements
        const currentMetrics: PerformanceMetrics = {
          currentTurn: operationTime,
          averageTurn: recentMeasurements.reduce((sum, val) => sum + val, 0) / recentMeasurements.length,
          maxTurn: Math.max(...recentMeasurements),
          target: 10, // 10ms target for individual operations
          status: operationTime < 10 ? 'GOOD' : 'NEEDS_OPTIMIZATION'
        };

        metricsHistory.push(currentMetrics);

        // Alert on performance degradation
        if (currentMetrics.status === 'NEEDS_OPTIMIZATION') {
          console.warn(`Performance alert at operation ${i}: ${operationTime.toFixed(2)}ms`);
        }
      }

      // Analyze overall performance
      const avgPerformance = metricsHistory.reduce((sum, metric) => sum + metric.currentTurn, 0) / metricsHistory.length;
      const goodPerformanceCount = metricsHistory.filter(m => m.status === 'GOOD').length;
      const performanceScore = (goodPerformanceCount / metricsHistory.length) * 100;

      console.log(`Overall Performance Score: ${performanceScore.toFixed(1)}%`);
      console.log(`Average Operation Time: ${avgPerformance.toFixed(2)}ms`);

      // Performance should be good at least 95% of the time
      expect(performanceScore).toBeGreaterThan(95);
    });
  });
});