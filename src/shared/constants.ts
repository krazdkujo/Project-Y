// AP System Configuration Constants
export const AP_SYSTEM = {
  // Core AP Settings
  MAX_AP: 8,
  MIN_AP_PER_TURN: 2,
  MAX_AP_PER_TURN: 3,
  DEFAULT_AP_PER_TURN: 2,
  
  // Turn Timing (in milliseconds)
  TURN_TIME_LIMIT: 10000, // 10 seconds
  MIN_TURN_TIME: 5000,    // 5 seconds
  TURN_WARNING_TIME: 3000, // 3 seconds before timeout
  
  // Performance Targets
  MAX_TURN_PROCESSING_TIME: 100, // ms
  MAX_INITIATIVE_CALC_TIME: 50,  // ms
  MAX_AP_VALIDATION_TIME: 25,    // ms
  MAX_FORMATION_CALC_TIME: 75,   // ms
} as const;

// Free Action Types (0 AP cost)
export const FREE_ACTIONS = {
  MOVE: {
    type: 'MOVE',
    apCost: 0,
    immediate: true,
    maxRange: 1, // squares
  },
  BASIC_ATTACK: {
    type: 'BASIC_ATTACK',
    apCost: 0,
    immediate: true,
    range: 1,
  },
  BASIC_DEFENSE: {
    type: 'BASIC_DEFENSE',
    apCost: 0,
    immediate: true,
    defenseBonus: 2,
  },
} as const;

// Basic AP Abilities (1-3 AP cost)
export const BASIC_AP_ABILITIES = [
  {
    id: 'power_strike',
    name: 'Power Strike',
    apCost: 2,
    skillRequirement: { skill: 'swords', level: 25 },
    effect: { type: 'damage_multiplier', value: 1.5 }
  },
  {
    id: 'fireball',
    name: 'Fireball',
    apCost: 3,
    skillRequirement: { skill: 'fire_magic', level: 30 },
    effect: { type: 'area_damage', damage: '2d6', radius: 2 }
  },
  {
    id: 'heal',
    name: 'Heal',
    apCost: 2,
    skillRequirement: { skill: 'healing_magic', level: 20 },
    effect: { type: 'heal', amount: '1d8+2' }
  },
  {
    id: 'shield_bash',
    name: 'Shield Bash',
    apCost: 1,
    skillRequirement: { skill: 'combat', level: 15 },
    effect: { type: 'damage_multiplier', value: 0.8 }
  },
  {
    id: 'quick_shot',
    name: 'Quick Shot',
    apCost: 1,
    skillRequirement: { skill: 'archery', level: 20 },
    effect: { type: 'damage_multiplier', value: 0.9 }
  }
] as const;

// Master AP Abilities (4-6 AP cost)
export const MASTER_AP_ABILITIES = [
  {
    id: 'whirlwind_attack',
    name: 'Whirlwind Attack',
    apCost: 5,
    skillRequirement: { skill: 'swords', level: 75 },
    effect: { 
      type: 'multi_target_attack', 
      targets: 'adjacent_enemies',
      damage_multiplier: 1.2 
    }
  },
  {
    id: 'meteor',
    name: 'Meteor',
    apCost: 6,
    skillRequirement: { skill: 'fire_magic', level: 80 },
    effect: {
      type: 'delayed_area_damage',
      delay_turns: 2,
      damage: '4d6+6',
      radius: 3
    }
  },
  {
    id: 'mass_heal',
    name: 'Mass Heal',
    apCost: 4,
    skillRequirement: { skill: 'healing_magic', level: 60 },
    effect: {
      type: 'area_heal',
      amount: '2d8+4',
      radius: 2
    }
  }
] as const;

// Legendary AP Abilities (7-8 AP cost)
export const LEGENDARY_AP_ABILITIES = [
  {
    id: 'resurrection',
    name: 'Resurrection',
    apCost: 8,
    skillRequirement: { skill: 'healing_magic', level: 90 },
    effect: {
      type: 'revive_ally',
      health_percentage: 50,
      range: 3
    }
  },
  {
    id: 'time_stop',
    name: 'Time Stop',
    apCost: 7,
    skillRequirement: { skill: 'arcane_magic', level: 85 },
    effect: {
      type: 'extra_turns',
      turns: 2,
      restrictions: ['no_damage_abilities']
    }
  }
] as const;

// Formation Bonuses
export const FORMATION_BONUSES = {
  FRONT_LINE_PROTECTION: {
    type: 'protection',
    value: 2, // +2 defense per protected ally
    requirement: 'adjacent_back_line'
  },
  COORDINATED_ATTACK: {
    type: 'accuracy',
    value: 5, // +5% accuracy
    requirement: 'adjacent_melee'
  },
  FLANKING_MANEUVER: {
    type: 'damage',
    value: 10, // +10% damage
    requirement: 'enemy_flanked'
  },
  MAGICAL_RESONANCE: {
    type: 'ap_generation',
    value: 1, // +1 AP per turn
    requirement: 'adjacent_casters'
  }
} as const;

// Game Configuration
export const GAME_CONFIG = {
  MAX_PLAYERS_PER_LOBBY: 8,
  MIN_PLAYERS_TO_START: 2,
  LOBBY_TIMEOUT: 300000, // 5 minutes
  RECONNECTION_TIMEOUT: 60000, // 1 minute
  
  // Initiative System
  INITIATIVE_DIE: 20,
  BASE_INITIATIVE_BONUS: 0,
  SKILL_INITIATIVE_DIVISOR: 10, // skill level / 10 = bonus
  
  // Health and Damage
  BASE_HEALTH: 100,
  BASE_DAMAGE: 10,
  CRITICAL_HIT_MULTIPLIER: 2,
  CRITICAL_HIT_CHANCE: 5, // 5% base chance
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  INSUFFICIENT_AP: 'Not enough Action Points to perform this ability',
  SKILL_REQUIREMENT_NOT_MET: 'Skill level requirement not met for this ability',
  INVALID_TARGET: 'Invalid target for this action',
  OUT_OF_RANGE: 'Target is out of range for this action',
  ABILITY_ON_COOLDOWN: 'Ability is still on cooldown',
  NOT_YOUR_TURN: 'It is not your turn to act',
  PLAYER_DISCONNECTED: 'Player has disconnected from the game',
  TURN_TIMEOUT: 'Turn time limit exceeded',
  INVALID_ACTION: 'Invalid action type or format',
  GAME_NOT_FOUND: 'Game session not found',
  LOBBY_FULL: 'Lobby is full, cannot join'
} as const;

// Network and Protocol
export const NETWORK = {
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  RECONNECTION_ATTEMPTS: 3,
  MESSAGE_TIMEOUT: 5000, // 5 seconds
  SYNC_INTERVAL: 1000, // 1 second for game state sync
} as const;

// Skill Names (for validation)
export const SKILLS = {
  // Combat Skills
  COMBAT: 'combat',
  SWORDS: 'swords',
  ARCHERY: 'archery',
  SHIELDS: 'shields',
  
  // Magic Schools
  FIRE_MAGIC: 'fire_magic',
  WATER_MAGIC: 'water_magic',
  EARTH_MAGIC: 'earth_magic',
  AIR_MAGIC: 'air_magic',
  HEALING_MAGIC: 'healing_magic',
  ARCANE_MAGIC: 'arcane_magic',
  
  // Utility Skills
  STEALTH: 'stealth',
  ATHLETICS: 'athletics',
  SURVIVAL: 'survival',
  LEADERSHIP: 'leadership',
} as const;