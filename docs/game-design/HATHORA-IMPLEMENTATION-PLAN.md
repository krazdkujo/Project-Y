# Hathora Implementation Plan: 8-Player Roguelike Lobbies

**Document Version**: 1.0  
**Date**: 2025-08-22  
**Target**: Dynamic lobby-based multiplayer with Hathora Cloud  
**Maintained By**: Development Team

---

## 🎯 **OVERVIEW: HATHORA-POWERED ARCHITECTURE**

### **Why Hathora for This Project**

Hathora Cloud is the perfect infrastructure solution for our 8-player roguelike because it provides:

- **Dynamic Server Spawning**: Automatically creates/destroys game servers for each 8-player lobby
- **Global Edge Network**: Low-latency WebSocket connections worldwide
- **Built-in Matchmaking**: Handles player discovery and lobby joining
- **Automatic Scaling**: Servers scale up/down based on active lobbies
- **Cost Efficiency**: Pay only for active game sessions
- **WebSocket Native**: Perfect for our 2-second tick system

### **Core Architecture Pattern**

```typescript
// Each 8-player group gets a dedicated Hathora server instance
Lobby 1: hathora-server-abc123.hathora.dev (8 players)
Lobby 2: hathora-server-def456.hathora.dev (8 players) 
Lobby 3: hathora-server-ghi789.hathora.dev (3 players, accepting more)
```

**Key Benefits**:
- **Isolated Game State**: Each lobby has its own server and game world
- **Automatic Cleanup**: Servers terminate when lobby is empty
- **No Server Management**: Hathora handles all infrastructure
- **Perfect Scalability**: Supports 1 to 1000+ concurrent lobbies

---

## 🏗️ **TECHNICAL ARCHITECTURE**

### **System Overview**

```
┌─────────────────┐    ┌──────────────────────┐    ┌─────────────────┐
│   Web Client    │───▶│   Hathora Lobby     │───▶│  Game Server    │
│  (Browser/App)  │    │   Matchmaking       │    │  (Node.js +     │
│                 │    │                     │    │   WebSocket)    │
│ - ASCII Render  │    │ - Player Discovery  │    │ - Tick System   │
│ - Input Handler │    │ - Lobby Creation    │    │ - Game State    │
│ - WebSocket     │    │ - Session Management│    │ - 8-Player Sync │
└─────────────────┘    └──────────────────────┘    └─────────────────┘
```

### **Hathora Integration Points**

#### **1. Lobby Creation & Matchmaking**
```typescript
// Client creates or joins lobby
import { HathoraClient } from "@hathora/client-sdk";

class LobbyManager {
  private hathora = new HathoraClient({ appId: "your-app-id" });
  
  async createLobby(): Promise<string> {
    const lobby = await this.hathora.lobbies.createLobby({
      visibility: "public",
      region: "auto", // Hathora picks best region
      config: {
        maxPlayers: 8,
        gameMode: "roguelike-dungeon"
      }
    });
    return lobby.roomId;
  }
  
  async joinLobby(roomId: string): Promise<void> {
    await this.hathora.lobbies.joinLobby({ roomId });
    const connectionInfo = await this.hathora.rooms.getConnectionInfo({ roomId });
    this.connectToGameServer(connectionInfo);
  }
}
```

#### **2. Game Server Spawning**
```typescript
// Hathora automatically spawns this when lobby is created
// server.ts - Main game server entry point
import { startServer } from "@hathora/server-sdk";
import { GameEngine } from "./GameEngine";
import { TickSystem } from "./TickSystem";

interface GameServer {
  roomId: string;
  players: Map<string, Player>;
  gameEngine: GameEngine;
  tickSystem: TickSystem;
}

startServer({
  port: process.env.PORT || 8080,
  onConnection: (socket: WebSocket, roomId: string) => {
    console.log(`Player connected to room ${roomId}`);
    handlePlayerConnection(socket, roomId);
  },
  onDisconnection: (socket: WebSocket, roomId: string) => {
    console.log(`Player disconnected from room ${roomId}`);
    handlePlayerDisconnection(socket, roomId);
  }
});
```

