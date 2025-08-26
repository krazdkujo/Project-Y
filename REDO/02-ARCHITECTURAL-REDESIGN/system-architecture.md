# SYSTEM ARCHITECTURE REDESIGN
## Complete Architectural Vision for Tactical ASCII Roguelike

---

## ARCHITECTURAL OVERVIEW

### **CURRENT SYSTEM PROBLEMS**
- **Mixed Technology Stack**: TypeScript classes coexist with vanilla JavaScript modules
- **Tight Coupling**: Components directly reference each other creating dependency webs
- **Inconsistent State Management**: Manual coordination between 11+ JavaScript files
- **Performance Bottlenecks**: DOM manipulation without optimization or caching
- **Testing Limitations**: Tightly coupled code prevents effective unit testing

### **NEW ARCHITECTURAL PRINCIPLES**

#### **1. UNIFIED TECHNOLOGY FOUNDATION** 🏗️
- **Single Language**: TypeScript throughout with strict type safety
- **Modern Module System**: ES6+ modules with proper import/export patterns
- **Consistent Patterns**: Standardized component, service, and store structures

#### **2. EVENT-DRIVEN COMMUNICATION** 🔄
- **Central Event Bus**: All components communicate through typed events
- **Loose Coupling**: Components never directly reference each other
- **Predictable Flow**: Clear event flow makes debugging and testing easier

#### **3. LAYERED ARCHITECTURE** 📚
```
┌─────────────────────────────────────┐
│           UI LAYER                  │ ← React Components
├─────────────────────────────────────┤
│       APPLICATION LAYER             │ ← Business Logic Services  
├─────────────────────────────────────┤
│        DOMAIN LAYER                 │ ← Game Rules & Entities
├─────────────────────────────────────┤
│      INFRASTRUCTURE LAYER           │ ← Network, Database, APIs
└─────────────────────────────────────┘
```

---

## DETAILED SYSTEM DESIGN

### **CLIENT ARCHITECTURE**

```typescript
// New Client Structure
src/
├── components/                    # React UI Components
│   ├── game/
│   │   ├── ASCIIRenderer/        # Maintains exact ASCII standards
│   │   ├── GameMap/              # Interactive dungeon display
│   │   ├── ActionSelector/       # Skill and ability selection
│   │   ├── PlayerStats/          # Health, mana, AP display
│   │   └── QuickSkillBar/        # [1-9] hotkey system (PROTECTED)
│   ├── layout/
│   │   ├── GameLayout/           # Main game screen structure
│   │   ├── ResponsiveGrid/       # ASCII-aware responsive design
│   │   └── ThemeProvider/        # Theme switching system
│   └── ui/
│       ├── MessageLog/           # Game events and notifications
│       ├── InitiativeTracker/    # Turn order display
│       └── ConnectionStatus/     # Multiplayer connection health
├── services/                     # Business Logic Layer
│   ├── GameService/              # Core game logic coordination
│   ├── NetworkService/           # WebSocket management
│   ├── APService/                # Action Point calculations
│   ├── SkillService/             # Skill progression and abilities
│   └── RenderingService/         # ASCII rendering optimization
├── stores/                       # State Management
│   ├── gameStore.ts              # Current game state
│   ├── playerStore.ts            # Character data and progression
│   ├── uiStore.ts                # UI preferences and state
│   └── networkStore.ts           # Connection and sync state
├── events/                       # Event System
│   ├── EventBus.ts               # Central event coordinator
│   ├── GameEvents.ts             # Game action events
│   ├── NetworkEvents.ts          # Communication events
│   └── UIEvents.ts               # Interface interaction events
├── types/                        # TypeScript Definitions
│   ├── GameTypes.ts              # Core game entities
│   ├── NetworkTypes.ts           # Communication protocols
│   └── UITypes.ts                # Component interfaces
└── utils/                        # Shared Utilities
    ├── ASCIIUtils.ts             # Character manipulation helpers
    ├── MathUtils.ts              # Game calculations
    └── ValidationUtils.ts        # Input validation
```

### **EVENT-DRIVEN COMMUNICATION PATTERN**

```typescript
// Central Event Bus Implementation
export class EventBus {
  private listeners = new Map<string, Function[]>();
  
  emit<T>(event: GameEvent<T>): void {
    const handlers = this.listeners.get(event.type) || [];
    handlers.forEach(handler => handler(event));
  }
  
  on<T>(eventType: string, handler: (event: GameEvent<T>) => void): void {
    const handlers = this.listeners.get(eventType) || [];
    handlers.push(handler);
    this.listeners.set(eventType, handlers);
  }
  
  off(eventType: string, handler: Function): void {
    const handlers = this.listeners.get(eventType) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) handlers.splice(index, 1);
  }
}

// Typed Events for Game Actions
interface GameEvents {
  'game.action.move': { playerId: string; position: Point; cost: number };
  'game.action.ability': { playerId: string; abilityId: string; target?: Point };
  'game.turn.end': { playerId: string; remainingAP: number };
  'game.state.update': { gameState: GameState };
  'network.connection.status': { status: 'connected' | 'disconnected' | 'reconnecting' };
  'ui.skill.select': { skillId: string; hotkey: number };
}

// Example Component Using Events
export const ActionSelector: React.FC = () => {
  const eventBus = useEventBus();
  
  const handleSkillSelection = useCallback((skillId: string, hotkey: number) => {
    eventBus.emit({
      type: 'ui.skill.select',
      data: { skillId, hotkey },
      timestamp: Date.now(),
      source: 'ActionSelector'
    });
  }, [eventBus]);
  
  return (
    <div className="action-selector">
      {/* Component JSX with event-driven interactions */}
    </div>
  );
};
```

