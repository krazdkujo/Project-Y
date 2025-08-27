/**
 * Weapon System for Character Equipment
 * Defines starting weapons and equipment stats
 */

const WEAPON_CATEGORIES = {
  ONE_HANDED: {
    name: 'One-Handed Weapons',
    skillRequired: 'one_handed',
    weapons: {
      'rusty_dagger': {
        name: 'Rusty Dagger',
        description: 'A worn dagger, barely sharp enough to cut bread',
        damage: [1, 3],
        accuracy: 85,
        durability: 50,
        maxDurability: 50,
        weight: 1,
        value: 2,
        rarity: 'common',
        requirements: { one_handed: 0 }
      },
      'wooden_club': {
        name: 'Wooden Club',
        description: 'A simple wooden club, crude but effective',
        damage: [2, 4],
        accuracy: 80,
        durability: 60,
        maxDurability: 60,
        weight: 2,
        value: 3,
        rarity: 'common',
        requirements: { one_handed: 0 }
      },
      'cracked_sword': {
        name: 'Cracked Sword',
        description: 'An old sword with a crack down the blade',
        damage: [2, 5],
        accuracy: 75,
        durability: 40,
        maxDurability: 40,
        weight: 3,
        value: 5,
        rarity: 'common',
        requirements: { one_handed: 1 }
      }
    }
  },

  TWO_HANDED: {
    name: 'Two-Handed Weapons',
    skillRequired: 'two_handed',
    weapons: {
      'broken_staff': {
        name: 'Broken Staff',
        description: 'A staff missing its top third, still usable',
        damage: [1, 4],
        accuracy: 70,
        durability: 45,
        maxDurability: 45,
        weight: 2,
        value: 3,
        rarity: 'common',
        requirements: { two_handed: 0 }
      },
      'dull_axe': {
        name: 'Dull Axe',
        description: 'An axe that has seen better days, needs sharpening',
        damage: [3, 6],
        accuracy: 65,
        durability: 55,
        maxDurability: 55,
        weight: 4,
        value: 6,
        rarity: 'common',
        requirements: { two_handed: 1 }
      },
      'splintered_spear': {
        name: 'Splintered Spear',
        description: 'A spear with splinters along the shaft',
        damage: [2, 5],
        accuracy: 75,
        durability: 50,
        maxDurability: 50,
        weight: 3,
        value: 4,
        rarity: 'common',
        requirements: { two_handed: 0 }
      }
    }
  },

  RANGED: {
    name: 'Ranged Weapons',
    skillRequired: 'archery',
    weapons: {
      'bent_bow': {
        name: 'Bent Bow',
        description: 'A bow with a slight bend, affects accuracy',
        damage: [1, 4],
        accuracy: 70,
        durability: 40,
        maxDurability: 40,
        weight: 2,
        value: 4,
        rarity: 'common',
        requirements: { archery: 0 },
        ammoType: 'arrows'
      },
      'sling': {
        name: 'Simple Sling',
        description: 'A basic leather sling for hurling stones',
        damage: [1, 3],
        accuracy: 65,
        durability: 60,
        maxDurability: 60,
        weight: 1,
        value: 2,
        rarity: 'common',
        requirements: { archery: 0 },
        ammoType: 'stones'
      },
      'makeshift_crossbow': {
        name: 'Makeshift Crossbow',
        description: 'A crossbow cobbled together from scrap',
        damage: [2, 4],
        accuracy: 75,
        durability: 35,
        maxDurability: 35,
        weight: 4,
        value: 7,
        rarity: 'common',
        requirements: { archery: 1 },
        ammoType: 'bolts'
      }
    }
  },

  THROWN: {
    name: 'Thrown Weapons',
    skillRequired: 'throwing',
    weapons: {
      'throwing_rocks': {
        name: 'Sharp Rocks',
        description: 'A pouch of sharp throwing stones',
        damage: [1, 2],
        accuracy: 60,
        durability: 999, // Consumable but many uses
        maxDurability: 999,
        weight: 2,
        value: 1,
        rarity: 'common',
        requirements: { throwing: 0 },
        quantity: 20
      },
      'rusty_knives': {
        name: 'Rusty Throwing Knives',
        description: 'Old knives repurposed for throwing',
        damage: [1, 3],
        accuracy: 70,
        durability: 999,
        maxDurability: 999,
        weight: 1,
        value: 3,
        rarity: 'common',
        requirements: { throwing: 0 },
        quantity: 10
      }
    }
  }
};

