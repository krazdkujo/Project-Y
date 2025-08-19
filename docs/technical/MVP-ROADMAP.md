# MVP Development Roadmap: Single-Player ASCII Roguelike

**Document Version**: 3.0 (Streamlined)  
**Date**: 2025-08-19  
**Timeline**: 3 weeks to playable single-player experience  
**Maintained By**: Development-Manager Agent

---

## 🎯 MVP Goal: Playable Single-Player ADOM-Inspired Experience

### Core MVP Experience
A player can:
1. **Create character** with 5 skills and attribute allocation
2. **Enter procedurally generated dungeon** (10 levels)
3. **Fight monsters** using ADOM-inspired d20 + skill combat
4. **Experience permadeath** with meaningful account progression
5. **Use ADOM-style commands** for efficient gameplay
6. **Complete or die** with clear consequences and benefits

### Success Criteria
- ✅ Complete gameplay loop functional
- ✅ ADOM-style tactical combat working
- ✅ MUD tick system processing actions correctly
- ✅ Permadeath feels meaningful, not punishing
- ✅ Account progression motivates continued play

---

## 📅 3-Week Implementation Timeline

### Week 1: Foundation Systems (Days 1-7)

#### Day 1-2: Project Setup & Architecture
**Core Infrastructure:**
```typescript
// Project structure
/src
  /server          // Node.js + TypeScript backend
    server.ts      // Express + WebSocket server
    TickSystem.ts  // MUD-inspired tick coordinator
    GameEngine.ts  // Core game logic
  /client          // Browser-based frontend  
    main.ts        // Entry point
    Renderer.ts    // ASCII terminal display
    InputHandler.ts // ADOM-style keyboard commands
  /shared          // Common types and constants
    types.ts       // Game state interfaces
    constants.ts   // Game balance values
```

**Technology Stack:**
- **Backend**: Node.js + TypeScript + Express + ws (WebSocket)
- **Frontend**: Vanilla TypeScript + Canvas/DOM rendering
- **Build**: Vite for fast development
- **Data**: In-memory for MVP (no database complexity)

#### Day 3-4: Character System & Skills
**5-Skill Character Creation:**
```typescript
interface Character {
  name: string
  attributes: {
    strength: number     // 8-18 range
    dexterity: number    // affects accuracy/dodge
    constitution: number // affects health
    intelligence: number // affects mana/learning
    wisdom: number       // affects perception/magic defense
    charisma: number     // affects social interactions
  }
  skills: {
    combat: number       // 0-100: melee effectiveness
    archery: number      // 0-100: ranged combat
    healing: number      // 0-100: HP regeneration rate
    stealth: number      // 0-100: detection avoidance
    survival: number     // 0-100: hunger/environment
  }
  health: number         // 30 + (constitution * 2) + (survival * 1)
  position: Position
}
```

**Character Creation Flow:**
1. Name input
2. Attribute allocation (70 points to distribute)
3. Starting skill allocation (50 points to distribute)
4. Display final character stats
5. Enter dungeon

#### Day 5-6: MUD Tick System
**Tick Architecture:**
```typescript
class TickSystem {
  private tickInterval: number = 2000 // 2-second ticks for MVP
  private actionQueue: Map<string, Action[]>
  private gameState: GameState
  
  queueAction(playerId: string, action: Action): void
  processTick(): void
  resolveActions(): void
  updateGameState(): void
  broadcastState(): void
}
```

**Action Processing:**
1. Player inputs command
2. Action queued for next tick
3. Tick processes all queued actions
4. Game state updated
5. New state rendered to player
6. Next tick scheduled

#### Day 7: Basic ASCII Rendering
**Terminal Display System:**
```typescript
class ASCIIRenderer {
  renderDungeon(map: DungeonMap): void
  renderCharacter(char: Character): void  
  renderStats(stats: CharacterStats): void
  renderMessages(log: string[]): void
  renderUI(): void
}
```

**ADOM-Style Layout:**
```
┌─── MAP (50x15) ─────────────┬─ STATS (25x15) ─┐
│ ####################       │ HP: 45/50       │
│ #..................#       │ St:15 Dx:12      │
│ #....@.............#       │ Co:14 In:10      │
│ #........g.........#       │                  │
│ #..................#       │ Combat: 34       │
│ ####################       │ Archery: 12      │
│                             │ Healing: 23      │
│                             │ Stealth: 8       │
│                             │ Survival: 28     │
├─────────────────────────────┴──────────────────┤
│ > You hit the goblin for 4 damage!             │
│ > The goblin attacks you for 2 damage.         │
└─────────────────────────────────────────────────┘
```

### Week 2: Gameplay Systems (Days 8-14)

