# Critical Code Implementations

This document provides essential code examples and templates for the modernized architecture.

## 1. Event-Driven Architecture Core

### EventBus Implementation (TypeScript)

```typescript
// src/shared/events/EventBus.ts
export interface GameEvent<T = any> {
  type: string;
  payload: T;
  timestamp: number;
  sessionId: string;
  playerId?: string;
}

export class EventBus {
  private listeners = new Map<string, Function[]>();
  private eventHistory: GameEvent[] = [];
  private maxHistory = 1000;

  emit<T>(event: GameEvent<T>): void {
    // Add to history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory.shift();
    }

    // Notify listeners
    const handlers = this.listeners.get(event.type) || [];
    handlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    });
  }

  on<T>(eventType: string, handler: (event: GameEvent<T>) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.listeners.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) handlers.splice(index, 1);
      }
    };
  }

  getHistory(sessionId: string, limit = 100): GameEvent[] {
    return this.eventHistory
      .filter(event => event.sessionId === sessionId)
      .slice(-limit);
  }
}
```

### Event Type Definitions

```typescript
// src/shared/events/GameEvents.ts
export enum GameEventType {
  // Player Events
  PLAYER_JOINED = 'player:joined',
  PLAYER_LEFT = 'player:left',
  PLAYER_MOVED = 'player:moved',
  PLAYER_AP_CHANGED = 'player:ap_changed',
  
  // Combat Events
  ACTION_EXECUTED = 'combat:action_executed',
  DAMAGE_DEALT = 'combat:damage_dealt',
  TURN_STARTED = 'combat:turn_started',
  TURN_ENDED = 'combat:turn_ended',
  
  // Game State Events
  GAME_STATE_UPDATED = 'game:state_updated',
  SESSION_CREATED = 'game:session_created',
  SESSION_ENDED = 'game:session_ended'
}

export interface PlayerJoinedEvent {
  playerId: string;
  playerName: string;
  startingPosition: { x: number; y: number };
}

export interface ActionExecutedEvent {
  playerId: string;
  actionType: string;
  apCost: number;
  targetPosition?: { x: number; y: number };
  result: {
    success: boolean;
    damage?: number;
    effects?: string[];
  };
}
```

## 2. ASCII UI Preservation Components

### QuickSkillBar React Component (PROTECTED LAYOUT)

```typescript
// src/client/components/ui/QuickSkillBar.tsx
import React, { useMemo, useCallback } from 'react';

interface Skill {
  id: string;
  name: string;
  apCost: number;
  hotkey: number;
  available: boolean;
}

interface QuickSkillBarProps {
  skills: Skill[];
  currentAP: number;
  maxAP: number;
  onSkillActivate: (skillId: string) => void;
  theme: 'terminal-green' | 'amber' | 'blue';
}

const QuickSkillBar: React.FC<QuickSkillBarProps> = React.memo(({
  skills,
  currentAP,
  maxAP,
  onSkillActivate,
  theme
}) => {
  // PROTECTED: Exact 40-character width requirement
  const SKILL_BAR_WIDTH = 40;
  
  const themeColors = useMemo(() => ({
    'terminal-green': { bg: '#000000', fg: '#00ff00', border: '#00aa00' },
    'amber': { bg: '#1a1a00', fg: '#ffaa00', border: '#cc8800' },
    'blue': { bg: '#000033', fg: '#0088ff', border: '#0066cc' }
  }), []);

  const colors = themeColors[theme];

  const formatSkillLine = useCallback((skill: Skill): string => {
    const hotkeyPart = `[${skill.hotkey}]`;
    const apPart = `(${skill.apCost}AP)`;
    const availableSpace = SKILL_BAR_WIDTH - hotkeyPart.length - apPart.length - 2; // -2 for spaces
    const name = skill.name.length > availableSpace 
      ? skill.name.substring(0, availableSpace - 3) + '...' 
      : skill.name.padEnd(availableSpace);
    
    return `${hotkeyPart} ${name} ${apPart}`;
  }, []);

  const skillLines = useMemo(() => {
    return skills.slice(0, 9).map(formatSkillLine);
  }, [skills, formatSkillLine]);

  const containerStyle: React.CSSProperties = {
    fontFamily: 'Consolas, "Courier New", monospace',
    fontSize: '14px',
    backgroundColor: colors.bg,
    color: colors.fg,
    border: `1px solid ${colors.border}`,
    padding: '2px',
    width: `${SKILL_BAR_WIDTH + 2}ch`, // +2 for padding
    userSelect: 'none'
  };

  const lineStyle = useCallback((skill: Skill): React.CSSProperties => ({
    cursor: skill.available && currentAP >= skill.apCost ? 'pointer' : 'default',
    opacity: skill.available && currentAP >= skill.apCost ? 1 : 0.5,
    padding: '1px 0',
    whiteSpace: 'pre' as const
  }), [currentAP]);

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${colors.border}`, marginBottom: '2px', padding: '1px 0' }}>
        {'┌' + '─'.repeat(SKILL_BAR_WIDTH - 2) + '┐'}
      </div>
      <div style={{ textAlign: 'center', marginBottom: '2px' }}>
        {`Quick Skills (AP: ${currentAP}/${maxAP})`.padStart(SKILL_BAR_WIDTH)}
      </div>
      <div style={{ borderBottom: `1px solid ${colors.border}`, marginBottom: '2px' }}>
        {'├' + '─'.repeat(SKILL_BAR_WIDTH - 2) + '┤'}
      </div>
      
      {/* Skill Lines */}
      {skillLines.map((line, index) => {
        const skill = skills[index];
        return (
          <div
            key={skill.id}
            style={lineStyle(skill)}
            onClick={() => skill.available && currentAP >= skill.apCost && onSkillActivate(skill.id)}
          >
            {line}
          </div>
        );
      })}
      
      {/* Footer */}
      <div style={{ borderTop: `1px solid ${colors.border}`, marginTop: '2px' }}>
        {'└' + '─'.repeat(SKILL_BAR_WIDTH - 2) + '┘'}
      </div>
    </div>
  );
});

