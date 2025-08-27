# Folder Context: character/skills

## Purpose
Skill system managing 34+ skills across weapon, armor, magic, combat, and crafting categories. Implements use-based progression with exponential XP curves, providing the foundation for ability unlocking and scaling in the tactical ASCII roguelike.

## Key Files
- `SkillSystem.js` - Core progression system with XP calculation, level tracking, and use-based advancement
- `SkillCategories.js` - Comprehensive skill definitions across 7 categories with 34+ individual skills
- `SKILL_SUMMARIES.js` - Documentation of all skills with descriptions and progression details

## Dependencies

### Internal  
- `../../core/EventSystem.js` - Skill level change notifications and character progression events
- `../../abilities/core/AbilityEngine.js` - Skill requirements for ability unlocking and scaling
- `../abilities/AbilitySystem.js` - Character-specific ability integration

### External
- No external dependencies - pure JavaScript implementation

## Integration Points

### Ability System Integration
- Skills determine ability availability through level requirements
- Skill levels provide scaling multipliers for ability effectiveness
- Using abilities awards 1 XP to associated skills (use-based progression)
- Higher skill levels reduce AP costs for abilities

### Character Progression  
- All characters start with level 0 in all skills
- Progressive XP requirements: early levels 10-20 uses, high levels 200+ uses
- No character levels - entirely skill-based advancement system
- Mastery rankings: Novice → Skilled → Adept → Expert → Master → Grandmaster

### Combat Integration
- Combat skills affect damage, accuracy, and defensive capabilities
- Weapon skills scale with equipment effectiveness
- Magic skills determine spell power and success rates
- Defensive skills provide damage reduction and survivability

## Skill Categories Structure

### Weapon Skills (8 skills)
- One-handed, Two-handed, Polearms, Archery, Throwing, Unarmed, Critical Strikes, Weapon Mastery

### Armor & Defense Skills (6 skills)  
- Light Armor, Heavy Armor, Shield, Blocking, Dodging, Toughness

### Magic Schools (6 skills)
- Elemental Magic, Divine Magic, Arcane Magic, Nature Magic, Dark Magic, Enchantment

### Combat Skills (5 skills)
- Tactics, Combat Reflexes, Intimidation, First Aid, Berserker Rage

### Crafting Skills (4 skills)  
- Blacksmithing, Alchemy, Enchanting, Locksmithing

### Physical Skills (3 skills)
- Strength, Agility, Athletics

### Mental Skills (2+ skills)
- Intelligence, Willpower, (expandable)

## XP Progression Design

### Level Brackets
- **Levels 1-10:** 10-30 uses per level (quick early progression)
- **Levels 11-30:** 30-130 uses per level (moderate progression)  
- **Levels 31-60:** 100-400 uses per level (steady advancement)
- **Levels 61-100:** 200-1000 uses per level (mastery grind)

### Use-Based Philosophy
- Every skill use awards exactly 1 XP (no bonuses or penalties)
- Natural progression through gameplay activities
- No artificial level caps or restrictions
- Encourages diverse skill development

## Current Implementation Status

### Completed Features
- ✅ Complete 34+ skill definitions with categories
- ✅ Exponential XP progression system (levels 1-100)
- ✅ Use-based advancement (1 XP per use)
- ✅ Skill bonus calculations (5% per level)
- ✅ Character skill initialization
- ✅ Top skills tracking and mastery rankings
- ✅ Event system integration for progression notifications

### Integration Points
- ✅ Ability system integration for requirements and scaling
- ✅ Combat system integration for skill-based bonuses
- ✅ Character generation with starting skill allocations

### Future Enhancements  
- 🔄 Class system integration (skill threshold unlocks)
- 🔄 Advanced skill combinations and synergies
- 🔄 Skill-specific equipment bonuses and requirements

## Architecture Notes

### Skill Object Structure
```javascript
{
  level: number,    // Current skill level (0-100)
  xp: number,      // Total XP accumulated  
  uses: number,    // Total times skill was used
  lastUsed: timestamp // Last use timestamp
}
```

### Category Organization
Skills are organized into logical categories for UI presentation and progression tracking, with cross-category synergies supported.

### Performance Considerations
- Efficient XP calculation with pre-computed requirements array
- Minimal memory footprint per character skill object
- Event-driven updates to prevent unnecessary recalculations

## Last Updated  
2025-08-27 - Initial context documentation created, covers complete skill system architecture