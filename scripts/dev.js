#!/usr/bin/env node

/**
 * Development script to run the AP system server with hot reloading
 */

const { spawn } = require('child_process');
const path = require('path');

// Set development environment
process.env.NODE_ENV = 'development';

console.log('🚀 Starting Tactical ASCII Roguelike AP Server in development mode...');
console.log('📁 Working directory:', process.cwd());
console.log('🔧 Environment: development');
console.log('');

// Start the server with ts-node-dev for hot reloading
const serverProcess = spawn('npx', [
  'ts-node-dev',
  '--respawn',
  '--transpile-only',
  '--ignore-watch', 'node_modules',
  '--ignore-watch', 'dist',
  './src/server/server.ts'
], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

serverProcess.on('exit', (code, signal) => {
  if (signal) {
    console.log(`\n🛑 Server stopped by signal: ${signal}`);
  } else if (code !== 0) {
    console.log(`\n❌ Server exited with code: ${code}`);
  } else {
    console.log('\n✅ Server stopped gracefully');
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, stopping development server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, stopping development server...');
  serverProcess.kill('SIGTERM');
});