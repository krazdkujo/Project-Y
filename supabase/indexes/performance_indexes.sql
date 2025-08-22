-- ========================================
-- TACTICAL ASCII ROGUELIKE - PERFORMANCE INDEXES
-- ========================================
-- Version: 1.0
-- Database: Supabase PostgreSQL
-- Purpose: Comprehensive indexing strategy for optimal game query performance
-- ========================================

-- ========================================
-- CORE ENTITY INDEXES
-- ========================================

-- Player accounts performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_player_accounts_lookup 
ON public.player_accounts(user_id, is_active) 
WHERE is_active = TRUE;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_player_accounts_username_search
ON public.player_accounts USING gin(username gin_trgm_ops)
WHERE is_active = TRUE;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_player_accounts_activity
ON public.player_accounts(last_active_at DESC)
WHERE is_active = TRUE;

-- ========================================
-- GAME SESSION INDEXES
-- ========================================

-- Session discovery and joining
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_sessions_joinable
ON public.game_sessions(session_status, current_players, max_players, created_at DESC)
WHERE session_status IN ('lobby', 'active') AND current_players < max_players;

-- Session management by host
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_sessions_host_management
ON public.game_sessions(host_player_id, session_status, created_at DESC)
WHERE session_status IN ('lobby', 'active', 'paused');

-- Session difficulty filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_sessions_difficulty
ON public.game_sessions(difficulty_level, session_status, current_players)
WHERE session_status IN ('lobby', 'active');

-- Active session monitoring
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_sessions_active_monitoring
ON public.game_sessions(session_status, started_at, turn_timer_seconds)
WHERE session_status = 'active';

-- ========================================
-- SESSION PARTICIPANT INDEXES
-- ========================================

