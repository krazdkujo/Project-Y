/**
 * Overworld Navigation Demo
 * 
 * Demonstrates how to integrate the overworld navigation system
 * with the existing game infrastructure.
 */

import { OverworldIntegration } from './OverworldIntegration';
import { GameRenderer } from './GameRenderer';

/**
 * Demo implementation showing overworld navigation integration
 */
export class OverworldDemo {
  private gameRenderer: GameRenderer;
  private overworldIntegration: OverworldIntegration;
  
  constructor() {
    this.initializeDemo();
  }
  
  /**
   * Initialize the overworld navigation demo
   */
  private initializeDemo(): void {
    // Create container for the demo
    const container = this.createDemoContainer();
    
    // Initialize game renderer (existing system)
    this.gameRenderer = new GameRenderer();
    
    // Initialize overworld integration
    this.overworldIntegration = new OverworldIntegration(
      this.gameRenderer,
      {
        containerId: 'overworld-demo-container',
        overworldConfig: {
          worldRadius: 25,
          townCount: 6,
          dungeonCount: 10,
          minTownDistance: 4,
          minDungeonDistance: 2
        },
        startingLocation: { q: 0, r: 0, s: 0 }
      }
    );
    
    // Set up demo controls
    this.setupDemoControls();
    
    // Set up event listeners for demonstration
    this.setupEventListeners();
    
    // Add some demo data
    this.populateDemoData();
  }
  
  /**
   * Create the demo container with proper structure
   */
  private createDemoContainer(): HTMLElement {
    // Create main container
    const container = document.createElement('div');
    container.id = 'overworld-demo-container';
    container.className = 'overworld-demo';
    
    // Add demo header
    const header = document.createElement('header');
    header.className = 'demo-header';
    header.innerHTML = `
      <h1>Overworld Navigation System Demo</h1>
      <p>Use WASD to move, arrow keys to pan view, or click locations to explore.</p>
      <div class="demo-controls">
        <button id="toggle-mode" type="button">Switch to Dungeon Mode</button>
        <button id="reset-demo" type="button">Reset Demo</button>
        <button id="accessibility-info" type="button">Accessibility Info</button>
      </div>
    `;
    
    container.appendChild(header);
    document.body.appendChild(container);
    
    return container;
  }
  
