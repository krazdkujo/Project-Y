/**
 * Exploration Abilities
 * Non-combat abilities for exploration, crafting, social interaction, and world interaction
 * Organized by utility types and class themes
 */

// SURVIVAL & WILDERNESS ABILITIES
const SURVIVAL_ABILITIES = [
  // Basic Survival (Levels 1-5)
  {
    key: 'track_creature',
    name: 'Track Creature',
    description: 'Follow the trail of a creature through the wilderness',
    type: 'active',
    category: 'exploration',
    apCost: 3,
    range: 0,
    cooldown: 0,
    requiresTarget: false,
    skillRequirements: [{ skill: 'tracking', level: 1 }],
    baseSuccessRate: 20,
    effects: {
      trackingDuration: { base: 60, scaling: 'skill' }, // Minutes
      trailAge: { base: 4, scaling: 'skill' }, // Hours old
      creatureInfo: { base: 0.3, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'tracking', multiplier: 3.0 },
        { skill: 'monster_lore', multiplier: 2.0 }
      ]
    }
  },

  {
    key: 'find_water',
    name: 'Find Water',
    description: 'Locate clean drinking water in the wilderness',
    type: 'active',
    category: 'exploration',
    apCost: 4,
    range: 0,
    cooldown: 0,
    requiresTarget: false,
    skillRequirements: [{ skill: 'water_finding', level: 2 }],
    baseSuccessRate: 15,
    effects: {
      searchRadius: { base: 100, scaling: 'skill' }, // Meters
      waterQuality: { base: 0.6, scaling: 'skill' },
      timeToFind: { base: -20, scaling: 'skill' } // Negative = faster
    },
    scaling: {
      effectiveness: [
        { skill: 'water_finding', multiplier: 3.2 },
        { skill: 'geography', multiplier: 2.0 }
      ]
    }
  },

  {
    key: 'forage_food',
    name: 'Forage Food',
    description: 'Gather edible plants, fruits, and small game',
    type: 'active',
    category: 'exploration',
    apCost: 5,
    range: 0,
    cooldown: 0,
    requiresTarget: false,
    skillRequirements: [{ skill: 'foraging', level: 1 }],
    baseSuccessRate: 25,
    effects: {
      foodQuantity: { base: 3, scaling: 'skill' }, // Rations
      poisonAvoidance: { base: 0.8, scaling: 'skill' },
      nutritionalValue: { base: 0.7, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'foraging', multiplier: 2.8 },
        { skill: 'herbalism', multiplier: 2.2 }
      ]
    }
  },

  {
    key: 'weather_prediction',
    name: 'Weather Prediction',
    description: 'Read natural signs to predict upcoming weather changes',
    type: 'active',
    category: 'exploration',
    apCost: 2,
    range: 0,
    cooldown: 0,
    requiresTarget: false,
    skillRequirements: [{ skill: 'weather_sense', level: 3 }],
    baseSuccessRate: 10,
    effects: {
      predictionAccuracy: { base: 0.6, scaling: 'skill' },
      timeRange: { base: 12, scaling: 'skill' }, // Hours ahead
      severityWarning: { base: 0.4, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'weather_sense', multiplier: 3.0 },
        { skill: 'astronomy', multiplier: 1.8 }
      ]
    }
  },

  // Advanced Survival (Levels 6-15)
  {
    key: 'build_shelter',
    name: 'Build Shelter',
    description: 'Construct a temporary shelter for protection from elements',
    type: 'active',
    category: 'exploration',
    apCost: 8,
    range: 0,
    cooldown: 0,
    requiresTarget: false,
    skillRequirements: [{ skill: 'shelter_building', level: 4 }],
    baseSuccessRate: -5,
    effects: {
      shelterQuality: { base: 0.7, scaling: 'skill' },
      constructionTime: { base: -30, scaling: 'skill' }, // Minutes saved
      weatherResistance: { base: 0.8, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'shelter_building', multiplier: 2.8 },
        { skill: 'woodworking', multiplier: 2.0 }
      ]
    }
  },

  {
    key: 'master_tracker',
    name: 'Master Tracker',
    description: 'Track multiple creatures simultaneously with perfect accuracy',
    type: 'active',
    category: 'exploration',
    apCost: 5,
    range: 0,
    cooldown: 0,
    requiresTarget: false,
    skillRequirements: [{ skill: 'tracking', level: 12 }],
    baseSuccessRate: -20,
    effects: {
      multipleTargets: { base: 3, scaling: 'skill' },
      perfectAccuracy: { base: 0.9, scaling: 'skill' },
      ancientTrails: { base: 48, scaling: 'skill' } // Hours old
    },
    scaling: {
      effectiveness: [
        { skill: 'tracking', multiplier: 3.5 },
        { skill: 'alertness', multiplier: 2.5 }
      ]
    }
  },

  // Master Survival (Levels 16+)
  {
    key: 'wilderness_mastery',
    name: 'Wilderness Mastery',
    description: 'Become one with nature, gaining supernatural survival abilities',
    type: 'active',
    category: 'exploration',
    apCost: 10,
    range: 0,
    cooldown: 0,
    requiresTarget: false,
    skillRequirements: [{ skill: 'wilderness_lore', level: 18 }],
    baseSuccessRate: -30,
    effects: {
      environmentalImmunity: { base: 1, scaling: 'none' },
      animalCommunication: { base: 1, scaling: 'skill' },
      naturalCamouflage: { base: 0.9, scaling: 'skill' },
      duration: { base: 24, scaling: 'skill' } // Hours
    },
    scaling: {
      effectiveness: [
        { skill: 'wilderness_lore', multiplier: 3.8 },
        { skill: 'animal_handling', multiplier: 3.0 }
      ]
    }
  }
];

