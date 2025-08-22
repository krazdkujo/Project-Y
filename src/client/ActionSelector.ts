import { APAbility, FreeAction } from '../shared/types';
import { BASIC_AP_ABILITIES, MASTER_AP_ABILITIES, LEGENDARY_AP_ABILITIES, FREE_ACTIONS } from '../shared/constants';

/**
 * Action selection interface for Free Actions vs AP Abilities
 * Handles UI for selecting and executing different types of actions
 */
export class ActionSelector {
  private currentAP = 0;
  private isEnabled = false;
  private selectedActionType: 'FREE' | 'AP' | null = null;
  private selectedAction: any = null;
  
  // Callbacks
  private onActionSelectedCallback: ((actionType: string, actionData: any) => void) | null = null;
  private onTurnEndCallback: (() => void) | null = null;
  
  // UI elements
  private readonly CONTAINER_ID = 'action-selector';
  private readonly FREE_ACTIONS_ID = 'free-actions';
  private readonly AP_ABILITIES_ID = 'ap-abilities';
  private readonly ACTION_PREVIEW_ID = 'action-preview';
  private readonly CONFIRM_BUTTON_ID = 'confirm-action';
  private readonly END_TURN_BUTTON_ID = 'end-turn';

  constructor() {
    this.initializeUI();
    this.setupEventHandlers();
  }

  /**
   * Initialize the action selector UI
   */
  private initializeUI(): void {
    this.createActionSelector();
    this.createFreeActionsPanel();
    this.createAPAbilitiesPanel();
    this.createActionPreview();
    this.createActionButtons();
  }

  /**
   * Create main action selector container
   */
  private createActionSelector(): void {
    const container = document.createElement('div');
    container.id = this.CONTAINER_ID;
    container.className = 'action-selector disabled';
    container.innerHTML = `
      <div class="action-selector-header">
        <h3>Action Selection</h3>
        <div class="action-type-tabs">
          <button class="tab-button active" data-type="FREE">Free Actions (0 AP)</button>
          <button class="tab-button" data-type="AP">AP Abilities</button>
        </div>
      </div>
      <div class="action-panels">
        <!-- Free actions and AP abilities panels will be inserted here -->
      </div>
    `;
    
    const uiContainer = document.getElementById('ui-container');
    if (uiContainer) {
      uiContainer.appendChild(container);
    }
  }

  /**
   * Create free actions panel
   */
  private createFreeActionsPanel(): void {
    const panel = document.createElement('div');
    panel.id = this.FREE_ACTIONS_ID;
    panel.className = 'action-panel active';
    
    panel.innerHTML = `
      <div class="action-section">
        <h4>Movement & Basic Actions</h4>
        <div class="action-grid">
          <button class="action-button free-action" data-action="MOVE">
            <div class="action-icon">⬆️</div>
            <div class="action-name">Move</div>
            <div class="action-cost">0 AP</div>
            <div class="action-desc">Move to adjacent square</div>
          </button>
          
          <button class="action-button free-action" data-action="BASIC_ATTACK">
            <div class="action-icon">⚔️</div>
            <div class="action-name">Basic Attack</div>
            <div class="action-cost">0 AP</div>
            <div class="action-desc">Standard melee attack</div>
          </button>
          
          <button class="action-button free-action" data-action="BASIC_DEFENSE">
            <div class="action-icon">🛡️</div>
            <div class="action-name">Defend</div>
            <div class="action-cost">0 AP</div>
            <div class="action-desc">+2 defense until next turn</div>
          </button>
        </div>
      </div>
    `;
    
    const panelsContainer = document.querySelector('.action-panels');
    if (panelsContainer) {
      panelsContainer.appendChild(panel);
    }
  }

  /**
   * Create AP abilities panel
   */
  private createAPAbilitiesPanel(): void {
    const panel = document.createElement('div');
    panel.id = this.AP_ABILITIES_ID;
    panel.className = 'action-panel';
    
    panel.innerHTML = `
      <div class="action-section">
        <h4>Basic Abilities (1-3 AP)</h4>
        <div class="action-grid basic-abilities">
          ${this.generateAbilityButtons(BASIC_AP_ABILITIES)}
        </div>
      </div>
      
      <div class="action-section">
        <h4>Master Abilities (4-6 AP)</h4>
        <div class="action-grid master-abilities">
          ${this.generateAbilityButtons(MASTER_AP_ABILITIES)}
        </div>
      </div>
      
      <div class="action-section">
        <h4>Legendary Powers (7-8 AP)</h4>
        <div class="action-grid legendary-abilities">
          ${this.generateAbilityButtons(LEGENDARY_AP_ABILITIES)}
        </div>
      </div>
    `;
    
    const panelsContainer = document.querySelector('.action-panels');
    if (panelsContainer) {
      panelsContainer.appendChild(panel);
    }
  }

