/**
 * AUTOMATED DATABASE MIGRATION RUNNER
 * 
 * This module provides fully automated database migration execution
 * with no manual intervention required for production deployments.
 * 
 * Features:
 * - Automated migration execution via node-pg-migrate API
 * - Direct PostgreSQL connection using pg library
 * - Rollback capabilities with history tracking
 * - CI/CD integration support
 * - Comprehensive error handling and validation
 */

import { Client as PgClient, Pool } from 'pg';
import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export interface MigrationConfig {
  databaseUrl?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  migrationsDir?: string;
  schema?: string;
  migrationsTable?: string;
  verbose?: boolean;
}

export interface MigrationResult {
  success: boolean;
  migrationsRun: string[];
  errors: string[];
  rollbacks: string[];
  totalTime: number;
}

export class AutomatedMigrationRunner {
  private config: Required<MigrationConfig>;
  private pool: Pool;
  private startTime: number = 0;

  constructor(config: MigrationConfig) {
    // Set defaults and merge with provided config
    this.config = {
      databaseUrl: config.databaseUrl || this.buildConnectionString(config),
      host: config.host || process.env.PGHOST || 'localhost',
      port: config.port || parseInt(process.env.PGPORT || '5432'),
      database: config.database || process.env.PGDATABASE || 'postgres',
      username: config.username || process.env.PGUSER || 'postgres',
      password: config.password || process.env.PGPASSWORD || '',
      ssl: config.ssl ?? (process.env.NODE_ENV === 'production'),
      migrationsDir: config.migrationsDir || path.join(__dirname, '../../../../supabase/migrations-new'),
      schema: config.schema || 'public',
      migrationsTable: config.migrationsTable || 'pgmigrations',
      verbose: config.verbose ?? true,
    };

    // Initialize connection pool
    this.pool = new Pool({
      connectionString: this.config.databaseUrl,
      ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    this.pool.on('error', (err) => {
      console.error('Database pool error:', err);
    });
  }

  private buildConnectionString(config: MigrationConfig): string {
    const host = config.host || process.env.PGHOST || 'localhost';
    const port = config.port || parseInt(process.env.PGPORT || '5432');
    const database = config.database || process.env.PGDATABASE || 'postgres';
    const username = config.username || process.env.PGUSER || 'postgres';
    const password = config.password || process.env.PGPASSWORD || '';
    
    let connectionString = `postgresql://${username}`;
    if (password) {
      connectionString += `:${password}`;
    }
    connectionString += `@${host}:${port}/${database}`;
    
    if (config.ssl ?? (process.env.NODE_ENV === 'production')) {
      connectionString += '?sslmode=require';
    }
    
    return connectionString;
  }

  /**
   * Execute all pending migrations automatically
   */
  async runMigrations(): Promise<MigrationResult> {
    this.startTime = Date.now();
    const result: MigrationResult = {
      success: false,
      migrationsRun: [],
      errors: [],
      rollbacks: [],
      totalTime: 0,
    };

    try {
      if (this.config.verbose) {
        console.log('🔄 Starting automated database migration...');
        console.log(`📁 Migrations directory: ${this.config.migrationsDir}`);
        console.log(`🔌 Database: ${this.config.host}:${this.config.port}/${this.config.database}`);
      }

      // Ensure migrations directory exists
      await this.ensureMigrationsDirectory();

      // Test database connection
      await this.testConnection();

      // Run migrations using node-pg-migrate programmatically
      const migrationResults = await this.executeMigrationsWithNodePgMigrate();
      result.migrationsRun = migrationResults;

      // Validate migration success
      await this.validateMigrations();

      result.success = true;
      result.totalTime = Date.now() - this.startTime;

      if (this.config.verbose) {
        console.log(`✅ Migration completed successfully in ${result.totalTime}ms`);
        console.log(`📊 Migrations executed: ${result.migrationsRun.length}`);
        if (result.migrationsRun.length > 0) {
          console.log('   - ' + result.migrationsRun.join('\n   - '));
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(errorMessage);
      result.success = false;
      result.totalTime = Date.now() - this.startTime;

      if (this.config.verbose) {
        console.error('❌ Migration failed:', errorMessage);
      }

      // Attempt rollback if needed
      try {
        const rollbackResults = await this.handleMigrationFailure(error);
        result.rollbacks = rollbackResults;
      } catch (rollbackError) {
        const rollbackMessage = rollbackError instanceof Error ? rollbackError.message : String(rollbackError);
        result.errors.push(`Rollback failed: ${rollbackMessage}`);
      }
    }

    return result;
  }

  /**
   * Execute migrations using node-pg-migrate programmatically
   */
  private async executeMigrationsWithNodePgMigrate(): Promise<string[]> {
    // Create a temporary config file for node-pg-migrate
    const configPath = path.join(this.config.migrationsDir, '.migration-config.json');
    const migrationConfig = {
      'database-url': this.config.databaseUrl,
      'migrations-dir': this.config.migrationsDir,
      'schema': this.config.schema,
      'migrations-table': this.config.migrationsTable,
      'migrations-schema': this.config.schema,
      'check-order': true,
      'verbose': this.config.verbose,
    };

    await fs.writeFile(configPath, JSON.stringify(migrationConfig, null, 2));

    try {
      // Execute node-pg-migrate programmatically using execSync for reliable execution
      const nodePgMigratePath = path.join(process.cwd(), 'node_modules', '.bin', 'node-pg-migrate');
      
      // Check for pending migrations first
      const listCommand = `"${nodePgMigratePath}" list --config-file "${configPath}"`;
      let listOutput = '';
      
      try {
        listOutput = execSync(listCommand, { 
          encoding: 'utf8',
          env: { 
            ...process.env,
            DATABASE_URL: this.config.databaseUrl,
          }
        });
      } catch (error: any) {
        // If no migrations table exists, node-pg-migrate will create it
        if (error.message && !error.message.includes('relation') && !error.message.includes('does not exist')) {
          throw error;
        }
      }

      // Execute up migrations
      const upCommand = `"${nodePgMigratePath}" up --config-file "${configPath}"`;
      const upOutput = execSync(upCommand, { 
        encoding: 'utf8',
        env: { 
          ...process.env,
          DATABASE_URL: this.config.databaseUrl,
        }
      });

      // Parse output to extract executed migrations
      const executedMigrations = this.parseMigrationOutput(upOutput);
      
      return executedMigrations;

    } finally {
      // Clean up temporary config file
      try {
        await fs.unlink(configPath);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Parse node-pg-migrate output to extract executed migrations
   */
  private parseMigrationOutput(output: string): string[] {
    const migrations: string[] = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('Running migration') || line.includes('migration:')) {
        // Extract migration name from output
        const match = line.match(/(\d{14}_[\w-]+)/);
        if (match && match[1]) {
          migrations.push(match[1]);
        }
      }
    }
    
    return migrations;
  }

  /**
   * Test database connection before running migrations
   */
  private async testConnection(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('SELECT 1');
      if (this.config.verbose) {
        console.log('✅ Database connection successful');
      }
    } catch (error) {
      throw new Error(`Database connection failed: ${error}`);
    } finally {
      client.release();
    }
  }

  /**
   * Ensure migrations directory exists
   */
  private async ensureMigrationsDirectory(): Promise<void> {
    try {
      await fs.access(this.config.migrationsDir);
    } catch (error) {
      await fs.mkdir(this.config.migrationsDir, { recursive: true });
      if (this.config.verbose) {
        console.log(`📁 Created migrations directory: ${this.config.migrationsDir}`);
      }
    }
  }

  /**
   * Validate that migrations were applied correctly
   */
  private async validateMigrations(): Promise<void> {
    const client = await this.pool.connect();
    try {
      // Check that the migrations table exists and has entries
      const result = await client.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = $1 AND table_name = $2
      `, [this.config.schema, this.config.migrationsTable]);

      if (parseInt(result.rows[0].count) === 0) {
        throw new Error('Migrations table was not created properly');
      }

      // Verify some core tables exist (basic schema validation)
      const coreTablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('player_accounts', 'game_sessions', 'characters')
      `);

      if (coreTablesResult.rows.length === 0) {
        throw new Error('Core database tables are missing after migration');
      }

      if (this.config.verbose) {
        console.log('✅ Migration validation successful');
      }

    } finally {
      client.release();
    }
  }

  /**
   * Handle migration failures with potential rollback
   */
  private async handleMigrationFailure(error: any): Promise<string[]> {
    const rollbacks: string[] = [];
    
    if (this.config.verbose) {
      console.log('🔄 Attempting migration rollback...');
    }

    // For now, we'll implement a simple rollback strategy
    // In production, you might want more sophisticated rollback logic
    try {
      const configPath = path.join(this.config.migrationsDir, '.rollback-config.json');
      const migrationConfig = {
        'database-url': this.config.databaseUrl,
        'migrations-dir': this.config.migrationsDir,
        'schema': this.config.schema,
        'migrations-table': this.config.migrationsTable,
        'migrations-schema': this.config.schema,
        'verbose': this.config.verbose,
      };

      await fs.writeFile(configPath, JSON.stringify(migrationConfig, null, 2));

      try {
        const nodePgMigratePath = path.join(process.cwd(), 'node_modules', '.bin', 'node-pg-migrate');
        const downCommand = `"${nodePgMigratePath}" down 1 --config-file "${configPath}"`;
        
        const downOutput = execSync(downCommand, { 
          encoding: 'utf8',
          env: { 
            ...process.env,
            DATABASE_URL: this.config.databaseUrl,
          }
        });

        rollbacks.push('Rolled back 1 migration');
        
        if (this.config.verbose) {
          console.log('✅ Rollback completed');
        }

      } finally {
        await fs.unlink(configPath).catch(() => {});
      }

    } catch (rollbackError) {
      if (this.config.verbose) {
        console.error('❌ Rollback failed:', rollbackError);
      }
      throw rollbackError;
    }

    return rollbacks;
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(): Promise<{ applied: string[]; pending: string[] }> {
    try {
      const configPath = path.join(this.config.migrationsDir, '.status-config.json');
      const migrationConfig = {
        'database-url': this.config.databaseUrl,
        'migrations-dir': this.config.migrationsDir,
        'schema': this.config.schema,
        'migrations-table': this.config.migrationsTable,
        'migrations-schema': this.config.schema,
      };

      await fs.writeFile(configPath, JSON.stringify(migrationConfig, null, 2));

      try {
        const nodePgMigratePath = path.join(process.cwd(), 'node_modules', '.bin', 'node-pg-migrate');
        const listCommand = `"${nodePgMigratePath}" list --config-file "${configPath}"`;
        
        const listOutput = execSync(listCommand, { 
          encoding: 'utf8',
          env: { 
            ...process.env,
            DATABASE_URL: this.config.databaseUrl,
          }
        });

        const applied: string[] = [];
        const pending: string[] = [];
        
        const lines = listOutput.split('\n');
        for (const line of lines) {
          if (line.includes('APPLIED') || line.includes('✓')) {
            const match = line.match(/(\d{14}_[\w-]+)/);
            if (match && match[1]) applied.push(match[1]);
          } else if (line.includes('PENDING') || line.includes('○')) {
            const match = line.match(/(\d{14}_[\w-]+)/);
            if (match && match[1]) pending.push(match[1]);
          }
        }

        return { applied, pending };

      } finally {
        await fs.unlink(configPath).catch(() => {});
      }

    } catch (error) {
      console.error('Error getting migration status:', error);
      return { applied: [], pending: [] };
    }
  }

  /**
   * Close database connections
   */
  async close(): Promise<void> {
    await this.pool.end();
  }

  /**
   * Create a new migration file
   */
  async createMigration(name: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const filename = `${timestamp}_${name.replace(/[^a-zA-Z0-9]/g, '_')}.js`;
    const filepath = path.join(this.config.migrationsDir, filename);

    const template = `/**
 * Migration: ${name}
 * Created: ${new Date().toISOString()}
 */

export const up = (pgm) => {
  // Add your migration logic here
  // Example:
  // pgm.createTable('example', {
  //   id: 'id',
  //   name: { type: 'varchar(255)', notNull: true },
  //   created_at: {
  //     type: 'timestamp',
  //     notNull: true,
  //     default: pgm.func('current_timestamp'),
  //   },
  // });
};

export const down = (pgm) => {
  // Add your rollback logic here
  // Example:
  // pgm.dropTable('example');
};
`;

    await fs.writeFile(filepath, template);
    return filename;
  }
}

/**
 * Factory function to create and configure migration runner
 */
export function createMigrationRunner(config?: MigrationConfig): AutomatedMigrationRunner {
  return new AutomatedMigrationRunner(config || {});
}

/**
 * Convenience function for CI/CD environments
 */
export async function runAutomatedMigrations(config?: MigrationConfig): Promise<MigrationResult> {
  const runner = createMigrationRunner(config);
  try {
    return await runner.runMigrations();
  } finally {
    await runner.close();
  }
}