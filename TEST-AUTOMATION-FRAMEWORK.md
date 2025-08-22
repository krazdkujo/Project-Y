# Test Automation Framework Recommendations

## Framework Architecture Overview

### Core Testing Stack
- **Unit Testing**: Jest 29.7.0 with ts-jest
- **Integration Testing**: Jest with Supabase test utilities
- **E2E Testing**: Playwright with custom game testing extensions
- **Performance Testing**: Custom Jest-based load testing framework
- **Database Testing**: pgTAP with Supabase CLI integration
- **Visual Regression**: Playwright with game-specific configurations

## 1. Enhanced Jest Configuration

### Updated jest.config.js
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/client/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testTimeout: 10000,
  verbose: true,
  
  // Enhanced configuration for expanded game
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/src/**/*.test.ts'],
      testTimeout: 5000
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/src/**/*.integration.test.ts'],
      testTimeout: 30000,
      setupFilesAfterEnv: ['<rootDir>/src/setupIntegrationTests.ts']
    },
    {
      displayName: 'performance',
      testMatch: ['<rootDir>/src/**/*.performance.test.ts'],
      testTimeout: 120000,
      setupFilesAfterEnv: ['<rootDir>/src/setupPerformanceTests.ts']
    }
  ],
  
  // Coverage thresholds for quality gates
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/server/skills/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './src/server/items/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './src/server/abilities/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  }
};
```

## 2. Test Data Factory Framework

### Base Factory System
```typescript
// src/testing/factories/BaseFactory.ts
export abstract class BaseFactory<T> {
  protected defaultAttributes: Partial<T> = {};
  
  abstract build(overrides?: Partial<T>): T;
  
  buildList(count: number, overrides?: Partial<T>): T[] {
    return Array.from({ length: count }, () => this.build(overrides));
  }
  
  sequence<K extends keyof T>(
    attribute: K, 
    generator: (index: number) => T[K]
  ): this {
    // Implementation for sequence generation
    return this;
  }
}
```

### Game-Specific Factories
```typescript
// src/testing/factories/SkillFactory.ts
export class SkillFactory extends BaseFactory<Skill> {
  build(overrides?: Partial<Skill>): Skill {
    return {
      id: faker.string.uuid(),
      name: faker.helpers.arrayElement(SKILL_NAMES),
      category: faker.helpers.arrayElement(['weapon', 'armor', 'magic', 'passive']),
      level: faker.number.int({ min: 1, max: 100 }),
      experience: faker.number.int({ min: 0, max: 10000 }),
      maxLevel: 100,
      trainingCost: faker.number.int({ min: 100, max: 300 }),
      ...overrides
    };
  }
  
  withCategory(category: SkillCategory): this {
    this.defaultAttributes.category = category;
    return this;
  }
  
  withLevel(level: number): this {
    this.defaultAttributes.level = level;
    return this;
  }
}

// src/testing/factories/PlayerFactory.ts
export class PlayerFactory extends BaseFactory<Player> {
  build(overrides?: Partial<Player>): Player {
    return {
      id: faker.string.uuid(),
      name: faker.person.firstName(),
      position: { x: faker.number.int({ min: 0, max: 19 }), y: faker.number.int({ min: 0, max: 19 }) },
      health: faker.number.int({ min: 80, max: 100 }),
      maxHealth: 100,
      currentAP: faker.number.int({ min: 2, max: 8 }),
      skills: this.createSkillSet(),
      equipment: this.createEquipment(),
      status: 'ready',
      ...overrides
    };
  }
  
  private createSkillSet(): SkillSet {
    return SKILL_CATEGORIES.reduce((skills, category) => {
      SKILLS_BY_CATEGORY[category].forEach(skill => {
        skills[skill] = faker.number.int({ min: 1, max: 100 });
      });
      return skills;
    }, {} as SkillSet);
  }
  
  withClass(gameClass: GameClass): this {
    this.defaultAttributes.skills = CLASS_SKILL_DISTRIBUTIONS[gameClass];
    return this;
  }
  
  asHighLevel(): this {
    this.defaultAttributes.skills = Object.keys(this.defaultAttributes.skills || {}).reduce(
      (skills, skill) => ({ ...skills, [skill]: faker.number.int({ min: 80, max: 100 }) }),
      {}
    );
    return this;
  }
}

