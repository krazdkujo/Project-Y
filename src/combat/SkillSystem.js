/**
 * Skills and Abilities System
 * Handles skill definitions, validation, and execution
 */

class SkillSystem {
  constructor(gameEvents) {
    this.events = gameEvents;
    
    this.skills = {
      move: { 
        name: 'Move', 
        movementRange: 0, 
        range: 0, 
        cost: 0, 
        description: 'Move up to your movement distance', 
        type: 'movement' 
      },
      attack: { 
        name: 'Basic Attack', 
        damage: [2, 4], 
        range: 1, 
        cost: 0, 
        description: 'Simple melee attack' 
      },
      power_attack: { 
        name: 'Power Attack', 
        damage: [3, 6], 
        range: 1, 
        cost: 1, 
        description: 'Strong attack, costs 1 AP' 
      },
      heal: { 
        name: 'Heal', 
        healing: [3, 6], 
        range: 0, 
        cost: 2, 
        description: 'Heal yourself, costs 2 AP' 
      },
      fireball: { 
        name: 'Fireball', 
        damage: [4, 8], 
        range: 3, 
        cost: 3, 
        description: 'Ranged fire attack, costs 3 AP' 
      }
    };
  }

  getSkill(skillId) {
    return this.skills[skillId];
  }

  getAllSkills() {
    return { ...this.skills };
  }

  // Validate if player can use skill
  canUseSkill(player, skillId, targetId, targetPosition, gameState) {
    const skill = this.getSkill(skillId);
    if (!skill) {
      return { valid: false, reason: 'Skill not found' };
    }

    // Check AP cost
    if (player.ap < skill.cost) {
      return { valid: false, reason: `Not enough AP. Need ${skill.cost}, have ${player.ap}` };
    }

    // Handle movement skill
    if (skill.type === 'movement') {
      return this.validateMovement(player, targetPosition, gameState);
    }

    // Handle combat skills
    return this.validateCombatSkill(player, skill, targetId, targetPosition, gameState);
  }

  validateMovement(player, targetPosition, gameState) {
    if (!targetPosition) {
      return { valid: false, reason: 'Target position required for movement' };
    }

    const { x: targetX, y: targetY } = targetPosition;
    const movementRange = this.getMovementRange(player);
    const distance = Math.abs(player.x - targetX) + Math.abs(player.y - targetY);

    if (distance > movementRange) {
      return { 
        valid: false, 
        reason: `Target too far. Range: ${movementRange}, Distance: ${distance}` 
      };
    }

    // Check if position is valid (not wall, not occupied)
    const template = gameState.getCurrentTemplate 
      ? gameState.getCurrentTemplate(gameState.currentRoom) 
      : null;
      
    if (!gameState.isValidPosition(targetX, targetY, template)) {
      return { valid: false, reason: 'Invalid target position' };
    }

    return { valid: true };
  }

  validateCombatSkill(player, skill, targetId, targetPosition, gameState) {
    let target = null;
    let targetX, targetY;

    // Find target (player or enemy)
    if (targetId) {
      target = gameState.getPlayer(targetId) || gameState.getCurrentEnemies().get(targetId);
      if (!target) {
        return { valid: false, reason: 'Target not found' };
      }
      targetX = target.x;
      targetY = target.y;
    } else if (targetPosition) {
      targetX = targetPosition.x;
      targetY = targetPosition.y;
    } else if (skill.range === 0) {
      // Self-targeting skill
      targetX = player.x;
      targetY = player.y;
    } else {
      return { valid: false, reason: 'Target required' };
    }

    // Check range
    const distance = Math.abs(player.x - targetX) + Math.abs(player.y - targetY);
    if (distance > skill.range) {
      return { 
        valid: false, 
        reason: `Target too far. Range: ${skill.range}, Distance: ${distance}` 
      };
    }

    return { valid: true, target };
  }

  // Execute skill and return result
  executeSkill(playerId, skillId, targetId, targetPosition, gameState) {
    const player = gameState.getPlayer(playerId);
    if (!player || !player.alive) {
      return { success: false, reason: 'Player not found or dead' };
    }

    const validation = this.canUseSkill(player, skillId, targetId, targetPosition, gameState);
    if (!validation.valid) {
      return { success: false, reason: validation.reason };
    }

    const skill = this.getSkill(skillId);
    
    // Handle movement
    if (skill.type === 'movement') {
      return this.executeMovement(player, targetPosition, gameState);
    }

    // Handle combat skills
    return this.executeCombatSkill(player, skill, validation.target, targetPosition, gameState);
  }

