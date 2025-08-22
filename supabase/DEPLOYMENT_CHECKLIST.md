# Supabase Deployment Checklist for Tactical ASCII Roguelike

## Pre-Deployment Setup

### 1. Supabase Project Configuration

- [ ] Create Supabase project at [supabase.com](https://supabase.com)
- [ ] Configure project settings:
  - [ ] Set project name: "Tactical ASCII Roguelike"
  - [ ] Choose appropriate region for your users
  - [ ] Configure database password (save securely)
- [ ] Note project URL and API keys
- [ ] Configure custom domain (if needed)

### 2. Environment Variables

Create and configure environment variables:

```bash
# Development (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres

# Production (.env.production)
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key
DATABASE_URL=postgresql://postgres:[password]@db.[prod-project].supabase.co:5432/postgres
```

## Database Deployment

### 3. Schema Migration

Execute SQL files in this exact order:

- [ ] **Step 1**: Run `migrations/001_core_schema.sql`
  - Creates all tables, constraints, and basic indexes
  - Enables RLS on all tables
  - Sets up extensions and core relationships
  
- [ ] **Step 2**: Run `migrations/002_triggers_functions.sql`
  - Creates all database functions and triggers
  - Sets up automatic stat calculations
  - Enables skill progression automation
  
- [ ] **Step 3**: Run `policies/001_rls_policies.sql`
  - Applies Row Level Security policies
  - Creates security helper functions
  - Sets up optimized RLS indexes
  
- [ ] **Step 4**: Run `real-time/realtime_config.sql`
  - Configures real-time publications
  - Sets up broadcast functions
  - Creates real-time event triggers
  
- [ ] **Step 5**: Run `indexes/performance_indexes.sql`
  - Creates comprehensive performance indexes
  - Sets up covering indexes for read optimization
  - Enables concurrent index creation

### 4. Seed Data

- [ ] **Step 6**: Run `seed-data/001_skills_data.sql`
  - Inserts all 34 skills with balanced progression
  - Sets up skill synergies and milestones
  - Creates skill categories and metadata

### 5. Verification Queries

Run these queries to verify successful deployment:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify skills are loaded
SELECT COUNT(*) as skill_count FROM public.skills;
-- Should return 34

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- Verify indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- Test functions
SELECT calculate_experience_to_next(25, 100);
-- Should return calculated experience value

-- Verify real-time setup
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

## Authentication & Security

### 6. Authentication Configuration

- [ ] Configure auth settings in Supabase dashboard:
  - [ ] Enable email confirmations (recommended for production)
  - [ ] Set redirect URLs for your domain
  - [ ] Configure session timeout (default: 7 days)
  - [ ] Enable additional providers if needed (Google, Discord, etc.)

### 7. Security Settings

- [ ] Review RLS policies are correctly applied
- [ ] Test user permissions with test accounts
- [ ] Verify API keys are properly restricted
- [ ] Enable database webhooks if needed
- [ ] Configure IP restrictions (if required)

### 8. Performance Configuration

- [ ] Review and adjust database settings:
  - [ ] Connection pooling: Set appropriate pool size (default: 15)
  - [ ] Statement timeout: 15 seconds for game queries
  - [ ] Work memory: Increase for complex queries if needed
  - [ ] Shared buffers: Default should be sufficient

## Real-time Configuration

### 9. Real-time Settings

- [ ] Configure real-time settings in dashboard:
  - [ ] Max connections per IP: 50 (adjust based on needs)
  - [ ] Events per second: 10 (game default)
  - [ ] Enable presence tracking
  - [ ] Configure broadcast authorization

### 10. Testing Real-time

Test real-time functionality:

```sql
-- Test broadcast function
SELECT realtime.broadcast_changes(
  'test_channel',
  'INSERT',
  'test_event', 
  'test_table',
  'public',
  '{"test": "data"}'::jsonb,
  NULL
);
```

## Application Integration

### 11. Client Integration

- [ ] Install Supabase JavaScript client: `npm install @supabase/supabase-js`
- [ ] Create Supabase client configuration
- [ ] Set up authentication flow
- [ ] Test database connections
- [ ] Implement real-time subscriptions

### 12. Testing Integration

Test these core functions:

- [ ] User registration and login
- [ ] Character creation
- [ ] Skill progression
- [ ] Item management
- [ ] Session creation and joining
- [ ] Real-time updates during gameplay
- [ ] Guild functionality

## Monitoring & Maintenance

### 13. Monitoring Setup

- [ ] Configure monitoring in Supabase dashboard:
  - [ ] Database performance metrics
  - [ ] API usage monitoring
  - [ ] Real-time connection monitoring
  - [ ] Error log alerts

### 14. Backup Strategy

- [ ] Configure automatic daily backups
- [ ] Test backup restoration process
- [ ] Set up point-in-time recovery
- [ ] Document recovery procedures

### 15. Maintenance Tasks

Set up these recurring maintenance tasks:

```sql
-- Weekly: Analyze database statistics
SELECT maintain_game_indexes();

-- Daily: Cleanup old logs
SELECT cleanup_performance_logs();
SELECT cleanup_realtime_messages();

-- Monthly: Cleanup inactive sessions
SELECT cleanup_inactive_sessions();
```

## Performance Optimization

### 16. Database Optimization

- [ ] Run `ANALYZE` on all tables after initial data load
- [ ] Monitor slow query log for optimization opportunities
- [ ] Review index usage with `analyze_index_usage()` function
- [ ] Set up query performance monitoring

### 17. Connection Optimization

- [ ] Configure connection pooling for high-traffic scenarios
- [ ] Implement database connection retry logic
- [ ] Set up read replicas if needed (Supabase Pro)
- [ ] Monitor connection pool utilization

## Production Readiness

### 18. Security Hardening

- [ ] Review all RLS policies for security gaps
- [ ] Test with different user roles and permissions
- [ ] Validate API key restrictions
- [ ] Enable audit logging (Supabase Pro)
- [ ] Set up intrusion detection if needed

### 19. Scalability Preparation

- [ ] Review database limits for your Supabase plan
- [ ] Plan for horizontal scaling strategies
- [ ] Set up database monitoring alerts
- [ ] Document scaling procedures

### 20. Documentation

- [ ] Document database schema and relationships
- [ ] Create API documentation for custom functions
- [ ] Document deployment procedures
- [ ] Create troubleshooting guide
- [ ] Document monitoring and maintenance procedures

## Deployment Verification

### 21. Final Testing

Complete end-to-end testing:

- [ ] Create test user accounts
- [ ] Test complete character creation flow
- [ ] Verify skill progression works correctly
- [ ] Test item equipping and inventory management
- [ ] Create and join game sessions
- [ ] Verify real-time updates work properly
- [ ] Test guild creation and management
- [ ] Verify all database functions work correctly

### 22. Performance Testing

- [ ] Test with multiple concurrent users
- [ ] Verify real-time performance under load
- [ ] Test database query performance
- [ ] Monitor memory and CPU usage
- [ ] Test backup and recovery procedures

## Post-Deployment

### 23. Go-Live Checklist

- [ ] Switch to production environment variables
- [ ] Update DNS records if using custom domain
- [ ] Monitor error logs for first 24 hours
- [ ] Verify all real-time subscriptions work
- [ ] Check database performance metrics
- [ ] Confirm backup systems are working

### 24. Ongoing Maintenance

Set up regular maintenance schedule:

- **Daily**: Monitor error logs and performance metrics
- **Weekly**: Review slow queries and optimize if needed
- **Monthly**: Run database maintenance functions
- **Quarterly**: Review and update security policies

## Troubleshooting

### Common Issues

1. **RLS Policies Not Working**
   - Verify policies are applied: `SELECT * FROM pg_policies`
   - Check user authentication
   - Review policy conditions

2. **Real-time Not Working**
   - Verify publication setup: `SELECT * FROM pg_publication_tables`
   - Check channel subscriptions
   - Review browser console for errors

3. **Slow Queries**
   - Run `EXPLAIN ANALYZE` on slow queries
   - Check index usage with `analyze_index_usage()`
   - Review and optimize RLS policies

4. **Connection Issues**
   - Check connection pooling settings
   - Verify environment variables
   - Review database logs

### Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- Database framework GitHub repository (if applicable)

---

**Deployment Status**: ☐ Not Started ☐ In Progress ☐ Complete ☐ Verified

**Deployed By**: _________________ **Date**: _________________

**Production URL**: _________________________________

**Notes**: ________________________________________________