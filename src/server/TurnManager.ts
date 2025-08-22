import { PlayerId, Player, InitiativeEntry, TurnState, GameMessage } from '../shared/types';
import { AP_SYSTEM, GAME_CONFIG, ERROR_MESSAGES } from '../shared/constants';

/**
 * TurnManager handles initiative-based turn order and timing
 * - Calculates initiative with d20 + skill bonuses + equipment
 * - Manages 5-10 second turn timing
 * - Handles turn progression and timeouts
 */
export class TurnManager {
  private turnState: TurnState;
  private turnTimer: NodeJS.Timeout | null = null;
  private players: Map<PlayerId, Player> = new Map();
  private eventCallbacks: Map<string, Function[]> = new Map();

  constructor() {
    this.turnState = {
      currentTurnIndex: 0,
      turnOrder: [],
      turnStartTime: 0,
      turnTimeLimit: AP_SYSTEM.TURN_TIME_LIMIT,
      phase: 'initiative'
    };
  }

  /**
   * Add event listener for turn events
   */
  on(event: string, callback: Function): void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, []);
    }
    this.eventCallbacks.get(event)!.push(callback);
  }

  /**
   * Emit event to registered listeners
   */
  private emit(event: string, data?: any): void {
    const callbacks = this.eventCallbacks.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  /**
   * Calculate initiative for all players and establish turn order
   */
  calculateInitiative(players: Player[]): void {
    this.players.clear();
    players.forEach(player => this.players.set(player.id, player));

    this.turnState.turnOrder = players.map(player => ({
      playerId: player.id,
      initiative: this.rollInitiative(player),
      ready: false
    })).sort((a, b) => b.initiative - a.initiative); // Highest first

    this.turnState.currentTurnIndex = 0;
    this.turnState.phase = 'initiative';

    this.emit('initiative_calculated', {
      turnOrder: this.turnState.turnOrder,
      timestamp: Date.now()
    });
  }

  /**
   * Roll initiative for a player using d20 + bonuses
   */
  private rollInitiative(player: Player): number {
    const d20 = Math.floor(Math.random() * GAME_CONFIG.INITIATIVE_DIE) + 1;
    const skillBonus = Math.floor(player.skills.combat / GAME_CONFIG.SKILL_INITIATIVE_DIVISOR);
    const equipmentBonus = player.equipment.weapon?.initiative || 0;
    
    return d20 + skillBonus + equipmentBonus;
  }

  /**
   * Start the current player's turn
   */
  startTurn(): void {
    if (this.turnState.turnOrder.length === 0) {
      throw new Error('No players in turn order');
    }

    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      this.nextTurn();
      return;
    }

    this.turnState.turnStartTime = Date.now();
    this.turnState.phase = 'actions';

    // Set turn timer
    this.turnTimer = setTimeout(() => {
      this.handleTurnTimeout();
    }, this.turnState.turnTimeLimit);

    this.emit('turn_started', {
      playerId: currentPlayer.playerId,
      timeLimit: this.turnState.turnTimeLimit,
      timestamp: this.turnState.turnStartTime
    });
  }

  /**
   * Handle turn timeout
   */
  private handleTurnTimeout(): void {
    const currentPlayer = this.getCurrentPlayer();
    
    this.emit('turn_timeout', {
      playerId: currentPlayer?.playerId,
      timestamp: Date.now()
    });

    // Force end turn with default action
    this.endTurn(true);
  }

  /**
   * End the current turn and advance to next player
   */
  endTurn(forced: boolean = false): void {
    if (this.turnTimer) {
      clearTimeout(this.turnTimer);
      this.turnTimer = null;
    }

    const currentPlayer = this.getCurrentPlayer();
    const turnDuration = Date.now() - this.turnState.turnStartTime;

    this.emit('turn_ended', {
      playerId: currentPlayer?.playerId,
      duration: turnDuration,
      forced,
      timestamp: Date.now()
    });

    this.nextTurn();
  }

  /**
   * Advance to the next player's turn
   */
  private nextTurn(): void {
    this.turnState.currentTurnIndex = 
      (this.turnState.currentTurnIndex + 1) % this.turnState.turnOrder.length;

    // Check if we've completed a full round
    if (this.turnState.currentTurnIndex === 0) {
      this.emit('round_completed', {
        timestamp: Date.now()
      });
    }

    // Start the next turn after a brief delay
    setTimeout(() => {
      this.startTurn();
    }, 500);
  }

  /**
   * Get the current player whose turn it is
   */
  getCurrentPlayer(): InitiativeEntry | null {
    if (this.turnState.turnOrder.length === 0) {
      return null;
    }
    return this.turnState.turnOrder[this.turnState.currentTurnIndex] || null;
  }

  /**
   * Get the current turn state
   */
  getTurnState(): TurnState {
    return { ...this.turnState };
  }

  /**
   * Check if it's a specific player's turn
   */
  isPlayerTurn(playerId: PlayerId): boolean {
    const currentPlayer = this.getCurrentPlayer();
    return currentPlayer?.playerId === playerId;
  }

  /**
   * Get remaining time in current turn
   */
  getRemainingTurnTime(): number {
    if (this.turnState.phase !== 'actions') {
      return 0;
    }
    
    const elapsed = Date.now() - this.turnState.turnStartTime;
    return Math.max(0, this.turnState.turnTimeLimit - elapsed);
  }

  /**
   * Skip a player's turn (for disconnections, etc.)
   */
  skipTurn(playerId: PlayerId, reason: string = 'SKIPPED'): boolean {
    const currentPlayer = this.getCurrentPlayer();
    
    if (!currentPlayer || currentPlayer.playerId !== playerId) {
      return false;
    }

    this.emit('turn_skipped', {
      playerId,
      reason,
      timestamp: Date.now()
    });

    this.endTurn(true);
    return true;
  }

  /**
   * Add a player to the turn order (for reconnections)
   */
  addPlayer(player: Player): void {
    this.players.set(player.id, player);

    // If we're not in combat, just add to players list
    if (this.turnState.phase === 'initiative') {
      return;
    }

    // Calculate initiative for the new player
    const initiative = this.rollInitiative(player);
    const newEntry: InitiativeEntry = {
      playerId: player.id,
      initiative,
      ready: false
    };

    // Insert in correct position based on initiative
    let insertIndex = this.turnState.turnOrder.length;
    for (let i = 0; i < this.turnState.turnOrder.length; i++) {
      if (this.turnState.turnOrder[i]!.initiative < initiative) {
        insertIndex = i;
        break;
      }
    }

    this.turnState.turnOrder.splice(insertIndex, 0, newEntry);

    // Adjust current turn index if needed
    if (insertIndex <= this.turnState.currentTurnIndex) {
      this.turnState.currentTurnIndex++;
    }

    this.emit('player_added', {
      playerId: player.id,
      initiative,
      insertIndex,
      timestamp: Date.now()
    });
  }

  /**
   * Remove a player from the turn order
   */
  removePlayer(playerId: PlayerId): void {
    this.players.delete(playerId);

    const playerIndex = this.turnState.turnOrder.findIndex(
      entry => entry.playerId === playerId
    );

    if (playerIndex === -1) {
      return;
    }

    // If it's the current player's turn, skip it
    if (playerIndex === this.turnState.currentTurnIndex) {
      this.skipTurn(playerId, 'DISCONNECTED');
      return;
    }

    // Remove from turn order
    this.turnState.turnOrder.splice(playerIndex, 1);

    // Adjust current turn index if needed
    if (playerIndex < this.turnState.currentTurnIndex) {
      this.turnState.currentTurnIndex--;
    }

    this.emit('player_removed', {
      playerId,
      timestamp: Date.now()
    });
  }

  /**
   * Set player ready status
   */
  setPlayerReady(playerId: PlayerId, ready: boolean = true): void {
    const entry = this.turnState.turnOrder.find(e => e.playerId === playerId);
    if (entry) {
      entry.ready = ready;
      
      this.emit('player_ready_changed', {
        playerId,
        ready,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Check if all players are ready
   */
  areAllPlayersReady(): boolean {
    return this.turnState.turnOrder.length > 0 && 
           this.turnState.turnOrder.every(entry => entry.ready);
  }

  /**
   * Start combat phase once all players are ready
   */
  startCombat(): void {
    if (!this.areAllPlayersReady()) {
      throw new Error('Not all players are ready');
    }

    this.turnState.phase = 'actions';
    this.startTurn();

    this.emit('combat_started', {
      turnOrder: this.turnState.turnOrder,
      timestamp: Date.now()
    });
  }

  /**
   * Pause the current turn timer
   */
  pauseTurn(): void {
    if (this.turnTimer) {
      clearTimeout(this.turnTimer);
      this.turnTimer = null;
    }

    this.emit('turn_paused', {
      playerId: this.getCurrentPlayer()?.playerId,
      timestamp: Date.now()
    });
  }

  /**
   * Resume the current turn timer
   */
  resumeTurn(): void {
    if (this.turnState.phase !== 'actions') {
      return;
    }

    const remainingTime = this.getRemainingTurnTime();
    if (remainingTime > 0) {
      this.turnTimer = setTimeout(() => {
        this.handleTurnTimeout();
      }, remainingTime);
    } else {
      this.handleTurnTimeout();
    }

    this.emit('turn_resumed', {
      playerId: this.getCurrentPlayer()?.playerId,
      remainingTime,
      timestamp: Date.now()
    });
  }

  /**
   * Reset the turn manager for a new game
   */
  reset(): void {
    if (this.turnTimer) {
      clearTimeout(this.turnTimer);
      this.turnTimer = null;
    }

    this.turnState = {
      currentTurnIndex: 0,
      turnOrder: [],
      turnStartTime: 0,
      turnTimeLimit: AP_SYSTEM.TURN_TIME_LIMIT,
      phase: 'initiative'
    };

    this.players.clear();

    this.emit('turn_manager_reset', {
      timestamp: Date.now()
    });
  }

  /**
   * Get player info by ID
   */
  getPlayer(playerId: PlayerId): Player | undefined {
    return this.players.get(playerId);
  }

  /**
   * Update turn time limit
   */
  setTurnTimeLimit(timeLimit: number): void {
    this.turnState.turnTimeLimit = Math.max(
      AP_SYSTEM.MIN_TURN_TIME,
      Math.min(timeLimit, AP_SYSTEM.TURN_TIME_LIMIT)
    );
  }
}