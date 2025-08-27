/**
 * Melee Combat Abilities
 * Active and passive abilities for close-combat skills
 */

// One-Handed Weapon Abilities
const ONE_HANDED_ABILITIES = [
  // Level 1 - Basic technique
  {
    key: 'precise_strike',
    name: 'Precise Strike',
    description: 'A careful attack aimed at weak points, trading power for accuracy',
    type: 'active',
    category: 'combat',
    apCost: 2,

    range: 1,
    cooldown: 1,
    requiresTarget: true,
    skillRequirements: [{ skill: 'one_handed', level: 1 }],
    prerequisites: [],
    baseSuccessRate: -10, // Poor base rate, needs skill investment
    effects: {
      damage: { base: 0.8, scaling: 'weapon' }, // Slightly less damage
      accuracy: { base: 0.9, scaling: 'skill' }, // Much higher accuracy
      criticalChance: { base: 0.15, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'one_handed', multiplier: 3.0 },
        { skill: 'precision', multiplier: 2.0 },
        { skill: 'critical_strikes', multiplier: 1.5 }
      ],
      apReduction: [
        { skill: 'one_handed', levelsPer: 15, reduction: 1 }
      ]
    }
  },

  // Level 5 - Power technique
  {
    key: 'power_strike',
    name: 'Power Strike',
    description: 'A devastating overhead blow that deals massive damage',
    type: 'active',
    category: 'combat',
    apCost: 3,

    range: 1,
    cooldown: 2,
    requiresTarget: true,
    skillRequirements: [{ skill: 'one_handed', level: 5 }],
    prerequisites: ['precise_strike'],
    baseSuccessRate: -25,
    effects: {
      damage: { base: 1.8, scaling: 'weapon' },
      accuracy: { base: 0.6, scaling: 'skill' },
      armorPiercing: { base: 0.3, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'one_handed', multiplier: 2.5 },
        { skill: 'strength', multiplier: 1.8 },
        { skill: 'weapon_mastery', multiplier: 2.0 }
      ],
      apReduction: [
        { skill: 'one_handed', levelsPer: 10, reduction: 1 }
      ]
    }
  },

  // Level 10 - Advanced technique
  {
    key: 'whirlwind_strike',
    name: 'Whirlwind Strike',
    description: 'Attack all adjacent enemies with a spinning motion',
    type: 'active',
    category: 'combat',
    apCost: 4,

    range: 1,
    cooldown: 4,
    requiresTarget: false, // Hits all adjacent
    skillRequirements: [{ skill: 'one_handed', level: 10 }],
    prerequisites: ['power_strike'],
    baseSuccessRate: -35,
    effects: {
      damage: { base: 1.2, scaling: 'weapon' },
      areaEffect: { base: 1, scaling: 'none' }, // Hits all adjacent
      accuracy: { base: 0.7, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'one_handed', multiplier: 2.2 },
        { skill: 'acrobatics', multiplier: 1.5 },
        { skill: 'coordination', multiplier: 1.8 }
      ]
    }
  },

  // Passive - Weapon familiarity
  {
    key: 'one_handed_mastery',
    name: 'One-Handed Mastery',
    description: 'Increased damage and accuracy with one-handed weapons',
    type: 'passive',
    category: 'combat',
    skillRequirements: [{ skill: 'one_handed', level: 8 }],
    prerequisites: [],
    baseSuccessRate: 100, // Passives always work
    effects: {
      weaponDamageBonus: { base: 0.1, scaling: 'skill' }, // 10% + scaling
      weaponAccuracyBonus: { base: 0.05, scaling: 'skill' },
      criticalChanceBonus: { base: 0.02, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'one_handed', multiplier: 0.5 }, // Passive scaling is gentler
        { skill: 'weapon_mastery', multiplier: 0.3 }
      ]
    }
  }
];

// Two-Handed Weapon Abilities
const TWO_HANDED_ABILITIES = [
  {
    key: 'heavy_swing',
    name: 'Heavy Swing',
    description: 'A slow but devastating two-handed attack',
    type: 'active',
    category: 'combat',
    apCost: 3,

    range: 1,
    cooldown: 1,
    requiresTarget: true,
    skillRequirements: [{ skill: 'two_handed', level: 1 }],
    prerequisites: [],
    baseSuccessRate: -15,
    effects: {
      damage: { base: 2.2, scaling: 'weapon' },
      accuracy: { base: 0.5, scaling: 'skill' },
      knockback: { base: 1, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'two_handed', multiplier: 2.8 },
        { skill: 'strength', multiplier: 2.2 }
      ],
      apReduction: [
        { skill: 'two_handed', levelsPer: 12, reduction: 1 }
      ]
    }
  },

  {
    key: 'cleave',
    name: 'Cleave',
    description: 'Strike through your target to hit enemies behind them',
    type: 'active',
    category: 'combat',
    apCost: 4,

    range: 1,
    cooldown: 3,
    requiresTarget: true,
    skillRequirements: [{ skill: 'two_handed', level: 8 }],
    prerequisites: ['heavy_swing'],
    baseSuccessRate: -20,
    effects: {
      damage: { base: 1.5, scaling: 'weapon' },
      cleaveTargets: { base: 2, scaling: 'skill' }, // Hits additional targets
      accuracy: { base: 0.65, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'two_handed', multiplier: 2.5 },
        { skill: 'weapon_mastery', multiplier: 1.8 }
      ]
    }
  },

  {
    key: 'two_handed_mastery',
    name: 'Two-Handed Mastery',
    description: 'Expertise with large weapons grants damage and improves AP efficiency',
    type: 'passive',
    category: 'combat',
    skillRequirements: [{ skill: 'two_handed', level: 6 }],
    prerequisites: [],
    baseSuccessRate: 100,
    effects: {
      weaponDamageBonus: { base: 0.15, scaling: 'skill' },
      apCostReduction: { base: 0.1, scaling: 'skill' },
      knockbackBonus: { base: 0.5, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'two_handed', multiplier: 0.6 },
        { skill: 'strength', multiplier: 0.4 }
      ]
    }
  }
];

