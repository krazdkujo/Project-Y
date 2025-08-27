/**
 * Lockpicking & Security System
 * Handles locked doors, chests, containers, traps, and security mechanics
 */

class LockpickingSystem {
  constructor(gameState, eventSystem) {
    this.gameState = gameState;
    this.events = eventSystem;
    
    // Add lockpicking state to gameState
    if (!this.gameState.lockpicking) {
      this.gameState.lockpicking = {
        objectStates: new Map(), // Maps objectId to state
        keysFound: new Set(),    // Collected keys
        trapStates: new Map(),   // Trap states
        picklocksBroken: 0,      // Failed attempts counter
        totalUnlocked: 0         // Success counter
      };
    }

    this.lockDifficulties = {
      1: { name: 'Simple', baseTime: 5, failurePenalty: 0.1 },
      2: { name: 'Basic', baseTime: 8, failurePenalty: 0.15 },
      3: { name: 'Complex', baseTime: 12, failurePenalty: 0.25 },
      4: { name: 'Advanced', baseTime: 18, failurePenalty: 0.35 },
      5: { name: 'Master', baseTime: 25, failurePenalty: 0.5 }
    };
  }

  /**
   * Attempt to pick a lock on an object
   */
  attemptLockpick(objectId, character, abilityKey = 'pick_lock') {
    const object = this.getObject(objectId);
    if (!object) {
      return { success: false, message: 'Object not found' };
    }

    if (!this.isObjectLocked(objectId)) {
      return { success: false, message: 'Object is not locked' };
    }

    // Check if character has required skills and tools
    const requirements = this.checkLockpickRequirements(character, object);
    if (!requirements.canAttempt) {
      return { success: false, message: requirements.reason };
    }

    // Calculate success chance based on character skills
    const successChance = this.calculateSuccessChance(character, object, abilityKey);
    const timeRequired = this.calculateTimeRequired(character, object);
    
    // Make the attempt
    const roll = Math.random();
    const success = roll <= successChance;

    if (success) {
      return this.handleSuccessfulLockpick(objectId, character, object, timeRequired);
    } else {
      return this.handleFailedLockpick(objectId, character, object, roll - successChance);
    }
  }

  /**
   * Check if character meets requirements for lockpicking attempt
   */
  checkLockpickRequirements(character, object) {
    // Check skill requirements
    const lockpickingSkill = character.skills?.lockpicking?.level || 0;
    const nimbleFingers = character.skills?.nimble_fingers?.level || 0;

    if (lockpickingSkill < 1) {
      return { canAttempt: false, reason: 'No lockpicking training' };
    }

    // Check if lock difficulty is too high
    const minSkillRequired = Math.max(1, object.lockDifficulty * 5 - 10);
    if (lockpickingSkill < minSkillRequired) {
      return { 
        canAttempt: false, 
        reason: `Lock too complex (need ${minSkillRequired} lockpicking)` 
      };
    }

    // Check for lockpicks in inventory (future enhancement)
    // For now, assume character always has basic tools

    return { canAttempt: true };
  }

  /**
   * Calculate success chance based on character skills and lock difficulty
   */
  calculateSuccessChance(character, object, abilityKey) {
    const lockpickingSkill = character.skills?.lockpicking?.level || 0;
    const nimbleFingers = character.skills?.nimble_fingers?.level || 0;
    
    // Base success rate from ability definition
    let baseRate = 0.15; // 15% base from pick_lock ability
    
    if (abilityKey === 'master_lockpick') {
      baseRate = 0.25; // 25% base for master version
    }

    // Skill scaling - 3% per lockpicking level, 2% per nimble fingers level
    const skillBonus = (lockpickingSkill * 0.03) + (nimbleFingers * 0.02);
    
    // Difficulty penalty
    const difficultyPenalty = object.lockDifficulty * 0.1;
    
    // Final chance (cap between 5% and 95%)
    const finalChance = Math.max(0.05, Math.min(0.95, 
      baseRate + skillBonus - difficultyPenalty
    ));

    return finalChance;
  }

  /**
   * Calculate time required for lockpicking attempt
   */
  calculateTimeRequired(character, object) {
    const lockpickingSkill = character.skills?.lockpicking?.level || 0;
    const difficulty = this.lockDifficulties[object.lockDifficulty];
    
    // Base time reduced by skill level
    const timeReduction = Math.floor(lockpickingSkill / 3); // 1 second per 3 levels
    const finalTime = Math.max(2, difficulty.baseTime - timeReduction);
    
    return finalTime;
  }

