/**
 * Dungeon Generation and Room Management
 * Handles room templates, enemy spawning, and dungeon progression
 */

class DungeonGenerator {
  constructor(gameEvents, enemySystem) {
    this.events = gameEvents;
    this.enemySystem = enemySystem;
    this.enemyIdCounter = 1;
    this.objectIdCounter = 1;
    
    this.roomTemplates = [
      // Large open chamber
      {
        width: 25, height: 20,
        layout: this.generateLayout(25, 20, [
          // Border walls
          ...[...Array(25)].map((_, x) => [x, 0]),  // Top wall
          ...[...Array(25)].map((_, x) => [x, 19]), // Bottom wall  
          ...[...Array(20)].map((_, y) => [0, y]),  // Left wall
          ...[...Array(20)].map((_, y) => [24, y])  // Right wall
        ]),
        walls: [
          ...[...Array(25)].map((_, x) => [x, 0]),
          ...[...Array(25)].map((_, x) => [x, 19]),
          ...[...Array(20)].map((_, y) => [0, y]),
          ...[...Array(20)].map((_, y) => [24, y])
        ],
        spawns: [
          {x: 3, y: 3}, {x: 21, y: 3}, {x: 12, y: 10}, 
          {x: 6, y: 16}, {x: 18, y: 16}, {x: 12, y: 5}
        ],
        exits: [{x: 23, y: 10, type: 'east'}],
        objects: [
          {x: 2, y: 2, type: 'chest', id: 'wooden_chest', locked: true},
          {x: 22, y: 2, type: 'container', id: 'supply_crate', locked: true},
          {x: 12, y: 18, type: 'chest', id: 'iron_chest', locked: true}
        ]
      },
      
      // Pillared hall
      {
        width: 28, height: 18,
        layout: this.generateLayout(28, 18, [
          ...[...Array(28)].map((_, x) => [x, 0]),
          ...[...Array(28)].map((_, x) => [x, 17]),
          ...[...Array(18)].map((_, y) => [0, y]),
          ...[...Array(18)].map((_, y) => [27, y]),
          [8, 6], [8, 7], [8, 8], [8, 9], [8, 10], [8, 11],
          [20, 6], [20, 7], [20, 8], [20, 9], [20, 10], [20, 11],
          [14, 4], [14, 5], [14, 12], [14, 13]
        ]),
        walls: [
          ...[...Array(28)].map((_, x) => [x, 0]),
          ...[...Array(28)].map((_, x) => [x, 17]),
          ...[...Array(18)].map((_, y) => [0, y]),
          ...[...Array(18)].map((_, y) => [27, y]),
          [8, 6], [8, 7], [8, 8], [8, 9], [8, 10], [8, 11],
          [20, 6], [20, 7], [20, 8], [20, 9], [20, 10], [20, 11],
          [14, 4], [14, 5], [14, 12], [14, 13]
        ],
        spawns: [
          {x: 4, y: 4}, {x: 24, y: 4}, {x: 4, y: 13}, 
          {x: 24, y: 13}, {x: 14, y: 8}, {x: 10, y: 9}, {x: 18, y: 9}
        ],
        exits: [{x: 26, y: 9, type: 'east'}],
        objects: [
          {x: 2, y: 2, type: 'chest', id: 'treasure_chest', locked: true, trapped: true},
          {x: 25, y: 2, type: 'container', id: 'lockbox', locked: true},
          {x: 6, y: 8, type: 'door', id: 'reinforced_door', locked: true, blocksMovement: true}
        ]
      },

      // Maze-like chamber
      {
        width: 26, height: 22,
        layout: this.generateLayout(26, 22, [
          ...[...Array(26)].map((_, x) => [x, 0]),
          ...[...Array(26)].map((_, x) => [x, 21]),
          ...[...Array(22)].map((_, y) => [0, y]),
          ...[...Array(22)].map((_, y) => [25, y]),
          [5, 2], [5, 3], [5, 4], [5, 5], [5, 6],
          [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],
          [18, 2], [18, 3], [18, 4], [18, 5], [18, 6],
          [3, 10], [4, 10], [5, 10], [6, 10],
          [15, 10], [16, 10], [17, 10], [18, 10], [19, 10],
          [8, 15], [9, 15], [10, 15], [11, 15], [12, 15],
          [20, 12], [20, 13], [20, 14], [20, 15], [20, 16],
          [7, 18], [8, 18], [9, 18], [16, 18], [17, 18], [18, 18]
        ]),
        walls: [
          ...[...Array(26)].map((_, x) => [x, 0]),
          ...[...Array(26)].map((_, x) => [x, 21]),
          ...[...Array(22)].map((_, y) => [0, y]),
          ...[...Array(22)].map((_, y) => [25, y]),
          [5, 2], [5, 3], [5, 4], [5, 5], [5, 6],
          [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],
          [18, 2], [18, 3], [18, 4], [18, 5], [18, 6],
          [3, 10], [4, 10], [5, 10], [6, 10],
          [15, 10], [16, 10], [17, 10], [18, 10], [19, 10],
          [8, 15], [9, 15], [10, 15], [11, 15], [12, 15],
          [20, 12], [20, 13], [20, 14], [20, 15], [20, 16],
          [7, 18], [8, 18], [9, 18], [16, 18], [17, 18], [18, 18]
        ],
        spawns: [
          {x: 3, y: 3}, {x: 22, y: 3}, {x: 8, y: 8}, 
          {x: 15, y: 8}, {x: 3, y: 18}, {x: 22, y: 18},
          {x: 12, y: 12}, {x: 6, y: 16}
        ],
        exits: [{x: 24, y: 11, type: 'east'}],
        objects: [
          {x: 1, y: 1, type: 'chest', id: 'wooden_chest', locked: true},
          {x: 23, y: 1, type: 'container', id: 'supply_crate', locked: false}, // Already opened
          {x: 2, y: 8, type: 'door', id: 'secret_door', locked: true, hidden: true},
          {x: 21, y: 20, type: 'chest', id: 'iron_chest', locked: true}
        ]
      },

      // Grand circular chamber
      {
        width: 24, height: 24,
        layout: this.generateLayout(24, 24, [
          ...[...Array(24)].map((_, x) => [x, 0]),
          ...[...Array(24)].map((_, x) => [x, 23]),
          ...[...Array(24)].map((_, y) => [0, y]),
          ...[...Array(24)].map((_, y) => [23, y]),
          [8, 1], [9, 1], [10, 1], [11, 1], [12, 1], [13, 1], [14, 1], [15, 1],
          [6, 2], [7, 2], [16, 2], [17, 2],
          [4, 3], [5, 3], [18, 3], [19, 3],
          [3, 4], [20, 4], [2, 5], [21, 5], [2, 6], [21, 6],
          [1, 7], [1, 8], [1, 9], [1, 10], [1, 11], [1, 12], [1, 13], [1, 14], [1, 15], [1, 16],
          [22, 7], [22, 8], [22, 9], [22, 10], [22, 11], [22, 12], [22, 13], [22, 14], [22, 15], [22, 16],
          [2, 17], [21, 17], [2, 18], [21, 18], [3, 19], [20, 19],
          [4, 20], [5, 20], [18, 20], [19, 20], [6, 21], [7, 21], [16, 21], [17, 21],
          [8, 22], [9, 22], [10, 22], [11, 22], [12, 22], [13, 22], [14, 22], [15, 22],
          [11, 11], [12, 11], [11, 12], [12, 12]
        ]),
        walls: [
          ...[...Array(24)].map((_, x) => [x, 0]),
          ...[...Array(24)].map((_, x) => [x, 23]),
          ...[...Array(24)].map((_, y) => [0, y]),
          ...[...Array(24)].map((_, y) => [23, y]),
          [8, 1], [9, 1], [10, 1], [11, 1], [12, 1], [13, 1], [14, 1], [15, 1],
          [6, 2], [7, 2], [16, 2], [17, 2],
          [4, 3], [5, 3], [18, 3], [19, 3],
          [3, 4], [20, 4], [2, 5], [21, 5], [2, 6], [21, 6],
          [1, 7], [1, 8], [1, 9], [1, 10], [1, 11], [1, 12], [1, 13], [1, 14], [1, 15], [1, 16],
          [22, 7], [22, 8], [22, 9], [22, 10], [22, 11], [22, 12], [22, 13], [22, 14], [22, 15], [22, 16],
          [2, 17], [21, 17], [2, 18], [21, 18], [3, 19], [20, 19],
          [4, 20], [5, 20], [18, 20], [19, 20], [6, 21], [7, 21], [16, 21], [17, 21],
          [8, 22], [9, 22], [10, 22], [11, 22], [12, 22], [13, 22], [14, 22], [15, 22],
          [11, 11], [12, 11], [11, 12], [12, 12]
        ],
        spawns: [
          {x: 6, y: 6}, {x: 17, y: 6}, {x: 6, y: 17}, {x: 17, y: 17},
          {x: 12, y: 4}, {x: 12, y: 19}, {x: 4, y: 12}, {x: 19, y: 12}
        ],
        exits: [{x: 22, y: 12, type: 'east'}],
        objects: [
          {x: 12, y: 13, type: 'chest', id: 'master_chest', locked: true, trapped: true}, // Center chest
          {x: 3, y: 3, type: 'door', id: 'vault_door', locked: true},
          {x: 20, y: 20, type: 'container', id: 'lockbox', locked: true}
        ]
      }
    ];
  }

