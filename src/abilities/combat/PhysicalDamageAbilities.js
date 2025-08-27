/**
 * Physical Damage Abilities
 * Combat abilities for Warriors, Rangers, Pirates, Barbarians, Centurions, etc.
 * Organized by class themes with varying difficulty levels
 */

// WARRIOR CLASS ABILITIES
const WARRIOR_ABILITIES = [
  // Basic Warrior (Levels 1-5)
  {
    key: 'shield_slam',
    name: 'Shield Slam',
    description: 'Drive your shield into the enemy with crushing force',
    type: 'active',
    category: 'combat',
    apCost: 2,

    range: 1,
    cooldown: 2,
    requiresTarget: true,
    skillRequirements: [{ skill: 'shields', level: 3 }],
    baseSuccessRate: 5,
    effects: {
      damage: { base: 10, scaling: 'shield' },
      stunChance: { base: 0.25, scaling: 'skill' },
      knockback: { base: 1, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'shields', multiplier: 2.5 },
        { skill: 'strength', multiplier: 1.8 }
      ]
    }
  },

  {
    key: 'battle_cry',
    name: 'Battle Cry',
    description: 'Unleash a fearsome war cry that intimidates enemies and rallies allies',
    type: 'active',
    category: 'combat',
    apCost: 2,
    range: 5,
    cooldown: 4,
    requiresTarget: false,
    skillRequirements: [{ skill: 'intimidation', level: 2 }],
    baseSuccessRate: 10,
    effects: {
      enemyMoraleDebuff: { base: 0.15, scaling: 'skill' },
      allyDamageBonus: { base: 0.1, scaling: 'skill' },
      duration: { base: 5, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'intimidation', multiplier: 3.0 },
        { skill: 'leadership', multiplier: 2.0 }
      ]
    }
  },

  {
    key: 'weapon_throw',
    name: 'Weapon Throw',
    description: 'Hurl your weapon at a distant enemy with deadly precision',
    type: 'active',
    category: 'combat',
    apCost: 3,

    range: 6,
    cooldown: 3,
    requiresTarget: true,
    skillRequirements: [{ skill: 'throwing', level: 4 }],
    baseSuccessRate: -10,
    effects: {
      damage: { base: 18, scaling: 'weapon' },
      accuracy: { base: 0.7, scaling: 'skill' },
      disarmSelf: { base: 1, scaling: 'none' }
    },
    scaling: {
      effectiveness: [
        { skill: 'throwing', multiplier: 2.8 },
        { skill: 'strength', multiplier: 2.0 }
      ]
    }
  },

  // Advanced Warrior (Levels 6-15)
  {
    key: 'berserker_rage',
    name: 'Berserker Rage',
    description: 'Enter a battle frenzy, gaining damage but losing defense',
    type: 'active',
    category: 'combat',
    apCost: 4,
    range: 0,
    cooldown: 8,
    requiresTarget: false,
    skillRequirements: [{ skill: 'berserking', level: 8 }],
    baseSuccessRate: -15,
    effects: {
      damageBonus: { base: 0.5, scaling: 'skill' },
      defenseReduction: { base: 0.3, scaling: 'none' },
      duration: { base: 6, scaling: 'skill' },
      painImmunity: { base: 1, scaling: 'none' }
    },
    scaling: {
      effectiveness: [
        { skill: 'berserking', multiplier: 2.8 },
        { skill: 'iron_will', multiplier: 2.0 }
      ]
    }
  },

  {
    key: 'spinning_strike',
    name: 'Spinning Strike',
    description: 'Spin with weapon extended to hit all surrounding enemies',
    type: 'active',
    category: 'combat',
    apCost: 5,

    range: 1,
    cooldown: 5,
    requiresTarget: false,
    skillRequirements: [{ skill: 'weapon_mastery', level: 10 }],
    baseSuccessRate: -20,
    effects: {
      damage: { base: 14, scaling: 'weapon' },
      areaEffect: { base: 1, scaling: 'none' },
      accuracy: { base: 0.75, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'weapon_mastery', multiplier: 2.5 },
        { skill: 'acrobatics', multiplier: 2.0 }
      ]
    }
  },

  // Master Warrior (Levels 16+)
  {
    key: 'weapon_master_stance',
    name: 'Weapon Master Stance',
    description: 'Adopt the perfect combat stance for your weapon type',
    type: 'active',
    category: 'combat',
    apCost: 3,
    range: 0,
    cooldown: 0,
    requiresTarget: false,
    skillRequirements: [{ skill: 'weapon_mastery', level: 18 }],
    baseSuccessRate: -25,
    effects: {
      accuracyBonus: { base: 0.3, scaling: 'skill' },
      criticalBonus: { base: 0.2, scaling: 'skill' },
      stanceMode: { base: 1, scaling: 'none' },
      duration: { base: 15, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'weapon_mastery', multiplier: 3.0 },
        { skill: 'tactical_combat', multiplier: 2.5 }
      ]
    }
  }
];

