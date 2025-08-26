/**
 * Combat Management System
 * Orchestrates combat initiation, coordination, and resolution
 */

class CombatManager {
  constructor(gameState, gameEvents, skillSystem, turnManager) {
    this.gameState = gameState;
    this.events = gameEvents;
    this.skillSystem = skillSystem;
    this.turnManager = turnManager;

    // Subscribe to relevant events
    this.events.on('room:generated', this.checkCombatTrigger.bind(this));
    this.events.on('player:moved', this.checkCombatTrigger.bind(this));
  }

  checkCombatTrigger() {
    if (this.gameState.isInCombat()) {
      return; // Already in combat
    }

    if (this.hasEnemiesInSight()) {
      this.startCombat();
    }
  }

  hasEnemiesInSight() {
    const enemies = this.gameState.getCurrentEnemies();
    
    for (let enemy of enemies.values()) {
      if (enemy.alive) {
        // For simplicity, enemies in the same room are always "visible"
        // In a more complex system, you'd check line of sight
        return true;
      }
    }
    return false;
  }

  startCombat() {
    this.gameState.setPhase('combat');
    this.gameState.addCombatLog('Enemies spotted! Combat begins!');

    // Get all living entities
    const players = this.gameState.getAlivePlayers();
    const enemies = Array.from(this.gameState.getCurrentEnemies().values())
      .filter(e => e.alive);

    // Emit combat started event - turn manager will handle initiative
    this.events.emit('combat:started', { players, enemies });
    
    // Emit broadcast event
    this.events.emitBroadcastRequired('combatStarted', {
      message: 'Combat has begun!',
      players: players.map(p => ({ id: p.id, health: p.health, ap: p.ap })),
      enemies: enemies.map(e => ({ id: e.id, health: e.health, ap: e.ap }))
    });

    return {
      success: true,
      message: 'Combat started',
      players: players.length,
      enemies: enemies.length
    };
  }

  endCombat(reason) {
    this.gameState.setPhase('exploration');
    this.gameState.addCombatLog(`Combat ended: ${reason}`);

    // Emit events
    this.events.emit('combat:ended', { reason });
    this.events.emitBroadcastRequired('combatEnded', {
      message: `Combat ended: ${reason}`,
      gamePhase: 'exploration'
    });

    return {
      success: true,
      message: `Combat ended: ${reason}`
    };
  }

  // Handle skill usage during combat
  handleSkillUsage(playerId, skillId, targetId, targetPosition) {
    // Validate it's the player's turn
    const currentTurn = this.gameState.getCurrentTurn();
    if (!currentTurn || currentTurn.id !== playerId || currentTurn.type !== 'player') {
      return { 
        success: false, 
        reason: 'Not your turn' 
      };
    }

    // Execute skill through skill system
    const result = this.skillSystem.executeSkill(
      playerId, 
      skillId, 
      targetId, 
      targetPosition, 
      this.gameState
    );

    if (result.success) {
      // Emit broadcast event with result
      this.events.emitBroadcastRequired('skillUsed', {
        ...result,
        gameState: this.gameState.getClientState()
      });

      // Check if combat should end
      this.checkCombatEndConditions();
    }

    return result;
  }

  checkCombatEndConditions() {
    const alivePlayers = this.gameState.getAlivePlayers().length;
    const aliveEnemies = Array.from(this.gameState.getCurrentEnemies().values())
      .filter(e => e.alive).length;

    if (alivePlayers === 0) {
      this.endCombat('All players defeated');
      return true;
    }
    
    if (aliveEnemies === 0) {
      this.endCombat('All enemies defeated');
      return true;
    }

    return false;
  }

  // Handle end turn request
  handleEndTurn(playerId) {
    if (!this.gameState.isInCombat()) {
      return { success: false, reason: 'Not in combat' };
    }

    const result = this.turnManager.endTurn(playerId);
    
    if (result.success) {
      this.events.emitBroadcastRequired('turnEnded', {
        message: result.message,
        gameState: this.gameState.getClientState()
      });
    }

    return result;
  }

  // Get current combat state
  getCombatState() {
    if (!this.gameState.isInCombat()) {
      return { inCombat: false };
    }

    return {
      inCombat: true,
      currentTurn: this.gameState.getCurrentTurn(),
      turnOrder: this.gameState.turnOrder,
      players: Object.fromEntries(this.gameState.players),
      enemies: Object.fromEntries(this.gameState.getCurrentEnemies()),
      combatLog: this.gameState.combatLog.slice(-10) // Last 10 messages
    };
  }

  // Handle message routing for combat-related actions
  handleMessage(message, playerId) {
    const { type, data } = message;

    switch (type) {
      case 'useSkill':
        return this.handleSkillUsage(
          playerId,
          data.skillId,
          data.targetId,
          data.targetPosition || { x: data.targetX, y: data.targetY }
        );

      case 'endTurn':
        return this.handleEndTurn(playerId);

      case 'getCombatState':
        return { success: true, data: this.getCombatState() };

      default:
        return { success: false, reason: `Unknown combat message type: ${type}` };
    }
  }

  // Force start combat (for testing/admin)
  forceStartCombat() {
    if (this.gameState.isInCombat()) {
      return { success: false, reason: 'Already in combat' };
    }

    return this.startCombat();
  }

  // Force end combat (for testing/admin)
  forceEndCombat() {
    if (!this.gameState.isInCombat()) {
      return { success: false, reason: 'Not in combat' };
    }

    return this.endCombat('Forced end');
  }
}

module.exports = CombatManager;