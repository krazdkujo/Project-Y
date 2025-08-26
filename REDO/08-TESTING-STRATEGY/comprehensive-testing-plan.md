# COMPREHENSIVE TESTING STRATEGY
## Complete Quality Assurance Framework for Tactical ASCII Roguelike

---

## TESTING PHILOSOPHY & APPROACH

### **ZERO REGRESSION MANDATE** 🔒
- **ASCII UI Standards**: Pixel-perfect preservation enforced by automated visual regression
- **Gameplay Mechanics**: All 34 skills and 175+ abilities must function identically
- **Multiplayer Coordination**: 8-player real-time gameplay cannot degrade
- **Performance Baselines**: <100ms response times maintained under all conditions

### **COMPREHENSIVE TEST PYRAMID** 📊

```
                    🔺 Manual Exploratory (2%)
                   /    Game Balance & UX       \
               🔺 E2E Integration Tests (8%)    🔺
              /     Full Player Journeys         \
          🔺 API Contract Tests (15%)            🔺
         /    WebSocket & Service APIs            \
     🔺 Component Integration (25%)              🔺
    /    Game System Interactions                 \
🔺 Unit Tests (50%)                               🔺
   Individual Functions & Logic
```

---

## UNIT TESTING FRAMEWORK (50% of Test Suite)

### **GAME LOGIC TESTING** ⚔️

```typescript
// tests/unit/APSystem.test.ts
describe('APSystem', () => {
  let apSystem: APSystem;
  
  beforeEach(() => {
    apSystem = new APSystem({
      baseAPPerTurn: 3,
      maxAPStorage: 8,
      regenerationRate: 'per_turn'
    });
  });
  
  describe('Action Point Allocation', () => {
    it('should grant correct base AP per turn', () => {
      const player = createTestPlayer({ currentAP: 0 });
      
      apSystem.regenerateAP(player);
      
      expect(player.currentAP).toBe(3);
    });
    
    it('should not exceed maximum AP storage', () => {
      const player = createTestPlayer({ currentAP: 6 });
      
      apSystem.regenerateAP(player);
      
      expect(player.currentAP).toBe(8); // Capped at max, not 9
    });
    
    it('should handle fractional AP regeneration bonuses', () => {
      const player = createTestPlayer({ 
        currentAP: 0,
        skills: { time_magic: 45 } // 45% bonus = 1.35 extra AP
      });
      
      apSystem.regenerateAP(player);
      
      expect(player.currentAP).toBe(4); // 3 base + 1 from bonus (rounded down)
    });
  });
  
  describe('AP Cost Validation', () => {
    it('should validate sufficient AP for actions', () => {
      const player = createTestPlayer({ currentAP: 5 });
      const action = createTestAction({ apCost: 3 });
      
      const canUse = apSystem.canUseAction(player, action);
      
      expect(canUse).toBe(true);
    });
    
    it('should reject actions with insufficient AP', () => {
      const player = createTestPlayer({ currentAP: 2 });
      const action = createTestAction({ apCost: 3 });
      
      const canUse = apSystem.canUseAction(player, action);
      
      expect(canUse).toBe(false);
    });
    
    it('should handle AP cost reduction bonuses', () => {
      const player = createTestPlayer({ 
        currentAP: 2,
        skills: { sword_mastery: 50 }, // 25% cost reduction at level 50
        equipment: [{ id: 'efficiency_ring', apCostReduction: 10 }]
      });
      const action = createTestAction({ 
        apCost: 3,
        skillRequirements: { sword_mastery: 25 }
      });
      
      const finalCost = apSystem.calculateFinalAPCost(player, action);
      const canUse = apSystem.canUseAction(player, action);
      
      expect(finalCost).toBe(2); // 3 * 0.75 * 0.9 = 2.025, rounded down to 2
      expect(canUse).toBe(true);
    });
  });
  
  describe('Edge Cases and Error Conditions', () => {
    it('should handle negative AP gracefully', () => {
      const player = createTestPlayer({ currentAP: -5 });
      
      apSystem.regenerateAP(player);
      
      expect(player.currentAP).toBe(3); // Reset to base regeneration
    });
    
    it('should handle extremely high AP values', () => {
      const player = createTestPlayer({ currentAP: 999999 });
      const action = createTestAction({ apCost: 1 });
      
      const canUse = apSystem.canUseAction(player, action);
      apSystem.deductAP(player, action.apCost);
      
      expect(canUse).toBe(true);
      expect(player.currentAP).toBe(999998);
    });
    
    it('should validate action cost bounds', () => {
      expect(() => createTestAction({ apCost: -1 })).toThrow('AP cost cannot be negative');
      expect(() => createTestAction({ apCost: 0 })).not.toThrow();
      expect(() => createTestAction({ apCost: 8 })).not.toThrow();
      expect(() => createTestAction({ apCost: 9 })).toThrow('AP cost cannot exceed maximum storage');
    });
  });
});
```

