import { test, expect } from '@playwright/test';

test.describe('Login Screen Alignment Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the game
    await page.goto('http://localhost:3000');
    
    // Wait for the login screen to appear
    await page.waitForSelector('#ascii-screen-container', { state: 'visible', timeout: 10000 });
  });

  test('should display login screen with proper alignment', async ({ page }) => {
    // Take screenshot of login screen
    await page.screenshot({ 
      path: 'test-results/login-screen-current.png',
      fullPage: true 
    });

    // Check that ASCII screen container is visible
    const screenContainer = page.locator('#ascii-screen-container');
    await expect(screenContainer).toBeVisible();

    // Check that the login screen content is present
    const asciiScreen = page.locator('.ascii-screen');
    await expect(asciiScreen).toBeVisible();

    // Verify the login screen contains expected elements
    await expect(asciiScreen).toContainText('ROGUE');
    await expect(asciiScreen).toContainText('Player Name');
    await expect(asciiScreen).toContainText('Room ID');
    await expect(asciiScreen).toContainText('Connect to Game');

    // Check font and styling
    const computedStyle = await asciiScreen.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        whiteSpace: style.whiteSpace,
        backgroundColor: style.backgroundColor,
        color: style.color
      };
    });

    console.log('Login screen styling:', computedStyle);

    // Verify monospace font
    expect(computedStyle.fontFamily).toContain('Courier New');
    expect(computedStyle.whiteSpace).toBe('pre');

    // Get the actual text content to check alignment
    const textContent = await asciiScreen.textContent();
    console.log('Login screen text content:', textContent);

    // Check specific alignment issues
    const lines = textContent?.split('\n') || [];
    
    // Verify the ASCII art logo is present
    const hasRogueArt = lines.some(line => line.includes('██████╗'));
    expect(hasRogueArt).toBe(true);

    // Check for proper box drawing characters
    const hasBoxChars = lines.some(line => line.includes('╔') || line.includes('║') || line.includes('╚'));
    expect(hasBoxChars).toBe(true);
  });

  test('should handle input field alignment', async ({ page }) => {
    // Wait for login screen
    await page.waitForSelector('.ascii-screen', { state: 'visible' });

    // Try to interact with input fields
    const nameInput = page.locator('input').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('TestPlayer');
      
      // Take screenshot after input
      await page.screenshot({ 
        path: 'test-results/login-screen-with-input.png',
        fullPage: true 
      });
    }

    // Check if we can navigate with keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'test-results/login-screen-navigation.png',
      fullPage: true 
    });
  });

  test('should measure and fix alignment issues', async ({ page }) => {
    const asciiScreen = page.locator('.ascii-screen');
    await expect(asciiScreen).toBeVisible();

    // Get the bounding box and measure character alignment
    const boundingBox = await asciiScreen.boundingBox();
    console.log('ASCII screen bounding box:', boundingBox);

    // Get computed style details
    const styleDetails = await asciiScreen.evaluate(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        rect: {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left
        },
        style: {
          padding: style.padding,
          margin: style.margin,
          fontSize: style.fontSize,
          lineHeight: style.lineHeight,
          fontFamily: style.fontFamily,
          letterSpacing: style.letterSpacing,
          wordSpacing: style.wordSpacing
        }
      };
    });

    console.log('Login screen detailed measurements:', styleDetails);

    // Get text metrics to calculate proper character positioning
    const textMetrics = await asciiScreen.evaluate(el => {
      // Create a test element to measure character dimensions
      const testEl = document.createElement('span');
      testEl.textContent = 'M'; // Use 'M' as it's typically the widest character
      testEl.style.fontFamily = window.getComputedStyle(el).fontFamily;
      testEl.style.fontSize = window.getComputedStyle(el).fontSize;
      testEl.style.position = 'absolute';
      testEl.style.visibility = 'hidden';
      document.body.appendChild(testEl);
      
      const charRect = testEl.getBoundingClientRect();
      document.body.removeChild(testEl);
      
      return {
        charWidth: charRect.width,
        charHeight: charRect.height
      };
    });

    console.log('Character dimensions:', textMetrics);

    // Calculate expected vs actual dimensions
    const expectedWidth = 80 * textMetrics.charWidth; // 80 characters wide
    const expectedHeight = 25 * textMetrics.charHeight; // 25 lines tall
    
    console.log(`Expected dimensions: ${expectedWidth}x${expectedHeight}`);
    console.log(`Actual dimensions: ${styleDetails.rect.width}x${styleDetails.rect.height}`);
  });
});