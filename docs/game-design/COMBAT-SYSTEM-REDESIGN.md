# Combat System Redesign: Skills + Equipment Only

**Document Version**: 1.0  
**Date**: 2025-08-19  
**Status**: Core System Design  
**Maintained By**: Development-Manager Agent

---

## Combat Philosophy

**No Attributes** - All combat calculations use skill levels and equipment bonuses
**Real-Time Ticks** - Combat happens in real-time with 2-second tick intervals
**Variable Action Costs** - Different actions require different numbers of ticks
**Equipment Matters** - Weapon and armor choice significantly impacts effectiveness
**Tactical Positioning** - Location and coordination affect combat outcomes

---

## Real-Time Tick System

### Tick Timing
```yaml
Standard_Tick: 2 seconds
Combat_Tick: 2 seconds (same as standard for consistency)
Emergency_Tick: 2 seconds (no speed changes, encourages preparation)

Action Processing:
1. Collect all queued actions at tick boundary
2. Validate actions against current game state
3. Resolve actions simultaneously by type priority
4. Update game state and positions
5. Apply damage, effects, and status changes
6. Broadcast new state to all players
7. Schedule next tick
```

### Action Costs by Type
```yaml
Movement:
  Basic_Move: 1 tick (move to adjacent square)
  Running: 1 tick (move 2 squares, +25% noise)
  Careful_Move: 2 ticks (move 1 square silently)

Basic_Combat:
  Weapon_Attack: 2 ticks (standard melee/ranged attack)
  Unarmed_Attack: 1 tick (weak damage, no weapon skill bonus)
  Block: 0 ticks (continuous defensive stance)
  Dodge: 0 ticks (reactive evasion attempt)

Advanced_Combat:
  Power_Attack: 3-4 ticks (high damage, weapon dependent)
  Precise_Strike: 3 ticks (high accuracy, lower damage)
  Combo_Attack: 4-6 ticks (multiple strikes)
  Charge_Attack: 2-5 ticks (movement + attack, distance dependent)

Abilities:
  Simple_Abilities: 1-3 ticks (basic weapon techniques)
  Complex_Abilities: 5-12 ticks (advanced techniques)
  Ultimate_Abilities: 15-30 ticks (master techniques, long vulnerability)

Magic:
  Cantrips: 1-2 ticks (minor spells)
  Basic_Spells: 3-8 ticks (standard spells)
  Advanced_Spells: 10-20 ticks (powerful spells)
  Master_Spells: 25-50 ticks (devastating magic, extreme vulnerability)

Items:
  Drink_Potion: 1 tick (quick consumption)
  Apply_Item: 2 ticks (use complex items)
  Reload_Weapon: 2-4 ticks (crossbow, special ammo)
  Switch_Equipment: 3 ticks (change weapon/armor piece)

Utility:
  Search: 3 ticks (look for hidden objects)
  Open_Door: 1 tick (unlocked door)
  Pick_Lock: 5-15 ticks (skill and lock dependent)
  Rest: 10 ticks (recover small amount of health/mana)
```

---

## Combat Resolution Formulas

### Hit Chance Calculation
```typescript
// No attributes - pure skill + equipment system
hit_chance = base_hit_chance + weapon_accuracy + skill_bonus + situational_modifiers

base_hit_chance = 50  // 50% baseline chance to hit
weapon_accuracy = weapon.accuracy_bonus  // varies by weapon quality
skill_bonus = floor(relevant_weapon_skill / 2)  // 0-50 bonus from skill
situational_modifiers = range_penalty + size_modifier + status_effects

// Example calculations:
// Novice: 50 + 5 (basic sword) + 10 (20 sword skill) = 65% hit chance
// Expert: 50 + 15 (master sword) + 40 (80 sword skill) = 105% (guaranteed hit)
```

### Damage Calculation
```typescript
// Pure skill + equipment damage
damage = weapon_base_damage + skill_damage_bonus + ability_bonuses - armor_reduction

weapon_base_damage = weapon.damage_dice  // 1d4 to 2d8 typical range
skill_damage_bonus = floor(weapon_skill / 4)  // 0-25 bonus from weapon skill
ability_bonuses = active_ability_damage_mods  // from special attacks
armor_reduction = armor.damage_reduction + floor(armor_skill / 5)  // 0-20 typical

// Example calculations:
// Novice with dagger: 1d4 + 5 (20 daggers) - 2 (leather armor) = 4-7 damage
// Master with great sword: 2d6 + 20 (80 swords) - 8 (plate + skill) = 9-18 damage
```

