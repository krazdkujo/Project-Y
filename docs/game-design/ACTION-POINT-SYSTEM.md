# Action Point System: Turn-Based Tactical Overlay

**Document Version**: 1.0  
**Date**: 2025-08-22  
**Status**: Core System Design  
**Maintained By**: Story-Writer/DM Agent

---

## System Philosophy

**Tick-AP Integration** - Action Points provide tactical turn structure over the existing 2-second tick system  
**Skill-Based Initiative** - Turn order determined by skill levels and equipment bonuses  
**Resource Management** - Limited AP forces meaningful tactical decisions  
**8-Player Coordination** - AP system enables complex group tactics and timing  
**Balanced Progression** - All 34 skills remain viable through AP cost scaling  

---

## Core Action Point Framework

### AP Pool Mechanics
```yaml
Base_AP_Per_Turn: 4
Carryover_Maximum: 2
Total_Maximum_AP: 6
Turn_Window: 30 seconds (real-time deadline for AP spending)

AP_Regeneration:
  - Start of each turn: Gain 4 AP
  - Unused AP: Carry over up to 2 AP to next turn
  - Maximum possible: 6 AP in a single turn (4 new + 2 carried)
  
Turn_Structure:
  - Initiative phase: Determine turn order (d20 + modifiers)
  - Action phase: Players spend AP on actions
  - Resolution phase: All actions execute simultaneously in tick system
  - Recovery phase: AP regeneration and status updates
```

### Initiative System
```typescript
// Initiative determines turn order within each round
initiative_roll = d20 + primary_skill_modifier + equipment_bonus + situational_modifiers

primary_skill_modifier = floor(highest_relevant_skill / 4)  // 0-25 bonus
equipment_bonus = weapon.initiative_bonus + armor.initiative_bonus  // varies by equipment
situational_modifiers = positioning + buffs + debuffs + leadership_effects

// Initiative Skills by Role:
// Combat: Highest weapon skill + Evasion or Blocking
// Magic: Highest magic school + Staves (if applicable)
// Stealth: Stealth + Daggers
// Support: Leadership + Athletics
// Crafting: Perception + relevant crafting skill
```

---

## AP Costs by Skill Category

### Weapon Skills (7 Skills) - AP Cost Structure
```yaml
Basic_Attacks: 2 AP
  - All weapon types (Swords, Maces, Axes, Daggers, Staves, Bows, Crossbows)
  - Base 2-tick actions in current system
  - Accuracy and damage scale with weapon skill

Power_Attacks: 3 AP  
  - High damage techniques (3-4 tick actions)
  - +50% damage, +1 tick cost in current system
  - Available at skill level 15+

Weapon_Abilities: 3-5 AP
  - Riposte (Swords): 3 AP, reactive counter-attack
  - Smite (Maces): 4 AP, holy damage vs undead
  - Aimed_Shot (Bows): 3 AP, high accuracy shot
  - Backstab (Daggers): 4 AP, stealth attack bonus
  - Multi_Shot (Bows): 5 AP, multiple targets

Ultimate_Abilities: 6+ AP
  - Perfect_Strike (Swords): 6 AP, guaranteed critical
  - Devastating_Blow (Maces): 6 AP, massive damage + knockdown
  - Piercing_Arrow (Bows): 5 AP, penetrates multiple targets
  - Blade_Dance (Dual Swords): 7 AP, multi-target whirlwind
  
Scaling_Rules:
  - Skill 0-24: Base costs apply
  - Skill 25-49: -1 AP for abilities (minimum 1 AP)
  - Skill 50-74: Additional -1 AP for ultimates
  - Skill 75+: Weapon mastery grants special AP efficiency bonuses
```

