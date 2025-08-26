# REACT + TYPESCRIPT MIGRATION GUIDE
## Frontend Modernization Strategy While Preserving ASCII Excellence

---

## MIGRATION PHILOSOPHY

### **PRESERVE WHAT WORKS, MODERNIZE THE FOUNDATION** 🎯

**Keep:**
- Exact ASCII character positioning and visual standards
- 40-character Quick Skill Bar layout (PROTECTED)
- Terminal green color scheme and box-drawing characters
- Immediate response feel and 60+ FPS rendering

**Modernize:**
- Component architecture for maintainability and testing
- Type safety throughout to prevent runtime errors
- Development experience with hot reloading and debugging tools
- State management for predictable updates and debugging

### **CURRENT VS NEW ARCHITECTURE**

| **Aspect** | **Current (Vanilla JS)** | **New (React + TypeScript)** |
|------------|------------------------|------------------------------|
| **Components** | 11 global JS files | Modular React components |
| **Type Safety** | Runtime errors | Compile-time error detection |
| **State Management** | Manual coordination | Centralized Zustand stores |
| **Development** | Manual refresh | Hot reloading with HMR |
| **Testing** | Integration only | Unit + Component + E2E |
| **Bundle Size** | ~50KB | ~200KB (with code splitting) |
| **Performance** | Manual optimization | React DevTools profiling |

---

## COMPONENT ARCHITECTURE DESIGN

### **CORE COMPONENT HIERARCHY** 🏗️

```
src/components/
├── App.tsx                     # Root application component
├── layout/                     # Layout and structure
│   ├── GameLayout.tsx         # Main game screen layout
│   ├── ASCIIGrid.tsx          # Responsive ASCII grid system
│   └── ThemeProvider.tsx      # Theme context and switching
├── game/                      # Core game components
│   ├── ASCIIRenderer/         # High-performance ASCII rendering
│   │   ├── ASCIIRenderer.tsx  # Main renderer component
│   │   ├── ASCIICanvas.tsx    # Canvas-based rendering
│   │   ├── ASCIICell.tsx      # Individual cell component
│   │   └── VirtualScroller.tsx # Performance optimization
│   ├── GameMap/               # Interactive game world
│   │   ├── GameMap.tsx        # Map container
│   │   ├── DungeonRenderer.tsx # Dungeon visualization
│   │   ├── PlayerMarkers.tsx  # Player position indicators
│   │   └── InteractiveLayer.tsx # Click/hover handling
│   ├── QuickSkillBar/         # PROTECTED COMPONENT
│   │   ├── QuickSkillBar.tsx  # Main skill bar (40-char width)
│   │   ├── SkillSlot.tsx      # Individual [1-9] slots
│   │   └── SkillTooltip.tsx   # Hover information
│   ├── PlayerStats/           # Character information
│   │   ├── PlayerStats.tsx    # Stats panel container
│   │   ├── HealthBar.tsx      # ASCII progress bars
│   │   ├── ManaBar.tsx        # Mana visualization
│   │   └── APIndicator.tsx    # Action point display
│   └── ActionSelector/        # Ability selection interface
│       ├── ActionSelector.tsx # Action selection UI
│       ├── AbilityTree.tsx    # Skill progression display
│       └── CooldownTimer.tsx  # Ability cooldown display
├── ui/                        # UI components and panels
│   ├── MessageLog/           # Game event logging
│   │   ├── MessageLog.tsx    # Scrollable message display
│   │   ├── MessageItem.tsx   # Individual message
│   │   └── LogFilter.tsx     # Message filtering
│   ├── InitiativeTracker/    # Turn order display
│   │   ├── InitiativeTracker.tsx # Turn order panel
│   │   ├── PlayerTurn.tsx    # Individual turn indicator
│   │   └── TurnTimer.tsx     # Turn countdown
│   ├── ConnectionStatus/     # Network health
│   │   ├── ConnectionStatus.tsx # Connection indicator
│   │   └── ReconnectButton.tsx # Manual reconnection
│   └── Modal/               # Popup dialogs
│       ├── Modal.tsx        # Base modal component
│       ├── SettingsModal.tsx # Game settings
│       └── HelpModal.tsx    # Help and controls
├── shared/                   # Reusable components
│   ├── Button.tsx           # ASCII-styled buttons
│   ├── Input.tsx            # Terminal-style inputs
│   ├── ProgressBar.tsx      # ASCII progress bars
│   └── Tooltip.tsx          # Accessible tooltips
└── hooks/                    # Custom React hooks
    ├── useGameState.ts      # Game state management
    ├── useKeyboardInput.ts  # Hotkey handling
    ├── useWebSocket.ts      # Network communication
    ├── useASCIIAnimation.ts # ASCII animations
    └── useAccessibility.ts  # Screen reader support
```