### **SKILL SYSTEM TESTING** 📈

```typescript
// tests/unit/SkillSystem.test.ts
describe('SkillSystem', () => {
  let skillSystem: SkillSystem;
  
  beforeEach(() => {
    skillSystem = new SkillSystem({
      skills: SKILL_DEFINITIONS,
      progressionRates: PROGRESSION_RATES
    });
  });
  
  describe('Skill Progression', () => {
    it('should advance skills based on usage', () => {
      const character = createTestCharacter({ 
        skills: { sword_mastery: 24 }
      });
      
      skillSystem.useSkill(character, 'sword_mastery', { 
        action: 'basic_attack',
        difficulty: 'normal',
        success: true 
      });
      
      expect(character.skills.sword_mastery).toBeGreaterThan(24);
    });
    
    it('should unlock abilities at specific thresholds', () => {
      const character = createTestCharacter({ 
        skills: { sword_mastery: 24 }
      });
      
      // Advance skill to level 25 threshold
      skillSystem.setSkillLevel(character, 'sword_mastery', 25);
      
      const availableAbilities = skillSystem.getAvailableAbilities(character);
      expect(availableAbilities).toContain('power_attack');
      expect(availableAbilities).not.toContain('whirlwind'); // Requires level 50
    });
    
    it('should handle skill synergies and prerequisites', () => {
      const character = createTestCharacter({
        skills: {
          sword_mastery: 30,
          fire_magic: 25,
          weapon_enchanting: 20
        }
      });
      
      const availableAbilities = skillSystem.getAvailableAbilities(character);
      
      expect(availableAbilities).toContain('flaming_sword'); // Requires sword_mastery:25 + fire_magic:20
      expect(availableAbilities).not.toContain('meteor_strike'); // Requires fire_magic:75
    });
  });
  
  describe('Experience and Progression Rates', () => {
    it('should apply different progression rates by skill category', () => {
      const character = createTestCharacter({ skills: {} });
      
      // Combat skills progress faster (rate: 1.0)
      skillSystem.useSkill(character, 'sword_mastery', { baseExperience: 10 });
      const combatGain = character.skills.sword_mastery;
      
      // Crafting skills progress slower (rate: 0.8)
      skillSystem.useSkill(character, 'blacksmithing', { baseExperience: 10 });
      const craftingGain = character.skills.blacksmithing;
      
      expect(combatGain).toBeGreaterThan(craftingGain);
    });
    
    it('should implement diminishing returns at high levels', () => {
      const character = createTestCharacter({
        skills: { sword_mastery: 80 }
      });
      
      const experienceBefore = skillSystem.getSkillExperience(character, 'sword_mastery');
      
      skillSystem.useSkill(character, 'sword_mastery', { baseExperience: 100 });
      
      const experienceAfter = skillSystem.getSkillExperience(character, 'sword_mastery');
      const actualGain = experienceAfter - experienceBefore;
      
      // High-level skills should gain less than base experience
      expect(actualGain).toBeLessThan(100);
      expect(actualGain).toBeGreaterThan(20); // But still meaningful progress
    });
  });
  
  describe('Skill Interactions and Dependencies', () => {
    it('should calculate skill bonuses correctly', () => {
      const character = createTestCharacter({
        skills: {
          sword_mastery: 45,    // +22.5% damage bonus
          strength: 60,         // +30% damage bonus  
          weapon_maintenance: 25 // +12.5% weapon durability
        }
      });
      
      const bonuses = skillSystem.calculateSkillBonuses(character);
      
      expect(bonuses.weaponDamage).toBeCloseTo(1.525, 2); // 1 + 0.225 + 0.3
      expect(bonuses.weaponDurability).toBeCloseTo(1.125, 2); // 1 + 0.125
    });
    
    it('should handle skill degradation over time', () => {
      const character = createTestCharacter({
        skills: { sword_mastery: 50 },
        lastUsed: { sword_mastery: Date.now() - (90 * 24 * 60 * 60 * 1000) } // 90 days ago
      });
      
      skillSystem.applySkillDecay(character);
      
      expect(character.skills.sword_mastery).toBeLessThan(50);
      expect(character.skills.sword_mastery).toBeGreaterThan(45); // Gradual decay, not dramatic
    });
  });
});
```

