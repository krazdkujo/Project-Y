/**
 * Game Manager
 * Central coordinator for game state and major game operations
 */

class GameManager {
  constructor() {
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;
    this.initialized = true;
  }

  // Character Management
  getActiveCharacter() {
    if (!window.gameState.party || !window.gameState.party.members.size) return null;
    
    // In combat, use current turn character
    if (window.gameState.combat && window.gameState.combat.active) {
      const currentTurn = window.gameState.combat.turnOrder[window.gameState.combat.currentTurnIndex];
      if (currentTurn && window.gameState.party.members.has(currentTurn.id)) {
        return currentTurn;
      }
    }
    
    // Otherwise use first party member
    return Array.from(window.gameState.party.members.values())[0];
  }

  createRandomCharacter() {
    // Generate a random name
    const randomNames = [
      'Aldric', 'Bryenna', 'Caelum', 'Dara', 'Ewan', 'Fiona', 'Gareth', 'Hilda',
      'Ivan', 'Jora', 'Kael', 'Luna', 'Magnus', 'Nora', 'Orin', 'Petra',
      'Quinn', 'Raven', 'Soren', 'Thora', 'Ulric', 'Vera', 'Wren', 'Xara',
      'Yorick', 'Zara', 'Ash', 'Blaze', 'Cole', 'Dawn', 'Echo', 'Fox'
    ];
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
    
    // Generate random character
    const randomCharacter = this.generateRandomCharacter(randomName);
    
    // Add to guild storage
    window.gameState.guild.storedCharacters.set(randomCharacter.id, randomCharacter);
    
    // Initialize abilities
    this.initializeCharacterAbilities(randomCharacter);
    
    // Update displays
    if (window.uiManager) {
      window.uiManager.updateAllDisplays();
    }
    if (window.guildManager) {
      window.guildManager.updateGuildInterface();
    }
    
    addLog(`Created random character: ${randomCharacter.name}`, 'system');
  }

  generateRandomCharacter(name) {
    // Get all available skills from the skill system
    const allSkills = Object.keys(skillSystem.skillDefinitions);
    
    // Create base character
    const character = {
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      health: 100,
      maxHealth: 100,
      ap: 3,
      maxAP: 3,
      skills: {},
      equipment: {
        weapon: null,
        armor: null,
        accessories: []
      },
      x: 12,
      y: 10
    };
    
    // Randomly allocate 25 skill points
    let remainingPoints = 25;
    const selectedSkills = [];
    
    // Pick 3-6 random skills to focus on
    const numSkills = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numSkills && remainingPoints > 0; i++) {
      const randomSkill = allSkills[Math.floor(Math.random() * allSkills.length)];
      if (!selectedSkills.includes(randomSkill)) {
        selectedSkills.push(randomSkill);
      }
    }
    
    // Distribute points among selected skills
    selectedSkills.forEach(skillKey => {
      if (remainingPoints > 0) {
        const maxPoints = Math.min(10, remainingPoints); // Cap at 10 points per skill
        const points = 1 + Math.floor(Math.random() * maxPoints);
        character.skills[skillKey] = {
          level: points,
          experience: 0,
          mastery: skillSystem.getMasteryLevel(points)
        };
        remainingPoints -= points;
      }
    });
    
    // Give remaining points to first skill
    if (remainingPoints > 0 && selectedSkills.length > 0) {
      const firstSkill = selectedSkills[0];
      character.skills[firstSkill].level += remainingPoints;
      character.skills[firstSkill].mastery = skillSystem.getMasteryLevel(character.skills[firstSkill].level);
    }
    
