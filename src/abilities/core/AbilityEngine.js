/**
 * Ability Engine
 * Core system that manages ability usage for both players and enemies
 * Integrates with AbilityRegistry and AbilitySlotManager
 */

class AbilityEngine {
  constructor(eventSystem, skillSystem, abilityRegistry, slotManager, gameState) {
    this.events = eventSystem;
    this.skillSystem = skillSystem;
    this.registry = abilityRegistry;
    this.slotManager = slotManager;
    this.gameState = gameState;
    
    // Initialize exploration systems
    this.lockpickingSystem = null; // Will be set when lockpicking system is available
    
    // Load all ability definitions
    this.initializeAllAbilities();
  }

  /**
   * Initialize and register all abilities from various categories
   */
  initializeAllAbilities() {
    // Register combat abilities if they're loaded
    if (typeof MELEE_ABILITIES !== 'undefined') {
      this.registry.registerAbilities(MELEE_ABILITIES);
    }
    if (typeof RANGED_ABILITIES !== 'undefined') {
      this.registry.registerAbilities(RANGED_ABILITIES);
    }
    if (typeof DEFENSIVE_ABILITIES !== 'undefined') {
      this.registry.registerAbilities(DEFENSIVE_ABILITIES);
    }

    // Will register magic abilities when they're created
    if (typeof MAGIC_ABILITIES !== 'undefined') {
      this.registry.registerAbilities(MAGIC_ABILITIES);
    }

    // Will register hybrid abilities when they're created
    if (typeof HYBRID_ABILITIES !== 'undefined') {
      this.registry.registerAbilities(HYBRID_ABILITIES);
    }

    // Register exploration abilities when they're created
    if (typeof EXPLORATION_ABILITIES !== 'undefined') {
      this.registry.registerAbilities(EXPLORATION_ABILITIES);
    }

    console.log(`AbilityEngine initialized with ${this.registry.abilities.size} abilities`);
  }

  /**
   * Set the lockpicking system for exploration abilities
   */
  setLockpickingSystem(lockpickingSystem) {
    this.lockpickingSystem = lockpickingSystem;
  }

  /**
   * Use an ability - works for both players and enemies
   */
  useAbility(entity, abilityKey, target = null, targetPosition = null) {
    // Check if ability is slotted (only slotted abilities can be used)
    const slotInfo = this.slotManager.isAbilitySlotted(entity, abilityKey);
    if (!slotInfo.isSlotted) {
      return { 
        success: false, 
        reason: 'Ability not slotted. Only slotted abilities can be used.' 
      };
    }

    // Get ability definition
    const ability = this.registry.getAbility(abilityKey);
    if (!ability) {
      return { success: false, reason: 'Ability not found' };
    }

    // Check if entity can use this ability
    const canUse = this.canUseAbility(entity, abilityKey, target, targetPosition);
    if (!canUse.canUse) {
      return { success: false, reason: canUse.reason };
    }

    // Calculate success rate
    const successRate = this.registry.calculateSuccessRate(entity, abilityKey);
    const roll = Math.random() * 100;
    const succeeded = roll <= successRate;

    if (!succeeded && ability.type === 'active') {
      // Ability failed, but still consume some resources
      this.consumeResources(entity, ability, 0.3); // 30% resource cost on failure
      
      this.events.emit('ABILITY_FAILED', {
        entityId: entity.id,
        abilityKey: abilityKey,
        successRate: successRate,
        roll: roll,
        target: target?.id
      });

      return { 
        success: false, 
        reason: `Ability failed (${successRate.toFixed(1)}% chance, rolled ${roll.toFixed(1)})`,
        failed: true
      };
    }

    // Consume resources (AP)
    this.consumeResources(entity, ability, 1.0);

    // Apply cooldown
    if (ability.cooldown > 0) {
      if (!entity.abilityCooldowns) entity.abilityCooldowns = {};
      entity.abilityCooldowns[abilityKey] = ability.cooldown;
    }

    // Calculate and apply effects
    const effects = this.calculateAbilityEffects(entity, ability, target);
    const result = this.applyAbilityEffects(entity, ability, effects, target, targetPosition);

    // Award skill XP - always 1 XP per use
    if (ability.skillRequirements.length > 0) {
      for (const req of ability.skillRequirements) {
        if (entity.skills && entity.skills[req.skill]) {
          this.skillSystem.awardSkillUse(entity, req.skill);
        }
      }
    }

    // Emit success event
    this.events.emit('ABILITY_USED', {
      entityId: entity.id,
      abilityKey: abilityKey,
      target: target?.id,
      targetPosition: targetPosition,
      effects: effects,
      result: result,
      successRate: successRate
    });

    return { 
      success: true, 
      result: result, 
      effects: effects,
      successRate: successRate 
    };
  }

