// Game Client - Main coordination class for the multiplayer ASCII roguelike
class GameClient {
    constructor() {
        // Core game state
        this.playerId = null;
        this.roomId = 'default';
        this.gameState = null;
        this.currentPlayer = null;
        this.playerAP = 0;
        this.maxAP = 8;
        this.turnTimer = 10;
        this.maxTurnTime = 10;
        this.initiative = [];
        this.messages = [];
        this.selectedAction = null;
        this.targetingMode = false;
        this.targetPosition = null;
        
        // Game map state
        this.gameMap = [];
        this.gridCols = GAME_CONSTANTS.GRID.DEFAULT_COLS;
        this.gridRows = GAME_CONSTANTS.GRID.DEFAULT_ROWS;
        this.playerPosition = null;
        this.resizeTimeout = null;
        
        // UI References
        this.mapContainer = null;
        this.uiContainer = null;
        this.asciiUIContainer = null;
        this.connectionStatus = null;
        
        // Modular components
        this.networkManager = null;
        this.inputHandler = null;
        this.uiManager = null;
        this.asciiUI = null;
        
        // Bind methods
        this.updateDisplay = this.updateDisplay.bind(this);
        this.handleResize = this.handleResize.bind(this);
    }

    async initialize() {
        console.log('Initializing AP System Game Client...');
        
        // Generate player ID
        this.playerId = GameUtils.generatePlayerId();
        
        // Initialize modular components
        this.networkManager = new NetworkManager(this);
        this.inputHandler = new InputHandler(this);
        this.uiManager = new UIManager(this);
        
        // Setup UI
        this.setupUI();
        
        // Connect to server
        await this.networkManager.connectToServer(this.roomId, this.playerId);
        
        console.log('Game client initialized successfully');
    }

    setupUI() {
        // Get UI containers
        this.mapContainer = document.querySelector('.game-map-container');
        this.uiContainer = document.getElementById('ui-container');
        this.asciiUIContainer = document.getElementById('ascii-ui-container');
        this.connectionStatus = document.getElementById('connection-status');
        
        // Set connection status reference for network manager
        this.networkManager.setConnectionStatusElement(this.connectionStatus);
        
        // Create game map
        this.createGameMap();
        
        // Initialize ASCII UI system
        this.initializeASCIIUI();
        
        // Initialize modern UI manager
        this.uiManager.initialize(this.uiContainer);
        
        // Initial render
        this.updateDisplay();
    }

    createGameMap() {
        // Create main game canvas
        const canvas = document.createElement('div');
        canvas.className = 'game-map-canvas';
        canvas.id = 'game-map';
        
        // Fixed grid size for dungeon  
        this.gridCols = GAME_CONSTANTS.GRID.DEFAULT_COLS;
        this.gridRows = GAME_CONSTANTS.GRID.DEFAULT_ROWS;
        
        // Create dynamic grid
        this.gameMap = [];
        for (let y = 0; y < this.gridRows; y++) {
            const row = document.createElement('div');
            row.className = 'map-row';
            this.gameMap[y] = [];
            
            for (let x = 0; x < this.gridCols; x++) {
                const cell = document.createElement('div');
                cell.className = 'map-cell';
                cell.style.left = `${x}ch`;
                cell.textContent = GAME_CONSTANTS.TERRAIN.WALL; // Default to wall
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                row.appendChild(cell);
                this.gameMap[y][x] = cell;
            }
            canvas.appendChild(row);
        }
        
        // Attach input handlers
        this.inputHandler.attachMapClickHandlers(this.gameMap);
        
        // Add player at center (dynamically positioned)
        this.playerPosition = { x: Math.floor(this.gridCols / 2), y: Math.floor(this.gridRows / 2) };
        this.gameMap[this.playerPosition.y][this.playerPosition.x].textContent = GAME_CONSTANTS.TERRAIN.PLAYER;
        this.gameMap[this.playerPosition.y][this.playerPosition.x].style.color = GAME_CONSTANTS.COLORS.PLAYER_SELF;
        
        // Add some walls for testing (scaled for dynamic map)
        const wallY1 = Math.floor(this.gridRows * 0.25);
        const wallY2 = Math.floor(this.gridRows * 0.75);
        const wallStartX = Math.floor(this.gridCols * 0.2);
        const wallEndX = Math.floor(this.gridCols * 0.8);
        
        for (let i = wallStartX; i < wallEndX; i++) {
            if (this.gameMap[wallY1] && this.gameMap[wallY1][i]) {
                this.gameMap[wallY1][i].textContent = '#';
                this.gameMap[wallY1][i].style.color = '#666666';
            }
            if (this.gameMap[wallY2] && this.gameMap[wallY2][i]) {
                this.gameMap[wallY2][i].textContent = '#';
                this.gameMap[wallY2][i].style.color = '#666666';
            }
        }
        
        this.mapContainer.appendChild(canvas);
        
        // Add resize listener for dynamic updates
        window.addEventListener('resize', this.handleResize);
    }

