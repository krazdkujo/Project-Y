/**
 * Defensive Combat Abilities
 * Active and passive abilities for defensive skills
 */

// Shield Abilities
const SHIELD_ABILITIES = [
  {
    key: 'shield_bash',
    name: 'Shield Bash',
    description: 'Strike with your shield to damage and stun the enemy',
    type: 'active',
    category: 'defensive',
    apCost: 2,
    range: 1,
    cooldown: 2,
    requiresTarget: true,
    skillRequirements: [{ skill: 'shields', level: 1 }],
    prerequisites: [],
    baseSuccessRate: 0,
    effects: {
      damage: { base: 0.8, scaling: 'shield' },
      stunChance: { base: 0.3, scaling: 'skill' },
      stunDuration: { base: 1, scaling: 'skill' },
      accuracy: { base: 0.75, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'shields', multiplier: 2.5 },
        { skill: 'strength', multiplier: 1.8 },
        { skill: 'intimidation', multiplier: 1.2 }
      ]
    }
  },

  {
    key: 'shield_wall',
    name: 'Shield Wall',
    description: 'Raise your shield to block incoming attacks and protect allies behind you',
    type: 'active',
    category: 'defensive',
    apCost: 2,
    range: 0,
    cooldown: 3,
    requiresTarget: false,
    skillRequirements: [{ skill: 'shields', level: 5 }],
    prerequisites: ['shield_bash'],
    baseSuccessRate: 10,
    effects: {
      blockChance: { base: 0.7, scaling: 'skill' },
      allyProtection: { base: 0.5, scaling: 'skill' },
      duration: { base: 3, scaling: 'skill' },
      damageReduction: { base: 0.3, scaling: 'shield' }
    },
    scaling: {
      effectiveness: [
        { skill: 'shields', multiplier: 2.8 },
        { skill: 'tactical_combat', multiplier: 2.0 },
        { skill: 'leadership', multiplier: 1.5 }
      ]
    }
  },

  {
    key: 'shield_mastery',
    name: 'Shield Mastery',
    description: 'Expert shield use provides constant protection and counterattack opportunities',
    type: 'passive',
    category: 'defensive',
    skillRequirements: [{ skill: 'shields', level: 8 }],
    prerequisites: [],
    baseSuccessRate: 100,
    effects: {
      blockChanceBonus: { base: 0.15, scaling: 'skill' },
      counterattackChance: { base: 0.1, scaling: 'skill' },
      apEfficiency: { base: 0.2, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'shields', multiplier: 0.6 },
        { skill: 'riposte', multiplier: 0.8 }
      ]
    }
  }
];

// Parrying Abilities
const PARRYING_ABILITIES = [
  {
    key: 'parry',
    name: 'Parry',
    description: 'Deflect an incoming attack with your weapon',
    type: 'active',
    category: 'defensive',
    apCost: 1,
    range: 0,
    cooldown: 0, // Reaction ability
    requiresTarget: false,
    skillRequirements: [{ skill: 'parrying', level: 1 }],
    prerequisites: [],
    baseSuccessRate: -5,
    effects: {
      parryChance: { base: 0.4, scaling: 'skill' },
      staggerChance: { base: 0.2, scaling: 'skill' }, // Stagger attacker
      damageReduction: { base: 1.0, scaling: 'none' } // Full damage negation
    },
    scaling: {
      effectiveness: [
        { skill: 'parrying', multiplier: 3.0 },
        { skill: 'combat_reflexes', multiplier: 2.2 },
        { skill: 'weapon_mastery', multiplier: 1.8 }
      ]
    }
  },

  {
    key: 'riposte',
    name: 'Riposte',
    description: 'After a successful parry, immediately counterattack',
    type: 'active',
    category: 'defensive',
    apCost: 2,
    range: 1,
    cooldown: 1,
    requiresTarget: true,
    skillRequirements: [{ skill: 'riposte', level: 3 }],
    prerequisites: ['parry'],
    baseSuccessRate: -10,
    effects: {
      damage: { base: 1.3, scaling: 'weapon' },
      accuracy: { base: 0.8, scaling: 'skill' }, // Higher accuracy after parry
      criticalChance: { base: 0.25, scaling: 'skill' },
      mustFollowParry: { base: 1, scaling: 'none' }
    },
    scaling: {
      effectiveness: [
        { skill: 'riposte', multiplier: 2.8 },
        { skill: 'parrying', multiplier: 2.0 },
        { skill: 'critical_strikes', multiplier: 1.5 }
      ]
    }
  },

  {
    key: 'perfect_parry',
    name: 'Perfect Parry',
    description: 'A flawless defensive technique that negates all damage and opens the enemy',
    type: 'active',
    category: 'defensive',
    apCost: 3,
    range: 0,
    cooldown: 5,
    requiresTarget: false,
    skillRequirements: [{ skill: 'parrying', level: 15 }],
    prerequisites: ['riposte'],
    baseSuccessRate: -30,
    effects: {
      parryChance: { base: 0.95, scaling: 'skill' },
      enemyVulnerabilityDuration: { base: 2, scaling: 'skill' },
      staggerGuaranteed: { base: 1, scaling: 'none' },
      riposteBonus: { base: 0.5, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'parrying', multiplier: 3.5 },
        { skill: 'weapon_mastery', multiplier: 2.5 },
        { skill: 'timing', multiplier: 2.8 }
      ]
    }
  }
];

