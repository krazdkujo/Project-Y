import { PlayerId, FreeAction, ActionResult, Player, Position, ActionEffect } from '../shared/types';
import { FREE_ACTIONS, ERROR_MESSAGES, GAME_CONFIG } from '../shared/constants';

/**
 * FreeActionProcessor handles immediate execution of free actions
 * - Movement (0 AP, immediate)
 * - Basic attacks (0 AP, immediate)
 * - Basic defense (0 AP, immediate)
 */
export class FreeActionProcessor {
  private players: Map<PlayerId, Player> = new Map();
  private gameMap: GameMap = new GameMap(); // Simplified game map for positioning

  /**
   * Execute a free action immediately (no AP cost or validation needed)
   */
  executeImmediately(action: FreeAction): ActionResult {
    const player = this.players.get(action.playerId);
    if (!player) {
      return {
        success: false,
        reason: 'Player not found',
        timestamp: Date.now()
      };
    }

    switch (action.type) {
      case 'MOVE':
        return this.processMovement(action, player);
      
      case 'BASIC_ATTACK':
        return this.processBasicAttack(action, player);
      
      case 'BASIC_DEFENSE':
        return this.processBasicDefense(action, player);
      
      default:
        return {
          success: false,
          reason: ERROR_MESSAGES.INVALID_ACTION,
          timestamp: Date.now()
        };
    }
  }

  /**
   * Process movement action (1 square, no obstacles)
   */
  private processMovement(action: FreeAction, player: Player): ActionResult {
    const targetPosition = action.target as Position;
    if (!targetPosition) {
      return {
        success: false,
        reason: ERROR_MESSAGES.INVALID_TARGET,
        timestamp: Date.now()
      };
    }

    // Validate movement range (max 1 square for free movement)
    const distance = this.calculateDistance(player.position, targetPosition);
    if (distance > FREE_ACTIONS.MOVE.maxRange) {
      return {
        success: false,
        reason: ERROR_MESSAGES.OUT_OF_RANGE,
        timestamp: Date.now()
      };
    }

    // Check if target position is valid and unoccupied
    if (!this.gameMap.isValidPosition(targetPosition) || 
        this.gameMap.isOccupied(targetPosition)) {
      return {
        success: false,
        reason: 'Position is blocked or invalid',
        timestamp: Date.now()
      };
    }

    // Update player position
    const oldPosition = { ...player.position };
    player.position = targetPosition;
    this.gameMap.movePlayer(player.id, oldPosition, targetPosition);

    return {
      success: true,
      effects: [{
        type: 'move',
        target: player.id,
        value: 0, // Movement doesn't have a numeric value
        duration: 0
      }],
      timestamp: Date.now()
    };
  }

  /**
   * Process basic attack (1 square range, base damage)
   */
  private processBasicAttack(action: FreeAction, player: Player): ActionResult {
    const targetId = action.target as string;
    if (!targetId) {
      return {
        success: false,
        reason: ERROR_MESSAGES.INVALID_TARGET,
        timestamp: Date.now()
      };
    }

    const target = this.players.get(targetId);
    if (!target) {
      return {
        success: false,
        reason: 'Target not found',
        timestamp: Date.now()
      };
    }

    // Check range (adjacent for basic attacks)
    const distance = this.calculateDistance(player.position, target.position);
    if (distance > FREE_ACTIONS.BASIC_ATTACK.range) {
      return {
        success: false,
        reason: ERROR_MESSAGES.OUT_OF_RANGE,
        timestamp: Date.now()
      };
    }

    // Calculate damage
    const baseDamage = GAME_CONFIG.BASE_DAMAGE;
    const weaponDamage = this.calculateWeaponDamage(player);
    const skillBonus = Math.floor(player.skills.combat / 10);
    const totalDamage = baseDamage + weaponDamage + skillBonus;

    // Check for critical hit
    const criticalRoll = Math.floor(Math.random() * 100) + 1;
    const isCritical = criticalRoll <= GAME_CONFIG.CRITICAL_HIT_CHANCE;
    const finalDamage = isCritical ? 
      Math.floor(totalDamage * GAME_CONFIG.CRITICAL_HIT_MULTIPLIER) : 
      totalDamage;

    // Apply damage to target
    target.health = Math.max(0, target.health - finalDamage);

    return {
      success: true,
      effects: [{
        type: 'damage',
        target: targetId,
        value: finalDamage,
        duration: 0
      }],
      timestamp: Date.now()
    };
  }

  /**
   * Process basic defense (self-buff, +2 defense until next turn)
   */
  private processBasicDefense(action: FreeAction, player: Player): ActionResult {
    const defenseBonus = FREE_ACTIONS.BASIC_DEFENSE.defenseBonus;
    
    // Apply temporary defense buff
    // In a real implementation, this would modify the player's defense rating
    // For now, we'll simulate it as a status effect
    
    return {
      success: true,
      effects: [{
        type: 'status',
        target: player.id,
        value: defenseBonus,
        duration: 1 // Until next turn
      }],
      timestamp: Date.now()
    };
  }

  /**
   * Calculate distance between two positions
   */
  private calculateDistance(pos1: Position, pos2: Position): number {
    return Math.max(Math.abs(pos1.x - pos2.x), Math.abs(pos1.y - pos2.y));
  }

