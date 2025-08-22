import { Player, Position, GameSession, RoomId, PlayerId } from '../../shared/types';
import { GAME_CONFIG } from '../../shared/constants';

/**
 * Test helper utilities for creating mock data and common test operations
 */

/**
 * Creates a mock player with customizable properties
 */
export function createMockPlayer(
  id: PlayerId,
  overrides: Partial<Player> = {}
): Player {
  const defaultPlayer: Player = {
    id,
    name: `Player ${id}`,
    position: { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) },
    health: 100,
    maxHealth: 100,
    currentAP: 2,
    skills: {
      combat: 30,
      swords: 25,
      fire_magic: 20,
      healing_magic: 15,
      arcane_magic: 10,
      archery: 20,
      stealth: 15,
      athletics: 25,
      survival: 20,
      leadership: 18
    },
    equipment: {
      weapon: {
        name: 'Basic Sword',
        damage: '1d6+1',
        initiative: 1
      },
      armor: {
        name: 'Leather Armor',
        defense: 2
      }
    },
    status: 'ready'
  };

  return { ...defaultPlayer, ...overrides };
}

/**
 * Creates multiple mock players for testing scenarios
 */
export function createMockPlayers(count: number, baseOverrides: Partial<Player> = {}): Player[] {
  const players: Player[] = [];
  const positions: Position[] = [
    { x: 5, y: 5 }, { x: 6, y: 6 }, { x: 7, y: 7 }, { x: 8, y: 8 },
    { x: 9, y: 9 }, { x: 10, y: 10 }, { x: 11, y: 11 }, { x: 12, y: 12 }
  ];

  for (let i = 0; i < count; i++) {
    const playerId = `player${i + 1}`;
    const position = positions[i] || { x: i + 1, y: i + 1 };
    
    players.push(createMockPlayer(playerId, {
      position,
      ...baseOverrides
    }));
  }

  return players;
}

/**
 * Creates a player with specific skill configuration for testing
 */
export function createSkillPlayer(
  id: PlayerId,
  skillType: 'fighter' | 'mage' | 'rogue' | 'cleric' | 'master',
  position?: Position
): Player {
  const skillConfigs = {
    fighter: {
      combat: 70,
      swords: 80,
      fire_magic: 10,
      healing_magic: 10,
      arcane_magic: 5,
      archery: 30,
      stealth: 20,
      athletics: 60,
      survival: 40,
      leadership: 50
    },
    mage: {
      combat: 20,
      swords: 15,
      fire_magic: 85,
      healing_magic: 40,
      arcane_magic: 90,
      archery: 15,
      stealth: 25,
      athletics: 20,
      survival: 30,
      leadership: 35
    },
    rogue: {
      combat: 50,
      swords: 40,
      fire_magic: 5,
      healing_magic: 5,
      arcane_magic: 10,
      archery: 70,
      stealth: 85,
      athletics: 75,
      survival: 60,
      leadership: 25
    },
    cleric: {
      combat: 40,
      swords: 30,
      fire_magic: 25,
      healing_magic: 90,
      arcane_magic: 60,
      archery: 20,
      stealth: 15,
      athletics: 35,
      survival: 45,
      leadership: 70
    },
    master: {
      combat: 95,
      swords: 95,
      fire_magic: 95,
      healing_magic: 95,
      arcane_magic: 95,
      archery: 95,
      stealth: 95,
      athletics: 95,
      survival: 95,
      leadership: 95
    }
  };

  const equipment = {
    fighter: {
      weapon: { name: 'Great Sword', damage: '2d6+3', initiative: 2 },
      armor: { name: 'Plate Mail', defense: 6 }
    },
    mage: {
      weapon: { name: 'Arcane Staff', damage: '1d6+1', initiative: 1 },
      armor: { name: 'Robes', defense: 1 }
    },
    rogue: {
      weapon: { name: 'Twin Daggers', damage: '1d4+3', initiative: 4 },
      armor: { name: 'Studded Leather', defense: 3 }
    },
    cleric: {
      weapon: { name: 'Holy Mace', damage: '1d8+2', initiative: 2 },
      armor: { name: 'Chain Mail', defense: 4 }
    },
    master: {
      weapon: { name: 'Legendary Blade', damage: '3d6+5', initiative: 5 },
      armor: { name: 'Enchanted Plate', defense: 8 }
    }
  };

  return createMockPlayer(id, {
    name: `${skillType.charAt(0).toUpperCase() + skillType.slice(1)} ${id}`,
    position: position || { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) },
    skills: skillConfigs[skillType],
    equipment: equipment[skillType]
  });
}