  // Generate 2D layout array from wall coordinates
  generateLayout(width, height, walls) {
    const layout = [];
    for (let y = 0; y < height; y++) {
      layout[y] = [];
      for (let x = 0; x < width; x++) {
        layout[y][x] = '.'; // Floor by default
      }
    }

    // Place walls
    walls.forEach(([x, y]) => {
      if (layout[y] && layout[y][x] !== undefined) {
        layout[y][x] = '#';
      }
    });

    return layout;
  }

  getCurrentTemplate(roomNumber) {
    const index = (roomNumber - 1) % this.roomTemplates.length;
    return this.roomTemplates[index];
  }

  generateRoomEnemies(gameState) {
    const roomId = gameState.getCurrentRoomId();
    const template = this.getCurrentTemplate(gameState.currentRoom);
    const floor = gameState.currentFloor;
    const difficulty = gameState.settings?.difficulty || 'normal';
    
    // Generate room objects if they haven't been generated yet
    this.generateRoomObjects(gameState, template, roomId, floor);
    
    // Clear existing enemies
    if (gameState.roomEnemies.has(roomId)) {
      return gameState.getCurrentEnemies(); // Room already generated
    }
    
    // Use EnemySystem to generate appropriate enemies for this floor/difficulty
    let encounterType = 'normal';
    if (floor === 5) {
      encounterType = 'boss';
    } else if (Math.random() < 0.1) {
      encounterType = Math.random() < 0.5 ? 'solo' : 'horde';
    }
    
    const enemyGroup = this.enemySystem.generateEnemyGroup(floor, difficulty, encounterType);
    const enemies = new Map();
    
    // Position enemies at spawn points
    const maxEnemies = Math.min(enemyGroup.length, template.spawns.length);
    
    for (let i = 0; i < maxEnemies; i++) {
      const enemy = enemyGroup[i];
      const spawn = template.spawns[i];
      
      // Update enemy position to spawn location
      enemy.x = spawn.x;
      enemy.y = spawn.y;
      
      // Ensure enemy has required combat properties
      enemy.ap = enemy.ap || 3;
      enemy.maxAP = enemy.maxAP || 3;
      enemy.alive = true;
      
      enemies.set(enemy.id, enemy);
    }
    
    gameState.setRoomEnemies(roomId, enemies);
    gameState.addCombatLog(`Generated ${enemies.size} enemies for ${roomId} (${difficulty} difficulty, tier ${floor})`);
    
    // Emit event
    this.events.emit('room:generated', {
      roomId,
      enemies: Array.from(enemies.keys()),
      numEnemies: enemies.size,
      difficulty,
      floor
    });
    
    return enemies;
  }

