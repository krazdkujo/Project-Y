import { FullConfig } from '@playwright/test';

/**
 * Global test teardown for ASCII Roguelike testing
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up ASCII Roguelike Test Suite...');
  
  // Add any cleanup logic here if needed
  
  console.log('✨ Test cleanup complete');
  return Promise.resolve();
}

export default globalTeardown;