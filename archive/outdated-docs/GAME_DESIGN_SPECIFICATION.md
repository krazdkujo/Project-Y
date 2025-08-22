# Game Design Specification: ASCII Roguelike with MUD Architecture

**Document Version**: 1.0  
**Date**: 2025-08-18  
**Project**: Leveless D20 Multiplayer ASCII Roguelike  
**Architecture**: MUD-Inspired Tick System

---

## 🎯 Executive Summary

This specification defines a **leveless, skill-based ASCII roguelike** with **8-player multiplayer support** using **MUD-inspired tick architecture**. The game combines traditional D20 combat mechanics with asynchronous multiplayer coordination and real-time ASCII visualization.

### Core Innovation
- **MUD Tick System**: Adapts classic Multi-User Dungeon architecture for modern web-based roguelike gameplay
- **Leveless Progression**: Character advancement through skill usage rather than experience points
- **Asynchronous Multiplayer**: Configurable turn timers (1 minute to 1 day) for flexible group coordination
- **ASCII Representation**: Color-coded character symbols (@) with monster types (lowercase letters)

---

## 🏗️ Core Game Systems

### Character Progression System

#### Leveless Skill Architecture
```
Character Level: NONE
Skill Levels: 0-100 per individual skill
Advancement: Use-based (gain XP on skill use, success or failure)
Skill Categories: Combat, Magic, Social, Survival, Crafting
```

#### Skill Advancement Formula
```typescript
XP_Required = Base_XP * (Current_Level ^ 1.5)
Base_XP = 100

Examples:
Level 1→2: 100 XP
Level 10→11: 3,162 XP  
Level 50→51: 35,355 XP
Level 100: 100,000 XP total
```

#### D20 Integration
```typescript
Roll_Result = d20 + floor(Skill_Level / 4)
Maximum_Bonus = +25 (at skill level 100)
Skill_Check = d20 + Skill_Modifier vs Difficulty_Class
```

### Combat System

#### Turn-Based D20 Mechanics
- **Initiative**: d20 + Tactics skill modifier
- **Attack Rolls**: d20 + Combat skill vs target AC
- **Damage**: Weapon damage + Strength modifier
- **Skill Checks**: d20 + relevant skill vs DC

#### 8-Player Combat Coordination
- **Initiative Order**: All 8 players + NPCs rolled at combat start
- **Action Resolution**: Simultaneous processing at tick boundaries
- **Turn Timer**: Configurable (1min, 5min, 15min, 1hr, 4hr, 1 day)
- **AI Takeover**: Automatic action selection when timer expires

### ASCII Visual System

#### Player Representation
```
Symbol: @ (at symbol)
Color Coding:
- Red @    = Human Fighter
- Blue @   = Elf Wizard  
- Green @  = Halfling Rogue
- Yellow @ = Dwarf Cleric
- Orange @ = Human Paladin
- Purple @ = Elf Sorcerer
- Cyan @   = Halfling Bard
- White @  = Dwarf Ranger
```

#### Monster Representation
```
Goblins:  'g' (green lowercase)
Gnolls:   'g' (blue lowercase) 
Orcs:     'o' (red lowercase)
Trolls:   'T' (brown uppercase)
Dragons:  'D' (red uppercase)
Zombies:  'z' (white lowercase)
Liches:   'L' (purple uppercase)
Bandits:  'b' (yellow lowercase)
```

#### Environment Symbols
```
Walls:     '#' (gray hash)
Floor:     '.' (dark gray period)
Doors:     '+' (brown plus)
Stairs Up: '<' (white left bracket)
Stairs Dn: '>' (white right bracket)
Treasure:  '$' (gold dollar sign)
Traps:     '^' (red caret)
Water:     '~' (blue tilde)
```

---

## 🔄 MUD-Inspired Tick Architecture

### Tick System Overview

#### Core Concept
- **Tick**: Server processing cycle when all actions resolve
- **Turn**: Individual player action submission window
- **Round**: Complete cycle where all players have submitted actions

#### Configurable Timing
```typescript
interface TickConfiguration {
  duration: '1min' | '5min' | '15min' | '1hr' | '4hr' | '1day';
  autoAdvance: boolean; // AI takes over if no action submitted
  partyReady: boolean;  // Advance when all 8 players ready
}
```

### Action Processing Pipeline

#### 1. Action Collection Phase
- Players submit actions during turn window
- Server validates action legality and resource requirements
- Actions queued for resolution at next tick

#### 2. Tick Processing Phase
```typescript
processTick() {
  // 1. Collect all queued player actions
  // 2. Validate actions against current game state
  // 3. Resolve actions in initiative order
  // 4. Process NPC behaviors and AI actions
  // 5. Update environmental effects
  // 6. Calculate new game state
  // 7. Broadcast results to all 8 players
  // 8. Schedule next tick
}
```