#### Day 8-9: Combat Engine
**ADOM-Inspired Combat:**
```typescript
// Combat resolution
function resolveAttack(attacker: Character, defender: Character): CombatResult {
  // Hit calculation
  const hitRoll = d20()
  const hitChance = hitRoll + Math.floor(attacker.skills.combat / 4) + 
                   Math.floor(attacker.attributes.dexterity / 4)
  const defenseValue = 10 + Math.floor(defender.attributes.dexterity / 4)
  
  if (hitChance < defenseValue) {
    return { hit: false, damage: 0, message: "Miss!" }
  }
  
  // Damage calculation
  const baseDamage = 1 + Math.floor(Math.random() * 4) // 1d4
  const strBonus = Math.floor(attacker.attributes.strength / 4)
  const skillBonus = Math.floor(attacker.skills.combat / 10)
  const totalDamage = baseDamage + strBonus + skillBonus
  
  return { hit: true, damage: totalDamage, message: `Hit for ${totalDamage} damage!` }
}
```

**Combat Features:**
- d20 + skill modifier system
- Attribute bonuses for damage/accuracy
- Critical hits on natural 20
- Equipment bonuses (basic weapons/armor)

#### Day 10-11: Dungeon Generation
**Procedural 10-Level Dungeon:**
```typescript
class DungeonGenerator {
  generateLevel(depth: number): DungeonLevel {
    const size = { width: 40, height: 20 }
    const rooms = this.generateRooms(5 + depth) // More rooms deeper
    const corridors = this.connectRooms(rooms)
    const monsters = this.placeMonsters(depth, rooms)
    const items = this.placeItems(depth, rooms)
    
    return { rooms, corridors, monsters, items, stairs: this.placeStairs() }
  }
  
  private generateRooms(count: number): Room[] {
    // Create rectangular rooms with random sizes/positions
    // Ensure no overlaps
    // Vary room sizes for tactical options
  }
}
```

**Monster Scaling by Depth:**
```yaml
Levels 1-2:  [goblin(g), rat(r), kobold(k)]
Levels 3-5:  [orc(o), hobgoblin(h), wolf(w)]  
Levels 6-8:  [troll(T), ogre(O), wraith(W)]
Level 9:     [elite_guard(G), boss_minion(M)]
Level 10:    [dragon(D), lich(L), demon(X)]
```

#### Day 12-13: Monster AI & Interaction
**Simple but Effective AI:**
```typescript
class MonsterAI {
  think(monster: Monster, gameState: GameState): Action {
    const player = gameState.player
    const distance = this.calculateDistance(monster.position, player.position)
    
    if (distance === 1) {
      return { type: 'attack', target: player }
    } else if (this.canSeePlayer(monster, player, gameState.map)) {
      return { type: 'move', direction: this.pathToPlayer(monster, player) }
    } else {
      return { type: 'wander', direction: this.randomDirection() }
    }
  }
}
```

**ADOM-Style Commands:**
```typescript
// Input mapping (single-key efficiency)
const commandMap = {
  // Movement (numpad + vi)
  'h': { type: 'move', direction: 'west' },
  'j': { type: 'move', direction: 'south' },
  'k': { type: 'move', direction: 'north' },
  'l': { type: 'move', direction: 'east' },
  
  // Combat
  'f': { type: 'melee_attack' },
  'r': { type: 'ranged_attack' },
  'g': { type: 'guard' },
  
  // Items
  'i': { type: 'show_inventory' },
  'a': { type: 'apply_item' },
  'd': { type: 'drop_item' },
  'e': { type: 'eat_food' },
  'q': { type: 'quaff_potion' },
  
  // Utility
  'o': { type: 'open' },
  'c': { type: 'close' },
  '.': { type: 'rest' },
  '<': { type: 'go_up' },
  '>': { type: 'go_down' }
}
```

#### Day 14: Items & Equipment
**Basic Item System:**
```typescript
interface Item {
  name: string
  type: 'weapon' | 'armor' | 'potion' | 'scroll' | 'food'
  symbol: string
  color: string
  effects: ItemEffect[]
}

const basicItems = {
  weapons: [
    { name: 'dagger', damage: '1d4', accuracy: +1, symbol: ')', color: 'gray' },
    { name: 'sword', damage: '1d6', accuracy: +2, symbol: ')', color: 'silver' },
    { name: 'bow', damage: '1d6', range: 5, symbol: '}', color: 'brown' }
  ],
  armor: [
    { name: 'leather armor', protection: 2, symbol: '[', color: 'brown' },
    { name: 'chain mail', protection: 4, symbol: '[', color: 'gray' }
  ],
  consumables: [
    { name: 'healing potion', effect: 'heal_hp', amount: 15, symbol: '!', color: 'red' },
    { name: 'bread', effect: 'restore_hunger', symbol: '%', color: 'yellow' }
  ]
}
```

### Week 3: Polish & Integration (Days 15-21)

