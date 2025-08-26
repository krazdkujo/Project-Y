# Data Migration Procedures & Strategy

This document provides detailed procedures for migrating from the current system to the modernized architecture while ensuring zero data loss and minimal downtime.

## Migration Overview

### Migration Strategy: Blue-Green with Gradual Cutover
- **Blue Environment:** Current production system
- **Green Environment:** New modernized system
- **Gradual Migration:** Character data migrated in batches
- **Validation:** Continuous data integrity checking
- **Rollback:** Immediate fallback to blue environment if needed

### Key Migration Principles
1. **Zero Data Loss:** All character progression preserved exactly
2. **Minimal Downtime:** <30 minutes maintenance window required
3. **Validation First:** Every migration step validated before proceeding
4. **Rollback Ready:** Ability to revert within 5 minutes if issues arise

## Pre-Migration Assessment

### Current System Analysis

```bash
# Data inventory analysis script
#!/bin/bash
echo "=== Current System Data Analysis ==="

# Count total players
PLAYER_COUNT=$(sqlite3 game.db "SELECT COUNT(*) FROM players;")
echo "Total Players: $PLAYER_COUNT"

# Analyze skill progression data
SKILL_RECORDS=$(sqlite3 game.db "SELECT COUNT(*) FROM character_skills;")
echo "Skill Records: $SKILL_RECORDS"

# Check for data consistency issues
echo "=== Data Integrity Check ==="
sqlite3 game.db "
SELECT 
  'Orphaned skill records' as issue,
  COUNT(*) as count
FROM character_skills cs 
LEFT JOIN players p ON cs.player_id = p.id 
WHERE p.id IS NULL;

SELECT 
  'Players without skills' as issue,
  COUNT(*) as count
FROM players p 
LEFT JOIN character_skills cs ON p.id = cs.player_id 
WHERE cs.player_id IS NULL;
"
```

### Data Structure Mapping

**Current SQLite Schema → New PostgreSQL Schema**

```sql
-- Current: SQLite (game.db)
-- players: id, name, password_hash, created_at, last_login
-- character_skills: player_id, skill_name, experience, level
-- game_sessions: id, players, state, created_at
-- items: player_id, item_type, item_data, quantity

-- Target: PostgreSQL with improved structure
-- players: id (UUID), name, auth_provider_id, created_at, updated_at
-- character_skills: player_id, skill_id, experience, level, unlocked_abilities (JSONB)
-- active_sessions: session_id, players (JSONB), state (JSONB), redis_key
-- inventory: player_id, item_id, quantity, custom_properties (JSONB)
```

## Migration Phase 1: Environment Preparation

### Step 1.1: New Environment Setup

```bash
# PostgreSQL database initialization
createdb tactical_roguelike_v2
psql tactical_roguelike_v2 < migrations/001_initial_schema.sql

# Redis cluster setup
docker-compose -f production/redis-cluster.yml up -d

# Verify connectivity
npm run migrate:status
npm run test:db-connection
```

### Step 1.2: Migration Tools Installation

```typescript
// src/migration/MigrationTools.ts
export class DataMigrationManager {
  private oldDb: Database; // SQLite connection
  private newDb: Pool;     // PostgreSQL connection
  private redis: Redis;    // Redis connection
  
  constructor(config: MigrationConfig) {
    this.oldDb = new Database(config.sqlitePath);
    this.newDb = new Pool(config.postgresConfig);
    this.redis = new Redis(config.redisUrl);
  }

  async validatePreMigration(): Promise<MigrationValidation> {
    const validation: MigrationValidation = {
      playerCount: await this.countPlayers(),
      skillRecordsCount: await this.countSkillRecords(),
      dataIntegrityIssues: await this.checkDataIntegrity(),
      diskSpace: await this.checkDiskSpace(),
      networkConnectivity: await this.testConnections()
    };

    return validation;
  }

  async generateMigrationPlan(): Promise<MigrationPlan> {
    const playerBatches = await this.createPlayerBatches(500); // 500 players per batch
    const estimatedDuration = this.calculateMigrationTime(playerBatches.length);
    
    return {
      totalBatches: playerBatches.length,
      estimatedDuration,
      batchSize: 500,
      maintenanceWindow: estimatedDuration + 600, // 10 min buffer
      rollbackTime: 300 // 5 minutes max rollback time
    };
  }
}
```

### Step 1.3: Backup & Safety Procedures