// CRAFTING & CREATION ABILITIES
const CRAFTING_ABILITIES = [
  // Basic Crafting (Levels 1-5)
  {
    key: 'basic_smithing',
    name: 'Basic Smithing',
    description: 'Forge simple weapons and tools from metal',
    type: 'active',
    category: 'exploration',
    apCost: 6,
    range: 0,
    cooldown: 0,
    requiresTarget: false,
    skillRequirements: [{ skill: 'blacksmithing', level: 2 }],
    baseSuccessRate: 0,
    effects: {
      craftingSuccess: { base: 0.7, scaling: 'skill' },
      qualityBonus: { base: 0.1, scaling: 'skill' },
      materialEfficiency: { base: 0.8, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'blacksmithing', multiplier: 3.0 },
        { skill: 'strength', multiplier: 1.5 }
      ]
    }
  },

  {
    key: 'brew_potion',
    name: 'Brew Potion',
    description: 'Create magical potions with various effects',
    type: 'active',
    category: 'exploration',
    apCost: 8,
    apCost: 3,
    range: 0,
    cooldown: 0,
    requiresTarget: false,
    skillRequirements: [{ skill: 'alchemy', level: 3 }],
    baseSuccessRate: -10,
    effects: {
      potionPotency: { base: 0.6, scaling: 'skill' },
      brewingTime: { base: -20, scaling: 'skill' }, // Minutes saved
      sideEffectReduction: { base: 0.7, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'alchemy', multiplier: 3.2 },
        { skill: 'herbalism', multiplier: 2.5 }
      ]
    }
  },

  {
    key: 'enchant_item',
    name: 'Enchant Item',
    description: 'Imbue mundane items with magical properties',
    type: 'active',
    category: 'exploration',
    apCost: 10,
    apCost: 5,
    range: 0,
    cooldown: 0,
    requiresTarget: false,
    skillRequirements: [{ skill: 'enchanting', level: 5 }],
    baseSuccessRate: -15,
    effects: {
      enchantmentPower: { base: 0.5, scaling: 'skill' },
      enchantmentDuration: { base: 168, scaling: 'skill' }, // Hours
      multipleEnchantments: { base: 0.2, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'enchanting', multiplier: 3.5 },
        { skill: 'arcane_lore', multiplier: 2.8 }
      ]
    }
  },

  {
    key: 'masterwork_creation',
    name: 'Masterwork Creation',
    description: 'Craft items of exceptional quality and durability',
    type: 'active',
    category: 'exploration',
    apCost: 12,
    range: 0,
    cooldown: 0,
    requiresTarget: false,
    skillRequirements: [{ skill: 'blacksmithing', level: 15 }],
    baseSuccessRate: -25,
    effects: {
      masterworkChance: { base: 0.3, scaling: 'skill' },
      qualityMultiplier: { base: 1.5, scaling: 'skill' },
      durabilityBonus: { base: 2.0, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'blacksmithing', multiplier: 3.8 },
        { skill: 'patience', multiplier: 2.5 }
      ]
    }
  }
];

