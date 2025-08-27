/**
 * Ranged Combat Abilities
 * Active and passive abilities for ranged combat skills
 */

// Archery Abilities
const ARCHERY_ABILITIES = [
  {
    key: 'aimed_shot',
    name: 'Aimed Shot',
    description: 'Take careful aim for increased accuracy and damage',
    type: 'active',
    category: 'combat',
    apCost: 2,

    range: 6,
    cooldown: 1,
    requiresTarget: true,
    skillRequirements: [{ skill: 'archery', level: 1 }],
    prerequisites: [],
    baseSuccessRate: 5, // Slightly better than melee for ranged
    effects: {
      damage: { base: 1.2, scaling: 'weapon' },
      accuracy: { base: 0.85, scaling: 'skill' },
      criticalChance: { base: 0.12, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'archery', multiplier: 3.0 },
        { skill: 'precision', multiplier: 2.2 },
        { skill: 'alertness', multiplier: 1.5 }
      ],
      apReduction: [
        { skill: 'archery', levelsPer: 12, reduction: 1 }
      ],
      rangeIncrease: [
        { skill: 'archery', levelsPer: 8, increase: 1 }
      ]
    }
  },

  {
    key: 'rapid_fire',
    name: 'Rapid Fire',
    description: 'Loose multiple arrows in quick succession',
    type: 'active',
    category: 'combat',
    apCost: 4,

    range: 5,
    cooldown: 3,
    requiresTarget: true,
    skillRequirements: [{ skill: 'archery', level: 8 }],
    prerequisites: ['aimed_shot'],
    baseSuccessRate: -20,
    effects: {
      damage: { base: 0.8, scaling: 'weapon' },
      multiShot: { base: 3, scaling: 'skill' }, // 3-5 arrows
      accuracy: { base: 0.6, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'archery', multiplier: 2.5 },
        { skill: 'quick_draw', multiplier: 2.8 },
        { skill: 'combat_reflexes', multiplier: 2.0 }
      ]
    }
  },

  {
    key: 'piercing_shot',
    name: 'Piercing Shot',
    description: 'An arrow that can penetrate through multiple enemies',
    type: 'active',
    category: 'combat',
    apCost: 3,

    range: 8,
    cooldown: 4,
    requiresTarget: true,
    skillRequirements: [{ skill: 'archery', level: 12 }],
    prerequisites: ['aimed_shot'],
    baseSuccessRate: -15,
    effects: {
      damage: { base: 1.4, scaling: 'weapon' },
      pierceTargets: { base: 2, scaling: 'skill' },
      armorPiercing: { base: 0.4, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'archery', multiplier: 2.3 },
        { skill: 'penetrating_shots', multiplier: 3.0 },
        { skill: 'strength', multiplier: 1.2 }
      ]
    }
  },

  {
    key: 'archery_mastery',
    name: 'Archery Mastery',
    description: 'Expert knowledge of ranged weapons increases damage and range',
    type: 'passive',
    category: 'combat',
    skillRequirements: [{ skill: 'archery', level: 6 }],
    prerequisites: [],
    baseSuccessRate: 100,
    effects: {
      rangedDamageBonus: { base: 0.12, scaling: 'skill' },
      rangedAccuracyBonus: { base: 0.08, scaling: 'skill' },
      rangeBonus: { base: 1, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'archery', multiplier: 0.5 },
        { skill: 'precision', multiplier: 0.4 }
      ]
    }
  }
];

// Throwing Weapon Abilities
const THROWING_ABILITIES = [
  {
    key: 'thrown_weapon',
    name: 'Thrown Weapon',
    description: 'Hurl a weapon at your target with deadly accuracy',
    type: 'active',
    category: 'combat',
    apCost: 2,

    range: 4,
    cooldown: 0,
    requiresTarget: true,
    skillRequirements: [{ skill: 'throwing', level: 1 }],
    prerequisites: [],
    baseSuccessRate: -5,
    effects: {
      damage: { base: 1.1, scaling: 'weapon' },
      accuracy: { base: 0.7, scaling: 'skill' },
      retrievable: { base: 0.3, scaling: 'skill' } // Chance to recover weapon
    },
    scaling: {
      effectiveness: [
        { skill: 'throwing', multiplier: 2.8 },
        { skill: 'precision', multiplier: 2.0 },
        { skill: 'strength', multiplier: 1.5 }
      ],
      rangeIncrease: [
        { skill: 'throwing', levelsPer: 6, increase: 1 }
      ]
    }
  },

  {
    key: 'multi_throw',
    name: 'Multi-Throw',
    description: 'Throw multiple weapons at different targets simultaneously',
    type: 'active',
    category: 'combat',
    apCost: 4,

    range: 4,
    cooldown: 3,
    requiresTarget: false, // Can target multiple
    skillRequirements: [{ skill: 'throwing', level: 10 }],
    prerequisites: ['thrown_weapon'],
    baseSuccessRate: -30,
    effects: {
      damage: { base: 0.9, scaling: 'weapon' },
      multiTargets: { base: 3, scaling: 'skill' },
      accuracy: { base: 0.55, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'throwing', multiplier: 2.5 },
        { skill: 'multitasking', multiplier: 2.8 },
        { skill: 'coordination', multiplier: 2.2 }
      ]
    }
  }
];

