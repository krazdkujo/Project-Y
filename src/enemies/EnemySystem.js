/**
 * Enemy System with Tier-Based Difficulty
 * Manages enemy types, tiers, and difficulty-based spawning
 */

class EnemySystem {
  constructor() {
    // Difficulty settings affect which tiers can spawn on which floors
    this.difficultySettings = {
      easy: {
        name: 'Easy',
        description: 'Enemies are generally weaker and lower tier',
        tierOffsets: {
          min: -1,  // Can spawn enemies 1 tier lower than floor
          max: 0    // Max tier is same as floor
        },
        statMultiplier: 0.8,
        lootMultiplier: 0.9
      },
      normal: {
        name: 'Normal',
        description: 'Standard enemy distribution',
        tierOffsets: {
          min: 0,   // Min tier is same as floor
          max: 1    // Can spawn enemies 1 tier higher
        },
        statMultiplier: 1.0,
        lootMultiplier: 1.0
      },
      hard: {
        name: 'Hard',
        description: 'Enemies are tougher and higher tier',
        tierOffsets: {
          min: 0,   // Min tier is same as floor
          max: 2    // Can spawn enemies 2 tiers higher
        },
        statMultiplier: 1.2,
        lootMultiplier: 1.2
      },
      nightmare: {
        name: 'Nightmare',
        description: 'Face enemies far above your level',
        tierOffsets: {
          min: 1,   // Min tier is 1 above floor
          max: 3    // Can spawn enemies 3 tiers higher
        },
        statMultiplier: 1.5,
        lootMultiplier: 1.5
      }
    };

    // Define enemy tiers (Tier 1 = Floor 1 baseline, etc.)
    this.enemyTiers = {
      // TIER 1 - Dungeon Floor 1 (Weak enemies)
      1: {
        goblin: {
          name: 'Goblin',
          tier: 1,
          baseStats: {
            health: 15,
            maxHealth: 15,
            damage: [1, 3],
            defense: 0,
            accuracy: 70,
            evasion: 10,
            initiative: 5,
            ap: 2,
            maxAP: 2
          },
          abilities: ['basic_attack'],
          loot: { gold: [1, 5], itemChance: 0.1 },
          xpValue: 5
        },
        rat_giant: {
          name: 'Giant Rat',
          tier: 1,
          baseStats: {
            health: 10,
            maxHealth: 10,
            damage: [1, 2],
            defense: 0,
            accuracy: 80,
            evasion: 20,
            initiative: 8,
            ap: 3,
            maxAP: 3
          },
          abilities: ['basic_attack', 'quick_bite'],
          loot: { gold: [0, 3], itemChance: 0.05 },
          xpValue: 3
        },
        skeleton_weak: {
          name: 'Brittle Skeleton',
          tier: 1,
          baseStats: {
            health: 20,
            maxHealth: 20,
            damage: [2, 4],
            defense: 2,
            accuracy: 60,
            evasion: 5,
            initiative: 3,
            ap: 2,
            maxAP: 2
          },
          abilities: ['basic_attack'],
          loot: { gold: [2, 6], itemChance: 0.15 },
          xpValue: 6
        }
      },

      // TIER 2 - Dungeon Floor 2
      2: {
        orc_warrior: {
          name: 'Orc Warrior',
          tier: 2,
          baseStats: {
            health: 30,
            maxHealth: 30,
            damage: [3, 6],
            defense: 2,
            accuracy: 75,
            evasion: 10,
            initiative: 6,
            ap: 2,
            maxAP: 2
          },
          abilities: ['basic_attack', 'heavy_swing'],
          loot: { gold: [5, 15], itemChance: 0.2 },
          xpValue: 12
        },
        wolf_dire: {
          name: 'Dire Wolf',
          tier: 2,
          baseStats: {
            health: 25,
            maxHealth: 25,
            damage: [2, 5],
            defense: 1,
            accuracy: 85,
            evasion: 15,
            initiative: 10,
            ap: 3,
            maxAP: 3
          },
          abilities: ['basic_attack', 'howl', 'pounce'],
          loot: { gold: [3, 10], itemChance: 0.15 },
          xpValue: 10
        },
        bandit: {
          name: 'Bandit',
          tier: 2,
          baseStats: {
            health: 22,
            maxHealth: 22,
            damage: [2, 4],
            defense: 1,
            accuracy: 80,
            evasion: 20,
            initiative: 7,
            ap: 3,
            maxAP: 3
          },
          abilities: ['basic_attack', 'steal', 'smoke_bomb'],
          loot: { gold: [8, 20], itemChance: 0.25 },
          xpValue: 11
        }
      },

      // TIER 3 - Dungeon Floor 3
      3: {
        ogre: {
          name: 'Ogre',
          tier: 3,
          baseStats: {
            health: 50,
            maxHealth: 50,
            damage: [5, 10],
            defense: 4,
            accuracy: 65,
            evasion: 5,
            initiative: 4,
            ap: 2,
            maxAP: 2
          },
          abilities: ['basic_attack', 'club_smash', 'rage'],
          loot: { gold: [10, 30], itemChance: 0.3 },
          xpValue: 25
        },
        dark_elf: {
          name: 'Dark Elf',
          tier: 3,
          baseStats: {
            health: 35,
            maxHealth: 35,
            damage: [3, 7],
            defense: 2,
            accuracy: 90,
            evasion: 25,
            initiative: 12,
            ap: 4,
            maxAP: 4
          },
          abilities: ['basic_attack', 'shadow_strike', 'poison_blade'],
          loot: { gold: [15, 25], itemChance: 0.35 },
          xpValue: 22
        },
        elemental_lesser: {
          name: 'Lesser Elemental',
          tier: 3,
          baseStats: {
            health: 40,
            maxHealth: 40,
            damage: [4, 8],
            defense: 3,
            accuracy: 75,
            evasion: 10,
            initiative: 8,
            ap: 3,
            maxAP: 3
          },
          abilities: ['basic_attack', 'elemental_burst'],
          loot: { gold: [12, 28], itemChance: 0.3 },
          xpValue: 20
        }
      },

      // TIER 4 - Dungeon Floor 4
      4: {
        troll: {
          name: 'Troll',
          tier: 4,
          baseStats: {
            health: 75,
            maxHealth: 75,
            damage: [6, 12],
            defense: 5,
            accuracy: 70,
            evasion: 10,
            initiative: 5,
            ap: 2,
            maxAP: 2
          },
          abilities: ['basic_attack', 'regeneration', 'boulder_throw'],
          loot: { gold: [20, 50], itemChance: 0.4 },
          xpValue: 40
        },
        wraith: {
          name: 'Wraith',
          tier: 4,
          baseStats: {
            health: 45,
            maxHealth: 45,
            damage: [5, 9],
            defense: 1,
            accuracy: 85,
            evasion: 35,
            initiative: 14,
            ap: 4,
            maxAP: 4
          },
          abilities: ['basic_attack', 'life_drain', 'phase_shift'],
          loot: { gold: [25, 40], itemChance: 0.45 },
          xpValue: 35
        },
        knight_corrupted: {
          name: 'Corrupted Knight',
          tier: 4,
          baseStats: {
            health: 60,
            maxHealth: 60,
            damage: [7, 14],
            defense: 8,
            accuracy: 80,
            evasion: 15,
            initiative: 7,
            ap: 3,
            maxAP: 3
          },
          abilities: ['basic_attack', 'shield_bash', 'dark_blade'],
          loot: { gold: [30, 60], itemChance: 0.5 },
          xpValue: 45
        }
      },

      // TIER 5 - Dungeon Floor 5 (Boss Floor)
      5: {
        dragon_young: {
          name: 'Young Dragon',
          tier: 5,
          baseStats: {
            health: 150,
            maxHealth: 150,
            damage: [10, 20],
            defense: 10,
            accuracy: 85,
            evasion: 20,
            initiative: 10,
            ap: 4,
            maxAP: 4
          },
          abilities: ['basic_attack', 'fire_breath', 'tail_sweep', 'dragon_roar'],
          loot: { gold: [100, 200], itemChance: 0.8 },
          xpValue: 100,
          isBoss: true
        },
        lich: {
          name: 'Lich',
          tier: 5,
          baseStats: {
            health: 100,
            maxHealth: 100,
            damage: [8, 15],
            defense: 6,
            accuracy: 90,
            evasion: 25,
            initiative: 12,
            ap: 5,
            maxAP: 5
          },
          abilities: ['basic_attack', 'death_bolt', 'summon_undead', 'bone_shield'],
          loot: { gold: [80, 150], itemChance: 0.75 },
          xpValue: 90,
          isBoss: true
        },
        demon_lord: {
          name: 'Demon Lord',
          tier: 5,
          baseStats: {
            health: 120,
            maxHealth: 120,
            damage: [12, 18],
            defense: 8,
            accuracy: 80,
            evasion: 15,
            initiative: 9,
            ap: 4,
            maxAP: 4
          },
          abilities: ['basic_attack', 'hellfire', 'demon_claws', 'dark_pact'],
          loot: { gold: [90, 180], itemChance: 0.8 },
          xpValue: 95,
          isBoss: true
        }
      }
    };
  }

