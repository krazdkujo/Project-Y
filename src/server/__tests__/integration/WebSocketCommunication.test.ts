import { APManager, APAbilityProcessor } from '../../APSystem';
import { TurnManager } from '../../TurnManager';
import { FreeActionProcessor } from '../../FreeActions';
import { GameMessage, FreeAction, APAction, Player, TacticalSignal } from '../../../shared/types';
import { NETWORK, ERROR_MESSAGES, AP_SYSTEM } from '../../../shared/constants';
import { 
  MockWebSocket, 
  createMockPlayers, 
  delay, 
  NetworkSimulator,
  PerformanceTimer 
} from '../utils/testHelpers';

/**
 * Integration tests for WebSocket communication and message handling
 * Tests real-time messaging, synchronization, and network resilience
 */
describe('WebSocket Communication Integration', () => {
  let gameComponents: {
    apManager: APManager;
    turnManager: TurnManager;
    freeActionProcessor: FreeActionProcessor;
    abilityProcessor: APAbilityProcessor;
  };
  let mockSockets: Map<string, MockWebSocket>;
  let players: Player[];
  let messageHandlers: Map<string, Function>;
  let networkSim: NetworkSimulator;

  beforeEach(() => {
    jest.useFakeTimers();
    
    // Initialize game components
    gameComponents = {
      apManager: new APManager(),
      turnManager: new TurnManager(),
      freeActionProcessor: new FreeActionProcessor(),
      abilityProcessor: new APAbilityProcessor(new APManager())
    };

    // Initialize players
    players = createMockPlayers(4);
    players.forEach(player => {
      gameComponents.apManager.initializePlayer(player.id);
      gameComponents.freeActionProcessor.addPlayer(player);
    });

    // Initialize mock WebSockets
    mockSockets = new Map();
    players.forEach(player => {
      const socket = new MockWebSocket(`ws://localhost:3000/${player.id}`);
      mockSockets.set(player.id, socket);
    });

    // Initialize message handlers
    messageHandlers = new Map();
    networkSim = new NetworkSimulator(50, 0, 10); // 50ms latency, no packet loss, 10ms jitter
  });

  afterEach(() => {
    jest.useRealTimers();
    mockSockets.clear();
    messageHandlers.clear();
  });

  /**
   * Helper to simulate server-side message handling
   */
  function setupMessageHandler(playerId: string, handler: (message: any) => void): void {
    const socket = mockSockets.get(playerId);
    if (socket) {
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handler(message);
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      };
    }
  }

  /**
   * Helper to simulate client sending message to server
   */
  async function simulateClientMessage(playerId: string, message: any): Promise<void> {
    const socket = mockSockets.get(playerId);
    if (socket) {
      const messageStr = JSON.stringify(message);
      const simulatedMessage = await networkSim.simulateMessage(messageStr);
      
      if (simulatedMessage && socket.onmessage) {
        socket.onmessage(new MessageEvent('message', { data: simulatedMessage }));
      }
    }
  }

  /**
   * Helper to broadcast message to all players
   */
  async function broadcastMessage(message: GameMessage, excludePlayer?: string): Promise<void> {
    const promises = Array.from(mockSockets.entries())
      .filter(([playerId]) => playerId !== excludePlayer)
      .map(async ([playerId, socket]) => {
        const messageStr = JSON.stringify(message);
        const simulatedMessage = await networkSim.simulateMessage(messageStr);
        
        if (simulatedMessage) {
          socket.triggerMessage(simulatedMessage);
        }
      });
    
    await Promise.all(promises);
  }

  describe('Connection Management', () => {
    test('should handle player connections and disconnections', async () => {
      const connectedPlayers = new Set<string>();
      const disconnectedPlayers = new Set<string>();

      // Setup connection handlers
      mockSockets.forEach((socket, playerId) => {
        socket.onopen = () => {
          connectedPlayers.add(playerId);
        };
        
        socket.onclose = () => {
          disconnectedPlayers.add(playerId);
          connectedPlayers.delete(playerId);
        };
      });

      // Simulate connections
      mockSockets.forEach(socket => {
        socket.triggerOpen();
      });

      expect(connectedPlayers.size).toBe(4);
      expect(disconnectedPlayers.size).toBe(0);

      // Simulate disconnection
      const disconnectingPlayer = players[0]!.id;
      mockSockets.get(disconnectingPlayer)!.close();

      expect(connectedPlayers.size).toBe(3);
      expect(disconnectedPlayers.has(disconnectingPlayer)).toBe(true);
    });

    test('should handle connection errors gracefully', async () => {
      const errors = new Map<string, Event>();

      mockSockets.forEach((socket, playerId) => {
        socket.onerror = (error) => {
          errors.set(playerId, error);
        };
      });

      // Trigger error on one socket
      const errorPlayer = players[0]!.id;
      mockSockets.get(errorPlayer)!.triggerError();

      expect(errors.has(errorPlayer)).toBe(true);
      expect(errors.size).toBe(1);
    });

    test('should implement connection timeout and retry logic', async () => {
      let connectionAttempts = 0;
      const maxRetries = NETWORK.RECONNECTION_ATTEMPTS;

      // Simulate connection failures and retries
      async function attemptConnection(playerId: string): Promise<boolean> {
        connectionAttempts++;
        
        if (connectionAttempts <= maxRetries) {
          // Simulate connection failure
          await delay(100);
          return false;
        }
        
        // Final attempt succeeds
        return true;
      }

      const result = await attemptConnection(players[0]!.id);
      expect(connectionAttempts).toBe(maxRetries + 1);
      expect(result).toBe(true);
    });
  });

  describe('Game State Synchronization', () => {
    test('should synchronize initiative order to all players', async () => {
      const receivedInitiatives = new Map<string, any>();

      // Setup message handlers to capture initiative messages
      mockSockets.forEach((socket, playerId) => {
        setupMessageHandler(playerId, (message) => {
          if (message.type === 'INITIATIVE_ORDER') {
            receivedInitiatives.set(playerId, message.data);
          }
        });
      });

      // Calculate initiative and broadcast
      gameComponents.turnManager.calculateInitiative(players);
      const turnState = gameComponents.turnManager.getTurnState();

      const initiativeMessage: GameMessage = {
        type: 'INITIATIVE_ORDER',
        data: {
          turnOrder: turnState.turnOrder,
          currentPlayer: turnState.turnOrder[0]?.playerId
        },
        timestamp: Date.now()
      };

      await broadcastMessage(initiativeMessage);

      // Verify all players received the same initiative order
      expect(receivedInitiatives.size).toBe(4);
      
      const firstReceived = Array.from(receivedInitiatives.values())[0];
      receivedInitiatives.forEach(received => {
        expect(received.turnOrder).toEqual(firstReceived.turnOrder);
      });
    });

    test('should synchronize AP updates in real-time', async () => {
      const apUpdates = new Map<string, any[]>();

      // Setup AP update handlers
      mockSockets.forEach((socket, playerId) => {
        if (!apUpdates.has(playerId)) {
          apUpdates.set(playerId, []);
        }
        
        setupMessageHandler(playerId, (message) => {
          if (message.type === 'AP_UPDATE') {
            apUpdates.get(playerId)!.push(message.data);
          }
        });
      });

      // Simulate AP changes for multiple players
      for (const player of players) {
        gameComponents.apManager.addAPForTurn(player.id, 1);
        
        const apMessage: GameMessage = {
          type: 'AP_UPDATE',
          data: {
            playerId: player.id,
            currentAP: gameComponents.apManager.getCurrentAP(player.id),
            maxAP: 8
          },
          timestamp: Date.now()
        };

        await broadcastMessage(apMessage);
      }

      // Verify all players received all AP updates
      apUpdates.forEach((updates, playerId) => {
        expect(updates).toHaveLength(4); // One update per player
        updates.forEach(update => {
          expect(update.currentAP).toBeGreaterThan(0);
          expect(update.maxAP).toBe(8);
        });
      });
    });

    test('should handle turn transitions with proper notification', async () => {
      const turnEvents = new Map<string, any[]>();

      // Setup turn event handlers
      mockSockets.forEach((socket, playerId) => {
        if (!turnEvents.has(playerId)) {
          turnEvents.set(playerId, []);
        }
        
        setupMessageHandler(playerId, (message) => {
          if (message.type === 'TURN_START' || message.type === 'TURN_END') {
            turnEvents.get(playerId)!.push(message);
          }
        });
      });

      // Initialize turn system
      gameComponents.turnManager.calculateInitiative(players);
      players.forEach(player => {
        gameComponents.turnManager.setPlayerReady(player.id, true);
      });
      gameComponents.turnManager.startCombat();

      // Simulate turn start
      const currentPlayer = gameComponents.turnManager.getCurrentPlayer()!;
      const turnStartMessage: GameMessage = {
        type: 'TURN_START',
        data: {
          playerId: currentPlayer.playerId,
          timeLimit: AP_SYSTEM.TURN_TIME_LIMIT,
          remainingTime: AP_SYSTEM.TURN_TIME_LIMIT
        },
        timestamp: Date.now()
      };

      await broadcastMessage(turnStartMessage);

      // Simulate turn end
      const turnEndMessage: GameMessage = {
        type: 'TURN_END',
        data: {
          playerId: currentPlayer.playerId,
          duration: 5000,
          forced: false
        },
        timestamp: Date.now()
      };

      await broadcastMessage(turnEndMessage);

      // Verify all players received turn events
      turnEvents.forEach((events, playerId) => {
        expect(events).toHaveLength(2); // START and END
        expect(events[0]?.type).toBe('TURN_START');
        expect(events[1]?.type).toBe('TURN_END');
      });
    });
  });

  describe('Action Processing and Feedback', () => {
    test('should process free actions and provide immediate feedback', async () => {
      const actionResults = new Map<string, any>();
      const performanceTimer = new PerformanceTimer();

      // Setup action result handlers
      mockSockets.forEach((socket, playerId) => {
        setupMessageHandler(playerId, (message) => {
          if (message.type === 'ACTION_RESULT') {
            actionResults.set(playerId, message.data);
          }
        });
      });

      const player = players[0]!;
      const freeAction: FreeAction = {
        type: 'MOVE',
        playerId: player.id,
        target: { x: player.position.x + 1, y: player.position.y },
        immediate: true,
        timestamp: Date.now()
      };

      // Process action and measure performance
      performanceTimer.start();
      
      // Simulate client sending action
      await simulateClientMessage(player.id, {
        type: 'FREE_ACTION',
        action: freeAction
      });

      // Server processes action
      const result = gameComponents.freeActionProcessor.executeImmediately(freeAction);
      
      // Server sends result back
      const resultMessage: GameMessage = {
        type: 'ACTION_RESULT',
        data: {
          actionType: 'FREE_ACTION',
          result,
          playerId: player.id
        },
        timestamp: Date.now()
      };

      await broadcastMessage(resultMessage);
      
      const processTime = performanceTimer.end();

      expect(processTime).toBeLessThan(100); // Should be very fast
      expect(actionResults.has(player.id)).toBe(true);
      expect(actionResults.get(player.id)?.result.success).toBe(true);
    });

    test('should handle AP ability execution with validation', async () => {
      const abilityResults = new Map<string, any>();

      mockSockets.forEach((socket, playerId) => {
        setupMessageHandler(playerId, (message) => {
          if (message.type === 'ACTION_RESULT' && message.data.actionType === 'AP_ABILITY') {
            abilityResults.set(playerId, message.data);
          }
        });
      });

      const player = players[0]!;
      
      // Ensure player has sufficient AP and skill
      gameComponents.apManager.setAP(player.id, 8);
      
      const apAction: APAction = {
        type: 'AP_ABILITY',
        playerId: player.id,
        abilityId: 'power_strike',
        apCost: 2,
        timestamp: Date.now()
      };

      // Simulate client sending AP ability
      await simulateClientMessage(player.id, {
        type: 'AP_ACTION',
        action: apAction
      });

      // Server processes ability
      const result = gameComponents.abilityProcessor.executeAPAbility(
        player.id, 
        apAction.abilityId, 
        player
      );

      // Server sends result
      const resultMessage: GameMessage = {
        type: 'ACTION_RESULT',
        data: {
          actionType: 'AP_ABILITY',
          result,
          playerId: player.id
        },
        timestamp: Date.now()
      };

      await broadcastMessage(resultMessage);

      expect(abilityResults.has(player.id)).toBe(true);
      const abilityResult = abilityResults.get(player.id);
      expect(abilityResult.result.success).toBe(true);
      expect(abilityResult.result.apSpent).toBe(2);
    });

    test('should validate actions and reject invalid ones', async () => {
      const errorMessages = new Map<string, any>();

      mockSockets.forEach((socket, playerId) => {
        setupMessageHandler(playerId, (message) => {
          if (message.type === 'ERROR') {
            errorMessages.set(playerId, message.data);
          }
        });
      });

      const player = players[0]!;
      
      // Try to move out of range
      const invalidAction: FreeAction = {
        type: 'MOVE',
        playerId: player.id,
        target: { x: player.position.x + 10, y: player.position.y + 10 }, // Too far
        immediate: true,
        timestamp: Date.now()
      };

      await simulateClientMessage(player.id, {
        type: 'FREE_ACTION',
        action: invalidAction
      });

      // Server validates and rejects
      const valid = gameComponents.freeActionProcessor.validateFreeAction(invalidAction);
      
      if (!valid) {
        const errorMessage: GameMessage = {
          type: 'ERROR',
          data: {
            message: ERROR_MESSAGES.OUT_OF_RANGE,
            actionType: 'MOVE',
            playerId: player.id
          },
          timestamp: Date.now()
        };

        await simulateClientMessage(player.id, JSON.stringify(errorMessage));
      }

      expect(errorMessages.has(player.id)).toBe(true);
      expect(errorMessages.get(player.id).message).toBe(ERROR_MESSAGES.OUT_OF_RANGE);
    });
  });

  describe('Tactical Communication', () => {
    test('should handle tactical signals between players', async () => {
      const tacticalSignals = new Map<string, TacticalSignal[]>();

      mockSockets.forEach((socket, playerId) => {
        if (!tacticalSignals.has(playerId)) {
          tacticalSignals.set(playerId, []);
        }
        
        setupMessageHandler(playerId, (message) => {
          if (message.type === 'TACTICAL_SIGNAL') {
            tacticalSignals.get(playerId)!.push(message.data);
          }
        });
      });

      const sender = players[0]!;
      const signal: TacticalSignal = {
        type: 'target_priority',
        sender: sender.id,
        data: {
          targetId: players[1]!.id,
          priority: 'high',
          reason: 'high_threat'
        },
        urgent: true,
        timestamp: Date.now()
      };

      // Simulate tactical signal
      await simulateClientMessage(sender.id, {
        type: 'TACTICAL_SIGNAL',
        signal
      });

      // Server broadcasts to other players
      const tacticalMessage: GameMessage = {
        type: 'TACTICAL_SIGNAL',
        data: signal,
        timestamp: Date.now(),
        recipients: players.filter(p => p.id !== sender.id).map(p => p.id)
      };

      await broadcastMessage(tacticalMessage, sender.id);

      // Verify other players received the signal
      tacticalSignals.forEach((signals, playerId) => {
        if (playerId !== sender.id) {
          expect(signals).toHaveLength(1);
          expect(signals[0]?.type).toBe('target_priority');
          expect(signals[0]?.sender).toBe(sender.id);
          expect(signals[0]?.urgent).toBe(true);
        } else {
          expect(signals).toHaveLength(0); // Sender doesn't receive own signal
        }
      });
    });

    test('should handle urgent signals with priority', async () => {
      const urgentSignals = new Map<string, TacticalSignal[]>();
      const normalSignals = new Map<string, TacticalSignal[]>();

      mockSockets.forEach((socket, playerId) => {
        urgentSignals.set(playerId, []);
        normalSignals.set(playerId, []);
        
        setupMessageHandler(playerId, (message) => {
          if (message.type === 'TACTICAL_SIGNAL') {
            const signal = message.data as TacticalSignal;
            if (signal.urgent) {
              urgentSignals.get(playerId)!.push(signal);
            } else {
              normalSignals.get(playerId)!.push(signal);
            }
          }
        });
      });

      const sender = players[0]!;
      
      // Send normal signal
      const normalSignal: TacticalSignal = {
        type: 'formation_change',
        sender: sender.id,
        data: { formation: 'defensive' },
        urgent: false,
        timestamp: Date.now()
      };

      // Send urgent signal
      const urgentSignal: TacticalSignal = {
        type: 'retreat',
        sender: sender.id,
        data: { direction: 'north', immediate: true },
        urgent: true,
        timestamp: Date.now()
      };

      // Simulate sending both signals
      await broadcastMessage({
        type: 'TACTICAL_SIGNAL',
        data: normalSignal,
        timestamp: Date.now()
      }, sender.id);

      await broadcastMessage({
        type: 'TACTICAL_SIGNAL',
        data: urgentSignal,
        timestamp: Date.now()
      }, sender.id);

      // Verify signal categorization
      mockSockets.forEach((socket, playerId) => {
        if (playerId !== sender.id) {
          expect(normalSignals.get(playerId)).toHaveLength(1);
          expect(urgentSignals.get(playerId)).toHaveLength(1);
          expect(urgentSignals.get(playerId)![0]?.type).toBe('retreat');
        }
      });
    });
  });

  describe('Network Resilience', () => {
    test('should handle message loss and implement retry logic', async () => {
      // Set high packet loss
      networkSim.setPacketLoss(50); // 50% packet loss
      
      const receivedMessages = new Map<string, number>();
      const maxRetries = 3;

      mockSockets.forEach((socket, playerId) => {
        receivedMessages.set(playerId, 0);
        
        setupMessageHandler(playerId, (message) => {
          if (message.type === 'GAME_STATE') {
            receivedMessages.set(playerId, receivedMessages.get(playerId)! + 1);
          }
        });
      });

      const criticalMessage: GameMessage = {
        type: 'GAME_STATE',
        data: { important: 'critical_data' },
        timestamp: Date.now()
      };

      // Implement retry logic
      for (const [playerId, socket] of mockSockets) {
        let attempts = 0;
        let delivered = false;

        while (attempts < maxRetries && !delivered) {
          attempts++;
          const result = await networkSim.simulateMessage(JSON.stringify(criticalMessage));
          
          if (result) {
            socket.triggerMessage(result);
            delivered = true;
          } else {
            await delay(100); // Wait before retry
          }
        }
      }

      // With retries, all players should eventually receive the message
      receivedMessages.forEach((count, playerId) => {
        expect(count).toBeGreaterThanOrEqual(1);
      });
    });

    test('should handle high latency gracefully', async () => {
      // Set high latency
      networkSim.setLatency(500); // 500ms latency
      
      const responseTime = new PerformanceTimer();
      let messageReceived = false;

      const player = players[0]!;
      const socket = mockSockets.get(player.id)!;

      setupMessageHandler(player.id, () => {
        messageReceived = true;
        responseTime.end();
      });

      // Send message and measure response time
      responseTime.start();
      const message: GameMessage = {
        type: 'GAME_STATE',
        data: { test: 'high_latency' },
        timestamp: Date.now()
      };

      await broadcastMessage(message);

      // Wait for message delivery
      await delay(600); // Wait longer than latency

      expect(messageReceived).toBe(true);
      expect(responseTime.getMeasurements()[0]).toBeGreaterThan(400); // Should reflect latency
    });

    test('should implement heartbeat and detect disconnections', async () => {
      const heartbeats = new Map<string, number>();
      const disconnectedPlayers = new Set<string>();

      // Setup heartbeat tracking
      mockSockets.forEach((socket, playerId) => {
        heartbeats.set(playerId, 0);
        
        setupMessageHandler(playerId, (message) => {
          if (message.type === 'HEARTBEAT') {
            heartbeats.set(playerId, heartbeats.get(playerId)! + 1);
          }
        });

        socket.onclose = () => {
          disconnectedPlayers.add(playerId);
        };
      });

      // Simulate heartbeat interval
      const heartbeatInterval = NETWORK.HEARTBEAT_INTERVAL / 10; // Faster for testing
      
      for (let i = 0; i < 3; i++) {
        // Send heartbeat to all connected players
        const heartbeatMessage: GameMessage = {
          type: 'HEARTBEAT',
          data: { timestamp: Date.now() },
          timestamp: Date.now()
        };

        await broadcastMessage(heartbeatMessage);
        await delay(heartbeatInterval);
      }

      // Simulate one player missing heartbeats (disconnection)
      const disconnectingPlayer = players[0]!.id;
      mockSockets.get(disconnectingPlayer)!.close();

      // Verify heartbeat tracking
      heartbeats.forEach((count, playerId) => {
        if (!disconnectedPlayers.has(playerId)) {
          expect(count).toBe(3); // Should have received 3 heartbeats
        }
      });

      expect(disconnectedPlayers.has(disconnectingPlayer)).toBe(true);
    });
  });

  describe('Performance Under Network Stress', () => {
    test('should maintain performance under message flooding', async () => {
      const messageCount = 1000;
      const timer = new PerformanceTimer();
      let processedMessages = 0;

      // Setup message counter
      mockSockets.forEach((socket, playerId) => {
        setupMessageHandler(playerId, () => {
          processedMessages++;
        });
      });

      timer.start();

      // Send many messages rapidly
      const promises: Promise<any>[] = [];
      for (let i = 0; i < messageCount; i++) {
        const message: GameMessage = {
          type: 'GAME_STATE',
          data: { messageNumber: i },
          timestamp: Date.now()
        };

        promises.push(broadcastMessage(message));
      }

      await Promise.all(promises);
      const totalTime = timer.end();

      expect(totalTime).toBeLessThan(5000); // Should handle 1000 messages in under 5 seconds
      expect(processedMessages).toBe(messageCount * players.length);
    });

    test('should handle concurrent connections and messages', async () => {
      const concurrentOperations: Promise<any>[] = [];
      const results = new Map<string, any[]>();

      // Initialize result tracking
      mockSockets.forEach((socket, playerId) => {
        results.set(playerId, []);
        
        setupMessageHandler(playerId, (message) => {
          results.get(playerId)!.push(message);
        });
      });

      // Simulate concurrent operations
      for (let i = 0; i < 10; i++) {
        // Concurrent message broadcasts
        concurrentOperations.push(
          broadcastMessage({
            type: 'GAME_STATE',
            data: { operation: i },
            timestamp: Date.now()
          })
        );

        // Concurrent player actions
        const player = players[i % players.length]!;
        concurrentOperations.push(
          simulateClientMessage(player.id, {
            type: 'FREE_ACTION',
            action: {
              type: 'BASIC_DEFENSE',
              playerId: player.id,
              immediate: true,
              timestamp: Date.now()
            }
          })
        );
      }

      await Promise.all(concurrentOperations);

      // Verify all operations completed successfully
      results.forEach((messages, playerId) => {
        expect(messages.length).toBeGreaterThan(0);
      });
    });
  });
});