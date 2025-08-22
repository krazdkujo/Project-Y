# Quality Gates and Deployment Criteria

## Overview

This document establishes comprehensive quality gates and deployment criteria for the ASCII roguelike game expansion. These gates ensure that only high-quality, thoroughly tested code reaches production, maintaining system stability and user experience across all 34+ skills, 180+ items, 175+ abilities, and 8-player multiplayer functionality.

## Quality Gate Framework

### Gate Hierarchy
```
┌─────────────────────────────────────────┐
│              PRODUCTION                 │
│         ✓ All gates passed              │
└─────────────────────────────────────────┘
                     ▲
┌─────────────────────────────────────────┐
│              STAGING                    │
│    ✓ Integration + Performance gates    │
└─────────────────────────────────────────┘
                     ▲
┌─────────────────────────────────────────┐
│            DEVELOPMENT                  │
│         ✓ Unit + Code Quality           │
└─────────────────────────────────────────┘
```

## Quality Gates Definition

### Gate 1: Code Quality Gate (Development → CI)

**Automated Checks:**
- [ ] **Unit Test Coverage**: ≥90% line coverage, ≥85% branch coverage
- [ ] **Code Quality**: ESLint score ≥8.5/10, zero critical violations
- [ ] **Type Safety**: TypeScript compilation with zero errors
- [ ] **Security Scan**: Zero critical vulnerabilities, <5 high-severity issues
- [ ] **Code Duplication**: <5% duplication ratio
- [ ] **Complexity**: Cyclomatic complexity <10 per function

**Implementation:**
```yaml
# .github/workflows/quality-gate-1.yml
name: Quality Gate 1 - Code Quality
on:
  push:
    branches: [ develop, feature/* ]
  pull_request:
    branches: [ develop, main ]

jobs:
  code-quality:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Type checking
        run: npm run type-check
        
      - name: Linting
        run: npm run lint
        
      - name: Unit tests with coverage
        run: npm run test:unit -- --coverage
        
      - name: Coverage threshold check
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          fail_ci_if_error: true
          
      - name: Security audit
        run: npm audit --audit-level high
        
      - name: Code quality analysis
        uses: sonarcloud/sonarcloud-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### Gate 2: Integration Gate (CI → Staging)

**Automated Checks:**
- [ ] **Integration Test Coverage**: ≥70% of critical paths
- [ ] **Database Tests**: All schema migrations and seed data validated
- [ ] **API Contract Tests**: 100% API endpoint validation
- [ ] **Component Integration**: Skills ↔ Items ↔ Abilities interaction tests
- [ ] **Performance Regression**: No >10% performance degradation

**Content Validation:**
- [ ] **Skills System**: All 34 skills tested and balanced
- [ ] **Items System**: All 180+ items functional and balanced
- [ ] **Abilities System**: All 175+ abilities tested for interactions
- [ ] **Database Integrity**: Foreign key constraints and data consistency

**Implementation:**
```typescript
// src/testing/quality-gates/IntegrationGate.ts
export class IntegrationQualityGate {
  async validateGate(): Promise<QualityGateResult> {
    const results = await Promise.all([
      this.validateIntegrationTests(),
      this.validateDatabaseIntegrity(),
      this.validateAPIContracts(),
      this.validateContentSystems(),
      this.validatePerformanceBaseline()
    ]);
    
    return {
      passed: results.every(r => r.passed),
      results: results,
      blockers: results.filter(r => !r.passed),
      warnings: results.flatMap(r => r.warnings)
    };
  }
  