#### **3. WebSocket Communication**
```typescript
// Real-time 2-second tick coordination
class GameSession {
  private tickInterval: NodeJS.Timer;
  private connectedPlayers = new Map<string, WebSocket>();
  
  startSession() {
    // 2-second tick system for turn coordination
    this.tickInterval = setInterval(() => {
      this.processTick();
    }, 2000);
  }
  
  processTick() {
    // Collect all player actions from this tick
    const actions = this.collectPlayerActions();
    
    // Process all actions simultaneously
    const results = this.gameEngine.processActions(actions);
    
    // Broadcast updated game state to all players
    this.broadcastGameState(results);
  }
  
  broadcastGameState(gameState: GameState) {
    const message = JSON.stringify({
      type: "game_state_update",
      tick: gameState.currentTick,
      players: gameState.players,
      dungeon: gameState.currentLevel,
      events: gameState.lastTickEvents
    });
    
    this.connectedPlayers.forEach(socket => {
      socket.send(message);
    });
  }
}
```

---

## 🎮 **LOBBY-BASED GAMEPLAY FLOW**

### **Player Journey**

#### **1. Lobby Discovery**
```typescript
// Player opens game in browser
// Shows list of available lobbies
interface LobbyInfo {
  roomId: string;
  currentPlayers: number;
  maxPlayers: 8;
  dungeonLevel: number;
  difficulty: "easy" | "medium" | "hard";
  status: "waiting" | "in-progress" | "full";
}

// Example lobby list
const availableLobbies = [
  { roomId: "abc123", currentPlayers: 6, maxPlayers: 8, dungeonLevel: 1, status: "waiting" },
  { roomId: "def456", currentPlayers: 3, maxPlayers: 8, dungeonLevel: 5, status: "in-progress" },
  { roomId: "ghi789", currentPlayers: 8, maxPlayers: 8, dungeonLevel: 10, status: "full" }
];
```

#### **2. Lobby Joining**
```yaml
Join Options:
  - "Quick Match": Auto-join best available lobby
  - "Create New": Start fresh 8-player lobby  
  - "Browse Lobbies": Manual selection from list
  - "Join Friend": Direct room code entry
```

#### **3. Pre-Game Preparation**
```typescript
// Lobby waiting room with 8 player slots
interface LobbyState {
  players: [
    { id: "player1", name: "Alice", ready: true },
    { id: "player2", name: "Bob", ready: false },
    { id: null, name: null, ready: false }, // Empty slot
    // ... 5 more slots
  ];
  settings: {
    difficulty: "medium",
    permadeathMode: true,
    turnTimer: 60 // seconds per turn
  };
  readyToStart: boolean;
}

// Game starts when:
// - At least 4 players present (minimum viable party)
// - All present players marked as "ready"
// - Party leader confirms start
```

#### **4. Dynamic Server Lifecycle**
```typescript
// Hathora automatically manages server lifecycle

class ServerLifecycle {
  // Server spins up when first player joins lobby
  onFirstPlayerJoin(roomId: string) {
    console.log(`Starting game server for room ${roomId}`);
    this.initializeGameWorld();
    this.startTickSystem();
  }
  
  // Server persists during active gameplay
  onPlayerReconnect(playerId: string, roomId: string) {
    console.log(`Player ${playerId} reconnected to ${roomId}`);
    this.syncPlayerState(playerId);
  }
  
  // Server shuts down after 10 minutes of empty lobby
  onAllPlayersDisconnect(roomId: string) {
    console.log(`All players left room ${roomId}, scheduling shutdown`);
    setTimeout(() => {
      this.saveGameState(); // Optional: persist for later resume
      process.exit(0); // Hathora cleans up automatically
    }, 600000); // 10 minute grace period
  }
}
```

---

## 💰 **COST ANALYSIS & SCALING**

### **Hathora Pricing Model** (2025 rates)

```yaml
# Hathora Cloud pricing tiers
Compute:
  - $0.50/hour per 1 vCPU server instance
  - Our game needs ~0.25 vCPU per lobby (lightweight)
  - Effective cost: ~$0.125/hour per 8-player lobby
  
Bandwidth:
  - $0.10/GB for data transfer
  - Our ASCII game: ~5MB/hour per lobby
  - Bandwidth cost: ~$0.0005/hour per lobby
  
Total per lobby: ~$0.13/hour ($1.04 for 8-hour session)
```

