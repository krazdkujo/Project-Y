// Main entry point - Initialize modular game client system

// Game initialization
let gameClient = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing modular AP System Game Client...');
    
    try {
        // Verify required modules are loaded
        if (!window.GAME_CONSTANTS) {
            throw new Error('Utils module not loaded');
        }
        if (!window.ASCIIFrameSystem) {
            throw new Error('ASCIIFrameSystem module not loaded');
        }
        if (!window.GameClient) {
            throw new Error('GameClient module not loaded');
        }
        if (!window.NetworkManager) {
            throw new Error('NetworkManager module not loaded');
        }
        if (!window.InputHandler) {
            throw new Error('InputHandler module not loaded');
        }
        if (!window.UIManager) {
            throw new Error('UIManager module not loaded');
        }
        if (!window.ASCIIUIManager) {
            throw new Error('ASCIIUIManager module not loaded');
        }
        if (!window.ScreenManager) {
            throw new Error('ScreenManager module not loaded');
        }
        if (!window.LoginScreen) {
            throw new Error('LoginScreen module not loaded');
        }
        if (!window.CharacterSelectScreen) {
            throw new Error('CharacterSelectScreen module not loaded');
        }
        
        // Create screen manager first
        const screenManager = new ScreenManager();
        
        // Create and initialize game client
        gameClient = new GameClient();
        await gameClient.initialize();
        
        // Connect screen manager to game client
        screenManager.setGameClient(gameClient);
        
        // Set up global keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            if (screenManager.handleKeyboardShortcuts(event)) {
                // Shortcut was handled
                return;
            }
        });
        
        // Show login screen initially
        screenManager.showLogin();
        
        console.log('Modular game client system initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize game client:', error);
        
        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff0000;
            color: #ffffff;
            padding: 20px;
            border-radius: 5px;
            font-family: monospace;
            z-index: 10000;
        `;
        errorDiv.textContent = `Failed to initialize game: ${error.message}`;
        document.body.appendChild(errorDiv);
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (gameClient) {
        gameClient.destroy();
    }
});

// Export for debugging
window.gameClient = gameClient;