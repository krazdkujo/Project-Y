/**
 * Main Game UI Component
 * Creates and manages the complete game interface structure
 */

export default class GameUI {
  constructor() {
    this.gameRoot = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    this.gameRoot = document.getElementById('game-root');
    if (!this.gameRoot) {
      throw new Error('Game root element not found');
    }

    // Create the complete game interface
    this.createGameStructure();
    this.setupEventListeners();

    this.initialized = true;
    console.log('Game UI initialized');
  }

  createGameStructure() {
    this.gameRoot.innerHTML = `
      <div id="game-container">
        <div id="left-panel">
          ${this.createLeftPanelContent()}
        </div>
        
        <div id="map-container">
          ${this.createCenterContent()}
        </div>
        
        <div id="right-panel">
          ${this.createRightPanelContent()}
        </div>
      </div>
    `;
  }

  createLeftPanelContent() {
    return `
      <div class="panel-section">
        <h3>Party Status</h3>
        <div id="party-display">
          <div style="color: #888; font-size: 11px; text-align: center; margin: 20px 0;">
            No party members
          </div>
        </div>
      </div>
      
      <div class="panel-section">
        <h3>Active Character</h3>
        <div id="active-character-display">
          <div style="color: #888; font-size: 11px;">No active character</div>
        </div>
        <div id="quick-character-stats" style="margin-top: 10px;"></div>
      </div>
      
      <div class="panel-section">
        <h3>Abilities</h3>
        <div id="abilities-display">
          <div class="abilities-grid">
            ${this.createAbilitiesGrid()}
          </div>
        </div>
      </div>
      
      <div class="panel-section">
        <h3>Controls</h3>
        <div class="control-buttons">
          <button class="control-button" onclick="toggleGuildInterface()">Guild Base</button>
          <button class="control-button" onclick="window.gameManager.startNewRun()" id="start-run-btn">Start Run</button>
          <button class="control-button" onclick="window.gameManager.endCurrentRun()" id="end-run-btn" disabled>End Run</button>
          <button class="control-button" onclick="window.gameManager.testCombat()" id="test-combat-btn">Test Combat</button>
        </div>
      </div>
    `;
  }

  createAbilitiesGrid() {
    let gridHtml = '';
    for (let i = 1; i <= 9; i++) {
      gridHtml += `
        <div class="ability-slot" data-slot="${i}">
          <div class="ability-key">${i}</div>
          <div class="ability-name">Empty</div>
          <div class="ability-cost">-</div>
        </div>
      `;
    }
    return gridHtml;
  }

  createCenterContent() {
    return `
      <div id="center-content">
        ${this.createUIStates()}
      </div>
    `;
  }