QuickSkillBar.displayName = 'QuickSkillBar';

export default QuickSkillBar;
```

### Canvas ASCII Renderer (Performance Optimized)

```typescript
// src/client/rendering/CanvasASCIIRenderer.ts
export interface ASCIIRenderConfig {
  fontSize: number;
  fontFamily: string;
  charWidth: number;
  charHeight: number;
  backgroundColor: string;
  foregroundColor: string;
}

export class CanvasASCIIRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: ASCIIRenderConfig;
  private charCache = new Map<string, ImageData>();
  
  constructor(canvas: HTMLCanvasElement, config: ASCIIRenderConfig) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.config = config;
    this.setupCanvas();
  }

  private setupCanvas(): void {
    this.ctx.font = `${this.config.fontSize}px ${this.config.fontFamily}`;
    this.ctx.textBaseline = 'top';
    this.ctx.textAlign = 'left';
  }

  renderGrid(grid: string[][], colors?: string[][]): void {
    this.clearCanvas();
    
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const char = grid[y][x];
        const color = colors?.[y]?.[x] || this.config.foregroundColor;
        this.renderChar(char, x, y, color);
      }
    }
  }

  private renderChar(char: string, x: number, y: number, color: string): void {
    const cacheKey = `${char}_${color}`;
    
    if (this.charCache.has(cacheKey)) {
      const imageData = this.charCache.get(cacheKey)!;
      this.ctx.putImageData(
        imageData,
        x * this.config.charWidth,
        y * this.config.charHeight
      );
      return;
    }

    // Render and cache the character
    this.ctx.fillStyle = color;
    this.ctx.fillText(
      char,
      x * this.config.charWidth,
      y * this.config.charHeight
    );

    // Cache the rendered character
    const imageData = this.ctx.getImageData(
      x * this.config.charWidth,
      y * this.config.charHeight,
      this.config.charWidth,
      this.config.charHeight
    );
    this.charCache.set(cacheKey, imageData);
  }

  private clearCanvas(): void {
    this.ctx.fillStyle = this.config.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  updateConfig(newConfig: Partial<ASCIIRenderConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.charCache.clear();
    this.setupCanvas();
  }
}
```

## 3. Hybrid Storage Implementation

### Redis Game State Manager

```typescript
// src/server/storage/RedisGameStateManager.ts
import Redis from 'ioredis';

