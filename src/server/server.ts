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
  ActionResult 
} from '../shared/types';
import { GAME_CONFIG, AP_SYSTEM, ERROR_MESSAGES, NETWORK } from '../shared/constants';

// Load environment variables
dotenv.config();

/**
 * Main server class that integrates all AP system components with Hathora
 */
class HathoraAPServer {
  private activeLobbyGames = new Map<RoomId, APGameSession>();
  private playerConnections = new Map<PlayerId, WebSocket>();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupHeartbeat();
  }

  /**
   * Start the Hathora server with AP system integration
   */
  startServer(): void {
    const port = parseInt(process.env.PORT || '8080');
    
    console.log(`Starting Tactical ASCII Roguelike AP Server on port ${port}`);

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

    const player: Player = {
      id: playerId,
      name: `Player ${playerId.slice(-4)}`,
      position: { x: 5, y: 5 }, // Default starting position
      health: GAME_CONFIG.BASE_HEALTH,
      maxHealth: GAME_CONFIG.BASE_HEALTH,
      currentAP: AP_SYSTEM.DEFAULT_AP_PER_TURN,
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
  
  private players = new Map<PlayerId, Player>();
  private gameStarted = false;

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

    // Setup event handlers
    this.setupEventHandlers();
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
}

// Start the server if this file is run directly
if (require.main === module) {
  const server = new HathoraAPServer();
  server.startServer();

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