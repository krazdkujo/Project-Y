# ASCII UI STANDARDS PRESERVATION
## Maintaining Visual Excellence in Modern Architecture

---

## PRESERVATION MANDATE 🔒

### **WHAT MUST NEVER CHANGE**
- **40-character Quick Skill Bar width**: `[1] Move (1AP)` format
- **Box-drawing character standards**: `┌─┐│└┘├┤┬┴┼` for borders
- **Terminal green color scheme**: `#00ff00` on `#000000` background
- **ASCII progress bars**: `█▒░▓` character usage
- **Exact spatial positioning**: Every UI panel must maintain pixel-perfect placement

### **VISUAL REGRESSION PROTECTION** 🛡️
- **Automated testing** validates every ASCII character position
- **Pixel-perfect screenshots** compared against blessed baselines
- **Cross-browser consistency** enforced across Chrome, Firefox, Safari
- **Mobile viewport adaptation** while preserving core layout ratios

---

## CURRENT ASCII STANDARDS ANALYSIS

### **PROTECTED UI COMPONENTS** ✅

#### **Quick Skill Bar (CRITICAL - NEVER CHANGE)**
```
┌────────────────────────────────────────┐
│ ┌─Quick Skills─────────────────────────┐│
│ │[1] Move          (1AP) Ready      ││
│ │[2] Basic Attack  (1AP) Ready      ││
│ │[3] Shield Block  (1AP) Ready      ││
│ │[4] Fireball      (3AP) Ready      ││
│ │[5] Heal          (2AP) Ready      ││
│ │[6] (Empty)       (0AP)           ││
│ │[7] (Empty)       (0AP)           ││
│ │[8] (Empty)       (0AP)           ││
│ │[9] (Empty)       (0AP)           ││
│ └─────────────────────────────────────┘│
└────────────────────────────────────────┘
   ^40 characters width - MUST PRESERVE
```

**Preservation Requirements:**
- Exact 40-character width boundary
- `[N]` hotkey format with single digit
- Skill name left-aligned with proper padding
- `(XAP)` cost display right-aligned
- `Ready/Cooldown` status indication
- Box-drawing borders with proper corners

#### **Game Map Display**
```
┌──────────────────────────────────────────────────────┐
│ ┌─Dungeon Level 1─────────────────────────────────────┐│
│ │ ######################################### │
│ │ #.......................................# │
│ │ #...........###############.............# │
│ │ #...........#             #.............# │
│ │ #...........#     @       #.............# │
│ │ #...........#             #.............# │  
│ │ #...........###############.............# │
│ │ #.......................................# │
│ │ ######################################### │
│ └─────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

**Character Mappings (MUST PRESERVE):**
- `@` = Player character
- `#` = Wall/solid terrain  
- `.` = Floor/walkable space
- `+` = Door (closed)
- `/` = Door (open)
- `~` = Water/liquid
- `^` = Trap
- `*` = Item/loot
- `!` = NPC/enemy

#### **Player Stats Panel**
```
┌────────────────────────────────────────┐
│ ┌─Player Stats────────────────────────┐ │
│ │Name: Aragorn the Bold              │ │
│ │Level: Classless (Skill-based)     │ │
│ │                                   │ │
│ │Health: ██████████░░░░░░░░░░ 50/100│ │
│ │  Mana: ████████░░░░░░░░░░░░ 40/60 │ │
│ │    AP: ██████░░ 6/8               │ │
│ │                                   │ │
│ │Turn Timer: ████████░░░░ 8s        │ │
│ └───────────────────────────────────┘ │
└────────────────────────────────────────┘
```

**Progress Bar Standards:**
- `█` = Filled portion (current value)
- `░` = Empty portion (remaining capacity)
- `▒` = Partially filled (transitions/animations)
- `▓` = Warning/critical state indicator

### **COLOR SCHEME STANDARDS** 🎨

