# Folder Context: enemies

## Purpose
Enemy system managing AI entities with tier-based difficulty scaling, automatic ability assignment, and shared implementation with player systems. Provides intelligent opponents for the tactical ASCII roguelike with scalable challenge progression.

## Key Files
- `EnemySystem.js` - Complete enemy management including tier-based stats, ability auto-assignment, difficulty scaling, and AI behavior patterns

## Dependencies

### Internal
- `../abilities/core/AbilityEngine.js` - Shared ability system for enemy AI actions
- `../abilities/core/AbilitySlotManager.js` - Automatic ability slotting based on enemy tier and role
- `../character/skills/SkillSystem.js` - Enemy skill progression and ability requirements
- `../combat/CombatManager.js` - Combat integration and damage calculations
- `../core/EventSystem.js` - Enemy action notifications and death events

### External
- No external dependencies - pure JavaScript implementation

## Integration Points

### Shared Abilities System
- Enemies use identical ability definitions as players
- AbilitySlotManager handles automatic slot assignment based on tier and role
- Skill requirements and scaling work identically for enemy entities
- Status effects and combat mechanics fully shared between players and enemies

### Tier-Based Scaling System
- **Tier 1 (Floors 1-5):** 3 active + 1 passive ability slots
- **Tier 2 (Floors 6-10):** 4 active + 2 passive ability slots  
- **Tier 3 (Floors 11-15):** 5 active + 2 passive ability slots
- **Tier 4 (Floors 16-20):** 6 active + 3 passive ability slots
- **Tier 5 (Floors 21+):** 9 active + 5 passive ability slots (full player capacity)

### Difficulty Integration  
- Easy: Tier -1 to +0 offset, 0.8x stats, 0.9x loot
- Normal: Tier +0 to +1 offset, 1.0x stats, 1.0x loot
- Hard: Tier +0 to +2 offset, 1.2x stats, 1.2x loot  
- Nightmare: Tier +1 to +3 offset, 1.5x stats, 1.5x loot

### Role-Based AI Behavior
- **Tank:** Prioritizes defensive abilities, high health/armor
- **DPS:** Focuses on damage abilities, moderate health
- **Caster:** Emphasizes magic abilities, lower physical stats
- **Support:** Utility abilities, healing, battlefield control
- **Balanced:** Mixed ability selection across categories

## Enemy Architecture

### Auto-Assignment System
```javascript
// Ability priority by role
tank: ['defensive', 'combat', 'utility']
dps: ['combat', 'offensive', 'utility']  
caster: ['magic', 'utility', 'defensive']
support: ['utility', 'healing', 'defensive']
balanced: ['combat', 'defensive', 'utility', 'magic']
```

### Stat Scaling Formula
- Base stats determined by tier and enemy type
- Difficulty multiplier applied to health, damage, defense
- Skill levels auto-calculated based on tier for ability requirements
- Equipment generation scaled to tier and role requirements

### AI Decision Making
- Ability selection based on current situation (health, position, targets)
- Range consideration for ability usage
- Target prioritization (players, threats, opportunities)
- Resource management (AP usage, cooldown awareness)

## Current Implementation Status

### Completed Systems
- ✅ Tier-based enemy scaling (1-5 tiers)
- ✅ Difficulty settings with stat/loot multipliers
- ✅ Automatic ability slot assignment by tier and role
- ✅ Role-based AI behavior patterns (tank, dps, caster, support, balanced)
- ✅ Shared ability system with players (identical mechanics)
- ✅ Integration with combat system and status effects

### Enemy Generation Features
- ✅ Dynamic stat calculation based on tier and difficulty
- ✅ Automatic skill level assignment for ability requirements
- ✅ Equipment generation appropriate to tier and role
- ✅ Ability priority sorting and intelligent selection

### AI Behavior System
- 🔄 Advanced tactical decision making
- 🔄 Group coordination for multi-enemy encounters
- 🔄 Dynamic role switching based on combat conditions
- 🔄 Learning/adaptation based on player behavior patterns

## Integration Notes

### Dungeon Generator Integration
Enemy system integrates with dungeon generation to:
- Spawn appropriate tier enemies for floor depth
- Balance encounter difficulty with player progression
- Place enemies in tactically interesting positions
- Generate varied enemy compositions per room

### Multiplayer Considerations  
- Enemy actions synchronized across all player clients
- Deterministic AI behavior for consistent multiplayer experience
- Scalable difficulty for groups of different sizes
- Turn management integration for 8+ entity combat

### Performance Optimization
- Efficient ability selection algorithms
- Minimal memory footprint per enemy instance
- Event-driven updates to reduce processing overhead
- Batch processing for large enemy groups

## Architecture Notes

### Enemy Entity Structure
```javascript
{
  id: string,
  tier: number,           // 1-5 difficulty tier
  role: string,           // tank, dps, caster, support, balanced
  health: number,
  maxHealth: number,
  ap: number,
  maxAP: number,
  skills: object,         // skill levels for ability requirements
  abilitySlots: object,   // auto-assigned abilities
  equipment: object,      // tier-appropriate equipment
  position: {x, y},       // tactical positioning
  statusEffects: object,  // shared status effect tracking
  abilityCooldowns: object // shared cooldown system
}
```

### Role Priority System
Enemies intelligently select abilities based on their assigned role and current combat situation, creating distinct behavioral patterns that provide varied tactical challenges.

## Last Updated
2025-08-27 - Initial context documentation covering enemy system architecture with shared abilities implementation