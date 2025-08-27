/**
 * Magic Abilities
 * Spells and magical abilities for White Mages, Sorcerers, Necromancers, etc.
 * Organized by magical disciplines and class themes
 */

// WHITE MAGE ABILITIES
const WHITE_MAGE_ABILITIES = [
  // Basic White Mage (Levels 1-5)
  {
    key: 'lesser_heal',
    name: 'Lesser Heal',
    description: 'A basic healing spell that restores health',
    type: 'active',
    category: 'magic',
    apCost: 2,
    range: 4,
    cooldown: 1,
    requiresTarget: true,
    skillRequirements: [{ skill: 'healing', level: 1 }],
    baseSuccessRate: 10,
    effects: {
      healing: { base: 18, scaling: 'skill' },
      accuracy: { base: 0.95, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'healing', multiplier: 3.0 },
        { skill: 'religion', multiplier: 2.0 }
      ]
    }
  },

  {
    key: 'bless',
    name: 'Bless',
    description: 'Grant divine favor to increase accuracy and damage',
    type: 'active',
    category: 'magic',
    apCost: 3,
    range: 6,
    cooldown: 0,
    requiresTarget: true,
    skillRequirements: [{ skill: 'religion', level: 2 }],
    baseSuccessRate: 5,
    effects: {
      accuracyBonus: { base: 0.15, scaling: 'skill' },
      damageBonus: { base: 0.1, scaling: 'skill' },
      duration: { base: 12, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'religion', multiplier: 2.8 },
        { skill: 'healing', multiplier: 2.0 }
      ]
    }
  },

  {
    key: 'turn_undead',
    name: 'Turn Undead',
    description: 'Channel holy power to repel undead creatures',
    type: 'active',
    category: 'magic',
    apCost: 3,
    range: 5,
    cooldown: 4,
    requiresTarget: true,
    skillRequirements: [{ skill: 'religion', level: 4 }],
    baseSuccessRate: -10,
    effects: {
      turnChance: { base: 0.6, scaling: 'skill' },
      holyDamage: { base: 20, scaling: 'skill' },
      fearDuration: { base: 5, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'religion', multiplier: 3.2 },
        { skill: 'dispelling', multiplier: 2.5 }
      ]
    }
  },

  // Advanced White Mage (Levels 6-15)
  {
    key: 'greater_heal',
    name: 'Greater Heal',
    description: 'A powerful healing spell that restores significant health',
    type: 'active',
    category: 'magic',
    apCost: 4,
    range: 6,
    cooldown: 3,
    requiresTarget: true,
    skillRequirements: [{ skill: 'healing', level: 8 }],
    baseSuccessRate: -15,
    effects: {
      healing: { base: 45, scaling: 'skill' },
      statusCure: { base: 1, scaling: 'skill' },
      overhealing: { base: 0.2, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'healing', multiplier: 3.5 },
        { skill: 'concentration', multiplier: 2.2 }
      ]
    }
  },

  {
    key: 'sanctuary',
    name: 'Sanctuary',
    description: 'Create a blessed area that heals allies and harms undead',
    type: 'active',
    category: 'magic',
    apCost: 5,
    manaCost: 60,
    range: 6,
    cooldown: 8,
    requiresTarget: false,
    skillRequirements: [{ skill: 'ritual_magic', level: 10 }],
    baseSuccessRate: -20,
    effects: {
      areaEffect: { base: 3, scaling: 'skill' },
      healingAura: { base: 8, scaling: 'skill' },
      undeadDamage: { base: 12, scaling: 'skill' },
      duration: { base: 10, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'ritual_magic', multiplier: 2.8 },
        { skill: 'healing', multiplier: 2.5 }
      ]
    }
  },

  // Master White Mage (Levels 16+)
  {
    key: 'divine_intervention',
    name: 'Divine Intervention',
    description: 'Call upon divine power to completely restore an ally',
    type: 'active',
    category: 'magic',
    apCost: 6,
    manaCost: 80,
    range: 8,
    cooldown: 15,
    requiresTarget: true,
    skillRequirements: [{ skill: 'religion', level: 18 }],
    baseSuccessRate: -30,
    effects: {
      fullHeal: { base: 1, scaling: 'none' },
      statusCureAll: { base: 1, scaling: 'none' },
      temporaryImmunity: { base: 5, scaling: 'skill' },
      blessingSuperior: { base: 1, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'religion', multiplier: 4.0 },
        { skill: 'healing', multiplier: 3.5 }
      ]
    }
  }
];