---

## COMPONENT IMPLEMENTATION EXAMPLES

### **ASCIIRenderer - High Performance Core** ⚡

```typescript
interface ASCIIRendererProps {
  width: number;                    // Grid width in characters
  height: number;                   // Grid height in characters
  cellData: ASCIICell[][];         // 2D array of cell data
  theme: ASCIITheme;               // Color and style theme
  onCellClick?: (x: number, y: number) => void;
  onCellHover?: (x: number, y: number) => void;
  className?: string;
}

const ASCIIRenderer: React.FC<ASCIIRendererProps> = React.memo(({
  width,
  height,
  cellData,
  theme,
  onCellClick,
  onCellHover,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDirty, setIsDirty] = useState(true);
  
  // Performance optimization: only re-render when data actually changes
  const memoizedCellData = useMemo(() => cellData, [
    cellData.map(row => row.map(cell => `${cell.char}${cell.color}${cell.bg}`).join('')).join('|')
  ]);
  
  // Canvas-based rendering for maximum performance
  useEffect(() => {
    if (!canvasRef.current || !isDirty) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    // Setup canvas for ASCII rendering
    ctx.font = `${theme.fontSize}px "${theme.fontFamily}"`;
    ctx.textBaseline = 'top';
    
    // Clear canvas
    ctx.fillStyle = theme.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Render each character
    memoizedCellData.forEach((row, y) => {
      row.forEach((cell, x) => {
        const pixelX = x * theme.characterWidth;
        const pixelY = y * theme.characterHeight;
        
        // Background
        if (cell.backgroundColor && cell.backgroundColor !== theme.backgroundColor) {
          ctx.fillStyle = cell.backgroundColor;
          ctx.fillRect(pixelX, pixelY, theme.characterWidth, theme.characterHeight);
        }
        
        // Character
        ctx.fillStyle = cell.color || theme.primaryColor;
        ctx.fillText(cell.character, pixelX, pixelY);
      });
    });
    
    setIsDirty(false);
  }, [memoizedCellData, theme, isDirty]);
  
  // Handle user interactions
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onCellClick) return;
    
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / theme.characterWidth);
    const y = Math.floor((event.clientY - rect.top) / theme.characterHeight);
    
    if (x >= 0 && x < width && y >= 0 && y < height) {
      onCellClick(x, y);
    }
  }, [onCellClick, width, height, theme]);
  
  const handleCanvasHover = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onCellHover) return;
    
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / theme.characterWidth);
    const y = Math.floor((event.clientY - rect.top) / theme.characterHeight);
    
    if (x >= 0 && x < width && y >= 0 && y < height) {
      onCellHover(x, y);
    }
  }, [onCellHover, width, height, theme]);
  
  return (
    <canvas
      ref={canvasRef}
      width={width * theme.characterWidth}
      height={height * theme.characterHeight}
      className={`ascii-renderer ${className || ''}`}
      onClick={handleCanvasClick}
      onMouseMove={handleCanvasHover}
      style={{
        imageRendering: 'pixelated', // Crisp ASCII characters
        cursor: onCellClick ? 'crosshair' : 'default'
      }}
      aria-label={`ASCII game display, ${width} by ${height} characters`}
    />
  );
});

export default ASCIIRenderer;
```

### **QuickSkillBar - PROTECTED COMPONENT** 🔒