---

## COMPONENT INTEGRATION TESTING (25% of Test Suite)

### **REACT COMPONENT TESTING** ⚛️

```typescript
// tests/integration/QuickSkillBar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickSkillBar } from '@/components/game/QuickSkillBar';
import { createTestSkills, createTestTheme } from '../utils/testHelpers';

describe('QuickSkillBar Component Integration', () => {
  const mockOnSkillActivate = jest.fn();
  const theme = createTestTheme();
  
  beforeEach(() => {
    mockOnSkillActivate.mockClear();
  });
  
  describe('ASCII Layout Preservation', () => {
    it('should maintain exact 40-character width', () => {
      const skills = createTestSkills();
      
      render(
        <QuickSkillBar
          skills={skills}
          currentAP={8}
          maxAP={8}
          onSkillActivate={mockOnSkillActivate}
          theme={theme}
        />
      );
      
      const skillBar = screen.getByRole('toolbar');
      const computedStyle = window.getComputedStyle(skillBar);
      
      // Verify exact character width (40ch)
      expect(computedStyle.width).toBe('40ch');
    });
    
    it('should render border characters correctly', () => {
      const skills = createTestSkills();
      
      render(
        <QuickSkillBar
          skills={skills}
          currentAP={8}
          maxAP={8}
          onSkillActivate={mockOnSkillActivate}
          theme={theme}
        />
      );
      
      // Check for proper box-drawing characters
      expect(screen.getByText(/┌─Quick Skills─────────────────────────┐/)).toBeInTheDocument();
      expect(screen.getByText(/└─────────────────────────────────────┘/)).toBeInTheDocument();
    });
    
    it('should format skill text to exact specifications', () => {
      const skills = [
        createTestSkill({ name: 'Move', apCost: 1 }),
        createTestSkill({ name: 'Very Long Ability Name', apCost: 3 }),
        null, // Empty slot
        createTestSkill({ name: 'Heal', apCost: 2, cooldown: 5 })
      ];
      
      render(
        <QuickSkillBar
          skills={skills}
          currentAP={8}
          maxAP={8}
          onSkillActivate={mockOnSkillActivate}
          theme={theme}
        />
      );
      
      // Verify exact formatting patterns
      expect(screen.getByText(/\[1\] Move\s+\(1AP\) Ready/)).toBeInTheDocument();
      expect(screen.getByText(/\[2\] Very Long Abi…\s+\(3AP\) Ready/)).toBeInTheDocument(); // Truncated
      expect(screen.getByText(/\[3\] \(Empty\)\s+\(0AP\)/)).toBeInTheDocument();
      expect(screen.getByText(/\[4\] Heal\s+\(2AP\) 5s/)).toBeInTheDocument(); // Cooldown display
    });
  });
  
  describe('Hotkey Integration', () => {
    it('should activate skills via keyboard hotkeys', () => {
      const skills = createTestSkills();
      
      render(
        <QuickSkillBar
          skills={skills}
          currentAP={8}
          maxAP={8}
          onSkillActivate={mockOnSkillActivate}
          theme={theme}
        />
      );
      
      // Simulate pressing hotkey '1'
      fireEvent.keyDown(document, { key: '1' });
      
      expect(mockOnSkillActivate).toHaveBeenCalledWith(0); // First slot (0-indexed)
    });
    
    it('should prevent activation when insufficient AP', () => {
      const skills = [createTestSkill({ name: 'Expensive Ability', apCost: 5 })];
      
      render(
        <QuickSkillBar
          skills={skills}
          currentAP={2} // Insufficient AP
          maxAP={8}
          onSkillActivate={mockOnSkillActivate}
          theme={theme}
        />
      );
      
      fireEvent.keyDown(document, { key: '1' });
      
      expect(mockOnSkillActivate).not.toHaveBeenCalled();
    });
    
    it('should handle cooldowns correctly', () => {
      const skills = [createTestSkill({ 
        name: 'Healing Potion', 
        apCost: 1, 
        cooldown: 10 
      })];
      
      render(
        <QuickSkillBar
          skills={skills}
          currentAP={8}
          maxAP={8}
          onSkillActivate={mockOnSkillActivate}
          theme={theme}
        />
      );
      
      fireEvent.keyDown(document, { key: '1' });
      
      expect(mockOnSkillActivate).not.toHaveBeenCalled(); // Blocked by cooldown
    });
  });
  
  describe('Accessibility Features', () => {
    it('should provide proper ARIA labels', () => {
      const skills = [createTestSkill({ name: 'Fireball', apCost: 3 })];
      
      render(
        <QuickSkillBar
          skills={skills}
          currentAP={8}
          maxAP={8}
          onSkillActivate={mockOnSkillActivate}
          theme={theme}
        />
      );
      
      const skill1Button = screen.getByRole('button', { name: /Fireball, costs 3 action points, ready to use/ });
      expect(skill1Button).toBeInTheDocument();
      expect(skill1Button).toHaveAttribute('accesskey', '1');
    });
    
    it('should announce AP status to screen readers', () => {
      const skills = createTestSkills();
      
      render(
        <QuickSkillBar
          skills={skills}
          currentAP={3}
          maxAP={8}
          onSkillActivate={mockOnSkillActivate}
          theme={theme}
        />
      );
      
      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveAttribute('aria-label', 'Quick skills, 3 of 8 action points available');
    });
  });
});
```

