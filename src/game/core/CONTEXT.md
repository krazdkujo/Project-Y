# Folder Context: game/core

## Purpose
Core game management system providing central coordination for game operations, character management, and high-level game state coordination for the single-player ASCII roguelike.

## Key Files
- `GameManager.js` - Central game coordinator managing character operations, random character generation, ability initialization, and game state coordination

## Dependencies
- Internal: `../../core/GameState.js`, `../../character/generator/CharacterGenerator.js`, `../../character/skills/SkillSystem.js`, `../../abilities/core/AbilitySlotManager.js`
- External: None - pure JavaScript game coordination logic

## Integration Points
**Character Management Operations**:
- Active character selection and management
- Random character generation with name assignment
- Character ability initialization and slot management
- Party member coordination and state tracking

**Game State Coordination**:
- Central access point for game state operations
- Cross-system state synchronization
- Game initialization and setup coordination
- System startup and dependency management

**Character Generation Integration**:
- Random character creation with predefined name pools
- Skill allocation and initial character setup
- Starting equipment and ability assignment
- Guild storage integration for generated characters

**Ability System Coordination**:
- Character ability initialization and setup
- Ability slot management and assignment
- Character-ability integration and validation
- System coordination for ability functionality

## Game Management Features
**Character Operations**:
- Active character determination from party or combat state
- Character switching and selection management
- Character state validation and consistency checks
- Character lifecycle management

**Random Generation Systems**:
- Character name generation from predefined pools
- Random character stat and skill allocation
- Starting equipment and ability randomization
- Procedural character creation algorithms

**System Coordination**:
- Game system initialization in proper dependency order
- Cross-system communication and coordination
- State management and synchronization
- System integration and interaction management

## Character Creation Workflow
1. **Name Generation**: Random selection from character name pools
2. **Character Generation**: Random stat and skill allocation
3. **Guild Storage**: Add character to guild character collection
4. **Ability Initialization**: Set up character abilities and slots
5. **Validation**: Ensure character completeness and consistency

**Character Name Pools**:
- Fantasy-themed character names for variety
- Gender-neutral names for inclusive character generation
- Diverse cultural influences in name selection
- Extensible name pools for customization

## Game State Management
- Centralized game state access and coordination
- System state synchronization and updates
- Game phase management and transitions
- Error handling and state recovery

## Last Updated
2025-08-27: Created core game management documentation covering character operations, random generation, and system coordination