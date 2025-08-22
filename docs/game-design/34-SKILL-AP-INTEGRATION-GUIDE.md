# 34-Skill AP System Integration Guide

**Document Version**: 1.0  
**Date**: 2025-08-22  
**Status**: Comprehensive Integration Mapping  
**Maintained By**: Story-Writer/DM Agent

---

## Integration Philosophy

This document provides the complete mapping of all 34 skills to the refined AP system, showing exactly which abilities are FREE vs AP-based for each skill, with specific examples and progression paths.

**FREE ACTIONS**: Immediate execution, provide reliable baseline effectiveness
**AP ABILITIES**: Resource-based, provide powerful upgrades and tactical options
**SKILL SCALING**: Both free actions and AP abilities improve with skill progression
**BALANCE TARGET**: All 34 skills remain viable through distinct roles and capabilities

---

## WEAPON SKILLS (7 Skills) - Combat Foundation

### 1. Swords - Balanced Weapon Mastery
```yaml
FREE_ACTIONS: (0 AP)
  Basic_Sword_Attack:
    - Standard thrust or slash (2 ticks)
    - Damage: weapon_base + floor(skill/4)
    - Accuracy: 50% + weapon_bonus + floor(skill/2)
    - Scaling: Linear damage/accuracy improvement
    
  Defensive_Stance:
    - Basic parry position with sword
    - +floor(skill/4) to block attempts
    - Can counter-attack on successful parry
    
AP_ABILITIES: (1-6 AP)
  Light_Techniques: (1-2 AP)
    - Precise Strike: +10 accuracy, +5% crit (1 AP)
    - Quick Slash: -1 tick attack speed (1 AP)
    - Defensive Strike: Attack + temporary defense bonus (2 AP)
    
  Combat_Mastery: (3-4 AP)
    - Power Slash: +50% damage, +1 tick (3 AP)
    - Riposte: Counter-attack on successful dodge (3 AP)
    - Whirling Blade: Attack all adjacent enemies (4 AP)
    
  Sword_Mastery: (5-6 AP)
    - Perfect Strike: Guaranteed critical hit (5 AP)
    - Blade Dance: Multi-target precision attacks (5 AP)
    - Legendary Sword Technique: Ultimate ability (6 AP)

Skill_Progression_Benefits:
  0-24: Free actions only, basic sword techniques
  25-49: Unlock light AP techniques, improved free action effectiveness
  50-74: Access combat mastery abilities, enhanced parrying
  75+: Master techniques, unique combinations with other skills
```

### 2. Maces - Heavy Impact Weapons
```yaml
FREE_ACTIONS: (0 AP)
  Basic_Mace_Attack:
    - Crushing blow (2 ticks)
    - +25% effectiveness vs armored targets
    - High damage, moderate accuracy
    - Chance to stun on critical hits
    
  Shield_Breaking:
    - Free action to attempt shield damage
    - Effectiveness scales with mace skill
    - Can be combined with basic attack
    
AP_ABILITIES: (1-6 AP)
  Crushing_Techniques: (2-3 AP)
    - Armor Crush: Reduce target's armor value (2 AP)
    - Stunning Blow: High stun chance (3 AP)
    - Shield Bash: Offensive shield use (2 AP)
    
  Holy_Warrior: (3-4 AP) [Requires Healing Magic]
    - Smite: Holy damage, extra vs undead (3 AP)
    - Divine Protection: Self-buff (4 AP)
    
  Mace_Mastery: (5-6 AP)
    - Devastating Blow: Massive damage + knockdown (6 AP)
    - Pulverize: Ignore all armor (5 AP)

Unique_Synergies:
  + Healing_Magic: Unlock holy warrior abilities
  + Heavy_Armor: Enhanced shield bash techniques
  + Two_Handed: Devastating two-handed mace abilities
```

### 3. Axes - Cleaving Weapons
```yaml
FREE_ACTIONS: (0 AP)
  Basic_Axe_Attack:
    - Chopping attack with cleave chance
    - 15% chance to hit adjacent enemy
    - High damage, moderate accuracy
    - +20% effectiveness vs wooden shields/armor
    
  Intimidating_Presence:
    - Free intimidation attempt with axe display
    - Effectiveness scales with axe skill
    - Can cause fear in weaker enemies
    
AP_ABILITIES: (1-6 AP)
  Berserker_Techniques: (2-4 AP)
    - Great Cleave: Guaranteed hit on all adjacent (3 AP)
    - Throwing Axe: Ranged axe attack (2 AP)
    - Whirlwind: Spin attack hitting all around (4 AP)
    
  Axe_Mastery: (5-6 AP)
    - Execution: Massive damage vs wounded enemies (5 AP)
    - Legendary Cleave: Line attack through multiple foes (6 AP)

Unique_Features:
  Cleave_Scaling: Chance increases with skill level
  Throwing_Option: Can use axes as ranged weapons
  Fear_Effect: High-level axes intimidate enemies
```

