// image-compare.js - Compare any images against reference designs
const fs = require('fs').promises;
const path = require('path');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');

// ============= CONFIGURATION =============
const CONFIG = {
  // Define your image comparisons
  comparisons: [
    {
      name: 'game-ui',
      currentImage: './screenshots/game-ui-current.png',
      referenceImage: './references/game-ui-design.png',
      region: null  // Or specify { x: 100, y: 50, width: 400, height: 300 } to test specific area
    },
    {
      name: 'player-stats-panel',
      currentImage: './screenshots/game-ui-current.png', 
      referenceImage: './references/player-stats-design.png',
      region: { x: 1295, y: 0, width: 345, height: 740 }  // Just the right panel
    },
    // Add more comparisons here
  ],
  
  // Comparison settings
  comparison: {
    threshold: 0.1,        // Sensitivity (0 = exact, 1 = ignore everything)
    includeAA: true,       // Include anti-aliasing in comparison
    alpha: 0.1,           // Transparency handling
    diffColor: [255, 0, 0], // Red for differences
    diffColorAlt: [0, 255, 0], // Green for anti-aliased differences
  },
  
  // Pass/fail thresholds
  grading: {
    maxDiffPixels: 5000,   // Fail if more than 5000 pixels differ
    maxDiffPercent: 2,     // Fail if more than 2% pixels differ
    
    // Grade thresholds
    grades: {
      A: { minMatch: 99 },   // 99%+ match = A
      B: { minMatch: 97 },   // 97%+ match = B
      C: { minMatch: 95 },   // 95%+ match = C
      D: { minMatch: 90 },   // 90%+ match = D
      F: { minMatch: 0 }     // Below 90% = F
    }
  }
};

// ============= MAIN COMPARISON FUNCTION =============
async function runComparisons() {
  console.log('🎮 Visual Comparison Tool\n');
  console.log('=' .repeat(50));
  
  // Create folders
  await createFolders();
  
  const results = [];
  
  // Run each comparison
  for (const comparison of CONFIG.comparisons) {
    console.log(`\n🔍 Comparing: ${comparison.name}`);
    
    const result = await compareImages(comparison);
    results.push(result);
    
    // Print result
    printResult(result);
  }
  
  // Print summary
  printSummary(results);
  
  // Generate HTML report
  await generateHTMLReport(results);
}

// ============= COMPARE TWO IMAGES =============
async function compareImages(comparison) {
  try {
    // Check if files exist
    const currentExists = await fileExists(comparison.currentImage);
    const referenceExists = await fileExists(comparison.referenceImage);
    
    if (!currentExists) {
      return {
        name: comparison.name,
        error: `Current image not found: ${comparison.currentImage}`,
        passed: false
      };
    }
    
    if (!referenceExists) {
      return {
        name: comparison.name,
        error: `Reference image not found: ${comparison.referenceImage}`,
        passed: false
      };
    }
    
    // Read images
    const currentBuffer = await fs.readFile(comparison.currentImage);
    const referenceBuffer = await fs.readFile(comparison.referenceImage);
    
    let current = PNG.sync.read(currentBuffer);
    let reference = PNG.sync.read(referenceBuffer);
    
    // Handle region extraction if specified
    if (comparison.region) {
      current = extractRegion(current, comparison.region);
      reference = extractRegion(reference, comparison.region);
    }
    
    // Check dimensions
    if (current.width !== reference.width || current.height !== reference.height) {
      return {
        name: comparison.name,
        error: `Size mismatch: Current (${current.width}x${current.height}) vs Reference (${reference.width}x${reference.height})`,
        passed: false,
        currentSize: `${current.width}x${current.height}`,
        referenceSize: `${reference.width}x${reference.height}`
      };
    }
    
    // Create diff image
    const diff = new PNG({ width: current.width, height: current.height });
    
    // Run pixel comparison
    const diffPixels = pixelmatch(
      reference.data,
      current.data,
      diff.data,
      current.width,
      current.height,
      CONFIG.comparison
    );
    
    // Save diff image
    const diffPath = `./diffs/${comparison.name}-diff.png`;
    await fs.writeFile(diffPath, PNG.sync.write(diff));
    
    // Calculate percentages
    const totalPixels = current.width * current.height;
    const diffPercent = (diffPixels / totalPixels) * 100;
    const matchPercent = 100 - diffPercent;
    
    // Determine grade
    const grade = getGrade(matchPercent);
    
    // Determine pass/fail
    const passed = diffPixels <= CONFIG.grading.maxDiffPixels && 
                   diffPercent <= CONFIG.grading.maxDiffPercent;
    
    return {
      name: comparison.name,
      currentImage: comparison.currentImage,
      referenceImage: comparison.referenceImage,
      diffImage: diffPath,
      region: comparison.region,
      passed,
      grade,
      diffPixels,
      totalPixels,
      diffPercent,
      matchPercent,
      dimensions: `${current.width}x${current.height}`
    };
    
  } catch (error) {
    return {
      name: comparison.name,
      error: error.message,
      passed: false
    };
  }
}

