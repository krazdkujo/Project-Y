# Folder Context: src

## Purpose
Root source directory for the single-player party-based ASCII roguelike game. Contains the modular JavaScript architecture that replaced the monolithic HTML structure, with Vite build system integration and comprehensive game systems.

## Key Files
- `main.js` - Application entry point orchestrating module loading and game initialization with dependency resolution for character generation
- `styles/main.css` - Core CSS styling for ASCII terminal interface

## Dependencies
- Internal: All subdirectories are organized as self-contained modules
- External: Vite (build system), UUID (character generation), WS (legacy multiplayer support)

## Integration Points
The src/ directory serves as the foundation for:
- **Vite Build System**: Module bundling and development server through main.js
- **Game Architecture**: Modular system initialization in dependency order
- **UI Generation**: Dynamic HTML creation through GameUI components
- **Event System**: Cross-module communication via EventSystem
- **State Management**: Centralized GameState accessible across all modules

## Directory Structure
- `abilities/` - 385+ ability system with 9+5 slotting model
- `character/` - Character generation, skills (34 skills), and abilities integration
- `combat/` - Turn-based combat with AP system and status effects
- `core/` - GameState and EventSystem foundational modules
- `dungeon/` - Procedural dungeon generation
- `encounters/` - Combat encounters with scaling and tactical systems
- `enemies/` - Enemy system with tiered scaling
- `equipment/` - Weapon systems and combat integration
- `game/` - Game management and coordination
- `input/` - Input handling with UI state management
- `movement/` - Movement validation, AI, and systems
- `systems/` - Specialized systems (lockpicking, etc.)
- `ui/` - UI components, panels, and interface management

## Architecture Overview
**Modular Vite Architecture** (post-refactoring):
- Replaced single 3000+ line HTML file with organized module system
- Dynamic UI generation via GameUI components
- Dependency-ordered system initialization
- Hot module replacement for development efficiency
- Optimized chunk splitting for better caching

**Game Systems Integration**:
- Event-driven design with loose coupling between modules
- Centralized state management through GameState
- Real-time multiplayer support (legacy) with WebSocket integration
- ASCII UI consistency with visual regression testing

## Build System Integration
- **Vite Configuration**: Manual chunk splitting for game-core, game-ui, and game-systems
- **Development Server**: Port 3000 with hot reload and host access
- **Build Optimization**: Terser minification with source maps
- **Asset Handling**: Markdown and text file inclusion support

## Last Updated
2025-08-27: Created comprehensive root context documentation covering modular architecture transition and Vite build system integration