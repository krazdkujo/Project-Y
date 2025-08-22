# Visual Testing Guide: AP System UI Validation

**Document Version**: 1.0  
**Date**: 2025-08-22  
**Status**: Implementation Ready  
**Maintained By**: QA-Testing-Specialist

---

## 🎯 **Visual Testing Overview**

This guide explains how to use our comprehensive visual regression testing system to ensure the AP System UI remains pixel-perfect across changes. We combine **Playwright** for automated screenshots with **custom pixel comparison** for detailed analysis.

### **System Components**

1. **Playwright Tests** - Automated browser testing and screenshot capture
2. **Custom Visual Comparison** - Pixel-level difference detection using `pixelmatch`
3. **Reference Management** - Baseline image storage and versioning
4. **HTML Reports** - Detailed visual comparison reports with grades

---

## 🚀 **Quick Start**

### **1. Initial Setup**

```bash
# Install dependencies (already done)
npm install @playwright/test pixelmatch pngjs

# Install browser
npx playwright install chromium

# Setup reference images from your current UI
npm run test:visual:setup
```

### **2. Run Visual Tests**

```bash
# Full visual regression suite
npm run test:visual

# Just Playwright tests
npm run test:visual:playwright

# View test reports
npm run test:visual:report
```

### **3. Review Results**

- **HTML Report**: `./test-results/visual-reports/visual-regression-report.html`
- **Screenshots**: `./tests/visual/current/`
- **Differences**: `./tests/visual/diffs/`

---

## 📊 **Understanding Your first-ui-version.png**

Your screenshot shows the **perfect baseline** for the AP System:

### **Layout Analysis**
- **Left Panel**: 1295x740px game map with ASCII rendering
- **Right Panel**: 345x740px UI components (AP, timer, actions)
- **Total Viewport**: 1640x740px for consistent testing

### **Key UI Elements Captured**
- ✅ **AP Display**: "0 / 8" with progress bar and generation info
- ✅ **Turn Timer**: 10s countdown with visual progress bar  
- ✅ **Initiative Order**: Player list with current turn indicator
- ✅ **Action Selector**: Tabbed interface (Free/Basic/Advanced)
- ✅ **Game Map**: ASCII characters with player '@' and walls '#'
- ✅ **Message Log**: Game event display area
- ✅ **Connection Status**: Green "Connected" indicator

### **Color Scheme Standards**
- **Background**: `#000000` (pure black)
- **Text**: `#00ff00` (green terminal)
- **UI Panels**: `#1a1a1a` (dark gray)
- **Borders**: `#333333` (medium gray)
- **Player**: `#00ff00` (bright green '@')
- **Walls**: `#666666` (gray '#')

---

## 🔍 **Visual Testing Workflow**

### **Making UI Changes with Confidence**

1. **Before Changes**: Run baseline test
```bash
npm run test:visual
```

2. **Make Your Changes**: Modify CSS, layout, or components

3. **Test Changes**: Run visual comparison
```bash
npm run test:visual
```

4. **Review Results**: Check the HTML report
   - **🟢 Grade A-B**: Ready for production
   - **🟡 Grade C**: Minor differences, review manually  
   - **🔴 Grade D-F**: Major changes, investigate

5. **Update References** (if changes are intentional):
```bash
npm run test:visual:update
```

### **Test Regions**

Our system tests specific UI regions:

```typescript
regions: {
  fullInterface: null,  // Complete 1640x740 interface
  gameMap: { x: 0, y: 0, width: 1295, height: 740 },
  rightPanel: { x: 1295, y: 0, width: 345, height: 740 },
  apDisplay: { x: 1295, y: 60, width: 345, height: 120 },
  turnTimer: { x: 1295, y: 180, width: 345, height: 80 },
  initiativeOrder: { x: 1295, y: 260, width: 345, height: 180 },
  actionSelector: { x: 1295, y: 440, width: 345, height: 200 },
  messageLog: { x: 1295, y: 640, width: 345, height: 100 }
}
```

---

## 📋 **Test Scenarios**

### **Automated Test Coverage**

| Test Name | Description | Region | Tolerance |
|-----------|-------------|---------|-----------|
| `initial-load-full` | Complete interface on load | Full | 1000px |
| `ap-display-panel` | AP resource tracking | AP Panel | 200px |
| `action-selector-free` | Free actions tab | Actions | 100px |
| `action-selector-basic` | Basic AP abilities tab | Actions | 100px |
| `turn-timer-start` | Timer at turn beginning | Timer | 200px |
| `game-map-initial` | ASCII map rendering | Map | 500px |
| `message-log-initial` | Message display area | Log | 200px |

### **Interactive Tests**

| Test Name | Action | Expected Change |
|-----------|---------|-----------------|
| `ap-display-after-turn` | Press 'R' (rest) | AP increases by 2-3 |
| `game-map-after-move` | Arrow key | Player '@' moves |
| `action-selected-move` | Click Move button | Button highlighted |
| `message-log-with-action` | Movement action | New message appears |

---

## 🎯 **Grading System**

### **Match Percentage Grades**

