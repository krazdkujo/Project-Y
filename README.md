# Real-Time Tactical ASCII Roguelike

A **real-time tactical ASCII roguelike** with **30+ skill system** and **8-player cooperative gameplay** using **2-second tick coordination**.

## Project Overview

This project features equipment-driven combat with no attributes, where all character effectiveness comes from skills and gear. Players coordinate in real-time using 2-second ticks, with group-only permadeath, dynamic classes, and guild-based resource sharing.

## Documentation Structure

### Core Design Documents (REDESIGNED)
- **[UPDATED-CORE-SPECIFICATION.md](docs/game-design/UPDATED-CORE-SPECIFICATION.md)** - Complete redesigned specification
- **[SKILL-SYSTEM-REDESIGN.md](docs/game-design/SKILL-SYSTEM-REDESIGN.md)** - 30+ skill system design
- **[ABILITIES-SYSTEM.md](docs/game-design/ABILITIES-SYSTEM.md)** - Skill-gated abilities and powers
- **[DYNAMIC-CLASS-SYSTEM.md](docs/game-design/DYNAMIC-CLASS-SYSTEM.md)** - Classes based on skill prerequisites
- **[COMBAT-SYSTEM-REDESIGN.md](docs/game-design/COMBAT-SYSTEM-REDESIGN.md)** - Skills + equipment combat
- **[GROUP-PERMADEATH-SYSTEM.md](docs/game-design/GROUP-PERMADEATH-SYSTEM.md)** - Group-only permadeath mechanics
- **[DUNGEON-PROGRESSION-SYSTEM.md](docs/game-design/DUNGEON-PROGRESSION-SYSTEM.md)** - Difficulty selection & group coordination
- **[AUCTION-HOUSE-ECONOMY.md](docs/game-design/AUCTION-HOUSE-ECONOMY.md)** - Guild base and direct trading systems

### Technical Documentation
- **[TICK-SYSTEM-ARCHITECTURE.md](docs/technical/TICK-SYSTEM-ARCHITECTURE.md)** - Real-time 2-second tick system
- **[INPUT-SYSTEM-REDESIGN.md](docs/technical/INPUT-SYSTEM-REDESIGN.md)** - Arrow keys + numpad controls

### Archived Documentation
- **[archive/](archive/)** - Previous design iterations and legacy documents

## Core Features (REDESIGNED)

### Character System
- **No Attributes**: All effectiveness from skills and equipment only
- **30+ Skill System**: Weapons, Armor, Magic, Combat, Crafting, Passive skills
- **Dynamic Classes**: Classes emerge from skill prerequisites (Paladin, Assassin, Elementalist, etc.)
- **Skill-Gated Abilities**: Abilities unlock when skill requirements are met

### Real-Time Combat System
- **2-Second Ticks**: All actions resolve every 2 seconds in real-time
- **Variable Action Costs**: Basic attacks (2 ticks), complex spells (25+ ticks)
- **Skills + Equipment**: hit_chance = 50 + weapon_accuracy + skill_bonus
- **Tactical Positioning**: Protect vulnerable casters during long spell casts

### Group-Only Permadeath
- **No Individual Death**: Only total party wipe causes true permadeath
- **Revival Mechanics**: Dead players revivable while party members alive
- **Group Coordination**: Must advance dungeon floors together or leave together

### Guild-Based Cooperation
- **Guild Base**: Shared storage and collaborative crafting facilities for 8-player groups
- **Direct Trading**: Simple player-to-player exchanges with single currency system
- **Resource Sharing**: Party vault and private chambers for equipment management

## Development Timeline (UPDATED)

### Phase 1: Core Systems (4-6 weeks)
- **Weeks 1-2**: Real-time tick system with 2-second intervals, 30+ skill system
- **Weeks 3-4**: Equipment-based combat (no attributes), abilities unlocking system
- **Weeks 5-6**: Dynamic class emergence, group-only permadeath mechanics

### Phase 2: Advanced Features (4-6 weeks)
- **Weeks 7-8**: Dungeon progression with difficulty selection and group coordination
- **Weeks 9-10**: Guild base system and direct trading mechanics
- **Weeks 11-12**: Crafting integration and economic balance

### Phase 3: Polish & Full Features (4-6 weeks)
- **Weeks 13-14**: Complete guild coordination with all facilities
- **Weeks 15-16**: Advanced ability combinations and class synergies
- **Weeks 17-18**: Full UI polish, optimization, and testing

## Technology Stack

