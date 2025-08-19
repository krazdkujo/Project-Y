# ASCII Character System Decisions

**Category**: Visual Design & Player Representation  
**Priority**: HIGH - Required for MVP development  
**Impact**: Core game interface and player identification

---

## 🎨 Player Character Representation

### Question 1.1: Player @ Symbol Color Assignments [REQUIRED]

The game design specifies players are represented by @ symbols with different colors for race/class combinations. Please specify your preferred color assignments:

**Current Proposal:**
- Red @ = Human Fighter
- Blue @ = Elf Wizard  
- Green @ = Halfling Rogue
- Yellow @ = Dwarf Cleric
- Orange @ = Human Paladin
- Purple @ = Elf Sorcerer
- Cyan @ = Halfling Bard
- White @ = Dwarf Ranger

**Questions:**
1. Do you approve the above color-to-class assignments? No - Players can select a color on start.
2. Should colors represent RACE or CLASS or COMBINATION of both?
3. Do you want specific colors associated with specific fantasy races?
4. Should players be able to choose their @ color, or is it assigned based on character build? Players can choose.

**Technical Impact**: Affects ASCII rendering system and player identification UI

---

### Question 1.2: Player Identification System [REQUIRED]

With 8 players using @ symbols, we need clear identification:

**Options:**
A) **Color Only**: Players distinguished only by @ symbol color
B) **Color + Symbol Variation**: Use @, #, %, &, *, +, =, $ for different players
C) **Color + Number**: Display @1, @2, @3... with colors
D) **Tooltip System**: Hover/click to see player name and details

**Questions:**
1. Which identification method do you prefer? A
2. Should enemy players (in PvP) have different symbols than party members? No PVP unless dueling - All players in party by default
3. How important is it that players can quickly identify each other in combat? Players are the only @ signs

**Technical Impact**: UI complexity, player confusion vs clarity

---

## 👹 Monster Representation System

### Question 2.1: Monster ASCII Characters [REQUIRED]

You specified some examples. Please confirm the complete monster set:

**Current Examples:**
- Goblins: 'g' (green)
- Gnolls: 'g' (blue) 
- Orcs: 'o' (red)

**Questions:**
1. Do you want the same letter for related monster types (e.g., all goblinoids use 'g' with different colors)? Use capital and lowercase paired with color combinations
2. Should monster difficulty be represented by case (lowercase = weak, UPPERCASE = strong)? Incedentally, yes, but not as a rule. If you are going to have different types of the same letter the stronger version woul dbe capitalized
3. Please specify ASCII characters and colors for these additional monsters: I put some examples in - but you get the idea.
   - Trolls: T
   - Dragons: D
   - Undead (zombies, skeletons, liches): z, s, l
   - Bandits/humans: ?
   - Beasts (wolves, bears): ?
   - Magical creatures: ?

**Technical Impact**: Monster identification system, combat clarity

---

### Question 2.2: Monster Behavior Indicators [REQUIRED]

**Options:**
A) **Static Symbols**: Monsters always appear as their base character
B) **Status Indicators**: Symbols change based on status (wounded, enraged, etc.)
C) **Animation**: Symbols blink or change to show activity
D) **Surrounding Markers**: Use symbols around monsters to show status

**Questions:**
1. Should monster symbols change to indicate health status? No
2. Do you want visual indicators for monster aggression/alert state? No
3. Should magical effects on monsters be visible (e.g., 'g' becomes 'G' when buffed)? 

**Technical Impact**: Rendering complexity, gameplay clarity

---

## 🗺️ Environment and UI Elements

### Question 3.1: Dungeon Environment Symbols [REQUIRED]

**Current Proposal:**
- Walls: '#' (gray)
- Floor: '.' (dark gray)
- Doors: '+' (brown)
- Stairs: '<' and '>' (white)
- Treasure: '$' (gold)
- Traps: '^' (red)

**Questions:**
1. Do you approve these environment symbols? Yes
2. Should doors show their state (open vs closed) with different symbols? + closed / open
3. Do you want different wall types ('#' for stone, '=' for wood, etc.)? Use color for different wall types but keep it as #
4. Should water/lava/special terrain have specific symbols? Color, alternate red and yellow for lava
5. How should secret doors be represented (before and after discovery)? Like a wall or whatever they are

**Technical Impact**: Map generation and rendering systems

---

### Question 3.2: Interactive Objects [REQUIRED]

