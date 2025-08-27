# Folder Context: dungeon

## Purpose
Handles procedural dungeon generation for the tactical ASCII roguelike with room templates, lockable object placement, and floor-based difficulty scaling. Creates engaging dungeons with interactive elements that support the exploration and lockpicking systems.

## Key Files
- `DungeonGenerator.js` - Procedural dungeon generation with 4 room templates, lockable object placement, trap integration, and floor-based difficulty scaling

## Dependencies
- Internal: GameState for persistence, systems/lockpicking for lockable object definitions
- External: LockableObjectsManager for object templates and loot generation

## Integration Points
The dungeon system connects to:
- **Lockpicking System**: Automatically places lockable doors, chests, and containers in every room
- **Game State**: Persistent storage of room layouts and object states
- **Floor Progression**: Difficulty scaling based on dungeon floor level
- **Object Management**: Integration with LockableObjects definitions for consistent placement

## Dungeon Features
- **4 Room Templates**: treasure_room, guard_room, library, armory with unique lockable objects
- **Automatic Object Placement**: Every room gets floor-appropriate locked containers and doors
- **Difficulty Scaling**: Lock difficulties and trap complexity scale with dungeon floor
- **Trap Integration**: Automatic trap assignment to appropriate objects (treasure chests, vaults)
- **Persistent Generation**: Room objects tracked in GameState with unique IDs

## Room Object Distribution
- **Treasure Rooms**: wooden_chest, iron_chest, treasure_chest, vault_door
- **Guard Rooms**: supply_crate, lockbox, reinforced_door 
- **Libraries**: lockbox, wooden_chest, secret_door
- **Armories**: iron_chest, supply_crate, reinforced_door

## Last Updated
2025-08-27: Enhanced with lockpicking system integration and automatic object placement