### Armor Skills (4 Skills) - Defensive AP Actions
```yaml
Active_Defense: 1-2 AP
  Block (Shields): 1 AP, defensive stance until next turn
  Dodge_Roll (Light): 2 AP, evasion attempt with movement
  Brace (Heavy): 1 AP, reduce incoming damage, cannot move
  
Armor_Abilities: 2-4 AP
  Shield_Bash (Shields): 2 AP, offensive use of shield
  Shield_Wall (Heavy+Shields): 3 AP, protect allies behind
  Armor_Expertise (Medium): 2 AP, temporary damage reduction buff
  Acrobatics (Light): 3 AP, enhanced movement and positioning

Defense_Mastery: 4-6 AP
  Perfect_Block (Shields): 4 AP, negate any single attack
  Fortress_Stance (Heavy): 5 AP, immobile but nearly invulnerable
  Combat_Reflexes (Light): 6 AP, extra actions when outnumbered
  
Initiative_Modifiers:
  - Light Armor: +3 to initiative rolls
  - Medium Armor: +0 to initiative rolls  
  - Heavy Armor: -3 to initiative rolls
  - Shields: -1 to initiative rolls (balanced by defensive power)
```

### Magic Schools (6 Skills) - Spell AP Costs
```yaml
Cantrips: 1-2 AP
  - Spark (Fire): 1 AP, minor damage
  - Chill (Ice): 1 AP, slow effect
  - Shock (Lightning): 1 AP, instant damage
  - Minor_Heal (Healing): 2 AP, small health restoration

Basic_Spells: 3-4 AP  
  - Fireball (Fire): 3 AP, area damage
  - Ice_Shard (Ice): 3 AP, single target + slow
  - Lightning_Bolt (Lightning): 3 AP, line attack
  - Stone_Skin (Earth): 4 AP, damage reduction buff
  - Cure_Disease (Healing): 3 AP, remove debuffs
  - Life_Drain (Necromancy): 4 AP, damage + heal self

Advanced_Spells: 5-6 AP
  - Flame_Strike (Fire): 5 AP, high damage to single target
  - Blizzard (Ice): 6 AP, large area effect
  - Chain_Lightning (Lightning): 5 AP, multiple targets
  - Earthquake (Earth): 6 AP, massive area disruption
  - Major_Heal (Healing): 5 AP, significant restoration
  - Animate_Dead (Necromancy): 6 AP, summon skeleton ally

Master_Spells: 7+ AP
  - Meteor (Fire): 8 AP, devastating area attack
  - Absolute_Zero (Ice): 7 AP, instant kill attempt
  - Thunder_Storm (Lightning): 9 AP, battlefield control
  - Resurrection (Healing): 10 AP, restore fallen ally
  - Soul_Storm (Necromancy): 8 AP, multiple life drain

Metamagic_Modifiers:
  - Quicken_Spell: -2 AP cost (minimum 1 AP)
  - Extend_Spell: +1 AP cost, double duration
  - Amplify_Spell: +2 AP cost, +50% effect
  
Staff_Bonuses:
  - Basic Staff: -1 AP for spells (skill 25+)
  - Magic Staff: -1 AP for spells + metamagic discount (skill 50+)
  - Crystal Staff: -2 AP for spells (skill 75+)
```

### Combat Skills (4 Skills) - Tactical AP Actions
```yaml
Evasion_Actions: 1-3 AP
  - Basic_Dodge: 1 AP, attempt to avoid next attack
  - Combat_Movement: 2 AP, move and maintain defense
  - Perfect_Evasion: 3 AP, avoid all attacks this turn

Blocking_Actions: 1-4 AP
  - Ready_Block: 1 AP, defensive stance
  - Active_Parry: 2 AP, counterattack opportunity  
  - Defensive_Mastery: 4 AP, protect adjacent allies

Dual_Wielding_Actions: 3-6 AP
  - Twin_Strike: 3 AP, attack with both weapons
  - Flurry: 4 AP, multiple rapid attacks
  - Blade_Barrier: 5 AP, defensive spinning technique
  - Whirlwind: 6 AP, attack all surrounding enemies

Two_Handed_Actions: 3-7 AP
  - Power_Swing: 3 AP, high damage single attack
  - Great_Cleave: 4 AP, attack multiple enemies in line
  - Devastating_Strike: 6 AP, armor-penetrating blow
  - Weapon_Master: 7 AP, ultimate two-handed technique

Initiative_Bonuses:
  - Evasion 50+: +2 initiative from enhanced reflexes
  - Dual_Wielding 40+: +1 initiative from ambidextrous training
  - Two_Handed 60+: +1 initiative from weapon mastery reach
```