// RANGER CLASS ABILITIES
const RANGER_ABILITIES = [
  // Basic Ranger (Levels 1-5)
  {
    key: 'hunters_mark',
    name: "Hunter's Mark",
    description: 'Mark a target for increased damage and tracking',
    type: 'active',
    category: 'combat',
    apCost: 2,
    range: 8,
    cooldown: 0,
    requiresTarget: true,
    skillRequirements: [{ skill: 'tracking', level: 2 }],
    baseSuccessRate: 15,
    effects: {
      markDuration: { base: 10, scaling: 'skill' },
      damageBonus: { base: 0.25, scaling: 'skill' },
      trackingBonus: { base: 0.5, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'tracking', multiplier: 2.5 },
        { skill: 'monster_lore', multiplier: 2.0 }
      ]
    }
  },

  {
    key: 'twin_shot',
    name: 'Twin Shot',
    description: 'Fire two arrows in rapid succession',
    type: 'active',
    category: 'combat',
    apCost: 3,

    range: 6,
    cooldown: 2,
    requiresTarget: true,
    skillRequirements: [{ skill: 'archery', level: 4 }],
    baseSuccessRate: -5,
    effects: {
      damage: { base: 0.8, scaling: 'weapon' },
      multiHit: { base: 2, scaling: 'none' },
      accuracy: { base: 0.8, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'archery', multiplier: 2.8 },
        { skill: 'quick_draw', multiplier: 2.2 }
      ]
    }
  },

  {
    key: 'animal_companion_strike',
    name: 'Animal Companion Strike',
    description: 'Command your animal companion to attack',
    type: 'active',
    category: 'combat',
    apCost: 2,
    range: 10,
    cooldown: 1,
    requiresTarget: true,
    skillRequirements: [{ skill: 'animal_handling', level: 6 }],
    baseSuccessRate: 0,
    effects: {
      companionDamage: { base: 12, scaling: 'skill' },
      accuracy: { base: 0.75, scaling: 'skill' },
      knockdownChance: { base: 0.2, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'animal_handling', multiplier: 3.0 },
        { skill: 'animal_bonding', multiplier: 2.5 }
      ]
    }
  },

  // Advanced Ranger (Levels 6-15)
  {
    key: 'volley',
    name: 'Volley',
    description: 'Fire multiple arrows to rain down on an area',
    type: 'active',
    category: 'combat',
    apCost: 5,

    range: 8,
    cooldown: 6,
    requiresTarget: false,
    skillRequirements: [{ skill: 'archery', level: 12 }],
    baseSuccessRate: -20,
    effects: {
      damage: { base: 10, scaling: 'weapon' },
      areaEffect: { base: 3, scaling: 'skill' },
      arrowCount: { base: 6, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'archery', multiplier: 2.5 },
        { skill: 'multishot', multiplier: 3.0 }
      ]
    }
  },

  {
    key: 'nature_step',
    name: 'Nature Step',
    description: 'Move through natural terrain without penalty while attacking',
    type: 'active',
    category: 'combat',
    apCost: 3,
    range: 4,
    cooldown: 3,
    requiresTarget: false,
    skillRequirements: [{ skill: 'wilderness_lore', level: 8 }],
    baseSuccessRate: 5,
    effects: {
      movement: { base: 4, scaling: 'skill' },
      terrainImmunity: { base: 1, scaling: 'none' },
      nextAttackBonus: { base: 0.3, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'wilderness_lore', multiplier: 2.8 },
        { skill: 'athletics', multiplier: 2.0 }
      ]
    }
  },

  // Master Ranger (Levels 16+)
  {
    key: 'apex_predator',
    name: 'Apex Predator',
    description: 'Become the ultimate hunter with enhanced senses and lethality',
    type: 'active',
    category: 'combat',
    apCost: 6,
    range: 0,
    cooldown: 12,
    requiresTarget: false,
    skillRequirements: [{ skill: 'tracking', level: 18 }],
    baseSuccessRate: -30,
    effects: {
      criticalChanceBonus: { base: 0.4, scaling: 'skill' },
      movementBonus: { base: 3, scaling: 'skill' },
      senseBonus: { base: 0.8, scaling: 'skill' },
      duration: { base: 8, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'tracking', multiplier: 3.5 },
        { skill: 'alertness', multiplier: 2.8 }
      ]
    }
  }
];