### 4. Daggers - Speed and Precision
```yaml
FREE_ACTIONS: (0 AP)
  Quick_Stab:
    - Fast dagger attack (1 tick)
    - Lower damage but very fast
    - +accuracy bonus from weapon speed
    - Can be used while moving
    
  Defensive_Agility:
    - Enhanced dodge chance with dagger
    - Can dodge and counter in same action
    - +floor(skill/3) to evasion attempts
    
AP_ABILITIES: (1-5 AP)
  Stealth_Attacks: (1-3 AP) [Requires Stealth]
    - Sneak Attack: Double damage from stealth (2 AP)
    - Backstab: Triple damage from behind (3 AP)
    - Poison Strike: Apply poison effect (1 AP)
    
  Speed_Techniques: (2-4 AP)
    - Flurry: Multiple rapid stabs (3 AP)
    - Dual Strike: Attack with both daggers (2 AP)
    - Shadow Strike: Teleport + attack (4 AP)
    
  Assassin_Mastery: (4-5 AP)
    - Death Strike: Instant kill attempt (5 AP)
    - Thousand Cuts: Maximum speed attack (4 AP)

Synergy_Requirements:
  + Stealth: Unlock stealth attack abilities
  + Dual_Wielding: Enhanced dual dagger techniques
  + Alchemy: Poison application abilities
```

### 5. Staves - Magic Focus Weapons
```yaml
FREE_ACTIONS: (0 AP)
  Staff_Strike:
    - Basic quarterstaff attack (2 ticks)
    - Reach advantage (can hit 2 squares away)
    - +blocking bonus when used defensively
    - Can cast while holding defensively
    
  Spell_Focus:
    - Free action to enhance next spell
    - +accuracy to targeted spells
    - Reduces spell failure chance
    
AP_ABILITIES: (1-4 AP)
  Combat_Magic: (1-2 AP) [Requires Magic School]
    - Spell Strike: Weapon attack + cantrip (1 AP)
    - Magic Weapon: Temporary enchantment (2 AP)
    
  Staff_Mastery: (2-4 AP)
    - Sweeping Strike: Hit multiple enemies (2 AP)
    - Spell Channel: Cast through weapon contact (3 AP)
    - Master's Focus: Greatly enhance spell (4 AP)

Magic_Integration:
  All_Magic_Schools: Staff reduces AP costs by 1 (minimum 1)
  Spell_Combinations: Unique staff + magic abilities
  Enchantment_Compatibility: Enhanced by magical staves
```

### 6. Bows - Precision Ranged Combat
```yaml
FREE_ACTIONS: (0 AP)
  Aimed_Shot:
    - Standard archery attack (2 ticks)
    - High accuracy at range
    - +damage bonus for stationary shooting
    - Can target specific body parts
    
  Quick_Draw:
    - Fast arrow nocking and release
    - Reduced preparation time
    - Can shoot while moving (accuracy penalty)
    
AP_ABILITIES: (1-6 AP)
  Archery_Techniques: (2-4 AP)
    - Multi-Shot: Fire at 2-3 targets (3 AP)
    - Piercing Arrow: Penetrate multiple foes (3 AP)
    - Explosive Arrow: Area damage shot (4 AP)
    
  Master_Archery: (4-6 AP)
    - Perfect Shot: Guaranteed critical (4 AP)
    - Rain of Arrows: Area bombardment (6 AP)
    - Legendary Shot: Extreme range/damage (5 AP)

Range_Advantages:
  No_Movement_Penalty: Unlike melee weapons
  Terrain_Benefits: High ground bonuses
  Ammunition_Management: Limited arrows add tactical depth
```

### 7. Crossbows - Powerful Ranged Weapons
```yaml
FREE_ACTIONS: (0 AP)
  Crossbow_Shot:
    - High-damage ranged attack (3 ticks)
    - Superior damage to bows
    - Longer reload time but more powerful
    - Armor-piercing qualities
    
  Mechanical_Reload:
    - Prepare for next shot
    - Can be done while moving
    - Reload speed improves with skill
    
AP_ABILITIES: (2-6 AP)
  Siege_Techniques: (3-5 AP)
    - Armor Piercing: Ignore target's armor (3 AP)
    - Explosive Bolt: Area damage (4 AP)
    - Rapid Fire: Multiple shots despite reload (5 AP)
    
  Crossbow_Mastery: (5-6 AP)
    - Siege Shot: Massive single-target damage (5 AP)
    - Storm of Bolts: Area suppression (6 AP)

Unique_Mechanics:
  Reload_System: Must reload between shots
  Armor_Penetration: Natural effectiveness vs heavy armor
  Mechanical_Precision: Consistent damage output
```

