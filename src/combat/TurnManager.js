/**
 * Party-Based Turn Management System
 * Handles turn order, initiative, and turn progression for party vs enemies
 */

class TurnManager {
  constructor(gameState, eventSystem) {
    this.gameState = gameState;
    this.events = eventSystem;
    
    // Subscribe to events
    this.events.on('COMBAT_STARTED', this.handleCombatStarted.bind(this));
    this.events.on('CHARACTER_DIED', this.handleEntityKilled.bind(this));
    this.events.on('ENEMY_KILLED', this.handleEntityKilled.bind(this));
  }

  handleCombatStarted({ partyMembers, enemies }) {
    this.initializeTurnOrder(partyMembers, enemies);
  }

  handleEntityKilled({ characterId, enemyId }) {
    const entityId = characterId || enemyId;
    this.removeFromTurnOrder(entityId);
  }

  // Initialize turn order based on initiative
  initializeTurnOrder(partyMembers, enemies) {
    const allEntities = [];
    
    // Add party members to initiative
    partyMembers.forEach(character => {
      if (character.health > 0) {
        const initiative = this.rollInitiative(character);
        allEntities.push({
          id: character.id,
          initiative,
          type: 'party'
        });
      }
    });

    // Add enemies to initiative
    enemies.forEach(enemy => {
      if (enemy.health > 0) {
        const initiative = this.rollInitiative(enemy);
        allEntities.push({
          id: enemy.id,
          initiative,
          type: 'enemy'
        });
      }
    });

    // Sort by initiative (highest first)
    allEntities.sort((a, b) => b.initiative - a.initiative);
    
    // Set turn order in combat state
    this.gameState.combat.turnOrder = allEntities;
    this.gameState.combat.currentTurnIndex = 0;
    
    // Start first turn
    this.startCurrentTurn();
    
    // Log initiative order
    const initiativeList = allEntities
      .map(entity => `${entity.id}(${entity.initiative})`)
      .join(', ');
    console.log(`[COMBAT] Initiative order: ${initiativeList}`);
    
    // Emit event
    this.events.emit('TURN_ORDER_SET', { 
      turnOrder: allEntities,
      message: `Initiative order: ${initiativeList}`
    });
  }

  rollInitiative(entity) {
    const baseRoll = Math.floor(Math.random() * 20) + 1; // d20
    const initiativeBonus = entity.initiative || 0;
    const floorBonus = this.gameState.currentRun.active ? 
      Math.floor((this.gameState.currentRun.floor - 1) * 2) : 0;
    
    return baseRoll + initiativeBonus + floorBonus;
  }

  startCurrentTurn() {
    const currentTurn = this.gameState.getCurrentTurn();
    if (!currentTurn) {
      return this.endCombat('No valid turns remaining');
    }

    // Reset AP for current entity
    if (currentTurn.type === 'party') {
      const character = this.gameState.party.members.get(currentTurn.id);
      if (character && character.health > 0) {
        character.ap = character.maxAP || 3; // Default 3 AP per turn
        console.log(`[COMBAT] ${character.name || currentTurn.id}'s turn begins (${character.ap} AP)`);
        
        // Emit turn started event
        this.events.emit('TURN_STARTED', {
          entityId: currentTurn.id,
          entityType: 'party',
          character: character,
          ap: character.ap
        });
      } else {
        // Character dead, skip turn
        return this.nextTurn();
      }
    } else if (currentTurn.type === 'enemy') {
      const enemy = this.gameState.combat.enemies.get(currentTurn.id);
      
      if (enemy && enemy.health > 0) {
        enemy.ap = enemy.maxAP || 2; // Default 2 AP per turn for enemies
        console.log(`[COMBAT] ${enemy.name || currentTurn.id}'s turn begins`);
        
        // Emit turn started event
        this.events.emit('TURN_STARTED', {
          entityId: currentTurn.id,
          entityType: 'enemy',
          enemy: enemy,
          ap: enemy.ap
        });
        
        // Auto-execute enemy turn
        setTimeout(() => this.executeEnemyTurn(currentTurn.id), 1000);
      } else {
        // Enemy dead, skip turn
        return this.nextTurn();
      }
    }
  }

  nextTurn() {
    const previousTurn = this.gameState.getCurrentTurn();
    
    // Emit turn ended event
    if (previousTurn) {
      this.events.emit('TURN_ENDED', {
        entityId: previousTurn.id,
        entityType: previousTurn.type
      });
    }

    // Check combat end conditions
    const alivePartyMembers = Array.from(this.gameState.party.members.values())
      .filter(member => member.health > 0).length;
    const aliveEnemies = Array.from(this.gameState.combat.enemies.values())
      .filter(enemy => enemy.health > 0).length;

    if (alivePartyMembers === 0) {
      return this.endCombat('All party members defeated');
    }
    
    if (aliveEnemies === 0) {
      return this.endCombat('All enemies defeated');
    }

    // Move to next turn
    const nextTurn = this.gameState.nextTurn();
    if (nextTurn) {
      this.startCurrentTurn();
    } else {
      this.endCombat('No more turns available');
    }
  }

