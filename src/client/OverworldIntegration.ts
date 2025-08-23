/**
 * Overworld Integration - Connects the overworld navigation to the existing game system
 * 
 * This component manages the transition between dungeon exploration and overworld navigation,
 * ensuring proper zone management and state synchronization.
 */

import { OverworldNavigationUI } from './OverworldNavigationUI';
import { OverworldGenerator } from '../world/OverworldGenerator';
import { GameRenderer } from './GameRenderer';
import { ZoneManager } from '../game/zones/ZoneManager';
import { PartyTransitionCoordinator } from '../game/zones/PartyTransitionCoordinator';
import { HexCoordinate, OverworldConfig, WorldLocation } from '../shared/WorldTypes';

interface GameState {
  isInDungeon: boolean;
  isInOverworld: boolean;
  currentDungeonId?: string;
  currentOverworldLocation: HexCoordinate;
  partyMembers: string[];
}

interface OverworldIntegrationConfig {
  containerId: string;
  overworldConfig: Partial<OverworldConfig>;
  startingLocation?: HexCoordinate;
}

/**
 * Manages the integration between overworld navigation and existing game systems
 */
export class OverworldIntegration {
  private gameRenderer: GameRenderer;
  private overworldGenerator: OverworldGenerator;
  private overworldUI: OverworldNavigationUI;
  private zoneManager?: ZoneManager;
  private partyCoordinator?: PartyTransitionCoordinator;
  
  private gameState: GameState;
  private container: HTMLElement;
  
  constructor(
    gameRenderer: GameRenderer,
    config: OverworldIntegrationConfig
  ) {
    this.gameRenderer = gameRenderer;
    this.container = document.getElementById(config.containerId)!;
    
    if (!this.container) {
      throw new Error(`Container with id '${config.containerId}' not found`);
    }
    
    // Initialize overworld generator with proper configuration
    const overworldConfig: OverworldConfig = {
      worldRadius: 50,
      townCount: 8,
      dungeonCount: 15,
      minTownDistance: 5,
      minDungeonDistance: 3,
      ...config.overworldConfig
    };
    
    this.overworldGenerator = new OverworldGenerator(overworldConfig);
    
    // Initialize game state
    this.gameState = {
      isInDungeon: false,
      isInOverworld: true,
      currentOverworldLocation: config.startingLocation || { q: 0, r: 0, s: 0 },
      partyMembers: ['player_ucrmrmov'] // Default player ID from existing system
    };
    
    // Create overworld UI
    this.overworldUI = new OverworldNavigationUI(
      this.overworldGenerator,
      this.container,
      {
        mapWidth: 50,
        mapHeight: 20,
        viewportRadius: 10,
        centerX: 25,
        centerY: 10
      }
    );
    
    this.initializeIntegration();
  }
  
  /**
   * Initialize the integration with existing game systems
   */
  private initializeIntegration(): void {
    // Generate the overworld
    const worldSeed = Date.now(); // In production, this should be stored
    this.overworldGenerator.generateOverworld(worldSeed);
    
    // Set initial player location
    this.overworldUI.setPlayerLocation(this.gameState.currentOverworldLocation);
    
    // Set up event listeners for zone transitions
    this.setupZoneTransitions();
    
    // Set up CSS integration
    this.setupStyling();
    
    // Initialize in overworld mode
    this.showOverworld();
  }
  
  /**
   * Set up zone transition event handling
   */
  private setupZoneTransitions(): void {
    // Listen for dungeon entry events
    this.container.addEventListener('dungeonEntry', (event: any) => {
      const { dungeonId, location } = event.detail;
      this.enterDungeon(dungeonId, location);
    });
    
    // Listen for overworld return events  
    this.container.addEventListener('returnToOverworld', (event: any) => {
      const { location } = event.detail;
      this.returnToOverworld(location);
    });
    
    // Listen for location selection in overworld UI
    this.container.addEventListener('locationSelected', (event: any) => {
      const { location } = event.detail;
      this.handleLocationSelection(location);
    });
  }
  
  /**
   * Set up CSS styling integration
   */
  private setupStyling(): void {
    // Load overworld navigation CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './src/client/OverworldNavigationUI.css';
    document.head.appendChild(link);
    
    // Ensure the container is properly styled for transitions
    this.container.style.position = 'relative';
    this.container.style.width = '100%';
    this.container.style.height = '100vh';
    this.container.style.overflow = 'hidden';
  }
  
  /**
   * Show the overworld navigation interface
   */
  public showOverworld(): void {
    this.gameState.isInOverworld = true;
    this.gameState.isInDungeon = false;
    
    // Hide game renderer map (if visible)
    const gameMapElement = document.getElementById('game-map-canvas');
    if (gameMapElement) {
      gameMapElement.style.display = 'none';
    }
    
    // Show overworld UI
    this.overworldUI.show();
    
    // Update accessibility announcements
    this.announceTransition('Entered overworld navigation mode');
  }
  
