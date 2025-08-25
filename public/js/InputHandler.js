// Input Handler - Keyboard and mouse input management
class InputHandler {
    constructor(gameClient) {
        this.gameClient = gameClient;
        
        // Bind methods
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleMapClick = this.handleMapClick.bind(this);
        
        this.setupInputHandling();
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
            this.gameClient.movePlayer(0, -1);
        } else if (['arrowdown', 's'].includes(key)) {
            this.gameClient.movePlayer(0, 1);
        } else if (['arrowleft', 'a'].includes(key)) {
            this.gameClient.movePlayer(-1, 0);
        } else if (['arrowright', 'd'].includes(key)) {
            this.gameClient.movePlayer(1, 0);
        }
        // Diagonal movement
        else if (['q'].includes(key)) {
            this.gameClient.movePlayer(-1, -1);
        } else if (['e'].includes(key)) {
            this.gameClient.movePlayer(1, -1);
        } else if (['z'].includes(key)) {
            this.gameClient.movePlayer(-1, 1);
        } else if (['x'].includes(key)) {
            this.gameClient.movePlayer(1, 1);
        }
        // Actions
        else if ([' ', 'f'].includes(key)) {
            this.gameClient.executeAction('basic_attack');
        } else if (['g'].includes(key)) {
            this.gameClient.executeAction('defend');
        } else if (['r'].includes(key)) {
            this.gameClient.executeAction('rest');
        }
        // Quick abilities (1-9)
        else if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(key)) {
            this.gameClient.useQuickAbility(parseInt(key));
        }
        // UI controls
        else if (['tab'].includes(key)) {
            this.gameClient.toggleActionPanel();
        } else if (['enter'].includes(key)) {
            if (this.gameClient.targetingMode) {
                this.gameClient.confirmTarget();
            } else if (this.gameClient.selectedAction) {
                this.gameClient.executeAction(this.gameClient.selectedAction);
            }
        } else if (['escape'].includes(key)) {
            this.gameClient.cancelAction();
        }
    }

    handleMapClick(event) {
        const targetX = parseInt(event.target.dataset.x);
        const targetY = parseInt(event.target.dataset.y);
        
        if (this.gameClient.targetingMode) {
            this.gameClient.selectTarget(targetX, targetY);
        } else {
            // Click to move
            this.gameClient.movePlayer(targetX, targetY);
        }
    }

    attachMapClickHandlers(gameMap) {
        // Add click handlers to all map cells
        for (let y = 0; y < gameMap.length; y++) {
            for (let x = 0; x < gameMap[y].length; x++) {
                const cell = gameMap[y][x];
                cell.addEventListener('click', this.handleMapClick);
            }
        }
    }

    removeMapClickHandlers(gameMap) {
        // Remove click handlers from all map cells
        for (let y = 0; y < gameMap.length; y++) {
            for (let x = 0; x < gameMap[y].length; x++) {
                const cell = gameMap[y][x];
                cell.removeEventListener('click', this.handleMapClick);
            }
        }
    }

    destroy() {
        document.removeEventListener('keydown', this.handleKeyPress);
    }
}

// Make available globally
window.InputHandler = InputHandler;