---

## ARMOR SKILLS (4 Skills) - Defensive Foundation

### 8. Light Armor - Mobility and Evasion
```yaml
FREE_ACTIONS: (0 AP)
  Enhanced_Movement:
    - Move 2 squares instead of 1
    - No movement penalties
    - Can move + act efficiently
    - +stealth bonus from quiet armor
    
  Evasive_Maneuvers:
    - Enhanced dodge attempts
    - +floor(skill/3) to evasion
    - Can dodge and move simultaneously
    
AP_ABILITIES: (1-4 AP)
  Acrobatic_Combat: (2-3 AP)
    - Combat Roll: Move + avoid attacks (2 AP)
    - Acrobatic Strike: Attack from unusual angles (3 AP)
    - Evasive Strike: Attack + enhanced dodge (3 AP)
    
  Light_Armor_Mastery: (4 AP)
    - Perfect Mobility: Multiple moves + actions (4 AP)
    - Shadow Dance: Enhanced stealth combat (4 AP)

Initiative_Bonus: +3 to all initiative rolls
Stealth_Synergy: Enhanced stealth skill effectiveness
```

### 9. Medium Armor - Balanced Protection
```yaml
FREE_ACTIONS: (0 AP)
  Balanced_Defense:
    - Moderate damage reduction
    - No significant movement penalties
    - Versatile combat stance options
    - Good balance of protection/mobility
    
  Adaptive_Fighting:
    - Can switch between offensive/defensive stances
    - Balanced bonuses to attack and defense
    - Good foundation for hybrid builds
    
AP_ABILITIES: (2-4 AP)
  Versatile_Techniques: (2-3 AP)
    - Armor Expertise: Temporary damage reduction (2 AP)
    - Balanced Strike: Optimized attack/defense (3 AP)
    
  Medium_Armor_Mastery: (4 AP)
    - Master Balance: Enhanced all-around performance (4 AP)

Balance_Focus: No initiative penalties, moderate bonuses
Hybrid_Builds: Works well with any weapon/magic combination
```

### 10. Heavy Armor - Maximum Protection
```yaml
FREE_ACTIONS: (0 AP)
  Fortress_Defense:
    - High damage reduction
    - Immunity to weak attacks
    - Intimidating presence
    - Can protect nearby allies
    
  Immovable_Defense:
    - Cannot be knocked down easily
    - Resistance to forced movement
    - +blocking bonuses from armor coverage
    
AP_ABILITIES: (2-5 AP)
  Tank_Techniques: (3-5 AP)
    - Fortress Stance: Enhanced protection, no movement (3 AP)
    - Armor Slam: Offensive use of armor weight (3 AP)
    - Impenetrable Defense: Brief invulnerability (5 AP)
    
  Heavy_Armor_Mastery: (5 AP)
    - Walking Fortress: Mobile maximum protection (5 AP)

Initiative_Penalty: -3 to initiative rolls
Tank_Role: Designed for protecting party members
```

### 11. Shields - Active Defense Mastery
```yaml
FREE_ACTIONS: (0 AP)
  Shield_Block:
    - Active blocking attempts
    - +floor(skill/2) to block chance
    - Can block for adjacent allies
    - Continuous defensive stance option
    
  Shield_Positioning:
    - Quick repositioning for optimal defense
    - Cover multiple angles
    - Can provide cover for ranged allies
    
AP_ABILITIES: (1-5 AP)
  Shield_Combat: (1-3 AP)
    - Shield Bash: Offensive shield strike (1 AP)
    - Shield Throw: Ranged shield attack (2 AP)
    - Shield Wall: Protect multiple allies (3 AP)
    
  Shield_Mastery: (4-5 AP)
    - Perfect Block: Negate any single attack (4 AP)
    - Aegis: Protect entire party briefly (5 AP)

Party_Protection: Primary focus on ally defense
Weapon_Synergy: Works with any one-handed weapon
```

---

## MAGIC SCHOOLS (6 Skills) - Elemental Mastery

