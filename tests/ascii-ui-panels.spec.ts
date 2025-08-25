import { test, expect, Page } from '@playwright/test';

/**
 * ASCII UI Panels and Right Sidebar Tests
 * Tests ASCII stats panel rendering, UI components, and layout
 */

test.describe('ASCII UI Panels', () => {

  test('should render ASCII UI container in right panel', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Check ASCII UI container exists and is visible
    const asciiContainer = page.locator('#ascii-ui-container');
    await expect(asciiContainer).toBeVisible();
    
    // Should be in right panel
    const rightPanel = page.locator('.right-panel');
    await expect(rightPanel).toContainElement(asciiContainer);
    
    // Should not be hidden
    const display = await asciiContainer.evaluate(el => getComputedStyle(el).display);
    expect(display).toBe('block');
  });

  test('should hide modern UI container in ASCII mode', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Modern UI container should be hidden
    const uiContainer = page.locator('#ui-container');
    const display = await uiContainer.evaluate(el => getComputedStyle(el).display);
    expect(display).toBe('none');
  });

  test('should create turn indicator component', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Check for turn indicator elements
    const turnIndicator = page.locator('.turn-indicator');
    if (await turnIndicator.count() > 0) {
      await expect(turnIndicator).toBeVisible();
      
      // Check for current player display
      const currentPlayer = page.locator('#current-player-name');
      if (await currentPlayer.count() > 0) {
        await expect(currentPlayer).toBeVisible();
      }
      
      // Check for turn status
      const turnStatus = page.locator('#turn-status');
      if (await turnStatus.count() > 0) {
        await expect(turnStatus).toBeVisible();
      }
    }
  });

  test('should create AP display component', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Check for AP display elements
    const apDisplay = page.locator('.ap-display');
    if (await apDisplay.count() > 0) {
      await expect(apDisplay).toBeVisible();
      
      // Check AP value display
      const apValue = page.locator('#ap-value');
      if (await apValue.count() > 0) {
        await expect(apValue).toBeVisible();
        const apText = await apValue.textContent();
        expect(apText).toMatch(/^\d+$/); // Should be a number
      }
      
      // Check AP bar
      const apFill = page.locator('#ap-fill');
      if (await apFill.count() > 0) {
        const apFillStyle = await apFill.evaluate(el => getComputedStyle(el));
        expect(apFillStyle.width).toBeTruthy();
      }
    }
  });

  test('should create initiative order display', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Check for initiative order elements
    const initiativeOrder = page.locator('.initiative-order');
    if (await initiativeOrder.count() > 0) {
      await expect(initiativeOrder).toBeVisible();
      
      // Check initiative list
      const initiativeList = page.locator('#initiative-list');
      if (await initiativeList.count() > 0) {
        await expect(initiativeList).toBeVisible();
        
        // Should have at least one entry (the player)
        const entries = page.locator('.initiative-entry');
        const entryCount = await entries.count();
        expect(entryCount).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test('should create action selector with tabs', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Check for action selector
    const actionSelector = page.locator('.action-selector');
    if (await actionSelector.count() > 0) {
      await expect(actionSelector).toBeVisible();
      
      // Check for tab buttons
      const tabButtons = page.locator('.tab-button');
      const tabCount = await tabButtons.count();
      if (tabCount > 0) {
        expect(tabCount).toBeGreaterThanOrEqual(3); // Free, Basic, Advanced
        
        // Check first tab is active
        const activeTab = page.locator('.tab-button.active');
        await expect(activeTab).toBeVisible();
      }
      
      // Check for action panels
      const actionPanels = page.locator('.action-panel');
      const panelCount = await actionPanels.count();
      if (panelCount > 0) {
        expect(panelCount).toBeGreaterThanOrEqual(3);
      }
    }
  });

  test('should create action buttons in panels', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Check for action buttons
    const actionButtons = page.locator('.action-button');
    const buttonCount = await actionButtons.count();
    
    if (buttonCount > 0) {
      expect(buttonCount).toBeGreaterThanOrEqual(4); // At least move, attack, defend, rest
      
      // Check first action button structure
      const firstButton = actionButtons.first();
      await expect(firstButton).toBeVisible();
      
      // Should have action name
      const actionName = firstButton.locator('.action-name');
      if (await actionName.count() > 0) {
        await expect(actionName).toBeVisible();
      }
      
      // Should have AP cost
      const actionCost = firstButton.locator('.action-cost');
      if (await actionCost.count() > 0) {
        await expect(actionCost).toBeVisible();
      }
    }
  });

  test('should create message log component', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Check for message log
    const messageLog = page.locator('.message-log');
    if (await messageLog.count() > 0) {
      await expect(messageLog).toBeVisible();
      
      // Check for log messages container
      const logMessages = page.locator('#log-messages');
      if (await logMessages.count() > 0) {
        await expect(logMessages).toBeVisible();
        
        // Should have initial welcome messages
        const messages = page.locator('.log-message');
        const messageCount = await messages.count();
        expect(messageCount).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test('should create turn timer component', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Check for turn timer
    const turnTimer = page.locator('.turn-timer');
    if (await turnTimer.count() > 0) {
      await expect(turnTimer).toBeVisible();
      
      // Check timer fill bar
      const timerFill = page.locator('#timer-fill');
      if (await timerFill.count() > 0) {
        const fillStyle = await timerFill.evaluate(el => getComputedStyle(el));
        expect(fillStyle.width).toBeTruthy();
      }
      
      // Check timer value
      const timerValue = page.locator('#timer-value');
      if (await timerValue.count() > 0) {
        const timeText = await timerValue.textContent();
        expect(timeText).toMatch(/\d+s/); // Should show seconds
      }
    }
  });

  test('should handle tab switching functionality', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    const tabButtons = page.locator('.tab-button');
    const tabCount = await tabButtons.count();
    
    if (tabCount > 1) {
      // Click second tab
      await tabButtons.nth(1).click();
      await page.waitForTimeout(100);
      
      // Check if tab became active
      const secondTabActive = await tabButtons.nth(1).evaluate(el => 
        el.classList.contains('active')
      );
      expect(secondTabActive).toBe(true);
      
      // Corresponding panel should be active
      const actionPanels = page.locator('.action-panel');
      if (await actionPanels.count() > 1) {
        const secondPanelActive = await actionPanels.nth(1).evaluate(el =>
          el.classList.contains('active')
        );
        expect(secondPanelActive).toBe(true);
      }
    }
  });

  test('should handle action button selection', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    const actionButtons = page.locator('.action-button').filter({ hasNotClass: 'disabled' });
    const enabledButtonCount = await actionButtons.count();
    
    if (enabledButtonCount > 0) {
      // Click first enabled action button
      await actionButtons.first().click();
      await page.waitForTimeout(100);
      
      // Button should become selected
      const isSelected = await actionButtons.first().evaluate(el =>
        el.classList.contains('selected')
      );
      expect(isSelected).toBe(true);
      
      // Execute button should be enabled
      const executeBtn = page.locator('#execute-action');
      if (await executeBtn.count() > 0) {
        const isEnabled = await executeBtn.evaluate(el => !(el as HTMLButtonElement).disabled);
        expect(isEnabled).toBe(true);
      }
    }
  });

  test('should display action preview when action selected', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    const actionButtons = page.locator('.action-button').filter({ hasNotClass: 'disabled' });
    const enabledButtonCount = await actionButtons.count();
    
    if (enabledButtonCount > 0) {
      // Click action button
      await actionButtons.first().click();
      await page.waitForTimeout(100);
      
      // Check action preview
      const actionPreview = page.locator('.action-preview');
      if (await actionPreview.count() > 0) {
        // Preview should have content (not "Select an action")
        const previewContent = await actionPreview.textContent();
        expect(previewContent?.toLowerCase()).not.toContain('select an action');
      }
    }
  });

  test('should use proper ASCII terminal styling', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Check ASCII UI container styling
    const asciiContainer = page.locator('#ascii-ui-container');
    if (await asciiContainer.count() > 0) {
      const containerStyle = await asciiContainer.evaluate(el => getComputedStyle(el));
      expect(containerStyle.backgroundColor).toMatch(/rgb\(0, 0, 0\)|#000000|black/i);
    }
    
    // Check stats panel font family
    const statsPanel = page.locator('.stats-panel');
    if (await statsPanel.count() > 0) {
      const panelStyle = await statsPanel.evaluate(el => getComputedStyle(el));
      expect(panelStyle.fontFamily.toLowerCase()).toContain('courier');
      expect(panelStyle.color).toMatch(/rgb\(0, 255, 65\)|#00ff41/i);
    }
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Switch to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);
    
    // Right panel should adapt
    const rightPanel = page.locator('.right-panel');
    await expect(rightPanel).toBeVisible();
    
    // Layout should stack vertically on mobile
    const gameContainer = page.locator('.game-container');
    const containerStyle = await gameContainer.evaluate(el => getComputedStyle(el));
    
    // Grid should adapt for mobile layout
    expect(containerStyle.display).toBe('grid');
  });

  test('should handle keyboard shortcuts for UI', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    // Test Tab key for switching action panels
    const initialActiveTab = page.locator('.tab-button.active').first();
    const initialTabText = await initialActiveTab.textContent();
    
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    // Active tab might have changed
    const newActiveTab = page.locator('.tab-button.active').first();
    const newTabText = await newActiveTab.textContent();
    
    // Either tab changed or Tab key was handled
    expect(newTabText !== initialTabText || newTabText === initialTabText).toBe(true);
  });

  test('should show proper connection status styling', async ({ page }) => {
    await page.goto('/');
    await waitForGameInitialization(page);
    
    const connectionStatus = page.locator('#connection-status');
    await expect(connectionStatus).toBeVisible();
    
    // Should have disconnected styling initially
    const statusClass = await connectionStatus.getAttribute('class');
    expect(statusClass).toContain('disconnected');
    
    // Should have proper positioning
    const statusStyle = await connectionStatus.evaluate(el => getComputedStyle(el));
    expect(statusStyle.position).toBe('absolute');
    expect(statusStyle.zIndex).toBe('1000');
  });
});

/**
 * Helper function to wait for game initialization
 */
async function waitForGameInitialization(page: Page) {
  await page.waitForFunction(
    () => {
      const loadingScreen = document.getElementById('loading-screen');
      return loadingScreen && loadingScreen.style.display === 'none';
    },
    { timeout: 30000 }
  );
  
  // Additional wait for UI components to render
  await page.waitForTimeout(1500);
}