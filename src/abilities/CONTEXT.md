# Folder Context: abilities

## Purpose
Core abilities system implementing the 9+5 slotting model (9 active, 5 passive slots) for the single-player party-based ASCII roguelike. This system manages 385+ abilities across combat, magic, exploration, passive, and hybrid categories with shared implementation for both players and enemies. Fully integrated with the Vite build system and modular architecture.

## Key Files

### Core System
- `core/AbilityEngine.js` - Main engine orchestrating ability execution, success calculation, resource consumption, and effect application
- `core/AbilityRegistry.js` - Central registry for ability definitions, skill requirement validation, and success rate calculations  
- `core/AbilitySlotManager.js` - Manages 9 active + 5 passive ability slots, hotkey mapping (1-9), and combat restrictions

### Ability Categories  
- `combat/MeleeAbilities.js` - One-handed, two-handed, and unarmed combat abilities with weapon scaling
- `combat/DefensiveAbilities.js` - Shield abilities, defensive stances, and damage mitigation techniques
- `combat/RangedAbilities.js` - Archery, throwing, and ranged combat abilities
- `combat/PhysicalDamageAbilities.js` - Physical damage dealing abilities across weapon types
- `magic/MagicAbilities.js` - Elemental and general magic abilities with mana costs
- `magic/ElementalAbilities.js` - Fire, ice, earth, air elemental magic abilities
- `exploration/ExplorationAbilities.js` - Non-combat abilities including lockpicking (5 abilities functional), tracking, survival
- `passive/PassiveAbilities.js` - Always-active bonus abilities for permanent character enhancement
- `hybrid/HybridAbilities.js` - Multi-category abilities combining combat, magic, and utility effects

### Documentation
- `FEATURE_REQUIREMENTS.md` - Critical documentation of 32+ non-combat abilities requiring new game systems
- `ABILITIES_USE_CASES.md` - Use cases and examples for ability implementation

## Dependencies

### Internal
- `../character/skills/SkillSystem.js` - Skill-based ability unlocking and scaling calculations
- `../combat/StatusEffectRegistry.js` - Status effect definitions and application mechanics  
- `../combat/CombatManager.js` - Combat integration and damage calculation
- `../enemies/EnemySystem.js` - Shared ability system for enemy AI
- `../core/EventSystem.js` - Event-driven ability notifications and interactions
- `../systems/lockpicking/LockpickingSystem.js` - Integration point for 5 lockpicking abilities

### External
- No external libraries - pure JavaScript implementation for browser compatibility

## Integration Points

### Skill System Integration
- Abilities unlock at specific skill thresholds (e.g., level 1, 5, 15, 30, 60, 90)
- Skill levels affect success rates, damage scaling, and AP cost reduction
- Use-based progression: using abilities awards XP to associated skills

### Combat System Integration  
- AbilityEngine integrates with CombatManager for damage calculation and application
- Status effects applied through StatusEffectRegistry with duration tracking
- AP consumption and turn management through combat flow

### Slotting System Architecture
- Players: 9 active slots (hotkeys 1-9) + 5 passive slots (always active)
- Enemies: Tier-based slot allocation (Tier 1: 3+1, Tier 5: 9+5) 
- Combat restrictions prevent ability swapping during encounters
- Auto-assignment for enemies based on role (tank, dps, caster, support, balanced)

### Shared Player/Enemy System
- Both players and enemies use identical ability definitions and mechanics
- EnemySystem handles automatic ability assignment based on tier and role
- Skill requirements and scaling work for both entity types

## Current Implementation Status

### Completed Systems
- ✅ Core ability engine with execution and effect application
- ✅ 9+5 slotting system with hotkey management
- ✅ Combat abilities (melee, ranged, defensive) with weapon scaling
- ✅ Magic abilities with elemental effects
- ✅ Passive abilities for permanent enhancements
- ✅ Skill-based unlocking and scaling
- ✅ Status effect integration
- ✅ Player/enemy shared implementation
- ✅ Lockpicking exploration abilities with dedicated system integration

### Critical Gaps (27+ abilities blocked)
- ✅ Lockpicking & Security System (5 abilities: pick_lock, disable_trap, master_lockpick, pickpocket, grand_heist) - **COMPLETED**
- ❌ Crafting & Item Creation System (4 abilities: basic_smithing, brew_potion, etc.) 
- ❌ Social & NPC Interaction System (6 abilities: fast_talk, negotiate_price, etc.)
- ❌ Survival & Resource Management (7 abilities: track_creature, build_shelter, etc.)
- ❌ Investigation & Knowledge System (6 abilities: examine_closely, research_topic, etc.)
- ❌ Summoning & Companion System (4 abilities: animal_companion_strike, summon_demon, etc.)

## Architecture Notes

### Ability Definition Structure
```javascript
{
  key: 'ability_key',
  name: 'Display Name', 
  type: 'active|passive',
  category: 'combat|magic|exploration|passive|hybrid',
  apCost: number,
  skillRequirements: [{ skill: 'skill_name', level: number }],
  effects: { damage: { base: number, scaling: 'weapon|skill|none' } },
  scaling: { effectiveness: [{ skill: 'skill_name', multiplier: number }] }
}
```

### Success Rate Calculation
Base rate + skill bonuses + equipment modifiers, with critical success/failure thresholds

### Resource Management  
- AP consumption with skill-based reduction
- Cooldown tracking per entity
- Resource costs (future: mana, reagents for crafting)

## Vite Architecture Integration
**Module Loading**: All ability modules loaded through main.js in proper dependency order
**Chunk Splitting**: Abilities system included in game-systems chunk for optimized loading
**Hot Module Replacement**: Development-time updates without full page reload
**Build Optimization**: Minified and bundled for production deployment

## Last Updated
2025-08-27 - Updated to reflect Vite modular architecture transition and Phase 1 lockpicking system completion with 5 functional exploration abilities