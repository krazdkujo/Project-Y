/**
 * Character Abilities System
 * Manages character abilities, their usage, and effects
 */

class AbilitySystem {
  constructor(eventSystem, skillSystem) {
    this.events = eventSystem;
    this.skillSystem = skillSystem;
    
    // Base abilities available to all characters
    this.baseAbilities = {
      'basic_attack': {
        name: 'Basic Attack',
        description: 'A simple weapon attack',
        apCost: 1,
        range: 1,
        cooldown: 0,
        skillRequired: null,
        skillLevel: 0,
        type: 'combat',
        effects: {
          damage: { base: 1, scaling: 'weapon' },
          accuracy: { base: 0.8, scaling: 'skill' }
        }
      },
      
      'move': {
        name: 'Move',
        description: 'Move to an adjacent position',
        apCost: 0, // Free action
        range: 1,
        cooldown: 0,
        skillRequired: null,
        skillLevel: 0,
        type: 'movement',
        effects: {
          movement: { base: 1, scaling: 'none' }
        }
      },
      
      'wait': {
        name: 'Wait',
        description: 'Skip your turn and recover 1 AP',
        apCost: 0,
        range: 0,
        cooldown: 0,
        skillRequired: null,
        skillLevel: 0,
        type: 'utility',
        effects: {
          apRecover: { base: 1, scaling: 'none' }
        }
      },
      
      'defend': {
        name: 'Defend',
        description: 'Increase defense until next turn',
        apCost: 1,
        range: 0,
        cooldown: 0,
        skillRequired: 'defense',
        skillLevel: 0,
        type: 'defensive',
        effects: {
          defenseBonus: { base: 2, scaling: 'skill' },
          duration: 1
        }
      }
    };
    
    // Skill-based abilities unlock at certain skill levels
    this.skillAbilities = {
      // One-handed weapon abilities
      'power_strike': {
        name: 'Power Strike',
        description: 'A powerful melee attack that deals extra damage',
        apCost: 2,
        range: 1,
        cooldown: 2,
        skillRequired: 'one_handed',
        skillLevel: 5,
        type: 'combat',
        effects: {
          damage: { base: 2, scaling: 'weapon_and_skill' },
          accuracy: { base: 0.9, scaling: 'skill' }
        }
      },
      
      // Archery abilities
      'aimed_shot': {
        name: 'Aimed Shot',
        description: 'A carefully aimed ranged attack with high accuracy',
        apCost: 2,
        range: 5,
        cooldown: 1,
        skillRequired: 'archery',
        skillLevel: 3,
        type: 'combat',
        effects: {
          damage: { base: 1, scaling: 'weapon_and_skill' },
          accuracy: { base: 0.95, scaling: 'skill' }
        }
      },
      
      // Magic abilities
      'heal': {
        name: 'Heal',
        description: 'Restore health to self or ally',
        apCost: 3,
        range: 3,
        cooldown: 3,
        skillRequired: 'restoration',
        skillLevel: 2,
        type: 'magic',
        effects: {
          healing: { base: 15, scaling: 'skill' },
          accuracy: { base: 1.0, scaling: 'none' }
        }
      },
      
      // Stealth abilities
      'sneak_attack': {
        name: 'Sneak Attack',
        description: 'Attack from stealth for massive damage',
        apCost: 2,
        range: 1,
        cooldown: 4,
        skillRequired: 'sneaking',
        skillLevel: 4,
        type: 'combat',
        effects: {
          damage: { base: 3, scaling: 'weapon_and_skill' },
          accuracy: { base: 0.85, scaling: 'skill' },
          requiresConcealment: true
        }
      },
      
      // Athletics abilities
      'leap': {
        name: 'Leap',
        description: 'Jump over obstacles to reach distant positions',
        apCost: 2,
        range: 3,
        cooldown: 2,
        skillRequired: 'athletics',
        skillLevel: 3,
        type: 'movement',
        effects: {
          movement: { base: 3, scaling: 'skill' },
          ignoreObstacles: true
        }
      },
      
      // Survival abilities
      'first_aid': {
        name: 'First Aid',
        description: 'Quickly bandage wounds to stop bleeding',
        apCost: 2,
        range: 1,
        cooldown: 5,
        skillRequired: 'survival',
        skillLevel: 2,
        type: 'utility',
        effects: {
          healing: { base: 8, scaling: 'skill' },
          removesBleeding: true
        }
      }
    };
  }

  // Get all available abilities for a character
  getCharacterAbilities(character) {
    const abilities = {};
    
    // Add base abilities (always available)
    Object.entries(this.baseAbilities).forEach(([key, ability]) => {
      abilities[key] = { ...ability };
    });
    
    // Add skill-based abilities if character meets requirements
    Object.entries(this.skillAbilities).forEach(([key, ability]) => {
      const characterSkill = character.skills[ability.skillRequired];
      if (characterSkill && characterSkill.level >= ability.skillLevel) {
        abilities[key] = { ...ability };
      }
    });
    
    return abilities;
  }

