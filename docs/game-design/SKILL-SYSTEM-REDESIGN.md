# Comprehensive Skill System: 30+ Skills

**Document Version**: 1.0  
**Date**: 2025-08-19  
**Status**: Core System Design  
**Maintained By**: Development-Manager Agent

---

## Design Philosophy

**No Attributes, Only Skills** - Everything derives from skill levels and equipment
**Use-Based Training** - Skills improve through relevant actions
**Interconnected Systems** - Skills unlock abilities, classes, and equipment access
**Progressive Mastery** - 0-100 scale with diminishing returns at high levels

---

## Weapon Skills (7 Skills)

### Melee Weapons
```yaml
Swords:
  description: "Balanced weapons with good accuracy and damage"
  equipment: [Short Sword, Long Sword, Bastard Sword, Great Sword]
  abilities_unlocked: [Riposte, Blade Dance, Perfect Strike]
  training: Successful attacks and parries

Maces:
  description: "Crushing weapons effective against armor"
  equipment: [Club, Mace, War Hammer, Great Maul]
  abilities_unlocked: [Smite, Armor Crush, Devastating Blow]
  training: Successful attacks against armored targets

Axes:
  description: "High damage weapons with cleave potential"
  equipment: [Hatchet, Battle Axe, War Axe, Great Axe]
  abilities_unlocked: [Cleave, Berserker Rage, Execution]
  training: Successful attacks and critical hits

Daggers:
  description: "Fast, precise weapons for stealth attacks"
  equipment: [Knife, Dagger, Stiletto, Assassin Blade]
  abilities_unlocked: [Backstab, Poison Strike, Shadow Step]
  training: Stealth attacks and rapid strikes

Staves:
  description: "Magic-focused weapons with spell enhancement"
  equipment: [Quarterstaff, Magic Staff, Arcane Rod, Crystal Staff]
  abilities_unlocked: [Spell Focus, Mana Shield, Arcane Strike]
  training: Casting spells and magical combat
```

### Ranged Weapons
```yaml
Bows:
  description: "Precise ranged weapons with good range"
  equipment: [Short Bow, Long Bow, Composite Bow, Elven Bow]
  abilities_unlocked: [Aimed Shot, Multi-Shot, Piercing Arrow]
  training: Successful ranged attacks and target practice

Crossbows:
  description: "Powerful ranged weapons with slow reload"
  equipment: [Light Crossbow, Heavy Crossbow, Repeating Crossbow]
  abilities_unlocked: [Armor Piercing, Rapid Reload, Explosive Bolt]
  training: Successful attacks and reloading actions
```

---

## Armor Skills (4 Skills)

```yaml
Light_Armor:
  description: "Minimal protection with maximum mobility"
  equipment: [Leather, Studded Leather, Chain Shirt, Elven Chain]
  effects: +Evasion, +Movement Speed, -Stealth Penalty
  abilities_unlocked: [Dodge Roll, Acrobatics, Silent Movement]
  training: Taking damage while wearing light armor

Medium_Armor:
  description: "Balanced protection and mobility"
  equipment: [Chain Mail, Scale Mail, Breastplate, Reinforced Leather]
  effects: Moderate Protection, Balanced Mobility
  abilities_unlocked: [Deflection, Armor Mastery, Battle Readiness]
  training: Combat while wearing medium armor

Heavy_Armor:
  description: "Maximum protection with reduced mobility"
  equipment: [Splint Mail, Plate Mail, Full Plate, Dwarven Plate]
  effects: +Maximum Protection, -Movement Speed, -Evasion
  abilities_unlocked: [Fortress Stance, Immovable Object, Armor Expertise]
  training: Taking heavy damage while wearing heavy armor

Shields:
  description: "Active blocking and protection enhancement"
  equipment: [Buckler, Round Shield, Kite Shield, Tower Shield]
  effects: +Block Chance, +Active Defense
  abilities_unlocked: [Shield Bash, Shield Wall, Perfect Block]
  training: Successfully blocking attacks
```

---

## Magic Schools (6 Skills)

