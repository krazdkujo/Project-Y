# ADOM-Inspired Mechanics for MUD Tick System

**Document Version**: 1.0  
**Date**: 2025-08-19  
**Based on**: Research-specialist analysis of ADOM (Ancient Domains of Mystery)  
**Purpose**: Adapt proven ADOM mechanics to MUD-inspired real-time coordination

---

## 🎮 Core ADOM Principles Applied

### 1. Action Economy Adaptation
**ADOM Original**: Pure turn-based where each action consumes one turn
**MUD Adaptation**: Action point system where different actions cost different ticks

```yaml
Action Costs (in ticks):
  Movement: 1 tick
  Basic Attack: 2 ticks
  Power Attack: 3 ticks
  Skill Use: 3-5 ticks
  Cast Spell: 4-6 ticks
  Use Item: 1-2 ticks
  Rest/Wait: 1 tick
  Search: 2 ticks
```

**Benefits**: 
- Maintains ADOM's tactical depth
- Allows real-time coordination for multi-player
- Creates natural action priority system

### 2. Command Efficiency (Direct from ADOM)
**Single-Key Commands** for maximum efficiency:

```yaml
Movement:
  hjkl: vi-style directional movement
  yubn: diagonal movement
  numpad: alternative directional controls

Combat:
  f: fight/attack
  r: ranged attack  
  g: guard/defend
  shift+direction: run until obstacle

Items:
  a: apply/use item
  d: drop item
  e: eat food
  q: quaff potion
  r: read scroll
  w: wield weapon
  W: wear armor

Skills:
  s: skill menu
  hotkeys: direct skill activation (customizable)

Utility:
  o: open door/container
  c: close door
  l: look/examine
  i: inventory
  <: go up stairs
  >: go down stairs
  .: rest/wait
```

### 3. Skill Training Philosophy
**ADOM Method**: Skills improve through use with diminishing returns
**Our Implementation**: 
```
Use-Based Training:
- Each skill use has chance to improve
- Chance decreases as skill level increases
- Different actions train different skills
- Cross-training penalties prevent exploitation

Training Rates:
Levels 0-25:   20% improvement chance per use
Levels 25-50:  15% improvement chance per use  
Levels 50-75:  10% improvement chance per use
Levels 75-100: 5% improvement chance per use
```