### Crafting Skills (5 Skills) - Utility AP Actions
```yaml
Quick_Crafting: 2-4 AP (during combat)
  - Emergency_Potion (Alchemy): 3 AP, create basic healing potion
  - Weapon_Repair (Smithing): 2 AP, restore weapon durability
  - Quick_Enchant (Enchanting): 4 AP, temporary weapon enhancement
  - Field_Cooking (Cooking): 2 AP, create stamina-restoring food
  - Set_Trap (Trap_Making): 3 AP, place simple trap

Advanced_Crafting: 5+ AP
  - Master_Potion (Alchemy): 5 AP, create powerful healing/buff potion
  - Weapon_Enhancement (Smithing): 6 AP, improve weapon stats temporarily
  - Battle_Enchantment (Enchanting): 7 AP, powerful temporary enchantment
  - Gourmet_Meal (Cooking): 5 AP, create meal with multiple benefits
  - Complex_Trap (Trap_Making): 6 AP, dangerous area-denial trap

Resource_Requirements:
  - All crafting requires appropriate materials in inventory
  - Higher-tier crafting requires rare components
  - Failed crafting consumes materials but refunds 50% AP cost
  - Crafting quality scales with skill level (success chance and effect power)
```

### Passive Skills (8 Skills) - Exploration & Social AP
```yaml
Stealth_Actions: 2-5 AP
  - Enter_Stealth: 2 AP, attempt to become hidden
  - Sneak_Attack: 3 AP, enhanced damage from stealth
  - Shadow_Step: 4 AP, teleport between shadows
  - Invisibility: 5 AP, become completely undetectable

Perception_Actions: 1-3 AP
  - Search_Area: 2 AP, look for hidden objects/traps
  - Spot_Enemies: 1 AP, detect hostile creatures
  - True_Sight: 3 AP, see through illusions and invisibility

Social_Actions: 2-4 AP
  - Intimidate: 2 AP, cause fear in enemies
  - Diplomacy: 3 AP, attempt peaceful resolution
  - Rally_Allies: 4 AP, boost party morale and effectiveness

Utility_Actions: 1-4 AP
  - Lockpicking: 2-4 AP (based on lock complexity)
  - Survival_Skill: 2 AP, heal naturally or find resources
  - Athletic_Feat: 2-3 AP, climbing, jumping, or running
  - Leadership_Command: 3 AP, coordinate party actions

Initiative_Applications:
  - Perception 40+: +3 initiative from danger sense
  - Athletics 35+: +2 initiative from physical conditioning
  - Leadership 50+: Can grant initiative bonuses to party members
  - Stealth 25+: Can attempt to act in surprise round
```

---

## Action Economy & Combo Potential

### Standard Turn Patterns (4 AP Base)
```yaml
Melee_Fighter:
  - Move (1 AP) + Basic Attack (2 AP) + Block Stance (1 AP) = 4 AP
  - Power Attack (3 AP) + Ready Defense (1 AP) = 4 AP
  - Twin Strike (3 AP) + Dodge (1 AP) = 4 AP

Archer:
  - Move to Position (1 AP) + Aimed Shot (3 AP) = 4 AP
  - Multi Shot (5 AP) = Requires carryover AP from previous turn
  - Basic Shot (2 AP) + Basic Shot (2 AP) = 4 AP (rapid fire)

Mage:
  - Cantrip (1 AP) + Basic Spell (3 AP) = 4 AP  
  - Advanced Spell (5-6 AP) = Requires carryover or wait
  - Defensive Magic (2 AP) + Cantrip (1 AP) + Move (1 AP) = 4 AP

Support:
  - Heal Ally (2 AP) + Search Area (2 AP) = 4 AP
  - Rally Party (4 AP) = Full turn inspiration
  - Leadership Command (3 AP) + Move (1 AP) = 4 AP
```