  /**
   * Generate HTML for ability buttons
   */
  private generateAbilityButtons(abilities: readonly any[]): string {
    return abilities.map(ability => `
      <button class="action-button ap-ability" data-ability="${ability.id}" data-cost="${ability.apCost}">
        <div class="action-icon">${this.getAbilityIcon(ability.id)}</div>
        <div class="action-name">${ability.name}</div>
        <div class="action-cost">${ability.apCost} AP</div>
        <div class="action-desc">${this.getAbilityDescription(ability)}</div>
        <div class="skill-req">Req: ${ability.skillRequirement.skill} ${ability.skillRequirement.level}</div>
      </button>
    `).join('');
  }

  /**
   * Get icon for ability
   */
  private getAbilityIcon(abilityId: string): string {
    const icons: { [key: string]: string } = {
      'power_strike': '💥',
      'fireball': '🔥',
      'heal': '💚',
      'shield_bash': '🛡️',
      'quick_shot': '🏹',
      'whirlwind_attack': '🌪️',
      'meteor': '☄️',
      'mass_heal': '✨',
      'resurrection': '🔄',
      'time_stop': '⏱️'
    };
    return icons[abilityId] || '⚡';
  }

  /**
   * Get description for ability
   */
  private getAbilityDescription(ability: any): string {
    const { effect } = ability;
    
    switch (effect.type) {
      case 'damage_multiplier':
        return `${Math.round(effect.value * 100)}% damage`;
      case 'area_damage':
        return `${effect.damage} damage, ${effect.radius} radius`;
      case 'heal':
        return `Heal ${effect.amount} HP`;
      case 'multi_target_attack':
        return `Hit all ${effect.targets}`;
      case 'delayed_area_damage':
        return `${effect.damage} damage after ${effect.delay_turns} turns`;
      case 'revive_ally':
        return `Revive with ${effect.health_percentage}% HP`;
      case 'extra_turns':
        return `${effect.turns} extra turns`;
      case 'area_heal':
        return `Heal ${effect.amount} HP in area`;
      default:
        return 'Special ability';
    }
  }

  /**
   * Create action preview panel
   */
  private createActionPreview(): void {
    const preview = document.createElement('div');
    preview.id = this.ACTION_PREVIEW_ID;
    preview.className = 'action-preview';
    preview.innerHTML = `
      <div class="preview-header">Action Preview</div>
      <div class="preview-content">
        <div class="no-selection">Select an action to see details</div>
      </div>
    `;
    
    const container = document.getElementById(this.CONTAINER_ID);
    if (container) {
      container.appendChild(preview);
    }
  }

