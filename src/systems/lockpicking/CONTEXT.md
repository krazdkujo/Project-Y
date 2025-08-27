# Folder Context: lockpicking

## Purpose
Implements the complete lockpicking and security system for the tactical ASCII roguelike. Provides skill-based lockpicking mechanics, trap handling, key management, and object security features that enhance dungeon exploration gameplay.

## Key Files
- `LockpickingSystem.js` - Core system managing lock picking attempts, trap disabling, key usage, and success rate calculations based on character skills
- `LockableObjects.js` - Comprehensive definitions for lockable doors, chests, containers, traps, and loot tables with difficulty-based scaling
- `../ui/lockpicking/LockpickingUI.js` - ASCII interface for player interactions with lockpicking mechanics and visual feedback

## Dependencies
- Internal: GameState (persistent storage), EventSystem (notifications), character skills system
- External: None - self-contained JavaScript implementation

## Integration Points
The lockpicking system connects to:
- **Character Skills**: Uses lockpicking and nimble_fingers skill levels for success calculations
- **Dungeon Generation**: Objects automatically placed in rooms with appropriate difficulty scaling
- **Ability System**: 5 exploration abilities integrate through AbilityEngine (pick_lock, disable_trap, master_lockpick, pickpocket, grand_heist)
- **Game State Persistence**: Object states, keys found, and statistics survive save/load cycles
- **Event System**: Emits success/failure events for UI feedback and logging

## System Features
- **5 Difficulty Levels**: Simple (1) to Master (5) with scaling time requirements and failure penalties
- **Trap System**: 5 trap types from poison needles to explosive devices with area effects
- **Key Management**: Skeleton keys, master keys, and object-specific keys
- **Loot Generation**: 6 different loot tables with weighted random item distribution
- **Persistent State**: All lockpicking progress and object states saved with game
- **Skill Progression**: XP awarded for attempts, with bonus XP for successful picks

## Last Updated
2025-08-27: Complete Phase 1 implementation with full integration into dungeon exploration system