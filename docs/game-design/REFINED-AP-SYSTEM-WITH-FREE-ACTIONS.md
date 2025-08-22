# Refined Action Point System: Free Basic Actions + AP Abilities

**Document Version**: 2.0  
**Date**: 2025-08-22  
**Status**: Enhanced System Design  
**Maintained By**: Story-Writer/DM Agent

---

## System Philosophy

**FREE BASIC ACTIONS** - Movement, basic attacks, and simple defenses execute immediately
**AP SPECIAL ABILITIES** - Advanced techniques, magic, and complex maneuvers require Action Points
**FAST TURN RESOLUTION** - Target 5-10 second turns vs 30 seconds through streamlined decisions
**TACTICAL DEPTH** - Maintain 34-skill complexity while simplifying action economy
**8-PLAYER COORDINATION** - Enhanced group tactics through synchronized AP spending
**PROGRESSION CLARITY** - Clear upgrade paths from free actions to AP mastery

---

## Core System Framework

### Action Classification System
```yaml
FREE_ACTIONS: (Immediate Execution - 0 AP Cost)
  Category: Basic combat, movement, simple defense
  Execution: Immediate when declared
  Limits: One per turn category (move + attack + defend)
  Balance: Consistent baseline effectiveness across all builds

AP_ABILITIES: (Resource Cost - 1-8 AP)
  Category: Special techniques, magic, advanced tactics
  Execution: Requires AP expenditure
  Limits: Total AP available per turn
  Balance: Powerful effects with meaningful resource costs
```

### AP Economy Structure
```yaml
AP_Generation:
  Base_Per_Turn: 2 AP (reduced from previous 4 AP)
  Carryover_Maximum: 3 AP (increased for tactical flexibility)
  Total_Maximum_AP: 5 AP in a single turn (2 new + 3 carried)
  Turn_Window: 10 seconds maximum (reduced for speed)

Initiative_System:
  Roll: d20 + skill_modifiers + equipment_bonuses
  Turn_Order: Highest initiative acts first
  Simultaneous_Resolution: All actions resolve in tick system
  Delay_Option: Players can choose to act later in initiative order
```

---

## FREE ACTION CATEGORIES

### Free Movement Actions (No AP Cost)
```yaml
Basic_Movement:
  - Move to adjacent square (1 tick)
  - Move 2 squares running (+25% noise, 1 tick)
  - Careful move (silent, 2 ticks)
  - Turn in place (0 ticks)
  
Positioning:
  - Step back one square (defensive retreat)
  - Sidestep to adjacent square (flanking)
  - Prone/stand actions (defensive positioning)
  
Movement_Scaling:
  Athletics_Skill_Benefits:
    - 0-24: Standard movement only
    - 25-49: Can move + act in same turn efficiently
    - 50-74: Enhanced movement options (leap, climb)
    - 75+: Superior positioning abilities

Limitations:
  - One movement action per turn
  - Cannot move through enemies without special abilities
  - Heavy armor reduces movement options
  - Some terrain requires skill checks
```

### Free Combat Actions (No AP Cost)
```yaml
Basic_Attacks:
  All_Weapon_Types:
    - Standard weapon attack (2 ticks)
    - Damage: weapon_base + floor(skill/4)
    - Accuracy: 50% + weapon_accuracy + floor(skill/2)
    - Critical: weapon_crit_rate + floor(skill/10)
    
  Weapon_Specific_Free_Actions:
    Swords: Thrust (piercing damage)
    Maces: Bash (blunt damage) 
    Axes: Chop (slashing with cleave chance)
    Daggers: Quick stab (fast attack)
    Staves: Staff strike (reach attack)
    Bows: Aimed shot (standard archery)
    Crossbows: Bolt shot (high damage)

Basic_Defense:
  Block_Stance: (Shields/Weapons)
    - Continuous defensive posture
    - +blocking_skill/2 to defense
    - Cannot attack while blocking
    - 0 ticks to activate/deactivate
    
  Dodge_Attempt: (All Builds)
    - Reactive defense against single attack
    - Success chance: evasion_skill/3 - armor_penalty
    - 0 ticks (reactive)
    
  Defensive_Position:
    - Lower profile (prone)
    - Behind cover (+cover bonus)
    - Formation fighting (+ally bonus)

Free_Action_Scaling:
  Skill_Progression_Benefits:
    - Higher skills improve free action effectiveness
    - Damage, accuracy, and defense scale continuously
    - No efficiency improvements (maintains balance vs AP abilities)
    - Master-level skills unlock minor free action variations
```