// Starting weapon sets for character creation
const STARTING_WEAPON_SETS = {
  'warrior': {
    name: 'Warrior Starter',
    weapons: ['rusty_dagger', 'wooden_club', 'cracked_sword'],
    description: 'Basic melee weapons for close combat'
  },
  'ranger': {
    name: 'Ranger Starter', 
    weapons: ['bent_bow', 'sling', 'rusty_dagger'],
    description: 'Ranged weapons with a backup melee option'
  },
  'guardian': {
    name: 'Guardian Starter',
    weapons: ['broken_staff', 'dull_axe', 'splintered_spear'],
    description: 'Heavy weapons for defensive fighters'
  },
  'scout': {
    name: 'Scout Starter',
    weapons: ['throwing_rocks', 'rusty_knives', 'sling'],
    description: 'Light weapons for hit-and-run tactics'
  },
  'survivor': {
    name: 'Survivor Starter',
    weapons: ['wooden_club', 'throwing_rocks', 'makeshift_crossbow'],
    description: 'Improvised weapons for the resourceful'
  }
};

class WeaponSystem {
  constructor() {
    // Helper methods for weapon management
  }

  // Get weapon by ID
  getWeapon(weaponId) {
    for (const categoryKey in WEAPON_CATEGORIES) {
      const category = WEAPON_CATEGORIES[categoryKey];
      if (category.weapons[weaponId]) {
        return {
          id: weaponId,
          category: categoryKey,
          skillRequired: category.skillRequired,
          ...category.weapons[weaponId]
        };
      }
    }
    return null;
  }

  // Get all starting weapons
  getStartingWeapons() {
    const startingWeapons = [];
    
    for (const categoryKey in WEAPON_CATEGORIES) {
      const category = WEAPON_CATEGORIES[categoryKey];
      for (const weaponId in category.weapons) {
        const weapon = category.weapons[weaponId];
        if (weapon.requirements[category.skillRequired] <= 1) {
          startingWeapons.push({
            id: weaponId,
            category: categoryKey,
            skillRequired: category.skillRequired,
            ...weapon
          });
        }
      }
    }
    
    return startingWeapons;
  }

  // Get weapons by category
  getWeaponsByCategory(categoryKey) {
    const category = WEAPON_CATEGORIES[categoryKey];
    if (!category) return [];
    
    return Object.keys(category.weapons).map(weaponId => ({
      id: weaponId,
      category: categoryKey,
      skillRequired: category.skillRequired,
      ...category.weapons[weaponId]
    }));
  }

  // Create weapon instance for character
  createWeaponInstance(weaponId, characterId) {
    const weaponTemplate = this.getWeapon(weaponId);
    if (!weaponTemplate) return null;

    return {
      id: `${weaponId}_${characterId}_${Date.now()}`,
      templateId: weaponId,
      ownerId: characterId,
      condition: weaponTemplate.durability / weaponTemplate.maxDurability,
      currentDurability: weaponTemplate.durability,
      equipped: false,
      ...weaponTemplate
    };
  }
}

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WEAPON_CATEGORIES, STARTING_WEAPON_SETS, WeaponSystem };
} else {
  window.WEAPON_CATEGORIES = WEAPON_CATEGORIES;
  window.STARTING_WEAPON_SETS = STARTING_WEAPON_SETS;
  window.WeaponSystem = WeaponSystem;
}