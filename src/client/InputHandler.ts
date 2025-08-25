import { Position } from '../shared/types';
import { NetworkClient } from './NetworkClient';
import { ActionSelector } from './ActionSelector';
import { GameRenderer } from './GameRenderer';
import { APInterface } from './APInterface';

/**
 * Keyboard input processing for the AP System
 * Handles movement controls, action shortcuts, and UI navigation
 */
export class InputHandler {
  private networkClient: NetworkClient;
  private actionSelector: ActionSelector;
  private gameRenderer: GameRenderer;
  private apInterface: APInterface;
  
  // Input state
  private isEnabled = true;
  private currentPlayerPosition: Position = { x: 0, y: 0 };
  private targetingMode = false;
  private targetPosition: Position | null = null;
  private pendingAction: any = null;
  
  // Key bindings
  private keyBindings = new Map<string, () => void>();
  private modifierKeys = {
    shift: false,
    ctrl: false,
    alt: false
  };

  constructor(
    networkClient: NetworkClient,
    actionSelector: ActionSelector,
    gameRenderer: GameRenderer,
    apInterface: APInterface
  ) {
    this.networkClient = networkClient;
    this.actionSelector = actionSelector;
    this.gameRenderer = gameRenderer;
    this.apInterface = apInterface;
    
    this.setupKeyBindings();
    this.setupEventListeners();
  }

  /**
   * Setup key bindings for various actions
   */
  private setupKeyBindings(): void {
    // Movement keys (Arrow keys and WASD)
    this.keyBindings.set('ArrowUp', () => this.handleMovement(0, -1));
    this.keyBindings.set('ArrowDown', () => this.handleMovement(0, 1));
    this.keyBindings.set('ArrowLeft', () => this.handleMovement(-1, 0));
    this.keyBindings.set('ArrowRight', () => this.handleMovement(1, 0));
    
    this.keyBindings.set('KeyW', () => this.handleMovement(0, -1));
    this.keyBindings.set('KeyS', () => this.handleMovement(0, 1));
    this.keyBindings.set('KeyA', () => this.handleMovement(-1, 0));
    this.keyBindings.set('KeyD', () => this.handleMovement(1, 0));
    
    // Diagonal movement (numpad style)
    this.keyBindings.set('KeyQ', () => this.handleMovement(-1, -1)); // Up-Left
    this.keyBindings.set('KeyE', () => this.handleMovement(1, -1));  // Up-Right
    this.keyBindings.set('KeyZ', () => this.handleMovement(-1, 1));  // Down-Left
    this.keyBindings.set('KeyX', () => this.handleMovement(1, 1));   // Down-Right
    
    // Tactical movement modes
    this.keyBindings.set('KeyM', () => this.enterMovementMode());     // Multi-square movement
    this.keyBindings.set('ShiftKeyM', () => this.handleRunMovement()); // Run movement mode
    
    // Action shortcuts
    this.keyBindings.set('Space', () => this.handleBasicAttack());
    this.keyBindings.set('KeyF', () => this.handleBasicAttack()); // Alternative attack key
    this.keyBindings.set('KeyG', () => this.handleDefense());
    this.keyBindings.set('KeyR', () => this.handleRest()); // Skip turn / rest
    
    // Ability shortcuts (1-9 for quick abilities)
    this.keyBindings.set('Digit1', () => this.handleAbilityShortcut('power_strike'));
    this.keyBindings.set('Digit2', () => this.handleAbilityShortcut('fireball'));
    this.keyBindings.set('Digit3', () => this.handleAbilityShortcut('heal'));
    this.keyBindings.set('Digit4', () => this.handleAbilityShortcut('shield_bash'));
    this.keyBindings.set('Digit5', () => this.handleAbilityShortcut('quick_shot'));
    this.keyBindings.set('Digit6', () => this.handleAbilityShortcut('whirlwind_attack'));
    this.keyBindings.set('Digit7', () => this.handleAbilityShortcut('meteor'));
    this.keyBindings.set('Digit8', () => this.handleAbilityShortcut('mass_heal'));
    this.keyBindings.set('Digit9', () => this.handleAbilityShortcut('resurrection'));
    
    // UI navigation
    this.keyBindings.set('Tab', () => this.toggleActionSelector());
    this.keyBindings.set('Enter', () => this.confirmAction());
    this.keyBindings.set('Escape', () => this.cancelAction());
    this.keyBindings.set('Backspace', () => this.cancelAction());
    
    // Targeting mode
    this.keyBindings.set('KeyT', () => this.enterTargetingMode());
    this.keyBindings.set('KeyC', () => this.centerView());
    
    // Quick commands
    this.keyBindings.set('KeyI', () => this.showInventory());
    this.keyBindings.set('KeyL', () => this.showGameLog());
    this.keyBindings.set('KeyM', () => this.showMap());
    this.keyBindings.set('KeyH', () => this.showHelp());
    
    // Chat and communication
    this.keyBindings.set('KeyY', () => this.openChat());
    this.keyBindings.set('KeyU', () => this.sendTacticalSignal('retreat'));
    this.keyBindings.set('KeyO', () => this.sendTacticalSignal('advance'));
    
    // Debug keys (only in development)
    if (process.env.NODE_ENV === 'development') {
      this.keyBindings.set('F1', () => this.debugShowGameState());
      this.keyBindings.set('F2', () => this.debugToggleGodMode());
      this.keyBindings.set('F3', () => this.debugAddAP());
    }
  }