### High-AP Turn Examples (6 AP with Carryover)
```yaml
Devastating_Combos:
  - Stealth (2 AP) + Shadow Step (4 AP) = 6 AP positioning
  - Perfect Strike (6 AP) = Maximum single attack
  - Master Spell (7-10 AP) = Requires multiple turns of saving
  - Complex Trap (6 AP) = Area denial setup

Multi_Action_Chains:
  - Move (1 AP) + Twin Strike (3 AP) + Dodge (2 AP) = 6 AP
  - Quickened Spell (3 AP) + Basic Attack (2 AP) + Block (1 AP) = 6 AP
  - Rally (4 AP) + Leadership Command (3 AP) = 7 AP (requires saving)
```

### Resource Management Strategies
```yaml
Conservative_Play: Save AP for defensive reactions
  - Spend 2-3 AP per turn, carry over 1-2 AP for emergencies
  - Focus on sustainable actions with guaranteed benefits
  - Prioritize positioning and defensive stances

Aggressive_Burst: Spend maximum AP for decisive moments
  - Use all 6 AP for maximum impact abilities
  - Coordinate with allies for synchronized high-AP turns
  - Risk vulnerability in following turns

Balanced_Approach: Mix efficiency with power
  - Alternate between 4 AP standard turns and 6 AP power turns
  - Use skill mastery to reduce AP costs over time
  - Adapt strategy based on party composition and enemy types
```

---

## 8-Player Coordination Mechanics

### Initiative Groups & Turn Order
```typescript
// Example 8-player initiative resolution
interface PlayerInitiative {
  playerId: string
  initiativeRoll: number
  skills: SkillModifiers
  equipment: EquipmentBonuses
  finalInitiative: number
}

// Turn order example:
// 1. Archer (Initiative 28) - High Perception + Light Armor
// 2. Rogue (Initiative 26) - High Stealth + Daggers
// 3. Warrior (Initiative 22) - High Swords + Medium Armor
// 4. Cleric (Initiative 21) - Healing Magic + Leadership
// 5. Wizard (Initiative 19) - Lightning Magic + Staff
// 6. Tank (Initiative 16) - Heavy Armor + Shields (penalized but defensive)
// 7. Crafter (Initiative 15) - Utility focused character
// 8. Diplomat (Initiative 14) - Social character in combat situation
```

### Coordinated Action Systems
```yaml
Formation_Tactics:
  Front_Line_Coordination:
    - Tanks use Shield Wall (3 AP) to protect back line
    - Melee fighters use Formation Fighting bonuses
    - +1 accuracy when adjacent to allies
    
  Ranged_Support:
    - Archers coordinate Multi Shot (5 AP) for focused fire
    - Mages use area spells to avoid friendly fire
    - Targeting priority communicated through Leadership

  Flanking_Maneuvers:
    - High-initiative characters move first to position
    - Low-initiative characters exploit positioning
    - +2 accuracy bonus for flanking (attacking from opposite sides)

Combined_Arms_Tactics:
  Spell_Sword_Combo:
    - Mage casts enhancement (3-4 AP)
    - Warrior uses enhanced weapon (2-3 AP)
    - Total coordination requires 2 turns but devastating

  Support_Chains:
    - Leader rallies party (4 AP) for temporary bonuses
    - Cleric heals injured (2-5 AP based on need)
    - Others capitalize on improved effectiveness

  Area_Control:
    - Trap Maker sets battlefield control (3-6 AP)
    - Earth Mage uses terrain modification (4-6 AP)  
    - Party controls enemy movement and positioning
```

