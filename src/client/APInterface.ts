import { Player, TurnState, APManagerState, GameMessage, PlayerId, InitiativeEntry } from '../shared/types';
import { AP_SYSTEM, ERROR_MESSAGES } from '../shared/constants';
import { GameRenderer } from './GameRenderer';
import { ActionSelector } from './ActionSelector';
import { NetworkClient } from './NetworkClient';

/**
 * Turn-based UI management for the AP System
 * Handles turn display, AP tracking, initiative order, and player status
 */
export class APInterface {
  private renderer: GameRenderer;
  private actionSelector: ActionSelector;
  private networkClient: NetworkClient;
  
  // Game state
  private currentPlayer: Player | null = null;
  private turnState: TurnState | null = null;
  private apState: APManagerState | null = null;
  private players: Map<PlayerId, Player> = new Map();
  private messageLog: string[] = [];
  
  // UI state
  private isMyTurn = false;
  private turnTimeRemaining = 0;
  private turnTimer: NodeJS.Timeout | null = null;
  private warningShown = false;
  
  // Display elements
  private readonly TURN_INDICATOR_ID = 'turn-indicator';
  private readonly AP_DISPLAY_ID = 'ap-display';
  private readonly INITIATIVE_ORDER_ID = 'initiative-order';
  private readonly MESSAGE_LOG_ID = 'message-log';
  private readonly TURN_TIMER_ID = 'turn-timer';

  constructor(renderer: GameRenderer, actionSelector: ActionSelector, networkClient: NetworkClient) {
    this.renderer = renderer;
    this.actionSelector = actionSelector;
    this.networkClient = networkClient;
    
    // Setup message handlers
    this.networkClient.onMessage(this.handleGameMessage.bind(this));
    
    // Initialize UI elements
    this.initializeUI();
  }

  /**
   * Initialize UI elements and event handlers
   */
  private initializeUI(): void {
    // Create turn indicator
    this.createTurnIndicator();
    
    // Create AP display
    this.createAPDisplay();
    
    // Create initiative order display
    this.createInitiativeOrderDisplay();
    
    // Create message log
    this.createMessageLog();
    
    // Create turn timer
    this.createTurnTimer();
    
    // Setup action selector callbacks
    this.actionSelector.onActionSelected(this.handleActionSelected.bind(this));
    this.actionSelector.onTurnEnd(this.handleTurnEnd.bind(this));
  }

  /**
   * Create turn indicator UI element
   */
  private createTurnIndicator(): void {
    const indicator = document.createElement('div');
    indicator.id = this.TURN_INDICATOR_ID;
    indicator.className = 'turn-indicator';
    indicator.innerHTML = `
      <div class="current-player">
        <span class="label">Current Turn:</span>
        <span class="player-name">Waiting for game...</span>
      </div>
      <div class="turn-status">
        <span class="status">Lobby</span>
      </div>
    `;
    
    const container = document.getElementById('ui-container');
    if (container) {
      container.appendChild(indicator);
    }
  }

  /**
   * Create AP display UI element
   */
  private createAPDisplay(): void {
    const display = document.createElement('div');
    display.id = this.AP_DISPLAY_ID;
    display.className = 'ap-display';
    display.innerHTML = `
      <div class="ap-header">Action Points</div>
      <div class="ap-current">
        <span class="ap-value">0</span>
        <span class="ap-max">/ ${AP_SYSTEM.MAX_AP}</span>
      </div>
      <div class="ap-bar">
        <div class="ap-fill" style="width: 0%"></div>
      </div>
      <div class="ap-generation">+${AP_SYSTEM.DEFAULT_AP_PER_TURN} per turn</div>
    `;
    
    const container = document.getElementById('ui-container');
    if (container) {
      container.appendChild(display);
    }
  }

  /**
   * Create initiative order display
   */
  private createInitiativeOrderDisplay(): void {
    const display = document.createElement('div');
    display.id = this.INITIATIVE_ORDER_ID;
    display.className = 'initiative-order';
    display.innerHTML = `
      <div class="initiative-header">Initiative Order</div>
      <div class="initiative-list">
        <div class="no-players">Waiting for players...</div>
      </div>
    `;
    
    const container = document.getElementById('ui-container');
    if (container) {
      container.appendChild(display);
    }
  }

