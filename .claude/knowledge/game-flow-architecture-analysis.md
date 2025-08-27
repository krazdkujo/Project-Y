# Game Flow Architecture Analysis

## Executive Summary

The single-player party-based ASCII roguelike has a well-structured foundation with clear location management in GameState.js, but is **missing critical world map and dungeon selection UI components** to complete the intended game progression from character creation → guild town → world map → dungeon selection → dungeon exploration.

## Current Location System Architecture

### GameState Location Management (`src/core/GameState.js`)

The location system supports three location types:
- `'guild'` - Guild base interface (✅ implemented)  
- `'overworld'` - World map/dungeon exploration (⚠️ partially implemented)
- `'combat'` - Combat instances (✅ implemented)

**Key Location Properties:**
```javascript
location: {
  type: 'guild',        // Location type
  mapId: null,         // Unique map identifier  
  playerX: 0,          // Player position
  playerY: 0,
  mapData: null,       // Generated map data
  viewport: {          // Camera/view settings
    width: 25, height: 20,
    offsetX: 0, offsetY: 0
  }
}
```

### Existing Game Flow Functions

**Implemented:**
- `startNewRun()` - Switches to 'overworld' type, generates floor ID
- `returnToGuild()` - Returns to guild base
- `advanceFloor()` - Progresses between dungeon floors
- `startCombat()` / `endCombat()` - Combat state transitions

**Current Flow:** Guild → Direct Overworld → Combat → Guild

## Missing Components Analysis

### 1. World Map Interface (Critical Gap)
**Status:** Missing entirely

**Required Components:**
- World map UI showing available dungeons/regions
- Dungeon selection interface with difficulty/floor preview
- Regional progression system (unlock new areas)
- Travel mechanics and resource costs

**Integration Points:**
- Should replace direct `startNewRun()` transition
- Needs UI panel in main game interface
- Must connect to DungeonGenerator for dungeon metadata

### 2. Dungeon Selection System (Critical Gap)  
**Status:** Missing entirely

**Current Issue:** `startNewRun()` immediately generates `floor_1_seed` without player choice

**Required Components:**
- Dungeon type selection (different themes/layouts)
- Difficulty modifier selection
- Floor depth selection (1-5 floors currently)
- Preview of dungeon characteristics
- Entry requirements/costs

### 3. Enhanced Location Transitions
**Status:** Partially implemented

**Current Gaps:**
- No UI feedback for location transitions
- Missing world map → dungeon entry flow
- No travel time or resource mechanics
- Missing dungeon exit to world map flow

## DungeonGenerator Capabilities Analysis

### Current Generation System (`src/dungeon/DungeonGenerator.js`)

**Strengths:**
- 4 pre-built room templates with different layouts
- Enemy positioning via spawn points
- Lockable objects and trap system
- Floor-based difficulty scaling
- Procedural enemy generation integration

**Template System:**
- Large open chamber (25x20)
- Pillared hall (28x18)  
- Maze-like chamber (26x22)
- Grand circular chamber (24x24)

**Generation Flow:**
1. Template selection: `(roomNumber - 1) % templates.length`
2. Enemy spawning via EnemySystem 
3. Object/trap placement via LockpickingSystem integration
4. Difficulty scaling based on floor level

### Missing Dungeon Selection Features

**Dungeon Themes:** Only room-level templates exist - no dungeon-wide themes
**Dungeon Types:** No distinct dungeon types (e.g., crypts, caves, towers)
**Preview System:** No way to preview dungeon characteristics before entry
**Metadata System:** No dungeon naming, lore, or description system

## Recommended Architecture

### Phase 1: World Map Interface
Create `src/ui/WorldMapUI.js`:
- Grid-based overworld with discoverable locations
- Dungeon icons with difficulty indicators
- Regional unlocking based on progression
- Travel interface with resource costs

### Phase 2: Dungeon Selection System  
Create `src/dungeon/DungeonSelector.js`:
- Dungeon metadata registry (names, themes, requirements)
- Difficulty modifier system
- Entry cost calculation
- Preview generation for UI

### Phase 3: Enhanced Location Flow
Modify existing systems:
- GameState: Add world map location handling
- UI: Add location transition animations/feedback
- Event system: Location change events for proper UI updates

## Integration Points

### UI Integration (`single-player-ascii-game.html`)
**Current State:** 
- Guild interface: ✅ Complete modal system
- Map display: ⚠️ Shows position but no actual map rendering
- Controls: Missing world map button

**Required Changes:**
- Add "World Map" button to controls
- Implement map display rendering for different location types
- Add dungeon selection modal interface

### Event System Integration
**Missing Events:**
- `location:changed` - Location transitions
- `worldmap:opened` - World map interface
- `dungeon:selected` - Dungeon entry confirmation
- `dungeon:entered` - Actual dungeon entry

## Current Limitations

1. **Direct Run Transition:** `startNewRun()` bypasses world exploration entirely
2. **No Dungeon Choice:** Players cannot select specific dungeons or difficulty
3. **Missing World State:** No overworld exploration or regional progression
4. **Limited Preview:** No way to assess dungeon before entry

## Priority Implementation Order

1. **High Priority:** World map UI and dungeon selection system
2. **Medium Priority:** Dungeon themes and metadata system  
3. **Low Priority:** Regional progression and travel mechanics

The foundation is solid with excellent location state management in GameState.js and capable dungeon generation in DungeonGenerator.js. The missing piece is the middle layer - the world map and dungeon selection interfaces that connect character creation to dungeon exploration.

## Files Requiring Updates

**New Files Needed:**
- `src/ui/WorldMapUI.js` - World map interface component
- `src/dungeon/DungeonSelector.js` - Dungeon selection logic
- `src/ui/DungeonSelectionUI.js` - Dungeon selection interface

**Existing Files to Modify:**
- `single-player-ascii-game.html` - Add world map UI integration
- `src/core/GameState.js` - Add world map location handling (minor)
- `src/dungeon/DungeonGenerator.js` - Add dungeon metadata support