// Dodging Abilities
const DODGING_ABILITIES = [
  {
    key: 'dodge_roll',
    name: 'Dodge Roll',
    description: 'Roll away from danger to avoid attacks and reposition',
    type: 'active',
    category: 'defensive',
    apCost: 2,
    range: 2,
    cooldown: 2,
    requiresTarget: false,
    skillRequirements: [{ skill: 'dodging', level: 1 }],
    prerequisites: [],
    baseSuccessRate: 20, // Easier than parrying
    effects: {
      dodgeChance: { base: 0.6, scaling: 'skill' },
      movement: { base: 2, scaling: 'skill' },
      temporaryEvasion: { base: 0.2, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'dodging', multiplier: 2.8 },
        { skill: 'acrobatics', multiplier: 2.5 },
        { skill: 'athletics', multiplier: 1.8 }
      ]
    }
  },

  {
    key: 'evasive_maneuvers',
    name: 'Evasive Maneuvers',
    description: 'Constant movement makes you harder to hit for several turns',
    type: 'active',
    category: 'defensive',
    apCost: 3,
    range: 0,
    cooldown: 4,
    requiresTarget: false,
    skillRequirements: [{ skill: 'dodging', level: 8 }],
    prerequisites: ['dodge_roll'],
    baseSuccessRate: -5,
    effects: {
      evasionBonus: { base: 0.3, scaling: 'skill' },
      duration: { base: 4, scaling: 'skill' },
      movementBonus: { base: 1, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'dodging', multiplier: 2.5 },
        { skill: 'athletics', multiplier: 2.0 },
        { skill: 'combat_reflexes', multiplier: 2.2 }
      ]
    }
  },

  {
    key: 'uncanny_dodge',
    name: 'Uncanny Dodge',
    description: 'Supernatural reflexes allow you to avoid attacks you cannot see',
    type: 'passive',
    category: 'defensive',
    skillRequirements: [{ skill: 'dodging', level: 12 }],
    prerequisites: [],
    baseSuccessRate: 100,
    effects: {
      surpriseAttackReduction: { base: 0.5, scaling: 'skill' },
      backstabReduction: { base: 0.4, scaling: 'skill' },
      ambushWarning: { base: 0.3, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'dodging', multiplier: 0.8 },
        { skill: 'danger_sense', multiplier: 0.9 },
        { skill: 'intuition', multiplier: 0.6 }
      ]
    }
  }
];

// Toughness Abilities
const TOUGHNESS_ABILITIES = [
  {
    key: 'endure_pain',
    name: 'Endure Pain',
    description: 'Shrug off damage through sheer willpower',
    type: 'active',
    category: 'defensive',
    apCost: 2,
    range: 0,
    cooldown: 3,
    requiresTarget: false,
    skillRequirements: [{ skill: 'toughness', level: 1 }],
    prerequisites: [],
    baseSuccessRate: 25,
    effects: {
      damageReduction: { base: 0.3, scaling: 'skill' },
      duration: { base: 3, scaling: 'skill' },
      painImmunity: { base: 1, scaling: 'none' }
    },
    scaling: {
      effectiveness: [
        { skill: 'toughness', multiplier: 2.5 },
        { skill: 'iron_will', multiplier: 2.8 },
        { skill: 'endurance', multiplier: 2.0 }
      ]
    }
  },

  {
    key: 'damage_resistance',
    name: 'Damage Resistance',
    description: 'Your body naturally resists physical harm',
    type: 'passive',
    category: 'defensive',
    skillRequirements: [{ skill: 'toughness', level: 6 }],
    prerequisites: [],
    baseSuccessRate: 100,
    effects: {
      physicalDamageReduction: { base: 0.1, scaling: 'skill' },
      criticalDamageReduction: { base: 0.15, scaling: 'skill' },
      statusResistance: { base: 0.2, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'toughness', multiplier: 0.5 },
        { skill: 'endurance', multiplier: 0.4 }
      ]
    }
  }
];

