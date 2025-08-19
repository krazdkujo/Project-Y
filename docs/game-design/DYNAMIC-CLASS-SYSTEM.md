# Dynamic Class System: Skill-Based Progression

**Document Version**: 1.0  
**Date**: 2025-08-19  
**Status**: Core System Design  
**Maintained By**: Development-Manager Agent

---

## Class System Philosophy

**No Fixed Classes** - Classes emerge dynamically from skill combinations
**Skill Prerequisites** - Meet minimum skill requirements to unlock class abilities
**Multiple Classes** - Players can qualify for multiple classes simultaneously
**Meaningful Benefits** - Classes provide unique abilities not available through skills alone
**Progressive Unlocks** - Higher skill levels unlock advanced class variants

---

## Warrior Classes

### Fighter
```yaml
Prerequisites:
  - Any Melee Weapon Skill: 25
  - Any Armor Skill: 15
  
Class_Benefits:
  - Weapon Mastery: +2 accuracy with all melee weapons
  - Combat Endurance: +20% health
  - Battle Reflexes: +1 action when surrounded by 3+ enemies
  
Unique_Abilities:
  Second_Wind:
    tick_cost: 5
    effect: "Restore 25% health once per combat"
    cooldown: Once per combat encounter
  
  Weapon_Expert:
    passive: "Can use any weapon regardless of skill requirements"
    restriction: "Weapons without proper skill have -25% effectiveness"
```

### Guardian
```yaml
Prerequisites:
  - Heavy_Armor: 30
  - Shields: 25
  - Any Melee Weapon: 20
  
Class_Benefits:
  - Fortress_Stance: Can enter immobile +50% defense mode
  - Protector: Adjacent allies take 25% less damage
  - Shield_Master: +15% block chance with any shield
  
Unique_Abilities:
  Taunt:
    tick_cost: 3
    effect: "Force all nearby enemies to attack Guardian for 5 ticks"
    cooldown: 15 ticks
  
  Shield_Wall:
    tick_cost: 0 (stance)
    effect: "Cannot move, +100% block chance, protect area behind"
    duration: Until canceled or forced to move
```

### Berserker
```yaml
Prerequisites:
  - Axes: 35
  - Two_Handed: 25
  - Light_Armor: 20 (cannot wear Heavy Armor)
  
Class_Benefits:
  - Rage_Mode: Damage taken increases damage dealt
  - Cleave_Master: All attacks hit adjacent enemies for 50% damage
  - Pain_Tolerance: Continue fighting at 0 health for 3 ticks
  
Unique_Abilities:
  Berserker_Rage:
    tick_cost: 8
    duration: 20 ticks
    effect: "+100% damage, +50% attack speed, -50% defense"
    restriction: "Cannot use items or abilities while raging"
  
  Reckless_Swing:
    tick_cost: 6
    effect: "Attack all adjacent enemies with maximum damage"
    cost: "Take 25% of damage dealt as self-damage"
```

### Duelist
```yaml
Prerequisites:
  - Swords: 40
  - Evasion: 35
  - Light_Armor: 25
  - Cannot use shields
  
Class_Benefits:
  - Perfect_Balance: +25% dodge chance
  - Riposte_Master: Counter-attacks deal +100% damage
  - Elegant_Fighter: +1 accuracy per 10 points of unused equipment weight
  
Unique_Abilities:
  Flurry:
    tick_cost: 8
    effect: "Make 3 attacks in rapid succession"
    requirement: "Must hit with first attack to continue"
  
  Dancing_Blade:
    tick_cost: 12
    effect: "Move through enemies, attacking each one passed"
    restriction: "Must end movement in empty space"
```

---

## Archer Classes

### Marksman
```yaml
Prerequisites:
  - Bows: 35
  - Perception: 25
  
Class_Benefits:
  - Eagle_Eye: +50% range for all ranged attacks
  - Steady_Aim: +25% accuracy when not moving
  - Master_Archer: Critical hits pierce through first target
  
Unique_Abilities:
  Perfect_Shot:
    tick_cost: 10
    effect: "Guaranteed critical hit at any range"
    cooldown: 20 ticks
  
  Rain_of_Arrows:
    tick_cost: 15
    effect: "Hit all enemies in target area"
    requirement: "Must have 10+ arrows"
```

### Scout
```yaml
Prerequisites:
  - Bows: 25
  - Stealth: 30
  - Survival: 25
  
Class_Benefits:
  - Camouflage: +50% stealth in natural environments
  - Track_Enemies: See enemy movement trails
  - Wilderness_Master: No movement penalties in difficult terrain
  
Unique_Abilities:
  Hunter_Shot:
    tick_cost: 6
    effect: "Arrow tracks target, +100% accuracy for 3 ticks"
    requirement: "Target must be marked first"
  
  Vanish:
    tick_cost: 8
    effect: "Become invisible for 15 ticks or until attacking"
    cooldown: 60 ticks
```

