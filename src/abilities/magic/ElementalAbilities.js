/**
 * Elemental Magic Abilities
 * Fire, Ice, Lightning, and Earth magic abilities
 */

// Fire Magic Abilities
const FIRE_ABILITIES = [
  {
    key: 'flame_bolt',
    name: 'Flame Bolt',
    description: 'A basic projectile of fire that burns the target',
    type: 'active',
    category: 'magic',
    apCost: 2,
    range: 5,
    cooldown: 1,
    requiresTarget: true,
    skillRequirements: [{ skill: 'elemental_fire', level: 1 }],
    prerequisites: [],
    baseSuccessRate: -20, // Magic is harder than physical combat
    effects: {
      damage: { base: 12, scaling: 'skill' },
      accuracy: { base: 0.7, scaling: 'skill' },
      burnChance: { base: 0.3, scaling: 'skill' },
      burnDuration: { base: 2, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'elemental_fire', multiplier: 3.0 },
        { skill: 'concentration', multiplier: 2.0 },
        { skill: 'arcane_lore', multiplier: 1.5 }
      ],
      apReduction: [
        { skill: 'elemental_fire', levelsPer: 10, reduction: 1 }
      ],
      rangeIncrease: [
        { skill: 'elemental_fire', levelsPer: 8, increase: 1 }
      ]
    }
  },

  {
    key: 'fireball',
    name: 'Fireball',
    description: 'An explosive ball of fire that damages multiple enemies',
    type: 'active',
    category: 'magic',
    apCost: 4,
    range: 6,
    cooldown: 3,
    requiresTarget: true,
    skillRequirements: [{ skill: 'elemental_fire', level: 8 }],
    prerequisites: ['flame_bolt'],
    baseSuccessRate: -30,
    effects: {
      damage: { base: 20, scaling: 'skill' },
      areaEffect: { base: 2, scaling: 'skill' }, // 2x2 area, can grow
      accuracy: { base: 0.75, scaling: 'skill' },
      burnChance: { base: 0.5, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'elemental_fire', multiplier: 2.8 },
        { skill: 'metamagic', multiplier: 2.2 }
      ]
    }
  },

  {
    key: 'wall_of_flame',
    name: 'Wall of Flame',
    description: 'Create a barrier of fire that blocks movement and burns enemies',
    type: 'active',
    category: 'magic',
    apCost: 5,
    range: 4,
    cooldown: 6,
    requiresTarget: false,
    skillRequirements: [{ skill: 'elemental_fire', level: 12 }],
    prerequisites: ['fireball'],
    baseSuccessRate: -25,
    effects: {
      wallLength: { base: 3, scaling: 'skill' },
      wallDuration: { base: 5, scaling: 'skill' },
      passingDamage: { base: 8, scaling: 'skill' },
      blockMovement: { base: 1, scaling: 'none' }
    },
    scaling: {
      effectiveness: [
        { skill: 'elemental_fire', multiplier: 2.5 },
        { skill: 'tactical_combat', multiplier: 1.8 }
      ]
    }
  },

  {
    key: 'fire_mastery',
    name: 'Fire Mastery',
    description: 'Deep understanding of fire magic increases damage and reduces AP costs',
    type: 'passive',
    category: 'magic',
    skillRequirements: [{ skill: 'elemental_fire', level: 6 }],
    prerequisites: [],
    baseSuccessRate: 100,
    effects: {
      fireDamageBonus: { base: 0.15, scaling: 'skill' },
      fireAPReduction: { base: 0.1, scaling: 'skill' },
      burnResistance: { base: 0.5, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'elemental_fire', multiplier: 0.6 }
      ]
    }
  }
];

