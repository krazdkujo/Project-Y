# Folder Context: movement/core

## Purpose
Core movement system managing character and entity movement within the ASCII roguelike's tactical grid-based environment. Handles movement validation, pathfinding, and integration with combat and exploration systems.

## Key Files
- `MovementSystem.js` - Primary movement system coordinating character movement, grid validation, and tactical positioning

## Dependencies
- Internal: `../../core/GameState.js`, `../../core/EventSystem.js`, `../validation/MovementValidator.js`, `../../dungeon/DungeonGenerator.js`
- External: None - pure JavaScript grid-based movement logic

## Integration Points
**Grid-Based Movement**:
- Tactical grid positioning with coordinate management
- Adjacent tile movement validation
- Dungeon layout integration for valid movement areas
- Obstacle detection and collision handling

**Combat Integration**:
- Turn-based movement during combat encounters
- AP cost management for movement actions
- Tactical positioning for combat advantages
- Initiative order consideration for movement timing

**Dungeon System Integration**:
- Dungeon layout awareness for movement boundaries
- Room transition handling and validation
- Door and passage navigation
- Exploration movement and area discovery

**Character System Integration**:
- Party member movement coordination
- Individual character position tracking
- Movement speed and agility considerations
- Character-specific movement capabilities

## Movement Architecture
**Grid Coordinate System**:
- 2D coordinate system (x, y) for character positions
- Grid-based movement with single-tile steps
- Cardinal direction movement (north, south, east, west)
- Diagonal movement capabilities and restrictions

**Movement Validation**:
- Terrain passability checking
- Obstacle collision detection
- Boundary validation within dungeon areas
- Character collision and stacking rules

**Position Management**:
- Character position state tracking
- Real-time position updates and synchronization
- Position history for movement undo functionality
- Multi-character position coordination

## Tactical Movement Features
**Combat Movement**:
- AP-based movement costs during combat
- Tactical positioning for ability range and effectiveness
- Movement restrictions based on combat state
- Strategic positioning considerations

**Exploration Movement**:
- Free movement during exploration phases
- Area discovery through movement
- Hidden area and secret door detection
- Resource-free exploration navigation

## Future Integration Points
- Advanced pathfinding algorithms for complex navigation
- Movement animation and visual feedback systems
- Environmental movement modifiers and effects
- Group movement and formation management

## Last Updated
2025-08-27: Created core movement system documentation covering grid-based movement, tactical positioning, and system integration