  private async validateContentSystems(): Promise<ValidationResult> {
    const skillsValid = await this.validateSkillsSystem();
    const itemsValid = await this.validateItemsSystem();
    const abilitiesValid = await this.validateAbilitiesSystem();
    
    return {
      passed: skillsValid.passed && itemsValid.passed && abilitiesValid.passed,
      details: { skillsValid, itemsValid, abilitiesValid },
      warnings: [
        ...skillsValid.warnings,
        ...itemsValid.warnings,
        ...abilitiesValid.warnings
      ]
    };
  }
}
```

### Gate 3: Performance Gate (Staging → Pre-Production)

**Performance Requirements:**
- [ ] **Response Times**: API <200ms (95th percentile), Page loads <3s
- [ ] **Throughput**: Support 200 concurrent users (25 sessions × 8 players)
- [ ] **Memory Usage**: <2GB total server memory under peak load
- [ ] **Database Performance**: Queries <200ms (99th percentile)
- [ ] **Real-time Latency**: WebSocket messages <100ms
- [ ] **8-Player Sessions**: Stable for 30+ minute sessions

**Load Testing Scenarios:**
```typescript
// src/testing/quality-gates/PerformanceGate.ts
export class PerformanceQualityGate {
  private loadTestScenarios = [
    {
      name: 'Peak Load Test',
      players: 200,
      duration: 300000, // 5 minutes
      expectedLatency: 100, // ms
      expectedThroughput: 1000 // requests/second
    },
    {
      name: 'Endurance Test',
      players: 80,
      duration: 1800000, // 30 minutes
      memoryGrowthLimit: 500 * 1024 * 1024 // 500MB
    },
    {
      name: 'Spike Test',
      players: 400,
      duration: 60000, // 1 minute
      errorRateLimit: 0.02 // 2%
    }
  ];
  
  async validateGate(): Promise<QualityGateResult> {
    const performanceResults = await Promise.all(
      this.loadTestScenarios.map(scenario => this.runLoadTest(scenario))
    );
    
    const databasePerformance = await this.validateDatabasePerformance();
    const realtimePerformance = await this.validateRealtimePerformance();
    
    return {
      passed: this.evaluatePerformanceResults([
        ...performanceResults,
        databasePerformance,
        realtimePerformance
      ]),
      metrics: this.aggregatePerformanceMetrics(performanceResults),
      recommendations: this.generateOptimizationRecommendations(performanceResults)
    };
  }
}
```

### Gate 4: Security Gate (Pre-Production → Production)

**Security Requirements:**
- [ ] **Vulnerability Scan**: Zero critical, <3 high-severity vulnerabilities
- [ ] **Dependency Audit**: All dependencies scanned and updated
- [ ] **Authentication**: JWT validation and session management tested
- [ ] **Authorization**: Row Level Security (RLS) policies validated
- [ ] **Input Validation**: SQL injection and XSS protection verified
- [ ] **Rate Limiting**: API rate limiting functional

**Implementation:**
```typescript
// src/testing/quality-gates/SecurityGate.ts
export class SecurityQualityGate {
  async validateGate(): Promise<QualityGateResult> {
    const securityChecks = await Promise.all([
      this.runVulnerabilityScans(),
      this.validateAuthentication(),
      this.validateAuthorization(),
      this.validateInputSanitization(),
      this.validateRateLimiting(),
      this.validateDataEncryption()
    ]);
    
    return {
      passed: securityChecks.every(check => check.severity !== 'critical'),
      vulnerabilities: securityChecks.filter(check => check.severity === 'high'),
      recommendations: this.generateSecurityRecommendations(securityChecks)
    };
  }
  
  private async validateRLS(): Promise<SecurityCheckResult> {
    // Test Row Level Security policies for all tables
    const rlsTests = await Promise.all([
      this.testPlayerDataAccess(),
      this.testSkillProgressionAccess(),
      this.testItemOwnershipAccess(),
      this.testGameSessionAccess()
    ]);
    
    return {
      passed: rlsTests.every(test => test.passed),
      details: rlsTests,
      severity: rlsTests.some(test => !test.passed) ? 'high' : 'low'
    };
  }
}
```

### Gate 5: Production Readiness Gate

**Production Requirements:**
- [ ] **Monitoring**: All monitoring and alerting configured
- [ ] **Logging**: Structured logging implemented
- [ ] **Backup Strategy**: Database backup and recovery tested
- [ ] **Deployment Rollback**: Rollback procedures verified
- [ ] **Health Checks**: All health endpoints operational
- [ ] **Documentation**: Deployment and operational documentation complete

## Deployment Criteria

### Deployment Environments

#### Development Environment
```yaml
# Development deployment criteria
deployment:
  trigger: push to develop branch
  requirements:
    - Unit tests passing
    - Code quality checks passed
    - Type safety validated
  auto_deploy: true
  rollback: automatic on failure
```

#### Staging Environment
```yaml
# Staging deployment criteria
deployment:
  trigger: manual promotion from develop
  requirements:
    - All development requirements met
    - Integration tests passing (≥70% coverage)
    - Database migrations validated
    - Content systems functional
  manual_approval: required
  rollback: manual with automatic option