// Ice Magic Abilities
const ICE_ABILITIES = [
  {
    key: 'frost_shard',
    name: 'Frost Shard',
    description: 'Launch a piercing shard of ice at your enemy',
    type: 'active',
    category: 'magic',
    apCost: 3,
    range: 6,
    cooldown: 1,
    requiresTarget: true,
    skillRequirements: [{ skill: 'elemental_ice', level: 1 }],
    prerequisites: [],
    baseSuccessRate: -15,
    effects: {
      damage: { base: 10, scaling: 'skill' },
      accuracy: { base: 0.8, scaling: 'skill' },
      slowChance: { base: 0.4, scaling: 'skill' },
      slowDuration: { base: 2, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'elemental_ice', multiplier: 3.2 },
        { skill: 'precision', multiplier: 1.8 }
      ]
    }
  },

  {
    key: 'ice_armor',
    name: 'Ice Armor',
    description: 'Surround yourself with protective ice that absorbs damage',
    type: 'active',
    category: 'magic',
    apCost: 4,
    range: 0,
    cooldown: 4,
    requiresTarget: false,
    skillRequirements: [{ skill: 'elemental_ice', level: 5 }],
    prerequisites: ['frost_shard'],
    baseSuccessRate: -10,
    effects: {
      armorValue: { base: 8, scaling: 'skill' },
      duration: { base: 6, scaling: 'skill' },
      reflectDamage: { base: 3, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'elemental_ice', multiplier: 2.5 },
        { skill: 'protection', multiplier: 2.0 }
      ]
    }
  },

  {
    key: 'blizzard',
    name: 'Blizzard',
    description: 'Summon a freezing storm that slows and damages all enemies in a large area',
    type: 'active',
    category: 'magic',
    apCost: 7,
    range: 8,
    cooldown: 8,
    requiresTarget: false,
    skillRequirements: [{ skill: 'elemental_ice', level: 15 }],
    prerequisites: ['ice_armor'],
    baseSuccessRate: -40,
    effects: {
      damage: { base: 15, scaling: 'skill' },
      areaEffect: { base: 4, scaling: 'skill' }, // 4x4 area
      slowDuration: { base: 4, scaling: 'skill' },
      stormDuration: { base: 3, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'elemental_ice', multiplier: 3.0 },
        { skill: 'weather_sense', multiplier: 1.5 }
      ]
    }
  }
];

// Lightning Magic Abilities
const LIGHTNING_ABILITIES = [
  {
    key: 'lightning_bolt',
    name: 'Lightning Bolt',
    description: 'Strike your enemy with a bolt of pure electricity',
    type: 'active',
    category: 'magic',
    apCost: 3,
    range: 7,
    cooldown: 1,
    requiresTarget: true,
    skillRequirements: [{ skill: 'elemental_lightning', level: 1 }],
    prerequisites: [],
    baseSuccessRate: -10, // Lightning is fast and accurate
    effects: {
      damage: { base: 14, scaling: 'skill' },
      accuracy: { base: 0.9, scaling: 'skill' },
      stunChance: { base: 0.25, scaling: 'skill' },
      chainTargets: { base: 0, scaling: 'skill' } // Can chain at higher levels
    },
    scaling: {
      effectiveness: [
        { skill: 'elemental_lightning', multiplier: 3.0 },
        { skill: 'quick_thinking', multiplier: 2.0 }
      ]
    }
  },

  {
    key: 'chain_lightning',
    name: 'Chain Lightning',
    description: 'Lightning that jumps from enemy to enemy',
    type: 'active',
    category: 'magic',
    apCost: 5,
    range: 6,
    cooldown: 4,
    requiresTarget: true,
    skillRequirements: [{ skill: 'elemental_lightning', level: 10 }],
    prerequisites: ['lightning_bolt'],
    baseSuccessRate: -25,
    effects: {
      damage: { base: 18, scaling: 'skill' },
      chainTargets: { base: 3, scaling: 'skill' },
      damageReduction: { base: 0.8, scaling: 'none' }, // Each jump does 80% damage
      accuracy: { base: 0.85, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'elemental_lightning', multiplier: 2.8 },
        { skill: 'multitasking', multiplier: 2.2 }
      ]
    }
  },

  {
    key: 'lightning_reflexes',
    name: 'Lightning Reflexes',
    description: 'Electricity courses through your body, greatly increasing your speed',
    type: 'passive',
    category: 'magic',
    skillRequirements: [{ skill: 'elemental_lightning', level: 8 }],
    prerequisites: [],
    baseSuccessRate: 100,
    effects: {
      initiativeBonus: { base: 5, scaling: 'skill' },
      evasionBonus: { base: 0.1, scaling: 'skill' },
      movementBonus: { base: 1, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'elemental_lightning', multiplier: 0.8 },
        { skill: 'combat_reflexes', multiplier: 0.6 }
      ]
    }
  }
];

