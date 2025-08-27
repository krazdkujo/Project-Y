/**
 * Passive Abilities
 * Always-active abilities that provide constant bonuses
 * Organized by class themes and utility types
 */

// TANK/DEFENSIVE PASSIVES
const TANK_PASSIVES = [
  {
    key: 'stalwart_defender',
    name: 'Stalwart Defender',
    description: 'Your presence inspires nearby allies with defensive confidence',
    type: 'passive',
    category: 'defensive',
    skillRequirements: [{ skill: 'leadership', level: 6 }],
    baseSuccessRate: 100,
    effects: {
      allyDefenseBonus: { base: 0.1, scaling: 'skill' },
      allyFearResistance: { base: 0.3, scaling: 'skill' },
      auraRadius: { base: 3, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'leadership', multiplier: 0.8 },
        { skill: 'intimidation', multiplier: 0.6 }
      ]
    }
  },

  {
    key: 'fortress_stance',
    name: 'Fortress Stance',
    description: 'Immovable defense - take less damage but move slower',
    type: 'passive',
    category: 'defensive',
    skillRequirements: [{ skill: 'shields', level: 8 }],
    baseSuccessRate: 100,
    effects: {
      damageReduction: { base: 0.2, scaling: 'skill' },
      knockbackResistance: { base: 0.8, scaling: 'skill' },
      movementPenalty: { base: -1, scaling: 'none' }
    },
    scaling: {
      effectiveness: [
        { skill: 'shields', multiplier: 0.7 },
        { skill: 'toughness', multiplier: 0.5 }
      ]
    }
  },

  {
    key: 'guardian_instinct',
    name: 'Guardian Instinct',
    description: 'Automatically intercept attacks targeting nearby allies',
    type: 'passive',
    category: 'defensive',
    skillRequirements: [{ skill: 'tactical_combat', level: 10 }],
    baseSuccessRate: 100,
    effects: {
      interceptChance: { base: 0.4, scaling: 'skill' },
      interceptRadius: { base: 2, scaling: 'skill' },
      damageReduction: { base: 0.1, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'tactical_combat', multiplier: 0.8 },
        { skill: 'combat_reflexes', multiplier: 0.7 }
      ]
    }
  },

  {
    key: 'armor_expertise',
    name: 'Armor Expertise',
    description: 'Master-level knowledge of armor reduces all penalties',
    type: 'passive',
    category: 'defensive',
    skillRequirements: [{ skill: 'armor_use', level: 12 }],
    baseSuccessRate: 100,
    effects: {
      armorPenaltyReduction: { base: 0.5, scaling: 'skill' },
      armorEffectivenessBonus: { base: 0.2, scaling: 'skill' },
      repairEfficiency: { base: 0.3, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'armor_use', multiplier: 0.9 },
        { skill: 'repair', multiplier: 0.4 }
      ]
    }
  },

  {
    key: 'immovable_object',
    name: 'Immovable Object',
    description: 'Legendary defensive mastery makes you nearly unshakeable',
    type: 'passive',
    category: 'defensive',
    skillRequirements: [{ skill: 'toughness', level: 18 }],
    baseSuccessRate: 100,
    effects: {
      statusEffectResistance: { base: 0.6, scaling: 'skill' },
      criticalDamageReduction: { base: 0.4, scaling: 'skill' },
      intimidationResistance: { base: 0.8, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'toughness', multiplier: 0.9 },
        { skill: 'iron_will', multiplier: 0.8 }
      ]
    }
  }
];

