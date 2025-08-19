# Updated Core Game Specification: Real-Time Tactical ASCII Roguelike

**Document Version**: 3.0 (Complete Redesign)  
**Date**: 2025-08-19  
**Status**: Authoritative Design Document  
**Maintained By**: Development-Manager Agent

---

## Game Vision

A **real-time tactical ASCII roguelike** featuring **30+ skill system**, **8-player cooperative gameplay**, and **equipment-driven combat**. Players coordinate using 2-second tick intervals, with all character effectiveness derived from skills and equipment rather than attributes. Features group-only permadeath, dynamic class emergence, and guild-based resource sharing.

### Core Pillars
1. **Real-Time Tactical Combat** - 2-second ticks with variable action costs
2. **Skill-Only Progression** - No attributes, everything derived from 30+ skills
3. **Group Coordination** - 8-player parties with mandatory group progression
4. **Equipment-Driven Effectiveness** - Skills + equipment determine all capabilities
5. **Guild-Based Cooperation** - Shared storage, direct trading, and collaborative progression

---

## Character System

### No Attributes Philosophy
**Everything Skill-Based** - No STR, DEX, CON, INT, WIS, CHA
**Equipment Synergy** - Effectiveness comes from skill + equipment combinations
**Dynamic Classes** - Classes emerge from skill prerequisites, not selection
**Account Progression** - Advancement persists across character deaths

### Complete Skill System (34 Skills)
```yaml
Weapon_Skills: (7 skills)
  - Swords: Balanced weapons with good accuracy and damage
  - Maces: Crushing weapons effective against armor  
  - Axes: High damage weapons with cleave potential
  - Daggers: Fast, precise weapons for stealth attacks
  - Staves: Magic-focused weapons with spell enhancement
  - Bows: Precise ranged weapons with good range
  - Crossbows: Powerful ranged weapons with slow reload

Armor_Skills: (4 skills)
  - Light_Armor: Minimal protection, maximum mobility
  - Medium_Armor: Balanced protection and mobility
  - Heavy_Armor: Maximum protection, reduced mobility
  - Shields: Active blocking and protection enhancement

Magic_Schools: (6 skills)
  - Fire_Magic: Offensive magic with burning and explosion
  - Ice_Magic: Control magic with slowing and freezing
  - Lightning_Magic: Fast magic with chain effects and stunning
  - Earth_Magic: Defensive magic with barriers and area control
  - Healing_Magic: Restoration magic for health and status effects
  - Necromancy: Dark magic with life drain and undead control

Combat_Skills: (4 skills)
  - Evasion: Avoiding attacks through speed and agility
  - Blocking: Active defense with weapons and shields
  - Dual_Wielding: Fighting with weapons in both hands
  - Two_Handed: Mastery of large weapons requiring both hands

Crafting_Skills: (5 skills)
  - Smithing: Creating and repairing metal weapons and armor
  - Alchemy: Creating potions, poisons, and magical compounds
  - Enchanting: Imbuing items with magical properties
  - Cooking: Preparing food with beneficial effects
  - Trap_Making: Creating and disarming mechanical devices

Passive_Skills: (8 skills)
  - Stealth: Moving unseen and unheard
  - Perception: Detecting hidden things and danger
  - Survival: Wilderness skills and environmental resistance
  - Athletics: Physical prowess and movement abilities
  - Leadership: Inspiring and coordinating group actions
  - Lockpicking: Opening locks and mechanical devices
  - Intimidation: Frightening enemies and controlling situations
  - Diplomacy: Peaceful resolution and social interaction
```

---

## Real-Time Combat System

### Tick-Based Action Economy
**2-Second Tick Intervals** - All actions resolve simultaneously every 2 seconds
**Variable Action Costs** - Different actions require different tick amounts:

```yaml
Movement_Actions:
  Basic_Move: 1 tick (move to adjacent square)
  Running: 1 tick (move 2 squares, +25% noise)
  Careful_Move: 2 ticks (move silently)

Combat_Actions:
  Basic_Attack: 2 ticks (standard weapon attack)
  Power_Attack: 3-4 ticks (high damage, weapon dependent)
  Block/Dodge: 0 ticks (continuous defensive stance)
  Combo_Attack: 4-6 ticks (multiple strikes)

Ability_Actions:
  Simple_Abilities: 1-3 ticks (basic weapon techniques)
  Complex_Abilities: 5-12 ticks (advanced techniques)
  Ultimate_Abilities: 15-30 ticks (master techniques, long vulnerability)

Magic_Actions:
  Cantrips: 1-2 ticks (minor spells)
  Basic_Spells: 3-8 ticks (standard spells)
  Advanced_Spells: 10-20 ticks (powerful spells)
  Master_Spells: 25-50 ticks (devastating magic, extreme vulnerability)
```

### Combat Resolution (Skills + Equipment Only)
```typescript
// Hit chance calculation
hit_chance = 50 + weapon_accuracy + floor(weapon_skill/2) + situational_mods

// Damage calculation
damage = weapon_base_damage + floor(weapon_skill/4) + ability_bonuses - armor_reduction

// Critical hit system
critical_chance = weapon_crit_chance + floor(weapon_skill/10) + ability_bonuses
critical_multiplier = 2.0 + (weapon_skill/100)  // 2.0x to 3.0x

// Defense calculations
block_chance = shield_block_chance + floor(blocking_skill/2) + floor(shield_skill/3)
dodge_chance = 10 + floor(evasion_skill/3) - armor_penalty
```

---

## Abilities System

### Skill-Gated Abilities
**Progressive Unlocks** - Abilities unlock when skill requirements are met
**Multi-Skill Requirements** - Complex abilities require multiple skills
**Equipment Dependencies** - Some abilities require or forbid specific equipment

### Example Abilities
```yaml
Combat_Abilities:
  Riposte:
    requirements: [Evasion: 25, Swords: 30, No Heavy Armor]
    effect: "Counter-attack when dodging melee attack"
    tick_cost: 0 (reactive)

  Smite:
    requirements: [Healing_Magic: 25, Maces: 10]
    effect: "Holy damage that ignores armor, extra vs undead"
    tick_cost: 6

  Perfect_Shot:
    requirements: [Bows: 35, Perception: 25]
    effect: "Guaranteed critical hit at any range"
    tick_cost: 10

Magic_Abilities:
  Meteor:
    requirements: [Fire_Magic: 50, Earth_Magic: 30]
    effect: "Devastating area attack with knockdown"
    tick_cost: 40

  Mass_Heal:
    requirements: [Healing_Magic: 40]
    effect: "Heal all party members significantly"
    tick_cost: 20
```

---

## Dynamic Class System

### Class Emergence
**No Fixed Classes** - Classes emerge from skill combinations
**Multiple Classes** - Players can qualify for multiple classes simultaneously
**Unique Benefits** - Classes provide abilities not available through skills alone

### Example Classes
```yaml
Paladin:
  requirements: [Healing_Magic: 25, Heavy_Armor: 15, Maces: 30, Leadership: 20]
  benefits: "Divine aura, righteous fury vs undead, sacred duty"
  unique_abilities: ["Smite", "Divine Protection"]

Assassin:
  requirements: [Stealth: 40, Daggers: 35, Light_Armor: 25]
  benefits: "Death strike, shadow mastery, poison expert"
  unique_abilities: ["Assassinate", "Shadow Clone"]

Elementalist:
  requirements: [Any 2 Elemental Magic: 30 each, Staves: 20]
  benefits: "Elemental fusion, magic resistance, spell efficiency"
  unique_abilities: ["Elemental Mastery", "Meteor"]
```

---

## Group-Only Permadeath System

### Death States
```yaml
Unconscious: (0 health, revivable)
  duration: 10 ticks without intervention
  revival: First aid from any party member (5 ticks)
  penalty: None if revived in time

Dead: (negative health threshold)
  duration: Permanent until revived
  revival: Resurrection magic or abilities required
  penalty: -25% health for remainder of dungeon

Soul_Departed: (dead 60+ ticks)
  duration: Until special restoration
  revival: Rare items or powerful magic at shrines
  penalty: -50% health, -25% skills for remainder
```

### Group Death Escalation
```yaml
1-3_Players_Dead: Standard revival mechanics
4-6_Players_Dead: Retreat options become available
7_Players_Dead: Emergency evacuation countdown
8_Players_Dead: TOTAL PARTY WIPE - True permadeath
```