/**
 * Creates an 8-player balanced party for testing
 */
export function createBalancedParty(): Player[] {
  return [
    createSkillPlayer('tank1', 'fighter', { x: 2, y: 2 }),
    createSkillPlayer('tank2', 'fighter', { x: 3, y: 3 }),
    createSkillPlayer('mage1', 'mage', { x: 8, y: 8 }),
    createSkillPlayer('mage2', 'mage', { x: 9, y: 9 }),
    createSkillPlayer('rogue1', 'rogue', { x: 5, y: 1 }),
    createSkillPlayer('rogue2', 'rogue', { x: 6, y: 1 }),
    createSkillPlayer('cleric1', 'cleric', { x: 10, y: 5 }),
    createSkillPlayer('cleric2', 'cleric', { x: 11, y: 5 })
  ];
}

/**
 * Mock WebSocket implementation for testing
 */
export class MockWebSocket {
  public readyState: number = 1; // OPEN
  public onopen: ((event: Event) => void) | null = null;
  public onclose: ((event: any) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;

  private messageQueue: string[] = [];
  private isClosed = false;

  constructor(public url: string) {}

  send(data: string): void {
    if (this.isClosed) {
      throw new Error('WebSocket is closed');
    }
    this.messageQueue.push(data);
  }

  close(): void {
    this.isClosed = true;
    this.readyState = 3; // CLOSED
    if (this.onclose) {
      this.onclose({ type: 'close' });
    }
  }

  // Test helpers
  triggerOpen(): void {
    if (this.onopen) {
      this.onopen(new Event('open'));
    }
  }

  triggerMessage(data: string): void {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data }));
    }
  }

  triggerError(): void {
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }

  getSentMessages(): string[] {
    return [...this.messageQueue];
  }

  clearMessages(): void {
    this.messageQueue = [];
  }
}

/**
 * Creates a mock game session for testing
 */
export function createMockGameSession(
  roomId: RoomId = 'test-room',
  playerCount: number = 4
): GameSession {
  const players = createMockPlayers(playerCount);
  const playerMap = new Map<PlayerId, Player>();
  players.forEach(player => playerMap.set(player.id, player));

  return {
    roomId,
    players: playerMap,
    turnManager: {
      currentTurnIndex: 0,
      turnOrder: [],
      turnStartTime: Date.now(),
      turnTimeLimit: 10000,
      phase: 'initiative'
    },
    apManager: {
      playerAP: new Map(players.map(p => [p.id, 2])),
      maxAP: 8,
      apPerTurn: 2,
      lastAPUpdate: Date.now()
    },
    startTime: Date.now(),
    status: 'waiting'
  };
}

/**
 * Performance test utilities
 */
export class PerformanceTimer {
  private startTime: number = 0;
  private measurements: number[] = [];

  start(): void {
    this.startTime = performance.now();
  }

  end(): number {
    const duration = performance.now() - this.startTime;
    this.measurements.push(duration);
    return duration;
  }

  getAverage(): number {
    if (this.measurements.length === 0) return 0;
    return this.measurements.reduce((sum, val) => sum + val, 0) / this.measurements.length;
  }

  getMax(): number {
    return Math.max(...this.measurements);
  }

  getMin(): number {
    return Math.min(...this.measurements);
  }

  clear(): void {
    this.measurements = [];
  }

  getMeasurements(): number[] {
    return [...this.measurements];
  }
}

/**
 * Async test utilities
 */
export function waitForCondition(
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      if (condition()) {
        resolve();
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        reject(new Error(`Condition not met within ${timeout}ms`));
        return;
      }
      
      setTimeout(check, interval);
    };
    
    check();
  });
}

/**
 * Creates a delay for testing timing-dependent functionality
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Memory usage tracking for performance tests
 */
export function getMemoryUsage(): NodeJS.MemoryUsage {
  return process.memoryUsage();
}

/**
 * Validates game state consistency
 */