// SORCERER ABILITIES
const SORCERER_ABILITIES = [
  // Basic Sorcerer (Levels 1-5)
  {
    key: 'magic_missile',
    name: 'Magic Missile',
    description: 'Unerring bolts of pure magical force',
    type: 'active',
    category: 'magic',
    apCost: 2,
    manaCost: 12,
    range: 6,
    cooldown: 0,
    requiresTarget: true,
    skillRequirements: [{ skill: 'arcane_lore', level: 1 }],
    baseSuccessRate: 15,
    effects: {
      damage: { base: 10, scaling: 'skill' },
      accuracy: { base: 1.0, scaling: 'none' }, // Never misses
      missileCount: { base: 1, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'arcane_lore', multiplier: 2.8 },
        { skill: 'concentration', multiplier: 2.0 }
      ]
    }
  },

  {
    key: 'mage_armor',
    name: 'Mage Armor',
    description: 'Surround yourself with protective magical energy',
    type: 'active',
    category: 'magic',
    apCost: 3,
    range: 0,
    cooldown: 0,
    requiresTarget: false,
    skillRequirements: [{ skill: 'protection', level: 3 }],
    baseSuccessRate: 5,
    effects: {
      magicDefense: { base: 10, scaling: 'skill' },
      spellResistance: { base: 0.2, scaling: 'skill' },
      duration: { base: 30, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'protection', multiplier: 2.5 },
        { skill: 'arcane_lore', multiplier: 2.0 }
      ]
    }
  },

  {
    key: 'dispel_magic',
    name: 'Dispel Magic',
    description: 'Remove magical effects from target',
    type: 'active',
    category: 'magic',
    apCost: 3,
    range: 5,
    cooldown: 2,
    requiresTarget: true,
    skillRequirements: [{ skill: 'dispelling', level: 4 }],
    baseSuccessRate: 0,
    effects: {
      dispelChance: { base: 0.7, scaling: 'skill' },
      magicDamage: { base: 8, scaling: 'skill' },
      antimagicDuration: { base: 3, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'dispelling', multiplier: 3.0 },
        { skill: 'arcane_lore', multiplier: 2.2 }
      ]
    }
  },

  // Advanced Sorcerer (Levels 6-15)
  {
    key: 'metamagic_enhance',
    name: 'Metamagic Enhancement',
    description: 'Enhance your next spell with metamagic principles',
    type: 'active',
    category: 'magic',
    apCost: 2,
    range: 0,
    cooldown: 3,
    requiresTarget: false,
    skillRequirements: [{ skill: 'metamagic', level: 8 }],
    baseSuccessRate: -10,
    effects: {
      nextSpellBonus: { base: 0.5, scaling: 'skill' },
      nextSpellRange: { base: 2, scaling: 'skill' },
      nextSpellPenetration: { base: 0.3, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'metamagic', multiplier: 3.2 },
        { skill: 'concentration', multiplier: 2.5 }
      ]
    }
  },

  {
    key: 'arcane_explosion',
    name: 'Arcane Explosion',
    description: 'Release a burst of raw magical energy around yourself',
    type: 'active',
    category: 'magic',
    apCost: 4,
    range: 0,
    cooldown: 5,
    requiresTarget: false,
    skillRequirements: [{ skill: 'arcane_lore', level: 12 }],
    baseSuccessRate: -15,
    effects: {
      damage: { base: 25, scaling: 'skill' },
      areaEffect: { base: 2, scaling: 'skill' },
      pushback: { base: 2, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'arcane_lore', multiplier: 2.8 },
        { skill: 'elemental_fire', multiplier: 2.0 }
      ]
    }
  },

  // Master Sorcerer (Levels 16+)
  {
    key: 'arcane_mastery',
    name: 'Arcane Mastery',
    description: 'Achieve perfect understanding of magical forces',
    type: 'active',
    category: 'magic',
    apCost: 6,
    manaCost: 0, // Costs no mana due to mastery
    range: 0,
    cooldown: 20,
    requiresTarget: false,
    skillRequirements: [{ skill: 'arcane_lore', level: 20 }],
    baseSuccessRate: -35,
    effects: {
      manaEfficiencyBonus: { base: 0.8, scaling: 'skill' },
      spellPowerBonus: { base: 0.6, scaling: 'skill' },
      castingSpeedBonus: { base: 0.5, scaling: 'skill' },
      duration: { base: 20, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'arcane_lore', multiplier: 4.0 },
        { skill: 'metamagic', multiplier: 3.5 }
      ]
    }
  }
];