```bash
#!/bin/bash
# comprehensive-backup.sh

echo "=== Creating Migration Safety Backups ==="

# Current SQLite database backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="migration-backups/$TIMESTAMP"
mkdir -p "$BACKUP_DIR"

# SQLite backup with integrity check
sqlite3 game.db ".backup $BACKUP_DIR/game_backup.db"
sqlite3 "$BACKUP_DIR/game_backup.db" "PRAGMA integrity_check;"

# Export to SQL for additional safety
sqlite3 game.db ".dump" > "$BACKUP_DIR/game_dump.sql"

# Current Redis state backup (if any)
redis-cli --rdb "$BACKUP_DIR/redis_dump.rdb"

# Configuration files backup
cp -r config/ "$BACKUP_DIR/config/"
cp package.json "$BACKUP_DIR/"
cp .env "$BACKUP_DIR/env_backup"

echo "Backup completed: $BACKUP_DIR"
echo "Backup size: $(du -sh $BACKUP_DIR)"
```

## Migration Phase 2: Data Transformation

### Step 2.1: Character Data Migration

```typescript
// src/migration/CharacterMigration.ts
export class CharacterDataMigrator {
  
  async migratePlayerBatch(batchNumber: number, batchSize: number): Promise<MigrationResult> {
    const startTime = Date.now();
    const offset = batchNumber * batchSize;
    
    // Extract player data from SQLite
    const players = await this.extractPlayersBatch(offset, batchSize);
    console.log(`Batch ${batchNumber}: Migrating ${players.length} players`);

    const results: PlayerMigrationResult[] = [];
    
    for (const player of players) {
      try {
        // Transform player data
        const transformedPlayer = await this.transformPlayerData(player);
        
        // Migrate character progression
        const skillData = await this.migrateCharacterSkills(player.id);
        
        // Migrate inventory
        const inventory = await this.migratePlayerInventory(player.id);
        
        // Insert into PostgreSQL
        const newPlayerId = await this.insertPlayer(transformedPlayer);
        await this.insertCharacterSkills(newPlayerId, skillData);
        await this.insertInventory(newPlayerId, inventory);
        
        // Validate migration
        const isValid = await this.validatePlayerMigration(player.id, newPlayerId);
        
        results.push({
          oldId: player.id,
          newId: newPlayerId,
          status: isValid ? 'success' : 'validation_failed',
          skillCount: skillData.length,
          itemCount: inventory.length
        });
        
      } catch (error) {
        results.push({
          oldId: player.id,
          status: 'failed',
          error: error.message
        });
        console.error(`Failed to migrate player ${player.id}:`, error);
      }
    }

    const duration = Date.now() - startTime;
    const successCount = results.filter(r => r.status === 'success').length;
    
    return {
      batchNumber,
      duration,
      playersProcessed: players.length,
      successCount,
      failureCount: players.length - successCount,
      results
    };
  }

  private async transformPlayerData(oldPlayer: any): Promise<NewPlayerData> {
    return {
      id: uuid(), // Generate new UUID
      name: oldPlayer.name,
      auth_provider_id: oldPlayer.id.toString(), // Keep reference to old ID
      created_at: new Date(oldPlayer.created_at),
      updated_at: new Date(),
      legacy_player_id: oldPlayer.id // For rollback purposes
    };
  }

  private async migrateCharacterSkills(oldPlayerId: number): Promise<SkillData[]> {
    const skillRecords = await this.oldDb.prepare(`
      SELECT skill_name, experience, level 
      FROM character_skills 
      WHERE player_id = ?
    `).all(oldPlayerId);

    return skillRecords.map(skill => ({
      skill_id: this.mapSkillName(skill.skill_name),
      experience: skill.experience,
      level: skill.level,
      unlocked_abilities: this.calculateUnlockedAbilities(skill.skill_name, skill.level)
    }));
  }

  private calculateUnlockedAbilities(skillName: string, level: number): string[] {
    const skillConfig = SKILL_CONFIGURATIONS[skillName];
    if (!skillConfig) return [];

    return skillConfig.abilities
      .filter(ability => ability.requiredLevel <= level)
      .map(ability => ability.id);
  }
}
```

### Step 2.2: Game State Transformation

