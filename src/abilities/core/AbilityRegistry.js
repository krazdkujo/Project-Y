/**
 * Ability Registry
 * Centralized database for all abilities in the game
 * Contains ability definitions, requirements, and metadata
 */

class AbilityRegistry {
  constructor() {
    // Master ability database
    this.abilities = new Map();
    
    // Initialize with base abilities that all entities have access to
    this.initializeBaseAbilities();
  }

  /**
   * Initialize core abilities that every character/enemy has access to
   */
  initializeBaseAbilities() {
    // Basic movement and actions
    this.registerAbility('move', {
      name: 'Move',
      description: 'Move to an adjacent position',
      type: 'active',
      category: 'movement',
      apCost: 0,
      range: 1,
      cooldown: 0,
      requiresTarget: false,
      skillRequirements: [],
      prerequisites: [],
      baseSuccessRate: 100, // Movement always succeeds
      effects: {
        movement: { base: 1, scaling: 'none' }
      },
      scaling: {
        effectiveness: [],
        apReduction: [],
        rangeIncrease: []
      }
    });

    this.registerAbility('basic_attack', {
      name: 'Basic Attack',
      description: 'A simple weapon attack using your equipped weapon',
      type: 'active',
      category: 'combat',
      apCost: 1,
      range: 1,
      cooldown: 0,
      requiresTarget: true,
      skillRequirements: [],
      prerequisites: [],
      baseSuccessRate: 50, // Poor base success rate
      effects: {
        damage: { base: 1, scaling: 'weapon' },
        accuracy: { base: 0.5, scaling: 'weapon_skill' }
      },
      scaling: {
        effectiveness: [
          { skill: 'one_handed', multiplier: 2.0 },
          { skill: 'two_handed', multiplier: 2.0 },
          { skill: 'unarmed', multiplier: 2.0 }
        ],
        apReduction: [],
        rangeIncrease: []
      }
    });

    this.registerAbility('wait', {
      name: 'Wait',
      description: 'Skip your turn and recover some AP',
      type: 'active',
      category: 'utility',
      apCost: 0,
      range: 0,
      cooldown: 0,
      requiresTarget: false,
      skillRequirements: [],
      prerequisites: [],
      baseSuccessRate: 100,
      effects: {
        apRecover: { base: 1, scaling: 'none' },
      },
      scaling: {
        effectiveness: [],
        apReduction: [],
        rangeIncrease: []
      }
    });

    this.registerAbility('defend', {
      name: 'Defend',
      description: 'Take a defensive stance, increasing damage resistance',
      type: 'active',
      category: 'defensive',
      apCost: 1,
      range: 0,
      cooldown: 0,
      requiresTarget: false,
      skillRequirements: [{ skill: 'armor_use', level: 0 }], // Available to all
      prerequisites: [],
      baseSuccessRate: 80,
      effects: {
        defenseBonus: { base: 2, scaling: 'armor_skill' },
        duration: { base: 1, scaling: 'none' } // 1 turn
      },
      scaling: {
        effectiveness: [
          { skill: 'armor_use', multiplier: 1.5 },
          { skill: 'shields', multiplier: 1.8 },
          { skill: 'toughness', multiplier: 1.3 }
        ],
        apReduction: [],
        rangeIncrease: []
      }
    });
  }