// Earth Magic Abilities
const EARTH_ABILITIES = [
  {
    key: 'stone_throw',
    name: 'Stone Throw',
    description: 'Hurl a magically-formed stone at your target',
    type: 'active',
    category: 'magic',
    apCost: 2,
    range: 5,
    cooldown: 0,
    requiresTarget: true,
    skillRequirements: [{ skill: 'elemental_earth', level: 1 }],
    prerequisites: [],
    baseSuccessRate: 0, // Earth magic is reliable
    effects: {
      damage: { base: 8, scaling: 'skill' },
      accuracy: { base: 0.75, scaling: 'skill' },
      knockback: { base: 1, scaling: 'skill' },
      armorPiercing: { base: 0.2, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'elemental_earth', multiplier: 2.8 },
        { skill: 'strength', multiplier: 1.5 }
      ]
    }
  },

  {
    key: 'stone_skin',
    name: 'Stone Skin',
    description: 'Transform your skin to stone, greatly increasing defense',
    type: 'active',
    category: 'magic',
    apCost: 4,
    range: 0,
    cooldown: 5,
    requiresTarget: false,
    skillRequirements: [{ skill: 'elemental_earth', level: 6 }],
    prerequisites: ['stone_throw'],
    baseSuccessRate: 5,
    effects: {
      defenseBonus: { base: 12, scaling: 'skill' },
      duration: { base: 8, scaling: 'skill' },
      movementPenalty: { base: -1, scaling: 'none' },
      magicResistance: { base: 0.3, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'elemental_earth', multiplier: 2.2 },
        { skill: 'toughness', multiplier: 1.8 }
      ]
    }
  },

  {
    key: 'earthquake',
    name: 'Earthquake',
    description: 'Shake the ground to damage and knock down all nearby enemies',
    type: 'active',
    category: 'magic',
    apCost: 6,
    range: 0, // Centered on caster
    cooldown: 7,
    requiresTarget: false,
    skillRequirements: [{ skill: 'elemental_earth', level: 12 }],
    prerequisites: ['stone_skin'],
    baseSuccessRate: -20,
    effects: {
      damage: { base: 16, scaling: 'skill' },
      areaEffect: { base: 3, scaling: 'skill' }, // Radius around caster
      knockdownChance: { base: 0.7, scaling: 'skill' },
      knockdownDuration: { base: 2, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'elemental_earth', multiplier: 2.6 },
        { skill: 'strength', multiplier: 2.0 }
      ]
    }
  },

  {
    key: 'earth_mastery',
    name: 'Earth Mastery',
    description: 'Attunement to earth grants stability and resilience',
    type: 'passive',
    category: 'magic',
    skillRequirements: [{ skill: 'elemental_earth', level: 5 }],
    prerequisites: [],
    baseSuccessRate: 100,
    effects: {
      knockdownResistance: { base: 0.4, scaling: 'skill' },
      earthDamageBonus: { base: 0.12, scaling: 'skill' },
      physicalResistance: { base: 0.08, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'elemental_earth', multiplier: 0.7 },
        { skill: 'toughness', multiplier: 0.5 }
      ]
    }
  }
];

// Combine all elemental abilities
const ELEMENTAL_ABILITIES = [
  ...FIRE_ABILITIES,
  ...ICE_ABILITIES,
  ...LIGHTNING_ABILITIES,
  ...EARTH_ABILITIES
];

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ELEMENTAL_ABILITIES,
    FIRE_ABILITIES,
    ICE_ABILITIES,
    LIGHTNING_ABILITIES,
    EARTH_ABILITIES
  };
} else {
  window.ELEMENTAL_ABILITIES = ELEMENTAL_ABILITIES;
  window.FIRE_ABILITIES = FIRE_ABILITIES;
  window.ICE_ABILITIES = ICE_ABILITIES;
  window.LIGHTNING_ABILITIES = LIGHTNING_ABILITIES;
  window.EARTH_ABILITIES = EARTH_ABILITIES;
}