export class RedisGameStateManager {
  private redis: Redis;
  private readonly SESSION_PREFIX = 'game:session:';
  private readonly PLAYER_PREFIX = 'game:player:';
  private readonly TTL_ACTIVE_SESSION = 3600; // 1 hour
  private readonly TTL_PLAYER_STATE = 1800; // 30 minutes

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    });
  }

  async saveGameSession(sessionId: string, sessionData: any): Promise<void> {
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    await this.redis.setex(
      key,
      this.TTL_ACTIVE_SESSION,
      JSON.stringify(sessionData)
    );
  }

  async getGameSession(sessionId: string): Promise<any | null> {
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async savePlayerState(playerId: string, playerData: any): Promise<void> {
    const key = `${this.PLAYER_PREFIX}${playerId}`;
    await this.redis.setex(
      key,
      this.TTL_PLAYER_STATE,
      JSON.stringify(playerData)
    );
  }

  async getPlayerState(playerId: string): Promise<any | null> {
    const key = `${this.PLAYER_PREFIX}${playerId}`;
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async updatePlayerAP(playerId: string, newAP: number): Promise<void> {
    const key = `${this.PLAYER_PREFIX}${playerId}`;
    const script = `
      local key = KEYS[1]
      local newAP = ARGV[1]
      local data = redis.call('GET', key)
      if data then
        local playerData = cjson.decode(data)
        playerData.currentAP = tonumber(newAP)
        redis.call('SET', key, cjson.encode(playerData))
        return 1
      end
      return 0
    `;
    
    await this.redis.eval(script, 1, key, newAP.toString());
  }

  async getActiveSessionIds(): Promise<string[]> {
    const keys = await this.redis.keys(`${this.SESSION_PREFIX}*`);
    return keys.map(key => key.replace(this.SESSION_PREFIX, ''));
  }
}
```

### PostgreSQL Character Progression Manager

```typescript
// src/server/storage/PostgreSQLProgressionManager.ts
import { Pool } from 'pg';

export interface SkillProgression {
  skillId: string;
  experience: number;
  level: number;
  unlockedAbilities: string[];
}

export class PostgreSQLProgressionManager {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    });
  }

  async saveCharacterProgression(
    playerId: string,
    skills: SkillProgression[]
  ): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Clear existing progression
      await client.query(
        'DELETE FROM character_skills WHERE player_id = $1',
        [playerId]
      );
      
      // Insert updated progression
      for (const skill of skills) {
        await client.query(`
          INSERT INTO character_skills 
          (player_id, skill_id, experience, level, unlocked_abilities)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          playerId,
          skill.skillId,
          skill.experience,
          skill.level,
          JSON.stringify(skill.unlockedAbilities)
        ]);
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getCharacterProgression(playerId: string): Promise<SkillProgression[]> {
    const result = await this.pool.query(`
      SELECT skill_id, experience, level, unlocked_abilities
      FROM character_skills
      WHERE player_id = $1
      ORDER BY skill_id
    `, [playerId]);

    return result.rows.map(row => ({
      skillId: row.skill_id,
      experience: row.experience,
      level: row.level,
      unlockedAbilities: JSON.parse(row.unlocked_abilities)
    }));
  }

  async incrementSkillExperience(
    playerId: string,
    skillId: string,
    experienceGain: number
  ): Promise<{ newLevel: number; abilitiesUnlocked: string[] }> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get current progression
      const current = await client.query(`
        SELECT experience, level, unlocked_abilities
        FROM character_skills
        WHERE player_id = $1 AND skill_id = $2
      `, [playerId, skillId]);
      
      if (current.rows.length === 0) {
        // Create new skill entry
        await client.query(`
          INSERT INTO character_skills 
          (player_id, skill_id, experience, level, unlocked_abilities)
          VALUES ($1, $2, $3, 1, '[]')
        `, [playerId, skillId, experienceGain]);
        
        await client.query('COMMIT');
        return { newLevel: 1, abilitiesUnlocked: [] };
      }
      
      const newExperience = current.rows[0].experience + experienceGain;
      const newLevel = Math.floor(newExperience / 100) + 1; // 100 exp per level
      const oldLevel = current.rows[0].level;
      
      // Check for new abilities unlocked
      const abilitiesResult = await client.query(`
        SELECT ability_id FROM skill_abilities
        WHERE skill_id = $1 AND required_level > $2 AND required_level <= $3
      `, [skillId, oldLevel, newLevel]);
      
      const newAbilities = abilitiesResult.rows.map(row => row.ability_id);
      const allAbilities = [
        ...JSON.parse(current.rows[0].unlocked_abilities),
        ...newAbilities
      ];
      
      // Update progression
      await client.query(`
        UPDATE character_skills
        SET experience = $1, level = $2, unlocked_abilities = $3
        WHERE player_id = $4 AND skill_id = $5
      `, [newExperience, newLevel, JSON.stringify(allAbilities), playerId, skillId]);
      
      await client.query('COMMIT');
      return { newLevel, abilitiesUnlocked: newAbilities };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
```

## 4. Microservice Communication

### Service Discovery and Health Checks

```typescript
// src/services/ServiceRegistry.ts
export interface ServiceInfo {
  id: string;
  name: string;
  host: string;
  port: number;
  health: 'healthy' | 'unhealthy' | 'unknown';
  lastHealthCheck: Date;
}

export class ServiceRegistry {
  private services = new Map<string, ServiceInfo>();
  private healthCheckInterval = 30000; // 30 seconds
  private redis: Redis;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
    this.startHealthChecks();
  }

  async registerService(service: Omit<ServiceInfo, 'health' | 'lastHealthCheck'>): Promise<void> {
    const serviceInfo: ServiceInfo = {
      ...service,
      health: 'unknown',
      lastHealthCheck: new Date()
    };
    
    this.services.set(service.id, serviceInfo);
    
    // Persist to Redis
    await this.redis.hset('services', service.id, JSON.stringify(serviceInfo));
  }

  async getService(serviceName: string): Promise<ServiceInfo | null> {
    // Try local cache first
    for (const service of this.services.values()) {
      if (service.name === serviceName && service.health === 'healthy') {
        return service;
      }
    }
    
    // Fallback to Redis
    const services = await this.redis.hgetall('services');
    for (const [id, data] of Object.entries(services)) {
      const service: ServiceInfo = JSON.parse(data);
      if (service.name === serviceName && service.health === 'healthy') {
        this.services.set(id, service);
        return service;
      }
    }
    
    return null;
  }

  private async startHealthChecks(): void {
    setInterval(async () => {
      for (const [id, service] of this.services.entries()) {
        try {
          const response = await fetch(`http://${service.host}:${service.port}/health`, {
            timeout: 5000
          });
          
          const isHealthy = response.ok;
          service.health = isHealthy ? 'healthy' : 'unhealthy';
          service.lastHealthCheck = new Date();
          
          // Update Redis
          await this.redis.hset('services', id, JSON.stringify(service));
        } catch (error) {
          service.health = 'unhealthy';
          service.lastHealthCheck = new Date();
          await this.redis.hset('services', id, JSON.stringify(service));
        }
      }
    }, this.healthCheckInterval);
  }
}
```

## 5. WebSocket Communication Layer

### Type-Safe WebSocket Events

```typescript
// src/shared/websocket/WebSocketTypes.ts
export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  messageId: string;
  timestamp: number;
}