  /**
   * Register a new ability in the system
   */
  registerAbility(key, abilityData) {
    // Validate required fields
    const required = ['name', 'description', 'type', 'category', 'baseSuccessRate'];
    for (const field of required) {
      if (abilityData[field] === undefined) {
        throw new Error(`Ability ${key} missing required field: ${field}`);
      }
    }

    // Validate ability type
    if (!['active', 'passive'].includes(abilityData.type)) {
      throw new Error(`Invalid ability type for ${key}: ${abilityData.type}`);
    }

    // Set defaults for optional fields
    const ability = {
      key: key,
      name: abilityData.name,
      description: abilityData.description,
      type: abilityData.type,
      category: abilityData.category,
      apCost: abilityData.apCost || 0,
      range: abilityData.range || 0,
      cooldown: abilityData.cooldown || 0,
      requiresTarget: abilityData.requiresTarget || false,
      skillRequirements: abilityData.skillRequirements || [],
      prerequisites: abilityData.prerequisites || [],
      baseSuccessRate: abilityData.baseSuccessRate,
      effects: abilityData.effects || {},
      scaling: {
        effectiveness: abilityData.scaling?.effectiveness || [],
        apReduction: abilityData.scaling?.apReduction || [],
        rangeIncrease: abilityData.scaling?.rangeIncrease || []
      },
      tags: abilityData.tags || [],
      unlockMessage: abilityData.unlockMessage || null
    };

    this.abilities.set(key, ability);
    return ability;
  }

  /**
   * Get ability by key
   */
  getAbility(abilityKey) {
    return this.abilities.get(abilityKey) || null;
  }

  /**
   * Get all abilities
   */
  getAllAbilities() {
    return Array.from(this.abilities.values());
  }

  /**
   * Get abilities by type (active/passive)
   */
  getAbilitiesByType(type) {
    return this.getAllAbilities().filter(ability => ability.type === type);
  }

  /**
   * Get abilities by category
   */
  getAbilitiesByCategory(category) {
    return this.getAllAbilities().filter(ability => ability.category === category);
  }

  /**
   * Check if entity meets skill requirements for an ability
   */
  meetsSkillRequirements(entity, abilityKey) {
    const ability = this.getAbility(abilityKey);
    if (!ability) {
      return { meets: false, reason: 'Ability not found' };
    }

    if (!entity.skills) {
      return { meets: false, reason: 'Entity has no skills' };
    }

    // Check each skill requirement
    for (const req of ability.skillRequirements) {
      const entitySkill = entity.skills[req.skill];
      if (!entitySkill || entitySkill.level < req.level) {
        return { 
          meets: false, 
          reason: `Requires ${req.skill} level ${req.level} (current: ${entitySkill?.level || 0})` 
        };
      }
    }

    return { meets: true };
  }

  /**
   * Check if entity meets prerequisites for an ability
   */
  meetsPrerequisites(entity, abilityKey) {
    const ability = this.getAbility(abilityKey);
    if (!ability) {
      return { meets: false, reason: 'Ability not found' };
    }

    // Check if entity has learned prerequisite abilities
    const unlockedAbilities = entity.unlockedAbilities || new Set();
    
    for (const prereq of ability.prerequisites) {
      if (!unlockedAbilities.has(prereq)) {
        return { 
          meets: false, 
          reason: `Requires ability: ${this.getAbility(prereq)?.name || prereq}` 
        };
      }
    }

    return { meets: true };
  }

  /**
   * Check if entity can learn/use an ability
   */
  canUseAbility(entity, abilityKey) {
    const skillCheck = this.meetsSkillRequirements(entity, abilityKey);
    if (!skillCheck.meets) {
      return skillCheck;
    }

    const prereqCheck = this.meetsPrerequisites(entity, abilityKey);
    if (!prereqCheck.meets) {
      return prereqCheck;
    }

    return { meets: true };
  }

  /**
   * Calculate success rate for an ability based on entity's skills
   */
  calculateSuccessRate(entity, abilityKey) {
    const ability = this.getAbility(abilityKey);
    if (!ability || !entity.skills) {
      return 0;
    }

    let successRate = ability.baseSuccessRate;

    // Apply skill scaling bonuses
    for (const scaling of ability.scaling.effectiveness) {
      const skill = entity.skills[scaling.skill];
      if (skill) {
        successRate += skill.level * scaling.multiplier;
      }
    }

    // Cap between 5% and 95%
    return Math.max(5, Math.min(95, successRate));
  }