### 4. Character Attributes (ADOM-Style)
**Six Core Attributes** (simplified from ADOM's 9):
```yaml
Strength (St):     # Melee damage, carry capacity
  affects: [combat_damage, encumbrance, weapon_requirements]
  
Dexterity (Dx):    # Speed, accuracy, dodging
  affects: [hit_chance, dodge_chance, missile_accuracy, action_speed]
  
Constitution (Co): # Health, healing, poison resistance  
  affects: [max_health, healing_rate, disease_resistance]
  
Intelligence (In): # Spell power, skill learning
  affects: [mana_points, spell_damage, skill_training_speed]
  
Wisdom (Wi):       # Spell defense, perception
  affects: [spell_resistance, detection_chance, mana_regeneration]
  
Charisma (Ch):     # Social interactions, leadership
  affects: [npc_reactions, party_coordination, morale]
```

**Training Attributes**:
- Train through relevant activities (ADOM style)
- Slow natural improvement over time
- Account progression unlocks higher training caps

---

## ⚔️ Combat System Adaptation

### ADOM Combat Philosophy
**"Preparation over Reflexes"** - Success depends on:
- Equipment choices
- Tactical positioning  
- Resource management
- Environmental awareness

### Combat Resolution (ADOM-Inspired)
```typescript
// Hit chance calculation
hit_chance = base_chance + skill_modifier + weapon_bonus + attribute_bonus
base_chance = 50% // reasonable success chance
skill_modifier = floor(skill_level / 4) // 0-25 bonus
weapon_bonus = weapon.accuracy // varies by weapon type
attribute_bonus = floor(dexterity / 4) // 0-6 typical bonus

// Damage calculation  
damage = weapon_base + strength_bonus + skill_bonus - armor_reduction
weapon_base = weapon.damage // 1d4 to 2d6 typical
strength_bonus = floor(strength / 4) 
skill_bonus = floor(combat_skill / 10) // 0-10 bonus
armor_reduction = armor.protection + floor(constitution / 6)

// Critical hits
critical_chance = weapon.crit_chance + floor(skill_level / 20)
critical_multiplier = 2.0 + (skill_level / 100) // 2.0x to 3.0x
```

### Tactical Elements (From ADOM)
```yaml
Positioning:
  - Ranged advantage (attack from distance)
  - Chokepoints (limit enemy approaches)
  - Flanking (attack from multiple directions)
  - High ground (bonus to accuracy and defense)

Equipment Switching:
  - Slashing weapons vs unarmored
  - Piercing weapons vs armored  
  - Blunt weapons vs skeletons
  - Silver weapons vs undead

Resource Management:
  - Limited healing potions
  - Ammunition conservation  
  - Spell components
  - Food and rest requirements
```

---

## 🏰 Dungeon Design (ADOM Approach)

### ADOM Dungeon Philosophy
**Hybrid Structure**: Fixed special areas + procedural standard areas
**Persistent Generation**: Levels don't change when revisited
**Themed Progression**: Different areas have distinct challenges

### Our Dungeon System
```yaml
Level Structure (MVP):
  1-2: Tutorial Levels
    monsters: [goblin, rat, kobold]
    loot: [basic_weapons, healing_potions, simple_armor]
    hazards: [pit_traps, locked_doors]
    
  3-5: Standard Levels  
    monsters: [orc, hobgoblin, wolf, spider]
    loot: [good_weapons, magic_potions, chain_armor]
    hazards: [dart_traps, poison_gas, darkness]
    
  6-8: Dangerous Levels
    monsters: [troll, ogre, wraith, fire_elemental] 
    loot: [rare_weapons, powerful_potions, plate_armor]
    hazards: [teleport_traps, cursed_items, energy_drain]
    
  9: Boss Preparation
    monsters: [elite_guards, boss_minions, champions]
    loot: [legendary_weapons, master_potions, magical_armor]
    hazards: [death_traps, illusions, time_pressure]
    
  10: Final Boss
    monsters: [unique_boss, boss_forms, final_guardians]
    loot: [artifact_weapons, victory_rewards, rare_materials]
    hazards: [environmental_changes, escalating_difficulty]
```

### Room Generation (ADOM-Style)
```yaml
Room Types:
  combat_room: 60%        # 1-3 enemies, minimal loot
  treasure_room: 15%      # loot focus, minimal enemies  
  trap_room: 10%          # hazards, skill challenges
  empty_room: 10%         # rest opportunities, hidden secrets
  special_room: 5%        # unique encounters, story elements

Room Features:
  - Multiple entrances when possible
  - Environmental interactions
  - Hidden secrets (20% of rooms)
  - Tactical positioning options
  - Risk/reward choices
```

---

## 💀 Permadeath Balance (ADOM Wisdom)

### ADOM Permadeath Philosophy
**"Death should be meaningful but not crushing"**
- Full permadeath maintains tension
- Account progression provides continuity
- Learning from failure is core gameplay

### Our Implementation
```yaml
Character Death:
  immediate_loss:
    - All equipment and inventory
    - Current character skills and attributes
    - Dungeon progress and position
    
  account_benefits:
    - Knowledge points based on achievements
    - Unlocked starting options
    - Improved starting equipment quality
    - Access to advanced character builds

Knowledge Point Sources:
  skill_training: 1 point per skill level achieved
  exploration: 5 points per dungeon level completed
  combat: 2 points per unique monster type defeated  
  bosses: 50 points per boss defeated
  completion: 100 points per full dungeon run
  
New Character Benefits:
  starting_skills: floor(knowledge_points / 20)
  equipment_quality: knowledge_tier unlocks
  attribute_bonuses: small permanent improvements
  special_abilities: unlock unique starting powers
```

### Learning Modes (ADOM-Inspired)
```yaml
Practice Mode:
  - Save/restore allowed for learning
  - Reduced stakes for experimentation
  - No account progression
  - Tutorial emphasis
  
Ironman Mode:  
  - True permadeath, no saves
  - Full account progression
  - Leaderboard participation
  - Achievement eligibility
```

---

## 🎲 Skill System Scaling

### ADOM Skill Categories
**Broad Categories** with **Specific Skills** within each:

```yaml
Combat Skills:
  melee_combat:     # general fighting ability
    weapons: [sword, axe, mace, dagger, staff]
    techniques: [power_attack, defensive_stance, disarm]
    
  ranged_combat:    # missile weapon mastery
    weapons: [bow, crossbow, thrown, sling]
    techniques: [aimed_shot, rapid_fire, ricochet]

Magic Skills:
  spellcasting:     # general magical ability
    schools: [fire, ice, lightning, earth, air, water]
    metamagic: [extend, amplify, split, quicken]
    
  healing_magic:    # restoration and support
    techniques: [heal, cure, blessing, protection]

Utility Skills:
  stealth:          # avoiding detection
    techniques: [hide, move_silently, backstab, ambush]
    
  survival:         # environmental mastery
    techniques: [forage, track, weather_sense, navigation]
    
  crafting:         # item creation and modification
    disciplines: [smithing, alchemy, enchanting, cooking]
```

### Progression Unlocks
```yaml
Skill Level Unlocks:
  20: Basic techniques available
  40: Advanced techniques available  
  60: Master techniques available
  80: Legendary techniques available
  100: Unique signature abilities

Cross-Skill Synergies:
  combat + smithing = weapon_repair
  stealth + archery = sniper_shot
  magic + crafting = enchanted_items
  survival + healing = herbal_medicine
```

---

## 👥 Multi-Player Adaptation

### ADOM to MUD Coordination
**ADOM Strength**: Careful individual planning
**MUD Addition**: Group coordination and timing

### Coordination Mechanics
```yaml
Formation System:
  - Designated leader for navigation
  - Support roles (healer, scout, guard)
  - Synchronized movement options
  - Emergency scatter procedures

Communication:
  - Text chat with quick commands
  - Visual markers for coordination
  - Emote system for roleplay
  - Strategic planning pauses

Resource Sharing:
  - Party pool for critical items
  - Skill specialization benefits
  - Equipment passing and borrowing
  - Collective risk/reward decisions
```

### Tick Coordination for Groups
```yaml
Action Timing:
  - Standard ticks: 2-3 seconds for planning
  - Combat ticks: 1-2 seconds for quick decisions  
  - Critical ticks: 5-10 seconds for major choices
  - Emergency mode: 0.5 seconds for reactions

Group Actions:
  - Majority vote for exploration decisions
  - Consensus required for major risks  
  - Leader override for time-critical situations
  - Democratic resource allocation
```

---

## 📊 Balance Testing Framework

### ADOM-Style Balance Philosophy
**"Every choice should matter"**
- No dominant strategies
- Multiple viable approaches
- Risk/reward clearly communicated
- Player skill more important than character power

### Testing Metrics
```yaml
Character Viability:
  - All skill builds can complete content
  - Specialization provides advantages
  - Generalization remains viable
  - Player preference drives choices

Progression Pacing:
  - Steady advancement feeling
  - Meaningful milestones every 2-3 levels
  - Clear power increases at major thresholds
  - Eventual plateau for mastery

Risk/Reward Balance:
  - Higher risk = proportionally higher reward
  - Safe strategies remain viable
  - Aggressive strategies offer clear benefits
  - Player choice drives risk tolerance
```

---

## 🚀 Implementation Priority

### Phase 1: Core ADOM Features (MVP)
1. **Single-key command system** - immediate efficiency
2. **Use-based skill training** - core progression mechanics
3. **Tactical combat** - positioning and equipment matter
4. **Meaningful permadeath** - with account progression
5. **ADOM-style dungeon** - 10 levels with proper difficulty curve

### Phase 2: Advanced ADOM Features
1. **Expanded skill trees** - specialization options
2. **Complex item interactions** - equipment synergies
3. **Environmental challenges** - beyond simple combat
4. **NPC interactions** - social gameplay elements

### Phase 3: MUD Integration Features  
1. **Group coordination** - multi-player tactical decisions
2. **Real-time elements** - tick-based action economy
3. **Persistent world** - multiple dungeons and areas
4. **Social features** - guilds, competition, cooperation

This framework preserves ADOM's proven design wisdom while adapting it for modern multi-player coordination and real-time tactical gameplay.