  executeEnemyTurn(enemyId) {
    const enemy = this.gameState.combat.enemies.get(enemyId);
    
    if (!enemy || enemy.health <= 0) {
      return this.nextTurn();
    }

    // Find closest living party member
    const alivePartyMembers = Array.from(this.gameState.party.members.values())
      .filter(member => member.health > 0);
    
    if (alivePartyMembers.length === 0) {
      return this.nextTurn();
    }

    let closestTarget = null;
    let closestDistance = Infinity;

    alivePartyMembers.forEach(character => {
      const distance = Math.abs(enemy.x - character.x) + Math.abs(enemy.y - character.y);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestTarget = character;
      }
    });

    // Enemy AI behavior
    if (closestDistance <= 1 && enemy.ap >= 1) {
      // Attack if adjacent
      this.executeEnemyAttack(enemy, closestTarget);
    } else if (enemy.ap >= 1) {
      // Move towards target
      this.executeEnemyMovement(enemy, closestTarget);
    } else {
      // No AP left, end turn
      console.log(`[COMBAT] ${enemyId} has no AP remaining`);
    }

    // Continue enemy actions or end turn
    setTimeout(() => {
      if (enemy.ap > 0 && enemy.health > 0) {
        this.executeEnemyTurn(enemyId); // Continue turn
      } else {
        this.nextTurn(); // End turn
      }
    }, 500);
  }

  executeEnemyAttack(enemy, target) {
    const damage = Math.floor(Math.random() * (enemy.damage[1] - enemy.damage[0] + 1)) + enemy.damage[0];
    
    target.health = Math.max(0, target.health - damage);
    enemy.ap -= 1;

    const message = `${enemy.name || enemy.id} attacks ${target.name || target.id} for ${damage} damage!`;
    console.log(`[COMBAT] ${message}`);

    // Emit attack event
    this.events.emit('DAMAGE_DEALT', {
      attackerId: enemy.id,
      targetId: target.id,
      damage: damage,
      attackerType: 'enemy',
      targetType: 'party'
    });

    // Check if character died
    if (target.health <= 0) {
      console.log(`[COMBAT] ${target.name || target.id} defeated!`);
      this.events.emit('CHARACTER_DIED', { characterId: target.id, killer: enemy.id });
    }
  }

  executeEnemyMovement(enemy, target) {
    const dx = Math.sign(target.x - enemy.x);
    const dy = Math.sign(target.y - enemy.y);

    const newX = enemy.x + (Math.abs(dx) > Math.abs(dy) ? dx : 0);
    const newY = enemy.y + (Math.abs(dx) <= Math.abs(dy) ? dy : 0);

    // Simple position validation (can be enhanced later)
    const isValidPosition = (x, y) => {
      // Basic bounds checking - assuming combat area is 20x20
      return x >= 0 && x < 20 && y >= 0 && y < 20;
    };

    if (isValidPosition(newX, newY)) {
      const oldPos = { x: enemy.x, y: enemy.y };
      enemy.x = newX;
      enemy.y = newY;
      enemy.ap -= 1;

      console.log(`[COMBAT] ${enemy.name || enemy.id} moves to (${newX},${newY})`);
      
      // Emit movement event
      this.events.emit('ENEMY_MOVED', {
        enemyId: enemy.id,
        oldPosition: oldPos,
        newPosition: { x: newX, y: newY }
      });
    } else {
      // Can't move, just wait
      enemy.ap = 0;
    }
  }

  endCombat(reason) {
    // Reset combat state
    this.gameState.combat.active = false;
    this.gameState.combat.turnOrder = [];
    this.gameState.combat.currentTurnIndex = 0;
    this.gameState.location.type = 'overworld';
    
    console.log(`[COMBAT] Combat ended: ${reason}`);

    // Emit combat ended event
    this.events.emit('COMBAT_ENDED', { reason });
  }

  removeFromTurnOrder(entityId) {
    const currentOrder = this.gameState.combat.turnOrder;
    const newOrder = currentOrder.filter(turn => turn.id !== entityId);
    
    // Adjust current turn index if needed
    if (this.gameState.combat.currentTurnIndex >= newOrder.length) {
      this.gameState.combat.currentTurnIndex = 0;
    }
    
    this.gameState.combat.turnOrder = newOrder;
  }

  // Force end current turn
  endTurn(characterId) {
    const currentTurn = this.gameState.getCurrentTurn();
    
    if (!currentTurn || currentTurn.id !== characterId) {
      return { success: false, reason: 'Not your turn' };
    }

    console.log(`[COMBAT] ${characterId} ends their turn`);
    this.nextTurn();
    
    return { success: true, message: 'Turn ended' };
  }

  getCurrentTurnInfo() {
    return {
      currentTurn: this.gameState.getCurrentTurn(),
      turnOrder: this.gameState.combat.turnOrder,
      gamePhase: this.gameState.location.type
    };
  }
}

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TurnManager;
} else {
  window.TurnManager = TurnManager;
}