  /**
   * Calculate effective AP cost based on entity's skills
   */
  calculateAPCost(entity, abilityKey) {
    const ability = this.getAbility(abilityKey);
    if (!ability || !entity.skills) {
      return ability?.apCost || 0;
    }

    let apCost = ability.apCost;

    // Apply AP reduction bonuses
    for (const reduction of ability.scaling.apReduction) {
      const skill = entity.skills[reduction.skill];
      if (skill) {
        const reductionAmount = Math.floor(skill.level / reduction.levelsPer) * reduction.reduction;
        apCost = Math.max(1, apCost - reductionAmount); // Minimum 1 AP for active abilities
      }
    }

    return apCost;
  }

  /**
   * Calculate effective range based on entity's skills
   */
  calculateRange(entity, abilityKey) {
    const ability = this.getAbility(abilityKey);
    if (!ability || !entity.skills) {
      return ability?.range || 0;
    }

    let range = ability.range;

    // Apply range increase bonuses
    for (const increase of ability.scaling.rangeIncrease) {
      const skill = entity.skills[increase.skill];
      if (skill) {
        const rangeIncrease = Math.floor(skill.level / increase.levelsPer) * increase.increase;
        range += rangeIncrease;
      }
    }

    return range;
  }

  /**
   * Get all abilities an entity has unlocked based on their skills
   */
  getUnlockedAbilities(entity) {
    const unlocked = [];
    
    for (const ability of this.getAllAbilities()) {
      const canUse = this.canUseAbility(entity, ability.key);
      if (canUse.meets) {
        unlocked.push({
          ...ability,
          successRate: this.calculateSuccessRate(entity, ability.key),
          effectiveAPCost: this.calculateAPCost(entity, ability.key),
          effectiveRange: this.calculateRange(entity, ability.key)
        });
      }
    }

    return unlocked;
  }

  /**
   * Get abilities an entity is close to unlocking (within 5 skill levels)
   */
  getNearUnlockAbilities(entity, levelThreshold = 5) {
    const nearUnlock = [];
    
    for (const ability of this.getAllAbilities()) {
      const canUse = this.canUseAbility(entity, ability.key);
      if (!canUse.meets && ability.skillRequirements.length > 0) {
        // Check how close they are to meeting requirements
        let maxLevelsNeeded = 0;
        let canReach = true;
        
        for (const req of ability.skillRequirements) {
          const entitySkill = entity.skills?.[req.skill];
          const currentLevel = entitySkill?.level || 0;
          const levelsNeeded = Math.max(0, req.level - currentLevel);
          
          if (levelsNeeded > levelThreshold) {
            canReach = false;
            break;
          }
          
          maxLevelsNeeded = Math.max(maxLevelsNeeded, levelsNeeded);
        }
        
        if (canReach && maxLevelsNeeded > 0) {
          nearUnlock.push({
            ability: ability,
            levelsNeeded: maxLevelsNeeded,
            requirements: ability.skillRequirements
          });
        }
      }
    }

    return nearUnlock.sort((a, b) => a.levelsNeeded - b.levelsNeeded);
  }

  /**
   * Bulk register abilities from an array
   */
  registerAbilities(abilities) {
    for (const ability of abilities) {
      this.registerAbility(ability.key, ability);
    }
  }

  /**
   * Check if ability exists
   */
  hasAbility(abilityKey) {
    return this.abilities.has(abilityKey);
  }

  /**
   * Get ability count by category
   */
  getAbilityStats() {
    const stats = {
      total: this.abilities.size,
      byType: { active: 0, passive: 0 },
      byCategory: {}
    };

    for (const ability of this.abilities.values()) {
      // Count by type
      stats.byType[ability.type]++;
      
      // Count by category
      if (!stats.byCategory[ability.category]) {
        stats.byCategory[ability.category] = 0;
      }
      stats.byCategory[ability.category]++;
    }

    return stats;
  }
}

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AbilityRegistry;
} else {
  window.AbilityRegistry = AbilityRegistry;
}