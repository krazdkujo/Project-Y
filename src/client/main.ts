import { PlayerId, Player, Position } from '../shared/types';
import { NetworkClient } from './NetworkClient';
import { GameRenderer } from './GameRenderer';
import { ActionSelector } from './ActionSelector';
import { APInterface } from './APInterface';
import { InputHandler } from './InputHandler';

/**
 * Main Game Client for the AP System
 * Integrates all client components and manages the game lifecycle
 */
export class GameClient {
  // Core components
  private networkClient: NetworkClient;
  private gameRenderer: GameRenderer;
  private actionSelector: ActionSelector;
  private apInterface: APInterface;
  private inputHandler: InputHandler;
  
  // Game state
  private playerId: PlayerId;
  private roomId: string;
  private isInitialized = false;
  private isGameStarted = false;
  private connectionRetryCount = 0;
  private maxRetries = 3;
  
  // Configuration
  private config = {
    serverUrl: this.getServerUrl(),
    reconnectDelay: 2000,
    heartbeatInterval: 30000,
    debugMode: process.env.NODE_ENV === 'development'
  };

  constructor(playerId?: PlayerId, roomId?: string) {
    // Generate player ID if not provided
    this.playerId = playerId || this.generatePlayerId();
    this.roomId = roomId || this.getRoomIdFromUrl() || 'default-room';
    
    // Initialize components
    this.networkClient = new NetworkClient(this.playerId, this.roomId);
    this.gameRenderer = new GameRenderer();
    this.actionSelector = new ActionSelector();
    this.apInterface = new APInterface(this.gameRenderer, this.actionSelector, this.networkClient);
    this.inputHandler = new InputHandler(this.networkClient, this.actionSelector, this.gameRenderer, this.apInterface);
    
    // Setup component relationships
    this.setupComponentConnections();
  }

  /**
   * Initialize the game client
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('Game client already initialized');
      return;
    }

    try {
      console.log(`Initializing game client for player ${this.playerId} in room ${this.roomId}`);
      
      // Setup connection handlers
      this.setupConnectionHandlers();
      
      // Setup error handlers
      this.setupErrorHandlers();
      
      // Setup game message handlers
      this.setupGameMessageHandlers();
      
      // Setup UI event handlers
      this.setupUIHandlers();
      
      // Connect to server
      await this.connectToServer();
      
      // Initialize UI components
      this.initializeUI();
      
      // Enable input handling
      this.inputHandler.setEnabled(true);
      
      this.isInitialized = true;
      console.log('Game client initialized successfully');
      
      // Auto-ready if in debug mode
      if (this.config.debugMode) {
        setTimeout(() => {
          this.networkClient.sendReady();
        }, 1000);
      }
      
    } catch (error) {
      console.error('Failed to initialize game client:', error);
      this.handleInitializationError(error);
      throw error;
    }
  }

  /**
   * Setup connections between components
   */
  private setupComponentConnections(): void {
    // Action selector callbacks are already set up in APInterface
    
    // Set up renderer with initial player position
    const startPosition: Position = { x: 30, y: 10 }; // Center of map
    this.gameRenderer.setCurrentPlayer(this.playerId);
    this.inputHandler.updatePlayerPosition(startPosition);
  }

  /**
   * Setup connection event handlers
   */
  private setupConnectionHandlers(): void {
    this.networkClient.onConnection((connected: boolean) => {
      this.updateConnectionStatus(connected);
      
      if (connected) {
        console.log('Connected to server');
        this.connectionRetryCount = 0;
        
        // Send ready status if game hasn't started
        if (!this.isGameStarted) {
          setTimeout(() => {
            this.networkClient.sendReady();
          }, 500);
        }
      } else {
        console.log('Disconnected from server');
        this.handleDisconnection();
      }
    });
  }