### **GAME STATE INTEGRATION TESTING** 🎮

```typescript
// tests/integration/GameStateIntegration.test.ts
describe('Game State Integration', () => {
  let gameStore: GameStore;
  let networkStore: NetworkStore;
  
  beforeEach(() => {
    gameStore = createTestGameStore();
    networkStore = createTestNetworkStore();
  });
  
  describe('Action Processing Flow', () => {
    it('should process player actions through complete flow', async () => {
      // Setup: Player in active game session
      const session = createTestGameSession();
      const player = createTestPlayer({ currentAP: 5 });
      
      gameStore.setSession(session.id, [player]);
      gameStore.setCurrentTurn(player.id, 30000); // 30 second turn
      
      // Action: Use ability that costs 3 AP
      const useAbilityAction = {
        type: 'use_ability',
        abilityId: 'fireball',
        target: { x: 10, y: 5 },
        apCost: 3
      };
      
      gameStore.useAction(useAbilityAction.abilityId, useAbilityAction.target);
      
      // Verify: Optimistic update applied immediately
      expect(gameStore.getState().currentAP).toBe(2); // 5 - 3
      
      // Verify: Action sent to network
      expect(networkStore.getState().pendingMessages).toHaveLength(1);
      
      // Simulate: Server confirmation
      const serverResponse = {
        type: 'action_result',
        success: true,
        newGameState: {
          players: [{ ...player, currentAP: 2 }],
          effects: [{ type: 'explosion', position: { x: 10, y: 5 } }]
        }
      };
      
      await networkStore.handleServerMessage(serverResponse);
      
      // Verify: Game state synchronized with server
      const finalState = gameStore.getState();
      expect(finalState.currentAP).toBe(2);
      expect(finalState.messageLog).toContainEqual(
        expect.objectContaining({
          type: 'action',
          message: expect.stringContaining('Used Fireball')
        })
      );
    });
    
    it('should handle action conflicts and server corrections', async () => {
      const player = createTestPlayer({ currentAP: 3 });
      gameStore.setCurrentPlayer(player);
      
      // Client thinks it has 3 AP and uses 2 AP ability
      gameStore.useAction('heal', null);
      expect(gameStore.getState().currentAP).toBe(1); // Optimistic update
      
      // Server rejects - player actually only had 1 AP
      const serverCorrection = {
        type: 'action_error',
        error: 'insufficient_ap',
        correctGameState: {
          players: [{ ...player, currentAP: 1 }]
        }
      };
      
      await networkStore.handleServerMessage(serverCorrection);
      
      // Verify: Client state corrected to match server
      expect(gameStore.getState().currentAP).toBe(1);
      expect(gameStore.getState().messageLog).toContainEqual(
        expect.objectContaining({
          type: 'error',
          message: expect.stringContaining('insufficient action points')
        })
      );
    });
  });
  
  describe('Multiplayer State Synchronization', () => {
    it('should synchronize player positions across clients', async () => {
      const session = createTestGameSession();
      const players = [
        createTestPlayer({ id: 'player1', position: { x: 5, y: 5 } }),
        createTestPlayer({ id: 'player2', position: { x: 10, y: 10 } })
      ];
      
      gameStore.setSession(session.id, players);
      
      // Simulate: Another player moves
      const moveUpdate = {
        type: 'player_moved',
        playerId: 'player2',
        newPosition: { x: 11, y: 10 },
        timestamp: Date.now()
      };
      
      await networkStore.handleServerMessage(moveUpdate);
      
      // Verify: Other player's position updated
      const updatedPlayers = gameStore.getState().players;
      const player2 = updatedPlayers.find(p => p.id === 'player2');
      
      expect(player2?.position).toEqual({ x: 11, y: 10 });
    });
    
    it('should handle turn transitions correctly', async () => {
      const players = [
        createTestPlayer({ id: 'player1' }),
        createTestPlayer({ id: 'player2' })
      ];
      
      gameStore.setSession('test-session', players);
      gameStore.setCurrentTurn('player1', 30000);
      
      // Simulate: Turn ends and passes to next player
      const turnTransition = {
        type: 'turn_changed',
        fromPlayer: 'player1',
        toPlayer: 'player2',
        timeLimit: 30000,
        turnNumber: 2
      };
      
      await networkStore.handleServerMessage(turnTransition);
      
      // Verify: Turn state updated
      const gameState = gameStore.getState();
      expect(gameState.currentTurnPlayer).toBe('player2');
      expect(gameState.turnTimeRemaining).toBe(30000);
    });
  });
});
```