```typescript
interface QuickSkillBarProps {
  skills: (Skill | null)[9];        // Exactly 9 slots, some may be empty
  currentAP: number;                // Available action points
  maxAP: number;                    // Maximum action points
  onSkillActivate: (slot: number) => void;
  disabled?: boolean;               // Disable during opponent's turn
  theme: ASCIITheme;
}

const QuickSkillBar: React.FC<QuickSkillBarProps> = React.memo(({
  skills,
  currentAP,
  maxAP,
  onSkillActivate,
  disabled = false,
  theme
}) => {
  // CRITICAL: Maintain exact 40-character width
  const SKILL_BAR_WIDTH = 40;
  const BORDER_CHARS = 2; // Left and right borders
  const CONTENT_WIDTH = SKILL_BAR_WIDTH - BORDER_CHARS;
  
  // Hotkey handling
  useHotkeys('1,2,3,4,5,6,7,8,9', (event) => {
    if (disabled) return;
    
    const slotIndex = parseInt(event.key) - 1;
    const skill = skills[slotIndex];
    
    if (skill && currentAP >= skill.apCost) {
      event.preventDefault();
      onSkillActivate(slotIndex);
    }
  }, { enabled: !disabled });
  
  // Format skill text to fit exactly in available space
  const formatSkillText = useCallback((slot: number, skill: Skill | null): string => {
    const slotPrefix = `[${slot}] `;
    const availableSpace = CONTENT_WIDTH - slotPrefix.length;
    
    if (!skill) {
      const emptyText = '(Empty)       (0AP)';
      return (slotPrefix + emptyText).padEnd(CONTENT_WIDTH);
    }
    
    const apText = `(${skill.apCost}AP)`;
    const statusText = skill.cooldown > 0 ? `${skill.cooldown}s` : 'Ready';
    const nameSpace = availableSpace - apText.length - statusText.length - 2; // 2 spaces
    
    const truncatedName = skill.name.length > nameSpace 
      ? skill.name.substring(0, nameSpace - 1) + '…'
      : skill.name.padEnd(nameSpace);
    
    const fullText = `${slotPrefix}${truncatedName} ${apText} ${statusText}`;
    return fullText.padEnd(SKILL_BAR_WIDTH);
  }, [CONTENT_WIDTH, SKILL_BAR_WIDTH]);
  
  return (
    <div 
      className="quick-skill-bar"
      role="toolbar"
      aria-label={`Quick skills, ${currentAP} of ${maxAP} action points available`}
      style={{
        width: `${SKILL_BAR_WIDTH}ch`,
        fontFamily: theme.fontFamily,
        fontSize: `${theme.fontSize}px`,
        lineHeight: theme.lineHeight,
        color: theme.primaryColor,
        backgroundColor: theme.backgroundColor,
        whiteSpace: 'pre', // Preserve exact spacing
      }}
    >
      {/* Top border - PROTECTED FORMAT */}
      <div className="skill-bar-header" style={{ color: theme.borderColor }}>
        ┌─Quick Skills─────────────────────────┐
      </div>
      
      {/* Skill slots */}
      {skills.map((skill, index) => {
        const slotNumber = index + 1;
        const isAvailable = skill && currentAP >= skill.apCost && skill.cooldown === 0;
        const isOnCooldown = skill && skill.cooldown > 0;
        
        return (
          <button
            key={slotNumber}
            className={`skill-slot ${isAvailable ? 'available' : 'unavailable'} ${isOnCooldown ? 'cooldown' : ''}`}
            onClick={() => !disabled && isAvailable && onSkillActivate(index)}
            disabled={disabled || !isAvailable}
            accessKey={slotNumber.toString()}
            aria-label={
              skill 
                ? `${skill.name}, costs ${skill.apCost} action points, ${
                    isOnCooldown ? `cooldown ${skill.cooldown} seconds` :
                    isAvailable ? 'ready to use' : 'insufficient action points'
                  }`
                : `Empty skill slot ${slotNumber}`
            }
            style={{
              display: 'block',
              width: '100%',
              border: 'none',
              background: 'transparent',
              color: isAvailable ? theme.accentColor : 
                     isOnCooldown ? theme.warningColor : theme.disabledColor,
              fontFamily: 'inherit',
              fontSize: 'inherit',
              textAlign: 'left',
              cursor: isAvailable && !disabled ? 'pointer' : 'default',
              padding: 0,
            }}
          >
            │{formatSkillText(slotNumber, skill)}│
          </button>
        );
      })}
      
      {/* Bottom border - PROTECTED FORMAT */}
      <div className="skill-bar-footer" style={{ color: theme.borderColor }}>
        └─────────────────────────────────────┘
      </div>
    </div>
  );
});

export default QuickSkillBar;
```

### **GameMap Component with Interactions** 🗺️

