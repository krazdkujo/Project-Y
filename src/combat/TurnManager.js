/**
 * Turn Management System
 * Handles turn order, initiative, and turn progression
 */

class TurnManager {
  constructor(gameState, gameEvents) {
    this.gameState = gameState;
    this.events = gameEvents;
    
    // Subscribe to events
    this.events.on('combat:started', this.handleCombatStarted.bind(this));
    this.events.on('player:killed', this.handleEntityKilled.bind(this));
    this.events.on('enemy:killed', this.handleEntityKilled.bind(this));
  }

  handleCombatStarted({ players, enemies }) {
    this.initializeTurnOrder(players, enemies);
  }

  handleEntityKilled({ playerId, enemyId }) {
    const entityId = playerId || enemyId;
    this.removeFromTurnOrder(entityId);
  }

  // Initialize turn order based on initiative
  initializeTurnOrder(players, enemies) {
    const allEntities = [];
    
    // Add players to initiative
    players.forEach(player => {
      if (player.alive) {
        const initiative = this.rollInitiative(player);
        allEntities.push({
          id: player.id,
          initiative,
          type: 'player'
        });
      }
    });

    // Add enemies to initiative
    enemies.forEach(enemy => {
      if (enemy.alive) {
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
    
    // Set turn order in game state
    this.gameState.setTurnOrder(allEntities);
    
    // Start first turn
    this.startCurrentTurn();
    
    // Log initiative order
    const initiativeList = allEntities
      .map(entity => `${entity.id}(${entity.initiative})`)
      .join(', ');
    this.gameState.addCombatLog(`Initiative order: ${initiativeList}`);
  }

  rollInitiative(entity) {
    const baseRoll = Math.floor(Math.random() * 20) + 1; // d20
    const initiativeBonus = entity.initiative || 0;
    const floorBonus = Math.floor((this.gameState.currentFloor - 1) * 2);
    
    return baseRoll + initiativeBonus + floorBonus;
  }

  startCurrentTurn() {
    const currentTurn = this.gameState.getCurrentTurn();
    if (!currentTurn) {
      return this.endCombat('No valid turns remaining');
    }

    // Reset AP for current entity
    if (currentTurn.type === 'player') {
      const player = this.gameState.getPlayer(currentTurn.id);
      if (player && player.alive) {
        player.ap = player.maxAP;
        this.gameState.addCombatLog(`${currentTurn.id}'s turn begins (${player.ap} AP)`);
        
        // Emit turn started event
        this.events.emit('turn:started', {
          entityId: currentTurn.id,
          entityType: 'player',
          ap: player.ap
        });
      } else {
        // Player dead, skip turn
        return this.nextTurn();
      }
    } else if (currentTurn.type === 'enemy') {
      const enemies = this.gameState.getCurrentEnemies();
      const enemy = enemies.get(currentTurn.id);
      
      if (enemy && enemy.alive) {
        enemy.ap = enemy.maxAP;
        this.gameState.addCombatLog(`${currentTurn.id}'s turn begins`);
        
        // Emit turn started event
        this.events.emit('turn:started', {
          entityId: currentTurn.id,
          entityType: 'enemy',
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
      this.events.emit('turn:ended', {
        entityId: previousTurn.id,
        entityType: previousTurn.type
      });
    }

    // Check combat end conditions
    const alivePlayers = this.gameState.getAlivePlayers().length;
    const aliveEnemies = Array.from(this.gameState.getCurrentEnemies().values())
      .filter(e => e.alive).length;

    if (alivePlayers === 0) {
      return this.endCombat('All players defeated');
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
    const enemies = this.gameState.getCurrentEnemies();
    const enemy = enemies.get(enemyId);
    
    if (!enemy || !enemy.alive) {
      return this.nextTurn();
    }

    // Find closest living player
    const alivePlayers = this.gameState.getAlivePlayers();
    if (alivePlayers.length === 0) {
      return this.nextTurn();
    }

    let closestPlayer = null;
    let closestDistance = Infinity;

    alivePlayers.forEach(player => {
      const distance = Math.abs(enemy.x - player.x) + Math.abs(enemy.y - player.y);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPlayer = player;
      }
    });

    // Enemy AI behavior
    if (closestDistance <= 1 && enemy.ap >= 1) {
      // Attack if adjacent
      this.executeEnemyAttack(enemy, closestPlayer);
    } else if (enemy.ap >= 1) {
      // Move towards player
      this.executeEnemyMovement(enemy, closestPlayer);
    } else {
      // No AP left, end turn
      this.gameState.addCombatLog(`${enemyId} has no AP remaining`);
    }

    // Continue enemy actions or end turn
    setTimeout(() => {
      if (enemy.ap > 0 && enemy.alive) {
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

    const message = `${enemy.id} attacks ${target.id} for ${damage} damage!`;
    this.gameState.addCombatLog(message);

    // Emit attack event
    this.events.emitSkillUsed(enemy.id, 'attack', target.id, damage, 0);

    // Check if player died
    if (target.health <= 0) {
      target.alive = false;
      this.gameState.addCombatLog(`${target.id} defeated!`);
      this.events.emit('player:killed', { playerId: target.id, killer: enemy.id });
    }
  }

  executeEnemyMovement(enemy, target) {
    const dx = Math.sign(target.x - enemy.x);
    const dy = Math.sign(target.y - enemy.y);

    const newX = enemy.x + (Math.abs(dx) > Math.abs(dy) ? dx : 0);
    const newY = enemy.y + (Math.abs(dx) <= Math.abs(dy) ? dy : 0);

    // Check if position is valid
    const template = this.gameState.getCurrentTemplate 
      ? this.gameState.getCurrentTemplate(this.gameState.currentRoom) 
      : null;

    if (this.gameState.isValidPosition(newX, newY, template)) {
      const oldPos = { x: enemy.x, y: enemy.y };
      enemy.x = newX;
      enemy.y = newY;
      enemy.ap -= 1;

      this.gameState.addCombatLog(`${enemy.id} moves to (${newX},${newY})`);
      
      // Emit movement event
      this.events.emit('enemy:moved', {
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
    this.gameState.setPhase('exploration');
    this.gameState.setTurnOrder([]);
    this.gameState.addCombatLog(`Combat ended: ${reason}`);

    // Emit combat ended event
    this.events.emit('combat:ended', { reason });
  }

  removeFromTurnOrder(entityId) {
    const currentOrder = this.gameState.turnOrder;
    const newOrder = currentOrder.filter(turn => turn.id !== entityId);
    
    // Adjust current turn index if needed
    if (this.gameState.currentTurnIndex >= newOrder.length) {
      this.gameState.currentTurnIndex = 0;
    }
    
    this.gameState.turnOrder = newOrder;
  }

  // Force end current turn
  endTurn(playerId) {
    const currentTurn = this.gameState.getCurrentTurn();
    
    if (!currentTurn || currentTurn.id !== playerId || currentTurn.type !== 'player') {
      return { success: false, reason: 'Not your turn' };
    }

    this.gameState.addCombatLog(`${playerId} ends their turn`);
    this.nextTurn();
    
    return { success: true, message: 'Turn ended' };
  }

  getCurrentTurnInfo() {
    return {
      currentTurn: this.gameState.getCurrentTurn(),
      turnOrder: this.gameState.turnOrder,
      gamePhase: this.gameState.gamePhase
    };
  }
}

module.exports = TurnManager;