  // Get enemies available for a specific floor and difficulty
  getEnemiesForFloor(floor, difficulty = 'normal') {
    const difficultyConfig = this.difficultySettings[difficulty] || this.difficultySettings.normal;
    
    // Calculate tier range based on floor and difficulty
    const minTier = Math.max(1, floor + difficultyConfig.tierOffsets.min);
    const maxTier = Math.min(5, floor + difficultyConfig.tierOffsets.max);
    
    const availableEnemies = [];
    
    // Collect all enemies within the tier range
    for (let tier = minTier; tier <= maxTier; tier++) {
      if (this.enemyTiers[tier]) {
        Object.entries(this.enemyTiers[tier]).forEach(([key, enemy]) => {
          // Don't spawn bosses on non-boss floors
          if (!enemy.isBoss || floor === 5) {
            availableEnemies.push({
              key,
              ...enemy,
              tier,
              // Apply difficulty multipliers
              adjustedStats: this.adjustStatsForDifficulty(enemy.baseStats, difficultyConfig)
            });
          }
        });
      }
    }
    
    return availableEnemies;
  }

  // Adjust enemy stats based on difficulty
  adjustStatsForDifficulty(baseStats, difficultyConfig) {
    const adjusted = { ...baseStats };
    
    // Apply multiplier to health, damage, and defense
    adjusted.health = Math.floor(baseStats.health * difficultyConfig.statMultiplier);
    adjusted.maxHealth = Math.floor(baseStats.maxHealth * difficultyConfig.statMultiplier);
    adjusted.damage = [
      Math.floor(baseStats.damage[0] * difficultyConfig.statMultiplier),
      Math.floor(baseStats.damage[1] * difficultyConfig.statMultiplier)
    ];
    adjusted.defense = Math.floor(baseStats.defense * difficultyConfig.statMultiplier);
    
    return adjusted;
  }

