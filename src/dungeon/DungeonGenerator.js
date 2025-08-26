/**
 * Dungeon Generation and Room Management
 * Handles room templates, enemy spawning, and dungeon progression
 */

class DungeonGenerator {
  constructor(gameEvents) {
    this.events = gameEvents;
    this.enemyIdCounter = 1;
    
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
        exits: [{x: 23, y: 10, type: 'east'}]
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
        exits: [{x: 26, y: 9, type: 'east'}]
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
        exits: [{x: 24, y: 11, type: 'east'}]
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
        exits: [{x: 22, y: 12, type: 'east'}]
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

  generateRoomEnemies(gameState, enemyTypes) {
    const roomId = gameState.getCurrentRoomId();
    const template = this.getCurrentTemplate(gameState.currentRoom);
    const floor = gameState.currentFloor;
    
    // Clear existing enemies
    if (gameState.roomEnemies.has(roomId)) {
      return gameState.getCurrentEnemies(); // Room already generated
    }
    
    const enemies = new Map();
    const numEnemies = Math.min(template.spawns.length, 2 + Math.floor(floor / 2));
    
    // Select enemy types (harder enemies on deeper floors)
    const availableTypes = Object.keys(enemyTypes).filter(type => {
      if (type === 'troll') return floor >= 3;
      if (type === 'skeleton') return floor >= 2;
      return true;
    });
    
    for (let i = 0; i < numEnemies; i++) {
      const enemyId = `e${this.enemyIdCounter++}`;
      const spawn = template.spawns[i];
      const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      const stats = this.getEnemyStats(enemyTypes[type], floor);
      
      enemies.set(enemyId, {
        id: enemyId,
        type: type,
        x: spawn.x,
        y: spawn.y,
        ...stats,
        ap: 3,
        maxAP: 3,
        alive: true
      });
    }
    
    gameState.setRoomEnemies(roomId, enemies);
    gameState.addCombatLog(`Generated ${numEnemies} enemies for ${roomId}`);
    
    // Emit event
    this.events.emit('room:generated', {
      roomId,
      enemies: Array.from(enemies.keys()),
      numEnemies
    });
    
    return enemies;
  }

  getEnemyStats(baseEnemy, floor) {
    const multiplier = 1 + (floor - 1) * 0.3; // 30% stronger per floor
    
    return {
      health: Math.floor(baseEnemy.baseHealth * multiplier),
      maxHealth: Math.floor(baseEnemy.baseHealth * multiplier),
      damage: [
        Math.floor(baseEnemy.baseDamage[0] * multiplier),
        Math.floor(baseEnemy.baseDamage[1] * multiplier)
      ],
      initiative: baseEnemy.initiative + Math.floor((floor - 1) * 2),
      symbol: baseEnemy.symbol,
      ai: baseEnemy.ai
    };
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

module.exports = DungeonGenerator;