#### **Primary Terminal Green Theme**
```css
/* PROTECTED COLOR PALETTE - DO NOT CHANGE */
:root {
  --primary-text: #00ff00;        /* Bright terminal green */
  --primary-bg: #000000;          /* Pure black background */
  --secondary-text: #00cc00;      /* Dimmed green for less important text */
  --accent-green: #00ffaa;        /* Highlight color for selected items */
  --warning-yellow: #ffff00;      /* Warning states and notifications */
  --danger-red: #ff0000;          /* Health critical, errors */
  --info-cyan: #00ffff;           /* Information and system messages */
  --disabled-gray: #666666;       /* Disabled buttons, unavailable actions */
}

/* Box Drawing Characters */
.ascii-border {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.2;
  color: var(--primary-text);
  background: var(--primary-bg);
}

/* Progress Bars */
.ascii-progress {
  font-family: 'Courier New', monospace;
  white-space: pre;
  color: var(--primary-text);
}

.health-bar { color: var(--danger-red); }
.mana-bar { color: var(--info-cyan); }
.ap-bar { color: var(--accent-green); }
```

### **TYPOGRAPHY STANDARDS** 📝

#### **Font Requirements**
- **Primary**: `'Courier New', monospace` - guaranteed ASCII character alignment
- **Fallback**: `'Lucida Console', 'Monaco', monospace`
- **Size**: `14px` base with `line-height: 1.2` for proper spacing
- **Weight**: `normal` (no bold variations to maintain character width)

#### **Character Spacing Requirements**
```css
.ascii-text {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.2;
  letter-spacing: 0px;        /* No additional spacing */
  word-spacing: normal;       /* Preserve natural spacing */
  white-space: pre;          /* Preserve all whitespace exactly */
  font-kerning: none;        /* Disable kerning for monospace consistency */
}
```

---

## RESPONSIVE ASCII DESIGN PATTERNS

### **VIEWPORT ADAPTATION STRATEGY** 📱

#### **Desktop Layout (1200px+)**
```
┌─────────────────────────────────────────────────────────────────────────┐
│ Game Title                                          Connection Status │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─Game Map (60x20)─────────┐ ┌─Quick Skills (40w)───┐ ┌─Stats Panel─┐ │
│ │                          │ │[1] Move        (1AP) │ │Name: Player │ │
│ │         @                │ │[2] Attack      (1AP) │ │Health: ████ │ │
│ │    #########             │ │[3] Block       (1AP) │ │Mana:   ███░ │ │
│ │    #       #             │ │[4] Fireball    (3AP) │ │AP:     ██░░ │ │
│ │    # * *   #             │ │[5] Heal        (2AP) │ │             │ │
│ │    #########             │ │[6] (Empty)     (0AP) │ │Initiative:  │ │
│ │                          │ │[7] (Empty)     (0AP) │ │1. Player    │ │
│ └──────────────────────────┘ │[8] (Empty)     (0AP) │ │2. Enemy     │ │
│                              │[9] (Empty)     (0AP) │ │3. Ally      │ │
│ ┌─Message Log──────────────┐ └──────────────────────┘ └─────────────┘ │
│ │> You enter the dungeon   │                                           │
│ │> A goblin appears!       │                                           │
│ │> Your turn begins        │                                           │
│ └──────────────────────────┘                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

#### **Tablet Layout (768px - 1199px)**
```
┌─────────────────────────────────────────────────────────┐
│ Game Title                          Connection Status │
├─────────────────────────────────────────────────────────┤
│ ┌─Game Map (45x15)────────┐ ┌─Quick Skills (40w)──────┐ │
│ │                         │ │[1] Move          (1AP)  │ │
│ │      @                  │ │[2] Attack        (1AP)  │ │
│ │ ###########             │ │[3] Block         (1AP)  │ │
│ │ #    *    #             │ │[4] Fireball      (3AP)  │ │
│ │ ###########             │ │[5] Heal          (2AP)  │ │
│ │                         │ │[6] (Empty)       (0AP)  │ │
│ └─────────────────────────┘ │[7] (Empty)       (0AP)  │ │
│                             │[8] (Empty)       (0AP)  │ │
│ ┌─Stats & Initiative──────┐ │[9] (Empty)       (0AP)  │ │
│ │Name: Player             │ └──────────────────────────┘ │
│ │Health: ████████░░░░     │                              │
│ │Mana:   ██████░░░░░      │ ┌─Message Log──────────────┐ │
│ │AP:     ████░░           │ │> You enter dungeon       │ │
│ │Initiative: 1.Player     │ │> Goblin appears!         │ │
│ └─────────────────────────┘ └──────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### **Mobile Layout (320px - 767px)**
```
┌─────────────────────────────────────┐
│ Tactical Roguelike    Connected ✓ │
├─────────────────────────────────────┤
│ ┌─Game Map (30x12)─────────────────┐ │
│ │                                 │ │
│ │         @                       │ │
│ │    #########                    │ │
│ │    # * *   #                    │ │
│ │    #########                    │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─Quick Skills (COLLAPSIBLE)──────┐ │
│ │[1] Move (1AP) [2] Attack (1AP)  │ │  
│ │[3] Block(1AP) [4] Fire  (3AP)   │ │
│ │[5] Heal (2AP) [6-9] Empty       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Health:████████░░░░ Mana:████░░░    │
│ AP: ████░░ Turn Timer: 8s           │
│                                     │
│ ┌─Game Log────────────────────────┐ │
│ │> Enter dungeon > Goblin appears!│ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### **ADAPTIVE DESIGN RULES** 📐

#### **Component Priority System**
```typescript
interface ComponentPriority {
  essential: string[];      // Always visible
  important: string[];      // Hide only if necessary
  optional: string[];       // First to collapse/hide
}

