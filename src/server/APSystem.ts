import { PlayerId, APAbility, ActionResult, Player, SkillRequirement } from '../shared/types';
import { AP_SYSTEM, BASIC_AP_ABILITIES, MASTER_AP_ABILITIES, LEGENDARY_AP_ABILITIES, ERROR_MESSAGES } from '../shared/constants';

/**
 * APManager handles Action Point resource tracking and validation
 * - Tracks 2-3 AP accumulation per turn with 8 max
 * - Validates AP costs for abilities
 * - Manages AP spending and regeneration
 */
export class APManager {
  private playerAP = new Map<PlayerId, number>();
  private readonly MAX_AP = AP_SYSTEM.MAX_AP;
  private readonly MIN_AP_PER_TURN = AP_SYSTEM.MIN_AP_PER_TURN;
  private readonly MAX_AP_PER_TURN = AP_SYSTEM.MAX_AP_PER_TURN;
  private readonly DEFAULT_AP_PER_TURN = AP_SYSTEM.DEFAULT_AP_PER_TURN;

  /**
   * Initialize AP for a new player
   */
  initializePlayer(playerId: PlayerId, startingAP: number = this.DEFAULT_AP_PER_TURN): void {
    this.playerAP.set(playerId, Math.min(startingAP, this.MAX_AP));
  }

  /**
   * Add AP for a player's turn (2-3 AP per turn based on circumstances)
   */
  addAPForTurn(playerId: PlayerId, bonusAP: number = 0): number {
    const current = this.playerAP.get(playerId) || 0;
    let apToAdd = this.DEFAULT_AP_PER_TURN + bonusAP;
    
    // Cap AP gain between min and max per turn
    apToAdd = Math.max(this.MIN_AP_PER_TURN, Math.min(apToAdd, this.MAX_AP_PER_TURN));
    
    const newTotal = Math.min(current + apToAdd, this.MAX_AP);
    this.playerAP.set(playerId, newTotal);
    
    return newTotal;
  }

  /**
   * Check if player can afford an ability
   */
  canAfford(playerId: PlayerId, cost: number): boolean {
    const currentAP = this.playerAP.get(playerId) || 0;
    return currentAP >= cost;
  }

  /**
   * Spend AP for an ability
   */
  spendAP(playerId: PlayerId, cost: number): boolean {
    const current = this.playerAP.get(playerId) || 0;
    if (current >= cost) {
      this.playerAP.set(playerId, current - cost);
      return true;
    }
    return false;
  }

  /**
   * Get current AP for a player
   */
  getCurrentAP(playerId: PlayerId): number {
    return this.playerAP.get(playerId) || 0;
  }

  /**
   * Set AP for a player (for admin/testing purposes)
   */
  setAP(playerId: PlayerId, amount: number): void {
    this.playerAP.set(playerId, Math.max(0, Math.min(amount, this.MAX_AP)));
  }

  /**
   * Get all player AP states
   */
  getAllPlayerAP(): Map<PlayerId, number> {
    return new Map(this.playerAP);
  }

  /**
   * Remove player from AP tracking
   */
  removePlayer(playerId: PlayerId): void {
    this.playerAP.delete(playerId);
  }

  /**
   * Reset all players to starting AP
   */
  resetAllPlayers(): void {
    for (const [playerId] of this.playerAP) {
      this.playerAP.set(playerId, this.DEFAULT_AP_PER_TURN);
    }
  }
}

/**
 * APAbilityProcessor handles execution of AP-based abilities
 * Validates skill requirements and AP costs before execution
 */
export class APAbilityProcessor {
  private apManager: APManager;
  private abilities: Map<string, APAbility>;

  constructor(apManager: APManager) {
    this.apManager = apManager;
    this.abilities = new Map();
    this.loadAbilities();
  }

  /**
   * Load all AP abilities from constants
   */
  private loadAbilities(): void {
    // Load basic abilities
    for (const ability of BASIC_AP_ABILITIES) {
      this.abilities.set(ability.id, ability as APAbility);
    }
    
    // Load master abilities
    for (const ability of MASTER_AP_ABILITIES) {
      this.abilities.set(ability.id, ability as APAbility);
    }
    
    // Load legendary abilities
    for (const ability of LEGENDARY_AP_ABILITIES) {
      this.abilities.set(ability.id, ability as APAbility);
    }
  }

  /**
   * Execute an AP ability if all requirements are met
   */
  executeAPAbility(playerId: PlayerId, abilityId: string, player: Player): ActionResult {
    const ability = this.abilities.get(abilityId);
    if (!ability) {
      return {
        success: false,
        reason: ERROR_MESSAGES.INVALID_ACTION,
        timestamp: Date.now()
      };
    }

    // Validate skill requirements
    if (!this.meetsSkillRequirements(player, ability.skillRequirement)) {
      return {
        success: false,
        reason: ERROR_MESSAGES.SKILL_REQUIREMENT_NOT_MET,
        timestamp: Date.now()
      };
    }

    // Validate and spend AP
    if (!this.apManager.canAfford(playerId, ability.apCost)) {
      return {
        success: false,
        reason: ERROR_MESSAGES.INSUFFICIENT_AP,
        timestamp: Date.now()
      };
    }

    // Spend the AP
    this.apManager.spendAP(playerId, ability.apCost);

    // Execute ability effect
    const result = this.executeAbilityEffect(ability, player);
    result.apSpent = ability.apCost;
    
    return result;
  }

