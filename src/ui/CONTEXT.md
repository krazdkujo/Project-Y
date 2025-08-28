# UI System

## Purpose
Centralized user interface management system for the single-player ASCII roguelike. Handles display updates, state transitions, and panel management.

## Architecture

### Core Components
- **UIManager** (`core/UIManager.js`) - Central UI coordinator and state manager
- **LeftPanel** (`panels/LeftPanel.js`) - Party display, character status, and abilities

### Key Features
- **State Management**: Manages UI state transitions (guild, dungeon, world-map, character-creation)
- **Display Updates**: Coordinates updates across all UI panels
- **Map Rendering**: Handles both exploration and combat map display
- **Party Management**: Real-time party status and active character display
- **Ability Interface**: Dynamic ability slot display with AP costs and availability

## UI States
- **guild**: Guild base interface with character management
- **dungeon**: Dungeon exploration with map and party status
- **world-map**: World map for location selection
- **character-creation**: Character creation interface
- **combat**: Tactical combat view (overlay on dungeon state)

## Display Components

### Left Panel
- Party member status with health/AP bars
- Active character details and turn information
- Ability slots (1-9) with availability indicators

### Center Panel (Map)
- **Exploration Mode**: Dungeon room with player (@), enemies (a-z), objects (&,+,{)
- **Combat Mode**: Tactical combat room with party members (1-6), current turn (@)

### Right Panel
- Adventure log and system messages
- Combat messages and ability feedback

## Integration Points
- Integrates with GameState for party and combat data
- Uses ability system (abilityRegistry, abilitySlotManager, abilityEngine)
- Coordinates with input system for state transitions
- Works with combat system for tactical display

## Usage
```javascript
// Initialize UI system
window.uiManager.initialize();

// Update all displays
window.uiManager.updateAllDisplays();

// Change UI state
window.uiManager.switchToDungeonState();

// Update specific panels
window.leftPanel.updatePartyDisplay();
```

## Dependencies
- GameState (global)
- Ability System (abilityRegistry, abilitySlotManager, abilityEngine)
- DungeonGenerator (dungeonGenerator)
- Input System (window.inputManager)