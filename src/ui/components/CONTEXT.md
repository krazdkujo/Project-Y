# Folder Context: ui/components

## Purpose
Core UI components providing the main game interface structure and event handling for the ASCII roguelike. Contains the primary GameUI component that creates the three-panel layout and manages interface initialization.

## Key Files
- `GameUI.js` - Main game interface component creating the complete three-panel layout structure
- `EventHandlers.js` - UI event handling and interaction management for game interface elements

## Dependencies
- Internal: `../core/UIManager.js`, `../panels/LeftPanel.js`, various game systems for interface updates
- External: None - pure DOM manipulation and JavaScript

## Integration Points
**Game Interface Structure**:
- Creates main three-panel layout (left, center, right panels)
- Initializes game container with proper ASCII styling
- Sets up interface sections and panel organization
- Manages overall interface responsiveness

**Panel System Integration**:
- Left panel creation and management for party/abilities display
- Center panel (map container) for dungeon visualization
- Right panel creation for adventure log and information display
- Panel coordination and state management

**Event System Integration**:
- UI event handling for user interactions
- Interface element event delegation
- Component interaction management
- State change event handling and updates

**CSS and Styling Integration**:
- Terminal green color scheme application (#00ff00 on #000000)
- ASCII character consistency and monospace font usage
- Visual regression testing compliance
- Layout structure maintenance

## GameUI Architecture
**Interface Creation**:
- Dynamic HTML generation for complete game interface
- Three-panel layout structure with proper CSS classes
- Component initialization in dependency order
- Event listener setup and management

**Panel Content Generation**:
- Left panel content creation with party status and abilities grid
- Center panel content for map display and navigation
- Right panel content for adventure log and game information
- Dynamic content updates based on game state

**Initialization Flow**:
1. Validate game root element existence
2. Create complete game interface structure
3. Set up event listeners for UI interactions
4. Initialize interface state and displays
5. Coordinate with other UI systems

## Event Handling System
**UI Interaction Management**:
- Click event handling for interface elements
- Input field management and validation
- Button interaction and state management
- Interface navigation and state transitions

## Visual Standards Compliance
- Adherence to ASCII terminal aesthetic
- Consistent box-drawing character usage
- Terminal green color scheme maintenance
- Monospace font consistency for proper ASCII rendering

## Last Updated
2025-08-27: Created comprehensive UI components documentation covering main interface structure and event handling