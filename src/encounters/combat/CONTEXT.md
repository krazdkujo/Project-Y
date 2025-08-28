# Folder Context: encounters/combat

## Purpose
Tactical combat system for encounters providing advanced combat mechanics, positioning strategy, and tactical depth for the ASCII roguelike's encounter battles. Integrates with core combat systems to provide enhanced tactical gameplay.

## Key Files
- `TacticalCombat.js` - Tactical combat engine providing advanced positioning mechanics, tactical abilities, and strategic combat features

## Dependencies
- Internal: `../../combat/CombatManager.js`, `../../combat/TurnManager.js`, `../../movement/core/MovementSystem.js`, `../../abilities/core/AbilityEngine.js`
- External: None - pure JavaScript tactical combat logic

## Integration Points
**Core Combat Integration**:
- Enhances basic combat system with tactical mechanics
- Advanced turn management with positioning considerations
- Sophisticated ability usage in tactical contexts
- Status effect interactions with positioning and terrain

**Movement System Integration**:
- Tactical positioning as core combat mechanic
- Movement costs and restrictions in tactical combat
- Positioning advantages and tactical movement options
- Area control and territorial combat mechanics

**Ability System Integration**:
- Range-based ability targeting and effectiveness
- Position-dependent ability bonuses and penalties
- Area-of-effect abilities with tactical positioning
- Line-of-sight calculations for targeted abilities

**Environmental Integration**:
- Terrain-based tactical advantages and disadvantages
- Cover mechanics and protection calculations
- Environmental hazards and tactical opportunities
- Dungeon layout influence on tactical combat

## Tactical Combat Features
**Positioning Mechanics**:
- Flanking bonuses and positioning advantages
- Cover and protection mechanics
- High ground and elevation advantages
- Chokepoint control and area denial

**Advanced Combat Options**:
- Opportunity attacks and movement penalties
- Overwatch and reaction-based abilities
- Combo attacks and coordinated abilities
- Defensive stances and protective positioning

**Terrain Interactions**:
- Environmental hazards and trap integration
- Destructible terrain and dynamic battlefields
- Line-of-sight calculations and blocking
- Movement cost modifiers based on terrain

## Tactical Depth Systems
**Formation Combat**:
- Party formation bonuses and coordination
- Formation-based ability synergies
- Protective formations and defensive arrangements
- Offensive formations for coordinated attacks

**Area Control**:
- Zone control abilities and effects
- Territorial positioning and area denial
- Movement restriction and battlefield control
- Strategic positioning for tactical advantage

**Multi-Target Tactics**:
- Area-of-effect ability optimization
- Multi-enemy targeting strategies
- Crowd control and battlefield management
- Priority targeting and threat assessment

## Combat Intelligence
- Tactical AI for enemy positioning and strategy
- Player tactical option highlighting and suggestions
- Optimal positioning calculations and recommendations
- Strategic depth analysis for tactical decisions

## Last Updated
2025-08-27: Created tactical combat documentation covering positioning mechanics, advanced combat options, and tactical depth systems