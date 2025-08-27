/**
 * Hybrid Abilities
 * Advanced abilities that require multiple skills to unlock
 * These represent the mastery of combining different disciplines
 */

const HYBRID_ABILITIES = [
  // Combat + Magic Hybrid
  {
    key: 'divine_smite',
    name: 'Divine Smite',
    description: 'Channel divine power through your weapon for a devastating holy strike',
    type: 'active',
    category: 'hybrid',
    apCost: 4,
    range: 1,
    cooldown: 5,
    requiresTarget: true,
    skillRequirements: [
      { skill: 'one_handed', level: 10 }, // Example from user: Maces 10
      { skill: 'healing', level: 15 },    // Example from user: Healing 15  
      { skill: 'religion', level: 5 }     // Example from user: Religion 5
    ],
    prerequisites: ['precise_strike', 'flame_bolt'], // Must know basic combat and magic
    baseSuccessRate: -35, // Very difficult hybrid technique
    effects: {
      damage: { base: 25, scaling: 'weapon_and_skill' },
      holyDamage: { base: 15, scaling: 'skill' }, // Bonus vs undead
      accuracy: { base: 0.8, scaling: 'skill' },
      healSelf: { base: 8, scaling: 'skill' }, // Heals user when used
      stunChance: { base: 0.3, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'one_handed', multiplier: 2.0 },
        { skill: 'healing', multiplier: 2.5 },
        { skill: 'religion', multiplier: 3.0 }
      ]
    },
    unlockMessage: "Your martial prowess, healing knowledge, and divine faith combine into Divine Smite!"
  },

  // Stealth + Combat Hybrid  
  {
    key: 'shadow_strike',
    name: 'Shadow Strike',
    description: 'Strike from the shadows with deadly precision',
    type: 'active',
    category: 'hybrid',
    apCost: 3,
    range: 2, // Can teleport to target
    cooldown: 4,
    requiresTarget: true,
    skillRequirements: [
      { skill: 'sneaking', level: 8 },
      { skill: 'one_handed', level: 6 },
      { skill: 'critical_strikes', level: 4 }
    ],
    prerequisites: ['backstab', 'precise_strike'],
    baseSuccessRate: -30,
    effects: {
      damage: { base: 18, scaling: 'weapon_and_skill' },
      criticalChance: { base: 0.6, scaling: 'skill' }, // High crit chance
      accuracy: { base: 0.9, scaling: 'skill' },
      shadowTeleport: { base: 2, scaling: 'skill' }, // Can appear behind target
      requiresConcealment: { base: 0.5, scaling: 'skill' } // Easier from stealth
    },
    scaling: {
      effectiveness: [
        { skill: 'sneaking', multiplier: 2.8 },
        { skill: 'one_handed', multiplier: 2.2 },
        { skill: 'critical_strikes', multiplier: 3.0 }
      ]
    }
  },

  // Magic + Crafting Hybrid
  {
    key: 'elemental_weapon',
    name: 'Elemental Weapon',
    description: 'Enchant your weapon with elemental power',
    type: 'active',
    category: 'hybrid',
    apCost: 3,
    range: 0,
    cooldown: 0, // Can switch elements freely
    requiresTarget: false,
    skillRequirements: [
      { skill: 'enchanting', level: 12 },
      { skill: 'elemental_fire', level: 8 }, // Need at least one element
      { skill: 'weapon_mastery', level: 6 }
    ],
    prerequisites: ['flame_bolt'], // Must know basic elemental magic
    baseSuccessRate: -20,
    effects: {
      weaponEnchantment: { base: 8, scaling: 'skill' },
      elementalDamage: { base: 6, scaling: 'skill' },
      duration: { base: 10, scaling: 'skill' },
      elementalEffect: { base: 1, scaling: 'skill' } // Burns, freezes, etc.
    },
    scaling: {
      effectiveness: [
        { skill: 'enchanting', multiplier: 2.5 },
        { skill: 'elemental_fire', multiplier: 2.0 }, // Or other elements
        { skill: 'weapon_mastery', multiplier: 1.8 }
      ]
    }
  },

  // Athletics + Combat Hybrid
  {
    key: 'mounted_charge',
    name: 'Mounted Charge',
    description: 'Charge on horseback with devastating lance attack',
    type: 'active',
    category: 'hybrid',
    apCost: 4,
    range: 8, // Long charge distance
    cooldown: 6,
    requiresTarget: true,
    skillRequirements: [
      { skill: 'horsemanship', level: 10 },
      { skill: 'polearms', level: 8 },
      { skill: 'mounted_combat', level: 5 }
    ],
    prerequisites: ['heavy_swing'], // Basic weapon skill
    baseSuccessRate: -25,
    effects: {
      damage: { base: 30, scaling: 'weapon_and_skill' }, // Very high damage
      knockback: { base: 3, scaling: 'skill' },
      knockdownChance: { base: 0.7, scaling: 'skill' },
      chargeMovement: { base: 8, scaling: 'skill' },
      accuracy: { base: 0.75, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'horsemanship', multiplier: 2.5 },
        { skill: 'polearms', multiplier: 2.8 },
        { skill: 'mounted_combat', multiplier: 2.0 }
      ]
    }
  },

  // Magic + Social Hybrid
  {
    key: 'bardic_inspiration',
    name: 'Bardic Inspiration',
    description: 'Use magical performance to inspire allies and demoralize foes',
    type: 'active',
    category: 'hybrid', 
    apCost: 3,
    range: 6,
    cooldown: 4,
    requiresTarget: false, // Area effect
    skillRequirements: [
      { skill: 'bardic_magic', level: 10 },
      { skill: 'leadership', level: 8 },
      { skill: 'entertainment', level: 6 }
    ],
    prerequisites: [],
    baseSuccessRate: -15,
    effects: {
      allyDamageBonus: { base: 0.2, scaling: 'skill' },
      allyAccuracyBonus: { base: 0.15, scaling: 'skill' },
      enemyMoraleDebuff: { base: 0.1, scaling: 'skill' },
      duration: { base: 6, scaling: 'skill' },
      areaEffect: { base: 4, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'bardic_magic', multiplier: 2.8 },
        { skill: 'leadership', multiplier: 2.2 },
        { skill: 'entertainment', multiplier: 2.0 }
      ]
    }
  },

  // Survival + Magic Hybrid
  {
    key: 'nature_bond',
    name: 'Nature Bond',
    description: 'Channel the power of the wilderness to heal and strengthen yourself',
    type: 'active',
    category: 'hybrid',
    apCost: 4,
    range: 0,
    cooldown: 8,
    requiresTarget: false,
    skillRequirements: [
      { skill: 'herbalism', level: 12 },
      { skill: 'healing', level: 10 },
      { skill: 'wilderness_lore', level: 8 }
    ],
    prerequisites: ['frost_shard'], // Basic nature magic
    baseSuccessRate: -10, // Easier in natural environments
    effects: {
      healing: { base: 25, scaling: 'skill' },
      poisonCure: { base: 1, scaling: 'none' },
      tempStrengthBonus: { base: 5, scaling: 'skill' },
      tempToughnessBonus: { base: 3, scaling: 'skill' },
      duration: { base: 12, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'herbalism', multiplier: 2.5 },
        { skill: 'healing', multiplier: 2.8 },
        { skill: 'wilderness_lore', multiplier: 2.0 }
      ]
    }
  },

  // Academic + Combat Hybrid
  {
    key: 'tactical_strike',
    name: 'Tactical Strike',
    description: 'Use knowledge of anatomy and warfare to exploit enemy weaknesses',
    type: 'active',
    category: 'hybrid',
    apCost: 3,
    range: 1,
    cooldown: 3,
    requiresTarget: true,
    skillRequirements: [
      { skill: 'military_tactics', level: 10 },
      { skill: 'monster_lore', level: 8 },
      { skill: 'one_handed', level: 6 }
    ],
    prerequisites: ['precise_strike'],
    baseSuccessRate: -20,
    effects: {
      damage: { base: 16, scaling: 'weapon_and_skill' },
      armorPiercing: { base: 0.5, scaling: 'skill' },
      accuracy: { base: 0.95, scaling: 'skill' }, // Very accurate
      debuffChance: { base: 0.4, scaling: 'skill' }, // Apply weakness
      criticalChance: { base: 0.3, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'military_tactics', multiplier: 2.5 },
        { skill: 'monster_lore', multiplier: 2.8 },
        { skill: 'one_handed', multiplier: 2.0 }
      ]
    }
  },

  // Mental + Magic Hybrid
  {
    key: 'battle_meditation',
    name: 'Battle Meditation',
    description: 'Enter a focused trance that enhances combat abilities',
    type: 'active',
    category: 'hybrid',
    apCost: 2,
    range: 0,
    cooldown: 0, // Can maintain continuously
    requiresTarget: false,
    skillRequirements: [
      { skill: 'meditation', level: 7 },
      { skill: 'tactical_combat', level: 5 },
      { skill: 'concentration', level: 3 }
    ],
    prerequisites: [],
    baseSuccessRate: 0,
    effects: {
      focusDuration: { base: 8, scaling: 'skill' },
      accuracyBonus: { base: 0.2, scaling: 'skill' },
      criticalBonus: { base: 0.15, scaling: 'skill' },
      apRegenBonus: { base: 0.5, scaling: 'skill' },
      concentrationProtection: { base: 0.8, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'meditation', multiplier: 3.0 },
        { skill: 'tactical_combat', multiplier: 2.0 },
        { skill: 'concentration', multiplier: 2.5 }
      ]
    }
  },

  // Ranged + Stealth Hybrid
  {
    key: 'assassinate',
    name: 'Assassinate',
    description: 'A silent, long-range kill shot from concealment',
    type: 'active',
    category: 'hybrid',
    apCost: 5,
    range: 10,
    cooldown: 10,
    requiresTarget: true,
    skillRequirements: [
      { skill: 'archery', level: 15 },
      { skill: 'sneaking', level: 12 },
      { skill: 'called_shots', level: 10 },
      { skill: 'assassination', level: 8 }
    ],
    prerequisites: ['headshot', 'aimed_shot'],
    baseSuccessRate: -50, // Extremely difficult
    effects: {
      damage: { base: 50, scaling: 'weapon_and_skill' }, // Potential one-shot
      accuracy: { base: 0.6, scaling: 'skill' }, // Hard to pull off
      criticalChance: { base: 0.9, scaling: 'skill' },
      instantKillChance: { base: 0.1, scaling: 'skill' }, // Small chance of instant kill
      requiresConcealment: { base: 1, scaling: 'none' } // Must be hidden
    },
    scaling: {
      effectiveness: [
        { skill: 'archery', multiplier: 2.0 },
        { skill: 'sneaking', multiplier: 2.5 },
        { skill: 'called_shots', multiplier: 3.0 },
        { skill: 'assassination', multiplier: 3.5 }
      ]
    },
    unlockMessage: "Your mastery of archery, stealth, and assassination culminates in the ultimate technique!"
  },

  // Passive Hybrid - Multi-weapon Mastery
  {
    key: 'weapon_master',
    name: 'Weapon Master',
    description: 'Legendary expertise with all weapon types',
    type: 'passive',
    category: 'hybrid',
    skillRequirements: [
      { skill: 'one_handed', level: 20 },
      { skill: 'two_handed', level: 15 },
      { skill: 'polearms', level: 10 },
      { skill: 'weapon_mastery', level: 15 }
    ],
    prerequisites: [],
    baseSuccessRate: 100,
    effects: {
      allWeaponBonus: { base: 0.25, scaling: 'skill' },
      weaponSwapSpeed: { base: 0, scaling: 'none' }, // Instant weapon swaps
      criticalMastery: { base: 0.1, scaling: 'skill' },
      durabilityBonus: { base: 0.5, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'one_handed', multiplier: 0.3 },
        { skill: 'two_handed', multiplier: 0.3 },
        { skill: 'polearms', multiplier: 0.3 },
        { skill: 'weapon_mastery', multiplier: 0.8 }
      ]
    },
    unlockMessage: "You have achieved true mastery over all forms of weaponry!"
  },

  // Magical Hybrid - Elemental Attunement
  {
    key: 'elemental_attunement',
    name: 'Elemental Attunement',
    description: 'Perfect harmony with all elemental forces',
    type: 'passive',
    category: 'hybrid',
    skillRequirements: [
      { skill: 'elemental_fire', level: 8 },
      { skill: 'elemental_ice', level: 8 },
      { skill: 'elemental_lightning', level: 8 },
      { skill: 'elemental_earth', level: 8 }
    ],
    prerequisites: [],
    baseSuccessRate: 100,
    effects: {
      allElementalBonus: { base: 0.15, scaling: 'skill' },
      elementalResistance: { base: 0.3, scaling: 'skill' },
      arcaneEfficiency: { base: 0.2, scaling: 'skill' },
      elementalAffinitySwap: { base: 1, scaling: 'none' } // Can change affinities
    },
    scaling: {
      effectiveness: [
        { skill: 'elemental_fire', multiplier: 0.4 },
        { skill: 'elemental_ice', multiplier: 0.4 },
        { skill: 'elemental_lightning', multiplier: 0.4 },
        { skill: 'elemental_earth', multiplier: 0.4 }
      ]
    },
    unlockMessage: "You have achieved perfect balance with all elemental forces!"
  }
];

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    HYBRID_ABILITIES
  };
} else {
  window.HYBRID_ABILITIES = HYBRID_ABILITIES;
}