  /**
   * Handle successful lockpick attempt
   */
  handleSuccessfulLockpick(objectId, character, object, timeSpent) {
    // Mark object as unlocked
    this.setObjectState(objectId, { 
      locked: false, 
      unlockedBy: character.id,
      unlockTime: Date.now(),
      method: 'lockpicked'
    });

    // Award XP to relevant skills
    this.awardLockpickingXP(character, object.lockDifficulty);
    
    // Track statistics
    this.gameState.lockpicking.totalUnlocked++;

    // Emit success event
    this.events.emit('lockpicking:success', {
      objectId,
      characterId: character.id,
      difficulty: object.lockDifficulty,
      timeSpent
    });

    return {
      success: true,
      message: `Successfully picked the ${object.name || 'lock'}`,
      timeSpent,
      xpAwarded: true
    };
  }

  /**
   * Handle failed lockpick attempt
   */
  handleFailedLockpick(objectId, character, object, failureMargin) {
    const difficulty = this.lockDifficulties[object.lockDifficulty];
    let consequences = [];

    // Determine failure consequences based on margin
    if (failureMargin > 0.5) {
      // Critical failure
      if (Math.random() < difficulty.failurePenalty) {
        consequences.push('lockpick_broken');
        this.gameState.lockpicking.picklocksBroken++;
      }
      
      if (object.hasAlarm && Math.random() < 0.3) {
        consequences.push('alarm_triggered');
        this.triggerAlarm(objectId, object);
      }
    }

    // Small XP for attempt (learning from failure)
    this.awardLockpickingXP(character, 1);

    // Emit failure event
    this.events.emit('lockpicking:failed', {
      objectId,
      characterId: character.id,
      consequences,
      failureMargin
    });

    let message = `Failed to pick the ${object.name || 'lock'}`;
    if (consequences.includes('lockpick_broken')) {
      message += ' and broke a lockpick';
    }
    if (consequences.includes('alarm_triggered')) {
      message += ' and triggered an alarm!';
    }

    return {
      success: false,
      message,
      consequences,
      xpAwarded: true // Small amount for learning
    };
  }

  /**
   * Award XP for lockpicking attempts
   */
  awardLockpickingXP(character, difficulty) {
    if (!character.skills) return;

    // XP based on difficulty attempted
    const baseXP = difficulty;
    
    if (character.skills.lockpicking) {
      character.skills.lockpicking.xp = (character.skills.lockpicking.xp || 0) + baseXP;
      character.skills.lockpicking.uses = (character.skills.lockpicking.uses || 0) + 1;
    }

    if (character.skills.nimble_fingers) {
      const bonusXP = Math.ceil(baseXP / 2);
      character.skills.nimble_fingers.xp = (character.skills.nimble_fingers.xp || 0) + bonusXP;
      character.skills.nimble_fingers.uses = (character.skills.nimble_fingers.uses || 0) + 1;
    }
  }

  /**
   * Trigger security alarm
   */
  triggerAlarm(objectId, object) {
    this.events.emit('security:alarm_triggered', {
      objectId,
      location: this.gameState.location,
      alertLevel: object.alertLevel || 'low'
    });

    // Future: Spawn guards, alert nearby enemies, etc.
  }

  /**
   * Attempt to disable a trap
   */
  attemptDisableTrap(trapId, character) {
    const trap = this.getTrap(trapId);
    if (!trap) {
      return { success: false, message: 'Trap not found' };
    }

    if (trap.disabled) {
      return { success: false, message: 'Trap already disabled' };
    }

    // Calculate success based on trap complexity and character skills
    const disableSkill = character.skills?.trap_detection?.level || 0;
    const successChance = Math.max(0.1, 0.5 + (disableSkill * 0.04) - (trap.complexity * 0.1));
    
    if (Math.random() <= successChance) {
      return this.handleSuccessfulTrapDisable(trapId, character, trap);
    } else {
      return this.handleFailedTrapDisable(trapId, character, trap);
    }
  }

  /**
   * Handle successful trap disable
   */
  handleSuccessfulTrapDisable(trapId, character, trap) {
    this.setTrapState(trapId, { disabled: true, disabledBy: character.id });
    
    // Award XP
    if (character.skills?.trap_detection) {
      character.skills.trap_detection.xp = (character.skills.trap_detection.xp || 0) + trap.complexity * 2;
      character.skills.trap_detection.uses = (character.skills.trap_detection.uses || 0) + 1;
    }

    this.events.emit('trap:disabled', { trapId, characterId: character.id });

    return {
      success: true,
      message: `Successfully disabled the ${trap.name || 'trap'}`,
      xpAwarded: true
    };
  }