---

## VISUAL REGRESSION TESTING (Critical for ASCII)

### **PIXEL-PERFECT ASCII UI TESTING** 📸

```typescript
// tests/visual/ASCIIVisualRegression.test.ts
import { test, expect } from '@playwright/test';

test.describe('ASCII UI Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/game');
    await page.waitForSelector('.quick-skill-bar');
  });
  
  test('Quick Skill Bar - Exact Layout Preservation', async ({ page }) => {
    // Setup: Load game with specific skill configuration
    await page.evaluate(() => {
      window.testUtils.loadGameState({
        skills: [
          { name: 'Move', apCost: 1, status: 'Ready' },
          { name: 'Basic Attack', apCost: 1, status: 'Ready' },
          { name: 'Fireball', apCost: 3, status: 'Ready' },
          { name: 'Heal', apCost: 2, status: 'Cooldown', cooldown: 5 },
          null, // Empty slot
          null, // Empty slot  
          null, // Empty slot
          null, // Empty slot
          null  // Empty slot
        ],
        currentAP: 6,
        maxAP: 8
      });
    });
    
    // Wait for skill bar to render
    await page.waitForTimeout(100);
    
    // Take screenshot of skill bar only
    const skillBar = page.locator('.quick-skill-bar');
    
    // CRITICAL: Compare against blessed baseline
    await expect(skillBar).toHaveScreenshot('quick-skill-bar-baseline.png', {
      threshold: 0.01, // 99% pixel-perfect match required
      animations: 'disabled'
    });
  });
  
  test('Game Map - ASCII Character Rendering', async ({ page }) => {
    // Setup: Load specific dungeon layout
    await page.evaluate(() => {
      window.testUtils.loadDungeonMap({
        width: 60,
        height: 20,
        layout: TEST_DUNGEON_LAYOUT,
        playerPosition: { x: 30, y: 10 },
        enemies: [
          { position: { x: 35, y: 12 }, type: 'goblin' },
          { position: { x: 25, y: 8 }, type: 'orc' }
        ]
      });
    });
    
    const gameMap = page.locator('.game-map-renderer');
    
    await expect(gameMap).toHaveScreenshot('game-map-with-enemies.png', {
      threshold: 0.005, // 99.5% pixel-perfect match
      animations: 'disabled'
    });
  });
  
  test('Full Interface - Dark Theme Consistency', async ({ page }) => {
    // Apply dark theme
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'terminal-dark');
    });
    
    await page.waitForTimeout(200); // Allow theme to apply
    
    // Full page screenshot
    await expect(page).toHaveScreenshot('full-interface-dark-theme.png', {
      fullPage: true,
      threshold: 0.02, // 98% match (slight anti-aliasing differences acceptable)
      animations: 'disabled'
    });
  });
  
  test('Responsive Layout - Mobile Viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify mobile layout adaptations while preserving ASCII
    const mobileInterface = page.locator('.game-layout');
    
    await expect(mobileInterface).toHaveScreenshot('mobile-interface-layout.png', {
      threshold: 0.01,
      animations: 'disabled'
    });
  });
  
  test('Animation Consistency - Turn Timer', async ({ page }) => {
    // Start turn with timer
    await page.evaluate(() => {
      window.testUtils.startTurnTimer(30000); // 30 seconds
    });
    
    // Capture timer at different stages
    const turnTimer = page.locator('.turn-timer');
    
    // Initial state
    await expect(turnTimer).toHaveScreenshot('turn-timer-start.png');
    
    // Mid-countdown (simulate 15 seconds elapsed)
    await page.evaluate(() => {
      window.testUtils.advanceTurnTimer(15000);
    });
    
    await expect(turnTimer).toHaveScreenshot('turn-timer-mid.png');
    
    // Warning state (last 5 seconds)
    await page.evaluate(() => {
      window.testUtils.advanceTurnTimer(25000);
    });
    
    await expect(turnTimer).toHaveScreenshot('turn-timer-warning.png');
  });
});
```