  /**
   * Setup event listeners for keyboard input
   */
  private setupEventListeners(): void {
    // Keyboard events
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Mouse events for map interaction
    document.addEventListener('click', this.handleClick.bind(this));
    document.addEventListener('contextmenu', this.handleRightClick.bind(this));
    
    // Prevent default browser shortcuts that might interfere
    document.addEventListener('keydown', (e) => {
      // Prevent F5 refresh, Ctrl+R, etc. during gameplay
      if (this.isEnabled && (
        e.key === 'F5' || 
        (e.ctrlKey && e.key === 'r') ||
        (e.ctrlKey && e.key === 'w') ||
        e.key === 'F12'
      )) {
        e.preventDefault();
      }
    });
    
    // Handle focus events
    window.addEventListener('focus', () => {
      this.resetModifierKeys();
    });
    
    window.addEventListener('blur', () => {
      this.resetModifierKeys();
    });
  }

  /**
   * Handle keydown events
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isEnabled) return;
    
    // Update modifier key states
    this.modifierKeys.shift = event.shiftKey;
    this.modifierKeys.ctrl = event.ctrlKey;
    this.modifierKeys.alt = event.altKey;
    
    // Handle special key combinations
    if (this.handleSpecialCombinations(event)) {
      event.preventDefault();
      return;
    }
    
    // Check if we're in an input field
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return; // Don't process game controls when typing
    }
    
    // Get the key binding
    const binding = this.keyBindings.get(event.code);
    if (binding) {
      event.preventDefault();
      
      // Only process if it's the player's turn or it's a UI command
      if (this.apInterface.isCurrentPlayerTurn() || this.isUICommand(event.code)) {
        binding();
      } else {
        this.showMessage("It's not your turn!");
      }
    }
  }

  /**
   * Handle keyup events
   */
  private handleKeyUp(event: KeyboardEvent): void {
    // Update modifier key states
    this.modifierKeys.shift = event.shiftKey;
    this.modifierKeys.ctrl = event.ctrlKey;
    this.modifierKeys.alt = event.altKey;
  }

  /**
   * Handle special key combinations
   */
  private handleSpecialCombinations(event: KeyboardEvent): boolean {
    // Ctrl+C - Cancel current action
    if (event.ctrlKey && event.code === 'KeyC') {
      this.cancelAction();
      return true;
    }
    
    // Ctrl+Enter - End turn quickly
    if (event.ctrlKey && event.code === 'Enter') {
      this.networkClient.endTurn();
      return true;
    }
    
    // Shift+Movement - Run/Fast movement
    if (event.shiftKey && this.isMovementKey(event.code)) {
      // Handle fast movement (if implemented)
      return false; // Let normal movement handler process it
    }
    
    // Alt+1-9 - Quick target selection for abilities
    if (event.altKey && event.code.startsWith('Digit')) {
      const digit = parseInt(event.code.replace('Digit', ''));
      this.quickTargetSelect(digit);
      return true;
    }
    
    return false;
  }

