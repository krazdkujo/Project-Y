/**
 * Event Handlers for UI Components
 * Centralizes all UI event handling functions
 */

// Global function handlers for onclick events in GameUI
// These functions are called from the dynamically generated HTML

export function createNewCharacter() {
  // Validate that all required systems are available
  if (!window.characterGenerator) {
    if (window.addLog) {
      window.addLog('Character creation system not available. Please refresh and try again.', 'system');
    }
    console.error('CharacterGenerator not initialized');
    return;
  }
  
  // Check that required systems are accessible
  if (!window.characterGenerator.skillSystem || !window.characterGenerator.weaponSystem) {
    if (window.addLog) {
      window.addLog('Character creation dependencies missing. Please refresh and try again.', 'system');  
    }
    console.error('CharacterGenerator missing dependencies:', {
      skillSystem: !!window.characterGenerator.skillSystem,
      weaponSystem: !!window.characterGenerator.weaponSystem
    });
    return;
  }
  
  // First switch to character creation UI state (makes container visible)
  switchToCharacterCreationState();
  
  // Then initialize the character generator logic
  try {
    window.characterGenerator.openCharacterCreation();
    console.log('Character creation opened successfully');
  } catch (error) {
    console.error('Failed to open character creation:', error);
    if (window.addLog) {
      window.addLog('Failed to open character creation. Check console for details.', 'system');
    }
  }
}

export function toggleGuildInterface() {
  if (window.uiManager) {
    const currentState = window.uiManager.currentUIState;
    if (currentState === 'guild') {
      window.uiManager.switchToDungeonState();
    } else {
      window.uiManager.switchToGuildState();
    }
  }
}

export function switchToGuildState() {
  switchUIState('guild');
}

export function switchToDungeonState() {
  switchUIState('dungeon');
}

export function switchToWorldMapState() {
  if (window.gameState && window.gameState.party.members.size === 0) {
    if (window.addLog) {
      window.addLog('You need at least one party member to explore the world!', 'system');
    }
    return;
  }
  switchUIState('world-map');
}

export function switchToCharacterCreationState() {
  switchUIState('character-creation');
}

export function switchUIState(newState) {
  // Hide current state
  document.querySelectorAll('.ui-state').forEach(el => el.classList.remove('active'));
  
  // Show new state
  const newStateEl = document.getElementById(newState + '-state');
  if (newStateEl) {
    newStateEl.classList.add('active');
    
    // Update input manager state
    if (window.inputManager) {
      window.inputManager.setUIState(newState);
    }
    
    // Update UI manager
    if (window.uiManager) {
      window.uiManager.currentUIState = newState;
    }
    
    // Update specific state content
    if (newState === 'world-map') {
      renderWorldMap();
    } else if (newState === 'guild') {
      updateGuildInterface();
    } else if (newState === 'character-creation') {
      initializeCharacterCreationInterface();
    } else if (newState === 'dungeon') {
      if (window.uiManager) {
        window.uiManager.updateMapDisplay();
      }
    }
    
    if (window.addLog) {
      window.addLog(`Switched to ${newState} view`, 'system');
    }
  }
}

export function renderWorldMap() {
  const display = document.getElementById('world-map-display');
  if (display) {
    const worldMapData = [
      "    🏰 WORLD MAP 🏰    ",
      "",
      "  [1] Goblin Caves     ",
      "      Difficulty: ⭐    ",
      "      Status: Available",
      "",
      "  [2] Dark Forest      ",
      "      Difficulty: ⭐⭐  ",
      "      Status: Available",
      "",
      "  [3] Abandoned Mine   ",
      "      Difficulty: ⭐⭐⭐",
      "      Status: Available",
      "",
      "Select a location and click Enter Dungeon"
    ];
    display.textContent = worldMapData.join('\n');
  }
}

export function updateGuildInterface() {
  if (window.uiManager) {
    window.uiManager.updateGuildPartyDisplay();
    window.uiManager.updateAvailableCharacters();
  }
}

export function enterSelectedDungeon() {
  // For now, just start a basic dungeon run
  if (window.gameManager) {
    window.gameManager.startNewRun();
  }
  switchToDungeonState();
}