### Free Utility Actions (No AP Cost)
```yaml
Basic_Interactions:
  - Pick up/drop items (0 ticks)
  - Open/close doors (1 tick)
  - Talk to adjacent characters (0 ticks)
  - Simple environmental interactions (1 tick)
  
Basic_Perception:
  - Look around (spot visible threats)
  - Listen for sounds (basic audio detection)
  - Quick search (obvious items only)
  
Basic_Social:
  - Shout commands to allies (0 ticks)
  - Basic gestures/signals (0 ticks)
  - Simple intimidation (threaten gesture)
  
Equipment_Management:
  - Switch weapons (2 ticks)
  - Ready/stow shield (1 tick)
  - Drink potion (quick consumption only)
```

---

## AP ABILITY CATEGORIES

### Weapon Mastery Abilities (1-6 AP)
```yaml
Light_AP_Abilities: (1-2 AP)
  Enhanced_Strikes:
    - Precise Strike: +accuracy, +crit chance (1 AP)
    - Quick Strike: Reduced tick cost attack (1 AP)
    - Defensive Strike: Attack + defensive bonus (2 AP)
    
  Basic_Techniques:
    - Disarm Attempt: Remove enemy weapon (2 AP)
    - Weapon Trip: Knock prone with weapon (2 AP)
    - Intimidating Strike: Fear effect (1 AP)

Medium_AP_Abilities: (3-4 AP)
  Combat_Techniques:
    - Power Attack: +50% damage, +1 tick (3 AP)
    - Cleaving Strike: Hit multiple enemies (3 AP)
    - Riposte: Counter-attack on dodge (3 AP)
    - Multi-Strike: Multiple rapid attacks (4 AP)
    
  Tactical_Abilities:
    - Combat Maneuver: Complex positioning (3 AP)
    - Weapon Throw: Ranged weapon attack (3 AP)
    - Defensive Expertise: Enhanced blocking (4 AP)

Heavy_AP_Abilities: (5-6 AP)
  Master_Techniques:
    - Perfect Strike: Guaranteed critical hit (5 AP)
    - Devastating Blow: Maximum damage + effect (6 AP)
    - Weapon Master: Unique signature technique (6 AP)
    - Legendary Strike: Class-specific ultimate (6 AP)
```

