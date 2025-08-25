import { APManager, APAbilityProcessor } from '../APSystem';
import { Player } from '../../shared/types';
import { AP_SYSTEM, ERROR_MESSAGES } from '../../shared/constants';

describe('APManager', () => {
  let apManager: APManager;

  beforeEach(() => {
    apManager = new APManager();
  });

  describe('Player Initialization', () => {
    test('should initialize player with default AP', () => {
      apManager.initializePlayer('player1');
      expect(apManager.getCurrentAP('player1')).toBe(AP_SYSTEM.DEFAULT_AP_PER_TURN);
    });

    test('should initialize player with custom starting AP', () => {
      apManager.initializePlayer('player1', 5);
      expect(apManager.getCurrentAP('player1')).toBe(5);
    });

    test('should cap starting AP at maximum', () => {
      apManager.initializePlayer('player1', 15);
      expect(apManager.getCurrentAP('player1')).toBe(AP_SYSTEM.MAX_AP);
    });

    test('should handle zero starting AP', () => {
      apManager.initializePlayer('player1', 0);
      expect(apManager.getCurrentAP('player1')).toBe(0);
    });

    test('should handle negative starting AP', () => {
      apManager.initializePlayer('player1', -5);
      expect(apManager.getCurrentAP('player1')).toBe(-5); // APManager doesn't validate negative values in initializePlayer
    });

    test('should reinitialize existing player', () => {
      apManager.initializePlayer('player1', 3);
      apManager.initializePlayer('player1', 6);
      expect(apManager.getCurrentAP('player1')).toBe(6);
    });
  });

  describe('AP Per Turn Addition', () => {
    beforeEach(() => {
      apManager.initializePlayer('player1', 3);
    });

    test('should add default AP per turn', () => {
      const newAP = apManager.addAPForTurn('player1');
      expect(newAP).toBe(5); // 3 + 2 default
      expect(apManager.getCurrentAP('player1')).toBe(5);
    });

    test('should add AP with bonus', () => {
      const newAP = apManager.addAPForTurn('player1', 1);
      expect(newAP).toBe(6); // 3 + 2 default + 1 bonus
      expect(apManager.getCurrentAP('player1')).toBe(6);
    });

    test('should respect max AP cap', () => {
      apManager.initializePlayer('player1', 7);
      const newAP = apManager.addAPForTurn('player1');
      expect(newAP).toBe(AP_SYSTEM.MAX_AP);
      expect(apManager.getCurrentAP('player1')).toBe(AP_SYSTEM.MAX_AP);
    });

    test('should respect min AP per turn', () => {
      const newAP = apManager.addAPForTurn('player1', -5); // Trying to subtract AP
      expect(newAP).toBe(5); // 3 + 2 min AP per turn
      expect(apManager.getCurrentAP('player1')).toBe(5);
    });

    test('should respect max AP per turn', () => {
      const newAP = apManager.addAPForTurn('player1', 10); // Huge bonus
      const expectedAP = Math.min(3 + AP_SYSTEM.MAX_AP_PER_TURN, AP_SYSTEM.MAX_AP);
      expect(newAP).toBe(expectedAP);
      expect(apManager.getCurrentAP('player1')).toBe(expectedAP);
    });

    test('should handle non-existent player gracefully', () => {
      const newAP = apManager.addAPForTurn('non-existent');
      expect(newAP).toBe(AP_SYSTEM.DEFAULT_AP_PER_TURN);
      expect(apManager.getCurrentAP('non-existent')).toBe(AP_SYSTEM.DEFAULT_AP_PER_TURN);
    });
  });

  describe('AP Spending and Validation', () => {
    beforeEach(() => {
      apManager.initializePlayer('player1', 5);
    });

    test('should spend AP correctly', () => {
      const success = apManager.spendAP('player1', 3);
      expect(success).toBe(true);
      expect(apManager.getCurrentAP('player1')).toBe(2);
    });

    test('should fail to spend when insufficient AP', () => {
      const success = apManager.spendAP('player1', 6);
      expect(success).toBe(false);
      expect(apManager.getCurrentAP('player1')).toBe(5); // Unchanged
    });

    test('should spend exact AP amount', () => {
      const success = apManager.spendAP('player1', 5);
      expect(success).toBe(true);
      expect(apManager.getCurrentAP('player1')).toBe(0);
    });

    test('should handle zero AP spending', () => {
      const success = apManager.spendAP('player1', 0);
      expect(success).toBe(true);
      expect(apManager.getCurrentAP('player1')).toBe(5);
    });

    test('should handle negative AP spending', () => {
      const success = apManager.spendAP('player1', -2);
      expect(success).toBe(true);
      expect(apManager.getCurrentAP('player1')).toBe(7); // 5 - (-2) = 7, spendAP subtracts the cost
    });

    test('should fail for non-existent player', () => {
      const success = apManager.spendAP('non-existent', 2);
      expect(success).toBe(false);
    });

    test('should check affordability correctly', () => {
      expect(apManager.canAfford('player1', 3)).toBe(true);
      expect(apManager.canAfford('player1', 5)).toBe(true);
      expect(apManager.canAfford('player1', 6)).toBe(false);
      expect(apManager.canAfford('player1', 0)).toBe(true);
    });

    test('should handle affordability for non-existent player', () => {
      expect(apManager.canAfford('non-existent', 1)).toBe(false);
    });
  });

  describe('AP Manipulation', () => {
    test('should set AP directly', () => {
      apManager.initializePlayer('player1');
      apManager.setAP('player1', 6);
      expect(apManager.getCurrentAP('player1')).toBe(6);
    });

    test('should cap set AP at maximum', () => {
      apManager.initializePlayer('player1');
      apManager.setAP('player1', 15);
      expect(apManager.getCurrentAP('player1')).toBe(AP_SYSTEM.MAX_AP);
    });

    test('should handle negative set AP', () => {
      apManager.initializePlayer('player1');
      apManager.setAP('player1', -3);
      expect(apManager.getCurrentAP('player1')).toBe(0);
    });

    test('should set AP for non-existent player', () => {
      apManager.setAP('non-existent', 4);
      expect(apManager.getCurrentAP('non-existent')).toBe(4);
    });
  });

  describe('Multi-Player Management', () => {
    beforeEach(() => {
      apManager.initializePlayer('player1', 3);
      apManager.initializePlayer('player2', 5);
      apManager.initializePlayer('player3', 2);
    });

    test('should track multiple players independently', () => {
      apManager.spendAP('player1', 2);
      apManager.addAPForTurn('player2');
      
      expect(apManager.getCurrentAP('player1')).toBe(1);
      expect(apManager.getCurrentAP('player2')).toBe(7);
      expect(apManager.getCurrentAP('player3')).toBe(2);
    });

    test('should get all player AP states', () => {
      const allAP = apManager.getAllPlayerAP();
      expect(allAP.size).toBe(3);
      expect(allAP.get('player1')).toBe(3);
      expect(allAP.get('player2')).toBe(5);
      expect(allAP.get('player3')).toBe(2);
    });

    test('should remove specific player', () => {
      apManager.removePlayer('player2');
      
      expect(apManager.getCurrentAP('player1')).toBe(3);
      expect(apManager.getCurrentAP('player2')).toBe(0);
      expect(apManager.getCurrentAP('player3')).toBe(2);
      
      const allAP = apManager.getAllPlayerAP();
      expect(allAP.size).toBe(2);
      expect(allAP.has('player2')).toBe(false);
    });

    test('should reset all players to default AP', () => {
      apManager.resetAllPlayers();
      
      expect(apManager.getCurrentAP('player1')).toBe(AP_SYSTEM.DEFAULT_AP_PER_TURN);
      expect(apManager.getCurrentAP('player2')).toBe(AP_SYSTEM.DEFAULT_AP_PER_TURN);
      expect(apManager.getCurrentAP('player3')).toBe(AP_SYSTEM.DEFAULT_AP_PER_TURN);
    });

    test('should handle concurrent AP operations', () => {
      // Simulate concurrent operations
      apManager.spendAP('player1', 1);
      apManager.spendAP('player2', 2);
      apManager.addAPForTurn('player3', 1);
      
      expect(apManager.getCurrentAP('player1')).toBe(2);
      expect(apManager.getCurrentAP('player2')).toBe(3);
      expect(apManager.getCurrentAP('player3')).toBe(5); // 2 + 2 + 1 bonus
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle empty player ID', () => {
      apManager.initializePlayer('');
      expect(apManager.getCurrentAP('')).toBe(AP_SYSTEM.DEFAULT_AP_PER_TURN);
    });

    test('should handle special characters in player ID', () => {
      const specialId = 'player@#$%^&*()_+';
      apManager.initializePlayer(specialId, 4);
      expect(apManager.getCurrentAP(specialId)).toBe(4);
    });

    test('should maintain data integrity after multiple operations', () => {
      const playerId = 'test-player';
      
      // Complex sequence of operations
      apManager.initializePlayer(playerId, 0);
      apManager.addAPForTurn(playerId, 2); // Should be 0 + 2 + 2 = 4
      apManager.spendAP(playerId, 1);      // Should be 4 - 1 = 3
      apManager.setAP(playerId, 6);        // Should be 6
      apManager.spendAP(playerId, 2);      // Should be 6 - 2 = 4
      apManager.addAPForTurn(playerId);    // Should be 4 + 2 = 6
      
      expect(apManager.getCurrentAP(playerId)).toBe(6);
    });

    test('should return zero for completely non-existent operations', () => {
      expect(apManager.getCurrentAP('never-existed')).toBe(0);
      expect(apManager.canAfford('never-existed', 1)).toBe(false);
      expect(apManager.spendAP('never-existed', 1)).toBe(false);
    });
  });
});

