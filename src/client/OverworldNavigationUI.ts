/**
 * Overworld Navigation UI - ASCII hex-based world map interface
 * 
 * Integrates with OverworldGenerator to provide accessible navigation
 * between dungeons, towns, and points of interest.
 * 
 * Features:
 * - Hex-based ASCII map visualization 
 * - Keyboard and mouse navigation
 * - WCAG 2.1 AA compliant accessibility
 * - Biome identification and information display
 * - Travel planning and route visualization
 * - Fast travel to discovered locations
 */

import { HexCoordinate, Biome, WorldLocation, BiomeType } from '../shared/WorldTypes';
import { OverworldGenerator } from '../world/OverworldGenerator';

interface OverworldUIConfig {
  mapWidth: number;
  mapHeight: number;
  viewportRadius: number;
  centerX: number;
  centerY: number;
}

interface NavigationState {
  currentLocation: HexCoordinate;
  selectedLocation?: HexCoordinate;
  viewCenter: HexCoordinate;
  focusedElement?: HTMLElement;
  travelPath?: HexCoordinate[];
  isRouteMode: boolean;
}

interface TravelOption {
  destination: HexCoordinate;
  movementCost: number;
  encounterChance: number;
  estimatedTime: number;
  requiredSupplies: string[];
}

/**
 * ASCII-based overworld navigation system with full accessibility support
 */
export class OverworldNavigationUI {
  private config: OverworldUIConfig;
  private generator: OverworldGenerator;
  private navigationState: NavigationState;
  
  // DOM elements
  private container: HTMLElement;
  private mapCanvas: HTMLElement;
  private infoPanel: HTMLElement;
  private navigationControls: HTMLElement;
  private locationDetails: HTMLElement;
  
  // Accessibility and navigation
  private focusableElements: HTMLElement[] = [];
  private keyBindings: Map<string, () => void> = new Map();
  private announcements: HTMLElement;
  
  // Hex grid visualization
  private readonly HEX_DISPLAY_CHARS = {
    // Biome characters (from OverworldGenerator)
    forest: '♠',
    mountains: '▲', 
    desert: '∴',
    swamp: '≋',
    plains: '.',
    jungle: '♣',
    savanna: '"',
    snow_peaks: '❄'
  } as const;
  
  private readonly LOCATION_CHARS = {
    town: '⌂',           // House symbol for towns
    dungeon: '⚕',        // Double struck for dungeons  
    landmark: '★',       // Star for landmarks
    player: '@',         // Player position
    selected: '◯',       // Selection cursor
    discovered: '◊',     // Discovered but not visible locations
    route: '·',          // Travel route markers
    fast_travel: '◈'     // Fast travel destinations
  } as const;
  
  private readonly BIOME_COLORS = {
    forest: '#228B22',
    mountains: '#696969', 
    desert: '#F4A460',
    swamp: '#556B2F',
    plains: '#9ACD32',
    jungle: '#006400',
    savanna: '#DAA520',
    snow_peaks: '#F0F8FF'
  } as const;

  constructor(
    generator: OverworldGenerator,
    container: HTMLElement,
    config: Partial<OverworldUIConfig> = {}
  ) {
    this.generator = generator;
    this.container = container;
    
    this.config = {
      mapWidth: 40,
      mapHeight: 16, 
      viewportRadius: 8,
      centerX: 20,
      centerY: 8,
      ...config
    };
    
    this.navigationState = {
      currentLocation: { q: 0, r: 0, s: 0 },
      viewCenter: { q: 0, r: 0, s: 0 },
      isRouteMode: false
    };
    
    this.initializeUI();
    this.setupAccessibility();
    this.setupKeyboardNavigation();
    this.render();
  }

