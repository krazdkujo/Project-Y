# Combat System Redesign: Refined AP System with Free Basic Actions

**Document Version**: 2.0 (Complete AP Integration)  
**Date**: 2025-08-22  
**Status**: Core System Design  
**Maintained By**: Development-Manager Agent

---

## Combat Philosophy

**No Attributes** - All combat calculations use skill levels and equipment bonuses
**Turn-Based AP System** - Combat happens in 5-10 second turns with initiative order
**Free Basic Actions + AP Abilities** - Basic actions cost 0 AP, special abilities cost 1-8 AP
**Equipment Matters** - Weapon and armor choice significantly impacts effectiveness
**8-Player Coordination** - Formations, combinations, and tactical positioning

---

## Turn-Based AP System

### Turn Timing
```yaml
Standard_Turn: 5-10 seconds (8 second default)
Combat_Turn: Same as standard for consistency
Initiative_Order: Based on skills and equipment

Action Processing:
1. Calculate initiative order for all 8 players
2. Generate 2-3 AP for each player at turn start
3. Process free basic actions immediately during turn
4. Queue AP abilities for turn-end resolution
5. Resolve all AP abilities by initiative order
6. Update game state and apply all effects
7. Broadcast new state to all players
8. Advance to next turn
```

### Action Costs by Type
```yaml
Free_Basic_Actions: (0 AP, immediate execution)
  Basic_Move: Move to adjacent square
  Basic_Attack: Standard weapon attack
  Defend: Defensive stance until next turn
  Open_Door: Unlocked doors and simple interactions
  Pick_Up_Item: Retrieve items from ground
  Communicate: Quick tactical communication

Low_AP_Abilities: (1-2 AP)
  Power_Attack: Enhanced weapon attack (+50% damage)
  Precise_Strike: High accuracy attack (+25% hit chance)
  Tactical_Move: Move 2 squares with defensive bonus
  Quick_Spell: Minor magical effects
  Reload_Weapon: Special ammunition or crossbow reload
  Apply_Item: Use potions and consumables

Medium_AP_Abilities: (3-5 AP)
  Combo_Attack: Multiple strikes in sequence
  Area_Spell: Affect multiple targets
  Formation_Command: Coordinate group positioning
  Master_Strike: Weapon technique with special effects
  Switch_Equipment: Change weapon or armor quickly
  Advanced_Search: Thorough area investigation

High_AP_Abilities: (6-8 AP)
  Ultimate_Attack: Devastating single-target ability
  Master_Spell: Powerful magical effects
  Group_Coordination: Multi-player combination abilities
  Tactical_Mastery: Advanced battlefield control
  Perfect_Strike: Guaranteed critical hit with maximum damage
  Mass_Healing: Restore health to multiple allies

Utility_Actions: (Variable AP)
  Pick_Lock: 1-3 AP (skill and lock dependent)
  Rest: 2 AP (recover health/mana during combat)
  Search_Secrets: 3 AP (find hidden passages/traps)
  Disarm_Trap: 2-4 AP (complexity dependent)
```

---

## AP Combat Resolution Formulas

### Hit Chance Calculation
```typescript
// Free basic action hit chance
basic_hit_chance = base_hit_chance + weapon_accuracy + skill_bonus + situational_modifiers

base_hit_chance = 50  // 50% baseline chance to hit
weapon_accuracy = weapon.accuracy_bonus  // varies by weapon quality
skill_bonus = floor(relevant_weapon_skill / 2)  // 0-50 bonus from skill
situational_modifiers = range_penalty + formation_bonus + status_effects

// AP ability enhanced hit chance
ap_ability_hit_chance = basic_hit_chance + (ap_spent * 5) + ability_specific_bonuses

// Example calculations:
// Basic attack: 50 + 5 (sword) + 20 (40 sword skill) = 75% hit chance
// 2 AP Power Attack: 75 + (2 * 5) + 10 (ability bonus) = 95% hit chance
// 5 AP Master Strike: 75 + (5 * 5) + 25 (master bonus) = 125% (guaranteed hit + effects)
```

### Damage Calculation
```typescript
// Free basic action damage
basic_damage = weapon_base_damage + skill_damage_bonus - armor_reduction

weapon_base_damage = weapon.damage_dice  // 1d4 to 2d8 typical range
skill_damage_bonus = floor(weapon_skill / 4)  // 0-25 bonus from weapon skill
armor_reduction = armor.damage_reduction + floor(armor_skill / 5)  // 0-20 typical

// AP ability enhanced damage
ap_ability_damage = basic_damage + (ap_spent * 2) + ability_multipliers + coordination_bonuses

ability_multipliers = ability_specific_damage_mods  // varies by ability
coordination_bonuses = formation_bonus + combination_bonus  // group tactics

// Example calculations:
// Basic attack with sword: 1d6 + 10 (40 sword skill) - 4 (chain armor) = 3-12 damage
// 2 AP Power Attack: 3-12 + (2 * 2) + 3 (power bonus) = 10-19 damage
// 5 AP Combo in formation: 3-12 + (5 * 2) + 8 (combo) + 3 (formation) = 24-33 damage
```