export function initializeCharacterCreationInterface() {
  const content = document.getElementById('character-creation-content');
  if (content) {
    content.innerHTML = `
      <h2>Character Creation</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; height: calc(100% - 60px);">
        <div>
          <h3>Basic Information</h3>
          <label>Character Name:</label>
          <input type="text" id="char-name-input" placeholder="Enter character name" style="width: 100%; margin: 10px 0;">
          
          <h3>Quick Options</h3>
          <button class="control-button" onclick="createFullRandomCharacter()" style="width: 100%; margin: 5px 0;">Generate Random Character</button>
          <button class="control-button" onclick="showCustomCreation()" style="width: 100%; margin: 5px 0;">Custom Character</button>
          
          <div id="custom-creation" style="display: none;">
            <h4>Skill Allocation (25 points)</h4>
            <div id="skill-allocation" style="height: 200px; overflow-y: auto; border: 1px solid #333; padding: 5px;">
              <!-- Skill allocation will go here -->
            </div>
          </div>
        </div>
        <div>
          <h3>Character Preview</h3>
          <div id="character-preview" style="height: 300px; border: 1px solid #333; padding: 10px; overflow-y: auto;">
            <p>Enter a name and choose creation method to preview your character.</p>
          </div>
          <div style="margin-top: 20px;">
            <button class="control-button" onclick="finalizeCharacterCreation()">Create Character</button>
            <button class="control-button" onclick="switchToGuildState()">Cancel</button>
          </div>
        </div>
      </div>
    `;
  }
}

export function createFullRandomCharacter() {
  const nameInput = document.getElementById('char-name-input');
  const name = nameInput ? nameInput.value.trim() : '';
  
  if (!name) {
    if (window.addLog) {
      window.addLog('Please enter a character name first!', 'system');
    }
    return;
  }
  
  // Use GameManager to create the character
  if (window.gameManager) {
    // Generate character with custom name
    const character = window.gameManager.generateRandomCharacter(name);
    
    // Add to guild storage
    if (window.gameState) {
      window.gameState.guild.storedCharacters.set(character.id, character);
    }
    
    // Initialize abilities
    window.gameManager.initializeCharacterAbilities(character);
    
    // Update preview
    updateCharacterPreview(character);
    
    if (window.addLog) {
      window.addLog(`Generated random character: ${character.name}`, 'system');
    }
  }
}

export function updateCharacterPreview(character) {
  const preview = document.getElementById('character-preview');
  if (preview && character) {
    const skillsList = Object.entries(character.skills || {})
      .map(([skill, data]) => `${skill}: ${data.level}`)
      .join(', ');
      
    preview.innerHTML = `
      <h4>${character.name}</h4>
      <p><strong>Health:</strong> ${character.health}/${character.maxHealth}</p>
      <p><strong>AP:</strong> ${character.ap}/${character.maxAP}</p>
      <p><strong>Skills:</strong> ${skillsList || 'None'}</p>
      <p><strong>Weapon:</strong> ${character.equipment?.weapon?.name || 'None'}</p>
    `;
  }
}

export function finalizeCharacterCreation() {
  // This would integrate with CharacterGenerator when fully implemented
  if (window.gameManager) {
    window.gameManager.createCharacterFromBuilder();
  }
  switchToGuildState();
}

export function showCustomCreation() {
  const customDiv = document.getElementById('custom-creation');
  if (customDiv) {
    customDiv.style.display = customDiv.style.display === 'none' ? 'block' : 'none';
  }
}

// Make functions globally available for onclick handlers
if (typeof window !== 'undefined') {
  Object.assign(window, {
    createNewCharacter,
    toggleGuildInterface,
    switchToGuildState,
    switchToDungeonState,
    switchToWorldMapState,
    switchToCharacterCreationState,
    switchUIState,
    renderWorldMap,
    updateGuildInterface,
    enterSelectedDungeon,
    initializeCharacterCreationInterface,
    createFullRandomCharacter,
    updateCharacterPreview,
    finalizeCharacterCreation,
    showCustomCreation
  });
}