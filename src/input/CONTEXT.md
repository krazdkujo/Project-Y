# Input System

## Purpose
Centralized input handling system for the single-player ASCII roguelike. Manages keyboard input, ability activation, and input delegation to appropriate game systems.

## Architecture

### Core Components
- **InputManager** (`core/InputManager.js`) - Central input coordinator and event handler
- **AbilityHandler** (`handlers/AbilityHandler.js`) - Manages ability activation and validation

### Key Features
- **Unified Input Processing**: Single entry point for all keyboard input
- **Context-Aware**: Different behavior based on UI state (dungeon, guild, etc.)
- **Input Validation**: Prevents input when text fields are focused
- **Ability System Integration**: Handles ability slot activation (1-9 keys)
- **Movement Delegation**: Routes movement commands to movement system

## Input Mappings

### Movement
- WASD + Arrow Keys: Character/party movement in dungeon mode

### Abilities  
- 1-9: Activate ability slots for current character
- Space: Wait/observe action

### Interface
- G: Toggle guild interface
- M: Open world map
- Escape: Close interfaces

## Integration Points
- Delegates movement to `window.movementSystem`
- Routes abilities through `window.abilityHandler`  
- UI actions handled by `window.uiManager`
- Integrates with combat system for turn validation

## Usage
```javascript
// Initialize input system
window.inputManager.initialize();

// Change UI context
window.inputManager.setUIState('dungeon');

// Register custom key handler
window.inputManager.registerKey('t', () => console.log('Test key pressed'));
```

## Dependencies
- GameState (global)
- UI Manager (window.uiManager)
- Movement System (window.movementSystem)
- Ability System (window.abilitySystem)
- Combat Manager (window.combatManager)