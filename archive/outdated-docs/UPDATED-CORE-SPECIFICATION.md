# Updated Core Game Specification: Tactical Turn-Based ASCII Roguelike

**Document Version**: 5.0 (Complete AP System Integration)  
**Date**: 2025-08-22  
**Status**: Authoritative Design Document  
**Maintained By**: Development-Manager Agent

---

## Game Vision

A **tactical turn-based ASCII roguelike** featuring **34-skill system**, **8-player cooperative gameplay**, and **Refined AP System with Free Basic Actions**. Players coordinate using initiative-based turns (5-10 seconds) with free basic actions (movement, basic attacks, defense) and strategic AP special abilities (1-8 AP cost). Features group-only permadeath, dynamic class emergence, and guild-based resource sharing with 8-week implementation timeline.

### Core Pillars
1. **Refined AP Combat** - Free basic actions (0 AP) with AP-based special abilities (1-8 AP) for tactical depth
2. **Skill-Only Progression** - No attributes, everything derived from 34 skills
3. **Turn-Based Coordination** - 8-player parties with 5-10 second turns and initiative order
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

## Refined AP Combat System

### Turn-Based Action Economy
**5-10 Second Turns** - All players act within turn window with initiative order
**Free Basic Actions + AP Abilities** - Balanced action economy:

```yaml
Free_Basic_Actions: (0 AP, immediate execution)
  Move: Move to adjacent square
  Basic_Attack: Standard weapon attack
  Defend: Defensive stance until next turn
  Interact: Open doors, pick up items

Low_AP_Abilities: (1-2 AP)
  Power_Attack: Enhanced weapon attack (+50% damage)
  Precise_Strike: High accuracy attack (+25% hit chance)
  Quick_Spell: Minor magical effects
  Tactical_Move: Move 2 squares with defensive bonus

Medium_AP_Abilities: (3-5 AP)
  Combo_Attack: Multiple strikes in sequence
  Area_Spell: Affect multiple targets
  Formation_Command: Coordinate group positioning
  Master_Strike: Weapon technique with special effects

High_AP_Abilities: (6-8 AP)
  Ultimate_Attack: Devastating single-target ability
  Master_Spell: Powerful magical effects
  Group_Coordination: Multi-player combination abilities
  Tactical_Mastery: Advanced battlefield control
```

### AP Combat Resolution (Skills + Equipment Only)
```typescript
// Free basic action hit chance
basic_hit_chance = 50 + weapon_accuracy + floor(weapon_skill/2) + situational_mods

// AP ability hit chance (enhanced)
ap_ability_hit_chance = basic_hit_chance + (ap_spent * 5) + ability_specific_bonuses

// Free basic damage
basic_damage = weapon_base_damage + floor(weapon_skill/4) - armor_reduction

// AP ability damage (enhanced)
ap_ability_damage = basic_damage + (ap_spent * 2) + ability_multipliers

// Critical hit system
critical_chance = weapon_crit_chance + floor(weapon_skill/10) + (ap_spent * 2)
critical_multiplier = 2.0 + (weapon_skill/100) + (ap_spent * 0.1)

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

### Phase 1: Core AP Systems (Weeks 1-2)
1. Turn-based AP system with 5-10 second turns
2. Free basic actions (movement, basic attack, defense)
3. 34-skill system with AP ability integration
4. Initiative system for 8-player turn order

### Phase 2: 8-Player Coordination (Weeks 3-4)
1. AP ability system with 1-8 AP costs
2. Group coordination mechanics
3. Formation system with AP upkeep
4. Equipment-based combat (no attributes)

### Phase 3: Advanced Systems (Weeks 5-6)
1. Dynamic class emergence from skill combinations
2. Group-only permadeath with revival mechanics
3. Guild base system with shared storage
4. Complex AP ability combinations

### Phase 4: Polish & Integration (Weeks 7-8)
1. Advanced tactical AI for turn-based combat
2. Complete UI for 8-player coordination
3. Performance optimization for turn processing
4. Quality assurance and balance testing

---

## Success Criteria

### Core Functionality
- [x] 34 skills working with AP ability integration
- [ ] Turn-based combat with free actions and AP abilities
- [ ] Equipment-driven effectiveness (no attributes)
- [ ] Dynamic class unlocking based on skills
- [ ] Group-only permadeath with revival mechanics
- [ ] Guild base with shared storage and facilities

### Gameplay Experience
- [ ] 8 players can coordinate turn-based tactical combat
- [ ] Individual builds feel unique through skill/AP ability combinations
- [ ] Group coordination through formations and combined abilities
- [ ] Guild systems support collaborative play styles
- [ ] Progression feels meaningful across character deaths

---

**This specification represents the complete Refined AP System integration. All implementation should reference this document, the REFINED-AP-SYSTEM-WITH-FREE-ACTIONS.md, and the 34-SKILL-AP-INTEGRATION-GUIDE.md for full implementation guidance.**