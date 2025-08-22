import { GameMessage, FreeAction, APAction, PlayerId, Position } from '../shared/types';
import { NETWORK, ERROR_MESSAGES } from '../shared/constants';

/**
 * WebSocket connection handling for the AP System
 * Manages communication with the game server
 */
export class NetworkClient {
  private socket: WebSocket | null = null;
  private playerId: PlayerId;
  private roomId: string;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = NETWORK.RECONNECTION_ATTEMPTS;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageQueue: any[] = [];
  private pendingMessages = new Map<string, any>();
  
  // Callbacks for different message types
  private messageHandlers = new Map<string, ((data: any) => void)[]>();
  private connectionHandlers: ((connected: boolean) => void)[] = [];
  private errorHandlers: ((error: string) => void)[] = [];

  constructor(playerId: PlayerId, roomId: string = 'default-room') {
    this.playerId = playerId;
    this.roomId = roomId;
  }

  /**
   * Connect to the game server
   */
  public async connect(serverUrl: string = 'ws://localhost:8080'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve();
        return;
      }

      const url = `${serverUrl}?roomId=${encodeURIComponent(this.roomId)}&playerId=${encodeURIComponent(this.playerId)}`;
      
      try {
        this.socket = new WebSocket(url);
        
        this.socket.onopen = () => {
          console.log(`Connected to server as ${this.playerId} in room ${this.roomId}`);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          this.setupHeartbeat();
          this.processMessageQueue();
          this.notifyConnectionHandlers(true);
          
          resolve();
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.socket.onclose = (event) => {
          console.log('Connection closed:', event.code, event.reason);
          this.handleDisconnection();
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.notifyErrorHandlers('Connection error occurred');
          reject(new Error('Failed to connect to server'));
        };

        // Connection timeout
        setTimeout(() => {
          if (!this.isConnected) {
            this.socket?.close();
            reject(new Error('Connection timeout'));
          }
        }, 10000);

      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * Handle incoming messages from server
   */
  private handleMessage(data: string): void {
    try {
      const message: GameMessage = JSON.parse(data);
      
      // Handle message acknowledgments
      if (message.type === 'ACK' && message.data?.messageId) {
        this.pendingMessages.delete(message.data.messageId);
        return;
      }
      
      // Handle heartbeat responses
      if (message.type === 'HEARTBEAT') {
        return;
      }
      
      // Notify message handlers
      this.notifyMessageHandlers(message.type, message.data);
      
    } catch (error) {
      console.error('Failed to parse message:', error);
      this.notifyErrorHandlers('Invalid message received from server');
    }
  }

  /**
   * Handle disconnection
   */
  private handleDisconnection(): void {
    this.isConnected = false;
    this.clearHeartbeat();
    this.notifyConnectionHandlers(false);
    
    // Attempt reconnection if not manually disconnected
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.attemptReconnection();
    } else {
      this.notifyErrorHandlers('Maximum reconnection attempts reached');
    }
  }

  /**
   * Attempt to reconnect to the server
   */
  private attemptReconnection(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff, max 30s
    
    console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error('Reconnection failed:', error);
        this.handleDisconnection();
      }
    }, delay);
  }

  /**
   * Setup heartbeat to keep connection alive
   */
  private setupHeartbeat(): void {
    this.clearHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.sendMessage({
          type: 'HEARTBEAT',
          data: { timestamp: Date.now() },
          timestamp: Date.now()
        });
      }
    }, NETWORK.HEARTBEAT_INTERVAL);
  }

  /**
   * Clear heartbeat timer
   */
  private clearHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Send a message to the server
   */
  private sendMessage(message: any): boolean {
    if (!this.isConnected || !this.socket) {
      // Queue message for later if not connected
      this.messageQueue.push(message);
      return false;
    }

    try {
      const messageId = this.generateMessageId();
      const messageWithId = { ...message, messageId };
      
      this.socket.send(JSON.stringify(messageWithId));
      
      // Track message for acknowledgment
      this.pendingMessages.set(messageId, {
        message: messageWithId,
        timestamp: Date.now(),
        retries: 0
      });
      
      // Setup timeout for message acknowledgment
      setTimeout(() => {
        this.handleMessageTimeout(messageId);
      }, NETWORK.MESSAGE_TIMEOUT);
      
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      this.notifyErrorHandlers('Failed to send message to server');
      return false;
    }
  }

  /**
   * Handle message timeout (no acknowledgment received)
   */
  private handleMessageTimeout(messageId: string): void {
    const pendingMessage = this.pendingMessages.get(messageId);
    if (!pendingMessage) return;
    
    pendingMessage.retries++;
    
    if (pendingMessage.retries < 3) {
      // Retry sending the message
      this.sendMessage(pendingMessage.message);
    } else {
      // Give up and remove from pending
      this.pendingMessages.delete(messageId);
      this.notifyErrorHandlers('Message failed to send after retries');
    }
  }

  /**
   * Process queued messages after reconnection
   */
  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const message = this.messageQueue.shift();
      this.sendMessage(message);
    }
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `${this.playerId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Send ready status to server
   */
  public sendReady(): boolean {
    return this.sendMessage({
      type: 'READY',
      data: { playerId: this.playerId },
      timestamp: Date.now()
    });
  }

  /**
   * Execute a free action
   */
  public executeFreeAction(actionType: FreeAction['type'], target?: Position | string): boolean {
    const action: FreeAction = {
      type: actionType,
      playerId: this.playerId,
      target,
      immediate: true,
      timestamp: Date.now()
    };

    return this.sendMessage({
      type: 'FREE_ACTION',
      data: action,
      timestamp: Date.now()
    });
  }

  /**
   * Execute an AP action/ability
   */
  public executeAPAction(abilityId: string, target?: Position | string): boolean {
    const action: APAction = {
      type: 'AP_ABILITY',
      playerId: this.playerId,
      abilityId,
      target,
      apCost: 0, // Server will calculate actual cost
      timestamp: Date.now()
    };

    return this.sendMessage({
      type: 'AP_ACTION',
      data: action,
      timestamp: Date.now()
    });
  }

  /**
   * End the current turn
   */
  public endTurn(): boolean {
    return this.sendMessage({
      type: 'END_TURN',
      data: { playerId: this.playerId },
      timestamp: Date.now()
    });
  }

  /**
   * Request current game state
   */
  public requestGameState(): boolean {
    return this.sendMessage({
      type: 'GET_GAME_STATE',
      data: { playerId: this.playerId },
      timestamp: Date.now()
    });
  }

  /**
   * Send a chat message
   */
  public sendChatMessage(message: string): boolean {
    return this.sendMessage({
      type: 'CHAT_MESSAGE',
      data: {
        playerId: this.playerId,
        message: message.trim()
      },
      timestamp: Date.now()
    });
  }

  /**
   * Send a tactical signal to team
   */
  public sendTacticalSignal(signalType: string, data: any, urgent: boolean = false): boolean {
    return this.sendMessage({
      type: 'TACTICAL_SIGNAL',
      data: {
        type: signalType,
        sender: this.playerId,
        data,
        urgent,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    });
  }

  /**
   * Request to join a combo ability
   */
  public joinCombo(comboId: string): boolean {
    return this.sendMessage({
      type: 'JOIN_COMBO',
      data: {
        playerId: this.playerId,
        comboId
      },
      timestamp: Date.now()
    });
  }

  /**
   * Initiate a combo ability
   */
  public initiateCombo(comboId: string): boolean {
    return this.sendMessage({
      type: 'INITIATE_COMBO',
      data: {
        leaderId: this.playerId,
        comboId
      },
      timestamp: Date.now()
    });
  }

  /**
   * Register a message handler for a specific message type
   */
  public onMessage(handler: (message: GameMessage) => void): void;
  public onMessage(messageType: string, handler: (data: any) => void): void;
  public onMessage(arg1: any, arg2?: any): void {
    if (typeof arg1 === 'string' && arg2) {
      // Specific message type handler
      const messageType = arg1;
      const handler = arg2;
      
      if (!this.messageHandlers.has(messageType)) {
        this.messageHandlers.set(messageType, []);
      }
      this.messageHandlers.get(messageType)!.push(handler);
    } else {
      // General message handler
      const handler = arg1;
      this.onMessage('*', (data: any) => {
        handler({ type: data.type, data: data.data, timestamp: data.timestamp });
      });
    }
  }

  /**
   * Register a connection status handler
   */
  public onConnection(handler: (connected: boolean) => void): void {
    this.connectionHandlers.push(handler);
  }

  /**
   * Register an error handler
   */
  public onError(handler: (error: string) => void): void {
    this.errorHandlers.push(handler);
  }

  /**
   * Notify message handlers
   */
  private notifyMessageHandlers(messageType: string, data: any): void {
    // Notify specific handlers
    const handlers = this.messageHandlers.get(messageType) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in message handler for ${messageType}:`, error);
      }
    });
    
    // Notify general handlers
    const generalHandlers = this.messageHandlers.get('*') || [];
    generalHandlers.forEach(handler => {
      try {
        handler({ type: messageType, data, timestamp: Date.now() });
      } catch (error) {
        console.error('Error in general message handler:', error);
      }
    });
  }

  /**
   * Notify connection handlers
   */
  private notifyConnectionHandlers(connected: boolean): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(connected);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }

  /**
   * Notify error handlers
   */
  private notifyErrorHandlers(error: string): void {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (error) {
        console.error('Error in error handler:', error);
      }
    });
  }

  /**
   * Get current player ID
   */
  public getPlayerId(): PlayerId {
    return this.playerId;
  }

  /**
   * Get current room ID
   */
  public getRoomId(): string {
    return this.roomId;
  }

  /**
   * Check if connected to server
   */
  public isClientConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get connection statistics
   */
  public getConnectionStats(): {
    connected: boolean;
    reconnectAttempts: number;
    pendingMessages: number;
    queuedMessages: number;
  } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      pendingMessages: this.pendingMessages.size,
      queuedMessages: this.messageQueue.length
    };
  }

  /**
   * Manually disconnect from server
   */
  public disconnect(): void {
    this.clearHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.socket) {
      this.socket.close(1000, 'Client disconnected');
      this.socket = null;
    }
    
    this.isConnected = false;
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnection
  }

  /**
   * Force reconnection
   */
  public async forceReconnect(): Promise<void> {
    this.disconnect();
    this.reconnectAttempts = 0;
    await this.connect();
  }

  /**
   * Clear all pending messages
   */
  public clearPendingMessages(): void {
    this.pendingMessages.clear();
    this.messageQueue = [];
  }

  /**
   * Set maximum reconnection attempts
   */
  public setMaxReconnectAttempts(attempts: number): void {
    this.maxReconnectAttempts = Math.max(0, attempts);
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.disconnect();
    this.messageHandlers.clear();
    this.connectionHandlers = [];
    this.errorHandlers = [];
    this.clearPendingMessages();
  }
}