-- Session participant lookup (most common query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_participants_lookup
ON public.session_participants(session_id, is_active, player_id)
WHERE is_active = TRUE;

-- Turn order management
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_participants_turn_order
ON public.session_participants(session_id, turn_order, is_active)
WHERE is_active = TRUE;

-- Player session history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_participants_player_history
ON public.session_participants(player_id, joined_at DESC, session_id);

-- Character session mapping (critical for real-time)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_participants_character_mapping
ON public.session_participants(character_id, session_id, is_active)
WHERE is_active = TRUE AND character_id IS NOT NULL;

-- ========================================
-- CHARACTER INDEXES
-- ========================================

-- Character ownership and status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_characters_player_active
ON public.characters(player_id, is_permadead, last_played_at DESC)
WHERE is_permadead = FALSE;

-- Character positioning (for game map queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_characters_position
ON public.characters(position_x, position_y, character_status)
WHERE character_status IN ('alive', 'unconscious');

-- Character health monitoring (for critical alerts)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_characters_health_critical
ON public.characters(current_health, max_health, character_status)
WHERE character_status = 'alive' AND current_health < max_health;

-- Character action points (for turn management)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_characters_action_points
ON public.characters(action_points, max_action_points, character_status)
WHERE character_status = 'alive';

-- ========================================
-- SKILL SYSTEM INDEXES
-- ========================================

-- Skill reference data (static)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_skills_category_lookup
ON public.skills(skill_category, skill_name, is_active)
WHERE is_active = TRUE;

-- Skill order for UI display
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_skills_display_order
ON public.skills(skill_order, skill_category)
WHERE is_active = TRUE;

-- Character skill progression (most frequently queried)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_skills_progression
ON public.character_skills(character_id, current_level DESC, experience_points DESC);

-- Skill level filtering for abilities
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_skills_level_filter
ON public.character_skills(skill_id, current_level, character_id)
WHERE current_level > 0;

-- Skill training tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_skills_training
ON public.character_skills(character_id, last_trained_at DESC, times_used DESC);

-- High-level skill lookup (for class qualification)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_skills_high_level
ON public.character_skills(character_id, skill_id, current_level)
WHERE current_level >= 25;

-- ========================================
-- ITEM SYSTEM INDEXES
-- ========================================

-- Item template lookup by type and quality
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_item_templates_type_quality
ON public.item_templates(item_type, item_quality, is_active)
WHERE is_active = TRUE;

-- Item template search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_item_templates_search
ON public.item_templates USING gin(item_name gin_trgm_ops)
WHERE is_active = TRUE;

-- Item template ordering for UI
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_item_templates_display
ON public.item_templates(item_type, item_order, item_name)
WHERE is_active = TRUE;

-- Character inventory management
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_inventory_management
ON public.character_inventory(character_id, is_equipped, equipment_slot);

-- Equipped items lookup (performance critical)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_inventory_equipped
ON public.character_inventory(character_id, equipment_slot, item_template_id)
WHERE is_equipped = TRUE;

-- Inventory item search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_inventory_item_lookup
ON public.character_inventory(item_template_id, character_id, quantity);

-- Durability monitoring
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_inventory_durability
ON public.character_inventory(character_id, current_durability, item_template_id)
WHERE current_durability IS NOT NULL AND current_durability < 100;

-- ========================================
-- ABILITY SYSTEM INDEXES
-- ========================================

-- Ability lookup by category and type
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_abilities_category_type
ON public.abilities(ability_category, ability_type, is_active)
WHERE is_active = TRUE;

-- Ability cost analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_abilities_costs
ON public.abilities(ap_cost, mana_cost, ability_category)
WHERE is_active = TRUE;

-- Ability display ordering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_abilities_display_order
ON public.abilities(ability_order, ability_category)
WHERE is_active = TRUE;

-- Character ability management
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_abilities_management
ON public.character_abilities(character_id, is_available, learned_at DESC);

-- Hotkey slot management
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_abilities_hotkeys
ON public.character_abilities(character_id, hotkey_slot, ability_id)
WHERE hotkey_slot IS NOT NULL;

-- Ability usage tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_abilities_usage
ON public.character_abilities(character_id, times_used DESC, last_used_at DESC);

-- Ability mastery tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_abilities_mastery
ON public.character_abilities(character_id, mastery_level DESC, ability_id);

-- ========================================
-- GUILD SYSTEM INDEXES
-- ========================================

-- Guild discovery and search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guilds_discovery
ON public.guilds(is_active, current_members, max_members, guild_level DESC)
WHERE is_active = TRUE AND current_members < max_members;

-- Guild search by name
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guilds_search
ON public.guilds USING gin(guild_name gin_trgm_ops)
WHERE is_active = TRUE;

-- Guild leadership
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guilds_leadership
ON public.guilds(leader_player_id, is_active, created_at DESC)
WHERE is_active = TRUE;

-- Guild member management
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guild_members_management
ON public.guild_members(guild_id, member_status, member_role, joined_at DESC)
WHERE member_status = 'active';

-- Player guild membership
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guild_members_player_lookup
ON public.guild_members(player_id, member_status, guild_id)
WHERE member_status = 'active';

-- Guild officer lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guild_members_officers
ON public.guild_members(guild_id, member_role, player_id)
WHERE member_role IN ('leader', 'officer') AND member_status = 'active';

-- Guild storage management
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guild_storage_management
ON public.guild_storage(guild_id, storage_type, access_level, contributed_at DESC);

-- Guild storage by item
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guild_storage_items
ON public.guild_storage(item_template_id, guild_id, quantity);

-- Guild contribution tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guild_storage_contributions
ON public.guild_storage(contributed_by, contributed_at DESC, guild_id);

-- ========================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- ========================================

-- Session + character + participant lookup (critical for game state)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_character_participant
ON public.session_participants(session_id, character_id, player_id, turn_order, is_active)
WHERE is_active = TRUE;

-- Character equipment + skill combination
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_equipment_skills
ON public.character_inventory(character_id, is_equipped, item_template_id)
WHERE is_equipped = TRUE;

-- Ability requirements checking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ability_skill_requirements
ON public.character_skills(character_id, skill_id, current_level)
WHERE current_level > 0;

-- Guild member + player combined lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guild_member_player_combined
ON public.guild_members(guild_id, player_id, member_role, member_status, last_active_at DESC)
WHERE member_status = 'active';

-- ========================================
-- REAL-TIME SPECIFIC INDEXES
-- ========================================

-- Real-time session changes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_realtime_session_changes
ON public.characters(id, player_id) 
INCLUDE (position_x, position_y, current_health, action_points);

-- Real-time inventory changes  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_realtime_inventory_changes
ON public.character_inventory(character_id, is_equipped, equipment_slot)
INCLUDE (item_template_id, quantity);

-- Real-time skill progression
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_realtime_skill_changes
ON public.character_skills(character_id, skill_id)
INCLUDE (current_level, experience_points);

-- ========================================
-- PARTIAL INDEXES FOR SPECIFIC SCENARIOS
-- ========================================

-- Active game sessions only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_partial_active_sessions
ON public.game_sessions(created_at DESC, current_players)
WHERE session_status = 'active';

-- Available characters only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_partial_available_characters
ON public.characters(player_id, last_played_at DESC)
WHERE is_permadead = FALSE AND character_status = 'alive';

-- Active guild members only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_partial_active_guild_members
ON public.guild_members(guild_id, joined_at DESC)
WHERE member_status = 'active';

-- High-level characters (for matchmaking)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_partial_high_level_characters
ON public.characters(player_id, total_playtime_minutes DESC)
WHERE is_permadead = FALSE;

-- ========================================
-- EXPRESSION INDEXES
-- ========================================

-- Character total skill levels (for matchmaking)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_total_skill_level
ON public.characters((
    SELECT COALESCE(SUM(current_level), 0) 
    FROM public.character_skills cs 
    WHERE cs.character_id = characters.id
));

-- Guild activity score
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guild_activity_score
ON public.guilds((current_members * guild_level + guild_experience / 1000))
WHERE is_active = TRUE;

-- Character equipment value
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_equipment_value
ON public.characters((
    SELECT COALESCE(SUM(it.base_value * ci.quantity), 0)
    FROM public.character_inventory ci
    JOIN public.item_templates it ON ci.item_template_id = it.id
    WHERE ci.character_id = characters.id AND ci.is_equipped = TRUE
));

-- ========================================
-- COVERING INDEXES FOR READ OPTIMIZATION
-- ========================================

-- Session list with all needed data
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_list_covering
ON public.game_sessions(session_status, current_players, max_players)
INCLUDE (id, session_name, difficulty_level, created_at, host_player_id)
WHERE session_status IN ('lobby', 'active');

-- Character summary with stats
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_character_summary_covering
ON public.characters(player_id, is_permadead)
INCLUDE (id, character_name, current_health, max_health, current_mana, max_mana, action_points)
WHERE is_permadead = FALSE;

-- Guild list with details
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guild_list_covering
ON public.guilds(is_active, current_members, max_members)
INCLUDE (id, guild_name, guild_level, created_at, leader_player_id)
WHERE is_active = TRUE;

-- ========================================
-- MAINTENANCE AND MONITORING
-- ========================================

-- Index usage monitoring function
CREATE OR REPLACE FUNCTION analyze_index_usage()
RETURNS TABLE(
    table_name TEXT,
    index_name TEXT,
    scans BIGINT,
    tuples_read BIGINT,
    tuples_fetched BIGINT,
    size_mb NUMERIC
)
LANGUAGE sql
AS $$
    SELECT 
        schemaname || '.' || tablename as table_name,
        indexname as index_name,
        idx_scan as scans,
        idx_tup_read as tuples_read,
        idx_tup_fetch as tuples_fetched,
        round(pg_relation_size(indexrelid) / 1024.0 / 1024.0, 2) as size_mb
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
    ORDER BY scans DESC, size_mb DESC;
$$;

-- Function to identify unused indexes
CREATE OR REPLACE FUNCTION identify_unused_indexes()
RETURNS TABLE(
    table_name TEXT,
    index_name TEXT,
    size_mb NUMERIC,
    definition TEXT
)
LANGUAGE sql
AS $$
    SELECT 
        schemaname || '.' || tablename as table_name,
        indexname as index_name,
        round(pg_relation_size(indexrelid) / 1024.0 / 1024.0, 2) as size_mb,
        pg_get_indexdef(indexrelid) as definition
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
    AND idx_scan = 0
    AND NOT indisunique
    ORDER BY size_mb DESC;
$$;

-- ========================================
-- INDEX MAINTENANCE SCHEDULE
-- ========================================

-- Function for periodic index maintenance
CREATE OR REPLACE FUNCTION maintain_game_indexes()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    maintenance_log TEXT := '';
BEGIN
    -- Analyze tables to update statistics
    ANALYZE public.player_accounts;
    ANALYZE public.game_sessions;
    ANALYZE public.session_participants;
    ANALYZE public.characters;
    ANALYZE public.character_skills;
    ANALYZE public.character_inventory;
    ANALYZE public.character_abilities;
    ANALYZE public.guilds;
    ANALYZE public.guild_members;
    ANALYZE public.guild_storage;
    
    maintenance_log := 'Analyzed all tables at ' || NOW()::TEXT;
    
    -- Reindex if needed (check for bloat)
    -- This would need additional bloat detection logic in production
    
    RETURN maintenance_log;
END;
$$;

-- ========================================
-- COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON FUNCTION analyze_index_usage IS 'Analyzes index usage patterns to identify performance bottlenecks';
COMMENT ON FUNCTION identify_unused_indexes IS 'Identifies unused indexes that could be candidates for removal';
COMMENT ON FUNCTION maintain_game_indexes IS 'Performs routine maintenance on game database indexes';

-- Index strategy summary
COMMENT ON SCHEMA public IS 'Comprehensive indexing strategy optimized for real-time multiplayer game queries with focus on session management, character progression, and guild operations';

-- ========================================
-- PERFORMANCE TESTING QUERIES
-- ========================================

/*
-- Test queries to validate index performance

-- 1. Session discovery query
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM public.game_sessions 
WHERE session_status = 'lobby' 
AND current_players < max_players 
ORDER BY created_at DESC 
LIMIT 20;

-- 2. Character lookup in session
EXPLAIN (ANALYZE, BUFFERS)
SELECT c.*, cs.current_level, ci.item_template_id
FROM public.characters c
JOIN public.session_participants sp ON sp.character_id = c.id
LEFT JOIN public.character_skills cs ON cs.character_id = c.id
LEFT JOIN public.character_inventory ci ON ci.character_id = c.id AND ci.is_equipped = TRUE
WHERE sp.session_id = 'session-uuid-here'
AND sp.is_active = TRUE;

-- 3. Guild storage access
EXPLAIN (ANALYZE, BUFFERS)
SELECT gs.*, it.item_name, it.item_type
FROM public.guild_storage gs
JOIN public.item_templates it ON gs.item_template_id = it.id
WHERE gs.guild_id = 'guild-uuid-here'
AND gs.access_level = 'all'
ORDER BY gs.contributed_at DESC;

-- 4. Skill progression lookup
EXPLAIN (ANALYZE, BUFFERS)
SELECT s.skill_name, s.skill_category, cs.current_level, cs.experience_points
FROM public.character_skills cs
JOIN public.skills s ON cs.skill_id = s.id
WHERE cs.character_id = 'character-uuid-here'
ORDER BY s.skill_category, s.skill_order;
*/