```typescript
interface GameMapProps {
  mapData: GameMapData;
  players: PlayerPosition[];
  viewportSize: { width: number; height: number };
  playerViewpoint: Point;
  onMoveCommand: (target: Point) => void;
  onTargetSelect: (target: Point) => void;
  theme: ASCIITheme;
}

const GameMap: React.FC<GameMapProps> = ({
  mapData,
  players,
  viewportSize,
  playerViewpoint,
  onMoveCommand,
  onTargetSelect,
  theme
}) => {
  // Calculate visible cells based on viewport and fog of war
  const visibleCells = useMemo(() => {
    return calculateVisibleCells(
      mapData,
      playerViewpoint,
      viewportSize,
      VISIBILITY_RADIUS
    );
  }, [mapData, playerViewpoint, viewportSize]);
  
  // Convert game data to ASCII cell format
  const asciiCells = useMemo(() => {
    return visibleCells.map(row => 
      row.map(cell => ({
        character: getASCIICharacterForCell(cell),
        color: getCellColor(cell, theme),
        backgroundColor: getCellBackgroundColor(cell, theme),
        interactive: cell.walkable
      }))
    );
  }, [visibleCells, theme]);
  
  // Handle map interactions
  const handleCellClick = useCallback((x: number, y: number) => {
    const worldX = x + playerViewpoint.x - Math.floor(viewportSize.width / 2);
    const worldY = y + playerViewpoint.y - Math.floor(viewportSize.height / 2);
    const targetPoint = { x: worldX, y: worldY };
    
    const cell = mapData.getCell(worldX, worldY);
    
    if (cell?.walkable) {
      onMoveCommand(targetPoint);
    } else if (cell?.entity) {
      onTargetSelect(targetPoint);
    }
  }, [mapData, playerViewpoint, viewportSize, onMoveCommand, onTargetSelect]);
  
  const handleCellHover = useCallback((x: number, y: number) => {
    const worldX = x + playerViewpoint.x - Math.floor(viewportSize.width / 2);
    const worldY = y + playerViewpoint.y - Math.floor(viewportSize.height / 2);
    
    // Show hover information
    const cell = mapData.getCell(worldX, worldY);
    if (cell) {
      // Update hover state or tooltip
      console.log(`Hovering over ${cell.type} at ${worldX},${worldY}`);
    }
  }, [mapData, playerViewpoint, viewportSize]);
  
  return (
    <div className="game-map">
      <div className="map-border" style={{ color: theme.borderColor }}>
        ┌─{mapData.name.padEnd(viewportSize.width - 4, '─')}─┐
      </div>
      
      <ASCIIRenderer
        width={viewportSize.width}
        height={viewportSize.height}
        cellData={asciiCells}
        theme={theme}
        onCellClick={handleCellClick}
        onCellHover={handleCellHover}
        className="game-map-renderer"
      />
      
      <div className="map-border" style={{ color: theme.borderColor }}>
        └─{'─'.repeat(viewportSize.width)}─┘
      </div>
      
      {/* Overlay for additional UI elements */}
      <PlayerMarkers 
        players={players}
        viewportSize={viewportSize}
        playerViewpoint={playerViewpoint}
        theme={theme}
      />
    </div>
  );
};
```

---

## STATE MANAGEMENT WITH ZUSTAND

### **GAME STATE STORE** 🏪

