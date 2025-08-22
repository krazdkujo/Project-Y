# Core Game Specification: Turn-Based Tactical ASCII Roguelike

**Document Version**: 4.0  
**Date**: 2025-08-22  
**Status**: Authoritative Design Document (AP SYSTEM INTEGRATION)  
**Maintained By**: Development-Manager Agent

---

## 🎯 Game Vision

A **turn-based tactical ASCII roguelike** with **34-skill system** and **8-player cooperative gameplay**. Players coordinate using 5-10 second turns with initiative order, free basic actions, and strategic AP abilities. Features group-only permadeath, dynamic classes, and a guild-based economy.

### Core Pillars
1. **Turn-Based AP Combat** - Free basic actions + 1-8 AP special abilities
2. **Skill-Only Progression** - No attributes, 34 skills with AP ability integration
3. **8-Player Coordination** - Turn-based parties with formations and group abilities
4. **Equipment-Driven Combat** - Skills + equipment determine all effectiveness
5. **Guild-Based Economy** - Shared storage, crafting, and resource management

---

## 🎮 Core Mechanics (Complete Redesign)

### Character System
**No Attributes** - All effectiveness comes from skills and equipment only
**34-Skill System** - Complete skill system with AP ability integration
**Dynamic Classes** - Classes emerge from skill combinations and AP prerequisites
**Group Progression** - Account advancement through successful 8-player coordination

### Complete Skill System (30+ Skills)
```yaml
Weapon_Skills: (7 skills)
  Swords, Maces, Axes, Daggers, Staves, Bows, Crossbows
  
Armor_Skills: (4 skills)  
  Light_Armor, Medium_Armor, Heavy_Armor, Shields
  
Magic_Schools: (6 skills)
  Fire_Magic, Ice_Magic, Lightning_Magic, Earth_Magic, Healing_Magic, Necromancy
  
Combat_Skills: (4 skills)
  Evasion, Blocking, Dual_Wielding, Two_Handed
  
Crafting_Skills: (5 skills)
  Smithing, Alchemy, Enchanting, Cooking, Trap_Making
  
Passive_Skills: (8 skills)
  Stealth, Perception, Survival, Athletics, Leadership, Lockpicking, Intimidation, Diplomacy
```

### Abilities System
**Skill-Gated Unlocks** - Abilities unlock when skill requirements are met
**Multi-Skill Requirements** - Complex abilities require multiple skills
**Equipment Restrictions** - Some abilities require or forbid specific gear
**Examples**:
- Smite: Healing_Magic 25 + Maces 10
- Riposte: Evasion 25 + Light_Weapons 30 + No Heavy Armor

---

## ⚔️ Combat System (Skills + Equipment Only)

### Real-Time Tick System
**2-Second Ticks** - All actions resolved every 2 seconds
**Variable Action Costs** - Different actions require different tick amounts:
```yaml
Movement:        1 tick  (basic positioning)
Basic Attack:    2 ticks (standard weapon attack)
Power Attack:    3-4 ticks (high damage techniques)
Simple Abilities: 1-3 ticks (basic techniques)
Complex Abilities: 5-12 ticks (advanced techniques)
Ultimate Abilities: 15-30 ticks (master techniques)
Magic Spells:    3-50 ticks (based on spell complexity)
```

### Combat Resolution (No Attributes)
```typescript
// Pure skill + equipment system
hit_chance = 50 + weapon_accuracy + floor(weapon_skill/2) + situational_mods
damage = weapon_base + floor(weapon_skill/4) + ability_bonuses - armor_reduction
critical_chance = weapon_crit + floor(weapon_skill/10) + ability_bonuses

// Health calculation (skill-derived only)
health = base_health + survival_skill_bonus + equipment_bonuses
```

### Input System
**Arrow Keys + Numpad** - Accessible movement controls:
```yaml
Movement: Arrow Keys or Numpad (8-directional)
Combat: Spacebar (attack), Enter (block), Tab (target)
Abilities: F1-F12 (customizable quick-cast)
Actions: E (use), I (inventory), C (character), M (map)
```

---

## 🗺️ World Structure (ADOM Hybrid Model)

### Single-Player MVP
**Fixed 10-Level Dungeon** with procedural room generation:
```
Level 1-2:   Tutorial floors (goblins, basic items)
Level 3-5:   Standard difficulty (orcs, better equipment)  
Level 6-8:   High difficulty (trolls, rare items)
Level 9:     Boss preparation (elite enemies, great gear)
Level 10:    Final boss (unique challenge, legendary rewards)
```

### Post-MVP World Map
**Hub Town + Multiple Dungeons**:
```
Central Hub:     Safe zone for 8-player party formation
Forest Dungeon:  Nature theme, beast enemies, druid items
Mountain Caves:  Dwarven theme, undead enemies, smithing materials
Ancient Ruins:   Magic theme, construct enemies, spell components
Bandit Camps:    Human theme, rogue enemies, stealth gear
```

### Procedural Generation Rules
- **Room Types**: 60% combat, 20% empty, 15% loot, 5% special
- **Monster Density**: 1-3 enemies per combat room
- **Loot Distribution**: Common (70%), Uncommon (25%), Rare (5%)
- **Connectivity**: All areas reachable, prefer multiple paths

---

## 💀 Permadeath & Account Progression

### Character Death System
**Immediate Consequences**:
- All equipment lost in dungeon
- Character skills reset to 0
- Inventory completely cleared
- Current position/progress lost