  /**
   * Setup error handlers
   */
  private setupErrorHandlers(): void {
    this.networkClient.onError((error: string) => {
      console.error('Network error:', error);
      this.showErrorMessage(error);
    });
    
    // Global error handler
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.showErrorMessage('An unexpected error occurred');
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.showErrorMessage('A network error occurred');
    });
  }

  /**
   * Setup game message handlers
   */
  private setupGameMessageHandlers(): void {
    // Game started
    this.networkClient.onMessage('GAME_STARTED', (data: any) => {
      console.log('Game started!', data);
      this.isGameStarted = true;
      this.handleGameStarted(data);
    });
    
    // Player joined
    this.networkClient.onMessage('PLAYER_READY', (data: any) => {
      console.log(`Player ${data.playerId} is ready`);
    });
    
    // Game state updates
    this.networkClient.onMessage('GAME_STATE', (data: any) => {
      this.handleGameStateUpdate(data);
    });
    
    // Turn management
    this.networkClient.onMessage('TURN_START', (data: any) => {
      this.handleTurnStart(data);
    });
    
    this.networkClient.onMessage('TURN_END', (data: any) => {
      this.handleTurnEnd(data);
    });
    
    // Action results
    this.networkClient.onMessage('ACTION_RESULT', (data: any) => {
      this.handleActionResult(data);
    });
    
    // AP updates
    this.networkClient.onMessage('AP_UPDATE', (data: any) => {
      this.handleAPUpdate(data);
    });
    
    // Initiative order
    this.networkClient.onMessage('INITIATIVE_ORDER', (data: any) => {
      this.handleInitiativeOrder(data);
    });
    
    // Player disconnection
    this.networkClient.onMessage('PLAYER_DISCONNECTED', (data: any) => {
      this.handlePlayerDisconnected(data);
    });
    
    // Chat messages
    this.networkClient.onMessage('CHAT_MESSAGE', (data: any) => {
      this.handleChatMessage(data);
    });
    
    // Tactical signals
    this.networkClient.onMessage('TACTICAL_SIGNAL', (data: any) => {
      this.handleTacticalSignal(data);
    });
    
    // Combo system
    this.networkClient.onMessage('COMBO_REQUEST', (data: any) => {
      this.handleComboRequest(data);
    });
    
    this.networkClient.onMessage('COMBO_RESULT', (data: any) => {
      this.handleComboResult(data);
    });
  }

  /**
   * Setup UI event handlers
   */
  private setupUIHandlers(): void {
    // Window resize
    document.addEventListener('windowResize', () => {
      this.handleWindowResize();
    });
    
    // Game pause/resume
    document.addEventListener('gamePaused', () => {
      this.inputHandler.setEnabled(false);
    });
    
    document.addEventListener('gameResumed', () => {
      this.inputHandler.setEnabled(this.apInterface.isCurrentPlayerTurn());
    });
    
    // Custom game messages
    document.addEventListener('gameMessage', (event: any) => {
      this.handleUIMessage(event.detail);
    });
  }

  /**
   * Connect to the game server
   */
  private async connectToServer(): Promise<void> {
    try {
      await this.networkClient.connect(this.config.serverUrl);
      this.updateConnectionStatus(true);
    } catch (error) {
      console.error('Failed to connect to server:', error);
      this.updateConnectionStatus(false);
      throw error;
    }
  }

  /**
   * Initialize UI components
   */
  private initializeUI(): void {
    // The UI components are already initialized in their constructors
    // and connected through the APInterface
    
    // Set initial state
    this.actionSelector.setEnabled(false);
    this.inputHandler.setEnabled(true);
    
    // Show initial messages
    this.gameRenderer.addMessage('ASCII Roguelike v1.0');
    this.gameRenderer.addMessage('Connected to server');
    this.showMessage('Waiting for players...');
  }

  /**
   * Handle game started event
   */
  private handleGameStarted(data: any): void {
    console.log('Game started with data:', data);
    this.showMessage('Game started! Combat begins!');
    
    // Update game state
    if (data.gameState) {
      this.gameRenderer.updateGameDisplay(data.gameState);
    }
    
    // Enable action selector if it's our turn
    if (data.currentPlayerId === this.playerId) {
      this.actionSelector.setEnabled(true);
    }
  }

  /**
   * Handle game state updates
   */
  private handleGameStateUpdate(data: any): void {
    // Update renderer
    this.gameRenderer.updateGameDisplay(data);
    
    // Update player position in input handler
    if (data.players && data.players[this.playerId]) {
      const myPlayer = data.players[this.playerId];
      this.inputHandler.updatePlayerPosition(myPlayer.position);
    }
  }

  /**
   * Handle turn start
   */
  private handleTurnStart(data: any): void {
    const isMyTurn = data.playerId === this.playerId;
    
    // Enable/disable controls based on turn
    this.actionSelector.setEnabled(isMyTurn);
    
    if (isMyTurn) {
      this.showMessage("Your turn! Choose your actions.");
    } else {
      this.showMessage(`${data.playerName || data.playerId}'s turn`);
    }
  }

  /**
   * Handle turn end
   */
  private handleTurnEnd(data: any): void {
    // Disable action selector
    this.actionSelector.setEnabled(false);
    
    this.showMessage(`${data.playerName || data.playerId}'s turn ended`);
  }

  /**
   * Handle action results
   */
  private handleActionResult(data: any): void {
    const { result, action } = data;
    
    if (result.success) {
      this.showMessage(`Action ${action.type} succeeded`);
      
      // Handle movement result
      if (action.type === 'MOVE') {
        this.gameRenderer.updatePlayerPosition(
          action.playerId,
          action.oldPosition || this.inputHandler.getInputState().currentPosition,
          action.target
        );
        
        if (action.playerId === this.playerId) {
          this.inputHandler.updatePlayerPosition(action.target);
        }
      }
      
      // Handle ability effects
      if (result.effects) {
        this.handleActionEffects(result.effects);
      }
      
    } else {
      this.showMessage(`Action failed: ${result.reason}`);
    }
  }

  /**
   * Handle action effects (visual feedback)
   */
  private handleActionEffects(effects: any[]): void {
    effects.forEach(effect => {
      switch (effect.type) {
        case 'damage':
          // Show damage effect
          if (effect.position) {
            this.gameRenderer.showEffect(effect.position.x, effect.position.y, '💥', 800);
          }
          break;
          
        case 'heal':
          // Show healing effect
          if (effect.position) {
            this.gameRenderer.showEffect(effect.position.x, effect.position.y, '✨', 600);
          }
          break;
          
        case 'move':
          // Movement is handled in handleActionResult
          break;
          
        default:
          console.log('Unknown effect type:', effect.type);
      }
    });
  }

  /**
   * Handle AP updates
   */
  private handleAPUpdate(data: any): void {
    // AP interface will handle this automatically through its message handler
    console.log('AP updated:', data);
  }

  /**
   * Handle initiative order updates
   */
  private handleInitiativeOrder(data: any): void {
    // AP interface will handle this automatically
    console.log('Initiative order updated:', data);
  }

  /**
   * Handle player disconnection
   */
  private handlePlayerDisconnected(data: any): void {
    this.showMessage(`${data.playerName || data.playerId} disconnected`);
  }

  /**
   * Handle chat messages
   */
  private handleChatMessage(data: any): void {
    const { playerId, message } = data;
    this.showMessage(`${playerId}: ${message}`);
  }

  /**
   * Handle tactical signals
   */
  private handleTacticalSignal(data: any): void {
    const { sender, type, urgent } = data;
    const urgentPrefix = urgent ? '🚨 ' : '📢 ';
    this.showMessage(`${urgentPrefix}${sender} signals: ${type}`);
  }

  /**
   * Handle combo requests
   */
  private handleComboRequest(data: any): void {
    const { leaderId, comboId, comboName } = data;
    this.showMessage(`💫 ${leaderId} wants to perform ${comboName}! Press J to join.`);
    
    // Add temporary keybinding for joining combo
    const joinHandler = (e: KeyboardEvent) => {
      if (e.key === 'j' || e.key === 'J') {
        this.networkClient.joinCombo(comboId);
        document.removeEventListener('keydown', joinHandler);
        e.preventDefault();
      }
    };
    
    document.addEventListener('keydown', joinHandler);
    
    // Remove handler after 5 seconds
    setTimeout(() => {
      document.removeEventListener('keydown', joinHandler);
    }, 5000);
  }

  /**
   * Handle combo results
   */
  private handleComboResult(data: any): void {
    const { success, comboName, participants } = data;
    
    if (success) {
      this.showMessage(`🌟 Combo ${comboName} executed by ${participants.join(', ')}!`);
    } else {
      this.showMessage(`❌ Combo ${comboName} failed`);
    }
  }

  /**
   * Handle disconnection
   */
  private handleDisconnection(): void {
    this.actionSelector.setEnabled(false);
    
    if (this.connectionRetryCount < this.maxRetries) {
      this.connectionRetryCount++;
      this.showMessage(`Connection lost. Attempting to reconnect... (${this.connectionRetryCount}/${this.maxRetries})`);
      
      setTimeout(async () => {
        try {
          await this.connectToServer();
        } catch (error) {
          console.error('Reconnection failed:', error);
        }
      }, this.config.reconnectDelay);
    } else {
      this.showMessage('Connection lost. Maximum retry attempts reached.');
    }
  }

  /**
   * Handle initialization errors
   */
  private handleInitializationError(error: any): void {
    this.showErrorMessage('Failed to initialize game. Please refresh the page.');
  }

  /**
   * Handle window resize
   */
  private handleWindowResize(): void {
    // Could trigger layout recalculation if needed
    console.log('Window resized');
  }

  /**
   * Handle UI messages
   */
  private handleUIMessage(detail: any): void {
    console.log('UI message:', detail);
  }

  /**
   * Update connection status in UI
   */
  private updateConnectionStatus(connected: boolean): void {
    if (typeof window !== 'undefined' && window.updateConnectionStatus) {
      window.updateConnectionStatus(connected);
    }
  }

  /**
   * Show a message to the player
   */
  private showMessage(message: string): void {
    console.log(`Game: ${message}`);
    
    // Add to ASCII message log
    this.gameRenderer.addMessage(message);
    
    // Also dispatch event for any remaining UI components
    if (typeof document !== 'undefined') {
      const event = new CustomEvent('gameMessage', {
        detail: { message, type: 'info' }
      });
      document.dispatchEvent(event);
    }
  }

  /**
   * Show an error message
   */
  private showErrorMessage(message: string): void {
    console.error(`Error: ${message}`);
    
    // Add to ASCII message log with error prefix
    this.gameRenderer.addMessage(`ERROR: ${message}`);
    
    // Also dispatch event for any remaining UI components
    if (typeof document !== 'undefined') {
      const event = new CustomEvent('gameMessage', {
        detail: { message, type: 'error' }
      });
      document.dispatchEvent(event);
    }
  }

  /**
   * Get server URL from environment or default
   */
  private getServerUrl(): string {
    if (typeof window !== 'undefined') {
      // Browser environment
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      return `${protocol}//${host}/ws`;
    } else {
      // Node environment (for testing)
      return process.env.SERVER_URL || 'ws://localhost:8080';
    }
  }

  /**
   * Get room ID from URL parameters
   */
  private getRoomIdFromUrl(): string | null {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('room');
    }
    return null;
  }

  /**
   * Generate a unique player ID
   */
  private generatePlayerId(): PlayerId {
    const adjectives = ['Swift', 'Brave', 'Clever', 'Bold', 'Silent', 'Fierce', 'Noble', 'Quick'];
    const nouns = ['Warrior', 'Mage', 'Rogue', 'Knight', 'Archer', 'Healer', 'Guardian', 'Shadow'];
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 1000);
    
    return `${adjective}${noun}${number}`;
  }

  /**
   * Get current game state
   */
  public getGameState(): {
    playerId: PlayerId;
    roomId: string;
    isInitialized: boolean;
    isGameStarted: boolean;
    isConnected: boolean;
  } {
    return {
      playerId: this.playerId,
      roomId: this.roomId,
      isInitialized: this.isInitialized,
      isGameStarted: this.isGameStarted,
      isConnected: this.networkClient.isClientConnected()
    };
  }

  /**
   * Send a chat message
   */
  public sendChatMessage(message: string): void {
    this.networkClient.sendChatMessage(message);
  }

  /**
   * Send ready status
   */
  public sendReady(): void {
    this.networkClient.sendReady();
  }

  /**
   * Leave the current game
   */
  public leaveGame(): void {
    this.networkClient.disconnect();
    this.actionSelector.setEnabled(false);
    this.inputHandler.setEnabled(false);
    this.showMessage('Left the game');
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    console.log('Cleaning up game client');
    
    // Cleanup components
    this.networkClient.cleanup();
    this.gameRenderer.cleanup();
    this.inputHandler.cleanup();
    this.apInterface.cleanup();
    
    // Reset state
    this.isInitialized = false;
    this.isGameStarted = false;
    this.connectionRetryCount = 0;
  }
}

// Export for browser usage
export default GameClient;

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  // Make GameClient available globally for the HTML file
  (window as any).GameClient = GameClient;
}