// PIRATE CLASS ABILITIES
const PIRATE_ABILITIES = [
  // Basic Pirate (Levels 1-5)
  {
    key: 'cutlass_slash',
    name: 'Cutlass Slash',
    description: 'A quick, brutal slash with your curved blade',
    type: 'active',
    category: 'combat',
    apCost: 2,

    range: 1,
    cooldown: 1,
    requiresTarget: true,
    skillRequirements: [{ skill: 'one_handed', level: 3 }],
    baseSuccessRate: 10,
    effects: {
      damage: { base: 12, scaling: 'weapon' },
      bleedChance: { base: 0.3, scaling: 'skill' },
      accuracy: { base: 0.8, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'one_handed', multiplier: 2.8 },
        { skill: 'intimidation', multiplier: 1.5 }
      ]
    }
  },

  {
    key: 'dirty_fighting',
    name: 'Dirty Fighting',
    description: 'Fight without honor - throw sand, kick, or use underhanded tactics',
    type: 'active',
    category: 'combat',
    apCost: 2,

    range: 1,
    cooldown: 2,
    requiresTarget: true,
    skillRequirements: [{ skill: 'unarmed', level: 2 }],
    baseSuccessRate: 20,
    effects: {
      damage: { base: 6, scaling: 'skill' },
      blindChance: { base: 0.4, scaling: 'skill' },
      debuffDuration: { base: 2, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'unarmed', multiplier: 2.0 },
        { skill: 'deception', multiplier: 2.5 }
      ]
    }
  },

  {
    key: 'sea_legs',
    name: 'Sea Legs',
    description: 'Your balance on ships grants stability in all combat',
    type: 'passive',
    category: 'combat',
    skillRequirements: [{ skill: 'balance', level: 4 }],
    baseSuccessRate: 100,
    effects: {
      knockdownResistance: { base: 0.4, scaling: 'skill' },
      movingCombatBonus: { base: 0.2, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'balance', multiplier: 0.8 }
      ]
    }
  },

  // Advanced Pirate (Levels 6-15)
  {
    key: 'pistol_shot',
    name: 'Pistol Shot',
    description: 'Fire your flintlock pistol at close range',
    type: 'active',
    category: 'combat',
    apCost: 3,

    range: 3,
    cooldown: 4,
    requiresTarget: true,
    skillRequirements: [{ skill: 'firearms', level: 6 }],
    baseSuccessRate: 5,
    effects: {
      damage: { base: 24, scaling: 'weapon' },
      accuracy: { base: 0.85, scaling: 'skill' },
      intimidationBonus: { base: 0.3, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'firearms', multiplier: 2.5 },
        { skill: 'intimidation', multiplier: 1.8 }
      ]
    }
  },

  {
    key: 'boarding_action',
    name: 'Boarding Action',
    description: 'Leap into combat with weapons ready, gaining momentum',
    type: 'active',
    category: 'combat',
    apCost: 4,

    range: 3,
    cooldown: 5,
    requiresTarget: true,
    skillRequirements: [{ skill: 'acrobatics', level: 8 }],
    baseSuccessRate: -10,
    effects: {
      damage: { base: 18, scaling: 'weapon' },
      movement: { base: 3, scaling: 'skill' },
      momentumBonus: { base: 0.4, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'acrobatics', multiplier: 2.8 },
        { skill: 'one_handed', multiplier: 2.2 }
      ]
    }
  },

  // Master Pirate (Levels 16+)
  {
    key: 'pirate_legend',
    name: 'Pirate Legend',
    description: 'Your infamous reputation strikes fear into all who face you',
    type: 'active',
    category: 'combat',
    apCost: 5,
    range: 8,
    cooldown: 10,
    requiresTarget: false,
    skillRequirements: [{ skill: 'reputation', level: 20 }],
    baseSuccessRate: -25,
    effects: {
      fearAura: { base: 0.6, scaling: 'skill' },
      allyMoraleBonus: { base: 0.4, scaling: 'skill' },
      intimidationMastery: { base: 0.8, scaling: 'skill' },
      duration: { base: 12, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'reputation', multiplier: 3.0 },
        { skill: 'leadership', multiplier: 2.5 }
      ]
    }
  }
];

