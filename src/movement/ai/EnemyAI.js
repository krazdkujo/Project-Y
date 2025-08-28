/**
 * Enemy AI System
 * Handles enemy movement, pathfinding, and target selection
 */

class EnemyAI {
  constructor() {
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;
    this.initialized = true;
  }

  processEnemyTurn() {
    if (!gameState.currentRun.active) return;

    const enemies = gameState.getCurrentEnemies ? gameState.getCurrentEnemies() : new Map();
    const playerX = gameState.location.playerX;
    const playerY = gameState.location.playerY;

    enemies.forEach(enemy => {
      if (enemy.alive) {
        const newPos = this.calculateEnemyMove(enemy, playerX, playerY);
        
        if (newPos) {
          enemy.x = newPos.x;
          enemy.y = newPos.y;
          
          // Check if enemy reached player position (triggers combat)
          if (window.encounterManager && newPos.x === playerX && newPos.y === playerY) {
            window.encounterManager.checkForCombatTrigger(enemy);
          }
        }
      }
    });
  }

  calculateEnemyMove(enemy, playerX, playerY) {
    // Select best target (usually player, but could be party members)
    const bestTarget = this.selectBestTarget(enemy);
    if (!bestTarget) {
      return this.calculateRandomMove(enemy);
    }

    // Calculate distance to target
    const distance = Math.abs(enemy.x - bestTarget.x) + Math.abs(enemy.y - bestTarget.y);
    
    // If close enough, trigger combat instead of moving
    if (distance <= 1) {
      return null; // Don't move, will trigger combat
    }

    // Calculate best move toward target
    return this.calculateApproachMove(enemy, bestTarget);
  }

  selectBestTarget(enemy) {
    const playerX = gameState.location.playerX;
    const playerY = gameState.location.playerY;
    
    // For now, always target the player
    // This could be expanded to target specific party members based on enemy type
    return {
      x: playerX,
      y: playerY,
      name: 'Player',
      level: 1 // Could calculate average party level
    };
  }

  calculateTargetScore(enemy, target) {
    const distance = Math.abs(enemy.x - target.x) + Math.abs(enemy.y - target.y);
    
    // Basic scoring: prefer closer targets
    let score = 100 - distance * 5;
    
    // Could add more sophisticated scoring:
    // - Enemy level vs target level compatibility
    // - Target health (prefer wounded targets)
    // - Target threat level
    
    return Math.max(0, score);
  }

  calculateApproachMove(enemy, target) {
    // Try different movement strategies
    const moves = [
      this.calculateDirectApproach(enemy, target),
      this.calculateCautiousApproach(enemy, target)
    ].filter(move => move !== null);
    
    // Return best valid move
    return moves.length > 0 ? moves[0] : this.calculateRandomMove(enemy);
  }

  calculateDirectApproach(enemy, target) {
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    
    // Calculate preferred direction
    const moveX = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
    const moveY = dy === 0 ? 0 : (dy > 0 ? 1 : -1);
    
    const possibleMoves = [
      { x: enemy.x + moveX, y: enemy.y + moveY }, // Diagonal
      { x: enemy.x + moveX, y: enemy.y },         // Horizontal
      { x: enemy.x, y: enemy.y + moveY }          // Vertical
    ];

    // Find first valid move
    for (const move of possibleMoves) {
      if (window.movementValidator && window.movementValidator.canEnemyMoveTo(move.x, move.y)) {
        return move;
      }
    }

    return null;
  }

  calculateCautiousApproach(enemy, target) {
    // Get all valid moves
    const validMoves = window.movementValidator 
      ? window.movementValidator.getValidMoves(enemy.x, enemy.y, true)
      : [];
    
    if (validMoves.length === 0) return null;

    // Score moves based on getting closer to target
    const scoredMoves = validMoves.map(move => {
      const distance = Math.abs(move.x - target.x) + Math.abs(move.y - target.y);
      return { move, score: 100 - distance };
    });

    // Sort by best score and return best move
    scoredMoves.sort((a, b) => b.score - a.score);
    return scoredMoves[0].move;
  }

  calculateRandomMove(enemy) {
    const validMoves = window.movementValidator 
      ? window.movementValidator.getValidMoves(enemy.x, enemy.y, true)
      : [];
    
    if (validMoves.length === 0) return null;

    // Return random valid move
    const randomIndex = Math.floor(Math.random() * validMoves.length);
    return validMoves[randomIndex];
  }

