# ASCII Design Guide: Character and Symbol Reference

**Document Version**: 1.0  
**Date**: 2025-08-18  
**Purpose**: Complete reference for ASCII character representation in the roguelike game

---

## 🎯 Design Philosophy

This ASCII design system prioritizes:
- **Clarity**: Each symbol should be instantly recognizable
- **Consistency**: Related entities use similar visual patterns
- **Accessibility**: Color-blind friendly with symbol + color combinations
- **Scalability**: Works on both mobile and desktop displays

---

## 👤 Player Character System

### Base Symbol: @ (Commercial At)
All players use the `@` symbol with color differentiation for identification.

### 8-Player Color Scheme
```
Player 1: Red @     (#FF0000) - Warrior/Fighter theme
Player 2: Blue @    (#0066FF) - Mage/Intelligence theme  
Player 3: Green @   (#00AA00) - Rogue/Nature theme
Player 4: Yellow @  (#FFAA00) - Cleric/Divine theme
Player 5: Purple @  (#AA00FF) - Sorcerer/Arcane theme
Player 6: Cyan @    (#00AAAA) - Bard/Social theme
Player 7: Orange @  (#FF6600) - Paladin/Justice theme
Player 8: White @   (#FFFFFF) - Ranger/Versatile theme
```

### Player Status Indicators (Optional)
```
@ = Normal status
! = Critical health (under 25%)
? = Confused/Stunned
* = Buffed/Enhanced
~ = Poisoned/Debuffed
```

---

## 👹 Monster Classification System

### Humanoid Monsters
```
g = Goblins (Green #00AA00)
g = Gnolls (Blue #0066CC)  
o = Orcs (Red #CC0000)
h = Hobgoblins (Dark Green #006600)
b = Bandits (Brown #996633)
p = Pirates (Navy Blue #003366)
k = Kobolds (Orange #CC6600)
```

### Large Creatures
```
T = Trolls (Dark Brown #664422)
O = Ogres (Gray #666666)
G = Giants (Light Gray #AAAAAA)
C = Cyclops (Purple #663399)
```

### Undead
```
z = Zombies (Pale Green #CCFFCC)
s = Skeletons (Bone White #FFFFCC)
w = Wraiths (Translucent Blue #CCCCFF)
L = Liches (Dark Purple #330066)
V = Vampires (Blood Red #990000)
```

### Beasts and Animals
```
w = Wolves (Gray #808080)
b = Bears (Brown #663300)
l = Lions (Golden #CCAA00)
s = Spiders (Black #000000)
r = Rats (Dark Gray #444444)
c = Cats (Various colors)
d = Dogs (Various colors)
```

### Dragons and Dragonkin
```
D = Dragons (color indicates type)
  - Red D (#FF0000) = Fire Dragon
  - Blue D (#0000FF) = Ice Dragon  
  - Green D (#00AA00) = Poison Dragon
  - Black D (#000000) = Shadow Dragon
  - Gold D (#FFD700) = Ancient Dragon
d = Drakes (smaller dragons, same color scheme)
y = Wyrmlings (baby dragons)
```

### Magical Creatures
```
e = Elementals (color indicates type)
  - Red e = Fire Elemental
  - Blue e = Water Elemental
  - Brown e = Earth Elemental
  - White e = Air Elemental
f = Fey creatures (Bright colors)
u = Unicorns (White #FFFFFF)
x = Pixies (Sparkly colors)
```

---

## 🗺️ Environment and Terrain

### Basic Dungeon Structure
```
# = Walls (Dark Gray #333333)
. = Floor (Light Gray #CCCCCC)
+ = Doors (Brown #996633)
= = Secret Doors (Gray #666666)
< = Stairs Up (White #FFFFFF)
> = Stairs Down (White #FFFFFF)
% = Rubble/Debris (Brown #664422)
```

### Interactive Objects
```
$ = Treasure/Gold (Gold #FFD700)
* = Gems/Jewelry (Sparkly colors)
& = Altars (Stone Gray #999999)
@ = NPCs (Various colors, different from players)
? = Unknown/Mysterious objects (Purple #663399)
! = Important/Quest objects (Bright Yellow #FFFF00)
```

### Furniture and Fixtures
```
| = Pillars (Gray #666666)
- = Tables/Surfaces (Brown #996633)
[ = Chests/Containers (Brown #996633)
] = Open Chests (Brown #996633)
^ = Traps (Red #CC0000)
& = Levers/Switches (Metal Gray #999999)
```

### Liquids and Hazards
```
~ = Water (Blue #0066CC)
~ = Lava (Red #FF3300)
~ = Acid (Green #00CC00)
^ = Spikes (Gray #666666)
@ = Pits (Black #000000)
% = Fire (Orange/Red #FF6600)
```

---

## 🎒 Items and Equipment

