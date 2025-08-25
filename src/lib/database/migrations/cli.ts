#!/usr/bin/env node

/**
 * AUTOMATED DATABASE MIGRATION CLI
 * 
 * Command-line interface for running database migrations with full automation.
 * Designed for CI/CD environments with zero manual intervention required.
 * 
 * Usage:
 *   npx ts-node src/lib/database/migrations/cli.ts migrate   # Run all pending migrations
 *   npx ts-node src/lib/database/migrations/cli.ts status    # Show migration status
 *   npx ts-node src/lib/database/migrations/cli.ts rollback  # Rollback last migration
 *   npx ts-node src/lib/database/migrations/cli.ts create <name>  # Create new migration
 * 
 * Environment Variables:
 *   DATABASE_URL     - Full PostgreSQL connection string
 *   PGHOST          - PostgreSQL host
 *   PGPORT          - PostgreSQL port
 *   PGDATABASE      - Database name
 *   PGUSER          - Database user
 *   PGPASSWORD      - Database password
 *   NODE_ENV        - Environment (enables SSL in production)
 */

import { Command } from 'commander';
import { AutomatedMigrationRunner, MigrationConfig, runAutomatedMigrations } from './MigrationRunner';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config();

const program = new Command();

program
  .name('migrate')
  .description('Automated database migration tool for production deployment')
  .version('1.0.0');

/**
 * Get migration configuration from environment variables
 */
function getMigrationConfig(): MigrationConfig {
  const config: MigrationConfig = {
    ssl: process.env.NODE_ENV === 'production',
    migrationsDir: path.join(__dirname, '../../../../supabase/migrations-new'),
    verbose: process.env.CI !== 'true', // Less verbose in CI environments
  };

  // Add optional properties only if they exist
  if (process.env.DATABASE_URL) {
    config.databaseUrl = process.env.DATABASE_URL;
  }
  if (process.env.PGHOST) {
    config.host = process.env.PGHOST;
  }
  if (process.env.PGPORT) {
    config.port = parseInt(process.env.PGPORT);
  }
  if (process.env.PGDATABASE) {
    config.database = process.env.PGDATABASE;
  }
  if (process.env.PGUSER) {
    config.username = process.env.PGUSER;
  }
  if (process.env.PGPASSWORD) {
    config.password = process.env.PGPASSWORD;
  }

  return config;
}

/**
 * Format migration results for display
 */
function formatMigrationResult(result: any) {
  if (result.success) {
    console.log('✅ Migration completed successfully');
    console.log(`⏱️  Total time: ${result.totalTime}ms`);
    
    if (result.migrationsRun.length > 0) {
      console.log(`📊 Migrations executed (${result.migrationsRun.length}):`);
      result.migrationsRun.forEach((migration: string) => {
        console.log(`   ✓ ${migration}`);
      });
    } else {
      console.log('📊 No pending migrations found');
    }
  } else {
    console.error('❌ Migration failed');
    console.error(`⏱️  Total time: ${result.totalTime}ms`);
    
    if (result.errors.length > 0) {
      console.error('🚨 Errors:');
      result.errors.forEach((error: string) => {
        console.error(`   ❌ ${error}`);
      });
    }

    if (result.rollbacks.length > 0) {
      console.error('🔄 Rollbacks performed:');
      result.rollbacks.forEach((rollback: string) => {
        console.error(`   ↩️  ${rollback}`);
      });
    }
  }
}

/**
 * Command: migrate
 * Run all pending migrations automatically
 */
program
  .command('migrate')
  .alias('up')
  .description('Run all pending database migrations')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('--dry-run', 'Show what would be migrated without executing')
  .action(async (options) => {
    try {
      console.log('🚀 Starting automated database migration...');
      
      const config = getMigrationConfig();
      if (options.verbose) {
        config.verbose = true;
      }

      if (options.dryRun) {
        console.log('🔍 DRY RUN MODE - No changes will be made');
        const runner = new AutomatedMigrationRunner(config);
        try {
          const status = await runner.getMigrationStatus();
          console.log('\n📋 Migration Status:');
          console.log(`   Applied: ${status.applied.length}`);
          console.log(`   Pending: ${status.pending.length}`);
          
          if (status.pending.length > 0) {
            console.log('\n📝 Pending migrations:');
            status.pending.forEach(migration => {
              console.log(`   ○ ${migration}`);
            });
          }
        } finally {
          await runner.close();
        }
        return;
      }

      const result = await runAutomatedMigrations(config);
      formatMigrationResult(result);

      if (!result.success) {
        process.exit(1);
      }

    } catch (error) {
      console.error('💥 Fatal error during migration:', error);
      process.exit(1);
    }
  });

