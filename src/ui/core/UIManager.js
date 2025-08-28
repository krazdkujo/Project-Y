/**
 * UI Manager
 * Centralized UI system managing display updates and state transitions
 */

class UIManager {
  constructor() {
    this.currentUIState = 'guild';
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;
    this.initialized = true;
  }

  // State Management
  switchUIState(newState) {
    // Hide current state
    document.querySelectorAll('.ui-state').forEach(el => el.classList.remove('active'));
    
    // Show new state
    const newStateEl = document.getElementById(newState + '-state');
    if (newStateEl) {
      newStateEl.classList.add('active');
      this.currentUIState = newState;
      
      // Update input manager state
      if (window.inputManager) {
        window.inputManager.setUIState(newState);
      }
      
      // Update specific state content and legends
      if (newState === 'world-map') {
        this.renderWorldMap();
      } else if (newState === 'guild') {
        this.updateGuildInterface();
        this.clearMapLegend();
      } else if (newState === 'character-creation') {
        this.clearMapLegend();
      } else if (newState === 'dungeon') {
        this.updateMapDisplay();
      }
      
      addLog(`Switched to ${newState} view`, 'system');
    }
  }

  switchToDungeonState() {
    this.switchUIState('dungeon');
    this.updateMapDisplay();
  }
  
  switchToGuildState() {
    this.switchUIState('guild');
  }
  
  switchToWorldMapState() {
    if (window.gameState.party.members.size === 0) {
      addLog('You need at least one party member to explore the world!', 'system');
      return;
    }
    this.switchUIState('world-map');
  }

  switchToCharacterCreationState() {
    this.switchUIState('character-creation');
  }

  // Display Updates
  updateAllDisplays() {
    this.updateGameStatus();
    if (window.leftPanel) {
      window.leftPanel.updatePartyDisplay();
      window.leftPanel.updateActiveCharacterDisplay();
      window.leftPanel.updateAbilitiesDisplay();
    }
    this.updateMapDisplay();
    this.updateQuickStats();
  }

  updateGameStatus() {
    if (!window.window.gameState) return; // Safety check
    
    const elements = {
      'location-display': window.window.gameState.location.type,
      'current-floor': window.window.gameState.currentRun.active ? window.window.gameState.currentRun.floor : '-',
      'current-room': window.window.gameState.currentRun.active ? '1' : '-',
      'party-gold': window.window.gameState.party.gold
    };
    
    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
  }

  updateQuickStats() {
    const activeChar = window.leftPanel ? window.leftPanel.getActiveCharacter() : null;
    const quickStatsElement = document.getElementById('quick-stats');
    
    if (quickStatsElement) {
      if (activeChar) {
        quickStatsElement.innerHTML = `
          <div style="font-size: 10px; color: #888;">
            ${activeChar.name}: ${activeChar.health}/${activeChar.maxHealth} HP, ${activeChar.ap}/${activeChar.maxAP} AP
          </div>
        `;
      } else {
        quickStatsElement.innerHTML = '<div style="font-size: 10px; color: #888;">No active character</div>';
      }
    }
  }

  updateMapDisplay() {
    let mapContent = '';
    
    // Check if we're in an active dungeon run
    if (window.gameState.currentRun.active) {
      mapContent = this.renderDungeonRoom();
    } else {
      // Default exploration view when not in dungeon
      const { playerX: x, playerY: y } = window.gameState.location;
      mapContent = `Position: (${x}, ${y})\n\n`;
      mapContent += 'Not in active dungeon run.\nVisit Guild Base to start a new adventure!';
    }

    // Update map display
    document.getElementById('map-display').textContent = mapContent;
    
    // Update legend
    this.updateMapLegend(mapContent);
  }

