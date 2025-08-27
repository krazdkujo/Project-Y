/**
 * Lockpicking User Interface
 * Handles visual feedback and player interactions for lockpicking system
 */

class LockpickingUI {
  constructor(gameState, lockpickingSystem, eventSystem) {
    this.gameState = gameState;
    this.lockpickingSystem = lockpickingSystem;
    this.events = eventSystem;
    
    this.isActive = false;
    this.currentObject = null;
    this.selectedCharacter = null;
    this.lockpickingInProgress = false;
    
    this.setupEventListeners();
  }

  /**
   * Set up event listeners for lockpicking events
   */
  setupEventListeners() {
    this.events.on('lockpicking:success', (data) => {
      this.displayLockpickResult(data, true);
    });

    this.events.on('lockpicking:failed', (data) => {
      this.displayLockpickResult(data, false);
    });

    this.events.on('lockpicking:key_used', (data) => {
      this.displayKeyUsage(data);
    });

    this.events.on('trap:triggered', (data) => {
      this.displayTrapAlert(data);
    });

    this.events.on('trap:disabled', (data) => {
      this.displayTrapDisabled(data);
    });
  }

  /**
   * Show lockpicking interface for an object
   */
  showLockpickingInterface(objectId, character) {
    const object = this.lockpickingSystem.getObject(objectId);
    if (!object) {
      this.displayMessage('Object not found', 'error');
      return false;
    }

    this.currentObject = object;
    this.selectedCharacter = character;
    this.isActive = true;

    this.renderLockpickingPanel();
    return true;
  }

  /**
   * Render the lockpicking interface panel
   */
  renderLockpickingPanel() {
    if (!this.currentObject || !this.selectedCharacter) return;

    const panel = this.createLockpickingPanel();
    this.displayPanel(panel);
  }

  /**
   * Create the lockpicking panel HTML/ASCII content
   */
  createLockpickingPanel() {
    const obj = this.currentObject;
    const char = this.selectedCharacter;
    const difficulty = this.lockpickingSystem.lockDifficulties[obj.lockDifficulty];
    
    // Calculate success chance for display
    const successChance = this.lockpickingSystem.calculateSuccessChance(char, obj, 'pick_lock');
    const timeRequired = this.lockpickingSystem.calculateTimeRequired(char, obj);
    
    // Check requirements
    const requirements = this.lockpickingSystem.checkLockpickRequirements(char, obj);
    
    const panel = {
      title: `Lockpicking: ${obj.name}`,
      content: [
        `┌─── Lockpicking Interface ───┐`,
        `│                            │`,
        `│ Target: ${obj.name.padEnd(18)} │`,
        `│ Difficulty: ${difficulty.name.padEnd(14)} │`,
        `│ Success Chance: ${Math.round(successChance * 100)}%${('').padStart(8)} │`,
        `│ Time Required: ${timeRequired}s${('').padStart(9)} │`,
        `│                            │`,
        `├─── Character Info ─────────┤`,
        `│ Lockpicking: ${String(char.skills?.lockpicking?.level || 0).padStart(2)}${('').padEnd(11)} │`,
        `│ Nimble Fingers: ${String(char.skills?.nimble_fingers?.level || 0).padStart(2)}${('').padEnd(7)} │`,
        `│ AP Available: ${String(char.ap || 0).padStart(2)}${('').padEnd(10)} │`,
        `│                            │`,
        `├─── Actions ────────────────┤`,
        requirements.canAttempt ? [
          `│ [1] Pick Lock (4 AP)       │`,
          `│ [2] Force Open             │`,
          char.skills?.trap_detection?.level > 0 ? `│ [3] Check for Traps        │` : null,
          this.hasMatchingKey(obj) ? `│ [4] Use Key                │` : null
        ].filter(Boolean) : [
          `│ Cannot attempt:            │`,
          `│ ${requirements.reason.padEnd(26)} │`
        ],
        `│ [ESC] Cancel               │`,
        `│                            │`,
        `└────────────────────────────┘`
      ].flat(),
      actions: {
        '1': () => this.attemptLockpick(),
        '2': () => this.attemptForceOpen(),
        '3': () => this.checkForTraps(),
        '4': () => this.useKeyPrompt(),
        'Escape': () => this.closeLockpickingInterface()
      }
    };

    return panel;
  }

  /**
   * Check if character has a key that works on this object
   */
  hasMatchingKey(object) {
    if (!object.keyId) return false;
    return this.gameState.lockpicking?.keysFound?.has(object.keyId) || false;
  }

