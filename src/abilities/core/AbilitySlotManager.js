/**
 * Ability Slot Manager
 * Manages the 9 active + 5 passive ability slotting system
 * Handles slot assignment, validation, and swapping mechanics
 */

class AbilitySlotManager {
  constructor(eventSystem) {
    this.events = eventSystem;
    
    // Slot configuration
    this.MAX_ACTIVE_SLOTS = 9;   // Hotkeys 1-9
    this.MAX_PASSIVE_SLOTS = 5;  // Always-active bonuses
    
    // Default empty slot structure
    this.emptySlots = {
      active: new Array(this.MAX_ACTIVE_SLOTS).fill(null),
      passive: new Array(this.MAX_PASSIVE_SLOTS).fill(null)
    };
  }

  /**
   * Initialize slots for a character or entity
   */
  initializeSlots(entity) {
    if (!entity.abilitySlots) {
      entity.abilitySlots = {
        active: [...this.emptySlots.active],
        passive: [...this.emptySlots.passive],
        lastSwapTime: null,
        swapCooldown: 0
      };
    }
    return entity.abilitySlots;
  }

  /**
   * Slot an ability into an active slot (1-9)
   */
  slotActiveAbility(entity, abilityKey, slotIndex) {
    const slots = this.initializeSlots(entity);
    
    // Validate slot index
    if (slotIndex < 0 || slotIndex >= this.MAX_ACTIVE_SLOTS) {
      return { success: false, reason: `Invalid slot index: ${slotIndex}. Must be 0-${this.MAX_ACTIVE_SLOTS - 1}` };
    }

    // Check if ability is active type
    // This will be validated by AbilityRegistry when we create it
    
    // Check if we can swap (not in combat, cooldown expired)
    const canSwap = this.canSwapAbilities(entity);
    if (!canSwap.canSwap) {
      return { success: false, reason: canSwap.reason };
    }

    // Remove ability from other slots if already slotted
    this.removeAbilityFromSlots(entity, abilityKey);
    
    // Slot the ability
    const oldAbility = slots.active[slotIndex];
    slots.active[slotIndex] = abilityKey;
    slots.lastSwapTime = Date.now();
    
    // Emit event
    this.events.emit('ABILITY_SLOTTED', {
      entityId: entity.id,
      abilityKey: abilityKey,
      slotType: 'active',
      slotIndex: slotIndex,
      replacedAbility: oldAbility
    });

    return { 
      success: true, 
      slotIndex: slotIndex, 
      replacedAbility: oldAbility 
    };
  }

  /**
   * Slot an ability into a passive slot (0-4)
   */
  slotPassiveAbility(entity, abilityKey, slotIndex) {
    const slots = this.initializeSlots(entity);
    
    // Validate slot index
    if (slotIndex < 0 || slotIndex >= this.MAX_PASSIVE_SLOTS) {
      return { success: false, reason: `Invalid slot index: ${slotIndex}. Must be 0-${this.MAX_PASSIVE_SLOTS - 1}` };
    }

    // Check if we can swap
    const canSwap = this.canSwapAbilities(entity);
    if (!canSwap.canSwap) {
      return { success: false, reason: canSwap.reason };
    }

    // Remove ability from other slots if already slotted
    this.removeAbilityFromSlots(entity, abilityKey);
    
    // Slot the ability
    const oldAbility = slots.passive[slotIndex];
    slots.passive[slotIndex] = abilityKey;
    slots.lastSwapTime = Date.now();
    
    // Emit event
    this.events.emit('ABILITY_SLOTTED', {
      entityId: entity.id,
      abilityKey: abilityKey,
      slotType: 'passive',
      slotIndex: slotIndex,
      replacedAbility: oldAbility
    });

    return { 
      success: true, 
      slotIndex: slotIndex, 
      replacedAbility: oldAbility 
    };
  }