### **CROSS-BROWSER ASCII CONSISTENCY** 🌐

```typescript
// tests/visual/CrossBrowserConsistency.test.ts
const browsers = ['chromium', 'firefox', 'webkit'];

browsers.forEach(browserName => {
  test.describe(`ASCII Rendering - ${browserName}`, () => {
    test.use({ 
      browserName: browserName as 'chromium' | 'firefox' | 'webkit'
    });
    
    test('Font Rendering Consistency', async ({ page }) => {
      await page.goto('/game');
      
      // Ensure Courier New font is loaded
      await page.waitForLoadState('networkidle');
      
      const textSample = page.locator('.ascii-text-sample');
      
      // Each browser should render identical ASCII
      await expect(textSample).toHaveScreenshot(`font-rendering-${browserName}.png`, {
        threshold: 0.001 // 99.9% identical across browsers
      });
    });
    
    test('Box Drawing Characters', async ({ page }) => {
      await page.goto('/game');
      
      const borderSample = page.locator('.ascii-border-sample');
      
      await expect(borderSample).toHaveScreenshot(`box-drawing-${browserName}.png`, {
        threshold: 0.001
      });
    });
  });
});
```

---

## PERFORMANCE TESTING FRAMEWORK

### **LOAD TESTING FOR 8-PLAYER SESSIONS** 📊

