# Folder Context: character

## Purpose
Character management system handling character creation, skill progression (34 skills), and abilities integration for the single-player party-based ASCII roguelike. Manages up to 6 party members with individual progression and permadeath mechanics.

## Key Files
- `generator/CharacterGenerator.js` - Character creation interface with skill allocation and weapon selection
- `abilities/AbilitySystem.js` - Character ability management with base abilities (attack, move, wait) and progression
- `skills/SkillSystem.js` - 34-skill progression system with use-based advancement and mastery levels
- `skills/SkillCategories.js` - Skill category definitions and structure
- `skills/SKILL_SUMMARIES.js` - Comprehensive skill descriptions and unlock requirements

## Dependencies
- Internal: `../core/EventSystem.js`, `../core/GameState.js`, `../equipment/Weapons.js`, `../abilities/core/AbilityEngine.js`
- External: UUID for unique character ID generation

## Integration Points
**Character Creation System**:
- 25 skill points allocation across 34 available skills
- Starting weapon selection affecting initial capabilities
- Guild-based character storage with persistent data

**Skill System Integration**:
- Use-based skill advancement (Novice → Legendary mastery levels)
- Skill requirements for ability unlocking at levels 1, 5, 15, 30, 60, 90
- Initiative calculations using D20 + floor(skill_level / 4) for combat order
- Dynamic ability generation based on skill levels and progression

**Party Management**:
- Support for up to 6 active party members
- Individual character progression and equipment management
- Permadeath system with guild character storage
- Character swapping and party composition management

**Abilities Integration**:
- Base abilities available to all characters (basic attack, move, wait)
- Skill-based ability unlocking through AbilityEngine
- 9+5 ability slot management (9 active, 5 passive)
- Combat ability restrictions and AP management

## Character Data Structure
**Core Properties**:
- Unique ID, name, creation timestamp
- Health/maxHealth, AP/maxAP for combat
- Position coordinates for tactical movement
- Equipment slots and inventory management

**Progression Systems**:
- Skills object with levels and experience tracking
- Abilities array with unlocked capabilities
- Equipment bonuses and scaling modifiers
- Combat statistics and performance metrics

## Guild System Integration
- Character storage in guild base between runs
- Persistent character data across game sessions
- Character recruitment and party assembly
- Death handling with character loss mechanics

## Critical Fix Applied (2025-08-27)
**Character Generation Dependencies Resolved**: Fixed critical issue where CharacterGenerator was failing due to missing system instances. EventSystem, SkillSystem, and WeaponSystem are now properly instantiated in main.js before CharacterGenerator initialization, enabling full character creation functionality.

## Last Updated
2025-08-27: Updated with character generation dependency fix - system now fully functional