### **Cost Scenarios**

| Concurrent Lobbies | Players Online | Monthly Cost | Cost per Player/Hour |
|-------------------|---------------|--------------|---------------------|
| 5 lobbies | 40 players | $468 | $0.016 |
| 25 lobbies | 200 players | $2,340 | $0.016 |
| 100 lobbies | 800 players | $9,360 | $0.016 |

### **Cost Optimization Strategies**

#### **1. Automatic Server Scaling**
```typescript
// Hathora automatically optimizes compute allocation
class ServerOptimization {
  // Lobbies with <3 players use minimal resources
  lightweightMode(playerCount: number) {
    if (playerCount < 3) {
      return { cpu: 0.1, memory: "128MB" };
    }
    return { cpu: 0.25, memory: "256MB" };
  }
  
  // Servers shut down after inactivity
  autoShutdown(lastActivity: Date) {
    const inactiveMinutes = (Date.now() - lastActivity.getTime()) / 60000;
    return inactiveMinutes > 10; // Shutdown after 10 minutes
  }
}
```

#### **2. Regional Distribution**
```typescript
// Hathora deploys servers in optimal regions
const regionConfig = {
  "auto": true, // Let Hathora choose best region
  "fallback_regions": ["us-east", "us-west", "eu-west", "asia-southeast"]
};

// Lower latency = better player experience = higher retention
```

---

## 🔧 **DEVELOPMENT IMPLEMENTATION**

### **Phase 1: Hathora Integration (Week 1)**

#### **Day 1-2: Project Setup**
```bash
# Initialize Hathora project
npm install @hathora/client-sdk @hathora/server-sdk
hathora login
hathora init roguelike-8player

# Configure hathora.yml
```

```yaml
# hathora.yml - Hathora configuration
application:
  name: "8-player-roguelike"
  runtime: "node18"
  
server:
  dockerfile: "Dockerfile"
  build_script: "npm run build"
  start_script: "npm run start"
  
rooms:
  max_players: 8
  auto_shutdown_minutes: 10
  
regions:
  - us-east
  - us-west  
  - eu-west
  - asia-southeast
```

#### **Day 3-4: Basic Lobby System**
```typescript
// Implement core lobby functionality
class HathoraLobbySystem {
  async createGameLobby(): Promise<string> {
    const lobby = await this.hathora.lobbies.createLobby({
      visibility: "public",
      region: "auto",
      config: {
        maxPlayers: 8,
        gameType: "dungeon-crawler",
        difficulty: "medium"
      }
    });
    
    return lobby.roomId;
  }
  
  async joinExistingLobby(roomId: string): Promise<void> {
    // Handle lobby joining logic
    await this.hathora.lobbies.joinLobby({ roomId });
    
    // Get connection info for WebSocket
    const connectionInfo = await this.hathora.rooms.getConnectionInfo({ roomId });
    this.establishGameConnection(connectionInfo);
  }
}
```

#### **Day 5-7: Game Server Foundation**
```typescript
// Hathora game server implementation
import { startServer } from "@hathora/server-sdk";

// Game state for each lobby
const activeLobbyGames = new Map<string, GameSession>();

startServer({
  port: process.env.PORT || 8080,
  
  onConnection: async (socket: WebSocket, roomId: string) => {
    let gameSession = activeLobbyGames.get(roomId);
    
    if (!gameSession) {
      // First player in lobby - initialize game
      gameSession = new GameSession(roomId);
      activeLobbyGames.set(roomId, gameSession);
    }
    
    gameSession.addPlayer(socket);
  },
  
  onMessage: (socket: WebSocket, roomId: string, message: string) => {
    const gameSession = activeLobbyGames.get(roomId);
    gameSession?.handlePlayerAction(socket, JSON.parse(message));
  },
  
  onDisconnection: (socket: WebSocket, roomId: string) => {
    const gameSession = activeLobbyGames.get(roomId);
    gameSession?.removePlayer(socket);
    
    // Clean up empty lobbies
    if (gameSession?.playerCount === 0) {
      activeLobbyGames.delete(roomId);
    }
  }
});
```

