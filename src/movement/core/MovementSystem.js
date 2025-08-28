/**
 * Movement System
 * Handles player movement and basic movement coordination
 */

class MovementSystem {
  constructor() {
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;
    this.initialized = true;
  }

  handleMovement(dx, dy) {
    if (!window.gameState.party.members.size) {
      addLog('No party members! Visit Guild Base to create characters.', 'system');
      return;
    }

    // Calculate new position
    const newX = window.gameState.location.playerX + dx;
    const newY = window.gameState.location.playerY + dy;

    // Validate movement
    if (!window.movementValidator || !window.movementValidator.canMoveTo(newX, newY)) {
      addLog('Cannot move there!', 'system');
      return;
    }

    // Update position
    window.gameState.location.playerX = newX;
    window.gameState.location.playerY = newY;
    
    // Process turn effects
    this.processTurnEffects();
    
    // Update display
    if (window.uiManager) {
      window.uiManager.updateMapDisplay();
    }
  }

  processTurnEffects() {
    // Process enemy movements
    if (window.enemyAI) {
      window.enemyAI.processEnemyTurn();
    }
    
    // Other per-turn effects could go here
    // (regeneration, poison, etc.)
  }
}

// Create global instance
window.movementSystem = new MovementSystem();

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MovementSystem };
}