```typescript
// src/migration/GameStateMigration.ts
export class GameStateMigrator {

  async migrateActiveSessions(): Promise<void> {
    console.log('Migrating active game sessions to Redis...');
    
    // Get all active sessions from SQLite
    const activeSessions = await this.oldDb.prepare(`
      SELECT id, players, state, created_at 
      FROM game_sessions 
      WHERE status = 'active'
    `).all();

    for (const session of activeSessions) {
      try {
        // Transform session data
        const transformedSession = await this.transformSessionData(session);
        
        // Store in Redis with appropriate TTL
        const sessionKey = `game:session:${transformedSession.sessionId}`;
        await this.redis.setex(
          sessionKey,
          3600, // 1 hour TTL
          JSON.stringify(transformedSession)
        );
        
        // Create player state entries
        for (const player of transformedSession.players) {
          const playerKey = `game:player:${player.id}`;
          await this.redis.setex(
            playerKey,
            1800, // 30 minutes TTL
            JSON.stringify(player.state)
          );
        }
        
        console.log(`Migrated session ${session.id} → ${transformedSession.sessionId}`);
        
      } catch (error) {
        console.error(`Failed to migrate session ${session.id}:`, error);
      }
    }
  }

  private async transformSessionData(oldSession: any): Promise<GameSessionData> {
    const players = JSON.parse(oldSession.players);
    const state = JSON.parse(oldSession.state);
    
    return {
      sessionId: uuid(),
      players: players.map(p => ({
        id: p.id,
        name: p.name,
        position: p.position,
        currentAP: p.currentAP,
        maxAP: p.maxAP,
        health: p.health,
        maxHealth: p.maxHealth,
        state: p.state
      })),
      gameState: {
        turnOrder: state.turnOrder,
        currentPlayerIndex: state.currentPlayerIndex,
        turnStartTime: state.turnStartTime,
        dungeonLevel: state.dungeonLevel,
        dungeonMap: state.dungeonMap
      },
      createdAt: new Date(oldSession.created_at),
      lastUpdated: new Date()
    };
  }
}
```

## Migration Phase 3: Validation & Testing

### Step 3.1: Data Integrity Validation

```typescript
// src/migration/ValidationSuite.ts
export class MigrationValidator {

  async runFullValidation(): Promise<ValidationReport> {
    console.log('Running comprehensive migration validation...');
    
    const report: ValidationReport = {
      playerValidation: await this.validateAllPlayers(),
      skillValidation: await this.validateSkillProgression(),
      inventoryValidation: await this.validateInventories(),
      sessionValidation: await this.validateGameSessions(),
      performanceValidation: await this.validatePerformance()
    };

    return report;
  }

  private async validateAllPlayers(): Promise<PlayerValidationResult> {
    const oldPlayerCount = await this.getOldPlayerCount();
    const newPlayerCount = await this.getNewPlayerCount();
    
    if (oldPlayerCount !== newPlayerCount) {
      throw new Error(`Player count mismatch: ${oldPlayerCount} vs ${newPlayerCount}`);
    }

    // Sample validation of 10% of players
    const sampleSize = Math.min(100, Math.floor(oldPlayerCount * 0.1));
    const randomPlayers = await this.getRandomPlayerSample(sampleSize);
    
    const validationResults = await Promise.all(
      randomPlayers.map(player => this.validateIndividualPlayer(player))
    );

    const failedValidations = validationResults.filter(r => !r.valid);
    
    return {
      totalPlayers: oldPlayerCount,
      sampledPlayers: sampleSize,
      validatedSuccessfully: validationResults.length - failedValidations.length,
      validationFailures: failedValidations,
      overallValid: failedValidations.length === 0
    };
  }

  private async validateIndividualPlayer(oldPlayerId: number): Promise<PlayerValidation> {
    try {
      // Get old player data
      const oldPlayer = await this.getOldPlayer(oldPlayerId);
      const oldSkills = await this.getOldPlayerSkills(oldPlayerId);
      const oldInventory = await this.getOldPlayerInventory(oldPlayerId);
      
      // Find corresponding new player
      const newPlayer = await this.getNewPlayerByLegacyId(oldPlayerId);
      const newSkills = await this.getNewPlayerSkills(newPlayer.id);
      const newInventory = await this.getNewPlayerInventory(newPlayer.id);
      
      // Validate data consistency
      const nameMatch = oldPlayer.name === newPlayer.name;
      const skillCountMatch = oldSkills.length === newSkills.length;
      const inventoryCountMatch = oldInventory.length === newInventory.length;
      
      // Validate skill progression
      const skillProgressionValid = oldSkills.every(oldSkill => {
        const newSkill = newSkills.find(ns => 
          this.mapSkillName(oldSkill.skill_name) === ns.skill_id
        );
        return newSkill && 
               oldSkill.experience === newSkill.experience &&
               oldSkill.level === newSkill.level;
      });

      const isValid = nameMatch && skillCountMatch && 
                     inventoryCountMatch && skillProgressionValid;

      return {
        oldPlayerId,
        newPlayerId: newPlayer.id,
        valid: isValid,
        issues: [
          !nameMatch && 'Name mismatch',
          !skillCountMatch && 'Skill count mismatch', 
          !inventoryCountMatch && 'Inventory count mismatch',
          !skillProgressionValid && 'Skill progression mismatch'
        ].filter(Boolean)
      };
      
    } catch (error) {
      return {
        oldPlayerId,
        valid: false,
        issues: [`Validation error: ${error.message}`]
      };
    }
  }
}
```