  /**
   * Hide the overworld and show dungeon interface  
   */
  public showDungeon(): void {
    this.gameState.isInOverworld = false;
    this.gameState.isInDungeon = true;
    
    // Hide overworld UI
    this.overworldUI.hide();
    
    // Show game renderer map
    const gameMapElement = document.getElementById('game-map-canvas');
    if (gameMapElement) {
      gameMapElement.style.display = 'block';
    }
    
    // Update accessibility announcements
    this.announceTransition('Entered dungeon exploration mode');
  }
  
  /**
   * Handle entering a dungeon from the overworld
   */
  private async enterDungeon(dungeonId: string, location: HexCoordinate): Promise<void> {
    try {
      this.gameState.currentDungeonId = dungeonId;
      this.gameState.currentOverworldLocation = location;
      
      // Mark dungeon as discovered
      this.overworldGenerator.discoverLocation(dungeonId);
      
      // If zone manager is available, use it for transition
      if (this.zoneManager) {
        await this.zoneManager.transitionToZone(dungeonId, this.gameState.partyMembers);
      }
      
      // Show dungeon interface
      this.showDungeon();
      
      // Trigger dungeon generation/loading
      this.dispatchCustomEvent('dungeonEntered', {
        dungeonId,
        location,
        partyMembers: this.gameState.partyMembers
      });
      
    } catch (error) {
      console.error('Error entering dungeon:', error);
      this.announceTransition('Error entering dungeon');
    }
  }
  
  /**
   * Handle returning to overworld from a dungeon
   */
  private async returnToOverworld(exitLocation?: HexCoordinate): Promise<void> {
    try {
      if (exitLocation) {
        this.gameState.currentOverworldLocation = exitLocation;
        this.overworldUI.setPlayerLocation(exitLocation);
      }
      
      // If zone manager is available, use it for transition
      if (this.zoneManager) {
        await this.zoneManager.transitionToOverworld(this.gameState.partyMembers);
      }
      
      // Clear dungeon state
      this.gameState.currentDungeonId = undefined;
      
      // Show overworld interface
      this.showOverworld();
      
      // Refresh overworld UI to reflect any changes
      this.overworldUI.refresh();
      
      // Trigger overworld return event
      this.dispatchCustomEvent('overworldEntered', {
        location: this.gameState.currentOverworldLocation,
        partyMembers: this.gameState.partyMembers
      });
      
    } catch (error) {
      console.error('Error returning to overworld:', error);
      this.announceTransition('Error returning to overworld');
    }
  }
  
  /**
   * Handle location selection in the overworld
   */
  private handleLocationSelection(location: HexCoordinate): void {
    const worldLocation = this.getLocationAtCoordinate(location);
    
    if (!worldLocation || !worldLocation.isDiscovered) {
      return;
    }
    
    switch (worldLocation.type) {
      case 'dungeon':
        this.showDungeonEntryPrompt(worldLocation);
        break;
      case 'town':
        this.showTownInteractionMenu(worldLocation);
        break;
      case 'landmark':
        this.showLandmarkInformation(worldLocation);
        break;
    }
  }
  
  /**
   * Show dungeon entry confirmation prompt
   */
  private showDungeonEntryPrompt(dungeon: WorldLocation): void {
    const prompt = this.createModalPrompt(
      `Enter ${dungeon.name}?`,
      `This dungeon has ${dungeon.dungeonDepth || 'unknown'} floors and difficulty rating ${dungeon.difficulty || 'unknown'}.`,
      [
        {
          text: 'Enter Dungeon',
          action: () => this.enterDungeon(dungeon.id, dungeon.coordinate),
          primary: true
        },
        {
          text: 'Cancel',
          action: () => this.closeModalPrompt(),
          primary: false
        }
      ]
    );
    
    this.showModalPrompt(prompt);
  }
  
  /**
   * Show town interaction menu
   */
  private showTownInteractionMenu(town: WorldLocation): void {
    const services = town.services || [];
    const serviceButtons = services.map(service => ({
      text: this.formatServiceName(service),
      action: () => this.interactWithTownService(town.id, service),
      primary: false
    }));
    
    const prompt = this.createModalPrompt(
      `Welcome to ${town.name}`,
      `Available services: ${services.join(', ')}`,
      [
        ...serviceButtons,
        {
          text: 'Leave Town',
          action: () => this.closeModalPrompt(),
          primary: false
        }
      ]
    );
    
    this.showModalPrompt(prompt);
  }
  
  /**
   * Show landmark information
   */
  private showLandmarkInformation(landmark: WorldLocation): void {
    const prompt = this.createModalPrompt(
      landmark.name,
      `You have discovered ${landmark.name}, a ${landmark.type} in the ${landmark.biome} biome.`,
      [
        {
          text: 'Continue',
          action: () => this.closeModalPrompt(),
          primary: true
        }
      ]
    );
    
    this.showModalPrompt(prompt);
  }
  
  /**
   * Create a modal prompt for user interaction
   */
  private createModalPrompt(
    title: string, 
    description: string, 
    actions: Array<{text: string, action: () => void, primary: boolean}>
  ): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'overworld-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'modal-title');
    modal.setAttribute('aria-describedby', 'modal-description');
    modal.setAttribute('aria-modal', 'true');
    
