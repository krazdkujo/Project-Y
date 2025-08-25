import { Player, TurnState, APManagerState, GameMessage, PlayerId, InitiativeEntry } from '../shared/types';
import { AP_SYSTEM, ERROR_MESSAGES } from '../shared/constants';
import { GameRenderer } from './GameRenderer';
import { ActionSelector } from './ActionSelector';
import { NetworkClient } from './NetworkClient';

/**
 * ASCII Turn-based UI management for the AP System
 * Pure ASCII interface integrated with GameRenderer
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
  
  // ASCII Display areas (integrated with GameRenderer)
  private currentTurnDisplay = '';
  private initiativeDisplay = '';
  private messageLogDisplay = '';
  private turnTimerDisplay = '';
  private apDisplayText = '';

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
   * Initialize ASCII UI integration with GameRenderer
   */
  private initializeUI(): void {
    // Initialize ASCII display content
    this.currentTurnDisplay = this.generateTurnIndicatorASCII();
    this.initiativeDisplay = this.generateInitiativeOrderASCII();
    this.messageLogDisplay = this.generateMessageLogASCII();
    this.turnTimerDisplay = this.generateTurnTimerASCII();
    this.apDisplayText = this.generateAPDisplayASCII();
    
    // Setup action selector callbacks
    this.actionSelector.onActionSelected(this.handleActionSelected.bind(this));
    this.actionSelector.onTurnEnd(this.handleTurnEnd.bind(this));
    
    // Register with GameRenderer to display ASCII UI
    this.renderer.setUIOverlay(this.generateFullUIOverlay.bind(this));
  }

  /**
   * Generate ASCII turn indicator display
   */
  private generateTurnIndicatorASCII(): string {
    if (!this.turnState || !this.players.size) {
      return `
╔═══════════════════════╗
║     TURN STATUS       ║
╠═══════════════════════╣
║ Waiting for game...   ║
║ Status: Lobby         ║
╚═══════════════════════╝`;
    }

    const currentEntry = this.turnState.turnOrder[this.turnState.currentTurnIndex];
    if (!currentEntry) {
      return this.generateTurnIndicatorASCII(); // Fallback to waiting state
    }
    
    const currentPlayer = this.players.get(currentEntry.playerId);
    const playerName = currentPlayer ? currentPlayer.name : currentEntry.playerId;
    const truncatedName = this.padString(playerName, 13);
    const status = this.isMyTurn ? 'YOUR TURN' : 'WAITING';
    const statusPadded = this.padString(status, 13);
    
    return `
╔═══════════════════════╗
║     TURN STATUS       ║
╠═══════════════════════╣
║ Player: ${truncatedName} ║
║ Status: ${statusPadded} ║
║ ${this.isMyTurn ? '▶ TAKE ACTION!' : '  Waiting...'      } ║
╚═══════════════════════╝`;
  }

  /**
   * Generate ASCII AP display
   */
  private generateAPDisplayASCII(): string {
    const playerId = this.networkClient.getPlayerId();
    const currentAP = this.apState?.playerAP.get(playerId) ?? 0;
    const apPercent = currentAP / AP_SYSTEM.MAX_AP;
    const apBar = this.generateASCIIBar(apPercent, 15, '█', '░');
    
    return `
╔═══════════════════════╗
║    ACTION POINTS      ║
╠═══════════════════════╣
║ Current: ${this.padNumber(currentAP, 1)}/${AP_SYSTEM.MAX_AP}         ║
║ ${apBar} ║
║ +${AP_SYSTEM.DEFAULT_AP_PER_TURN} per turn         ║
╚═══════════════════════╝`;
  }

  /**
   * Generate ASCII initiative order display
   */
  private generateInitiativeOrderASCII(): string {
    const initiativeOrder = this.turnState?.turnOrder ?? [];
    
    if (initiativeOrder.length === 0) {
      return `
╔═══════════════════════╗
║   INITIATIVE ORDER    ║
╠═══════════════════════╣
║ Waiting for players...║
╚═══════════════════════╝`;
    }
    
    let display = `
╔═══════════════════════╗
║   INITIATIVE ORDER    ║
╠═══════════════════════╣`;
    
    initiativeOrder.forEach((entry: InitiativeEntry, index: number) => {
      const player = this.players.get(entry.playerId);
      const playerName = player ? player.name : entry.playerId;
      const isCurrent = this.turnState?.currentTurnIndex === index;
      const isMe = entry.playerId === this.networkClient.getPlayerId();
      
      const nameDisplay = this.padString(playerName, 8);
      const initDisplay = this.padNumber(entry.initiative, 2);
      const indicator = isCurrent ? '▶' : ' ';
      const highlight = isMe ? '*' : ' ';
      
      display += `\n║${highlight}${indicator} ${nameDisplay} ${initDisplay} ${highlight}║`;
    });
    
    display += '\n╚═══════════════════════╝';
    return display;
  }

  /**
   * Generate ASCII message log display
   */
  private generateMessageLogASCII(): string {
    let display = `
╔═══════════════════════╗
║      GAME LOG         ║
╠═══════════════════════╣`;
    
    if (this.messageLog.length === 0) {
      display += '\n║ Welcome to AP System! ║';
      display += '\n║ Waiting for game...   ║';
      display += '\n║ Use WASD to move      ║';
    } else {
      // Pad to 3 lines, show last 3 messages
      const paddedMessages = [...this.messageLog];
      while (paddedMessages.length < 3) {
        paddedMessages.unshift('');
      }
      
      paddedMessages.slice(-3).forEach(msg => {
        const truncated = msg.length > 21 ? msg.substring(0, 18) + '...' : msg;
        const padded = this.padString(truncated, 21);
        display += `\n║ ${padded} ║`;
      });
    }
    
    display += '\n╚═══════════════════════╝';
    return display;
  }

  /**
   * Generate ASCII turn timer display
   */
  private generateTurnTimerASCII(): string {
    const seconds = Math.ceil(this.turnTimeRemaining / 1000);
    const percentage = (this.turnTimeRemaining / AP_SYSTEM.TURN_TIME_LIMIT) * 100;
    const timerBar = this.generateASCIIBar(percentage / 100, 15, '█', '▓');
    
    // Color indicator based on time remaining
    let indicator = '●';
    if (percentage < 30) {
      indicator = '🔴'; // Critical
    } else if (percentage < 60) {
      indicator = '🟡'; // Warning  
    } else {
      indicator = '🟢'; // Good
    }
    
    return `
╔═══════════════════════╗
║     TURN TIMER        ║
╠═══════════════════════╣
║ ${indicator} Time: ${this.padNumber(seconds, 2)}s         ║
║ ${timerBar} ║
║ ${percentage < 30 ? '⚠️ HURRY UP!' : 'Take your time'   } ║
╚═══════════════════════╝`;
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
   * Update turn timer display (ASCII)
   */
  private updateTurnTimerDisplay(): void {
    // Timer display is updated automatically via generateFullUIOverlay
    // when the GameRenderer refreshes
    this.turnTimerDisplay = this.generateTurnTimerASCII();
  }

  /**
   * Show turn warning
   */
  private showTurnWarning(): void {
    this.addMessageToLog("⚠️ Turn ending soon! Hurry up!");
    // ASCII display will automatically show warning colors via timer display
  }

  /**
   * Handle turn timeout
   */
  private handleTurnTimeout(): void {
    this.addMessageToLog("Turn timed out!");
    this.networkClient.endTurn();
  }

  /**
   * Update turn display (ASCII)
   */
  private updateTurnDisplay(): void {
    // Turn display is updated automatically via generateFullUIOverlay
    this.currentTurnDisplay = this.generateTurnIndicatorASCII();
  }

  /**
   * Update AP display (ASCII)
   */
  private updateAPDisplay(data?: any): void {
    // AP display is updated automatically via generateFullUIOverlay
    this.apDisplayText = this.generateAPDisplayASCII();
    
    // Update action selector with current AP
    const playerId = this.networkClient.getPlayerId();
    const currentAP = data?.ap ?? this.apState?.playerAP.get(playerId) ?? 0;
    this.actionSelector.updateAvailableActions(currentAP);
  }

  /**
   * Update initiative order display (ASCII)
   */
  private updateInitiativeOrder(data?: any): void {
    // Initiative order is updated automatically via generateFullUIOverlay
    this.initiativeDisplay = this.generateInitiativeOrderASCII();
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
   * Add message to the log (ASCII)
   */
  private addMessageToLog(message: string): void {
    this.messageLog.push(message);
    
    // Keep only last 3 messages as specified
    if (this.messageLog.length > 3) {
      this.messageLog = this.messageLog.slice(-3);
    }
    
    // Update ASCII display
    this.messageLogDisplay = this.generateMessageLogASCII();
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
   * Generate full UI overlay for GameRenderer integration
   */
  private generateFullUIOverlay(): string {
    // Update all ASCII displays
    this.currentTurnDisplay = this.generateTurnIndicatorASCII();
    this.apDisplayText = this.generateAPDisplayASCII();
    this.initiativeDisplay = this.generateInitiativeOrderASCII();
    this.messageLogDisplay = this.generateMessageLogASCII();
    this.turnTimerDisplay = this.generateTurnTimerASCII();
    
    // Combine all ASCII UI elements
    return `${this.currentTurnDisplay}

${this.apDisplayText}

${this.initiativeDisplay}

${this.messageLogDisplay}

${this.turnTimerDisplay}`;
  }

  /**
   * ASCII utility methods (borrowed from GameRenderer)
   */
  private padString(str: string, length: number): string {
    if (str.length > length) {
      return str.substring(0, length);
    }
    return str + ' '.repeat(length - str.length);
  }

  private padNumber(num: number, length: number): string {
    return num.toString().padStart(length, ' ');
  }

  private generateASCIIBar(percentage: number, width: number, fillChar = '█', emptyChar = '░'): string {
    const filledWidth = Math.round(percentage * width);
    const emptyWidth = width - filledWidth;
    return fillChar.repeat(filledWidth) + emptyChar.repeat(emptyWidth);
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.stopTurnTimer();
  }
}