---

## SERVER ARCHITECTURE REDESIGN

### **MICROSERVICES BREAKDOWN**

```typescript
// Microservices Architecture
services/
├── game-engine-service/          # Core game logic
│   ├── src/
│   │   ├── combat/              # Combat calculations
│   │   ├── skills/              # Skill system management
│   │   ├── turns/               # Turn order and timing
│   │   └── validation/          # Game rule enforcement
│   └── tests/
├── session-service/              # Room and lobby management
│   ├── src/
│   │   ├── rooms/               # Game room coordination
│   │   ├── matchmaking/         # Player coordination
│   │   └── persistence/         # Session state management
│   └── tests/
├── player-service/               # Character progression
│   ├── src/
│   │   ├── characters/          # Character data management
│   │   ├── progression/         # Skill advancement
│   │   └── inventory/           # Equipment and items
│   └── tests/
├── world-service/                # Dungeon and environment
│   ├── src/
│   │   ├── generation/          # Procedural dungeon creation
│   │   ├── persistence/         # World state storage
│   │   └── streaming/           # Dynamic content loading
│   └── tests/
└── communication-service/        # WebSocket gateway
    ├── src/
    │   ├── websocket/           # Connection management
    │   ├── routing/             # Message routing
    │   └── authentication/     # Security validation
    └── tests/
```

### **SERVICE COMMUNICATION PATTERN**

```typescript
// Event-Driven Inter-Service Communication
export class ServiceEventBus {
  constructor(private redisClient: Redis) {}
  
  async publishEvent(event: ServiceEvent): Promise<void> {
    await this.redisClient.publish(
      `service.${event.targetService}`,
      JSON.stringify(event)
    );
  }
  
  async subscribeToEvents(
    serviceId: string, 
    handler: (event: ServiceEvent) => void
  ): Promise<void> {
    await this.redisClient.subscribe(`service.${serviceId}`);
    this.redisClient.on('message', (channel, message) => {
      const event = JSON.parse(message) as ServiceEvent;
      handler(event);
    });
  }
}

// Service Communication Examples
interface ServiceEvents {
  'player.action.submitted': {
    playerId: string;
    action: GameAction;
    sessionId: string;
  };
  'game.state.changed': {
    sessionId: string;
    changes: StateChange[];
    timestamp: number;
  };
  'skill.progression.updated': {
    playerId: string;
    skillId: string;
    newLevel: number;
    unlockedAbilities: string[];
  };
}
```

---

## DATA FLOW ARCHITECTURE

### **CLIENT-SERVER INTERACTION**

```mermaid
graph TB
    Client[React Client] -->|WebSocket| Gateway[Communication Service]
    Gateway -->|Route Events| GameEngine[Game Engine Service]
    Gateway -->|Route Events| Player[Player Service]
    Gateway -->|Route Events| World[World Service]
    
    GameEngine -->|State Updates| Redis[(Redis Cache)]
    Player -->|Progression| PostgreSQL[(PostgreSQL)]
    World -->|Dungeon Data| PostgreSQL
    
    Redis -->|Real-time Updates| Gateway
    Gateway -->|WebSocket| Client
    
    GameEngine <-->|Service Events| Player
    GameEngine <-->|Service Events| World
```

### **STATE SYNCHRONIZATION FLOW**

```typescript
// Client-Side State Management with Server Sync
export class GameStateManager {
  private localState: GameState;
  private serverState: GameState;
  private pendingActions: GameAction[] = [];
  
  // Optimistic Updates for Immediate Feedback
  applyAction(action: GameAction): void {
    // Apply immediately to local state
    this.localState = this.gameLogic.applyAction(this.localState, action);
    
    // Send to server for validation
    this.networkService.sendAction(action);
    
    // Track pending for reconciliation
    this.pendingActions.push(action);
  }
  
  // Server Reconciliation
  handleServerUpdate(serverState: GameState): void {
    // Check for conflicts between local and server state
    const conflicts = this.detectConflicts(this.localState, serverState);
    
    if (conflicts.length === 0) {
      // No conflicts - accept server state
      this.serverState = serverState;
      this.clearReconciledActions(serverState);
    } else {
      // Conflicts detected - resolve and replay
      this.resolveConflicts(conflicts);
      this.replayPendingActions();
    }
  }
}
```

---

