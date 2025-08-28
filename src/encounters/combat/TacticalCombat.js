/**
 * Tactical Combat System
 * Manages transition to tactical combat and combat room generation
 */

class TacticalCombat {
  constructor() {
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;
    this.initialized = true;
  }

  startTacticalCombat(enemies, originalEnemy) {
    // Store original enemy position for return
    const originalPosition = {
      x: originalEnemy.x,
      y: originalEnemy.y
    };
    
    // Generate combat room
    const combatRoom = this.generateCombatRoom();
    
    // Initialize combat state
    gameState.combat = {
      active: true,
      currentRoom: combatRoom,
      enemies: new Map(),
      round: 1,
      turnOrder: [],
      currentTurnIndex: 0,
      originalPosition: originalPosition
    };
    
    // Add enemies to combat state
    enemies.forEach((enemy, index) => {
      gameState.combat.enemies.set(enemy.id, enemy);
    });
    
    // Position combatants
    this.positionCombatEnemies(enemies, combatRoom);
    this.positionPartyMembers(combatRoom);
    
    // Initialize turn order
    this.initializeCombatTurnOrder();
    
    addLog('Tactical combat begins!', 'combat');
    if (window.uiManager) {
      window.uiManager.updateMapDisplay(); // This will now show the combat room
    }
  }

  generateCombatRoom() {
    // Create a tactical combat room similar to floor 1 template but smaller
    return {
      width: 15,
      height: 12,
      walls: [
        // Outer walls
        ...Array.from({ length: 15 }, (_, i) => [i, 0]),  // Top wall
        ...Array.from({ length: 15 }, (_, i) => [i, 11]), // Bottom wall
        ...Array.from({ length: 12 }, (_, i) => [0, i]),  // Left wall
        ...Array.from({ length: 12 }, (_, i) => [14, i]), // Right wall
        
        // Some interior obstacles for tactical positioning
        [3, 3], [4, 3], [3, 4],       // Small wall cluster
        [11, 7], [12, 7], [11, 8],    // Another wall cluster
        [7, 2],                        // Single wall
        [6, 9], [7, 9], [8, 9]        // Wall line
      ],
      objects: [
        { x: 5, y: 5, type: 'cover' },    // Cover object
        { x: 10, y: 3, type: 'cover' }    // Another cover object
      ]
    };
  }

  positionCombatEnemies(enemies, combatRoom) {
    // Position enemies on the right side of the room
    const enemyStartPositions = [
      { x: 12, y: 5 }, { x: 11, y: 3 }, { x: 13, y: 7 },
      { x: 10, y: 5 }, { x: 12, y: 2 }, { x: 11, y: 9 },
      { x: 13, y: 4 }, { x: 10, y: 8 }, { x: 12, y: 10 }
    ];
    
    enemies.forEach((enemy, index) => {
      const pos = enemyStartPositions[index % enemyStartPositions.length];
      enemy.x = pos.x;
      enemy.y = pos.y;
    });
  }

  positionPartyMembers(combatRoom) {
    // Position party members on the left side of the room
    const partyStartPositions = [
      { x: 2, y: 5 }, { x: 1, y: 3 }, { x: 3, y: 7 },
      { x: 2, y: 2 }, { x: 1, y: 8 }, { x: 3, y: 4 }
    ];
    
    const partyMembers = Array.from(gameState.party.members.values());
    partyMembers.forEach((member, index) => {
      const pos = partyStartPositions[index % partyStartPositions.length];
      member.x = pos.x;
      member.y = pos.y;
    });
  }