---

## Dungeon Progression System

### Group Coordination Requirements
**Mandatory Group Progression** - All players advance floors together
**Difficulty Selection** - Party votes on challenge level before entry
**Abandonment Penalties** - Leaving party results in 75% loot loss

### Difficulty Scaling
```yaml
Easy: -25% monster stats, +25% loot quality reduction
Normal: Base monster stats, base loot quality
Hard: +50% monster stats, +50% loot quality
Elite: +100% monster stats, +100% loot quality
Nightmare: +200% monster stats, +300% loot quality
```

### Progressive Rewards
**Depth Bonuses** - Deeper floors provide better loot
**Boss Encounters** - Final floor features challenging boss with best rewards
**Group Incentives** - Bonuses for completing dungeons with full party alive

---

## Guild Base System

### 8-Player Cooperation Hub
```yaml
Guild_Vault:
  - Unlimited shared storage for all party equipment
  - Automatic categorization by type and quality
  - Access control: All 8 party members can deposit/withdraw
  - Contribution tracking for fair distribution

Private_Chambers:
  - 50 slots private storage per player
  - Trophy display for achievements and rare items
  - Meditation bonus: 25% faster skill training when resting
  - Respawn location after permadeath

Crafting_Stations:
  - Collaborative workshops for smithing, alchemy, enchanting
  - 25% success rate bonus and access to rare materials
  - Multiple players can contribute materials and skills
  - Shared recipes and knowledge base

Direct_Trading:
  - Player-to-player exchanges with trade windows
  - Party pool system for consumables and emergency items
  - Inter-party trading with other 8-player groups
  - Simple gold-only economy with NPC vendors
```

### Guild Progression
**Collective Resources** - Party shares materials and equipment efficiently
**Skill Specialization** - Players develop complementary expertise
**Group Projects** - Create legendary items through collaborative crafting

---

## ASCII Interface

### Input System
**Arrow Keys + Numpad** - Accessible movement (no hjkl requirement)
**Function Key Abilities** - F1-F12 for quick-cast abilities
**Context-Sensitive Actions** - Same keys perform different actions based on situation

### Visual Layout
```
┌─── DUNGEON MAP (60x20) ────┬─── STATUS (20x20) ───┐
│ ##################         │ HP: 45/50            │
│ #................#         │ Skills:              │
│ #....@...........#         │ Swords: 45           │
│ #........g.......#         │ Heavy_Armor: 32      │
│ #................#         │ Healing_Magic: 28    │
│ ##################         │ Active Class:        │
│                            │ Fighter              │
├────────────────────────────┴──────────────────────┤
│ > Barbarian attacks orc for 8 damage!             │
│ > Mage begins casting fireball (15 ticks)         │
│ > Ranger shoots goblin for 6 damage               │
└────────────────────────────────────────────────────┘
```

---

## Implementation Priority

### Phase 1: Core Systems (Weeks 1-4)
1. Real-time tick system with 2-second intervals
2. 30+ skill system with training mechanics  
3. Equipment-based combat (no attributes)
4. Basic abilities unlocking system

### Phase 2: Advanced Features (Weeks 5-8)
1. Dynamic class emergence system
2. Group-only permadeath mechanics
3. Dungeon progression with difficulty selection
4. Guild base system with shared storage

### Phase 3: Cooperation & Polish (Weeks 9-12)
1. Complete guild coordination systems
2. Advanced collaborative crafting
3. Complex ability combinations
4. Full UI polish and optimization

---

## Success Criteria

### Core Functionality
- [x] 30+ skills working with use-based training
- [ ] Real-time combat with variable tick costs
- [ ] Equipment-driven effectiveness (no attributes)
- [ ] Dynamic class unlocking based on skills
- [ ] Group-only permadeath with revival mechanics
- [ ] Guild base with shared storage and facilities

### Gameplay Experience
- [ ] 8 players can coordinate complex real-time tactics
- [ ] Individual builds feel unique through skill/ability combinations
- [ ] Group coordination is essential for survival
- [ ] Guild systems support collaborative play styles
- [ ] Progression feels meaningful across character deaths

---

**This specification represents the complete redesigned game systems. All implementation should reference this document and the detailed system specifications for full implementation guidance.**