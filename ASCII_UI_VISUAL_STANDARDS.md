# ASCII UI VISUAL STANDARDS DOCUMENT
## Real-Time Tactical ASCII Roguelike
### Version 1.0 - Visual Regression Testing Standards

---

## OVERVIEW

This document defines the exact visual standards for the ASCII UI system to ensure consistent appearance and enable visual regression testing. The current implementation features a working quick skill bar system (1-9 hotkeys) with AP cost indicators that supports dozens or hundreds of skills.

**Key Features Preserved:**
- Quick skill bar (1-9 hotkeys) with visual AP cost indicators
- Terminal green color scheme (#00ff00 on #000000)
- Box-drawing character borders using ┌─┐│└┘├┤┬┴┼
- Character-precise positioning for all panels
- ASCII progress bars using █▒░ characters

---

## LAYOUT SPECIFICATIONS

### Grid Structure
```
┌─────────────────────────────────────────────────────────┬──────────────────────────┐
│                                                         │                          │
│                    GAME MAP AREA                        │       RIGHT PANEL        │
│                   (60x20 cells)                         │      (40 chars wide)     │
│                                                         │                          │
│                    Dynamic dungeon or                   │   ╔═══════════════════╗  │
│                    static ASCII map                     │   ║   PLAYER STATS    ║  │
│                    with fog of war                      │   ╠═══════════════════╣  │
│                                                         │   ║ HP/AP progress    ║  │
│                    Player position: @                   │   ║ bars with █▒░     ║  │
│                    Other entities                       │   ╚═══════════════════╝  │
│                    Terrain: .#~^T*&                     │                          │
│                                                         │   ╔═══════════════════╗  │
│     ┌─────────┐                                        │   ║   TURN ORDER      ║  │
│     │MINIMAP  │  Color: #00ff00                        │   ║   Initiative      ║  │
│     │120x80px │  Background: #000000                   │   ║   tracking        ║  │
│     └─────────┘                                        │   ╚═══════════════════╝  │
│                                                         │                          │
│                                                         │   ╔═══════════════════╗  │
│                                                         │   ║   QUICK SKILLS    ║  │
│                                                         │   ║   [1-9] Hotkeys   ║  │
│                                                         │   ║   with AP costs   ║  │
│                                                         │   ╚═══════════════════╝  │
│                                                         │                          │
│                                                         │   ╔═══════════════════╗  │
│                                                         │   ║   MESSAGE LOG     ║  │
│                                                         │   ╚═══════════════════╝  │
└─────────────────────────────────────────────────────────┴──────────────────────────┘
```

---

## EXACT ASCII PANEL TEMPLATES

### 1. PLAYER STATS PANEL
**Fixed Position:** Right panel, top section  
**Width:** Exactly 23 characters (including borders)  
**Variable Content:** HP/AP numbers and bars  
**Fixed Elements:** Borders, labels, structure

```
╔═══════════════════════╗
║      PLAYER STATS     ║
╠═══════════════════════╣
║ Name: PlayerName123   ║
║ HP: 100/100 ████████████ ║
║ AP:   8/8   ████████████ ║
║ Move: 3/3   ▶▶▶▶▶▶▶▶▶▶▶▶ ║
║ Pos: (30,10)          ║
╠═══════════════════════╣
║       SKILLS          ║
╠═══════════════════════╣
║ Combat:     50 ★★★☆☆ ║
║ Swords:     75 ★★★★☆ ║
║ Fire Magic: 25 ★★☆☆☆ ║
║ Healing:    60 ★★★☆☆ ║
╚═══════════════════════╝
```

### 2. TURN ORDER PANEL
**Fixed Position:** Right panel, middle section  
**Dynamic Height:** Based on player count  
**Current Player Indicator:** ▶ symbol  

```
╔═══════════════════════╗
║   INITIATIVE ORDER    ║
╠═══════════════════════╣
║*▶ PlayerA   18 *║
║  PlayerB   15  ║
║* PlayerC   12 *║
║  PlayerD    9  ║
║  PlayerE    7  ║
╚═══════════════════════╝
```

### 3. QUICK SKILL BAR (SIGNATURE FEATURE)
**Fixed Position:** Right panel, middle-lower section  
**Hotkeys:** 1-9 for quick access  
**AP Cost Display:** Shows cost for each skill  
**Availability:** Grayed out if insufficient AP  

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
╠═══════════════════════╣
║ [M] Move              ║
║ [A] Attack            ║
║ [D] Defend            ║
║ [R] Rest/End Turn     ║
║ [H] Help              ║
╚═══════════════════════╝
```

### 4. TURN STATUS PANEL
**Shows current turn information and timing**

```
╔═══════════════════════╗
║     TURN STATUS       ║
╠═══════════════════════╣
║ Player: YourName      ║
║ Status: YOUR TURN     ║
║ ▶ TAKE ACTION!        ║
╚═══════════════════════╝
```

### 5. AP DISPLAY PANEL
**Shows current Action Points with visual bar**

```
╔═══════════════════════╗
║    ACTION POINTS      ║
╠═══════════════════════╣
║ Current: 8/8          ║
║ ███████████████ ║
║ +2 per turn           ║
╚═══════════════════════╝
```

### 6. TURN TIMER PANEL
**Visual countdown with color-coded urgency**

```
╔═══════════════════════╗
║     TURN TIMER        ║
╠═══════════════════════╣
║ 🟢 Time: 8s           ║
║ ████████▓▓▓▓▓▓▓ ║
║ Take your time        ║
╚═══════════════════════╝
```

### 7. MESSAGE LOG PANEL
**Fixed Position:** Bottom of right panel  
**Height:** 5 lines plus borders  
**Scrolling:** Shows last 3 messages  

```
╔═══════════════════════╗
║     MESSAGE LOG       ║
╠═══════════════════════╣
║ > PlayerA moved       ║
║ > You dealt 15 damage ║
║ > Enemy defeated!     ║
║                       ║
║                       ║
╚═══════════════════════╝
```

---

## CHARACTER SPECIFICATIONS

### Box-Drawing Characters
**Standard Set:** `┌─┐│└┘├┤┬┴┼`
- **Corners:** ┌ ┐ └ ┘  
- **Horizontal:** ─  
- **Vertical:** │  
- **T-junctions:** ├ ┤ ┬ ┴  
- **Cross:** ┼  

### Progress Bar Characters
- **Filled:** █ (U+2588 Full Block)
- **Partial:** ▒ (U+2592 Medium Shade)  
- **Empty:** ░ (U+2591 Light Shade)
- **Alternative:** ▓ (U+2593 Dark Shade)

### Special Symbols
- **Current Player:** ▶ (U+25B6 Right Triangle)
- **Highlight:** * (asterisk for "me" indicator)
- **Stars (Skills):** ★ ☆ (filled/empty stars)
- **Status Icons:** 🟢 🟡 🔴 (green, yellow, red circles)

---

## COLOR SPECIFICATIONS

### Primary Color Scheme
```css
/* Core Colors */
background-color: #000000  /* Pure black */
color: #00ff00            /* Terminal green */

/* Specific Element Colors */
.ascii-panel {
    background-color: #000000;
    color: #00ff41;          /* Slightly brighter green */
    font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
    font-size: 11px;
    line-height: 1.1;
}

/* Game Map Colors */
.PLAYER: '#00ff00'           /* Bright green */
.CURRENT_PLAYER: '#ffff00'   /* Bright yellow */
.ENEMY: '#ff0000'            /* Red */
.WALL: '#808080'             /* Gray */
.FLOOR: '#404040'            /* Dark gray */
```

---

## LAYOUT CONSTRAINTS

### Fixed Dimensions
- **Right Panel Width:** Exactly 40 characters (terminal columns)
- **Panel Borders:** Always 23 characters wide (content area)
- **Game Map:** 60x20 character grid
- **Minimap:** 120x80 pixels (fixed positioning)

### Variable Content Rules
- **Player Names:** Truncated to 13 characters max
- **Skill Values:** Always right-aligned with padding
- **HP/AP Values:** Format "XXX/XXX" with padding
- **Message Text:** Wrapped at 21 characters, truncated with "..."

### Spacing Rules
- **Border Padding:** 1 space between border and content
- **Panel Gaps:** 2 pixel gap between panels
- **Text Alignment:** Left-aligned unless specified
- **Number Alignment:** Right-aligned with zero-padding

---

## QUICK SKILL BAR SPECIFICATIONS

### Hotkey System
```
[1] Primary Movement     (1 AP) - Always available
[2] Basic Attack        (0 AP) - Free action  
[3] Skill Slot 1        (X AP) - User-configurable
[4] Skill Slot 2        (X AP) - User-configurable
[5] Skill Slot 3        (X AP) - User-configurable
[6] Skill Slot 4        (X AP) - User-configurable
[7] Skill Slot 5        (X AP) - User-configurable
[8] Skill Slot 6        (X AP) - User-configurable
[9] Special/Ultimate    (X AP) - User-configurable
```

### AP Cost Display Rules
- **Format:** "(XAP)" where X is the cost
- **Insufficient AP:** Display as "----" and gray out
- **Free Actions:** Display as "(0AP)"
- **Unavailable:** Display as "----" 

### Skill Name Truncation
- **Maximum Length:** 15 characters
- **Truncation:** Add "..." if longer
- **Alignment:** Left-aligned within slot

---

## VISUAL REGRESSION TESTING POINTS

### Critical Measurement Points
1. **Panel Borders:** Exact character positions of all ┌─┐│└┘ characters
2. **Text Alignment:** First character position of all labels
3. **Progress Bars:** Length and character composition
4. **Spacing:** Exact character gaps between elements
5. **Color Application:** RGB values for all text and backgrounds

### Acceptable Changes
- **Dynamic Values:** HP numbers, AP values, player names
- **Message Content:** Log messages and their text
- **Skill Values:** Numerical skill levels and progress

### Fixed Elements (Never Change)
- **Border Characters:** All box-drawing characters
- **Panel Structure:** Header text, section dividers
- **Label Text:** "PLAYER STATS", "ACTIONS", etc.
- **Hotkey Numbers:** [1] through [9] positions
- **Character Positioning:** X,Y coordinates of structural elements

---

## TESTING VALIDATION RULES

### Automated Tests Should Verify
```javascript
// Example validation points
const VALIDATION_POINTS = {
  rightPanelWidth: 40,
  panelBorderWidth: 23,
  skillBarSlots: 9,
  messageLogLines: 3,
  hpBarLength: 12,
  apBarLength: 12,
  boxDrawingChars: ['┌','─','┐','│','└','┘','├','┤','┬','┴','┼'],
  progressBarChars: ['█','▒','░','▓'],
  colorScheme: {
    background: '#000000',
    primary: '#00ff00',
    currentPlayer: '#ffff00',
    enemy: '#ff0000'
  }
};
```

### Visual Regression Checks
1. **Pixel-perfect borders** - All box-drawing characters in exact positions
2. **Consistent spacing** - Character positions match template
3. **Color accuracy** - RGB values match specification
4. **Font rendering** - Monospace character alignment
5. **Panel dimensions** - Width/height constraints maintained

---

## IMPLEMENTATION NOTES

### GameRenderer.ts - Key Methods
- `generateStatsDisplay()` - Creates ASCII stats panel
- `generateASCIIBar()` - Progress bar rendering
- `padString()` / `padNumber()` - Text alignment

### APInterface.ts - Key Methods  
- `generateTurnIndicatorASCII()` - Turn status panel
- `generateAPDisplayASCII()` - AP tracking panel
- `generateInitiativeOrderASCII()` - Initiative display

### HTML/CSS Integration
- `.stats-panel` class applies monospace font and colors
- `.ascii-ui-container` manages panel layout
- Right panel width controlled by CSS grid (40vw max, 420px max)

---

## BROWSER COMPATIBILITY

### Supported Character Sets
- **Unicode Box Drawing:** U+2500-U+257F range
- **Block Elements:** U+2580-U+259F range  
- **Geometric Shapes:** U+25A0-U+25FF range

### Font Requirements
```css
font-family: 'Courier New', 'Monaco', 'Menlo', 'DejaVu Sans Mono', monospace;
font-feature-settings: 'liga' off;
font-variant-ligatures: none;
```

### Minimum Supported Resolutions
- **Desktop:** 1200px wide minimum
- **Mobile:** Responsive layout below 900px
- **Font Scaling:** clamp(8px, 1.2vw, 14px)

---

## CHANGE CONTROL PROCESS

### Before Modifying UI
1. **Document Current State:** Screenshot all panels
2. **Identify Impact:** Which templates are affected
3. **Update Standards:** Revise this document
4. **Update Tests:** Modify validation points
5. **Test Regression:** Verify against standards

### Approved Modification Types
- **Content Updates:** Messages, values, player data
- **Color Adjustments:** RGB values (with documentation)
- **Size Optimization:** Character count reduction (with scaling)

### Prohibited Changes Without Standards Update
- **Border Characters:** Box-drawing character changes
- **Panel Structure:** Header/footer modifications  
- **Layout Dimensions:** Width/height alterations
- **Font Changes:** Monospace font substitutions

---

## VERSION HISTORY

- **v1.0** - Initial standards document
- Quick skill bar system (1-9 hotkeys) established
- AP cost indicators implemented  
- Box-drawing character standardization
- Terminal green color scheme locked
- Visual regression testing baseline created

---

## APPENDIX: COMPLETE TEMPLATE REFERENCE

```
FULL RIGHT PANEL TEMPLATE (40 chars wide):
========================================

╔═══════════════════════╗
║      PLAYER STATS     ║
╠═══════════════════════╣
║ Name: PlayerName123   ║
║ HP: 100/100 ████████████ ║
║ AP:   8/8   ████████████ ║
║ Move: 3/3   ▶▶▶▶▶▶▶▶▶▶▶▶ ║
║ Pos: (30,10)          ║
╠═══════════════════════╣
║       SKILLS          ║
╠═══════════════════════╣
║ Combat:     50 ★★★☆☆ ║
║ Swords:     75 ★★★★☆ ║
║ Fire Magic: 25 ★★☆☆☆ ║
║ Healing:    60 ★★★☆☆ ║
╚═══════════════════════╝

╔═══════════════════════╗
║     TURN STATUS       ║
╠═══════════════════════╣
║ Player: YourName      ║
║ Status: YOUR TURN     ║
║ ▶ TAKE ACTION!        ║
╚═══════════════════════╝

╔═══════════════════════╗
║    ACTION POINTS      ║
╠═══════════════════════╣
║ Current: 8/8          ║
║ ███████████████ ║
║ +2 per turn           ║
╚═══════════════════════╝

╔═══════════════════════╗
║   INITIATIVE ORDER    ║
╠═══════════════════════╣
║*▶ PlayerA   18 *║
║  PlayerB   15  ║
║* PlayerC   12 *║
║  PlayerD    9  ║
║  PlayerE    7  ║
╚═══════════════════════╝

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
╠═══════════════════════╣
║ [M] Move              ║
║ [A] Attack            ║
║ [D] Defend            ║
║ [R] Rest/End Turn     ║
║ [H] Help              ║
╚═══════════════════════╝

╔═══════════════════════╗
║     TURN TIMER        ║
╠═══════════════════════╣
║ 🟢 Time: 8s           ║
║ ████████▓▓▓▓▓▓▓ ║
║ Take your time        ║
╚═══════════════════════╝

╔═══════════════════════╗
║     MESSAGE LOG       ║
╠═══════════════════════╣
║ > PlayerA moved       ║
║ > You dealt 15 damage ║
║ > Enemy defeated!     ║
║                       ║
║                       ║
╚═══════════════════════╝
```

This completes the ASCII UI Visual Standards Document. All measurements, characters, colors, and layout specifications are precisely documented for visual regression testing and future development reference.