### Critical Hit System
```typescript
// Critical hits enhanced by AP spending
critical_chance = weapon.critical_chance + floor(weapon_skill / 10) + (ap_spent * 2) + ability_bonuses

critical_multiplier = 2.0 + (weapon_skill / 100) + (ap_spent * 0.1)  // 2.0x to 3.8x multiplier
critical_damage = normal_damage * critical_multiplier

// AP abilities have higher critical potential
// Example: 60 sword skill + 4 AP ability = 14% base crit, 2.9x multiplier
// Formation coordination can add additional +2% crit chance
```

### Defense Calculations
```typescript
// Blocking with shields or weapons (can spend AP for enhanced defense)
block_chance = shield.block_chance + floor(blocking_skill / 2) + floor(shield_skill / 3) + (defensive_ap_spent * 3)
blocked_damage_reduction = 50% + floor(blocking_skill / 4) + (defensive_ap_spent * 5%)  // 50-90% damage reduction

// Dodging with evasion (free action, but can enhance with AP)
dodge_chance = base_dodge + floor(evasion_skill / 3) - armor_penalty + (defensive_ap_spent * 4)
base_dodge = 10  // 10% baseline dodge
armor_penalty = heavy_armor ? 15 : medium_armor ? 5 : 0

// Armor damage reduction (passive, always active)
armor_reduction = armor.base_protection + floor(armor_skill / 5)
// Light armor: 1-3 + 0-20 skill = 1-23 reduction
// Heavy armor: 8-12 + 0-20 skill = 8-32 reduction

// Group defensive coordination
formation_defense_bonus = active_formation ? formation.defense_bonus : 0
group_protection = adjacent_allies_with_shields * 2  // mutual protection
```

---

## Equipment Impact System

### Weapon Categories & Effects
```yaml
Light_Weapons: (Daggers, Short Swords)
  accuracy_bonus: +10
  damage: 1d4 to 1d6
  critical_chance: +5%
  special: Can be dual-wielded, +stealth attack bonus

Medium_Weapons: (Swords, Maces, Axes)
  accuracy_bonus: +5
  damage: 1d6 to 1d8
  critical_chance: +3%
  special: Balanced stats, most versatile

Heavy_Weapons: (Great Swords, War Hammers)
  accuracy_bonus: +0
  damage: 1d10 to 2d6
  critical_chance: +2%
  special: High damage, cleave potential, requires Two_Handed skill

Ranged_Weapons: (Bows, Crossbows)
  accuracy_bonus: +8 (at optimal range)
  damage: 1d6 to 1d8
  critical_chance: +4%
  special: Range advantages, ammunition required

Magic_Weapons: (Staves, Wands)
  accuracy_bonus: +3
  damage: 1d4 (physical) + spell bonuses
  critical_chance: +1%
  special: Enhance spell damage and reduce mana costs
```

### Armor Categories & Effects
```yaml
Light_Armor: (Leather, Cloth)
  damage_reduction: 1-3
  evasion_penalty: 0
  stealth_penalty: 0
  movement_bonus: +1 square per tick
  special: Allows full evasion and stealth effectiveness

Medium_Armor: (Chain, Scale)
  damage_reduction: 4-7
  evasion_penalty: -3
  stealth_penalty: -5
  movement_penalty: 0
  special: Balanced protection and mobility

Heavy_Armor: (Plate, Full Plate)
  damage_reduction: 8-15
  evasion_penalty: -8
  stealth_penalty: -15
  movement_penalty: -1 square per tick
  special: Maximum protection, enables certain defensive abilities

Shields: (Buckler to Tower Shield)
  block_chance: +10% to +25%
  damage_reduction_when_blocking: +20% to +50%
  evasion_penalty: -2 to -8
  special: Enable shield-specific abilities like Shield Bash
```

### Weapon Quality Tiers
```yaml
Basic: No bonuses, widely available
  example: "Iron Sword" - 1d6 damage, +5 accuracy

Fine: +1 accuracy, +10% durability
  example: "Steel Sword" - 1d6 damage, +6 accuracy

Masterwork: +2 accuracy, +1 damage, +25% durability
  example: "Masterwork Steel Sword" - 1d6+1 damage, +7 accuracy

Enchanted: Variable magic bonuses
  example: "Flaming Sword" - 1d6+1 damage, +7 accuracy, +1d4 fire damage

Legendary: Major bonuses, unique properties
  example: "Dragonbane" - 1d8+2 damage, +10 accuracy, +2d6 vs dragons

Artifact: Unique items with special abilities
  example: "Excalibur" - 2d6+3 damage, +15 accuracy, grants Smite ability
```

---

## Tactical Combat Elements

