// AP System Game Client - Main Module
class GameClient {
    constructor() {
        this.ws = null;
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
        
        // UI References
        this.mapContainer = null;
        this.uiContainer = null;
        this.connectionStatus = null;
        
        // Bind methods
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleWebSocketMessage = this.handleWebSocketMessage.bind(this);
        this.updateDisplay = this.updateDisplay.bind(this);
    }

    async initialize() {
        console.log('Initializing AP System Game Client...');
        
        // Generate player ID
        this.playerId = `player_${Math.random().toString(36).substr(2, 9)}`;
        
        // Setup UI
        this.setupUI();
        
        // Setup input handling
        this.setupInputHandling();
        
        // Connect to server
        await this.connectToServer();
        
        console.log('Game client initialized successfully');
    }

    setupUI() {
        // Get UI containers
        this.mapContainer = document.querySelector('.game-map-container');
        this.uiContainer = document.getElementById('ui-container');
        this.connectionStatus = document.getElementById('connection-status');
        
        // Create game map
        this.createGameMap();
        
        // Create UI panels
        this.createUIComponents();
        
        // Initial render
        this.updateDisplay();
    }

    createGameMap() {
        // Create main game canvas
        const canvas = document.createElement('div');
        canvas.className = 'game-map-canvas';
        canvas.id = 'game-map';
        
        // Calculate dynamic grid size based on available space
        const { cols, rows } = this.calculateGridDimensions();
        
        // Store grid dimensions for other methods
        this.gridCols = cols;
        this.gridRows = rows;
        
        // Create dynamic grid
        this.gameMap = [];
        for (let y = 0; y < rows; y++) {
            const row = document.createElement('div');
            row.className = 'map-row';
            this.gameMap[y] = [];
            
            for (let x = 0; x < cols; x++) {
                const cell = document.createElement('div');
                cell.className = 'map-cell';
                cell.style.left = `${x}ch`;
                cell.textContent = '.';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                // Add click handler for targeting
                cell.addEventListener('click', (e) => {
                    if (this.targetingMode) {
                        this.selectTarget(parseInt(e.target.dataset.x), parseInt(e.target.dataset.y));
                    }
                });
                
                row.appendChild(cell);
                this.gameMap[y][x] = cell;
            }
            canvas.appendChild(row);
        }
        
        // Add player at center (dynamically positioned)
        this.playerPosition = { x: Math.floor(cols / 2), y: Math.floor(rows / 2) };
        this.gameMap[this.playerPosition.y][this.playerPosition.x].textContent = '@';
        this.gameMap[this.playerPosition.y][this.playerPosition.x].style.color = '#00ff00';
        
        // Add some walls for testing (scaled for dynamic map)
        const wallY1 = Math.floor(rows * 0.25);
        const wallY2 = Math.floor(rows * 0.75);
        const wallStartX = Math.floor(cols * 0.2);
        const wallEndX = Math.floor(cols * 0.8);
        
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
        window.addEventListener('resize', () => this.handleResize());
    }

