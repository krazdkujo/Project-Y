# Tactical ASCII Roguelike - AP System Development

## Week 1 Implementation Status ✅

This implements the core server architecture for the Refined AP System as specified in the AP-SYSTEM-IMPLEMENTATION-GUIDE.md.

### Completed Components

1. **TypeScript/Node.js Project Structure** ✅
   - Complete package.json with all dependencies
   - TypeScript configuration with strict settings
   - Path aliases for clean imports

2. **APManager Class** ✅
   - Resource tracking (2-3 AP per turn, 8 max)
   - AP validation and spending
   - Player initialization and management

3. **TurnManager Class** ✅
   - Initiative-based turn order (d20 + skill + equipment bonuses)
   - 5-10 second turn timing with automatic timeout
   - Event system for turn coordination

4. **FreeActionProcessor Class** ✅
   - Immediate execution of free actions (0 AP cost)
   - Movement, basic attack, basic defense
   - Position validation and game map integration

5. **Hathora Integration** ✅
   - WebSocket-based lobby management
   - Room creation and player coordination
   - Message routing and error handling

6. **Core Server (server.ts)** ✅
   - All components integrated
   - Game session management
   - Player connection handling

### Project Structure

```
src/
├── server/
│   ├── server.ts           # Main Hathora server with lobby management
│   ├── APSystem.ts         # AP tracking and ability processing
│   ├── TurnManager.ts      # Initiative-based turn order
│   ├── FreeActions.ts      # Immediate action execution
│   └── __tests__/          # Test files
├── client/
│   └── main.ts             # Basic client for testing
├── shared/
│   ├── types.ts            # AP system type definitions
│   └── constants.ts        # Action costs and configurations
└── setupTests.ts           # Jest test configuration
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Development Mode

```bash
npm run dev
```

This starts the server with hot reloading on port 8080.

### 4. Run Tests

```bash
npm test
```

### 5. Build for Production

```bash
npm run build
npm start
```

## Testing the AP System

### Using the Test Client

```typescript
import APSystemClient from './src/client/main';

const client = new APSystemClient('player-1', 'test-room');
await client.connect();

// Ready up
client.ready();

// Execute free actions (0 AP)
client.executeFreeAction('MOVE', { x: 6, y: 5 });
client.executeFreeAction('BASIC_ATTACK', 'target-player-id');
client.executeFreeAction('BASIC_DEFENSE');

// Execute AP abilities
client.executeAPAction('power_strike'); // 2 AP
client.executeAPAction('fireball');     // 3 AP
client.executeAPAction('heal');         // 2 AP

// End turn
client.endTurn();
```

### WebSocket Message Format

Connect to `ws://localhost:8080?roomId=test&playerId=player1`

**Free Action Message:**
```json
{
  "type": "FREE_ACTION",
  "data": {
    "type": "MOVE",
    "playerId": "player1",
    "target": { "x": 6, "y": 5 },
    "immediate": true,
    "timestamp": 1692720000000
  }
}
```

**AP Action Message:**
```json
{
  "type": "AP_ACTION",
  "data": {
    "type": "AP_ABILITY",
    "playerId": "player1",
    "abilityId": "power_strike",
    "target": "enemy-id",
    "apCost": 2,
    "timestamp": 1692720000000
  }
}
```

## API Specification

### Core Classes

#### APManager
- `initializePlayer(playerId, startingAP?)` - Add player with initial AP
- `addAPForTurn(playerId, bonusAP?)` - Grant 2-3 AP per turn
- `canAfford(playerId, cost)` - Check if player can afford ability
- `spendAP(playerId, cost)` - Deduct AP for ability use
- `getCurrentAP(playerId)` - Get current AP amount

#### TurnManager  
- `calculateInitiative(players)` - Roll initiative for all players
- `startTurn()` - Begin current player's turn with timer
- `endTurn()` - End turn and advance to next player
- `isPlayerTurn(playerId)` - Check if it's player's turn
- `getRemainingTurnTime()` - Get seconds left in turn

#### FreeActionProcessor
- `executeImmediately(action)` - Process free action instantly
- `validateFreeAction(action)` - Check if action is valid
- `getValidTargets(playerId, actionType)` - Get available targets

### Performance Targets ✅

All Week 1 targets met according to specification:

- **Turn Processing**: <100ms per action ✅
- **Initiative Calculation**: <50ms for 8 players ✅  
- **AP Validation**: <25ms per ability ✅
- **Turn Time Limit**: 5-10 seconds ✅

## Quality Gate 1 Status ✅

Week 1 requirements completed:

- ✅ Free actions execute immediately without AP cost
- ✅ Basic AP tracking (2-3 per turn, max 8) working  
- ✅ Turn order via initiative established
- ✅ 5-10 second turn targets met in testing

## Next Steps (Week 2)

1. Enhanced Hathora SDK integration
2. Formation bonus calculations
3. Combo ability system basics
4. UI/UX improvements for turn indicators
5. Load testing with multiple lobbies

## Architecture Notes

### AP System Design

The AP system follows the exact specifications:

- **Free Actions**: 0 AP cost, immediate execution
- **AP Abilities**: 1-8 AP cost, validated before execution
- **Turn Structure**: Initiative-based with skill/equipment bonuses
- **Resource Management**: 2-3 AP per turn, 8 maximum

### Event-Driven Architecture

All components use event emitters for loose coupling:

```typescript
turnManager.on('turn_started', (data) => {
  apManager.addAPForTurn(data.playerId);
});

turnManager.on('round_completed', () => {
  // Grant AP to all players
});
```

### Error Handling

Comprehensive error handling with specific error messages:

- Insufficient AP errors
- Skill requirement validation  
- Turn timing violations
- Connection issues

### Testing Strategy

- Unit tests for all core classes
- Integration tests for component interaction
- Performance benchmarks for turn processing
- Load testing for 8-player scenarios

## Troubleshooting

### Common Issues

1. **Port already in use**: Change PORT in .env
2. **Module resolution errors**: Check tsconfig.json paths
3. **WebSocket connection fails**: Verify server is running
4. **Tests failing**: Run `npm run build` first

### Debug Mode

Set `DEBUG_MODE=true` in .env for verbose logging.

### Performance Monitoring

The server tracks turn processing times and will log warnings if targets are exceeded.

---

This Week 1 implementation provides a solid foundation for the Refined AP System with all core components functional and tested.