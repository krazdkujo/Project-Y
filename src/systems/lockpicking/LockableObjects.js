/**
 * Lockable Objects Definitions
 * Defines doors, chests, containers, and traps for the lockpicking system
 */

// Door Definitions
const LOCKABLE_DOORS = {
  wooden_door: {
    id: 'wooden_door',
    name: 'Wooden Door',
    type: 'door',
    symbol: '+', // ASCII symbol for closed door
    openSymbol: '/', // ASCII symbol for open door
    lockDifficulty: 1,
    durability: 100,
    canBreakDown: true,
    breakdownDifficulty: 15, // Strength check DC
    blocksMovement: true,
    blocksLineOfSight: true,
    keyId: null,
    trapped: false,
    hasAlarm: false,
    description: 'A simple wooden door with a basic lock',
    lootTable: null // Doors don't contain loot
  },

  reinforced_door: {
    id: 'reinforced_door',
    name: 'Reinforced Door',
    type: 'door',
    symbol: '≡',
    openSymbol: '≡',
    lockDifficulty: 2,
    durability: 200,
    canBreakDown: true,
    breakdownDifficulty: 25,
    blocksMovement: true,
    blocksLineOfSight: true,
    keyId: null,
    trapped: false,
    hasAlarm: false,
    description: 'A sturdy door with iron reinforcements and a complex lock'
  },

  vault_door: {
    id: 'vault_door',
    name: 'Vault Door',
    type: 'door',
    symbol: '▓',
    openSymbol: '▓',
    lockDifficulty: 4,
    durability: 500,
    canBreakDown: false,
    breakdownDifficulty: 50,
    blocksMovement: true,
    blocksLineOfSight: true,
    keyId: 'vault_master_key',
    trapped: true,
    hasAlarm: true,
    alertLevel: 'high',
    description: 'A massive vault door with multiple locks and security measures'
  },

  secret_door: {
    id: 'secret_door',
    name: 'Secret Door',
    type: 'door',
    symbol: '#', // Appears as wall until discovered
    openSymbol: '/',
    lockDifficulty: 2,
    durability: 150,
    canBreakDown: true,
    breakdownDifficulty: 20,
    blocksMovement: true,
    blocksLineOfSight: true,
    keyId: null,
    trapped: false,
    hasAlarm: false,
    hidden: true,
    detectionDifficulty: 15, // Perception check DC to find
    description: 'A cleverly concealed door hidden in the wall'
  }
};