### 12. Fire Magic - Destructive Force
```yaml
FREE_ACTIONS: (0 AP)
  Fire_Resistance:
    - Immunity to fire damage
    - Can walk through fire safely
    - Heat vision in darkness
    - Basic fire manipulation
    
AP_ABILITIES: (1-8 AP)
  Cantrips: (1 AP)
    - Spark: Minor fire damage
    - Light: Illumination
    - Warm: Comfort/survival benefit
    
  Basic_Spells: (2-4 AP)
    - Flame Arrow: Enhanced projectile (2 AP)
    - Fireball: Area fire damage (3 AP)
    - Fire Shield: Damage attackers (4 AP)
    
  Advanced_Spells: (5-7 AP)
    - Wall of Fire: Terrain control (5 AP)
    - Flame Strike: High single-target damage (6 AP)
    - Inferno: Large area devastation (7 AP)
    
  Master_Spells: (8 AP)
    - Meteor: Ultimate area destruction (8 AP)

Damage_Focus: Highest raw damage potential
Area_Effects: Best at controlling large areas
```

### 13. Ice Magic - Control and Preservation
```yaml
FREE_ACTIONS: (0 AP)
  Cold_Resistance:
    - Immunity to cold damage
    - Can survive freezing conditions
    - Basic ice manipulation
    - Preserve food/items
    
AP_ABILITIES: (1-7 AP)
  Cantrips: (1 AP)
    - Chill: Slow effect
    - Freeze: Lock small mechanisms
    - Cool: Temperature control
    
  Basic_Spells: (2-4 AP)
    - Ice Shard: Piercing projectile (2 AP)
    - Ice Armor: Damage reduction (3 AP)
    - Sleet: Area movement impediment (4 AP)
    
  Advanced_Spells: (5-6 AP)
    - Blizzard: Large area slow + damage (5 AP)
    - Ice Prison: Immobilize target (6 AP)
    
  Master_Spells: (7 AP)
    - Absolute Zero: Instant kill attempt (7 AP)

Control_Focus: Best at slowing and stopping enemies
Defensive_Utility: Strong protective applications
```

### 14. Lightning Magic - Speed and Precision
```yaml
FREE_ACTIONS: (0 AP)
  Electrical_Resistance:
    - Immunity to electrical damage
    - Can safely handle electrical devices
    - Enhanced reflexes from electrical attunement
    
AP_ABILITIES: (1-8 AP)
  Cantrips: (1 AP)
    - Shock: Instant small damage
    - Static: Interfere with mechanisms
    - Charge: Power devices
    
  Basic_Spells: (2-4 AP)
    - Lightning Bolt: Line attack (2 AP)
    - Lightning Weapon: Weapon enhancement (3 AP)
    - Electrical Field: Defensive aura (4 AP)
    
  Advanced_Spells: (4-6 AP)
    - Chain Lightning: Multi-target (4 AP)
    - Lightning Storm: Area denial (6 AP)
    
  Master_Spells: (8 AP)
    - Thunder Storm: Battlefield control (8 AP)

Speed_Focus: Fastest spell casting
Chain_Effects: Unique multi-target capabilities
```

### 15. Earth Magic - Defense and Structure
```yaml
FREE_ACTIONS: (0 AP)
  Earth_Sense:
    - Detect underground structures
    - Sense vibrations through ground
    - Basic stone/metal manipulation
    - Enhanced stability (resist knockdown)
    
AP_ABILITIES: (1-8 AP)
  Cantrips: (1 AP)
    - Mend: Repair stone/metal
    - Shape: Minor terrain alteration
    - Detect: Find minerals/gems
    
  Basic_Spells: (3-4 AP)
    - Stone Skin: Physical damage reduction (3 AP)
    - Earth Spike: Ground-based attack (3 AP)
    - Stone Wall: Create barrier (4 AP)
    
  Advanced_Spells: (5-7 AP)
    - Earthquake: Area terrain disruption (6 AP)
    - Stone Prison: Earth-based imprisonment (5 AP)
    - Metal Form: Transform body to metal (7 AP)
    
  Master_Spells: (8 AP)
    - Cataclysm: Massive terrain alteration (8 AP)

Defense_Focus: Best protective magic
Terrain_Control: Unique battlefield modification
```