// src/testing/factories/index.ts
export const factories = {
  skill: new SkillFactory(),
  player: new PlayerFactory(),
  item: new ItemFactory(),
  ability: new AbilityFactory(),
  gameSession: new GameSessionFactory()
};
```

## 3. Database Testing Framework

### Supabase Test Utilities
```typescript
// src/testing/supabase-test-utils.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export class SupabaseTestClient {
  private client: SupabaseClient<Database>;
  
  constructor() {
    this.client = createClient<Database>(
      process.env.SUPABASE_TEST_URL!,
      process.env.SUPABASE_TEST_ANON_KEY!
    );
  }
  
  async setupTestDatabase(): Promise<void> {
    // Reset test database to known state
    await this.clearAllTables();
    await this.seedBasicData();
  }
  
  async clearAllTables(): Promise<void> {
    const tables = ['player_skills', 'player_items', 'player_abilities', 'game_sessions'];
    for (const table of tables) {
      await this.client.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }
  }
  
  async seedBasicData(): Promise<void> {
    // Seed skills data
    const { error: skillsError } = await this.client
      .from('skills')
      .upsert(TEST_SKILLS_DATA);
    
    if (skillsError) throw skillsError;
    
    // Seed items data
    const { error: itemsError } = await this.client
      .from('items')
      .upsert(TEST_ITEMS_DATA);
      
    if (itemsError) throw itemsError;
    
    // Seed abilities data
    const { error: abilitiesError } = await this.client
      .from('abilities')
      .upsert(TEST_ABILITIES_DATA);
      
    if (abilitiesError) throw abilitiesError;
  }
  
  async createTestPlayer(overrides?: Partial<Player>): Promise<Player> {
    const player = factories.player.build(overrides);
    
    const { data, error } = await this.client
      .from('players')
      .insert(player)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
  
  async cleanup(): Promise<void> {
    await this.clearAllTables();
  }
}

// Global test setup
export const supabaseTestClient = new SupabaseTestClient();

beforeEach(async () => {
  await supabaseTestClient.setupTestDatabase();
});

afterEach(async () => {
  await supabaseTestClient.cleanup();
});
```

### Database Performance Testing
```typescript
// src/testing/database-performance.ts
export class DatabasePerformanceTracker {
  private queryTimes: Map<string, number[]> = new Map();
  
  async measureQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await queryFn();
    const duration = performance.now() - start;
    
    if (!this.queryTimes.has(queryName)) {
      this.queryTimes.set(queryName, []);
    }
    this.queryTimes.get(queryName)!.push(duration);
    
    return { result, duration };
  }
  
  getQueryStats(queryName: string) {
    const times = this.queryTimes.get(queryName) || [];
    return {
      count: times.length,
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      p95: this.percentile(times, 0.95),
      p99: this.percentile(times, 0.99)
    };
  }
  
  private percentile(arr: number[], p: number): number {
    const sorted = arr.sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[index] || 0;
  }
}
```

## 4. Enhanced Playwright Configuration

### Game-Specific Playwright Setup
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './dev-tools/testing/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    }
  ],
  
  // Game-specific configuration
  expect: {
    toHaveScreenshot: {
      threshold: 0.1,
      maxDiffPixels: 1000,
      animationHandling: 'disabled'
    }
  },
  
  webServer: {
    command: 'npm run dev',
    port: 8080,
    reuseExistingServer: !process.env.CI,
  },
});
```

### Game Testing Utilities
```typescript
// dev-tools/testing/game-test-utils.ts
export class GameTestUtils {
  constructor(private page: Page) {}
  
  async waitForGameLoad(): Promise<void> {
    await this.page.waitForSelector('#connection-status.connected', { timeout: 10000 });
    await this.page.waitForSelector('#game-map', { timeout: 5000 });
    await this.page.waitForSelector('.ap-display', { timeout: 5000 });
    await this.page.waitForTimeout(2000);
  }
  
  async createMultiplayerSession(playerCount: number): Promise<string> {
    await this.page.click('[data-action="create-session"]');
    await this.page.fill('[data-input="player-count"]', playerCount.toString());
    await this.page.click('[data-action="start-session"]');
    
    const sessionId = await this.page.getAttribute('[data-session-id]', 'data-session-id');
    return sessionId!;
  }
  
  async selectSkill(skillName: string): Promise<void> {
    await this.page.click(`[data-skill="${skillName}"]`);
  }
  
  async useAbility(abilityName: string): Promise<void> {
    await this.page.click(`[data-ability="${abilityName}"]`);
    await this.page.waitForSelector('.ability-cooldown', { timeout: 1000 });
  }
  
  async useItem(itemName: string): Promise<void> {
    await this.page.click(`[data-item="${itemName}"]`);
  }
  
  async getPlayerState(): Promise<PlayerState> {
    return await this.page.evaluate(() => {
      // Extract player state from global game object
      return window.gameState.currentPlayer;
    });
  }
  
  async waitForTurnStart(): Promise<void> {
    await this.page.waitForSelector('.turn-indicator.active', { timeout: 30000 });
  }
  
  async verifyGameSyncAcrossPlayers(expectedState: Partial<GameState>): Promise<void> {
    // Implementation for cross-player state verification
  }
}
```

