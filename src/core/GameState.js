/**
 * Single-Player Game State Management
 * Handles party state, dungeon progress, and game session data
 */

class GameState {
  constructor() {
    // Party state
    this.party = {
      members: new Map(), // up to 6 characters
      formation: [], // party positioning
      sharedInventory: new Map(), // consumables, quest items
      gold: 0
    };

    // Current dungeon run state
    this.currentRun = {
      active: false,
      floor: 1,
      maxFloor: 5,
      roomsCompleted: 0,
      roomChoices: [], // available room choices for current floor
      seed: null // for consistent generation
    };

    // Current location state
    this.location = {
      type: 'guild', // 'guild', 'overworld', 'combat'
      mapId: null,
      playerX: 0,
      playerY: 0,
      mapData: null,
      viewport: {
        width: 25,
        height: 20,
        offsetX: 0,
        offsetY: 0
      }
    };

    // Combat state (for combat instances)
    this.combat = {
      active: false,
      instanceMap: null,
      turnOrder: [],
      currentTurnIndex: 0,
      enemies: new Map(),
      round: 1
    };

    // Guild base state
    this.guild = {
      level: 1,
      facilities: new Map(),
      storedCharacters: new Map(),
      itemVault: new Map(),
      upgrades: new Set()
    };

    // Meta progression
    this.playerProgress = {
      runsCompleted: 0,
      deepestFloor: 0,
      totalCharactersLost: 0,
      achievementsUnlocked: new Set(),
      charactersUnlocked: new Set()
    };

    // Game settings
    this.settings = {
      autoSave: true,
      difficulty: 'normal',
      permadeathEnabled: true,
      cloudSaveEnabled: true
    };
  }

  // Party management
  addPartyMember(character) {
    if (this.party.members.size >= 6) {
      return { success: false, reason: 'Party is full (max 6 members)' };
    }

    this.party.members.set(character.id, character);
    this.updatePartyFormation();
    return { success: true };
  }

  removePartyMember(characterId) {
    const removed = this.party.members.delete(characterId);
    if (removed) {
      this.updatePartyFormation();
    }
    return removed;
  }

  updatePartyFormation() {
    // Arrange party members in formation order
    this.party.formation = Array.from(this.party.members.keys());
  }

  // Dungeon run management
  startNewRun() {
    if (this.party.members.size === 0) {
      return { success: false, reason: 'No party members selected' };
    }

    this.currentRun = {
      active: true,
      floor: 1,
      maxFloor: 5,
      roomsCompleted: 0,
      roomChoices: [],
      seed: Date.now() // Simple seed for now
    };

    this.location = {
      type: 'overworld',
      mapId: this.generateFloorId(1),
      playerX: 12, // Center start
      playerY: 10,
      mapData: null,
      viewport: {
        width: 25,
        height: 20,
        offsetX: 0,
        offsetY: 0
      }
    };

    return { success: true, floor: 1 };
  }

  advanceFloor() {
    if (!this.currentRun.active) {
      return { success: false, reason: 'No active run' };
    }

    this.currentRun.floor++;
    this.currentRun.roomsCompleted = 0;
    
    if (this.currentRun.floor > this.currentRun.maxFloor) {
      return this.completeRun();
    }

    // Generate new floor
    this.location.mapId = this.generateFloorId(this.currentRun.floor);
    this.location.mapData = null; // Will be regenerated
    
    return { success: true, floor: this.currentRun.floor };
  }

  completeRun() {
    const completed = {
      floorsCompleted: this.currentRun.floor - 1,
      success: this.currentRun.floor > this.currentRun.maxFloor
    };

    // Update meta progression
    this.playerProgress.runsCompleted++;
    this.playerProgress.deepestFloor = Math.max(
      this.playerProgress.deepestFloor, 
      completed.floorsCompleted
    );

    // Reset run state
    this.currentRun.active = false;
    this.returnToGuild();

    return { success: true, completed };
  }

  // Location management
  returnToGuild() {
    this.location = {
      type: 'guild',
      mapId: 'guild_base',
      playerX: 15,
      playerY: 10,
      mapData: null,
      viewport: {
        width: 25,
        height: 20,
        offsetX: 0,
        offsetY: 0
      }
    };
  }