```yaml
Fire_Magic:
  description: "Offensive magic focused on burning and explosion"
  spells: [Spark, Fireball, Flame Strike, Inferno, Meteor]
  tick_costs: [1, 5, 8, 15, 25]
  abilities_unlocked: [Flame Aura, Fire Immunity, Pyroblast]
  training: Successfully casting fire spells

Ice_Magic:
  description: "Control magic with slowing and freezing effects"
  spells: [Chill, Ice Shard, Frost Bolt, Blizzard, Absolute Zero]
  tick_costs: [1, 4, 7, 12, 20]
  abilities_unlocked: [Frost Armor, Ice Shield, Frozen Time]
  training: Successfully casting ice spells

Lightning_Magic:
  description: "Fast magic with chain effects and stunning"
  spells: [Shock, Lightning Bolt, Chain Lightning, Thunder Storm]
  tick_costs: [1, 3, 8, 18]
  abilities_unlocked: [Lightning Reflexes, Storm Calling, Electric Aura]
  training: Successfully casting lightning spells

Earth_Magic:
  description: "Defensive magic with barriers and area control"
  spells: [Stone Skin, Earth Spike, Stone Wall, Earthquake]
  tick_costs: [3, 5, 10, 20]
  abilities_unlocked: [Rock Armor, Tremor Sense, Mountain Heart]
  training: Successfully casting earth spells

Healing_Magic:
  description: "Restoration magic for health and status effects"
  spells: [Minor Heal, Cure Disease, Major Heal, Resurrection]
  tick_costs: [2, 4, 8, 30]
  abilities_unlocked: [Regeneration, Divine Protection, Life Mastery]
  training: Successfully healing damage and curing ailments

Necromancy:
  description: "Dark magic with life drain and undead control"
  spells: [Life Drain, Animate Dead, Death Touch, Soul Storm]
  tick_costs: [3, 10, 12, 25]
  abilities_unlocked: [Undead Mastery, Life Steal, Death Aura]
  training: Successfully casting necromantic spells
```

---

## Combat Skills (4 Skills)

```yaml
Evasion:
  description: "Avoiding attacks through speed and agility"
  effects: +Dodge Chance, +Movement in Combat
  abilities_unlocked: [Riposte, Combat Reflexes, Untouchable]
  restrictions: "Reduced effectiveness in Heavy Armor"
  training: Successfully dodging attacks

Blocking:
  description: "Active defense with weapons and shields"
  effects: +Parry Chance, +Block Effectiveness
  abilities_unlocked: [Perfect Parry, Counter Attack, Defensive Mastery]
  requirements: "Requires weapon or shield"
  training: Successfully blocking or parrying attacks

Dual_Wielding:
  description: "Fighting with weapons in both hands"
  effects: +Attack Speed, +Damage Potential, -Accuracy
  abilities_unlocked: [Flurry, Twin Strike, Blade Barrier]
  requirements: "Two one-handed weapons"
  training: Fighting with two weapons simultaneously

Two_Handed:
  description: "Mastery of large weapons requiring both hands"
  effects: +Damage, +Reach, +Cleave Potential
  abilities_unlocked: [Great Cleave, Devastating Strike, Weapon Master]
  requirements: "Two-handed weapon equipped"
  training: Successfully using two-handed weapons
```

---

## Crafting Skills (5 Skills)

```yaml
Smithing:
  description: "Creating and repairing metal weapons and armor"
  products: [Weapons, Armor, Tools, Weapon Modifications]
  abilities_unlocked: [Master Crafting, Weapon Enchanting, Legendary Smith]
  materials: [Iron, Steel, Mithril, Adamantium]
  training: Successfully crafting items

Alchemy:
  description: "Creating potions, poisons, and magical compounds"
  products: [Health Potions, Mana Potions, Poisons, Buffs]
  abilities_unlocked: [Master Alchemist, Poison Immunity, Transmutation]
  materials: [Herbs, Crystals, Monster Parts, Rare Elements]
  training: Successfully brewing potions and compounds

Enchanting:
  description: "Imbuing items with magical properties"
  products: [Enchanted Weapons, Enchanted Armor, Magic Items]
  abilities_unlocked: [Greater Enchantment, Spell Storing, Artifact Creation]
  materials: [Soul Gems, Magic Essence, Rare Metals]
  training: Successfully enchanting items

Cooking:
  description: "Preparing food with beneficial effects"
  products: [Nutritious Meals, Stat Buffs, Resistance Foods]
  abilities_unlocked: [Master Chef, Food Preservation, Exotic Cuisine]
  materials: [Meat, Vegetables, Spices, Monster Ingredients]
  training: Successfully preparing meals

Trap_Making:
  description: "Creating and disarming mechanical devices"
  products: [Dart Traps, Explosive Traps, Detection Systems]
  abilities_unlocked: [Master Trapper, Trap Sense, Explosive Expertise]
  materials: [Mechanisms, Poisons, Explosives, Wire]
  training: Successfully creating and disarming traps
```