  /**
   * Initialize the UI structure with proper ARIA landmarks
   */
  private initializeUI(): void {
    this.container.innerHTML = '';
    this.container.className = 'overworld-navigation';
    this.container.setAttribute('role', 'application');
    this.container.setAttribute('aria-label', 'Overworld Navigation Map');
    
    // Create main layout structure
    const layout = document.createElement('div');
    layout.className = 'overworld-layout';
    layout.innerHTML = `
      <div class="overworld-header">
        <h1 id="overworld-title">World Map</h1>
        <div class="overworld-location-status" aria-live="polite" id="location-status">
          Current location: Starting Area
        </div>
      </div>
      
      <div class="overworld-main">
        <nav class="overworld-controls" role="navigation" aria-labelledby="nav-title">
          <h2 id="nav-title" class="visually-hidden">Map Navigation Controls</h2>
          <div class="control-group" role="group" aria-labelledby="movement-controls">
            <h3 id="movement-controls">Movement</h3>
            <button type="button" id="move-north" aria-keyshortcuts="w" class="direction-btn">
              <span aria-hidden="true">↑</span> North <kbd>W</kbd>
            </button>
            <button type="button" id="move-south" aria-keyshortcuts="s" class="direction-btn">
              <span aria-hidden="true">↓</span> South <kbd>S</kbd> 
            </button>
            <button type="button" id="move-northeast" aria-keyshortcuts="e" class="direction-btn">
              <span aria-hidden="true">↗</span> Northeast <kbd>E</kbd>
            </button>
            <button type="button" id="move-northwest" aria-keyshortcuts="q" class="direction-btn">
              <span aria-hidden="true">↖</span> Northwest <kbd>Q</kbd>
            </button>
            <button type="button" id="move-southeast" aria-keyshortcuts="d" class="direction-btn">
              <span aria-hidden="true">↘</span> Southeast <kbd>D</kbd>
            </button>
            <button type="button" id="move-southwest" aria-keyshortcuts="a" class="direction-btn">
              <span aria-hidden="true">↙</span> Southwest <kbd>A</kbd>
            </button>
          </div>
          
          <div class="control-group" role="group" aria-labelledby="map-controls">
            <h3 id="map-controls">Map Functions</h3>
            <button type="button" id="center-map" aria-keyshortcuts="c">
              <span aria-hidden="true">⊙</span> Center on Player <kbd>C</kbd>
            </button>
            <button type="button" id="toggle-route" aria-keyshortcuts="r">
              <span aria-hidden="true">🗺</span> Toggle Route Planning <kbd>R</kbd>
            </button>
            <button type="button" id="fast-travel" aria-keyshortcuts="f">
              <span aria-hidden="true">⚡</span> Fast Travel Menu <kbd>F</kbd>
            </button>
            <button type="button" id="location-info" aria-keyshortcuts="i">
              <span aria-hidden="true">ℹ</span> Location Details <kbd>I</kbd>
            </button>
          </div>
        </nav>
        
        <section class="overworld-map-section" aria-labelledby="map-title">
          <h2 id="map-title" class="visually-hidden">Interactive World Map</h2>
          <div id="overworld-map" class="overworld-map" role="img" 
               aria-labelledby="map-title" aria-describedby="map-description" 
               tabindex="0">
            <div id="map-description" class="visually-hidden">
              ASCII representation of the world map showing biomes, locations, and your current position
            </div>
          </div>
          <div class="map-legend" role="region" aria-labelledby="legend-title">
            <h3 id="legend-title">Map Legend</h3>
            <dl class="legend-list">
              <dt>@ <span class="legend-desc">Player position</span></dt>
              <dt>⌂ <span class="legend-desc">Town</span></dt>
              <dt>⚕ <span class="legend-desc">Dungeon</span></dt>
              <dt>★ <span class="legend-desc">Landmark</span></dt>
              <dt>♠ <span class="legend-desc">Forest</span></dt>
              <dt>▲ <span class="legend-desc">Mountains</span></dt>
              <dt>∴ <span class="legend-desc">Desert</span></dt>
              <dt>≋ <span class="legend-desc">Swamp</span></dt>
              <dt>. <span class="legend-desc">Plains</span></dt>
              <dt>♣ <span class="legend-desc">Jungle</span></dt>
              <dt>" <span class="legend-desc">Savanna</span></dt>
              <dt>❄ <span class="legend-desc">Snow peaks</span></dt>
            </dl>
          </div>
        </section>
        
        <aside class="overworld-info" role="complementary" aria-labelledby="info-title">
          <h2 id="info-title">Location Information</h2>
          <div id="current-biome" class="info-section">
            <h3>Current Biome</h3>
            <div id="biome-details" aria-live="polite">
              No location selected
            </div>
          </div>
          <div id="travel-options" class="info-section">
            <h3>Travel Options</h3>
            <div id="travel-details" aria-live="polite">
              Select a destination to see travel options
            </div>
          </div>
          <div id="discovered-locations" class="info-section">
            <h3>Discovered Locations</h3>
            <ul id="locations-list" role="list">
              <li>No locations discovered yet</li>
            </ul>
          </div>
        </aside>
      </div>
      
      <div class="overworld-status" aria-live="assertive" aria-atomic="true" 
           class="visually-hidden" id="announcements">
      </div>
    `;
    
    this.container.appendChild(layout);
    
    // Store references to key elements
    this.mapCanvas = document.getElementById('overworld-map')!;
    this.infoPanel = document.querySelector('.overworld-info')!;
    this.navigationControls = document.querySelector('.overworld-controls')!;
    this.locationDetails = document.getElementById('biome-details')!;
    this.announcements = document.getElementById('announcements')!;
  }