#### 3. State Synchronization
- All 8 players receive identical game state updates
- ASCII display refreshed with new positions and status
- Turn timer reset for next action submission window

---

## 👥 8-Player Multiplayer Design

### Session Architecture

#### Party Formation
```typescript
interface GameSession {
  id: string;
  players: Player[8]; // Exactly 8 players
  dungeon: DungeonInstance;
  tickConfig: TickConfiguration;
  currentTick: number;
  status: 'forming' | 'active' | 'completed';
}
```

#### Player Coordination Systems
- **Communication**: Text chat with preset quick commands
- **Voting**: Majority rule for exploration decisions
- **Leadership**: Optional party leader for tie-breaking
- **Resource Sharing**: Individual inventory, shared map knowledge

### Disconnection Handling

#### AI Substitution System
```typescript
class PlayerAI {
  analyzePlayerBehavior(player: Player): BehaviorProfile;
  selectOptimalAction(gameState: GameState): Action;
  maintainCharacterStyle(profile: BehaviorProfile): Action;
}
```

#### Reconnection Protocol
1. Player state preserved in Redis during disconnect
2. AI maintains character according to learned behavior
3. Full state sync provided upon reconnection  
4. Seamless transition back to player control

---

## 🎮 Gameplay Mechanics

### Dungeon Exploration

#### Room-Based Navigation
- **Static Maps**: Pre-generated ASCII layouts
- **8-Player Movement**: Group moves together, individual positioning in combat
- **Encounter Distribution**: 70% combat, 5% traps, 25% skill challenges
- **Progressive Difficulty**: Deeper levels increase DC and monster strength

#### Skill Challenges
```typescript
interface SkillChallenge {
  type: 'obstacle' | 'puzzle' | 'social' | 'environmental';
  availableSkills: SkillType[];
  difficulty: number;
  multiPlayer: boolean; // Requires multiple players to solve
}
```

### Combat Encounters

#### Initiative and Turn Order
```typescript
// Combat starts: Roll initiative for all participants
const initiative = players.map(p => d20() + p.skills.tactics.modifier);
const combatOrder = [...players, ...monsters].sort(by(initiative));

// Each tick processes one complete round
combatOrder.forEach(participant => {
  if (participant.isPlayer) {
    processPlayerAction(participant.queuedAction);
  } else {
    processAIAction(selectMonsterAction(participant));
  }
});
```

#### 8-Player Combat Dynamics
- **Flanking**: Positional advantages with multiple players
- **Support Actions**: Healing, buffing, tactical coordination
- **AoE Effects**: Spells and abilities affecting multiple targets
- **Friendly Fire**: Optional rule for area effects

---

## 🛠️ Technical Architecture

### Server-Side Components

#### Core Systems
```typescript
// Main server components
class TickCoordinator {
  scheduleNextTick(sessionId: string, delay: number): void;
  processTick(sessionId: string): Promise<GameState>;
}

class ActionQueue {
  addAction(sessionId: string, playerId: string, action: Action): void;
  validateAction(action: Action, gameState: GameState): boolean;
  getQueuedActions(sessionId: string): Action[];
}

class GameSession {
  players: Map<string, Player>;
  gameState: GameState;
  tickConfig: TickConfiguration;
  processRound(): Promise<void>;
}
```

### Database Schema

#### Core Tables
```sql
-- Character and progression data
CREATE TABLE characters (
  id UUID PRIMARY KEY,
  player_id UUID REFERENCES players(id),
  name VARCHAR(50),
  race VARCHAR(20),
  class_title VARCHAR(30),
  skills JSONB, -- {combat: 45, magic: 23, stealth: 67, ...}
  ascii_color VARCHAR(10),
  created_at TIMESTAMP
);

-- Session management
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY,
  status VARCHAR(20),
  tick_config JSONB,
  current_tick INTEGER,
  player_count INTEGER DEFAULT 0,
  max_players INTEGER DEFAULT 8,
  created_at TIMESTAMP
);

-- Real-time action queue
CREATE TABLE action_queue (
  session_id UUID REFERENCES game_sessions(id),
  player_id UUID REFERENCES players(id),
  tick_number INTEGER,
  action_type VARCHAR(30),
  action_data JSONB,
  submitted_at TIMESTAMP,
  processed BOOLEAN DEFAULT FALSE
);
```

#### Redis State Management
```typescript
// Active session state (temporary)
interface SessionState {
  sessionId: string;
  currentGameState: GameState;
  queuedActions: Action[];
  connectedPlayers: string[];
  nextTickTime: Date;
}
```

### WebSocket Communication