// BARBARIAN CLASS ABILITIES
const BARBARIAN_ABILITIES = [
  // Basic Barbarian (Levels 1-5)
  {
    key: 'primal_roar',
    name: 'Primal Roar',
    description: 'Release a bestial roar that terrifies enemies',
    type: 'active',
    category: 'combat',
    apCost: 2,
    range: 4,
    cooldown: 3,
    requiresTarget: false,
    skillRequirements: [{ skill: 'intimidation', level: 1 }],
    baseSuccessRate: 15,
    effects: {
      fearChance: { base: 0.4, scaling: 'skill' },
      fearDuration: { base: 3, scaling: 'skill' },
      damageBonus: { base: 0.1, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'intimidation', multiplier: 3.0 },
        { skill: 'berserking', multiplier: 2.0 }
      ]
    }
  },

  {
    key: 'savage_bite',
    name: 'Savage Bite',
    description: 'Bite your enemy like a wild animal',
    type: 'active',
    category: 'combat',
    apCost: 1,

    range: 1,
    cooldown: 1,
    requiresTarget: true,
    skillRequirements: [{ skill: 'unarmed', level: 3 }],
    baseSuccessRate: 5,
    effects: {
      damage: { base: 8, scaling: 'strength' },
      bleedChance: { base: 0.5, scaling: 'skill' },
      diseaseChance: { base: 0.1, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'unarmed', multiplier: 2.5 },
        { skill: 'survival', multiplier: 2.0 }
      ]
    }
  },

  // Advanced Barbarian (Levels 6-15)
  {
    key: 'blood_frenzy',
    name: 'Blood Frenzy',
    description: 'The sight of blood sends you into a killing frenzy',
    type: 'active',
    category: 'combat',
    apCost: 3,
    range: 0,
    cooldown: 6,
    requiresTarget: false,
    skillRequirements: [{ skill: 'berserking', level: 10 }],
    baseSuccessRate: -20,
    effects: {
      attackSpeedBonus: { base: 0.5, scaling: 'skill' },
      damageBonus: { base: 0.3, scaling: 'skill' },
      criticalBonus: { base: 0.2, scaling: 'skill' },
      duration: { base: 6, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'berserking', multiplier: 3.2 },
        { skill: 'bloodlust', multiplier: 2.8 }
      ]
    }
  },

  {
    key: 'tribal_tattoos',
    name: 'Tribal Tattoos',
    description: 'Sacred tattoos grant protection and strength in battle',
    type: 'passive',
    category: 'combat',
    skillRequirements: [{ skill: 'religion', level: 8 }],
    baseSuccessRate: 100,
    effects: {
      magicResistance: { base: 0.2, scaling: 'skill' },
      damageBonus: { base: 0.15, scaling: 'skill' },
      painResistance: { base: 0.3, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'religion', multiplier: 0.8 },
        { skill: 'toughness', multiplier: 0.6 }
      ]
    }
  },

  // Master Barbarian (Levels 16+)
  {
    key: 'unstoppable_fury',
    name: 'Unstoppable Fury',
    description: 'Become an unstoppable force of destruction',
    type: 'active',
    category: 'combat',
    apCost: 6,
    range: 0,
    cooldown: 15,
    requiresTarget: false,
    skillRequirements: [{ skill: 'berserking', level: 20 }],
    baseSuccessRate: -35,
    effects: {
      immobilityImmunity: { base: 1, scaling: 'none' },
      damageBonus: { base: 0.8, scaling: 'skill' },
      fearImmunity: { base: 1, scaling: 'none' },
      duration: { base: 10, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'berserking', multiplier: 4.0 },
        { skill: 'iron_will', multiplier: 3.0 }
      ]
    }
  }
];