### MVP Tech Stack
```yaml
Backend:
  - Node.js 18+ with TypeScript
  - Express (HTTP server)
  - ws (WebSocket library)
  - No database (in-memory state)

Frontend:
  - Vanilla TypeScript (no framework overhead)
  - Canvas for ASCII rendering
  - CSS for layout

Build Tools:
  - Vite (fast development server)
  - TypeScript compiler
  - ESLint for code quality
```

### File Structure
```
/src
  /server          # Node.js + TypeScript backend
    server.ts      # Express + WebSocket setup
    TickSystem.ts  # MUD tick coordinator
    GameEngine.ts  # Core game logic
  /client          # Browser-based frontend
    main.ts        # Entry point
    Renderer.ts    # ASCII terminal display
    InputHandler.ts # ADOM-style keyboard commands
  /shared          # Common types and constants
    types.ts       # Game state interfaces
    constants.ts   # Game balance values
```

## ASCII Interface

### Screen Layout (UPDATED)
```
┌─── DUNGEON MAP (60x20) ────┬─── STATUS (20x20) ───┐
│ ##################         │ HP: 45/50            │
│ #................#         │ Skills:              │
│ #....@...........#         │ Swords: 45           │
│ #........g.......#         │ Heavy_Armor: 32      │
│ #................#         │ Healing_Magic: 28    │
│ ##################         │ Active Class:        │
│                            │ Paladin              │
│                            │ Abilities: F1-F12    │
├────────────────────────────┴──────────────────────┤
│ > Barbarian attacks orc for 8 damage!             │
│ > Mage begins fireball (15 ticks remaining)       │
│ > Ranger shoots arrow at goblin                   │
└────────────────────────────────────────────────────┘
```

### Input Controls
```yaml
Movement: Arrow Keys or Numpad (8-directional with diagonals)
Combat: Spacebar (attack), Enter (block), Tab (target)
Abilities: F1-F12 (customizable quick-cast abilities)
Actions: E (use), I (inventory), C (character), M (map), T (chat)
```

### Color Coding
```yaml
Player:     '@' bright white (customizable)
Enemies:    
  - Weak: red lowercase (g, o)
  - Strong: bright red uppercase (G, O, T)
  - Boss: yellow uppercase (unique symbols)
Items:      ')' weapons, '[' armor, '!' potions
World:      '#' walls, '.' floor, '+' doors
```

## Success Criteria (UPDATED)

### Core System Completion
- [ ] **30+ Skill System**: All skill categories working with use-based training
- [ ] **Real-Time Combat**: 2-second tick system with variable action costs
- [ ] **Equipment-Driven Combat**: No attributes, skills + equipment determine effectiveness
- [ ] **Abilities System**: Skill-gated abilities unlocking dynamically
- [ ] **Dynamic Classes**: Classes emerging from skill prerequisites
- [ ] **Group Permadeath**: Only party wipe causes true death, revival mechanics working
- [ ] **Dungeon Progression**: Group coordination with difficulty selection
- [ ] **Guild Base**: Shared storage and collaborative facilities

### Gameplay Experience Goals
- [ ] 8 players can coordinate complex real-time tactics effectively
- [ ] Individual character builds feel unique through skill/ability combinations
- [ ] Group coordination is essential and rewarding for survival
- [ ] Guild systems support collaborative play styles and group progression
- [ ] Real-time combat feels tactical rather than chaotic

### Quality Gates
- **Phase 1 Gate**: Core tick system, skills, and combat functional
- **Phase 2 Gate**: Group mechanics, classes, and basic economy working
- **Phase 3 Gate**: Full feature set polished and balanced for release

## Getting Started

### Prerequisites
- Node.js 18+
- TypeScript
- Modern web browser

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## 📈 Post-MVP Expansion

### Planned Features
- **Skill Expansion**: 30+ specialized skills with progression trees
- **World Map**: Multiple themed dungeons with unique mechanics
- **8-Player Multiplayer**: Tactical coordination and group dynamics
- **Advanced Systems**: Crafting, magic schools, social mechanics

### Long-Term Vision
A fully-featured multiplayer ASCII roguelike that captures ADOM's tactical depth while enabling unprecedented 8-player cooperative gameplay through MUD-inspired real-time coordination.

---

**For complete updated specifications, see [UPDATED-CORE-SPECIFICATION.md](docs/game-design/UPDATED-CORE-SPECIFICATION.md)**  
**For detailed system designs, see the individual system documentation in [docs/game-design/](docs/game-design/)**  
**For technical implementation guidance, see [docs/technical/](docs/technical/)**