  /**
   * Check if player meets skill requirements for an ability
   */
  private meetsSkillRequirements(player: Player, requirement: SkillRequirement): boolean {
    const playerSkillLevel = player.skills[requirement.skill] || 0;
    return playerSkillLevel >= requirement.level;
  }

  /**
   * Execute the actual effect of an ability
   */
  private executeAbilityEffect(ability: APAbility, caster: Player): ActionResult {
    const timestamp = Date.now();
    
    switch (ability.effect.type) {
      case 'damage_multiplier':
        return this.applyDamageMultiplier(ability, caster, timestamp);
      
      case 'area_damage':
        return this.applyAreaDamage(ability, caster, timestamp);
      
      case 'heal':
        return this.applyHealing(ability, caster, timestamp);
      
      case 'multi_target_attack':
        return this.applyMultiTargetAttack(ability, caster, timestamp);
      
      case 'delayed_area_damage':
        return this.applyDelayedAreaDamage(ability, caster, timestamp);
      
      case 'revive_ally':
        return this.applyReviveAlly(ability, caster, timestamp);
      
      case 'extra_turns':
        return this.applyExtraTurns(ability, caster, timestamp);
      
      case 'area_heal':
        return this.applyAreaHeal(ability, caster, timestamp);
      
      default:
        return {
          success: false,
          reason: 'Unknown ability effect type',
          timestamp
        };
    }
  }

  private applyDamageMultiplier(ability: APAbility, caster: Player, timestamp: number): ActionResult {
    const multiplier = ability.effect.value || 1.5;
    return {
      success: true,
      effects: [{
        type: 'damage',
        target: caster.id, // This would be the actual target in a real implementation
        value: Math.floor(10 * multiplier), // Base damage * multiplier
        duration: 0
      }],
      timestamp
    };
  }

  private applyAreaDamage(ability: APAbility, caster: Player, timestamp: number): ActionResult {
    const radius = ability.effect.radius || 1;
    const damage = this.rollDamage(ability.effect.damage || '2d6');
    
    return {
      success: true,
      effects: [{
        type: 'damage',
        target: 'area', // In real implementation, this would be calculated based on position
        value: damage,
        duration: 0
      }],
      timestamp
    };
  }

  private applyHealing(ability: APAbility, caster: Player, timestamp: number): ActionResult {
    const healAmount = this.rollDamage(ability.effect.amount || '1d8+2');
    
    return {
      success: true,
      effects: [{
        type: 'heal',
        target: caster.id,
        value: healAmount,
        duration: 0
      }],
      timestamp
    };
  }

  private applyMultiTargetAttack(ability: APAbility, caster: Player, timestamp: number): ActionResult {
    const multiplier = ability.effect.damage_multiplier || 1.2;
    
    return {
      success: true,
      effects: [{
        type: 'damage',
        target: 'adjacent_enemies',
        value: Math.floor(10 * multiplier),
        duration: 0
      }],
      timestamp
    };
  }

  private applyDelayedAreaDamage(ability: APAbility, caster: Player, timestamp: number): ActionResult {
    const damage = this.rollDamage(ability.effect.damage || '4d6+6');
    const delay = ability.effect.delay_turns || 2;
    
    return {
      success: true,
      effects: [{
        type: 'damage',
        target: 'delayed_area',
        value: damage,
        duration: delay
      }],
      timestamp
    };
  }

  private applyReviveAlly(ability: APAbility, caster: Player, timestamp: number): ActionResult {
    const healthPercentage = ability.effect.health_percentage || 50;
    
    return {
      success: true,
      effects: [{
        type: 'heal',
        target: 'target_ally',
        value: healthPercentage,
        duration: 0
      }],
      timestamp
    };
  }

  private applyExtraTurns(ability: APAbility, caster: Player, timestamp: number): ActionResult {
    const extraTurns = ability.effect.turns || 2;
    
    return {
      success: true,
      effects: [{
        type: 'status',
        target: caster.id,
        value: extraTurns,
        duration: extraTurns
      }],
      timestamp
    };
  }

  private applyAreaHeal(ability: APAbility, caster: Player, timestamp: number): ActionResult {
    const healAmount = this.rollDamage(ability.effect.amount || '2d8+4');
    const radius = ability.effect.radius || 2;
    
    return {
      success: true,
      effects: [{
        type: 'heal',
        target: 'area_allies',
        value: healAmount,
        duration: 0
      }],
      timestamp
    };
  }

  /**
   * Simple dice rolling for damage calculations
   */
  private rollDamage(diceNotation: string): number {
    // Simple implementation - in production, use a proper dice rolling library
    const match = diceNotation.match(/(\d+)d(\d+)(?:\+(\d+))?/);
    if (!match) return 1;
    
    const [, numDiceStr, dieSizeStr, bonusStr] = match;
    const numDice = parseInt(numDiceStr!);
    const dieSize = parseInt(dieSizeStr!);
    let total = parseInt(bonusStr || '0');
    
    for (let i = 0; i < numDice; i++) {
      total += Math.floor(Math.random() * dieSize) + 1;
    }
    
    return total;
  }

  /**
   * Get ability by ID
   */
  getAbility(abilityId: string): APAbility | undefined {
    return this.abilities.get(abilityId);
  }

  /**
   * Get all available abilities for a player based on their skills
   */
  getAvailableAbilities(player: Player): APAbility[] {
    const available: APAbility[] = [];
    
    for (const ability of this.abilities.values()) {
      if (this.meetsSkillRequirements(player, ability.skillRequirement)) {
        available.push(ability);
      }
    }
    
    return available;
  }
}