  /**
   * Set up comprehensive accessibility features
   */
  private setupAccessibility(): void {
    // Collect all focusable elements for keyboard navigation
    this.focusableElements = Array.from(
      this.container.querySelectorAll(
        'button, [tabindex="0"], [tabindex="-1"]'
      )
    ) as HTMLElement[];
    
    // Set up roving tabindex for map navigation
    this.mapCanvas.addEventListener('keydown', this.handleMapKeydown.bind(this));
    this.mapCanvas.addEventListener('click', this.handleMapClick.bind(this));
    
    // Add focus indicators and screen reader announcements
    this.focusableElements.forEach(element => {
      element.addEventListener('focus', this.handleFocus.bind(this));
      element.addEventListener('blur', this.handleBlur.bind(this));
    });
    
    // Set up ARIA live regions for dynamic content updates
    const statusElement = document.getElementById('location-status')!;
    statusElement.setAttribute('aria-live', 'polite');
    statusElement.setAttribute('aria-atomic', 'true');
  }

  /**
   * Comprehensive keyboard navigation following WCAG 2.1 guidelines
   */
  private setupKeyboardNavigation(): void {
    // Movement keys (WASD + QE for hex directions)
    this.keyBindings.set('KeyW', () => this.movePlayer('north'));
    this.keyBindings.set('KeyS', () => this.movePlayer('south')); 
    this.keyBindings.set('KeyA', () => this.movePlayer('southwest'));
    this.keyBindings.set('KeyD', () => this.movePlayer('southeast'));
    this.keyBindings.set('KeyQ', () => this.movePlayer('northwest'));
    this.keyBindings.set('KeyE', () => this.movePlayer('northeast'));
    
    // Arrow keys for viewport navigation
    this.keyBindings.set('ArrowUp', () => this.panView('north'));
    this.keyBindings.set('ArrowDown', () => this.panView('south'));
    this.keyBindings.set('ArrowLeft', () => this.panView('west'));
    this.keyBindings.set('ArrowRight', () => this.panView('east'));
    
    // Utility functions
    this.keyBindings.set('KeyC', () => this.centerOnPlayer());
    this.keyBindings.set('KeyR', () => this.toggleRouteMode()); 
    this.keyBindings.set('KeyF', () => this.openFastTravelMenu());
    this.keyBindings.set('KeyI', () => this.showLocationInfo());
    this.keyBindings.set('KeyM', () => this.focusMap());
    this.keyBindings.set('Escape', () => this.cancelCurrentAction());
    
    // Space/Enter for selection
    this.keyBindings.set('Space', () => this.selectCurrentLocation());
    this.keyBindings.set('Enter', () => this.confirmAction());
    
    // Global keyboard event handler
    this.container.addEventListener('keydown', (event) => {
      // Don't interfere with form inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      const handler = this.keyBindings.get(event.code);
      if (handler) {
        event.preventDefault();
        handler();
      }
    });
    
    // Button click handlers
    document.getElementById('move-north')?.addEventListener('click', () => this.movePlayer('north'));
    document.getElementById('move-south')?.addEventListener('click', () => this.movePlayer('south'));
    document.getElementById('move-northeast')?.addEventListener('click', () => this.movePlayer('northeast'));
    document.getElementById('move-northwest')?.addEventListener('click', () => this.movePlayer('northwest'));
    document.getElementById('move-southeast')?.addEventListener('click', () => this.movePlayer('southeast'));
    document.getElementById('move-southwest')?.addEventListener('click', () => this.movePlayer('southwest'));
    
    document.getElementById('center-map')?.addEventListener('click', () => this.centerOnPlayer());
    document.getElementById('toggle-route')?.addEventListener('click', () => this.toggleRouteMode());
    document.getElementById('fast-travel')?.addEventListener('click', () => this.openFastTravelMenu());
    document.getElementById('location-info')?.addEventListener('click', () => this.showLocationInfo());
  }

  /**
   * Render the complete overworld map display
   */
  private render(): void {
    this.renderMap();
    this.renderLocationInfo();
    this.renderTravelOptions();
    this.renderDiscoveredLocations();
    this.updateAccessibleDescription();
  }