```typescript
// tests/performance/MultiplayerLoadTest.test.ts
import { test, expect } from '@playwright/test';

test.describe('Multiplayer Performance Testing', () => {
  test('8-Player Concurrent Gameplay', async ({ browser }) => {
    const contexts = [];
    const pages = [];
    
    // Create 8 concurrent player sessions
    for (let i = 0; i < 8; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      contexts.push(context);
      pages.push(page);
    }
    
    // Connect all players to same session
    const sessionId = 'load-test-session';
    
    await Promise.all(
      pages.map(async (page, index) => {
        await page.goto(`/game?session=${sessionId}&player=${index + 1}`);
        await page.waitForSelector('.connection-status.connected');
      })
    );
    
    // Measure response times under load
    const responseTimeThreshold = 100; // 100ms maximum
    const performanceMetrics = [];
    
    // Simulate simultaneous actions from all players
    for (let turn = 0; turn < 10; turn++) {
      const actionPromises = pages.map(async (page, playerIndex) => {
        const startTime = performance.now();
        
        // Each player performs a different action
        await page.click(`[data-testid="skill-slot-${(playerIndex % 4) + 1}"]`);
        
        // Wait for action confirmation
        await page.waitForSelector('.action-confirmed', { timeout: 5000 });
        
        const endTime = performance.now();
        return endTime - startTime;
      });
      
      const responseTimes = await Promise.all(actionPromises);
      performanceMetrics.push(...responseTimes);
      
      // Wait between turns
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Verify: All response times under threshold
    const averageResponseTime = performanceMetrics.reduce((a, b) => a + b) / performanceMetrics.length;
    const maxResponseTime = Math.max(...performanceMetrics);
    
    console.log(`Average response time: ${averageResponseTime.toFixed(2)}ms`);
    console.log(`Maximum response time: ${maxResponseTime.toFixed(2)}ms`);
    
    expect(averageResponseTime).toBeLessThan(responseTimeThreshold);
    expect(maxResponseTime).toBeLessThan(responseTimeThreshold * 2); // 200ms absolute max
    
    // Cleanup
    await Promise.all(contexts.map(context => context.close()));
  });
  
  test('Memory Usage Under Load', async ({ page }) => {
    await page.goto('/game');
    
    // Start memory monitoring
    await page.evaluate(() => {
      window.memoryMonitor = {
        measurements: [],
        interval: setInterval(() => {
          if (performance.memory) {
            window.memoryMonitor.measurements.push({
              used: performance.memory.usedJSHeapSize,
              total: performance.memory.totalJSHeapSize,
              limit: performance.memory.jsHeapSizeLimit,
              timestamp: Date.now()
            });
          }
        }, 1000)
      };
    });
    
    // Simulate intensive gameplay for 5 minutes
    for (let minute = 0; minute < 5; minute++) {
      // Rapid actions to stress test memory
      for (let action = 0; action < 60; action++) {
        await page.keyboard.press(`${(action % 9) + 1}`); // Cycle through skills
        await page.waitForTimeout(1000);
      }
    }
    
    // Get memory measurements
    const memoryData = await page.evaluate(() => {
      clearInterval(window.memoryMonitor.interval);
      return window.memoryMonitor.measurements;
    });
    
    // Verify: No memory leaks (growth should plateau)
    const initialMemory = memoryData[0].used;
    const finalMemory = memoryData[memoryData.length - 1].used;
    const memoryGrowth = (finalMemory - initialMemory) / initialMemory;
    
    console.log(`Memory growth over 5 minutes: ${(memoryGrowth * 100).toFixed(2)}%`);
    
    expect(memoryGrowth).toBeLessThan(0.5); // Less than 50% growth
  });
});
```

---

## AUTOMATED TESTING PIPELINE

### **CONTINUOUS INTEGRATION CONFIGURATION** 🔄

```yaml
# .github/workflows/comprehensive-testing.yml
name: Comprehensive Testing Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run unit tests with coverage
      run: npm run test:coverage
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
  
  visual-regression:
    name: Visual Regression Tests
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 18
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install Playwright browsers
      run: npx playwright install --with-deps
    
    - name: Build application
      run: npm run build
    
    - name: Start test server
      run: npm run preview &
      
    - name: Wait for server
      run: npx wait-on http://localhost:4173
    
    - name: Run visual regression tests
      run: npx playwright test tests/visual/ --reporter=html
    
    - name: Upload visual test results
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: visual-test-results
        path: |
          test-results/
          playwright-report/
  
  performance-tests:
    name: Performance Testing
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 18
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Start backend services
      run: |
        docker-compose up -d redis postgres
        npm run start:server &
    
    - name: Run performance tests
      run: npm run test:performance
      env:
        PERFORMANCE_THRESHOLD_MS: 100
        MEMORY_THRESHOLD_MB: 256
    
    - name: Generate performance report
      run: npm run report:performance
    
    - name: Upload performance metrics
      uses: actions/upload-artifact@v4
      with:
        name: performance-metrics
        path: performance-report.json
  
  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    
    services:
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
      
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 18
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run database migrations
      run: npm run db:migrate
      env:
        DATABASE_URL: postgresql://postgres:test_password@localhost:5432/test_db
    
    - name: Run integration tests
      run: npm run test:integration
      env:
        REDIS_URL: redis://localhost:6379
        DATABASE_URL: postgresql://postgres:test_password@localhost:5432/test_db
```