    return character;
  }

  initializeCharacterAbilities(character) {
    // Initialize abilities based on character's skills
    if (window.abilitySlotManager) {
      const slots = abilitySlotManager.initializeSlots(character);
      character.abilitySlots = slots.active;
    }
  }

  createCharacterFromBuilder() {
    if (!characterGenerator || !characterGenerator.currentCharacter) {
      addLog('No character data available!', 'system');
      return;
    }
    
    const character = characterGenerator.currentCharacter;
    
    // Generate unique ID
    character.id = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize abilities
    this.initializeCharacterAbilities(character);
    
    // Add to guild storage
    window.gameState.guild.storedCharacters.set(character.id, character);
    
    // Update displays
    if (window.uiManager) {
      window.uiManager.updateAllDisplays();
    }
    if (window.guildManager) {
      window.guildManager.updateGuildInterface();
    }
    
    addLog(`Created character: ${character.name}`, 'system');
  }

  // Run Management
  startNewRun() {
    if (window.gameState.party.members.size === 0) {
      addLog('You need at least one party member to start a run!', 'system');
      return;
    }
    
    const result = window.gameState.startNewRun();
    if (result.success) {
      // Enable run control buttons
      document.getElementById('start-run-btn').disabled = true;
      document.getElementById('end-run-btn').disabled = false;
      if (window.uiManager) {
        window.uiManager.updateAllDisplays();
        window.uiManager.updateMapDisplay();
      }
    } else {
      addLog(result.reason, 'system');
    }
  }

  endCurrentRun() {
    if (window.gameState.currentRun.active) {
      // Clear enemies from current run
      const enemies = window.gameState.getCurrentEnemies();
      if (enemies) {
        enemies.clear();
      }
      
      window.gameState.endRun();
      document.getElementById('start-run-btn').disabled = false;
      document.getElementById('end-run-btn').disabled = true;
      
      addLog('Dungeon run ended. Returned to Guild Base.', 'system');
      if (window.uiManager) {
        window.uiManager.updateAllDisplays();
      }
    }
  }

  // Combat Testing
  testCombat() {
    if (window.gameState.party.members.size === 0) {
      alert('You need party members to test combat! Visit the Guild Base first.');
      return;
    }

    // Create a test enemy
    const testEnemy = {
      id: 'test_enemy_' + Date.now(),
      name: 'Test Goblin',
      health: 8,
      maxHealth: 8,
      damage: [1, 4],
      defense: 1,
      accuracy: 75,
      evasion: 10,
      x: window.gameState.location.playerX + 1,
      y: window.gameState.location.playerY,
      alive: true
    };
    
    addLog('Spawning test enemy for combat...', 'system');
    
    if (window.encounterManager) {
      window.encounterManager.triggerCombatEncounter(testEnemy);
    }
  }

  // Guild Management
  addToParty(characterId) {
    if (window.gameState.party.members.size >= 6) {
      addLog('Party is full! Maximum 6 members allowed.', 'system');
      return;
    }
    
    const character = window.gameState.guild.storedCharacters.get(characterId);
    if (!character) {
      addLog('Character not found!', 'system');
      return;
    }
    
    // Add to party
    window.gameState.party.members.set(characterId, character);
    
    // Remove from guild storage
    window.gameState.guild.storedCharacters.delete(characterId);
    
    addLog(`${character.name} joined the active party!`, 'system');
    
    // Update displays
    if (window.uiManager) {
      window.uiManager.updateAllDisplays();
    }
    if (window.guildManager) {
      window.guildManager.updateGuildInterface();
    }
  }

  // Utility Functions
  addLog(message, type = 'system') {
    const logContainer = document.getElementById('adventure-log');
    if (!logContainer) return;
    
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry log-${type}`;
    
    const timestamp = new Date().toLocaleTimeString();
    logEntry.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`;
    
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
    
    // Limit log entries to prevent memory issues
    const entries = logContainer.children;
    if (entries.length > 200) {
      for (let i = 0; i < 50; i++) {
        if (entries[0]) {
          logContainer.removeChild(entries[0]);
        }
      }
    }
  }
}

// Create global instance
window.gameManager = new GameManager();

// Create global addLog function for backward compatibility
if (!window.addLog) {
  window.addLog = (message, type = 'system') => {
    if (window.gameManager) {
      window.gameManager.addLog(message, type);
    }
  };
}

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GameManager };
}