### Positioning System
```yaml
Melee_Range: Adjacent squares only
  - Can make weapon attacks
  - Can use shield abilities
  - Vulnerable to area effects
  - Can protect ranged allies

Ranged_Optimal: 3-8 squares distance
  - Full accuracy with ranged weapons
  - Safe from most melee attacks
  - Can target specific enemies
  - Requires clear line of sight

Ranged_Extended: 9+ squares distance
  - Reduced accuracy (-2 per square beyond 8)
  - Maximum safety from melee
  - Limited target selection
  - May require high ground

Spell_Range: Varies by spell
  - Touch spells: Adjacent only
  - Projectile spells: Line of sight required
  - Area spells: Can target squares without line of sight
  - Self spells: No range limit
```

### 8-Player Group Tactics
```yaml
Formation_Fighting:
  Tank_Line: (2-3 players) Front line with heavy armor and shields
    - Uses defensive AP abilities to protect group
    - Coordinates blocking and crowd control
    - Can spend AP on formation commands
    - Shares defensive bonuses with adjacent allies

  Damage_Dealers: (2-3 players) Behind front line
    - Medium armor for AP generation balance
    - Coordinates combo attacks and AP abilities
    - Can flank and use tactical positioning
    - Benefits from formation accuracy bonuses

  Support_Casters: (2-3 players) Back line protection
    - Light armor for maximum AP generation
    - Coordinates area spells and group buffs
    - Uses high-AP abilities for maximum effect
    - Protected by formation defensive bonuses

AP_Coordination_Bonuses:
  - Adjacent allies provide +1 accuracy per ally (max +3)
  - Flanking coordination provides +2 accuracy and +1 AP generation
  - Protecting casting allies provides +1 AP generation for both
  - Coordinated AP abilities get 25% damage bonus when synchronized
  - Formation maintenance grants +1 AP per turn for all members
```

### Environmental Factors
```yaml
Terrain_Modifiers:
  High_Ground: +2 accuracy, +1 damage for ranged attacks
  Difficult_Terrain: +1 tick to all movement actions
  Water: -3 accuracy for melee, -5 for ranged
  Darkness: -5 accuracy unless Perception skill compensates
  Narrow_Corridors: Prevent flanking, limit group tactics

Interactive_Elements:
  Doors: Can be opened/closed to control enemy movement
  Furniture: Can be used for cover (-2 ranged accuracy to hit)
  Traps: Can be triggered by movement or combat
  Destructible_Objects: Can be destroyed to change battlefield
```

---

## AP Combat Balance Framework

### Power Scaling by Skill Level
```yaml
Novice (0-24): Basic competency
  - 50-60% hit chance with free basic attacks
  - 1-8 damage per basic attack typically
  - Access to 1-2 AP abilities only
  - 2 AP generation per turn
  - Vulnerable to coordinated opponents

Competent (25-49): Reliable effectiveness
  - 65-80% hit chance with basic attacks
  - 5-12 damage per basic attack typically
  - Access to 1-4 AP abilities
  - 2-3 AP generation per turn
  - Can participate effectively in group tactics

Skilled (50-74): Superior performance
  - 80-95% hit chance with basic attacks
  - 8-16 damage per basic attack typically
  - Access to 1-6 AP abilities
  - 3 AP generation per turn
  - Can lead tactical formations

Expert (75-89): Elite capability
  - 90-100% hit chance with basic attacks
  - 12-20 damage per basic attack typically
  - Access to 1-7 AP abilities
  - 3-4 AP generation per turn
  - Can coordinate complex group abilities

Master (90-100): Legendary prowess
  - Guaranteed hits with basic attacks
  - 15-25+ damage per basic attack typically
  - Access to all 1-8 AP abilities
  - 4-5 AP generation per turn
  - Can execute devastating AP combinations
```

### Equipment vs Skill vs AP Balance
```yaml
Equipment_Dependency: 30% of combat effectiveness
  - Good equipment enhances both basic actions and AP abilities
  - Legendary equipment provides unique AP abilities
  - Quality weapons reduce AP costs for certain abilities

Skill_Dependency: 50% of combat effectiveness
  - Skill determines AP ability access and effectiveness
  - High skill increases AP generation rates
  - Master skill levels unlock ultimate 8 AP abilities

AP_Management: 20% of combat effectiveness
  - Strategic AP spending vs saving creates tactical depth
  - Coordination timing with other players multiplies effectiveness
  - Resource management across multiple turns affects outcomes

Synergy_Bonuses: Equipment + Skill + AP combinations
  - Matching high skill with excellent equipment reduces AP costs
  - Coordinated AP spending in formations creates devastating effects
  - Master-level players can chain multiple AP abilities effectively
  - Group coordination abilities require multiple players and high AP investment
```

This AP combat system creates tactical depth through turn-based coordination, AP resource management, and 8-player formations while ensuring that character development (skills), equipment choices, and strategic AP spending all matter significantly in determining combat outcomes. The balance between free basic actions and AP abilities provides immediate tactical options while maintaining strategic resource management depth.