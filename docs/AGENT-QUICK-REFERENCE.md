# Agent Quick Reference Guide

**Document Version**: 1.0  
**Date**: 2025-08-22  
**Status**: Essential Reference for All Agents  
**Maintained By**: Development Team

---

## 🤖 **AGENT ACCESS TO VISUAL TESTING**

### **UI/UX Designer Agent**

**⚠️ MANDATORY**: Must run visual tests for ALL UI changes

```bash
# BEFORE making any UI changes
npm run test:visual

# AFTER making UI changes  
npm run test:visual

# View results
# Location: ./test-results/visual-reports/visual-regression-report.html
```

**Required Grade**: A-B for production approval  
**Protocol**: `docs/technical/AGENT-VISUAL-TESTING-PROTOCOLS.md`

### **QA Testing Specialist Agent**

**⚠️ MANDATORY**: Must include visual testing in all quality validations

```bash
# Game functionality + visual validation
npm run test:visual

# Full test suite including visual
npm run test:comprehensive && npm run test:visual

# Performance + visual validation  
npm run test:load && npm run test:visual
```

**Required Grade**: A-B for quality gate approval  
**Protocol**: `docs/technical/AGENT-VISUAL-TESTING-PROTOCOLS.md`

---

## 🎯 **WHEN TO RUN VISUAL TESTS**

### **ALWAYS Required For:**
- ✅ CSS/styling changes
- ✅ New component implementation
- ✅ Layout/responsive modifications
- ✅ Color/theme updates
- ✅ Typography changes
- ✅ Quality gate validation
- ✅ Pre-production testing
- ✅ Bug fix verification

### **Testing Game Functionality**
```bash
# Start the server (if not running)
npm run dev

# Open browser to http://localhost:8080
# Test game functionality manually (movement, actions, AP)

# Run visual validation
npm run test:visual
```

---

## 📊 **UNDERSTANDING RESULTS**

### **Grade System**
- **🟢 A (99%+ match)**: Perfect - ready for production
- **🟡 B (97%+ match)**: Excellent - acceptable for production
- **🟠 C (95%+ match)**: Good - review changes manually
- **🔴 D (90%+ match)**: Poor - must investigate/fix
- **⚫ F (<90% match)**: Failed - critical regression, immediate fix

### **Failure Protocol**
1. **🛑 STOP WORK** - Do not proceed until resolved
2. **📊 Review Report** - Check HTML report for details  
3. **🔍 Analyze Differences** - Look at red-highlighted changes
4. **🤔 Determine Intent**:
   - **Intentional**: Update references with `npm run test:visual:update`
   - **Bug**: Fix the issue and re-test
5. **✅ Re-run Tests** - Ensure Grade A-B before continuing

---

## 🛠 **QUICK COMMANDS**

### **Essential Commands**
```bash
# Setup (run once)
npm run test:visual:setup

# Test current state
npm run test:visual

# View report
open test-results/visual-reports/visual-regression-report.html

# Update references (after approved changes)
npm run test:visual:update
```

### **Advanced Commands**  
```bash
# Just Playwright tests
npm run test:visual:playwright

# Cross-browser testing
npm run test:visual:playwright -- --project=firefox-desktop

# Debug mode
npm run test:visual:playwright -- --debug
```

---

## 🎮 **AP SYSTEM SPECIFIC**

### **Key Components Monitored**
- **AP Display**: Resource tracking (0-8 AP)
- **Turn Timer**: Countdown and progress
- **Initiative Order**: Player turn sequence  
- **Action Selector**: Free/Basic/Advanced tabs
- **ASCII Game Map**: Character rendering
- **Message Log**: Game event display
- **Connection Status**: Server connectivity

### **Expected UI States**
- **Initial Load**: 0 AP, 10s timer, "Your Turn" status
- **After Movement**: Player '@' position changes
- **After Turn**: AP increases by 2-3
- **Action Selection**: Button highlighting
- **Tab Switching**: Panel content changes

---

## 📋 **INTEGRATION REQUIREMENTS**

### **UI/UX Agent Workflow**
```typescript
// REQUIRED in all UI tasks
async function uiTask() {
  console.log('🔍 Running baseline visual test...');
  await runVisualTest(); // MANDATORY
  
  // Make UI changes...
  
  console.log('📊 Running post-change visual test...');
  const result = await runVisualTest(); // MANDATORY
  
  if (result.grade === 'D' || result.grade === 'F') {
    throw new Error('❌ Visual regression detected!');
  }
}
```

### **QA Agent Workflow**
```typescript
// REQUIRED in all QA validations
async function qualityGate() {
  await runFunctionalTests();
  await runPerformanceTests();
  
  console.log('📸 Running visual regression tests...');
  const visualResult = await runVisualTest(); // MANDATORY
  
  if (visualResult.failed > 0) {
    throw new Error('❌ Visual regressions detected!');
  }
}
```

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues**

| Error | Quick Fix |
|-------|-----------|
| "Reference not found" | `npm run test:visual:setup` |
| "Server not ready" | Start with `npm run dev` |
| "High pixel difference" | Review changes, update refs if intentional |
| "Size mismatch" | Ensure consistent 1920x1080 viewport |

### **Emergency Recovery**
```bash
# Reset visual baseline
npm run test:visual:setup

# Re-run tests
npm run test:visual
```

---

## 📖 **COMPLETE DOCUMENTATION**

### **Full Guides**
- **📋 Visual Testing Guide**: `docs/technical/VISUAL-TESTING-GUIDE.md`
- **🤖 Agent Protocols**: `docs/technical/AGENT-VISUAL-TESTING-PROTOCOLS.md`  
- **🧪 Testing Overview**: `TESTING.md`

### **Reference Images**
- **Baseline Standard**: `docs/game-design/first-ui-version.png`
- **Current References**: `tests/visual/references/`
- **Test Results**: `test-results/visual-reports/`

---

**⚠️ CRITICAL REMINDER**: Visual testing is MANDATORY for UI/UX and QA agents. Any work affecting the AP System's visual presentation MUST include visual regression testing to maintain pixel-perfect quality.**