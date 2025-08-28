import { chromium } from 'playwright';

async function captureFinalFeatures() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('🎯 Testing all new character creation features...');
    await page.goto('http://localhost:3005');
    
    // Wait for game to load
    await page.waitForSelector('#game-container', { timeout: 10000 });
    console.log('✅ Game interface loaded');
    
    // Navigate to character creation
    const customCreationButton = await page.locator('text=Custom Creation').first();
    if (await customCreationButton.isVisible()) {
      await customCreationButton.click();
      console.log('✅ Opened character creation interface');
      
      // Wait for interface to fully load
      await page.waitForTimeout(1500);
      
      // Take initial screenshot showing new UI
      await page.screenshot({ 
        path: 'review/final-01-new-character-ui.png',
        fullPage: true 
      });
      console.log('📸 Captured new character creation interface');
      
      // Test randomize button
      const randomizeButton = await page.locator('#randomize-skills-btn').first();
      if (await randomizeButton.isVisible()) {
        console.log('🎲 Testing randomize skills button...');
        await randomizeButton.click();
        await page.waitForTimeout(1000);
        
        // Take screenshot with randomized skills
        await page.screenshot({ 
          path: 'review/final-02-randomized-skills.png',
          fullPage: true 
        });
        console.log('📸 Captured randomized skills');
        
        // Test clear button
        const clearButton = await page.locator('#clear-skills-btn').first();
        if (await clearButton.isVisible()) {
          console.log('🗑️ Testing clear skills button...');
          await clearButton.click();
          await page.waitForTimeout(500);
          
          // Take screenshot with cleared skills
          await page.screenshot({ 
            path: 'review/final-03-cleared-skills.png',
            fullPage: true 
          });
          console.log('📸 Captured cleared skills state');
        }
        
        // Test manual skill allocation and ability preview
        console.log('⚙️ Testing manual skill allocation...');
        const skillButtons = await page.locator('.point-button').filter({ hasText: '+' }).all();
        
        if (skillButtons.length > 0) {
          // Allocate points to test ability preview
          for (let i = 0; i < Math.min(6, skillButtons.length); i++) {
            await skillButtons[i].click();
            await page.waitForTimeout(300);
          }
          console.log('✅ Allocated test skill points');
          
          // Take screenshot showing ability preview
          await page.screenshot({ 
            path: 'review/final-04-ability-preview.png',
            fullPage: true 
          });
          console.log('📸 Captured ability preview system');
          
          // Focus screenshot on character preview panel
          const characterPreview = await page.locator('.character-preview-enhanced');
          if (await characterPreview.isVisible()) {
            await characterPreview.screenshot({ 
              path: 'review/final-05-preview-panel-detail.png'
            });
            console.log('📸 Captured detailed character preview panel');
          }
        }
        
        // Test weapon selection
        console.log('⚔️ Testing weapon selection...');
        const weaponOptions = await page.locator('.weapon-option').all();
        if (weaponOptions.length > 0) {
          await weaponOptions[0].click();
          await page.waitForTimeout(500);
          
          // Take screenshot with weapon selected
          await page.screenshot({ 
            path: 'review/final-06-weapon-selected.png',
            fullPage: true 
          });
          console.log('📸 Captured weapon selection');
        }
        
        // Test name input
        const nameInput = await page.locator('#character-name-input');
        if (await nameInput.isVisible()) {
          await nameInput.fill('Test Hero');
          await page.waitForTimeout(500);
          
          // Take final comprehensive screenshot
          await page.screenshot({ 
            path: 'review/final-07-complete-character.png',
            fullPage: true 
          });
          console.log('📸 Captured complete character creation');
        }
        
        // Test scrollbars by scrolling in different sections
        console.log('📜 Testing custom scrollbars...');
        const skillGrid = await page.locator('#skill-allocation-grid');
        if (await skillGrid.isVisible()) {
          await skillGrid.evaluate(el => el.scrollTop = 100);
          await page.waitForTimeout(500);
          
          await page.screenshot({ 
            path: 'review/final-08-scrollbar-test.png',
            fullPage: true 
          });
          console.log('📸 Captured scrollbar styling');
        }
      } else {
        console.log('⚠️ Randomize button not found');
      }
    } else {
      console.log('⚠️ Custom Creation button not found');
    }
    
    // Take final full context screenshot
    await page.screenshot({ 
      path: 'review/final-09-complete-interface.png',
      fullPage: true 
    });
    console.log('📸 Captured final complete interface');
    
  } catch (error) {
    console.error('❌ Error during final testing:', error);
    await page.screenshot({ 
      path: 'review/final-error-state.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('🏁 Final feature testing complete!');
  }
}

captureFinalFeatures();