### Magic School Abilities (1-8 AP)
```yaml
Cantrips: (1 AP)
  - Spark (Fire): Minor damage
  - Chill (Ice): Slow effect
  - Shock (Lightning): Instant damage
  - Mend (Earth): Minor repair
  - Light Touch (Healing): Small heal
  - Scare (Necromancy): Minor fear

Basic_Spells: (2-3 AP)
  - Flame Arrow (Fire): Enhanced projectile (2 AP)
  - Ice Armor (Ice): Damage reduction (3 AP)
  - Lightning Weapon (Lightning): Weapon enhancement (2 AP)
  - Stone Skin (Earth): Physical resistance (3 AP)
  - Heal Wounds (Healing): Moderate healing (3 AP)
  - Drain Life (Necromancy): Damage + self heal (3 AP)

Advanced_Spells: (4-5 AP)
  - Fireball (Fire): Area damage (4 AP)
  - Blizzard (Ice): Large area slow + damage (5 AP)
  - Chain Lightning (Lightning): Multi-target (4 AP)
  - Earth Wall (Earth): Terrain modification (4 AP)
  - Major Heal (Healing): Strong healing (4 AP)
  - Animate Dead (Necromancy): Summon ally (5 AP)

Master_Spells: (6-8 AP)
  - Meteor (Fire): Devastating area attack (7 AP)
  - Absolute Zero (Ice): Instant kill attempt (6 AP)
  - Thunder Storm (Lightning): Battlefield control (8 AP)
  - Earthquake (Earth): Massive area effect (8 AP)
  - Resurrection (Healing): Restore fallen ally (8 AP)
  - Soul Storm (Necromancy): Multiple life drain (7 AP)

Magic_Scaling:
  Staff_Bonuses:
    - Basic Staff: -1 AP on spells 3+ AP (skill 25+)
    - Magic Staff: Additional metamagic options (skill 50+)
    - Crystal Staff: -1 AP on all spells (skill 75+)
    
  Skill_Synergies:
    - Multi-school casters gain combination spells
    - Higher skills unlock lower AP costs
    - Master mages (75+) gain unique spell variants
```

### Combat Expertise Abilities (1-5 AP)
```yaml
Evasion_Mastery: (1-4 AP)
  - Enhanced Dodge: Better dodge chance (1 AP)
  - Combat Movement: Move + maintain defense (2 AP)
  - Perfect Evasion: Avoid all attacks this turn (4 AP)
  - Shadow Dance: Enhanced mobility (3 AP)

Blocking_Mastery: (1-5 AP)
  - Active Parry: Block + counter chance (2 AP)
  - Shield Bash: Offensive shield use (1 AP)
  - Shield Wall: Protect allies (3 AP)
  - Perfect Block: Negate any single attack (5 AP)

Dual_Wielding_Techniques: (2-5 AP)
  - Twin Strike: Attack with both weapons (2 AP)
  - Flurry: Multiple rapid attacks (3 AP)
  - Blade Barrier: Defensive spinning (4 AP)
  - Whirlwind: Attack all adjacent enemies (5 AP)

Two_Handed_Mastery: (2-6 AP)
  - Great Swing: High damage single attack (2 AP)
  - Sweeping Attack: Hit multiple enemies (3 AP)
  - Devastating Strike: Armor-penetrating blow (5 AP)
  - Weapon Master: Ultimate two-handed technique (6 AP)
```

### Stealth & Utility Abilities (1-5 AP)
```yaml
Stealth_Operations: (1-4 AP)
  - Enter Stealth: Become hidden (1 AP)
  - Sneak Attack: Damage from stealth (2 AP)
  - Shadow Step: Short-range teleport (3 AP)
  - Invisibility: Complete concealment (4 AP)

Advanced_Perception: (1-3 AP)
  - Deep Search: Find hidden objects (2 AP)
  - Danger Sense: Detect traps/ambushes (1 AP)
  - True Sight: See through illusions (3 AP)

Social_Abilities: (2-4 AP)
  - Intimidate: Cause fear in enemies (2 AP)
  - Diplomacy: Peaceful resolution attempt (3 AP)
  - Rally: Boost party morale (4 AP)

Utility_Mastery: (2-5 AP)
  - Master Lockpicking: Open any lock (2-4 AP by complexity)
  - Survival Expertise: Environmental resistance (2 AP)
  - Athletic Feat: Climbing, jumping, running (2-3 AP)
  - Leadership Command: Coordinate party (3 AP)
```

### Crafting Abilities (2-6 AP)
```yaml
Combat_Crafting: (2-4 AP)
  - Emergency Repair: Fix equipment mid-combat (2 AP)
  - Quick Potion: Create basic healing item (3 AP)
  - Temporary Enhancement: Weapon/armor buff (3 AP)
  - Field Cooking: Create beneficial food (2 AP)
  - Set Trap: Place simple trap (3 AP)

Advanced_Crafting: (4-6 AP)
  - Master Enhancement: Powerful equipment buff (5 AP)
  - Superior Potion: Multi-effect consumable (4 AP)
  - Complex Trap: Dangerous area denial (5 AP)
  - Legendary Craft: Unique item creation (6 AP)
```