// DAMAGE/OFFENSIVE PASSIVES
const DAMAGE_PASSIVES = [
  {
    key: 'weapon_focus',
    name: 'Weapon Focus',
    description: 'Specialized training with your preferred weapon type',
    type: 'passive',
    category: 'combat',
    skillRequirements: [{ skill: 'weapon_mastery', level: 4 }],
    baseSuccessRate: 100,
    effects: {
      weaponDamageBonus: { base: 0.15, scaling: 'skill' },
      weaponAccuracyBonus: { base: 0.1, scaling: 'skill' },
      criticalChanceBonus: { base: 0.05, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'weapon_mastery', multiplier: 0.8 },
        { skill: 'precision', multiplier: 0.6 }
      ]
    }
  },

  {
    key: 'berserker_resilience',
    name: 'Berserker Resilience',
    description: 'Taking damage increases your combat effectiveness',
    type: 'passive',
    category: 'combat',
    skillRequirements: [{ skill: 'berserking', level: 6 }],
    baseSuccessRate: 100,
    effects: {
      damagePerHealthLost: { base: 0.02, scaling: 'skill' },
      painResistance: { base: 0.3, scaling: 'skill' },
      lowHealthBonus: { base: 0.5, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'berserking', multiplier: 0.9 },
        { skill: 'toughness', multiplier: 0.5 }
      ]
    }
  },

  {
    key: 'deadly_precision',
    name: 'Deadly Precision',
    description: 'Your attacks have an increased chance to hit vital points',
    type: 'passive',
    category: 'combat',
    skillRequirements: [{ skill: 'critical_strikes', level: 8 }],
    baseSuccessRate: 100,
    effects: {
      criticalChance: { base: 0.1, scaling: 'skill' },
      criticalDamage: { base: 0.2, scaling: 'skill' },
      vulnerabilityDetection: { base: 0.3, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'critical_strikes', multiplier: 0.8 },
        { skill: 'precision', multiplier: 0.7 }
      ]
    }
  },

  {
    key: 'dual_wield_mastery',
    name: 'Dual Wield Mastery',
    description: 'Perfect coordination when fighting with two weapons',
    type: 'passive',
    category: 'combat',
    skillRequirements: [{ skill: 'dual_wielding', level: 10 }],
    baseSuccessRate: 100,
    effects: {
      dualWieldPenaltyReduction: { base: 0.6, scaling: 'skill' },
      offhandDamageBonus: { base: 0.3, scaling: 'skill' },
      multiAttackChance: { base: 0.15, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'dual_wielding', multiplier: 0.9 },
        { skill: 'coordination', multiplier: 0.7 }
      ]
    }
  },

  {
    key: 'legendary_warrior',
    name: 'Legendary Warrior',
    description: 'Your martial prowess is known throughout the land',
    type: 'passive',
    category: 'combat',
    skillRequirements: [{ skill: 'reputation', level: 16 }],
    baseSuccessRate: 100,
    effects: {
      allCombatBonus: { base: 0.25, scaling: 'skill' },
      intimidationAura: { base: 0.4, scaling: 'skill' },
      allyMoraleBonus: { base: 0.2, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'reputation', multiplier: 0.8 },
        { skill: 'leadership', multiplier: 0.6 }
      ]
    }
  }
];