  /**
   * Create message log display
   */
  private createMessageLog(): void {
    const log = document.createElement('div');
    log.id = this.MESSAGE_LOG_ID;
    log.className = 'message-log';
    log.innerHTML = `
      <div class="log-header">Game Log</div>
      <div class="log-messages">
        <div class="log-message">Welcome to the AP System!</div>
        <div class="log-message">Waiting for game to start...</div>
        <div class="log-message">Use arrow keys to move, spacebar to attack</div>
      </div>
    `;
    
    const container = document.getElementById('ui-container');
    if (container) {
      container.appendChild(log);
    }
  }

  /**
   * Create turn timer display
   */
  private createTurnTimer(): void {
    const timer = document.createElement('div');
    timer.id = this.TURN_TIMER_ID;
    timer.className = 'turn-timer';
    timer.innerHTML = `
      <div class="timer-label">Turn Time</div>
      <div class="timer-bar">
        <div class="timer-fill" style="width: 100%"></div>
      </div>
      <div class="timer-value">0s</div>
    `;
    
    const container = document.getElementById('ui-container');
    if (container) {
      container.appendChild(timer);
    }
  }

  /**
   * Handle incoming game messages
   */
  private handleGameMessage(message: GameMessage): void {
    switch (message.type) {
      case 'GAME_STATE':
        this.updateGameState(message.data);
        break;
        
      case 'TURN_START':
        this.handleTurnStart(message.data);
        break;
        
      case 'TURN_END':
        this.handleTurnEndMessage(message.data);
        break;
        
      case 'AP_UPDATE':
        this.updateAPDisplay(message.data);
        break;
        
      case 'INITIATIVE_ORDER':
        this.updateInitiativeOrder(message.data);
        break;
        
      case 'ACTION_RESULT':
        this.handleActionResult(message.data);
        break;
        
      case 'ERROR':
        this.handleError(message.data);
        break;
        
      case 'GAME_STARTED':
        this.handleGameStarted(message.data);
        break;
        
      case 'PLAYER_DISCONNECTED':
        this.handlePlayerDisconnected(message.data);
        break;
    }
  }

  /**
   * Update the entire game state
   */
  private updateGameState(gameState: any): void {
    this.players = new Map(Object.entries(gameState.players));
    this.turnState = gameState.turnManager;
    this.apState = gameState.apManager;
    
    // Update all displays
    this.updateTurnDisplay();
    this.updateAPDisplay();
    this.updateInitiativeOrder();
    this.renderer.updateGameDisplay(gameState);
  }

  /**
   * Handle turn start
   */
  private handleTurnStart(data: any): void {
    const { playerId, timeLimit } = data;
    this.isMyTurn = playerId === this.networkClient.getPlayerId();
    this.turnTimeRemaining = timeLimit || AP_SYSTEM.TURN_TIME_LIMIT;
    this.warningShown = false;
    
    // Update turn display
    this.updateTurnDisplay();
    
    // Start turn timer
    this.startTurnTimer();
    
    // Enable/disable action selector
    this.actionSelector.setEnabled(this.isMyTurn);
    
    // Add message to log
    const player = this.players.get(playerId);
    const playerName = player ? player.name : playerId;
    this.addMessageToLog(`${playerName}'s turn started`);
    
    if (this.isMyTurn) {
      this.addMessageToLog("Your turn! Choose your actions.");
    }
  }

  /**
   * Handle turn end message
   */
  private handleTurnEndMessage(data: any): void {
    const { playerId } = data;
    
    // Stop turn timer
    this.stopTurnTimer();
    
    // Disable action selector
    this.actionSelector.setEnabled(false);
    
    // Add message to log
    const player = this.players.get(playerId);
    const playerName = player ? player.name : playerId;
    this.addMessageToLog(`${playerName}'s turn ended`);
    
    this.isMyTurn = false;
  }

