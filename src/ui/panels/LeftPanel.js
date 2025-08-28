/**
 * Left Panel UI
 * Manages party display, active character, and abilities
 */

class LeftPanel {
  constructor() {
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;
    this.initialized = true;
  }

  // Party Display Management
  updatePartyDisplay() {
    const partyContainer = document.getElementById('party-display');
    if (!partyContainer) return;

    let partyHTML = '<div class="status-title">Party Status</div>';
    
    if (gameState.party.members.size === 0) {
      partyHTML += '<div style="color: #888; font-style: italic;">No party members</div>';
    } else {
      Array.from(gameState.party.members.values()).forEach((character, index) => {
        partyHTML += this.createCharacterDisplay(character, 'party-member', null, this.getCharacterExtraInfo(character));
      });
    }
    
    partyContainer.innerHTML = partyHTML;
  }

  updateActiveCharacterDisplay() {
    const activeChar = this.getActiveCharacter();
    const container = document.getElementById('active-character-display');
    if (!container) return;

    if (!activeChar) {
      container.innerHTML = '<div class="status-title">Active Character</div><div style="color: #888;">None</div>';
      return;
    }

    let html = '<div class="status-title">Active Character</div>';
    html += this.createCharacterDisplay(activeChar, 'active-character', null, this.getActiveCharacterExtraInfo(activeChar));
    
    container.innerHTML = html;
  }

  updateAbilitiesDisplay() {
    const activeChar = this.getActiveCharacter();
    const container = document.getElementById('abilities-display');
    if (!container) return;

    if (!activeChar) {
      container.innerHTML = '<div class="status-title">Abilities</div><div style="color: #888;">No active character</div>';
      return;
    }

    let html = '<div class="status-title">Abilities (1-9)</div>';
    
    // Get character's slotted abilities
    const slots = abilitySlotManager.initializeSlots(activeChar);
    
    for (let i = 0; i < 9; i++) {
      const abilityKey = slots.active[i];
      const slotNum = i + 1;
      
      if (abilityKey) {
        const ability = abilityRegistry.getAbility(abilityKey);
        if (ability) {
          const apText = ability.apCost > 0 ? ` (${ability.apCost} AP)` : '';
          const available = activeChar.ap >= ability.apCost;
          html += this.createAbilitySlotHTML(slotNum, ability.name, apText, available);
        } else {
          html += this.createAbilitySlotHTML(slotNum, 'Invalid Ability', '', false);
        }
      } else {
        html += this.createAbilitySlotHTML(slotNum, 'Empty', '', false);
      }
    }
    
    container.innerHTML = html;
  }

  // Utility Functions
  createCharacterDisplay(character, className, onClick, extraInfo = '') {
    const healthPercent = (character.health / character.maxHealth) * 100;
    const apPercent = (character.ap / character.maxAP) * 100;
    
    return `
      <div class="${className}" ${onClick ? `onclick="${onClick}"` : ''} style="margin: 5px 0; padding: 5px; border: 1px solid #333;">
        <div style="font-weight: bold; color: #0f0;">${character.name}</div>
        <div style="font-size: 10px;">
          Health: ${character.health}/${character.maxHealth}
          <div class="status-bar">
            <div class="status-fill" style="width: ${healthPercent}%; background: ${healthPercent > 25 ? '#0f0' : '#f00'};"></div>
          </div>
        </div>
        <div style="font-size: 10px;">
          AP: ${character.ap}/${character.maxAP}
          <div class="status-bar">
            <div class="status-fill" style="width: ${apPercent}%; background: #00f;"></div>
          </div>
        </div>
        ${extraInfo}
      </div>
    `;
  }

  createAbilitySlotHTML(slotNum, name, apText, available = false) {
    const color = available ? '#0f0' : '#888';
    const style = available ? 'cursor: pointer;' : '';
    
    return `
      <div style="margin: 2px 0; color: ${color}; font-size: 11px; ${style}">
        ${slotNum}. ${name}${apText}
      </div>
    `;
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

  getCharacterExtraInfo(character) {
    // Could include equipment, status effects, etc.
    return '';
  }

  getActiveCharacterExtraInfo(character) {
    let extra = '';
    
    // Add turn info if in combat
    if (gameState.combat && gameState.combat.active) {
      const currentTurn = gameState.combat.turnOrder[gameState.combat.currentTurnIndex];
      const isMyTurn = currentTurn && currentTurn.id === character.id;
      extra += `<div style="font-size: 10px; color: ${isMyTurn ? '#0f0' : '#888'};">
        ${isMyTurn ? 'YOUR TURN' : 'Waiting...'}
      </div>`;
    }
    
    return extra;
  }
}

// Create global instance
window.leftPanel = new LeftPanel();

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LeftPanel };
}