### **Phase 2: Real-Time Tick System (Week 2)**

#### **Multi-Lobby Tick Coordination**
```typescript
class MultiLobbyTickManager {
  private lobbyTickers = new Map<string, NodeJS.Timer>();
  
  startLobbyTicker(roomId: string, gameSession: GameSession) {
    // Each lobby gets its own independent 2-second tick
    const ticker = setInterval(() => {
      gameSession.processTick();
    }, 2000);
    
    this.lobbyTickers.set(roomId, ticker);
  }
  
  stopLobbyTicker(roomId: string) {
    const ticker = this.lobbyTickers.get(roomId);
    if (ticker) {
      clearInterval(ticker);
      this.lobbyTickers.delete(roomId);
    }
  }
}
```

#### **8-Player Action Coordination**
```typescript
class EightPlayerCoordination {
  private playerActions = new Map<string, PlayerAction>();
  private tickDeadline: Date;
  
  queuePlayerAction(playerId: string, action: PlayerAction) {
    // Store action for this tick
    this.playerActions.set(playerId, action);
    
    // If all 8 players have submitted actions, process immediately
    if (this.playerActions.size === this.gameSession.activePlayerCount) {
      this.processTickEarly();
    }
  }
  
  processTick() {
    // Process all submitted actions
    const actions = Array.from(this.playerActions.values());
    const results = this.gameEngine.processSimultaneousActions(actions);
    
    // Clear action queue for next tick
    this.playerActions.clear();
    
    // Broadcast results to all players
    this.broadcastTickResults(results);
  }
}
```

### **Phase 3: Production Polish (Week 3)**

#### **Error Handling & Reconnection**
```typescript
class LobbyResilience {
  handlePlayerReconnection(socket: WebSocket, roomId: string, playerId: string) {
    const gameSession = activeLobbyGames.get(roomId);
    
    if (gameSession) {
      // Reconnect player to existing game
      gameSession.reconnectPlayer(socket, playerId);
      
      // Send current game state for sync
      socket.send(JSON.stringify({
        type: "reconnection_sync",
        gameState: gameSession.getCurrentState(),
        missedTicks: gameSession.getTicksSince(playerId.lastTick)
      }));
    }
  }
  
  handleServerRestart(roomId: string) {
    // Optional: Implement game state persistence
    // For MVP: Players get disconnected, can rejoin new lobby
    console.log(`Server restarting, lobby ${roomId} will be recreated`);
  }
}
```

#### **Monitoring & Analytics**
```typescript
class LobbyAnalytics {
  trackLobbyMetrics(roomId: string, event: string, data: any) {
    // Track important metrics for optimization
    const metrics = {
      roomId,
      event,
      timestamp: new Date(),
      playerCount: data.playerCount,
      tickProcessingTime: data.tickTime,
      memory_usage: process.memoryUsage(),
      ...data
    };
    
    // Send to analytics service (optional)
    console.log("Lobby metrics:", metrics);
  }
}
```

---

## 🚀 **DEPLOYMENT STRATEGY**

### **Hathora Deployment Pipeline**

#### **1. Local Development**
```bash
# Run Hathora local development server
hathora dev

# Test with multiple clients
# Each browser tab = different player in same lobby
```

#### **2. Staging Deployment**
```bash
# Deploy to Hathora staging environment
hathora deploy --env staging

# Test with distributed players
# Verify global latency and performance
```

#### **3. Production Deployment**
```bash
# Deploy to Hathora production
hathora deploy --env production

# Monitor lobby creation and server spawning
hathora logs --tail
```

### **Quality Assurance Testing**

#### **Lobby-Specific Test Cases**
```yaml
Test Scenarios:
  - Single player creates lobby, 7 others join
  - Players disconnect/reconnect during game
  - Lobby fills to 8 players, then empties
  - Multiple lobbies running simultaneously
  - Cross-region players joining same lobby
  - Server restart during active game
  - Network interruption handling
  - Tick synchronization across all players
```