  /**
   * Start the turn timer
   */
  private startTurnTimer(): void {
    this.stopTurnTimer(); // Clear any existing timer
    
    const startTime = Date.now();
    
    this.turnTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      this.turnTimeRemaining = Math.max(0, AP_SYSTEM.TURN_TIME_LIMIT - elapsed);
      
      this.updateTurnTimerDisplay();
      
      // Show warning at 3 seconds remaining
      if (this.turnTimeRemaining <= AP_SYSTEM.TURN_WARNING_TIME && !this.warningShown && this.isMyTurn) {
        this.showTurnWarning();
        this.warningShown = true;
      }
      
      // Auto-end turn when time runs out
      if (this.turnTimeRemaining <= 0) {
        this.stopTurnTimer();
        if (this.isMyTurn) {
          this.handleTurnTimeout();
        }
      }
    }, 100); // Update every 100ms for smooth animation
  }

  /**
   * Stop the turn timer
   */
  private stopTurnTimer(): void {
    if (this.turnTimer) {
      clearInterval(this.turnTimer);
      this.turnTimer = null;
    }
  }

  /**
   * Update turn timer display
   */
  private updateTurnTimerDisplay(): void {
    const timerElement = document.getElementById(this.TURN_TIMER_ID);
    if (!timerElement) return;
    
    const seconds = Math.ceil(this.turnTimeRemaining / 1000);
    const percentage = (this.turnTimeRemaining / AP_SYSTEM.TURN_TIME_LIMIT) * 100;
    
    const valueElement = timerElement.querySelector('.timer-value');
    const fillElement = timerElement.querySelector('.timer-fill') as HTMLElement;
    
    if (valueElement) {
      valueElement.textContent = `${seconds}s`;
    }
    
    if (fillElement) {
      fillElement.style.width = `${percentage}%`;
      
      // Change color based on time remaining
      if (percentage < 30) {
        fillElement.className = 'timer-fill timer-critical';
      } else if (percentage < 60) {
        fillElement.className = 'timer-fill timer-warning';
      } else {
        fillElement.className = 'timer-fill';
      }
    }
  }

  /**
   * Show turn warning
   */
  private showTurnWarning(): void {
    this.addMessageToLog("⚠️ Turn ending soon! Hurry up!");
    
    // Flash the turn timer
    const timerElement = document.getElementById(this.TURN_TIMER_ID);
    if (timerElement) {
      timerElement.classList.add('timer-warning-flash');
      setTimeout(() => {
        timerElement.classList.remove('timer-warning-flash');
      }, 2000);
    }
  }

  /**
   * Handle turn timeout
   */
  private handleTurnTimeout(): void {
    this.addMessageToLog("Turn timed out!");
    this.networkClient.endTurn();
  }

  /**
   * Update turn display
   */
  private updateTurnDisplay(): void {
    const turnElement = document.getElementById(this.TURN_INDICATOR_ID);
    if (!turnElement || !this.turnState) return;
    
    const currentEntry = this.turnState.turnOrder[this.turnState.currentTurnIndex];
    if (!currentEntry) return;
    
    const currentPlayer = this.players.get(currentEntry.playerId);
    const playerName = currentPlayer ? currentPlayer.name : currentEntry.playerId;
    
    const playerNameElement = turnElement.querySelector('.player-name');
    const statusElement = turnElement.querySelector('.status');
    
    if (playerNameElement) {
      playerNameElement.textContent = playerName;
    }
    
    if (statusElement) {
      if (this.isMyTurn) {
        statusElement.textContent = 'Your Turn';
        statusElement.className = 'status your-turn';
      } else {
        statusElement.textContent = 'Waiting';
        statusElement.className = 'status waiting';
      }
    }
  }

  /**
   * Update AP display
   */
  private updateAPDisplay(data?: any): void {
    const apElement = document.getElementById(this.AP_DISPLAY_ID);
    if (!apElement) return;
    
    const playerId = this.networkClient.getPlayerId();
    const currentAP = data?.ap ?? this.apState?.playerAP.get(playerId) ?? 0;
    
    const valueElement = apElement.querySelector('.ap-value');
    const fillElement = apElement.querySelector('.ap-fill') as HTMLElement;
    
    if (valueElement) {
      valueElement.textContent = currentAP.toString();
    }
    
    if (fillElement) {
      const percentage = (currentAP / AP_SYSTEM.MAX_AP) * 100;
      fillElement.style.width = `${percentage}%`;
    }
    
    // Update action selector with current AP
    this.actionSelector.updateAvailableActions(currentAP);
  }

  /**
   * Update initiative order display
   */
  private updateInitiativeOrder(data?: any): void {
    const orderElement = document.getElementById(this.INITIATIVE_ORDER_ID);
    if (!orderElement) return;
    
    const listElement = orderElement.querySelector('.initiative-list');
    if (!listElement) return;
    
    const initiativeOrder = data?.order ?? this.turnState?.turnOrder ?? [];
    
    if (initiativeOrder.length === 0) {
      listElement.innerHTML = '<div class="no-players">Waiting for players...</div>';
      return;
    }
    
    listElement.innerHTML = '';
    
    initiativeOrder.forEach((entry: InitiativeEntry, index: number) => {
      const player = this.players.get(entry.playerId);
      const playerName = player ? player.name : entry.playerId;
      const isCurrent = this.turnState?.currentTurnIndex === index;
      const isMe = entry.playerId === this.networkClient.getPlayerId();
      
      const entryElement = document.createElement('div');
      entryElement.className = `initiative-entry ${isCurrent ? 'current' : ''} ${isMe ? 'me' : ''}`;
      entryElement.innerHTML = `
        <span class="player-name">${playerName}</span>
        <span class="initiative-value">${entry.initiative}</span>
        ${isCurrent ? '<span class="current-indicator">▶</span>' : ''}
      `;
      
      listElement.appendChild(entryElement);
    });
  }

  /**
   * Handle action result
   */
  private handleActionResult(data: any): void {
    const { result, action } = data;
    
    if (result.success) {
      this.addMessageToLog(`Action ${action.type} succeeded`);
      if (result.apSpent) {
        this.addMessageToLog(`Spent ${result.apSpent} AP`);
      }
    } else {
      this.addMessageToLog(`Action failed: ${result.reason}`);
    }
    
    // Update displays
    this.updateAPDisplay({ ap: result.newAP });
  }

  /**
   * Handle error message
   */
  private handleError(data: any): void {
    const errorMessage = ERROR_MESSAGES[data.error as keyof typeof ERROR_MESSAGES] || data.error;
    this.addMessageToLog(`❌ ${errorMessage}`);
  }

  /**
   * Handle game started
   */
  private handleGameStarted(data: any): void {
    this.addMessageToLog("🎮 Game started! Combat begins!");
    this.updateGameState(data);
  }

  /**
   * Handle player disconnected
   */
  private handlePlayerDisconnected(data: any): void {
    const { playerId } = data;
    const player = this.players.get(playerId);
    const playerName = player ? player.name : playerId;
    this.addMessageToLog(`${playerName} disconnected`);
  }

  /**
   * Handle action selected from action selector
   */
  private handleActionSelected(actionType: string, actionData: any): void {
    if (actionType === 'FREE_ACTION') {
      this.networkClient.executeFreeAction(actionData.type, actionData.target);
    } else if (actionType === 'AP_ACTION') {
      this.networkClient.executeAPAction(actionData.abilityId, actionData.target);
    }
  }

  /**
   * Handle turn end from action selector
   */
  private handleTurnEnd(): void {
    this.networkClient.endTurn();
  }

  /**
   * Add message to the log
   */
  private addMessageToLog(message: string): void {
    this.messageLog.push(message);
    
    // Keep only last 3 messages as specified
    if (this.messageLog.length > 3) {
      this.messageLog = this.messageLog.slice(-3);
    }
    
    // Update display
    const logElement = document.getElementById(this.MESSAGE_LOG_ID);
    if (logElement) {
      const messagesElement = logElement.querySelector('.log-messages');
      if (messagesElement) {
        messagesElement.innerHTML = '';
        this.messageLog.forEach(msg => {
          const msgElement = document.createElement('div');
          msgElement.className = 'log-message';
          msgElement.textContent = msg;
          messagesElement.appendChild(msgElement);
        });
        
        // Scroll to bottom
        messagesElement.scrollTop = messagesElement.scrollHeight;
      }
    }
  }

  /**
   * Set the current player (for initialization)
   */
  public setCurrentPlayer(player: Player): void {
    this.currentPlayer = player;
    this.updateAPDisplay();
  }

  /**
   * Get whether it's currently this player's turn
   */
  public isCurrentPlayerTurn(): boolean {
    return this.isMyTurn;
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.stopTurnTimer();
  }
}