  /**
   * Render the ASCII hex map with biomes and locations
   */
  private renderMap(): void {
    const mapContent = document.createElement('div');
    mapContent.className = 'map-grid';
    mapContent.setAttribute('role', 'grid');
    mapContent.setAttribute('aria-label', 'World map grid');
    
    // Calculate visible hex coordinates based on current view center
    const visibleHexes = this.calculateVisibleHexes();
    
    // Create the ASCII grid representation
    for (let row = 0; row < this.config.mapHeight; row++) {
      const rowElement = document.createElement('div');
      rowElement.className = 'map-row';
      rowElement.setAttribute('role', 'row');
      
      let rowContent = '';
      
      for (let col = 0; col < this.config.mapWidth; col++) {
        const hexCoord = this.screenToHex(col, row);
        const biome = this.generator.getBiome(hexCoord);
        const char = this.getDisplayCharacter(hexCoord, biome);
        const color = this.getDisplayColor(hexCoord, biome);
        
        rowContent += `<span class="map-cell" 
          style="color: ${color}" 
          data-coord="${hexCoord.q},${hexCoord.r}"
          role="gridcell"
          tabindex="-1"
          aria-label="${this.getCellAriaLabel(hexCoord, biome)}">${char}</span>`;
      }
      
      rowElement.innerHTML = rowContent;
      mapContent.appendChild(rowElement);
    }
    
    this.mapCanvas.innerHTML = '';
    this.mapCanvas.appendChild(mapContent);
  }

  /**
   * Convert screen coordinates to hex coordinates
   */
  private screenToHex(screenX: number, screenY: number): HexCoordinate {
    // Convert from screen space to hex coordinate space
    // Accounting for hex grid offset and current view center
    const offsetX = screenX - this.config.centerX;
    const offsetY = screenY - this.config.centerY;
    
    // Simple offset hex calculation - in production would use proper hex math
    const q = this.navigationState.viewCenter.q + Math.floor(offsetX * 0.5);
    const r = this.navigationState.viewCenter.r + offsetY;
    const s = -q - r;
    
    return { q, r, s };
  }

  /**
   * Get the appropriate display character for a hex location
   */
  private getDisplayCharacter(coord: HexCoordinate, biome: Biome | null): string {
    // Check if this is the player's current location
    if (this.coordEquals(coord, this.navigationState.currentLocation)) {
      return this.LOCATION_CHARS.player;
    }
    
    // Check if this is the selected location
    if (this.navigationState.selectedLocation && 
        this.coordEquals(coord, this.navigationState.selectedLocation)) {
      return this.LOCATION_CHARS.selected;
    }
    
    // Check for locations (towns, dungeons, landmarks)
    const location = this.getLocationAtCoordinate(coord);
    if (location) {
      if (!location.isDiscovered) {
        return biome?.visualChar || '.';
      }
      
      switch (location.type) {
        case 'town': return this.LOCATION_CHARS.town;
        case 'dungeon': return this.LOCATION_CHARS.dungeon;
        default: return this.LOCATION_CHARS.landmark;
      }
    }
    
    // Show route markers if in route planning mode
    if (this.navigationState.isRouteMode && this.isOnTravelPath(coord)) {
      return this.LOCATION_CHARS.route;
    }
    
    // Default to biome character
    return biome?.visualChar || '.';
  }

  /**
   * Get appropriate color for display character
   */
  private getDisplayColor(coord: HexCoordinate, biome: Biome | null): string {
    // Player location is always bright green
    if (this.coordEquals(coord, this.navigationState.currentLocation)) {
      return '#00ff00';
    }
    
    // Selected location is bright yellow
    if (this.navigationState.selectedLocation && 
        this.coordEquals(coord, this.navigationState.selectedLocation)) {
      return '#ffff00';
    }
    
    // Locations have special colors
    const location = this.getLocationAtCoordinate(coord);
    if (location && location.isDiscovered) {
      switch (location.type) {
        case 'town': return '#00ffff';
        case 'dungeon': return '#ff0000'; 
        default: return '#ff00ff';
      }
    }
    
    // Route path is bright blue
    if (this.navigationState.isRouteMode && this.isOnTravelPath(coord)) {
      return '#0080ff';
    }
    
    // Use biome color
    return biome?.color || '#808080';
  }

