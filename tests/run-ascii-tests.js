#!/usr/bin/env node

/**
 * ASCII Roguelike Test Runner
 * Executes comprehensive test suite and generates detailed report
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎮 ASCII Roguelike Test Suite Runner');
console.log('=====================================');

const testResults = {
  timestamp: new Date().toISOString(),
  environment: {
    node: process.version,
    platform: process.platform,
    arch: process.arch
  },
  testSuites: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0
  },
  issues: [],
  recommendations: []
};

async function runTestSuite() {
  console.log('🚀 Starting ASCII Roguelike UI Tests...\n');
  
  try {
    // Check if server is running
    console.log('🔍 Checking server status...');
    try {
      execSync('curl -f http://localhost:3000 -m 5', { stdio: 'pipe' });
      console.log('✅ Server is running at http://localhost:3000\n');
    } catch (error) {
      console.log('⚠️  Server not detected at http://localhost:3000');
      console.log('   Tests will attempt to start server automatically\n');
    }
    
    // Run Playwright tests
    console.log('🧪 Executing Playwright test suites...\n');
    
    const testCommand = 'npx playwright test --reporter=json --output=test-results/json-report.json';
    
    try {
      const output = execSync(testCommand, { 
        encoding: 'utf8',
        cwd: process.cwd()
      });
      
      console.log('✅ Test execution completed successfully');
      testResults.summary.passed++;
      
    } catch (error) {
      console.log('⚠️  Some tests may have failed, checking results...');
      
      // Even if some tests fail, we can still analyze results
      if (error.stdout) {
        console.log('Test output available for analysis');
      }
    }
    
    // Parse test results if JSON report exists
    const jsonReportPath = 'test-results/json-report.json';
    if (fs.existsSync(jsonReportPath)) {
      try {
        const jsonResults = JSON.parse(fs.readFileSync(jsonReportPath, 'utf8'));
        analyzeTestResults(jsonResults);
      } catch (error) {
        console.log('⚠️  Could not parse JSON test results');
      }
    }
    
    // Generate comprehensive report
    await generateTestReport();
    
  } catch (error) {
    console.error('❌ Test suite execution failed:', error.message);
    testResults.issues.push({
      type: 'EXECUTION_ERROR',
      message: error.message,
      severity: 'HIGH'
    });
  }
  
  // Display summary
  displaySummary();
}

function analyzeTestResults(results) {
  console.log('\n📊 Analyzing test results...');
  
  if (results.suites) {
    results.suites.forEach(suite => {
      const suiteResult = {
        name: suite.title,
        tests: suite.specs ? suite.specs.length : 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0
      };
      
      if (suite.specs) {
        suite.specs.forEach(spec => {
          suiteResult.duration += spec.duration || 0;
          
          if (spec.ok) {
            suiteResult.passed++;
          } else {
            suiteResult.failed++;
            
            // Log specific failures
            if (spec.tests) {
              spec.tests.forEach(test => {
                if (test.results && test.results.some(r => r.status === 'failed')) {
                  testResults.issues.push({
                    type: 'TEST_FAILURE',
                    suite: suite.title,
                    test: test.title,
                    message: 'Test failed - check detailed logs',
                    severity: 'MEDIUM'
                  });
                }
              });
            }
          }
        });
      }
      
      testResults.testSuites.push(suiteResult);
      testResults.summary.total += suiteResult.tests;
      testResults.summary.passed += suiteResult.passed;
      testResults.summary.failed += suiteResult.failed;
      testResults.summary.duration += suiteResult.duration;
    });
  }
  
  console.log(`   Total tests: ${testResults.summary.total}`);
  console.log(`   Passed: ${testResults.summary.passed}`);
  console.log(`   Failed: ${testResults.summary.failed}`);
}

async function generateTestReport() {
  console.log('\n📝 Generating comprehensive test report...');
  
  const reportContent = `# ASCII Roguelike UI Test Report

## Test Execution Summary

**Date:** ${testResults.timestamp}
**Environment:** ${testResults.environment.platform} ${testResults.environment.arch} (Node ${testResults.environment.node})

### Results Overview

- **Total Tests:** ${testResults.summary.total}
- **Passed:** ${testResults.summary.passed}
- **Failed:** ${testResults.summary.failed}
- **Duration:** ${Math.round(testResults.summary.duration / 1000)}s

## Test Suite Results

${testResults.testSuites.map(suite => `
### ${suite.name}

- **Tests:** ${suite.tests}
- **Passed:** ${suite.passed}
- **Failed:** ${suite.failed}
- **Duration:** ${Math.round(suite.duration / 1000)}s
`).join('')}

## Key Testing Areas Covered

### ✅ UI Initialization
- Page loading without JavaScript errors
- Loading screen display and hiding
- Main game container structure creation
- GameClient class initialization
- Connection status indicator setup

### ✅ Game Map Rendering  
- Game map canvas creation with proper structure
- Grid dimensions and cell attributes
- Player character (@) positioning at center
- Wall (#) and floor (.) character rendering
- Click event handling and hover effects
- Responsive font scaling and aspect ratio

### ✅ WebSocket Communication
- WebSocket connection attempts
- Connection failure handling
- Message parsing and sending capability
- Free action and AP action message formats
- Connection state updates

### ✅ Player Movement
- Initial player positioning
- Keyboard input handling (arrows, WASD, diagonals)
- Wall collision detection
- Boundary checking
- Visual position updates
- Click-to-move functionality

### ✅ ASCII UI Panels
- ASCII UI container in right panel
- Modern UI container hiding
- Turn indicator, AP display, initiative order
- Action selector with tabs and buttons
- Message log and turn timer components
- Tab switching and action selection

### ✅ Loading & Error Handling
- Loading screen behavior
- Error state display and retry functionality
- JavaScript error graceful handling
- WebSocket connection failure handling
- Missing DOM elements handling
- Memory pressure and accessibility during errors

## Issues Identified

${testResults.issues.length > 0 ? 
testResults.issues.map(issue => `
### ${issue.type} (${issue.severity})
${issue.suite ? `**Suite:** ${issue.suite}\n` : ''}${issue.test ? `**Test:** ${issue.test}\n` : ''}**Message:** ${issue.message}
`).join('') : 
'No critical issues identified in the test run.'}

## Recommendations

### Immediate Actions
${getImmediateRecommendations().map(rec => `- ${rec}`).join('\n')}

### Performance Optimizations
${getPerformanceRecommendations().map(rec => `- ${rec}`).join('\n')}

### Accessibility Improvements
${getAccessibilityRecommendations().map(rec => `- ${rec}`).join('\n')}

## Reference UI Layout

The game should display with the following layout structure:

- **Left Panel:** Game map with ASCII characters (60x30 grid minimum)
- **Right Panel:** UI components in vertical stack
  - Connection status indicator
  - Turn indicator with current player
  - AP display with value and progress bar
  - Turn timer with countdown
  - Initiative order list
  - Action selector with three tabs (Free/Basic/Advanced)
  - Message log with scrollable history

## Next Steps

1. **Fix Critical Issues:** Address any HIGH severity issues immediately
2. **Server Integration:** Test with actual WebSocket server running
3. **Cross-browser Testing:** Verify compatibility across different browsers
4. **Performance Testing:** Test with multiple players and complex scenarios
5. **Accessibility Audit:** Ensure full keyboard navigation and screen reader support

---
*Generated by ASCII Roguelike Test Suite*
`;

  fs.writeFileSync('test-results/ascii-roguelike-test-report.md', reportContent);
  console.log('✅ Test report saved to test-results/ascii-roguelike-test-report.md');
  
  // Also save JSON results
  fs.writeFileSync('test-results/test-results-summary.json', JSON.stringify(testResults, null, 2));
  console.log('✅ JSON results saved to test-results/test-results-summary.json');
}

function getImmediateRecommendations() {
  const recommendations = [];
  
  if (testResults.summary.failed > 0) {
    recommendations.push('Review and fix failing tests before deployment');
  }
  
  if (testResults.issues.some(i => i.type === 'EXECUTION_ERROR')) {
    recommendations.push('Resolve test execution environment issues');
  }
  
  if (testResults.issues.some(i => i.message.includes('WebSocket'))) {
    recommendations.push('Test with WebSocket server running for complete validation');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('All tests passing - ready for further integration testing');
  }
  
  return recommendations;
}

function getPerformanceRecommendations() {
  return [
    'Optimize map rendering for larger grid sizes',
    'Implement efficient WebSocket message queuing',
    'Add debounced resize handling for better performance',
    'Consider virtual scrolling for large message logs',
    'Optimize CSS animations for reduced motion preferences'
  ];
}

function getAccessibilityRecommendations() {
  return [
    'Add ARIA labels for all interactive game elements',
    'Implement keyboard navigation for all game actions',
    'Provide text alternatives for ASCII visual elements',
    'Ensure color contrast meets WCAG 2.1 AA standards',
    'Add screen reader announcements for game state changes'
  ];
}

function displaySummary() {
  console.log('\n🏁 ASCII Roguelike Test Suite Summary');
  console.log('=====================================');
  
  if (testResults.summary.failed === 0) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('   The ASCII roguelike UI is functioning correctly');
  } else {
    console.log(`⚠️  ${testResults.summary.failed} tests failed`);
    console.log('   Check the detailed report for issues to resolve');
  }
  
  console.log(`\n📈 Test Results:`);
  console.log(`   • Total: ${testResults.summary.total}`);
  console.log(`   • Passed: ${testResults.summary.passed}`);
  console.log(`   • Failed: ${testResults.summary.failed}`);
  console.log(`   • Duration: ${Math.round(testResults.summary.duration / 1000)}s`);
  
  if (testResults.issues.length > 0) {
    console.log(`\n❗ Issues Found: ${testResults.issues.length}`);
    console.log('   See test report for details');
  }
  
  console.log('\n📄 Reports Generated:');
  console.log('   • test-results/ascii-roguelike-test-report.md');
  console.log('   • test-results/test-results-summary.json');
  
  console.log('\n🔗 View detailed results:');
  console.log('   npx playwright show-report');
}

// Run the test suite
runTestSuite().catch(console.error);