  generateRoomObjects(gameState, template, roomId, floor) {
    // Initialize lockpicking system data if not exists
    if (!gameState.lockpicking) {
      gameState.lockpicking = {
        objectStates: new Map(),
        roomObjects: new Map(),
        roomTraps: new Map(),
        keysFound: new Set(),
        picklocksBroken: 0,
        totalUnlocked: 0
      };
    }

    // Check if objects already generated for this room
    if (gameState.lockpicking.roomObjects.has(roomId)) {
      return; // Objects already generated
    }

    if (!template.objects || template.objects.length === 0) {
      return; // No objects in this template
    }

    const roomObjects = new Map();
    const roomTraps = new Map();

    template.objects.forEach(objTemplate => {
      // Create unique object ID
      const objectId = `${roomId}_${objTemplate.type}_${this.objectIdCounter++}`;
      
      // Create object instance from template
      const object = {
        id: objectId,
        x: objTemplate.x,
        y: objTemplate.y,
        type: objTemplate.type,
        templateId: objTemplate.id,
        locked: objTemplate.locked !== false, // Default to locked
        roomId: roomId,
        floor: floor,
        ...this.getObjectDefinition(objTemplate.id) // Merge with definition
      };

      // Adjust difficulty based on floor
      if (object.lockDifficulty) {
        object.lockDifficulty = Math.min(5, Math.max(1, 
          object.lockDifficulty + Math.floor((floor - 1) / 2)
        ));
      }

      roomObjects.set(objectId, object);

      // Generate trap if object is trapped
      if (objTemplate.trapped || object.trapped) {
        const trapId = `${objectId}_trap`;
        const trapType = this.selectTrapType(floor, object.lockDifficulty);
        
        const trap = {
          id: trapId,
          objectId: objectId,
          ...this.getTrapDefinition(trapType),
          complexity: Math.min(5, Math.max(1, 
            (this.getTrapDefinition(trapType)?.complexity || 1) + Math.floor(floor / 2)
          ))
        };

        roomTraps.set(trapId, trap);
      }
    });

    // Store generated objects and traps
    gameState.lockpicking.roomObjects.set(roomId, roomObjects);
    gameState.lockpicking.roomTraps.set(roomId, roomTraps);

    // Emit event for object generation
    this.events.emit('room:objects_generated', {
      roomId,
      objectCount: roomObjects.size,
      trapCount: roomTraps.size,
      floor
    });
  }