#### Day 15-16: Permadeath System
**Account Progression Implementation:**
```typescript
interface AccountData {
  totalKnowledgePoints: number
  achievements: Achievement[]
  unlockedOptions: UnlockOption[]
  characterHistory: CharacterRecord[]
}

function calculateKnowledgeGain(character: Character): number {
  let points = 0
  
  // Skill achievements
  Object.values(character.skills).forEach(skill => {
    points += skill // 1 point per skill level achieved
  })
  
  // Exploration achievements  
  points += character.deepestLevel * 10 // 10 points per level reached
  
  // Combat achievements
  points += character.uniqueKills.length * 5 // 5 points per unique monster type
  
  // Special achievements
  if (character.completedDungeon) points += 100
  if (character.killedBoss) points += 50
  
  return points
}

function createNewCharacter(accountData: AccountData): Character {
  const bonusSkillPoints = Math.floor(accountData.totalKnowledgePoints / 20)
  const bonusAttributePoints = Math.floor(accountData.totalKnowledgePoints / 100)
  
  return {
    // Standard creation + bonuses from account progression
    baseSkillPoints: 50 + bonusSkillPoints,
    baseAttributePoints: 70 + bonusAttributePoints,
    // Plus unlocked starting equipment, races, classes
  }
}
```

#### Day 17-18: Balance Tuning
**Playtesting Focus Areas:**
1. **Combat Balance**: Can players defeat enemies with good tactics?
2. **Progression Pacing**: Do skills improve at satisfying rate?
3. **Difficulty Curve**: Is each dungeon level appropriately harder?
4. **Death Frequency**: Is permadeath challenging but not frustrating?
5. **Account Progression**: Does character death feel like meaningful progress?

**Key Metrics to Track:**
- Average character lifespan (target: 15-30 minutes)
- Typical death level (target: level 3-5 for new players)
- Skill progression per session (target: 2-5 skill points gained)
- Player retention after first death (target: >80%)

#### Day 19-20: UI Polish & User Experience
**Interface Improvements:**
- Clear color coding for all game elements
- Efficient message log with important information highlighted
- Intuitive inventory and equipment management
- Help system explaining ADOM-style commands
- Character creation guidance and tooltips

**Performance Optimization:**
- Smooth ASCII rendering (60 FPS target)
- Responsive input handling (<50ms input lag)
- Efficient tick processing (<10ms per tick)
- Memory management for extended play sessions

#### Day 21: Final Integration & Testing
**End-to-End Testing:**
- Complete character creation → dungeon run → death → restart cycle
- All ADOM-style commands working correctly
- Combat system balanced and fun
- Permadeath progression meaningful
- No game-breaking bugs or exploits

---

## 🔧 Technical Architecture

### Minimal Tech Stack (MVP Focus)
```yaml
Backend:
  - Node.js 18+ with TypeScript
  - Express (HTTP server)
  - ws (WebSocket library)
  - No database (in-memory state)

Frontend:
  - Vanilla TypeScript (no framework overhead)
  - Canvas for ASCII rendering
  - CSS for layout
  - No complex state management

Build Tools:
  - Vite (fast development server)
  - TypeScript compiler
  - ESLint for code quality
```

### File Structure
```
/src
  /server
    server.ts           # Express + WebSocket setup
    TickSystem.ts       # MUD tick coordinator
    GameEngine.ts       # Core game logic
    CombatSystem.ts     # ADOM-inspired combat
    DungeonGenerator.ts # Procedural generation
    MonsterAI.ts        # Enemy behaviors
  /client
    main.ts             # Entry point
    ASCIIRenderer.ts    # Terminal display
    InputHandler.ts     # ADOM commands
    GameClient.ts       # Server communication
  /shared
    types.ts            # Shared interfaces
    constants.ts        # Game balance values
    utils.ts            # Common utilities
```

---

## 📊 Success Metrics

### MVP Completion Criteria
- [x] **Character Creation**: Working 5-skill allocation system
- [ ] **Dungeon Exploration**: 10-level procedural dungeon
- [ ] **Combat System**: ADOM-inspired tactical combat
- [ ] **Monster AI**: Basic but effective enemy behaviors
- [ ] **Permadeath**: Meaningful character death with account progression
- [ ] **ADOM Commands**: Efficient single-key command system
- [ ] **Tick System**: MUD-inspired real-time action processing
- [ ] **Item System**: Basic equipment and consumables
- [ ] **UI/UX**: Clear ASCII interface with good information density

### Quality Gates
**Week 1 Gate**: Core systems functional, character creation working
**Week 2 Gate**: Combat and dungeon generation complete, playable loop
**Week 3 Gate**: Polish complete, ready for multiplayer expansion

### Performance Targets
- **Tick Processing**: <10ms per tick
- **Rendering**: 60 FPS ASCII display
- **Input Latency**: <50ms response time
- **Memory Usage**: <50MB for extended sessions

---

## 🚀 Post-MVP Expansion Path

### Phase 2: Content Expansion (Weeks 4-6)
- Expand to 8-12 skills with specialization
- Multiple themed dungeons
- Advanced monster AI and behaviors
- Expanded item system with enchantments

### Phase 3: Multiplayer Foundation (Weeks 7-10)
- Network architecture for 8-player coordination
- Session management and persistence
- Party formation and communication systems
- Shared world and progression

### Phase 4: Full Feature Set (Weeks 11+)
- Complete 30+ skill system
- Complex dungeon mechanics
- Advanced social features
- Persistent world with multiple areas

---

**This roadmap prioritizes delivering a complete, playable single-player experience that demonstrates all core concepts while providing a solid foundation for multiplayer expansion.**