  createUIStates() {
    return `
      <!-- Guild State -->
      <div id="guild-state" class="ui-state active">
        <div style="padding: 20px;">
          <h1>Guild Base</h1>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; height: calc(100% - 60px);">
            <div>
              <h3>Create New Character</h3>
              <div style="display: flex; gap: 5px;">
                <button class="control-button" onclick="window.gameManager.createRandomCharacter()">Quick Random</button>
                <button class="control-button" onclick="createNewCharacter()">Custom Creation</button>
              </div>
              <p style="font-size: 10px; color: #888; margin-top: 5px;">Quick Random creates a character instantly. Custom Creation opens the full character builder.</p>
              
              <h3 style="margin-top: 30px;">Current Party</h3>
              <div id="guild-party-display">
                <div style="color: #888; font-size: 11px;">No party members yet</div>
              </div>
              
              <div style="margin-top: 20px;">
                <button class="control-button" onclick="switchToWorldMapState()">Explore World</button>
                <button class="control-button" onclick="switchToDungeonState()">Close</button>
              </div>
            </div>
            
            <div>
              <h3>Available Characters</h3>
              <div id="available-characters" style="max-height: 300px; overflow-y: auto; border: 1px solid #333; padding: 10px;">
                <div style="color: #888; font-size: 11px;">No characters created yet</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- World Map State -->
      <div id="world-map-state" class="ui-state">
        <div style="padding: 20px;">
          <h1>World Map</h1>
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; height: calc(100% - 60px);">
            <div>
              <div id="world-map-display" style="font-family: monospace; white-space: pre; font-size: 12px; line-height: 1.2; border: 1px solid #333; padding: 10px; height: 400px; overflow: auto;">
                Loading world map...
              </div>
              <div style="margin-top: 10px;">
                <button class="control-button" onclick="enterSelectedDungeon()">Enter Dungeon</button>
                <button class="control-button" onclick="switchToGuildState()">Return to Guild</button>
              </div>
            </div>
            <div>
              <div id="world-map-legend" style="font-size: 10px; border: 1px solid #333; padding: 10px; height: 200px; overflow-y: auto;">
                <div style="color: #888;">Map legend will appear here</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Dungeon State -->
      <div id="dungeon-state" class="ui-state">
        <div id="map-display" style="font-family: monospace; white-space: pre; font-size: 12px; line-height: 1.2; padding: 10px; height: calc(100% - 60px); overflow: auto;">
          Loading dungeon...
        </div>
        <div id="map-legend" style="font-size: 10px; padding: 10px; border-top: 1px solid #333; height: 60px; overflow-y: auto;">
          <div style="color: #888;">Legend will appear here</div>
        </div>
      </div>
      
      <!-- Character Creation State -->
      <div id="character-creation-state" class="ui-state">
        <div id="character-creation-interface" style="padding: 20px;">
          <h2>Character Creation</h2>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; height: calc(100% - 80px);">
            <!-- Left Column: Character Details -->
            <div>
              <div style="margin-bottom: 20px;">
                <label>Character Name:</label>
                <input type="text" id="character-name-input" placeholder="Enter character name" 
                       style="width: 100%; margin: 5px 0; padding: 5px; background: #111; border: 1px solid #333; color: #0f0;">
              </div>
              
              <div class="character-creation-section">
                <h3 class="section-title">Skill Allocation</h3>
                <div class="available-points-display">
                  Available Points: <span id="available-skill-points">25</span>
                </div>
                <div style="margin-bottom: 12px; display: flex; gap: 8px; align-items: center;">
                  <button id="randomize-skills-btn" class="control-button" onclick="characterGenerator.randomizeSkills()" 
                          style="flex: 1; padding: 6px 12px; font-size: 11px; background: rgba(0, 255, 0, 0.1); border: 1px solid #0f0;">
                    Randomize Skills
                  </button>
                  <button id="clear-skills-btn" class="control-button" onclick="characterGenerator.clearSkills()" 
                          style="flex: 1; padding: 6px 12px; font-size: 11px; background: rgba(255, 0, 0, 0.1); border: 1px solid #f44;">
                    Clear All
                  </button>
                </div>
                <div id="skill-allocation-grid" style="max-height: 300px; overflow-y: auto;">
                  <!-- Skill allocation interface will be populated by CharacterGenerator -->
                </div>
              </div>
              
              <div class="character-creation-section">
                <h3 class="section-title">Starting Weapon</h3>
                <div id="weapon-selection-grid" style="max-height: 200px; overflow-y: auto;">
                  <!-- Weapon selection interface will be populated by CharacterGenerator -->
                </div>
              </div>
            </div>
            
            <!-- Right Column: Character Preview -->
            <div>
              <h3 class="section-title">Character Preview</h3>
              <div class="character-preview-enhanced" style="height: 300px; overflow-y: auto;">
                <div class="preview-section">
                  <div class="preview-label">Character Name</div>
                  <div class="preview-value" id="preview-name">Unnamed Character</div>
                </div>
                
                <div class="preview-section">
                  <div class="preview-label">Starting Weapon</div>
                  <div class="preview-value" id="preview-weapon">None selected</div>
                </div>
                
                <div class="preview-section">
                  <div class="preview-label">Skills Allocated</div>
                  <div id="preview-skills" style="max-height: 120px; overflow-y: auto;">
                    <div style="color: #888; font-style: italic;">No skills allocated yet</div>
                  </div>
                </div>
                
                <div class="preview-section">
                  <div class="preview-label">Abilities Unlocked</div>
                  <div id="preview-abilities" style="max-height: 120px; overflow-y: auto;">
                    <div style="color: #888; font-style: italic;">No abilities unlocked yet</div>
                  </div>
                </div>
              </div>
              
              <div style="margin-top: 20px;">
                <button id="create-character-btn" class="control-button" disabled 
                        style="width: 100%; padding: 10px; margin-bottom: 10px;">
                  Create Character
                </button>
                <button class="control-button" onclick="switchToGuildState()" 
                        style="width: 100%; padding: 8px;">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  createRightPanelContent() {
    return `
      <div class="panel-section">
        <h3>Adventure Log</h3>
        <div id="adventure-log" style="height: 400px; overflow-y: auto; font-size: 10px; line-height: 1.4; border: 1px solid #333; padding: 5px; background: #111;">
          <div class="log-entry system">
            <span class="timestamp">[${new Date().toLocaleTimeString()}]</span> Game starting...
          </div>
        </div>
      </div>
      
      <div class="panel-section">
        <h3>Game Info</h3>
        <div id="game-info" style="font-size: 10px; line-height: 1.4;">
          <div style="margin: 5px 0;"><strong>Floor:</strong> <span id="current-floor">-</span></div>
          <div style="margin: 5px 0;"><strong>Party Size:</strong> <span id="party-size">0</span></div>
          <div style="margin: 5px 0;"><strong>Active Run:</strong> <span id="run-status">No</span></div>
        </div>
      </div>
      
      <div class="panel-section">
        <h3>Instructions</h3>
        <div style="font-size: 9px; line-height: 1.3; color: #888;">
          <p><strong>Movement:</strong> WASD or Arrow Keys</p>
          <p><strong>Abilities:</strong> Number keys 1-9</p>
          <p><strong>Wait:</strong> Space or Period</p>
          <p><strong>Menu:</strong> G for Guild, M for Map</p>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Event listeners will be handled by the existing systems
    // This is mainly for any UI-specific events
    console.log('UI event listeners ready');
  }
}