// SOCIAL & INTERACTION ABILITIES
const SOCIAL_ABILITIES = [
  // Basic Social (Levels 1-5)
  {
    key: 'fast_talk',
    name: 'Fast Talk',
    description: 'Confuse and distract with rapid, persuasive speech',
    type: 'active',
    category: 'exploration',
    apCost: 3,
    range: 2,
    cooldown: 2,
    requiresTarget: true,
    skillRequirements: [{ skill: 'persuasion', level: 2 }],
    baseSuccessRate: 10,
    effects: {
      confusionDuration: { base: 5, scaling: 'skill' }, // Rounds
      distractionLevel: { base: 0.4, scaling: 'skill' },
      escapeChance: { base: 0.3, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'persuasion', multiplier: 2.8 },
        { skill: 'deception', multiplier: 2.2 }
      ]
    }
  },

  {
    key: 'gather_information',
    name: 'Gather Information',
    description: 'Extract useful information through social interaction',
    type: 'active',
    category: 'exploration',
    apCost: 4,
    range: 2,
    cooldown: 0,
    requiresTarget: true,
    skillRequirements: [{ skill: 'networking', level: 3 }],
    baseSuccessRate: 5,
    effects: {
      informationQuality: { base: 0.6, scaling: 'skill' },
      secretChance: { base: 0.2, scaling: 'skill' },
      suspicionReduction: { base: 0.7, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'networking', multiplier: 3.0 },
        { skill: 'empathy', multiplier: 2.5 }
      ]
    }
  },

  {
    key: 'negotiate_price',
    name: 'Negotiate Price',
    description: 'Haggle for better deals in trade and commerce',
    type: 'active',
    category: 'exploration',
    apCost: 2,
    range: 2,
    cooldown: 0,
    requiresTarget: true,
    skillRequirements: [{ skill: 'bargaining', level: 1 }],
    baseSuccessRate: 15,
    effects: {
      priceReduction: { base: 0.15, scaling: 'skill' },
      sellPriceIncrease: { base: 0.12, scaling: 'skill' },
      relationshipImprovement: { base: 0.1, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'bargaining', multiplier: 3.0 },
        { skill: 'reputation', multiplier: 1.8 }
      ]
    }
  },

  // Advanced Social (Levels 6-15)
  {
    key: 'diplomatic_immunity',
    name: 'Diplomatic Immunity',
    description: 'Use diplomatic skills to avoid conflict and consequences',
    type: 'active',
    category: 'exploration',
    apCost: 5,
    range: 3,
    cooldown: 8,
    requiresTarget: false,
    skillRequirements: [{ skill: 'diplomacy', level: 8 }],
    baseSuccessRate: -10,
    effects: {
      conflictAvoidance: { base: 0.7, scaling: 'skill' },
      authorityRespect: { base: 0.8, scaling: 'skill' },
      peacefulSolution: { base: 0.6, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'diplomacy', multiplier: 3.2 },
        { skill: 'nobility', multiplier: 2.5 }
      ]
    }
  },

  {
    key: 'master_performer',
    name: 'Master Performer',
    description: 'Captivate audiences with extraordinary artistic skill',
    type: 'active',
    category: 'exploration',
    apCost: 6,
    range: 5,
    cooldown: 0,
    requiresTarget: false,
    skillRequirements: [{ skill: 'entertainment', level: 12 }],
    baseSuccessRate: -15,
    effects: {
      audienceSize: { base: 20, scaling: 'skill' },
      tipAmount: { base: 15, scaling: 'skill' }, // Gold coins
      fameIncrease: { base: 0.3, scaling: 'skill' },
      duration: { base: 30, scaling: 'skill' } // Minutes
    },
    scaling: {
      effectiveness: [
        { skill: 'entertainment', multiplier: 3.5 },
        { skill: 'singing', multiplier: 2.8 }
      ]
    }
  },

  // Master Social (Levels 16+)
  {
    key: 'legendary_presence',
    name: 'Legendary Presence',
    description: 'Your reputation and charisma command respect from all',
    type: 'active',
    category: 'exploration',
    apCost: 8,
    range: 8,
    cooldown: 24, // Once per day
    requiresTarget: false,
    skillRequirements: [{ skill: 'reputation', level: 18 }],
    baseSuccessRate: -25,
    effects: {
      universalRespect: { base: 0.9, scaling: 'skill' },
      doorOpening: { base: 0.8, scaling: 'skill' },
      priceReduction: { base: 0.4, scaling: 'skill' },
      duration: { base: 8, scaling: 'skill' } // Hours
    },
    scaling: {
      effectiveness: [
        { skill: 'reputation', multiplier: 4.0 },
        { skill: 'leadership', multiplier: 3.5 }
      ]
    }
  }
];

