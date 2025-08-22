# Agent Visual Testing Protocols

**Document Version**: 1.0  
**Date**: 2025-08-22  
**Status**: Required Protocol for UI/UX and QA Agents  
**Maintained By**: Development Team

---

## 🎯 **MANDATORY VISUAL TESTING REQUIREMENTS**

### **UI/UX Designer Agent - MUST RUN VISUAL TESTS**

**WHEN TO TEST:**
- ✅ **Before any UI design changes** - Establish baseline
- ✅ **After implementing new components** - Validate appearance  
- ✅ **After modifying CSS/styling** - Check for regressions
- ✅ **After layout/responsive changes** - Verify all viewports
- ✅ **After color scheme updates** - Ensure consistency
- ✅ **Before recommending design approval** - Quality gate

**REQUIRED COMMANDS:**
```bash
# Always run BEFORE making changes
npm run test:visual

# Make your UI/UX changes...

# Always run AFTER making changes  
npm run test:visual

# Review the report BEFORE marking work complete
# Location: ./test-results/visual-reports/visual-regression-report.html
```

### **QA Testing Specialist Agent - MUST RUN VISUAL TESTS**

**WHEN TO TEST:**
- ✅ **After any code deployment** - Regression detection
- ✅ **Before Quality Gate validation** - Visual verification
- ✅ **When game functionality testing** - UI state validation
- ✅ **During cross-browser testing** - Rendering consistency
- ✅ **Before production releases** - Final visual approval
- ✅ **When investigating UI bugs** - Visual debugging

**REQUIRED COMMANDS:**
```bash
# Game functionality test with visual validation
npm run test:visual

# Full test suite (includes visual)
npm run test:comprehensive && npm run test:visual

# Performance + Visual validation
npm run test:load && npm run test:visual
```

---

## 🚨 **CRITICAL TESTING PROTOCOLS**

### **NEVER SKIP VISUAL TESTING WHEN:**

1. **CSS/Styling Changes Made**
2. **New Components Added**
3. **Layout/Responsive Updates**
4. **Color/Theme Modifications**
5. **Font/Typography Changes**
6. **Animation/Transition Updates**
7. **Browser Compatibility Testing**
8. **Performance Optimizations**
9. **Bug Fix Verification**
10. **Pre-Production Validation**

### **VISUAL TEST FAILURE PROTOCOL**

**If Visual Tests Fail (Grade D-F or >2% difference):**

1. **🛑 STOP WORK** - Do not proceed until resolved
2. **📊 Review Report** - Check detailed HTML report
3. **🔍 Analyze Differences** - Examine red-highlighted changes
4. **🤔 Determine if Intentional:**
   - **Intentional**: Update references with `npm run test:visual:update`
   - **Bug/Regression**: Fix the issue and re-test
5. **✅ Re-run Tests** - Ensure Grade A-B before continuing

---

## 🎮 **AP SYSTEM SPECIFIC TESTING**

### **Key Visual Elements to Monitor**

| Component | Location | Critical For |
|-----------|----------|--------------|
| **AP Display** | Top-right panel | Resource tracking accuracy |
| **Turn Timer** | Right panel middle | Turn-based gameplay |
| **Initiative Order** | Right panel | 8-player coordination |
| **Action Selector** | Right panel bottom | Combat mechanics |
| **ASCII Game Map** | Left panel | Core gameplay visual |
| **Message Log** | Bottom-right | Player feedback |
| **Connection Status** | Top-left overlay | Server connectivity |

### **Testing Different Game States**

```bash
# Test initial load state
npm run test:visual

# Test with player actions (manual interaction needed)
# 1. Move player with arrow keys
# 2. Use abilities from action panel  
# 3. Wait for AP accumulation
# 4. Then run:
npm run test:visual
```

---

## 📊 **GRADE REQUIREMENTS**

### **Production Release Standards**

- **🟢 Grade A (99%+ match)**: ✅ Ready for production
- **🟡 Grade B (97%+ match)**: ✅ Acceptable with review
- **🟠 Grade C (95%+ match)**: ⚠️ Requires investigation
- **🔴 Grade D (90%+ match)**: ❌ Must fix before release
- **⚫ Grade F (<90% match)**: ❌ Critical regression - immediate fix

### **Component-Specific Tolerances**

| Component | Max Diff Pixels | Tolerance Reason |
|-----------|----------------|------------------|
| **Full Interface** | 1000px | Overall layout stability |
| **AP Display** | 200px | Number/bar changes expected |
| **Turn Timer** | 300px | Animation progress acceptable |
| **Action Selector** | 100px | Button state consistency |
| **ASCII Map** | 500px | Player movement allowed |
| **Message Log** | 400px | Text content changes OK |

---