  /**
   * Check if entity can use an ability right now
   */
  canUseAbility(entity, abilityKey, target = null, targetPosition = null) {
    const ability = this.registry.getAbility(abilityKey);
    if (!ability) {
      return { canUse: false, reason: 'Ability not found' };
    }

    // Check if it's an active ability and entity is alive/conscious
    if (ability.type === 'active' && (!entity.health || entity.health <= 0)) {
      return { canUse: false, reason: 'Cannot use abilities while unconscious' };
    }

    // Check skill requirements
    const skillCheck = this.registry.meetsSkillRequirements(entity, abilityKey);
    if (!skillCheck.meets) {
      return { canUse: false, reason: skillCheck.reason };
    }

    // Check prerequisites
    const prereqCheck = this.registry.meetsPrerequisites(entity, abilityKey);
    if (!prereqCheck.meets) {
      return { canUse: false, reason: prereqCheck.reason };
    }

    // Check resource costs
    const resourceCheck = this.checkResourceCosts(entity, ability);
    if (!resourceCheck.canAfford) {
      return { canUse: false, reason: resourceCheck.reason };
    }

    // Check cooldown
    if (entity.abilityCooldowns && entity.abilityCooldowns[abilityKey] > 0) {
      return { 
        canUse: false, 
        reason: `Ability on cooldown (${entity.abilityCooldowns[abilityKey]} turns remaining)` 
      };
    }

    // Check range and targeting
    if (ability.requiresTarget && !target) {
      return { canUse: false, reason: 'Ability requires a target' };
    }

    if (target && ability.range > 0) {
      const distance = this.calculateDistance(entity, target);
      const effectiveRange = this.registry.calculateRange(entity, abilityKey);
      
      if (distance > effectiveRange) {
        return { 
          canUse: false, 
          reason: `Target out of range (${distance} > ${effectiveRange})` 
        };
      }
    }

    // Check special conditions
    if (ability.tags && ability.tags.includes('low_health_only')) {
      const healthPercent = entity.health / (entity.maxHealth || entity.health);
      if (healthPercent > 0.25) {
        return { canUse: false, reason: 'Can only use when below 25% health' };
      }
    }

    // Check line of sight for ranged abilities
    if (ability.range > 1 && target && ability.requiresTarget) {
      // TODO: Implement line of sight checking with map data
      // For now, assume line of sight is clear
    }

    return { canUse: true };
  }

  /**
   * Check if entity has enough resources (AP) to use ability
   */
  checkResourceCosts(entity, ability) {
    const effectiveAPCost = this.registry.calculateAPCost(entity, ability);
    
    // Check AP
    if (entity.ap !== undefined && entity.ap < effectiveAPCost) {
      return { 
        canAfford: false, 
        reason: `Not enough AP (need ${effectiveAPCost}, have ${entity.ap})` 
      };
    }



    return { canAfford: true };
  }

  /**
   * Consume resources when using an ability
   */
  consumeResources(entity, ability, multiplier = 1.0) {
    const effectiveAPCost = this.registry.calculateAPCost(entity, ability);
    
    // Consume AP
    if (entity.ap !== undefined) {
      entity.ap = Math.max(0, entity.ap - Math.floor(effectiveAPCost * multiplier));
    }


  }