  /**
   * Generate accessible description for a map cell
   */
  private getCellAriaLabel(coord: HexCoordinate, biome: Biome | null): string {
    let description = '';
    
    // Location type and position
    if (this.coordEquals(coord, this.navigationState.currentLocation)) {
      description = 'Your current location, ';
    } else if (this.navigationState.selectedLocation && 
               this.coordEquals(coord, this.navigationState.selectedLocation)) {
      description = 'Selected location, ';
    }
    
    // Check for special locations
    const location = this.getLocationAtCoordinate(coord);
    if (location) {
      if (location.isDiscovered) {
        description += `${location.type} named ${location.name}, `;
      } else {
        description += 'Undiscovered location, ';
      }
    }
    
    // Biome information
    if (biome) {
      description += `${biome.type} biome`;
      if (biome.elevation > 0.7) {
        description += ', high elevation';
      } else if (biome.elevation < 0.3) {
        description += ', low elevation';
      }
      
      if (biome.movementCost > 2) {
        description += ', difficult terrain';
      } else if (biome.movementCost < 1.5) {
        description += ', easy terrain';
      }
    } else {
      description += 'unknown terrain';
    }
    
    return description;
  }

  /**
   * Update location information panel
   */
  private renderLocationInfo(): void {
    const currentBiome = this.generator.getBiome(this.navigationState.currentLocation);
    if (!currentBiome) return;
    
    const biomeInfo = `
      <div class="biome-info">
        <h4>${this.formatBiomeName(currentBiome.type)}</h4>
        <p><strong>Elevation:</strong> ${this.formatElevation(currentBiome.elevation)}</p>
        <p><strong>Climate:</strong> ${this.formatClimate(currentBiome.temperature, currentBiome.moisture)}</p>
        <p><strong>Movement Cost:</strong> ${currentBiome.movementCost.toFixed(1)}x</p>
        ${currentBiome.resources.length > 0 ? `
          <p><strong>Resources:</strong> ${currentBiome.resources.join(', ')}</p>
        ` : ''}
        ${currentBiome.encounters.length > 0 ? `
          <p><strong>Potential Encounters:</strong> ${currentBiome.encounters.join(', ')}</p>
        ` : ''}
      </div>
    `;
    
    this.locationDetails.innerHTML = biomeInfo;
  }

  /**
   * Update travel options display
   */
  private renderTravelOptions(): void {
    const travelContainer = document.getElementById('travel-details')!;
    
    if (!this.navigationState.selectedLocation) {
      travelContainer.innerHTML = 'Select a destination to see travel options';
      return;
    }
    
    const travelOptions = this.calculateTravelOptions(
      this.navigationState.currentLocation,
      this.navigationState.selectedLocation
    );
    
    if (travelOptions.length === 0) {
      travelContainer.innerHTML = 'No travel options available to selected location';
      return;
    }
    
    const optionsHtml = travelOptions.map(option => `
      <div class="travel-option">
        <h4>Direct Travel</h4>
        <p><strong>Distance:</strong> ${option.movementCost.toFixed(1)} movement points</p>
        <p><strong>Encounter Chance:</strong> ${(option.encounterChance * 100).toFixed(0)}%</p>
        <p><strong>Estimated Time:</strong> ${option.estimatedTime} hours</p>
        ${option.requiredSupplies.length > 0 ? `
          <p><strong>Required Supplies:</strong> ${option.requiredSupplies.join(', ')}</p>
        ` : ''}
        <button type="button" class="travel-confirm-btn" aria-keyshortcuts="t">
          Travel Here <kbd>T</kbd>
        </button>
      </div>
    `).join('');
    
    travelContainer.innerHTML = optionsHtml;
    
    // Add event listeners for travel buttons
    travelContainer.querySelectorAll('.travel-confirm-btn').forEach(btn => {
      btn.addEventListener('click', () => this.startTravel());
    });
  }

  /**
   * Update discovered locations list
   */
  private renderDiscoveredLocations(): void {
    const locationsList = document.getElementById('locations-list')!;
    const discoveredLocations = this.generator.getDiscoveredLocations();
    
    if (discoveredLocations.length === 0) {
      locationsList.innerHTML = '<li>No locations discovered yet</li>';
      return;
    }
    
    const locationsHtml = discoveredLocations
      .map(location => `
        <li class="discovered-location">
          <button type="button" class="location-btn" 
                  data-coord="${location.coordinate.q},${location.coordinate.r}"
                  aria-describedby="loc-${location.id}">
            <span class="location-icon" aria-hidden="true">
              ${location.type === 'town' ? '⌂' : location.type === 'dungeon' ? '⚕' : '★'}
            </span>
            ${location.name}
          </button>
          <div id="loc-${location.id}" class="location-description">
            ${location.type} in ${location.biome} biome
          </div>
        </li>
      `)
      .join('');
    
    locationsList.innerHTML = locationsHtml;
    
    // Add click handlers for fast travel
    locationsList.querySelectorAll('.location-btn').forEach(btn => {
      btn.addEventListener('click', (event) => {
        const target = event.currentTarget as HTMLElement;
        const coordStr = target.dataset.coord!;
        const [q, r] = coordStr.split(',').map(Number);
        this.selectLocation({ q, r, s: -q - r });
      });
    });
  }

