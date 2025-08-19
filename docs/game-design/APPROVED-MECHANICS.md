# Approved Game Mechanics: Final Decisions

**Document Version**: 1.0  
**Date**: 2025-08-19  
**Status**: Finalized Design Decisions  
**Maintained By**: Development-Manager Agent

---

## 🎯 Core Approved Decisions

### Character System
- **ASCII Representation**: Players are '@' with customizable colors
- **No Character Levels**: Pure skill-based progression (0-100 per skill)
- **5-Skill MVP**: Combat, Archery, Healing, Stealth, Survival
- **Expansion Path**: Scale to 30+ skills through specialization trees

### Combat System
- **D20 Base**: Roll 1d20 + skill/4 + attribute/4 vs target AC
- **Real-Time Ticks**: MUD-style 2-second action resolution
- **Action Point Economy**: Different actions cost different tick amounts
- **Equipment Matters**: Weapons and armor provide significant tactical options

### Permadeath Balance
- **Dual-Tier Progression**: Character skills (lost) + Account knowledge (persistent)
- **Equipment Loss**: Complete gear reset on death
- **Account Benefits**: Knowledge points enable stronger new characters
- **Group Safety**: 8-player coordination reduces individual risk

### World Structure
- **Single-Player MVP**: 10-level procedural dungeon
- **Post-MVP**: Static hub world + random dungeons
- **Scaling Difficulty**: Clear risk indicators and progressive challenge

### Multi-Player Coordination
- **8-Player Groups**: Tactical cooperation and resource sharing
- **AI Takeover**: Conservative play for disconnected players
- **Communication**: Text chat with tactical coordination tools
- **Leadership**: Democratic decision-making with emergency overrides

---

## ⚔️ Combat Mechanics (Finalized)

### Action Timing
```
Movement:     1 tick  (frequent positioning)
Basic Attack: 2 ticks (standard combat)
Power Attack: 3 ticks (high damage)
Skill Use:    3-5 ticks (special abilities)
Item Use:     1-2 ticks (consumables)
Rest/Wait:    1 tick  (recovery)
```

### Damage Formula
```typescript
hit_chance = d20 + floor(skill/4) + weapon_bonus + floor(dexterity/4)
damage = weapon_base + floor(strength/4) + floor(skill/10) - armor_protection
critical = natural_20 (double damage + skill bonus)
```

### ADOM-Style Commands
```
Movement: hjkl (vi-style) or numpad
Combat: 'f' fight, 'r' ranged, 'g' guard
Items: 'a' apply, 'd' drop, 'e' eat, 'q' quaff
Utility: 'o' open, 'c' close, 'i' inventory, 'l' look
```

---

## 💀 Permadeath System (Finalized)

### Death Consequences
**Lost Immediately:**
- All equipment and inventory
- Current character skill levels
- Dungeon position and progress

**Preserved Always:**
- Account Knowledge Points (1 per skill level achieved)
- Dungeon map discoveries
- Achievement unlocks
- Social standings

### New Character Benefits
```
Starting Skill Points = 50 + floor(Account_Knowledge / 20)
Equipment Quality = Account tier unlocks
Special Options = Achievement-based unlocks
```

---

## 🎨 ASCII Interface (Finalized)

### Color Coding
```
Players:    '@' bright white (customizable)
Enemies:    lowercase = weak, UPPERCASE = strong
Items:      ')' weapons, '[' armor, '!' potions
World:      '#' walls, '.' floor, '+' doors
```

### Screen Layout
```
┌─── MAP (60x20) ────┬─── STATS (20x20) ───┐
│ Player movement    │ Health/Skills       │
│ and exploration    │ display             │
├────────────────────┴─────────────────────┤
│ Message log (3 lines)                    │
└──────────────────────────────────────────┘
```

---

## 🚀 Implementation Timeline (Approved)

### Week 1: Foundation
- Tick system and ASCII renderer
- 5-skill character creation
- Basic movement and input

### Week 2: Combat & Dungeons
- D20 combat system
- Procedural 10-level dungeon
- Monster AI and interactions

### Week 3: Permadeath & Polish
- Account progression system
- Death/revival mechanics
- Balance tuning and UI polish

---

## 📊 Success Criteria (Finalized)

### MVP Completion
- [x] Character creation with 5 skills working
- [ ] Full combat system with d20 mechanics
- [ ] 10-level dungeon with procedural generation
- [ ] Permadeath with meaningful account progression
- [ ] ADOM-style command efficiency
- [ ] Clean ASCII interface with good UX

### Quality Gates
- **Week 1**: Core systems functional
- **Week 2**: Complete gameplay loop working
- **Week 3**: Balanced and polished experience

---

**These mechanics represent the final approved design decisions. All implementation should reference this document for consistency.**