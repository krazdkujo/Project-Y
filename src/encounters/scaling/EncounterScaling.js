/**
 * Encounter Scaling System
 * Scales single map enemies into tactical combat encounters
 */

class EncounterScaling {
  constructor() {
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;
    this.initialized = true;
  }

  scaleCombatEncounter(mapEnemy) {
    const floor = gameState.currentRun.floor || 1;
    const baseEnemyType = this.getBaseEnemyType(mapEnemy.name);
    
    // Calculate number of enemies based on type and floor
    let enemyCount = this.calculateEnemyCount(baseEnemyType, floor);
    
    // Create scaled enemies
    const scaledEnemies = [];
    for (let i = 0; i < enemyCount; i++) {
      const combatEnemy = this.createCombatEnemy(mapEnemy, i);
      if (combatEnemy) {
        scaledEnemies.push(combatEnemy);
      }
    }
    
    addLog(`Combat scaled: 1 ${mapEnemy.name} becomes ${scaledEnemies.length} enemies!`, 'combat');
    return scaledEnemies;
  }

  getBaseEnemyType(enemyName) {
    // Extract base type from enemy name
    const name = enemyName.toLowerCase();
    if (name.includes('goblin')) return 'goblin';
    if (name.includes('orc')) return 'orc';
    if (name.includes('skeleton')) return 'skeleton';
    if (name.includes('troll')) return 'troll';
    if (name.includes('rat')) return 'rat';
    if (name.includes('wraith')) return 'wraith';
    if (name.includes('ogre')) return 'ogre';
    if (name.includes('phantom')) return 'phantom';
    if (name.includes('giant')) return 'giant';
    if (name.includes('demon')) return 'demon';
    if (name.includes('dragon')) return 'dragon';
    
    return 'goblin'; // Default fallback
  }

  calculateEnemyCount(baseEnemyType, floor) {
    let enemyCount = 1;
    
    switch (baseEnemyType) {
      case 'goblin':
        enemyCount = Math.min(2 + floor, 8);
        break;
      case 'rat':
        enemyCount = Math.min(3 + floor, 10);
        break;
      case 'orc':
        enemyCount = Math.min(1 + Math.floor(floor / 2), 6);
        break;
      case 'skeleton':
        enemyCount = Math.min(2 + Math.floor(floor / 2), 7);
        break;
      case 'troll':
        enemyCount = Math.min(1 + Math.floor(floor / 3), 4);
        break;
      case 'wraith':
        enemyCount = Math.min(1 + Math.floor(floor / 3), 5);
        break;
      case 'ogre':
        enemyCount = Math.min(1 + Math.floor(floor / 4), 3);
        break;
      case 'phantom':
        enemyCount = Math.min(2 + Math.floor(floor / 4), 4);
        break;
      case 'giant':
        enemyCount = Math.min(1 + Math.floor(floor / 5), 2);
        break;
      case 'demon':
        enemyCount = Math.min(1 + Math.floor(floor / 6), 3);
        break;
      case 'dragon':
        enemyCount = 1; // Dragons are always solo encounters
        break;
      default:
        enemyCount = Math.min(2 + Math.floor(floor / 2), 6);
    }
    
    return enemyCount;
  }

  createCombatEnemy(baseEnemy, index) {
    // Create a copy of the base enemy for combat
    const combatEnemy = {
      id: `${baseEnemy.id}_combat_${index}`,
      name: `${baseEnemy.name}${index > 0 ? ` ${index + 1}` : ''}`,
      health: baseEnemy.health || baseEnemy.maxHealth || 10,
      maxHealth: baseEnemy.maxHealth || 10,
      ap: baseEnemy.ap || 3,
      maxAP: baseEnemy.maxAP || 3,
      damage: baseEnemy.damage || [1, 3],
      defense: baseEnemy.defense || 0,
      accuracy: baseEnemy.accuracy || 70,
      evasion: baseEnemy.evasion || 10,
      level: baseEnemy.level || 1,
      tier: baseEnemy.tier || 1,
      type: baseEnemy.type || 'beast',
      alive: true,
      x: 0, // Will be set by positioning system
      y: 0
    };

    // Add some variation to avoid identical enemies
    if (index > 0) {
      const variation = 0.1 + (Math.random() * 0.2); // 10-30% variation
      
      combatEnemy.health = Math.floor(combatEnemy.health * (1 + (Math.random() - 0.5) * variation));
      combatEnemy.maxHealth = combatEnemy.health;
      
      if (Array.isArray(combatEnemy.damage)) {
        combatEnemy.damage = [
          Math.max(1, Math.floor(combatEnemy.damage[0] * (1 + (Math.random() - 0.5) * variation))),
          Math.floor(combatEnemy.damage[1] * (1 + (Math.random() - 0.5) * variation))
        ];
      }
      
      combatEnemy.accuracy = Math.max(20, Math.min(95, 
        combatEnemy.accuracy + Math.floor((Math.random() - 0.5) * 20)
      ));
    }

    return combatEnemy;
  }

  // Calculate encounter difficulty for balancing
  calculateEncounterDifficulty(enemies) {
    let totalDifficulty = 0;
    
    enemies.forEach(enemy => {
      const baseValue = (enemy.health || 10) + (enemy.damage?.[1] || 3) * 2;
      const levelModifier = (enemy.level || 1) * 1.5;
      const tierModifier = (enemy.tier || 1) * 2;
      
      totalDifficulty += baseValue * levelModifier * tierModifier;
    });
    
    return totalDifficulty;
  }

  // Balance encounter against party strength
  balanceEncounter(enemies, partyStrength) {
    const encounterDifficulty = this.calculateEncounterDifficulty(enemies);
    const balanceRatio = partyStrength / encounterDifficulty;
    
    // If encounter is too easy or too hard, adjust enemy stats slightly
    if (balanceRatio > 1.5) {
      // Too easy - buff enemies slightly
      enemies.forEach(enemy => {
        enemy.health = Math.floor(enemy.health * 1.1);
        enemy.maxHealth = enemy.health;
        if (Array.isArray(enemy.damage)) {
          enemy.damage = enemy.damage.map(d => Math.floor(d * 1.1));
        }
      });
    } else if (balanceRatio < 0.7) {
      // Too hard - nerf enemies slightly
      enemies.forEach(enemy => {
        enemy.health = Math.floor(enemy.health * 0.9);
        enemy.maxHealth = enemy.health;
        if (Array.isArray(enemy.damage)) {
          enemy.damage = enemy.damage.map(d => Math.max(1, Math.floor(d * 0.9)));
        }
      });
    }
    
    return enemies;
  }
}

// Create global instance
window.encounterScaling = new EncounterScaling();

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EncounterScaling };
}