```typescript
// stores/gameStore.ts
interface GameState {
  // Session information
  sessionId: string | null;
  sessionStatus: 'disconnected' | 'connecting' | 'connected' | 'in_game';
  players: Player[];
  currentPlayerId: string | null;
  
  // Game world
  currentMap: GameMapData | null;
  playerPosition: Point;
  visibleCells: VisibilityMap;
  
  // Combat state
  currentAP: number;
  maxAP: number;
  turnOrder: string[];
  currentTurnPlayer: string | null;
  turnTimeRemaining: number;
  
  // UI state
  selectedAction: string | null;
  targetingMode: boolean;
  messageLog: GameMessage[];
  
  // Actions
  setSession: (sessionId: string, players: Player[]) => void;
  updatePlayerPosition: (playerId: string, position: Point) => void;
  updateActionPoints: (playerId: string, ap: number) => void;
  addMessage: (message: GameMessage) => void;
  setCurrentTurn: (playerId: string, timeLimit: number) => void;
  useAction: (actionId: string, target?: Point) => void;
  // ... more actions
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  sessionId: null,
  sessionStatus: 'disconnected',
  players: [],
  currentPlayerId: null,
  currentMap: null,
  playerPosition: { x: 0, y: 0 },
  visibleCells: new Map(),
  currentAP: 3,
  maxAP: 8,
  turnOrder: [],
  currentTurnPlayer: null,
  turnTimeRemaining: 0,
  selectedAction: null,
  targetingMode: false,
  messageLog: [],
  
  // Actions
  setSession: (sessionId, players) => set((state) => ({
    sessionId,
    players,
    sessionStatus: 'connected',
    currentPlayerId: players[0]?.id || null
  })),
  
  updatePlayerPosition: (playerId, position) => set((state) => ({
    players: state.players.map(player =>
      player.id === playerId ? { ...player, position } : player
    ),
    // Update own position if it's us
    playerPosition: playerId === state.currentPlayerId ? position : state.playerPosition
  })),
  
  updateActionPoints: (playerId, ap) => set((state) => ({
    players: state.players.map(player =>
      player.id === playerId ? { ...player, currentAP: ap } : player
    ),
    // Update own AP if it's us
    currentAP: playerId === state.currentPlayerId ? ap : state.currentAP
  })),
  
  addMessage: (message) => set((state) => ({
    messageLog: [...state.messageLog.slice(-49), message] // Keep last 50 messages
  })),
  
  setCurrentTurn: (playerId, timeLimit) => set(() => ({
    currentTurnPlayer: playerId,
    turnTimeRemaining: timeLimit
  })),
  
  useAction: (actionId, target) => {
    const state = get();
    
    // Optimistic update - assume action succeeds
    const action = getActionById(actionId);
    if (action && state.currentPlayerId) {
      const newAP = Math.max(0, state.currentAP - action.apCost);
      
      set((state) => ({
        currentAP: newAP,
        selectedAction: null,
        targetingMode: false,
        messageLog: [...state.messageLog, {
          id: generateId(),
          type: 'action',
          playerId: state.currentPlayerId!,
          message: `Used ${action.name}${target ? ` at ${target.x},${target.y}` : ''}`,
          timestamp: Date.now()
        }]
      }));
      
      // Send action to server for validation
      const networkStore = useNetworkStore.getState();
      networkStore.sendAction({
        type: 'use_action',
        actionId,
        target,
        timestamp: Date.now()
      });
    }
  }
}));
```

### **NETWORK STATE STORE** 🌐

```typescript
// stores/networkStore.ts
interface NetworkState {
  // Connection state
  connected: boolean;
  connecting: boolean;
  reconnectAttempts: number;
  lastPing: number;
  
  // WebSocket instance
  websocket: WebSocket | null;
  
  // Message handling
  pendingMessages: NetworkMessage[];
  messageQueue: NetworkMessage[];
  
  // Actions
  connect: (url: string) => Promise<void>;
  disconnect: () => void;
  sendAction: (action: GameAction) => void;
  sendMessage: (message: NetworkMessage) => void;
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  connected: false,
  connecting: false,
  reconnectAttempts: 0,
  lastPing: 0,
  websocket: null,
  pendingMessages: [],
  messageQueue: [],
  
  connect: async (url: string) => {
    const state = get();
    if (state.connected || state.connecting) return;
    
    set({ connecting: true });
    
    try {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        set({
          connected: true,
          connecting: false,
          reconnectAttempts: 0,
          websocket: ws
        });
        
        // Send any queued messages
        const { messageQueue } = get();
        messageQueue.forEach(message => {
          ws.send(JSON.stringify(message));
        });
        set({ messageQueue: [] });
      };
      
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleIncomingMessage(message);
      };
      
      ws.onclose = () => {
        set({ 
          connected: false, 
          websocket: null 
        });
        
        // Attempt reconnection
        setTimeout(() => {
          const state = get();
          if (state.reconnectAttempts < 5) {
            set({ reconnectAttempts: state.reconnectAttempts + 1 });
            get().connect(url);
          }
        }, Math.min(1000 * Math.pow(2, state.reconnectAttempts), 10000));
      };
      
    } catch (error) {
      set({ 
        connecting: false,
        connected: false 
      });
      throw error;
    }
  },
  
  disconnect: () => {
    const { websocket } = get();
    if (websocket) {
      websocket.close();
    }
    set({ 
      connected: false, 
      connecting: false, 
      websocket: null 
    });
  },
  
  sendAction: (action: GameAction) => {
    const message: NetworkMessage = {
      type: 'game_action',
      data: action,
      timestamp: Date.now(),
      id: generateId()
    };
    
    get().sendMessage(message);
  },
  
  sendMessage: (message: NetworkMessage) => {
    const { websocket, connected, messageQueue } = get();
    
    if (connected && websocket) {
      websocket.send(JSON.stringify(message));
      
      // Track pending message for acknowledgment
      set((state) => ({
        pendingMessages: [...state.pendingMessages, message]
      }));
    } else {
      // Queue message for when connection is restored
      set((state) => ({
        messageQueue: [...state.messageQueue, message]
      }));
    }
  }
}));

// Handle incoming WebSocket messages
function handleIncomingMessage(message: ServerMessage): void {
  const gameStore = useGameStore.getState();
  
  switch (message.type) {
    case 'game_state_update':
      // Update game state with server data
      gameStore.updateGameState(message.data);
      break;
      
    case 'player_moved':
      gameStore.updatePlayerPosition(message.data.playerId, message.data.position);
      break;
      
    case 'turn_changed':
      gameStore.setCurrentTurn(message.data.playerId, message.data.timeLimit);
      break;
      
    case 'action_result':
      // Handle server's response to our action
      handleActionResult(message.data);
      break;
      
    case 'error':
      gameStore.addMessage({
        id: generateId(),
        type: 'error',
        message: message.data.message,
        timestamp: Date.now()
      });
      break;
  }
}
```