// Firearm Abilities (if available)
const FIREARM_ABILITIES = [
  {
    key: 'precise_shot',
    name: 'Precise Shot',
    description: 'A carefully aimed gunshot with high accuracy',
    type: 'active',
    category: 'combat',
    apCost: 2,

    range: 10,
    cooldown: 2,
    requiresTarget: true,
    skillRequirements: [{ skill: 'firearms', level: 1 }],
    prerequisites: [],
    baseSuccessRate: 15, // Firearms are easier to use
    effects: {
      damage: { base: 2.0, scaling: 'weapon' },
      accuracy: { base: 0.8, scaling: 'skill' },
      armorPiercing: { base: 0.5, scaling: 'weapon' }
    },
    scaling: {
      effectiveness: [
        { skill: 'firearms', multiplier: 2.5 },
        { skill: 'precision', multiplier: 2.0 }
      ]
    }
  },

  {
    key: 'gunslinger_reload',
    name: 'Quick Reload',
    description: 'Rapidly reload your firearm to continue the assault',
    type: 'active',
    category: 'utility',
    apCost: 1,

    range: 0,
    cooldown: 0,
    requiresTarget: false,
    skillRequirements: [{ skill: 'firearms', level: 5 }],
    prerequisites: ['precise_shot'],
    baseSuccessRate: 50,
    effects: {
      ammoReload: { base: 6, scaling: 'skill' },
      nextShotBonus: { base: 0.1, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'firearms', multiplier: 1.8 },
        { skill: 'quick_draw', multiplier: 2.5 }
      ]
    }
  }
];

// Called Shot Abilities (works with any ranged weapon)
const CALLED_SHOT_ABILITIES = [
  {
    key: 'headshot',
    name: 'Headshot',
    description: 'Aim for the head for massive damage but reduced accuracy',
    type: 'active',
    category: 'combat',
    apCost: 3,

    range: 0, // Uses weapon range
    cooldown: 3,
    requiresTarget: true,
    skillRequirements: [{ skill: 'called_shots', level: 8 }],
    prerequisites: [],
    baseSuccessRate: -40,
    effects: {
      damage: { base: 2.5, scaling: 'weapon' },
      accuracy: { base: 0.35, scaling: 'skill' },
      criticalChance: { base: 0.8, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'called_shots', multiplier: 3.5 },
        { skill: 'precision', multiplier: 3.0 },
        { skill: 'anatomy', multiplier: 2.0 } // If we had this skill
      ]
    }
  },

  {
    key: 'disabling_shot',
    name: 'Disabling Shot',
    description: 'Target limbs to impair enemy movement or attacks',
    type: 'active',
    category: 'combat',
    apCost: 3,

    range: 0, // Uses weapon range
    cooldown: 4,
    requiresTarget: true,
    skillRequirements: [{ skill: 'called_shots', level: 6 }],
    prerequisites: [],
    baseSuccessRate: -25,
    effects: {
      damage: { base: 0.8, scaling: 'weapon' },
      debuffDuration: { base: 3, scaling: 'skill' },
      disableChance: { base: 0.4, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'called_shots', multiplier: 2.8 },
        { skill: 'precision', multiplier: 2.2 }
      ]
    }
  }
];

// Suppression Abilities
const SUPPRESSION_ABILITIES = [
  {
    key: 'suppressing_fire',
    name: 'Suppressing Fire',
    description: 'Lay down covering fire to pin down enemies',
    type: 'active',
    category: 'combat',
    apCost: 3,

    range: 8,
    cooldown: 4,
    requiresTarget: false, // Area effect
    skillRequirements: [{ skill: 'suppression', level: 5 }],
    prerequisites: [],
    baseSuccessRate: -10,
    effects: {
      damage: { base: 0.6, scaling: 'weapon' },
      areaEffect: { base: 3, scaling: 'skill' }, // 3x3 area
      suppressionDuration: { base: 2, scaling: 'skill' },
      accuracy: { base: 0.7, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'suppression', multiplier: 2.5 },
        { skill: 'tactical_combat', multiplier: 2.0 }
      ]
    }
  }
];

// Combine all ranged abilities
const RANGED_ABILITIES = [
  ...ARCHERY_ABILITIES,
  ...THROWING_ABILITIES,
  ...FIREARM_ABILITIES,
  ...CALLED_SHOT_ABILITIES,
  ...SUPPRESSION_ABILITIES
];

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    RANGED_ABILITIES,
    ARCHERY_ABILITIES,
    THROWING_ABILITIES,
    FIREARM_ABILITIES,
    CALLED_SHOT_ABILITIES,
    SUPPRESSION_ABILITIES
  };
} else {
  window.RANGED_ABILITIES = RANGED_ABILITIES;
  window.ARCHERY_ABILITIES = ARCHERY_ABILITIES;
  window.THROWING_ABILITIES = THROWING_ABILITIES;
  window.FIREARM_ABILITIES = FIREARM_ABILITIES;
  window.CALLED_SHOT_ABILITIES = CALLED_SHOT_ABILITIES;
  window.SUPPRESSION_ABILITIES = SUPPRESSION_ABILITIES;
}