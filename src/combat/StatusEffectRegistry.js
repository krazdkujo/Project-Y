/**
 * Status Effect Registry
 * Comprehensive documentation of all status effects used in abilities
 * Defines mechanics, duration, stacking rules, and interactions
 */

class StatusEffectRegistry {
  constructor() {
    this.effects = new Map();
    this.initializeStatusEffects();
  }

  initializeStatusEffects() {
    // DAMAGE OVER TIME EFFECTS
    this.registerEffect('burn', {
      name: 'Burn',
      type: 'damage_over_time',
      description: 'Target takes fire damage each turn',
      stackable: true,
      maxStacks: 3,
      tickTiming: 'start_of_turn',
      properties: {
        damagePerTick: { base: 3, scaling: 'source_skill' },
        duration: { base: 3, scaling: 'source_skill' },
        resistance: 'fire_resistance'
      },
      interactions: {
        extinguished_by: ['ice_damage', 'water_damage'],
        enhanced_by: ['wind_effects'],
        immune_if: ['fire_immunity']
      }
    });

    this.registerEffect('bleed', {
      name: 'Bleeding',
      type: 'damage_over_time',
      description: 'Target loses health from wounds each turn',
      stackable: true,
      maxStacks: 5,
      tickTiming: 'start_of_turn',
      properties: {
        damagePerTick: { base: 2, scaling: 'source_weapon' },
        duration: { base: 4, scaling: 'none' },
        healingPenalty: 0.5 // Healing is 50% less effective
      },
      interactions: {
        stopped_by: ['healing_magic', 'bandaging'],
        worsened_by: ['movement', 'combat_actions']
      }
    });

    // MOVEMENT IMPAIRMENT EFFECTS
    this.registerEffect('slow', {
      name: 'Slowed',
      type: 'movement_debuff',
      description: 'Target moves slower and has reduced initiative',
      stackable: false,
      tickTiming: 'persistent',
      properties: {
        movementPenalty: { base: -2, scaling: 'source_skill' },
        initiativePenalty: { base: -3, scaling: 'source_skill' },
        duration: { base: 3, scaling: 'source_skill' },
        resistance: 'cold_resistance'
      },
      interactions: {
        removed_by: ['haste', 'fire_damage'],
        enhanced_by: ['additional_cold_effects'],
        immune_if: ['freedom_of_movement']
      }
    });

    this.registerEffect('knockdown', {
      name: 'Knocked Down',
      type: 'positional_debuff',
      description: 'Target is prone and must spend AP to stand',
      stackable: false,
      tickTiming: 'instant',
      properties: {
        duration: { base: 1, scaling: 'source_skill' },
        standUpCost: 1, // AP cost to stand
        defensePenalty: -4,
        attackPenalty: -2,
        resistance: 'knockdown_resistance'
      },
      interactions: {
        prevented_by: ['stability_stance', 'earth_mastery'],
        auto_stand: ['combat_reflexes_high']
      }
    });

    // MENTAL/FEAR EFFECTS
    this.registerEffect('fear', {
      name: 'Feared',
      type: 'mental_debuff',
      description: 'Target cannot approach source and has combat penalties',
      stackable: false,
      tickTiming: 'persistent',
      properties: {
        duration: { base: 4, scaling: 'source_skill' },
        attackPenalty: -3,
        defensePenalty: -2,
        movementRestriction: 'away_from_source',
        resistance: 'fear_resistance'
      },
      interactions: {
        removed_by: ['courage_buffs', 'high_morale'],
        immune_if: ['fearless', 'undead', 'construct'],
        enhanced_by: ['darkness', 'isolation']
      }
    });

    this.registerEffect('stun', {
      name: 'Stunned',
      type: 'incapacitation',
      description: 'Target cannot take actions for duration',
      stackable: false,
      tickTiming: 'persistent',
      properties: {
        duration: { base: 1, scaling: 'source_skill' },
        actionsPrevented: ['all'],
        defensePenalty: -6,
        resistance: 'stun_resistance'
      },
      interactions: {
        removed_by: ['damage_taken'],
        immune_if: ['stun_immunity', 'undead'],
        enhanced_by: ['repeated_applications']
      }
    });

    // COMBAT ENHANCEMENT EFFECTS
    this.registerEffect('haste', {
      name: 'Haste',
      type: 'enhancement_buff',
      description: 'Target gains extra movement and initiative',
      stackable: false,
      tickTiming: 'persistent',
      properties: {
        duration: { base: 5, scaling: 'source_skill' },
        movementBonus: { base: 2, scaling: 'source_skill' },
        initiativeBonus: { base: 4, scaling: 'source_skill' },
        extraActions: 0 // Could be enhanced later
      },
      interactions: {
        dispelled_by: ['dispel_magic', 'slow'],
        enhanced_by: ['wind_magic', 'lightning_magic']
      }
    });

    // DEFENSIVE EFFECTS
    this.registerEffect('armor_enhancement', {
      name: 'Enhanced Armor',
      type: 'defensive_buff',
      description: 'Magical or temporary armor protection',
      stackable: true,
      maxStacks: 3,
      tickTiming: 'persistent',
      properties: {
        duration: { base: 10, scaling: 'source_skill' },
        armorBonus: { base: 5, scaling: 'source_skill' },
        damageReduction: { base: 2, scaling: 'source_skill' }
      },
      interactions: {
        dispelled_by: ['dispel_magic', 'armor_piercing'],
        stacks_with: ['natural_armor']
      }
    });

    // UTILITY EFFECTS
    this.registerEffect('invisibility', {
      name: 'Invisible',
      type: 'concealment',
      description: 'Target cannot be seen or directly targeted',
      stackable: false,
      tickTiming: 'persistent',
      properties: {
        duration: { base: 6, scaling: 'source_skill' },
        attackBonus: 4, // Surprise attacks
        movementSilent: true,
        resistance: 'true_sight'
      },
      interactions: {
        broken_by: ['attacking', 'loud_actions', 'area_effects'],
        detected_by: ['true_sight', 'detect_invisible'],
        enhanced_by: ['silence', 'darkness']
      }
    });

    this.registerEffect('confusion', {
      name: 'Confused',
      type: 'mental_debuff',
      description: 'Target may act randomly or attack allies',
      stackable: false,
      tickTiming: 'on_action',
      properties: {
        duration: { base: 3, scaling: 'source_skill' },
        randomActionChance: { base: 0.3, scaling: 'source_skill' },
        allyAttackChance: { base: 0.15, scaling: 'source_skill' },
        resistance: 'mental_resistance'
      },
      interactions: {
        removed_by: ['clarity_buffs', 'damage_taken'],
        immune_if: ['mindless', 'undead'],
        enhanced_by: ['mind_magic']
      }
    });

    // MAGICAL EFFECTS
    this.registerEffect('dispel_vulnerability', {
      name: 'Dispel Vulnerable',
      type: 'magical_debuff',
      description: 'Target is vulnerable to dispelling effects',
      stackable: false,
      tickTiming: 'persistent',
      properties: {
        duration: { base: 5, scaling: 'source_skill' },
        dispelSuccessBonus: { base: 0.4, scaling: 'source_skill' },
        magicResistancePenalty: { base: -0.2, scaling: 'source_skill' }
      },
      interactions: {
        triggered_by: ['failed_magic_resistance'],
        removed_by: ['successful_save', 'antimagic']
      }
    });

    // AREA CONTROL EFFECTS
    this.registerEffect('suppression', {
      name: 'Suppressed',
      type: 'area_control',
      description: 'Target has difficulty taking offensive actions',
      stackable: false,
      tickTiming: 'persistent',
      properties: {
        duration: { base: 2, scaling: 'source_skill' },
        attackPenalty: -4,
        spellcastingPenalty: -3,
        movementPenalty: -1,
        resistance: 'courage'
      },
      interactions: {
        area_effect: true,
        removed_by: ['leaving_area', 'courage_buffs'],
        enhanced_by: ['multiple_sources']
      }
    });

    // SPECIAL CONDITIONS
    this.registerEffect('marked', {
      name: 'Marked',
      type: 'tracking_debuff',
      description: 'Target is marked for enhanced tracking and damage',
      stackable: false,
      tickTiming: 'persistent',
      properties: {
        duration: { base: 8, scaling: 'source_skill' },
        damageVulnerability: { base: 0.25, scaling: 'source_skill' },
        stealthPenalty: -6,
        hidingPenalty: -4
      },
      interactions: {
        removed_by: ['dispel_magic', 'certain_distances'],
        enhanced_by: ['tracking_skills', 'hunter_abilities']
      }
    });

    // RESISTANCES (passive effects)
    this.registerEffect('elemental_resistance', {
      name: 'Elemental Resistance',
      type: 'damage_resistance',
      description: 'Reduces damage from elemental sources',
      stackable: true,
      maxStacks: 5,
      tickTiming: 'on_damage',
      properties: {
        duration: { base: 15, scaling: 'source_skill' },
        damageReduction: { base: 0.15, scaling: 'source_skill' },
        elements: ['fire', 'ice', 'lightning', 'earth']
      },
      interactions: {
        stacks_with: ['natural_resistance'],
        bypassed_by: ['penetrating_magic']
      }
    });
  }

