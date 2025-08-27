/**
 * Single-Player Party-Based Combat Management System
 * Orchestrates combat initiation, coordination, and resolution for party vs enemies
 */

class CombatManager {
  constructor(gameState, eventSystem, skillSystem, turnManager) {
    this.gameState = gameState;
    this.events = eventSystem;
    this.skillSystem = skillSystem;
    this.turnManager = turnManager;

    // Subscribe to relevant events
    this.events.on('ENCOUNTER_TRIGGERED', this.handleEncounter.bind(this));
    this.events.on('ROOM_ENTERED', this.checkCombatTrigger.bind(this));
  }

  handleEncounter(encounterData) {
    if (this.gameState.combat.active) {
      return; // Already in combat
    }

    this.startCombat(encounterData.enemies, encounterData.combatMap);
  }

  checkCombatTrigger() {
    if (this.gameState.combat.active) {
      return; // Already in combat
    }

    // Check if player moved into an enemy position
    const currentRoom = this.gameState.location.mapData;
    if (currentRoom && currentRoom.enemies && currentRoom.enemies.length > 0) {
      const playerPos = { x: this.gameState.location.playerX, y: this.gameState.location.playerY };
      
      // Check if player is adjacent to any enemy
      const nearbyEnemies = currentRoom.enemies.filter(enemy => {
        const distance = Math.abs(enemy.x - playerPos.x) + Math.abs(enemy.y - playerPos.y);
        return distance <= 1 && enemy.alive;
      });

      if (nearbyEnemies.length > 0) {
        this.startCombat(nearbyEnemies);
      }
    }
  }

  startCombat(enemies, combatMapData = null) {
    // Get party members that are alive
    const partyMembers = Array.from(this.gameState.party.members.values())
      .filter(member => member.health > 0);

    if (partyMembers.length === 0) {
      return { success: false, reason: 'No living party members to fight' };
    }

    // Prepare enemies with IDs if not already set
    const preparedEnemies = enemies.map((enemy, index) => ({
      id: enemy.id || `enemy_${index}`,
      ...enemy,
      alive: true,
      ap: enemy.maxAP || 2
    }));

    // Start combat using GameState method
    const result = this.gameState.startCombat(preparedEnemies, combatMapData);
    
    if (result.success) {
      // Emit combat started event - turn manager will handle initiative
      this.events.emit('COMBAT_STARTED', { 
        partyMembers, 
        enemies: preparedEnemies 
      });
      
      // Add combat log entry
      this.addCombatMessage(`Combat begins! ${partyMembers.length} party members vs ${preparedEnemies.length} enemies`);
    }

    return result;
  }

  endCombat(victory = false) {
    const result = this.gameState.endCombat(victory);
    
    if (result.success) {
      // Emit combat ended event
      this.events.emit('COMBAT_ENDED', { 
        victory, 
        survivors: result.result.survivors.length 
      });
      
      // Add combat log entry
      const message = victory ? 
        `Victory! ${result.result.survivors.length} party members survived.` :
        'Combat ended.';
      this.addCombatMessage(message);
    } else if (result.partyWipe) {
      // Handle party wipe
      this.events.emit('PARTY_WIPE', { 
        charactersLost: result.charactersLost 
      });
      
      this.addCombatMessage(`Party wiped! ${result.charactersLost} characters lost.`);
    }

    return result;
  }

  // Handle skill usage by party member during combat
  handleSkillUsage(characterId, skillKey, targetId, targetPosition) {
    if (!this.gameState.combat.active) {
      return { success: false, reason: 'Not in combat' };
    }

    // Get the character who is using the skill
    const character = this.gameState.party.members.get(characterId);
    if (!character) {
      return { success: false, reason: 'Character not found in party' };
    }

    if (character.health <= 0) {
      return { success: false, reason: 'Character is defeated' };
    }

    // Validate it's the character's turn (if using turn-based combat)
    const currentTurn = this.gameState.getCurrentTurn();
    if (currentTurn && currentTurn.id !== characterId) {
      return { success: false, reason: 'Not this character\'s turn' };
    }

    // Use the skill system to execute the skill - awards 1 XP per use
    const result = this.skillSystem.awardSkillUse(
      character, 
      skillKey
    );

    if (result.success) {
      // Emit skill used event
      this.events.emit('ABILITY_USED', {
        characterId,
        skillKey,
        targetId,
        targetPosition,
        result
      });

      // Add to combat log
      this.addCombatMessage(`${character.name || characterId} uses ${skillKey}!`);

      // Check if combat should end
      this.checkCombatEndConditions();
    }

    return result;
  }

  checkCombatEndConditions() {
    const alivePartyMembers = Array.from(this.gameState.party.members.values())
      .filter(member => member.health > 0).length;
    
    const aliveEnemies = Array.from(this.gameState.combat.enemies.values())
      .filter(enemy => enemy.health > 0).length;

    if (alivePartyMembers === 0) {
      this.endCombat(false); // Party defeat
      return true;
    }
    
    if (aliveEnemies === 0) {
      this.endCombat(true); // Party victory
      return true;
    }

    return false;
  }

  // Handle end turn request
  handleEndTurn(characterId) {
    if (!this.gameState.combat.active) {
      return { success: false, reason: 'Not in combat' };
    }

    const result = this.turnManager.endTurn(characterId);
    
    if (result.success) {
      this.events.emit('TURN_ENDED', {
        characterId,
        message: result.message
      });
      
      this.addCombatMessage(`${characterId} ends their turn`);
    }

    return result;
  }

  // Get current combat state
  getCombatState() {
    if (!this.gameState.combat.active) {
      return { inCombat: false };
    }

    return {
      inCombat: true,
      currentTurn: this.gameState.getCurrentTurn(),
      turnOrder: this.gameState.combat.turnOrder,
      partyMembers: Object.fromEntries(this.gameState.party.members),
      enemies: Object.fromEntries(this.gameState.combat.enemies),
      round: this.gameState.combat.round,
      combatMap: this.gameState.combat.instanceMap
    };
  }

  // Handle combat actions
  handleAction(action) {
    const { type, characterId, data } = action;

    switch (type) {
      case 'useSkill':
        return this.handleSkillUsage(
          characterId,
          data.skillKey,
          data.targetId,
          data.targetPosition || { x: data.targetX, y: data.targetY }
        );

      case 'endTurn':
        return this.handleEndTurn(characterId);

      case 'getCombatState':
        return { success: true, data: this.getCombatState() };

      default:
        return { success: false, reason: `Unknown combat action type: ${type}` };
    }
  }

  // Force start combat (for testing/admin)
  forceStartCombat(testEnemies = null) {
    if (this.gameState.combat.active) {
      return { success: false, reason: 'Already in combat' };
    }

    // Create test enemies if none provided
    const enemies = testEnemies || [
      {
        id: 'test_goblin',
        name: 'Goblin',
        health: 10,
        maxHealth: 10,
        damage: [1, 4],
        initiative: 10,
        x: 5,
        y: 5
      }
    ];

    return this.startCombat(enemies);
  }

  // Force end combat (for testing/admin)
  forceEndCombat() {
    if (!this.gameState.combat.active) {
      return { success: false, reason: 'Not in combat' };
    }

    return this.endCombat(false); // End without victory
  }

  // Add combat message (helper method)
  addCombatMessage(message) {
    // For now just log to console, later this can be integrated with a combat log UI
    console.log(`[COMBAT] ${message}`);
    
    // Emit event for UI to capture
    this.events.emit('COMBAT_MESSAGE', { message, timestamp: Date.now() });
  }
}

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CombatManager;
} else {
  window.CombatManager = CombatManager;
}