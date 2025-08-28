/**
 * Encounter Manager
 * Manages combat encounters and transitions between exploration and tactical combat
 */

class EncounterManager {
  constructor() {
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;
    this.initialized = true;
  }

  checkForCombatTrigger(enemy) {
    // Check if player and enemy are adjacent or overlapping
    const playerX = window.gameState.location.playerX;
    const playerY = window.gameState.location.playerY;
    const distance = Math.abs(enemy.x - playerX) + Math.abs(enemy.y - playerY);
    
    if (distance <= 1) {
      this.triggerCombatEncounter(enemy);
      return true;
    }
    
    return false;
  }

  triggerCombatEncounter(mapEnemy) {
    addLog(`Encountered ${mapEnemy.name}! Entering tactical combat...`, 'combat');
    
    // Scale the encounter (single enemy becomes multiple)
    const scaledEnemies = window.encounterScaling 
      ? window.encounterScaling.scaleCombatEncounter(mapEnemy)
      : [mapEnemy];
    
    // Start tactical combat
    if (window.tacticalCombat) {
      window.tacticalCombat.startTacticalCombat(scaledEnemies, mapEnemy);
    }
  }

  // Generate enemies for rooms if needed
  ensureRoomEnemiesGenerated() {
    if (!window.gameState.currentRun.active) return;
    
    const currentRoomId = window.gameState.getCurrentRoomId ? window.gameState.getCurrentRoomId() : 'room_1';
    const existingEnemies = window.gameState.getCurrentEnemies ? window.gameState.getCurrentEnemies() : new Map();
    
    // If room already has enemies, don't regenerate
    if (existingEnemies.size > 0) {
      return;
    }
    
    const floor = window.gameState.currentRun.floor || 1;
    const template = dungeonGenerator.getCurrentTemplate(floor);
    
    if (!template || !template.spawns) return;
    
    // Generate enemies based on spawn points
    const newEnemies = new Map();
    const maxEnemies = Math.min(template.spawns.length, 2 + Math.floor(floor / 2));
    
    for (let i = 0; i < maxEnemies; i++) {
      const spawnPoint = template.spawns[i % template.spawns.length];
      const enemy = this.createFloorAppropriateEnemy(floor, i, spawnPoint);
      if (enemy) {
        newEnemies.set(enemy.id, enemy);
      }
    }
    
    // Store enemies in game state
    if (window.gameState.setRoomEnemies) {
      window.gameState.setRoomEnemies(currentRoomId, newEnemies);
    }
  }

  createFloorAppropriateEnemy(floor, index, spawnPoint) {
    // Get enemy tier based on floor
    const tier = Math.min(6, Math.floor((floor - 1) / 2) + 1);
    
    // Create enemy from enemy system
    if (!window.enemySystem) {
      console.warn('EnemySystem not available');
      return null;
    }
    
    const baseEnemyType = this.selectEnemyTypeForFloor(floor);
    const enemy = enemySystem.createEnemy(baseEnemyType, tier);
    
    if (!enemy) return null;
    
    // Set position
    enemy.x = spawnPoint.x;
    enemy.y = spawnPoint.y;
    enemy.id = `enemy_${floor}_${index}_${Date.now()}`;
    enemy.alive = true;
    
    return enemy;
  }

  selectEnemyTypeForFloor(floor) {
    const floorRanges = [
      { min: 1, max: 3, enemies: ['goblin', 'rat'] },
      { min: 4, max: 6, enemies: ['orc', 'skeleton', 'goblin'] },
      { min: 7, max: 9, enemies: ['troll', 'orc', 'wraith'] },
      { min: 10, max: 12, enemies: ['ogre', 'troll', 'phantom'] },
      { min: 13, max: 15, enemies: ['giant', 'ogre', 'demon'] },
      { min: 16, max: 99, enemies: ['dragon', 'giant', 'demon'] }
    ];
    
    const range = floorRanges.find(r => floor >= r.min && floor <= r.max);
    const enemies = range ? range.enemies : ['goblin'];
    
    return enemies[Math.floor(Math.random() * enemies.length)];
  }
}

// Create global instance
window.encounterManager = new EncounterManager();

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EncounterManager };
}