  // Combat AI methods for tactical combat
  processEnemyAITurn(enemy) {
    if (!enemy.alive || enemy.health <= 0) {
      if (window.combatManager) {
        window.combatManager.nextTurn();
      }
      return;
    }
    
    addLog(`${enemy.name}'s turn`, 'combat');
    
    // Select best combat target
    const bestTarget = this.selectBestCombatTarget(enemy);
    if (!bestTarget) {
      addLog(`${enemy.name} has no valid targets`, 'combat');
      if (window.combatManager) {
        window.combatManager.nextTurn();
      }
      return;
    }
    
    // Determine action: move closer or attack
    const distance = Math.abs(enemy.x - bestTarget.x) + Math.abs(bestTarget.y - enemy.y);
    
    if (distance <= 1) {
      // Adjacent - attack!
      this.performEnemyAttack(enemy, bestTarget);
    } else if (distance <= 3) {
      // Close - try to get adjacent
      const moved = this.tryMoveTowardsTarget(enemy, bestTarget);
      if (!moved) {
        // Can't move, try ranged attack if available
        this.performEnemyAttack(enemy, bestTarget);
      } else {
        addLog(`${enemy.name} moves closer to ${bestTarget.name}`, 'combat');
        if (window.uiManager) {
          window.uiManager.updateMapDisplay();
        }
      }
    } else {
      // Far - move closer
      const moved = this.tryMoveTowardsTarget(enemy, bestTarget);
      if (moved) {
        addLog(`${enemy.name} advances toward ${bestTarget.name}`, 'combat');
        if (window.uiManager) {
          window.uiManager.updateMapDisplay();
        }
      } else {
        addLog(`${enemy.name} cannot move`, 'combat');
      }
    }
    
    // End enemy turn
    setTimeout(() => {
      if (window.combatManager) {
        window.combatManager.nextTurn();
      }
    }, 1500);
  }

  selectBestCombatTarget(enemy) {
    const partyMembers = Array.from(gameState.party.members.values())
      .filter(member => member.health > 0);
    
    if (partyMembers.length === 0) return null;
    
    // Score each potential target
    let bestTarget = null;
    let bestScore = -1;
    
    partyMembers.forEach(member => {
      const score = this.calculateCombatTargetScore(enemy, member);
      if (score > bestScore) {
        bestScore = score;
        bestTarget = member;
      }
    });
    
    return bestTarget;
  }

  calculateCombatTargetScore(enemy, target) {
    const distance = Math.abs(enemy.x - target.x) + Math.abs(target.y - enemy.y);
    
    let score = 0;
    
    // Distance scoring (prefer closer targets)
    const distanceScore = Math.max(0, 50 - distance * 5);
    
    // Health scoring (prefer wounded targets)  
    const healthPercent = target.health / target.maxHealth;
    const healthScore = (1 - healthPercent) * 30;
    
    // Threat scoring (could be based on target's level, equipment, etc.)
    const threatScore = 20; // Base threat
    
    // Adjacency bonus
    const adjacencyBonus = distance <= 1 ? 10 : 0;
    
    return distanceScore + healthScore + threatScore + adjacencyBonus;
  }

  tryMoveTowardsTarget(enemy, target) {
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    
    // Calculate best move direction
    const moveX = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
    const moveY = dy === 0 ? 0 : (dy > 0 ? 1 : -1);
    
    const possibleMoves = [
      { x: enemy.x + moveX, y: enemy.y + moveY }, // Diagonal
      { x: enemy.x + moveX, y: enemy.y },         // Horizontal
      { x: enemy.x, y: enemy.y + moveY }          // Vertical
    ];

    for (const move of possibleMoves) {
      if (window.movementValidator && window.movementValidator.canMoveInCombat(move.x, move.y)) {
        enemy.x = move.x;
        enemy.y = move.y;
        return true;
      }
    }
    
    return false; // Could not move
  }

  performEnemyAttack(enemy, target) {
    // Calculate attack
    const attackRoll = Math.random() * 100;
    const accuracy = enemy.accuracy || 70;
    
    if (attackRoll <= accuracy) {
      // Hit!
      const damageRange = enemy.damage || [1, 3];
      const damage = Math.floor(Math.random() * (damageRange[1] - damageRange[0] + 1)) + damageRange[0];
      
      // Apply defense
      const defense = target.defense || 0;
      const finalDamage = Math.max(1, damage - defense);
      
      target.health = Math.max(0, target.health - finalDamage);
      
      addLog(`${enemy.name} attacks ${target.name} for ${finalDamage} damage!`, 'combat');
      
      if (target.health <= 0) {
        addLog(`${target.name} has been defeated!`, 'combat');
      }
    } else {
      // Miss!
      addLog(`${enemy.name} attacks ${target.name} but misses!`, 'combat');
    }
    
    if (window.uiManager) {
      window.uiManager.updateMapDisplay();
    }
  }
}

// Create global instance
window.enemyAI = new EnemyAI();

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EnemyAI };
}