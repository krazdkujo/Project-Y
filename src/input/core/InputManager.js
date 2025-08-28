/**
 * Input Manager
 * Centralized input handling system for the game
 */

class InputManager {
  constructor() {
    this.keyHandlers = new Map();
    this.currentUIState = 'guild';
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;
    
    this.setupEventListeners();
    this.setupKeyMappings();
    this.initialized = true;
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('input', (e) => this.handleInput(e));
    document.addEventListener('DOMContentLoaded', () => this.initialize());
  }

  handleKeyDown(e) {
    // Check if input field is focused
    const activeElement = document.activeElement;
    const isInputFocused = activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.isContentEditable
    );
    
    if (isInputFocused) return;

    const key = e.key.toLowerCase().replace('arrow', '');
    const handler = this.keyHandlers.get(key);
    
    if (handler) {
      e.preventDefault();
      handler();
    }
  }

  handleInput(e) {
    if (e.target.id === 'character-name-input') {
      characterGenerator.handleNameInput();
    }
  }

  setupKeyMappings() {
    // Movement keys (WASD + Arrow keys)
    this.registerKey('w', () => this.handleMovementKey(0, -1));
    this.registerKey('up', () => this.handleMovementKey(0, -1));
    this.registerKey('s', () => this.handleMovementKey(0, 1));
    this.registerKey('down', () => this.handleMovementKey(0, 1));
    this.registerKey('a', () => this.handleMovementKey(-1, 0));
    this.registerKey('left', () => this.handleMovementKey(-1, 0));
    this.registerKey('d', () => this.handleMovementKey(1, 0));
    this.registerKey('right', () => this.handleMovementKey(1, 0));

    // Ability keys (1-9)
    for (let i = 1; i <= 9; i++) {
      this.registerKey(i.toString(), () => this.handleAbilityKey(i));
    }

    // Action keys
    this.registerKey(' ', () => this.handleWaitKey());
    this.registerKey('space', () => this.handleWaitKey());
    this.registerKey('g', () => this.toggleGuildInterface());
    this.registerKey('m', () => this.openWorldMap());
    this.registerKey('escape', () => this.handleEscape());
  }

  registerKey(key, handler) {
    this.keyHandlers.set(key, handler);
  }

  setUIState(state) {
    this.currentUIState = state;
  }

  // Delegate to appropriate handlers
  handleMovementKey(dx, dy) {
    if (this.currentUIState === 'dungeon' && window.movementSystem) {
      window.movementSystem.handleMovement(dx, dy);
    }
  }

  handleAbilityKey(abilityNum) {
    if (window.abilityHandler) {
      window.abilityHandler.handleAbilityActivation(abilityNum);
    }
  }

  handleWaitKey() {
    if (this.currentUIState === 'dungeon') {
      addLog('You wait and observe your surroundings...', 'system');
    }
  }

  toggleGuildInterface() {
    if (this.currentUIState === 'guild') {
      switchToDungeonState();
    } else {
      switchToGuildState();
    }
  }

  openWorldMap() {
    if (this.currentUIState === 'world-map') {
      switchToDungeonState();
    } else if (this.currentUIState === 'dungeon' || this.currentUIState === 'guild') {
      switchToWorldMapState();
    }
  }

  handleEscape() {
    if (this.currentUIState !== 'dungeon') {
      switchToDungeonState();
    }
  }
}

// Create global instance
window.inputManager = new InputManager();

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { InputManager };
}