### Step 3.2: Performance Testing

```bash
#!/bin/bash
# migration-performance-test.sh

echo "=== Performance Testing New System ==="

# Database connection pooling test
echo "Testing database connection performance..."
npm run test:db-performance

# Redis query performance
echo "Testing Redis performance..."
redis-cli --latency -i 1 &
REDIS_PID=$!
sleep 30
kill $REDIS_PID

# WebSocket connection test
echo "Testing WebSocket performance..."
node scripts/websocket-load-test.js --connections 100 --duration 60

# End-to-end game session test
echo "Testing 8-player session performance..."
npm run test:8player-session

# Memory usage monitoring
echo "Monitoring memory usage..."
node --max-old-space-size=512 scripts/memory-test.js
```

## Migration Phase 4: Cutover Execution

### Step 4.1: Maintenance Window Execution

```bash
#!/bin/bash
# cutover-execution.sh

MIGRATION_LOG="migration-$(date +%Y%m%d_%H%M%S).log"
exec 1> >(tee -a "$MIGRATION_LOG")
exec 2>&1

echo "=== MIGRATION CUTOVER STARTED ==="
echo "Start time: $(date)"

# Step 1: Notify users of maintenance
echo "Sending maintenance notifications..."
npm run notify:maintenance-start

# Step 2: Graceful shutdown of current system
echo "Gracefully shutting down current system..."
pm2 stop tactical-roguelike
nginx -s reload  # Switch to maintenance page

# Step 3: Final data sync
echo "Performing final data synchronization..."
node scripts/final-data-sync.js

# Step 4: Start new system
echo "Starting new system services..."
kubectl apply -f k8s/production/
kubectl wait --for=condition=ready pod -l app=tactical-roguelike --timeout=300s

# Step 5: Smoke tests
echo "Running post-cutover smoke tests..."
npm run test:smoke

if [ $? -eq 0 ]; then
    echo "Smoke tests PASSED"
    
    # Step 6: Switch traffic to new system
    echo "Switching traffic to new system..."
    kubectl apply -f k8s/ingress/production-switch.yaml
    
    # Step 7: Notify users of completion
    npm run notify:maintenance-complete
    
    echo "=== MIGRATION CUTOVER COMPLETED SUCCESSFULLY ==="
else
    echo "Smoke tests FAILED - initiating rollback..."
    bash scripts/emergency-rollback.sh
fi

echo "End time: $(date)"
```

### Step 4.2: Emergency Rollback Procedures

```bash
#!/bin/bash
# emergency-rollback.sh

echo "=== EMERGENCY ROLLBACK INITIATED ==="
echo "Rollback start time: $(date)"

# Step 1: Switch traffic back to old system
echo "Reverting traffic to old system..."
nginx -s reload -c /etc/nginx/old-system.conf

# Step 2: Restart old system
echo "Restarting old system..."
pm2 start tactical-roguelike
pm2 logs --lines 20

# Step 3: Verify old system is operational
echo "Verifying old system functionality..."
curl -f http://localhost:3000/health || {
    echo "CRITICAL: Old system not responding"
    exit 1
}

# Step 4: Notify operations team
echo "Notifying operations team of rollback..."
npm run notify:rollback-executed

# Step 5: Restore any corrupted data (if needed)
if [ -f "migration-backups/latest/game_backup.db" ]; then
    echo "Checking if data restoration is needed..."
    # Only restore if current data is corrupted
    sqlite3 game.db "PRAGMA integrity_check;" | grep -q "ok" || {
        echo "Restoring database from backup..."
        cp "migration-backups/latest/game_backup.db" game.db
    }
fi

echo "=== ROLLBACK COMPLETED ==="
echo "Rollback end time: $(date)"
echo "System restored to pre-migration state"
```

## Migration Phase 5: Post-Migration Monitoring

### Step 5.1: Continuous Monitoring Setup