const viewportPriorities: ComponentPriority = {
  essential: [
    'game-map',           // Core gameplay area
    'quick-skill-bar',    // Primary interaction (PROTECTED)
    'player-health',      // Critical status info
    'current-ap'          // Action point display
  ],
  important: [
    'message-log',        // Game feedback
    'initiative-tracker', // Turn order
    'connection-status'   // Network health
  ],
  optional: [
    'detailed-stats',     // Extended character info
    'inventory-preview',  // Quick item access
    'chat-panel'         // Player communication
  ]
};
```

#### **Collapsible Panel Behavior**
```css
/* Mobile: Collapsible Skills Panel */
@media (max-width: 767px) {
  .quick-skill-bar {
    /* MAINTAIN 40-character width constraint even when collapsed */
    max-width: 40ch;
    transition: height 0.3s ease;
  }
  
  .quick-skill-bar.collapsed {
    height: 3em; /* Show only first row */
    overflow: hidden;
  }
  
  .quick-skill-bar.collapsed::after {
    content: "▼ Tap to expand skills";
    color: var(--secondary-text);
    font-style: italic;
  }
}
```

---

## ACCESSIBILITY PRESERVATION

### **SCREEN READER COMPATIBILITY** 🔊

#### **ARIA Enhancements for ASCII**
```html
<!-- Game Map with Accessibility -->
<div class="game-map" 
     role="grid" 
     aria-label="Dungeon floor 1, 20x15 grid"
     aria-describedby="map-description">
  
  <div id="map-description" class="sr-only">
    You are in a stone dungeon room. Player character @ is at position 10,7.
    Walls # surround the room. Items * are visible at positions 5,6 and 8,6.
  </div>
  
  <!-- Each cell with proper ARIA -->
  <div role="gridcell" 
       aria-label="Floor, empty, position 5,5"
       tabindex="-1">.</div>
  <div role="gridcell" 
       aria-label="Player character, position 10,7" 
       tabindex="0">@</div>
  <div role="gridcell" 
       aria-label="Stone wall, position 1,1"
       tabindex="-1">#</div>
</div>

<!-- Quick Skill Bar with Full Accessibility -->
<div class="quick-skill-bar" 
     role="toolbar" 
     aria-label="Quick skills, 9 hotkeys available">
  
  <button class="skill-button" 
          aria-describedby="skill-1-desc"
          accesskey="1">
    [1] Move
    <span id="skill-1-desc" class="sr-only">
      Movement ability, costs 1 action point, currently ready, 
      hotkey 1, allows character to move one space in any direction
    </span>
  </button>
  
  <button class="skill-button" 
          aria-describedby="skill-2-desc"
          accesskey="2">
    [2] Attack  
    <span id="skill-2-desc" class="sr-only">
      Basic attack, costs 1 action point, currently ready,
      hotkey 2, deals weapon damage to adjacent enemy
    </span>
  </button>