// UTILITY/SKILL PASSIVES
const UTILITY_PASSIVES = [
  {
    key: 'keen_senses',
    name: 'Keen Senses',
    description: 'Enhanced awareness allows you to notice hidden details',
    type: 'passive',
    category: 'utility',
    skillRequirements: [{ skill: 'alertness', level: 3 }],
    baseSuccessRate: 100,
    effects: {
      perceptionBonus: { base: 0.2, scaling: 'skill' },
      trapDetection: { base: 0.3, scaling: 'skill' },
      ambushResistance: { base: 0.25, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'alertness', multiplier: 0.8 },
        { skill: 'intuition', multiplier: 0.6 }
      ]
    }
  },

  {
    key: 'silver_tongue',
    name: 'Silver Tongue',
    description: 'Natural charisma makes all social interactions easier',
    type: 'passive',
    category: 'utility',
    skillRequirements: [{ skill: 'persuasion', level: 5 }],
    baseSuccessRate: 100,
    effects: {
      socialSkillBonus: { base: 0.2, scaling: 'skill' },
      priceReduction: { base: 0.15, scaling: 'skill' },
      reputationGainBonus: { base: 0.3, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'persuasion', multiplier: 0.7 },
        { skill: 'bargaining', multiplier: 0.8 }
      ]
    }
  },

  {
    key: 'nimble_fingers',
    name: 'Nimble Fingers',
    description: 'Dexterous hands excel at delicate manual tasks',
    type: 'passive',
    category: 'utility',
    skillRequirements: [{ skill: 'lockpicking', level: 4 }],
    baseSuccessRate: 100,
    effects: {
      lockpickingBonus: { base: 0.3, scaling: 'skill' },
      pickpocketingBonus: { base: 0.25, scaling: 'skill' },
      craftingSpeedBonus: { base: 0.2, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'lockpicking', multiplier: 0.8 },
        { skill: 'pickpocketing', multiplier: 0.7 }
      ]
    }
  },

  {
    key: 'wilderness_survivor',
    name: 'Wilderness Survivor',
    description: 'Years in the wild have made you adapt to any environment',
    type: 'passive',
    category: 'utility',
    skillRequirements: [{ skill: 'survival', level: 7 }],
    baseSuccessRate: 100,
    effects: {
      environmentalResistance: { base: 0.4, scaling: 'skill' },
      resourceFindingBonus: { base: 0.3, scaling: 'skill' },
      movementBonusNature: { base: 0.2, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'survival', multiplier: 0.8 },
        { skill: 'wilderness_lore', multiplier: 0.6 }
      ]
    }
  },

  {
    key: 'master_craftsman',
    name: 'Master Craftsman',
    description: 'Your expertise in creation is recognized by all',
    type: 'passive',
    category: 'utility',
    skillRequirements: [{ skill: 'blacksmithing', level: 12 }],
    baseSuccessRate: 100,
    effects: {
      craftingQualityBonus: { base: 0.3, scaling: 'skill' },
      materialEfficiency: { base: 0.2, scaling: 'skill' },
      durabilityBonus: { base: 0.4, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'blacksmithing', multiplier: 0.8 },
        { skill: 'repair', multiplier: 0.6 }
      ]
    }
  }
];

// MAGICAL PASSIVES
const MAGICAL_PASSIVES = [
  {
    key: 'arcane_efficiency',
    name: 'Arcane Efficiency',
    description: 'Careful study reduces the AP cost of all magic abilities',
    type: 'passive',
    category: 'magic',
    skillRequirements: [{ skill: 'concentration', level: 5 }],
    baseSuccessRate: 100,
    effects: {
      magicAPReduction: { base: 0.15, scaling: 'skill' },
      concentrationBonus: { base: 0.2, scaling: 'skill' },
      spellFocusBonus: { base: 0.1, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'concentration', multiplier: 0.8 },
        { skill: 'meditation', multiplier: 0.6 }
      ]
    }
  },

  {
    key: 'spell_penetration',
    name: 'Spell Penetration',
    description: 'Your magic pierces through enemy resistances',
    type: 'passive',
    category: 'magic',
    skillRequirements: [{ skill: 'dispelling', level: 6 }],
    baseSuccessRate: 100,
    effects: {
      magicResistancePenetration: { base: 0.3, scaling: 'skill' },
      spellAccuracyBonus: { base: 0.15, scaling: 'skill' },
      counterSpellChance: { base: 0.1, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'dispelling', multiplier: 0.8 },
        { skill: 'arcane_lore', multiplier: 0.6 }
      ]
    }
  },

  {
    key: 'elemental_affinity',
    name: 'Elemental Affinity',
    description: 'Deep connection to elemental forces enhances all elemental magic',
    type: 'passive',
    category: 'magic',
    skillRequirements: [{ skill: 'elemental_fire', level: 8 }],
    baseSuccessRate: 100,
    effects: {
      elementalDamageBonus: { base: 0.2, scaling: 'skill' },
      elementalResistance: { base: 0.25, scaling: 'skill' },
      elementalCostReduction: { base: 0.1, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'elemental_fire', multiplier: 0.6 },
        { skill: 'elemental_ice', multiplier: 0.6 },
        { skill: 'elemental_lightning', multiplier: 0.6 },
        { skill: 'elemental_earth', multiplier: 0.6 }
      ]
    }
  },

  {
    key: 'arcane_sight',
    name: 'Arcane Sight',
    description: 'See magical auras and detect hidden enchantments',
    type: 'passive',
    category: 'magic',
    skillRequirements: [{ skill: 'aura_sight', level: 6 }],
    baseSuccessRate: 100,
    effects: {
      magicDetection: { base: 0.8, scaling: 'skill' },
      illusionResistance: { base: 0.4, scaling: 'skill' },
      enchantmentIdentification: { base: 0.6, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'aura_sight', multiplier: 0.8 },
        { skill: 'arcane_lore', multiplier: 0.7 }
      ]
    }
  },

  {
    key: 'metamagic_mastery',
    name: 'Metamagic Mastery',
    description: 'Instinctively modify spells for greater effectiveness',
    type: 'passive',
    category: 'magic',
    skillRequirements: [{ skill: 'metamagic', level: 14 }],
    baseSuccessRate: 100,
    effects: {
      spellModificationChance: { base: 0.3, scaling: 'skill' },
      bonusSpellEffects: { base: 0.25, scaling: 'skill' },
      metamagicEfficiency: { base: 0.4, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'metamagic', multiplier: 0.9 },
        { skill: 'concentration', multiplier: 0.7 }
      ]
    }
  }
];

