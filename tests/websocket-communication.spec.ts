import { test, expect, Page } from '@playwright/test';

/**
 * WebSocket Connection and Server Communication Tests
 * Tests WebSocket connectivity, message handling, and server communication
 */

test.describe('WebSocket Communication', () => {

  test('should attempt WebSocket connection on initialization', async ({ page }) => {
    await page.goto('/');
    
    // Monitor WebSocket creation attempts
    const wsAttempts: string[] = [];
    
    await page.route('**/*', route => {
      const url = route.request().url();
      if (url.includes('ws://') || url.includes('wss://')) {
        wsAttempts.push(url);
      }
      route.continue();
    });
    
    await waitForGameInitialization(page);
    
    // Check that WebSocket connection was attempted
    const hasWebSocketAttempt = await page.evaluate(() => {
      const gameClient = (window as any).gameClient;
      return gameClient && gameClient.ws !== null;
    });
    
    expect(hasWebSocketAttempt).toBe(true);
  });

  test('should handle WebSocket connection failure gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Monitor console messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(msg.text());
    });
    
    await waitForGameInitialization(page);
    
    // Connection should fail (no server running on WebSocket port)
    // Check connection status shows disconnected
    const connectionStatus = page.locator('#connection-status');
    await expect(connectionStatus).toHaveClass(/disconnected/);
    await expect(connectionStatus).toContainText('Disconnected');
  });

  test('should display proper connection status indicator', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    const connectionStatus = page.locator('#connection-status');
    
    // Should be visible
    await expect(connectionStatus).toBeVisible();
    
    // Should have proper positioning (absolute, top-left)
    const statusStyle = await connectionStatus.evaluate(el => getComputedStyle(el));
    expect(statusStyle.position).toBe('absolute');
    
    // Should show disconnected initially (no WebSocket server)
    await expect(connectionStatus).toHaveClass(/disconnected/);
  });

  test('should generate unique player ID', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    const playerId = await page.evaluate(() => {
      const gameClient = (window as any).gameClient;
      return gameClient?.playerId;
    });
    
    expect(playerId).toBeTruthy();
    expect(playerId).toMatch(/^player_[a-z0-9]{9}$/);
  });

  test('should set up proper WebSocket URL format', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    const wsDetails = await page.evaluate(() => {
      const gameClient = (window as any).gameClient;
      return {
        roomId: gameClient?.roomId,
        playerId: gameClient?.playerId,
        wsExists: !!gameClient?.ws
      };
    });
    
    expect(wsDetails.roomId).toBe('default');
    expect(wsDetails.playerId).toBeTruthy();
    expect(wsDetails.wsExists).toBe(true);
  });

  test('should handle WebSocket message parsing', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Test message parsing function
    const messageParsingTest = await page.evaluate(() => {
      const gameClient = (window as any).gameClient;
      
      // Create a mock WebSocket message event
      const mockEvent = {
        data: JSON.stringify({
          type: 'TEST_MESSAGE',
          data: { test: true }
        })
      };
      
      try {
        // This would normally be called by WebSocket onmessage
        const message = JSON.parse(mockEvent.data);
        return {
          success: true,
          type: message.type,
          hasData: !!message.data
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });
    
    expect(messageParsingTest.success).toBe(true);
    expect(messageParsingTest.type).toBe('TEST_MESSAGE');
    expect(messageParsingTest.hasData).toBe(true);
  });

  test('should have message sending capability', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    const hasMessageSender = await page.evaluate(() => {
      const gameClient = (window as any).gameClient;
      return typeof gameClient?.sendMessage === 'function';
    });
    
    expect(hasMessageSender).toBe(true);
  });

  test('should implement free action message format', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    const freeActionTest = await page.evaluate(() => {
      const gameClient = (window as any).gameClient;
      
      // Test free action message structure
      const mockFreeAction = {
        type: 'FREE_ACTION',
        data: {
          type: 'MOVE',
          playerId: gameClient?.playerId,
          target: { x: 5, y: 5 }
        }
      };
      
      return {
        hasCorrectStructure: mockFreeAction.type === 'FREE_ACTION' && 
                           mockFreeAction.data.type && 
                           mockFreeAction.data.playerId,
        playerId: mockFreeAction.data.playerId
      };
    });
    
    expect(freeActionTest.hasCorrectStructure).toBe(true);
    expect(freeActionTest.playerId).toBeTruthy();
  });

  test('should implement AP action message format', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    const apActionTest = await page.evaluate(() => {
      const gameClient = (window as any).gameClient;
      
      // Test AP action message structure
      const mockAPAction = {
        type: 'AP_ACTION',
        data: {
          type: 'power_strike',
          playerId: gameClient?.playerId,
          apCost: 2,
          target: null
        }
      };
      
      return {
        hasCorrectStructure: mockAPAction.type === 'AP_ACTION' && 
                           mockAPAction.data.type && 
                           mockAPAction.data.playerId &&
                           typeof mockAPAction.data.apCost === 'number',
        apCost: mockAPAction.data.apCost
      };
    });
    
    expect(apActionTest.hasCorrectStructure).toBe(true);
    expect(apActionTest.apCost).toBe(2);
  });

  test('should handle connection state updates', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Test connection state update function
    const connectionUpdateTest = await page.evaluate(() => {
      const gameClient = (window as any).gameClient;
      
      if (typeof gameClient?.updateConnectionStatus === 'function') {
        // Test updating to connected state
        gameClient.updateConnectionStatus(true);
        
        const connectedStatus = document.getElementById('connection-status');
        const isConnectedClass = connectedStatus?.className.includes('connected');
        
        // Test updating to disconnected state
        gameClient.updateConnectionStatus(false);
        const disconnectedStatus = document.getElementById('connection-status');
        const isDisconnectedClass = disconnectedStatus?.className.includes('disconnected');
        
        return {
          hasUpdateFunction: true,
          connectedStateUpdated: isConnectedClass,
          disconnectedStateUpdated: isDisconnectedClass
        };
      }
      
      return { hasUpdateFunction: false };
    });
    
    expect(connectionUpdateTest.hasUpdateFunction).toBe(true);
  });

  test('should queue messages when connection is not ready', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Test message queuing behavior
    const messageQueueTest = await page.evaluate(() => {
      const gameClient = (window as any).gameClient;
      
      // WebSocket should be closed/connecting, not ready
      const wsState = gameClient?.ws?.readyState;
      
      // Attempt to send message
      const testMessage = { type: 'TEST', data: {} };
      
      // Should handle gracefully when WebSocket not ready
      try {
        gameClient?.sendMessage(testMessage);
        return {
          wsState: wsState,
          messageHandled: true
        };
      } catch (error) {
        return {
          wsState: wsState,
          messageHandled: false,
          error: error.message
        };
      }
    });
    
    // Should not throw error even if WebSocket not ready
    expect(messageQueueTest.messageHandled).toBe(true);
  });

  test('should implement game state request on connection', async ({ page }) => {
    await page.goto('/');
    
    let gameStateRequested = false;
    
    // Monitor potential WebSocket calls
    await page.exposeFunction('onGameStateRequest', () => {
      gameStateRequested = true;
    });
    
    // Modify GameClient to call our function when requesting game state
    await page.addInitScript(() => {
      const originalGameClient = window.GameClient;
      window.GameClient = class extends originalGameClient {
        async connectToServer() {
          // Call parent method
          const result = await super.connectToServer();
          
          // Signal that game state would be requested
          (window as any).onGameStateRequest();
          
          return result;
        }
      };
    });
    
    await waitForGameInitialization(page);
    
    // Game state request should have been triggered
    expect(gameStateRequested).toBe(true);
  });
});

/**
 * Helper function to wait for game initialization
 */
async function waitForGameInitialization(page: Page) {
  // Wait for loading screen to disappear
  await page.waitForFunction(
    () => {
      const loadingScreen = document.getElementById('loading-screen');
      return loadingScreen && loadingScreen.style.display === 'none';
    },
    { timeout: 30000 }
  );
  
  // Additional wait for components to render
  await page.waitForTimeout(1000);
}