  getObjectDefinition(templateId) {
    // This would import from LockableObjects.js in a real implementation
    // For now, return basic definitions
    const definitions = {
      wooden_chest: { name: 'Wooden Chest', lockDifficulty: 1, durability: 80, lootTable: 'basic_treasure' },
      iron_chest: { name: 'Iron Chest', lockDifficulty: 2, durability: 150, lootTable: 'good_treasure' },
      treasure_chest: { name: 'Treasure Chest', lockDifficulty: 3, durability: 200, lootTable: 'rare_treasure' },
      master_chest: { name: 'Master\'s Chest', lockDifficulty: 4, durability: 300, lootTable: 'legendary_treasure' },
      supply_crate: { name: 'Supply Crate', lockDifficulty: 1, durability: 60, lootTable: 'supplies' },
      lockbox: { name: 'Lockbox', lockDifficulty: 2, durability: 120, lootTable: 'valuables' },
      wooden_door: { name: 'Wooden Door', lockDifficulty: 1, durability: 100, canBreakDown: true },
      reinforced_door: { name: 'Reinforced Door', lockDifficulty: 2, durability: 200, canBreakDown: true },
      secret_door: { name: 'Secret Door', lockDifficulty: 2, durability: 150, hidden: true },
      vault_door: { name: 'Vault Door', lockDifficulty: 4, durability: 500, canBreakDown: false }
    };

    return definitions[templateId] || { name: 'Unknown Object', lockDifficulty: 1 };
  }

  getTrapDefinition(trapType) {
    const definitions = {
      needle_trap: { name: 'Poison Needle Trap', complexity: 1, maxDamage: 8, damageType: 'poison' },
      blade_trap: { name: 'Spring Blade Trap', complexity: 2, maxDamage: 15, damageType: 'slashing' },
      gas_trap: { name: 'Toxic Gas Trap', complexity: 3, maxDamage: 12, damageType: 'poison' },
      explosion_trap: { name: 'Explosive Trap', complexity: 4, maxDamage: 25, damageType: 'fire' },
      alarm_trap: { name: 'Magical Alarm', complexity: 2, maxDamage: 0, damageType: 'none' }
    };

    return definitions[trapType] || definitions.needle_trap;
  }

  selectTrapType(floor, lockDifficulty) {
    const trapTypes = ['needle_trap', 'blade_trap', 'gas_trap', 'explosion_trap', 'alarm_trap'];
    const maxComplexity = Math.min(4, Math.max(1, lockDifficulty + Math.floor(floor / 2)));
    
    // Select trap type based on complexity
    if (maxComplexity >= 4) return 'explosion_trap';
    if (maxComplexity >= 3) return Math.random() < 0.5 ? 'gas_trap' : 'blade_trap';
    if (maxComplexity >= 2) return Math.random() < 0.6 ? 'blade_trap' : 'alarm_trap';
    return 'needle_trap';
  }

  isRoomCleared(gameState) {
    const enemies = gameState.getCurrentEnemies();
    
    if (enemies.size === 0) return true;
    
    for (let enemy of enemies.values()) {
      if (enemy.alive) return false;
    }
    return true;
  }

  enemiesInSight(gameState) {
    const enemies = gameState.getCurrentEnemies();
    
    for (let enemy of enemies.values()) {
      if (enemy.alive) {
        // For simplicity, enemies in the same room are always "visible"
        // In a more complex system, you'd check line of sight
        return true;
      }
    }
    return false;
  }

  // Handle room progression
  handleNextRoom(gameState) {
    if (!this.isRoomCleared(gameState)) {
      return { success: false, message: 'Room must be cleared before advancing' };
    }

    const oldRoom = gameState.currentRoom;
    const oldFloor = gameState.currentFloor;
    
    gameState.advanceRoom();
    
    // Emit events
    this.events.emit('room:changed', {
      oldRoom: `f${oldFloor}r${oldRoom}`,
      newRoom: gameState.getCurrentRoomId(),
      currentFloor: gameState.currentFloor,
      currentRoom: gameState.currentRoom
    });

    return {
      success: true,
      message: `Advanced to Floor ${gameState.currentFloor}, Room ${gameState.currentRoom}`,
      newRoom: gameState.getCurrentRoomId()
    };
  }
}

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DungeonGenerator;
} else {
  window.DungeonGenerator = DungeonGenerator;
}