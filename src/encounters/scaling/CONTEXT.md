# Folder Context: encounters/scaling

## Purpose
Dynamic encounter scaling system providing adaptive difficulty adjustment for the ASCII roguelike. Manages encounter complexity, enemy scaling, and challenge rating calculations to maintain appropriate difficulty as parties progress.

## Key Files
- `EncounterScaling.js` - Encounter scaling engine managing dynamic difficulty adjustment, enemy scaling calculations, and challenge rating systems

## Dependencies
- Internal: `../../core/GameState.js`, `../../enemies/EnemySystem.js`, `../core/EncounterManager.js`
- External: None - pure JavaScript scaling algorithms

## Integration Points
**Enemy Scaling Integration**:
- Enemy tier progression based on party advancement
- Individual enemy stat scaling for appropriate challenge
- Enemy ability complexity scaling with encounter difficulty
- Enemy role balance adjustments for party composition

**Party Assessment System**:
- Party power level evaluation and calculation
- Individual character progression tracking
- Equipment and ability power assessment
- Performance history analysis for scaling adjustments

**Dungeon Progression Integration**:
- Floor-based scaling with dungeon depth
- Location-specific encounter difficulty modifiers
- Progressive challenge increase through dungeon levels
- Special area scaling for unique encounters

**Reward Scaling Integration**:
- Scaled reward distribution based on encounter difficulty
- Experience point scaling with challenge rating
- Item quality and rarity scaling with encounter complexity
- Resource reward adjustment based on scaling factors

## Scaling Algorithm Architecture
**Challenge Rating System**:
- Numerical challenge rating calculation for encounters
- Party challenge rating assessment and comparison
- Scaling factor determination based on rating differential
- Dynamic adjustment algorithms for real-time scaling

**Enemy Scaling Mechanics**:
- Health and damage scaling based on party progression
- Ability power and effectiveness scaling
- Enemy AI complexity scaling with challenge requirements
- Special ability unlocking based on scaling thresholds

**Difficulty Curves**:
- Progressive difficulty increase with smooth curves
- Spike encounter management for variety
- Plateau periods for skill consolidation
- Challenge variety through different scaling approaches

## Scaling Factors
**Party Power Metrics**:
- Character levels and skill progression
- Equipment quality and enhancement levels
- Party composition and synergy factors
- Historical performance and success rates

**Environmental Modifiers**:
- Dungeon floor depth multipliers
- Room type difficulty modifiers
- Special location challenge adjustments
- Time-based progression scaling

**Adaptive Scaling**:
- Performance-based difficulty adjustment
- Success/failure rate balancing
- Resource consumption rate considerations
- Player engagement and challenge satisfaction

## Scaling Balance
- Maintains challenge without frustration
- Provides progression feeling with appropriate difficulty
- Balances individual encounters within overall progression
- Ensures variety and unpredictability in challenges

## Last Updated
2025-08-27: Created encounter scaling documentation covering dynamic difficulty adjustment, challenge rating systems, and adaptive scaling algorithms