// ============= EXTRACT REGION FROM IMAGE =============
function extractRegion(image, region) {
  const { x, y, width, height } = region;
  const extracted = new PNG({ width, height });
  
  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      const sourceIdx = ((y + dy) * image.width + (x + dx)) << 2;
      const targetIdx = (dy * width + dx) << 2;
      
      // Copy RGBA values
      extracted.data[targetIdx] = image.data[sourceIdx];
      extracted.data[targetIdx + 1] = image.data[sourceIdx + 1];
      extracted.data[targetIdx + 2] = image.data[sourceIdx + 2];
      extracted.data[targetIdx + 3] = image.data[sourceIdx + 3];
    }
  }
  
  return extracted;
}

// ============= PRINT INDIVIDUAL RESULT =============
function printResult(result) {
  if (result.error) {
    console.log(`   ❌ ERROR: ${result.error}`);
    return;
  }
  
  const status = result.passed ? '✅ PASS' : '❌ FAIL';
  const gradeColor = result.grade === 'A' ? '🟢' : 
                     result.grade === 'B' ? '🟡' : 
                     result.grade === 'C' ? '🟠' : '🔴';
  
  console.log(`   ${status} - Grade: ${gradeColor} ${result.grade} (${result.matchPercent.toFixed(2)}% match)`);
  console.log(`   Dimensions: ${result.dimensions}`);
  
  if (result.region) {
    console.log(`   Region: x:${result.region.x}, y:${result.region.y}, ${result.region.width}x${result.region.height}`);
  }
  
  if (!result.passed) {
    console.log(`   Differences: ${result.diffPixels.toLocaleString()} pixels (${result.diffPercent.toFixed(2)}%)`);
    console.log(`   View diff: ${result.diffImage}`);
  }
}

