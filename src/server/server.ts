import * as dotenv from 'dotenv';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { APManager, APAbilityProcessor } from './APSystem';
import { TurnManager } from './TurnManager';
import { FreeActionProcessor } from './FreeActions';
import { 
  PlayerId, 
  RoomId, 
  GameSession, 
  Player, 
  FreeAction, 
  APAction, 
  GameMessage,
  ActionResult,
  Position
} from '../shared/types';
import { GAME_CONFIG, AP_SYSTEM, ERROR_MESSAGES, NETWORK } from '../shared/constants';
import { DatabaseConnection, supabaseClient, supabaseAdmin } from '../lib/supabase';
import { DungeonGenerator } from '../game/dungeons/DungeonGenerator';
import { DungeonConfig } from '../shared/DungeonTypes';

// Load environment variables
dotenv.config();

/**
 * Main server class that integrates all AP system components with Hathora
 */
class HathoraAPServer {
  private activeLobbyGames = new Map<RoomId, APGameSession>();
  private playerConnections = new Map<PlayerId, WebSocket>();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private databaseConnection: DatabaseConnection;

  constructor() {
    this.databaseConnection = DatabaseConnection.getInstance();
    this.setupHeartbeat();
  }

  /**
   * Start the Hathora server with AP system integration
   */
  async startServer(): Promise<void> {
    const port = parseInt(process.env.PORT || '3001'); // Use port 3001 to avoid conflicts
    
    console.log(`Starting Tactical ASCII Roguelike AP Server on port ${port}`);
    
    // Test database connection before starting server
    try {
      console.log('Testing Supabase database connection...');
      const healthMetrics = await this.databaseConnection.getHealthMetrics();
      
      if (healthMetrics.connected) {
        console.log('✅ Supabase database connection successful');
        console.log(`   URL: ${healthMetrics.url}`);
        console.log(`   Admin Access: ${healthMetrics.adminConnected ? '✅' : '❌'}`);
      } else {
        console.warn('⚠️  Database connection failed, but server will continue');
        console.warn('   Game data persistence will not be available');
      }
    } catch (error) {
      console.error('❌ Database connection error:', error);
      console.warn('   Server will start without database functionality');
    }

    // Create HTTP server first
    const server = http.createServer((req, res) => {
      this.handleHttpRequest(req, res);
    });

    // Then add WebSocket server on top
    this.setupWebSocketServer(server);
    
    server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  }

  /**
   * Handle HTTP requests (serve the game interface)
   */
  private handleHttpRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    const url = req.url || '/';
    
