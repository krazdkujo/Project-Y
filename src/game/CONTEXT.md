# Game Management System

## Purpose
Central game management system for the single-player ASCII roguelike. Coordinates major game operations, character lifecycle, run management, and core game utilities.

## Architecture

### Core Components
- **GameManager** (`core/GameManager.js`) - Central game coordinator and utility functions

### Key Features
- **Character Management**: Random character generation and ability initialization
- **Run Management**: Dungeon run lifecycle (start, end, state management)
- **Party Management**: Guild and party member coordination
- **Combat Testing**: Developer tools for testing combat encounters
- **Logging System**: Centralized adventure log with timestamps and categories

## Character System

### Random Character Generation
- **Name Selection**: Pool of 32 fantasy names
- **Skill Distribution**: 25 points across 3-6 randomly selected skills
- **Ability Initialization**: Auto-slot abilities based on character skills
- **Unique IDs**: Timestamp-based unique character identification

### Character Lifecycle
- **Creation**: Generate → Initialize abilities → Store in guild
- **Party Management**: Guild storage ↔ Active party (max 6 members)
- **Active Character**: Combat-aware active character selection

## Run Management

### Dungeon Runs
- **Start Requirements**: At least one party member required
- **State Management**: Tracks active run status and floor progression
- **UI Integration**: Enables/disables run control buttons
- **End Conditions**: Manual end or party wipe

### Combat Integration
- **Test Combat**: Developer tool for combat system testing
- **Encounter Triggers**: Coordinates with encounter system
- **Combat State**: Manages transitions between exploration and tactical combat

## Logging System

### Adventure Log
- **Categories**: System, combat, skill, exploration messages
- **Timestamps**: Real-time timestamps for all log entries
- **Memory Management**: Auto-cleanup after 200 entries (removes oldest 50)
- **Auto-scroll**: Scrolls to newest entries automatically

### Log Types
- **System**: General game state changes
- **Combat**: Combat actions and results
- **Skill**: Skill progression and mastery changes
- **Exploration**: Movement and discovery messages

## Guild Management

### Character Storage
- **Guild Repository**: Stores characters not in active party
- **Party Limits**: Maximum 6 active party members
- **Character Transfer**: Move characters between guild and party
- **Persistence**: Character data maintained across sessions

## Integration Points
- Coordinates with all major game systems
- Uses SkillSystem for character skill management
- Integrates with AbilitySlotManager for ability initialization
- Works with GameState for run and party management
- Coordinates with UI system for display updates

## Usage
```javascript
// Create random character
window.gameManager.createRandomCharacter();

// Start dungeon run
window.gameManager.startNewRun();

// Add character to party
window.gameManager.addToParty(characterId);

// Get active character
const activeChar = window.gameManager.getActiveCharacter();

// Add log message
window.gameManager.addLog('Message text', 'system');
```

## Dependencies
- GameState (global) - Core game state management
- SkillSystem (skillSystem) - Character skill progression
- AbilitySlotManager (abilitySlotManager) - Ability initialization
- CharacterGenerator (characterGenerator) - Character creation interface
- UI Manager (window.uiManager) - Display updates
- Guild Manager (window.guildManager) - Guild interface management