// Chest and Container Definitions
const LOCKABLE_CONTAINERS = {
  wooden_chest: {
    id: 'wooden_chest',
    name: 'Wooden Chest',
    type: 'chest',
    symbol: '□',
    openSymbol: '▢',
    lockDifficulty: 1,
    durability: 80,
    canBreakDown: true,
    breakdownDifficulty: 12,
    blocksMovement: false,
    blocksLineOfSight: false,
    keyId: null,
    trapped: false,
    hasAlarm: false,
    lootTable: 'basic_treasure',
    description: 'A simple wooden chest with brass fittings',
    goldRange: { min: 10, max: 50 },
    itemChance: 0.6
  },

  iron_chest: {
    id: 'iron_chest',
    name: 'Iron Chest',
    type: 'chest',
    symbol: '■',
    openSymbol: '□',
    lockDifficulty: 2,
    durability: 150,
    canBreakDown: true,
    breakdownDifficulty: 20,
    blocksMovement: false,
    blocksLineOfSight: false,
    keyId: null,
    trapped: false,
    hasAlarm: false,
    lootTable: 'good_treasure',
    description: 'A sturdy iron chest with a complex lock mechanism',
    goldRange: { min: 25, max: 100 },
    itemChance: 0.75
  },

  treasure_chest: {
    id: 'treasure_chest',
    name: 'Treasure Chest',
    type: 'chest',
    symbol: '♦',
    openSymbol: '◊',
    lockDifficulty: 3,
    durability: 200,
    canBreakDown: false,
    breakdownDifficulty: 35,
    blocksMovement: false,
    blocksLineOfSight: false,
    keyId: null,
    trapped: true,
    hasAlarm: false,
    lootTable: 'rare_treasure',
    description: 'An ornate treasure chest adorned with precious metals',
    goldRange: { min: 50, max: 200 },
    itemChance: 0.9
  },

  master_chest: {
    id: 'master_chest',
    name: 'Master\'s Chest',
    type: 'chest',
    symbol: '♠',
    openSymbol: '♤',
    lockDifficulty: 4,
    durability: 300,
    canBreakDown: false,
    breakdownDifficulty: 45,
    blocksMovement: false,
    blocksLineOfSight: false,
    keyId: 'master_key',
    trapped: true,
    hasAlarm: true,
    alertLevel: 'medium',
    lootTable: 'legendary_treasure',
    description: 'The personal chest of a master thief or mage',
    goldRange: { min: 100, max: 500 },
    itemChance: 0.95
  },

  supply_crate: {
    id: 'supply_crate',
    name: 'Supply Crate',
    type: 'container',
    symbol: '▣',
    openSymbol: '▢',
    lockDifficulty: 1,
    durability: 60,
    canBreakDown: true,
    breakdownDifficulty: 8,
    blocksMovement: false,
    blocksLineOfSight: false,
    keyId: null,
    trapped: false,
    hasAlarm: false,
    lootTable: 'supplies',
    description: 'A wooden crate containing various supplies',
    goldRange: { min: 5, max: 25 },
    itemChance: 0.8
  },

  lockbox: {
    id: 'lockbox',
    name: 'Lockbox',
    type: 'container',
    symbol: '□',
    openSymbol: '▢',
    lockDifficulty: 2,
    durability: 120,
    canBreakDown: false,
    breakdownDifficulty: 25,
    blocksMovement: false,
    blocksLineOfSight: false,
    keyId: null,
    trapped: false,
    hasAlarm: false,
    lootTable: 'valuables',
    description: 'A small but secure lockbox made of steel',
    goldRange: { min: 20, max: 80 },
    itemChance: 0.7
  }
};

// Trap Definitions
const TRAP_DEFINITIONS = {
  needle_trap: {
    id: 'needle_trap',
    name: 'Poison Needle Trap',
    type: 'trap',
    complexity: 1,
    maxDamage: 8,
    damageType: 'poison',
    effects: ['poisoned'],
    detectionDifficulty: 10,
    disarmDifficulty: 12,
    description: 'A small needle coated with poison',
    triggeredByLockpicking: true,
    triggeredByOpening: true,
    triggeredByMovement: false,
    resetable: false
  },

  blade_trap: {
    id: 'blade_trap',
    name: 'Spring Blade Trap',
    type: 'trap',
    complexity: 2,
    maxDamage: 15,
    damageType: 'slashing',
    effects: ['bleeding'],
    detectionDifficulty: 12,
    disarmDifficulty: 15,
    description: 'A spring-loaded blade that swings when triggered',
    triggeredByLockpicking: true,
    triggeredByOpening: true,
    triggeredByMovement: false,
    resetable: true
  },

  gas_trap: {
    id: 'gas_trap',
    name: 'Toxic Gas Trap',
    type: 'trap',
    complexity: 3,
    maxDamage: 12,
    damageType: 'poison',
    effects: ['poisoned', 'stunned'],
    detectionDifficulty: 15,
    disarmDifficulty: 18,
    description: 'Releases a cloud of poisonous gas when triggered',
    triggeredByLockpicking: false,
    triggeredByOpening: true,
    triggeredByMovement: false,
    resetable: true,
    areaEffect: true,
    radius: 2
  },

  explosion_trap: {
    id: 'explosion_trap',
    name: 'Explosive Trap',
    type: 'trap',
    complexity: 4,
    maxDamage: 25,
    damageType: 'fire',
    effects: ['burned', 'stunned'],
    detectionDifficulty: 18,
    disarmDifficulty: 22,
    description: 'A small explosive device triggered by tampering',
    triggeredByLockpicking: true,
    triggeredByOpening: true,
    triggeredByMovement: false,
    resetable: false,
    areaEffect: true,
    radius: 3,
    destroysContainer: true
  },

  alarm_trap: {
    id: 'alarm_trap',
    name: 'Magical Alarm',
    type: 'trap',
    complexity: 2,
    maxDamage: 0,
    damageType: 'none',
    effects: ['alarmed'],
    detectionDifficulty: 14,
    disarmDifficulty: 16,
    description: 'A magical ward that alerts guards when triggered',
    triggeredByLockpicking: true,
    triggeredByOpening: true,
    triggeredByMovement: false,
    resetable: true,
    areaEffect: false,
    alertsGuards: true
  }
};