</div>
```

#### **Keyboard Navigation Patterns**
```typescript
// Enhanced Keyboard Navigation for ASCII Grid
class AccessibleASCIIGrid {
  private focusedCell: Point = { x: 0, y: 0 };
  private readonly gridSize: Size = { width: 60, height: 20 };
  
  handleKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowUp':
        this.moveFocus(0, -1);
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.moveFocus(0, 1);
        event.preventDefault();
        break;
      case 'ArrowLeft':
        this.moveFocus(-1, 0);
        event.preventDefault();
        break;
      case 'ArrowRight':
        this.moveFocus(1, 0);
        event.preventDefault();
        break;
      case 'Enter':
      case ' ':
        this.activateCell(this.focusedCell);
        event.preventDefault();
        break;
      case 'Escape':
        this.exitGridNavigation();
        event.preventDefault();
        break;
    }
  }
  
  private moveFocus(deltaX: number, deltaY: number): void {
    const newX = Math.max(0, Math.min(this.gridSize.width - 1, this.focusedCell.x + deltaX));
    const newY = Math.max(0, Math.min(this.gridSize.height - 1, this.focusedCell.y + deltaY));
    
    this.focusedCell = { x: newX, y: newY };
    this.updateVisualFocus();
    this.announceCell(this.focusedCell);
  }
  
  private announceCell(position: Point): void {
    const cellContent = this.getCellContent(position);
    const cellType = this.getCellType(cellContent);
    
    // Announce to screen reader
    this.announcer.announce(
      `${cellType} at row ${position.y + 1}, column ${position.x + 1}`
    );
  }
}
```

### **HIGH CONTRAST SUPPORT** 🔆

#### **Enhanced Contrast Ratios**
```css
/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  :root {
    --primary-text: #ffffff;      /* Pure white for maximum contrast */
    --primary-bg: #000000;        /* Pure black background */
    --secondary-text: #cccccc;    /* High contrast gray */
    --accent-green: #00ff00;      /* Bright green for highlights */
    --warning-yellow: #ffff00;    /* Pure yellow for warnings */
    --danger-red: #ff0000;        /* Pure red for danger */
  }
  
  .ascii-border {
    border: 2px solid var(--primary-text); /* Thicker borders */
  }
  
  .progress-bar-filled {
    background: var(--primary-text);
    color: var(--primary-bg);
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  /* ASCII games are naturally dark - minimal changes needed */
  :root {
    --ui-background: #111111;     /* Slightly lighter for UI chrome */
    --border-color: #333333;      /* Subtle borders for panels */
  }
}

/* Motion Reduction Support */
@media (prefers-reduced-motion: reduce) {
  .ascii-animation,
  .progress-bar-transition,
  .panel-slide {
    animation: none !important;
    transition: none !important;
  }
  
  .blinking-cursor::after {
    animation: none;
    opacity: 1; /* Always visible cursor */
  }
}
```

---

## COMPONENT MODERNIZATION STRATEGY

### **REACT COMPONENT ARCHITECTURE** ⚛️

#### **ASCIIRenderer Component (Core)**
```typescript
interface ASCIIRendererProps {
  width: number;           // Character width (e.g., 60)
  height: number;          // Character height (e.g., 20)  
  cellData: ASCIICell[][];  // 2D array of cell data
  viewport?: Rectangle;     // Visible area for scrolling
  theme: ASCIITheme;       // Color and style theme
  accessible?: boolean;     // Enable accessibility features
}