  /**
   * Remove an ability from a specific slot
   */
  unslotAbility(entity, slotType, slotIndex) {
    const slots = this.initializeSlots(entity);
    
    if (slotType === 'active') {
      if (slotIndex < 0 || slotIndex >= this.MAX_ACTIVE_SLOTS) {
        return { success: false, reason: 'Invalid active slot index' };
      }
      
      const removedAbility = slots.active[slotIndex];
      slots.active[slotIndex] = null;
      slots.lastSwapTime = Date.now();
      
      this.events.emit('ABILITY_UNSLOTTED', {
        entityId: entity.id,
        abilityKey: removedAbility,
        slotType: 'active',
        slotIndex: slotIndex
      });
      
      return { success: true, removedAbility: removedAbility };
    }
    
    if (slotType === 'passive') {
      if (slotIndex < 0 || slotIndex >= this.MAX_PASSIVE_SLOTS) {
        return { success: false, reason: 'Invalid passive slot index' };
      }
      
      const removedAbility = slots.passive[slotIndex];
      slots.passive[slotIndex] = null;
      slots.lastSwapTime = Date.now();
      
      this.events.emit('ABILITY_UNSLOTTED', {
        entityId: entity.id,
        abilityKey: removedAbility,
        slotType: 'passive',
        slotIndex: slotIndex
      });
      
      return { success: true, removedAbility: removedAbility };
    }
    
    return { success: false, reason: 'Invalid slot type' };
  }

  /**
   * Remove an ability from all slots where it appears
   */
  removeAbilityFromSlots(entity, abilityKey) {
    const slots = this.initializeSlots(entity);
    let removed = false;
    
    // Remove from active slots
    for (let i = 0; i < slots.active.length; i++) {
      if (slots.active[i] === abilityKey) {
        slots.active[i] = null;
        removed = true;
      }
    }
    
    // Remove from passive slots
    for (let i = 0; i < slots.passive.length; i++) {
      if (slots.passive[i] === abilityKey) {
        slots.passive[i] = null;
        removed = true;
      }
    }
    
    return removed;
  }

  /**
   * Get slotted active abilities (for hotkeys 1-9)
   */
  getActiveAbilities(entity) {
    const slots = this.initializeSlots(entity);
    return slots.active.map((abilityKey, index) => ({
      slotIndex: index,
      hotkey: index + 1, // 1-9
      abilityKey: abilityKey
    })).filter(slot => slot.abilityKey !== null);
  }

  /**
   * Get slotted passive abilities (always active)
   */
  getPassiveAbilities(entity) {
    const slots = this.initializeSlots(entity);
    return slots.passive.map((abilityKey, index) => ({
      slotIndex: index,
      abilityKey: abilityKey
    })).filter(slot => slot.abilityKey !== null);
  }

  /**
   * Get ability by hotkey number (1-9)
   */
  getAbilityByHotkey(entity, hotkey) {
    if (hotkey < 1 || hotkey > 9) {
      return null;
    }
    
    const slots = this.initializeSlots(entity);
    return slots.active[hotkey - 1];
  }

  /**
   * Check if an ability is currently slotted
   */
  isAbilitySlotted(entity, abilityKey) {
    const slots = this.initializeSlots(entity);
    
    const inActive = slots.active.includes(abilityKey);
    const inPassive = slots.passive.includes(abilityKey);
    
    return {
      isSlotted: inActive || inPassive,
      inActive: inActive,
      inPassive: inPassive,
      activeSlot: inActive ? slots.active.indexOf(abilityKey) : -1,
      passiveSlot: inPassive ? slots.passive.indexOf(abilityKey) : -1
    };
  }

  /**
   * Check if entity can swap abilities (not in combat, cooldown expired)
   */
  canSwapAbilities(entity) {
    // Check if in combat
    if (entity.inCombat || (entity.location && entity.location.type === 'combat')) {
      return { canSwap: false, reason: 'Cannot change abilities during combat' };
    }
    
    const slots = this.initializeSlots(entity);
    
    // Check swap cooldown (prevent spam)
    if (slots.swapCooldown > 0) {
      return { canSwap: false, reason: `Ability swap on cooldown: ${slots.swapCooldown}s remaining` };
    }
    
    return { canSwap: true };
  }

  /**
   * Update swap cooldown (call each second)
   */
  updateSwapCooldown(entity) {
    const slots = this.initializeSlots(entity);
    if (slots.swapCooldown > 0) {
      slots.swapCooldown = Math.max(0, slots.swapCooldown - 1);
    }
  }