  /**
   * Create action control buttons
   */
  private createActionButtons(): void {
    const buttons = document.createElement('div');
    buttons.className = 'action-buttons';
    buttons.innerHTML = `
      <button id="${this.CONFIRM_BUTTON_ID}" class="btn btn-primary" disabled>
        Confirm Action
      </button>
      <button id="${this.END_TURN_BUTTON_ID}" class="btn btn-secondary">
        End Turn
      </button>
    `;
    
    const container = document.getElementById(this.CONTAINER_ID);
    if (container) {
      container.appendChild(buttons);
    }
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Tab switching
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      if (target.classList.contains('tab-button')) {
        this.switchTab(target.dataset.type as 'FREE' | 'AP');
      }
      
      // Free action selection
      if (target.closest('.free-action')) {
        const button = target.closest('.free-action') as HTMLElement;
        this.selectFreeAction(button.dataset.action!);
      }
      
      // AP ability selection
      if (target.closest('.ap-ability')) {
        const button = target.closest('.ap-ability') as HTMLElement;
        this.selectAPAbility(button.dataset.ability!, parseInt(button.dataset.cost!));
      }
      
      // Confirm action
      if (target.id === this.CONFIRM_BUTTON_ID) {
        this.confirmAction();
      }
      
      // End turn
      if (target.id === this.END_TURN_BUTTON_ID) {
        this.endTurn();
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (!this.isEnabled) return;
      
      switch (e.key) {
        case '1':
          this.selectFreeAction('MOVE');
          break;
        case '2':
          this.selectFreeAction('BASIC_ATTACK');
          break;
        case '3':
          this.selectFreeAction('BASIC_DEFENSE');
          break;
        case 'Enter':
          if (this.selectedAction) {
            this.confirmAction();
          }
          break;
        case 'Escape':
          this.clearSelection();
          break;
        case ' ':
          e.preventDefault();
          this.endTurn();
          break;
      }
    });
  }

  /**
   * Switch between free actions and AP abilities tabs
   */
  private switchTab(tabType: 'FREE' | 'AP'): void {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
      button.classList.remove('active');
    });
    document.querySelector(`[data-type="${tabType}"]`)?.classList.add('active');
    
    // Switch panels
    document.querySelectorAll('.action-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    
    const targetPanel = tabType === 'FREE' ? 
      document.getElementById(this.FREE_ACTIONS_ID) : 
      document.getElementById(this.AP_ABILITIES_ID);
    
    if (targetPanel) {
      targetPanel.classList.add('active');
    }
    
    // Clear selection when switching tabs
    this.clearSelection();
  }

  /**
   * Select a free action
   */
  private selectFreeAction(actionType: string): void {
    if (!this.isEnabled) return;
    
    this.selectedActionType = 'FREE';
    this.selectedAction = {
      type: actionType,
      immediate: true
    };
    
    this.updateSelection();
    this.updatePreview();
  }

  /**
   * Select an AP ability
   */
  private selectAPAbility(abilityId: string, apCost: number): void {
    if (!this.isEnabled) return;
    
    // Check if player has enough AP
    if (this.currentAP < apCost) {
      this.showError(`Not enough AP! Need ${apCost}, have ${this.currentAP}`);
      return;
    }
    
    this.selectedActionType = 'AP';
    this.selectedAction = {
      abilityId,
      apCost
    };
    
    this.updateSelection();
    this.updatePreview();
  }

  /**
   * Update visual selection
   */
  private updateSelection(): void {
    // Clear previous selections
    document.querySelectorAll('.action-button').forEach(button => {
      button.classList.remove('selected');
    });
    
    // Highlight selected action
    if (this.selectedActionType === 'FREE' && this.selectedAction) {
      const button = document.querySelector(`[data-action="${this.selectedAction.type}"]`);
      button?.classList.add('selected');
    } else if (this.selectedActionType === 'AP' && this.selectedAction) {
      const button = document.querySelector(`[data-ability="${this.selectedAction.abilityId}"]`);
      button?.classList.add('selected');
    }
    
    // Enable/disable confirm button
    const confirmButton = document.getElementById(this.CONFIRM_BUTTON_ID) as HTMLButtonElement;
    if (confirmButton) {
      confirmButton.disabled = !this.selectedAction;
    }
  }

  /**
   * Update action preview
   */
  private updatePreview(): void {
    const preview = document.getElementById(this.ACTION_PREVIEW_ID);
    if (!preview) return;
    
    const content = preview.querySelector('.preview-content');
    if (!content) return;
    
    if (!this.selectedAction) {
      content.innerHTML = '<div class="no-selection">Select an action to see details</div>';
      return;
    }
    
    if (this.selectedActionType === 'FREE') {
      const actionInfo = FREE_ACTIONS[this.selectedAction.type as keyof typeof FREE_ACTIONS];
      content.innerHTML = `
        <div class="action-details">
          <h4>${this.selectedAction.type.replace('_', ' ')}</h4>
          <div class="detail-row">
            <span class="label">Cost:</span>
            <span class="value">0 AP (Free Action)</span>
          </div>
          <div class="detail-row">
            <span class="label">Execution:</span>
            <span class="value">Immediate</span>
          </div>
          <div class="description">
            ${this.getFreeActionDescription(this.selectedAction.type)}
          </div>
        </div>
      `;
    } else if (this.selectedActionType === 'AP') {
      const ability = this.getAbilityById(this.selectedAction.abilityId);
      if (ability) {
        content.innerHTML = `
          <div class="action-details">
            <h4>${ability.name}</h4>
            <div class="detail-row">
              <span class="label">Cost:</span>
              <span class="value">${ability.apCost} AP</span>
            </div>
            <div class="detail-row">
              <span class="label">Requirement:</span>
              <span class="value">${ability.skillRequirement.skill} ${ability.skillRequirement.level}</span>
            </div>
            <div class="description">
              ${this.getAbilityDescription(ability)}
            </div>
            <div class="remaining-ap">
              After use: ${this.currentAP - ability.apCost} AP remaining
            </div>
          </div>
        `;
      }
    }
  }

  /**
   * Get free action description
   */
  private getFreeActionDescription(actionType: string): string {
    const descriptions: { [key: string]: string } = {
      'MOVE': 'Move to an adjacent square. Does not provoke attacks of opportunity.',
      'BASIC_ATTACK': 'Perform a standard attack with your equipped weapon.',
      'BASIC_DEFENSE': 'Take a defensive stance, gaining +2 defense until your next turn.'
    };
    return descriptions[actionType] || 'No description available';
  }

  /**
   * Get ability by ID
   */
  private getAbilityById(abilityId: string): any {
    const allAbilities = [...BASIC_AP_ABILITIES, ...MASTER_AP_ABILITIES, ...LEGENDARY_AP_ABILITIES];
    return allAbilities.find(ability => ability.id === abilityId);
  }

  /**
   * Confirm the selected action
   */
  private confirmAction(): void {
    if (!this.selectedAction || !this.onActionSelectedCallback) return;
    
    if (this.selectedActionType === 'FREE') {
      this.onActionSelectedCallback('FREE_ACTION', this.selectedAction);
    } else if (this.selectedActionType === 'AP') {
      this.onActionSelectedCallback('AP_ACTION', this.selectedAction);
    }
    
    // Clear selection after confirming
    this.clearSelection();
  }

  /**
   * End the current turn
   */
  private endTurn(): void {
    if (this.onTurnEndCallback) {
      this.onTurnEndCallback();
    }
  }

  /**
   * Clear current selection
   */
  private clearSelection(): void {
    this.selectedActionType = null;
    this.selectedAction = null;
    this.updateSelection();
    this.updatePreview();
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    // Create temporary error display
    const errorElement = document.createElement('div');
    errorElement.className = 'action-error';
    errorElement.textContent = message;
    
    const container = document.getElementById(this.CONTAINER_ID);
    if (container) {
      container.appendChild(errorElement);
      
      // Remove after 3 seconds
      setTimeout(() => {
        errorElement.remove();
      }, 3000);
    }
  }

  /**
   * Set callback for action selection
   */
  public onActionSelected(callback: (actionType: string, actionData: any) => void): void {
    this.onActionSelectedCallback = callback;
  }

  /**
   * Set callback for turn end
   */
  public onTurnEnd(callback: () => void): void {
    this.onTurnEndCallback = callback;
  }

  /**
   * Update available actions based on current AP
   */
  public updateAvailableActions(currentAP: number): void {
    this.currentAP = currentAP;
    
    // Update AP ability availability
    document.querySelectorAll('.ap-ability').forEach(button => {
      const element = button as HTMLElement;
      const cost = parseInt(element.dataset.cost || '0');
      
      if (cost > currentAP) {
        element.classList.add('disabled');
        element.title = `Not enough AP (need ${cost}, have ${currentAP})`;
      } else {
        element.classList.remove('disabled');
        element.title = '';
      }
    });
    
    // Clear selection if currently selected ability is no longer affordable
    if (this.selectedActionType === 'AP' && this.selectedAction && 
        this.selectedAction.apCost > currentAP) {
      this.clearSelection();
    }
  }

  /**
   * Enable or disable the action selector
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    const container = document.getElementById(this.CONTAINER_ID);
    if (container) {
      if (enabled) {
        container.classList.remove('disabled');
      } else {
        container.classList.add('disabled');
      }
    }
    
    // Clear selection when disabled
    if (!enabled) {
      this.clearSelection();
    }
  }

  /**
   * Check if action selector is enabled
   */
  public isActionSelectorEnabled(): boolean {
    return this.isEnabled;
  }
}