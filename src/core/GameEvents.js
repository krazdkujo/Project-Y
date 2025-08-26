/**
 * Event System for Module Communication
 * Provides loosely coupled communication between game modules
 */
const EventEmitter = require('events');

class GameEvents extends EventEmitter {
  // Combat events
  static COMBAT_STARTED = 'combat:started';
  static COMBAT_ENDED = 'combat:ended';
  static TURN_STARTED = 'turn:started';
  static TURN_ENDED = 'turn:ended';
  static SKILL_USED = 'skill:used';
  
  // Player events
  static PLAYER_JOINED = 'player:joined';
  static PLAYER_LEFT = 'player:left';
  static PLAYER_MOVED = 'player:moved';
  static PLAYER_KILLED = 'player:killed';
  static PLAYER_HEALED = 'player:healed';
  
  // Enemy events
  static ENEMY_SPAWNED = 'enemy:spawned';
  static ENEMY_KILLED = 'enemy:killed';
  static ENEMY_MOVED = 'enemy:moved';
  
  // Room events
  static ROOM_CHANGED = 'room:changed';
  static ROOM_CLEARED = 'room:cleared';
  static ROOM_GENERATED = 'room:generated';
  
  // System events
  static STATE_UPDATED = 'state:updated';
  static BROADCAST_REQUIRED = 'broadcast:required';

  constructor() {
    super();
    this.setMaxListeners(50); // Increase for multiple modules
  }

  // Helper methods for common event patterns
  emitCombatStarted(turnOrder) {
    this.emit(GameEvents.COMBAT_STARTED, { turnOrder });
  }

  emitCombatEnded(winner) {
    this.emit(GameEvents.COMBAT_ENDED, { winner });
  }

  emitPlayerMoved(playerId, oldPosition, newPosition) {
    this.emit(GameEvents.PLAYER_MOVED, {
      playerId,
      oldPosition,
      newPosition
    });
  }

  emitSkillUsed(playerId, skillId, targetId, damage, healing) {
    this.emit(GameEvents.SKILL_USED, {
      playerId,
      skillId,
      targetId,
      damage,
      healing
    });
  }

  emitBroadcastRequired(messageType, data, excludeWs = null) {
    this.emit(GameEvents.BROADCAST_REQUIRED, {
      messageType,
      data,
      excludeWs
    });
  }

  emitStateUpdated() {
    this.emit(GameEvents.STATE_UPDATED);
  }

  // Debug helper - log all events
  enableDebugLogging() {
    const originalEmit = this.emit;
    this.emit = function(event, ...args) {
      console.log(`[EVENT] ${event}:`, args[0] || '');
      return originalEmit.call(this, event, ...args);
    };
  }
}

module.exports = GameEvents;