// INVESTIGATION & KNOWLEDGE ABILITIES
const INVESTIGATION_ABILITIES = [
  // Basic Investigation (Levels 1-5)
  {
    key: 'examine_closely',
    name: 'Examine Closely',
    description: 'Carefully study an object or area for hidden details',
    type: 'active',
    category: 'exploration',
    apCost: 3,
    range: 1,
    cooldown: 0,
    requiresTarget: false,
    skillRequirements: [{ skill: 'investigation', level: 1 }],
    baseSuccessRate: 20,
    effects: {
      detailLevel: { base: 0.6, scaling: 'skill' },
      hiddenFeatures: { base: 0.3, scaling: 'skill' },
      ageEstimation: { base: 0.5, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'investigation', multiplier: 3.0 },
        { skill: 'alertness', multiplier: 2.0 }
      ]
    }
  },

  {
    key: 'research_topic',
    name: 'Research Topic',
    description: 'Study books and records to learn about a specific subject',
    type: 'active',
    category: 'exploration',
    apCost: 8,
    range: 0,
    cooldown: 0,
    requiresTarget: false,
    skillRequirements: [{ skill: 'history', level: 3 }],
    baseSuccessRate: 5,
    effects: {
      informationDepth: { base: 0.5, scaling: 'skill' },
      researchTime: { base: -30, scaling: 'skill' }, // Minutes saved
      accuracyBonus: { base: 0.7, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'history', multiplier: 2.8 },
        { skill: 'linguistics', multiplier: 2.2 }
      ]
    }
  },

  {
    key: 'identify_magic',
    name: 'Identify Magic',
    description: 'Determine the magical properties of enchanted items',
    type: 'active',
    category: 'exploration',
    apCost: 4,
    apCost: 3,
    range: 1,
    cooldown: 1,
    requiresTarget: true,
    skillRequirements: [{ skill: 'arcane_lore', level: 4 }],
    baseSuccessRate: -5,
    effects: {
      identificationAccuracy: { base: 0.7, scaling: 'skill' },
      hiddenProperties: { base: 0.4, scaling: 'skill' },
      curseDetection: { base: 0.6, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'arcane_lore', multiplier: 3.2 },
        { skill: 'aura_sight', multiplier: 2.8 }
      ]
    }
  },

  // Advanced Investigation (Levels 6-15)
  {
    key: 'forensic_analysis',
    name: 'Forensic Analysis',
    description: 'Reconstruct past events through careful examination of evidence',
    type: 'active',
    category: 'exploration',
    apCost: 10,
    range: 2,
    cooldown: 0,
    requiresTarget: false,
    skillRequirements: [{ skill: 'investigation', level: 10 }],
    baseSuccessRate: -15,
    effects: {
      timelineAccuracy: { base: 0.8, scaling: 'skill' },
      eventReconstruction: { base: 0.6, scaling: 'skill' },
      culpritIdentification: { base: 0.4, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'investigation', multiplier: 3.5 },
        { skill: 'logic', multiplier: 3.0 }
      ]
    }
  },

  {
    key: 'ancient_knowledge',
    name: 'Ancient Knowledge',
    description: 'Access knowledge of long-lost civilizations and secrets',
    type: 'active',
    category: 'exploration',
    apCost: 6,
    apCost: 4,
    range: 0,
    cooldown: 0,
    requiresTarget: false,
    skillRequirements: [{ skill: 'history', level: 12 }],
    baseSuccessRate: -20,
    effects: {
      ancientSecrets: { base: 0.5, scaling: 'skill' },
      languageComprehension: { base: 0.7, scaling: 'skill' },
      culturalInsight: { base: 0.8, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'history', multiplier: 3.8 },
        { skill: 'linguistics', multiplier: 3.2 }
      ]
    }
  },

  // Master Investigation (Levels 16+)
  {
    key: 'omniscient_scholar',
    name: 'Omniscient Scholar',
    description: 'Tap into the collective knowledge of ages past',
    type: 'active',
    category: 'exploration',
    apCost: 12,
    apCost: 7,
    range: 0,
    cooldown: 12,
    requiresTarget: false,
    skillRequirements: [{ skill: 'arcane_lore', level: 20 }],
    baseSuccessRate: -35,
    effects: {
      universalKnowledge: { base: 0.9, scaling: 'skill' },
      prophecyAccess: { base: 0.6, scaling: 'skill' },
      cosmicTruths: { base: 0.4, scaling: 'skill' },
      duration: { base: 10, scaling: 'skill' } // Minutes
    },
    scaling: {
      effectiveness: [
        { skill: 'arcane_lore', multiplier: 4.0 },
        { skill: 'divination', multiplier: 3.5 }
      ]
    }
  }
];