### 16. Healing Magic - Restoration and Support
```yaml
FREE_ACTIONS: (0 AP)
  Life_Sense:
    - Detect living creatures
    - Assess health status at glance
    - Basic first aid knowledge
    - Disease/poison resistance
    
AP_ABILITIES: (1-8 AP)
  Cantrips: (1 AP)
    - Light Touch: Minor healing
    - Purify: Clean water/food
    - Comfort: Ease pain/fatigue
    
  Basic_Spells: (2-4 AP)
    - Heal Wounds: Moderate healing (3 AP)
    - Cure Disease: Remove ailments (3 AP)
    - Bless: Temporary enhancement (4 AP)
    
  Advanced_Spells: (4-6 AP)
    - Major Heal: Strong healing (4 AP)
    - Group Heal: Heal multiple allies (5 AP)
    - Restoration: Remove all negative effects (6 AP)
    
  Master_Spells: (8 AP)
    - Resurrection: Restore fallen ally (8 AP)

Support_Focus: Essential for group survival
Holy_Synergy: Works with maces for paladin builds
```

### 17. Necromancy - Death and Undeath
```yaml
FREE_ACTIONS: (0 AP)
  Death_Sense:
    - Detect undead creatures
    - Communicate with spirits
    - Resistance to death effects
    - See death history of locations
    
AP_ABILITIES: (1-7 AP)
  Cantrips: (1 AP)
    - Scare: Minor fear effect
    - Speak Dead: Brief spirit communication
    - Preserve: Prevent decay
    
  Basic_Spells: (2-4 AP)
    - Drain Life: Damage + self heal (3 AP)
    - Fear: Cause terror (2 AP)
    - Speak with Dead: Extended communication (4 AP)
    
  Advanced_Spells: (5-6 AP)
    - Animate Dead: Create skeleton ally (5 AP)
    - Death Touch: High damage vs living (6 AP)
    
  Master_Spells: (7 AP)
    - Soul Storm: Multiple life drain (7 AP)

Dark_Magic: Powerful but morally questionable
Minion_Control: Unique summoning capabilities
```

---

## COMBAT SKILLS (4 Skills) - Fighting Expertise

### 18. Evasion - Avoiding Damage
```yaml
FREE_ACTIONS: (0 AP)
  Enhanced_Dodge:
    - +floor(skill/3) to dodge attempts
    - Can dodge while performing other actions
    - Reduced accuracy penalties when moving
    - Natural defensive positioning
    
  Combat_Movement:
    - Move without provoking attacks
    - Enhanced battlefield mobility
    - Can retreat safely from combat
    
AP_ABILITIES: (1-4 AP)
  Evasion_Mastery: (2-4 AP)
    - Perfect Dodge: Avoid all attacks this turn (3 AP)
    - Evasive Strike: Attack + enhanced dodge (2 AP)
    - Shadow Step: Short teleport (4 AP)

Initiative_Bonus: +2 at skill 50+
Light_Armor_Synergy: Enhanced with light armor
```

### 19. Blocking - Active Defense
```yaml
FREE_ACTIONS: (0 AP)
  Enhanced_Block:
    - +floor(skill/2) to block attempts
    - Can block for adjacent allies
    - Opportunity for counter-attacks
    - Damage reduction even on failed blocks
    
  Defensive_Stance:
    - Enhanced protection at cost of mobility
    - Can maintain while using weapons/shields
    - Scales with weapon and shield skills
    
AP_ABILITIES: (1-5 AP)
  Blocking_Mastery: (2-5 AP)
    - Active Parry: Block + counter opportunity (2 AP)
    - Defensive Mastery: Protect multiple allies (4 AP)
    - Perfect Block: Negate any attack (5 AP)

Weapon_Synergy: Works with all melee weapons
Shield_Enhancement: Greatly enhanced with shields
```

### 20. Dual Wielding - Two-Weapon Combat
```yaml
FREE_ACTIONS: (0 AP)
  Ambidextrous_Fighting:
    - Can attack with both weapons
    - +accuracy from having two weapons
    - Enhanced defensive options
    - Weapon-specific combinations
    
  Weapon_Switching:
    - Quick weapon swaps
    - Can adapt to different combat situations
    - Mix weapon types for versatility
    
AP_ABILITIES: (2-5 AP)
  Dual_Weapon_Mastery: (2-5 AP)
    - Twin Strike: Attack with both weapons (2 AP)
    - Flurry: Multiple rapid attacks (3 AP)
    - Blade Barrier: Defensive spinning (4 AP)
    - Whirlwind: Attack all adjacent (5 AP)

Weapon_Requirements: Must have two one-handed weapons
Dagger_Synergy: Especially effective with daggers
```