  // Check if character can use an ability
  canUseAbility(character, abilityKey, targetPosition = null) {
    const abilities = this.getCharacterAbilities(character);
    const ability = abilities[abilityKey];
    
    if (!ability) {
      return { canUse: false, reason: 'Ability not available' };
    }
    
    // Check AP cost
    if (character.ap < ability.apCost) {
      return { canUse: false, reason: `Not enough AP (need ${ability.apCost}, have ${character.ap})` };
    }
    
    // Check cooldown (would need to track this in character state)
    if (character.abilityCooldowns && character.abilityCooldowns[abilityKey] > 0) {
      return { canUse: false, reason: `Ability on cooldown (${character.abilityCooldowns[abilityKey]} turns remaining)` };
    }
    
    // Check range if target position provided
    if (targetPosition && ability.range > 0) {
      const distance = Math.abs(character.x - targetPosition.x) + Math.abs(character.y - targetPosition.y);
      if (distance > ability.range) {
        return { canUse: false, reason: `Target out of range (${distance} > ${ability.range})` };
      }
    }
    
    // Check special requirements
    if (ability.effects.requiresConcealment && !character.isConcealed) {
      return { canUse: false, reason: 'Requires concealment' };
    }
    
    return { canUse: true };
  }

  // Use an ability
  useAbility(character, abilityKey, target = null, targetPosition = null) {
    const canUse = this.canUseAbility(character, abilityKey, targetPosition);
    if (!canUse.canUse) {
      return { success: false, reason: canUse.reason };
    }
    
    const abilities = this.getCharacterAbilities(character);
    const ability = abilities[abilityKey];
    
    // Consume AP
    character.ap -= ability.apCost;
    
    // Set cooldown
    if (!character.abilityCooldowns) character.abilityCooldowns = {};
    if (ability.cooldown > 0) {
      character.abilityCooldowns[abilityKey] = ability.cooldown;
    }
    
    // Calculate and apply effects
    const result = this.calculateAbilityEffects(character, ability, target);
    
    // Emit ability used event
    this.events.emit('ABILITY_USED', {
      characterId: character.id,
      abilityKey: abilityKey,
      targetId: target?.id || null,
      targetPosition: targetPosition,
      result: result
    });
    
    // Award skill XP for using the ability - always 1 XP per use
    if (ability.skillRequired && character.skills[ability.skillRequired]) {
      this.skillSystem.awardSkillUse(character, ability.skillRequired);
    }
    
    return { success: true, result: result };
  }

  // Calculate ability effects based on character stats
  calculateAbilityEffects(character, ability, target = null) {
    const effects = {};
    
    Object.entries(ability.effects).forEach(([effectType, effectData]) => {
      let value = effectData.base;
      
      // Apply scaling
      switch (effectData.scaling) {
        case 'skill':
          if (ability.skillRequired && character.skills[ability.skillRequired]) {
            value += Math.floor(character.skills[ability.skillRequired].level / 10);
          }
          break;
          
        case 'weapon':
          if (character.equipment.weapon) {
            const weaponDamage = character.equipment.weapon.damage;
            value += Math.floor((weaponDamage[0] + weaponDamage[1]) / 2);
          }
          break;
          
        case 'weapon_and_skill':
          // Apply both weapon and skill scaling
          if (character.equipment.weapon) {
            const weaponDamage = character.equipment.weapon.damage;
            value += Math.floor((weaponDamage[0] + weaponDamage[1]) / 2);
          }
          if (ability.skillRequired && character.skills[ability.skillRequired]) {
            value += Math.floor(character.skills[ability.skillRequired].level / 5);
          }
          break;
      }
      
      effects[effectType] = value;
    });
    
    return effects;
  }

  // Reduce ability cooldowns (call at start of character's turn)
  reduceCooldowns(character) {
    if (character.abilityCooldowns) {
      Object.keys(character.abilityCooldowns).forEach(abilityKey => {
        character.abilityCooldowns[abilityKey] = Math.max(0, character.abilityCooldowns[abilityKey] - 1);
        if (character.abilityCooldowns[abilityKey] === 0) {
          delete character.abilityCooldowns[abilityKey];
        }
      });
    }
  }

  // Get ability info by key
  getAbilityInfo(abilityKey) {
    return this.baseAbilities[abilityKey] || this.skillAbilities[abilityKey] || null;
  }

  // Get abilities by type
  getAbilitiesByType(character, type) {
    const abilities = this.getCharacterAbilities(character);
    return Object.entries(abilities)
      .filter(([key, ability]) => ability.type === type)
      .reduce((filtered, [key, ability]) => {
        filtered[key] = ability;
        return filtered;
      }, {});
  }
}

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AbilitySystem;
} else {
  window.AbilitySystem = AbilitySystem;
}