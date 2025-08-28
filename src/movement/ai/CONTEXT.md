# Folder Context: movement/ai

## Purpose
AI-driven movement system for enemy entities providing intelligent movement behavior, tactical positioning, and strategic decision-making for NPCs and enemies in the ASCII roguelike.

## Key Files
- `EnemyAI.js` - Enemy artificial intelligence system managing movement decisions, tactical positioning, and behavior patterns

## Dependencies
- Internal: `../../enemies/EnemySystem.js`, `../core/MovementSystem.js`, `../validation/MovementValidator.js`, `../../core/GameState.js`
- External: None - pure JavaScript AI logic

## Integration Points
**Enemy Behavior Management**:
- AI-driven movement decision making for enemy entities
- Tactical positioning algorithms for combat advantage
- Pathfinding integration for navigation to targets
- Behavioral pattern implementation based on enemy types

**Combat AI Integration**:
- Tactical movement during combat encounters
- Target selection and positioning strategies
- Ability range optimization through movement
- Team coordination for multi-enemy encounters

**Dungeon Navigation**:
- Map awareness for AI movement planning
- Room layout understanding and navigation
- Obstacle avoidance and path optimization
- Area control and territorial behavior

**Enemy System Integration**:
- Enemy type-specific movement behaviors
- Tier-based AI complexity and capabilities
- Role-based movement patterns (tank, dps, support, caster)
- Intelligence scaling with enemy progression

## AI Movement Behavior Types
**Aggressive Behavior**:
- Direct movement toward player characters
- Optimal positioning for attack abilities
- Minimal defensive considerations
- High-risk, high-reward positioning

**Defensive Behavior**:
- Protective positioning near valuable targets
- Cover utilization and defensive stances
- Area denial and chokepoint control
- Support role positioning for team benefits

**Tactical Behavior**:
- Advanced positioning for ability synergies
- Multi-turn strategic planning
- Environmental advantage exploitation
- Adaptive behavior based on combat situation

**Evasive Behavior**:
- Retreat patterns and escape routes
- Hit-and-run tactics with positioning
- Range maintenance for ranged attackers
- Kiting strategies for mobile enemies

## AI Decision Making Process
**Movement Evaluation**:
1. Assess current tactical situation
2. Evaluate available movement options
3. Score potential positions based on multiple criteria
4. Select optimal movement considering constraints
5. Execute movement with validation checks

**Positioning Criteria**:
- Distance to primary targets
- Ability range optimization
- Defensive positioning advantages
- Team coordination requirements
- Environmental hazard avoidance

## AI Complexity Levels
- **Basic AI**: Simple movement toward players with obstacle avoidance
- **Intermediate AI**: Tactical positioning with ability range consideration
- **Advanced AI**: Multi-turn planning with team coordination
- **Elite AI**: Adaptive behavior with counter-strategy development

## Last Updated
2025-08-27: Created AI movement system documentation covering intelligent movement behavior, tactical positioning, and decision-making algorithms