  /**
   * Set up demo control buttons
   */
  private setupDemoControls(): void {
    const toggleBtn = document.getElementById('toggle-mode');
    const resetBtn = document.getElementById('reset-demo');
    const accessibilityBtn = document.getElementById('accessibility-info');
    
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.toggleMode();
      });
    }
    
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetDemo();
      });
    }
    
    if (accessibilityBtn) {
      accessibilityBtn.addEventListener('click', () => {
        this.showAccessibilityInfo();
      });
    }
  }
  
  /**
   * Set up event listeners for demo functionality
   */
  private setupEventListeners(): void {
    const container = document.getElementById('overworld-demo-container');
    if (!container) return;
    
    // Listen for dungeon entry events
    container.addEventListener('dungeonEntered', (event: any) => {
      const { dungeonId, location } = event.detail;
      console.log('Demo: Entered dungeon', dungeonId, 'at', location);
      this.showDungeonEntryMessage(dungeonId);
    });
    
    // Listen for overworld return events
    container.addEventListener('overworldEntered', (event: any) => {
      const { location } = event.detail;
      console.log('Demo: Returned to overworld at', location);
      this.showOverworldReturnMessage();
    });
    
    // Listen for town service interactions
    container.addEventListener('townServiceInteraction', (event: any) => {
      const { townId, service } = event.detail;
      console.log('Demo: Town service interaction', townId, service);
      this.showServiceInteractionMessage(service);
    });
  }
  
  /**
   * Add some demo data to showcase functionality
   */
  private populateDemoData(): void {
    // This would normally be handled by the OverworldGenerator
    // but for demo purposes we can simulate some discoveries
    
    setTimeout(() => {
      this.announceDemo('Demo: Overworld navigation system loaded. Use WASD keys to explore!');
    }, 1000);
    
    // Simulate discovering a location after a few seconds
    setTimeout(() => {
      this.announceDemo('Demo: You discovered Greenwood Village to the northeast!');
    }, 5000);
    
    setTimeout(() => {
      this.announceDemo('Demo: You found the entrance to Shadowmere Crypt!');
    }, 8000);
  }
  
  /**
   * Toggle between overworld and dungeon modes
   */
  private toggleMode(): void {
    const gameState = this.overworldIntegration.getGameState();
    const toggleBtn = document.getElementById('toggle-mode') as HTMLButtonElement;
    
    if (gameState.isInOverworld) {
      this.overworldIntegration.forceDungeonTransition('demo_dungeon');
      toggleBtn.textContent = 'Switch to Overworld Mode';
      this.announceDemo('Switched to dungeon exploration mode');
    } else {
      this.overworldIntegration.forceOverworldTransition();
      toggleBtn.textContent = 'Switch to Dungeon Mode';
      this.announceDemo('Switched to overworld navigation mode');
    }
  }
  
  /**
   * Reset the demo to initial state
   */
  private resetDemo(): void {
    // Reset to starting location
    this.overworldIntegration.forceOverworldTransition({ q: 0, r: 0, s: 0 });
    
    // Update toggle button
    const toggleBtn = document.getElementById('toggle-mode') as HTMLButtonElement;
    if (toggleBtn) {
      toggleBtn.textContent = 'Switch to Dungeon Mode';
    }
    
    this.announceDemo('Demo reset to starting position');
  }
  
  /**
   * Show accessibility information
   */
  private showAccessibilityInfo(): void {
    const infoModal = this.createAccessibilityInfoModal();
    document.body.appendChild(infoModal);
    
    // Focus on close button
    const closeBtn = infoModal.querySelector('.close-btn') as HTMLElement;
    if (closeBtn) {
      closeBtn.focus();
    }
  }
  
  /**
   * Create accessibility information modal
   */
  private createAccessibilityInfoModal(): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'demo-modal accessibility-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'accessibility-title');
    modal.setAttribute('aria-modal', 'true');
    
    modal.innerHTML = `
      <div class="demo-modal-overlay"></div>
      <div class="demo-modal-content">
        <h2 id="accessibility-title">Accessibility Features</h2>
        <div class="accessibility-info">
          <h3>Keyboard Navigation</h3>
          <ul>
            <li><kbd>WASD</kbd> - Move player character</li>
            <li><kbd>Arrow Keys</kbd> - Pan map view</li>
            <li><kbd>Tab</kbd> - Navigate through interface elements</li>
            <li><kbd>Space</kbd> - Select current location</li>
            <li><kbd>Enter</kbd> - Confirm action</li>
            <li><kbd>Escape</kbd> - Cancel/Go back</li>
            <li><kbd>C</kbd> - Center view on player</li>
            <li><kbd>R</kbd> - Toggle route planning</li>
            <li><kbd>F</kbd> - Fast travel menu</li>
            <li><kbd>I</kbd> - Location information</li>
          </ul>
          
          <h3>Screen Reader Support</h3>
          <ul>
            <li>ARIA landmarks for navigation</li>
            <li>Live regions for status updates</li>
            <li>Descriptive labels for map cells</li>
            <li>Accessible form controls</li>
            <li>Semantic HTML structure</li>
          </ul>
          
          <h3>Visual Accessibility</h3>
          <ul>
            <li>High contrast color scheme (4.5:1 minimum)</li>
            <li>Clear focus indicators</li>
            <li>Scalable typography</li>
            <li>Reduced motion support</li>
            <li>Large touch targets (44px minimum)</li>
          </ul>
          
          <h3>Compliance</h3>
          <p>This interface follows WCAG 2.1 Level AA guidelines and includes support for:</p>
          <ul>
            <li>Keyboard-only navigation</li>
            <li>Screen readers (JAWS, NVDA, VoiceOver)</li>
            <li>High contrast mode</li>
            <li>Reduced motion preferences</li>
            <li>Mobile accessibility</li>
          </ul>
        </div>
        <button type="button" class="demo-btn close-btn primary">Close</button>
      </div>
    `;
    
    // Add close functionality
    const closeBtn = modal.querySelector('.close-btn');
    const overlay = modal.querySelector('.demo-modal-overlay');
    
    const closeModal = () => {
      modal.remove();
    };
    
    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);
    
    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    });
    
    return modal;
  }
  
  /**
   * Show dungeon entry message
   */
  private showDungeonEntryMessage(dungeonId: string): void {
    this.announceDemo(`Demo: Entering dungeon ${dungeonId}. In a real game, this would load the dungeon layout.`);
  }
  
  /**
   * Show overworld return message
   */
  private showOverworldReturnMessage(): void {
    this.announceDemo('Demo: Returned to overworld. Your progress in the dungeon would be saved.');
  }
  
  /**
   * Show service interaction message
   */
  private showServiceInteractionMessage(service: string): void {
    const serviceMessages = {
      inn: 'Demo: Resting at the inn. Party health and mana restored.',
      blacksmith: 'Demo: Visiting the blacksmith. Equipment repair and upgrade options available.',
      general_store: 'Demo: Shopping at the general store. Buy supplies and sell loot.',
      temple: 'Demo: Praying at the temple. Blessings and healing services available.',
      stable: 'Demo: Checking the stables. Faster travel options and mounts available.'
    };
    
    const message = serviceMessages[service as keyof typeof serviceMessages] || 
                   `Demo: Interacting with ${service}. Service-specific actions would be available here.`;
    
    this.announceDemo(message);
  }
  
  /**
   * Make demo announcements
   */
  private announceDemo(message: string): void {
    // Create or update demo announcement area
    let announcer = document.getElementById('demo-announcements');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'demo-announcements';
      announcer.setAttribute('aria-live', 'polite');
      announcer.className = 'demo-announcements';
      
      const container = document.getElementById('overworld-demo-container');
      if (container) {
        container.appendChild(announcer);
      }
    }
    
    announcer.textContent = message;
    console.log('Demo Announcement:', message);
    
    // Clear after delay
    setTimeout(() => {
      announcer!.textContent = '';
    }, 5000);
  }
  
  /**
   * Cleanup demo resources
   */
  public destroy(): void {
    this.overworldIntegration.destroy();
    
    const container = document.getElementById('overworld-demo-container');
    if (container) {
      container.remove();
    }
    
    const announcer = document.getElementById('demo-announcements');
    if (announcer) {
      announcer.remove();
    }
  }
}