  renderDungeonRoom() {
    // Check if we're in combat mode
    if (window.gameState.combat.active) {
      return this.renderCombatRoom();
    }
    
    // Get current room from dungeon generator
    const currentRoom = window.gameState.currentRun.floor || 1;
    const template = dungeonGenerator.getCurrentTemplate(currentRoom);
    
    if (!template) {
      return 'Error: Could not load room template\n';
    }

    // Generate enemies for this room if not already done
    try {
      if (window.encounterManager) {
        window.encounterManager.ensureRoomEnemiesGenerated();
      }
    } catch (error) {
      console.warn('Could not generate enemies:', error);
    }

    // Create map display
    let mapContent = `Floor ${window.gameState.currentRun.floor} - Room ${currentRoom}\n\n`;
    
    // Build the room layout
    const width = template.width;
    const height = template.height;
    
    // Initialize room with floors
    const roomMap = [];
    for (let y = 0; y < height; y++) {
      roomMap[y] = new Array(width).fill('.');
    }
    
    // Place walls
    if (template.walls) {
      template.walls.forEach(([x, y]) => {
        if (y >= 0 && y < height && x >= 0 && x < width) {
          roomMap[y][x] = '#';
        }
      });
    }
    
    // Place objects (chests, doors, etc.)
    if (template.objects) {
      template.objects.forEach(obj => {
        if (obj.x >= 0 && obj.x < width && obj.y >= 0 && obj.y < height) {
          let symbol = '&';
          switch (obj.type) {
            case 'chest': symbol = '&'; break;
            case 'door': symbol = '+'; break;
            case 'container': symbol = '{'; break;
            default: symbol = '?'; break;
          }
          if (roomMap[obj.y][obj.x] !== '#') {
            roomMap[obj.y][obj.x] = symbol;
          }
        }
      });
    }
    
    // Place enemies
    const enemies = window.gameState.getCurrentEnemies ? window.gameState.getCurrentEnemies() : new Map();
    enemies.forEach((enemy) => {
      if (enemy.alive && enemy.x >= 0 && enemy.x < width && enemy.y >= 0 && enemy.y < height) {
        if (roomMap[enemy.y][enemy.x] !== '#') {
          const enemySymbol = enemy.name ? enemy.name.charAt(0).toLowerCase() : 'e';
          roomMap[enemy.y][enemy.x] = enemySymbol;
        }
      }
    });
    
    // Place player character LAST (top layer - always visible)
    let playerX = window.gameState.location.playerX;
    let playerY = window.gameState.location.playerY;
    
    // If player position is not set or invalid, find a suitable starting position
    if (playerX == null || playerY == null || 
        playerX < 0 || playerX >= width || playerY < 0 || playerY >= height ||
        roomMap[playerY] && roomMap[playerY][playerX] === '#') {
      
      // Find first open floor space (avoid walls)
      let found = false;
      for (let y = 1; y < height - 1 && !found; y++) {
        for (let x = 1; x < width - 1 && !found; x++) {
          if (roomMap[y][x] === '.') {
            playerX = x;
            playerY = y;
            window.gameState.location.playerX = x;
            window.gameState.location.playerY = y;
            found = true;
          }
        }
      }
    }
    
    if (playerY >= 0 && playerY < height && playerX >= 0 && playerX < width) {
      roomMap[playerY][playerX] = '@';
    }
    
    // Convert to string
    for (let y = 0; y < height; y++) {
      mapContent += roomMap[y].join('') + '\n';
    }
    
    return mapContent;
  }

  renderCombatRoom() {
    const combatRoom = window.gameState.combat.currentRoom;
    if (!combatRoom) {
      return 'Error: No combat room data\n';
    }

    let mapContent = `TACTICAL COMBAT - Round ${window.gameState.combat.round}\n\n`;
    
    // Build the combat room layout
    const width = combatRoom.width;
    const height = combatRoom.height;
    
    // Initialize room with floors
    const roomMap = [];
    for (let y = 0; y < height; y++) {
      roomMap[y] = new Array(width).fill('.');
    }
    
    // Place walls
    if (combatRoom.walls) {
      combatRoom.walls.forEach(([x, y]) => {
        if (y >= 0 && y < height && x >= 0 && x < width) {
          roomMap[y][x] = '#';
        }
      });
    }
    
    // Place combat enemies
    const enemies = window.gameState.combat.enemies;
    enemies.forEach((enemy) => {
      if (enemy.alive && enemy.x >= 0 && enemy.x < width && enemy.y >= 0 && enemy.y < height) {
        const enemySymbol = enemy.name ? enemy.name.charAt(0).toUpperCase() : 'E';
        roomMap[enemy.y][enemy.x] = enemySymbol;
      }
    });
    
    // Place party members
    const partyMembers = Array.from(window.gameState.party.members.values());
    partyMembers.forEach((member, index) => {
      if (member.health > 0 && member.x >= 0 && member.x < width && member.y >= 0 && member.y < height) {
        const memberSymbol = (index + 1).toString();
        roomMap[member.y][member.x] = memberSymbol;
      }
    });
    
    // Highlight current turn character
    const currentTurn = window.gameState.combat.turnOrder[window.gameState.combat.currentTurnIndex];
    if (currentTurn && currentTurn.x >= 0 && currentTurn.x < width && currentTurn.y >= 0 && currentTurn.y < height) {
      roomMap[currentTurn.y][currentTurn.x] = '@';
    }
    
    // Convert to string
    for (let y = 0; y < height; y++) {
      mapContent += roomMap[y].join('') + '\n';
    }
    
    // Add combat status
    mapContent += `\nCurrent Turn: ${currentTurn ? currentTurn.name : 'Unknown'}\n`;
    mapContent += `Enemies: ${Array.from(window.gameState.combat.enemies.values()).filter(e => e.alive).length}`;
    
    return mapContent;
  }

  clearMapLegend() {
    document.getElementById('map-legend').innerHTML = '<div style="color: #888; font-size: 10px;">No map active</div>';
  }

  updateMapLegend(mapContent) {
    // This can be expanded with more sophisticated legend logic
    const legend = document.getElementById('map-legend');
    if (legend) {
      legend.innerHTML = `
        <div style="font-size: 10px; color: #888;">
          <strong>Legend:</strong><br>
          @ = You/Current Turn<br>
          # = Wall<br>
          . = Floor<br>
          & = Chest<br>
          + = Door<br>
          a-z = Enemies<br>
          1-6 = Party Members
        </div>
      `;
    }
  }

  // Guild and World Map functions will be added when we extract those systems
  updateGuildInterface() {
    // Placeholder - this will be moved to guild UI module
    if (window.guildUI) {
      window.guildUI.update();
    }
  }

  renderWorldMap() {
    // Placeholder - this will be moved to world map UI module  
    if (window.worldMapUI) {
      window.worldMapUI.render();
    }
  }
}

// Create global instance
window.uiManager = new UIManager();

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UIManager };
}