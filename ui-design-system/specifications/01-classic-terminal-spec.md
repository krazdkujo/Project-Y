# Theme 1: Classic Terminal Design Specification

## Overview
Pure ADOM/NetHack authenticity theme maintaining traditional roguelike aesthetics while supporting modern multiplayer features.

## Visual Identity

### Color Scheme
- **Primary Color**: `#00FF00` (Classic terminal green)
- **Background**: `#000000` (Pure black)
- **Secondary**: `#00FF41` (Slightly brighter green for highlights)
- **Accent**: `#FFFF00` (Yellow for current player)
- **Error/Damage**: `#FF0000` (Red)
- **Neutral**: `#808080` (Gray for walls)

### Typography
```css
font-family: 'Courier New', 'Monaco', 'Menlo', 'DejaVu Sans Mono', monospace;
font-size: 11px;
line-height: 1.1;
font-feature-settings: 'liga' off;
font-variant-ligatures: none;
```

### Box Drawing Characters
- **Standard Set**: `┌─┐│└┘├┤┬┴┼`
- **Double Line**: `╔═╗║╚╝╠╣╦╩╬`
- **Usage**: Single lines for game panels, double lines for important sections

### Progress Characters
- **Filled**: `█` (U+2588 Full Block)
- **Partial**: `▒` (U+2592 Medium Shade)
- **Empty**: `░` (U+2591 Light Shade)
- **Alternative**: `▓` (U+2593 Dark Shade)

## Layout Specifications

### Panel Structure
- **Right Panel Width**: Exactly 40 characters
- **Panel Border Width**: 23 characters (content area)
- **Panel Spacing**: 2-pixel gaps between panels
- **Border Padding**: 1 space between border and content

### Quick Skill Bar Format (Protected Core Feature)
```
╔═══════════════════════╗
║       ACTIONS         ║
╠═══════════════════════╣
║ [1] Move         (1AP)║
║ [2] Basic Attack (0AP)║
║ [3] Power Strike (2AP)║
║ [4] Fireball     (3AP)║
║ [5] Shield Bash  (1AP)║
║ [6] Quick Shot   (1AP)║
║ [7] ----------   ---- ║
║ [8] ----------   ---- ║
║ [9] ----------   ---- ║
╚═══════════════════════╝
```

## Screen-Specific Guidelines

### Main Menu
- ASCII art title using block characters
- Simple menu navigation [1-6]
- Welcome message with last session info
- Status panel showing online players

### Character Creation
- Skill allocation bars using `█▒░` progression
- 34 skills across 8 categories
- Point distribution with +/- controls
- Real-time build preview

### Game Lobby
- Player roster with ready status `▶` and `○`
- Chat window with message history
- Room settings display
- Host controls differentiation

### Main Gameplay (Core Screen)
- 60x20 character map area
- Standard terrain symbols: `@#.~+<>T*&`
- Initiative order with current player `▶` indicator
- Message log with recent actions

### Character Sheet
- Complete skill tree display
- Experience progression bars
- Stat blocks with resistances
- Equipment visualization

### Inventory Management
- Grid-based item display
- Weight/encumbrance tracking
- Equipment slots visualization
- Filter system by category

### Settings
- Tabbed navigation between categories
- Slider controls using character progression
- Preset configurations
- Real-time preview

### Guild/Social
- Member roster with online status
- Guild chat interface
- Event scheduling display
- Guild bank interface

## Interaction Patterns

### Navigation
- **Primary**: Number keys [1-9] for quick actions
- **Movement**: WASD for directional input
- **Confirmation**: ENTER for selections
- **Cancel**: ESC for menu/cancel operations

### Status Indicators
- **Current Player**: `▶` (Right triangle)
- **Ready Status**: `▶` Ready, `○` Not Ready
- **Health/Progress**: `█▒░▓` character progression
- **Stars (Skills)**: `★☆` filled/empty rating system

## Accessibility Considerations

### WCAG Compliance
- **Color Contrast**: 7:1 ratio (exceeds AAA requirements)
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Semantic structure with proper labels

### Visual Clarity
- High contrast text on pure black background
- Consistent character positioning
- Clear visual hierarchy through spacing

## Implementation Guidelines

### CSS Classes
```css
.classic-terminal {
  background-color: #000000;
  color: #00FF00;
  font-family: 'Courier New', monospace;
}

.classic-panel {
  border: 1px solid #00FF00;
  padding: 1ch;
  margin: 2px;
}

.classic-highlight {
  color: #FFFF00;
  font-weight: bold;
}

.classic-progress-bar {
  font-family: monospace;
  letter-spacing: 0;
}
```

### Performance Optimization
- Pre-render static ASCII elements
- Cache box-drawing character combinations
- Minimize DOM reflows with fixed positioning

## Visual Regression Testing

### Critical Checkpoints
1. Box-drawing character positions
2. Panel border alignment
3. Text spacing and alignment
4. Progress bar character composition
5. Color accuracy across elements

### Acceptable Variations
- Dynamic content (HP values, names, messages)
- Time-based elements (timers, cooldowns)
- User-specific data (skills, equipment)

### Fixed Elements
- All border characters and positions
- Label text and headers
- Hotkey number positions [1-9]
- Panel structure and spacing

This specification ensures the Classic Terminal theme maintains authentic roguelike aesthetics while supporting modern multiplayer functionality and accessibility requirements.