  initializeCombatTurnOrder() {
    const allCombatants = [
      ...Array.from(gameState.party.members.values()),
      ...Array.from(gameState.combat.enemies.values())
    ];
    
    // Sort by initiative (could be expanded with initiative rolls)
    allCombatants.sort((a, b) => {
      const aInit = (a.initiative || 0) + Math.random() * 20;
      const bInit = (b.initiative || 0) + Math.random() * 20;
      return bInit - aInit; // Higher initiative goes first
    });
    
    gameState.combat.turnOrder = allCombatants.filter(c => c.health > 0);
    gameState.combat.currentTurnIndex = 0;
    
    // Start first turn
    this.processCurrentTurn();
  }

  processCurrentTurn() {
    const currentCombatant = gameState.combat.turnOrder[gameState.combat.currentTurnIndex];
    
    if (!currentCombatant || currentCombatant.health <= 0) {
      this.nextTurn();
      return;
    }
    
    // Check if it's an enemy turn
    if (gameState.combat.enemies.has(currentCombatant.id)) {
      // Enemy AI turn
      setTimeout(() => {
        if (window.enemyAI) {
          window.enemyAI.processEnemyAITurn(currentCombatant);
        }
      }, 1000);
    } else {
      // Player character turn - wait for player input
      addLog(`${currentCombatant.name}'s turn`, 'combat');
      if (window.uiManager) {
        window.uiManager.updateMapDisplay();
      }
    }
  }

  nextTurn() {
    gameState.combat.currentTurnIndex++;
    
    if (gameState.combat.currentTurnIndex >= gameState.combat.turnOrder.length) {
      gameState.combat.currentTurnIndex = 0;
      gameState.combat.round++;
      addLog(`--- Round ${gameState.combat.round} ---`, 'combat');
    }
    
    // Check for combat end
    if (this.checkCombatEnd()) {
      return; // Combat ended
    }
    
    // Update map to show new current turn character
    if (window.uiManager) {
      window.uiManager.updateMapDisplay();
    }
    this.processCurrentTurn();
  }

  endCombat(victory) {
    const originalPosition = gameState.combat.originalPosition;
    
    if (victory) {
      addLog('Victory! Enemies defeated.', 'combat');
      
      // Award experience or other rewards
      const partyMembers = Array.from(gameState.party.members.values());
      partyMembers.forEach(member => {
        if (member.health > 0) {
          // Award skill experience for combat skills
          const activeCharacter = member;
          skillSystem.awardSkillUse(activeCharacter, 'melee_combat', 'moderate', 10);
          skillSystem.awardSkillUse(activeCharacter, 'tactics', 'moderate', 5);
        }
      });
    } else {
      addLog('Defeat! Party has been overwhelmed.', 'combat');
      
      // Handle party defeat consequences
      const aliveMembersCount = Array.from(gameState.party.members.values())
        .filter(m => m.health > 0).length;
      
      if (aliveMembersCount === 0) {
        addLog('PARTY WIPED! All characters lost to permadeath.', 'system');
        // Could trigger game over or return to guild
      }
    }
    
    // Clear combat state
    gameState.combat.active = false;
    gameState.combat.enemies.clear();
    gameState.combat.turnOrder = [];
    
    // Return player to original position
    if (originalPosition) {
      gameState.location.playerX = originalPosition.x;
      gameState.location.playerY = originalPosition.y;
    } else {
      gameState.location.playerX = 12;
      gameState.location.playerY = 10;
    }
    
    if (window.uiManager) {
      window.uiManager.updateMapDisplay();
    }
    addLog('Returned to exploration mode', 'system');
  }

  checkCombatEnd() {
    const aliveEnemies = Array.from(gameState.combat.enemies.values()).filter(e => e.alive && e.health > 0);
    const alivePartyMembers = Array.from(gameState.party.members.values()).filter(m => m.health > 0);
    
    if (aliveEnemies.length === 0) {
      // Victory!
      this.endCombat(true);
      return true;
    } else if (alivePartyMembers.length === 0) {
      // Defeat!
      this.endCombat(false);
      return true;
    }
    
    return false;
  }
}

// Create global instance
window.tacticalCombat = new TacticalCombat();

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TacticalCombat };
}