// Dual Wielding Abilities
const DUAL_WIELDING_ABILITIES = [
  {
    key: 'dual_strike',
    name: 'Dual Strike',
    description: 'Attack with both weapons simultaneously',
    type: 'active',
    category: 'combat',
    apCost: 3,

    range: 1,
    cooldown: 2,
    requiresTarget: true,
    skillRequirements: [{ skill: 'dual_wielding', level: 1 }],
    prerequisites: [],
    baseSuccessRate: -30, // Very hard to master
    effects: {
      damage: { base: 1.6, scaling: 'weapon' }, // Both weapons
      accuracy: { base: 0.4, scaling: 'skill' }, // Much harder to hit
      multiHit: { base: 2, scaling: 'none' } // Two separate attacks
    },
    scaling: {
      effectiveness: [
        { skill: 'dual_wielding', multiplier: 3.5 },
        { skill: 'coordination', multiplier: 2.5 },
        { skill: 'combat_reflexes', multiplier: 1.5 }
      ]
    }
  },

  {
    key: 'flurry',
    name: 'Flurry',
    description: 'A rapid series of light attacks with both weapons',
    type: 'active',
    category: 'combat',
    apCost: 5,

    range: 1,
    cooldown: 4,
    requiresTarget: true,
    skillRequirements: [{ skill: 'dual_wielding', level: 12 }],
    prerequisites: ['dual_strike'],
    baseSuccessRate: -40,
    effects: {
      damage: { base: 0.8, scaling: 'weapon' },
      multiHit: { base: 4, scaling: 'skill' }, // Up to 6-7 hits with high skill
      accuracy: { base: 0.6, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'dual_wielding', multiplier: 3.0 },
        { skill: 'quick_thinking', multiplier: 2.0 },
        { skill: 'combat_reflexes', multiplier: 2.8 }
      ]
    }
  }
];

// Unarmed Combat Abilities  
const UNARMED_ABILITIES = [
  {
    key: 'punch',
    name: 'Punch',
    description: 'A basic unarmed strike using your fists',
    type: 'active',
    category: 'combat',
    apCost: 1,

    range: 1,
    cooldown: 0,
    requiresTarget: true,
    skillRequirements: [{ skill: 'unarmed', level: 1 }],
    prerequisites: [],
    baseSuccessRate: 10, // Better than weapons for beginners
    effects: {
      damage: { base: 0.6, scaling: 'strength' }, // Lower base damage
      accuracy: { base: 0.75, scaling: 'skill' },
      stunChance: { base: 0.05, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'unarmed', multiplier: 2.8 },
        { skill: 'strength', multiplier: 1.8 }
      ]
    }
  },

  {
    key: 'grapple',
    name: 'Grapple',
    description: 'Grab and restrain an opponent, preventing their actions',
    type: 'active',
    category: 'combat',
    apCost: 2,

    range: 1,
    cooldown: 2,
    requiresTarget: true,
    skillRequirements: [{ skill: 'unarmed', level: 5 }],
    prerequisites: ['punch'],
    baseSuccessRate: -15,
    effects: {
      restrainDuration: { base: 2, scaling: 'skill' }, // Turns restrained
      damage: { base: 0.3, scaling: 'strength' }, // Minimal damage
      accuracy: { base: 0.6, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'unarmed', multiplier: 2.2 },
        { skill: 'strength', multiplier: 2.0 },
        { skill: 'athletics', multiplier: 1.5 }
      ]
    }
  }
];

// Combine all melee abilities
const MELEE_ABILITIES = [
  ...ONE_HANDED_ABILITIES,
  ...TWO_HANDED_ABILITIES, 
  ...DUAL_WIELDING_ABILITIES,
  ...UNARMED_ABILITIES
];

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MELEE_ABILITIES,
    ONE_HANDED_ABILITIES,
    TWO_HANDED_ABILITIES,
    DUAL_WIELDING_ABILITIES,
    UNARMED_ABILITIES
  };
} else {
  window.MELEE_ABILITIES = MELEE_ABILITIES;
  window.ONE_HANDED_ABILITIES = ONE_HANDED_ABILITIES;
  window.TWO_HANDED_ABILITIES = TWO_HANDED_ABILITIES;
  window.DUAL_WIELDING_ABILITIES = DUAL_WIELDING_ABILITIES;
  window.UNARMED_ABILITIES = UNARMED_ABILITIES;
}