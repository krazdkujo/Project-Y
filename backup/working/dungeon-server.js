// Dungeon Crawler Server - Room-based progression with floor system
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');

// Game state
const gameState = {
  players: new Map(),
  currentFloor: 1,
  currentRoom: 1,
  maxRooms: 5, // 5 rooms per floor
  roomEnemies: new Map(), // roomId -> enemies
  gamePhase: 'exploration', // 'exploration', 'combat'
  turnOrder: [],
  currentTurnIndex: 0,
  turnTimer: null,
  combatLog: []
};

// Room templates with different layouts - larger for 30x30 viewport
const ROOM_TEMPLATES = [
  // Large open chamber
  {
    width: 25, height: 20,
    walls: [
      // Border walls
      ...[...Array(25)].map((_, x) => [x, 0]),  // Top wall
      ...[...Array(25)].map((_, x) => [x, 19]), // Bottom wall  
      ...[...Array(20)].map((_, y) => [0, y]),  // Left wall
      ...[...Array(20)].map((_, y) => [24, y])  // Right wall
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
    walls: [
      // Border walls
      ...[...Array(28)].map((_, x) => [x, 0]),  // Top wall
      ...[...Array(28)].map((_, x) => [x, 17]), // Bottom wall  
      ...[...Array(18)].map((_, y) => [0, y]),  // Left wall
      ...[...Array(18)].map((_, y) => [27, y]), // Right wall
      // Interior pillars
      // Pillars
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
    walls: [
      // Border walls
      ...[...Array(26)].map((_, x) => [x, 0]),  // Top wall
      ...[...Array(26)].map((_, x) => [x, 21]), // Bottom wall  
      ...[...Array(22)].map((_, y) => [0, y]),  // Left wall
      ...[...Array(22)].map((_, y) => [25, y]), // Right wall
      // Interior maze walls
      // Create maze walls
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
    walls: [
      // Border walls
      ...[...Array(24)].map((_, x) => [x, 0]),  // Top wall
      ...[...Array(24)].map((_, x) => [x, 23]), // Bottom wall  
      ...[...Array(24)].map((_, y) => [0, y]),  // Left wall
      ...[...Array(24)].map((_, y) => [23, y]), // Right wall
      // Interior circular walls
      // Outer ring walls to create circular shape
      [8, 1], [9, 1], [10, 1], [11, 1], [12, 1], [13, 1], [14, 1], [15, 1],
      [6, 2], [7, 2], [16, 2], [17, 2],
      [4, 3], [5, 3], [18, 3], [19, 3],
      [3, 4], [20, 4], [2, 5], [21, 5], [2, 6], [21, 6],
      [1, 7], [1, 8], [1, 9], [1, 10], [1, 11], [1, 12], [1, 13], [1, 14], [1, 15], [1, 16],
      [22, 7], [22, 8], [22, 9], [22, 10], [22, 11], [22, 12], [22, 13], [22, 14], [22, 15], [22, 16],
      [2, 17], [21, 17], [2, 18], [21, 18], [3, 19], [20, 19],
      [4, 20], [5, 20], [18, 20], [19, 20], [6, 21], [7, 21], [16, 21], [17, 21],
      [8, 22], [9, 22], [10, 22], [11, 22], [12, 22], [13, 22], [14, 22], [15, 22],
      // Inner sanctum
      [11, 11], [12, 11], [11, 12], [12, 12]
    ],
    spawns: [
      {x: 6, y: 6}, {x: 17, y: 6}, {x: 6, y: 17}, {x: 17, y: 17},
      {x: 12, y: 4}, {x: 12, y: 19}, {x: 4, y: 12}, {x: 19, y: 12}
    ],
    exits: [{x: 22, y: 12, type: 'east'}]
  }
];

// Skills available to players
const SKILLS = {
  move: { name: 'Move', movementRange: 0, range: 0, cost: 0, description: 'Move up to your movement distance', type: 'movement' },
  attack: { name: 'Basic Attack', damage: [2, 4], range: 1, cost: 0, description: 'Simple melee attack' },
  power_attack: { name: 'Power Attack', damage: [3, 6], range: 1, cost: 1, description: 'Strong attack, costs 1 AP' },
  heal: { name: 'Heal', healing: [3, 6], range: 0, cost: 2, description: 'Heal yourself, costs 2 AP' },
  fireball: { name: 'Fireball', damage: [4, 8], range: 3, cost: 3, description: 'Ranged fire attack, costs 3 AP' }
};

// Enemy types get stronger per floor
const ENEMY_TYPES = {
  goblin: { 
    symbol: 'g', 
    baseHealth: 4, 
    baseDamage: [1, 3], 
    initiative: 10,
    ai: 'aggressive'
  },
  orc: { 
    symbol: 'O', 
    baseHealth: 8, 
    baseDamage: [2, 4], 
    initiative: 8,
    ai: 'defensive'
  },
  skeleton: { 
    symbol: 's', 
    baseHealth: 6, 
    baseDamage: [1, 4], 
    initiative: 12,
    ai: 'aggressive'
  },
  troll: { 
    symbol: 'T', 
    baseHealth: 15, 
    baseDamage: [3, 6], 
    initiative: 6,
    ai: 'defensive'
  }
};

// Create HTTP server
const server = http.createServer((req, res) => {
  let filePath = './improved-dungeon-client.html';
  if (req.url === '/') {
    filePath = './improved-dungeon-client.html';
  }
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content);
  });
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

let playerIdCounter = 1;
let enemyIdCounter = 1;

// Generate current room ID
function getCurrentRoomId() {
  return `f${gameState.currentFloor}r${gameState.currentRoom}`;
}

// Get room template for current room
function getCurrentRoomTemplate() {
  const roomIndex = (gameState.currentRoom - 1) % ROOM_TEMPLATES.length;
  return ROOM_TEMPLATES[roomIndex];
}

// Calculate enemy stats based on floor
function getEnemyStats(type, floor) {
  const base = ENEMY_TYPES[type];
  const multiplier = 1 + (floor - 1) * 0.3; // 30% stronger per floor
  
  return {
    health: Math.floor(base.baseHealth * multiplier),
    maxHealth: Math.floor(base.baseHealth * multiplier),
    damage: [
      Math.floor(base.baseDamage[0] * multiplier),
      Math.floor(base.baseDamage[1] * multiplier)
    ],
    initiative: base.initiative + Math.floor((floor - 1) * 2),
    symbol: base.symbol,
    ai: base.ai
  };
}

// Generate enemies for current room
function generateRoomEnemies() {
  const roomId = getCurrentRoomId();
  const template = getCurrentRoomTemplate();
  const floor = gameState.currentFloor;
  
  // Clear existing enemies
  if (gameState.roomEnemies.has(roomId)) {
    return; // Room already generated
  }
  
  const enemies = new Map();
  const numEnemies = Math.min(template.spawns.length, 2 + Math.floor(floor / 2));
  
  // Select enemy types (harder enemies on deeper floors)
  const availableTypes = Object.keys(ENEMY_TYPES).filter(type => {
    if (type === 'troll') return floor >= 3;
    if (type === 'skeleton') return floor >= 2;
    return true;
  });
  
  for (let i = 0; i < numEnemies; i++) {
    const enemyId = `e${enemyIdCounter++}`;
    const spawn = template.spawns[i];
    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    const stats = getEnemyStats(type, floor);
    
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
  
  gameState.roomEnemies.set(roomId, enemies);
  addCombatLog(`Generated ${numEnemies} enemies for ${roomId}`);
}

// Check if current room is cleared
function isRoomCleared() {
  const roomId = getCurrentRoomId();
  const enemies = gameState.roomEnemies.get(roomId);
  
  if (!enemies) return true;
  
  for (let enemy of enemies.values()) {
    if (enemy.alive) return false;
  }
  return true;
}

// Get current room enemies
function getCurrentEnemies() {
  const roomId = getCurrentRoomId();
  return gameState.roomEnemies.get(roomId) || new Map();
}

// Check if any living enemies are visible to any living player
function enemiesInSight() {
  const enemies = getCurrentEnemies();
  
  for (let enemy of enemies.values()) {
    if (enemy.alive) {
      // For simplicity, enemies in the same room are always "visible"
      // In a more complex system, you'd check line of sight
      return true;
    }
  }
  return false;
}

// Auto-trigger combat if enemies in sight
function checkCombatTrigger() {
  if (gameState.gamePhase === 'exploration' && enemiesInSight()) {
    addCombatLog('Enemies spotted! Combat begins!');
    startCombat();
  }
}

// Start combat phase
function startCombat() {
  if (gameState.gamePhase === 'combat') return;
  
  gameState.gamePhase = 'combat';
  gameState.turnOrder = [];
  
  // Add all living players to turn order
  gameState.players.forEach((player, id) => {
    if (player.alive) {
      gameState.turnOrder.push({
        id: id,
        type: 'player',
        initiative: player.initiative
      });
    }
  });
  
  // Add all living enemies to turn order
  const enemies = getCurrentEnemies();
  enemies.forEach((enemy, id) => {
    if (enemy.alive) {
      gameState.turnOrder.push({
        id: id,
        type: 'enemy',
        initiative: enemy.initiative
      });
    }
  });
  
  // Sort by initiative (highest first)
  gameState.turnOrder.sort((a, b) => b.initiative - a.initiative);
  
  gameState.currentTurnIndex = 0;
  
  addCombatLog(`=== COMBAT STARTED in ${getCurrentRoomId()} ===`);
  addCombatLog(`Turn order: ${gameState.turnOrder.map(t => t.id).join(' → ')}`);
  
  broadcast({
    type: 'combatStarted',
    turnOrder: gameState.turnOrder,
    currentTurn: getCurrentTurn(),
    roomId: getCurrentRoomId()
  });
  
  startTurn();
}

// End combat and check room status
function endCombat() {
  gameState.gamePhase = 'exploration';
  gameState.turnOrder = [];
  
  if (isRoomCleared()) {
    addCombatLog(`=== ROOM ${getCurrentRoomId()} CLEARED! ===`);
    
    broadcast({
      type: 'roomCleared',
      roomId: getCurrentRoomId(),
      canProgress: true
    });
  }
  
  broadcast({
    type: 'combatEnded',
    phase: 'exploration'
  });
}

// Move to next room
function nextRoom() {
  if (!isRoomCleared()) {
    return false; // Can't progress with enemies alive
  }
  
  gameState.currentRoom++;
  
  if (gameState.currentRoom > gameState.maxRooms) {
    // Go to next floor
    gameState.currentFloor++;
    gameState.currentRoom = 1;
    addCombatLog(`=== DESCENDED TO FLOOR ${gameState.currentFloor} ===`);
  }
  
  // Reset player positions to center of room
  const template = getCurrentRoomTemplate();
  gameState.players.forEach(player => {
    if (player.alive) {
      player.x = Math.floor(template.width / 2);
      player.y = Math.floor(template.height / 2);
      player.health = player.maxHealth; // Heal between rooms
      player.ap = player.maxAP;
    }
  });
  
  generateRoomEnemies();
  
  broadcast({
    type: 'roomChanged',
    floor: gameState.currentFloor,
    room: gameState.currentRoom,
    roomId: getCurrentRoomId(),
    template: getCurrentRoomTemplate()
  });
  
  // Check if combat should start immediately
  setTimeout(() => checkCombatTrigger(), 1000);
  
  return true;
}

// Get current turn info
function getCurrentTurn() {
  if (gameState.turnOrder.length === 0) return null;
  return gameState.turnOrder[gameState.currentTurnIndex];
}

// Start a turn (similar to previous implementation)
function startTurn() {
  const currentTurn = getCurrentTurn();
  if (!currentTurn) return;
  
  addCombatLog(`${currentTurn.id}'s turn (${currentTurn.type})`);
  
  if (currentTurn.type === 'player') {
    const player = gameState.players.get(currentTurn.id);
    if (player) player.ap = player.maxAP;
  } else {
    const enemies = getCurrentEnemies();
    const enemy = enemies.get(currentTurn.id);
    if (enemy) {
      enemy.ap = enemy.maxAP;
      setTimeout(() => executeEnemyTurn(currentTurn.id), 1000);
    }
  }
  
  broadcast({
    type: 'turnStarted',
    currentTurn: currentTurn,
    turnOrder: gameState.turnOrder
  });
}

// Enemy AI turn (similar to previous, but uses current room enemies)
function executeEnemyTurn(enemyId) {
  const enemies = getCurrentEnemies();
  const enemy = enemies.get(enemyId);
  
  if (!enemy || !enemy.alive) {
    endTurn();
    return;
  }
  
  // Find closest player
  let closestPlayer = null;
  let closestDistance = Infinity;
  
  gameState.players.forEach((player, id) => {
    if (player.alive) {
      const distance = Math.abs(enemy.x - player.x) + Math.abs(enemy.y - player.y);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPlayer = { id, ...player };
      }
    }
  });
  
  if (!closestPlayer) {
    endTurn();
    return;
  }
  
  if (closestDistance === 1 && enemy.ap > 0) {
    // Attack!
    const damage = Math.floor(Math.random() * (enemy.damage[1] - enemy.damage[0] + 1)) + enemy.damage[0];
    
    closestPlayer.health -= damage;
    enemy.ap--;
    
    const message = `${enemyId} attacks ${closestPlayer.id} for ${damage} damage!`;
    addCombatLog(message);
    
    broadcast({
      type: 'combat',
      attacker: enemyId,
      target: closestPlayer.id,
      damage: damage,
      message: message
    });
    
    // Check if player died
    if (closestPlayer.health <= 0) {
      const player = gameState.players.get(closestPlayer.id);
      player.alive = false;
      player.deaths++;
      
      addCombatLog(`${closestPlayer.id} has fallen!`);
      broadcast({
        type: 'playerKilled',
        playerId: closestPlayer.id,
        killer: enemyId
      });
      
      // Remove from turn order
      gameState.turnOrder = gameState.turnOrder.filter(t => t.id !== closestPlayer.id);
      if (gameState.currentTurnIndex >= gameState.turnOrder.length) {
        gameState.currentTurnIndex = 0;
      }
    }
  } else if (enemy.ap > 0) {
    // Move closer
    const dx = Math.sign(closestPlayer.x - enemy.x);
    const dy = Math.sign(closestPlayer.y - enemy.y);
    
    const newX = enemy.x + (Math.abs(dx) > Math.abs(dy) ? dx : 0);
    const newY = enemy.y + (Math.abs(dx) <= Math.abs(dy) ? dy : 0);
    
    if (isValidPosition(newX, newY, enemyId)) {
      enemy.x = newX;
      enemy.y = newY;
      enemy.ap--;
      
      broadcast({
        type: 'enemyMoved',
        enemyId: enemyId,
        x: enemy.x,
        y: enemy.y
      });
    }
  }
  
  setTimeout(() => endTurn(), 500);
}

// End current turn
function endTurn() {
  if (gameState.turnTimer) {
    clearTimeout(gameState.turnTimer);
    gameState.turnTimer = null;
  }
  
  gameState.currentTurnIndex++;
  if (gameState.currentTurnIndex >= gameState.turnOrder.length) {
    gameState.currentTurnIndex = 0;
  }
  
  // Check win conditions
  const alivePlayers = Array.from(gameState.players.values()).filter(p => p.alive).length;
  const aliveEnemies = Array.from(getCurrentEnemies().values()).filter(e => e.alive).length;
  
  if (aliveEnemies === 0) {
    // Room cleared!
    endCombat();
    return;
  } else if (alivePlayers === 0) {
    // All players dead
    addCombatLog('=== ALL PLAYERS DEFEATED ===');
    endCombat();
    return;
  }
  
  startTurn();
}

// Check if position is valid
function isValidPosition(x, y, excludeId = null) {
  const template = getCurrentRoomTemplate();
  
  if (x < 0 || x >= template.width || y < 0 || y >= template.height) return false;
  
  // Check walls
  for (let wall of template.walls) {
    if (wall[0] === x && wall[1] === y) return false;
  }
  
  // Check for players
  for (let [id, player] of gameState.players) {
    if (id !== excludeId && player.alive && player.x === x && player.y === y) {
      return false;
    }
  }
  
  // Check for enemies
  const enemies = getCurrentEnemies();
  for (let [id, enemy] of enemies) {
    if (id !== excludeId && enemy.alive && enemy.x === x && enemy.y === y) {
      return false;
    }
  }
  
  return true;
}

// Calculate movement range for a player
function getMovementRange(player) {
  return player.baseMovement + player.movementModifier;
}

// Get all valid movement positions within range
function getValidMovementPositions(player, range) {
  const positions = [];
  
  for (let dx = -range; dx <= range; dx++) {
    for (let dy = -range; dy <= range; dy++) {
      if (dx === 0 && dy === 0) continue; // Skip current position
      
      const distance = Math.abs(dx) + Math.abs(dy); // Manhattan distance
      if (distance > range) continue;
      
      const newX = player.x + dx;
      const newY = player.y + dy;
      
      if (isValidPosition(newX, newY, player.id)) {
        positions.push({ x: newX, y: newY, distance: distance });
      }
    }
  }
  
  return positions;
}

// Add message to combat log
function addCombatLog(message) {
  gameState.combatLog.push({
    message: message,
    timestamp: Date.now()
  });
  
  if (gameState.combatLog.length > 100) {
    gameState.combatLog.shift();
  }
  
  console.log(message); // Also log to server console
}

// Initialize first room
generateRoomEnemies();

wss.on('connection', (ws) => {
  const playerId = `p${playerIdCounter++}`;
  console.log(`Player ${playerId} connected`);
  
  // Add player to game - spawn in center of room
  const template = getCurrentRoomTemplate();
  gameState.players.set(playerId, {
    id: playerId,
    x: Math.floor(template.width / 2),
    y: Math.floor(template.height / 2),
    health: 20,
    maxHealth: 20,
    ap: 3,
    maxAP: 3,
    initiative: 12 + Math.floor(Math.random() * 8),
    alive: true,
    kills: 0,
    deaths: 0,
    // Movement stats
    baseMovement: 3,      // Base movement distance
    movementModifier: 0,  // Equipment/buff modifiers
    level: 1,
    mana: 10,
    maxMana: 10
  });
  
  // Send initial state
  ws.send(JSON.stringify({
    type: 'init',
    playerId: playerId,
    gamePhase: gameState.gamePhase,
    floor: gameState.currentFloor,
    room: gameState.currentRoom,
    roomId: getCurrentRoomId(),
    template: getCurrentRoomTemplate(),
    players: Array.from(gameState.players.values()),
    enemies: Array.from(getCurrentEnemies().values()),
    skills: SKILLS,
    turnOrder: gameState.turnOrder,
    currentTurn: getCurrentTurn(),
    combatLog: gameState.combatLog
  }));
  
  // Broadcast new player
  broadcast({
    type: 'playerJoined',
    player: gameState.players.get(playerId)
  }, ws);
  
  // Check if combat should start
  setTimeout(() => checkCombatTrigger(), 500);
  
  // Handle messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      const player = gameState.players.get(playerId);
      
      if (!player || !player.alive) return;
      
      if (data.type === 'move' && gameState.gamePhase === 'exploration') {
        const { dx, dy } = data;
        const newX = Math.max(0, Math.min(getCurrentRoomTemplate().width - 1, player.x + dx));
        const newY = Math.max(0, Math.min(getCurrentRoomTemplate().height - 1, player.y + dy));
        
        if (isValidPosition(newX, newY, playerId)) {
          player.x = newX;
          player.y = newY;
          
          broadcast({
            type: 'playerMoved',
            playerId: playerId,
            x: player.x,
            y: player.y
          });
          
          // Check if combat should trigger
          checkCombatTrigger();
        }
      } else if (data.type === 'nextRoom') {
        if (isRoomCleared() && gameState.gamePhase === 'exploration') {
          nextRoom();
        }
      } else if (data.type === 'useSkill' && gameState.gamePhase === 'combat') {
        // Handle skill usage (similar to previous implementation)
        const currentTurn = getCurrentTurn();
        if (currentTurn?.id !== playerId || currentTurn?.type !== 'player') {
          return;
        }
        
        const { skillId, targetId, targetX, targetY } = data;
        const skill = SKILLS[skillId];
        
        if (!skill || player.ap < skill.cost) return;
        
        // Handle movement skills
        if (skill.type === 'movement') {
          if (targetX === undefined || targetY === undefined) return;
          
          const movementRange = getMovementRange(player);
          const distance = Math.abs(player.x - targetX) + Math.abs(player.y - targetY);
          
          if (distance > movementRange || !isValidPosition(targetX, targetY, playerId)) {
            return;
          }
          
          // Execute movement
          player.ap -= skill.cost;
          const oldX = player.x;
          const oldY = player.y;
          player.x = targetX;
          player.y = targetY;
          
          const message = `${playerId} moves from (${oldX},${oldY}) to (${targetX},${targetY})`;
          addCombatLog(message);
          
          broadcast({
            type: 'playerMoved',
            playerId: playerId,
            fromX: oldX,
            fromY: oldY,
            x: targetX,
            y: targetY,
            distance: distance,
            message: message
          });
          
          return;
        }
        
        // Handle combat skills - find target
        let target = gameState.players.get(targetId);
        if (!target) {
          const enemies = getCurrentEnemies();
          target = enemies.get(targetId);
        }
        
        if (!target || !target.alive) return;
        
        // Check range
        const distance = Math.abs(player.x - target.x) + Math.abs(player.y - target.y);
        if (distance > skill.range) return;
        
        // Execute skill
        player.ap -= skill.cost;
        
        if (skill.damage) {
          const damage = Math.floor(Math.random() * (skill.damage[1] - skill.damage[0] + 1)) + skill.damage[0];
          target.health -= damage;
          
          const message = `${playerId} uses ${skill.name} on ${targetId} for ${damage} damage!`;
          addCombatLog(message);
          
          broadcast({
            type: 'skillUsed',
            attacker: playerId,
            target: targetId,
            skill: skillId,
            damage: damage,
            message: message
          });
          
          if (target.health <= 0) {
            target.alive = false;
            player.kills++;
            
            addCombatLog(`${targetId} has been defeated!`);
            broadcast({
              type: targetId.startsWith('p') ? 'playerKilled' : 'enemyKilled',
              [targetId.startsWith('p') ? 'playerId' : 'enemyId']: targetId,
              killer: playerId
            });
            
            gameState.turnOrder = gameState.turnOrder.filter(t => t.id !== targetId);
            if (gameState.currentTurnIndex >= gameState.turnOrder.length) {
              gameState.currentTurnIndex = 0;
            }
          }
        } else if (skill.healing) {
          const healing = Math.floor(Math.random() * (skill.healing[1] - skill.healing[0] + 1)) + skill.healing[0];
          target.health = Math.min(target.maxHealth, target.health + healing);
          
          const message = `${playerId} uses ${skill.name} and heals for ${healing}!`;
          addCombatLog(message);
          
          broadcast({
            type: 'skillUsed',
            attacker: playerId,
            target: targetId,
            skill: skillId,
            healing: healing,
            message: message
          });
        }
      } else if (data.type === 'endTurn' && gameState.gamePhase === 'combat') {
        const currentTurn = getCurrentTurn();
        if (currentTurn?.id === playerId && currentTurn?.type === 'player') {
          endTurn();
        }
      } else if (data.type === 'getMovementRange' && gameState.gamePhase === 'combat') {
        // Send back valid movement positions
        const currentTurn = getCurrentTurn();
        if (currentTurn?.id === playerId && currentTurn?.type === 'player') {
          const movementRange = getMovementRange(player);
          const validPositions = getValidMovementPositions(player, movementRange);
          
          ws.send(JSON.stringify({
            type: 'movementRange',
            range: movementRange,
            positions: validPositions,
            currentPos: { x: player.x, y: player.y }
          }));
        }
      }
    } catch (e) {
      console.error('Invalid message:', e);
    }
  });
  
  // Handle disconnect
  ws.on('close', () => {
    console.log(`Player ${playerId} disconnected`);
    gameState.players.delete(playerId);
    
    gameState.turnOrder = gameState.turnOrder.filter(t => t.id !== playerId);
    if (gameState.currentTurnIndex >= gameState.turnOrder.length) {
      gameState.currentTurnIndex = 0;
    }
    
    broadcast({
      type: 'playerLeft',
      playerId: playerId
    });
  });
});

function broadcast(data, excludeWs = null) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

const PORT = 3003;
server.listen(PORT, () => {
  console.log(`Dungeon crawler server running on http://localhost:${PORT}`);
});