  /**
   * Register a new status effect
   */
  registerEffect(key, effectData) {
    this.effects.set(key, {
      key,
      ...effectData,
      registered: Date.now()
    });
  }

  /**
   * Get status effect definition
   */
  getEffect(key) {
    return this.effects.get(key);
  }

  /**
   * Get all effects of a specific type
   */
  getEffectsByType(type) {
    return Array.from(this.effects.values()).filter(effect => effect.type === type);
  }

  /**
   * Check if an effect can stack
   */
  canStack(effectKey, currentStacks = 0) {
    const effect = this.getEffect(effectKey);
    if (!effect) return false;
    
    if (!effect.stackable) return currentStacks === 0;
    return currentStacks < (effect.maxStacks || Infinity);
  }

  /**
   * Calculate effect strength based on source
   */
  calculateEffectStrength(effectKey, sourceEntity, propertyKey) {
    const effect = this.getEffect(effectKey);
    if (!effect || !effect.properties[propertyKey]) return 0;

    const property = effect.properties[propertyKey];
    let value = property.base || 0;

    // Apply scaling if specified
    if (property.scaling && sourceEntity) {
      switch (property.scaling) {
        case 'source_skill':
          // Would need to determine which skill based on ability used
          break;
        case 'source_weapon':
          // Would use weapon damage calculation
          break;
        case 'none':
        default:
          // No scaling
          break;
      }
    }

    return value;
  }

