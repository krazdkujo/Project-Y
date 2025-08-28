/**
 * Ability Handler
 * Manages ability activation and validation
 */

class AbilityHandler {
  constructor() {
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;
    this.initialized = true;
  }

  handleAbilityActivation(abilityNum) {
    const activeCharacter = this.getActiveCharacter();
    if (!activeCharacter) {
      addLog('No active character!', 'system');
      return;
    }

    this.executeAbility(activeCharacter, abilityNum);
  }

  executeAbility(activeCharacter, abilityNum) {
    // Get slotted ability for this hotkey (0-indexed, so subtract 1)
    const slotIndex = abilityNum - 1;
    const slots = abilitySlotManager.initializeSlots(activeCharacter);
    const abilityKey = slots.active[slotIndex];
    
    if (!abilityKey) {
      addLog(`No ability slotted in slot ${abilityNum}`, 'system');
      return;
    }

    // Use the ability through the engine
    const result = abilityEngine.useAbility(activeCharacter, abilityKey);
    
    if (result.success) {
      const ability = abilityRegistry.getAbility(abilityKey);
      addLog(`${activeCharacter.name} uses ${ability.name}!`, 'combat');
      
      // Show effects if any
      if (result.effects && Object.keys(result.effects).length > 0) {
        const effectsText = Object.entries(result.effects)
          .map(([effect, value]) => `${effect}: ${value}`)
          .join(', ');
        addLog(`Effects: ${effectsText}`, 'combat');
      }
    } else {
      const ability = abilityRegistry.getAbility(abilityKey);
      addLog(`${activeCharacter.name}'s ${ability ? ability.name : abilityKey} failed: ${result.reason}`, 'combat');
    }
    
    updateAllDisplays();
  }

  isCharactersTurn(character) {
    if (!gameState.combat || !gameState.combat.active) return true;
    
    const currentTurn = gameState.combat.turnOrder[gameState.combat.currentTurnIndex];
    return currentTurn && currentTurn.id === character.id;
  }

  getActiveCharacter() {
    if (!gameState.party || !gameState.party.members.size) return null;
    
    // In combat, use current turn character
    if (gameState.combat && gameState.combat.active) {
      const currentTurn = gameState.combat.turnOrder[gameState.combat.currentTurnIndex];
      if (currentTurn && gameState.party.members.has(currentTurn.id)) {
        return currentTurn;
      }
    }
    
    // Otherwise use first party member
    return Array.from(gameState.party.members.values())[0];
  }
}

// Create global instance
window.abilityHandler = new AbilityHandler();

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AbilityHandler };
}