// Loot Tables for containers
const LOOT_TABLES = {
  basic_treasure: [
    { item: 'gold', weight: 40, quantity: { min: 10, max: 30 } },
    { item: 'health_potion', weight: 20, quantity: { min: 1, max: 2 } },
    { item: 'lockpicks', weight: 15, quantity: { min: 1, max: 3 } },
    { item: 'iron_dagger', weight: 10, quantity: 1 },
    { item: 'leather_armor', weight: 8, quantity: 1 },
    { item: 'rope', weight: 5, quantity: { min: 1, max: 2 } },
    { item: 'torch', weight: 2, quantity: { min: 1, max: 3 } }
  ],

  good_treasure: [
    { item: 'gold', weight: 35, quantity: { min: 25, max: 75 } },
    { item: 'health_potion', weight: 18, quantity: { min: 2, max: 3 } },
    { item: 'mana_potion', weight: 15, quantity: { min: 1, max: 2 } },
    { item: 'steel_sword', weight: 12, quantity: 1 },
    { item: 'chain_mail', weight: 10, quantity: 1 },
    { item: 'masterwork_lockpicks', weight: 6, quantity: 1 },
    { item: 'magic_scroll', weight: 3, quantity: 1 },
    { item: 'gem', weight: 1, quantity: 1 }
  ],

  rare_treasure: [
    { item: 'gold', weight: 30, quantity: { min: 50, max: 150 } },
    { item: 'greater_health_potion', weight: 20, quantity: { min: 2, max: 4 } },
    { item: 'enchanted_weapon', weight: 15, quantity: 1 },
    { item: 'magic_armor', weight: 12, quantity: 1 },
    { item: 'rare_gem', weight: 8, quantity: { min: 1, max: 2 } },
    { item: 'spell_component', weight: 8, quantity: { min: 2, max: 5 } },
    { item: 'ancient_key', weight: 5, quantity: 1 },
    { item: 'artifact_fragment', weight: 2, quantity: 1 }
  ],

  legendary_treasure: [
    { item: 'gold', weight: 25, quantity: { min: 100, max: 400 } },
    { item: 'legendary_weapon', weight: 20, quantity: 1 },
    { item: 'legendary_armor', weight: 18, quantity: 1 },
    { item: 'precious_gem', weight: 15, quantity: { min: 1, max: 3 } },
    { item: 'master_key', weight: 10, quantity: 1 },
    { item: 'spell_tome', weight: 7, quantity: 1 },
    { item: 'ancient_artifact', weight: 3, quantity: 1 },
    { item: 'unique_item', weight: 2, quantity: 1 }
  ],

  supplies: [
    { item: 'food_ration', weight: 30, quantity: { min: 2, max: 5 } },
    { item: 'bandage', weight: 25, quantity: { min: 1, max: 3 } },
    { item: 'torch', weight: 20, quantity: { min: 2, max: 6 } },
    { item: 'rope', weight: 15, quantity: { min: 1, max: 2 } },
    { item: 'oil_flask', weight: 8, quantity: { min: 1, max: 2 } },
    { item: 'flint_and_steel', weight: 2, quantity: 1 }
  ],

  valuables: [
    { item: 'gold', weight: 35, quantity: { min: 20, max: 60 } },
    { item: 'silver_ring', weight: 20, quantity: 1 },
    { item: 'gold_necklace', weight: 15, quantity: 1 },
    { item: 'gem', weight: 15, quantity: { min: 1, max: 2 } },
    { item: 'ornate_dagger', weight: 10, quantity: 1 },
    { item: 'ivory_figurine', weight: 3, quantity: 1 },
    { item: 'rare_coin', weight: 2, quantity: { min: 1, max: 3 } }
  ]
};