// LEADERSHIP/SUPPORT PASSIVES
const LEADERSHIP_PASSIVES = [
  {
    key: 'inspiring_presence',
    name: 'Inspiring Presence',
    description: 'Your presence on the battlefield motivates allies',
    type: 'passive',
    category: 'support',
    skillRequirements: [{ skill: 'leadership', level: 4 }],
    baseSuccessRate: 100,
    effects: {
      allyDamageBonus: { base: 0.1, scaling: 'skill' },
      allyAccuracyBonus: { base: 0.08, scaling: 'skill' },
      auraRadius: { base: 4, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'leadership', multiplier: 0.8 },
        { skill: 'entertainment', multiplier: 0.5 }
      ]
    }
  },

  {
    key: 'tactical_mind',
    name: 'Tactical Mind',
    description: 'Strategic thinking provides battlefield advantages',
    type: 'passive',
    category: 'support',
    skillRequirements: [{ skill: 'military_tactics', level: 8 }],
    baseSuccessRate: 100,
    effects: {
      initiativeBonus: { base: 3, scaling: 'skill' },
      groupCoordinationBonus: { base: 0.2, scaling: 'skill' },
      ambushDetection: { base: 0.4, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'military_tactics', multiplier: 0.8 },
        { skill: 'logic', multiplier: 0.6 }
      ]
    }
  },

  {
    key: 'field_medic',
    name: 'Field Medic',
    description: 'Battlefield experience makes healing more effective',
    type: 'passive',
    category: 'support',
    skillRequirements: [{ skill: 'healing', level: 6 }],
    baseSuccessRate: 100,
    effects: {
      healingEffectivenessBonus: { base: 0.25, scaling: 'skill' },
      statusCureChance: { base: 0.3, scaling: 'skill' },
      emergencyHealingBonus: { base: 0.4, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'healing', multiplier: 0.8 },
        { skill: 'herbalism', multiplier: 0.6 }
      ]
    }
  },

  {
    key: 'battle_commander',
    name: 'Battle Commander',
    description: 'Legendary leadership skills inspire greatness in others',
    type: 'passive',
    category: 'support',
    skillRequirements: [{ skill: 'leadership', level: 16 }],
    baseSuccessRate: 100,
    effects: {
      massiveGroupBonus: { base: 0.3, scaling: 'skill' },
      fearImmunityAura: { base: 1, scaling: 'none' },
      tacticalSupremacy: { base: 0.5, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'leadership', multiplier: 0.9 },
        { skill: 'military_tactics', multiplier: 0.8 }
      ]
    }
  }
];

