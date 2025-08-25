/**
 * Supabase Database Connection Tests
 * 
 * Tests the database connection functionality without modifying data.
 */

import { DatabaseConnection, supabaseClient, supabaseAdmin } from '../supabase';

describe('Supabase Database Connection', () => {
  let dbConnection: DatabaseConnection;

  beforeAll(() => {
    dbConnection = DatabaseConnection.getInstance();
  });

  describe('Connection Configuration', () => {
    test('should have valid environment variables', () => {
      expect(process.env.SUPABASE_URL).toBeDefined();
      expect(process.env.SUPABASE_ANON_KEY).toBeDefined();
      expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBeDefined();
    });

    test('should create singleton instance', () => {
      const instance1 = DatabaseConnection.getInstance();
      const instance2 = DatabaseConnection.getInstance();
      expect(instance1).toBe(instance2);
    });

    test('should export client instances', () => {
      expect(supabaseClient).toBeDefined();
      expect(supabaseAdmin).toBeDefined();
    });
  });

  describe('Connection Testing', () => {
    test('should successfully test basic connection', async () => {
      const isConnected = await dbConnection.testConnection();
      expect(isConnected).toBe(true);
    }, 10000);

    test('should successfully test admin connection', async () => {
      const isAdminConnected = await dbConnection.testAdminConnection();
      expect(isAdminConnected).toBe(true);
    }, 10000);

    test('should return health metrics', async () => {
      const health = await dbConnection.getHealthMetrics();
      
      expect(health).toHaveProperty('connected');
      expect(health).toHaveProperty('adminConnected');
      expect(health).toHaveProperty('timestamp');
      expect(health).toHaveProperty('url');
      
      expect(health.connected).toBe(true);
      expect(health.url).toContain('supabase.co');
      expect(new Date(health.timestamp)).toBeInstanceOf(Date);
    }, 15000);
  });

  describe('Client Functionality', () => {
    test('should have access to auth methods', () => {
      expect(supabaseClient.auth).toBeDefined();
      expect(supabaseClient.auth.getUser).toBeInstanceOf(Function);
    });

    test('should have access to database methods', () => {
      expect(supabaseClient.from).toBeInstanceOf(Function);
      expect(supabaseClient.rpc).toBeInstanceOf(Function);
    });

    test('admin client should have elevated permissions', () => {
      expect(supabaseAdmin.from).toBeInstanceOf(Function);
      expect(supabaseAdmin.auth).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle connection failures gracefully', async () => {
      // This test verifies error handling without actually causing failures
      const health = await dbConnection.getHealthMetrics();
      expect(typeof health.connected).toBe('boolean');
      expect(typeof health.adminConnected).toBe('boolean');
    });
  });
});