const ASCIIRenderer: React.FC<ASCIIRendererProps> = React.memo(({
  width,
  height,
  cellData,
  viewport,
  theme,
  accessible = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const accessibleGridRef = useRef<HTMLDivElement>(null);
  
  // Render to canvas for performance
  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d')!;
      renderASCIIGrid(context, cellData, theme);
    }
  }, [cellData, theme]);
  
  // Parallel accessible version for screen readers
  const accessibleCells = useMemo(() => {
    if (!accessible) return null;
    
    return cellData.map((row, y) =>
      row.map((cell, x) => ({
        key: `${x}-${y}`,
        position: { x, y },
        content: cell.character,
        description: getCellDescription(cell),
        interactive: cell.interactive
      }))
    );
  }, [cellData, accessible]);
  
  return (
    <div className="ascii-renderer" role="img" aria-label="Game display">
      {/* High-performance visual rendering */}
      <canvas 
        ref={canvasRef}
        width={width * CHAR_WIDTH}
        height={height * CHAR_HEIGHT}
        className="ascii-canvas"
        style={{ 
          fontFamily: "'Courier New', monospace",
          imageRendering: 'pixelated' // Crisp ASCII characters
        }}
      />
      
      {/* Screen reader accessible version */}
      {accessible && (
        <div 
          ref={accessibleGridRef}
          className="ascii-grid-accessible sr-only"
          role="grid"
          aria-label={`Game map, ${width} by ${height} characters`}
        >
          {accessibleCells?.map((row, y) => (
            <div key={y} role="row">
              {row.map((cell) => (
                <div 
                  key={cell.key}
                  role="gridcell"
                  tabIndex={cell.interactive ? 0 : -1}
                  aria-label={cell.description}
                  data-x={cell.position.x}
                  data-y={cell.position.y}
                >
                  {cell.content}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
```

#### **QuickSkillBar Component (PROTECTED)**
```typescript
interface QuickSkillBarProps {
  skills: SkillSlot[9];     // Exactly 9 slots
  currentAP: number;        // Available action points
  onSkillSelect: (slot: number) => void;
  hotkeysEnabled?: boolean; // Enable/disable hotkey handling
}

const QuickSkillBar: React.FC<QuickSkillBarProps> = React.memo(({
  skills,
  currentAP,
  onSkillSelect,
  hotkeysEnabled = true
}) => {
  // PROTECTED: Must maintain exact 40-character width
  const SKILL_BAR_WIDTH = 40;
  
  useHotkeys('1,2,3,4,5,6,7,8,9', (event) => {
    if (!hotkeysEnabled) return;
    
    const slot = parseInt(event.key) - 1;
    if (skills[slot] && skills[slot].apCost <= currentAP) {
      onSkillSelect(slot);
    }
  });
  
  return (
    <div 
      className="quick-skill-bar"
      role="toolbar"
      aria-label="Quick skills"
      style={{ 
        width: `${SKILL_BAR_WIDTH}ch`, // PROTECTED: Exact character width
        fontFamily: "'Courier New', monospace"
      }}
    >
      <div className="skill-bar-border">
        ┌─Quick Skills─────────────────────────┐
      </div>
      
      {skills.map((skill, index) => (
        <SkillSlot
          key={index}
          slot={index + 1}
          skill={skill}
          currentAP={currentAP}
          onSelect={() => onSkillSelect(index)}
          width={SKILL_BAR_WIDTH - 4} // Account for border characters
        />
      ))}
      
      <div className="skill-bar-border">
        └─────────────────────────────────────┘
      </div>
    </div>
  );
});

// Individual skill slot with exact formatting
const SkillSlot: React.FC<SkillSlotProps> = ({ slot, skill, currentAP, onSelect, width }) => {
  const slotText = skill 
    ? `[${slot}] ${skill.name.padEnd(12)} (${skill.apCost}AP) ${skill.status}`
    : `[${slot}] (Empty)       (0AP)`;
  
  // PROTECTED: Must fit exactly in allocated width
  const displayText = slotText.length > width 
    ? slotText.substring(0, width)
    : slotText.padEnd(width);
  
  return (
    <button
      className={`skill-slot ${skill && currentAP >= skill.apCost ? 'available' : 'unavailable'}`}
      onClick={onSelect}
      disabled={!skill || currentAP < skill.apCost}
      aria-label={skill ? `${skill.name}, costs ${skill.apCost} AP, ${skill.status}` : 'Empty skill slot'}
      accessKey={slot.toString()}
    >
      │{displayText}│
    </button>
  );
};
```

---

This ASCII UI preservation strategy ensures that the beloved terminal aesthetic and exact visual standards are maintained while modernizing the underlying component architecture for better performance, accessibility, and maintainability.