  /**
   * Calculate ability effects based on entity's skills and ability scaling
   */
  calculateAbilityEffects(entity, ability, target = null) {
    const effects = {};

    Object.entries(ability.effects).forEach(([effectType, effectData]) => {
      let value = effectData.base;

      // Apply skill-based scaling
      switch (effectData.scaling) {
        case 'weapon':
          if (entity.equipment && entity.equipment.weapon) {
            const weaponDamage = entity.equipment.weapon.damage;
            if (Array.isArray(weaponDamage)) {
              value *= (weaponDamage[0] + weaponDamage[1]) / 2;
            } else {
              value *= weaponDamage;
            }
          }
          break;

        case 'shield':
          if (entity.equipment && entity.equipment.shield) {
            const shieldValue = entity.equipment.shield.defense || 1;
            value *= shieldValue;
          }
          break;

        case 'skill':
          if (ability.skillRequirements.length > 0 && entity.skills) {
            const primarySkill = entity.skills[ability.skillRequirements[0].skill];
            if (primarySkill) {
              value += primarySkill.level * 0.1; // 10% per skill level
            }
          }
          break;

        case 'weapon_skill':
          // Combine weapon damage with skill level
          if (entity.equipment && entity.equipment.weapon && entity.skills) {
            const weaponDamage = entity.equipment.weapon.damage;
            if (Array.isArray(weaponDamage)) {
              value *= (weaponDamage[0] + weaponDamage[1]) / 2;
            }
            
            if (ability.skillRequirements.length > 0) {
              const primarySkill = entity.skills[ability.skillRequirements[0].skill];
              if (primarySkill) {
                value *= (1 + primarySkill.level * 0.05); // 5% per skill level
              }
            }
          }
          break;

        case 'strength':
          if (entity.skills && entity.skills.strength) {
            value += entity.skills.strength.level * 0.15; // Strength scaling
          }
          break;

        case 'none':
        default:
          // No scaling applied
          break;
      }

      // Apply effectiveness scaling from ability definition
      for (const scaling of ability.scaling.effectiveness) {
        if (entity.skills && entity.skills[scaling.skill]) {
          const skillLevel = entity.skills[scaling.skill].level;
          value += skillLevel * scaling.multiplier;
        }
      }

      effects[effectType] = Math.max(0, value);
    });

    return effects;
  }

  /**
   * Apply ability effects to targets and environment
   */
  applyAbilityEffects(entity, ability, effects, target = null, targetPosition = null) {
    const result = {
      effectsApplied: [],
      targetsAffected: [],
      damage: 0,
      healing: 0,
      statusEffects: []
    };

    // Apply damage effects
    if (effects.damage && target) {
      const damageDealt = this.applyDamage(entity, target, effects.damage, effects.armorPiercing || 0);
      result.damage = damageDealt;
      result.targetsAffected.push(target.id);
      result.effectsApplied.push(`${damageDealt} damage`);
    }

    // Apply healing effects
    if (effects.healing) {
      const healTarget = target || entity; // Self-heal if no target
      const healingDone = this.applyHealing(healTarget, effects.healing);
      result.healing = healingDone;
      result.targetsAffected.push(healTarget.id);
      result.effectsApplied.push(`${healingDone} healing`);
    }

    // Apply movement effects
    if (effects.movement && targetPosition) {
      this.applyMovement(entity, targetPosition, effects.movement);
      result.effectsApplied.push(`moved ${effects.movement} spaces`);
    }

    // Apply status effects
    if (effects.stunChance && target && Math.random() < effects.stunChance) {
      this.applyStatusEffect(target, 'stunned', effects.stunDuration || 1);
      result.statusEffects.push('stunned');
      result.effectsApplied.push('stunned target');
    }

    if (effects.knockback && target) {
      this.applyKnockback(entity, target, effects.knockback);
      result.effectsApplied.push('knocked back target');
    }

    // Apply temporary bonuses
    if (effects.defenseBonus) {
      this.applyTemporaryEffect(entity, 'defenseBonus', effects.defenseBonus, effects.duration || 3);
      result.effectsApplied.push(`+${effects.defenseBonus} defense`);
    }

    if (effects.apRecover && entity.ap !== undefined) {
      entity.ap = Math.min(entity.maxAP || 8, entity.ap + effects.apRecover);
      result.effectsApplied.push(`+${effects.apRecover} AP`);
    }

    // Handle exploration abilities
    if (ability.category === 'exploration') {
      const explorationResult = this.handleExplorationAbility(entity, ability, effects, target, targetPosition);
      if (explorationResult) {
        result.effectsApplied.push(...explorationResult.effectsApplied);
        if (explorationResult.success !== undefined) {
          result.explorationSuccess = explorationResult.success;
          result.explorationMessage = explorationResult.message;
        }
      }
    }

    return result;
  }