---

## CUSTOM HOOKS FOR GAME LOGIC

### **useKeyboardInput - Hotkey Management** ⌨️

```typescript
// hooks/useKeyboardInput.ts
interface UseKeyboardInputOptions {
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export const useKeyboardInput = (options: UseKeyboardInputOptions = {}) => {
  const { enabled = true, preventDefault = true, stopPropagation = false } = options;
  
  const gameStore = useGameStore();
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    if (!enabled) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      setPressedKeys(prev => new Set(prev).add(event.key));
      
      // Handle game-specific hotkeys
      switch (event.key) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          if (gameStore.currentTurnPlayer === gameStore.currentPlayerId) {
            const slotIndex = parseInt(event.key) - 1;
            gameStore.activateSkillSlot(slotIndex);
            if (preventDefault) event.preventDefault();
            if (stopPropagation) event.stopPropagation();
          }
          break;
          
        case 'ArrowUp':
        case 'w':
        case 'W':
          gameStore.queueMovement({ x: 0, y: -1 });
          if (preventDefault) event.preventDefault();
          break;
          
        case 'ArrowDown':
        case 's':
        case 'S':
          gameStore.queueMovement({ x: 0, y: 1 });
          if (preventDefault) event.preventDefault();
          break;
          
        case 'ArrowLeft':
        case 'a':
        case 'A':
          gameStore.queueMovement({ x: -1, y: 0 });
          if (preventDefault) event.preventDefault();
          break;
          
        case 'ArrowRight':
        case 'd':
        case 'D':
          gameStore.queueMovement({ x: 1, y: 0 });
          if (preventDefault) event.preventDefault();
          break;
          
        case 'Escape':
          gameStore.cancelAction();
          if (preventDefault) event.preventDefault();
          break;
          
        case 'Enter':
        case ' ':
          if (gameStore.targetingMode) {
            gameStore.confirmTarget();
            if (preventDefault) event.preventDefault();
          }
          break;
      }
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
      setPressedKeys(prev => {
        const next = new Set(prev);
        next.delete(event.key);
        return next;
      });
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [enabled, preventDefault, stopPropagation, gameStore]);
  
  return {
    pressedKeys,
    isKeyPressed: (key: string) => pressedKeys.has(key),
    isAnyKeyPressed: (...keys: string[]) => keys.some(key => pressedKeys.has(key))
  };
};
```

### **useWebSocket - Network Communication** 📡