  /**
   * Attempt to pick the lock
   */
  attemptLockpick() {
    if (!this.currentObject || !this.selectedCharacter) return;
    
    if (this.lockpickingInProgress) return;
    
    // Check AP cost
    if (this.selectedCharacter.ap < 4) {
      this.displayMessage('Not enough AP (need 4)', 'error');
      return;
    }

    this.lockpickingInProgress = true;
    this.displayMessage('Attempting to pick lock...', 'info');

    // Consume AP
    this.selectedCharacter.ap -= 4;

    // Attempt lockpick with slight delay for realism
    setTimeout(() => {
      const result = this.lockpickingSystem.attemptLockpick(
        this.currentObject.id, 
        this.selectedCharacter, 
        'pick_lock'
      );

      this.lockpickingInProgress = false;
      
      if (result.success) {
        this.displayMessage(result.message, 'success');
        this.closeLockpickingInterface();
        this.events.emit('ui:object_unlocked', {
          objectId: this.currentObject.id,
          method: 'lockpicked'
        });
      } else {
        this.displayMessage(result.message, 'error');
        if (result.consequences?.includes('alarm_triggered')) {
          this.displayAlarmWarning();
        }
      }
      
      // Refresh the panel to show updated info
      this.renderLockpickingPanel();
    }, 1000);
  }

  /**
   * Attempt to force open the object
   */
  attemptForceOpen() {
    if (!this.currentObject || !this.selectedCharacter) return;

    if (!this.currentObject.canBreakDown) {
      this.displayMessage('This object cannot be forced open', 'error');
      return;
    }

    // Simple strength check
    const strengthSkill = this.selectedCharacter.skills?.strength?.level || 0;
    const roll = Math.random() * 20 + 1; // D20
    const total = roll + Math.floor(strengthSkill / 3);

    if (total >= this.currentObject.breakdownDifficulty) {
      this.displayMessage(`Forced open ${this.currentObject.name}!`, 'success');
      
      // Force opening triggers traps and makes noise
      if (this.currentObject.trapped) {
        this.lockpickingSystem.triggerTrap(this.currentObject.id + '_trap', this.selectedCharacter);
      }
      
      this.lockpickingSystem.setObjectState(this.currentObject.id, {
        locked: false,
        unlockedBy: this.selectedCharacter.id,
        method: 'forced',
        damaged: true
      });

      this.closeLockpickingInterface();
      this.events.emit('ui:object_unlocked', {
        objectId: this.currentObject.id,
        method: 'forced'
      });
    } else {
      this.displayMessage('Failed to force open the object', 'error');
      
      // Consume AP for failed attempt
      this.selectedCharacter.ap = Math.max(0, this.selectedCharacter.ap - 2);
    }
  }

  /**
   * Check for traps on the object
   */
  checkForTraps() {
    if (!this.selectedCharacter.skills?.trap_detection) {
      this.displayMessage('You have no trap detection training', 'error');
      return;
    }

    const detectionSkill = this.selectedCharacter.skills.trap_detection.level;
    const roll = Math.random() * 20 + 1;
    const total = roll + detectionSkill;

    if (this.currentObject.trapped) {
      const trap = this.lockpickingSystem.getTrap(this.currentObject.id + '_trap');
      if (trap && total >= trap.detectionDifficulty) {
        this.displayMessage(`Found ${trap.name}! Be careful.`, 'warning');
        this.showTrapOptions(trap);
      } else {
        this.displayMessage('No traps detected (but there might be hidden ones)', 'info');
      }
    } else {
      this.displayMessage('No traps found on this object', 'success');
    }

    // Award small XP for attempt
    this.selectedCharacter.skills.trap_detection.xp = 
      (this.selectedCharacter.skills.trap_detection.xp || 0) + 1;
    this.selectedCharacter.skills.trap_detection.uses = 
      (this.selectedCharacter.skills.trap_detection.uses || 0) + 1;
  }

  /**
   * Show trap interaction options
   */
  showTrapOptions(trap) {
    const trapPanel = {
      title: `Trap Detected: ${trap.name}`,
      content: [
        `┌─── Trap Information ───────┐`,
        `│                            │`,
        `│ ${trap.description.padEnd(26)} │`,
        `│                            │`,
        `│ Complexity: ${String(trap.complexity).padEnd(15)} │`,
        `│ Max Damage: ${String(trap.maxDamage).padEnd(15)} │`,
        `│ Damage Type: ${trap.damageType.padEnd(14)} │`,
        `│                            │`,
        `├─── Actions ────────────────┤`,
        `│ [1] Attempt Disarm         │`,
        `│ [2] Ignore and Continue    │`,
        `│ [ESC] Back                 │`,
        `│                            │`,
        `└────────────────────────────┘`
      ],
      actions: {
        '1': () => this.attemptDisarmTrap(trap),
        '2': () => this.renderLockpickingPanel(),
        'Escape': () => this.renderLockpickingPanel()
      }
    };

    this.displayPanel(trapPanel);
  }

