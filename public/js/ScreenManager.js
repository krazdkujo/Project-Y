// Screen Manager - Handles transitions between different UI screens
class ScreenManager {
    constructor() {
        this.frameSystem = new ASCIIFrameSystem();
        this.currentScreen = null;
        this.gameClient = null;
        
        // Create screen container if it doesn't exist
        this.ensureScreenContainer();
        
        // Initialize screens
        this.initializeScreens();
    }

    ensureScreenContainer() {
        let container = document.getElementById('ascii-screen-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'ascii-screen-container';
            container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background-color: #000000;
                z-index: 10000;
                display: none;
            `;
            document.body.appendChild(container);
        }
        this.container = container;
    }

    initializeScreens() {
        // Initialize login screen
        this.loginScreen = new LoginScreen(this.frameSystem, (loginData) => {
            this.handleLogin(loginData);
        });
        
        // Initialize character select screen
        this.characterSelectScreen = new CharacterSelectScreen(this.frameSystem, (characterData) => {
            this.handleCharacterSelect(characterData);
        });
    }

    showLogin() {
        this.container.style.display = 'block';
        this.loginScreen.show();
        this.currentScreen = 'login';
    }

    hideScreens() {
        this.container.style.display = 'none';
        this.currentScreen = null;
    }

    handleLogin(loginData) {
        console.log('Login successful:', loginData);
        
        // Store login data for later use
        this.loginData = loginData;
        
        // Show character select screen
        this.characterSelectScreen.show();
        this.currentScreen = 'character_select';
        
        // Show success message
        this.showNotification(`Logged in as ${loginData.playerName}`, 'success');
    }

    handleCharacterSelect(characterData) {
        console.log('Character selected:', characterData);
        
        if (characterData.createNew) {
            // TODO: Show character creation screen
            this.showNotification('Character creation not yet implemented', 'info');
            return;
        }
        
        // Hide screen overlay
        this.hideScreens();
        
        // Initialize game client with login and character data
        if (this.gameClient && this.loginData) {
            this.gameClient.playerId = this.generatePlayerId(this.loginData.playerName);
            this.gameClient.playerName = this.loginData.playerName;
            this.gameClient.characterName = characterData.name;
            this.gameClient.characterId = characterData.id;
            this.gameClient.roomId = this.loginData.roomId;
            
            // Reconnect with new credentials
            this.gameClient.networkManager.connectToServer(this.loginData.roomId, this.gameClient.playerId);
        }
        
        // Show success message
        this.showNotification(`Entering game as ${characterData.name}`, 'success');
    }

    generatePlayerId(playerName) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `${playerName}_${timestamp}_${random}`;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background-color: ${type === 'success' ? '#004400' : type === 'error' ? '#440000' : '#444400'};
            color: ${type === 'success' ? '#00ff00' : type === 'error' ? '#ff0000' : '#ffff00'};
            border: 1px solid ${type === 'success' ? '#00ff00' : type === 'error' ? '#ff0000' : '#ffff00'};
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            z-index: 20000;
            max-width: 400px;
            word-wrap: break-word;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    setGameClient(gameClient) {
        this.gameClient = gameClient;
    }

    showCharacterSelect() {
        this.container.style.display = 'block';
        this.characterSelectScreen.show();
        this.currentScreen = 'character_select';
    }

    // Handle keyboard shortcuts for screen management
    handleKeyboardShortcuts(event) {
        // F2 to show login screen
        if (event.key === 'F2' && !this.currentScreen) {
            event.preventDefault();
            this.showLogin();
            return true;
        }
        
        // F3 to show character select (if logged in)
        if (event.key === 'F3' && !this.currentScreen && this.loginData) {
            event.preventDefault();
            this.showCharacterSelect();
            return true;
        }
        
        return false;
    }

    cleanup() {
        if (this.frameSystem) {
            this.frameSystem.cleanup();
        }
        if (this.loginScreen) {
            this.loginScreen.cleanup();
        }
        if (this.characterSelectScreen) {
            this.characterSelectScreen.cleanup();
        }
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

// Make available globally
window.ScreenManager = ScreenManager;