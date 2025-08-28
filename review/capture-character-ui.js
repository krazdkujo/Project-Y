import { chromium } from 'playwright';

async function captureCharacterCreationUI() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('📸 Navigating to game...');
    await page.goto('http://localhost:3004');
    
    // Wait for game to load
    await page.waitForSelector('#game-container', { timeout: 10000 });
    console.log('✅ Game interface loaded');
    
    // Take initial screenshot of guild base
    await page.screenshot({ 
      path: 'review/improved-01-guild-base.png',
      fullPage: true 
    });
    console.log('📸 Captured improved guild base screenshot');
    
    // Click on Custom Creation button to open character generator
    console.log('🔍 Looking for Custom Creation button...');
    const customCreationButton = await page.locator('text=Custom Creation').first();
    if (await customCreationButton.isVisible()) {
      await customCreationButton.click();
      console.log('✅ Clicked Custom Creation button');
      
      // Wait for character creation interface to appear
      await page.waitForTimeout(1500);
      
      // Take screenshot of improved character creation UI
      await page.screenshot({ 
        path: 'review/improved-02-character-creation-ui.png',
        fullPage: true 
      });
      console.log('📸 Captured improved character creation UI screenshot');
      
      // Take a focused screenshot of just the character creation panel
      const characterPanel = await page.locator('#character-creation-interface');
      if (await characterPanel.isVisible()) {
        await characterPanel.screenshot({ 
          path: 'review/improved-03-character-creation-panel.png'
        });
        console.log('📸 Captured improved character creation panel screenshot');
      } else {
        console.log('⚠️ Character creation panel not visible');
      }
      
      // Try to allocate some skill points for better preview
      console.log('🎯 Allocating test skill points...');
      await page.waitForTimeout(500);
      
      // Look for skill point buttons and click a few
      const skillButtons = await page.locator('.point-button').filter({ hasText: '+' }).all();
      if (skillButtons.length > 0) {
        // Allocate a few points to different skills
        for (let i = 0; i < Math.min(3, skillButtons.length); i++) {
          await skillButtons[i].click();
          await page.waitForTimeout(200);
        }
        console.log('✅ Allocated test skill points');
        
        // Take screenshot showing skills allocated
        await page.screenshot({ 
          path: 'review/improved-04-with-skills-allocated.png',
          fullPage: true 
        });
        console.log('📸 Captured screenshot with skills allocated');
      }
    } else {
      console.log('⚠️ Custom Creation button not found');
    }
    
    // Take screenshot of the full page for context
    await page.screenshot({ 
      path: 'review/improved-05-full-context.png',
      fullPage: true 
    });
    console.log('📸 Captured improved full page context screenshot');
    
  } catch (error) {
    console.error('❌ Error capturing screenshots:', error);
    // Take error state screenshot
    await page.screenshot({ 
      path: 'review/error-state.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('🏁 Screenshot capture complete');
  }
}

captureCharacterCreationUI();