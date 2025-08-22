import { APManager, APAbilityProcessor } from '../../APSystem';
import { TurnManager } from '../../TurnManager';
import { FreeActionProcessor } from '../../FreeActions';
import { Player, FreeAction, APAction, GameSession, PerformanceMetrics } from '../../../shared/types';
import { AP_SYSTEM, GAME_CONFIG } from '../../../shared/constants';
import { 
  createConcurrentLobbies,
  createMockPlayers,
  PerformanceTimer,
  getMemoryUsage,
  delay,
  validateGameState
} from '../utils/testHelpers';

/**
 * Performance and load testing for the Refined AP System
 * Tests system behavior under high load with multiple concurrent lobbies
 */
describe('Load Testing and Performance', () => {
  let performanceTimer: PerformanceTimer;
  let initialMemory: NodeJS.MemoryUsage;

  beforeEach(() => {
    performanceTimer = new PerformanceTimer();
    initialMemory = getMemoryUsage();
    
    // Clear any existing timers
    jest.clearAllTimers();
  });

  afterEach(() => {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  });

  describe('Concurrent Lobby Performance', () => {
    test('should handle 50 concurrent lobbies efficiently', async () => {
      const lobbyCount = 50;
      const playersPerLobby = 4; // Smaller groups for stress testing
      
      performanceTimer.start();
      
      // Create game sessions
      const sessions = await createConcurrentLobbies(lobbyCount, playersPerLobby);
      
      const setupTime = performanceTimer.end();
      
      expect(setupTime).toBeLessThan(1000); // Should setup quickly
      expect(sessions).toHaveLength(lobbyCount);
      
      // Initialize all game components for each session
      const gameComponents = sessions.map(session => ({
        session,
        apManager: new APManager(),
        turnManager: new TurnManager(),
        freeActionProcessor: new FreeActionProcessor(),
        abilityProcessor: new APAbilityProcessor(new APManager())
      }));

      // Initialize all players in all sessions
      performanceTimer.start();
      
      gameComponents.forEach(({ session, apManager, freeActionProcessor }) => {
        session.players.forEach(player => {
          apManager.initializePlayer(player.id, player.currentAP);
          freeActionProcessor.addPlayer(player);
        });
      });
      
      const initTime = performanceTimer.end();
      
      expect(initTime).toBeLessThan(2000); // Should initialize all players quickly
    });

    test('should maintain performance with maximum players per lobby', async () => {
      const lobbyCount = 25; // Fewer lobbies but max players each
      const playersPerLobby = GAME_CONFIG.MAX_PLAYERS_PER_LOBBY;
      
      performanceTimer.start();
      
      const sessions = await createConcurrentLobbies(lobbyCount, playersPerLobby);
      
      const totalPlayers = lobbyCount * playersPerLobby;
      console.log(`Testing with ${totalPlayers} total players across ${lobbyCount} lobbies`);
      
      // Test initiative calculation for all lobbies
      const gameComponents = sessions.map(session => {
        const turnManager = new TurnManager();
        const players = Array.from(session.players.values());
        
        performanceTimer.start();
        turnManager.calculateInitiative(players);
        const initTime = performanceTimer.end();
        
        expect(initTime).toBeLessThan(AP_SYSTEM.MAX_INITIATIVE_CALC_TIME);
        
        return { session, turnManager };
      });
      
      const avgInitTime = performanceTimer.getAverage();
      expect(avgInitTime).toBeLessThan(AP_SYSTEM.MAX_INITIATIVE_CALC_TIME);
    });

    test('should handle concurrent turn processing across lobbies', async () => {
      const lobbyCount = 20;
      const playersPerLobby = 6;
      
      const sessions = await createConcurrentLobbies(lobbyCount, playersPerLobby);
      
      // Setup game components for all sessions
      const lobbyComponents = sessions.map(session => {
        const apManager = new APManager();
        const turnManager = new TurnManager();
        const freeActionProcessor = new FreeActionProcessor();
        const abilityProcessor = new APAbilityProcessor(apManager);
        
        const players = Array.from(session.players.values());
        
        // Initialize all systems
        players.forEach(player => {
          apManager.initializePlayer(player.id, player.currentAP);
          freeActionProcessor.addPlayer(player);
        });
        
        turnManager.calculateInitiative(players);
        players.forEach(player => {
          turnManager.setPlayerReady(player.id, true);
        });
        turnManager.startCombat();
        
        return {
          session,
          apManager,
          turnManager,
          freeActionProcessor,
          abilityProcessor,
          players
        };
      });

      // Process one turn for each lobby concurrently
      performanceTimer.start();
      
      const turnPromises = lobbyComponents.map(async (components) => {
        const { turnManager, freeActionProcessor, apManager } = components;
        const currentPlayer = turnManager.getCurrentPlayer();
        
        if (currentPlayer) {
          const player = components.players.find(p => p.id === currentPlayer.playerId)!;
          
          // Execute free action
          const action: FreeAction = {
            type: 'BASIC_DEFENSE',
            playerId: player.id,
            immediate: true,
            timestamp: Date.now()
          };
          
          freeActionProcessor.executeImmediately(action);
          
          // Add AP and end turn
          apManager.addAPForTurn(player.id);
          turnManager.endTurn();
        }
      });
      
      await Promise.all(turnPromises);
      const concurrentTurnTime = performanceTimer.end();
      
      expect(concurrentTurnTime).toBeLessThan(AP_SYSTEM.MAX_TURN_PROCESSING_TIME * lobbyCount);
    });
  });

  describe('Action Processing Performance', () => {
    test('should handle rapid fire actions efficiently', async () => {
      const actionCount = 1000;
      const players = createMockPlayers(8);
      const freeActionProcessor = new FreeActionProcessor();
      
      // Initialize players
      players.forEach(player => {
        freeActionProcessor.addPlayer(player);
      });

      const actions: FreeAction[] = [];
      
      // Create batch of actions
      for (let i = 0; i < actionCount; i++) {
        const player = players[i % players.length]!;
        actions.push({
          type: 'BASIC_DEFENSE',
          playerId: player.id,
          immediate: true,
          timestamp: Date.now() + i
        });
      }

      // Process all actions and measure performance
      performanceTimer.start();
      
      const results = actions.map(action => {
        return freeActionProcessor.executeImmediately(action);
      });
      
      const processingTime = performanceTimer.end();
      
      // Verify all actions succeeded
      const successCount = results.filter(r => r.success).length;
      expect(successCount).toBe(actionCount);
      
      // Performance should be good
      expect(processingTime).toBeLessThan(1000); // 1000 actions in under 1 second
      
      const actionsPerSecond = actionCount / (processingTime / 1000);
      console.log(`Processed ${actionsPerSecond.toFixed(0)} actions per second`);
      
      expect(actionsPerSecond).toBeGreaterThan(500); // At least 500 actions/second
    });

    test('should maintain AP processing performance under load', async () => {
      const operationCount = 10000;
      const playerCount = 100;
      const apManager = new APManager();
      
      // Initialize many players
      const playerIds: string[] = [];
      for (let i = 0; i < playerCount; i++) {
        const playerId = `player${i}`;
        playerIds.push(playerId);
        apManager.initializePlayer(playerId, 5);
      }

      // Generate mixed AP operations
      const operations: (() => void)[] = [];
      
      for (let i = 0; i < operationCount; i++) {
        const playerId = playerIds[i % playerIds.length]!;
        
        // Mix of different operations
        const operationType = i % 4;
        
        switch (operationType) {
          case 0:
            operations.push(() => apManager.addAPForTurn(playerId));
            break;
          case 1:
            operations.push(() => apManager.spendAP(playerId, 1));
            break;
          case 2:
            operations.push(() => apManager.canAfford(playerId, 2));
            break;
          case 3:
            operations.push(() => apManager.getCurrentAP(playerId));
            break;
        }
      }

      // Execute all operations
      performanceTimer.start();
      
      operations.forEach(op => op());
      
      const apProcessingTime = performanceTimer.end();
      
      expect(apProcessingTime).toBeLessThan(AP_SYSTEM.MAX_AP_VALIDATION_TIME * (operationCount / 100));
      
      const opsPerSecond = operationCount / (apProcessingTime / 1000);
      console.log(`Processed ${opsPerSecond.toFixed(0)} AP operations per second`);
    });

    test('should handle ability processing under load', async () => {
      const abilityCount = 500;
      const apManager = new APManager();
      const abilityProcessor = new APAbilityProcessor(apManager);
      
      // Create high-skill players
      const players = createMockPlayers(10, {
        skills: {
          combat: 80,
          swords: 90,
          fire_magic: 85,
          healing_magic: 75,
          arcane_magic: 70,
          archery: 80,
          stealth: 60,
          athletics: 70,
          survival: 65,
          leadership: 75
        }
      });

      // Initialize players with high AP
      players.forEach(player => {
        apManager.initializePlayer(player.id, 8);
      });

      const abilityExecutions: (() => any)[] = [];
      
      // Create ability executions
      for (let i = 0; i < abilityCount; i++) {
        const player = players[i % players.length]!;
        const abilities = ['power_strike', 'fireball', 'heal', 'whirlwind_attack'];
        const ability = abilities[i % abilities.length]!;
        
        abilityExecutions.push(() => {
          return abilityProcessor.executeAPAbility(player.id, ability, player);
        });
      }

      // Execute abilities
      performanceTimer.start();
      
      const results = abilityExecutions.map(exec => exec());
      
      const abilityProcessingTime = performanceTimer.end();
      
      const successCount = results.filter(r => r.success).length;
      console.log(`Successfully executed ${successCount}/${abilityCount} abilities`);
      
      expect(abilityProcessingTime).toBeLessThan(5000); // 500 abilities in under 5 seconds
      
      const abilitiesPerSecond = abilityCount / (abilityProcessingTime / 1000);
      console.log(`Processed ${abilitiesPerSecond.toFixed(0)} abilities per second`);
    });
  });

  describe('Memory Usage and Optimization', () => {
    test('should maintain reasonable memory usage with many players', async () => {
      const playerCount = 1000;
      const apManager = new APManager();
      const freeActionProcessor = new FreeActionProcessor();
      
      const memoryBefore = getMemoryUsage();
      
      // Create and initialize many players
      const players = createMockPlayers(playerCount);
      
      players.forEach(player => {
        apManager.initializePlayer(player.id, player.currentAP);
        freeActionProcessor.addPlayer(player);
      });
      
      const memoryAfter = getMemoryUsage();
      
      const memoryIncrease = memoryAfter.heapUsed - memoryBefore.heapUsed;
      const memoryPerPlayer = memoryIncrease / playerCount;
      
      console.log(`Memory per player: ${(memoryPerPlayer / 1024).toFixed(2)} KB`);
      
      // Should use less than 5KB per player
      expect(memoryPerPlayer).toBeLessThan(5 * 1024);
      
      // Total memory increase should be reasonable
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
    });

    test('should handle memory cleanup when players disconnect', async () => {
      const playerCount = 500;
      const players = createMockPlayers(playerCount);
      
      const apManager = new APManager();
      const freeActionProcessor = new FreeActionProcessor();
      const turnManager = new TurnManager();
      
      // Initialize all players
      players.forEach(player => {
        apManager.initializePlayer(player.id, player.currentAP);
        freeActionProcessor.addPlayer(player);
      });
      
      turnManager.calculateInitiative(players);
      
      const memoryWithAllPlayers = getMemoryUsage();
      
      // Remove half the players
      const playersToRemove = players.slice(0, playerCount / 2);
      
      playersToRemove.forEach(player => {
        apManager.removePlayer(player.id);
        freeActionProcessor.removePlayer(player.id);
        turnManager.removePlayer(player.id);
      });
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      await delay(100); // Allow time for cleanup
      
      const memoryAfterRemoval = getMemoryUsage();
      
      // Memory should decrease after player removal
      const memoryReduction = memoryWithAllPlayers.heapUsed - memoryAfterRemoval.heapUsed;
      
      console.log(`Memory reduction after removing ${playersToRemove.length} players: ${(memoryReduction / 1024 / 1024).toFixed(2)} MB`);
      
      // Should have some memory reduction (at least 1MB)
      expect(memoryReduction).toBeGreaterThan(1024 * 1024);
    });

    test('should prevent memory leaks during long sessions', async () => {
      const sessionDuration = 100; // Simulate 100 rounds
      const players = createMockPlayers(8);
      
      const apManager = new APManager();
      const freeActionProcessor = new FreeActionProcessor();
      const turnManager = new TurnManager();
      
      // Initialize session
      players.forEach(player => {
        apManager.initializePlayer(player.id, player.currentAP);
        freeActionProcessor.addPlayer(player);
      });
      
      turnManager.calculateInitiative(players);
      players.forEach(player => {
        turnManager.setPlayerReady(player.id, true);
      });
      turnManager.startCombat();
      
      const memoryBaseline = getMemoryUsage();
      
      // Simulate long session
      for (let round = 0; round < sessionDuration; round++) {
        for (let turn = 0; turn < players.length; turn++) {
          const currentPlayer = turnManager.getCurrentPlayer();
          
          if (currentPlayer) {
            const player = players.find(p => p.id === currentPlayer.playerId)!;
            
            // Perform actions
            const action: FreeAction = {
              type: 'BASIC_DEFENSE',
              playerId: player.id,
              immediate: true,
              timestamp: Date.now()
            };
            
            freeActionProcessor.executeImmediately(action);
            apManager.addAPForTurn(player.id);
            turnManager.endTurn();
          }
          
          // Small delay to simulate real-world timing
          await delay(1);
        }
        
        // Periodic memory check
        if (round % 20 === 0) {
          const currentMemory = getMemoryUsage();
          const memoryGrowth = currentMemory.heapUsed - memoryBaseline.heapUsed;
          
          // Memory growth should be reasonable
          expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024); // Less than 10MB growth
        }
      }
      
      const finalMemory = getMemoryUsage();
      const totalMemoryGrowth = finalMemory.heapUsed - memoryBaseline.heapUsed;
      
      console.log(`Memory growth after ${sessionDuration} rounds: ${(totalMemoryGrowth / 1024 / 1024).toFixed(2)} MB`);
      
      // Total memory growth should be minimal
      expect(totalMemoryGrowth).toBeLessThan(20 * 1024 * 1024); // Less than 20MB total growth
    });
  });

  describe('Scalability Metrics', () => {
    test('should provide performance metrics for monitoring', async () => {
      const testScenarios = [
        { lobbies: 10, players: 4 },
        { lobbies: 25, players: 6 },
        { lobbies: 50, players: 8 }
      ];
      
      const performanceResults: PerformanceMetrics[] = [];
      
      for (const scenario of testScenarios) {
        const sessions = await createConcurrentLobbies(scenario.lobbies, scenario.players);
        
        performanceTimer.start();
        
        // Initialize all sessions
        sessions.forEach(session => {
          const apManager = new APManager();
          const turnManager = new TurnManager();
          const players = Array.from(session.players.values());
          
          players.forEach(player => {
            apManager.initializePlayer(player.id, player.currentAP);
          });
          
          turnManager.calculateInitiative(players);
        });
        
        const totalTime = performanceTimer.end();
        const avgTimePerLobby = totalTime / scenario.lobbies;
        
        const metrics: PerformanceMetrics = {
          currentTurn: avgTimePerLobby,
          averageTurn: performanceTimer.getAverage(),
          maxTurn: performanceTimer.getMax(),
          target: AP_SYSTEM.MAX_INITIATIVE_CALC_TIME,
          status: avgTimePerLobby < AP_SYSTEM.MAX_INITIATIVE_CALC_TIME ? 'GOOD' : 'NEEDS_OPTIMIZATION'
        };
        
        performanceResults.push(metrics);
        
        console.log(`Scenario ${scenario.lobbies} lobbies x ${scenario.players} players:`);
        console.log(`  Average time per lobby: ${avgTimePerLobby.toFixed(2)}ms`);
        console.log(`  Status: ${metrics.status}`);
        
        performanceTimer.clear();
      }
      
      // All scenarios should meet performance targets
      performanceResults.forEach(metrics => {
        expect(metrics.status).toBe('GOOD');
      });
    });

    test('should identify performance bottlenecks', async () => {
      const bottleneckTests = [
        {
          name: 'AP Operations',
          test: () => {
            const apManager = new APManager();
            for (let i = 0; i < 1000; i++) {
              apManager.initializePlayer(`player${i}`, 5);
              apManager.addAPForTurn(`player${i}`);
              apManager.spendAP(`player${i}`, 2);
            }
          }
        },
        {
          name: 'Initiative Calculation',
          test: () => {
            const turnManager = new TurnManager();
            const players = createMockPlayers(100);
            turnManager.calculateInitiative(players);
          }
        },
        {
          name: 'Free Action Processing',
          test: () => {
            const processor = new FreeActionProcessor();
            const players = createMockPlayers(50);
            
            players.forEach(player => processor.addPlayer(player));
            
            for (let i = 0; i < 500; i++) {
              const player = players[i % players.length]!;
              processor.executeImmediately({
                type: 'BASIC_DEFENSE',
                playerId: player.id,
                immediate: true,
                timestamp: Date.now()
              });
            }
          }
        }
      ];
      
      const bottleneckResults = bottleneckTests.map(test => {
        performanceTimer.start();
        test.test();
        const duration = performanceTimer.end();
        
        return {
          name: test.name,
          duration,
          status: duration < 100 ? 'FAST' : duration < 500 ? 'ACCEPTABLE' : 'SLOW'
        };
      });
      
      bottleneckResults.forEach(result => {
        console.log(`${result.name}: ${result.duration.toFixed(2)}ms (${result.status})`);
        expect(result.status).not.toBe('SLOW');
      });
    });
  });
});