```

#### Production Environment
```yaml
# Production deployment criteria
deployment:
  trigger: manual promotion from staging
  requirements:
    - All previous requirements met
    - Performance tests passing
    - Security scan clean
    - Load testing completed
    - Business stakeholder approval
  manual_approval: required (2 approvers)
  rollback: manual only
  deployment_window: maintenance window preferred
```

## Quality Metrics Dashboard

### Key Performance Indicators (KPIs)

```typescript
// src/monitoring/QualityMetrics.ts
export class QualityMetrics {
  private metrics = {
    // Code Quality Metrics
    codeQuality: {
      testCoverage: 0,
      codeComplexity: 0,
      technicalDebt: 0,
      vulnerabilities: 0
    },
    
    // Performance Metrics
    performance: {
      responseTime: { p50: 0, p95: 0, p99: 0 },
      throughput: 0,
      errorRate: 0,
      uptime: 0
    },
    
    // Business Metrics
    business: {
      activeUsers: 0,
      sessionDuration: 0,
      gameCompletionRate: 0,
      playerRetention: 0
    }
  };
  
  async updateMetrics(): Promise<void> {
    this.metrics.codeQuality = await this.collectCodeQualityMetrics();
    this.metrics.performance = await this.collectPerformanceMetrics();
    this.metrics.business = await this.collectBusinessMetrics();
  }
  
  generateQualityReport(): QualityReport {
    return {
      timestamp: Date.now(),
      overallScore: this.calculateOverallQualityScore(),
      metrics: this.metrics,
      trends: this.calculateTrends(),
      recommendations: this.generateRecommendations(),
      alerts: this.checkAlertThresholds()
    };
  }
}
```

## Automated Quality Gate Pipeline

### Complete CI/CD Pipeline with Quality Gates

```yaml
# .github/workflows/complete-pipeline.yml
name: Complete Quality Gate Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  quality-gate-1:
    name: "Gate 1: Code Quality"
    runs-on: ubuntu-latest
    outputs:
      quality-score: ${{ steps.quality.outputs.score }}
    steps:
      - uses: actions/checkout@v3
      - name: Run Quality Gate 1
        id: quality
        run: npm run quality:gate1
      - name: Quality Gate 1 Results
        run: |
          echo "Quality Score: ${{ steps.quality.outputs.score }}"
          if [ "${{ steps.quality.outputs.score }}" -lt "85" ]; then
            echo "❌ Quality Gate 1 Failed"
            exit 1
          else
            echo "✅ Quality Gate 1 Passed"
          fi

  quality-gate-2:
    name: "Gate 2: Integration"
    runs-on: ubuntu-latest
    needs: quality-gate-1
    if: needs.quality-gate-1.outputs.quality-score >= 85
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - name: Run Quality Gate 2
        run: npm run quality:gate2

  quality-gate-3:
    name: "Gate 3: Performance"
    runs-on: ubuntu-latest
    needs: quality-gate-2
    steps:
      - uses: actions/checkout@v3
      - name: Run Performance Tests
        run: npm run quality:gate3
      - name: Upload Performance Report
        uses: actions/upload-artifact@v3
        with:
          name: performance-report
          path: reports/performance/

  quality-gate-4:
    name: "Gate 4: Security"
    runs-on: ubuntu-latest
    needs: quality-gate-3
    steps:
      - uses: actions/checkout@v3
      - name: Run Security Scan
        run: npm run quality:gate4
      - name: Upload Security Report
        uses: actions/upload-artifact@v3
        with:
          name: security-report
          path: reports/security/

  deploy-staging:
    name: "Deploy to Staging"
    runs-on: ubuntu-latest
    needs: [quality-gate-1, quality-gate-2, quality-gate-3, quality-gate-4]
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      - name: Deploy to Staging
        run: npm run deploy:staging

  quality-gate-5:
    name: "Gate 5: Production Readiness"
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Production Readiness Check
        run: npm run quality:gate5

  deploy-production:
    name: "Deploy to Production"
    runs-on: ubuntu-latest
    needs: quality-gate-5
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Deploy to Production
        run: npm run deploy:production
      - name: Post-deployment Health Check
        run: npm run health:check:production