// Key Definitions
const KEY_DEFINITIONS = {
  skeleton_key: {
    id: 'skeleton_key',
    name: 'Skeleton Key',
    description: 'A master key that opens most basic locks',
    worksOn: ['wooden_door', 'wooden_chest', 'supply_crate'],
    rarity: 'uncommon'
  },

  master_key: {
    id: 'master_key',
    name: 'Master Key',
    description: 'An ornate key for the most valuable treasures',
    worksOn: ['master_chest', 'vault_door'],
    rarity: 'rare'
  },

  vault_master_key: {
    id: 'vault_master_key',
    name: 'Vault Master Key',
    description: 'The ultimate key for the most secure vaults',
    worksOn: ['vault_door', 'master_chest'],
    rarity: 'legendary'
  },

  ancient_key: {
    id: 'ancient_key',
    name: 'Ancient Key',
    description: 'A mysterious key from a forgotten age',
    worksOn: ['secret_door', 'treasure_chest'],
    rarity: 'rare'
  }
};

/**
 * Utility functions for object management
 */
class LockableObjectsManager {
  static getDoorDefinition(doorId) {
    return LOCKABLE_DOORS[doorId] || null;
  }

  static getContainerDefinition(containerId) {
    return LOCKABLE_CONTAINERS[containerId] || null;
  }

  static getTrapDefinition(trapId) {
    return TRAP_DEFINITIONS[trapId] || null;
  }

  static getLootTable(tableId) {
    return LOOT_TABLES[tableId] || [];
  }

  static getKeyDefinition(keyId) {
    return KEY_DEFINITIONS[keyId] || null;
  }

  static getAllDoors() {
    return Object.values(LOCKABLE_DOORS);
  }

  static getAllContainers() {
    return Object.values(LOCKABLE_CONTAINERS);
  }

  static getAllTraps() {
    return Object.values(TRAP_DEFINITIONS);
  }

  static getObjectsByDifficulty(difficulty) {
    const doors = Object.values(LOCKABLE_DOORS).filter(d => d.lockDifficulty === difficulty);
    const containers = Object.values(LOCKABLE_CONTAINERS).filter(c => c.lockDifficulty === difficulty);
    return { doors, containers };
  }

  static generateLoot(lootTableId, quantity = 1) {
    const table = LOOT_TABLES[lootTableId];
    if (!table || table.length === 0) {
      return [];
    }

    const loot = [];
    const totalWeight = table.reduce((sum, item) => sum + item.weight, 0);

    for (let i = 0; i < quantity; i++) {
      let roll = Math.random() * totalWeight;
      
      for (const item of table) {
        roll -= item.weight;
        if (roll <= 0) {
          const amount = typeof item.quantity === 'object' 
            ? Math.floor(Math.random() * (item.quantity.max - item.quantity.min + 1)) + item.quantity.min
            : item.quantity;
          
          loot.push({
            item: item.item,
            quantity: amount
          });
          break;
        }
      }
    }

    return loot;
  }
}

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LOCKABLE_DOORS,
    LOCKABLE_CONTAINERS,
    TRAP_DEFINITIONS,
    LOOT_TABLES,
    KEY_DEFINITIONS,
    LockableObjectsManager
  };
} else {
  window.LOCKABLE_DOORS = LOCKABLE_DOORS;
  window.LOCKABLE_CONTAINERS = LOCKABLE_CONTAINERS;
  window.TRAP_DEFINITIONS = TRAP_DEFINITIONS;
  window.LOOT_TABLES = LOOT_TABLES;
  window.KEY_DEFINITIONS = KEY_DEFINITIONS;
  window.LockableObjectsManager = LockableObjectsManager;
}