---

## QUALITY GATES & DEPLOYMENT CRITERIA

### **AUTOMATED QUALITY GATES** ✅

```typescript
// tests/quality-gates/QualityGates.test.ts
describe('Production Deployment Quality Gates', () => {
  test('Performance Requirements', async () => {
    const performanceReport = await loadPerformanceReport();
    
    // Gate 1: Response Time Requirements
    expect(performanceReport.averageResponseTime).toBeLessThan(100); // 100ms average
    expect(performanceReport.p95ResponseTime).toBeLessThan(200);     // 200ms 95th percentile
    expect(performanceReport.maxResponseTime).toBeLessThan(500);     // 500ms absolute maximum
    
    // Gate 2: Memory Requirements  
    expect(performanceReport.memoryUsage.average).toBeLessThan(256 * 1024 * 1024); // 256MB
    expect(performanceReport.memoryUsage.peak).toBeLessThan(512 * 1024 * 1024);    // 512MB peak
    
    // Gate 3: Frame Rate Requirements
    expect(performanceReport.frameRate.average).toBeGreaterThan(58); // 58+ FPS average
    expect(performanceReport.frameRate.minimum).toBeGreaterThan(30); // 30+ FPS minimum
  });
  
  test('Visual Regression Requirements', async () => {
    const visualReport = await loadVisualRegressionReport();
    
    // Gate 4: ASCII UI Preservation
    expect(visualReport.quickSkillBar.pixelDifference).toBeLessThan(0.01);  // 99%+ identical
    expect(visualReport.gameMap.pixelDifference).toBeLessThan(0.005);       // 99.5%+ identical
    expect(visualReport.fullInterface.pixelDifference).toBeLessThan(0.02);  // 98%+ identical
    
    // Gate 5: Cross-Browser Consistency
    const browserConsistency = visualReport.crossBrowser;
    expect(browserConsistency.chromiumVsFirefox).toBeLessThan(0.001);  // 99.9%+ consistent
    expect(browserConsistency.chromiumVsWebkit).toBeLessThan(0.001);   // 99.9%+ consistent
  });
  
  test('Functionality Requirements', async () => {
    const testResults = await loadTestResults();
    
    // Gate 6: Test Coverage Requirements
    expect(testResults.coverage.statements).toBeGreaterThan(95);    // 95%+ statement coverage
    expect(testResults.coverage.branches).toBeGreaterThan(90);      // 90%+ branch coverage
    expect(testResults.coverage.functions).toBeGreaterThan(95);     // 95%+ function coverage
    
    // Gate 7: Test Success Requirements
    expect(testResults.unit.passed).toBe(testResults.unit.total);         // 100% unit tests pass
    expect(testResults.integration.passed).toBe(testResults.integration.total); // 100% integration tests pass
    expect(testResults.e2e.passed).toBe(testResults.e2e.total);           // 100% E2E tests pass
  });
  
  test('Security Requirements', async () => {
    const securityReport = await loadSecurityReport();
    
    // Gate 8: Security Standards
    expect(securityReport.vulnerabilities.critical).toBe(0);  // Zero critical vulnerabilities
    expect(securityReport.vulnerabilities.high).toBe(0);      // Zero high vulnerabilities
    expect(securityReport.vulnerabilities.medium).toBeLessThan(5); // < 5 medium vulnerabilities
    
    // Gate 9: Authentication Security
    expect(securityReport.authentication.jwtValidation).toBe(true);
    expect(securityReport.authentication.sessionSecurity).toBe(true);
    expect(securityReport.authentication.rateLimiting).toBe(true);
  });
});
```

This comprehensive testing strategy ensures zero regression while enabling confident modernization of your tactical ASCII roguelike. The multi-layered approach catches issues early while the automated pipeline prevents deployment of problematic changes.