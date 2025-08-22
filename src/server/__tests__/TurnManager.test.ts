import { TurnManager } from '../TurnManager';
import { Player, InitiativeEntry, TurnState } from '../../shared/types';
import { AP_SYSTEM, GAME_CONFIG, ERROR_MESSAGES } from '../../shared/constants';

describe('TurnManager', () => {
  let turnManager: TurnManager;
  let mockPlayers: Player[];
  let eventCallbacks: Map<string, Function[]>;

  beforeEach(() => {
    turnManager = new TurnManager();
    eventCallbacks = new Map();
    
    // Mock players with different skills and equipment
    mockPlayers = [
      {
        id: 'player1',
        name: 'Fighter',
        position: { x: 0, y: 0 },
        health: 100,
        maxHealth: 100,
        currentAP: 2,
        skills: {
          combat: 50,
          swords: 40,
          fire_magic: 10,
          healing_magic: 5,
          arcane_magic: 5
        },
        equipment: {
          weapon: {
            name: 'Steel Sword',
            damage: '1d8+2',
            initiative: 3
          }
        },
        status: 'ready'
      },
      {
        id: 'player2',
        name: 'Mage',
        position: { x: 1, y: 1 },
        health: 80,
        maxHealth: 80,
        currentAP: 2,
        skills: {
          combat: 20,
          swords: 10,
          fire_magic: 70,
          healing_magic: 30,
          arcane_magic: 60
        },
        equipment: {
          weapon: {
            name: 'Magic Staff',
            damage: '1d6+1',
            initiative: 1
          }
        },
        status: 'ready'
      },
      {
        id: 'player3',
        name: 'Rogue',
        position: { x: 2, y: 2 },
        health: 90,
        maxHealth: 90,
        currentAP: 2,
        skills: {
          combat: 60,
          swords: 30,
          fire_magic: 5,
          healing_magic: 5,
          arcane_magic: 5
        },
        equipment: {
          weapon: {
            name: 'Dagger',
            damage: '1d4+3',
            initiative: 5
          }
        },
        status: 'ready'
      }
    ];

    // Setup event listener mock
    turnManager.on = jest.fn((event: string, callback: Function) => {
      if (!eventCallbacks.has(event)) {
        eventCallbacks.set(event, []);
      }
      eventCallbacks.get(event)!.push(callback);
    });

    // Mock the private emit method to actually call our callbacks
    const originalEmit = (turnManager as any).emit;
    (turnManager as any).emit = jest.fn((event: string, data?: any) => {
      const callbacks = eventCallbacks.get(event) || [];
      callbacks.forEach(callback => callback(data));
    });
  });

  afterEach(() => {
    turnManager.reset();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('Initiative Calculation', () => {
    test('should calculate initiative and establish turn order', () => {
      turnManager.calculateInitiative(mockPlayers);
      
      const turnState = turnManager.getTurnState();
      expect(turnState.turnOrder).toHaveLength(3);
      expect(turnState.phase).toBe('initiative');
      expect(turnState.currentTurnIndex).toBe(0);
      
      // Check that all players have initiative values
      turnState.turnOrder.forEach(entry => {
        expect(entry.initiative).toBeGreaterThanOrEqual(1);
        expect(entry.initiative).toBeLessThanOrEqual(20 + 10 + 5); // max d20 + max skill bonus + max equipment
        expect(entry.ready).toBe(false);
      });
    });

    test('should sort players by initiative (highest first)', () => {
      // Mock Math.random to control dice rolls for consistent testing
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(0.9) // Player1: 19 + 5 + 3 = 27
        .mockReturnValueOnce(0.1) // Player2: 3 + 2 + 1 = 6
        .mockReturnValueOnce(0.5); // Player3: 11 + 6 + 5 = 22

      turnManager.calculateInitiative(mockPlayers);
      const turnState = turnManager.getTurnState();
      
      // Should be ordered: Player1 (27), Player3 (22), Player2 (6)
      expect(turnState.turnOrder[0]?.playerId).toBe('player1');
      expect(turnState.turnOrder[1]?.playerId).toBe('player3');
      expect(turnState.turnOrder[2]?.playerId).toBe('player2');
    });

    test('should handle players with no equipment', () => {
      const playersNoEquipment = mockPlayers.map(p => ({
        ...p,
        equipment: {}
      }));

      turnManager.calculateInitiative(playersNoEquipment);
      const turnState = turnManager.getTurnState();
      
      expect(turnState.turnOrder).toHaveLength(3);
      turnState.turnOrder.forEach(entry => {
        expect(entry.initiative).toBeGreaterThanOrEqual(1);
      });
    });

    test('should emit initiative_calculated event', () => {
      const mockCallback = jest.fn();
      turnManager.on('initiative_calculated', mockCallback);
      
      turnManager.calculateInitiative(mockPlayers);
      
      expect(mockCallback).toHaveBeenCalledWith({
        turnOrder: expect.any(Array),
        timestamp: expect.any(Number)
      });
    });

    test('should handle empty player list', () => {
      turnManager.calculateInitiative([]);
      const turnState = turnManager.getTurnState();
      
      expect(turnState.turnOrder).toHaveLength(0);
      expect(turnState.phase).toBe('initiative');
    });

    test('should handle single player', () => {
      turnManager.calculateInitiative([mockPlayers[0]!]);
      const turnState = turnManager.getTurnState();
      
      expect(turnState.turnOrder).toHaveLength(1);
      expect(turnState.turnOrder[0]?.playerId).toBe('player1');
    });
  });

  describe('Turn Management', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      turnManager.calculateInitiative(mockPlayers);
    });

    test('should start a turn correctly', () => {
      const mockCallback = jest.fn();
      turnManager.on('turn_started', mockCallback);
      
      turnManager.startTurn();
      
      const turnState = turnManager.getTurnState();
      expect(turnState.phase).toBe('actions');
      expect(turnState.turnStartTime).toBeGreaterThan(0);
      expect(mockCallback).toHaveBeenCalledWith({
        playerId: expect.any(String),
        timeLimit: AP_SYSTEM.TURN_TIME_LIMIT,
        timestamp: expect.any(Number)
      });
    });

    test('should handle turn timeout', () => {
      jest.useFakeTimers();
      const timeoutCallback = jest.fn();
      const turnEndCallback = jest.fn();
      
      turnManager.on('turn_timeout', timeoutCallback);
      turnManager.on('turn_ended', turnEndCallback);
      
      turnManager.startTurn();
      
      // Fast-forward time to trigger timeout
      jest.advanceTimersByTime(AP_SYSTEM.TURN_TIME_LIMIT);
      
      expect(timeoutCallback).toHaveBeenCalled();
      expect(turnEndCallback).toHaveBeenCalledWith({
        playerId: expect.any(String),
        duration: expect.any(Number),
        forced: true,
        timestamp: expect.any(Number)
      });
    });

    test('should end turn manually', () => {
      const turnEndCallback = jest.fn();
      turnManager.on('turn_ended', turnEndCallback);
      
      turnManager.startTurn();
      const startTime = Date.now();
      
      // Wait a bit then end turn
      jest.advanceTimersByTime(1000);
      turnManager.endTurn();
      
      expect(turnEndCallback).toHaveBeenCalledWith({
        playerId: expect.any(String),
        duration: expect.any(Number),
        forced: false,
        timestamp: expect.any(Number)
      });
    });

    test('should advance to next player after turn ends', () => {
      turnManager.startTurn();
      const initialPlayer = turnManager.getCurrentPlayer()?.playerId;
      
      turnManager.endTurn();
      
      // Wait for the 500ms delay in nextTurn
      jest.advanceTimersByTime(500);
      
      const nextPlayer = turnManager.getCurrentPlayer()?.playerId;
      expect(nextPlayer).not.toBe(initialPlayer);
    });

    test('should complete round and emit round_completed', () => {
      const roundCallback = jest.fn();
      turnManager.on('round_completed', roundCallback);
      
      // Go through all players in turn order
      const numPlayers = mockPlayers.length;
      for (let i = 0; i < numPlayers; i++) {
        turnManager.startTurn();
        turnManager.endTurn();
        jest.advanceTimersByTime(500); // nextTurn delay
      }
      
      expect(roundCallback).toHaveBeenCalled();
    });

    test('should get current player correctly', () => {
      const currentPlayer = turnManager.getCurrentPlayer();
      expect(currentPlayer).toBeDefined();
      expect(currentPlayer?.playerId).toBeDefined();
      expect(currentPlayer?.initiative).toBeGreaterThan(0);
    });

    test('should return null for current player when no players', () => {
      const emptyTurnManager = new TurnManager();
      const currentPlayer = emptyTurnManager.getCurrentPlayer();
      expect(currentPlayer).toBeNull();
    });

    test('should check if it is player turn correctly', () => {
      const currentPlayer = turnManager.getCurrentPlayer();
      expect(turnManager.isPlayerTurn(currentPlayer!.playerId)).toBe(true);
      expect(turnManager.isPlayerTurn('non-existent-player')).toBe(false);
    });

    test('should get remaining turn time correctly', () => {
      turnManager.startTurn();
      
      const initialRemaining = turnManager.getRemainingTurnTime();
      expect(initialRemaining).toBeLessThanOrEqual(AP_SYSTEM.TURN_TIME_LIMIT);
      expect(initialRemaining).toBeGreaterThan(0);
      
      // Advance time and check remaining time decreases
      jest.advanceTimersByTime(2000);
      const laterRemaining = turnManager.getRemainingTurnTime();
      expect(laterRemaining).toBeLessThan(initialRemaining);
    });

    test('should return 0 remaining time when not in actions phase', () => {
      // Before starting turn (initiative phase)
      expect(turnManager.getRemainingTurnTime()).toBe(0);
    });
  });

  describe('Player Management During Combat', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      turnManager.calculateInitiative(mockPlayers);
    });

    test('should skip current player turn', () => {
      const skipCallback = jest.fn();
      turnManager.on('turn_skipped', skipCallback);
      
      const currentPlayer = turnManager.getCurrentPlayer()!;
      const success = turnManager.skipTurn(currentPlayer.playerId, 'TEST_SKIP');
      
      expect(success).toBe(true);
      expect(skipCallback).toHaveBeenCalledWith({
        playerId: currentPlayer.playerId,
        reason: 'TEST_SKIP',
        timestamp: expect.any(Number)
      });
    });

    test('should not skip non-current player turn', () => {
      const currentPlayer = turnManager.getCurrentPlayer()!;
      const otherPlayerId = mockPlayers.find(p => p.id !== currentPlayer.playerId)!.id;
      
      const success = turnManager.skipTurn(otherPlayerId);
      expect(success).toBe(false);
    });

    test('should add player during combat', () => {
      const addCallback = jest.fn();
      turnManager.on('player_added', addCallback);
      
      const newPlayer: Player = {
        id: 'player4',
        name: 'Cleric',
        position: { x: 3, y: 3 },
        health: 85,
        maxHealth: 85,
        currentAP: 2,
        skills: {
          combat: 30,
          swords: 20,
          fire_magic: 5,
          healing_magic: 80,
          arcane_magic: 40
        },
        equipment: {},
        status: 'ready'
      };

      // Start combat phase
      turnManager.startCombat = jest.fn();
      (turnManager as any).turnState.phase = 'actions';
      
      turnManager.addPlayer(newPlayer);
      
      const turnState = turnManager.getTurnState();
      expect(turnState.turnOrder).toHaveLength(4);
      expect(addCallback).toHaveBeenCalledWith({
        playerId: 'player4',
        initiative: expect.any(Number),
        insertIndex: expect.any(Number),
        timestamp: expect.any(Number)
      });
    });

    test('should remove player and adjust turn order', () => {
      const removeCallback = jest.fn();
      turnManager.on('player_removed', removeCallback);
      
      const playerToRemove = mockPlayers[1]!.id; // Not current player
      turnManager.removePlayer(playerToRemove);
      
      const turnState = turnManager.getTurnState();
      expect(turnState.turnOrder).toHaveLength(2);
      expect(turnState.turnOrder.find(e => e.playerId === playerToRemove)).toBeUndefined();
      expect(removeCallback).toHaveBeenCalledWith({
        playerId: playerToRemove,
        timestamp: expect.any(Number)
      });
    });

    test('should skip turn when removing current player', () => {
      const skipCallback = jest.fn();
      turnManager.on('turn_skipped', skipCallback);
      
      const currentPlayer = turnManager.getCurrentPlayer()!;
      turnManager.removePlayer(currentPlayer.playerId);
      
      expect(skipCallback).toHaveBeenCalledWith({
        playerId: currentPlayer.playerId,
        reason: 'DISCONNECTED',
        timestamp: expect.any(Number)
      });
    });

    test('should set player ready status', () => {
      const readyCallback = jest.fn();
      turnManager.on('player_ready_changed', readyCallback);
      
      const playerId = mockPlayers[0]!.id;
      turnManager.setPlayerReady(playerId, true);
      
      const turnState = turnManager.getTurnState();
      const playerEntry = turnState.turnOrder.find(e => e.playerId === playerId);
      expect(playerEntry?.ready).toBe(true);
      
      expect(readyCallback).toHaveBeenCalledWith({
        playerId,
        ready: true,
        timestamp: expect.any(Number)
      });
    });

    test('should check if all players are ready', () => {
      expect(turnManager.areAllPlayersReady()).toBe(false);
      
      mockPlayers.forEach(player => {
        turnManager.setPlayerReady(player.id, true);
      });
      
      expect(turnManager.areAllPlayersReady()).toBe(true);
    });

    test('should start combat when all players ready', () => {
      const combatCallback = jest.fn();
      turnManager.on('combat_started', combatCallback);
      
      mockPlayers.forEach(player => {
        turnManager.setPlayerReady(player.id, true);
      });
      
      turnManager.startCombat();
      
      const turnState = turnManager.getTurnState();
      expect(turnState.phase).toBe('actions');
      expect(combatCallback).toHaveBeenCalledWith({
        turnOrder: expect.any(Array),
        timestamp: expect.any(Number)
      });
    });

    test('should throw error when starting combat without all players ready', () => {
      expect(() => {
        turnManager.startCombat();
      }).toThrow('Not all players are ready');
    });
  });

  describe('Turn Timer Management', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      turnManager.calculateInitiative(mockPlayers);
    });

    test('should pause turn timer', () => {
      const pauseCallback = jest.fn();
      turnManager.on('turn_paused', pauseCallback);
      
      turnManager.startTurn();
      turnManager.pauseTurn();
      
      expect(pauseCallback).toHaveBeenCalledWith({
        playerId: expect.any(String),
        timestamp: expect.any(Number)
      });
    });

    test('should resume turn timer', () => {
      const resumeCallback = jest.fn();
      turnManager.on('turn_resumed', resumeCallback);
      
      turnManager.startTurn();
      jest.advanceTimersByTime(2000); // Use some time
      turnManager.pauseTurn();
      turnManager.resumeTurn();
      
      expect(resumeCallback).toHaveBeenCalledWith({
        playerId: expect.any(String),
        remainingTime: expect.any(Number),
        timestamp: expect.any(Number)
      });
    });

    test('should trigger timeout on resume if time expired', () => {
      const timeoutCallback = jest.fn();
      turnManager.on('turn_timeout', timeoutCallback);
      
      turnManager.startTurn();
      jest.advanceTimersByTime(AP_SYSTEM.TURN_TIME_LIMIT); // Use all time
      turnManager.pauseTurn();
      turnManager.resumeTurn();
      
      expect(timeoutCallback).toHaveBeenCalled();
    });

    test('should set custom turn time limit', () => {
      const customLimit = 15000; // 15 seconds
      turnManager.setTurnTimeLimit(customLimit);
      
      const turnState = turnManager.getTurnState();
      expect(turnState.turnTimeLimit).toBe(customLimit);
    });

    test('should cap turn time limit at maximum', () => {
      turnManager.setTurnTimeLimit(60000); // Try to set 60 seconds
      
      const turnState = turnManager.getTurnState();
      expect(turnState.turnTimeLimit).toBe(AP_SYSTEM.TURN_TIME_LIMIT); // Should be capped
    });

    test('should enforce minimum turn time limit', () => {
      turnManager.setTurnTimeLimit(1000); // Try to set 1 second
      
      const turnState = turnManager.getTurnState();
      expect(turnState.turnTimeLimit).toBe(AP_SYSTEM.MIN_TURN_TIME); // Should be minimum
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle starting turn with no players', () => {
      const emptyTurnManager = new TurnManager();
      
      expect(() => {
        emptyTurnManager.startTurn();
      }).toThrow('No players in turn order');
    });

    test('should handle null current player gracefully', () => {
      turnManager.calculateInitiative([]);
      
      // Should not throw when trying to start turn with no players
      const currentPlayer = turnManager.getCurrentPlayer();
      expect(currentPlayer).toBeNull();
    });

    test('should reset completely', () => {
      const resetCallback = jest.fn();
      turnManager.on('turn_manager_reset', resetCallback);
      
      turnManager.calculateInitiative(mockPlayers);
      turnManager.startTurn();
      
      turnManager.reset();
      
      const turnState = turnManager.getTurnState();
      expect(turnState.turnOrder).toHaveLength(0);
      expect(turnState.phase).toBe('initiative');
      expect(turnState.currentTurnIndex).toBe(0);
      expect(resetCallback).toHaveBeenCalled();
    });

    test('should get player by ID', () => {
      turnManager.calculateInitiative(mockPlayers);
      
      const player = turnManager.getPlayer('player1');
      expect(player).toBeDefined();
      expect(player?.id).toBe('player1');
      
      const nonExistentPlayer = turnManager.getPlayer('non-existent');
      expect(nonExistentPlayer).toBeUndefined();
    });

    test('should handle initiative calculation with extreme skill values', () => {
      const extremePlayers = [
        {
          ...mockPlayers[0]!,
          skills: { ...mockPlayers[0]!.skills, combat: 1000 } // Very high skill
        },
        {
          ...mockPlayers[1]!,
          skills: { ...mockPlayers[1]!.skills, combat: 0 } // Zero skill
        }
      ];

      turnManager.calculateInitiative(extremePlayers);
      const turnState = turnManager.getTurnState();
      
      expect(turnState.turnOrder).toHaveLength(2);
      turnState.turnOrder.forEach(entry => {
        expect(entry.initiative).toBeGreaterThan(0);
      });
    });

    test('should handle turn progression with only one player', () => {
      const singlePlayerManager = new TurnManager();
      singlePlayerManager.calculateInitiative([mockPlayers[0]!]);
      
      const roundCallback = jest.fn();
      singlePlayerManager.on('round_completed', roundCallback);
      
      singlePlayerManager.startTurn();
      singlePlayerManager.endTurn();
      
      jest.advanceTimersByTime(500); // nextTurn delay
      
      expect(roundCallback).toHaveBeenCalled();
    });
  });

  describe('Performance and Timing', () => {
    test('should complete initiative calculation within performance target', () => {
      const start = performance.now();
      turnManager.calculateInitiative(mockPlayers);
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(AP_SYSTEM.MAX_INITIATIVE_CALC_TIME);
    });

    test('should handle rapid turn cycling without memory leaks', () => {
      jest.useFakeTimers();
      
      // Simulate rapid turn cycling
      for (let i = 0; i < 100; i++) {
        turnManager.startTurn();
        turnManager.endTurn();
        jest.advanceTimersByTime(500);
      }
      
      // Should still function correctly
      const currentPlayer = turnManager.getCurrentPlayer();
      expect(currentPlayer).toBeDefined();
    });

    test('should handle concurrent player operations', () => {
      turnManager.calculateInitiative(mockPlayers);
      
      // Simulate concurrent operations
      mockPlayers.forEach((player, index) => {
        turnManager.setPlayerReady(player.id, index % 2 === 0);
      });
      
      const newPlayer: Player = { ...mockPlayers[0]!, id: 'concurrent-player' };
      turnManager.addPlayer(newPlayer);
      turnManager.removePlayer(mockPlayers[2]!.id);
      
      // Should maintain consistency
      const turnState = turnManager.getTurnState();
      expect(turnState.turnOrder.length).toBeGreaterThan(0);
    });
  });
});