### Communication & Timing
```yaml
Turn_Window_Management:
  - 30-second real-time limit per player turn
  - Voice chat or quick-command system for coordination
  - Emergency pause system (majority vote) for complex decisions

Action_Declarations:
  - Players declare intended actions during others' turns
  - Conditional actions: "Attack if ally moves enemy"
  - Ready actions: Hold AP to react to enemy actions

Initiative_Modification:
  - Leadership abilities can modify party initiative
  - Delay action: Choose to act later in initiative order
  - Rush action: Spend extra AP to interrupt turn order (emergency only)
```

---

## Progression Scaling & Balance Framework

### Skill Level Impact on AP Costs
```yaml
Novice (0-24): Full AP costs, learning basic efficiency
  - All actions cost base AP amounts
  - No special discounts or bonuses
  - Focus on learning optimal action combinations

Competent (25-49): First efficiency improvements
  - -1 AP discount on weapon/magic abilities (minimum 1 AP)
  - Access to intermediate techniques
  - Begin to access combo possibilities

Skilled (50-74): Significant cost reductions
  - Additional -1 AP on ultimate abilities  
  - Access to mastery techniques
  - Can perform previously impossible combinations

Expert (75-89): Master efficiency
  - Special mastery bonuses specific to each skill
  - Unique high-level abilities with unique AP costs
  - Can mentor other players for party-wide benefits

Master (90-100): Legendary efficiency
  - Maximum AP optimization in specialty
  - Access to master-only techniques
  - Can break normal AP cost rules in specific circumstances
```

### Equipment Scaling with AP System
```yaml
Weapon_Quality_AP_Bonuses:
  Basic_Weapons: No AP modification
  Fine_Weapons: No AP cost reduction, but improved accuracy/damage
  Masterwork_Weapons: -1 AP on power attacks (skill 50+ required)
  Enchanted_Weapons: Unique AP-related properties
    - "Swift" enchantment: -1 AP on all weapon actions
    - "Devastating" enchantment: +1 AP cost but massive damage bonus
  Legendary_Weapons: Unique AP mechanics
    - "Quicksilver Blade": Can split attacks across multiple 1 AP actions
    - "Earthbreaker Hammer": 1 AP AoE attacks instead of normal single-target

Armor_Quality_Initiative_Scaling:
  Basic_Armor: Standard initiative modifiers
  Fine_Armor: +1 initiative bonus
  Masterwork_Armor: +2 initiative bonus + special properties
  Enchanted_Armor: Unique initiative modifications
    - "Haste" enchantment: +3 initiative, can take extra 1 AP action per turn
    - "Fortified" enchantment: -2 initiative but gain 1 extra AP for defense only
  Legendary_Armor: Revolutionary AP mechanics
    - "Shadowweave Cloak": Can spend AP on stealth actions at half cost
    - "Platemail of the Eternal Guardian": Defensive actions cost 0 AP
```

### Class Synergy & Multi-Skill Builds
```yaml
Hybrid_Character_Benefits:
  Spell_Sword (Magic + Weapon): 
    - Can quicken spells with weapon mastery
    - Weapon attacks can trigger spell effects
    - Unique combo abilities requiring both skills

  Warrior_Leader (Combat + Leadership):
    - Can grant AP bonuses to allies through inspiration
    - Coordinated attacks reduce AP costs for party
    - Special formation-fighting techniques

  Stealth_Crafter (Stealth + Crafting):
    - Can set traps from stealth without breaking concealment
    - Sabotage enemy equipment using crafting knowledge
    - Create specialized infiltration tools

Skill_Gate_Synergies:
  - Some abilities require multiple skills but provide exceptional AP efficiency
  - Cross-training bonuses reduce AP costs when using complementary skills
  - Master-level characters can teach techniques to reduce party AP costs
```

