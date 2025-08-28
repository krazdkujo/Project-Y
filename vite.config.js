import { defineConfig } from 'vite'

export default defineConfig({
  // Development server configuration
  server: {
    port: 3000,
    open: true,
    host: true
  },
  
  // Build configuration optimized for games
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      input: {
        main: 'index.html'
      },
      output: {
        // Chunk splitting for better caching
        manualChunks: {
          // Game logic modules
          'game-core': [
            './src/core/GameState.js',
            './src/core/EventSystem.js',
            './src/game/core/GameManager.js'
          ],
          // UI modules
          'game-ui': [
            './src/ui/core/UIManager.js',
            './src/ui/panels/LeftPanel.js'
          ],
          // Game systems
          'game-systems': [
            './src/combat/CombatManager.js',
            './src/movement/core/MovementSystem.js',
            './src/encounters/core/EncounterManager.js'
          ]
        }
      }
    }
  },
  
  // Asset handling
  assetsInclude: ['**/*.md', '**/*.txt'],
  
  // Development optimizations
  optimizeDeps: {
    include: []
  },
  
  // Public directory for static assets
  publicDir: 'public'
})