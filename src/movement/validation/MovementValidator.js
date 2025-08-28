/**
 * Movement Validator
 * Validates movement for players and entities
 */

class MovementValidator {
  constructor() {
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;
    this.initialized = true;
  }

  canMoveTo(x, y) {
    // Check if we're in combat mode
    if (window.gameState.combat.active) {
      return this.canMoveInCombat(x, y);
    }

    // Get current room from dungeon generator if in dungeon
    if (!window.gameState.currentRun.active) {
      return true; // Allow free movement outside dungeons
    }

    const currentRoom = window.gameState.currentRun.floor || 1;
    const template = dungeonGenerator.getCurrentTemplate(currentRoom);
    
    if (!template) {
      console.warn('No room template found for validation');
      return false;
    }

    // Check bounds
    if (x < 0 || x >= template.width || y < 0 || y >= template.height) {
      return false;
    }

    // Check for walls
    const isWall = template.walls && template.walls.some(([wx, wy]) => wx === x && wy === y);
    if (isWall) {
      return false;
    }

    // Check for other blocking entities
    const enemies = window.gameState.getCurrentEnemies ? window.gameState.getCurrentEnemies() : new Map();
    const enemyBlocking = Array.from(enemies.values()).some(enemy => 
      enemy.alive && enemy.x === x && enemy.y === y
    );
    
    return !enemyBlocking;
  }

  canEnemyMoveTo(x, y) {
    // Get current room from dungeon generator if in dungeon
    if (!window.gameState.currentRun.active) {
      return true;
    }

    const currentRoom = window.gameState.currentRun.floor || 1;
    const template = dungeonGenerator.getCurrentTemplate(currentRoom);
    
    if (!template) {
      return false;
    }

    // Check bounds
    if (x < 0 || x >= template.width || y < 0 || y >= template.height) {
      return false;
    }

    // Check for walls
    const isWall = template.walls && template.walls.some(([wx, wy]) => wx === x && wy === y);
    if (isWall) {
      return false;
    }

    // Check for player position
    if (x === window.gameState.location.playerX && y === window.gameState.location.playerY) {
      return false; // Enemy cannot move to player position (triggers combat instead)
    }

    // Check for other enemies
    const enemies = window.gameState.getCurrentEnemies ? window.gameState.getCurrentEnemies() : new Map();
    const enemyBlocking = Array.from(enemies.values()).some(enemy => 
      enemy.alive && enemy.x === x && enemy.y === y
    );
    
    return !enemyBlocking;
  }

  canMoveInCombat(x, y) {
    const combatRoom = window.gameState.combat.currentRoom;
    if (!combatRoom) {
      return false;
    }

    // Check bounds
    if (x < 0 || x >= combatRoom.width || y < 0 || y >= combatRoom.height) {
      return false;
    }

    // Check for walls
    const isWall = combatRoom.walls && combatRoom.walls.some(([wx, wy]) => wx === x && wy === y);
    if (isWall) {
      return false;
    }

    // Check for other entities in combat
    const enemies = window.gameState.combat.enemies;
    const partyMembers = Array.from(window.gameState.party.members.values());
    
    const entityBlocking = [
      ...Array.from(enemies.values()),
      ...partyMembers
    ].some(entity => entity.alive && entity.x === x && entity.y === y);
    
    return !entityBlocking;
  }

  // Get valid moves for pathfinding
  getValidMoves(x, y, isEnemy = false) {
    const moves = [
      { x: x - 1, y: y },     // Left
      { x: x + 1, y: y },     // Right
      { x: x, y: y - 1 },     // Up
      { x: x, y: y + 1 },     // Down
      { x: x - 1, y: y - 1 }, // Up-left
      { x: x + 1, y: y - 1 }, // Up-right
      { x: x - 1, y: y + 1 }, // Down-left
      { x: x + 1, y: y + 1 }  // Down-right
    ];

    return moves.filter(move => 
      isEnemy ? this.canEnemyMoveTo(move.x, move.y) : this.canMoveTo(move.x, move.y)
    );
  }
}

// Create global instance
window.movementValidator = new MovementValidator();

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MovementValidator };
}