---

## Passive Skills (8 Skills)

```yaml
Stealth:
  description: "Moving unseen and unheard"
  effects: +Hide Chance, +Silent Movement, +Sneak Attack Damage
  abilities_unlocked: [Invisibility, Shadow Mastery, Assassinate]
  restrictions: "Heavy armor reduces effectiveness"
  training: Successfully hiding and moving undetected

Perception:
  description: "Detecting hidden things and danger"
  effects: +Trap Detection, +Hidden Door Discovery, +Enemy Awareness
  abilities_unlocked: [True Sight, Danger Sense, All-Seeing Eye]
  training: Successfully detecting hidden objects and dangers

Survival:
  description: "Wilderness skills and environmental resistance"
  effects: +Health Regeneration, +Poison Resistance, +Environmental Protection
  abilities_unlocked: [Natural Healing, Beast Speech, Weather Control]
  training: Resting, eating, surviving environmental challenges

Athletics:
  description: "Physical prowess and movement abilities"
  effects: +Movement Speed, +Jump Distance, +Climb Ability
  abilities_unlocked: [Super Jump, Wall Climbing, Unstoppable Force]
  training: Moving long distances, climbing, jumping

Leadership:
  description: "Inspiring and coordinating group actions"
  effects: +Party Coordination, +Morale Bonuses, +Communication Range
  abilities_unlocked: [Rally, Tactical Coordination, Inspiring Presence]
  training: Successfully leading party actions and decisions

Lockpicking:
  description: "Opening locks and mechanical devices"
  effects: +Lock Success Rate, +Speed of Opening, +Complex Lock Access
  abilities_unlocked: [Master Thief, Instant Open, Lock Sense]
  training: Successfully opening locks and chests

Intimidation:
  description: "Frightening enemies and controlling social situations"
  effects: +Fear Effects, +Social Control, +Enemy Hesitation
  abilities_unlocked: [Terrifying Presence, Mass Fear, Unbreakable Will]
  training: Successfully intimidating enemies and NPCs

Diplomacy:
  description: "Peaceful resolution and social interaction"
  effects: +NPC Relations, +Trade Benefits, +Conflict Resolution
  abilities_unlocked: [Silver Tongue, Mass Charm, Perfect Negotiation]
  training: Successfully negotiating and resolving conflicts
```

---

## Skill Training System

### Training Rates by Level
```yaml
Skill Level 0-24:   50% chance per successful use
Skill Level 25-49:  25% chance per successful use  
Skill Level 50-74:  10% chance per successful use
Skill Level 75-89:  5% chance per successful use
Skill Level 90-100: 1% chance per successful use
```

### Cross-Training Bonuses
```yaml
Related Skills: +25% training rate when using complementary skills
Example: Swords + Blocking train each other faster
Example: Fire Magic + Alchemy train each other faster

Opposed Skills: -50% training rate when using conflicting approaches  
Example: Heavy Armor reduces Stealth training rate
Example: Necromancy reduces Healing Magic training rate
```

### Equipment Requirements
```yaml
Equipment Skill Gates:
- Basic Equipment: No skill requirement
- Advanced Equipment: 25+ skill requirement
- Master Equipment: 50+ skill requirement  
- Legendary Equipment: 75+ skill requirement
- Artifact Equipment: 90+ skill requirement + special unlocks
```

---

## Integration with Other Systems

### Abilities System
- Each skill unlocks specific abilities at skill level thresholds
- Multi-skill abilities require minimum levels in multiple skills
- Equipment restrictions can block certain abilities

### Class System  
- Classes emerge when skill combinations meet prerequisites
- No fixed classes - dynamic based on character development
- Classes provide unique abilities beyond basic skill abilities

### Combat System
- All combat calculations use skill levels + equipment bonuses
- No attributes (STR/DEX/CON) - everything skill-derived
- Equipment effectiveness scales with relevant skill levels

### Economic System
- Crafting skills create tradeable items
- Skill levels determine quality and success rates
- Master crafters can create unique items for auction house

This skill system provides the foundation for deep character customization while maintaining clear progression paths and meaningful choices at every level.