# Folder Context: character/abilities

## Purpose
Character-specific ability management system handling base abilities, character ability progression, and integration with the core abilities engine. Manages fundamental abilities available to all characters and character-specific ability unlocking.

## Key Files
- `AbilitySystem.js` - Character ability management with base abilities (basic_attack, move, wait), ability effects, and character progression integration

## Dependencies
- Internal: `../../core/EventSystem.js`, `../skills/SkillSystem.js`, `../../abilities/core/AbilityEngine.js`, `../../core/GameState.js`
- External: None - pure JavaScript implementation

## Integration Points
**Base Abilities System**:
- Provides fundamental abilities available to all characters
- basic_attack: Simple weapon attack with weapon and skill scaling
- move: Free action movement to adjacent positions
- wait: Skip turn with 1 AP recovery

**Core Abilities Engine Integration**:
- Interfaces with main AbilityEngine for ability execution
- Character abilities feed into the 9+5 slot system
- Ability effects processed through central combat system
- AP cost management and cooldown tracking

**Skill System Integration**:
- Ability effectiveness scales with character skill levels
- Skill requirements determine ability availability
- Use-based progression awards XP to associated skills
- Dynamic ability unlocking based on skill thresholds

**Combat System Integration**:
- Ability effects applied through CombatManager
- Damage calculations using weapon and skill scaling
- Accuracy calculations with skill-based modifiers
- AP consumption managed through combat flow

## Ability Structure
**Base Ability Format**:
- name, description for UI display
- apCost, range, cooldown for combat mechanics
- skillRequired, skillLevel for unlock requirements
- type classification (combat, movement, utility)
- effects object with damage, accuracy, movement properties

**Scaling Mechanics**:
- Weapon scaling for combat abilities
- Skill scaling for accuracy and effectiveness
- None scaling for fixed effects
- Character level influence on ability power

**Character Ability Management**:
- Character-specific ability collections
- Ability unlocking based on skill progression
- Integration with character creation and advancement
- Persistent ability data in character records

## Future Integration Points
- Connection to main abilities system for advanced abilities
- Character class specialization systems
- Equipment-based ability modifications
- Party synergy abilities and combinations

## Last Updated
2025-08-27: Created comprehensive character abilities documentation covering base abilities and integration architecture