---

## Balance Validation Framework

### Power Level Comparisons
```yaml
Single_Turn_Damage_Potential:
  Novice_Fighter: 2-6 damage per 4 AP turn (basic attack)
  Expert_Fighter: 8-15 damage per 4 AP turn (efficient techniques)
  Master_Fighter: 12-25 damage per 6 AP turn (ultimate techniques)

Utility_Action_Value:
  Novice_Support: Heal 5-10 HP per 2-3 AP
  Expert_Support: Heal 15-25 HP + buffs per 3-4 AP  
  Master_Support: Heal 25-40 HP + major buffs per 4-5 AP

Resource_Efficiency_Scaling:
  - Damage per AP should scale linearly with skill progression
  - Utility effects should provide increasing value at higher skill levels
  - No single skill should dominate across all AP cost ranges
```

### Risk-Reward Analysis
```yaml
High_AP_Actions_Risk:
  - Spending 5-6 AP leaves player vulnerable next turn
  - Enemy can capitalize on reduced AP availability
  - Requires tactical planning and party coordination

Low_AP_Actions_Consistency:
  - 1-2 AP actions provide reliable, sustainable pressure
  - Lower risk but also lower impact
  - Essential for defensive and utility play

Emergency_Action_Economy:
  - 1 AP defensive actions must remain viable for all builds
  - Emergency healing/movement cannot be prohibitively expensive
  - All players need access to basic defensive options
```

### Skill Viability Guarantees
```yaml
Combat_Viability: Every weapon skill path provides:
  - Effective 2 AP basic attacks at all levels
  - Meaningful 3-4 AP special techniques
  - Powerful 5+ AP ultimate abilities
  - Unique tactical advantages (reach, speed, damage type)

Magic_School_Balance: Each magic school offers:
  - Useful 1-2 AP cantrips for sustained casting
  - Effective 3-4 AP core spells for main damage/utility
  - Powerful 5+ AP advanced techniques
  - Unique battlefield roles (damage, control, support)

Crafting_Relevance: Each crafting skill provides:
  - Useful in-combat applications (2-4 AP range)
  - Long-term strategic value through equipment improvement
  - Unique problem-solving capabilities
  - Economic value in multiplayer trading
```

---

## Implementation Integration

### Tick System Compatibility
```typescript
// AP actions translate to existing tick costs
interface APAction {
  actionId: string
  apCost: number
  tickEquivalent: number  // Maps to existing tick system
  skillRequirements: SkillRequirement[]
  equipmentRestrictions: EquipmentRestriction[]
}

// Example mapping:
const actionMapping = {
  "basic_attack": { apCost: 2, tickEquivalent: 2 },
  "power_attack": { apCost: 3, tickEquivalent: 4 },
  "fireball": { apCost: 3, tickEquivalent: 5 },
  "perfect_strike": { apCost: 6, tickEquivalent: 8 }
}
```

### Real-Time Resolution
```yaml
Turn_Structure_Flow:
  1. Initiative_Phase: Calculate turn order (d20 + modifiers)
  2. Action_Declaration: 30-second window for AP allocation
  3. Action_Queue: Submit actions to existing tick system
  4. Simultaneous_Resolution: Use existing tick resolution
  5. State_Update: AP regeneration and status updates
  6. Next_Turn: Repeat cycle

Existing_System_Integration:
  - AP system adds tactical layer over existing tick mechanics
  - All existing combat formulas remain unchanged
  - Tick costs map directly to AP costs for seamless integration
  - Player coordination enhanced without changing core mechanics
```

This comprehensive Action Point system provides tactical depth while maintaining the integrity of the existing skill-based progression and real-time tick mechanics. The system ensures all 34 skills remain viable while adding meaningful strategic decisions for 8-player coordination.