- **A (99%+ match)**: Perfect - ready for production
- **B (97%+ match)**: Excellent - minor anti-aliasing differences
- **C (95%+ match)**: Good - review manually for intentional changes
- **D (90%+ match)**: Concerning - significant differences detected
- **F (<90% match)**: Failed - major visual regression

### **Pixel Thresholds**

- **Default**: 1000 different pixels maximum
- **Component Tests**: 100-500 pixels for specific areas
- **Animation Tests**: Higher tolerance for dynamic content

---

## 🛠 **Configuration**

### **Visual Comparison Settings**

```javascript
comparison: {
  threshold: 0.1,           // 0.1 pixel difference tolerance
  includeAA: true,          // Include anti-aliasing
  alpha: 0.1,              // Transparency handling
  diffColor: [255, 0, 0],   // Red highlights differences
  diffColorAlt: [0, 255, 0] // Green for anti-aliasing
}
```

### **Viewport Configuration**

```typescript
viewport: { width: 1920, height: 1080 }  // Consistent desktop size
deviceScaleFactor: 1                     // No scaling
hasTouch: false                          // Desktop environment
```

---

## 📁 **Directory Structure**

```
tests/visual/
├── ap-system-visual.spec.ts     # Playwright test definitions
├── visual-regression-runner.js  # Custom comparison runner
├── references/                  # Baseline reference images
├── current/                     # Latest screenshots
├── diffs/                       # Difference visualizations
└── screenshots/                 # Playwright captures

test-results/
├── visual-reports/              # HTML reports
├── visual-screenshots/          # Playwright test images
└── html-report/                # Playwright reports
```

---

## 🚀 **Advanced Usage**

### **Custom Comparisons**

Use the standalone visual comparison tool:

```bash
# Compare two specific images
node docs/technical/simple-visual-test.js compare current.png reference.png

# Batch process a folder
node docs/technical/simple-visual-test.js batch ./screenshots

# Run configured comparisons
node docs/technical/simple-visual-test.js
```

### **Creating New References**

When you make intentional UI changes:

1. **Review the diff**: Ensure changes are correct
2. **Update reference**: Copy current to reference folder
3. **Document changes**: Update this guide if needed

```bash
# Manual reference update
cp tests/visual/current/new-feature.png tests/visual/references/new-feature.png
```

### **CI Integration**

Add to your CI pipeline:

```yaml
- name: Visual Regression Tests
  run: |
    npm run dev &
    sleep 10
    npm run test:visual
    kill %1
```

---

## 🎨 **Using first-ui-version.png as Standard**

Your `first-ui-version.png` serves as the **golden reference** for:

### **Layout Standards**
- **Panel Ratios**: 78% map, 22% UI panels
- **Component Spacing**: Consistent margins and padding
- **Typography**: Monospace font rendering
- **Color Consistency**: Terminal green theme

### **Functional Standards** 
- **AP Display**: Shows 0-8 range with visual bar
- **Turn Timer**: Progress bar with numerical countdown
- **Action Tabs**: Three-tab system (Free/Basic/Advanced)
- **Initiative**: Player list with turn indicators

### **Quality Standards**
- **ASCII Clarity**: Sharp character rendering
- **UI Responsiveness**: Consistent component sizing
- **Visual Hierarchy**: Clear information structure
- **Terminal Aesthetic**: Authentic retro computing feel

---

## 🔧 **Troubleshooting**

### **Common Issues**

| Problem | Solution |
|---------|----------|
| "Size mismatch" errors | Ensure consistent viewport sizes |
| High pixel differences | Check for font rendering differences |
| Tests timing out | Increase wait times for slow components |
| Missing references | Run setup to create initial baselines |

### **Performance Tips**

- Run visual tests on dedicated branches
- Use specific regions for faster comparisons  
- Disable animations during testing
- Use consistent browser environments

---

## 📊 **Reporting**

### **HTML Report Features**

- **Visual Summary**: Pass/fail statistics with grades
- **Side-by-Side Comparison**: Reference vs Current vs Diff
- **Interactive Images**: Click to zoom and inspect
- **Filtering**: Sort by status, grade, or component
- **Export Options**: JSON data for integration

### **Integration with Development Workflow**

1. **Pre-commit**: Run visual tests before code commits
2. **Pull Requests**: Include visual report in PR description
3. **Code Reviews**: Review visual changes alongside code
4. **Release Gates**: Require Grade A-B for production releases

---

**This visual testing system ensures your AP System UI maintains pixel-perfect quality while allowing confident iteration and improvement. The combination of automated testing and detailed reporting provides comprehensive coverage for all visual aspects of your tactical ASCII roguelike.**

---

## 🤖 **AGENT REQUIREMENTS**

**CRITICAL**: UI/UX and QA agents MUST follow visual testing protocols:

- **📋 See**: `AGENT-VISUAL-TESTING-PROTOCOLS.md` for mandatory requirements
- **⚠️ Required**: Visual tests for ALL UI changes  
- **🚨 Quality Gate**: Grade A-B required for production
- **📊 Reports**: Must include visual validation results

**Commands for Agents:**
```bash
npm run test:visual          # MANDATORY for UI/UX changes
npm run test:visual:setup    # Setup new references
npm run test:visual:update   # Update approved changes
```