**Questions:**
1. How should the following be represented: You can figure these out.
   - Levers/switches: ?
   - Altars: ?
   - Merchant NPCs: ?
   - Quest givers: ?
   - Healing fountains: ?
   - Magic portals: ?

2. Should interactive objects be distinguished from static environment?
3. Do you want different symbols for objects that require different skills to use? No

**Technical Impact**: Skill system integration, player interaction clarity

---

## 📱 Interface and Display Considerations

### Question 4.1: ASCII Font and Sizing [REQUIRED]

**Options:**
A) **Fixed-width Terminal Font**: Courier, Monaco, Consolas
B) **Retro Gaming Font**: Custom pixel fonts
C) **System Default**: Let browser/device choose
D) **Scalable**: Player can adjust font size

**Questions:**
1. What font family should be used for ASCII characters? It HAS to be A for it to work - all characters have to take up the same amount of space
2. Should the ASCII display be scalable for different screen sizes? It can scale
3. Do you want the game to look like a classic terminal or more modern? Modern and using colors
4. How important is mobile device compatibility vs PC gaming? PC is most important

**Technical Impact**: UI development, mobile responsiveness

---

### Question 4.2: Color Accessibility [REQUIRED]

**Questions:**
1. Should the game support colorblind accessibility? Yes
2. Do you want an option for high-contrast mode? Yes
3. Should colors be customizable by players? No
4. Are there any colors that should be avoided for cultural/accessibility reasons? No

**Technical Impact**: Accessibility compliance, UI flexibility

---

## 🎮 8-Player Specific Considerations

### Question 5.1: Player Status Display [REQUIRED]

With 8 players, screen space is limited:

**Options:**
A) **List View**: All 8 players listed vertically with status
B) **Grid View**: 2x4 or 4x2 grid of player status blocks
C) **Minimalist**: Show only essential info (health, current action)
D) **Expandable**: Click to see detailed status for each player

**Questions:**
1. What information is most important to display for each player? c Health, Mana, Stam, location
2. Should the active player (current turn) be highlighted differently? There is no active player, it's real time with ticks dictating when the environment acts.
3. How much screen space should player status occupy vs the game map? 15-20% distributed around the edges like a typical MMO should work.

**Technical Impact**: UI layout, information density

---

### Question 5.2: Turn Order Visualization [REQUIRED]

**Options:**
A) **Initiative List**: Show numbered order of all 8 players + monsters
B) **Timeline**: Horizontal bar showing upcoming turns
C) **Current Only**: Only show whose turn it is now
D) **Color-Coded**: Use colors/highlighting to show turn status

**Questions:**
1. How should players see the turn order? There is no turn order, it's real time with the environment acting on ticks. 
2. Do you want to show the entire initiative order or just the next few turns?
3. Should players see AI/monster initiative positions?

**Technical Impact**: UI complexity, strategic planning

---

## 💬 Communication and Coordination

### Question 6.1: Chat and Communication [REQUIRED]

**Options:**
A) **Text Chat Only**: Simple message sending
B) **Quick Commands**: Preset messages for common actions
C) **Visual Indicators**: Map markers and pings
D) **Voice Integration**: Optional voice chat support

**Questions:**
1. What communication tools do 8-player groups need most? chat
2. Should there be different chat channels (party, whisper, all)? Yes
3. Do you want built-in tactical communication tools (mark targets, etc.)? marks on targets is good
4. Should chat history be preserved between sessions? not in game, but it should be logged

**Technical Impact**: Multiplayer systems, social features

---

## 📋 Implementation Priority

Please rank these ASCII system components by importance (1 = most critical): This is all important.

- [ ] Player @ symbol color system
- [ ] Monster character representation
- [ ] Environment symbols (walls, doors, etc.)
- [ ] Player identification in groups
- [ ] Status and health indicators
- [ ] Turn order visualization
- [ ] Interactive object symbols
- [ ] Communication systems

---

## ⏰ Timeline Impact

**High Priority Decisions** (Block development without answers):
- Player @ symbol color assignments
- Basic monster character set (g, o, T, D minimum)
- Environment symbols (walls, floors, doors)

**Medium Priority Decisions** (Can use defaults temporarily):
- Advanced monster status indicators
- Interactive object symbols
- Communication features

**Low Priority Decisions** (Post-MVP):
- Font customization
- Advanced accessibility features
- Complex visual effects

---

**Please provide your answers in the corresponding file: `/client-decisions/answers/01-ASCII-CHARACTER-SYSTEM.md`**