---

## TURN STRUCTURE & TIMING

### Initiative Phase (2 seconds)
```yaml
Initiative_Roll:
  Formula: d20 + primary_skill_modifier + equipment_bonus
  Primary_Skill: Highest relevant skill for character build
  Equipment_Bonus: Weapon + armor initiative modifiers
  
Turn_Order_Declaration:
  - Highest initiative declares actions first
  - Players can choose to delay their turn
  - Emergency actions can interrupt (costs +1 AP)
```

### Action Declaration Phase (5-8 seconds)
```yaml
Free_Action_Declaration:
  - Movement: Choose destination and path
  - Attack: Choose target and weapon type
  - Defense: Choose defensive stance/action
  
AP_Ability_Selection:
  - Choose abilities based on available AP
  - Declare targets and positioning
  - Can bank AP for defensive reactions
  
Coordination_Window:
  - Quick voice chat for group coordination
  - Simple command system for common tactics
  - Formation positioning adjustments
```

### Resolution Phase (Tick System Integration)
```yaml
Simultaneous_Execution:
  - All free actions resolve in tick system
  - AP abilities execute based on their tick costs
  - Combat calculations use existing formulas
  
Action_Priority:
  1. Movement (establishes positioning)
  2. Free defensive actions
  3. AP defensive abilities
  4. Free attacks
  5. AP combat abilities
  6. Magic and utility AP abilities
```

---

## 8-PLAYER COORDINATION MECHANICS

### Formation Tactics
```yaml
Front_Line_Coordination:
  Free_Actions:
    - Basic positioning for shield wall
    - Standard attacks in formation
    - Simple defensive stances
    
  AP_Enhancements:
    - Shield Wall (3 AP): Protect entire back line
    - Formation Fighting (2 AP): Coordinated attacks
    - Defensive Mastery (4 AP): Enhanced protection

Back_Line_Support:
  Free_Actions:
    - Basic movement to safe positions
    - Standard ranged attacks
    - Simple communication
    
  AP_Abilities:
    - Multi-target spells (4-6 AP)
    - Battlefield control (5-8 AP)
    - Group buffs and healing (3-5 AP)
```

### Synchronized AP Spending
```yaml
Combo_Attacks:
  Setup_Phase:
    - Players declare coordinated action
    - Free actions establish positioning
    - AP abilities execute in sequence
    
  Example_Combos:
    Mage_Warrior_Combo:
      - Mage: Enhancement spell (3 AP)
      - Warrior: Enhanced attack (free action)
      - Result: Powerful combined effect
      
    Tank_Support_Chain:
      - Tank: Shield Wall (3 AP)
      - Support: Rally party (4 AP)
      - Others: Free attacks from safety

Emergency_Coordination:
  Interrupt_System:
    - Spend +1 AP to act out of turn order
    - Emergency healing and rescue actions
    - Defensive reactions to protect allies
    
  Group_Resources:
    - Shared AP abilities (Leadership-based)
    - Emergency AP transfers (rare items)
    - Coordinated AP banking for big plays
```

### Communication Systems
```yaml
Quick_Commands:
  - F-key shortcuts for common tactics
  - Voice chat integration for complex plans
  - Visual indicators for formation positions
  
Tactical_Planning:
  - 10-second planning phase before initiative
  - Simple battlefield map with movement arrows
  - Pre-set combination attack patterns
```

---

## BALANCE FRAMEWORK