// NECROMANCER ABILITIES
const NECROMANCER_ABILITIES = [
  // Basic Necromancer (Levels 1-5)
  {
    key: 'drain_life',
    name: 'Drain Life',
    description: 'Steal life force from your enemy to heal yourself',
    type: 'active',
    category: 'magic',
    apCost: 2,
    manaCost: 18,
    range: 4,
    cooldown: 2,
    requiresTarget: true,
    skillRequirements: [{ skill: 'necromancy', level: 1 }],
    baseSuccessRate: -5,
    effects: {
      damage: { base: 12, scaling: 'skill' },
      healing: { base: 8, scaling: 'skill' },
      accuracy: { base: 0.8, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'necromancy', multiplier: 3.0 },
        { skill: 'healing', multiplier: 2.0 }
      ]
    }
  },

  {
    key: 'bone_armor',
    name: 'Bone Armor',
    description: 'Surround yourself with animated bones for protection',
    type: 'active',
    category: 'magic',
    apCost: 3,
    range: 0,
    cooldown: 4,
    requiresTarget: false,
    skillRequirements: [{ skill: 'necromancy', level: 3 }],
    baseSuccessRate: -10,
    effects: {
      armorValue: { base: 8, scaling: 'skill' },
      reflectDamage: { base: 4, scaling: 'skill' },
      duration: { base: 15, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'necromancy', multiplier: 2.8 },
        { skill: 'protection', multiplier: 2.0 }
      ]
    }
  },

  {
    key: 'animate_skeleton',
    name: 'Animate Skeleton',
    description: 'Raise a skeleton warrior to fight alongside you',
    type: 'active',
    category: 'magic',
    apCost: 4,
    range: 3,
    cooldown: 8,
    requiresTarget: false,
    skillRequirements: [{ skill: 'summoning', level: 5 }],
    baseSuccessRate: -15,
    effects: {
      minionHealth: { base: 25, scaling: 'skill' },
      minionDamage: { base: 10, scaling: 'skill' },
      minionDuration: { base: 30, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'summoning', multiplier: 3.0 },
        { skill: 'necromancy', multiplier: 2.5 }
      ]
    }
  },

  // Advanced Necromancer (Levels 6-15)
  {
    key: 'corpse_explosion',
    name: 'Corpse Explosion',
    description: 'Detonate a corpse in a burst of necrotic energy',
    type: 'active',
    category: 'magic',
    apCost: 3,
    range: 6,
    cooldown: 4,
    requiresTarget: true,
    skillRequirements: [{ skill: 'necromancy', level: 10 }],
    baseSuccessRate: -10,
    effects: {
      damage: { base: 30, scaling: 'skill' },
      areaEffect: { base: 2, scaling: 'skill' },
      corpseRequired: { base: 1, scaling: 'none' }
    },
    scaling: {
      effectiveness: [
        { skill: 'necromancy', multiplier: 2.8 },
        { skill: 'elemental_fire', multiplier: 2.0 }
      ]
    }
  },

  {
    key: 'death_aura',
    name: 'Death Aura',
    description: 'Emanate an aura that weakens and terrifies living beings',
    type: 'active',
    category: 'magic',
    apCost: 4,
    range: 0,
    cooldown: 6,
    requiresTarget: false,
    skillRequirements: [{ skill: 'necromancy', level: 12 }],
    baseSuccessRate: -20,
    effects: {
      auraRadius: { base: 3, scaling: 'skill' },
      damagePerTurn: { base: 5, scaling: 'skill' },
      fearChance: { base: 0.3, scaling: 'skill' },
      duration: { base: 8, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'necromancy', multiplier: 3.2 },
        { skill: 'intimidation', multiplier: 2.0 }
      ]
    }
  },

  // Master Necromancer (Levels 16+)
  {
    key: 'undead_mastery',
    name: 'Undead Mastery',
    description: 'Command over all undead creatures in the area',
    type: 'active',
    category: 'magic',
    apCost: 6,
    manaCost: 80,
    range: 10,
    cooldown: 15,
    requiresTarget: false,
    skillRequirements: [{ skill: 'necromancy', level: 20 }],
    baseSuccessRate: -30,
    effects: {
      controlChance: { base: 0.8, scaling: 'skill' },
      controlDuration: { base: 20, scaling: 'skill' },
      massControl: { base: 5, scaling: 'skill' },
      powerBonus: { base: 0.5, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'necromancy', multiplier: 4.0 },
        { skill: 'summoning', multiplier: 3.0 }
      ]
    }
  }
];