  /**
   * Calculate weapon damage bonus
   */
  private calculateWeaponDamage(player: Player): number {
    if (!player.equipment.weapon) {
      return 0;
    }

    // Parse weapon damage (simplified - assumes format like "1d6+2")
    const damageString = player.equipment.weapon.damage;
    const match = damageString.match(/(\d+)d(\d+)(?:\+(\d+))?/);
    
    if (!match) {
      return 0;
    }

    const [, numDiceStr, dieSizeStr, bonusStr] = match;
    const numDice = parseInt(numDiceStr!);
    const dieSize = parseInt(dieSizeStr!);
    let total = parseInt(bonusStr || '0');
    
    for (let i = 0; i < numDice; i++) {
      total += Math.floor(Math.random() * dieSize) + 1;
    }
    
    return total;
  }

  /**
   * Add a player to the processor
   */
  addPlayer(player: Player): void {
    this.players.set(player.id, player);
    this.gameMap.addPlayer(player.id, player.position);
  }

  /**
   * Remove a player from the processor
   */
  removePlayer(playerId: PlayerId): void {
    const player = this.players.get(playerId);
    if (player) {
      this.gameMap.removePlayer(playerId, player.position);
      this.players.delete(playerId);
    }
  }

  /**
   * Update player data
   */
  updatePlayer(player: Player): void {
    this.players.set(player.id, player);
  }

  /**
   * Get player by ID
   */
  getPlayer(playerId: PlayerId): Player | undefined {
    return this.players.get(playerId);
  }

  /**
   * Get all players
   */
  getAllPlayers(): Map<PlayerId, Player> {
    return new Map(this.players);
  }

  /**
   * Validate if a free action can be executed
   */
  validateFreeAction(action: FreeAction): boolean {
    const player = this.players.get(action.playerId);
    if (!player) {
      return false;
    }

    switch (action.type) {
      case 'MOVE':
        const targetPos = action.target as Position;
        return targetPos && 
               this.calculateDistance(player.position, targetPos) <= FREE_ACTIONS.MOVE.maxRange &&
               this.gameMap.isValidPosition(targetPos) &&
               !this.gameMap.isOccupied(targetPos);
      
      case 'BASIC_ATTACK':
        const targetId = action.target as string;
        const target = this.players.get(targetId);
        return !!target && 
               this.calculateDistance(player.position, target.position) <= FREE_ACTIONS.BASIC_ATTACK.range;
      
      case 'BASIC_DEFENSE':
        return true; // Defense can always be used
      
      default:
        return false;
    }
  }

  /**
   * Get valid targets for a player's free actions
   */
  getValidTargets(playerId: PlayerId, actionType: FreeAction['type']): (Position | PlayerId)[] {
    const player = this.players.get(playerId);
    if (!player) {
      return [];
    }

    switch (actionType) {
      case 'MOVE':
        return this.gameMap.getValidMovePositions(player.position, FREE_ACTIONS.MOVE.maxRange);
      
      case 'BASIC_ATTACK':
        return Array.from(this.players.values())
          .filter(target => target.id !== playerId)
          .filter(target => this.calculateDistance(player.position, target.position) <= FREE_ACTIONS.BASIC_ATTACK.range)
          .map(target => target.id);
      
      case 'BASIC_DEFENSE':
        return []; // Defense doesn't need targets
      
      default:
        return [];
    }
  }
}

/**
 * Simplified game map for tracking player positions
 */
class GameMap {
  private occupiedPositions = new Map<string, PlayerId>();
  private readonly mapWidth = 20;
  private readonly mapHeight = 20;

  /**
   * Check if a position is valid (within map bounds)
   */
  isValidPosition(position: Position): boolean {
    return position.x >= 0 && position.x < this.mapWidth &&
           position.y >= 0 && position.y < this.mapHeight;
  }

  /**
   * Check if a position is occupied by another player
   */
  isOccupied(position: Position): boolean {
    const key = `${position.x},${position.y}`;
    return this.occupiedPositions.has(key);
  }

  /**
   * Add a player to the map
   */
  addPlayer(playerId: PlayerId, position: Position): void {
    const key = `${position.x},${position.y}`;
    this.occupiedPositions.set(key, playerId);
  }

  /**
   * Remove a player from the map
   */
  removePlayer(playerId: PlayerId, position: Position): void {
    const key = `${position.x},${position.y}`;
    this.occupiedPositions.delete(key);
  }

  /**
   * Move a player from one position to another
   */
  movePlayer(playerId: PlayerId, oldPosition: Position, newPosition: Position): void {
    this.removePlayer(playerId, oldPosition);
    this.addPlayer(playerId, newPosition);
  }

  /**
   * Get valid move positions within range
   */
  getValidMovePositions(fromPosition: Position, range: number): Position[] {
    const validPositions: Position[] = [];
    
    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        if (dx === 0 && dy === 0) continue; // Skip current position
        
        const newPos = {
          x: fromPosition.x + dx,
          y: fromPosition.y + dy
        };
        
        if (this.isValidPosition(newPos) && !this.isOccupied(newPos)) {
          validPositions.push(newPos);
        }
      }
    }
    
    return validPositions;
  }

  /**
   * Get player at position
   */
  getPlayerAtPosition(position: Position): PlayerId | undefined {
    const key = `${position.x},${position.y}`;
    return this.occupiedPositions.get(key);
  }
}