### Weapons
```
) = Swords/Blades (Silver #CCCCCC)
( = Maces/Clubs (Brown #996633)
/ = Axes (Steel Gray #999999)
\ = Staves/Wands (Wood Brown #CC9966)
} = Bows (Wood Brown #996633)
{ = Crossbows (Metal Gray #999999)
| = Spears/Polearms (Wood/Metal #CC9966)
```

### Armor and Protection
```
[ = Heavy Armor (Metal Gray #999999)
] = Light Armor (Leather Brown #996633)
( = Helmets (Metal Gray #999999)
) = Shields (Various colors)
= = Rings (Gold #FFD700)
" = Amulets/Necklaces (Various colors)
```

### Consumables
```
! = Potions (Various colors by type)
  - Red ! = Health potions
  - Blue ! = Mana potions  
  - Green ! = Poison
  - Purple ! = Magic enhancement
? = Scrolls (Parchment #FFFFCC)
% = Food/Rations (Brown #996633)
* = Magic components (Various colors)
```

---

## 🎨 Color Guidelines

### Primary Color Palette
```
#FF0000 - Red (Fire, danger, combat)
#0066FF - Blue (Water, magic, intelligence)  
#00AA00 - Green (Nature, poison, stealth)
#FFAA00 - Yellow/Gold (Divine, treasure, light)
#AA00FF - Purple (Arcane, mystery, illusion)
#00AAAA - Cyan (Air, social, communication)
#FF6600 - Orange (Energy, enthusiasm, paladins)
#FFFFFF - White (Purity, air, versatility)
```

### Secondary Colors
```
#666666 - Dark Gray (Stone, metal, neutral)
#CCCCCC - Light Gray (Basic objects, floors)
#333333 - Very Dark Gray (Walls, shadows)
#996633 - Brown (Wood, leather, earth)
#000000 - Black (Void, darkness, death)
#FFFF00 - Bright Yellow (Alerts, important items)
```

### Status Effect Colors
```
#00FF00 - Bright Green (Healing, beneficial)
#FF00FF - Magenta (Magical effects)
#FFFF00 - Yellow (Warning, temporary)
#FF3300 - Bright Red (Damage, critical danger)
#CCFFCC - Pale Green (Mild poison, sickness)
#FFCCCC - Pale Red (Minor damage, weakness)
```

---

## 📱 Responsive Design Considerations

### Mobile Adaptations
- Minimum font size: 14px for ASCII characters
- Touch targets: 44x44px minimum for interactive elements
- High contrast mode available
- Zoom capability for detailed viewing

### Accessibility Features
- Color + symbol combinations (never color alone)
- High contrast mode option
- Colorblind-friendly palette
- Screen reader compatible alt-text for symbols

---

## 🎮 Implementation Notes

### Rendering Priorities
1. **Player characters** - Always visible, highest priority
2. **Monsters** - High priority, combat-relevant
3. **Interactive objects** - Medium priority, context-dependent
4. **Environment** - Low priority, background elements

### Animation Guidelines
- **Static by default** - ASCII characters don't move
- **Blinking effects** - For status changes (damage, effects)
- **Color transitions** - For state changes (health, magic)
- **Positional updates** - Only during turn resolution

### Symbol Conflicts Resolution
If two entities occupy the same space:
1. Player characters override everything
2. Monsters override objects and terrain
3. Interactive objects override static environment
4. Use background color to indicate hidden elements

---

## 🔄 Dynamic Elements

### Turn-Based Updates
```
During player turns:
- Current player @ symbol highlighted (brighter color)
- Available movement squares highlighted
- Target highlighting for attacks/spells

During AI turns:
- Monster symbols briefly highlighted during actions
- Spell effects shown with temporary symbols
- Damage numbers as temporary overlay text
```

### Status Overlays
```
Health indicators:
- Green background = Full health
- Yellow background = Injured  
- Red background = Critical
- Black background = Unconscious/Dead

Magic effects:
- Blue outline = Magical enhancement
- Purple outline = Spell targeting
- Red outline = Harmful effect
```

---

## 📋 Symbol Quick Reference

### Complete ASCII Character Set
```
Players:    @ (8 colors)
Humanoids:  g o h b p k (various colors)
Large:      T O G C (earth tones)
Undead:     z s w L V (pale/dark colors)
Beasts:     w b l s r c d (natural colors)
Dragons:    D d y (elemental colors)
Magic:      e f u x (bright/ethereal colors)

Terrain:    # . + = < > % | - (grays/browns)
Objects:    $ * & @ ? ! [ ] ^ (varied colors)
Liquids:    ~ (blue/red/green by type)
Items:      ) ( / \ } { | [ ] = " ! ? % * (material colors)
```

This design guide ensures consistent, recognizable ASCII representation across all game elements while maintaining clarity for 8-player coordination and combat scenarios.