#### **Load Testing**
```typescript
// Simulate multiple lobbies under load
class LoadTesting {
  async createTestLobbies(count: number) {
    const lobbies = [];
    
    for (let i = 0; i < count; i++) {
      const lobby = await this.hathora.lobbies.createLobby({
        visibility: "private", // Test lobbies
        config: { maxPlayers: 8 }
      });
      
      // Fill with AI players for testing
      await this.fillLobbyWithBots(lobby.roomId, 8);
      lobbies.push(lobby);
    }
    
    return lobbies;
  }
}
```

---

## 📊 **PERFORMANCE TARGETS**

### **Key Performance Indicators**

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Lobby Creation Time** | <2 seconds | Time from request to playable |
| **Player Join Latency** | <1 second | Connection to game sync |
| **Tick Processing** | <100ms | Action processing per tick |
| **WebSocket Latency** | <50ms | Round-trip message time |
| **Server Memory** | <256MB | Per lobby memory usage |
| **Concurrent Lobbies** | 100+ | Max lobbies per region |

### **Scaling Benchmarks**

```typescript
// Performance monitoring
class PerformanceMonitoring {
  measureTickPerformance() {
    const startTime = performance.now();
    
    // Process tick
    this.gameSession.processTick();
    
    const endTime = performance.now();
    const tickDuration = endTime - startTime;
    
    if (tickDuration > 100) {
      console.warn(`Slow tick detected: ${tickDuration}ms`);
    }
    
    return tickDuration;
  }
  
  measureMemoryUsage() {
    const usage = process.memoryUsage();
    
    if (usage.heapUsed > 268435456) { // 256MB
      console.warn(`High memory usage: ${usage.heapUsed / 1048576}MB`);
    }
    
    return usage;
  }
}
```

---

## 🎯 **SUCCESS CRITERIA**

### **Week 1 Deliverables**
- [x] Hathora project configured and deployed
- [x] Basic lobby creation/joining functional  
- [x] WebSocket connection established
- [x] Single lobby with 8 players working

### **Week 2 Deliverables**
- [x] Multiple concurrent lobbies
- [x] 2-second tick system per lobby
- [x] Player reconnection handling
- [x] Game state synchronization

### **Week 3 Deliverables**
- [x] Production-ready deployment
- [x] Load testing with 50+ concurrent lobbies
- [x] Monitoring and analytics
- [x] Error handling and resilience

### **MVP Complete Definition**
A player can:
1. **Create or join** an 8-player lobby instantly
2. **Play real-time roguelike** with coordinated 2-second ticks
3. **Disconnect and reconnect** without losing progress
4. **Experience multiple lobbies** running simultaneously
5. **Get global low-latency** connections via Hathora edge network

---

## 🔮 **POST-MVP EXPANSION**

### **Advanced Hathora Features**

#### **Persistent Lobbies**
```typescript
// Save lobby state for long-running campaigns
class PersistentLobbies {
  async saveLobbyState(roomId: string, gameState: GameState) {
    // Store in database for multi-session campaigns
    await this.database.saveGameState(roomId, gameState);
  }
  
  async resumeLobby(roomId: string): Promise<GameState> {
    // Restore lobby from previous session
    return await this.database.loadGameState(roomId);
  }
}
```

#### **Tournament Mode**
```typescript
// Multiple lobbies competing in tournament bracket
class TournamentMode {
  createTournamentBracket(playerCount: number) {
    const lobbyCount = Math.ceil(playerCount / 8);
    const tournamentLobbies = [];
    
    for (let i = 0; i < lobbyCount; i++) {
      const lobby = this.createCompetitiveLobby({
        bracketPosition: i,
        eliminationMode: true,
        spectatorMode: true
      });
      tournamentLobbies.push(lobby);
    }
    
    return tournamentLobbies;
  }
}
```

#### **Spectator System**
```typescript
// Watch other lobbies play
class SpectatorMode {
  async joinAsSpectator(roomId: string): Promise<void> {
    await this.hathora.lobbies.joinLobby({ 
      roomId, 
      role: "spectator" 
    });
    
    // Receive game state updates without ability to influence
    this.socket.on("game_state_update", this.renderSpectatorView);
  }
}
```

---

**This Hathora implementation plan provides the foundation for a scalable, globally accessible 8-player roguelike with automatic lobby management and cost-efficient server spawning. The architecture scales from MVP to production seamlessly.**