### 21. Two Handed - Heavy Weapon Mastery
```yaml
FREE_ACTIONS: (0 AP)
  Heavy_Weapon_Expertise:
    - Enhanced damage with two-handed weapons
    - Reach advantages with appropriate weapons
    - Cannot be disarmed easily
    - Intimidating combat presence
    
  Weapon_Control:
    - Superior weapon manipulation
    - Can use weapon defensively
    - Enhanced critical hit potential
    
AP_ABILITIES: (2-6 AP)
  Two_Handed_Mastery: (2-6 AP)
    - Great Swing: High damage attack (2 AP)
    - Sweeping Strike: Hit multiple enemies (3 AP)
    - Devastating Blow: Armor-penetrating (5 AP)
    - Legendary Strike: Ultimate technique (6 AP)

Weapon_Requirements: Must use two-handed weapons
Strength_Simulation: High damage represents strength through skill
```

---

## CRAFTING SKILLS (5 Skills) - Creation and Utility

### 22. Smithing - Metal Weapon/Armor Creation
```yaml
FREE_ACTIONS: (0 AP)
  Basic_Repair:
    - Restore weapon/armor durability
    - Assess equipment condition
    - Basic metalworking knowledge
    - Recognize quality and materials
    
  Field_Maintenance:
    - Quick equipment adjustments
    - Sharpen weapons during combat
    - Basic armor fitting
    
AP_ABILITIES: (2-6 AP)
  Combat_Smithing: (2-4 AP)
    - Emergency Repair: Major durability restoration (2 AP)
    - Weapon Enhancement: Temporary improvement (3 AP)
    - Armor Reinforcement: Temporary protection boost (4 AP)
    
  Master_Smithing: (5-6 AP)
    - Legendary Enhancement: Powerful temporary upgrade (5 AP)
    - Instant Crafting: Create equipment in combat (6 AP)

Equipment_Focus: Enhances all weapon and armor effectiveness
Material_Knowledge: Can identify and work with rare materials
```

### 23. Alchemy - Potion and Chemical Creation
```yaml
FREE_ACTIONS: (0 AP)
  Chemical_Knowledge:
    - Identify potions and poisons
    - Basic ingredient recognition
    - Poison/disease resistance
    - Quick consumption techniques
    
  Basic_Mixing:
    - Combine simple ingredients
    - Create basic healing salves
    - Neutralize poisons
    
AP_ABILITIES: (2-5 AP)
  Combat_Alchemy: (2-4 AP)
    - Quick Potion: Create healing item (3 AP)
    - Poison Application: Enhance weapons (2 AP)
    - Explosive Mixture: Thrown area damage (4 AP)
    
  Master_Alchemy: (5 AP)
    - Master Potion: Multi-effect consumable (5 AP)

Consumption_Focus: Creates consumable items for tactical use
Poison_Synergy: Enhanced effectiveness with daggers
```

### 24. Enchanting - Magical Item Enhancement
```yaml
FREE_ACTIONS: (0 AP)
  Magic_Sense:
    - Identify magical items
    - Assess enchantment strength
    - Basic magical theory knowledge
    - Detect magical traps/effects
    
  Minor_Enchantment:
    - Basic temporary enhancements
    - Recharge magical items
    - Basic magical maintenance
    
AP_ABILITIES: (3-7 AP)
  Combat_Enchanting: (3-5 AP)
    - Weapon Enchantment: Temporary magical enhancement (3 AP)
    - Armor Blessing: Temporary magical protection (4 AP)
    - Item Activation: Trigger magical item effects (5 AP)
    
  Master_Enchanting: (6-7 AP)
    - Legendary Enchantment: Powerful enhancement (6 AP)
    - Artifact Creation: Create unique magical item (7 AP)

Magic_Synergy: Enhanced by any magic school knowledge
Item_Focus: Improves effectiveness of all magical equipment
```

### 25. Cooking - Food Preparation and Buffs
```yaml
FREE_ACTIONS: (0 AP)
  Nutritional_Knowledge:
    - Identify safe/dangerous foods
    - Basic meal preparation
    - Food preservation techniques
    - Assess dietary needs
    
  Quick_Preparation:
    - Fast meal preparation
    - Basic cooking without tools
    - Create trail rations
    
AP_ABILITIES: (2-5 AP)
  Combat_Cooking: (2-4 AP)
    - Energy Food: Stamina restoration (2 AP)
    - Battle Rations: Temporary stat boost (3 AP)
    - Gourmet Meal: Multiple benefits (4 AP)
    
  Master_Cooking: (5 AP)
    - Legendary Feast: Party-wide enhancement (5 AP)

Sustenance_Focus: Provides long-term benefits and sustainability
Survival_Synergy: Enhanced by survival skill knowledge
```