  /**
   * Handle exploration abilities (lockpicking, survival, etc.)
   */
  handleExplorationAbility(entity, ability, effects, target, targetPosition) {
    const result = {
      effectsApplied: [],
      success: false,
      message: ''
    };

    switch (ability.key) {
      case 'pick_lock':
      case 'master_lockpick':
        return this.handleLockpickingAbility(entity, ability, target);
      
      case 'disable_trap':
        return this.handleTrapDisabling(entity, ability, target);
      
      case 'pickpocket':
        return this.handlePickpocketAbility(entity, ability, target);

      case 'examine_closely':
        return this.handleExaminationAbility(entity, ability, target);

      case 'track_creature':
        return this.handleTrackingAbility(entity, ability, effects);

      case 'find_water':
      case 'forage_food':
        return this.handleSurvivalAbility(entity, ability, effects);

      case 'basic_smithing':
      case 'brew_potion':
      case 'enchant_item':
        return this.handleCraftingAbility(entity, ability, effects);

      default:
        // Generic exploration ability - just apply success message
        result.success = true;
        result.message = `Used ${ability.name}`;
        result.effectsApplied.push(ability.name.toLowerCase());
        return result;
    }
  }

  /**
   * Handle lockpicking abilities
   */
  handleLockpickingAbility(entity, ability, target) {
    if (!this.lockpickingSystem) {
      return {
        effectsApplied: ['lockpicking system not available'],
        success: false,
        message: 'Lockpicking system not initialized'
      };
    }

    if (!target || !target.id) {
      return {
        effectsApplied: ['no target specified'],
        success: false,
        message: 'Must target a locked object'
      };
    }

    // Attempt lockpicking through the lockpicking system
    const result = this.lockpickingSystem.attemptLockpick(target.id, entity, ability.key);
    
    return {
      effectsApplied: [result.message],
      success: result.success,
      message: result.message,
      timeSpent: result.timeSpent,
      xpAwarded: result.xpAwarded
    };
  }

  /**
   * Handle trap disabling
   */
  handleTrapDisabling(entity, ability, target) {
    if (!this.lockpickingSystem) {
      return {
        effectsApplied: ['trap system not available'],
        success: false,
        message: 'Trap system not initialized'
      };
    }

    if (!target || !target.id) {
      return {
        effectsApplied: ['no target specified'],
        success: false,
        message: 'Must target a trap'
      };
    }

    const result = this.lockpickingSystem.attemptDisableTrap(target.id, entity);
    
    return {
      effectsApplied: [result.message],
      success: result.success,
      message: result.message,
      damage: result.damage || 0
    };
  }

  /**
   * Handle pickpocket ability
   */
  handlePickpocketAbility(entity, ability, target) {
    if (!target || target.type !== 'npc') {
      return {
        effectsApplied: ['invalid target'],
        success: false,
        message: 'Can only pickpocket NPCs'
      };
    }

    // Simple pickpocket simulation - will be enhanced when NPC system exists
    const stealthiness = entity.skills?.pickpocketing?.level || 0;
    const successChance = Math.max(0.1, 0.3 + stealthiness * 0.05);
    const success = Math.random() < successChance;

    if (success) {
      // Generate some random loot
      const goldFound = Math.floor(Math.random() * 20) + 1;
      if (this.gameState && this.gameState.party) {
        this.gameState.party.gold += goldFound;
      }

      return {
        effectsApplied: [`stole ${goldFound} gold`],
        success: true,
        message: `Successfully pickpocketed ${goldFound} gold`
      };
    } else {
      return {
        effectsApplied: ['pickpocket attempt failed'],
        success: false,
        message: 'Failed to pickpocket - target noticed!'
      };
    }
  }