// CENTURION CLASS ABILITIES
const CENTURION_ABILITIES = [
  // Basic Centurion (Levels 1-5)
  {
    key: 'formation_fighting',
    name: 'Formation Fighting',
    description: 'Coordinate with allies for tactical advantage',
    type: 'active',
    category: 'combat',
    apCost: 2,
    range: 0,
    cooldown: 4,
    requiresTarget: false,
    skillRequirements: [{ skill: 'military_tactics', level: 3 }],
    baseSuccessRate: 10,
    effects: {
      allyAccuracyBonus: { base: 0.2, scaling: 'skill' },
      allyDefenseBonus: { base: 0.15, scaling: 'skill' },
      formation: { base: 1, scaling: 'none' },
      duration: { base: 8, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'military_tactics', multiplier: 2.8 },
        { skill: 'leadership', multiplier: 2.5 }
      ]
    }
  },

  {
    key: 'gladius_thrust',
    name: 'Gladius Thrust',
    description: 'A precise thrust with the Roman short sword',
    type: 'active',
    category: 'combat',
    apCost: 2,

    range: 1,
    cooldown: 1,
    requiresTarget: true,
    skillRequirements: [{ skill: 'one_handed', level: 4 }],
    baseSuccessRate: 5,
    effects: {
      damage: { base: 14, scaling: 'weapon' },
      armorPiercing: { base: 0.4, scaling: 'skill' },
      accuracy: { base: 0.9, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'one_handed', multiplier: 2.8 },
        { skill: 'precision', multiplier: 2.2 }
      ]
    }
  },

  // Advanced Centurion (Levels 6-15)
  {
    key: 'phalanx_formation',
    name: 'Phalanx Formation',
    description: 'Form an impenetrable wall of shields and spears',
    type: 'active',
    category: 'combat',
    apCost: 4,
    range: 0,
    cooldown: 8,
    requiresTarget: false,
    skillRequirements: [{ skill: 'shields', level: 10 }],
    baseSuccessRate: -15,
    effects: {
      groupDefenseBonus: { base: 0.5, scaling: 'skill' },
      frontlineImmunity: { base: 1, scaling: 'none' },
      counterattackBonus: { base: 0.3, scaling: 'skill' },
      duration: { base: 10, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'shields', multiplier: 2.8 },
        { skill: 'military_tactics', multiplier: 2.5 }
      ]
    }
  },

  {
    key: 'tactical_command',
    name: 'Tactical Command',
    description: 'Issue battlefield commands that enhance ally effectiveness',
    type: 'active',
    category: 'combat',
    apCost: 3,
    range: 8,
    cooldown: 5,
    requiresTarget: false,
    skillRequirements: [{ skill: 'leadership', level: 12 }],
    baseSuccessRate: -10,
    effects: {
      allyAPBonus: { base: 1, scaling: 'skill' },
      coordinatedStrike: { base: 0.4, scaling: 'skill' },
      moraleBuff: { base: 0.25, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'leadership', multiplier: 3.0 },
        { skill: 'military_tactics', multiplier: 2.8 }
      ]
    }
  },

  // Master Centurion (Levels 16+)
  {
    key: 'legion_commander',
    name: 'Legion Commander',
    description: 'Command the battlefield with legendary tactical prowess',
    type: 'active',
    category: 'combat',
    apCost: 6,
    range: 12,
    cooldown: 12,
    requiresTarget: false,
    skillRequirements: [{ skill: 'military_tactics', level: 20 }],
    baseSuccessRate: -30,
    effects: {
      battlefieldControl: { base: 1, scaling: 'skill' },
      massCoordination: { base: 0.6, scaling: 'skill' },
      tacticalSupremacy: { base: 0.8, scaling: 'skill' },
      duration: { base: 15, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'military_tactics', multiplier: 4.0 },
        { skill: 'leadership', multiplier: 3.5 }
      ]
    }
  }
];

// Combine all physical damage abilities
const PHYSICAL_DAMAGE_ABILITIES = [
  ...WARRIOR_ABILITIES,
  ...RANGER_ABILITIES,
  ...PIRATE_ABILITIES,
  ...BARBARIAN_ABILITIES,
  ...CENTURION_ABILITIES
];

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PHYSICAL_DAMAGE_ABILITIES,
    WARRIOR_ABILITIES,
    RANGER_ABILITIES,
    PIRATE_ABILITIES,
    BARBARIAN_ABILITIES,
    CENTURION_ABILITIES
  };
} else {
  window.PHYSICAL_DAMAGE_ABILITIES = PHYSICAL_DAMAGE_ABILITIES;
  window.WARRIOR_ABILITIES = WARRIOR_ABILITIES;
  window.RANGER_ABILITIES = RANGER_ABILITIES;
  window.PIRATE_ABILITIES = PIRATE_ABILITIES;
  window.BARBARIAN_ABILITIES = BARBARIAN_ABILITIES;
  window.CENTURION_ABILITIES = CENTURION_ABILITIES;
}