export function validateGameState(session: GameSession): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate player count
  if (session.players.size > GAME_CONFIG.MAX_PLAYERS_PER_LOBBY) {
    errors.push(`Too many players: ${session.players.size} > ${GAME_CONFIG.MAX_PLAYERS_PER_LOBBY}`);
  }

  // Validate player health
  session.players.forEach((player: Player, id: PlayerId) => {
    if (player.health < 0) {
      errors.push(`Player ${id} has negative health: ${player.health}`);
    }
    if (player.health > player.maxHealth) {
      errors.push(`Player ${id} health exceeds maximum: ${player.health} > ${player.maxHealth}`);
    }
    if (player.currentAP < 0) {
      errors.push(`Player ${id} has negative AP: ${player.currentAP}`);
    }
    if (player.currentAP > 8) {
      errors.push(`Player ${id} AP exceeds maximum: ${player.currentAP} > 8`);
    }
  });

  // Validate turn order consistency
  if (session.turnManager.turnOrder.length !== session.players.size) {
    errors.push(`Turn order size mismatch: ${session.turnManager.turnOrder.length} !== ${session.players.size}`);
  }

  // Validate AP manager consistency
  if (session.apManager.playerAP.size !== session.players.size) {
    errors.push(`AP manager size mismatch: ${session.apManager.playerAP.size} !== ${session.players.size}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Test scenario builders
 */
export class TestScenarioBuilder {
  private players: Player[] = [];
  private events: Array<{ delay: number; action: () => void }> = [];

  addPlayer(player: Player): this {
    this.players.push(player);
    return this;
  }

  addDelayedEvent(delay: number, action: () => void): this {
    this.events.push({ delay, action });
    return this;
  }

  async execute(): Promise<void> {
    // Sort events by delay
    this.events.sort((a, b) => a.delay - b.delay);
    
    for (const event of this.events) {
      await delay(event.delay);
      event.action();
    }
  }

  getPlayers(): Player[] {
    return [...this.players];
  }

  clear(): this {
    this.players = [];
    this.events = [];
    return this;
  }
}

/**
 * Load testing utilities
 */
export async function createConcurrentLobbies(
  count: number,
  playersPerLobby: number = 4
): Promise<GameSession[]> {
  const sessions: GameSession[] = [];
  
  for (let i = 0; i < count; i++) {
    const roomId = `load-test-room-${i}`;
    sessions.push(createMockGameSession(roomId, playersPerLobby));
  }
  
  return sessions;
}

/**
 * Network simulation utilities
 */
export class NetworkSimulator {
  private latency: number;
  private packetLoss: number;
  private jitter: number;

  constructor(
    latency: number = 50,
    packetLoss: number = 0,
    jitter: number = 10
  ) {
    this.latency = latency;
    this.packetLoss = packetLoss;
    this.jitter = jitter;
  }

  async simulateMessage<T>(message: T): Promise<T | null> {
    // Simulate packet loss
    if (Math.random() * 100 < this.packetLoss) {
      return null;
    }

    // Simulate latency with jitter
    const actualLatency = this.latency + (Math.random() - 0.5) * this.jitter;
    await delay(Math.max(0, actualLatency));

    return message;
  }

  setLatency(latency: number): void {
    this.latency = latency;
  }

  setPacketLoss(packetLoss: number): void {
    this.packetLoss = packetLoss;
  }

  setJitter(jitter: number): void {
    this.jitter = jitter;
  }
}

/**
 * Assertion helpers for complex game state
 */
export function expectPlayerPosition(
  player: Player,
  expectedPosition: Position,
  tolerance: number = 0
): void {
  const distance = Math.abs(player.position.x - expectedPosition.x) + 
                  Math.abs(player.position.y - expectedPosition.y);
  
  if (distance > tolerance) {
    throw new Error(
      `Player position mismatch. Expected: ${JSON.stringify(expectedPosition)}, ` +
      `Actual: ${JSON.stringify(player.position)}, Distance: ${distance}`
    );
  }
}

export function expectAPInRange(
  player: Player,
  minAP: number,
  maxAP: number
): void {
  if (player.currentAP < minAP || player.currentAP > maxAP) {
    throw new Error(
      `Player AP out of range. Expected: ${minAP}-${maxAP}, ` +
      `Actual: ${player.currentAP}`
    );
  }
}

export function expectHealthInRange(
  player: Player,
  minHealth: number,
  maxHealth: number
): void {
  if (player.health < minHealth || player.health > maxHealth) {
    throw new Error(
      `Player health out of range. Expected: ${minHealth}-${maxHealth}, ` +
      `Actual: ${player.health}`
    );
  }
}