  /**
   * Handle examination ability
   */
  handleExaminationAbility(entity, ability, target) {
    if (!target) {
      return {
        effectsApplied: ['examined surroundings'],
        success: true,
        message: 'You carefully examine your surroundings but find nothing unusual'
      };
    }

    const investigationSkill = entity.skills?.investigation?.level || 0;
    const detailLevel = Math.min(3, Math.floor(investigationSkill / 10) + 1);
    
    let details = [];
    switch (detailLevel) {
      case 3:
        details.push('detailed analysis of construction and materials');
        // fallthrough
      case 2:
        details.push('signs of recent activity');
        // fallthrough
      case 1:
        details.push('basic physical properties');
        break;
    }

    return {
      effectsApplied: ['examined target closely'],
      success: true,
      message: `Examination reveals: ${details.join(', ')}`
    };
  }

  /**
   * Handle tracking ability  
   */
  handleTrackingAbility(entity, ability, effects) {
    const trackingSkill = entity.skills?.wilderness_survival?.level || 0;
    const success = Math.random() < (0.4 + trackingSkill * 0.03);

    if (success) {
      return {
        effectsApplied: ['found tracks'],
        success: true,
        message: 'You find fresh tracks leading deeper into the dungeon'
      };
    } else {
      return {
        effectsApplied: ['no tracks found'],
        success: false,
        message: 'You search carefully but find no tracks'
      };
    }
  }

  /**
   * Handle survival abilities
   */
  handleSurvivalAbility(entity, ability, effects) {
    const survivalSkill = entity.skills?.wilderness_survival?.level || 0;
    const baseSuccess = ability.key === 'find_water' ? 0.6 : 0.5;
    const success = Math.random() < (baseSuccess + survivalSkill * 0.02);

    if (success) {
      if (ability.key === 'find_water') {
        return {
          effectsApplied: ['found water source'],
          success: true,
          message: 'You locate a clean water source'
        };
      } else if (ability.key === 'forage_food') {
        return {
          effectsApplied: ['found edible plants'],
          success: true,
          message: 'You gather edible roots and berries'
        };
      }
    }

    return {
      effectsApplied: ['survival attempt failed'],
      success: false,
      message: `Failed to ${ability.key.replace('_', ' ')}`
    };
  }

  /**
   * Handle crafting abilities
   */
  handleCraftingAbility(entity, ability, effects) {
    // Placeholder for crafting system - will be enhanced in Phase 2
    const craftingSkill = entity.skills?.blacksmithing?.level || entity.skills?.alchemy?.level || 0;
    const success = Math.random() < (0.3 + craftingSkill * 0.05);

    if (success) {
      return {
        effectsApplied: [`${ability.key} successful`],
        success: true,
        message: `Successfully used ${ability.name}`
      };
    } else {
      return {
        effectsApplied: [`${ability.key} failed`],
        success: false,
        message: `Failed to use ${ability.name} - need better materials or skills`
      };
    }
  }

  /**
   * Apply damage with armor penetration
   */
  applyDamage(attacker, target, damage, armorPiercing = 0) {
    if (!target.health) return 0;

    let finalDamage = damage;

    // Apply armor reduction
    if (target.defense && armorPiercing < 1.0) {
      const effectiveDefense = target.defense * (1.0 - armorPiercing);
      finalDamage = Math.max(1, damage - effectiveDefense);
    }

    // Apply damage resistance passives
    if (target.damageReduction) {
      finalDamage *= (1.0 - target.damageReduction);
    }

    finalDamage = Math.floor(finalDamage);
    target.health = Math.max(0, target.health - finalDamage);

    // Check for death
    if (target.health === 0) {
      this.events.emit('ENTITY_DIED', {
        entityId: target.id,
        killer: attacker.id
      });
    }

    return finalDamage;
  }