// DRUID ABILITIES
const DRUID_ABILITIES = [
  // Basic Druid (Levels 1-5)
  {
    key: 'natures_touch',
    name: "Nature's Touch",
    description: 'Channel natural energy to heal wounds',
    type: 'active',
    category: 'magic',
    apCost: 2,
    range: 2,
    cooldown: 1,
    requiresTarget: true,
    skillRequirements: [{ skill: 'herbalism', level: 2 }],
    baseSuccessRate: 10,
    effects: {
      healing: { base: 15, scaling: 'skill' },
      poisonCure: { base: 0.5, scaling: 'skill' },
      plantGrowth: { base: 1, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'herbalism', multiplier: 2.8 },
        { skill: 'healing', multiplier: 2.2 }
      ]
    }
  },

  {
    key: 'animal_speech',
    name: 'Animal Speech',
    description: 'Communicate with and command natural animals',
    type: 'active',
    category: 'magic',
    apCost: 2,
    range: 8,
    cooldown: 0,
    requiresTarget: true,
    skillRequirements: [{ skill: 'animal_handling', level: 4 }],
    baseSuccessRate: 5,
    effects: {
      communicationSuccess: { base: 0.8, scaling: 'skill' },
      commandSuccess: { base: 0.4, scaling: 'skill' },
      pacifyChance: { base: 0.6, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'animal_handling', multiplier: 3.0 },
        { skill: 'empathy', multiplier: 2.5 }
      ]
    }
  },

  // Advanced Druid (Levels 6-15)
  {
    key: 'wild_shape',
    name: 'Wild Shape',
    description: 'Transform into a wild animal form',
    type: 'active',
    category: 'magic',
    apCost: 4,
    range: 0,
    cooldown: 10,
    requiresTarget: false,
    skillRequirements: [{ skill: 'animal_handling', level: 10 }],
    baseSuccessRate: -20,
    effects: {
      shapeOptions: { base: 3, scaling: 'skill' },
      formStrength: { base: 0.5, scaling: 'skill' },
      formDuration: { base: 20, scaling: 'skill' },
      naturalWeapons: { base: 1, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'animal_handling', multiplier: 3.5 },
        { skill: 'flexibility', multiplier: 2.8 }
      ]
    }
  },

  {
    key: 'call_lightning',
    name: 'Call Lightning',
    description: 'Summon natural lightning from storm clouds',
    type: 'active',
    category: 'magic',
    apCost: 4,
    range: 8,
    cooldown: 5,
    requiresTarget: true,
    skillRequirements: [{ skill: 'weather_sense', level: 8 }],
    baseSuccessRate: -15,
    effects: {
      damage: { base: 28, scaling: 'skill' },
      chainLightning: { base: 2, scaling: 'skill' },
      stunChance: { base: 0.4, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'weather_sense', multiplier: 3.0 },
        { skill: 'elemental_lightning', multiplier: 2.5 }
      ]
    }
  },

  // Master Druid (Levels 16+)
  {
    key: 'force_of_nature',
    name: 'Force of Nature',
    description: 'Become one with nature itself, gaining tremendous power',
    type: 'active',
    category: 'magic',
    apCost: 6,
    manaCost: 100,
    range: 0,
    cooldown: 20,
    requiresTarget: false,
    skillRequirements: [{ skill: 'wilderness_lore', level: 20 }],
    baseSuccessRate: -35,
    effects: {
      elementalMastery: { base: 1, scaling: 'skill' },
      animalCommand: { base: 1, scaling: 'skill' },
      plantControl: { base: 1, scaling: 'skill' },
      duration: { base: 30, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'wilderness_lore', multiplier: 4.0 },
        { skill: 'animal_handling', multiplier: 3.5 }
      ]
    }
  }
];