  /**
   * Handle failed trap disable
   */
  handleFailedTrapDisable(trapId, character, trap) {
    // Trigger the trap on failure
    const trapResult = this.triggerTrap(trapId, character);
    
    this.events.emit('trap:triggered', { 
      trapId, 
      characterId: character.id,
      damage: trapResult.damage 
    });

    return {
      success: false,
      message: `Failed to disable trap and triggered it!`,
      trapTriggered: true,
      damage: trapResult.damage
    };
  }

  /**
   * Trigger a trap
   */
  triggerTrap(trapId, character) {
    const trap = this.getTrap(trapId);
    if (!trap || trap.disabled) {
      return { damage: 0, effects: [] };
    }

    // Calculate trap damage/effects
    const damage = Math.floor(Math.random() * trap.maxDamage) + 1;
    
    // Apply damage to character
    if (character && character.health) {
      character.health = Math.max(0, character.health - damage);
    }

    // Mark trap as triggered
    this.setTrapState(trapId, { triggered: true, triggeredBy: character?.id });

    return { damage, effects: trap.effects || [] };
  }

  /**
   * Object state management
   */
  getObject(objectId) {
    // Get object from current room's object definitions
    const roomId = this.gameState.getCurrentRoomId?.() || this.gameState.location.mapId;
    return this.gameState.lockpicking?.roomObjects?.get(roomId)?.get(objectId);
  }

  getTrap(trapId) {
    const roomId = this.gameState.getCurrentRoomId?.() || this.gameState.location.mapId;
    return this.gameState.lockpicking?.roomTraps?.get(roomId)?.get(trapId);
  }

  setObjectState(objectId, state) {
    this.gameState.lockpicking.objectStates.set(objectId, {
      ...state,
      lastModified: Date.now(),
      roomId: this.gameState.location.mapId
    });
  }

  setTrapState(trapId, state) {
    this.gameState.lockpicking.trapStates.set(trapId, {
      ...state,
      lastModified: Date.now(),
      roomId: this.gameState.location.mapId
    });
  }

  isObjectLocked(objectId) {
    const state = this.gameState.lockpicking.objectStates.get(objectId);
    return state ? state.locked !== false : true; // Default to locked
  }

  isObjectTrapped(objectId) {
    const object = this.getObject(objectId);
    return object?.trapped === true;
  }

  /**
   * Use a key on an object
   */
  useKey(keyId, objectId, character) {
    const object = this.getObject(objectId);
    if (!object) {
      return { success: false, message: 'Object not found' };
    }

    if (!this.isObjectLocked(objectId)) {
      return { success: false, message: 'Object is already unlocked' };
    }

    // Check if key matches
    if (object.keyId && object.keyId !== keyId) {
      return { success: false, message: 'Key does not fit this lock' };
    }

    // Check if character has the key
    if (!this.gameState.lockpicking.keysFound.has(keyId)) {
      return { success: false, message: 'You do not have this key' };
    }

    // Unlock with key
    this.setObjectState(objectId, {
      locked: false,
      unlockedBy: character.id,
      unlockTime: Date.now(),
      method: 'key'
    });

    this.events.emit('lockpicking:key_used', {
      keyId,
      objectId,
      characterId: character.id
    });

    return {
      success: true,
      message: `Unlocked ${object.name || 'the object'} with key`,
      method: 'key'
    };
  }

  /**
   * Add a found key to the inventory
   */
  findKey(keyId, keyName) {
    this.gameState.lockpicking.keysFound.add(keyId);
    
    this.events.emit('lockpicking:key_found', {
      keyId,
      keyName,
      totalKeys: this.gameState.lockpicking.keysFound.size
    });

    return { success: true, message: `Found ${keyName || 'a key'}` };
  }

  /**
   * Get lockpicking statistics
   */
  getStatistics() {
    return {
      totalUnlocked: this.gameState.lockpicking.totalUnlocked,
      picklocksBroken: this.gameState.lockpicking.picklocksBroken,
      keysFound: this.gameState.lockpicking.keysFound.size,
      objectsUnlocked: this.gameState.lockpicking.objectStates.size,
      trapsDisabled: Array.from(this.gameState.lockpicking.trapStates.values())
        .filter(t => t.disabled).length
    };
  }
}

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LockpickingSystem;
} else {
  window.LockpickingSystem = LockpickingSystem;
}