  /**
   * Apply healing
   */
  applyHealing(target, healing) {
    if (!target.health) return 0;

    const maxHealth = target.maxHealth || target.health;
    const healingDone = Math.min(healing, maxHealth - target.health);
    target.health += healingDone;

    return Math.floor(healingDone);
  }

  /**
   * Apply movement
   */
  applyMovement(entity, targetPosition, distance) {
    if (targetPosition && entity.x !== undefined && entity.y !== undefined) {
      // Simple movement - in a real game you'd check for obstacles
      entity.x = targetPosition.x;
      entity.y = targetPosition.y;
    }
  }

  /**
   * Apply status effects
   */
  applyStatusEffect(target, effect, duration) {
    if (!target.statusEffects) {
      target.statusEffects = {};
    }

    target.statusEffects[effect] = Math.max(
      target.statusEffects[effect] || 0,
      duration
    );
  }

  /**
   * Apply knockback
   */
  applyKnockback(attacker, target, distance) {
    if (!target.x || !target.y || !attacker.x || !attacker.y) return;

    // Calculate knockback direction
    const dx = target.x - attacker.x;
    const dy = target.y - attacker.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length > 0) {
      const normalizedX = dx / length;
      const normalizedY = dy / length;

      // Move target away from attacker
      target.x = Math.round(target.x + normalizedX * distance);
      target.y = Math.round(target.y + normalizedY * distance);
    }
  }

  /**
   * Apply temporary effects
   */
  applyTemporaryEffect(entity, effect, value, duration) {
    if (!entity.temporaryEffects) {
      entity.temporaryEffects = {};
    }

    entity.temporaryEffects[effect] = {
      value: value,
      duration: duration
    };
  }

  /**
   * Calculate distance between two entities
   */
  calculateDistance(entity1, entity2) {
    if (!entity1.x || !entity1.y || !entity2.x || !entity2.y) {
      return 0;
    }

    return Math.abs(entity1.x - entity2.x) + Math.abs(entity1.y - entity2.y);
  }

  /**
   * Update cooldowns and temporary effects (call each turn)
   */
  updateEffects(entity) {
    // Update ability cooldowns
    if (entity.abilityCooldowns) {
      Object.keys(entity.abilityCooldowns).forEach(abilityKey => {
        entity.abilityCooldowns[abilityKey] = Math.max(0, entity.abilityCooldowns[abilityKey] - 1);
        if (entity.abilityCooldowns[abilityKey] === 0) {
          delete entity.abilityCooldowns[abilityKey];
        }
      });
    }

    // Update status effects
    if (entity.statusEffects) {
      Object.keys(entity.statusEffects).forEach(effect => {
        entity.statusEffects[effect] = Math.max(0, entity.statusEffects[effect] - 1);
        if (entity.statusEffects[effect] === 0) {
          delete entity.statusEffects[effect];
        }
      });
    }

    // Update temporary effects
    if (entity.temporaryEffects) {
      Object.keys(entity.temporaryEffects).forEach(effect => {
        entity.temporaryEffects[effect].duration = Math.max(0, entity.temporaryEffects[effect].duration - 1);
        if (entity.temporaryEffects[effect].duration === 0) {
          delete entity.temporaryEffects[effect];
        }
      });
    }

    // Update slot manager cooldowns
    this.slotManager.updateSwapCooldown(entity);
  }

  /**
   * Get all available abilities for an entity (considering skills and prerequisites)
   */
  getAvailableAbilities(entity) {
    return this.registry.getUnlockedAbilities(entity);
  }

  /**
   * Get slotted abilities for an entity
   */
  getSlottedAbilities(entity) {
    return {
      active: this.slotManager.getActiveAbilities(entity),
      passive: this.slotManager.getPassiveAbilities(entity)
    };
  }

  /**
   * Auto-assign abilities for an enemy based on their tier and role
   */
  autoAssignEnemyAbilities(enemy, role = 'balanced') {
    const availableAbilities = this.getAvailableAbilities(enemy);
    return this.slotManager.autoSlotEnemyAbilities(enemy, availableAbilities, role);
  }
}

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AbilityEngine;
} else {
  window.AbilityEngine = AbilityEngine;
}