# Folder Context: ui/panels

## Purpose
Specialized UI panels providing focused interface sections for the ASCII roguelike. Contains the left panel component managing party status display, abilities grid, and character information in the three-panel layout.

## Key Files
- `LeftPanel.js` - Left panel component managing party status, abilities grid (9 hotkey slots), and character information display

## Dependencies
- Internal: `../../abilities/core/AbilitySlotManager.js`, `../../character/skills/SkillSystem.js`, `../../core/GameState.js`, `../core/UIManager.js`
- External: None - pure DOM manipulation and JavaScript

## Integration Points
**Party Management Display**:
- Active party member information and status
- Health, AP, and character statistics display
- Party composition and member switching interface
- Character status indicators and conditions

**Abilities Grid System**:
- 9-slot abilities grid with hotkey mapping (1-9 keys)
- Real-time ability slot display and management
- Ability cooldown and availability indicators
- Visual feedback for ability usage and restrictions

**Character Information**:
- Character name, level, and progression display
- Skill levels and advancement indicators
- Equipment status and weapon information
- Character statistics and derived attributes

**Game State Integration**:
- Real-time updates based on GameState changes
- Party member status synchronization
- Combat state awareness for ability restrictions
- Location and context-aware display updates

## Left Panel Architecture
**Panel Organization**:
- Party status section at top of panel
- Abilities grid in center with 3x3 hotkey layout
- Character details and information at bottom
- Scrollable sections for extended information

**Abilities Grid Features**:
- 9 ability slots mapped to number keys 1-9
- Visual ability icons and names
- AP cost display and availability indicators
- Cooldown timers and usage restrictions
- Empty slot indicators and management

**Status Display System**:
- Health bars with current/maximum values
- AP bars with current/maximum and regeneration
- Status effect indicators and timers
- Character condition and state indicators

## Visual Standards
**ASCII Consistency**:
- Box-drawing characters for panel borders
- Terminal green color scheme (#00ff00 on #000000)
- Monospace font for proper character alignment
- Consistent spacing and layout structure

**Grid Layout**:
- 3x3 abilities grid with proper spacing
- Number key indicators for each slot
- Visual separation between grid elements
- Clear slot boundaries and selection indicators

## Panel Update Management
**Real-Time Updates**:
- GameState change listeners for immediate updates
- Character switching and selection updates
- Combat state changes and ability restrictions
- Party member status and health updates

## Last Updated
2025-08-27: Created comprehensive left panel documentation covering party display, abilities grid, and character information management