#### Real-Time Messaging
```typescript
// Client-Server message types
interface GameMessage {
  type: 'action' | 'state_update' | 'tick_start' | 'tick_complete';
  sessionId: string;
  playerId?: string;
  data: any;
  timestamp: Date;
}

// WebSocket event handlers
onActionSubmit(message: ActionMessage): void;
onPlayerConnect(playerId: string): void;
onPlayerDisconnect(playerId: string): void;
broadcastStateUpdate(sessionId: string, gameState: GameState): void;
```

---

## 📊 Performance and Scalability

### Target Metrics
```
Concurrent Players: 1,000 at launch → 100,000 at 6 months
Sessions: 125 concurrent 8-player sessions → 12,500 sessions
Tick Processing: <3 seconds for 8-player resolution
Database Load: <100ms query response time
WebSocket Latency: <100ms for state updates
```

### Optimization Strategies

#### Session Isolation
- Each 8-player session runs independently
- No cross-session interference or dependencies
- Resource allocation based on active session count

#### Database Performance
- Redis caching for active session state
- PostgreSQL for persistent character data
- Connection pooling for concurrent session access
- Prepared statements for common operations

#### Network Optimization
- WebSocket connection per player
- Efficient ASCII state diff transmission
- Batch updates for simultaneous state changes
- Compression for large map data

---

## 🎨 User Interface Design

### ASCII Terminal Interface

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ DUNGEON MAP (40x20)                   PARTY STATUS (20x20) │
│ ##################                     Player 1: @(Red)     │
│ #.......+........#                     HP: 45/50           │
│ #...@..g.........#                     Skills: Combat 34   │
│ #.......#........#                     Turn: Ready         │
│ #.......#........#                                         │
│ └─────────────────────────────────────────────────────────┘
│ ACTIONS MENU                          CHAT/LOG             │
│ [A]ttack  [M]ove  [S]kill             Player2: Moving east │
│ [I]nventory [W]ait [H]elp             Goblin appears!      │
│ └─────────────────────────────────────────────────────────┘
```

#### Color Scheme
- **Background**: Black (#000000)
- **Text**: White (#FFFFFF)
- **Players**: Bright colors for @ symbols
- **Monsters**: Muted colors for letters
- **Environment**: Gray tones for walls/floors
- **UI Elements**: Green for menus, yellow for highlights

### Mobile Responsiveness
- Scalable ASCII font sizes
- Touch-friendly menu buttons
- Swipe gestures for map navigation
- Portrait mode optimization

---

## 🚀 MVP Scope and Features

### Core MVP Features (8 Weeks)

#### Week 1-2: Foundation
- [x] Game design specification
- [ ] Basic tick system architecture
- [ ] WebSocket communication setup
- [ ] 8-player session management

#### Week 3-4: Game Systems
- [ ] D20 combat engine
- [ ] Skill progression system
- [ ] ASCII rendering engine
- [ ] Basic monster AI

#### Week 5-6: Multiplayer Integration
- [ ] 8-player coordination tools
- [ ] Action queuing and resolution
- [ ] AI substitution for disconnected players
- [ ] Real-time ASCII updates

#### Week 7-8: Polish and Testing
- [ ] Mobile interface optimization
- [ ] Performance testing with 8-player sessions
- [ ] Bug fixes and stability improvements
- [ ] Deployment and monitoring setup

### Post-MVP Features
- Advanced dungeon generation
- Complex skill trees and titles
- Equipment and loot systems
- Extended timer options (4hr, 1 day)
- Clan/guild systems
- Tournament modes

---

## 🎯 Success Criteria

### Technical Benchmarks
- **Stability**: 99.9% uptime during game sessions
- **Performance**: 8-player sessions run smoothly with <3s tick processing
- **Scalability**: Support 125+ concurrent sessions
- **Reliability**: Robust disconnection handling and state recovery

### Gameplay Validation
- **Balance**: Combat encounters appropriately scaled for 8 players
- **Progression**: Skill advancement feels rewarding and meaningful
- **Coordination**: 8-player groups can effectively coordinate actions
- **Interface**: ASCII representation is clear and intuitive

### User Experience Goals
- **Learning Curve**: New players understand basics within 15 minutes
- **Engagement**: Average session length >45 minutes
- **Retention**: >70% of players return for multiple sessions
- **Social**: >80% of players prefer group play to solo

---

**Document Status**: ✅ **COMPLETE - COMPREHENSIVE GAME DESIGN**  
**Next Phase**: Ready for parallel development streams implementation  
**Strategic Assessment**: Innovative combination of MUD reliability, D20 mechanics, and modern multiplayer coordination in ASCII format

*Game Design Completed: 2025-08-18*  
*Prepared by: Multi-Agent Development Team*  
*Implementation Ready: All core systems and mechanics defined*