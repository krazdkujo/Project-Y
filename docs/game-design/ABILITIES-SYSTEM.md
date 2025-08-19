# Abilities System: Skill-Gated Powers

**Document Version**: 1.0  
**Date**: 2025-08-19  
**Status**: Core System Design  
**Maintained By**: Development-Manager Agent

---

## Abilities Philosophy

**Skill-Gated Progression** - Abilities unlock when skill requirements are met
**Equipment Restrictions** - Some abilities require or forbid specific equipment
**Variable Costs** - More powerful abilities cost more ticks and resources
**Active vs Passive** - Some abilities are always active, others require activation
**Scaling Power** - Ability effectiveness scales with skill levels beyond minimum

---

## Combat Abilities

### Weapon-Specific Abilities

#### Sword Abilities
```yaml
Riposte:
  requirements: [Evasion 25, Swords 30, No Heavy Armor]
  type: Active (Reaction)
  tick_cost: 0 (triggers on successful dodge)
  effect: "Automatically counter-attack when dodging melee attack"
  scaling: "Damage scales with Swords skill"
  cooldown: 3 ticks

Blade_Dance:
  requirements: [Swords 40, Dual_Wielding 25]
  type: Active
  tick_cost: 5
  effect: "Strike all adjacent enemies with both weapons"
  scaling: "Number of strikes scales with Dual_Wielding skill"
  cooldown: 10 ticks

Perfect_Strike:
  requirements: [Swords 60]
  type: Active
  tick_cost: 8
  effect: "Guaranteed critical hit with maximum damage"
  scaling: "Critical multiplier scales with Swords skill"
  cooldown: 15 ticks
```

#### Mace Abilities
```yaml
Smite:
  requirements: [Maces 10, Healing_Magic 25]
  type: Active
  tick_cost: 6
  effect: "Holy damage that ignores armor, extra damage to undead"
  scaling: "Damage scales with both Maces and Healing_Magic"
  cooldown: 8 ticks

Armor_Crush:
  requirements: [Maces 35]
  type: Active
  tick_cost: 4
  effect: "Reduces target's armor value for remainder of combat"
  scaling: "Armor reduction scales with Maces skill"
  cooldown: 5 ticks

Devastating_Blow:
  requirements: [Maces 50, Two_Handed 30]
  type: Active
  tick_cost: 12
  effect: "Massive damage attack that knocks down target"
  scaling: "Damage and knockdown duration scale with skill levels"
  cooldown: 20 ticks
```

#### Bow Abilities
```yaml
Aimed_Shot:
  requirements: [Bows 15]
  type: Active
  tick_cost: 4
  effect: "High accuracy shot with increased critical chance"
  scaling: "Accuracy and crit chance scale with Bows skill"
  cooldown: 2 ticks

Multi_Shot:
  requirements: [Bows 35]
  type: Active
  tick_cost: 8
  effect: "Fire arrows at up to 3 different targets"
  scaling: "Number of targets scales with Bows skill"
  cooldown: 12 ticks

Piercing_Arrow:
  requirements: [Bows 45]
  type: Active
  tick_cost: 6
  effect: "Arrow passes through first target to hit second target"
  scaling: "Damage to second target scales with Bows skill"
  cooldown: 8 ticks
```

### Combat Mastery Abilities

#### Defensive Abilities
```yaml
Perfect_Block:
  requirements: [Blocking 50, Shields 40]
  type: Passive
  effect: "10% chance to block any attack for zero damage"
  scaling: "Block chance increases with skill levels"

Shield_Wall:
  requirements: [Shields 30, Heavy_Armor 20]
  type: Active
  tick_cost: 0 (continuous stance)
  effect: "Reduce movement to zero, double block chance, protect allies behind"
  scaling: "Area of protection scales with Shields skill"
  restrictions: "Cannot move or attack while active"

Combat_Reflexes:
  requirements: [Evasion 40]
  type: Passive
  effect: "Gain extra actions when outnumbered"
  scaling: "Number of extra actions scales with Evasion skill"
```

---

## Magic Abilities

### Elemental Mastery
```yaml
Fire_Aura:
  requirements: [Fire_Magic 30]
  type: Active (Toggle)
  tick_cost: 1 per tick maintained
  effect: "Damage nearby enemies, immunity to fire damage"
  scaling: "Aura damage scales with Fire_Magic skill"

Frost_Armor:
  requirements: [Ice_Magic 25]
  type: Active
  tick_cost: 5
  duration: 60 ticks
  effect: "Absorb damage, slow attackers"
  scaling: "Absorption amount scales with Ice_Magic skill"

Chain_Lightning_Mastery:
  requirements: [Lightning_Magic 40]
  type: Passive
  effect: "Lightning spells automatically chain to additional targets"
  scaling: "Number of chains scales with Lightning_Magic skill"

Stone_Skin:
  requirements: [Earth_Magic 20]
  type: Active
  tick_cost: 8
  duration: 120 ticks
  effect: "Reduce all physical damage by flat amount"
  scaling: "Damage reduction scales with Earth_Magic skill"
```

### Advanced Magic
```yaml
Spell_Focus:
  requirements: [Staves 25, Any_Magic_School 40]
  type: Passive
  effect: "Reduce tick cost of spells by 1 (minimum 1)"
  scaling: "Additional reduction at Staves 50 and 75"
  restrictions: "Must be wielding a staff"

Metamagic_Extend:
  requirements: [Two_Magic_Schools 30_each]
  type: Active (Modifier)
  tick_cost: +50% of base spell cost
  effect: "Double the duration of next spell cast"
  cooldown: 10 ticks

Metamagic_Quicken:
  requirements: [Three_Magic_Schools 25_each]
  type: Active (Modifier)
  tick_cost: +100% of base spell cost
  effect: "Reduce tick cost of next spell to 1"
  cooldown: 20 ticks
```