    calculateGridDimensions() {
        // Wait for DOM to be ready
        if (!this.mapContainer) {
            return { cols: 75, rows: 25 }; // fallback
        }
        
        // Get actual container dimensions
        const containerRect = this.mapContainer.getBoundingClientRect();
        const availableWidth = containerRect.width - 10; // padding
        const availableHeight = containerRect.height - 10;
        
        // Get computed font size from CSS
        const tempElement = document.createElement('div');
        tempElement.className = 'game-map-canvas';
        tempElement.style.visibility = 'hidden';
        tempElement.style.position = 'absolute';
        document.body.appendChild(tempElement);
        
        const computedStyle = getComputedStyle(tempElement);
        const fontSize = parseFloat(computedStyle.fontSize) || 12;
        
        document.body.removeChild(tempElement);
        
        // Calculate character dimensions (monospace)
        const charWidth = fontSize * 0.6; // typical monospace ratio
        const lineHeight = fontSize * 1.2; // line height
        
        // Calculate grid dimensions
        const cols = Math.max(Math.floor(availableWidth / charWidth), 60); // minimum 60 cols
        const rows = Math.max(Math.floor(availableHeight / lineHeight), 20); // minimum 20 rows
        
        console.log(`Dynamic grid: ${cols}x${rows} (container: ${availableWidth}x${availableHeight}, font: ${fontSize}px)`);
        
        return { cols, rows };
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

    createUIComponents() {
        this.uiContainer.innerHTML = `
            <!-- Turn Indicator -->
            <div class="turn-indicator">
                <div class="current-player">
                    <span class="label">Current Turn:</span>
                    <span class="player-name" id="current-player-name">${this.playerId}</span>
                </div>
                <div class="status your-turn" id="turn-status">Your Turn</div>
            </div>

            <!-- AP Display -->
            <div class="ap-display">
                <div class="ap-header">Action Points</div>
                <div class="ap-current">
                    <span class="ap-value" id="ap-value">${this.playerAP}</span>
                    <span class="ap-max">/ ${this.maxAP}</span>
                </div>
                <div class="ap-bar">
                    <div class="ap-fill" id="ap-fill" style="width: ${(this.playerAP / this.maxAP) * 100}%"></div>
                </div>
                <div class="ap-generation">+2-3 AP per turn</div>
            </div>

            <!-- Turn Timer -->
            <div class="turn-timer">
                <div class="timer-label">Turn Time Remaining</div>
                <div class="timer-bar">
                    <div class="timer-fill" id="timer-fill" style="width: ${(this.turnTimer / this.maxTurnTime) * 100}%"></div>
                </div>
                <div class="timer-value" id="timer-value">${this.turnTimer}s</div>
            </div>

            <!-- Initiative Order -->
            <div class="initiative-order">
                <div class="initiative-header">Initiative Order</div>
                <div class="initiative-list" id="initiative-list">
                    <div class="initiative-entry current me">
                        <span class="player-name">${this.playerId} (You)</span>
                        <span class="initiative-value">15</span>
                        <span class="current-indicator">◄</span>
                    </div>
                </div>
            </div>

            <!-- Action Selector -->
            <div class="action-selector">
                <div class="action-selector-header">
                    <h3>Actions</h3>
                    <div class="action-type-tabs">
                        <button class="tab-button active" data-tab="free">Free (0 AP)</button>
                        <button class="tab-button" data-tab="basic">Basic (1-3 AP)</button>
                        <button class="tab-button" data-tab="advanced">Advanced (4+ AP)</button>
                    </div>
                </div>
                
                <div class="action-panels">
                    <!-- Free Actions Panel -->
                    <div class="action-panel active" data-panel="free">
                        <div class="action-section">
                            <h4>Movement & Basic Actions</h4>
                            <div class="action-grid">
                                <div class="action-button" data-action="move">
                                    <div class="action-icon">🚶</div>
                                    <div class="action-name">Move</div>
                                    <div class="action-cost">0 AP</div>
                                    <div class="action-desc">Move to adjacent square</div>
                                </div>
                                <div class="action-button" data-action="basic_attack">
                                    <div class="action-icon">⚔️</div>
                                    <div class="action-name">Basic Attack</div>
                                    <div class="action-cost">0 AP</div>
                                    <div class="action-desc">Standard weapon attack</div>
                                </div>
                                <div class="action-button" data-action="defend">
                                    <div class="action-icon">🛡️</div>
                                    <div class="action-name">Defend</div>
                                    <div class="action-cost">0 AP</div>
                                    <div class="action-desc">+2 defense until next turn</div>
                                </div>
                                <div class="action-button" data-action="rest">
                                    <div class="action-icon">💤</div>
                                    <div class="action-name">Rest</div>
                                    <div class="action-cost">0 AP</div>
                                    <div class="action-desc">End turn, +1 AP bonus</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Basic AP Actions Panel -->
                    <div class="action-panel" data-panel="basic">
                        <div class="action-section">
                            <h4>Combat Abilities</h4>
                            <div class="action-grid">
                                <div class="action-button" data-action="power_strike">
                                    <div class="action-icon">💥</div>
                                    <div class="action-name">Power Strike</div>
                                    <div class="action-cost">2 AP</div>
                                    <div class="action-desc">+50% damage attack</div>
                                    <div class="skill-req">Requires: Swords 25</div>
                                </div>
                                <div class="action-button" data-action="fireball">
                                    <div class="action-icon">🔥</div>
                                    <div class="action-name">Fireball</div>
                                    <div class="action-cost">3 AP</div>
                                    <div class="action-desc">2d6 fire damage, 2 square radius</div>
                                    <div class="skill-req">Requires: Fire Magic 30</div>
                                </div>
                                <div class="action-button" data-action="heal">
                                    <div class="action-icon">💚</div>
                                    <div class="action-name">Heal</div>
                                    <div class="action-cost">2 AP</div>
                                    <div class="action-desc">Restore 1d8+2 health</div>
                                    <div class="skill-req">Requires: Healing Magic 20</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Advanced AP Actions Panel -->
                    <div class="action-panel" data-panel="advanced">
                        <div class="action-section">
                            <h4>Master Abilities</h4>
                            <div class="action-grid">
                                <div class="action-button disabled" data-action="whirlwind">
                                    <div class="action-icon">🌪️</div>
                                    <div class="action-name">Whirlwind Attack</div>
                                    <div class="action-cost">5 AP</div>
                                    <div class="action-desc">Attack all adjacent enemies</div>
                                    <div class="skill-req">Requires: Swords 75</div>
                                </div>
                                <div class="action-button disabled" data-action="meteor">
                                    <div class="action-icon">☄️</div>
                                    <div class="action-name">Meteor</div>
                                    <div class="action-cost">6 AP</div>
                                    <div class="action-desc">4d6+6 damage after 2 turns</div>
                                    <div class="skill-req">Requires: Fire Magic 80</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Preview -->
                <div class="action-preview">
                    <div class="preview-header">Action Preview</div>
                    <div class="no-selection">Select an action to see details</div>
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons">
                    <button class="btn btn-primary" id="execute-action" disabled>Execute Action</button>
                    <button class="btn btn-secondary" id="end-turn">End Turn</button>
                </div>
            </div>

            <!-- Message Log -->
            <div class="message-log">
                <div class="log-header">Game Messages</div>
                <div class="log-messages" id="log-messages">
                    <div class="log-message">Welcome to the AP System!</div>
                    <div class="log-message">Use arrow keys to move (free action)</div>
                    <div class="log-message">Current AP: ${this.playerAP} / ${this.maxAP}</div>
                </div>
            </div>
        `;

        // Setup tab switching
        this.setupActionTabs();
        
        // Setup action selection
        this.setupActionSelection();
        
        // Setup action buttons
        this.setupActionButtons();
    }

    setupActionTabs() {
        const tabs = this.uiContainer.querySelectorAll('.tab-button');
        const panels = this.uiContainer.querySelectorAll('.action-panel');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetPanel = e.target.dataset.tab;
                
                // Update tab states
                tabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update panel states
                panels.forEach(p => {
                    p.classList.remove('active');
                    if (p.dataset.panel === targetPanel) {
                        p.classList.add('active');
                    }
                });
            });
        });
    }

    setupActionSelection() {
        const actionButtons = this.uiContainer.querySelectorAll('.action-button');
        
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                if (button.classList.contains('disabled')) return;
                
                // Clear previous selection
                actionButtons.forEach(b => b.classList.remove('selected'));
                
                // Select this action
                button.classList.add('selected');
                this.selectedAction = button.dataset.action;
                
                // Update action preview
                this.updateActionPreview(this.selectedAction);
                
                // Enable execute button
                const executeBtn = document.getElementById('execute-action');
                executeBtn.disabled = false;
            });
        });
    }

    setupActionButtons() {
        const executeBtn = document.getElementById('execute-action');
        const endTurnBtn = document.getElementById('end-turn');
        
        executeBtn.addEventListener('click', () => {
            if (this.selectedAction) {
                this.executeAction(this.selectedAction);
            }
        });
        
        endTurnBtn.addEventListener('click', () => {
            this.endTurn();
        });
    }

    updateActionPreview(actionType) {
        const preview = this.uiContainer.querySelector('.action-preview');
        
        const actions = {
            move: {
                name: 'Move',
                cost: 0,
                description: 'Move to an adjacent square. This is a free action that can be used unlimited times.',
                details: ['Range: Adjacent squares', 'Effect: Change position', 'Restrictions: Cannot move through walls']
            },
            basic_attack: {
                name: 'Basic Attack',
                cost: 0,
                description: 'Perform a standard weapon attack. Free action with moderate damage.',
                details: ['Range: Melee (adjacent)', 'Damage: Weapon + skill bonus', 'Hit chance: 50% + bonuses']
            },
            defend: {
                name: 'Defend',
                cost: 0,
                description: 'Take a defensive stance until your next turn.',
                details: ['Duration: Until next turn', 'Effect: +2 defense bonus', 'Blocks: Incoming attacks']
            },
            power_strike: {
                name: 'Power Strike',
                cost: 2,
                description: 'A powerful weapon attack with increased damage.',
                details: ['Range: Melee (adjacent)', 'Damage: +50% weapon damage', 'Hit chance: Normal + skill']
            },
            fireball: {
                name: 'Fireball',
                cost: 3,
                description: 'Launch a ball of fire that explodes on impact.',
                details: ['Range: 8 squares', 'Damage: 2d6 fire', 'Area: 2 square radius']
            },
            heal: {
                name: 'Heal',
                cost: 2,
                description: 'Restore health to yourself or an ally.',
                details: ['Range: Touch or self', 'Healing: 1d8+2 points', 'Target: Single ally']
            }
        };
        
        const action = actions[actionType];
        if (!action) return;
        
        const remainingAP = this.playerAP - action.cost;
        
        preview.innerHTML = `
            <div class="preview-header">Action Preview</div>
            <div class="action-details">
                <h4>${action.name}</h4>
                <div class="detail-row">
                    <span class="label">AP Cost:</span>
                    <span class="value">${action.cost}</span>
                </div>
                <div class="description">${action.description}</div>
                ${action.details.map(detail => `<div class="detail-row"><span class="value">${detail}</span></div>`).join('')}
                <div class="remaining-ap">AP after use: ${remainingAP} / ${this.maxAP}</div>
            </div>
        `;
    }

    setupInputHandling() {
        document.addEventListener('keydown', this.handleKeyPress);
    }

    handleKeyPress(event) {
        // Prevent default browser behavior
        event.preventDefault();
        
        const key = event.key.toLowerCase();
        
        // Movement (free actions)
        if (['arrowup', 'w'].includes(key)) {
            this.movePlayer(0, -1);
        } else if (['arrowdown', 's'].includes(key)) {
            this.movePlayer(0, 1);
        } else if (['arrowleft', 'a'].includes(key)) {
            this.movePlayer(-1, 0);
        } else if (['arrowright', 'd'].includes(key)) {
            this.movePlayer(1, 0);
        }
        // Diagonal movement
        else if (['q'].includes(key)) {
            this.movePlayer(-1, -1);
        } else if (['e'].includes(key)) {
            this.movePlayer(1, -1);
        } else if (['z'].includes(key)) {
            this.movePlayer(-1, 1);
        } else if (['x'].includes(key)) {
            this.movePlayer(1, 1);
        }
        // Actions
        else if ([' ', 'f'].includes(key)) {
            this.executeAction('basic_attack');
        } else if (['g'].includes(key)) {
            this.executeAction('defend');
        } else if (['r'].includes(key)) {
            this.executeAction('rest');
        }
        // Quick abilities (1-9)
        else if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(key)) {
            this.useQuickAbility(parseInt(key));
        }
        // UI controls
        else if (['tab'].includes(key)) {
            this.toggleActionPanel();
        } else if (['enter'].includes(key)) {
            if (this.targetingMode) {
                this.confirmTarget();
            } else if (this.selectedAction) {
                this.executeAction(this.selectedAction);
            }
        } else if (['escape'].includes(key)) {
            this.cancelAction();
        }
    }

    movePlayer(dx, dy) {
        const newX = this.playerPosition.x + dx;
        const newY = this.playerPosition.y + dy;
        
        // Check bounds (dynamic grid size)
        if (newX < 0 || newX >= this.gridCols || newY < 0 || newY >= this.gridRows) {
            this.addMessage('Cannot move outside the map!');
            return;
        }
        
        // Check for walls
        const targetCell = this.gameMap[newY][newX];
        if (targetCell.textContent === '#') {
            this.addMessage('Cannot move through walls!');
            return;
        }
        
        // Clear old position
        this.gameMap[this.playerPosition.y][this.playerPosition.x].textContent = '.';
        this.gameMap[this.playerPosition.y][this.playerPosition.x].style.color = '#404040';
        
        // Set new position
        this.playerPosition.x = newX;
        this.playerPosition.y = newY;
        this.gameMap[newY][newX].textContent = '@';
        this.gameMap[newY][newX].style.color = '#00ff00';
        
        // Send free action to server
        this.sendFreeAction('MOVE', { x: newX, y: newY });
        
        this.addMessage(`Moved to (${newX}, ${newY})`);
    }

    executeAction(actionType) {
        const apCosts = {
            move: 0,
            basic_attack: 0,
            defend: 0,
            rest: 0,
            power_strike: 2,
            fireball: 3,
            heal: 2,
            whirlwind: 5,
            meteor: 6
        };
        
        const cost = apCosts[actionType] || 0;
        
        if (cost > this.playerAP) {
            this.addMessage(`Not enough AP! Need ${cost}, have ${this.playerAP}`);
            return;
        }
        
        // Execute free actions immediately
        if (cost === 0) {
            this.sendFreeAction(actionType.toUpperCase());
        } else {
            // Send AP action to server
            this.sendAPAction(actionType, cost);
        }
        
        this.addMessage(`Used ${actionType.replace('_', ' ')} (${cost} AP)`);
        
        // Clear selection
        this.selectedAction = null;
        const actionButtons = this.uiContainer.querySelectorAll('.action-button');
        actionButtons.forEach(b => b.classList.remove('selected'));
        document.getElementById('execute-action').disabled = true;
    }

    endTurn() {
        this.sendMessage({
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
        const tabs = this.uiContainer.querySelectorAll('.tab-button');
        const currentTab = this.uiContainer.querySelector('.tab-button.active');
        const currentIndex = Array.from(tabs).indexOf(currentTab);
        const nextIndex = (currentIndex + 1) % tabs.length;
        tabs[nextIndex].click();
    }

    cancelAction() {
        this.selectedAction = null;
        this.targetingMode = false;
        this.targetPosition = null;
        
        const actionButtons = this.uiContainer.querySelectorAll('.action-button');
        actionButtons.forEach(b => b.classList.remove('selected'));
        document.getElementById('execute-action').disabled = true;
        
        this.addMessage('Action cancelled');
    }

    async connectToServer() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}?roomId=${this.roomId}&playerId=${this.playerId}`;
        
        try {
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log('Connected to AP System server');
                this.updateConnectionStatus(true);
                this.addMessage('Connected to server');
                
                // Send initial state request
                this.sendMessage({
                    type: 'REQUEST_GAME_STATE',
                    playerId: this.playerId
                });
            };
            
            this.ws.onmessage = this.handleWebSocketMessage;
            
            this.ws.onclose = () => {
                console.log('Disconnected from server');
                this.updateConnectionStatus(false);
                this.addMessage('Disconnected from server');
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.addMessage('Connection error');
            };
            
        } catch (error) {
            console.error('Failed to connect to server:', error);
            this.addMessage('Failed to connect to server');
        }
    }

    handleWebSocketMessage(event) {
        try {
            const message = JSON.parse(event.data);
            console.log('Received message:', message);
            
            switch (message.type) {
                case 'GAME_STATE_UPDATE':
                    this.handleGameStateUpdate(message.data);
                    break;
                case 'TURN_UPDATE':
                    this.handleTurnUpdate(message.data);
                    break;
                case 'ACTION_RESULT':
                    this.handleActionResult(message.data);
                    break;
                case 'AP_UPDATE':
                    this.handleAPUpdate(message.data);
                    break;
                case 'MESSAGE':
                    this.addMessage(message.data.text);
                    break;
                default:
                    console.log('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
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
    }

    sendFreeAction(actionType, target = null) {
        this.sendMessage({
            type: 'FREE_ACTION',
            data: {
                type: actionType,
                playerId: this.playerId,
                target: target
            }
        });
    }

    sendAPAction(actionType, cost, target = null) {
        this.sendMessage({
            type: 'AP_ACTION',
            data: {
                type: actionType,
                playerId: this.playerId,
                apCost: cost,
                target: target
            }
        });
    }

    sendMessage(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket not connected, message not sent:', message);
        }
    }

    updateDisplay() {
        this.updateAPDisplay();
        this.updateTurnDisplay();
        this.updateInitiativeDisplay();
    }

    updateAPDisplay() {
        const apValue = document.getElementById('ap-value');
        const apFill = document.getElementById('ap-fill');
        
        if (apValue) apValue.textContent = this.playerAP;
        if (apFill) apFill.style.width = `${(this.playerAP / this.maxAP) * 100}%`;
    }

    updateTurnDisplay() {
        const timerFill = document.getElementById('timer-fill');
        const timerValue = document.getElementById('timer-value');
        const turnStatus = document.getElementById('turn-status');
        const currentPlayerName = document.getElementById('current-player-name');
        
        if (timerFill) {
            const percentage = (this.turnTimer / this.maxTurnTime) * 100;
            timerFill.style.width = `${percentage}%`;
            
            // Update timer color based on remaining time
            if (this.turnTimer <= 3) {
                timerFill.className = 'timer-fill timer-critical';
            } else if (this.turnTimer <= 5) {
                timerFill.className = 'timer-fill timer-warning';
            } else {
                timerFill.className = 'timer-fill';
            }
        }
        
        if (timerValue) timerValue.textContent = `${this.turnTimer}s`;
        
        if (currentPlayerName) currentPlayerName.textContent = this.currentPlayer || this.playerId;
        
        if (turnStatus) {
            if (this.currentPlayer === this.playerId) {
                turnStatus.textContent = 'Your Turn';
                turnStatus.className = 'status your-turn';
            } else {
                turnStatus.textContent = 'Waiting...';
                turnStatus.className = 'status waiting';
            }
        }
    }

    updateInitiativeDisplay() {
        const initiativeList = document.getElementById('initiative-list');
        if (!initiativeList) return;
        
        if (this.initiative.length === 0) {
            initiativeList.innerHTML = `
                <div class="initiative-entry current me">
                    <span class="player-name">${this.playerId} (You)</span>
                    <span class="initiative-value">15</span>
                    <span class="current-indicator">◄</span>
                </div>
            `;
            return;
        }
        
        initiativeList.innerHTML = this.initiative.map((entry, index) => {
            const isMe = entry.playerId === this.playerId;
            const isCurrent = entry.playerId === this.currentPlayer;
            const classes = ['initiative-entry'];
            
            if (isCurrent) classes.push('current');
            if (isMe) classes.push('me');
            
            return `
                <div class="${classes.join(' ')}">
                    <span class="player-name">${entry.playerName || entry.playerId}${isMe ? ' (You)' : ''}</span>
                    <span class="initiative-value">${entry.initiative}</span>
                    ${isCurrent ? '<span class="current-indicator">◄</span>' : ''}
                </div>
            `;
        }).join('');
    }

    updateConnectionStatus(connected) {
        if (this.connectionStatus) {
            if (connected) {
                this.connectionStatus.className = 'connection-status connected';
                this.connectionStatus.textContent = 'Connected';
            } else {
                this.connectionStatus.className = 'connection-status disconnected';
                this.connectionStatus.textContent = 'Disconnected';
            }
        }
        
        // Update global status
        if (window.updateConnectionStatus) {
            window.updateConnectionStatus(connected);
        }
    }

    addMessage(text) {
        this.messages.push(text);
        if (this.messages.length > 50) {
            this.messages.shift();
        }
        
        const logMessages = document.getElementById('log-messages');
        if (logMessages) {
            const messageElement = document.createElement('div');
            messageElement.className = 'log-message';
            messageElement.textContent = text;
            
            logMessages.appendChild(messageElement);
            
            // Keep only last 10 messages visible
            const messages = logMessages.querySelectorAll('.log-message');
            if (messages.length > 10) {
                messages[0].remove();
            }
            
            // Scroll to bottom
            logMessages.scrollTop = logMessages.scrollHeight;
        }
        
        console.log('Game message:', text);
    }
}

// Export for module loading
export default GameClient;

// Also make available globally for non-module loading
window.GameClient = GameClient;