#!/usr/bin/env node

/**
 * Database Migration Script for Tactical ASCII Roguelike
 * 
 * This script executes SQL migrations against the configured Supabase instance.
 * Migrations are executed in order and results are logged for verification.
 */

const fs = require('fs').promises;
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class DatabaseMigrator {
  constructor() {
    this.validateEnvironment();
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    this.migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    this.policiesDir = path.join(__dirname, '..', 'supabase', 'policies');
    this.seedDir = path.join(__dirname, '..', 'supabase', 'seed-data');
    
    this.migrationResults = {
      executed: [],
      failed: [],
      skipped: []
    };
  }
  
  validateEnvironment() {
    const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      this.logError(`Missing required environment variables: ${missing.join(', ')}`);
      process.exit(1);
    }
  }
  
  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }
  
  logInfo(message) {
    this.log(`ℹ️  ${message}`, colors.cyan);
  }
  
  logSuccess(message) {
    this.log(`✅ ${message}`, colors.green);
  }
  
  logWarning(message) {
    this.log(`⚠️  ${message}`, colors.yellow);
  }
  
  logError(message) {
    this.log(`❌ ${message}`, colors.red);
  }
  
  logHeader(message) {
    const border = '='.repeat(60);
    this.log(`\n${border}`, colors.bright);
    this.log(`${message}`, colors.bright);
    this.log(`${border}`, colors.bright);
  }
  
  async testConnection() {
    this.logInfo('Testing database connection...');
    
    try {
      // Test basic connection with a simple RPC call
      const { data, error } = await this.supabase.rpc('sql', { 
        query: 'SELECT current_database(), current_user, version()' 
      });
      
      if (error) {
        throw error;
      }
      
      this.logSuccess(`Connected to Supabase: ${process.env.SUPABASE_URL}`);
      if (data && data.length > 0) {
        this.logInfo(`Database: ${data[0].current_database || 'unknown'}`);
      }
      return true;
    } catch (error) {
      this.logError(`Database connection failed: ${error.message}`);
      return false;
    }
  }
  
  async readSqlFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return content.trim();
    } catch (error) {
      throw new Error(`Failed to read ${filePath}: ${error.message}`);
    }
  }
  
  async executeSqlFile(filePath, description) {
    this.logInfo(`Executing: ${description}`);
    
    try {
      const sql = await this.readSqlFile(filePath);
      
      if (!sql) {
        this.logWarning(`Empty SQL file: ${path.basename(filePath)}`);
        this.migrationResults.skipped.push({ file: filePath, reason: 'Empty file' });
        return true;
      }
      
      // Execute the entire SQL file as one operation
      try {
        const { data, error } = await this.supabase.rpc('sql', { query: sql });
        
        if (error) {
          // Some errors are expected (like table already exists)
          if (this.isExpectedError(error.message)) {
            this.logWarning(`Expected condition: ${error.message}`);
            this.migrationResults.executed.push({ 
              file: filePath, 
              description,
              warning: error.message
            });
            return true;
          } else {
            throw error;
          }
        }
        
        this.logSuccess(`${description} completed successfully`);
        this.migrationResults.executed.push({ 
          file: filePath, 
          description
        });
        return true;
        
      } catch (sqlError) {
        if (this.isExpectedError(sqlError.message)) {
          this.logWarning(`Expected condition: ${sqlError.message}`);
          this.migrationResults.executed.push({ 
            file: filePath, 
            description,
            warning: sqlError.message
          });
          return true;
        } else {
          throw sqlError;
        }
      }
      
    } catch (error) {
      this.logError(`Failed to execute ${description}: ${error.message}`);
      this.migrationResults.failed.push({ 
        file: filePath, 
        description, 
        error: error.message 
      });
      return false;
    }
  }
  
  isExpectedError(errorMessage) {
    const expectedErrors = [
      'already exists',
      'does not exist',
      'extension "uuid-ossp" already exists',
      'extension "pg_trgm" already exists',
      'publication "supabase_realtime" already exists'
    ];
    
    return expectedErrors.some(expected => 
      errorMessage.toLowerCase().includes(expected.toLowerCase())
    );
  }
  
  async getMigrationFiles() {
    try {
      const files = await fs.readdir(this.migrationsDir);
      return files
        .filter(file => file.endsWith('.sql'))
        .sort() // Ensure proper ordering (001_, 002_, etc.)
        .map(file => ({
          path: path.join(this.migrationsDir, file),
          description: `Migration: ${file.replace('.sql', '').replace(/^\d+_/, '')}`
        }));
    } catch (error) {
      this.logError(`Failed to read migrations directory: ${error.message}`);
      return [];
    }
  }
  
  async getPolicyFiles() {
    try {
      const files = await fs.readdir(this.policiesDir);
      return files
        .filter(file => file.endsWith('.sql'))
        .sort()
        .map(file => ({
          path: path.join(this.policiesDir, file),
          description: `Security Policies: ${file.replace('.sql', '').replace(/^\d+_/, '')}`
        }));
    } catch (error) {
      this.logWarning(`Policies directory not accessible: ${error.message}`);
      return [];
    }
  }
  
  async getSeedFiles() {
    try {
      const files = await fs.readdir(this.seedDir);
      return files
        .filter(file => file.endsWith('.sql'))
        .sort()
        .map(file => ({
          path: path.join(this.seedDir, file),
          description: `Seed Data: ${file.replace('.sql', '').replace(/^\d+_/, '')}`
        }));
    } catch (error) {
      this.logWarning(`Seed data directory not accessible: ${error.message}`);
      return [];
    }
  }
  
  
  async verifyTables() {
    this.logInfo('Verifying created tables...');
    
    try {
      const { data: tables, error } = await this.supabase.rpc('sql', { 
        query: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          ORDER BY table_name
        `
      });
      
      if (error) {
        throw error;
      }
      
      const expectedTables = [
        'player_accounts',
        'game_sessions',
        'session_participants',
        'characters',
        'skills',
        'character_skills',
        'item_templates',
        'character_inventory',
        'abilities',
        'character_abilities',
        'guilds',
        'guild_members',
        'guild_storage',
        'performance_logs'
      ];
      
      const createdTables = tables.map(t => t.table_name);
      const missingTables = expectedTables.filter(table => 
        !createdTables.includes(table)
      );
      
      if (missingTables.length > 0) {
        this.logWarning(`Missing tables: ${missingTables.join(', ')}`);
      }
      
      this.logSuccess(`Database contains ${createdTables.length} tables`);
      this.log(`Tables: ${createdTables.join(', ')}`, colors.blue);
      
      return { created: createdTables, missing: missingTables };
      
    } catch (error) {
      this.logError(`Table verification failed: ${error.message}`);
      return { created: [], missing: [] };
    }
  }
  
  async testBasicOperations() {
    this.logInfo('Testing basic CRUD operations...');
    
    try {
      // Test core tables exist and are accessible
      const testTables = ['game_sessions', 'characters', 'skills', 'abilities', 'item_templates'];
      let accessibleTables = 0;
      
      for (const table of testTables) {
        try {
          const { data, error } = await this.supabase.rpc('sql', {
            query: `SELECT COUNT(*) as count FROM ${table} LIMIT 1`
          });
          
          if (!error) {
            accessibleTables++;
            this.logInfo(`✓ Table '${table}' is accessible`);
          }
        } catch (e) {
          this.logWarning(`✗ Table '${table}' not accessible: ${e.message}`);
        }
      }
      
      this.logSuccess(`${accessibleTables}/${testTables.length} core tables accessible`);
      return accessibleTables > 0;
      
    } catch (error) {
      this.logError(`Basic operations test failed: ${error.message}`);
      return false;
    }
  }
  
  generateReport() {
    this.logHeader('MIGRATION SUMMARY REPORT');
    
    const { executed, failed, skipped } = this.migrationResults;
    
    this.log(`📊 Total Migrations: ${executed.length + failed.length + skipped.length}`, colors.bright);
    this.logSuccess(`✅ Successful: ${executed.length}`);
    
    if (failed.length > 0) {
      this.logError(`❌ Failed: ${failed.length}`);
      failed.forEach(item => {
        this.log(`   • ${item.description}: ${item.error || 'Multiple statement failures'}`, colors.red);
      });
    }
    
    if (skipped.length > 0) {
      this.logWarning(`⏭️  Skipped: ${skipped.length}`);
      skipped.forEach(item => {
        this.log(`   • ${path.basename(item.file)}: ${item.reason}`, colors.yellow);
      });
    }
    
    if (executed.length > 0) {
      this.log('\n📋 Successfully Executed:', colors.green);
      executed.forEach(item => {
        this.log(`   • ${item.description} (${item.statements || 0} statements)`, colors.green);
      });
    }
    
    const success = failed.length === 0;
    
    this.log('\n' + '='.repeat(60), colors.bright);
    if (success) {
      this.logSuccess('🎉 DATABASE MIGRATION COMPLETED SUCCESSFULLY!');
      this.log('The Supabase database is ready for the tactical roguelike game.', colors.green);
    } else {
      this.logError('💥 MIGRATION COMPLETED WITH ERRORS');
      this.log('Please review the failed migrations and fix any issues.', colors.red);
    }
    this.log('='.repeat(60), colors.bright);
    
    return success;
  }
  
  async run() {
    this.logHeader('SUPABASE DATABASE MIGRATION');
    this.log(`Target: ${process.env.SUPABASE_URL}`, colors.cyan);
    
    // Test connection
    const connected = await this.testConnection();
    if (!connected) {
      process.exit(1);
    }
    
    // Ready to execute migrations
    
    // Execute migrations
    this.logHeader('EXECUTING MIGRATIONS');
    const migrationFiles = await this.getMigrationFiles();
    
    if (migrationFiles.length === 0) {
      this.logWarning('No migration files found');
    } else {
      for (const file of migrationFiles) {
        await this.executeSqlFile(file.path, file.description);
      }
    }
    
    // Execute RLS policies
    this.logHeader('APPLYING SECURITY POLICIES');
    const policyFiles = await this.getPolicyFiles();
    
    for (const file of policyFiles) {
      await this.executeSqlFile(file.path, file.description);
    }
    
    // Verify database state
    this.logHeader('VERIFICATION');
    await this.verifyTables();
    await this.testBasicOperations();
    
    // Optional: Execute seed data (commented out by default)
    // this.logHeader('SEEDING DATABASE');
    // const seedFiles = await this.getSeedFiles();
    // for (const file of seedFiles) {
    //   await this.executeSqlFile(file.path, file.description);
    // }
    
    // Generate final report
    const success = this.generateReport();
    
    process.exit(success ? 0 : 1);
  }
}

// Execute migration if called directly
if (require.main === module) {
  const migrator = new DatabaseMigrator();
  migrator.run().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

module.exports = DatabaseMigrator;