---

## Stealth & Utility Abilities

### Stealth Mastery
```yaml
Backstab:
  requirements: [Stealth 20, Daggers 15]
  type: Passive
  effect: "Attacks from stealth deal triple damage"
  scaling: "Damage multiplier increases with skill levels"
  restrictions: "Must be using dagger-class weapon"

Shadow_Step:
  requirements: [Stealth 45]
  type: Active
  tick_cost: 3
  effect: "Instantly move to any visible location within range"
  scaling: "Range scales with Stealth skill"
  cooldown: 15 ticks

Invisibility:
  requirements: [Stealth 60]
  type: Active
  tick_cost: 15
  duration: 30 ticks
  effect: "Become completely invisible to enemies"
  scaling: "Duration scales with Stealth skill"
  restrictions: "Breaks on attack or taking damage"
```

### Utility Mastery
```yaml
Master_Lockpicking:
  requirements: [Lockpicking 50]
  type: Passive
  effect: "Can attempt any lock, increased speed"
  scaling: "Success chance and speed scale with Lockpicking"

Trap_Sense:
  requirements: [Perception 35, Trap_Making 25]
  type: Passive
  effect: "Automatically detect all traps in range"
  scaling: "Detection range scales with skill levels"

Beast_Speech:
  requirements: [Survival 40]
  type: Active
  tick_cost: 5
  duration: 300 ticks
  effect: "Communicate with and potentially befriend animals"
  scaling: "Success chance scales with Survival skill"
```

---

## Crafting Abilities

### Master Crafting
```yaml
Legendary_Smith:
  requirements: [Smithing 75]
  type: Passive
  effect: "Can craft legendary-quality weapons and armor"
  scaling: "Quality and special properties scale with Smithing"

Master_Alchemist:
  requirements: [Alchemy 60]
  type: Passive
  effect: "Can create master-grade potions with multiple effects"
  scaling: "Number of effects scales with Alchemy skill"

Artifact_Creation:
  requirements: [Enchanting 80, Smithing 60]
  type: Active
  tick_cost: 1000 (long-term project)
  effect: "Create unique artifacts with custom properties"
  scaling: "Artifact power scales with skill levels"
  materials: "Requires rare materials and soul gems"

Poison_Mastery:
  requirements: [Alchemy 40, Daggers 30]
  type: Passive
  effect: "Can apply poisons to weapons, immunity to poisons"
  scaling: "Poison potency scales with Alchemy skill"
```

---

## Leadership & Social Abilities

### Party Leadership
```yaml
Rally:
  requirements: [Leadership 30]
  type: Active
  tick_cost: 8
  effect: "Restore morale and remove fear effects from all party members"
  scaling: "Also provides temporary skill bonuses at high Leadership"
  cooldown: 30 ticks

Tactical_Coordination:
  requirements: [Leadership 45]
  type: Active
  tick_cost: 10
  duration: 60 ticks
  effect: "Party members can use coordinated attacks for bonus damage"
  scaling: "Damage bonus scales with Leadership skill"

Inspiring_Presence:
  requirements: [Leadership 60]
  type: Passive
  effect: "All party members gain small skill bonuses while near leader"
  scaling: "Bonus amount and range scale with Leadership"
```

### Social Mastery
```yaml
Intimidating_Presence:
  requirements: [Intimidation 40]
  type: Passive
  effect: "Enemies have chance to hesitate before attacking"
  scaling: "Hesitation chance scales with Intimidation skill"

Mass_Charm:
  requirements: [Diplomacy 50]
  type: Active
  tick_cost: 20
  effect: "Attempt to turn multiple enemies friendly temporarily"
  scaling: "Number of targets and duration scale with Diplomacy"
  cooldown: 60 ticks
```

---

## Ability Mechanics

### Scaling System
```yaml
Linear_Scaling: Most abilities scale linearly with skill levels
  Example: Damage = Base + (Skill_Level * Multiplier)

Threshold_Scaling: Some abilities unlock new features at skill thresholds
  Example: Multi_Shot gains extra targets at Bows 50, 65, 80

Combination_Scaling: Multi-skill abilities scale with multiple skills
  Example: Smite scales with both Maces and Healing_Magic skills
```

### Resource Costs
```yaml
Tick_Costs: Most abilities require action ticks to activate
  - Simple abilities: 1-3 ticks
  - Complex abilities: 5-12 ticks  
  - Ultimate abilities: 15-30 ticks

Mana_Costs: Magic abilities also consume mana
  - Basic spells: 10-20 mana
  - Advanced spells: 30-60 mana
  - Master spells: 80-150 mana

Material_Costs: Crafting abilities require materials
  - Common crafting: Basic materials
  - Master crafting: Rare materials
  - Legendary crafting: Unique components
```

### Equipment Interactions
```yaml
Required_Equipment: Some abilities need specific equipment
  Example: Spell_Focus requires wielding a staff

Forbidden_Equipment: Some abilities are blocked by equipment
  Example: Riposte cannot be used in Heavy Armor

Equipment_Scaling: Some abilities become more powerful with better equipment
  Example: Shield abilities scale with shield quality
```

### Discovery System
```yaml
Automatic_Unlock: Most abilities unlock automatically when requirements met
Experimentation: Some hidden abilities require specific action combinations
Mentor_Teaching: Rare abilities can be taught by NPCs or other players
Scroll_Learning: Some abilities can be learned from rare scrolls or books
```

This abilities system creates deep character customization while maintaining clear progression paths and meaningful equipment choices. The interplay between skills, equipment, and abilities ensures that every character build feels unique and viable.