```typescript
// src/monitoring/MigrationMonitoring.ts
export class PostMigrationMonitor {
  
  async setupContinuousMonitoring(): Promise<void> {
    console.log('Setting up post-migration monitoring...');
    
    // Database performance monitoring
    this.setupDatabaseMonitoring();
    
    // User experience monitoring
    this.setupUserExperienceMonitoring();
    
    // Data integrity monitoring
    this.setupDataIntegrityChecks();
    
    // Performance baseline comparison
    this.setupPerformanceComparison();
  }

  private setupDatabaseMonitoring(): void {
    // Monitor query performance
    setInterval(async () => {
      const slowQueries = await this.checkSlowQueries();
      if (slowQueries.length > 0) {
        await this.alertOperations('Slow queries detected', slowQueries);
      }
    }, 60000); // Every minute

    // Monitor connection pool usage
    setInterval(async () => {
      const poolStats = await this.getConnectionPoolStats();
      if (poolStats.activeConnections > poolStats.maxConnections * 0.8) {
        await this.alertOperations('High database connection usage', poolStats);
      }
    }, 30000); // Every 30 seconds
  }

  private setupUserExperienceMonitoring(): void {
    // Monitor user session health
    setInterval(async () => {
      const sessionMetrics = await this.getSessionMetrics();
      const issueThreshold = {
        avgResponseTime: 200, // ms
        errorRate: 0.01,      // 1%
        disconnectionRate: 0.05 // 5%
      };

      if (sessionMetrics.avgResponseTime > issueThreshold.avgResponseTime ||
          sessionMetrics.errorRate > issueThreshold.errorRate ||
          sessionMetrics.disconnectionRate > issueThreshold.disconnectionRate) {
        
        await this.alertOperations('User experience degradation', sessionMetrics);
      }
    }, 120000); // Every 2 minutes
  }
}
```

### Step 5.2: Success Metrics Validation

```bash
#!/bin/bash
# post-migration-validation.sh

echo "=== Post-Migration Success Metrics Validation ==="

# Performance metrics
echo "Validating performance improvements..."

# Database query performance
echo "Database query performance:"
psql -c "
SELECT 
  query,
  mean_time,
  calls
FROM pg_stat_statements 
WHERE mean_time > 100 
ORDER BY mean_time DESC 
LIMIT 10;
"

# Redis performance
echo "Redis performance metrics:"
redis-cli info stats | grep -E "instantaneous_ops_per_sec|used_memory_human"

# User experience metrics
echo "User experience metrics:"
curl -s "http://localhost:3000/api/metrics" | jq '.userExperience'

# Data integrity final check
echo "Final data integrity check:"
npm run validate:data-integrity

# Success criteria validation
echo "=== Success Criteria Validation ==="

# Performance: <100ms response time
RESPONSE_TIME=$(curl -w "%{time_total}" -s -o /dev/null http://localhost:3000/api/health)
RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc)
echo "API response time: ${RESPONSE_MS}ms (target: <100ms)"

# User retention: Check active sessions
ACTIVE_SESSIONS=$(redis-cli keys "game:session:*" | wc -l)
echo "Active game sessions: $ACTIVE_SESSIONS"

# Error rate: Check application logs
ERROR_RATE=$(journalctl -u tactical-roguelike --since "1 hour ago" | grep -c "ERROR" || echo 0)
echo "Error count (last hour): $ERROR_RATE (target: <10)"

echo "=== Migration Success Report Generated ==="
```

## Rollback Strategy

### Immediate Rollback (0-5 minutes)

If critical issues are detected within the first 5 minutes:

```bash
# Immediate traffic switch
kubectl apply -f k8s/rollback/immediate-traffic-switch.yaml

# Verify old system
curl -f http://old-system.local/health
```

### Quick Rollback (5-30 minutes)

For issues discovered during the first 30 minutes:

```bash
# Database rollback (if needed)
pg_restore -d tactical_roguelike_v2 migration-backups/latest/pre_migration_backup.sql

# Full system rollback
bash scripts/emergency-rollback.sh
```

### Extended Rollback (30 minutes+)

For complex issues requiring investigation:

1. Switch to maintenance mode
2. Analyze issue root cause
3. Restore from backup if needed
4. Communicate timeline to users

## Communication Plan

### User Notifications

**Pre-Migration (48 hours before):**
```
Maintenance Notice: System Upgrade Scheduled
We're upgrading our game infrastructure to improve performance and add new features. 
Downtime: Sunday 3:00 AM - 3:30 AM UTC
Your character progression will be preserved.
```

**During Migration:**
```
System Maintenance in Progress
We're currently upgrading our servers. 
Expected completion: 30 minutes
All player data is safe and will be available after the upgrade.
```

**Post-Migration:**
```
System Upgrade Complete!
Welcome to our improved game infrastructure with:
- Faster response times
- Enhanced stability  
- New features coming soon
Your character progression has been fully preserved.
```

This comprehensive migration strategy ensures a smooth transition to the modernized architecture while preserving the beloved ASCII UI and character progression that makes the game special.