### Crossbow_Expert
```yaml
Prerequisites:
  - Crossbows: 40
  - Trap_Making: 20
  
Class_Benefits:
  - Mechanical_Mastery: -1 tick reload time for all crossbows
  - Precision_Engineer: +25% critical chance with crossbows
  - Bolt_Crafter: Can create special ammunition
  
Unique_Abilities:
  Explosive_Bolt:
    tick_cost: 5
    effect: "Bolt explodes on impact, damaging nearby enemies"
    requirement: "Must craft explosive bolts first"
  
  Rapid_Fire:
    tick_cost: 8
    effect: "Fire 5 bolts rapidly without reloading"
    cooldown: 30 ticks
```

---

## Mage Classes

### Elementalist
```yaml
Prerequisites:
  - Any 2 Elemental Magic Schools: 30 each
  - Staves: 20
  
Class_Benefits:
  - Elemental_Fusion: Can combine elemental spells for unique effects
  - Magic_Resistance: 50% resistance to magic damage
  - Spell_Efficiency: -1 tick cost for all elemental spells (minimum 1)
  
Unique_Abilities:
  Elemental_Mastery:
    tick_cost: 15
    effect: "Next spell of each known element gains +100% power"
    duration: 30 ticks or until all elements used
  
  Meteor:
    tick_cost: 40
    requirements: [Fire_Magic: 50, Earth_Magic: 30]
    effect: "Devastating area attack with knockdown"
    cooldown: 120 ticks
```

### Battle_Mage
```yaml
Prerequisites:
  - Any Magic School: 25
  - Any Melee Weapon: 30
  - Medium_Armor: 20
  
Class_Benefits:
  - Spell_Sword: Can cast spells while wielding weapons
  - Magic_Weapon: Weapon attacks gain elemental damage
  - Combat_Casting: Spells cannot be interrupted by damage
  
Unique_Abilities:
  Spell_Strike:
    tick_cost: 6
    effect: "Weapon attack triggers known spell on hit"
    mana_cost: Normal spell cost
  
  Arcane_Armor:
    tick_cost: 10
    duration: 60 ticks
    effect: "Absorb damage with mana instead of health"
    ratio: "2 mana per 1 damage"
```

### Healer
```yaml
Prerequisites:
  - Healing_Magic: 40
  - Light_Armor: 15
  
Class_Benefits:
  - Divine_Touch: Healing spells gain +50% effectiveness
  - Sanctuary: Area around healer provides damage resistance
  - Martyrdom: Can sacrifice health to restore ally mana
  
Unique_Abilities:
  Mass_Heal:
    tick_cost: 20
    effect: "Heal all party members for significant amount"
    mana_cost: 80
  
  Resurrection:
    tick_cost: 60
    effect: "Bring dead party member back to life with 25% health"
    mana_cost: 150
    cooldown: Once per dungeon
```

### Necromancer
```yaml
Prerequisites:
  - Necromancy: 35
  - Any other Magic School: 20
  
Class_Benefits:
  - Undead_Mastery: Can control undead creatures
  - Life_Drain: Damage dealt restores health
  - Death_Resistance: Immune to instant death effects
  
Unique_Abilities:
  Animate_Dead:
    tick_cost: 25
    effect: "Raise fallen enemy as temporary ally"
    duration: 120 ticks
    mana_cost: 100
  
  Soul_Burn:
    tick_cost: 12
    effect: "Damage that ignores armor and magic resistance"
    requirement: "Target must be below 50% health"
```

---

## Rogue Classes

### Assassin
```yaml
Prerequisites:
  - Stealth: 40
  - Daggers: 35
  - Light_Armor: 25
  
Class_Benefits:
  - Death_Strike: Critical hits from stealth are instant kills vs weak enemies
  - Shadow_Mastery: Can hide in any lighting conditions
  - Poison_Expert: Immune to poisons, can apply poisons to weapons
  
Unique_Abilities:
  Assassinate:
    tick_cost: 15
    effect: "Instant kill target if approaching from stealth"
    requirement: "Target must not be aware of assassin"
    failure: "If failed, deals triple normal damage"
  
  Shadow_Clone:
    tick_cost: 20
    effect: "Create illusory duplicate that mimics movements"
    duration: 30 ticks
```