  /**
   * Get available slot counts
   */
  getSlotInfo(entity) {
    const slots = this.initializeSlots(entity);
    
    const activeUsed = slots.active.filter(slot => slot !== null).length;
    const passiveUsed = slots.passive.filter(slot => slot !== null).length;
    
    return {
      active: {
        used: activeUsed,
        available: this.MAX_ACTIVE_SLOTS - activeUsed,
        max: this.MAX_ACTIVE_SLOTS,
        slots: slots.active
      },
      passive: {
        used: passiveUsed,
        available: this.MAX_PASSIVE_SLOTS - passiveUsed,
        max: this.MAX_PASSIVE_SLOTS,
        slots: slots.passive
      }
    };
  }

  /**
   * Auto-slot abilities for enemies based on their tier and role
   */
  autoSlotEnemyAbilities(enemy, availableAbilities, enemyRole = 'balanced') {
    const slots = this.initializeSlots(enemy);
    
    // Determine slot limits based on enemy tier
    const tier = enemy.tier || 1;
    let activeSlots, passiveSlots;
    
    switch (tier) {
      case 1:
        activeSlots = 3; passiveSlots = 1;
        break;
      case 2:
        activeSlots = 4; passiveSlots = 2;
        break;
      case 3:
        activeSlots = 5; passiveSlots = 2;
        break;
      case 4:
        activeSlots = 6; passiveSlots = 3;
        break;
      case 5:
      default:
        activeSlots = 9; passiveSlots = 5;
        break;
    }
    
    // Filter abilities by type
    const activeAbilities = availableAbilities.filter(a => a.type === 'active');
    const passiveAbilities = availableAbilities.filter(a => a.type === 'passive');
    
    // Role-based ability priority
    let abilityPriority;
    switch (enemyRole) {
      case 'tank':
        abilityPriority = ['defensive', 'combat', 'utility'];
        break;
      case 'dps':
        abilityPriority = ['combat', 'offensive', 'utility'];
        break;
      case 'caster':
        abilityPriority = ['magic', 'utility', 'defensive'];
        break;
      case 'support':
        abilityPriority = ['utility', 'healing', 'defensive'];
        break;
      default: // balanced
        abilityPriority = ['combat', 'defensive', 'utility', 'magic'];
    }
    
    // Sort abilities by priority and effectiveness
    const sortByPriority = (abilities) => {
      return abilities.sort((a, b) => {
        const aPriority = abilityPriority.indexOf(a.category) !== -1 
          ? abilityPriority.indexOf(a.category) 
          : 999;
        const bPriority = abilityPriority.indexOf(b.category) !== -1 
          ? abilityPriority.indexOf(b.category) 
          : 999;
        
        return aPriority - bPriority;
      });
    };
    
    // Slot active abilities
    const sortedActiveAbilities = sortByPriority(activeAbilities);
    for (let i = 0; i < Math.min(activeSlots, sortedActiveAbilities.length); i++) {
      slots.active[i] = sortedActiveAbilities[i].key;
    }
    
    // Slot passive abilities
    const sortedPassiveAbilities = sortByPriority(passiveAbilities);
    for (let i = 0; i < Math.min(passiveSlots, sortedPassiveAbilities.length); i++) {
      slots.passive[i] = sortedPassiveAbilities[i].key;
    }
    
    // Emit event
    this.events.emit('ENEMY_ABILITIES_AUTO_SLOTTED', {
      enemyId: enemy.id,
      tier: tier,
      role: enemyRole,
      activeSlotted: activeSlots,
      passiveSlotted: passiveSlots
    });
    
    return slots;
  }

  /**
   * Clear all slots for an entity
   */
  clearAllSlots(entity) {
    const slots = this.initializeSlots(entity);
    slots.active.fill(null);
    slots.passive.fill(null);
    slots.lastSwapTime = Date.now();
    
    this.events.emit('ALL_ABILITIES_UNSLOTTED', {
      entityId: entity.id
    });
    
    return { success: true };
  }
}

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AbilitySlotManager;
} else {
  window.AbilitySlotManager = AbilitySlotManager;
}