  // Create enemy instance from template
  createEnemyInstance(enemyKey, tier, floor, difficulty = 'normal') {
    const enemyTemplate = this.enemyTiers[tier]?.[enemyKey];
    if (!enemyTemplate) {
      console.error(`Enemy ${enemyKey} not found in tier ${tier}`);
      return null;
    }

    const difficultyConfig = this.difficultySettings[difficulty] || this.difficultySettings.normal;
    const adjustedStats = this.adjustStatsForDifficulty(enemyTemplate.baseStats, difficultyConfig);

    return {
      id: `${enemyKey}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateKey: enemyKey,
      name: enemyTemplate.name,
      tier: enemyTemplate.tier,
      floor: floor,
      ...adjustedStats,
      abilities: [...enemyTemplate.abilities],
      loot: {
        gold: [...enemyTemplate.loot.gold],
        itemChance: enemyTemplate.loot.itemChance * difficultyConfig.lootMultiplier
      },
      xpValue: Math.floor(enemyTemplate.xpValue * difficultyConfig.lootMultiplier),
      isBoss: enemyTemplate.isBoss || false
    };
  }

  // Generate enemy group for an encounter
  generateEnemyGroup(floor, difficulty = 'normal', encounterType = 'normal') {
    const availableEnemies = this.getEnemiesForFloor(floor, difficulty);
    
    if (availableEnemies.length === 0) {
      console.warn(`No enemies available for floor ${floor} with difficulty ${difficulty}`);
      return [];
    }

    const enemyGroup = [];
    let enemyCount;

    // Determine enemy count based on encounter type
    switch (encounterType) {
      case 'solo':
        enemyCount = 1;
        break;
      case 'pair':
        enemyCount = 2;
        break;
      case 'normal':
        enemyCount = Math.floor(Math.random() * 3) + 2; // 2-4 enemies
        break;
      case 'horde':
        enemyCount = Math.floor(Math.random() * 3) + 4; // 4-6 enemies
        break;
      case 'boss':
        // Boss encounters: 1 boss or 1 boss + 1-2 minions
        const bosses = availableEnemies.filter(e => e.isBoss);
        if (bosses.length > 0) {
          const boss = bosses[Math.floor(Math.random() * bosses.length)];
          enemyGroup.push(this.createEnemyInstance(boss.key, boss.tier, floor, difficulty));
          
          // Maybe add some minions
          if (Math.random() < 0.5) {
            const minions = availableEnemies.filter(e => !e.isBoss && e.tier <= floor);
            const minionCount = Math.floor(Math.random() * 2) + 1; // 1-2 minions
            for (let i = 0; i < minionCount && minions.length > 0; i++) {
              const minion = minions[Math.floor(Math.random() * minions.length)];
              enemyGroup.push(this.createEnemyInstance(minion.key, minion.tier, floor, difficulty));
            }
          }
        }
        return enemyGroup;
      default:
        enemyCount = 3;
    }

    // Generate regular enemy group
    for (let i = 0; i < enemyCount; i++) {
      const enemy = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
      const instance = this.createEnemyInstance(enemy.key, enemy.tier, floor, difficulty);
      if (instance) {
        // Set position for enemy (will be refined by dungeon generator)
        instance.x = 5 + i * 2;
        instance.y = 5 + Math.floor(i / 3) * 2;
        enemyGroup.push(instance);
      }
    }

    return enemyGroup;
  }

  // Get enemy info by key and tier
  getEnemyInfo(enemyKey, tier) {
    return this.enemyTiers[tier]?.[enemyKey] || null;
  }

  // Get all enemies of a specific tier
  getEnemiesByTier(tier) {
    return this.enemyTiers[tier] || {};
  }

  // Get boss enemies
  getBossEnemies() {
    const bosses = [];
    Object.values(this.enemyTiers).forEach(tier => {
      Object.entries(tier).forEach(([key, enemy]) => {
        if (enemy.isBoss) {
          bosses.push({ key, ...enemy });
        }
      });
    });
    return bosses;
  }
}

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnemySystem;
} else {
  window.EnemySystem = EnemySystem;
}