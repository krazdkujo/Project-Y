// Jest setup file for AP System tests

// Mock WebSocket for testing
(global as any).WebSocket = jest.fn().mockImplementation(() => ({
  readyState: 1,
  send: jest.fn(),
  close: jest.fn(),
  on: jest.fn(),
  ping: jest.fn()
}));

// Mock timers for turn management tests
beforeEach(() => {
  jest.clearAllTimers();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

// Suppress console.log during tests unless DEBUG is set
if (!process.env.DEBUG) {
  console.log = jest.fn();
  console.info = jest.fn();
}

// Keep console.error and console.warn for debugging
console.error = jest.fn();
console.warn = jest.fn();