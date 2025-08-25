import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Visual Diff Reporter
 * 
 * Generates detailed visual difference reports when ASCII UI layout tests fail.
 * Creates highlighted diff images and detailed analysis reports showing exactly
 * what changed in the UI layout.
 */

export interface VisualDiffResult {
  pixelDifferences: number;
  percentageDiff: number;
  totalPixels: number;
  diffImagePath: string;
  analysisReport: VisualDiffAnalysis;
}

export interface VisualDiffAnalysis {
  changedAreas: DiffArea[];
  suspectedLayoutChanges: LayoutChange[];
  characterChanges: CharacterChange[];
  colorChanges: ColorChange[];
  recommendations: string[];
}

export interface DiffArea {
  x: number;
  y: number;
  width: number;
  height: number;
  severity: 'minor' | 'moderate' | 'critical';
  description: string;
}

export interface LayoutChange {
  type: 'panel_border' | 'text_position' | 'spacing' | 'alignment';
  location: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
}

export interface CharacterChange {
  expectedChar: string;
  actualChar: string;
  position: { x: number; y: number };
  type: 'box_drawing' | 'progress_bar' | 'text_content' | 'special_symbol';
}

export interface ColorChange {
  expectedColor: string;
  actualColor: string;
  area: string;
  severity: 'minor' | 'major';
}

export class VisualDiffReporter {
  private baselineDir: string;
  private actualDir: string;
  private diffDir: string;
  private reportDir: string;

  constructor(testDir: string = './tests') {
    this.baselineDir = path.join(testDir, 'visual', 'baselines');
    this.actualDir = path.join(testDir, 'visual', 'actual');
    this.diffDir = path.join(testDir, 'visual', 'diffs');
    this.reportDir = path.join(testDir, 'visual', 'reports');
    
    // Ensure directories exist
    [this.baselineDir, this.actualDir, this.diffDir, this.reportDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Generate a comprehensive visual diff report
   */
  async generateDiffReport(
    testName: string,
    baselinePath: string,
    actualPath: string,
    threshold: number = 0.1
  ): Promise<VisualDiffResult> {
    
    if (!fs.existsSync(baselinePath)) {
      throw new Error(`Baseline screenshot not found: ${baselinePath}`);
    }
    
    if (!fs.existsSync(actualPath)) {
      throw new Error(`Actual screenshot not found: ${actualPath}`);
    }

    // Read images
    const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
    const actual = PNG.sync.read(fs.readFileSync(actualPath));
    
    const { width, height } = baseline;
    
    // Ensure images are the same size
    if (actual.width !== width || actual.height !== height) {
      throw new Error(`Image dimensions don't match. Baseline: ${width}x${height}, Actual: ${actual.width}x${actual.height}`);
    }

    const diff = new PNG({ width, height });

    // Generate pixel diff with highlighting
    const pixelDifferences = pixelmatch(
      baseline.data,
      actual.data,
      diff.data,
      width,
      height,
      {
        threshold: threshold,
        includeAA: false,
        diffColor: [255, 0, 255], // Magenta for visibility
        aaColor: [255, 255, 0],   // Yellow for anti-aliasing differences
        diffColorAlt: [0, 255, 255] // Cyan alternative
      }
    );

    const totalPixels = width * height;
    const percentageDiff = (pixelDifferences / totalPixels) * 100;

    // Save diff image
    const diffImagePath = path.join(this.diffDir, `${testName}-diff.png`);
    fs.writeFileSync(diffImagePath, PNG.sync.write(diff));

    // Analyze the differences
    const analysisReport = await this.analyzeDifferences(
      baseline,
      actual,
      diff,
      testName
    );

    // Generate HTML report
    await this.generateHTMLReport(testName, {
      pixelDifferences,
      percentageDiff,
      totalPixels,
      diffImagePath,
      analysisReport
    }, baselinePath, actualPath);

    return {
      pixelDifferences,
      percentageDiff,
      totalPixels,
      diffImagePath,
      analysisReport
    };
  }

  /**
   * Analyze differences to identify specific types of UI changes
   */
  private async analyzeDifferences(
    baseline: PNG,
    actual: PNG,
    diff: PNG,
    testName: string
  ): Promise<VisualDiffAnalysis> {
    
    const changedAreas = this.identifyChangedAreas(diff);
    const suspectedLayoutChanges = this.identifyLayoutChanges(changedAreas, testName);
    const characterChanges = await this.identifyCharacterChanges(baseline, actual);
    const colorChanges = this.identifyColorChanges(baseline, actual, changedAreas);
    const recommendations = this.generateRecommendations(
      changedAreas,
      suspectedLayoutChanges,
      characterChanges,
      colorChanges
    );

    return {
      changedAreas,
      suspectedLayoutChanges,
      characterChanges,
      colorChanges,
      recommendations
    };
  }

  /**
   * Identify areas of the image that have changed
   */
  private identifyChangedAreas(diff: PNG): DiffArea[] {
    const areas: DiffArea[] = [];
    const { width, height, data } = diff;
    const visited = new Set<string>();

    // Simple flood-fill algorithm to identify connected changed regions
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (width * y + x) << 2;
        const key = `${x},${y}`;
        
        if (!visited.has(key) && this.isChangedPixel(data, idx)) {
          const area = this.floodFillArea(diff, x, y, visited);
          if (area.width * area.height > 25) { // Ignore very small changes
            areas.push(area);
          }
        }
      }
    }

    return areas;
  }