  /**
   * Check if entity has resistance to effect
   */
  hasResistance(entity, effectKey) {
    const effect = this.getEffect(effectKey);
    if (!effect || !effect.properties.resistance) return false;

    const resistanceType = effect.properties.resistance;
    // This would check entity's resistance properties
    return entity.resistances && entity.resistances[resistanceType] > 0;
  }

  /**
   * Get all registered effects
   */
  getAllEffects() {
    return Array.from(this.effects.values());
  }

  /**
   * Get effect summary for debugging
   */
  getEffectSummary() {
    const byType = {};
    for (const effect of this.effects.values()) {
      if (!byType[effect.type]) byType[effect.type] = [];
      byType[effect.type].push(effect.key);
    }
    return byType;
  }
}

// Status effect categories for organization
const STATUS_EFFECT_CATEGORIES = {
  DAMAGE_OVER_TIME: ['burn', 'bleed', 'poison', 'disease'],
  MOVEMENT_DEBUFFS: ['slow', 'knockdown', 'immobilize', 'root'],
  MENTAL_EFFECTS: ['fear', 'charm', 'confusion', 'daze'],
  INCAPACITATION: ['stun', 'paralyze', 'unconscious', 'sleep'],
  ENHANCEMENT_BUFFS: ['haste', 'strength', 'accuracy', 'damage'],
  DEFENSIVE_BUFFS: ['armor_enhancement', 'damage_resistance', 'immunity'],
  CONCEALMENT: ['invisibility', 'stealth', 'blur', 'displacement'],
  MAGICAL_EFFECTS: ['dispel_vulnerability', 'magic_resistance', 'spell_immunity'],
  AREA_CONTROL: ['suppression', 'zone_control', 'battlefield_effect'],
  TRACKING_EFFECTS: ['marked', 'hunter_mark', 'scent_trail'],
  RESISTANCES: ['elemental_resistance', 'physical_resistance', 'mental_resistance']
};

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    StatusEffectRegistry,
    STATUS_EFFECT_CATEGORIES
  };
} else {
  window.StatusEffectRegistry = StatusEffectRegistry;
  window.STATUS_EFFECT_CATEGORIES = STATUS_EFFECT_CATEGORIES;
}