// Demo CSS styles
const demoStyles = `
.overworld-demo {
  font-family: 'Courier New', monospace;
  background-color: #000000;
  color: #ffffff;
  min-height: 100vh;
}

.demo-header {
  background-color: #1a1a1a;
  border-bottom: 2px solid #00ff00;
  padding: 1rem;
  text-align: center;
}

.demo-header h1 {
  color: #00ff00;
  margin: 0 0 0.5rem 0;
}

.demo-header p {
  color: #cccccc;
  margin: 0 0 1rem 0;
}

.demo-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.demo-btn,
#toggle-mode,
#reset-demo,
#accessibility-info {
  background-color: #333333;
  color: #ffffff;
  border: 1px solid #666666;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.demo-btn:hover,
#toggle-mode:hover,
#reset-demo:hover,
#accessibility-info:hover {
  background-color: #4a4a4a;
  border-color: #888888;
}

.demo-btn:focus,
#toggle-mode:focus,
#reset-demo:focus,
#accessibility-info:focus {
  outline: 3px solid #4d90fe;
  outline-offset: 2px;
}

.demo-btn.primary {
  background-color: #006600;
  border-color: #00aa00;
}

.demo-btn.primary:hover {
  background-color: #008800;
  border-color: #00cc00;
}

.demo-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
}

.demo-modal-content {
  position: relative;
  background-color: #1a1a1a;
  border: 2px solid #00ff00;
  border-radius: 8px;
  padding: 2rem;
  max-width: 700px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.demo-modal-content h2 {
  color: #00ff00;
  margin: 0 0 1rem 0;
  text-align: center;
}

.demo-modal-content h3 {
  color: #ffff00;
  margin: 1.5rem 0 0.5rem 0;
}

.demo-modal-content ul {
  margin: 0.5rem 0 1rem 1rem;
  line-height: 1.4;
}

.demo-modal-content li {
  margin: 0.25rem 0;
}

.demo-modal-content kbd {
  background-color: #666666;
  color: #ffffff;
  padding: 0.125rem 0.25rem;
  border-radius: 2px;
  font-size: 0.9em;
  font-weight: bold;
}

.demo-modal-content .close-btn {
  display: block;
  margin: 2rem auto 0 auto;
}

.demo-announcements {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  right: 2rem;
  background-color: rgba(0, 255, 0, 0.1);
  border: 1px solid #00ff00;
  border-radius: 4px;
  padding: 1rem;
  color: #00ff00;
  text-align: center;
  pointer-events: none;
  z-index: 100;
}

@media (max-width: 600px) {
  .demo-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .demo-btn,
  #toggle-mode,
  #reset-demo,
  #accessibility-info {
    width: 200px;
  }
}
`;

// Inject demo styles
const styleSheet = document.createElement('style');
styleSheet.textContent = demoStyles;
document.head.appendChild(styleSheet);

// Initialize demo when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new OverworldDemo();
  });
} else {
  new OverworldDemo();
}