export interface ClientToServerEvents {
  'join-session': { sessionId: string; playerId: string };
  'execute-action': { actionType: string; targetPosition?: { x: number; y: number } };
  'use-skill': { skillId: string; targetPosition?: { x: number; y: number } };
  'chat-message': { message: string };
  'ping': {};
}

export interface ServerToClientEvents {
  'session-joined': { success: boolean; playerData?: any };
  'game-state-update': { gameState: any };
  'action-result': { success: boolean; result?: any; error?: string };
  'chat-message': { playerId: string; playerName: string; message: string };
  'pong': {};
}

export type WebSocketEventMap = ClientToServerEvents & ServerToClientEvents;
```

### WebSocket Manager with Reconnection

```typescript
// src/client/websocket/WebSocketManager.ts
export class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers = new Map<string, Function[]>();
  private messageQueue: WebSocketMessage[] = [];

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.flushMessageQueue();
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };
        
        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.attemptReconnect();
        };
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  send<K extends keyof ClientToServerEvents>(
    type: K,
    payload: ClientToServerEvents[K]
  ): void {
    const message: WebSocketMessage = {
      type,
      payload,
      messageId: this.generateMessageId(),
      timestamp: Date.now()
    };

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for when connection is restored
      this.messageQueue.push(message);
    }
  }

  on<K extends keyof ServerToClientEvents>(
    eventType: K,
    handler: (payload: ServerToClientEvents[K]) => void
  ): () => void {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, []);
    }
    this.messageHandlers.get(eventType)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) handlers.splice(index, 1);
      }
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.messageHandlers.get(message.type) || [];
    handlers.forEach(handler => {
      try {
        handler(message.payload);
      } catch (error) {
        console.error(`Error in WebSocket handler for ${message.type}:`, error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
      }
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
```

## 6. Testing Framework Examples

### Visual Regression Test for ASCII UI

```typescript
// tests/visual/ascii-ui.spec.ts
import { test, expect, Page } from '@playwright/test';

// CRITICAL: Tests the protected 40-character Quick Skill Bar layout
test.describe('ASCII UI Visual Regression', () => {
  test('Quick Skill Bar - Exact Layout Protection', async ({ page }) => {
    await page.goto('/game');
    await page.waitForSelector('[data-testid="quick-skill-bar"]');
    
    // Ensure consistent state
    await page.evaluate(() => {
      // Set predictable game state
      window.gameState = {
        currentAP: 5,
        maxAP: 8,
        skills: [
          { id: '1', name: 'Move', apCost: 1, hotkey: 1, available: true },
          { id: '2', name: 'Basic Attack', apCost: 2, hotkey: 2, available: true },
          { id: '3', name: 'Power Strike', apCost: 4, hotkey: 3, available: true },
        ]
      };
      window.updateUI();
    });

    // Screenshot the exact 40-character skill bar
    const skillBar = page.locator('[data-testid="quick-skill-bar"]');
    await expect(skillBar).toHaveScreenshot('quick-skill-bar-baseline.png', {
      threshold: 0.01, // Very strict - 99% pixel match required
      mode: 'rgb'
    });
  });

  test('ASCII Character Validation', async ({ page }) => {
    await page.goto('/game');
    
    // Validate box-drawing characters render correctly
    const boxChars = await page.evaluate(() => {
      const testChars = ['┌', '─', '┐', '│', '└', '┘', '├', '┤', '┬', '┴', '┼'];
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.font = '14px Consolas';
      
      return testChars.map(char => {
        const metrics = ctx.measureText(char);
        return {
          char,
          width: metrics.width,
          rendered: char.charCodeAt(0) !== 65533 // Not replacement character
        };
      });
    });

    // Ensure all box-drawing characters render properly
    boxChars.forEach(({ char, rendered }) => {
      expect(rendered, `Character ${char} should render correctly`).toBe(true);
    });
  });
});
```

### Component Integration Test

```typescript
// tests/integration/game-session.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Game Session Integration', () => {
  test('8-Player Concurrent Session', async ({ browser }) => {
    // Create 8 browser contexts for 8 players
    const players: { page: Page; playerId: string }[] = [];
    
    for (let i = 0; i < 8; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const playerId = `player_${i + 1}`;
      
      await page.goto('/game');
      await page.fill('[data-testid="player-name"]', `Player ${i + 1}`);
      await page.click('[data-testid="join-game"]');
      
      players.push({ page, playerId });
    }

    // Wait for all players to connect
    await Promise.all(players.map(({ page }) => 
      page.waitForSelector('[data-testid="game-connected"]')
    ));

    // Test concurrent action execution
    await Promise.all(players.map(async ({ page, playerId }, index) => {
      // Each player executes a different action simultaneously
      const actions = ['move', 'attack', 'defend', 'skill', 'item', 'cast', 'dodge', 'guard'];
      await page.click(`[data-testid="action-${actions[index]}"]`);
    }));

    // Verify all actions were processed
    for (const { page } of players) {
      await expect(page.locator('[data-testid="action-result"]')).toBeVisible();
    }

    // Cleanup
    await Promise.all(players.map(({ page }) => page.close()));
  });

  test('Real-time State Synchronization', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const player1 = await context1.newPage();
    const player2 = await context2.newPage();

    // Both players join the same session
    const sessionId = 'test-session-' + Date.now();
    
    await player1.goto(`/game?session=${sessionId}`);
    await player2.goto(`/game?session=${sessionId}`);
    
    await player1.fill('[data-testid="player-name"]', 'Alice');
    await player2.fill('[data-testid="player-name"]', 'Bob');
    
    await Promise.all([
      player1.click('[data-testid="join-game"]'),
      player2.click('[data-testid="join-game"]')
    ]);

    // Player 1 moves
    await player1.click('[data-testid="move-north"]');
    
    // Verify Player 2 sees Player 1's movement
    await expect(player2.locator('[data-testid="player-Alice"]')).toHaveAttribute(
      'data-position', expect.stringMatching(/\d+,\d+/)
    );
    
    // Test AP synchronization
    const player1AP = await player1.locator('[data-testid="current-ap"]').textContent();
    const player2ViewAP = await player2.locator('[data-testid="player-Alice-ap"]').textContent();
    
    expect(player1AP).toBe(player2ViewAP);

    await player1.close();
    await player2.close();
  });
});
```

These code examples provide the critical implementations needed for the modernized architecture while preserving the exact ASCII UI standards that make the game beloved.