// STEALTH/MOBILITY PASSIVES
const STEALTH_PASSIVES = [
  {
    key: 'shadow_walker',
    name: 'Shadow Walker',
    description: 'Move unseen through darkness and shadows',
    type: 'passive',
    category: 'stealth',
    skillRequirements: [{ skill: 'sneaking', level: 5 }],
    baseSuccessRate: 100,
    effects: {
      stealthBonus: { base: 0.3, scaling: 'skill' },
      darknessMovementBonus: { base: 0.4, scaling: 'skill' },
      soundReduction: { base: 0.5, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'sneaking', multiplier: 0.8 },
        { skill: 'shadow_step', multiplier: 0.7 }
      ]
    }
  },

  {
    key: 'fleet_footed',
    name: 'Fleet Footed',
    description: 'Exceptional speed and agility in movement',
    type: 'passive',
    category: 'mobility',
    skillRequirements: [{ skill: 'running', level: 6 }],
    baseSuccessRate: 100,
    effects: {
      movementSpeed: { base: 1, scaling: 'skill' },
      evasionBonus: { base: 0.15, scaling: 'skill' },
      chaseEffectiveness: { base: 0.3, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'running', multiplier: 0.8 },
        { skill: 'athletics', multiplier: 0.6 }
      ]
    }
  },

  {
    key: 'acrobatic_fighter',
    name: 'Acrobatic Fighter',
    description: 'Combat mobility and flexibility provide defensive advantages',
    type: 'passive',
    category: 'mobility',
    skillRequirements: [{ skill: 'acrobatics', level: 8 }],
    baseSuccessRate: 100,
    effects: {
      dodgeBonus: { base: 0.2, scaling: 'skill' },
      terrainIgnore: { base: 0.6, scaling: 'skill' },
      repositioningBonus: { base: 0.3, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'acrobatics', multiplier: 0.8 },
        { skill: 'balance', multiplier: 0.7 }
      ]
    }
  },

  {
    key: 'master_thief',
    name: 'Master Thief',
    description: 'Legendary skills in theft and infiltration',
    type: 'passive',
    category: 'stealth',
    skillRequirements: [{ skill: 'pickpocketing', level: 15 }],
    baseSuccessRate: 100,
    effects: {
      stealthMastery: { base: 0.5, scaling: 'skill' },
      lockpickingMastery: { base: 0.6, scaling: 'skill' },
      treasureFindingBonus: { base: 0.4, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'pickpocketing', multiplier: 0.7 },
        { skill: 'lockpicking', multiplier: 0.8 }
      ]
    }
  }
];

// MENTAL/WISDOM PASSIVES
const MENTAL_PASSIVES = [
  {
    key: 'iron_mind',
    name: 'Iron Mind',
    description: 'Mental fortitude protects against psychological effects',
    type: 'passive',
    category: 'mental',
    skillRequirements: [{ skill: 'iron_will', level: 4 }],
    baseSuccessRate: 100,
    effects: {
      mentalResistance: { base: 0.3, scaling: 'skill' },
      fearResistance: { base: 0.4, scaling: 'skill' },
      charmResistance: { base: 0.35, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'iron_will', multiplier: 0.8 },
        { skill: 'meditation', multiplier: 0.6 }
      ]
    }
  },

  {
    key: 'quick_learner',
    name: 'Quick Learner',
    description: 'Rapid comprehension allows faster skill development',
    type: 'passive',
    category: 'mental',
    skillRequirements: [{ skill: 'quick_thinking', level: 6 }],
    baseSuccessRate: 100,
    effects: {
      xpGainBonus: { base: 0.2, scaling: 'skill' },
      skillLearningSpeed: { base: 0.25, scaling: 'skill' },
      memoryBonus: { base: 0.3, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'quick_thinking', multiplier: 0.8 },
        { skill: 'memory', multiplier: 0.7 }
      ]
    }
  },

  {
    key: 'scholars_insight',
    name: "Scholar's Insight",
    description: 'Deep learning provides understanding of complex topics',
    type: 'passive',
    category: 'mental',
    skillRequirements: [{ skill: 'arcane_lore', level: 10 }],
    baseSuccessRate: 100,
    effects: {
      knowledgeSkillBonus: { base: 0.3, scaling: 'skill' },
      researchEfficiency: { base: 0.4, scaling: 'skill' },
      patternRecognition: { base: 0.35, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'arcane_lore', multiplier: 0.6 },
        { skill: 'history', multiplier: 0.6 },
        { skill: 'monster_lore', multiplier: 0.6 }
      ]
    }
  },

  {
    key: 'zen_master',
    name: 'Zen Master',
    description: 'Perfect mental balance enhances all aspects of performance',
    type: 'passive',
    category: 'mental',
    skillRequirements: [{ skill: 'meditation', level: 18 }],
    baseSuccessRate: 100,
    effects: {
      universalBonus: { base: 0.15, scaling: 'skill' },
      stressImmunity: { base: 1, scaling: 'none' },
      innerPeace: { base: 0.5, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'meditation', multiplier: 0.9 },
        { skill: 'wisdom', multiplier: 0.8 }
      ]
    }
  }
];