  private isChangedPixel(data: Uint8Array, idx: number): boolean {
    // Check if pixel is not black (changed)
    return data[idx] !== 0 || data[idx + 1] !== 0 || data[idx + 2] !== 0;
  }

  private floodFillArea(
    diff: PNG,
    startX: number,
    startY: number,
    visited: Set<string>
  ): DiffArea {
    const { width, height, data } = diff;
    const queue = [{ x: startX, y: startY }];
    let minX = startX, maxX = startX, minY = startY, maxY = startY;
    let pixelCount = 0;

    while (queue.length > 0) {
      const { x, y } = queue.shift()!;
      const key = `${x},${y}`;

      if (visited.has(key) || x < 0 || x >= width || y < 0 || y >= height) {
        continue;
      }

      const idx = (width * y + x) << 2;
      if (!this.isChangedPixel(data, idx)) {
        continue;
      }

      visited.add(key);
      pixelCount++;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);

      // Add neighboring pixels to queue
      queue.push({ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 });
    }

    const area = {
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
      severity: this.calculateSeverity(pixelCount),
      description: this.describeArea(minX, minY, maxX - minX + 1, maxY - minY + 1)
    };

    return area;
  }

  private calculateSeverity(pixelCount: number): 'minor' | 'moderate' | 'critical' {
    if (pixelCount < 100) return 'minor';
    if (pixelCount < 1000) return 'moderate';
    return 'critical';
  }

  private describeArea(x: number, y: number, width: number, height: number): string {
    // Attempt to describe the UI area based on position
    if (x > 600) {
      return 'Right panel area - likely ASCII UI elements';
    } else if (x < 200) {
      return 'Left side - possibly game map area';
    } else {
      return 'Central area - game content or interface';
    }
  }

  /**
   * Identify suspected layout changes based on changed areas
   */
  private identifyLayoutChanges(areas: DiffArea[], testName: string): LayoutChange[] {
    const changes: LayoutChange[] = [];

    for (const area of areas) {
      if (area.width > 100 && area.height < 50) {
        // Horizontal change - possibly panel border or text alignment
        changes.push({
          type: 'panel_border',
          location: `${area.x}, ${area.y}`,
          description: `Horizontal layout change detected (${area.width}x${area.height})`,
          impact: area.severity === 'critical' ? 'critical' : 'medium'
        });
      } else if (area.height > 100 && area.width < 50) {
        // Vertical change - possibly panel structure
        changes.push({
          type: 'alignment',
          location: `${area.x}, ${area.y}`,
          description: `Vertical alignment change detected (${area.width}x${area.height})`,
          impact: area.severity === 'critical' ? 'high' : 'medium'
        });
      } else if (testName.includes('skill-bar') || testName.includes('actions')) {
        // Quick skill bar specific changes
        changes.push({
          type: 'text_position',
          location: `${area.x}, ${area.y}`,
          description: `Quick skill bar layout change - CRITICAL for gameplay`,
          impact: 'critical'
        });
      }
    }

    return changes;
  }

  /**
   * Identify character-level changes (ASCII characters)
   */
  private async identifyCharacterChanges(baseline: PNG, actual: PNG): Promise<CharacterChange[]> {
    // This is a simplified implementation - in practice, you'd use OCR or
    // character recognition to identify specific ASCII character changes
    const changes: CharacterChange[] = [];
    
    // For now, we'll detect regions where changes might indicate character differences
    // A full implementation would extract text and compare character by character
    
    return changes;
  }

  /**
   * Identify color changes in the UI
   */
  private identifyColorChanges(baseline: PNG, actual: PNG, areas: DiffArea[]): ColorChange[] {
    const changes: ColorChange[] = [];

    for (const area of areas) {
      // Sample pixels in the changed area to identify color differences
      const sampleX = area.x + Math.floor(area.width / 2);
      const sampleY = area.y + Math.floor(area.height / 2);
      
      const baselineIdx = (baseline.width * sampleY + sampleX) << 2;
      const actualIdx = (actual.width * sampleY + sampleX) << 2;
      
      const baselineColor = this.rgbToHex(
        baseline.data[baselineIdx],
        baseline.data[baselineIdx + 1],
        baseline.data[baselineIdx + 2]
      );
      
      const actualColor = this.rgbToHex(
        actual.data[actualIdx],
        actual.data[actualIdx + 1],
        actual.data[actualIdx + 2]
      );
      
      if (baselineColor !== actualColor) {
        changes.push({
          expectedColor: baselineColor,
          actualColor: actualColor,
          area: area.description,
          severity: this.isSignificantColorChange(baselineColor, actualColor) ? 'major' : 'minor'
        });
      }
    }

    return changes;
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  private isSignificantColorChange(color1: string, color2: string): boolean {
    // Check if this represents a significant color scheme change
    const terminalGreen = ['#00ff00', '#00ff41'];
    const black = ['#000000'];
    
    const isColor1Important = terminalGreen.includes(color1.toLowerCase()) || black.includes(color1.toLowerCase());
    const isColor2Important = terminalGreen.includes(color2.toLowerCase()) || black.includes(color2.toLowerCase());
    
    return isColor1Important || isColor2Important;
  }

  /**
   * Generate recommendations based on detected changes
   */
  private generateRecommendations(
    areas: DiffArea[],
    layoutChanges: LayoutChange[],
    characterChanges: CharacterChange[],
    colorChanges: ColorChange[]
  ): string[] {
    const recommendations: string[] = [];

    const criticalChanges = layoutChanges.filter(c => c.impact === 'critical').length;
    const majorColorChanges = colorChanges.filter(c => c.severity === 'major').length;

    if (criticalChanges > 0) {
      recommendations.push(
        `🚨 CRITICAL: ${criticalChanges} critical layout change(s) detected. Quick skill bar or essential UI elements may have moved.`
      );
      recommendations.push(
        `ACTION REQUIRED: Review Visual Standards Document and update baseline if changes are intentional.`
      );
    }

    if (majorColorChanges > 0) {
      recommendations.push(
        `⚠️ MAJOR: Color scheme changes detected. Terminal green (#00ff00) color standard may be violated.`
      );
      recommendations.push(
        `ACTION: Verify color scheme matches Visual Standards Document specifications.`
      );
    }

    const largeDiffAreas = areas.filter(a => a.severity === 'critical').length;
    if (largeDiffAreas > 0) {
      recommendations.push(
        `📏 LAYOUT: ${largeDiffAreas} large area(s) changed. Panel dimensions or positioning may be affected.`
      );
      recommendations.push(
        `ACTION: Check that panels are exactly 40 characters wide and positioned correctly.`
      );
    }

    if (layoutChanges.some(c => c.type === 'panel_border')) {
      recommendations.push(
        `🔲 BORDERS: Box-drawing character changes detected. ASCII border integrity may be compromised.`
      );
      recommendations.push(
        `ACTION: Verify all ╔═╗║╚╝╠╣ characters are in correct positions.`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        `✅ MINOR: Only minor visual differences detected. Changes appear to be within acceptable thresholds.`
      );
    }

    return recommendations;
  }

  /**
   * Generate detailed HTML report
   */
  private async generateHTMLReport(
    testName: string,
    result: VisualDiffResult,
    baselinePath: string,
    actualPath: string
  ): Promise<void> {
    const reportPath = path.join(this.reportDir, `${testName}-report.html`);
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual Diff Report: ${testName}</title>
    <style>
        body { 
            font-family: 'Courier New', monospace; 
            background: #000; 
            color: #00ff00; 
            margin: 20px; 
        }
        .header { 
            border: 2px solid #00ff00; 
            padding: 20px; 
            margin-bottom: 20px; 
        }
        .summary { 
            background: #001100; 
            padding: 15px; 
            margin-bottom: 20px; 
            border-left: 5px solid #00ff00;
        }
        .critical { color: #ff0000; font-weight: bold; }
        .warning { color: #ffff00; }
        .success { color: #00ff00; }
        .images { 
            display: grid; 
            grid-template-columns: 1fr 1fr 1fr; 
            gap: 20px; 
            margin: 20px 0;
        }
        .image-container { 
            border: 1px solid #00ff00; 
            padding: 10px; 
            text-align: center;
        }
        img { 
            max-width: 100%; 
            height: auto; 
            border: 1px solid #333;
        }
        .analysis { 
            background: #001100; 
            padding: 15px; 
            margin: 20px 0;
        }
        .recommendations {
            background: #110011;
            border: 2px solid #ff00ff;
            padding: 15px;
            margin: 20px 0;
        }
        ul { list-style: none; padding-left: 0; }
        li { margin: 10px 0; padding: 5px 0; border-bottom: 1px solid #003300; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎮 ASCII Roguelike Visual Regression Report</h1>
        <h2>Test: ${testName}</h2>
        <p>Generated: ${new Date().toISOString()}</p>
    </div>

    <div class="summary">
        <h3>📊 Summary</h3>
        <p><strong>Pixel Differences:</strong> ${result.pixelDifferences.toLocaleString()} / ${result.totalPixels.toLocaleString()} (${result.percentageDiff.toFixed(2)}%)</p>
        <p><strong>Changed Areas:</strong> ${result.analysisReport.changedAreas.length}</p>
        <p><strong>Layout Changes:</strong> ${result.analysisReport.suspectedLayoutChanges.length}</p>
        <p><strong>Color Changes:</strong> ${result.analysisReport.colorChanges.length}</p>
    </div>

    <div class="images">
        <div class="image-container">
            <h4>📸 Baseline (Expected)</h4>
            <img src="${path.relative(this.reportDir, baselinePath)}" alt="Baseline">
        </div>
        <div class="image-container">
            <h4>📸 Actual (Current)</h4>
            <img src="${path.relative(this.reportDir, actualPath)}" alt="Actual">
        </div>
        <div class="image-container">
            <h4>🔍 Differences</h4>
            <img src="${path.relative(this.reportDir, result.diffImagePath)}" alt="Diff">
        </div>
    </div>

    <div class="recommendations">
        <h3>💡 Recommendations</h3>
        <ul>
            ${result.analysisReport.recommendations.map(rec => 
              `<li class="${rec.includes('CRITICAL') ? 'critical' : rec.includes('MAJOR') ? 'warning' : 'success'}">${rec}</li>`
            ).join('')}
        </ul>
    </div>

    <div class="analysis">
        <h3>🔬 Detailed Analysis</h3>
        
        <h4>Changed Areas (${result.analysisReport.changedAreas.length})</h4>
        <ul>
            ${result.analysisReport.changedAreas.map(area => 
              `<li><strong>${area.severity.toUpperCase()}:</strong> ${area.description} (${area.width}x${area.height} at ${area.x},${area.y})</li>`
            ).join('')}
        </ul>

        <h4>Suspected Layout Changes (${result.analysisReport.suspectedLayoutChanges.length})</h4>
        <ul>
            ${result.analysisReport.suspectedLayoutChanges.map(change => 
              `<li class="${change.impact === 'critical' ? 'critical' : 'warning'}"><strong>${change.type.toUpperCase()}:</strong> ${change.description} [${change.impact.toUpperCase()} impact]</li>`
            ).join('')}
        </ul>

        <h4>Color Changes (${result.analysisReport.colorChanges.length})</h4>
        <ul>
            ${result.analysisReport.colorChanges.map(change => 
              `<li><strong>${change.area}:</strong> ${change.expectedColor} → ${change.actualColor} (${change.severity})</li>`
            ).join('')}
        </ul>
    </div>

    <div class="header">
        <h3>📖 Visual Standards Reference</h3>
        <p><strong>Expected Color Scheme:</strong> Terminal Green (#00ff00) on Pure Black (#000000)</p>
        <p><strong>Critical Elements:</strong> Quick skill bar (1-9 hotkeys), Panel borders (╔═╗║╚╝)</p>
        <p><strong>Panel Width:</strong> Exactly 40 characters (23 chars including borders)</p>
        <p><strong>Box-Drawing Characters:</strong> ┌─┐│└┘├┤┬┴┼ and ╔═╗║╚╝╠╣╦╩</p>
    </div>
</body>
</html>`;

    fs.writeFileSync(reportPath, html);
    console.log(`📄 Generated detailed HTML report: ${reportPath}`);
  }
}