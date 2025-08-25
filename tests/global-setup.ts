import { FullConfig } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Global test setup for ASCII Roguelike testing
 * Ensures server is running and ready for testing
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting ASCII Roguelike Test Suite Setup...');

  // Check if server is running
  try {
    const { stdout } = await execAsync('curl -f http://localhost:3000 || echo "SERVER_NOT_RUNNING"');
    if (stdout.includes('SERVER_NOT_RUNNING')) {
      console.log('⚠️  Server not running, tests will start webServer from config');
    } else {
      console.log('✅ Server is already running');
    }
  } catch (error) {
    console.log('⚠️  Could not check server status, proceeding with test setup');
  }

  console.log('🎮 ASCII Roguelike Test Environment Ready');
  return Promise.resolve();
}

export default globalSetup;