### Thief
```yaml
Prerequisites:
  - Stealth: 25
  - Lockpicking: 30
  - Evasion: 25
  
Class_Benefits:
  - Master_Thief: Can attempt any lock or trap
  - Light_Fingers: Can steal items during combat
  - Escape_Artist: +100% movement speed when below 25% health
  
Unique_Abilities:
  Pickpocket:
    tick_cost: 3
    effect: "Steal random item from target without being noticed"
    requirement: "Must be adjacent and target unaware"
  
  Smoke_Bomb:
    tick_cost: 5
    effect: "Create concealing cloud, +stealth for all allies in area"
    duration: 15 ticks
```

---

## Crafting Classes

### Master_Smith
```yaml
Prerequisites:
  - Smithing: 60
  - Any Weapon Skill: 30
  
Class_Benefits:
  - Weapon_Sage: Can identify all weapon properties
  - Forge_Master: Can repair equipment during rest
  - Combat_Smith: Can modify weapons mid-combat
  
Unique_Abilities:
  Weapon_Blessing:
    tick_cost: 30
    effect: "Temporarily enhance party weapons with +25% damage"
    duration: 60 ticks
    cooldown: 120 ticks
  
  Emergency_Repair:
    tick_cost: 10
    effect: "Instantly repair broken equipment to 50% durability"
    requirement: "Must have basic materials"
```

### Alchemist
```yaml
Prerequisites:
  - Alchemy: 50
  - Any Magic School: 25
  
Class_Benefits:
  - Potion_Master: All potions have +50% effectiveness
  - Quick_Brew: Can create basic potions during combat
  - Transmutation: Can convert materials into other materials
  
Unique_Abilities:
  Volatile_Mixture:
    tick_cost: 8
    effect: "Throw explosive potion dealing area damage"
    requirement: "Must have crafted explosive previously"
  
  Perfect_Potion:
    tick_cost: 60
    effect: "Create master-grade potion with multiple effects"
    requirement: "Must have rare ingredients"
```

---

## Leadership Classes

### Paladin
```yaml
Prerequisites:
  - Healing_Magic: 25
  - Heavy_Armor: 15
  - Maces: 30
  - Leadership: 20
  
Class_Benefits:
  - Divine_Aura: Party members gain +10% accuracy and damage
  - Righteous_Fury: +100% damage vs undead and evil creatures
  - Sacred_Duty: Can use healing magic while wearing heavy armor
  
Unique_Abilities:
  Smite:
    tick_cost: 6
    effect: "Holy damage that ignores armor, bonus vs undead"
    scaling: "Damage scales with both Maces and Healing_Magic"
  
  Divine_Protection:
    tick_cost: 15
    effect: "Party gains damage immunity for 1 tick"
    cooldown: 60 ticks
    mana_cost: 100
```

### Commander
```yaml
Prerequisites:
  - Leadership: 40
  - Any Weapon Skill: 25
  - Medium_Armor: 20
  
Class_Benefits:
  - Tactical_Genius: Can see enemy intended actions 1 tick early
  - Rally_Point: Party coordination bonuses doubled
  - Strategic_Mind: Party gains extra actions during first tick of combat
  
Unique_Abilities:
  Battle_Orders:
    tick_cost: 5
    effect: "All party members can act immediately this tick"
    cooldown: 30 ticks
  
  Coordinated_Strike:
    tick_cost: 10
    effect: "All party attacks this tick gain +100% damage"
    requirement: "All party members must attack same target"
```

---

## Class Progression System

### Multi-Class Benefits
```yaml
Skill_Synergy: Having multiple classes provides cross-bonuses
  - Paladin + Healer: Healing spells gain +25% effectiveness
  - Fighter + Berserker: Can rage while maintaining weapon technique
  - Assassin + Necromancer: Death magic gains stealth bonuses

Class_Evolution: Higher skill levels unlock advanced variants
  - Fighter (50+ skills) → Champion (unique legendary abilities)
  - Elementalist (75+ magic) → Archmage (can cast any spell)
  - Master_Smith (80+ smithing) → Legendary_Crafter (create artifacts)

Prestige_Classes: Extremely high requirements for ultimate power
  Dragon_Slayer:
    requirements: [Champion, Elementalist, 90+ in primary skills]
    benefits: "Immunity to dragon attacks, +500% damage vs dragons"
```

### Class Discovery System
```yaml
Automatic_Unlock: Most classes unlock when requirements are met
Hidden_Classes: Some require specific actions or discoveries
  - Shadow_Dancer: Must master stealth kill while dancing in moonlight
  - Demon_Hunter: Must defeat specific unique demons
  - Time_Mage: Must find ancient temporal artifacts

Mentor_Teaching: NPCs can teach class-specific techniques
Class_Quests: Special challenges to unlock advanced abilities
Ancient_Knowledge: Some classes require reading specific books or scrolls
```

This dynamic class system ensures that every character build feels unique while providing clear goals for skill development. The interconnected nature of skills, abilities, and classes creates endless possibilities for character customization and progression.