// WARLOCK ABILITIES
const WARLOCK_ABILITIES = [
  // Basic Warlock (Levels 1-5)
  {
    key: 'eldritch_blast',
    name: 'Eldritch Blast',
    description: 'A bolt of crackling energy from otherworldly sources',
    type: 'active',
    category: 'magic',
    apCost: 2,
    manaCost: 10,
    range: 8,
    cooldown: 0,
    requiresTarget: true,
    skillRequirements: [{ skill: 'planar_lore', level: 2 }],
    baseSuccessRate: 5,
    effects: {
      damage: { base: 12, scaling: 'skill' },
      pushback: { base: 1, scaling: 'skill' },
      accuracy: { base: 0.85, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'planar_lore', multiplier: 2.8 },
        { skill: 'concentration', multiplier: 2.0 }
      ]
    }
  },

  {
    key: 'dark_pact',
    name: 'Dark Pact',
    description: 'Make a bargain with dark forces for temporary power',
    type: 'active',
    category: 'magic',
    apCost: 3,
    range: 0,
    cooldown: 8,
    requiresTarget: false,
    skillRequirements: [{ skill: 'religion', level: 4 }],
    baseSuccessRate: -10,
    effects: {
      powerBonus: { base: 0.4, scaling: 'skill' },
      healthCost: { base: 10, scaling: 'none' },
      duration: { base: 10, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'religion', multiplier: 2.5 },
        { skill: 'iron_will', multiplier: 2.8 }
      ]
    }
  },

  // Advanced Warlock (Levels 6-15)  
  {
    key: 'summon_demon',
    name: 'Summon Demon',
    description: 'Call forth a lesser demon to serve you',
    type: 'active',
    category: 'magic',
    apCost: 5,
    manaCost: 60,
    range: 4,
    cooldown: 12,
    requiresTarget: false,
    skillRequirements: [{ skill: 'summoning', level: 10 }],
    baseSuccessRate: -25,
    effects: {
      demonHealth: { base: 40, scaling: 'skill' },
      demonDamage: { base: 16, scaling: 'skill' },
      controlDifficulty: { base: 0.3, scaling: 'skill' },
      duration: { base: 25, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'summoning', multiplier: 3.2 },
        { skill: 'intimidation', multiplier: 2.5 }
      ]
    }
  },

  {
    key: 'curse',
    name: 'Curse',
    description: 'Place a malevolent curse on your enemy',
    type: 'active',
    category: 'magic',
    apCost: 3,
    range: 6,
    cooldown: 5,
    requiresTarget: true,
    skillRequirements: [{ skill: 'enchantment', level: 8 }],
    baseSuccessRate: -15,
    effects: {
      curseStrength: { base: 0.3, scaling: 'skill' },
      curseDuration: { base: 15, scaling: 'skill' },
      debuffType: { base: 1, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'enchantment', multiplier: 3.0 },
        { skill: 'intimidation', multiplier: 2.2 }
      ]
    }
  }
];

// Combine all magic abilities
const MAGIC_ABILITIES = [
  ...WHITE_MAGE_ABILITIES,
  ...SORCERER_ABILITIES,
  ...NECROMANCER_ABILITIES,
  ...DRUID_ABILITIES,
  ...WARLOCK_ABILITIES
];

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MAGIC_ABILITIES,
    WHITE_MAGE_ABILITIES,
    SORCERER_ABILITIES,
    NECROMANCER_ABILITIES,
    DRUID_ABILITIES,
    WARLOCK_ABILITIES
  };
} else {
  window.MAGIC_ABILITIES = MAGIC_ABILITIES;
  window.WHITE_MAGE_ABILITIES = WHITE_MAGE_ABILITIES;
  window.SORCERER_ABILITIES = SORCERER_ABILITIES;
  window.NECROMANCER_ABILITIES = NECROMANCER_ABILITIES;
  window.DRUID_ABILITIES = DRUID_ABILITIES;
  window.WARLOCK_ABILITIES = WARLOCK_ABILITIES;
}