  // Movement and navigation methods

  private movePlayer(direction: string): void {
    const newLocation = this.calculateMovement(this.navigationState.currentLocation, direction);
    
    if (!this.isValidLocation(newLocation)) {
      this.announce('Cannot move in that direction');
      return;
    }
    
    const biome = this.generator.getBiome(newLocation);
    if (!biome) {
      this.announce('Cannot move to unknown terrain');
      return;
    }
    
    // Update player position
    this.navigationState.currentLocation = newLocation;
    
    // Center view on player if they've moved far from center
    const distance = this.calculateDistance(newLocation, this.navigationState.viewCenter);
    if (distance > this.config.viewportRadius * 0.7) {
      this.navigationState.viewCenter = newLocation;
    }
    
    // Check for location discoveries
    const discoveredLocations = this.generator.getDiscoverableLocations(newLocation);
    discoveredLocations.forEach(location => {
      if (this.generator.discoverLocation(location.id)) {
        this.announce(`Discovered ${location.name}, a ${location.type}`);
      }
    });
    
    // Update status and re-render
    this.updateLocationStatus();
    this.render();
  }

  private panView(direction: string): void {
    const newCenter = this.calculateMovement(this.navigationState.viewCenter, direction);
    this.navigationState.viewCenter = newCenter;
    this.render();
    this.announce(`View moved ${direction}`);
  }

  private centerOnPlayer(): void {
    this.navigationState.viewCenter = { ...this.navigationState.currentLocation };
    this.render();
    this.announce('View centered on player');
  }

  private selectLocation(coord: HexCoordinate): void {
    this.navigationState.selectedLocation = coord;
    this.render();
    
    const biome = this.generator.getBiome(coord);
    const location = this.getLocationAtCoordinate(coord);
    
    let announcement = `Selected location: ${this.formatBiomeName(biome?.type || 'unknown')} biome`;
    if (location && location.isDiscovered) {
      announcement = `Selected ${location.name}, a ${location.type} in ${this.formatBiomeName(biome?.type || 'unknown')} biome`;
    }
    
    this.announce(announcement);
  }

  private toggleRouteMode(): void {
    this.navigationState.isRouteMode = !this.navigationState.isRouteMode;
    
    if (this.navigationState.isRouteMode) {
      this.announce('Route planning mode enabled. Select destination.');
    } else {
      this.navigationState.travelPath = undefined;
      this.announce('Route planning mode disabled');
    }
    
    this.render();
  }

  private openFastTravelMenu(): void {
    const discoveredLocations = this.generator.getDiscoveredLocations();
    
    if (discoveredLocations.length === 0) {
      this.announce('No fast travel destinations available');
      return;
    }
    
    this.announce(`Fast travel menu opened. ${discoveredLocations.length} destinations available.`);
    
    // Focus on the discovered locations list
    const locationsList = document.getElementById('locations-list')!;
    const firstLocation = locationsList.querySelector('button');
    if (firstLocation) {
      firstLocation.focus();
    }
  }

  private showLocationInfo(): void {
    this.announce('Location information panel focused');
    this.infoPanel.scrollIntoView({ behavior: 'smooth' });
    
    // Focus on the biome details
    const biomeDetails = document.getElementById('biome-details')!;
    if (biomeDetails.tabIndex === -1) {
      biomeDetails.tabIndex = 0;
    }
    biomeDetails.focus();
  }

  private focusMap(): void {
    this.mapCanvas.focus();
    this.announce('Map focused. Use arrow keys to explore or WASD to move player.');
  }

  private cancelCurrentAction(): void {
    if (this.navigationState.isRouteMode) {
      this.toggleRouteMode();
    } else if (this.navigationState.selectedLocation) {
      this.navigationState.selectedLocation = undefined;
      this.render();
      this.announce('Selection cleared');
    }
  }

  private selectCurrentLocation(): void {
    // This would be enhanced to work with map cursor in full implementation
    const coord = this.navigationState.currentLocation;
    this.selectLocation(coord);
  }

  private confirmAction(): void {
    if (this.navigationState.selectedLocation && this.navigationState.isRouteMode) {
      this.startTravel();
    }
  }

