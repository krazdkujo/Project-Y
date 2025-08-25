// Login Screen - ASCII-based login interface for the game
class LoginScreen {
    constructor(frameSystem, onLogin) {
        this.frameSystem = frameSystem;
        this.onLogin = onLogin;
        this.screen = null;
        
        this.createLoginScreen();
    }

    createLoginScreen() {
        // Register custom login template
        this.frameSystem.registerTemplate('login_screen', {
            width: 80,
            height: 25,
            template: `
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║    ╔═══════════════════════════════════════════════════════════════════╗    ║
║    ║                                                                   ║    ║
║    ║          ██████╗  ██████╗  ██████╗ ██╗   ██╗███████╗              ║    ║
║    ║          ██╔══██╗██╔═══██╗██╔════╝ ██║   ██║██╔════╝              ║    ║
║    ║          ██████╔╝██║   ██║██║  ███╗██║   ██║█████╗                ║    ║
║    ║          ██╔══██╗██║   ██║██║   ██║██║   ██║██╔══╝                ║    ║
║    ║          ██║  ██║╚██████╔╝╚██████╔╝╚██████╔╝███████╗              ║    ║
║    ║          ╚═╝  ╚═╝ ╚═════╝  ╚═════╝  ╚═════╝ ╚══════╝              ║    ║
║    ║                                                                   ║    ║
║    ║                    ASCII TACTICAL ROGUELIKE                       ║    ║
║    ║                                                                   ║    ║
║    ╚═══════════════════════════════════════════════════════════════════╝    ║
║                                                                              ║
║                            Player Name:                                      ║
║                          [                ]                                 ║
║                                                                              ║
║                            Room ID:                                          ║
║                          [                ]                                 ║
║                                                                              ║
║                        [ Connect to Game ]                                  ║
║                                                                              ║
║                                                                              ║
║  Press TAB to navigate • ENTER to select • ESC to cancel                    ║
╚══════════════════════════════════════════════════════════════════════════════╝`.trim(),
            regions: {
                title: { row: 12, col: 24, width: 32, height: 1 },
                playerNameLabel: { row: 15, col: 28, width: 20, height: 1 },
                roomIdLabel: { row: 18, col: 28, width: 20, height: 1 },
                instructions: { row: 23, col: 2, width: 76, height: 1 }
            }
        });

        // Create the screen
        this.screen = this.frameSystem.createScreen('login_screen', {
            onAction: this.handleAction.bind(this)
        });

        // Set up input fields and buttons (adjusted positions)
        this.nameInput = this.screen.addInput('Enter your name...', { row: 16, col: 27 }, { maxLength: 16 });
        this.roomInput = this.screen.addInput('default', { row: 19, col: 27 }, { maxLength: 16 });
        this.roomInput.value = 'default'; // Pre-fill default room
        
        this.connectButton = this.screen.addButton('Connect to Game', this.handleConnect.bind(this), { row: 21, col: 29 });

        // Set labels for the input fields
        this.screen.setText('playerNameLabel', 'Player Name:', { 
            color: this.frameSystem.colors.text 
        });
        
        this.screen.setText('roomIdLabel', 'Room ID:', { 
            color: this.frameSystem.colors.text 
        });
        
        // Only set instructions
        this.screen.setText('instructions', 
            'Press TAB/ARROWS to navigate • ENTER to select • ESC to cancel', {
            color: this.frameSystem.colors.text,
            align: 'center'
        });
    }

    handleAction(type, item) {
        console.log('Login action:', type, item);
        
        if (type === 'input' && item.id === 'input_0') {
            // Player name input
            console.log('Player name changed:', item.value);
        } else if (type === 'input' && item.id === 'input_1') {
            // Room ID input  
            console.log('Room ID changed:', item.value);
        }
    }

    handleConnect() {
        const playerName = this.nameInput.value.trim();
        const roomId = this.roomInput.value.trim() || 'default';

        // Validate inputs
        if (!playerName) {
            this.showError('Please enter a player name');
            return;
        }

        if (playerName.length < 2) {
            this.showError('Player name must be at least 2 characters');
            return;
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(playerName)) {
            this.showError('Player name can only contain letters, numbers, _ and -');
            return;
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(roomId)) {
            this.showError('Room ID can only contain letters, numbers, _ and -');
            return;
        }

        // Call login callback
        if (this.onLogin) {
            this.onLogin({
                playerName: playerName,
                roomId: roomId
            });
        }
    }

    showError(message) {
        // Create error dialog
        const errorDialog = this.frameSystem.createScreen('dialog_box', {
            onAction: (type, item) => {
                if (type === 'button') {
                    this.show(); // Return to login screen
                }
            }
        });

        errorDialog.setText('message', message, { 
            color: this.frameSystem.colors.error, 
            align: 'center' 
        });

        errorDialog.addButton('OK', () => {
            this.show(); // Return to login screen
        }, { row: 12, col: 28 });

        this.frameSystem.showScreen(errorDialog);
    }

    show() {
        this.frameSystem.showScreen(this.screen);
    }

    cleanup() {
        if (this.screen) {
            this.screen.cleanup();
        }
    }
}

// Make available globally
window.LoginScreen = LoginScreen;