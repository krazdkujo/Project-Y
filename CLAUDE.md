# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Development Commands

### Development Server
```bash
npm run dev          # Start Vite development server (index.html)
npm run build        # Build for production using Vite
npm run preview      # Preview production build
npm run serve        # Build and preview production build
npm run build:analyze # Build with bundle analysis
```

### Testing Commands
```bash
npm test                      # Run functionality tests
npm run test:functionality    # Run dungeon functionality tests  
npm run test:visual           # Run all visual regression tests
npm run test:visual:critical  # Run critical quick skill bar tests (IMPORTANT)
npm run test:visual:all       # Full visual regression suite with HTML report
npm run test:visual:baseline  # Generate new baselines after UI changes
npm run test:visual:update    # Update existing visual snapshots
npm run test:visual:report    # Show Playwright test report
```

## Core Architecture

### Single-Player Party-Based ASCII Roguelike
This is a **single-player party-based ASCII roguelike** with **skill-based progression** supporting **up to 6 party members**. The architecture centers around:

**Client-Side Architecture (index.html with Vite)**
- Modern ES6+ JavaScript modules with Vite build system
- Hot module replacement for fast development
- Modular architecture with ES6 imports
- ASCII UI with terminal green color scheme (#00ff00 on #000000)
- Grid-based layout: left panel (party/abilities), center (map), right panel (log/info)

**Core Game Systems**
- `GameState` (src/core/GameState.js): Central state management for party, runs, combat
- `SkillSystem` (src/character/skills/SkillSystem.js): 34-skill progression system with mastery levels
- `AbilitySystem` (src/character/abilities/AbilitySystem.js): Dynamic ability generation from skills
- `TurnManager` (src/combat/TurnManager.js): Initiative-based combat with D20 rolls
- `CombatManager` (src/combat/CombatManager.js): Combat resolution and damage calculations
- `DungeonGenerator` (src/dungeon/DungeonGenerator.js): Procedural dungeon generation

**Character System**
- `CharacterGenerator` (src/character/generator/CharacterGenerator.js): Character creation interface
- `EnemySystem` (src/enemies/EnemySystem.js): Tiered enemy system with floor-based scaling
- `WeaponSystem` (src/equipment/Weapons.js): Weapon types and combat mechanics
- Up to 6 party members with individual skill progression and permadeath

## Critical UI System - ASCII Visual Standards

**IMPORTANT**: The ASCII UI uses a fixed green terminal color scheme (#00ff00 on #000000) and has visual regression testing to prevent layout breaks.

**UI Layout Standards:**
- Three-panel layout: left (300px), center (flexible), right (300px)
- Abilities grid with 9 slots (1-9 hotkeys) for skill usage
- Terminal green color scheme throughout
- Box-drawing characters for borders and sections
- Monospace font (Courier New) for consistent ASCII rendering

**Visual Testing Framework:**
- Run `npm run test:visual:critical` before UI changes
- Visual regression tests ensure consistent layout
- Use `npm run test:visual:baseline` after approved UI modifications

## Specialized Agent Usage

**ALWAYS use appropriate specialized agents for tasks:**
- `qa-testing-specialist`: For Playwright testing and visual regression
- `frontend-developer`: For client-side JavaScript and UI work  
- `story-writer-dm`: For game content, enemies, and balance
- `context-mapper`: For understanding codebase structure and relationships

## Build System & Development Tools

### Vite Configuration
- **Development**: Hot module replacement on port 3000 with auto-opening
- **Production**: Optimized builds with Terser minification and source maps
- **Manual Chunking**: Strategic code splitting for:
  - `game-core`: Core game state and event systems
  - `game-ui`: UI components and panels  
  - `game-systems`: Combat, movement, and encounter systems
- **Asset Handling**: Includes .md and .txt files for game content

## Development Workflow

### Project State
This is a **single-player party-based ASCII roguelike** with:
- Complete character creation and party management system
- 34-skill progression system with dynamic ability generation
- Procedural dungeon generation with tiered enemy scaling
- Visual regression testing for UI consistency
- Modular JavaScript architecture with event-driven design

### Code Standards
- Modern ES6+ JavaScript modules with Vite build system
- Modular architecture with clear separation of concerns  
- Event-driven design using EventSystem for loose coupling
- Comprehensive CONTEXT.md files in each major directory
- Visual regression testing required for any UI changes
- Manual chunking strategy for optimized game loading

### Testing Strategy
- Playwright tests for functionality and visual regression
- Critical visual tests for UI consistency (especially abilities grid)
- Manual testing through browser interface
- Comprehensive logging through adventure log system

## Game-Specific Context

### Skill System Mechanics
- 34 skills across weapon, armor, magic, combat, and utility categories
- Use-based skill advancement with mastery levels (Novice → Legendary)
- Dynamic ability generation based on skill levels
- Initiative based on D20 + skill modifiers for combat order

### Character System
- Party-based gameplay with up to 6 characters
- Permadeath system with guild-based character storage
- Character creation with skill point allocation (25 points)
- Starting weapon selection affects initial capabilities

### Combat System
- Turn-based combat with initiative order
- Tiered enemy system (T1-T6) scaling with dungeon floors
- Status effects and damage calculation
- Party wipe consequences with character loss

## Important Files & Directories

### Core Configuration
- `package.json`: npm scripts, Vite, and Playwright dependencies
- `vite.config.js`: Vite configuration with manual chunking for game optimization
- `index.html`: Main game entry point with module loading
- `src/main.js`: Application entry point with ES6 module system

### Game Systems Directory Structure
- `src/core/`: GameState, EventSystem - central game management
- `src/character/`: Character generation, skills, abilities
- `src/abilities/`: Comprehensive ability system (combat, magic, exploration, passive)
- `src/combat/`: CombatManager, TurnManager, StatusEffectRegistry - battle systems
- `src/enemies/`: EnemySystem with tiered scaling
- `src/equipment/`: Weapons and gear systems
- `src/dungeon/`: DungeonGenerator for procedural content
- `src/encounters/`: Encounter management and tactical combat systems
- `src/movement/`: MovementSystem, EnemyAI, and movement validation
- `src/input/`: InputManager and ability handlers
- `src/game/`: GameManager and high-level game coordination
- `src/systems/`: Specialized systems (lockpicking, etc.)
- `src/ui/`: UI components, panels, and interface management
- `src/styles/`: CSS styling for the ASCII interface

### Testing
- `tests/`: Playwright test suites for functionality and visual regression

This codebase represents a complete single-player roguelike with comprehensive party management, skill progression, and procedural content generation.
- when summarizing changes, always give me a list of what files were changed and their path.
- Never use emoji's
- always ask the context agent what directories you need to work in, and give him any updates you make to update the context docs.
- always check with the context agent, then refactor code when possible as opposed to writing new code. Clean, notated, condensed code is best.
- Any time work is completed, call the context agent to update the files that have been changed.