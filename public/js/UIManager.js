// UI Manager - Modern UI components and panels
class UIManager {
    constructor(gameClient) {
        this.gameClient = gameClient;
        this.uiContainer = null;
        this.selectedAction = null;
    }

    initialize(uiContainer) {
        this.uiContainer = uiContainer;
        this.createUIComponents();
    }

    createUIComponents() {
        this.uiContainer.innerHTML = `
            <!-- Turn Indicator -->
            <div class="turn-indicator">
                <div class="current-player">
                    <span class="label">Current Turn:</span>
                    <span class="player-name" id="current-player-name">${this.gameClient.playerId}</span>
                </div>
                <div class="status your-turn" id="turn-status">Your Turn</div>
            </div>

            <!-- AP Display -->
            <div class="ap-display">
                <div class="ap-header">Action Points</div>
                <div class="ap-current">
                    <span class="ap-value" id="ap-value">${this.gameClient.playerAP}</span>
                    <span class="ap-max">/ ${this.gameClient.maxAP}</span>
                </div>
                <div class="ap-bar">
                    <div class="ap-fill" id="ap-fill" style="width: ${(this.gameClient.playerAP / this.gameClient.maxAP) * 100}%"></div>
                </div>
                <div class="ap-generation">+2-3 AP per turn</div>
            </div>

            <!-- Turn Timer -->
            <div class="turn-timer">
                <div class="timer-label">Turn Time Remaining</div>
                <div class="timer-bar">
                    <div class="timer-fill" id="timer-fill" style="width: ${(this.gameClient.turnTimer / this.gameClient.maxTurnTime) * 100}%"></div>
                </div>
                <div class="timer-value" id="timer-value">${this.gameClient.turnTimer}s</div>
            </div>

            <!-- Initiative Order -->
            <div class="initiative-order">
                <div class="initiative-header">Initiative Order</div>
                <div class="initiative-list" id="initiative-list">
                    <div class="initiative-entry current me">
                        <span class="player-name">${this.gameClient.playerId} (You)</span>
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
                    <div class="log-message">Current AP: ${this.gameClient.playerAP} / ${this.gameClient.maxAP}</div>
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
                this.gameClient.selectedAction = this.selectedAction;
                
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
                this.gameClient.executeAction(this.selectedAction);
            }
        });
        
        endTurnBtn.addEventListener('click', () => {
            this.gameClient.endTurn();
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
        
        const remainingAP = this.gameClient.playerAP - action.cost;
        
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
                <div class="remaining-ap">AP after use: ${remainingAP} / ${this.gameClient.maxAP}</div>
            </div>
        `;
    }

    updateAPDisplay() {
        const apValue = document.getElementById('ap-value');
        const apFill = document.getElementById('ap-fill');
        
        if (apValue) apValue.textContent = this.gameClient.playerAP;
        if (apFill) apFill.style.width = `${(this.gameClient.playerAP / this.gameClient.maxAP) * 100}%`;
    }

    updateTurnDisplay() {
        const timerFill = document.getElementById('timer-fill');
        const timerValue = document.getElementById('timer-value');
        const turnStatus = document.getElementById('turn-status');
        const currentPlayerName = document.getElementById('current-player-name');
        
        if (timerFill) {
            const percentage = (this.gameClient.turnTimer / this.gameClient.maxTurnTime) * 100;
            timerFill.style.width = `${percentage}%`;
            
            // Update timer color based on remaining time
            if (this.gameClient.turnTimer <= 3) {
                timerFill.className = 'timer-fill timer-critical';
            } else if (this.gameClient.turnTimer <= 5) {
                timerFill.className = 'timer-fill timer-warning';
            } else {
                timerFill.className = 'timer-fill';
            }
        }
        
        if (timerValue) timerValue.textContent = `${this.gameClient.turnTimer}s`;
        
        if (currentPlayerName) currentPlayerName.textContent = this.gameClient.currentPlayer || this.gameClient.playerId;
        
        if (turnStatus) {
            if (this.gameClient.currentPlayer === this.gameClient.playerId) {
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
        
        if (this.gameClient.initiative.length === 0) {
            initiativeList.innerHTML = `
                <div class="initiative-entry current me">
                    <span class="player-name">${this.gameClient.playerId} (You)</span>
                    <span class="initiative-value">15</span>
                    <span class="current-indicator">◄</span>
                </div>
            `;
            return;
        }
        
        initiativeList.innerHTML = this.gameClient.initiative.map((entry, index) => {
            const isMe = entry.playerId === this.gameClient.playerId;
            const isCurrent = entry.playerId === this.gameClient.currentPlayer;
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

    addMessage(text) {
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
    }

    toggleActionPanel() {
        const tabs = this.uiContainer.querySelectorAll('.tab-button');
        const currentTab = this.uiContainer.querySelector('.tab-button.active');
        const currentIndex = Array.from(tabs).indexOf(currentTab);
        const nextIndex = (currentIndex + 1) % tabs.length;
        tabs[nextIndex].click();
    }

    clearActionSelection() {
        this.selectedAction = null;
        const actionButtons = this.uiContainer.querySelectorAll('.action-button');
        actionButtons.forEach(b => b.classList.remove('selected'));
        const executeBtn = document.getElementById('execute-action');
        if (executeBtn) executeBtn.disabled = true;
    }
}

// Make available globally
window.UIManager = UIManager;