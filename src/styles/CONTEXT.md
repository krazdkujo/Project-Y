# Folder Context: styles

## Purpose
Core CSS styling for the single-player ASCII roguelike providing the terminal green aesthetic, three-panel layout, and visual consistency for the modular Vite-based architecture.

## Key Files
- `main.css` - Complete CSS styling for ASCII terminal interface, three-panel layout, abilities grid, status displays, and visual regression testing compliance

## Dependencies
- Internal: Imported by main.js and applied to GameUI components
- External: None - pure CSS implementation with system fonts

## Integration Points
**Vite Build System Integration**:
- CSS module imported through main.js entry point
- Vite CSS processing and optimization
- Development hot reload for style changes
- Production CSS minification and optimization

**Visual Regression Testing Integration**:
- Strict ASCII terminal color scheme (#00ff00 on #000000)
- Consistent layout dimensions for automated testing
- Fixed panel dimensions (300px left/right panels)
- Monospace font requirements (Courier New)

**Three-Panel Layout System**:
- CSS Grid layout for responsive three-panel design
- Left panel: Party status and abilities grid (300px fixed)
- Center panel: Map container and UI states (flexible width)
- Right panel: Adventure log and information (300px fixed)

**Component Styling Integration**:
- GameUI component styling and structure
- Panel-specific styling for different UI sections
- Dynamic UI state management with CSS classes
- Event-driven style updates and transitions

## ASCII Visual Standards
**Terminal Color Scheme**:
- Background: #000000 (pure black)
- Text: #00ff00 (terminal green)
- Borders: #0f0 (bright terminal green)
- Accents: #333 (dark gray for subtle elements)

**Typography Standards**:
- Font Family: 'Courier New', monospace (required for ASCII consistency)
- Font sizes optimized for readability and information density
- Consistent spacing and character alignment
- ASCII art compatibility and character rendering

**Layout Requirements**:
- Grid-based layout with precise panel dimensions
- Overflow handling for scrollable content
- Visual hierarchy through border styles and spacing
- Responsive design within ASCII constraints

## Key Style Components
**Status Display System**:
- Health and AP status bars with gradient fills
- Character information displays with consistent formatting
- Status effect indicators and visual feedback
- Party member status visualization

**Abilities Grid Styling**:
- 3x3 grid layout for 9 ability slots
- Hotkey number indicators and visual feedback
- Ability slot borders and selection states
- AP cost and cooldown visual indicators

**Adventure Log Styling**:
- Message type styling (system, combat, exploration)
- Scrollable log with timestamp formatting
- Message priority and importance visualization
- Color coding for different log message types

## Visual Regression Testing Compliance
- Fixed dimensions and layout structure for automated screenshot comparison
- Consistent ASCII character rendering across different environments
- Color scheme stability for visual regression detection
- Layout element positioning consistency for test reliability

## Development Integration
- CSS hot reload during development
- Style debugging and inspection support
- Performance optimization through CSS bundling
- Build-time CSS processing and minification

## Last Updated
2025-08-27: Created comprehensive styles documentation covering ASCII terminal aesthetic, three-panel layout, and visual regression testing compliance