/**
 * Command: status
 * Show current migration status
 */
program
  .command('status')
  .alias('list')
  .description('Show current migration status')
  .action(async () => {
    try {
      console.log('📋 Checking migration status...');
      
      const config = getMigrationConfig();
      const runner = new AutomatedMigrationRunner(config);
      
      try {
        const status = await runner.getMigrationStatus();
        
        console.log(`\n✅ Applied migrations (${status.applied.length}):`);
        if (status.applied.length === 0) {
          console.log('   No migrations have been applied');
        } else {
          status.applied.forEach(migration => {
            console.log(`   ✓ ${migration}`);
          });
        }

        console.log(`\n⏳ Pending migrations (${status.pending.length}):`);
        if (status.pending.length === 0) {
          console.log('   No pending migrations');
        } else {
          status.pending.forEach(migration => {
            console.log(`   ○ ${migration}`);
          });
        }

      } finally {
        await runner.close();
      }

    } catch (error) {
      console.error('💥 Error checking migration status:', error);
      process.exit(1);
    }
  });

/**
 * Command: rollback
 * Rollback the last migration
 */
program
  .command('rollback')
  .alias('down')
  .description('Rollback the last migration')
  .option('-c, --count <number>', 'Number of migrations to rollback', '1')
  .action(async (options) => {
    try {
      const count = parseInt(options.count);
      console.log(`🔄 Rolling back ${count} migration(s)...`);
      
      const config = getMigrationConfig();
      const runner = new AutomatedMigrationRunner(config);
      
      try {
        // For now, we'll use a simple approach to rollback
        // In a more advanced implementation, you might want to track rollback history
        console.log('⚠️  Rollback functionality requires careful implementation.');
        console.log('🔧 Consider implementing custom rollback logic for your specific use case.');
        
        const status = await runner.getMigrationStatus();
        
        if (status.applied.length === 0) {
          console.log('ℹ️  No applied migrations to rollback');
          return;
        }

        console.log('📋 Last applied migrations:');
        const lastMigrations = status.applied.slice(-count);
        lastMigrations.forEach(migration => {
          console.log(`   ↩️  Would rollback: ${migration}`);
        });

        console.log('\n⚠️  Rollback is a destructive operation.');
        console.log('🔧 Implement rollback logic in your migration files\' down() functions.');

      } finally {
        await runner.close();
      }

    } catch (error) {
      console.error('💥 Error during rollback:', error);
      process.exit(1);
    }
  });

/**
 * Command: create
 * Create a new migration file
 */
program
  .command('create <name>')
  .description('Create a new migration file')
  .action(async (name) => {
    try {
      console.log(`📝 Creating new migration: ${name}`);
      
      const config = getMigrationConfig();
      const runner = new AutomatedMigrationRunner(config);
      
      try {
        const filename = await runner.createMigration(name);
        console.log(`✅ Created migration file: ${filename}`);
        
        const fullPath = path.join(config.migrationsDir || '', filename);
        console.log(`📁 Location: ${fullPath}`);

      } finally {
        await runner.close();
      }

    } catch (error) {
      console.error('💥 Error creating migration:', error);
      process.exit(1);
    }
  });

/**
 * Command: validate
 * Validate database connection and migration setup
 */
program
  .command('validate')
  .alias('test')
  .description('Validate database connection and migration setup')
  .action(async () => {
    try {
      console.log('🔍 Validating migration setup...');
      
      const config = getMigrationConfig();
      
      // Check configuration
      if (!config.databaseUrl && (!config.host || !config.database)) {
        throw new Error('Missing database configuration. Provide either DATABASE_URL or PGHOST/PGDATABASE.');
      }

      console.log('✅ Configuration validated');
      
      // Test database connection
      const runner = new AutomatedMigrationRunner(config);
      
      try {
        console.log('🔌 Testing database connection...');
        
        // The runner will test connection during initialization
        const status = await runner.getMigrationStatus();
        
        console.log('✅ Database connection successful');
        console.log('✅ Migration table accessible');
        console.log(`📊 Current status: ${status.applied.length} applied, ${status.pending.length} pending`);

      } finally {
        await runner.close();
      }

      console.log('✅ All validation checks passed');

    } catch (error) {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    }
  });

// Handle unrecognized commands
program.on('command:*', () => {
  console.error('❌ Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
  process.exit(1);
});

// Parse command line arguments
program.parse();

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}