/**
 * Main Entry Point for Single-Player ASCII Roguelike
 * Initializes all modules and creates the game interface
 */

// Core System Imports
import './core/EventSystem.js';
import './core/GameState.js';
import './character/skills/SkillCategories.js';
import './character/skills/SkillSystem.js';

// Ability System Imports
import './abilities/core/AbilityRegistry.js';
import './abilities/core/AbilitySlotManager.js';
import './abilities/core/AbilityEngine.js';
import './abilities/combat/MeleeAbilities.js';
import './abilities/combat/RangedAbilities.js';
import './abilities/combat/DefensiveAbilities.js';
import './abilities/combat/PhysicalDamageAbilities.js';
import './abilities/magic/MagicAbilities.js';
import './abilities/magic/ElementalAbilities.js';
import './abilities/exploration/ExplorationAbilities.js';
import './abilities/passive/PassiveAbilities.js';
import './abilities/hybrid/HybridAbilities.js';

// Game Systems Imports
import './character/generator/CharacterGenerator.js';
import './equipment/Weapons.js';
import './enemies/EnemySystem.js';
import './combat/CombatManager.js';
import './combat/TurnManager.js';
import './dungeon/DungeonGenerator.js';

// Modular Systems Imports
import './input/core/InputManager.js';
import './input/handlers/AbilityHandler.js';
import './ui/core/UIManager.js';
import './ui/panels/LeftPanel.js';
import './movement/core/MovementSystem.js';
import './movement/validation/MovementValidator.js';
import './movement/ai/EnemyAI.js';
import './encounters/core/EncounterManager.js';
import './encounters/scaling/EncounterScaling.js';
import './encounters/combat/TacticalCombat.js';
import './game/core/GameManager.js';

// UI Component Imports
import GameUI from './ui/components/GameUI.js';
import './ui/components/EventHandlers.js';
import './styles/main.css';

/**
 * Initialize the complete game interface and systems
 */
class GameApp {
  constructor() {
    this.gameUI = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    console.log('Initializing ASCII Roguelike...');
    
    // Create main UI manager
    this.gameUI = new GameUI();
    
    // Initialize game interface
    await this.gameUI.initialize();
    
    // Initialize all game systems (existing pattern from HTML)
    this.initializeGameSystems();
    
    // Set initial state
    this.setInitialGameState();
    
    this.initialized = true;
    console.log('Game initialization complete!');
  }

  initializeGameSystems() {
    // Initialize core game state first (required by many systems)
    if (window.GameState) {
      window.gameState = new window.GameState();
      console.log('Game state initialized');
    }
    
    // Initialize core system instances (required for CharacterGenerator)
    if (window.EventSystem && window.SkillSystem && window.WeaponSystem) {
      window.eventSystem = new window.EventSystem();
      window.skillSystem = new window.SkillSystem(window.eventSystem);
      window.weaponSystem = new window.WeaponSystem();
      console.log('Core systems instantiated:', {
        eventSystem: !!window.eventSystem,
        skillSystem: !!window.skillSystem,
        weaponSystem: !!window.weaponSystem
      });
    } else {
      console.error('Core system classes missing:', {
        EventSystem: !!window.EventSystem,
        SkillSystem: !!window.SkillSystem,
        WeaponSystem: !!window.WeaponSystem
      });
    }
    
    // Initialize systems in dependency order
    window.inputManager.initialize();
    window.uiManager.initialize();
    window.leftPanel.initialize();
    window.movementSystem.initialize();
    window.movementValidator.initialize();
    window.enemyAI.initialize();
    window.encounterManager.initialize();
    window.encounterScaling.initialize();
    window.tacticalCombat.initialize();
    window.gameManager.initialize();
    
    // Initialize character generator (required for character creation)
    if (window.CharacterGenerator && window.eventSystem && window.skillSystem && window.weaponSystem) {
      try {
        window.characterGenerator = new window.CharacterGenerator(
          window.eventSystem, 
          window.skillSystem, 
          window.weaponSystem
        );
        console.log('Character generator initialized with dependencies:', {
          eventSystem: !!window.eventSystem,
          skillSystem: !!window.skillSystem,
          weaponSystem: !!window.weaponSystem
        });
      } catch (error) {
        console.error('Failed to initialize character generator:', error);
        window.characterGenerator = null;
      }
    } else {
      console.warn('Character generator dependencies missing:', {
        CharacterGenerator: !!window.CharacterGenerator,
        eventSystem: !!window.eventSystem,
        skillSystem: !!window.skillSystem,
        weaponSystem: !!window.weaponSystem
      });
    }
    
    console.log('All game systems initialized');
  }

  setInitialGameState() {
    // Set initial UI state (guild base)
    const currentUIState = 'guild';
    window.inputManager.setUIState(currentUIState);
    window.uiManager.currentUIState = currentUIState;
    
    // Update displays
    window.uiManager.updateAllDisplays();
    window.uiManager.updateGuildInterface();
    window.uiManager.clearMapLegend();
    
    // Add welcome messages
    if (window.addLog) {
      window.addLog('Single-player party-based roguelike initialized!', 'system');
      window.addLog('Welcome to the Guild Base! Create your party to begin.', 'system');
    }
    
    console.log('🏠 Starting at Guild Base');
  }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  const app = new GameApp();
  await app.initialize();
});

// Hot module replacement support for development
if (import.meta.hot) {
  import.meta.hot.accept();
}