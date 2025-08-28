# Folder Context: character/generator

## Purpose
Character creation interface and logic for the single-player ASCII roguelike. Handles the complete character generation process including skill point allocation, weapon selection, and character builder state management.

## Key Files
- `CharacterGenerator.js` - Complete character creation system with UI interface, skill allocation, weapon selection, and character validation

## Dependencies
- Internal: `../../core/EventSystem.js`, `../skills/SkillSystem.js`, `../../equipment/Weapons.js`, `../../core/GameState.js`
- External: UUID for character ID generation
- **System Dependencies**: Requires EventSystem, SkillSystem, and WeaponSystem instances to be instantiated before CharacterGenerator initialization (resolved in main.js)

## Integration Points
**Character Creation Flow**:
- Opens character creation interface with skill allocation controls
- 25 skill points distributed across 34 available skills
- Starting weapon selection from available weapon types
- Character preview updates with real-time skill calculations
- Validation before character finalization

**Skill System Integration**:
- Interfaces with SkillSystem for skill categories and requirements
- Validates skill point allocation (0-5 points per skill, 25 total)
- Calculates derived stats based on skill allocation
- Updates character preview with skill-based bonuses

**Weapon Selection**:
- Integration with WeaponSystem for available starting weapons
- Weapon selection affects initial combat capabilities
- Starting equipment assignment based on weapon choice
- Combat readiness calculations with weapon bonuses

**Guild Integration**:
- Created characters stored in guild character pool
- Integration with guild interface for character management
- Character availability for party recruitment
- Persistent storage in GameState.guild.storedCharacters

## Character Builder Features
**Skill Allocation**:
- Interactive skill point distribution interface
- Real-time validation of point allocation
- Skill category organization and display
- Preview of skill effects and capabilities

**Character Validation**:
- Name requirement enforcement
- Skill point allocation validation (must use all 25 points)
- Starting weapon selection requirement
- Character data completeness verification

**UI Management**:
- Character creation interface toggle
- Skill allocation controls and displays
- Weapon selection interface
- Character preview with calculated stats

## Character Generation Process
1. **System Initialization**: EventSystem, SkillSystem, and WeaponSystem instances created in main.js
2. **Character Generator Setup**: CharacterGenerator instantiated with required system dependencies
3. **Initialize Builder**: Reset character builder state
4. **Skill Allocation**: Distribute 25 points across skills
5. **Weapon Selection**: Choose starting weapon type
6. **Character Preview**: Real-time stat calculation display
7. **Validation**: Ensure all requirements met
8. **Finalization**: Create character and add to guild storage

## Critical Fix Applied (2025-08-27)
**Issue**: Character generation was failing with "dependencies missing" error
**Root Cause**: EventSystem, SkillSystem, and WeaponSystem classes were imported but instances were not created before CharacterGenerator initialization
**Solution**: Added system instantiation in main.js `initializeGameSystems()` method (lines 89-105)
**Result**: Character generation now works correctly from guild interface, custom creation functional

## Last Updated
2025-08-27: Created comprehensive character generator documentation covering creation flow and integration points