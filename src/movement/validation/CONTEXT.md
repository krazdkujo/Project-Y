# Folder Context: movement/validation

## Purpose
Movement validation system ensuring legal and safe movement within the ASCII roguelike's tactical environment. Provides comprehensive validation logic for movement actions, terrain checking, and boundary enforcement.

## Key Files
- `MovementValidator.js` - Movement validation engine with terrain checking, boundary validation, and movement rule enforcement

## Dependencies
- Internal: `../../dungeon/DungeonGenerator.js`, `../../core/GameState.js`, `../core/MovementSystem.js`
- External: None - pure JavaScript validation logic

## Integration Points
**Terrain Validation**:
- Dungeon layout validation for passable terrain
- Wall and obstacle collision detection
- Door and passage accessibility checking
- Environmental hazard and trap detection

**Boundary Enforcement**:
- Dungeon area boundary validation
- Room transition rule enforcement
- Map edge detection and prevention
- Valid movement area calculation

**Combat Movement Validation**:
- Turn-based movement rule enforcement
- AP availability checking for movement costs
- Combat state movement restrictions
- Tactical positioning validation

**Character-Specific Validation**:
- Character ability-based movement restrictions
- Equipment-based movement modifications
- Status effect movement limitations
- Character size and space requirements

## Validation Architecture
**Movement Rule Engine**:
- Rule-based validation system for movement actions
- Priority-based validation checking
- Error reporting and feedback system
- Validation result caching for performance

**Terrain Analysis**:
- Grid-based terrain type checking
- Passability matrix maintenance
- Dynamic obstacle detection
- Environmental condition assessment

**Movement Constraints**:
- Distance limitations based on character capabilities
- Direction restrictions based on terrain and obstacles
- Speed modifiers from equipment and status effects
- Group movement coordination requirements

## Validation Process Flow
1. **Pre-Movement Validation**: Check character state, AP availability, basic requirements
2. **Terrain Validation**: Verify destination tile passability and accessibility
3. **Path Validation**: Ensure clear path from origin to destination
4. **Context Validation**: Check combat state, turn order, and special conditions
5. **Final Validation**: Confirm all constraints met and movement is legal

**Error Handling**:
- Detailed error messages for invalid movement attempts
- User feedback through adventure log system
- Alternative suggestion generation when possible
- Graceful handling of edge cases and boundary conditions

## Performance Optimizations
- Validation result caching for repeated checks
- Pre-computed passability matrices
- Efficient pathfinding algorithms
- Minimal validation overhead during real-time play

## Last Updated
2025-08-27: Created movement validation documentation covering terrain checking, boundary enforcement, and validation rule architecture