import { FreeActionProcessor } from '../FreeActions';
import { Player, FreeAction, Position } from '../../shared/types';
import { FREE_ACTIONS, ERROR_MESSAGES, GAME_CONFIG } from '../../shared/constants';

describe('FreeActionProcessor', () => {
  let processor: FreeActionProcessor;
  let mockPlayers: Player[];

  beforeEach(() => {
    processor = new FreeActionProcessor();
    
    mockPlayers = [
      {
        id: 'player1',
        name: 'Fighter',
        position: { x: 5, y: 5 },
        health: 100,
        maxHealth: 100,
        currentAP: 5,
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
            initiative: 2
          }
        },
        status: 'ready'
      },
      {
        id: 'player2',
        name: 'Mage',
        position: { x: 6, y: 6 },
        health: 80,
        maxHealth: 80,
        currentAP: 5,
        skills: {
          combat: 30,
          swords: 15,
          fire_magic: 70,
          healing_magic: 40,
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
        position: { x: 10, y: 10 },
        health: 90,
        maxHealth: 90,
        currentAP: 5,
        skills: {
          combat: 60,
          swords: 30,
          fire_magic: 5,
          healing_magic: 5,
          arcane_magic: 5
        },
        equipment: {},
        status: 'ready'
      }
    ];

    // Add players to processor
    mockPlayers.forEach(player => {
      processor.addPlayer(player);
    });
  });

  describe('Movement Actions', () => {
    test('should execute valid movement within range', () => {
      const moveAction: FreeAction = {
        type: 'MOVE',
        playerId: 'player1',
        target: { x: 6, y: 5 }, // 1 square away
        immediate: true,
        timestamp: Date.now()
      };

      const result = processor.executeImmediately(moveAction);

      expect(result.success).toBe(true);
      expect(result.effects).toHaveLength(1);
      expect(result.effects![0]?.type).toBe('move');
      expect(result.effects![0]?.target).toBe('player1');

      // Check player position was updated
      const updatedPlayer = processor.getPlayer('player1');
      expect(updatedPlayer?.position).toEqual({ x: 6, y: 5 });
    });

    test('should reject movement beyond range', () => {
      const moveAction: FreeAction = {
        type: 'MOVE',
        playerId: 'player1',
        target: { x: 8, y: 8 }, // 3 squares away (beyond range)
        immediate: true,
        timestamp: Date.now()
      };

      const result = processor.executeImmediately(moveAction);

      expect(result.success).toBe(false);
      expect(result.reason).toBe(ERROR_MESSAGES.OUT_OF_RANGE);

      // Check player position unchanged
      const player = processor.getPlayer('player1');
      expect(player?.position).toEqual({ x: 5, y: 5 });
    });

    test('should reject movement to occupied position', () => {
      const moveAction: FreeAction = {
        type: 'MOVE',
        playerId: 'player1',
        target: { x: 6, y: 6 }, // Where player2 is located
        immediate: true,
        timestamp: Date.now()
      };

      const result = processor.executeImmediately(moveAction);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('Position is blocked or invalid');
    });

    test('should reject movement to invalid map position', () => {
      const moveAction: FreeAction = {
        type: 'MOVE',
        playerId: 'player1',
        target: { x: -1, y: 5 }, // Negative coordinate, but also out of range
        immediate: true,
        timestamp: Date.now()
      };

      const result = processor.executeImmediately(moveAction);

      expect(result.success).toBe(false);
      expect(result.reason).toBe(ERROR_MESSAGES.OUT_OF_RANGE); // Range validation happens first
    });

    test('should handle diagonal movement correctly', () => {
      const moveAction: FreeAction = {
        type: 'MOVE',
        playerId: 'player1',
        target: { x: 6, y: 6 }, // Diagonal move, but occupied
        immediate: true,
        timestamp: Date.now()
      };

      // Move player2 first to clear the space
      processor.removePlayer('player2');

      const result = processor.executeImmediately(moveAction);
      expect(result.success).toBe(true);

      const updatedPlayer = processor.getPlayer('player1');
      expect(updatedPlayer?.position).toEqual({ x: 6, y: 6 });
    });

    test('should reject movement without target position', () => {
      const moveAction: FreeAction = {
        type: 'MOVE',
        playerId: 'player1',
        immediate: true,
        timestamp: Date.now()
      };

      const result = processor.executeImmediately(moveAction);

      expect(result.success).toBe(false);
      expect(result.reason).toBe(ERROR_MESSAGES.INVALID_TARGET);
    });
  });

  describe('Basic Attack Actions', () => {
    test('should execute basic attack on adjacent enemy', () => {
      const attackAction: FreeAction = {
        type: 'BASIC_ATTACK',
        playerId: 'player1',
        target: 'player2', // Adjacent player
        immediate: true,
        timestamp: Date.now()
      };

      const initialHealth = processor.getPlayer('player2')?.health || 0;
      const result = processor.executeImmediately(attackAction);

      expect(result.success).toBe(true);
      expect(result.effects).toHaveLength(1);
      expect(result.effects![0]?.type).toBe('damage');
      expect(result.effects![0]?.target).toBe('player2');
      expect(result.effects![0]?.value).toBeGreaterThan(0);

      // Check target took damage
      const targetPlayer = processor.getPlayer('player2');
      expect(targetPlayer?.health).toBeLessThan(initialHealth);
    });

    test('should reject attack on out-of-range target', () => {
      const attackAction: FreeAction = {
        type: 'BASIC_ATTACK',
        playerId: 'player1',
        target: 'player3', // Too far away
        immediate: true,
        timestamp: Date.now()
      };

      const result = processor.executeImmediately(attackAction);

      expect(result.success).toBe(false);
      expect(result.reason).toBe(ERROR_MESSAGES.OUT_OF_RANGE);
    });

    test('should reject attack on non-existent target', () => {
      const attackAction: FreeAction = {
        type: 'BASIC_ATTACK',
        playerId: 'player1',
        target: 'non-existent-player',
        immediate: true,
        timestamp: Date.now()
      };

      const result = processor.executeImmediately(attackAction);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('Target not found');
    });

    test('should calculate damage with weapon bonuses', () => {
      const attackAction: FreeAction = {
        type: 'BASIC_ATTACK',
        playerId: 'player1',
        target: 'player2',
        immediate: true,
        timestamp: Date.now()
      };

      const result = processor.executeImmediately(attackAction);

      expect(result.success).toBe(true);
      // Should include base damage + weapon damage + skill bonus
      // Base: 10, Weapon: 1d8+2 (3-10), Skill: 5 (50/10) = 18-25 total
      expect(result.effects![0]?.value).toBeGreaterThanOrEqual(18);
      expect(result.effects![0]?.value).toBeLessThanOrEqual(25);
    });

    test('should calculate damage without weapon', () => {
      const attackAction: FreeAction = {
        type: 'BASIC_ATTACK',
        playerId: 'player3', // Has no weapon
        target: 'player1',
        immediate: true,
        timestamp: Date.now()
      };

      // Move player3 adjacent to player1
      processor.updatePlayer({
        ...processor.getPlayer('player3')!,
        position: { x: 4, y: 5 }
      });

      const result = processor.executeImmediately(attackAction);

      expect(result.success).toBe(true);
      // Should include base damage + skill bonus only
      // Base: 10, Skill: 6 (60/10) = 16 total
      expect(result.effects![0]?.value).toBe(16);
    });

    test('should handle critical hits randomly', () => {
      // Run multiple attacks to potentially trigger a critical hit
      const results: number[] = [];

      for (let i = 0; i < 50; i++) {
        // Reset target health
        processor.updatePlayer({
          ...processor.getPlayer('player2')!,
          health: 100
        });

        const attackAction: FreeAction = {
          type: 'BASIC_ATTACK',
          playerId: 'player1',
          target: 'player2',
          immediate: true,
          timestamp: Date.now()
        };

        const result = processor.executeImmediately(attackAction);
        if (result.success) {
          results.push(result.effects![0]?.value || 0);
        }
      }

      // Should have some variation in damage (some critical hits)
      const maxDamage = Math.max(...results);
      const minDamage = Math.min(...results);
      expect(maxDamage).toBeGreaterThan(minDamage);
    });

    test('should reject attack without target', () => {
      const attackAction: FreeAction = {
        type: 'BASIC_ATTACK',
        playerId: 'player1',
        immediate: true,
        timestamp: Date.now()
      };

      const result = processor.executeImmediately(attackAction);

      expect(result.success).toBe(false);
      expect(result.reason).toBe(ERROR_MESSAGES.INVALID_TARGET);
    });
  });

  describe('Basic Defense Actions', () => {
    test('should execute basic defense successfully', () => {
      const defenseAction: FreeAction = {
        type: 'BASIC_DEFENSE',
        playerId: 'player1',
        immediate: true,
        timestamp: Date.now()
      };

      const result = processor.executeImmediately(defenseAction);

      expect(result.success).toBe(true);
      expect(result.effects).toHaveLength(1);
      expect(result.effects![0]?.type).toBe('status');
      expect(result.effects![0]?.target).toBe('player1');
      expect(result.effects![0]?.value).toBe(FREE_ACTIONS.BASIC_DEFENSE.defenseBonus);
      expect(result.effects![0]?.duration).toBe(1);
    });

    test('should allow defense without target', () => {
      const defenseAction: FreeAction = {
        type: 'BASIC_DEFENSE',
        playerId: 'player1',
        immediate: true,
        timestamp: Date.now()
      };

      const result = processor.executeImmediately(defenseAction);

      expect(result.success).toBe(true);
    });

    test('should apply defense bonus correctly', () => {
      const defenseAction: FreeAction = {
        type: 'BASIC_DEFENSE',
        playerId: 'player1',
        immediate: true,
        timestamp: Date.now()
      };

      const result = processor.executeImmediately(defenseAction);

      expect(result.effects![0]?.value).toBe(2); // +2 defense bonus
      expect(result.effects![0]?.duration).toBe(1); // Until next turn
    });
  });

  describe('Action Validation', () => {
    test('should validate movement actions correctly', () => {
      // Valid movement
      const validMove: FreeAction = {
        type: 'MOVE',
        playerId: 'player1',
        target: { x: 6, y: 5 },
        immediate: true,
        timestamp: Date.now()
      };

      expect(processor.validateFreeAction(validMove)).toBe(true);

      // Invalid movement (out of range)
      const invalidMove: FreeAction = {
        type: 'MOVE',
        playerId: 'player1',
        target: { x: 10, y: 10 },
        immediate: true,
        timestamp: Date.now()
      };

      expect(processor.validateFreeAction(invalidMove)).toBe(false);
    });

    test('should validate attack actions correctly', () => {
      // Valid attack (adjacent)
      const validAttack: FreeAction = {
        type: 'BASIC_ATTACK',
        playerId: 'player1',
        target: 'player2',
        immediate: true,
        timestamp: Date.now()
      };

      expect(processor.validateFreeAction(validAttack)).toBe(true);

      // Invalid attack (out of range)
      const invalidAttack: FreeAction = {
        type: 'BASIC_ATTACK',
        playerId: 'player1',
        target: 'player3',
        immediate: true,
        timestamp: Date.now()
      };

      expect(processor.validateFreeAction(invalidAttack)).toBe(false);
    });

    test('should validate defense actions correctly', () => {
      const defenseAction: FreeAction = {
        type: 'BASIC_DEFENSE',
        playerId: 'player1',
        immediate: true,
        timestamp: Date.now()
      };

      expect(processor.validateFreeAction(defenseAction)).toBe(true);
    });

    test('should reject validation for non-existent player', () => {
      const action: FreeAction = {
        type: 'MOVE',
        playerId: 'non-existent',
        target: { x: 6, y: 5 },
        immediate: true,
        timestamp: Date.now()
      };

      expect(processor.validateFreeAction(action)).toBe(false);
    });

    test('should reject unknown action types', () => {
      const unknownAction = {
        type: 'UNKNOWN_ACTION',
        playerId: 'player1',
        immediate: true,
        timestamp: Date.now()
      } as any;

      expect(processor.validateFreeAction(unknownAction)).toBe(false);
    });
  });

  describe('Target Acquisition', () => {
    test('should get valid movement targets', () => {
      const targets = processor.getValidTargets('player1', 'MOVE') as Position[];

      expect(targets.length).toBeGreaterThan(0);
      
      // All targets should be within movement range
      targets.forEach(target => {
        const distance = Math.max(
          Math.abs(target.x - 5),
          Math.abs(target.y - 5)
        );
        expect(distance).toBeLessThanOrEqual(FREE_ACTIONS.MOVE.maxRange);
      });

      // Should not include occupied positions
      expect(targets.find(t => t.x === 6 && t.y === 6)).toBeUndefined(); // Player2's position
    });

    test('should get valid attack targets', () => {
      const targets = processor.getValidTargets('player1', 'BASIC_ATTACK') as string[];

      expect(targets).toContain('player2'); // Adjacent
      expect(targets).not.toContain('player3'); // Too far
      expect(targets).not.toContain('player1'); // Self
    });

    test('should return empty array for defense targets', () => {
      const targets = processor.getValidTargets('player1', 'BASIC_DEFENSE');
      expect(targets).toEqual([]);
    });

    test('should return empty array for non-existent player', () => {
      const targets = processor.getValidTargets('non-existent', 'MOVE');
      expect(targets).toEqual([]);
    });

    test('should handle player with no adjacent targets', () => {
      // Move player1 far from everyone
      processor.updatePlayer({
        ...processor.getPlayer('player1')!,
        position: { x: 0, y: 0 }
      });

      const targets = processor.getValidTargets('player1', 'BASIC_ATTACK');
      expect(targets).toEqual([]);
    });
  });

  describe('Player Management', () => {
    test('should add new player correctly', () => {
      const newPlayer: Player = {
        id: 'player4',
        name: 'Cleric',
        position: { x: 8, y: 8 },
        health: 85,
        maxHealth: 85,
        currentAP: 5,
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

      processor.addPlayer(newPlayer);
      const retrievedPlayer = processor.getPlayer('player4');

      expect(retrievedPlayer).toBeDefined();
      expect(retrievedPlayer?.id).toBe('player4');
      expect(retrievedPlayer?.position).toEqual({ x: 8, y: 8 });
    });

    test('should remove player correctly', () => {
      processor.removePlayer('player2');
      
      const removedPlayer = processor.getPlayer('player2');
      expect(removedPlayer).toBeUndefined();

      // Position should be freed up
      const moveAction: FreeAction = {
        type: 'MOVE',
        playerId: 'player1',
        target: { x: 6, y: 6 }, // Former player2 position
        immediate: true,
        timestamp: Date.now()
      };

      const result = processor.executeImmediately(moveAction);
      expect(result.success).toBe(true);
    });

    test('should update player data correctly', () => {
      const updatedPlayer = {
        ...processor.getPlayer('player1')!,
        health: 50,
        position: { x: 7, y: 7 }
      };

      processor.updatePlayer(updatedPlayer);
      
      const retrievedPlayer = processor.getPlayer('player1');
      expect(retrievedPlayer?.health).toBe(50);
      expect(retrievedPlayer?.position).toEqual({ x: 7, y: 7 });
    });

    test('should get all players correctly', () => {
      const allPlayers = processor.getAllPlayers();

      expect(allPlayers.size).toBe(3);
      expect(allPlayers.has('player1')).toBe(true);
      expect(allPlayers.has('player2')).toBe(true);
      expect(allPlayers.has('player3')).toBe(true);
    });

    test('should handle non-existent player operations gracefully', () => {
      const nonExistentPlayer = processor.getPlayer('non-existent');
      expect(nonExistentPlayer).toBeUndefined();

      // Should not throw when removing non-existent player
      expect(() => processor.removePlayer('non-existent')).not.toThrow();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should reject actions from non-existent players', () => {
      const action: FreeAction = {
        type: 'MOVE',
        playerId: 'non-existent',
        target: { x: 6, y: 5 },
        immediate: true,
        timestamp: Date.now()
      };

      const result = processor.executeImmediately(action);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('Player not found');
    });

    test('should handle invalid action types', () => {
      const invalidAction = {
        type: 'INVALID_TYPE',
        playerId: 'player1',
        immediate: true,
        timestamp: Date.now()
      } as any;

      const result = processor.executeImmediately(invalidAction);

      expect(result.success).toBe(false);
      expect(result.reason).toBe(ERROR_MESSAGES.INVALID_ACTION);
    });

    test('should handle map boundary conditions', () => {
      // Move player to near map edge
      processor.updatePlayer({
        ...processor.getPlayer('player1')!,
        position: { x: 19, y: 19 } // Near map edge (20x20 map)
      });

      // Try to move beyond boundary
      const moveAction: FreeAction = {
        type: 'MOVE',
        playerId: 'player1',
        target: { x: 20, y: 20 }, // Beyond map
        immediate: true,
        timestamp: Date.now()
      };

      const result = processor.executeImmediately(moveAction);
      expect(result.success).toBe(false);
    });

    test('should handle concurrent actions correctly', () => {
      // Simulate concurrent movement attempts to same position
      const action1: FreeAction = {
        type: 'MOVE',
        playerId: 'player1',
        target: { x: 6, y: 5 }, // Adjacent to player1's position (5,5)
        immediate: true,
        timestamp: Date.now()
      };

      const action2: FreeAction = {
        type: 'MOVE',
        playerId: 'player3',
        target: { x: 6, y: 5 }, // Same target
        immediate: true,
        timestamp: Date.now() + 1
      };

      // Move player3 to adjacent position to make it a valid move
      processor.updatePlayer({
        ...processor.getPlayer('player3')!,
        position: { x: 7, y: 5 }
      });

      const result1 = processor.executeImmediately(action1);
      const result2 = processor.executeImmediately(action2);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(false); // Should fail due to occupied position
    });

    test('should maintain player health constraints', () => {
      // Attack that would reduce health below 0
      processor.updatePlayer({
        ...processor.getPlayer('player2')!,
        health: 5 // Very low health
      });

      const attackAction: FreeAction = {
        type: 'BASIC_ATTACK',
        playerId: 'player1',
        target: 'player2',
        immediate: true,
        timestamp: Date.now()
      };

      const result = processor.executeImmediately(attackAction);
      expect(result.success).toBe(true);

      const targetPlayer = processor.getPlayer('player2');
      expect(targetPlayer?.health).toBeGreaterThanOrEqual(0); // Should not go below 0
    });
  });

  describe('Performance and Consistency', () => {
    test('should process actions quickly', () => {
      const action: FreeAction = {
        type: 'MOVE',
        playerId: 'player1',
        target: { x: 6, y: 5 },
        immediate: true,
        timestamp: Date.now()
      };

      const start = performance.now();
      processor.executeImmediately(action);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(10); // Should be very fast
    });

    test('should maintain state consistency after many operations', () => {
      // Perform many operations
      for (let i = 0; i < 100; i++) {
        const actions: FreeAction[] = [
          {
            type: 'MOVE',
            playerId: 'player1',
            target: { x: 5 + (i % 2), y: 5 },
            immediate: true,
            timestamp: Date.now()
          },
          {
            type: 'BASIC_DEFENSE',
            playerId: 'player2',
            immediate: true,
            timestamp: Date.now()
          }
        ];

        actions.forEach(action => processor.executeImmediately(action));
      }

      // State should still be consistent
      const allPlayers = processor.getAllPlayers();
      expect(allPlayers.size).toBe(3);
      
      allPlayers.forEach(player => {
        expect(player.health).toBeGreaterThanOrEqual(0);
        expect(player.health).toBeLessThanOrEqual(player.maxHealth);
      });
    });

    test('should handle rapid fire actions without issues', () => {
      const actions: FreeAction[] = [];
      
      // Create 50 rapid actions
      for (let i = 0; i < 50; i++) {
        actions.push({
          type: 'BASIC_DEFENSE',
          playerId: `player${(i % 3) + 1}`,
          immediate: true,
          timestamp: Date.now() + i
        });
      }

      // Execute all actions
      const results = actions.map(action => processor.executeImmediately(action));
      
      // All should succeed
      expect(results.every(r => r.success)).toBe(true);
    });
  });
});