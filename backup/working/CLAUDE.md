# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Development Commands

### Server Management
```bash
npm run dev          # Development server with hot reload
npm start            # Production server (requires build)
npm run build        # TypeScript compilation to dist/
```

### Testing Commands
```bash
npm test             # Run all Jest tests
npm run test:unit    # Individual system tests (APSystem, TurnManager, FreeActions)
npm run test:integration  # WebSocket and game session tests
npm run test:performance  # Load testing and metrics validation
npm run test:visual:critical  # Quick skill bar UI regression tests (CRITICAL)
npm run test:visual:all      # Full visual regression suite
npm run test:visual:baseline # Generate new UI baselines after approved changes

# Single test runs (useful for debugging)
npm run test:ap-system    # APSystem tests only
npm run test:turn-manager # TurnManager tests only  
npm run test:free-actions # FreeActions tests only
npm run test:coverage     # Generate coverage report
```

### Database Migration Commands
```bash
npm run migrate:status    # Check migration status
npm run migrate          # Run pending migrations
npm run migrate:dry-run  # Preview migration changes
npm run migrate:rollback # Rollback last migration
npm run migrate:create   # Create new migration file
npm run migrate:validate # Validate migration integrity
```

## Core Architecture

### Real-Time Multiplayer Game Engine
This is a **tactical ASCII roguelike** with **Action Point (AP) based combat** supporting **8-player real-time multiplayer**. The architecture centers around:

**Game Server (src/server/server.ts)**
- `HathoraAPServer`: Main WebSocket server managing multiplayer sessions on port 3001
- `APGameSession`: Individual game instance with turn management
- Handles room creation, player connections, and message routing
- Integrates with Supabase for persistence and real-time sync
- WebSocket heartbeat system for connection health monitoring

**Core Game Systems**
- `APManager` (APSystem.ts): Action Point allocation and validation (2-3 AP/turn, 8 max)
- `TurnManager` (TurnManager.ts): Initiative-based turn order using D20 + skill modifiers
- `FreeActionProcessor` (FreeActions.ts): Instant actions (0 AP cost) like movement
- `DungeonGenerator` (game/dungeons/): Procedural room and corridor generation

**Client Architecture**
- Pure JavaScript client in `public/js/main.js` (no build process)
- WebSocket communication for real-time game state synchronization  
- ASCII UI rendering with dynamic grid calculation based on viewport size
- Quick skill bar system (1-9 hotkeys) with visual AP cost indicators

### Database Architecture
**Supabase Integration (src/lib/supabase.ts)**
- PostgreSQL with Row Level Security for multiplayer data protection
- Real-time subscriptions for game state synchronization
- Migration system in `src/lib/database/migrations/` with CLI tools
- Connection pooling and transaction management

### Key Type System (src/shared/types.ts)
- `FreeAction`: 0 AP cost actions (MOVE, BASIC_ATTACK, BASIC_DEFENSE)
- `APAction`: 1-8 AP cost abilities with targeting and effects
- `Player`: Complete player state including position, health, AP, skills, equipment
- `GameSession`: Room state with players, turn order, and game configuration

## Critical UI System - ASCII Visual Standards

**IMPORTANT**: The ASCII UI has locked visual standards enforced by automated testing. The **quick skill bar (1-9 hotkeys) is the core gameplay feature** and its layout cannot be changed without breaking visual regression tests.

**UI Layout Standards:**
- Right panel exactly 40 characters wide using box-drawing characters (┌─┐│└┘├┤┬┴┼)
- Quick skill bar shows 1-9 hotkeys with AP cost format: `[1] Move (1AP)`
- Terminal green color scheme (#00ff00 on #000000) throughout
- Progress bars use ASCII characters: █▒░▓

**Visual Testing Framework:**
- Run `npm run test:visual:critical` before any UI changes
- The quick skill bar tests will fail if layout positioning changes
- Use `npm run test:visual:baseline` only after approved UI modifications
- All UI panels have precise character positioning documented in ASCII_UI_STANDARDS.md

## Specialized Agent Usage

**ALWAYS use appropriate specialized agents for tasks:**
- `qa-testing-specialist`: For testing, especially visual regression
- `frontend-developer`: For client-side JavaScript and UI work  
- `backend-developer`: For server-side TypeScript and game logic
- `ui-ux-designer`: For ASCII UI design and layout planning
- `story-writer-dm`: For game content creation and balance
- `database-specialist`: For Supabase queries and schema work
- `security-specialist`: For multiplayer security and data protection

## Development Workflow

### Project State
This is a **production-ready tactical ASCII roguelike** with:
- Complete multiplayer infrastructure (WebSocket + Supabase)
- 34-skill progression system with 175+ abilities
- Procedural dungeon generation with enemies and items
- Comprehensive test suite (85%+ coverage)
- Visual regression testing for UI consistency
- Deployment-ready with Hathora Cloud and Supabase integration

### Code Standards
- TypeScript strict mode enabled with path aliases (`@server/*`, `@shared/*`, `@client/*`)
- All server code in TypeScript, client in vanilla JavaScript
- Test coverage requirement: 85%+ for new features
- Performance requirement: <100ms response time for game actions
- Visual regression testing required for any UI changes

### Database Development
- Use `npm run migrate:status` to check current schema state
- Create new migrations with `npm run migrate:create [name]`
- Always run dry-run before applying migrations
- Supabase admin credentials required for schema changes

### Testing Strategy
- Unit tests for individual systems (APSystem, TurnManager, FreeActions)
- Integration tests for WebSocket communication and game sessions
- Performance tests validate 8-player concurrent gameplay
- Visual regression tests protect ASCII UI layout (especially quick skill bar)

## Game-Specific Context

### AP System Mechanics
- Players get 2-3 AP per turn (configurable), maximum 8 AP storage
- Free actions (movement, basic attack) cost 0 AP and execute immediately
- AP abilities cost 1-8 AP with scaling power and effects
- Turn order determined by D20 + floor(skill_level / 4) initiative rolls

### Multiplayer Architecture  
- Up to 8 players per game session with real-time coordination
- Room-based matchmaking with automatic cleanup
- Player state persisted in Supabase with real-time sync
- WebSocket heartbeat system prevents connection drops

### Content System
- 34 skills across weapon, armor, magic, combat, crafting categories
- Use-based skill advancement (no character levels)
- 50+ weapons, 30+ armor pieces, 100+ consumables
- Abilities unlock at specific skill thresholds with combo mechanics

## Important Files & Directories

### Core Configuration
- `package.json`: All npm scripts and dependencies
- `tsconfig.json`: TypeScript configuration with strict mode and path aliases
- `jest.config.js`: Jest testing configuration
- `playwright.config.ts`: Visual regression testing setup
- `.env`: Environment variables (Supabase credentials, ports, etc.)

### Database & Content
- `supabase/migrations/`: Schema deployment scripts
- `supabase/seed-data/`: 300+ game items and abilities
- `supabase/policies/`: Row Level Security rules

### Client Entry Points
- `public/index.html`: Main HTML with CSS Grid layout
- `public/js/main.js`: JavaScript client entry point

This codebase represents a complete multiplayer game engine ready for production deployment with Hathora Cloud hosting and Supabase backend services.