### 26. Trap Making - Mechanical Device Creation
```yaml
FREE_ACTIONS: (0 AP)
  Trap_Detection:
    - Spot mechanical traps
    - Assess trap complexity
    - Basic disarming knowledge
    - Recognize trap materials
    
  Basic_Disarming:
    - Safely disable simple traps
    - Recover trap components
    - Basic mechanical knowledge
    
AP_ABILITIES: (3-6 AP)
  Combat_Trapping: (3-5 AP)
    - Quick Trap: Set simple trap (3 AP)
    - Sabotage: Disable enemy equipment (4 AP)
    - Advanced Trap: Complex area denial (5 AP)
    
  Master_Trapping: (6 AP)
    - Deadly Trap: High-damage complex trap (6 AP)

Area_Control: Focuses on battlefield manipulation
Stealth_Synergy: Enhanced when combined with stealth skills
```

---

## PASSIVE SKILLS (8 Skills) - Exploration and Social

### 27. Stealth - Concealment and Infiltration
```yaml
FREE_ACTIONS: (0 AP)
  Basic_Stealth:
    - Move quietly
    - Hide in shadows
    - Avoid detection
    - Reduce noise generation
    
  Stealth_Movement:
    - Move while hidden
    - Maintain concealment
    - Silent communication
    
AP_ABILITIES: (1-4 AP)
  Stealth_Mastery: (1-4 AP)
    - Enter Stealth: Become hidden (1 AP)
    - Sneak Attack: Enhanced damage from stealth (2 AP)
    - Shadow Step: Teleport between shadows (3 AP)
    - Invisibility: Complete concealment (4 AP)

Dagger_Synergy: Unlocks assassination techniques
Light_Armor_Synergy: Enhanced stealth effectiveness
```

### 28. Perception - Awareness and Detection
```yaml
FREE_ACTIONS: (0 AP)
  Enhanced_Awareness:
    - Spot hidden objects/enemies
    - Hear distant sounds
    - Notice environmental details
    - Detect lies and deception
    
  Danger_Sense:
    - Warning of imminent threats
    - Detect ambushes
    - Sense hostile intent
    
AP_ABILITIES: (1-3 AP)
  Perception_Mastery: (1-3 AP)
    - Deep Search: Find all hidden objects (2 AP)
    - True Sight: See through illusions (3 AP)
    - Detect Thoughts: Basic mind reading (3 AP)

Initiative_Bonus: +3 at skill 40+
Trap_Synergy: Enhanced trap detection
```

### 29. Survival - Wilderness and Environmental
```yaml
FREE_ACTIONS: (0 AP)
  Environmental_Adaptation:
    - Resist weather effects
    - Navigate wilderness
    - Find food and water
    - Basic shelter construction
    
  Natural_Healing:
    - Slow health regeneration
    - Disease resistance
    - Poison resistance
    
AP_ABILITIES: (2-4 AP)
  Survival_Mastery: (2-4 AP)
    - Environmental Immunity: Resist harsh conditions (2 AP)
    - Natural Medicine: Healing without magic (3 AP)
    - Beast Communication: Talk with animals (4 AP)

Cooking_Synergy: Enhanced food preparation
Healing_Magic_Synergy: Natural + magical healing combination
```

### 30. Athletics - Physical Prowess
```yaml
FREE_ACTIONS: (0 AP)
  Enhanced_Movement:
    - Climb walls and obstacles
    - Jump further distances
    - Swim effectively
    - Enhanced running speed
    
  Physical_Conditioning:
    - Improved stamina
    - Resistance to fatigue
    - Enhanced carrying capacity
    
AP_ABILITIES: (2-3 AP)
  Athletic_Mastery: (2-3 AP)
    - Great Leap: Enhanced jumping (2 AP)
    - Parkour: Advanced movement (3 AP)
    - Endurance: Extended action capability (3 AP)

Initiative_Bonus: +2 at skill 35+
Movement_Enhancement: Improves all movement actions
```

### 31. Leadership - Group Coordination
```yaml
FREE_ACTIONS: (0 AP)
  Natural_Authority:
    - Boost ally morale
    - Coordinate basic tactics
    - Inspire confidence
    - Resolve simple disputes
    
  Tactical_Awareness:
    - Assess battlefield situation
    - Provide tactical advice
    - Coordinate movements
    
AP_ABILITIES: (3-5 AP)
  Leadership_Mastery: (3-5 AP)
    - Rally: Remove fear, boost morale (3 AP)
    - Tactical Coordination: Enhanced group actions (4 AP)
    - Inspiring Presence: Party-wide bonuses (5 AP)

Party_Synergy: Benefits increase with more party members
Initiative_Modification: Can help allies act faster
```