    const overlay = document.createElement('div');
    overlay.className = 'overworld-modal-overlay';
    
    const content = document.createElement('div');
    content.className = 'overworld-modal-content';
    content.innerHTML = `
      <h2 id="modal-title">${title}</h2>
      <p id="modal-description">${description}</p>
      <div class="overworld-modal-actions">
        ${actions.map((action, index) => `
          <button type="button" 
                  class="overworld-modal-btn ${action.primary ? 'primary' : ''}"
                  data-action-index="${index}">
            ${action.text}
          </button>
        `).join('')}
      </div>
    `;
    
    // Add event listeners
    content.querySelectorAll('.overworld-modal-btn').forEach((btn, index) => {
      btn.addEventListener('click', () => {
        actions[index].action();
      });
    });
    
    // Handle escape key
    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.closeModalPrompt();
      }
    });
    
    modal.appendChild(overlay);
    modal.appendChild(content);
    
    return modal;
  }
  
  /**
   * Show a modal prompt
   */
  private showModalPrompt(modal: HTMLElement): void {
    this.container.appendChild(modal);
    
    // Focus on the first button
    const firstButton = modal.querySelector('button') as HTMLElement;
    if (firstButton) {
      setTimeout(() => firstButton.focus(), 100);
    }
  }
  
  /**
   * Close the current modal prompt
   */
  private closeModalPrompt(): void {
    const modal = this.container.querySelector('.overworld-modal');
    if (modal) {
      modal.remove();
    }
  }
  
  /**
   * Handle town service interaction
   */
  private interactWithTownService(townId: string, service: string): void {
    this.closeModalPrompt();
    
    // Dispatch service interaction event
    this.dispatchCustomEvent('townServiceInteraction', {
      townId,
      service,
      partyMembers: this.gameState.partyMembers
    });
    
    this.announceTransition(`Interacting with ${this.formatServiceName(service)}`);
  }
  
  // Helper methods
  
  private getLocationAtCoordinate(coord: HexCoordinate): WorldLocation | null {
    // This would query the OverworldGenerator for locations at the coordinate
    // For now, return null as the location system needs full integration
    return null;
  }
  
  private formatServiceName(service: string): string {
    return service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  private announceTransition(message: string): void {
    // Create or update ARIA live region for announcements
    let announcer = document.getElementById('overworld-announcements');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'overworld-announcements';
      announcer.setAttribute('aria-live', 'assertive');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'visually-hidden';
      document.body.appendChild(announcer);
    }
    
    announcer.textContent = message;
    
    // Clear after delay
    setTimeout(() => {
      announcer!.textContent = '';
    }, 2000);
  }
  
  private dispatchCustomEvent(eventName: string, detail: any): void {
    const event = new CustomEvent(eventName, { detail });
    this.container.dispatchEvent(event);
  }
  
  // Public API methods
  
  /**
   * Get current game state
   */
  public getGameState(): GameState {
    return { ...this.gameState };
  }
  
  /**
   * Set zone manager for advanced zone transitions
   */
  public setZoneManager(zoneManager: ZoneManager): void {
    this.zoneManager = zoneManager;
  }
  
  /**
   * Set party transition coordinator for multi-player coordination
   */
  public setPartyCoordinator(coordinator: PartyTransitionCoordinator): void {
    this.partyCoordinator = coordinator;
  }
  
  /**
   * Add a party member
   */
  public addPartyMember(playerId: string): void {
    if (!this.gameState.partyMembers.includes(playerId)) {
      this.gameState.partyMembers.push(playerId);
    }
  }
  
  /**
   * Remove a party member
   */
  public removePartyMember(playerId: string): void {
    this.gameState.partyMembers = this.gameState.partyMembers.filter(id => id !== playerId);
  }
  
  /**
   * Force transition to overworld (for debugging/admin)
   */
  public forceOverworldTransition(location?: HexCoordinate): void {
    if (location) {
      this.gameState.currentOverworldLocation = location;
      this.overworldUI.setPlayerLocation(location);
    }
    this.showOverworld();
  }
  
  /**
   * Force transition to dungeon (for debugging/admin) 
   */
  public forceDungeonTransition(dungeonId: string): void {
    this.gameState.currentDungeonId = dungeonId;
    this.showDungeon();
  }
  
  /**
   * Get overworld generator instance
   */
  public getOverworldGenerator(): OverworldGenerator {
    return this.overworldGenerator;
  }
  
  /**
   * Get overworld UI instance
   */
  public getOverworldUI(): OverworldNavigationUI {
    return this.overworldUI;
  }
  
  /**
   * Cleanup resources
   */
  public destroy(): void {
    // Remove event listeners
    this.container.removeEventListener('dungeonEntry', this.enterDungeon);
    this.container.removeEventListener('returnToOverworld', this.returnToOverworld);
    this.container.removeEventListener('locationSelected', this.handleLocationSelection);
    
    // Clean up modal prompts
    this.closeModalPrompt();
    
    // Clean up announcements
    const announcer = document.getElementById('overworld-announcements');
    if (announcer) {
      announcer.remove();
    }
    
    // Clear container
    this.container.innerHTML = '';
  }
}