## 5. Performance Testing Framework

### Load Testing Orchestrator
```typescript
// src/testing/performance/LoadTestOrchestrator.ts
export class LoadTestOrchestrator {
  private sessions: GameSession[] = [];
  private metrics: PerformanceMetrics = new PerformanceMetrics();
  
  async createConcurrentSessions(
    sessionCount: number,
    playersPerSession: number
  ): Promise<GameSession[]> {
    const sessionPromises = Array.from({ length: sessionCount }, async (_, i) => {
      const sessionId = `load-test-session-${i}`;
      const players = factories.player.buildList(playersPerSession);
      
      return await this.createGameSession(sessionId, players);
    });
    
    this.sessions = await Promise.all(sessionPromises);
    return this.sessions;
  }
  
  async simulateGameplayLoad(durationMs: number): Promise<void> {
    const startTime = Date.now();
    const actionPromises: Promise<void>[] = [];
    
    while (Date.now() - startTime < durationMs) {
      this.sessions.forEach(session => {
        session.players.forEach(player => {
          // Simulate random player actions
          actionPromises.push(this.simulatePlayerActions(player));
        });
      });
      
      await Promise.all(actionPromises);
      actionPromises.length = 0;
      
      await this.delay(100); // 100ms between action batches
    }
  }
  
  private async simulatePlayerActions(player: Player): Promise<void> {
    const actions = [
      () => this.useRandomAbility(player),
      () => this.useRandomItem(player),
      () => this.movePlayer(player),
      () => this.progressRandomSkill(player)
    ];
    
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    
    try {
      const startTime = performance.now();
      await randomAction();
      const duration = performance.now() - startTime;
      
      this.metrics.recordActionTime(duration);
    } catch (error) {
      this.metrics.recordError(error);
    }
  }
  
  getPerformanceReport(): PerformanceReport {
    return {
      totalSessions: this.sessions.length,
      totalPlayers: this.sessions.reduce((sum, s) => sum + s.players.length, 0),
      averageActionTime: this.metrics.getAverageActionTime(),
      errorRate: this.metrics.getErrorRate(),
      memoryUsage: this.getMemoryUsage(),
      recommendationsatisfies: this.generateRecommendations()
    };
  }
}
```

### Stress Testing Scenarios
```typescript
// src/testing/performance/stress-scenarios.ts
export const STRESS_TEST_SCENARIOS = {
  // 8-player sessions with intensive ability usage
  abilitySpam: {
    name: 'Ability Spam Test',
    players: 8,
    duration: 60000, // 1 minute
    actionsPerSecond: 10,
    actionTypes: ['ability_use'],
    expectedLatency: 100 // ms
  },
  
  // Large inventory management
  inventoryStress: {
    name: 'Inventory Stress Test',
    players: 8,
    itemsPerPlayer: 100,
    duration: 30000,
    actionsPerSecond: 5,
    actionTypes: ['item_use', 'item_craft', 'item_trade']
  },
  
  // Skill progression simulation
  skillProgression: {
    name: 'Skill Progression Test',
    players: 8,
    duration: 120000, // 2 minutes
    actionsPerSecond: 3,
    actionTypes: ['skill_train', 'skill_use']
  },
  
  // Database connection stress
  databaseStress: {
    name: 'Database Connection Stress',
    players: 8,
    concurrentQueries: 50,
    duration: 60000,
    queryTypes: ['select', 'insert', 'update']
  }
};
```