```typescript
// hooks/useWebSocket.ts
interface UseWebSocketOptions {
  url: string;
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: ServerMessage) => void;
  onError?: (error: Event) => void;
}

export const useWebSocket = ({
  url,
  autoConnect = true,
  onConnect,
  onDisconnect,
  onMessage,
  onError
}: UseWebSocketOptions) => {
  const networkStore = useNetworkStore();
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  const connect = useCallback(async () => {
    try {
      await networkStore.connect(url);
      setConnectionState('connected');
      onConnect?.();
    } catch (error) {
      setConnectionState('disconnected');
      console.error('WebSocket connection failed:', error);
    }
  }, [url, networkStore, onConnect]);
  
  const disconnect = useCallback(() => {
    networkStore.disconnect();
    setConnectionState('disconnected');
    onDisconnect?.();
  }, [networkStore, onDisconnect]);
  
  const sendMessage = useCallback((message: NetworkMessage) => {
    networkStore.sendMessage(message);
  }, [networkStore]);
  
  const sendAction = useCallback((action: GameAction) => {
    networkStore.sendAction(action);
  }, [networkStore]);
  
  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && connectionState === 'disconnected') {
      connect();
    }
    
    // Cleanup on unmount
    return () => {
      if (connectionState === 'connected') {
        disconnect();
      }
    };
  }, [autoConnect, connect, disconnect, connectionState]);
  
  // Subscribe to connection state changes
  useEffect(() => {
    const unsubscribe = networkStore.subscribe(
      (state) => state.connected,
      (connected) => {
        setConnectionState(connected ? 'connected' : 'disconnected');
        
        if (connected) {
          onConnect?.();
        } else {
          onDisconnect?.();
        }
      }
    );
    
    return unsubscribe;
  }, [networkStore, onConnect, onDisconnect]);
  
  return {
    connectionState,
    connect,
    disconnect,
    sendMessage,
    sendAction,
    isConnected: connectionState === 'connected',
    isConnecting: connectionState === 'connecting'
  };
};
```

---

## BUILD CONFIGURATION & TOOLING

### **VITE CONFIGURATION FOR DEVELOPMENT** ⚡

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Include .tsx files
      include: "**/*.{jsx,tsx}",
    })
  ],
  
  // Development server configuration
  server: {
    port: 3000,
    host: true, // Listen on all addresses
    
    // Proxy WebSocket connections to game server
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true,
      },
    },
    
    // Enable CORS for development
    cors: true,
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@types': resolve(__dirname, 'src/types'),
      '@utils': resolve(__dirname, 'src/utils'),
    },
  },
  
  // Build optimization
  build: {
    // Output directory
    outDir: 'dist',
    
    // Enable source maps for debugging
    sourcemap: true,
    
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React and related libraries
          vendor: ['react', 'react-dom'],
          
          // Game logic chunk
          game: [
            './src/stores/gameStore.ts',
            './src/stores/networkStore.ts',
            './src/components/game/ASCIIRenderer/ASCIIRenderer.tsx',
          ],
          
          // UI components chunk
          ui: [
            './src/components/ui/MessageLog/MessageLog.tsx',
            './src/components/ui/Modal/Modal.tsx',
          ]
        },
      },
    },
    
    // Bundle size limits
    chunkSizeWarningLimit: 1000, // 1MB warning
  },
  
  // Environment variables
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production'),
  },
  
  // CSS configuration
  css: {
    modules: {
      // CSS Modules configuration for component styles
      localsConvention: 'camelCaseOnly',
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },
  
  // Optimization for ASCII rendering
  esbuild: {
    // Keep ASCII characters intact during minification
    charset: 'utf8',
  },
});
```

### **TYPESCRIPT CONFIGURATION** 📝

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    
    // Path mapping to match Vite aliases
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@hooks/*": ["src/hooks/*"],
      "@stores/*": ["src/stores/*"],
      "@types/*": ["src/types/*"],
      "@utils/*": ["src/utils/*"]
    }
  },
  "include": [
    "src/**/*",
    "src/**/*.tsx",
    "tests/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build"
  ]
}
```

### **PACKAGE.JSON SCRIPTS** 📦

```json
{
  "name": "tactical-ascii-roguelike-frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "storybook": "start-storybook -p 6006",
    "build-storybook": "build-storybook"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.7",
    "react-hotkeys-hook": "^4.4.1",
    "immer": "^10.0.3"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "typescript": "^5.2.2",
    "vite": "^5.0.8",
    "vitest": "^1.0.4",
    "@vitest/ui": "^1.0.4",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "jsdom": "^23.0.1"
  }
}
```

---

This React + TypeScript migration strategy provides a modern foundation while preserving the exact ASCII aesthetics and gameplay feel that players love. The component architecture enables better testing, maintenance, and feature development while the performance optimizations ensure smooth 60+ FPS rendering even with complex multiplayer interactions.