## 🛠 **VISUAL TESTING COMMANDS FOR AGENTS**

### **UI/UX Designer Agent Commands**

```bash
# Pre-design baseline
npm run test:visual

# Setup new reference images (when creating new features)
npm run test:visual:setup

# Update references after approved changes
npm run test:visual:update

# View detailed visual report
npm run test:visual:report

# Test specific browser compatibility
npm run test:visual:playwright -- --project=firefox-desktop
npm run test:visual:playwright -- --project=mobile-chrome
```

### **QA Testing Specialist Commands**

```bash
# Full regression test suite
npm run test:comprehensive
npm run test:visual

# Performance + Visual validation
npm run test:load
npm run test:metrics  
npm run test:visual

# Cross-browser visual testing
npm run test:visual:playwright -- --project=chromium-desktop
npm run test:visual:playwright -- --project=firefox-desktop
npm run test:visual:playwright -- --project=tablet

# Visual debugging mode
npm run test:visual:playwright -- --debug
```

---

## 📋 **INTEGRATION WITH AGENT WORKFLOWS**

### **UI/UX Designer Agent Workflow**

```typescript
// REQUIRED: Visual testing integration in UI/UX tasks

async function implementUIChange() {
  // 1. ALWAYS run baseline test first
  console.log('🔍 Running baseline visual test...');
  await runCommand('npm run test:visual');
  
  // 2. Make UI changes
  console.log('🎨 Implementing UI changes...');
  // ... make changes ...
  
  // 3. ALWAYS run post-change test
  console.log('📊 Running post-change visual test...');
  const visualResult = await runCommand('npm run test:visual');
  
  // 4. Check results and require Grade A-B
  if (visualResult.grade === 'D' || visualResult.grade === 'F') {
    throw new Error('❌ Visual regression detected! Grade ' + visualResult.grade + ' - must fix before proceeding');
  }
  
  console.log('✅ Visual tests passed with Grade ' + visualResult.grade);
}
```

### **QA Testing Specialist Workflow**

```typescript
// REQUIRED: Visual testing in QA validation

async function validateQualityGate() {
  console.log('🧪 Running comprehensive QA validation...');
  
  // 1. Functional tests
  await runCommand('npm test');
  
  // 2. Performance tests  
  await runCommand('npm run test:load');
  
  // 3. MANDATORY: Visual regression tests
  console.log('📸 Running visual regression tests...');
  const visualResult = await runCommand('npm run test:visual');
  
  // 4. Analyze visual results
  if (visualResult.failed > 0) {
    throw new Error('❌ Visual regressions detected! Check report: ./test-results/visual-reports/visual-regression-report.html');
  }
  
  console.log('✅ All QA validations passed including visual tests');
}
```

---

## 🔧 **TROUBLESHOOTING FOR AGENTS**

### **Common Visual Test Issues**

| Error | Cause | Solution |
|-------|-------|----------|
| "Reference not found" | No baseline image | Run `npm run test:visual:setup` |
| "Size mismatch" | Viewport inconsistency | Ensure 1920x1080 browser size |
| "Server not ready" | AP System not running | Start with `npm run dev` |
| "High pixel diff" | Legitimate visual change | Review and update references |
| "Font rendering diff" | System font differences | Use consistent test environment |

### **Emergency Visual Recovery**

```bash
# If visual tests are completely broken:

# 1. Reset to working baseline
git checkout HEAD -- tests/visual/references/

# 2. Capture current state as new baseline
npm run test:visual:setup

# 3. Re-run tests to establish new baseline
npm run test:visual
```

---

## 📈 **REPORTING REQUIREMENTS**

### **UI/UX Agent Reports Must Include:**

- ✅ **Before/After Visual Grades**
- ✅ **Screenshot Comparisons**  
- ✅ **Pixel Difference Analysis**
- ✅ **Cross-Browser Validation**
- ✅ **Component-Level Verification**

### **QA Agent Reports Must Include:**

- ✅ **Visual Regression Status**
- ✅ **Grade Distribution Summary**
- ✅ **Failed Test Details**
- ✅ **Performance + Visual Correlation**
- ✅ **Production Readiness Assessment**

---

## 🎯 **SUCCESS CRITERIA**

### **UI/UX Designer Success:**
- **Grade A-B** on all visual tests
- **Zero unintended regressions**
- **Consistent cross-browser rendering**
- **Responsive design validation**

### **QA Testing Specialist Success:**
- **100% visual test pass rate**
- **Comprehensive component coverage**
- **Performance + visual correlation**
- **Production readiness confirmation**

---

**⚠️ CRITICAL REMINDER: Visual testing is NOT optional for UI/UX and QA agents. Any work that affects the visual presentation of the AP System MUST include visual regression testing to maintain our pixel-perfect tactical roguelike aesthetic.**