  executeMovement(player, targetPosition, gameState) {
    const oldX = player.x;
    const oldY = player.y;
    const { x: newX, y: newY } = targetPosition;

    player.x = newX;
    player.y = newY;

    const message = `${player.id} moves from (${oldX},${oldY}) to (${newX},${newY})`;
    gameState.addCombatLog(message);

    // Emit event
    this.events.emitPlayerMoved(player.id, { x: oldX, y: oldY }, { x: newX, y: newY });

    return {
      success: true,
      message,
      type: 'movement',
      player: player.id,
      oldPosition: { x: oldX, y: oldY },
      newPosition: { x: newX, y: newY }
    };
  }

  executeCombatSkill(player, skill, target, targetPosition, gameState) {
    // Consume AP
    player.ap -= skill.cost;

    let result = {
      success: true,
      attacker: player.id,
      skill: skill.name,
      skillId: skill.name.toLowerCase().replace(' ', '_'),
      apCost: skill.cost
    };

    // Handle damage skills
    if (skill.damage) {
      if (!target) {
        return { success: false, reason: 'No target for damage skill' };
      }

      const damage = this.rollDamage(skill.damage);
      target.health = Math.max(0, target.health - damage);
      
      const message = `${player.id} uses ${skill.name} on ${target.id} for ${damage} damage!`;
      gameState.addCombatLog(message);

      result = {
        ...result,
        target: target.id,
        damage,
        message,
        type: 'damage'
      };

      // Check if target died
      if (target.health <= 0) {
        target.alive = false;
        const deathMessage = `${target.id} defeated!`;
        gameState.addCombatLog(deathMessage);
        
        // Emit death event
        if (gameState.getPlayer(target.id)) {
          this.events.emit('player:killed', { playerId: target.id, killer: player.id });
        } else {
          this.events.emit('enemy:killed', { enemyId: target.id, killer: player.id });
        }
      }
    }

    // Handle healing skills
    if (skill.healing) {
      const healTarget = target || player; // Self-heal if no target
      const healing = this.rollHealing(skill.healing);
      const oldHealth = healTarget.health;
      
      healTarget.health = Math.min(healTarget.maxHealth, healTarget.health + healing);
      const actualHealing = healTarget.health - oldHealth;
      
      const message = `${player.id} uses ${skill.name} and heals ${healTarget.id} for ${actualHealing}!`;
      gameState.addCombatLog(message);

      result = {
        ...result,
        target: healTarget.id,
        healing: actualHealing,
        message,
        type: 'healing'
      };

      // Emit healing event
      this.events.emit('player:healed', { 
        playerId: healTarget.id, 
        healer: player.id, 
        amount: actualHealing 
      });
    }

    // Emit skill used event
    this.events.emitSkillUsed(
      player.id, 
      result.skillId, 
      result.target, 
      result.damage, 
      result.healing
    );

    return result;
  }

  rollDamage(damageRange) {
    const [min, max] = damageRange;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  rollHealing(healingRange) {
    const [min, max] = healingRange;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getMovementRange(player) {
    const baseMovement = player.baseMovement || 3;
    const movementModifier = player.movementModifier || 0;
    return baseMovement + movementModifier;
  }

  getValidMovementPositions(player, gameState) {
    const range = this.getMovementRange(player);
    const positions = [];
    const template = gameState.getCurrentTemplate 
      ? gameState.getCurrentTemplate(gameState.currentRoom) 
      : null;

    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        const distance = Math.abs(dx) + Math.abs(dy); // Manhattan distance
        
        if (distance <= range && distance > 0) {
          const newX = player.x + dx;
          const newY = player.y + dy;
          
          if (gameState.isValidPosition(newX, newY, template)) {
            positions.push({ x: newX, y: newY, distance });
          }
        }
      }
    }

    return positions;
  }

  // Get movement range for a specific player (for client requests)
  handleGetMovementRange(playerId, gameState) {
    const player = gameState.getPlayer(playerId);
    if (!player) {
      return { success: false, reason: 'Player not found' };
    }

    const range = this.getMovementRange(player);
    const positions = this.getValidMovementPositions(player, gameState);

    return {
      success: true,
      range,
      validPositions: positions
    };
  }
}

module.exports = SkillSystem;