  private startTravel(): void {
    if (!this.navigationState.selectedLocation) {
      this.announce('No destination selected for travel');
      return;
    }
    
    const destination = this.navigationState.selectedLocation;
    const travelOptions = this.calculateTravelOptions(
      this.navigationState.currentLocation,
      destination
    );
    
    if (travelOptions.length === 0) {
      this.announce('Cannot travel to selected destination');
      return;
    }
    
    // For demo purposes, immediately move to destination
    // In full implementation, this would start a travel sequence
    this.navigationState.currentLocation = destination;
    this.navigationState.viewCenter = destination;
    this.navigationState.selectedLocation = undefined;
    this.navigationState.isRouteMode = false;
    
    const biome = this.generator.getBiome(destination);
    const location = this.getLocationAtCoordinate(destination);
    
    let announcement = `Traveled to ${this.formatBiomeName(biome?.type || 'unknown')} biome`;
    if (location && location.isDiscovered) {
      announcement = `Arrived at ${location.name}`;
    }
    
    this.announce(announcement);
    this.updateLocationStatus();
    this.render();
  }

  // Helper methods

  private calculateMovement(from: HexCoordinate, direction: string): HexCoordinate {
    // Hex grid movement calculations
    const { q, r } = from;
    
    switch (direction) {
      case 'north': return { q, r: r - 1, s: -q - (r - 1) };
      case 'south': return { q, r: r + 1, s: -q - (r + 1) };
      case 'northeast': return { q: q + 1, r: r - 1, s: -(q + 1) - (r - 1) };
      case 'northwest': return { q: q - 1, r, s: -(q - 1) - r };
      case 'southeast': return { q: q + 1, r, s: -(q + 1) - r };
      case 'southwest': return { q: q - 1, r: r + 1, s: -(q - 1) - (r + 1) };
      case 'east': return { q: q + 1, r: r - 1, s: -(q + 1) - (r - 1) };
      case 'west': return { q: q - 1, r: r + 1, s: -(q - 1) - (r + 1) };
      default: return from;
    }
  }

  private calculateDistance(a: HexCoordinate, b: HexCoordinate): number {
    return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
  }

  private calculateVisibleHexes(): HexCoordinate[] {
    // Return array of hex coordinates visible in current viewport
    const hexes: HexCoordinate[] = [];
    const center = this.navigationState.viewCenter;
    const radius = Math.max(this.config.mapWidth, this.config.mapHeight);
    
    for (let q = center.q - radius; q <= center.q + radius; q++) {
      for (let r = center.r - radius; r <= center.r + radius; r++) {
        const s = -q - r;
        if (Math.abs(q) <= radius && Math.abs(r) <= radius && Math.abs(s) <= radius) {
          hexes.push({ q, r, s });
        }
      }
    }
    
    return hexes;
  }

  private calculateTravelOptions(from: HexCoordinate, to: HexCoordinate): TravelOption[] {
    const distance = this.calculateDistance(from, to);
    const fromBiome = this.generator.getBiome(from);
    const toBiome = this.generator.getBiome(to);
    
    if (!fromBiome || !toBiome) return [];
    
    const baseCost = distance * Math.max(fromBiome.movementCost, toBiome.movementCost);
    const encounterChance = Math.min(0.8, distance * 0.1);
    const estimatedTime = Math.ceil(baseCost * 2); // 2 hours per movement point
    
    return [{
      destination: to,
      movementCost: baseCost,
      encounterChance,
      estimatedTime,
      requiredSupplies: baseCost > 10 ? ['Food', 'Water'] : []
    }];
  }

  private isValidLocation(coord: HexCoordinate): boolean {
    // Check if coordinate is within world bounds
    const worldRadius = 50; // Should come from config
    return Math.abs(coord.q) <= worldRadius && 
           Math.abs(coord.r) <= worldRadius && 
           Math.abs(coord.s) <= worldRadius;
  }

  private coordEquals(a: HexCoordinate, b: HexCoordinate): boolean {
    return a.q === b.q && a.r === b.r && a.s === b.s;
  }

  private getLocationAtCoordinate(coord: HexCoordinate): WorldLocation | null {
    // This would query the OverworldGenerator for locations
    // For now, return null as locations system needs integration
    return null;
  }

  private isOnTravelPath(coord: HexCoordinate): boolean {
    if (!this.navigationState.travelPath) return false;
    return this.navigationState.travelPath.some(pathCoord => 
      this.coordEquals(coord, pathCoord)
    );
  }