### Free Action Power Levels
```yaml
Baseline_Effectiveness:
  Damage_Per_Turn:
    - Novice (0-24 skill): 4-8 damage from free attacks
    - Competent (25-49 skill): 6-12 damage from free attacks
    - Expert (50-74 skill): 8-16 damage from free attacks
    - Master (75+ skill): 10-20 damage from free attacks
    
  Defensive_Value:
    - All builds have access to basic blocking/dodging
    - Armor provides consistent protection scaling
    - No free action becomes obsolete at higher levels
    
  Utility_Access:
    - Basic movement and interaction always available
    - Simple communication and item use remain viable
    - Environmental interaction scales with relevant skills
```

### AP Ability Power Scaling
```yaml
AP_Efficiency_Curves:
  1_AP_Abilities: 1.5x free action effectiveness
  2_AP_Abilities: 2x free action effectiveness
  3_AP_Abilities: 3x free action effectiveness
  4_AP_Abilities: 4.5x free action effectiveness
  5_AP_Abilities: 6x free action effectiveness
  6_AP_Abilities: 8x free action effectiveness

Resource_Investment_Returns:
  Conservative_Play: Use 1-2 AP per turn, save for defense
  Balanced_Play: Alternate between free actions and 3-4 AP abilities
  Aggressive_Play: Save AP across turns for 5-6 AP abilities
  
Skill_Scaling_Benefits:
  Higher_Skills: Reduce AP costs (minimum 1 AP)
  Master_Level: Access to unique AP abilities
  Multi_Skill: Combination abilities requiring multiple skills
```

### Progression Validation
```yaml
Early_Game: (Skills 0-25)
  - Free actions provide solid baseline effectiveness
  - 1-2 AP abilities offer meaningful upgrades
  - Combat feels tactical without overwhelming complexity
  
Mid_Game: (Skills 25-50)
  - AP abilities become more diverse and powerful
  - Free actions remain viable for resource conservation
  - Build specialization becomes apparent
  
Late_Game: (Skills 50-75)
  - High-AP abilities enable dramatic tactical plays
  - Free actions enhanced by skill synergies
  - Master-level coordination unlocks group strategies
  
End_Game: (Skills 75+)
  - Ultimate abilities require careful AP management
  - Free actions gain unique master-level variants
  - Full build potential realized through AP efficiency
```

---

## IMPLEMENTATION INTEGRATION

### Tick System Compatibility
```typescript
interface RefinedAction {
  type: 'FREE' | 'AP_ABILITY'
  apCost: number  // 0 for free actions, 1-8 for AP abilities
  tickCost: number  // Maps to existing tick system
  priority: ActionPriority
  requiresSkills: SkillRequirement[]
  equipmentRestrictions: EquipmentRestriction[]
}

// Free actions execute immediately in tick system
const freeActionMapping = {
  "basic_move": { apCost: 0, tickCost: 1 },
  "basic_attack": { apCost: 0, tickCost: 2 },
  "block_stance": { apCost: 0, tickCost: 0 },
  "dodge_attempt": { apCost: 0, tickCost: 0 }
}

// AP abilities map to enhanced versions
const apAbilityMapping = {
  "power_attack": { apCost: 3, tickCost: 3 },
  "fireball": { apCost: 4, tickCost: 5 },
  "perfect_strike": { apCost: 5, tickCost: 4 },
  "meteor": { apCost: 7, tickCost: 8 }
}
```

### User Interface Design
```yaml
Quick_Action_Bar:
  - Left side: Free actions (always available)
  - Right side: AP abilities (show AP costs)
  - Center: Current AP pool and regeneration
  
Turn_Timer:
  - 10-second countdown for action declaration
  - Visual indicators for free vs AP actions
  - Quick-select for common ability combinations
  
Coordination_UI:
  - Formation positioning grid
  - AP ability coordination indicators
  - Voice chat integration controls
```

This refined AP system maintains tactical depth while dramatically improving turn speed and accessibility. Free actions provide consistent baseline effectiveness while AP abilities offer powerful upgrades that scale with player skill and coordination. The system supports both individual mastery and group tactics essential for 8-player coordination.

File: /C:/Dev/New Test/docs/game-design/REFINED-AP-SYSTEM-WITH-FREE-ACTIONS.md