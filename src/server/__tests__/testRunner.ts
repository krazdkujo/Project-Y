/**
 * Comprehensive test runner for the Refined AP System
 * Executes all test suites and provides detailed reporting
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

interface TestSuite {
  name: string;
  pattern: string;
  timeout: number;
  description: string;
}

interface TestResult {
  suite: string;
  passed: boolean;
  tests: number;
  failures: number;
  duration: number;
  coverage?: CoverageReport;
  errors?: string[];
}

interface CoverageReport {
  lines: number;
  functions: number;
  branches: number;
  statements: number;
}

const TEST_SUITES: TestSuite[] = [
  {
    name: 'Unit Tests - APManager',
    pattern: 'src/server/__tests__/APSystem.test.ts',
    timeout: 30000,
    description: 'Tests AP tracking, validation, and multi-player scenarios'
  },
  {
    name: 'Unit Tests - TurnManager',
    pattern: 'src/server/__tests__/TurnManager.test.ts',
    timeout: 45000,
    description: 'Tests initiative, turn timing, timeout handling, and player management'
  },
  {
    name: 'Unit Tests - FreeActions',
    pattern: 'src/server/__tests__/FreeActions.test.ts',
    timeout: 30000,
    description: 'Tests movement, attacks, defense, and validation'
  },
  {
    name: 'Integration Tests - Game Session',
    pattern: 'src/server/__tests__/integration/GameSession.test.ts',
    timeout: 60000,
    description: 'Tests full game session flow with 8 players'
  },
  {
    name: 'Integration Tests - WebSocket Communication',
    pattern: 'src/server/__tests__/integration/WebSocketCommunication.test.ts',
    timeout: 45000,
    description: 'Tests real-time messaging and network resilience'
  },
  {
    name: 'Performance Tests - Load Testing',
    pattern: 'src/server/__tests__/performance/LoadTesting.test.ts',
    timeout: 120000,
    description: 'Tests turn processing under load (50+ concurrent lobbies)'
  },
  {
    name: 'Performance Tests - Metrics and Latency',
    pattern: 'src/server/__tests__/performance/MetricsAndLatency.test.ts',
    timeout: 90000,
    description: 'Tests action latency and memory usage monitoring'
  }
];

class TestRunner {
  private results: TestResult[] = [];
  private startTime: number = 0;

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Comprehensive AP System Test Suite\n');
    console.log('='.repeat(80));
    
    this.startTime = Date.now();

    // Run each test suite
    for (const suite of TEST_SUITES) {
      await this.runTestSuite(suite);
    }

    // Generate final report
    this.generateFinalReport();
  }

  async runTestSuite(suite: TestSuite): Promise<void> {
    console.log(`\n📋 Running: ${suite.name}`);
    console.log(`📝 ${suite.description}`);
    console.log('-'.repeat(60));

    const startTime = Date.now();
    
    try {
      const command = `npx jest "${suite.pattern}" --testTimeout=${suite.timeout} --verbose --coverage --coverageReporters=json-summary`;
      
      const output = execSync(command, { 
        encoding: 'utf-8',
        stdio: 'pipe',
        timeout: suite.timeout + 10000 // Add buffer to Jest timeout
      });

      const duration = Date.now() - startTime;
      const result = this.parseTestOutput(output, suite.name, duration);
      
      this.results.push(result);
      this.printSuiteResult(result);

    } catch (error: any) {
      const duration = Date.now() - startTime;
      const result: TestResult = {
        suite: suite.name,
        passed: false,
        tests: 0,
        failures: 1,
        duration,
        errors: [error.message || 'Unknown error']
      };
      
      this.results.push(result);
      this.printSuiteResult(result);
    }
  }

  private parseTestOutput(output: string, suiteName: string, duration: number): TestResult {
    const lines = output.split('\n');
    let tests = 0;
    let failures = 0;
    let passed = true;
    let coverage: CoverageReport | undefined;

    // Parse test results
    for (const line of lines) {
      if (line.includes('Tests:')) {
        const match = line.match(/(\d+)\s+passed/);
        if (match) {
          tests += parseInt(match[1]!, 10);
        }
        
        const failMatch = line.match(/(\d+)\s+failed/);
        if (failMatch) {
          failures += parseInt(failMatch[1]!, 10);
          passed = false;
        }
      }
    }

    // Try to read coverage report
    try {
      const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
      const coverageData = JSON.parse(readFileSync(coveragePath, 'utf-8'));
      
      if (coverageData.total) {
        coverage = {
          lines: coverageData.total.lines.pct,
          functions: coverageData.total.functions.pct,
          branches: coverageData.total.branches.pct,
          statements: coverageData.total.statements.pct
        };
      }
    } catch (error) {
      // Coverage data not available
    }

    return {
      suite: suiteName,
      passed,
      tests,
      failures,
      duration,
      coverage
    };
  }

  private printSuiteResult(result: TestResult): void {
    const status = result.passed ? '✅ PASSED' : '❌ FAILED';
    const durationSec = (result.duration / 1000).toFixed(2);
    
    console.log(`\n${status} - ${result.tests} tests, ${result.failures} failures`);
    console.log(`⏱️  Duration: ${durationSec}s`);
    
    if (result.coverage) {
      console.log(`📊 Coverage: Lines ${result.coverage.lines}%, Functions ${result.coverage.functions}%, Branches ${result.coverage.branches}%`);
    }
    
    if (result.errors && result.errors.length > 0) {
      console.log('❗ Errors:');
      result.errors.forEach(error => {
        console.log(`   ${error}`);
      });
    }
  }

  private generateFinalReport(): void {
    const totalDuration = Date.now() - this.startTime;
    const totalTests = this.results.reduce((sum, r) => sum + r.tests, 0);
    const totalFailures = this.results.reduce((sum, r) => sum + r.failures, 0);
    const passedSuites = this.results.filter(r => r.passed).length;
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL TEST REPORT');
    console.log('='.repeat(80));
    
    console.log(`\n🏁 Test Execution Summary:`);
    console.log(`   Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`   Test Suites: ${passedSuites}/${this.results.length} passed`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Failures: ${totalFailures}`);
    
    // Suite breakdown
    console.log(`\n📋 Suite Results:`);
    this.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      const durationSec = (result.duration / 1000).toFixed(1);
      console.log(`   ${status} ${result.suite} (${result.tests} tests, ${durationSec}s)`);
    });

    // Coverage summary
    const coverageResults = this.results.filter(r => r.coverage);
    if (coverageResults.length > 0) {
      const avgCoverage = {
        lines: coverageResults.reduce((sum, r) => sum + r.coverage!.lines, 0) / coverageResults.length,
        functions: coverageResults.reduce((sum, r) => sum + r.coverage!.functions, 0) / coverageResults.length,
        branches: coverageResults.reduce((sum, r) => sum + r.coverage!.branches, 0) / coverageResults.length,
        statements: coverageResults.reduce((sum, r) => sum + r.coverage!.statements, 0) / coverageResults.length
      };

      console.log(`\n📈 Overall Coverage:`);
      console.log(`   Lines: ${avgCoverage.lines.toFixed(1)}%`);
      console.log(`   Functions: ${avgCoverage.functions.toFixed(1)}%`);
      console.log(`   Branches: ${avgCoverage.branches.toFixed(1)}%`);
      console.log(`   Statements: ${avgCoverage.statements.toFixed(1)}%`);
    }

    // Performance insights
    console.log(`\n⚡ Performance Insights:`);
    const slowestSuite = this.results.reduce((max, r) => r.duration > max.duration ? r : max);
    const fastestSuite = this.results.reduce((min, r) => r.duration < min.duration ? r : min);
    
    console.log(`   Slowest Suite: ${slowestSuite.suite} (${(slowestSuite.duration / 1000).toFixed(2)}s)`);
    console.log(`   Fastest Suite: ${fastestSuite.suite} (${(fastestSuite.duration / 1000).toFixed(2)}s)`);

    // Quality gates
    console.log(`\n🎯 Quality Gates:`);
    const qualityChecks = [
      { 
        name: 'All Tests Pass', 
        passed: totalFailures === 0,
        requirement: 'Zero test failures'
      },
      { 
        name: 'Coverage > 90%', 
        passed: coverageResults.length > 0 && coverageResults.every(r => r.coverage!.lines >= 90),
        requirement: 'Line coverage above 90%'
      },
      { 
        name: 'Performance Tests Pass', 
        passed: this.results.filter(r => r.suite.includes('Performance')).every(r => r.passed),
        requirement: 'All performance tests pass'
      },
      { 
        name: 'Integration Tests Pass', 
        passed: this.results.filter(r => r.suite.includes('Integration')).every(r => r.passed),
        requirement: 'All integration tests pass'
      }
    ];

    qualityChecks.forEach(check => {
      const status = check.passed ? '✅' : '❌';
      console.log(`   ${status} ${check.name} - ${check.requirement}`);
    });

    const allQualityGatesPassed = qualityChecks.every(check => check.passed);
    
    console.log(`\n🚦 OVERALL STATUS: ${allQualityGatesPassed ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (!allQualityGatesPassed) {
      console.log(`\n⚠️  Some quality gates failed. Please review and fix issues before deployment.`);
    } else {
      console.log(`\n🎉 All quality gates passed! The AP System is ready for deployment.`);
    }

    // Save detailed report to file
    this.saveDetailedReport();
  }

  private saveDetailedReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      totalDuration: Date.now() - this.startTime,
      summary: {
        totalSuites: this.results.length,
        passedSuites: this.results.filter(r => r.passed).length,
        totalTests: this.results.reduce((sum, r) => sum + r.tests, 0),
        totalFailures: this.results.reduce((sum, r) => sum + r.failures, 0)
      },
      suites: this.results,
      qualityGates: {
        allTestsPass: this.results.every(r => r.passed),
        coverageTarget: this.results.filter(r => r.coverage).every(r => r.coverage!.lines >= 90),
        performanceTests: this.results.filter(r => r.suite.includes('Performance')).every(r => r.passed)
      }
    };

    const reportPath = path.join(process.cwd(), 'test-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.runAllTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

export { TestRunner, TestSuite, TestResult };