  /**
   * Attempt to disarm a trap
   */
  attemptDisarmTrap(trap) {
    this.displayMessage('Attempting to disarm trap...', 'info');

    const result = this.lockpickingSystem.attemptDisableTrap(
      trap.id, 
      this.selectedCharacter
    );

    if (result.success) {
      this.displayMessage(result.message, 'success');
    } else {
      this.displayMessage(result.message, 'error');
      if (result.damage > 0) {
        this.displayDamageAlert(result.damage);
      }
    }

    this.renderLockpickingPanel();
  }

  /**
   * Prompt for key usage
   */
  useKeyPrompt() {
    if (!this.currentObject.keyId) {
      this.displayMessage('This lock does not accept keys', 'error');
      return;
    }

    if (!this.hasMatchingKey(this.currentObject)) {
      this.displayMessage('You do not have the required key', 'error');
      return;
    }

    this.displayMessage('Using key...', 'info');

    const result = this.lockpickingSystem.useKey(
      this.currentObject.keyId,
      this.currentObject.id,
      this.selectedCharacter
    );

    if (result.success) {
      this.displayMessage(result.message, 'success');
      this.closeLockpickingInterface();
      this.events.emit('ui:object_unlocked', {
        objectId: this.currentObject.id,
        method: 'key'
      });
    } else {
      this.displayMessage(result.message, 'error');
    }
  }

  /**
   * Close the lockpicking interface
   */
  closeLockpickingInterface() {
    this.isActive = false;
    this.currentObject = null;
    this.selectedCharacter = null;
    this.lockpickingInProgress = false;
    this.hidePanel();
  }

  /**
   * Display lockpicking result
   */
  displayLockpickResult(data, success) {
    const message = success 
      ? `✓ Lockpicking successful! ${data.message}`
      : `✗ Lockpicking failed: ${data.message}`;
    
    this.displayMessage(message, success ? 'success' : 'error');

    if (data.consequences) {
      data.consequences.forEach(consequence => {
        if (consequence === 'lockpick_broken') {
          this.displayMessage('⚠ A lockpick was broken in the attempt', 'warning');
        } else if (consequence === 'alarm_triggered') {
          this.displayAlarmWarning();
        }
      });
    }
  }

  /**
   * Display key usage result
   */
  displayKeyUsage(data) {
    this.displayMessage(`🔑 Used key to unlock ${data.objectId}`, 'success');
  }

  /**
   * Display trap alert
   */
  displayTrapAlert(data) {
    const message = `💥 Trap triggered! Took ${data.damage} damage`;
    this.displayMessage(message, 'error');
  }

  /**
   * Display trap disabled message
   */
  displayTrapDisabled(data) {
    this.displayMessage('🛡 Trap successfully disabled', 'success');
  }

  /**
   * Display alarm warning
   */
  displayAlarmWarning() {
    this.displayMessage('🚨 ALARM! Guards may be alerted to your presence', 'warning');
  }

  /**
   * Display damage alert
   */
  displayDamageAlert(damage) {
    this.displayMessage(`💥 You take ${damage} damage!`, 'error');
  }

  /**
   * Generic message display (to be implemented by main UI system)
   */
  displayMessage(message, type = 'info') {
    // This would integrate with the main game's message system
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Emit event for main UI to handle
    this.events.emit('ui:message', {
      message,
      type,
      timestamp: Date.now(),
      source: 'lockpicking'
    });
  }

  /**
   * Display panel (to be implemented by main UI system)
   */
  displayPanel(panel) {
    // This would integrate with the main game's panel system
    console.log(panel.title);
    panel.content.forEach(line => console.log(line));
    
    // Emit event for main UI to handle
    this.events.emit('ui:show_panel', {
      panel,
      source: 'lockpicking'
    });
  }

  /**
   * Hide panel
   */
  hidePanel() {
    this.events.emit('ui:hide_panel', {
      source: 'lockpicking'
    });
  }

  /**
   * Get lockpicking statistics for display
   */
  getStatisticsDisplay() {
    const stats = this.lockpickingSystem.getStatistics();
    return {
      title: 'Lockpicking Statistics',
      content: [
        `┌─── Lockpicking Stats ──────┐`,
        `│                            │`,
        `│ Objects Unlocked: ${String(stats.totalUnlocked).padStart(2)}${('').padEnd(7)} │`,
        `│ Lockpicks Broken: ${String(stats.picklocksBroken).padStart(2)}${('').padEnd(7)} │`,
        `│ Keys Found: ${String(stats.keysFound).padStart(2)}${('').padEnd(13)} │`,
        `│ Traps Disabled: ${String(stats.trapsDisabled).padStart(2)}${('').padEnd(9)} │`,
        `│                            │`,
        `└────────────────────────────┘`
      ]
    };
  }
}

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LockpickingUI;
} else {
  window.LockpickingUI = LockpickingUI;
}