# Folder Context: combat

## Purpose
Core combat systems managing turn-based tactical combat with AP-based actions, status effects, and integration with the abilities and skills systems. Handles combat flow, damage calculation, and effect management for the tactical ASCII roguelike.

## Key Files
- `CombatManager.js` - Primary combat orchestrator handling damage, healing, combat state, and ability integration
- `StatusEffectRegistry.js` - Comprehensive registry of 20+ status effects with duration tracking, stacking rules, and interactions
- `TurnManager.js` - Initiative-based turn order using D20 + skill modifiers for 8-player multiplayer combat

## Dependencies

### Internal
- `../abilities/core/AbilityEngine.js` - Ability execution and combat effect application
- `../character/skills/SkillSystem.js` - Skill-based combat bonuses and initiative calculations
- `../core/EventSystem.js` - Combat event broadcasting and state change notifications
- `../enemies/EnemySystem.js` - Enemy combat AI and behavior integration

### External
- No external dependencies - pure JavaScript for browser compatibility

## Integration Points

### Abilities System Integration
- CombatManager processes ability effects through AbilityEngine
- Status effects applied by abilities are tracked in StatusEffectRegistry
- Combat state restricts ability slot changes during encounters
- AP consumption managed through combat flow

### Skills System Integration
- Initiative rolls use D20 + floor(skill_level / 4) calculation
- Combat skills provide damage bonuses, accuracy improvements, and defensive benefits
- Weapon skills scale damage with equipment effectiveness
- Defensive skills reduce incoming damage and improve survivability

### Multiplayer Combat Flow
- Turn-based system supporting up to 8 players simultaneously
- Real-time AP management with 2-3 AP per turn, maximum 8 AP storage
- Initiative order recalculated each combat round
- WebSocket synchronization for multiplayer state management

## Status Effects System

### Effect Categories (20+ effects implemented)
- **Damage Over Time:** burn, bleed, poison (stackable with duration)
- **Movement Debuffs:** slow, knockdown, immobilize (position/speed penalties)
- **Mental Effects:** fear, stun, confusion (action/targeting restrictions)
- **Enhancement Buffs:** haste, armor_enhancement (temporary bonuses)
- **Concealment:** invisibility (targeting and detection mechanics)
- **Resistances:** elemental_resistance (damage reduction, stackable)

### Effect Mechanics
- Duration tracking with turn-based countdown
- Stacking rules (some stack, others override)
- Interaction system (effects that enhance, cancel, or trigger others)
- Scaling based on source entity's skills and abilities
- Resistance checking for immunity and mitigation

### Integration Features
- Real-time effect application during ability execution
- Turn-start/turn-end effect processing
- Effect removal conditions and triggers
- Status effect visualization in ASCII UI

## Combat Flow Architecture

### Turn Management
1. Initiative calculation (D20 + skill bonus)
2. AP allocation (2-3 per turn, configurable)
3. Action phase (abilities, movement, free actions)
4. Effect processing (status effects, cooldowns)
5. Turn end (AP recovery, effect countdown)

### Damage Calculation
- Base damage from abilities/weapons
- Skill-based scaling multipliers
- Armor/defense reduction
- Status effect modifications
- Critical hit calculations
- Damage type resistances

### Combat State Management
- Health/AP tracking per entity
- Position management for tactical movement
- Equipment integration for combat stats
- Cooldown tracking per ability per entity
- Combat entry/exit conditions

## Current Implementation Status

### Completed Systems
- ✅ Turn-based initiative with D20 + skill calculations
- ✅ AP-based action economy (2-3 AP/turn, 8 max storage)
- ✅ Comprehensive status effect registry with 20+ effects
- ✅ Damage calculation with armor, skills, and equipment integration
- ✅ Status effect application, duration tracking, and interactions
- ✅ Combat state management for multiplayer sessions
- ✅ Integration with abilities system for effect application

### Integration Points
- ✅ Real-time multiplayer combat coordination
- ✅ ASCII UI combat display and status visualization  
- ✅ WebSocket synchronization for 8-player combat
- ✅ Free actions (0 AP) vs AP abilities distinction

### Performance Features
- Efficient effect processing with minimal overhead
- Event-driven updates to prevent unnecessary calculations
- Optimized multiplayer state synchronization
- <100ms response time requirement for combat actions

## Architecture Notes

### Status Effect Structure
```javascript
{
  name: string,
  type: string,           // damage_over_time, buff, debuff, etc.
  stackable: boolean,
  maxStacks: number,
  duration: object,       // base + scaling calculation
  properties: object,     // effect-specific properties
  interactions: object    // effect interactions and resistances
}
```

### Combat Entity Requirements
- health, maxHealth, ap, maxAP properties
- position (x, y) for tactical positioning
- statusEffects object for effect tracking
- abilityCooldowns object for ability restrictions

### Multiplayer Considerations
- State synchronization through WebSocket events
- Concurrent action validation and resolution
- Turn order consistency across all clients
- Combat session isolation and cleanup

## Last Updated
2025-08-27 - Initial context documentation covering complete combat system architecture