// ============= GENERATE HTML REPORT =============
async function generateHTMLReport(results) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Visual Comparison Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: #fff;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px;
      border-radius: 15px;
      margin-bottom: 30px;
      text-align: center;
    }
    h1 { 
      font-size: 36px;
      margin-bottom: 10px;
    }
    .summary {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-top: 30px;
    }
    .stat {
      text-align: center;
    }
    .stat-value {
      font-size: 48px;
      font-weight: bold;
      display: block;
    }
    .stat-label {
      opacity: 0.9;
      margin-top: 5px;
    }
    .comparison {
      background: #1a1a1a;
      border-radius: 15px;
      padding: 30px;
      margin-bottom: 30px;
      border: 1px solid #333;
    }
    .comparison-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 1px solid #333;
    }
    .comparison-title {
      font-size: 24px;
      font-weight: bold;
    }
    .grade {
      font-size: 36px;
      font-weight: bold;
      padding: 10px 20px;
      border-radius: 10px;
      background: #2a2a2a;
    }
    .grade-a { color: #10b981; border: 2px solid #10b981; }
    .grade-b { color: #f59e0b; border: 2px solid #f59e0b; }
    .grade-c { color: #f97316; border: 2px solid #f97316; }
    .grade-d, .grade-f { color: #ef4444; border: 2px solid #ef4444; }
    .status {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: bold;
      margin-left: 15px;
    }
    .passed { background: #10b981; }
    .failed { background: #ef4444; }
    .images {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 20px;
    }
    .image-container {
      background: #0a0a0a;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #333;
    }
    .image-container img {
      width: 100%;
      height: auto;
      display: block;
    }
    .image-label {
      padding: 15px;
      text-align: center;
      background: #151515;
      font-weight: bold;
      border-top: 1px solid #333;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-top: 20px;
      padding: 20px;
      background: #0a0a0a;
      border-radius: 10px;
    }
    .stat-item {
      text-align: center;
    }
    .stat-item-value {
      font-size: 24px;
      font-weight: bold;
      color: #667eea;
    }
    .stat-item-label {
      opacity: 0.7;
      margin-top: 5px;
      font-size: 14px;
    }
    .error {
      background: #7f1d1d;
      padding: 15px;
      border-radius: 10px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎮 Visual Comparison Report</h1>
    <p style="opacity: 0.9; font-size: 18px;">Pixel-perfect comparison of UI elements</p>
    <div class="summary">
      <div class="stat">
        <span class="stat-value">${results.length}</span>
        <div class="stat-label">Total Tests</div>
      </div>
      <div class="stat">
        <span class="stat-value" style="color: #10b981;">${results.filter(r => r.passed).length}</span>
        <div class="stat-label">Passed</div>
      </div>
      <div class="stat">
        <span class="stat-value" style="color: #ef4444;">${results.filter(r => !r.passed).length}</span>
        <div class="stat-label">Failed</div>
      </div>
      <div class="stat">
        <span class="stat-value" style="color: #667eea;">
          ${results.filter(r => r.matchPercent).length > 0 ? 
            (results.reduce((acc, r) => acc + (r.matchPercent || 0), 0) / results.filter(r => r.matchPercent).length).toFixed(1) : 
            '0'}%
        </span>
        <div class="stat-label">Avg Match</div>
      </div>
    </div>
  </div>
  
  ${results.map(r => `
    <div class="comparison">
      <div class="comparison-header">
        <div>
          <span class="comparison-title">${r.name}</span>
          ${r.passed !== undefined ? `<span class="status ${r.passed ? 'passed' : 'failed'}">${r.passed ? 'PASS' : 'FAIL'}</span>` : ''}
        </div>
        ${r.grade ? `<div class="grade grade-${r.grade.toLowerCase()}">${r.grade}</div>` : ''}
      </div>
      
      ${r.error ? `
        <div class="error">
          ⚠️ ${r.error}
        </div>
      ` : `
        <div class="stats">
          <div class="stat-item">
            <div class="stat-item-value">${r.matchPercent.toFixed(2)}%</div>
            <div class="stat-item-label">Match</div>
          </div>
          <div class="stat-item">
            <div class="stat-item-value">${r.diffPixels.toLocaleString()}</div>
            <div class="stat-item-label">Different Pixels</div>
          </div>
          <div class="stat-item">
            <div class="stat-item-value">${r.dimensions}</div>
            <div class="stat-item-label">Dimensions</div>
          </div>
          <div class="stat-item">
            <div class="stat-item-value">${r.region ? 'Partial' : 'Full'}</div>
            <div class="stat-item-label">Coverage</div>
          </div>
        </div>
        
        <div class="images">
          <div class="image-container">
            <img src="${r.referenceImage}" alt="Reference">
            <div class="image-label">📐 Reference Design</div>
          </div>
          <div class="image-container">
            <img src="${r.currentImage}" alt="Current">
            <div class="image-label">📸 Current Image</div>
          </div>
          <div class="image-container">
            <img src="${r.diffImage}" alt="Difference">
            <div class="image-label">🔍 Differences (Red)</div>
          </div>
        </div>
      `}
    </div>
  `).join('')}
  
  <div style="text-align: center; margin-top: 40px; opacity: 0.5;">
    Generated: ${new Date().toLocaleString()}
  </div>
</body>
</html>
  `;
  
  await fs.writeFile('./comparison-report.html', html);
  console.log('\n📄 HTML Report: ./comparison-report.html');
}

// ============= HELPER FUNCTIONS =============
async function createFolders() {
  const folders = ['./screenshots', './references', './diffs'];
  for (const folder of folders) {
    await fs.mkdir(folder, { recursive: true });
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function getGrade(matchPercent) {
  for (const [grade, requirements] of Object.entries(CONFIG.grading.grades)) {
    if (matchPercent >= requirements.minMatch) {
      return grade;
    }
  }
  return 'F';
}

function printSummary(results) {
  console.log('\n' + '=' .repeat(50));
  console.log('📊 SUMMARY\n');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.length - passed;
  const validResults = results.filter(r => r.matchPercent);
  const avgMatch = validResults.length > 0 ?
    validResults.reduce((acc, r) => acc + r.matchPercent, 0) / validResults.length : 0;
  
  console.log(`Total Comparisons: ${results.length}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Average Match: ${avgMatch.toFixed(2)}%`);
  
  // Grade distribution
  const grades = validResults.reduce((acc, r) => {
    acc[r.grade] = (acc[r.grade] || 0) + 1;
    return acc;
  }, {});
  
  if (Object.keys(grades).length > 0) {
    console.log('\nGrade Distribution:');
    for (const [grade, count] of Object.entries(grades).sort()) {
      console.log(`  ${grade}: ${count}`);
    }
  }
}

// ============= BATCH PROCESSING =============
async function processBatch(folderPath) {
  console.log(`📁 Processing all images in: ${folderPath}\n`);
  
  const files = await fs.readdir(folderPath);
  const pngFiles = files.filter(f => f.endsWith('.png'));
  
  const comparisons = pngFiles.map(file => ({
    name: path.basename(file, '.png'),
    currentImage: path.join(folderPath, file),
    referenceImage: path.join('./references', file),
    region: null
  }));
  
  CONFIG.comparisons = comparisons;
  await runComparisons();
}

// ============= MAIN EXECUTION =============
const command = process.argv[2];
const arg = process.argv[3];

if (command === 'batch' && arg) {
  processBatch(arg).catch(console.error);
} else if (command === 'compare' && arg) {
  // Quick compare two specific images
  const reference = process.argv[4];
  if (!reference) {
    console.log('Usage: node image-compare.js compare <current> <reference>');
    process.exit(1);
  }
  CONFIG.comparisons = [{
    name: 'quick-compare',
    currentImage: arg,
    referenceImage: reference,
    region: null
  }];
  runComparisons().catch(console.error);
} else {
  runComparisons().catch(console.error);
}

console.log(`
╔════════════════════════════════════════════════════════╗
║                   Image Comparison Tool                    ║
╠════════════════════════════════════════════════════════╣
║  Usage:                                                    ║
║  node image-compare.js              - Run configured tests ║
║  node image-compare.js batch <dir>  - Test all in folder  ║
║  node image-compare.js compare <img1> <img2> - Quick test ║
╚════════════════════════════════════════════════════════╝

Setup:
1. Put reference designs in ./references/
2. Put current screenshots in ./screenshots/
3. Edit CONFIG in this file to define comparisons
4. Run: npm install pixelmatch pngjs
`);