    handleResize() {
        // Debounce resize events
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.recreateGameMap();
        }, 250);
    }

    recreateGameMap() {
        // Store current player position
        const currentPlayerPos = this.playerPosition;
        
        // Remove old input handlers
        this.inputHandler.removeMapClickHandlers(this.gameMap);
        
        // Clear existing map
        const existingCanvas = document.getElementById('game-map');
        if (existingCanvas) {
            existingCanvas.remove();
        }
        
        // Recreate map with new dimensions
        this.createGameMap();
        
        // Restore player position (adjusted for new grid if necessary)
        if (currentPlayerPos) {
            const newX = Math.min(currentPlayerPos.x, this.gridCols - 1);
            const newY = Math.min(currentPlayerPos.y, this.gridRows - 1);
            
            // Clear old position if it exists
            if (this.gameMap[currentPlayerPos.y] && this.gameMap[currentPlayerPos.y][currentPlayerPos.x]) {
                this.gameMap[currentPlayerPos.y][currentPlayerPos.x].textContent = '.';
                this.gameMap[currentPlayerPos.y][currentPlayerPos.x].style.color = '#404040';
            }
            
            // Set new position
            this.playerPosition = { x: newX, y: newY };
            this.gameMap[newY][newX].textContent = '@';
            this.gameMap[newY][newX].style.color = '#00ff00';
        }
        
        // Refresh display
        this.updateDisplay();
    }

    // Game state handlers called by NetworkManager
    handleGameState(gameState) {
        if (gameState.dungeon && gameState.dungeon.map) {
            this.renderDungeon(gameState.dungeon.map);
        }
        
        if (gameState.enemies) {
            this.renderEnemies(gameState.enemies);
        }
        
        if (gameState.items) {
            this.renderItems(gameState.items);
        }
        
        if (gameState.players) {
            this.renderPlayers(gameState.players);
        }
    }

    handleGameStateUpdate(data) {
        this.gameState = data;
        this.updateDisplay();
    }

    handleTurnUpdate(data) {
        this.currentPlayer = data.currentPlayer;
        this.turnTimer = data.timeRemaining;
        this.initiative = data.initiative || [];
        this.updateTurnDisplay();
    }

    handleActionResult(data) {
        if (data.success) {
            this.addMessage(data.message || 'Action successful');
        } else {
            this.addMessage(`Action failed: ${data.reason}`);
        }
    }

    handleAPUpdate(data) {
        this.playerAP = data.current;
        this.maxAP = data.max;
        this.updateAPDisplay();
        
        // Add AP change message
        this.addMessage(`AP updated: ${data.current}/${data.max}`);
    }

    // Render methods
    renderDungeon(dungeonMap) {
        for (let y = 0; y < this.gridRows && y < dungeonMap.length; y++) {
            for (let x = 0; x < this.gridCols && x < dungeonMap[y].length; x++) {
                const cell = this.gameMap[y][x];
                const cellType = dungeonMap[y][x];
                
                // Set cell character based on type
                switch(cellType) {
                    case 'wall':
                        cell.textContent = GAME_CONSTANTS.TERRAIN.WALL;
                        cell.style.color = GAME_CONSTANTS.COLORS.WALL;
                        break;
                    case 'floor':
                        cell.textContent = GAME_CONSTANTS.TERRAIN.FLOOR;
                        cell.style.color = GAME_CONSTANTS.COLORS.FLOOR;
                        break;
                    case 'door':
                        cell.textContent = GAME_CONSTANTS.TERRAIN.DOOR;
                        cell.style.color = GAME_CONSTANTS.COLORS.DOOR;
                        break;
                    case 'stairs_up':
                        cell.textContent = GAME_CONSTANTS.TERRAIN.STAIRS_UP;
                        cell.style.color = GAME_CONSTANTS.COLORS.STAIRS_UP;
                        break;
                    case 'stairs_down':
                        cell.textContent = GAME_CONSTANTS.TERRAIN.STAIRS_DOWN;
                        cell.style.color = GAME_CONSTANTS.COLORS.STAIRS_DOWN;
                        break;
                    case 'water':
                        cell.textContent = GAME_CONSTANTS.TERRAIN.WATER;
                        cell.style.color = GAME_CONSTANTS.COLORS.WATER;
                        break;
                    case 'trap':
                        cell.textContent = GAME_CONSTANTS.TERRAIN.LAVA;
                        cell.style.color = GAME_CONSTANTS.COLORS.LAVA;
                        break;
                    case 'pillar':
                        cell.textContent = GAME_CONSTANTS.TERRAIN.ROCK;
                        cell.style.color = GAME_CONSTANTS.COLORS.ROCK;
                        break;
                    default:
                        cell.textContent = cellType === 'wall' ? GAME_CONSTANTS.TERRAIN.WALL : GAME_CONSTANTS.TERRAIN.FLOOR;
                        cell.style.color = cellType === 'wall' ? GAME_CONSTANTS.COLORS.WALL : GAME_CONSTANTS.COLORS.FLOOR;
                }
            }
        }
    }

    renderEnemies(enemies) {
        enemies.forEach(enemy => {
            if (enemy.position.y < this.gridRows && enemy.position.x < this.gridCols) {
                const cell = this.gameMap[enemy.position.y][enemy.position.x];
                cell.textContent = enemy.symbol;
                cell.style.color = enemy.color;
                cell.title = `${enemy.type} (${enemy.health}/${enemy.maxHealth} HP)`;
            }
        });
    }

    renderItems(items) {
        items.forEach(item => {
            if (item.position.y < this.gridRows && item.position.x < this.gridCols) {
                const cell = this.gameMap[item.position.y][item.position.x];
                cell.textContent = item.symbol;
                cell.style.color = item.color;
                cell.title = item.name;
            }
        });
    }

    renderPlayers(players) {
        players.forEach(player => {
            if (player.position.y < this.gridRows && player.position.x < this.gridCols) {
                const cell = this.gameMap[player.position.y][player.position.x];
                cell.textContent = GAME_CONSTANTS.TERRAIN.PLAYER;
                cell.style.color = player.id === this.playerId ? GAME_CONSTANTS.COLORS.PLAYER_SELF : GAME_CONSTANTS.COLORS.PLAYER_OTHER;
                cell.title = `${player.name} (${player.health}/${player.maxHealth} HP)`;
                
                // Store player position
                if (player.id === this.playerId) {
                    this.playerPosition = { x: player.position.x, y: player.position.y };
                }
            }
        });
    }

    // Movement and action methods
    movePlayer(deltaX, deltaY) {
        // Handle both relative (dx, dy) and absolute (targetX, targetY) movement
        let newX, newY;
        
        if (typeof deltaX === 'object' && deltaX.x !== undefined) {
            // Absolute positioning
            newX = deltaX.x;
            newY = deltaX.y || deltaY;
        } else if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
            // Click-to-move (absolute coordinates)
            newX = deltaX;
            newY = deltaY;
        } else {
            // Relative movement
            newX = this.playerPosition.x + deltaX;
            newY = this.playerPosition.y + deltaY;
        }
        
        // Check bounds
        if (newX < 0 || newX >= this.gridCols || newY < 0 || newY >= this.gridRows) {
            this.addMessage('Cannot move outside the map!');
            return;
        }
        
        // Check for walls
        const targetCell = this.gameMap[newY][newX];
        if (targetCell.textContent === GAME_CONSTANTS.TERRAIN.WALL) {
            this.addMessage('Cannot move through walls!');
            return;
        }
        
        // For click-to-move, send network action
        if (!this.networkManager.isConnected()) {
            this.addMessage('Not connected to server');
            return;
        }

        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
            // Send movement command to server for click-to-move
            this.networkManager.sendMessage({
                type: 'AP_ACTION',
                data: {
                    type: 'AP_ABILITY',
                    playerId: this.playerId,
                    abilityId: 'tactical_move',
                    target: { x: newX, y: newY },
                    apCost: 1,
                    timestamp: Date.now()
                }
            });
        } else {
            // Local movement update and send free action
            this.updateLocalPlayerPosition(newX, newY);
            this.networkManager.sendFreeAction('MOVE', { x: newX, y: newY });
        }
        
        this.addMessage(`Moved to (${newX}, ${newY})`);
    }

    updateLocalPlayerPosition(newX, newY) {
        // Clear old position
        this.gameMap[this.playerPosition.y][this.playerPosition.x].textContent = GAME_CONSTANTS.TERRAIN.FLOOR;
        this.gameMap[this.playerPosition.y][this.playerPosition.x].style.color = GAME_CONSTANTS.COLORS.FLOOR;
        
        // Set new position
        this.playerPosition.x = newX;
        this.playerPosition.y = newY;
        this.gameMap[newY][newX].textContent = GAME_CONSTANTS.TERRAIN.PLAYER;
        this.gameMap[newY][newX].style.color = GAME_CONSTANTS.COLORS.PLAYER_SELF;
    }

    executeAction(actionType) {
        const cost = GameUtils.getActionAPCost(actionType);
        
        if (cost > this.playerAP) {
            this.addMessage(`Not enough AP! Need ${cost}, have ${this.playerAP}`);
            return;
        }
        
        // Execute free actions immediately
        if (cost === 0) {
            this.networkManager.sendFreeAction(actionType.toUpperCase());
        } else {
            // Send AP action to server
            this.networkManager.sendAPAction(actionType, cost);
        }
        
        // Update player AP for cost
        this.playerAP = Math.max(0, this.playerAP - cost);
        
        this.addMessage(`Used ${actionType.replace('_', ' ')} (${cost} AP)`);
        
        // Clear selection
        this.selectedAction = null;
        this.uiManager.clearActionSelection();
    }

    endTurn() {
        this.networkManager.sendMessage({
            type: 'END_TURN',
            playerId: this.playerId
        });
        this.addMessage('Turn ended');
    }

    useQuickAbility(number) {
        const abilities = ['power_strike', 'fireball', 'heal'];
        if (number <= abilities.length) {
            this.executeAction(abilities[number - 1]);
        }
    }

    toggleActionPanel() {
        this.uiManager.toggleActionPanel();
    }

    cancelAction() {
        this.selectedAction = null;
        this.targetingMode = false;
        this.targetPosition = null;
        
        this.uiManager.clearActionSelection();
        this.addMessage('Action cancelled');
    }

    selectTarget(x, y) {
        if (this.targetingMode) {
            this.targetPosition = { x, y };
            // Handle targeting logic here
        }
    }

    confirmTarget() {
        if (this.targetingMode && this.targetPosition) {
            // Execute targeted action
            this.targetingMode = false;
        }
    }

    // Display update methods
    updateDisplay() {
        this.updateAPDisplay();
        this.updateTurnDisplay();
        this.updateInitiativeDisplay();
        
        // Update ASCII UI if available
        if (this.asciiUI) {
            this.updateASCIIUI();
        }
    }

    updateAPDisplay() {
        this.uiManager.updateAPDisplay();
        
        // Update ASCII UI action menu
        if (this.asciiUI) {
            this.asciiUI.updateActionMenu(this.playerAP);
        }
    }

    updateTurnDisplay() {
        this.uiManager.updateTurnDisplay();
    }

    updateInitiativeDisplay() {
        this.uiManager.updateInitiativeDisplay();
    }

    addMessage(text) {
        this.messages.push(text);
        if (this.messages.length > 50) {
            this.messages.shift();
        }
        
        // Update ASCII UI message panel
        if (this.asciiUI) {
            this.asciiUI.updateMessages(this.messages);
        }
        
        // Update modern UI message log
        this.uiManager.addMessage(text);
        
        console.log('Game message:', text);
    }

    updateASCIIUI() {
        if (!this.asciiUI) return;
        
        // Update player stats
        const playerData = {
            name: this.playerId || 'Player',
            health: 180, // Placeholder - in real implementation this would come from server
            maxHealth: 180,
            currentAP: this.playerAP,
            maxAP: this.maxAP,
            position: this.playerPosition || { x: 30, y: 15 },
            movement: { remainingMovement: 3, maxMovement: 3 },
            skills: {
                combat: 85,
                swords: 92,
                fire_magic: 67,
                healing_magic: 34
            },
            equipment: {
                weapon: { name: 'Steel Longsword +2' },
                armor: { name: 'Chain Mail +1' }
            }
        };
        
        this.asciiUI.updatePlayerStats(playerData);
        
        // Update turn order
        const turnData = [{
            playerId: this.playerId,
            playerName: this.playerId,
            initiative: 22,
            currentAP: this.playerAP,
            health: 180,
            maxHealth: 180
        }];
        
        this.asciiUI.updateTurnOrder(turnData, this.currentPlayer || this.playerId);
    }

    initializeASCIIUI() {
        // Create ASCII UI Manager
        this.asciiUI = new ASCIIUIManager(this.asciiUIContainer);
        
        // Set up initial data
        const initialPlayerData = {
            name: this.playerId,
            health: 180,
            maxHealth: 180,
            currentAP: this.playerAP,
            maxAP: this.maxAP,
            position: this.playerPosition || { x: 30, y: 15 },
            movement: { remainingMovement: 3, maxMovement: 3 },
            skills: {
                combat: 85,
                swords: 92,
                fire_magic: 67,
                healing_magic: 34
            },
            equipment: {
                weapon: { name: 'Steel Longsword +2', damage: '2d6+3' },
                armor: { name: 'Chain Mail +1', ac: 15 }
            }
        };
        
        // Initialize panels
        this.asciiUI.updatePlayerStats(initialPlayerData);
        this.asciiUI.updateTurnOrder([{
            playerId: this.playerId,
            playerName: this.playerId,
            initiative: 22,
            currentAP: this.playerAP,
            health: 180,
            maxHealth: 180
        }], this.playerId);
        
        // Update action menu with initial AP
        this.asciiUI.updateActionMenu(this.playerAP);
        
        // Add initial welcome messages
        this.addMessage('Connected to server');
        this.addMessage('Game loaded successfully');
        this.addMessage('Use arrow keys to move');
        this.addMessage('Your turn begins!');
    }

    // Cleanup method
    destroy() {
        if (this.inputHandler) {
            this.inputHandler.destroy();
        }
        if (this.networkManager) {
            this.networkManager.disconnect();
        }
        window.removeEventListener('resize', this.handleResize);
    }
}

// Make available globally
window.GameClient = GameClient;