## 6. Continuous Integration Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/comprehensive-testing.yml
name: Comprehensive Game Testing

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  SUPABASE_TEST_URL: ${{ secrets.SUPABASE_TEST_URL }}
  SUPABASE_TEST_ANON_KEY: ${{ secrets.SUPABASE_TEST_ANON_KEY }}

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm run test:unit -- --coverage
        
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
          
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Setup test database
        run: |
          npm run db:setup:test
          npm run db:seed:test
          
      - name: Run integration tests
        run: npm run test:integration

  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run performance tests
        run: npm run test:performance
        
      - name: Upload performance reports
        uses: actions/upload-artifact@v3
        with:
          name: performance-reports
          path: performance-reports/

  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright
        run: npx playwright install --with-deps
        
      - name: Start development server
        run: npm run dev &
        
      - name: Wait for server
        run: npx wait-on http://localhost:8080
        
      - name: Run Playwright tests
        run: npx playwright test
        
      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  database-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        
      - name: Start Supabase
        run: supabase start
        
      - name: Run database tests
        run: supabase test db
        
      - name: Run database linting
        run: supabase db lint
```

## 7. Monitoring and Alerting Integration

### Test Metrics Dashboard
```typescript
// src/testing/metrics/TestMetricsDashboard.ts
export class TestMetricsDashboard {
  private metrics: TestMetrics = new TestMetrics();
  
  async recordTestRun(testResults: TestResults): Promise<void> {
    await this.metrics.record({
      timestamp: Date.now(),
      testSuite: testResults.testSuite,
      passCount: testResults.passCount,
      failCount: testResults.failCount,
      duration: testResults.duration,
      coverage: testResults.coverage,
      performanceMetrics: testResults.performanceMetrics
    });
  }
  
  async generateQualityReport(): Promise<QualityReport> {
    const recentMetrics = await this.metrics.getRecentMetrics(30); // Last 30 days
    
    return {
      testStability: this.calculateTestStability(recentMetrics),
      performanceTrends: this.analyzePerformanceTrends(recentMetrics),
      coverageTrends: this.analyzeCoverageTrends(recentMetrics),
      recommendations: this.generateRecommendations(recentMetrics)
    };
  }
  
  async checkQualityGates(): Promise<QualityGateResult> {
    const latestMetrics = await this.metrics.getLatestMetrics();
    
    return {
      unitTestCoverage: latestMetrics.coverage.unit >= 90,
      integrationTestCoverage: latestMetrics.coverage.integration >= 70,
      performanceRegression: !this.detectPerformanceRegression(latestMetrics),
      errorRate: latestMetrics.errorRate <= 0.01,
      overallPassing: this.calculateOverallQuality(latestMetrics)
    };
  }
}
```

## 8. Implementation Recommendations

### Package.json Scripts Enhancement
```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --selectProjects unit",
    "test:integration": "jest --selectProjects integration",
    "test:performance": "jest --selectProjects performance",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false",
    
    "test:skills": "jest src/server/__tests__/skills/",
    "test:items": "jest src/server/__tests__/items/",
    "test:abilities": "jest src/server/__tests__/abilities/",
    "test:database": "supabase test db",
    
    "test:visual": "playwright test",
    "test:visual:update": "playwright test --update-snapshots",
    "test:visual:ui": "playwright test --ui",
    
    "test:load": "jest --testNamePattern='Load Testing'",
    "test:stress": "jest --testNamePattern='Stress Testing'",
    
    "db:setup:test": "supabase db reset --local",
    "db:seed:test": "npm run db:seed && npm run db:seed:test-data"
  }
}
```

### Development Environment Setup
```typescript
// src/testing/setup-dev-environment.ts
export async function setupDevelopmentTestEnvironment(): Promise<void> {
  // Start local Supabase instance
  await startSupabaseLocal();
  
  // Seed test data
  await seedTestData();
  
  // Start game server
  await startGameServer();
  
  // Initialize test clients
  await initializeTestClients();
  
  console.log('✅ Development test environment ready');
}
```

This comprehensive test automation framework provides:

1. **Structured Testing**: Clear separation of unit, integration, and performance tests
2. **Scalable Data Management**: Factory pattern for generating consistent test data
3. **Database Integration**: Full Supabase testing utilities with cleanup
4. **Performance Monitoring**: Comprehensive performance tracking and reporting
5. **Visual Regression**: Game-specific Playwright configuration
6. **CI/CD Integration**: Complete GitHub Actions workflow
7. **Quality Gates**: Automated quality checking and reporting

The framework is designed to handle the expanded game content (34+ skills, 180+ items, 175+ abilities) while maintaining high performance and quality standards for 8-player multiplayer sessions.