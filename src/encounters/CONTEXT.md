# Encounters System

## Purpose
Comprehensive encounter system for the single-player ASCII roguelike. Manages combat encounters, scaling from exploration to tactical combat, and combat room generation.

## Architecture

### Core Components
- **EncounterManager** (`core/EncounterManager.js`) - Combat trigger detection and enemy generation
- **EncounterScaling** (`scaling/EncounterScaling.js`) - Scales single enemies into tactical encounters
- **TacticalCombat** (`combat/TacticalCombat.js`) - Tactical combat room generation and management

### Key Features
- **Combat Triggers**: Detects when player encounters enemies on exploration map
- **Encounter Scaling**: Transforms single map enemies into multiple tactical combat enemies
- **Tactical Rooms**: Generates specialized combat arenas with cover and obstacles
- **Turn Management**: Coordinates turn-based tactical combat with initiative system
- **Dynamic Balancing**: Adjusts encounter difficulty based on party strength

## Encounter Flow

### 1. Exploration Phase
- Enemies spawn on dungeon maps based on floor and spawn points
- Player movement triggers proximity checks with enemies
- Adjacent enemies trigger combat encounters

### 2. Encounter Scaling
- Single map enemy becomes multiple combat enemies
- Scaling based on enemy type and dungeon floor
- Adds stat variations to avoid identical enemies

### 3. Tactical Combat
- Generates tactical combat room with walls and cover
- Positions party members (left side) and enemies (right side)
- Initializes turn-based combat with initiative system

### 4. Combat Resolution
- Turn-based combat with player control and enemy AI
- Victory awards experience and skill advancement
- Defeat triggers permadeath consequences

## Scaling Rules

### Enemy Count Scaling
```javascript
// Examples by enemy type and floor
goblin: 2 + floor (max 8)
rat: 3 + floor (max 10)
orc: 1 + floor/2 (max 6)
troll: 1 + floor/3 (max 4)
dragon: 1 (always solo)
```

### Difficulty Balancing
- **Stat Variation**: 10-30% variation in health/damage between enemies
- **Dynamic Adjustment**: Buffs/nerfs based on party vs encounter strength ratio
- **Floor Progression**: Higher floors spawn higher tier enemies

## Combat Rooms

### Room Layout
- **Size**: 15x12 tactical grid
- **Positioning**: Party (left side), enemies (right side)
- **Obstacles**: Walls and cover objects for tactical positioning
- **Line of Sight**: Wall-based obstruction for ranged combat

### Tactical Elements
- **Cover Objects**: Provide defensive bonuses
- **Wall Clusters**: Create chokepoints and tactical decisions
- **Open Areas**: Allow for movement and positioning

## Integration Points
- Uses GameState for combat state management
- Integrates with EnemySystem for enemy creation
- Coordinates with MovementValidator for positioning
- Works with UI system for combat display updates
- Uses DungeonGenerator for room templates and spawn points

## Usage
```javascript
// Trigger combat encounter
window.encounterManager.checkForCombatTrigger(enemy);

// Scale encounter
const scaledEnemies = window.encounterScaling.scaleCombatEncounter(mapEnemy);

// Start tactical combat
window.tacticalCombat.startTacticalCombat(enemies, originalEnemy);

// Generate room enemies
window.encounterManager.ensureRoomEnemiesGenerated();
```

## Dependencies
- GameState (global) - Combat state and party management
- EnemySystem (window.enemySystem) - Enemy creation and management
- DungeonGenerator (dungeonGenerator) - Room templates and spawn points
- SkillSystem (skillSystem) - Experience and skill advancement
- UI Manager (window.uiManager) - Combat display updates