  /**
   * Check if a key code is a movement key
   */
  private isMovementKey(code: string): boolean {
    const movementKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'KeyZ', 'KeyX'];
    return movementKeys.includes(code);
  }

  /**
   * Check if a key code is a UI command (allowed even when not player's turn)
   */
  private isUICommand(code: string): boolean {
    const uiCommands = ['Tab', 'Escape', 'KeyI', 'KeyL', 'KeyM', 'KeyH', 'KeyY', 'F1', 'F2', 'F3'];
    return uiCommands.includes(code);
  }

  /**
   * Reset modifier key states
   */
  private resetModifierKeys(): void {
    this.modifierKeys.shift = false;
    this.modifierKeys.ctrl = false;
    this.modifierKeys.alt = false;
  }

  /**
   * Handle movement input
   */
  private handleMovement(dx: number, dy: number): void {
    if (this.targetingMode) {
      this.moveTargetCursor(dx, dy);
      return;
    }
    
    const newPosition = {
      x: this.currentPlayerPosition.x + dx,
      y: this.currentPlayerPosition.y + dy
    };
    
    // Check if the new position is valid
    if (this.gameRenderer.isWalkable(newPosition.x, newPosition.y)) {
      // Use new tactical movement system - costs 1 AP
      this.networkClient.executeAPAction('tactical_move', newPosition);
      this.currentPlayerPosition = newPosition;
      this.showMessage("Moved 1 square (1 AP)");
    } else {
      this.showMessage("Can't move there!");
    }
  }

  /**
   * Handle basic attack
   */
  private handleBasicAttack(): void {
    if (this.targetingMode) {
      this.confirmTargetedAction();
      return;
    }
    
    // For basic attack, we need to target an adjacent enemy
    this.enterTargetingMode('BASIC_ATTACK');
  }

  /**
   * Handle defense action
   */
  private handleDefense(): void {
    this.networkClient.executeFreeAction('BASIC_DEFENSE');
  }

  /**
   * Handle rest/skip turn
   */
  private handleRest(): void {
    this.networkClient.endTurn();
  }

  /**
   * Handle ability shortcuts
   */
  private handleAbilityShortcut(abilityId: string): void {
    if (this.needsTargeting(abilityId)) {
      this.enterTargetingMode('AP_ABILITY', abilityId);
    } else {
      this.networkClient.executeAPAction(abilityId);
    }
  }

  /**
   * Check if an ability needs targeting
   */
  private needsTargeting(abilityId: string): boolean {
    const targetingAbilities = ['fireball', 'meteor', 'power_strike', 'resurrection'];
    return targetingAbilities.includes(abilityId);
  }

  /**
   * Enter targeting mode
   */
  private enterTargetingMode(actionType?: string, abilityId?: string): void {
    this.targetingMode = true;
    this.targetPosition = { ...this.currentPlayerPosition };
    this.pendingAction = { actionType, abilityId };
    
    this.showMessage("Targeting mode - Use arrow keys to select target, Enter to confirm, Escape to cancel");
    this.updateTargetingDisplay();
  }

  /**
   * Exit targeting mode
   */
  private exitTargetingMode(): void {
    this.targetingMode = false;
    this.targetPosition = null;
    this.pendingAction = null;
    this.clearTargetingDisplay();
  }

  /**
   * Move the target cursor
   */
  private moveTargetCursor(dx: number, dy: number): void {
    if (!this.targetPosition) return;
    
    const mapDimensions = this.gameRenderer.getMapDimensions();
    const newX = Math.max(0, Math.min(mapDimensions.width - 1, this.targetPosition.x + dx));
    const newY = Math.max(0, Math.min(mapDimensions.height - 1, this.targetPosition.y + dy));
    
    this.targetPosition = { x: newX, y: newY };
    this.updateTargetingDisplay();
  }

  /**
   * Update targeting display
   */
  private updateTargetingDisplay(): void {
    if (!this.targetPosition) return;
    
    // Clear previous targeting highlights
    this.clearTargetingDisplay();
    
    // Highlight the target position
    this.gameRenderer.highlightPosition(this.targetPosition.x, this.targetPosition.y, '#ff0000');
    
    // Show range indicator if applicable
    if (this.pendingAction?.abilityId) {
      this.showAbilityRange(this.pendingAction.abilityId, this.targetPosition);
    }
  }

  /**
   * Clear targeting display
   */
  private clearTargetingDisplay(): void {
    // This would clear any highlighting or range indicators
    // Implementation depends on how the renderer handles highlighting
  }

  /**
   * Show ability range
   */
  private showAbilityRange(abilityId: string, center: Position): void {
    // Show range indicators for area abilities
    const areaAbilities: { [key: string]: number } = {
      'fireball': 2,
      'meteor': 3,
      'mass_heal': 2
    };
    
    const radius = areaAbilities[abilityId];
    if (radius) {
      for (let x = center.x - radius; x <= center.x + radius; x++) {
        for (let y = center.y - radius; y <= center.y + radius; y++) {
          const distance = Math.sqrt((x - center.x) ** 2 + (y - center.y) ** 2);
          if (distance <= radius) {
            this.gameRenderer.highlightPosition(x, y, '#ffff0080'); // Semi-transparent yellow
          }
        }
      }
    }
  }

  /**
   * Confirm targeted action
   */
  private confirmTargetedAction(): void {
    if (!this.targetPosition || !this.pendingAction) return;
    
    if (this.pendingAction.actionType === 'BASIC_ATTACK') {
      this.networkClient.executeFreeAction('BASIC_ATTACK', this.targetPosition);
    } else if (this.pendingAction.actionType === 'AP_ABILITY') {
      this.networkClient.executeAPAction(this.pendingAction.abilityId, this.targetPosition);
    }
    
    this.exitTargetingMode();
  }

  /**
   * Handle click events on the map
   */
  private handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    // Check if click is on a map cell
    if (target.classList.contains('map-cell')) {
      const cellId = target.id;
      const [, x, y] = cellId.split('-').map(Number);
      
      if (this.targetingMode) {
        this.targetPosition = { x, y };
        this.updateTargetingDisplay();
      } else if (this.apInterface.isCurrentPlayerTurn()) {
        // Quick movement on click
        this.handleQuickMove(x, y);
      }
    }
  }

  /**
   * Handle right-click events
   */
  private handleRightClick(event: MouseEvent): void {
    event.preventDefault();
    
    const target = event.target as HTMLElement;
    
    if (target.classList.contains('map-cell')) {
      const cellId = target.id;
      const [, x, y] = cellId.split('-').map(Number);
      
      if (this.targetingMode) {
        this.confirmTargetedAction();
      } else {
        // Show context menu or quick action selection
        this.showQuickActionMenu(x, y);
      }
    }
  }

  /**
   * Handle quick movement to clicked position
   */
  private handleQuickMove(x: number, y: number): void {
    const dx = x - this.currentPlayerPosition.x;
    const dy = y - this.currentPlayerPosition.y;
    
    // Only allow movement to adjacent cells
    if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && (dx !== 0 || dy !== 0)) {
      this.handleMovement(dx, dy);
    }
  }

  /**
   * Show quick action menu
   */
  private showQuickActionMenu(x: number, y: number): void {
    // Implementation would show a context menu with available actions
    console.log(`Quick action menu for position (${x}, ${y})`);
  }

  /**
   * Quick target selection for abilities
   */
  private quickTargetSelect(index: number): void {
    // Implementation would select the nth visible target
    console.log(`Quick target select: ${index}`);
  }

  /**
   * Toggle action selector visibility
   */
  private toggleActionSelector(): void {
    // Implementation would toggle the action selector panel
    console.log('Toggle action selector');
  }

  /**
   * Confirm current action
   */
  private confirmAction(): void {
    if (this.targetingMode) {
      this.confirmTargetedAction();
    } else {
      // Confirm action in action selector
      const confirmButton = document.getElementById('confirm-action') as HTMLButtonElement;
      if (confirmButton && !confirmButton.disabled) {
        confirmButton.click();
      }
    }
  }

  /**
   * Cancel current action
   */
  private cancelAction(): void {
    if (this.targetingMode) {
      this.exitTargetingMode();
      this.showMessage("Targeting cancelled");
    } else {
      // Cancel action in action selector
      this.actionSelector.setEnabled(this.apInterface.isCurrentPlayerTurn());
    }
  }

  /**
   * Center view on current player
   */
  private centerView(): void {
    // Implementation would center the view on the current player
    console.log('Center view on player');
  }

  /**
   * Show inventory
   */
  private showInventory(): void {
    console.log('Show inventory');
  }

  /**
   * Show game log
   */
  private showGameLog(): void {
    console.log('Show game log');
  }

  /**
   * Show map
   */
  private showMap(): void {
    console.log('Show full map');
  }

  /**
   * Show help
   */
  private showHelp(): void {
    const helpText = `
AP System Controls:
Movement: Arrow keys or WASD
Diagonal: Q/E (up), Z/X (down)
Attack: Spacebar or F
Defend: G
Rest/End Turn: R or Ctrl+Enter
Abilities: 1-9 (quick shortcuts)
Targeting: T (enter mode), Enter (confirm), Esc (cancel)
UI: Tab (toggle panels), I (inventory), H (help)
Chat: Y, Tactical signals: U (retreat), O (advance)
    `;
    this.showMessage(helpText);
  }

  /**
   * Open chat
   */
  private openChat(): void {
    const message = prompt('Enter chat message:');
    if (message && message.trim()) {
      this.networkClient.sendChatMessage(message.trim());
    }
  }

  /**
   * Send tactical signal
   */
  private sendTacticalSignal(type: string): void {
    this.networkClient.sendTacticalSignal(type, {}, true);
    this.showMessage(`Tactical signal sent: ${type}`);
  }

  /**
   * Debug: Show game state
   */
  private debugShowGameState(): void {
    if (process.env.NODE_ENV === 'development') {
      this.networkClient.requestGameState();
      console.log('Requested game state');
    }
  }

  /**
   * Debug: Toggle god mode
   */
  private debugToggleGodMode(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('God mode toggled (debug only)');
    }
  }

  /**
   * Debug: Add AP
   */
  private debugAddAP(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('Debug AP added');
    }
  }

  /**
   * Show message to player
   */
  private showMessage(message: string): void {
    // This would typically show a message in the UI
    console.log(`Message: ${message}`);
    
    // You could also trigger a UI notification
    const messageEvent = new CustomEvent('gameMessage', { 
      detail: { message, type: 'info' } 
    });
    document.dispatchEvent(messageEvent);
  }

  /**
   * Update current player position
   */
  public updatePlayerPosition(position: Position): void {
    this.currentPlayerPosition = position;
  }

  /**
   * Enable or disable input handling
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    if (!enabled) {
      this.exitTargetingMode();
    }
  }

  /**
   * Check if input handler is enabled
   */
  public isInputEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Get current input state
   */
  public getInputState(): {
    enabled: boolean;
    targetingMode: boolean;
    currentPosition: Position;
    targetPosition: Position | null;
  } {
    return {
      enabled: this.isEnabled,
      targetingMode: this.targetingMode,
      currentPosition: this.currentPlayerPosition,
      targetPosition: this.targetPosition
    };
  }

  /**
   * Cleanup input handler
   */
  public cleanup(): void {
    this.exitTargetingMode();
    this.setEnabled(false);
    
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('keyup', this.handleKeyUp.bind(this));
    document.removeEventListener('click', this.handleClick.bind(this));
    document.removeEventListener('contextmenu', this.handleRightClick.bind(this));
  }
}