### 32. Lockpicking - Mechanical Manipulation
```yaml
FREE_ACTIONS: (0 AP)
  Basic_Lockpicking:
    - Open simple locks
    - Assess lock complexity
    - Basic mechanical knowledge
    - Tool improvisation
    
  Lock_Assessment:
    - Determine difficulty
    - Identify lock type
    - Estimate time required
    
AP_ABILITIES: (2-4 AP)
  Lockpicking_Mastery: (2-4 AP)
    - Speed Picking: Fast lock opening (2 AP)
    - Master Picking: Open any lock (3-4 AP by complexity)
    - Silent Picking: Open without noise (3 AP)

Trap_Making_Synergy: Enhanced mechanical knowledge
Stealth_Synergy: Silent operation techniques
```

### 33. Intimidation - Fear and Coercion
```yaml
FREE_ACTIONS: (0 AP)
  Threatening_Presence:
    - Cause fear in weaker enemies
    - Influence social interactions
    - Demoralize opponents
    - Project authority
    
  Psychological_Warfare:
    - Taunt enemies into mistakes
    - Break enemy morale
    - Influence enemy actions
    
AP_ABILITIES: (2-4 AP)
  Intimidation_Mastery: (2-4 AP)
    - Terror: Cause panic in enemies (2 AP)
    - Dominate: Control weak-willed foes (4 AP)
    - Frightening Roar: Area fear effect (3 AP)

Combat_Synergy: Enhanced by large weapons and heavy armor
Leadership_Conflict: Somewhat opposed to diplomatic leadership
```

### 34. Diplomacy - Peaceful Resolution
```yaml
FREE_ACTIONS: (0 AP)
  Peaceful_Communication:
    - Negotiate with enemies
    - Calm hostile situations
    - Gather information through conversation
    - Mediate disputes
    
  Social_Grace:
    - Improved social interactions
    - Better NPC reactions
    - Access to social options
    
AP_ABILITIES: (3-5 AP)
  Diplomacy_Mastery: (3-5 AP)
    - Peaceful Resolution: End combat through talk (3 AP)
    - Mass Charm: Turn multiple enemies friendly (4 AP)
    - Divine Words: Powerful persuasion (5 AP)

Non_Combat_Focus: Provides alternatives to violence
Information_Gathering: Enhanced through social connections
```

---

## INTEGRATION SUMMARY

### System Balance Validation
```yaml
Free_Action_Effectiveness:
  - All 34 skills provide meaningful free actions
  - Free actions scale linearly with skill progression
  - No skill becomes obsolete at higher levels
  - Baseline combat effectiveness maintained across all builds

AP_Ability_Power_Scaling:
  - 1-2 AP abilities provide 1.5-2x free action effectiveness
  - 3-4 AP abilities provide 3-4.5x free action effectiveness  
  - 5-6 AP abilities provide 6-8x free action effectiveness
  - 7-8 AP abilities provide ultimate tactical options

Skill_Synergy_Benefits:
  - Multiple skills unlock unique combination abilities
  - Cross-skill requirements prevent overspecialization
  - Hybrid builds gain access to exclusive techniques
  - Master-level skills (75+) unlock prestige abilities

Resource_Management_Strategy:
  - Conservative: Focus on free actions, save AP for defense
  - Balanced: Mix free actions with 2-3 AP abilities
  - Aggressive: Save AP across turns for 5-6 AP ultimates
  - Coordinated: Synchronize AP spending with party members
```

### 8-Player Coordination Enhancement
```yaml
Formation_Tactics:
  - Front line uses free defensive actions + AP protection abilities
  - Back line uses free movement + AP ranged/magic abilities
  - Support roles use free utility + AP group enhancement abilities
  - Specialists use skill-specific AP abilities for unique contributions

Turn_Speed_Optimization:
  - Free actions execute immediately (2-3 seconds)
  - AP ability selection streamlined (5-7 seconds)
  - Total turn time: 5-10 seconds vs previous 30 seconds
  - Enhanced party coordination through faster decision cycles

Tactical_Depth_Maintenance:
  - All 34 skills remain relevant and distinct
  - Multiple viable builds within each skill focus
  - Complex interactions between skills preserved
  - Strategic resource management through AP economy
```

This comprehensive integration ensures that every skill in the 34-skill system has clear value in both free actions and AP abilities, maintaining tactical complexity while dramatically improving turn speed and player coordination.

File: /C:/Dev/New Test/docs/game-design/34-SKILL-AP-INTEGRATION-GUIDE.md