// LUCK/FORTUNE PASSIVES
const LUCK_PASSIVES = [
  {
    key: 'lucky_break',
    name: 'Lucky Break',
    description: 'Fortune favors you in small but meaningful ways',
    type: 'passive',
    category: 'luck',
    skillRequirements: [{ skill: 'fortune', level: 3 }],
    baseSuccessRate: 100,
    effects: {
      criticalLuckBonus: { base: 0.1, scaling: 'skill' },
      lootFindingBonus: { base: 0.15, scaling: 'skill' },
      avoidBadLuck: { base: 0.2, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'fortune', multiplier: 0.8 },
        { skill: 'serendipity', multiplier: 0.7 }
      ]
    }
  },

  {
    key: 'uncanny_luck',
    name: 'Uncanny Luck',
    description: 'Supernatural fortune bends probability in your favor',
    type: 'passive',
    category: 'luck',
    skillRequirements: [{ skill: 'fate_manipulation', level: 12 }],
    baseSuccessRate: 100,
    effects: {
      rerollChance: { base: 0.1, scaling: 'skill' },
      miracleSave: { base: 0.05, scaling: 'skill' },
      destinyPoints: { base: 1, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'fate_manipulation', multiplier: 0.9 },
        { skill: 'karmic_balance', multiplier: 0.8 }
      ]
    }
  }
];

// Combine all passive abilities
const PASSIVE_ABILITIES = [
  ...TANK_PASSIVES,
  ...DAMAGE_PASSIVES,
  ...UTILITY_PASSIVES,
  ...MAGICAL_PASSIVES,
  ...LEADERSHIP_PASSIVES,
  ...STEALTH_PASSIVES,
  ...MENTAL_PASSIVES,
  ...LUCK_PASSIVES
];

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PASSIVE_ABILITIES,
    TANK_PASSIVES,
    DAMAGE_PASSIVES,
    UTILITY_PASSIVES,
    MAGICAL_PASSIVES,
    LEADERSHIP_PASSIVES,
    STEALTH_PASSIVES,
    MENTAL_PASSIVES,
    LUCK_PASSIVES
  };
} else {
  window.PASSIVE_ABILITIES = PASSIVE_ABILITIES;
  window.TANK_PASSIVES = TANK_PASSIVES;
  window.DAMAGE_PASSIVES = DAMAGE_PASSIVES;
  window.UTILITY_PASSIVES = UTILITY_PASSIVES;
  window.MAGICAL_PASSIVES = MAGICAL_PASSIVES;
  window.LEADERSHIP_PASSIVES = LEADERSHIP_PASSIVES;
  window.STEALTH_PASSIVES = STEALTH_PASSIVES;
  window.MENTAL_PASSIVES = MENTAL_PASSIVES;
  window.LUCK_PASSIVES = LUCK_PASSIVES;
}