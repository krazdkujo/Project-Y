# Folder Context: systems

## Purpose
Contains specialized game systems that provide enhanced gameplay mechanics beyond the core combat and character systems. These systems integrate with the main game engine to provide immersive features like environmental interaction, crafting, and security mechanics.

## Key Files
- `lockpicking/LockpickingSystem.js` - Core lockpicking mechanics with skill-based success rates, trap handling, and key usage
- `lockpicking/LockableObjects.js` - Definitions for doors, chests, containers, traps, and loot tables with difficulty scaling
- `lockpicking/LockpickingUI.js` (in ui/lockpicking/) - ASCII-based user interface for lockpicking interactions

## Dependencies
- Internal: Core GameState for persistent storage, EventSystem for notifications, AbilityEngine for skill integration
- External: None - pure JavaScript implementation

## Integration Points
The lockpicking system integrates with:
- **DungeonGenerator**: Automatically places lockable objects in rooms based on floor difficulty
- **GameState**: Persistent storage of object states, keys found, and player statistics
- **AbilityEngine**: Handles 5 lockpicking abilities (pick_lock, disable_trap, master_lockpick, pickpocket, grand_heist)
- **UI System**: Events for visual feedback and player interaction panels

## Last Updated
2025-08-27: Phase 1 lockpicking system implementation complete with full dungeon integration and ability support