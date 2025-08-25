// Network Manager - WebSocket communication and message handling
class NetworkManager {
    constructor(gameClient) {
        this.gameClient = gameClient;
        this.ws = null;
        this.connectionStatus = null;
        
        // Bind methods
        this.handleWebSocketMessage = this.handleWebSocketMessage.bind(this);
        this.handleOpen = this.handleOpen.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleError = this.handleError.bind(this);
    }

    async connectToServer(roomId, playerId) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}?roomId=${roomId}&playerId=${playerId}`;
        
        try {
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = this.handleOpen;
            this.ws.onmessage = this.handleWebSocketMessage;
            this.ws.onclose = this.handleClose;
            this.ws.onerror = this.handleError;
            
        } catch (error) {
            console.error('Failed to connect to server:', error);
            this.gameClient.addMessage('Failed to connect to server');
        }
    }

    handleOpen() {
        console.log('Connected to AP System server');
        this.updateConnectionStatus(true);
        this.gameClient.addMessage('Connected to server');
        
        // Send initial state request
        this.sendMessage({
            type: 'GET_GAME_STATE',
            playerId: this.gameClient.playerId
        });
    }

    handleClose() {
        console.log('Disconnected from server');
        this.updateConnectionStatus(false);
        this.gameClient.addMessage('Disconnected from server');
    }

    handleError(error) {
        console.error('WebSocket error:', error);
        this.gameClient.addMessage('Connection error');
    }

    handleWebSocketMessage(event) {
        try {
            const message = JSON.parse(event.data);
            console.log('Received message:', message);
            
            switch (message.type) {
                case 'GAME_STATE':
                    this.gameClient.handleGameState(message.data);
                    break;
                case 'GAME_STATE_UPDATE':
                    this.gameClient.handleGameStateUpdate(message.data);
                    break;
                case 'TURN_UPDATE':
                    this.gameClient.handleTurnUpdate(message.data);
                    break;
                case 'ACTION_RESULT':
                    this.gameClient.handleActionResult(message.data);
                    break;
                case 'AP_UPDATE':
                    this.gameClient.handleAPUpdate(message.data);
                    break;
                case 'MESSAGE':
                    this.gameClient.addMessage(message.data.text);
                    break;
                default:
                    console.log('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
        }
    }

    sendFreeAction(actionType, target = null) {
        this.sendMessage({
            type: 'FREE_ACTION',
            data: {
                type: actionType,
                playerId: this.gameClient.playerId,
                target: target
            }
        });
    }

    sendAPAction(actionType, cost, target = null) {
        this.sendMessage({
            type: 'AP_ACTION',
            data: {
                type: actionType,
                playerId: this.gameClient.playerId,
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

    setConnectionStatusElement(element) {
        this.connectionStatus = element;
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }
}

// Make available globally
window.NetworkManager = NetworkManager;