// THIEVERY & STEALTH ABILITIES
const THIEVERY_ABILITIES = [
  // Basic Thievery (Levels 1-5)
  {
    key: 'pick_lock',
    name: 'Pick Lock',
    description: 'Open locked doors, chests, and containers',
    type: 'active',
    category: 'exploration',
    apCost: 4,
    range: 1,
    cooldown: 0,
    requiresTarget: true,
    skillRequirements: [{ skill: 'lockpicking', level: 1 }],
    baseSuccessRate: 15,
    effects: {
      successChance: { base: 0.6, scaling: 'skill' },
      timeRequired: { base: -10, scaling: 'skill' }, // Seconds saved
      quietness: { base: 0.7, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'lockpicking', multiplier: 3.5 },
        { skill: 'nimble_fingers', multiplier: 2.5 }
      ]
    }
  },

  {
    key: 'pickpocket',
    name: 'Pickpocket',
    description: 'Steal items from unsuspecting targets',
    type: 'active',
    category: 'exploration',
    apCost: 3,
    range: 1,
    cooldown: 2,
    requiresTarget: true,
    skillRequirements: [{ skill: 'pickpocketing', level: 2 }],
    baseSuccessRate: -5,
    effects: {
      stealthiness: { base: 0.7, scaling: 'skill' },
      itemValue: { base: 0.4, scaling: 'skill' },
      detectionAvoidance: { base: 0.8, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'pickpocketing', multiplier: 3.0 },
        { skill: 'misdirection', multiplier: 2.8 }
      ]
    }
  },

  {
    key: 'disable_trap',
    name: 'Disable Trap',
    description: 'Safely disarm mechanical and magical traps',
    type: 'active',
    category: 'exploration',
    apCost: 6,
    range: 1,
    cooldown: 0,
    requiresTarget: true,
    skillRequirements: [{ skill: 'trap_disarmament', level: 3 }],
    baseSuccessRate: -10,
    effects: {
      disarmChance: { base: 0.6, scaling: 'skill' },
      safeguardSelf: { base: 0.9, scaling: 'skill' },
      salvagedComponents: { base: 0.3, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'trap_disarmament', multiplier: 3.5 },
        { skill: 'engineering', multiplier: 2.2 }
      ]
    }
  },

  // Advanced Thievery (Levels 6-15)
  {
    key: 'master_lockpick',
    name: 'Master Lockpick',
    description: 'Open even the most complex locks with ease',
    type: 'active',
    category: 'exploration',
    apCost: 2,
    range: 1,
    cooldown: 0,
    requiresTarget: true,
    skillRequirements: [{ skill: 'lockpicking', level: 12 }],
    baseSuccessRate: -20,
    effects: {
      allLocksOpenable: { base: 0.9, scaling: 'skill' },
      instantaneous: { base: 0.8, scaling: 'skill' },
      silentOperation: { base: 0.95, scaling: 'skill' }
    },
    scaling: {
      effectiveness: [
        { skill: 'lockpicking', multiplier: 4.0 },
        { skill: 'engineering_theory', multiplier: 2.8 }
      ]
    }
  },

  {
    key: 'grand_heist',
    name: 'Grand Heist',
    description: 'Plan and execute an elaborate theft operation',
    type: 'active',
    category: 'exploration',
    apCost: 15,
    range: 0,
    cooldown: 48, // Once every two days
    requiresTarget: false,
    skillRequirements: [{ skill: 'pickpocketing', level: 15 }],
    baseSuccessRate: -30,
    effects: {
      heistComplexity: { base: 3, scaling: 'skill' },
      valueMultiplier: { base: 5, scaling: 'skill' },
      escapeSuccess: { base: 0.8, scaling: 'skill' },
      planningTime: { base: 4, scaling: 'skill' } // Hours
    },
    scaling: {
      effectiveness: [
        { skill: 'pickpocketing', multiplier: 3.5 },
        { skill: 'planning', multiplier: 3.8 }
      ]
    }
  }
];

// Combine all exploration abilities
const EXPLORATION_ABILITIES = [
  ...SURVIVAL_ABILITIES,
  ...CRAFTING_ABILITIES,
  ...SOCIAL_ABILITIES,
  ...INVESTIGATION_ABILITIES,
  ...THIEVERY_ABILITIES
];

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    EXPLORATION_ABILITIES,
    SURVIVAL_ABILITIES,
    CRAFTING_ABILITIES,
    SOCIAL_ABILITIES,
    INVESTIGATION_ABILITIES,
    THIEVERY_ABILITIES
  };
} else {
  window.EXPLORATION_ABILITIES = EXPLORATION_ABILITIES;
  window.SURVIVAL_ABILITIES = SURVIVAL_ABILITIES;
  window.CRAFTING_ABILITIES = CRAFTING_ABILITIES;
  window.SOCIAL_ABILITIES = SOCIAL_ABILITIES;
  window.INVESTIGATION_ABILITIES = INVESTIGATION_ABILITIES;
  window.THIEVERY_ABILITIES = THIEVERY_ABILITIES;
}