**Account Benefits** (Never Lost):
```
Account Knowledge Points:
- +1 per skill level achieved
- +10 per dungeon level completed  
- +50 per boss defeated
- +100 per full dungeon completion

New Character Inheritance:
- Starting skills = floor(Account_Knowledge / 20)
- Equipment unlocks based on achievements
- Starting gear quality improves
- Rare starting race/class combinations
```

### Practice vs Ironman Modes
**Practice Mode** (MVP Default):
- Save/restore allowed for learning
- Deaths don't affect account progression
- No leaderboards or achievements

**Ironman Mode** (Post-MVP):
- True permadeath, no saves
- Full account progression
- Leaderboards and rankings
- Exclusive achievements and rewards

---

## 🎨 ASCII Interface (ADOM-Style Clarity)

### Terminal Layout
```
┌─── DUNGEON MAP (60x20) ────┬─── STATUS (20x20) ───┐
│ ##################         │ HP: 45/50            │
│ #................#         │ Hunger: Fed          │  
│ #....@...........#         │ Depth: Level 3       │
│ #........g.......#         │                      │
│ #................#         │ Combat: 34           │
│ #.......########.#         │ Archery: 12          │
│ ##################         │ Healing: 23          │
│                            │ Stealth: 8           │
│                            │ Survival: 28         │
├────────────────────────────┴──────────────────────┤
│ MESSAGE LOG (3 lines)                              │
│ > You hit the goblin for 4 damage!                │
│ > The goblin attacks you for 2 damage.            │
│ > You feel slightly hungry.                       │
└────────────────────────────────────────────────────┘
```

### Color Coding System
```yaml
Player:     '@' bright white
Enemies:    
  - Weak: red lowercase (g, o)
  - Strong: bright red uppercase (G, O, T)
  - Boss: yellow uppercase (unique symbols)
  
Items:
  - Weapons: ')' cyan
  - Armor: '[' brown  
  - Potions: '!' blue
  - Scrolls: '?' yellow
  - Food: '%' green

Environment:
  - Walls: '#' gray
  - Floor: '.' dark gray
  - Doors: '+' brown (closed), '/' brown (open)
  - Stairs: '<' '>' white
  - Treasure: '$' gold
```

---

## 🔄 MUD Tick System Architecture

### Tick Timing (Context-Sensitive)
```
Exploration: 1-second ticks (movement, interaction)
Combat: 2-second ticks (action resolution)
Rest: 5-second ticks (healing, recovery)
Emergency: 0.5-second ticks (interrupts, reactions)
```

### Action Queue Processing
```typescript
interface TickSystem {
  queueAction(playerId: string, action: Action): void
  processTick(): void
  resolveActions(actions: Action[]): GameState
  broadcastUpdate(newState: GameState): void
}

// Each tick processes:
1. Collect queued player actions
2. Validate actions against current state  
3. Resolve in initiative order
4. Update game state
5. Broadcast to all players
6. Schedule next tick
```

### Multi-Player Coordination (Post-MVP)
```
Turn Windows: 10-30 seconds for action submission
Group Actions: Vote system for major decisions
AI Takeover: Conservative play for disconnected players
Emergency Pauses: Party can vote for additional time
```

---

## 📊 Balance Framework

### Skill Progression Curve
```
Levels 0-25:   Fast progression (1 point per 2-3 uses)
Levels 25-50:  Moderate progression (1 point per 4-6 uses)
Levels 50-75:  Slow progression (1 point per 8-12 uses)  
Levels 75-100: Very slow progression (1 point per 15-25 uses)
```

### Power Scaling
```
Skill Level → Modifier:
0-19:  +0 to +4  (novice)
20-39: +5 to +9  (competent)
40-59: +10 to +14 (skilled)
60-79: +15 to +19 (expert)
80-99: +20 to +24 (master)
100:   +25 (legendary)
```

### Equipment vs Skills Balance
- **Equipment provides variety** (different weapon types, tactical options)
- **Skills provide scaling** (fundamental power progression)
- **Synergy bonuses** for matching equipment to high skills
- **Skill gates** prevent use of advanced equipment until trained

---

## 🚀 Implementation Phases

### Phase 1: Single-Player MVP (3 weeks)
**Week 1**: Tick system, ASCII renderer, 5-skill character creation
**Week 2**: Combat system, basic dungeon generation, goblin AI  
**Week 3**: Permadeath, account progression, balance tuning

### Phase 2: Content Expansion (2-3 weeks)
**Weeks 4-5**: More monsters, items, dungeon variety
**Week 6**: Advanced skills (expand to 8-12 skills)

### Phase 3: Multi-Player Foundation (3-4 weeks)  
**Weeks 7-8**: Networking architecture, session management
**Weeks 9-10**: 8-player coordination, group mechanics

### Phase 4: Full Feature Set (4+ weeks)
**Weeks 11+**: Full skill tree (30+ skills), multiple dungeons, advanced features

---

## ✅ Success Criteria

### MVP Success (Single-Player)
- ✅ Player can create character with 5 skills
- ✅ Navigate 10-level procedural dungeon  
- ✅ Fight variety of enemies with tactical combat
- ✅ Experience meaningful permadeath
- ✅ Account progression motivates continued play
- ✅ ADOM-style commands feel efficient and natural

### Long-Term Success (Multi-Player)
- ✅ 8 players can coordinate complex dungeon runs
- ✅ Skill system scales to 30+ skills without confusion
- ✅ Permadeath creates genuine stakes without frustration
- ✅ Account progression provides long-term engagement
- ✅ ASCII interface remains clear with full feature set

---

**This specification serves as the single source of truth for all game design decisions. All implementation should reference this document for consistency and clarity.**