  // Combat management
  startCombat(enemies, combatMapData) {
    this.combat = {
      active: true,
      instanceMap: combatMapData,
      turnOrder: this.generateTurnOrder(enemies),
      currentTurnIndex: 0,
      enemies: new Map(enemies.map(e => [e.id, e])),
      round: 1
    };

    this.location.type = 'combat';
    return { success: true };
  }

  endCombat(victory = false) {
    const result = {
      victory,
      round: this.combat.round,
      survivors: Array.from(this.party.members.values()).filter(m => m.health > 0)
    };

    // Check for party wipe
    if (result.survivors.length === 0) {
      return this.handlePartyWipe();
    }

    // Return to overworld
    this.combat = {
      active: false,
      instanceMap: null,
      turnOrder: [],
      currentTurnIndex: 0,
      enemies: new Map(),
      round: 1
    };

    this.location.type = 'overworld';
    return { success: true, result };
  }

  handlePartyWipe() {
    // Permadeath - lose all party members
    const lostCharacters = Array.from(this.party.members.values());
    this.playerProgress.totalCharactersLost += lostCharacters.length;

    // Clear party
    this.party.members.clear();
    this.party.formation = [];

    // End run
    this.currentRun.active = false;
    this.returnToGuild();

    return { 
      success: false, 
      partyWipe: true, 
      charactersLost: lostCharacters.length 
    };
  }

  // Helper methods
  generateFloorId(floorNumber) {
    return `floor_${floorNumber}_${this.currentRun.seed}`;
  }

  generateTurnOrder(enemies) {
    const allCombatants = [
      ...Array.from(this.party.members.values()).map(m => ({...m, type: 'party'})),
      ...enemies.map(e => ({...e, type: 'enemy'}))
    ];

    // Sort by initiative (higher first)
    return allCombatants
      .sort((a, b) => (b.initiative || 0) - (a.initiative || 0))
      .filter(c => c.health > 0);
  }

  getCurrentTurn() {
    if (!this.combat.active || this.combat.turnOrder.length === 0) {
      return null;
    }
    return this.combat.turnOrder[this.combat.currentTurnIndex];
  }

  nextTurn() {
    if (!this.combat.active) return null;

    this.combat.currentTurnIndex = 
      (this.combat.currentTurnIndex + 1) % this.combat.turnOrder.length;
    
    // Check for new round
    if (this.combat.currentTurnIndex === 0) {
      this.combat.round++;
    }

    return this.getCurrentTurn();
  }

  // Save/Load state
  serialize() {
    return {
      party: {
        members: Object.fromEntries(this.party.members),
        formation: this.party.formation,
        sharedInventory: Object.fromEntries(this.party.sharedInventory),
        gold: this.party.gold
      },
      currentRun: this.currentRun,
      location: this.location,
      guild: {
        level: this.guild.level,
        facilities: Object.fromEntries(this.guild.facilities),
        storedCharacters: Object.fromEntries(this.guild.storedCharacters),
        itemVault: Object.fromEntries(this.guild.itemVault),
        upgrades: Array.from(this.guild.upgrades)
      },
      playerProgress: {
        ...this.playerProgress,
        achievementsUnlocked: Array.from(this.playerProgress.achievementsUnlocked),
        charactersUnlocked: Array.from(this.playerProgress.charactersUnlocked)
      },
      settings: this.settings,
      lastSaved: Date.now()
    };
  }

  deserialize(data) {
    // Restore party state
    this.party.members = new Map(Object.entries(data.party.members));
    this.party.formation = data.party.formation;
    this.party.sharedInventory = new Map(Object.entries(data.party.sharedInventory));
    this.party.gold = data.party.gold;

    // Restore run state
    this.currentRun = data.currentRun;
    this.location = data.location;

    // Restore guild state
    this.guild.level = data.guild.level;
    this.guild.facilities = new Map(Object.entries(data.guild.facilities));
    this.guild.storedCharacters = new Map(Object.entries(data.guild.storedCharacters));
    this.guild.itemVault = new Map(Object.entries(data.guild.itemVault));
    this.guild.upgrades = new Set(data.guild.upgrades);

    // Restore meta progression
    this.playerProgress = {
      ...data.playerProgress,
      achievementsUnlocked: new Set(data.playerProgress.achievementsUnlocked),
      charactersUnlocked: new Set(data.playerProgress.charactersUnlocked)
    };

    this.settings = data.settings;
  }
}

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameState;
} else {
  window.GameState = GameState;
}