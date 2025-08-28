# Folder Context: encounters/core

## Purpose
Core encounter management system orchestrating combat encounters, enemy spawning, and encounter flow for the single-player ASCII roguelike. Manages encounter initiation, resolution, and integration with combat systems.

## Key Files
- `EncounterManager.js` - Primary encounter orchestrator managing encounter generation, enemy spawning, combat initiation, and encounter resolution

## Dependencies
- Internal: `../../enemies/EnemySystem.js`, `../../combat/CombatManager.js`, `../../core/GameState.js`, `../scaling/EncounterScaling.js`, `../combat/TacticalCombat.js`
- External: None - pure JavaScript encounter logic

## Integration Points
**Enemy System Integration**:
- Dynamic enemy spawning based on dungeon level and party strength
- Enemy tier selection and scaling for appropriate challenge
- Enemy role distribution for balanced encounters
- Enemy ability assignment and tactical setup

**Combat System Integration**:
- Combat initiation and setup for encounter battles
- Turn order establishment and initiative management
- Combat state coordination and flow control
- Combat resolution and outcome processing

**Dungeon System Integration**:
- Location-based encounter generation
- Floor-appropriate encounter scaling
- Room-specific encounter types and configurations
- Environmental considerations for encounter setup

**Scaling System Integration**:
- Dynamic difficulty adjustment based on party performance
- Encounter complexity scaling with progression
- Reward scaling based on encounter difficulty
- Challenge rating calculation and application

## Encounter Management Features
**Encounter Generation**:
- Procedural encounter creation based on context
- Enemy composition algorithms for balanced fights
- Environmental encounter setup and positioning
- Special encounter type handling (boss, elite, minion groups)

**Combat Flow Coordination**:
- Seamless transition from exploration to combat
- Combat state initialization and management
- Turn-based combat coordination
- Post-combat cleanup and state restoration

**Encounter Resolution**:
- Victory condition checking and processing
- Defeat handling and consequences
- Experience and reward distribution
- Party status updates and state changes

## Encounter Types
**Standard Encounters**:
- Balanced enemy groups appropriate for current level
- Mixed enemy roles for tactical variety
- Moderate challenge with fair resource costs
- Standard rewards and experience gains

**Elite Encounters**:
- Higher-tier enemies with enhanced capabilities
- Increased challenge and resource requirements
- Superior rewards and rare item chances
- Strategic positioning and tactical complexity

**Boss Encounters**:
- Unique high-tier enemies with special abilities
- Multi-phase encounter mechanics
- Significant challenge requiring tactical mastery
- Major rewards and progression milestones

## Encounter State Management
- Pre-encounter setup and validation
- Active encounter state tracking
- Combat phase coordination
- Post-encounter cleanup and rewards

## Last Updated
2025-08-27: Created core encounter management documentation covering encounter generation, combat integration, and encounter flow coordination