### Critical Hit System
```typescript
// Critical hits based on skill and weapon
critical_chance = weapon.critical_chance + floor(weapon_skill / 10) + ability_bonuses

critical_multiplier = 2.0 + (weapon_skill / 100)  // 2.0x to 3.0x multiplier
critical_damage = normal_damage * critical_multiplier

// High skill weapons become very dangerous on crits
// Example: 80 sword skill = 2.8x critical multiplier
```

### Defense Calculations
```typescript
// Blocking with shields or weapons
block_chance = shield.block_chance + floor(blocking_skill / 2) + floor(shield_skill / 3)
blocked_damage_reduction = 50% + floor(blocking_skill / 4)  // 50-75% damage reduction

// Dodging with evasion
dodge_chance = base_dodge + floor(evasion_skill / 3) - armor_penalty
base_dodge = 10  // 10% baseline dodge
armor_penalty = heavy_armor ? 15 : medium_armor ? 5 : 0

// Armor damage reduction
armor_reduction = armor.base_protection + floor(armor_skill / 5)
// Light armor: 1-3 + 0-20 skill = 1-23 reduction
// Heavy armor: 8-12 + 0-20 skill = 8-32 reduction
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

### Group Tactics
```yaml
Formation_Fighting:
  Tank_Position: Front line with heavy armor and shields
    - Attracts enemy attention
    - Blocks corridors and doorways
    - Protects vulnerable allies
    - Uses defensive abilities

  Damage_Dealers: Behind front line
    - Medium armor for mobility
    - Weapon specialists
    - Uses offensive abilities
    - Can flank when opportunity arises

  Support_Casters: Back line protection
    - Light armor for maximum spell effectiveness
    - Long casting times require protection
    - Provides buffs, healing, and area damage
    - Most vulnerable to enemy breakthrough

Coordination_Bonuses:
  - Adjacent allies provide +1 accuracy (fighting together)
  - Flanking enemies (attacking from opposite sides) provides +2 accuracy
  - Protecting a casting ally provides shared experience bonuses
  - Coordinated retreats prevent individual targeting
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

## Combat Balance Framework

### Power Scaling by Skill Level
```yaml
Novice (0-24): Basic competency
  - 50-60% hit chance with appropriate weapons
  - 1-8 damage per attack typically
  - Access to basic abilities only
  - Vulnerable to skilled opponents

Competent (25-49): Reliable effectiveness
  - 65-80% hit chance with good weapons
  - 5-12 damage per attack typically
  - Access to intermediate abilities
  - Can hold their own in most fights

Skilled (50-74): Superior performance
  - 80-95% hit chance with quality weapons
  - 8-16 damage per attack typically
  - Access to advanced abilities
  - Dangerous opponent for most enemies

Expert (75-89): Elite capability
  - 90-100% hit chance with excellent weapons
  - 12-20 damage per attack typically
  - Access to master abilities
  - Can single-handedly change battle outcomes

Master (90-100): Legendary prowess
  - Guaranteed hits with legendary weapons
  - 15-25+ damage per attack typically
  - Access to ultimate abilities
  - Near-invincible in their specialty
```

### Equipment vs Skill Balance
```yaml
Equipment_Dependency: 40% of combat effectiveness
  - Good equipment can compensate for moderate skill gaps
  - Legendary equipment makes significant differences
  - Quality weapons are force multipliers for skill

Skill_Dependency: 60% of combat effectiveness
  - Skill determines ability access and effectiveness
  - High skill makes any equipment more effective
  - Master skill levels can overcome equipment disadvantages

Synergy_Bonuses: Equipment + Skill combinations
  - Matching high skill with excellent equipment creates devastating combinations
  - Mismatched equipment (using daggers with sword skills) reduces effectiveness
  - Certain abilities require both skill AND equipment prerequisites
```

This combat system creates tactical depth through positioning, timing, and resource management while ensuring that both character development (skills) and equipment choices matter significantly in determining combat outcomes.