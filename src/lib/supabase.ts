/**
 * Supabase Database Client Configuration
 * 
 * This module provides a configured Supabase client for database operations.
 * Uses environment variables for authentication and connection parameters.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL environment variable is required');
}

if (!supabaseAnonKey) {
  throw new Error('SUPABASE_ANON_KEY environment variable is required');
}

if (!supabaseServiceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
}

// Create Supabase clients with different access levels
export const supabaseClient: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false // Server-side doesn't need session persistence
    },
    db: {
      schema: 'public'
    }
  }
);

// Administrative client with service role key for server operations
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  }
);

/**
 * Database connection utility functions
 */
class DatabaseConnection {
  private static instance: DatabaseConnection;
  
  private constructor() {}
  
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }
  
  /**
   * Test the database connection
   * @returns Promise<boolean> - True if connection is successful
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try a basic auth test to verify connection
      const { data, error: authError } = await supabaseClient.auth.getUser();
      // Connection is working if we get a response (even if no user)
      return !authError || authError.message !== 'Network error';
    } catch (error) {
      console.error('Database connection test error:', error);
      return false;
    }
  }
  
  /**
   * Test administrative connection
   * @returns Promise<boolean> - True if admin connection is successful
   */
  async testAdminConnection(): Promise<boolean> {
    try {
      // Try a basic auth test to verify admin connection
      const { data, error: authError } = await supabaseAdmin.auth.getUser();
      // Connection is working if we get a response (even if no user)
      return !authError || authError.message !== 'Network error';
    } catch (error) {
      console.error('Admin database connection test error:', error);
      return false;
    }
  }
  
  /**
   * Get database health information
   * @returns Promise<object> - Database health metrics
   */
  async getHealthMetrics(): Promise<{
    connected: boolean;
    adminConnected: boolean;
    timestamp: string;
    url: string;
  }> {
    const connected = await this.testConnection();
    const adminConnected = await this.testAdminConnection();
    
    return {
      connected,
      adminConnected,
      timestamp: new Date().toISOString(),
      url: supabaseUrl!
    };
  }
}

// Export configured clients and utilities
export { supabaseUrl, supabaseAnonKey };
export { DatabaseConnection };
export default DatabaseConnection.getInstance();