// Armor Use Abilities
const ARMOR_ABILITIES = [
  {
    key: 'armor_expertise',
    name: 'Armor Expertise',
    description: 'Skilled use of armor reduces penalties and increases protection',
    type: 'passive',
    category: 'defensive',
    skillRequirements: [{ skill: 'armor_use', level: 1 }],
    prerequisites: [],
    baseSuccessRate: 100,
    effects: {
      armorPenaltyReduction: { base: 0.2, scaling: 'skill' },
      armorEffectivenessBonus: { base: 0.1, scaling: 'skill' },
      comfortBonus: { base: 0.1, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'armor_use', multiplier: 0.8 },
        { skill: 'endurance', multiplier: 0.3 }
      ]
    }
  },

  {
    key: 'heavy_armor_mastery',
    name: 'Heavy Armor Mastery',
    description: 'Master the use of the heaviest armor with minimal penalties',
    type: 'passive',
    category: 'defensive',
    skillRequirements: [{ skill: 'armor_use', level: 10 }],
    prerequisites: ['armor_expertise'],
    baseSuccessRate: 100,
    effects: {
      heavyArmorPenaltyNegation: { base: 0.5, scaling: 'skill' },
      heavyArmorBonusIncrease: { base: 0.3, scaling: 'skill' },
      intimidationBonus: { base: 0.2, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'armor_use', multiplier: 0.7 },
        { skill: 'strength', multiplier: 0.5 },
        { skill: 'intimidation', multiplier: 0.4 }
      ]
    }
  }
];

// Last Stand Abilities
const LAST_STAND_ABILITIES = [
  {
    key: 'last_stand',
    name: 'Last Stand',
    description: 'When near death, fight with desperate strength and resilience',
    type: 'active',
    category: 'defensive',
    apCost: 0, // Emergency ability
    range: 0,
    cooldown: 0,
    requiresTarget: false,
    skillRequirements: [{ skill: 'last_stand', level: 5 }],
    prerequisites: [],
    baseSuccessRate: 40, // Only when below 25% health
    effects: {
      damageBonus: { base: 0.5, scaling: 'skill' },
      damageReduction: { base: 0.3, scaling: 'skill' },
      apRegeneration: { base: 1, scaling: 'skill' },
      duration: { base: 5, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'last_stand', multiplier: 2.8 },
        { skill: 'iron_will', multiplier: 2.5 },
        { skill: 'berserking', multiplier: 2.0 }
      ]
    },
    tags: ['emergency', 'low_health_only']
  }
];

// Combine all defensive abilities
const DEFENSIVE_ABILITIES = [
  ...SHIELD_ABILITIES,
  ...PARRYING_ABILITIES,
  ...DODGING_ABILITIES,
  ...TOUGHNESS_ABILITIES,
  ...ARMOR_ABILITIES,
  ...LAST_STAND_ABILITIES
];

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DEFENSIVE_ABILITIES,
    SHIELD_ABILITIES,
    PARRYING_ABILITIES,
    DODGING_ABILITIES,
    TOUGHNESS_ABILITIES,
    ARMOR_ABILITIES,
    LAST_STAND_ABILITIES
  };
} else {
  window.DEFENSIVE_ABILITIES = DEFENSIVE_ABILITIES;
  window.SHIELD_ABILITIES = SHIELD_ABILITIES;
  window.PARRYING_ABILITIES = PARRYING_ABILITIES;
  window.DODGING_ABILITIES = DODGING_ABILITIES;
  window.TOUGHNESS_ABILITIES = TOUGHNESS_ABILITIES;
  window.ARMOR_ABILITIES = ARMOR_ABILITIES;
  window.LAST_STAND_ABILITIES = LAST_STAND_ABILITIES;
}