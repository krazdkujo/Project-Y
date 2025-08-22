import { APManager, APAbilityProcessor } from '../../APSystem';
import { TurnManager } from '../../TurnManager';
import { FreeActionProcessor } from '../../FreeActions';
import { Player, FreeAction, APAction, GameMessage } from '../../../shared/types';
import { AP_SYSTEM, GAME_CONFIG, ERROR_MESSAGES } from '../../../shared/constants';
import { 
  createBalancedParty, 
  createMockPlayer,
  PerformanceTimer,
  validateGameState,
  delay,
  expectPlayerPosition,
  expectAPInRange
} from '../utils/testHelpers';

/**
 * Integration tests for complete game session flow
 * Tests the interaction between all major components
 */
describe('Game Session Integration', () => {
  let apManager: APManager;
  let turnManager: TurnManager;
  let freeActionProcessor: FreeActionProcessor;
  let abilityProcessor: APAbilityProcessor;
  let players: Player[];
  let performanceTimer: PerformanceTimer;

  beforeEach(() => {
    jest.useFakeTimers();
    
    // Initialize all components
    apManager = new APManager();
    turnManager = new TurnManager();
    freeActionProcessor = new FreeActionProcessor();
    abilityProcessor = new APAbilityProcessor(apManager);
    performanceTimer = new PerformanceTimer();
    
    // Create balanced 8-player party
    players = createBalancedParty();
    
    // Initialize all systems with players
    players.forEach(player => {
      apManager.initializePlayer(player.id, player.currentAP);
      freeActionProcessor.addPlayer(player);
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    turnManager.reset();
  });

  describe('8-Player Game Initialization', () => {
    test('should initialize full 8-player session correctly', () => {
      performanceTimer.start();
      
      // Calculate initiative for all players
      turnManager.calculateInitiative(players);
      
      const initTime = performanceTimer.end();
      expect(initTime).toBeLessThan(AP_SYSTEM.MAX_INITIATIVE_CALC_TIME);

      // Verify turn order
      const turnState = turnManager.getTurnState();
      expect(turnState.turnOrder).toHaveLength(8);
      expect(turnState.phase).toBe('initiative');

      // Verify all players have initiative
      turnState.turnOrder.forEach(entry => {
        expect(entry.initiative).toBeGreaterThan(0);
        expect(entry.ready).toBe(false);
      });

      // Verify AP system initialization
      players.forEach(player => {
        expect(apManager.getCurrentAP(player.id)).toBe(player.currentAP);
      });
    });

    test('should handle player readiness phase', async () => {
      turnManager.calculateInitiative(players);
      
      // Mark players ready one by one
      for (let i = 0; i < players.length; i++) {
        const player = players[i]!;
        turnManager.setPlayerReady(player.id, true);
        
        if (i < players.length - 1) {
          expect(turnManager.areAllPlayersReady()).toBe(false);
        }
      }
      
      expect(turnManager.areAllPlayersReady()).toBe(true);
      
      // Start combat
      turnManager.startCombat();
      const turnState = turnManager.getTurnState();
      expect(turnState.phase).toBe('actions');
    });

    test('should maintain performance during full session setup', () => {
      const setupTimer = new PerformanceTimer();
      
      setupTimer.start();
      turnManager.calculateInitiative(players);
      const initTime = setupTimer.end();
      
      setupTimer.start();
      players.forEach(player => {
        turnManager.setPlayerReady(player.id, true);
      });
      const readyTime = setupTimer.end();
      
      setupTimer.start();
      turnManager.startCombat();
      const combatTime = setupTimer.end();
      
      expect(initTime).toBeLessThan(AP_SYSTEM.MAX_INITIATIVE_CALC_TIME);
      expect(readyTime).toBeLessThan(25); // Should be very fast
      expect(combatTime).toBeLessThan(10); // Should be instant
    });
  });

  describe('Complete Turn Cycle', () => {
    beforeEach(async () => {
      turnManager.calculateInitiative(players);
      players.forEach(player => {
        turnManager.setPlayerReady(player.id, true);
      });
      turnManager.startCombat();
    });

    test('should process complete turn with free actions and AP abilities', async () => {
      const currentPlayer = turnManager.getCurrentPlayer()!;
      const player = players.find(p => p.id === currentPlayer.playerId)!;
      
      // Execute free action (movement)
      const moveAction: FreeAction = {
        type: 'MOVE',
        playerId: player.id,
        target: { x: player.position.x + 1, y: player.position.y },
        immediate: true,
        timestamp: Date.now()
      };
      
      const moveResult = freeActionProcessor.executeImmediately(moveAction);
      expect(moveResult.success).toBe(true);
      
      // Execute AP ability
      const initialAP = apManager.getCurrentAP(player.id);
      const abilityResult = abilityProcessor.executeAPAbility(player.id, 'power_strike', player);
      
      if (abilityResult.success) {
        expect(apManager.getCurrentAP(player.id)).toBeLessThan(initialAP);
      }
      
      // Add AP for next turn
      const newAP = apManager.addAPForTurn(player.id);
      expect(newAP).toBeGreaterThanOrEqual(initialAP - (abilityResult.apSpent || 0) + AP_SYSTEM.MIN_AP_PER_TURN);
      
      // End turn
      turnManager.endTurn();
      jest.advanceTimersByTime(500); // nextTurn delay
      
      // Verify turn advanced
      const nextPlayer = turnManager.getCurrentPlayer()!;
      expect(nextPlayer.playerId).not.toBe(currentPlayer.playerId);
    });

    test('should complete full round with all 8 players', async () => {
      const initialPlayer = turnManager.getCurrentPlayer()!.playerId;
      let completedTurns = 0;
      
      // Track round completion
      let roundCompleted = false;
      turnManager.on('round_completed', () => {
        roundCompleted = true;
      });
      
      // Process turns for all players
      for (let i = 0; i < players.length; i++) {
        const currentPlayer = turnManager.getCurrentPlayer()!;
        const player = players.find(p => p.id === currentPlayer.playerId)!;
        
        // Each player performs some actions
        const defenseAction: FreeAction = {
          type: 'BASIC_DEFENSE',
          playerId: player.id,
          immediate: true,
          timestamp: Date.now()
        };
        
        const defenseResult = freeActionProcessor.executeImmediately(defenseAction);
        expect(defenseResult.success).toBe(true);
        
        // Add AP and end turn
        apManager.addAPForTurn(player.id);
        turnManager.endTurn();
        jest.advanceTimersByTime(500);
        
        completedTurns++;
      }
      
      expect(completedTurns).toBe(8);
      expect(roundCompleted).toBe(true);
      
      // Should be back to first player
      const finalPlayer = turnManager.getCurrentPlayer()!;
      expect(finalPlayer.playerId).toBe(initialPlayer);
    });

    test('should handle turn timeouts gracefully', async () => {
      const currentPlayer = turnManager.getCurrentPlayer()!;
      let timeoutOccurred = false;
      
      turnManager.on('turn_timeout', () => {
        timeoutOccurred = true;
      });
      
      // Let turn timeout
      jest.advanceTimersByTime(AP_SYSTEM.TURN_TIME_LIMIT);
      
      expect(timeoutOccurred).toBe(true);
      
      // Should advance to next player
      const nextPlayer = turnManager.getCurrentPlayer()!;
      expect(nextPlayer.playerId).not.toBe(currentPlayer.playerId);
    });
  });

  describe('Complex Combat Scenarios', () => {
    beforeEach(async () => {
      turnManager.calculateInitiative(players);
      players.forEach(player => {
        turnManager.setPlayerReady(player.id, true);
      });
      turnManager.startCombat();
    });

    test('should handle multi-target combat scenario', async () => {
      // Find a mage and position targets nearby
      const mage = players.find(p => p.name.includes('mage'))!;
      const targets = players.filter(p => p.id !== mage.id).slice(0, 3);
      
      // Position targets adjacent to mage
      targets.forEach((target, index) => {
        freeActionProcessor.updatePlayer({
          ...target,
          position: { x: mage.position.x + index, y: mage.position.y }
        });
      });
      
      // Ensure mage has enough AP for fireball
      apManager.setAP(mage.id, 8);
      
      // Execute area attack if mage's turn
      if (turnManager.getCurrentPlayer()?.playerId === mage.id) {
        const abilityResult = abilityProcessor.executeAPAbility(mage.id, 'fireball', mage);
        
        if (abilityResult.success) {
          expect(abilityResult.effects).toBeDefined();
          expect(abilityResult.effects![0]?.type).toBe('damage');
          expect(abilityResult.effects![0]?.target).toBe('area');
        }
      }
    });

    test('should handle healing and support actions', async () => {
      // Find a cleric
      const cleric = players.find(p => p.name.includes('cleric'))!;
      const target = players.find(p => p.id !== cleric.id)!;
      
      // Damage the target first
      freeActionProcessor.updatePlayer({
        ...target,
        health: 50
      });
      
      // Ensure cleric has AP and skill for healing
      apManager.setAP(cleric.id, 8);
      
      // Position target adjacent for basic attack healing test
      freeActionProcessor.updatePlayer({
        ...target,
        position: { x: cleric.position.x + 1, y: cleric.position.y }
      });
      
      if (turnManager.getCurrentPlayer()?.playerId === cleric.id) {
        const healResult = abilityProcessor.executeAPAbility(cleric.id, 'heal', cleric);
        
        if (healResult.success) {
          expect(healResult.effects![0]?.type).toBe('heal');
          expect(healResult.effects![0]?.value).toBeGreaterThan(0);
        }
      }
    });

    test('should handle player knockouts and removal', async () => {
      const victim = players[0]!;
      
      // Reduce player to 0 health
      freeActionProcessor.updatePlayer({
        ...victim,
        health: 0
      });
      
      // Remove from turn order
      turnManager.removePlayer(victim.id);
      apManager.removePlayer(victim.id);
      freeActionProcessor.removePlayer(victim.id);
      
      // Verify removal
      const turnState = turnManager.getTurnState();
      expect(turnState.turnOrder.find(e => e.playerId === victim.id)).toBeUndefined();
      expect(apManager.getCurrentAP(victim.id)).toBe(0);
      expect(freeActionProcessor.getPlayer(victim.id)).toBeUndefined();
    });
  });

  describe('Player Reconnection and Late Joining', () => {
    beforeEach(async () => {
      turnManager.calculateInitiative(players);
      players.forEach(player => {
        turnManager.setPlayerReady(player.id, true);
      });
      turnManager.startCombat();
    });

    test('should handle player disconnection and reconnection', async () => {
      const disconnectingPlayer = players[2]!;
      
      // Simulate disconnection
      turnManager.removePlayer(disconnectingPlayer.id);
      freeActionProcessor.removePlayer(disconnectingPlayer.id);
      
      // Continue for a few turns
      for (let i = 0; i < 3; i++) {
        turnManager.endTurn();
        jest.advanceTimersByTime(500);
      }
      
      // Simulate reconnection
      const reconnectedPlayer = {
        ...disconnectingPlayer,
        health: disconnectingPlayer.health - 10 // Some health lost during disconnect
      };
      
      turnManager.addPlayer(reconnectedPlayer);
      freeActionProcessor.addPlayer(reconnectedPlayer);
      apManager.initializePlayer(reconnectedPlayer.id, 2);
      
      // Verify reconnection
      const turnState = turnManager.getTurnState();
      expect(turnState.turnOrder.find(e => e.playerId === reconnectedPlayer.id)).toBeDefined();
      expect(freeActionProcessor.getPlayer(reconnectedPlayer.id)).toBeDefined();
    });

    test('should handle late player joining mid-session', async () => {
      const latePlayer = createMockPlayer('late-joiner', {
        name: 'Late Joiner',
        position: { x: 15, y: 15 }
      });
      
      // Add late player during active combat
      turnManager.addPlayer(latePlayer);
      freeActionProcessor.addPlayer(latePlayer);
      apManager.initializePlayer(latePlayer.id, 2);
      
      // Verify integration
      const turnState = turnManager.getTurnState();
      expect(turnState.turnOrder).toHaveLength(9); // 8 + 1
      expect(freeActionProcessor.getPlayer(latePlayer.id)).toBeDefined();
      expect(apManager.getCurrentAP(latePlayer.id)).toBe(2);
    });
  });

  describe('System Integration and State Consistency', () => {
    test('should maintain state consistency across all systems', async () => {
      turnManager.calculateInitiative(players);
      players.forEach(player => {
        turnManager.setPlayerReady(player.id, true);
      });
      turnManager.startCombat();
      
      // Perform many operations
      for (let round = 0; round < 3; round++) {
        for (let playerIndex = 0; playerIndex < players.length; playerIndex++) {
          const currentPlayer = turnManager.getCurrentPlayer()!;
          const player = players.find(p => p.id === currentPlayer.playerId)!;
          
          // Random actions each turn
          const actions = [
            () => {
              const moveAction: FreeAction = {
                type: 'MOVE',
                playerId: player.id,
                target: { 
                  x: Math.max(0, Math.min(19, player.position.x + (Math.random() > 0.5 ? 1 : -1))),
                  y: Math.max(0, Math.min(19, player.position.y + (Math.random() > 0.5 ? 1 : -1)))
                },
                immediate: true,
                timestamp: Date.now()
              };
              return freeActionProcessor.executeImmediately(moveAction);
            },
            () => {
              const defenseAction: FreeAction = {
                type: 'BASIC_DEFENSE',
                playerId: player.id,
                immediate: true,
                timestamp: Date.now()
              };
              return freeActionProcessor.executeImmediately(defenseAction);
            },
            () => {
              // Try to use an ability if player has enough AP and skill
              const availableAbilities = abilityProcessor.getAvailableAbilities(player);
              if (availableAbilities.length > 0) {
                const ability = availableAbilities[0]!;
                if (apManager.canAfford(player.id, ability.apCost)) {
                  return abilityProcessor.executeAPAbility(player.id, ability.id, player);
                }
              }
              return { success: false, timestamp: Date.now() };
            }
          ];
          
          // Execute random action
          const randomAction = actions[Math.floor(Math.random() * actions.length)]!;
          randomAction();
          
          // Add AP and end turn
          apManager.addAPForTurn(player.id);
          turnManager.endTurn();
          jest.advanceTimersByTime(500);
        }
      }
      
      // Validate final state consistency
      const session = {
        roomId: 'test-room',
        players: new Map(players.map(p => [p.id, p])),
        turnManager: turnManager.getTurnState(),
        apManager: {
          playerAP: apManager.getAllPlayerAP(),
          maxAP: 8,
          apPerTurn: 2,
          lastAPUpdate: Date.now()
        },
        startTime: Date.now(),
        status: 'active' as const
      };
      
      const validation = validateGameState(session);
      expect(validation.isValid).toBe(true);
      if (!validation.isValid) {
        console.error('State validation errors:', validation.errors);
      }
    });

    test('should handle concurrent operations without race conditions', async () => {
      turnManager.calculateInitiative(players);
      players.forEach(player => {
        turnManager.setPlayerReady(player.id, true);
      });
      turnManager.startCombat();
      
      const operations: Promise<any>[] = [];
      
      // Simulate concurrent operations
      operations.push(
        Promise.resolve().then(() => {
          // AP operations
          players.forEach(player => {
            apManager.addAPForTurn(player.id);
          });
        })
      );
      
      operations.push(
        Promise.resolve().then(() => {
          // Free action operations
          players.forEach(player => {
            const defenseAction: FreeAction = {
              type: 'BASIC_DEFENSE',
              playerId: player.id,
              immediate: true,
              timestamp: Date.now()
            };
            freeActionProcessor.executeImmediately(defenseAction);
          });
        })
      );
      
      operations.push(
        Promise.resolve().then(() => {
          // Turn management operations
          turnManager.pauseTurn();
          jest.advanceTimersByTime(100);
          turnManager.resumeTurn();
        })
      );
      
      // Wait for all operations to complete
      await Promise.all(operations);
      
      // System should still be consistent
      const turnState = turnManager.getTurnState();
      expect(turnState.turnOrder).toHaveLength(players.length);
      
      players.forEach(player => {
        expect(apManager.getCurrentAP(player.id)).toBeGreaterThanOrEqual(0);
        expect(freeActionProcessor.getPlayer(player.id)).toBeDefined();
      });
    });
  });

  describe('Performance Under Load', () => {
    test('should maintain performance with maximum players', async () => {
      const timer = new PerformanceTimer();
      
      // Test initiative calculation performance
      timer.start();
      turnManager.calculateInitiative(players);
      const initTime = timer.end();
      
      // Test AP operations performance
      timer.start();
      for (let i = 0; i < 100; i++) {
        players.forEach(player => {
          apManager.addAPForTurn(player.id);
          apManager.spendAP(player.id, 1);
        });
      }
      const apTime = timer.end();
      
      // Test free action performance
      timer.start();
      for (let i = 0; i < 100; i++) {
        players.forEach(player => {
          const action: FreeAction = {
            type: 'BASIC_DEFENSE',
            playerId: player.id,
            immediate: true,
            timestamp: Date.now()
          };
          freeActionProcessor.executeImmediately(action);
        });
      }
      const actionTime = timer.end();
      
      expect(initTime).toBeLessThan(AP_SYSTEM.MAX_INITIATIVE_CALC_TIME);
      expect(apTime).toBeLessThan(AP_SYSTEM.MAX_AP_VALIDATION_TIME * 100); // Scaled for 100 operations
      expect(actionTime).toBeLessThan(100); // Should be very fast
    });

    test('should handle memory efficiently during long sessions', () => {
      const initialMemory = process.memoryUsage();
      
      // Simulate long session with many operations
      for (let round = 0; round < 10; round++) {
        turnManager.calculateInitiative(players);
        
        for (let turn = 0; turn < players.length; turn++) {
          players.forEach(player => {
            apManager.addAPForTurn(player.id);
            
            const action: FreeAction = {
              type: 'BASIC_DEFENSE',
              playerId: player.id,
              immediate: true,
              timestamp: Date.now()
            };
            freeActionProcessor.executeImmediately(action);
          });
          
          turnManager.endTurn();
          jest.advanceTimersByTime(500);
        }
      }
      
      const finalMemory = process.memoryUsage();
      
      // Memory usage should not grow excessively
      const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
      expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024); // Less than 10MB growth
    });
  });
});