```

## Quality Gate Configuration

### NPM Scripts for Quality Gates

```json
{
  "scripts": {
    "quality:gate1": "npm run lint && npm run test:unit -- --coverage && npm run type-check && npm run security:audit",
    "quality:gate2": "npm run test:integration && npm run test:database && npm run test:content",
    "quality:gate3": "npm run test:performance && npm run test:load && npm run test:endurance",
    "quality:gate4": "npm run security:scan && npm run security:rls && npm run security:auth",
    "quality:gate5": "npm run monitoring:check && npm run backup:verify && npm run docs:validate",
    
    "test:content": "npm run test:skills && npm run test:items && npm run test:abilities",
    "test:skills": "jest src/**/*skills*.test.ts",
    "test:items": "jest src/**/*items*.test.ts",
    "test:abilities": "jest src/**/*abilities*.test.ts",
    
    "security:scan": "npm audit && snyk test",
    "security:rls": "jest src/testing/security/rls-tests.ts",
    "security:auth": "jest src/testing/security/auth-tests.ts",
    
    "monitoring:check": "node scripts/verify-monitoring.js",
    "backup:verify": "node scripts/verify-backup-strategy.js",
    "docs:validate": "node scripts/validate-documentation.js"
  }
}
```

## Rollback Procedures

### Automated Rollback Triggers

```typescript
// src/deployment/RollbackManager.ts
export class RollbackManager {
  private healthChecks = [
    'api_health',
    'database_health',
    'websocket_health',
    'memory_usage',
    'error_rate'
  ];
  
  async monitorDeployment(deploymentId: string): Promise<void> {
    const healthCheckInterval = setInterval(async () => {
      const health = await this.performHealthChecks();
      
      if (health.overallHealth < 0.8) { // 80% health threshold
        console.log('🚨 Health check failed, initiating rollback');
        await this.initiateRollback(deploymentId);
        clearInterval(healthCheckInterval);
      }
    }, 30000); // Check every 30 seconds
    
    // Stop monitoring after 10 minutes
    setTimeout(() => clearInterval(healthCheckInterval), 600000);
  }
  
  private async initiateRollback(deploymentId: string): Promise<void> {
    // Rollback deployment
    await this.executeRollback(deploymentId);
    
    // Notify stakeholders
    await this.notifyRollback(deploymentId);
    
    // Create incident report
    await this.createIncidentReport(deploymentId);
  }
}
```

## Quality Gate Reporting

### Daily Quality Report

```typescript
// src/reporting/QualityReporter.ts
export class QualityReporter {
  async generateDailyReport(): Promise<QualityReport> {
    const metrics = await this.collectDailyMetrics();
    
    return {
      date: new Date().toISOString().split('T')[0],
      summary: {
        deploymentsToday: metrics.deployments.length,
        successfulDeployments: metrics.deployments.filter(d => d.success).length,
        qualityGateFailures: metrics.qualityGateFailures,
        averageLeadTime: metrics.averageLeadTime,
        meanTimeToRecovery: metrics.meanTimeToRecovery
      },
      trends: {
        testCoverage: metrics.testCoverageTrend,
        performanceMetrics: metrics.performanceTrend,
        errorRates: metrics.errorRateTrend
      },
      recommendations: this.generateDailyRecommendations(metrics),
      upcomingMilestones: await this.getUpcomingMilestones()
    };
  }
  
  async sendQualityReport(report: QualityReport): Promise<void> {
    // Send to development team
    await this.sendSlackNotification(report);
    
    // Update quality dashboard
    await this.updateDashboard(report);
    
    // Archive report
    await this.archiveReport(report);
  }
}
```

## Implementation Timeline

### Phase 1: Foundation (Week 1)
- [ ] Set up basic quality gate infrastructure
- [ ] Implement Gate 1 (Code Quality)
- [ ] Configure CI/CD pipeline basics

### Phase 2: Integration Testing (Week 2)
- [ ] Implement Gate 2 (Integration)
- [ ] Set up database testing framework
- [ ] Create content validation tests

### Phase 3: Performance and Security (Week 3)
- [ ] Implement Gate 3 (Performance)
- [ ] Implement Gate 4 (Security)
- [ ] Set up load testing infrastructure

### Phase 4: Production Readiness (Week 4)
- [ ] Implement Gate 5 (Production Readiness)
- [ ] Set up monitoring and alerting
- [ ] Create rollback procedures
- [ ] Document deployment processes

This comprehensive quality gate system ensures that only thoroughly tested, high-quality code reaches production, maintaining the stability and performance required for a successful 8-player multiplayer gaming experience with extensive content (34+ skills, 180+ items, 175+ abilities).