# ASCII Roguelike UI Reference Layout

This document provides a reference for the expected ASCII UI layout for visual comparison during testing.

## Overall Layout Structure

```
┌─────────────────────────────────────────┬───────────────────────────────────────┐
│                                         │                                       │
│              GAME MAP AREA              │            RIGHT PANEL               │
│                                         │                                       │
│  ################################################                               │
│  #.............@........................#      CONNECTION STATUS: Disconnected │
│  #...........................................                                   │
│  #...........................................   ┌─ TURN INDICATOR ─────────────┐│
│  #...........................................   │ Current Turn: player_abc123  ││
│  #...........................................   │ Status: Your Turn           ││
│  #...........................................   └─────────────────────────────┘│
│  #...........................................                                   │
│  #...........................................   ┌─ ACTION POINTS ─────────────┐│
│  #...........................................   │ AP: 8 / 8                   ││
│  #...........................................   │ ████████████████████████████ ││
│  #...........................................   │ +2-3 AP per turn            ││
│  #...........................................   └─────────────────────────────┘│
│  #...........................................                                   │
│  #...........................................   ┌─ TURN TIMER ────────────────┐│
│  #...........................................   │ Time: 10s                   ││
│  ################################################   │ ████████████████████████████ ││
│                                         │ └─────────────────────────────┘│
│            [MINIMAP]                    │                                       │
│            ┌─────────┐                 │ ┌─ INITIATIVE ORDER ───────────┐│
│            │###...###│                 │ │ player_abc123 (You)    15  ◄ ││
│            │#..@..#  │                 │ │                               ││
│            │###...###│                 │ └─────────────────────────────┘│
│            └─────────┘                 │                                       │
│                                         │ ┌─ ACTIONS ────────────────────┐│
│                                         │ │ [Free] [Basic] [Advanced]    ││
│                                         │ │                               ││
│                                         │ │ ┌─ MOVE ──┐ ┌─ ATTACK ─┐    ││
│                                         │ │ │   🚶    │ │    ⚔️    │    ││
│                                         │ │ │ 0 AP    │ │   0 AP   │    ││
│                                         │ │ └─────────┘ └──────────┘    ││
│                                         │ │                               ││
│                                         │ │ [Execute Action] [End Turn]  ││
│                                         │ └─────────────────────────────┘│
│                                         │                                       │
│                                         │ ┌─ MESSAGES ───────────────────┐│
│                                         │ │ Welcome to the AP System!    ││
│                                         │ │ Use arrow keys to move       ││
│                                         │ │ Current AP: 8 / 8            ││
│                                         │ └─────────────────────────────┘│
└─────────────────────────────────────────┴───────────────────────────────────────┘
```

## Game Map Legend

| Character | Meaning | Color |
|-----------|---------|-------|
| `@` | Player character | Green (`#00ff00`) |
| `#` | Wall | Gray (`#666666`) |
| `.` | Floor | Dark gray (`#404040`) |
| `+` | Door | Brown (`#8B4513`) |
| `<` | Stairs up | Gold (`#FFD700`) |
| `>` | Stairs down | Gold (`#FFD700`) |
| `o` | Enemy | Red (`#ff0000`) |
| `!` | Item | Yellow (`#ffff00`) |

## Right Panel Components

### 1. Connection Status
- Position: Top-left corner of game area
- States:
  - `Connected` (green background)
  - `Disconnected` (red background)
  - `Connecting` (yellow background)

### 2. Turn Indicator
- Shows current player's turn
- Highlights "Your Turn" with animation
- Player name display

### 3. Action Points (AP) Display
- Current AP / Maximum AP
- Visual bar representation
- AP regeneration info

### 4. Turn Timer
- Countdown display
- Visual progress bar
- Color changes: Green → Yellow → Red

### 5. Initiative Order
- List of players in turn order
- Current player highlighted
- Shows initiative values

### 6. Action Selector
- Three tabs: Free, Basic, Advanced
- Action buttons with icons and AP costs
- Action preview panel
- Execute/End Turn buttons

### 7. Message Log
- Scrollable message history
- Game events and feedback
- Limited to 10 visible messages

## Expected Color Scheme

- **Background**: Black (`#000000`)
- **Text**: Green terminal (`#00ff41`)
- **Player**: Bright green (`#00ff00`)
- **Walls**: Gray (`#666666`)
- **Floor**: Dark gray (`#404040`)
- **UI Elements**: Various grays and accents

## Font Requirements

- **Primary**: `Courier New`, `Monaco`, `Menlo`, monospace
- **Size**: Dynamic based on viewport (8px - 16px)
- **Line Height**: 1.0 for map, 1.1 for UI
- **Character Width**: ~0.6 of font size

## Responsive Behavior

### Desktop (>900px)
- Side-by-side layout
- Right panel: 35-40% width
- Full feature set visible

### Mobile (<900px)
- Stacked layout
- Game map on top
- UI panel below (40% height)
- Horizontal scrolling for actions

## Key Interactions

1. **Map Clicks**: Move player or select targets
2. **Keyboard**: Arrow keys, WASD, diagonals (QEZX)
3. **Action Selection**: Click buttons, Tab to switch panels
4. **Help**: F1 key opens help overlay

## Loading States

### Initial Load
```
       Loading AP System...
            ⊙ (spinning)
    Connecting to server...
```

### Error State
```
      Error Loading Game
  Failed to initialize the game client
      [Retry Button]
```

This reference layout should be used to validate that the UI renders correctly and all components are positioned and styled as expected.