  private formatBiomeName(biomeType: string): string {
    return biomeType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private formatElevation(elevation: number): string {
    if (elevation > 0.8) return 'Very High';
    if (elevation > 0.6) return 'High';
    if (elevation > 0.4) return 'Moderate'; 
    if (elevation > 0.2) return 'Low';
    return 'Very Low';
  }

  private formatClimate(temperature: number, moisture: number): string {
    if (temperature > 0.7 && moisture > 0.6) return 'Hot and Humid';
    if (temperature > 0.7 && moisture < 0.3) return 'Hot and Dry';
    if (temperature < 0.3 && moisture > 0.6) return 'Cold and Wet';
    if (temperature < 0.3 && moisture < 0.3) return 'Cold and Dry';
    if (temperature > 0.5) return 'Warm';
    return 'Cool';
  }

  private updateLocationStatus(): void {
    const statusElement = document.getElementById('location-status')!;
    const biome = this.generator.getBiome(this.navigationState.currentLocation);
    const location = this.getLocationAtCoordinate(this.navigationState.currentLocation);
    
    let status = `Current location: ${this.formatBiomeName(biome?.type || 'Unknown')} biome`;
    if (location && location.isDiscovered) {
      status = `Current location: ${location.name} (${location.type})`;
    }
    
    statusElement.textContent = status;
  }

  private updateAccessibleDescription(): void {
    const mapDescription = document.getElementById('map-description')!;
    const currentBiome = this.generator.getBiome(this.navigationState.currentLocation);
    const location = this.getLocationAtCoordinate(this.navigationState.currentLocation);
    
    let description = `ASCII representation of the world map. You are currently in a ${this.formatBiomeName(currentBiome?.type || 'unknown')} biome`;
    
    if (location && location.isDiscovered) {
      description += ` at ${location.name}, a ${location.type}`;
    }
    
    description += '. Use WASD keys to move your character, arrow keys to pan the view, or mouse to click on locations.';
    
    if (this.navigationState.isRouteMode) {
      description += ' Route planning mode is active - select a destination to plan travel.';
    }
    
    mapDescription.textContent = description;
  }

  private announce(message: string): void {
    this.announcements.textContent = message;
    
    // Clear announcement after a delay to prepare for next announcement
    setTimeout(() => {
      this.announcements.textContent = '';
    }, 1000);
  }

  private handleMapKeydown(event: KeyboardEvent): void {
    // Prevent default behavior for navigation keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Enter'].includes(event.code)) {
      event.preventDefault();
    }
    
    // Handle map-specific navigation
    if (event.code === 'Space') {
      this.selectCurrentLocation();
    } else if (event.code === 'Enter') {
      this.confirmAction();
    }
  }

  private handleMapClick(event: MouseEvent): void {
    // Calculate clicked hex coordinate based on mouse position
    // This is a simplified version - production would use proper coordinate mapping
    const rect = this.mapCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const cellWidth = rect.width / this.config.mapWidth;
    const cellHeight = rect.height / this.config.mapHeight;
    
    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);
    
    const clickedCoord = this.screenToHex(col, row);
    
    if (this.isValidLocation(clickedCoord)) {
      this.selectLocation(clickedCoord);
    }
  }

  private handleFocus(event: FocusEvent): void {
    const element = event.target as HTMLElement;
    
    // Add visual focus indicator
    element.classList.add('keyboard-focused');
    
    // Announce focused element for screen readers
    if (element.hasAttribute('aria-label')) {
      const label = element.getAttribute('aria-label');
      this.announce(`Focused: ${label}`);
    }
  }

  private handleBlur(event: FocusEvent): void {
    const element = event.target as HTMLElement;
    element.classList.remove('keyboard-focused');
  }

  // Public API methods

  /**
   * Set player's current location
   */
  public setPlayerLocation(coord: HexCoordinate): void {
    this.navigationState.currentLocation = coord;
    this.navigationState.viewCenter = coord;
    this.updateLocationStatus();
    this.render();
  }

  /**
   * Get player's current location
   */
  public getPlayerLocation(): HexCoordinate {
    return { ...this.navigationState.currentLocation };
  }

  /**
   * Show the overworld navigation interface
   */
  public show(): void {
    this.container.style.display = 'block';
    this.render();
    
    // Focus on the map for keyboard navigation
    setTimeout(() => {
      this.focusMap();
    }, 100);
  }

  /**
   * Hide the overworld navigation interface
   */
  public hide(): void {
    this.container.style.display = 'none';
  }

  /**
   * Update the UI when the overworld data changes
   */
  public refresh(): void {
    this.render();
  }
}