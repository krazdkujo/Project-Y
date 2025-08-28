/**
 * Event System for Single-Player Game
 * Lightweight event communication between modules
 */

class EventSystem {
  constructor() {
    this.listeners = new Map();
  }

  // Subscribe to an event
  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);
  }

  // Unsubscribe from an event
  off(eventName, callback) {
    if (this.listeners.has(eventName)) {
      const callbacks = this.listeners.get(eventName);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emit an event
  emit(eventName, data = {}) {
    if (this.listeners.has(eventName)) {
      this.listeners.get(eventName).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error);
        }
      });
    }
  }

  // One-time event listener
  once(eventName, callback) {
    const onceCallback = (data) => {
      callback(data);
      this.off(eventName, onceCallback);
    };
    this.on(eventName, onceCallback);
  }

  // Get all event names (for debugging)
  getEventNames() {
    return Array.from(this.listeners.keys());
  }

  // Clear all listeners
  clear() {
    this.listeners.clear();
  }
}

// Event name constants for consistency
const EVENTS = {
  // Party events
  PARTY_MEMBER_ADDED: 'party:member_added',
  PARTY_MEMBER_REMOVED: 'party:member_removed',
  PARTY_FORMATION_CHANGED: 'party:formation_changed',
  
  // Character events
  CHARACTER_LEVEL_UP: 'character:level_up',
  CHARACTER_SKILL_GAINED: 'character:skill_gained',
  CHARACTER_CLASS_UNLOCKED: 'character:class_unlocked',
  CHARACTER_DIED: 'character:died',
  CHARACTER_REVIVED: 'character:revived',
  
  // Combat events
  COMBAT_STARTED: 'combat:started',
  COMBAT_ENDED: 'combat:ended',
  TURN_STARTED: 'turn:started',
  TURN_ENDED: 'turn:ended',
  ABILITY_USED: 'ability:used',
  DAMAGE_DEALT: 'damage:dealt',
  
  // Location events
  LOCATION_CHANGED: 'location:changed',
  MAP_GENERATED: 'map:generated',
  ROOM_ENTERED: 'room:entered',
  ENCOUNTER_TRIGGERED: 'encounter:triggered',
  
  // Dungeon events
  RUN_STARTED: 'run:started',
  RUN_COMPLETED: 'run:completed',
  FLOOR_CHANGED: 'floor:changed',
  BOSS_ENCOUNTERED: 'boss:encountered',
  
  // Guild events
  GUILD_UPGRADED: 'guild:upgraded',
  CHARACTER_RECRUITED: 'guild:character_recruited',
  ITEM_STORED: 'guild:item_stored',
  
  // UI events
  UI_UPDATED: 'ui:updated',
  VIEWPORT_CHANGED: 'viewport:changed',
  MENU_OPENED: 'menu:opened',
  MENU_CLOSED: 'menu:closed'
};

// Browser compatibility
// Browser compatibility (existing pattern)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EventSystem, EVENTS };
} else {
  window.EventSystem = EventSystem;
  window.EVENTS = EVENTS;
}

// ES6 module exports
export { EventSystem, EVENTS };