# Movement System

## Purpose
Comprehensive movement system for the single-player ASCII roguelike. Handles player movement, movement validation, enemy AI pathfinding, and combat movement mechanics.

## Architecture

### Core Components
- **MovementSystem** (`core/MovementSystem.js`) - Player movement coordinator
- **MovementValidator** (`validation/MovementValidator.js`) - Movement validation and collision detection
- **EnemyAI** (`ai/EnemyAI.js`) - Enemy pathfinding and combat AI

### Key Features
- **Player Movement**: WASD/Arrow key movement with validation
- **Collision Detection**: Wall, entity, and boundary collision checking
- **Enemy Pathfinding**: Smart AI movement toward targets
- **Combat Movement**: Tactical movement during combat encounters
- **Turn Processing**: Coordinates movement effects and enemy turns

## Movement Types

### Exploration Movement
- Player moves as single party icon (@) on dungeon map
- Validates against walls, enemies, and room boundaries
- Triggers enemy AI turns and potential combat encounters

### Combat Movement
- Individual party members (1-6) move on tactical combat map
- Validates against combat room walls and other combatants
- Turn-based with movement restrictions

## AI Behavior

### Enemy Pathfinding
- **Target Selection**: Enemies choose optimal targets (usually player)
- **Approach Strategies**: Direct approach and cautious pathfinding
- **Combat Triggers**: Moving adjacent to player triggers combat
- **Random Movement**: Fallback when no valid approach exists

### Combat AI
- **Target Prioritization**: Multi-factor scoring (distance, health, threat)
- **Tactical Movement**: Move to attack range or optimal positions
- **Attack Decisions**: Choose between movement and attacks based on range

## Validation System

### Movement Rules
- **Boundary Checking**: Prevents movement outside room dimensions
- **Wall Collision**: Blocks movement through walls (#)
- **Entity Collision**: Prevents occupying same space as other entities
- **Combat Rules**: Additional restrictions during tactical combat

### Valid Move Generation
- **8-Directional Movement**: Supports diagonal movement
- **Path Options**: Generates all valid moves for AI pathfinding
- **Context-Aware**: Different rules for exploration vs combat

## Integration Points
- Coordinates with UI system for map updates
- Integrates with encounter system for combat triggers
- Uses GameState for position tracking and entity management
- Works with combat system for tactical movement

## Usage
```javascript
// Handle player movement
window.movementSystem.handleMovement(1, 0); // Move right

// Validate movement
const canMove = window.movementValidator.canMoveTo(x, y);

// Process enemy turn
window.enemyAI.processEnemyTurn();

// Get valid moves for pathfinding
const moves = window.movementValidator.getValidMoves(x, y, true);
```

## Dependencies
- GameState (global) - Position and entity tracking
- UIManager (window.uiManager) - Display updates
- DungeonGenerator (dungeonGenerator) - Room layout data
- EncounterManager (window.encounterManager) - Combat triggers