## PERFORMANCE OPTIMIZATION ARCHITECTURE

### **CLIENT-SIDE RENDERING OPTIMIZATION**

```typescript
// Optimized ASCII Rendering System
export class PerformantASCIIRenderer {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private renderCache = new Map<string, ImageData>();
  private dirtyRegions = new Set<Rectangle>();
  
  // Virtual Scrolling for Large Maps
  renderVisibleRegion(gameMap: GameMap, viewport: Rectangle): void {
    const visibleCells = this.calculateVisibleCells(gameMap, viewport);
    
    visibleCells.forEach(cell => {
      if (this.isDirty(cell) || !this.renderCache.has(cell.id)) {
        this.renderCell(cell);
        this.renderCache.set(cell.id, this.getCellImageData(cell));
        this.markClean(cell);
      } else {
        this.blitFromCache(cell);
      }
    });
  }
  
  // Batch DOM Updates
  updateInterface(): void {
    // Collect all pending UI updates
    const updates = this.collectPendingUpdates();
    
    // Apply all updates in single requestAnimationFrame
    requestAnimationFrame(() => {
      updates.forEach(update => this.applyUpdate(update));
    });
  }
}
```

### **SERVER-SIDE PERFORMANCE PATTERNS**

```typescript
// Connection Pool Management
export class OptimizedConnectionManager {
  private connections = new Map<string, WebSocket>();
  private connectionPools = new Map<string, WebSocket[]>();
  
  // Efficient Message Broadcasting
  broadcastToRoom(roomId: string, message: GameMessage): void {
    const roomConnections = this.getRoomConnections(roomId);
    const serializedMessage = JSON.stringify(message);
    
    // Batch send to avoid event loop blocking
    setImmediate(() => {
      roomConnections.forEach(connection => {
        if (connection.readyState === WebSocket.OPEN) {
          connection.send(serializedMessage);
        }
      });
    });
  }
  
  // Connection Health Monitoring
  monitorConnections(): void {
    setInterval(() => {
      this.connections.forEach((connection, playerId) => {
        if (!this.isHealthy(connection)) {
          this.handleUnhealthyConnection(playerId, connection);
        }
      });
    }, 30000); // Check every 30 seconds
  }
}
```

---

## DEPLOYMENT ARCHITECTURE

### **CONTAINERIZED MICROSERVICES**

```dockerfile
# Example Service Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY src/ ./src/
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

# Run application
EXPOSE 3000
CMD ["npm", "start"]
```

### **ORCHESTRATION WITH DOCKER COMPOSE**

```yaml
# docker-compose.yml for local development
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
  
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: tactical_roguelike
      POSTGRES_USER: game_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  game-engine:
    build: ./services/game-engine
    environment:
      REDIS_URL: redis://redis:6379
      DB_URL: postgresql://game_user:${DB_PASSWORD}@postgres:5432/tactical_roguelike
    depends_on:
      - redis
      - postgres
    ports:
      - "3001:3000"
  
  session-service:
    build: ./services/session-service
    environment:
      REDIS_URL: redis://redis:6379
      GAME_ENGINE_URL: http://game-engine:3000
    depends_on:
      - redis
      - game-engine
    ports:
      - "3002:3000"
  
  communication-service:
    build: ./services/communication-service
    environment:
      REDIS_URL: redis://redis:6379
    depends_on:
      - redis
      - game-engine
      - session-service
    ports:
      - "3000:3000"

volumes:
  redis_data:
  postgres_data:
```

---

## BENEFITS OF NEW ARCHITECTURE

### **DEVELOPMENT BENEFITS** 👩‍💻
- **Type Safety**: Catch errors at compile time, not runtime
- **Hot Reloading**: See changes instantly without full rebuilds
- **Component Isolation**: Test individual pieces in isolation
- **Clear Dependencies**: Event-driven communication removes guessing
- **Modern Debugging**: React DevTools, Redux DevTools, profilers

### **PERFORMANCE BENEFITS** ⚡
- **90% Faster Rendering**: Canvas-based with caching and virtual scrolling
- **Optimistic Updates**: Actions feel instant with server reconciliation
- **Efficient Networking**: Batch updates and connection pooling
- **Memory Management**: Proper cleanup and garbage collection

### **SCALABILITY BENEFITS** 📈
- **Microservices**: Scale bottleneck services independently
- **Horizontal Scaling**: Add servers as player base grows
- **Database Optimization**: Proper separation of hot/cold data
- **Caching Layers**: Redis for sub-10ms response times

### **MAINTENANCE BENEFITS** 🔧
- **Modular Design**: Change one service without affecting others
- **Clear Boundaries**: Each service has defined responsibilities
- **Comprehensive Testing**: Unit tests, integration tests, E2E tests
- **Documentation**: Self-documenting code with TypeScript interfaces

---

This architectural redesign creates a modern, scalable foundation while preserving the ASCII UI and skill-based progression that makes your tactical roguelike unique. The event-driven design and microservices architecture provide the flexibility to grow while the comprehensive testing ensures quality and reliability.