describe('APAbilityProcessor', () => {
  let apManager: APManager;
  let abilityProcessor: APAbilityProcessor;
  let mockPlayer: Player;
  let highSkillPlayer: Player;
  let masterPlayer: Player;

  beforeEach(() => {
    apManager = new APManager();
    abilityProcessor = new APAbilityProcessor(apManager);
    
    mockPlayer = {
      id: 'test-player',
      name: 'Test Player',
      position: { x: 5, y: 5 },
      health: 100,
      maxHealth: 100,
      currentAP: 5,
      movement: {
        baseSpeed: 3,
        currentSpeed: 3,
        remainingMovement: 3,
        movementMode: 'walk' as const
      },
      skills: {
        combat: 30,
        swords: 50,
        fire_magic: 40,
        healing_magic: 25,
        arcane_magic: 10,
        archery: 25
      },
      equipment: {
        weapon: {
          name: 'Test Sword',
          damage: '1d6+2',
          initiative: 2
        }
      },
      status: 'ready'
    };

    highSkillPlayer = {
      ...mockPlayer,
      id: 'high-skill-player',
      skills: {
        combat: 80,
        swords: 85,
        fire_magic: 90,
        healing_magic: 75,
        arcane_magic: 70,
        archery: 80
      }
    };

    masterPlayer = {
      ...mockPlayer,
      id: 'master-player',
      skills: {
        combat: 95,
        swords: 95,
        fire_magic: 95,
        healing_magic: 95,
        arcane_magic: 95,
        archery: 95
      }
    };

    apManager.initializePlayer(mockPlayer.id, 5);
    apManager.initializePlayer(highSkillPlayer.id, 8);
    apManager.initializePlayer(masterPlayer.id, 8);
  });

  describe('Basic Ability Execution', () => {
    test('should execute power strike successfully', () => {
      const result = abilityProcessor.executeAPAbility(mockPlayer.id, 'power_strike', mockPlayer);
      
      expect(result.success).toBe(true);
      expect(result.apSpent).toBe(2);
      expect(result.timestamp).toBeGreaterThan(0);
      expect(apManager.getCurrentAP(mockPlayer.id)).toBe(3); // 5 - 2 = 3
    });

    test('should execute fireball successfully', () => {
      const result = abilityProcessor.executeAPAbility(mockPlayer.id, 'fireball', mockPlayer);
      
      expect(result.success).toBe(true);
      expect(result.apSpent).toBe(3);
      expect(result.effects).toBeDefined();
      expect(result.effects![0]?.type).toBe('damage');
      expect(apManager.getCurrentAP(mockPlayer.id)).toBe(2); // 5 - 3 = 2
    });

    test('should execute heal successfully', () => {
      const result = abilityProcessor.executeAPAbility(mockPlayer.id, 'heal', mockPlayer);
      
      expect(result.success).toBe(true);
      expect(result.apSpent).toBe(2);
      expect(result.effects![0]?.type).toBe('heal');
      expect(result.effects![0]?.target).toBe(mockPlayer.id);
    });

    test('should execute shield bash successfully', () => {
      const result = abilityProcessor.executeAPAbility(mockPlayer.id, 'shield_bash', mockPlayer);
      
      expect(result.success).toBe(true);
      expect(result.apSpent).toBe(1);
      expect(result.effects![0]?.type).toBe('damage');
    });

    test('should execute quick shot successfully', () => {
      const result = abilityProcessor.executeAPAbility(mockPlayer.id, 'quick_shot', mockPlayer);
      
      expect(result.success).toBe(true);
      expect(result.apSpent).toBe(1);
      expect(result.effects![0]?.type).toBe('damage');
    });
  });

  describe('Master Ability Execution', () => {
    test('should execute whirlwind attack with high skill', () => {
      const result = abilityProcessor.executeAPAbility(highSkillPlayer.id, 'whirlwind_attack', highSkillPlayer);
      
      expect(result.success).toBe(true);
      expect(result.apSpent).toBe(5);
      expect(result.effects![0]?.type).toBe('damage');
      expect(result.effects![0]?.target).toBe('adjacent_enemies');
      expect(apManager.getCurrentAP(highSkillPlayer.id)).toBe(3); // 8 - 5 = 3
    });

    test('should execute meteor with high skill', () => {
      const result = abilityProcessor.executeAPAbility(highSkillPlayer.id, 'meteor', highSkillPlayer);
      
      expect(result.success).toBe(true);
      expect(result.apSpent).toBe(6);
      expect(result.effects![0]?.type).toBe('damage');
      expect(result.effects![0]?.target).toBe('delayed_area');
      expect(result.effects![0]?.duration).toBe(2);
    });

    test('should execute mass heal with sufficient skill', () => {
      const result = abilityProcessor.executeAPAbility(highSkillPlayer.id, 'mass_heal', highSkillPlayer);
      
      expect(result.success).toBe(true);
      expect(result.apSpent).toBe(4);
      expect(result.effects![0]?.type).toBe('heal');
    });
  });

  describe('Legendary Ability Execution', () => {
    test('should execute resurrection with master skill', () => {
      const result = abilityProcessor.executeAPAbility(masterPlayer.id, 'resurrection', masterPlayer);
      
      expect(result.success).toBe(true);
      expect(result.apSpent).toBe(8);
      expect(result.effects![0]?.type).toBe('heal');
      expect(result.effects![0]?.target).toBe('target_ally');
      expect(result.effects![0]?.value).toBe(50); // 50% health
      expect(apManager.getCurrentAP(masterPlayer.id)).toBe(0); // 8 - 8 = 0
    });

    test('should execute time stop with master skill', () => {
      const result = abilityProcessor.executeAPAbility(masterPlayer.id, 'time_stop', masterPlayer);
      
      expect(result.success).toBe(true);
      expect(result.apSpent).toBe(7);
      expect(result.effects![0]?.type).toBe('status');
      expect(result.effects![0]?.target).toBe(masterPlayer.id);
      expect(result.effects![0]?.value).toBe(2); // 2 extra turns
      expect(result.effects![0]?.duration).toBe(2);
    });
  });

  describe('Ability Validation and Failures', () => {
    test('should fail with insufficient AP', () => {
      apManager.setAP(mockPlayer.id, 1); // Set to 1 AP
      const result = abilityProcessor.executeAPAbility(mockPlayer.id, 'fireball', mockPlayer);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe(ERROR_MESSAGES.INSUFFICIENT_AP);
      expect(apManager.getCurrentAP(mockPlayer.id)).toBe(1); // Unchanged
    });

    test('should fail with insufficient skill level', () => {
      const lowSkillPlayer = { ...mockPlayer, skills: { ...mockPlayer.skills, swords: 10 } };
      
      const result = abilityProcessor.executeAPAbility(mockPlayer.id, 'power_strike', lowSkillPlayer);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe(ERROR_MESSAGES.SKILL_REQUIREMENT_NOT_MET);
    });

    test('should fail with unknown ability', () => {
      const result = abilityProcessor.executeAPAbility(mockPlayer.id, 'unknown_ability', mockPlayer);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe(ERROR_MESSAGES.INVALID_ACTION);
    });

    test('should fail master abilities with insufficient skill', () => {
      const result = abilityProcessor.executeAPAbility(mockPlayer.id, 'whirlwind_attack', mockPlayer);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe(ERROR_MESSAGES.SKILL_REQUIREMENT_NOT_MET);
    });

    test('should fail legendary abilities with insufficient skill', () => {
      const result = abilityProcessor.executeAPAbility(highSkillPlayer.id, 'resurrection', highSkillPlayer);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe(ERROR_MESSAGES.SKILL_REQUIREMENT_NOT_MET);
    });
  });

  describe('Ability Availability', () => {
    test('should return available abilities based on skills', () => {
      const availableAbilities = abilityProcessor.getAvailableAbilities(mockPlayer);
      
      expect(availableAbilities.length).toBeGreaterThan(0);
      
      // Should include power_strike (requires swords 25, player has 50)
      const powerStrike = availableAbilities.find(a => a.id === 'power_strike');
      expect(powerStrike).toBeDefined();
      
      // Should include fireball (requires fire_magic 30, player has 40)
      const fireball = availableAbilities.find(a => a.id === 'fireball');
      expect(fireball).toBeDefined();
      
      // Should include heal (requires healing_magic 20, player has 25)
      const heal = availableAbilities.find(a => a.id === 'heal');
      expect(heal).toBeDefined();
    });

    test('should return high-skill abilities for high-skill player', () => {
      const availableAbilities = abilityProcessor.getAvailableAbilities(highSkillPlayer);
      
      // Should include whirlwind_attack (requires swords 75, player has 85)
      const whirlwind = availableAbilities.find(a => a.id === 'whirlwind_attack');
      expect(whirlwind).toBeDefined();
      
      // Should include meteor (requires fire_magic 80, player has 90)
      const meteor = availableAbilities.find(a => a.id === 'meteor');
      expect(meteor).toBeDefined();
      
      // Should include mass_heal (requires healing_magic 60, player has 75)
      const massHeal = availableAbilities.find(a => a.id === 'mass_heal');
      expect(massHeal).toBeDefined();
    });

    test('should return legendary abilities for master player', () => {
      const availableAbilities = abilityProcessor.getAvailableAbilities(masterPlayer);
      
      // Should include resurrection (requires healing_magic 90, player has 95)
      const resurrection = availableAbilities.find(a => a.id === 'resurrection');
      expect(resurrection).toBeDefined();
      
      // Should include time_stop (requires arcane_magic 85, player has 95)
      const timeStop = availableAbilities.find(a => a.id === 'time_stop');
      expect(timeStop).toBeDefined();
    });

    test('should not include abilities with insufficient skill', () => {
      const lowSkillPlayer = {
        ...mockPlayer,
        skills: {
          combat: 5,
          swords: 5,
          fire_magic: 5,
          healing_magic: 5,
          arcane_magic: 5,
          archery: 5
        }
      };
      
      const availableAbilities = abilityProcessor.getAvailableAbilities(lowSkillPlayer);
      
      // Should not include any abilities that require higher skills
      expect(availableAbilities.length).toBe(0);
    });
  });

  describe('Ability Effects and Damage Calculation', () => {
    test('should calculate damage multiplier correctly', () => {
      const result = abilityProcessor.executeAPAbility(mockPlayer.id, 'power_strike', mockPlayer);
      
      expect(result.success).toBe(true);
      expect(result.effects).toBeDefined();
      expect(result.effects![0]?.type).toBe('damage');
      expect(result.effects![0]?.value).toBe(15); // Base damage (10) * 1.5 = 15
    });

    test('should calculate area damage with dice rolls', () => {
      const result = abilityProcessor.executeAPAbility(mockPlayer.id, 'fireball', mockPlayer);
      
      expect(result.success).toBe(true);
      expect(result.effects![0]?.type).toBe('damage');
      expect(result.effects![0]?.target).toBe('area');
      expect(result.effects![0]?.value).toBeGreaterThanOrEqual(2); // Min roll for 2d6
      expect(result.effects![0]?.value).toBeLessThanOrEqual(12); // Max roll for 2d6
    });

    test('should calculate healing with dice rolls', () => {
      const result = abilityProcessor.executeAPAbility(mockPlayer.id, 'heal', mockPlayer);
      
      expect(result.success).toBe(true);
      expect(result.effects![0]?.type).toBe('heal');
      expect(result.effects![0]?.value).toBeGreaterThanOrEqual(3); // Min roll for 1d8+2
      expect(result.effects![0]?.value).toBeLessThanOrEqual(10); // Max roll for 1d8+2
    });

    test('should handle multi-target attacks', () => {
      const result = abilityProcessor.executeAPAbility(highSkillPlayer.id, 'whirlwind_attack', highSkillPlayer);
      
      expect(result.success).toBe(true);
      expect(result.effects![0]?.type).toBe('damage');
      expect(result.effects![0]?.target).toBe('adjacent_enemies');
      expect(result.effects![0]?.value).toBe(12); // Base damage (10) * 1.2 = 12
    });

    test('should handle delayed effects', () => {
      const result = abilityProcessor.executeAPAbility(highSkillPlayer.id, 'meteor', highSkillPlayer);
      
      expect(result.success).toBe(true);
      expect(result.effects![0]?.type).toBe('damage');
      expect(result.effects![0]?.target).toBe('delayed_area');
      expect(result.effects![0]?.duration).toBe(2);
      expect(result.effects![0]?.value).toBeGreaterThanOrEqual(10); // Min roll for 4d6+6
      expect(result.effects![0]?.value).toBeLessThanOrEqual(30); // Max roll for 4d6+6
    });
  });

  describe('Ability Retrieval', () => {
    test('should get ability by ID', () => {
      const ability = abilityProcessor.getAbility('power_strike');
      
      expect(ability).toBeDefined();
      expect(ability!.id).toBe('power_strike');
      expect(ability!.apCost).toBe(2);
      expect(ability!.skillRequirement.skill).toBe('swords');
      expect(ability!.skillRequirement.level).toBe(25);
    });

    test('should return undefined for non-existent ability', () => {
      const ability = abilityProcessor.getAbility('non_existent');
      expect(ability).toBeUndefined();
    });

    test('should get fireball ability details', () => {
      const ability = abilityProcessor.getAbility('fireball');
      
      expect(ability).toBeDefined();
      expect(ability!.effect.type).toBe('area_damage');
      expect(ability!.effect.damage).toBe('2d6');
      expect(ability!.effect.radius).toBe(2);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle player with no skills', () => {
      const noSkillPlayer = {
        ...mockPlayer,
        skills: {
          combat: 0,
          swords: 0,
          fire_magic: 0,
          healing_magic: 0,
          arcane_magic: 0,
          archery: 0
        }
      };
      
      const availableAbilities = abilityProcessor.getAvailableAbilities(noSkillPlayer);
      expect(availableAbilities.length).toBe(0);
    });

    test('should handle ability execution with exactly required AP', () => {
      apManager.setAP(mockPlayer.id, 2); // Exactly enough for power_strike
      const result = abilityProcessor.executeAPAbility(mockPlayer.id, 'power_strike', mockPlayer);
      
      expect(result.success).toBe(true);
      expect(apManager.getCurrentAP(mockPlayer.id)).toBe(0);
    });

    test('should handle ability execution with exactly required skill', () => {
      const exactSkillPlayer = {
        ...mockPlayer,
        skills: { ...mockPlayer.skills, swords: 25 } // Exactly required for power_strike
      };
      
      const result = abilityProcessor.executeAPAbility(mockPlayer.id, 'power_strike', exactSkillPlayer);
      expect(result.success).toBe(true);
    });

    test('should maintain AP state consistency after failed execution', () => {
      const initialAP = apManager.getCurrentAP(mockPlayer.id);
      
      // Try to execute an ability the player doesn't have skill for
      const lowSkillPlayer = { ...mockPlayer, skills: { ...mockPlayer.skills, swords: 5 } };
      const result = abilityProcessor.executeAPAbility(mockPlayer.id, 'power_strike', lowSkillPlayer);
      
      expect(result.success).toBe(false);
      expect(apManager.getCurrentAP(mockPlayer.id)).toBe(initialAP); // Unchanged
    });
  });
});