    if (url === '/' || url === '/index.html') {
      // Serve the main game interface
      const htmlPath = path.join(__dirname, '../../public/index.html');
      fs.readFile(htmlPath, 'utf8', (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Game interface not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
    } else if (url.startsWith('/js/')) {
      // Serve JavaScript files
      const jsPath = path.join(__dirname, '../../public', url);
      fs.readFile(jsPath, 'utf8', (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('JavaScript file not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(data);
      });
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  }

  /**
   * Setup WebSocket server (simplified Hathora-like implementation)
   */
  private setupWebSocketServer(server: http.Server): void {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (socket: WebSocket, request: any) => {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const roomId = url.searchParams.get('roomId') || 'default';
      const playerId = url.searchParams.get('playerId') || this.generatePlayerId();

      this.handlePlayerConnection(socket, roomId, playerId);
    });
  }

  /**
   * Handle new player connection
   */
  private handlePlayerConnection(socket: WebSocket, roomId: RoomId, playerId: PlayerId): void {
    console.log(`Player ${playerId} connecting to room ${roomId}`);

    // Store player connection
    this.playerConnections.set(playerId, socket);

    // Get or create game session
    let gameSession = this.activeLobbyGames.get(roomId);
    if (!gameSession) {
      gameSession = this.createGameSession(roomId);
      this.activeLobbyGames.set(roomId, gameSession);
    }

    // Add player to session
    const success = this.addPlayerToSession(gameSession, playerId, socket);
    if (!success) {
      this.sendError(socket, ERROR_MESSAGES.LOBBY_FULL);
      socket.close();
      return;
    }

    // Setup message handlers
    socket.on('message', (data: string) => {
      try {
        const message = JSON.parse(data);
        this.handlePlayerMessage(roomId, playerId, message);
      } catch (error) {
        console.error('Invalid message format:', error);
        this.sendError(socket, 'Invalid message format');
      }
    });

    socket.on('close', () => {
      this.handlePlayerDisconnection(roomId, playerId);
    });

    // Send initial game state
    this.sendGameState(roomId, playerId);
  }

  /**
   * Create a new game session
   */
  private createGameSession(roomId: RoomId): APGameSession {
    const apManager = new APManager();
    const turnManager = new TurnManager();
    const freeActionProcessor = new FreeActionProcessor();
    const apAbilityProcessor = new APAbilityProcessor(apManager);

    const session = new APGameSession(
      roomId,
      apManager,
      turnManager,
      freeActionProcessor,
      apAbilityProcessor
    );

    console.log(`Created new game session for room ${roomId}`);
    return session;
  }

  /**
   * Add player to game session
   */
  private addPlayerToSession(session: APGameSession, playerId: PlayerId, socket: WebSocket): boolean {
    if (session.getPlayerCount() >= GAME_CONFIG.MAX_PLAYERS_PER_LOBBY) {
      return false;
    }

    // Find first available floor tile from the generated dungeon
    const spawnPosition = session.findValidSpawnPosition();

    const player: Player = {
      id: playerId,
      name: `Player ${playerId.slice(-4)}`,
      position: spawnPosition,
      health: GAME_CONFIG.BASE_HEALTH,
      maxHealth: GAME_CONFIG.BASE_HEALTH,
      currentAP: AP_SYSTEM.DEFAULT_AP_PER_TURN,
      movement: {
        baseSpeed: 3,
        currentSpeed: 3,
        remainingMovement: 3,
        movementMode: 'walk'
      },
      skills: {
        combat: 20,
        swords: 15,
        fire_magic: 10,
        healing_magic: 5,
        arcane_magic: 0
      },
      equipment: {
        weapon: {
          name: 'Basic Sword',
          damage: '1d6+1',
          initiative: 1
        }
      },
      status: 'ready'
    };

    session.addPlayer(player);
    return true;
  }

  /**
   * Handle player messages
   */
  private handlePlayerMessage(roomId: RoomId, playerId: PlayerId, message: any): void {
    const gameSession = this.activeLobbyGames.get(roomId);
    if (!gameSession) {
      this.sendErrorToPlayer(playerId, ERROR_MESSAGES.GAME_NOT_FOUND);
      return;
    }

    switch (message.type) {
      case 'FREE_ACTION':
        this.handleFreeAction(gameSession, playerId, message.data);
        break;

      case 'AP_ACTION':
        this.handleAPAction(gameSession, playerId, message.data);
        break;

      case 'END_TURN':
        this.handleEndTurn(gameSession, playerId);
        break;

      case 'READY':
        this.handlePlayerReady(gameSession, playerId);
        break;

      case 'GET_GAME_STATE':
        this.sendGameState(roomId, playerId);
        break;

      default:
        this.sendErrorToPlayer(playerId, ERROR_MESSAGES.INVALID_ACTION);
    }
  }

  /**
   * Handle free action execution
   */
  private handleFreeAction(session: APGameSession, playerId: PlayerId, actionData: FreeAction): void {
    const result = session.executeFreeAction(actionData);
    
    // Broadcast result to all players in the session
    this.broadcastToSession(session.roomId, {
      type: 'ACTION_RESULT',
      data: {
        playerId,
        action: actionData,
        result
      },
      timestamp: Date.now()
    });
  }

  /**
   * Handle AP action execution
   */
  private handleAPAction(session: APGameSession, playerId: PlayerId, actionData: APAction): void {
    const result = session.executeAPAction(actionData);
    
    // Broadcast result to all players in the session
    this.broadcastToSession(session.roomId, {
      type: 'ACTION_RESULT',
      data: {
        playerId,
        action: actionData,
        result
      },
      timestamp: Date.now()
    });

    // If it's the player's turn and they used AP, check if turn should end
    if (result.success && session.turnManager.isPlayerTurn(playerId)) {
      // In the future, we might auto-end turns after certain AP expenditures
      // For now, players must manually end their turn
    }
  }

  /**
   * Handle turn end
   */
  private handleEndTurn(session: APGameSession, playerId: PlayerId): void {
    if (!session.turnManager.isPlayerTurn(playerId)) {
      this.sendErrorToPlayer(playerId, ERROR_MESSAGES.NOT_YOUR_TURN);
      return;
    }

    session.endPlayerTurn(playerId);
    
    this.broadcastToSession(session.roomId, {
      type: 'TURN_END',
      data: { playerId },
      timestamp: Date.now()
    });
  }

  /**
   * Handle player ready status
   */
  private handlePlayerReady(session: APGameSession, playerId: PlayerId): void {
    session.setPlayerReady(playerId, true);
    
    this.broadcastToSession(session.roomId, {
      type: 'PLAYER_READY',
      data: { playerId },
      timestamp: Date.now()
    });

    // Start game if all players are ready
    if (session.areAllPlayersReady() && 
        session.getPlayerCount() >= GAME_CONFIG.MIN_PLAYERS_TO_START) {
      session.startGame();
      
      this.broadcastToSession(session.roomId, {
        type: 'GAME_STARTED',
        data: {
          turnOrder: session.getTurnOrder(),
          currentPlayer: session.getCurrentPlayer()
        },
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle player disconnection
   */
  private handlePlayerDisconnection(roomId: RoomId, playerId: PlayerId): void {
    console.log(`Player ${playerId} disconnected from room ${roomId}`);

    this.playerConnections.delete(playerId);

    const gameSession = this.activeLobbyGames.get(roomId);
    if (gameSession) {
      gameSession.handlePlayerDisconnection(playerId);
      
      this.broadcastToSession(roomId, {
        type: 'PLAYER_DISCONNECTED',
        data: { playerId },
        timestamp: Date.now()
      });

      // Remove empty sessions
      if (gameSession.getPlayerCount() === 0) {
        this.activeLobbyGames.delete(roomId);
        console.log(`Removed empty game session for room ${roomId}`);
      }
    }
  }

  /**
   * Send game state to a specific player
   */
  private sendGameState(roomId: RoomId, playerId: PlayerId): void {
    const gameSession = this.activeLobbyGames.get(roomId);
    if (!gameSession) {
      this.sendErrorToPlayer(playerId, ERROR_MESSAGES.GAME_NOT_FOUND);
      return;
    }

    const gameState = gameSession.getGameState();
    this.sendToPlayer(playerId, {
      type: 'GAME_STATE',
      data: gameState,
      timestamp: Date.now()
    });
  }

  /**
   * Broadcast message to all players in a session
   */
  private broadcastToSession(roomId: RoomId, message: GameMessage): void {
    const gameSession = this.activeLobbyGames.get(roomId);
    if (!gameSession) return;

    const playerIds = gameSession.getAllPlayerIds();
    for (const playerId of playerIds) {
      this.sendToPlayer(playerId, message);
    }
  }

  /**
   * Send message to a specific player
   */
  private sendToPlayer(playerId: PlayerId, message: GameMessage): void {
    const socket = this.playerConnections.get(playerId);
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Failed to send message to player ${playerId}:`, error);
      }
    }
  }

  /**
   * Send error message to a specific player
   */
  private sendErrorToPlayer(playerId: PlayerId, error: string): void {
    this.sendToPlayer(playerId, {
      type: 'ERROR',
      data: { error },
      timestamp: Date.now()
    });
  }

  /**
   * Send error message to a socket
   */
  private sendError(socket: WebSocket, error: string): void {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'ERROR',
        data: { error },
        timestamp: Date.now()
      }));
    }
  }

  /**
   * Generate a unique player ID
   */
  private generatePlayerId(): PlayerId {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Setup heartbeat system
   */
  private setupHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.playerConnections.forEach((socket, playerId) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.ping();
        } else {
          this.playerConnections.delete(playerId);
        }
      });
    }, NETWORK.HEARTBEAT_INTERVAL);
  }

  /**
   * Get database connection for use by other components
   */
  getDatabaseConnection(): DatabaseConnection {
    return this.databaseConnection;
  }

  /**
   * Get Supabase clients for direct database operations
   */
  getSupabaseClients() {
    return {
      client: supabaseClient,
      admin: supabaseAdmin
    };
  }

  /**
   * Shutdown server gracefully
   */
  shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Close all connections
    this.playerConnections.forEach(socket => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    });

    // Clean up game sessions
    this.activeLobbyGames.clear();
    
    console.log('Server shutdown complete');
  }
}

/**
 * Game session class that manages a single lobby/room
 */
class APGameSession {
  public readonly roomId: RoomId;
  public readonly apManager: APManager;
  public readonly turnManager: TurnManager;
  public readonly freeActionProcessor: FreeActionProcessor;
  public readonly apAbilityProcessor: APAbilityProcessor;
  public readonly dungeonGenerator: DungeonGenerator;
  
  private players = new Map<PlayerId, Player>();
  private gameStarted = false;
  private currentDungeon: any = null;
  private enemies = new Map<string, any>();
  private items = new Map<string, any>();

  constructor(
    roomId: RoomId,
    apManager: APManager,
    turnManager: TurnManager,
    freeActionProcessor: FreeActionProcessor,
    apAbilityProcessor: APAbilityProcessor
  ) {
    this.roomId = roomId;
    this.apManager = apManager;
    this.turnManager = turnManager;
    this.freeActionProcessor = freeActionProcessor;
    this.apAbilityProcessor = apAbilityProcessor;
    this.dungeonGenerator = new DungeonGenerator();

    // Generate initial dungeon
    this.generateDungeon();

    // Setup event handlers
    this.setupEventHandlers();
  }

  /**
   * Generate a new dungeon with enemies and items
   */
  private generateDungeon(): void {
    const config: DungeonConfig = {
      width: 60,
      height: 30,
      theme: 'classic',
      algorithm: 'rooms_corridors',
      roomCount: 8,
      roomMinSize: 4,
      roomMaxSize: 12,
      seed: Math.floor(Math.random() * 1000000)
    };

    this.currentDungeon = this.dungeonGenerator.generate(config);
    
    // Generate enemies
    this.generateEnemies();
    
    // Generate items
    this.generateItems();

    // Update the FreeActionProcessor with dungeon data
    this.updateFreeActionProcessorWithDungeon();

    console.log(`Generated dungeon for room ${this.roomId}: ${this.currentDungeon.rooms?.length || 0} rooms`);
  }

  /**
   * Generate enemies in the dungeon
   */
  private generateEnemies(): void {
    const enemyTypes = ['goblin', 'orc', 'skeleton', 'troll'];
    const numEnemies = Math.floor(Math.random() * 8) + 3; // 3-10 enemies

    for (let i = 0; i < numEnemies; i++) {
      const enemyId = `enemy_${i}`;
      const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)] || 'goblin';
      
      // Random position in dungeon
      const x = Math.floor(Math.random() * 60);
      const y = Math.floor(Math.random() * 30);

      const enemy = {
        id: enemyId,
        type: enemyType,
        position: { x, y },
        health: 20 + Math.floor(Math.random() * 30),
        maxHealth: 50,
        currentAP: 2,
        symbol: this.getEnemySymbol(enemyType),
        color: this.getEnemyColor(enemyType)
      };

      this.enemies.set(enemyId, enemy);
    }

    console.log(`Generated ${this.enemies.size} enemies`);
  }

  /**
   * Generate items in the dungeon
   */
  private generateItems(): void {
    const itemTypes = ['sword', 'shield', 'potion', 'gold', 'key'];
    const numItems = Math.floor(Math.random() * 12) + 5; // 5-16 items

    for (let i = 0; i < numItems; i++) {
      const itemId = `item_${i}`;
      const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)] || 'sword';
      
      // Random position
      const x = Math.floor(Math.random() * 60);
      const y = Math.floor(Math.random() * 30);

      const item = {
        id: itemId,
        type: itemType,
        position: { x, y },
        symbol: this.getItemSymbol(itemType),
        color: this.getItemColor(itemType),
        name: this.getItemName(itemType)
      };

      this.items.set(itemId, item);
    }

    console.log(`Generated ${this.items.size} items`);
  }

  private getEnemySymbol(type: string): string {
    const symbols: Record<string, string> = { goblin: 'g', orc: 'o', skeleton: 's', troll: 'T' };
    return symbols[type] || 'E';
  }

  private getEnemyColor(type: string): string {
    const colors: Record<string, string> = { goblin: '#ff6600', orc: '#cc0000', skeleton: '#cccccc', troll: '#006600' };
    return colors[type] || '#ff0000';
  }

  private getItemSymbol(type: string): string {
    const symbols: Record<string, string> = { sword: '/', shield: ')', potion: '!', gold: '$', key: '-' };
    return symbols[type] || '?';
  }

  private getItemColor(type: string): string {
    const colors: Record<string, string> = { sword: '#c0c0c0', shield: '#8b4513', potion: '#ff00ff', gold: '#ffff00', key: '#ffa500' };
    return colors[type] || '#ffffff';
  }

  private getItemName(type: string): string {
    const names: Record<string, string> = { 
      sword: 'Iron Sword', 
      shield: 'Wooden Shield', 
      potion: 'Health Potion', 
      gold: 'Gold Coins', 
      key: 'Dungeon Key' 
    };
    return names[type] || 'Unknown Item';
  }

  /**
   * Setup event handlers for turn management
   */
  private setupEventHandlers(): void {
    this.turnManager.on('turn_started', (data: any) => {
      // Grant AP for the new turn
      this.apManager.addAPForTurn(data.playerId);
    });

    this.turnManager.on('round_completed', () => {
      // Grant AP to all players at round end
      for (const [playerId] of this.players) {
        this.apManager.addAPForTurn(playerId);
      }
    });
  }

  /**
   * Add player to the session
   */
  addPlayer(player: Player): void {
    this.players.set(player.id, player);
    this.apManager.initializePlayer(player.id);
    this.freeActionProcessor.addPlayer(player);
    
    // Ensure FreeActionProcessor has current dungeon data
    this.updateFreeActionProcessorWithDungeon();
  }


  /**
   * Execute a free action
   */
  executeFreeAction(action: FreeAction): ActionResult {
    return this.freeActionProcessor.executeImmediately(action);
  }

  /**
   * Execute an AP action
   */
  executeAPAction(action: APAction): ActionResult {
    const player = this.players.get(action.playerId);
    if (!player) {
      return {
        success: false,
        reason: 'Player not found',
        timestamp: Date.now()
      };
    }

    return this.apAbilityProcessor.executeAPAbility(action.playerId, action.abilityId, player);
  }

  /**
   * End a player's turn
   */
  endPlayerTurn(playerId: PlayerId): void {
    this.turnManager.endTurn();
  }

  /**
   * Set player ready status
   */
  setPlayerReady(playerId: PlayerId, ready: boolean): void {
    const player = this.players.get(playerId);
    if (player) {
      player.status = ready ? 'ready' : 'waiting';
      this.turnManager.setPlayerReady(playerId, ready);
    }
  }

  /**
   * Check if all players are ready
   */
  areAllPlayersReady(): boolean {
    return this.turnManager.areAllPlayersReady();
  }

  /**
   * Start the game
   */
  startGame(): void {
    if (this.gameStarted) return;

    this.gameStarted = true;
    this.turnManager.calculateInitiative(Array.from(this.players.values()));
    this.turnManager.startCombat();
  }

  /**
   * Handle player disconnection
   */
  handlePlayerDisconnection(playerId: PlayerId): void {
    this.players.delete(playerId);
    this.apManager.removePlayer(playerId);
    this.freeActionProcessor.removePlayer(playerId);
    this.turnManager.removePlayer(playerId);
  }

  /**
   * Get player count
   */
  getPlayerCount(): number {
    return this.players.size;
  }

  /**
   * Get all player IDs
   */
  getAllPlayerIds(): PlayerId[] {
    return Array.from(this.players.keys());
  }

  /**
   * Get current player whose turn it is
   */
  getCurrentPlayer(): PlayerId | null {
    const current = this.turnManager.getCurrentPlayer();
    return current?.playerId || null;
  }

  /**
   * Get turn order
   */
  getTurnOrder(): any[] {
    return this.turnManager.getTurnState().turnOrder;
  }

  /**
   * Get complete game state
   */
  getGameState(): any {
    return {
      roomId: this.roomId,
      players: Array.from(this.players.values()),
      turnState: this.turnManager.getTurnState(),
      gameStarted: this.gameStarted,
      timestamp: Date.now()
    };
  }

  /**
   * Find a valid spawn position from the generated dungeon
   */
  findValidSpawnPosition(): Position {
    // If dungeon hasn't been generated yet or failed, use fallback position
    if (!this.currentDungeon || !this.currentDungeon.map || !this.currentDungeon.map.cells) {
      console.warn('No dungeon available for spawn position, using fallback');
      return { x: 5, y: 5 };
    }

    const cells = this.currentDungeon.map.cells;

    // First, try to find a floor tile in the first room (entrance)
    if (this.currentDungeon.rooms && this.currentDungeon.rooms.length > 0) {
      const entranceRoom = this.currentDungeon.rooms[0];
      
      // Look for a floor tile in the entrance room
      for (let y = entranceRoom.y + 1; y < entranceRoom.y + entranceRoom.height - 1; y++) {
        for (let x = entranceRoom.x + 1; x < entranceRoom.x + entranceRoom.width - 1; x++) {
          if (x >= 0 && x < cells.length && y >= 0 && y < cells[0].length) {
            const cell = cells[x][y];
            if (cell.type === 'floor') {
              // Check if position is already occupied by another player
              if (!this.isPositionOccupied({ x, y })) {
                return { x, y };
              }
            }
          }
        }
      }
    }

    // If no room available, scan entire dungeon for first floor tile
    if (cells.length > 0 && cells[0] && cells[0].length > 0) {
      for (let x = 1; x < cells.length - 1; x++) {
        for (let y = 1; y < cells[0].length - 1; y++) {
          const cell = cells[x][y];
          if (cell && cell.type === 'floor') {
            // Check if position is already occupied by another player
            if (!this.isPositionOccupied({ x, y })) {
              return { x, y };
            }
          }
        }
      }
    }

    // Last resort: return center of dungeon (should rarely happen)
    console.warn('Could not find valid spawn position, using center');
    const centerX = cells.length > 0 ? Math.floor(cells.length / 2) : 5;
    const centerY = cells.length > 0 && cells[0] ? Math.floor(cells[0].length / 2) : 5;
    return { x: centerX, y: centerY };
  }

  /**
   * Check if a position is occupied by any player
   */
  private isPositionOccupied(position: Position): boolean {
    for (const [, player] of this.players) {
      if (player.position.x === position.x && player.position.y === position.y) {
        return true;
      }
    }
    return false;
  }

  /**
   * Update FreeActionProcessor with current dungeon data
   */
  private updateFreeActionProcessorWithDungeon(): void {
    if (this.currentDungeon && this.currentDungeon.map && this.currentDungeon.map.cells) {
      const cells = this.currentDungeon.map.cells;
      const width = this.currentDungeon.map.width || cells.length;
      const height = this.currentDungeon.map.height || (cells[0] ? cells[0].length : 0);
      
      this.freeActionProcessor.updateDungeonData(cells, width, height);
      console.log(`Updated FreeActionProcessor with dungeon data: ${width}x${height}`);
    } else {
      console.warn('No dungeon data available to update FreeActionProcessor');
    }
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  const server = new HathoraAPServer();
  server.startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully');
    server.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully');
    server.shutdown();
    process.exit(0);
  });
}

export { HathoraAPServer, APGameSession };