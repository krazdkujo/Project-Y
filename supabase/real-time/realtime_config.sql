-- ========================================
-- TACTICAL ASCII ROGUELIKE - REAL-TIME CONFIGURATION
-- ========================================
-- Version: 1.0
-- Database: Supabase PostgreSQL
-- Purpose: Configure real-time subscriptions for multiplayer game state
-- ========================================

-- ========================================
-- REAL-TIME PUBLICATIONS
-- ========================================

-- Ensure supabase_realtime publication exists
BEGIN;
  -- Drop publication if it exists to recreate with our tables
  DROP PUBLICATION IF EXISTS supabase_realtime;
  
  -- Create the publication with no tables initially
  CREATE PUBLICATION supabase_realtime;
COMMIT;

-- Add core game tables to real-time publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.characters;
ALTER PUBLICATION supabase_realtime ADD TABLE public.character_skills;
ALTER PUBLICATION supabase_realtime ADD TABLE public.character_inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.character_abilities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.guild_storage;

-- ========================================
-- REAL-TIME BROADCAST POLICIES
-- ========================================

-- Policy to allow authenticated users to receive broadcasts
CREATE POLICY "Authenticated users can receive broadcasts"
ON "realtime"."messages"
FOR SELECT
TO authenticated
USING (TRUE);

-- ========================================
-- REAL-TIME CHANNELS AND TOPICS
-- ========================================

-- Function to generate session channel name
CREATE OR REPLACE FUNCTION get_session_channel(session_id UUID)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT 'game_session:' || session_id::text;
$$;

-- Function to generate guild channel name
CREATE OR REPLACE FUNCTION get_guild_channel(guild_id UUID)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT 'guild:' || guild_id::text;
$$;

-- Function to generate player channel name
CREATE OR REPLACE FUNCTION get_player_channel(player_id UUID)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT 'player:' || player_id::text;
$$;

-- ========================================
-- ADVANCED REAL-TIME TRIGGERS
-- ========================================

-- Enhanced function to broadcast game state changes with detailed payloads
CREATE OR REPLACE FUNCTION broadcast_enhanced_game_state()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    session_id UUID;
    guild_id UUID;
    player_id UUID;
    channel_name TEXT;
    payload JSONB;
    change_type TEXT;
BEGIN
    -- Determine change type and extract relevant IDs
    CASE TG_TABLE_NAME
        WHEN 'characters' THEN
            player_id := COALESCE(NEW.player_id, OLD.player_id);
            
            -- Get session if character is active in one
            SELECT sp.session_id INTO session_id
            FROM public.session_participants sp
            WHERE sp.character_id = COALESCE(NEW.id, OLD.id)
            AND sp.is_active = TRUE;
            
            change_type := 'character_update';
            
        WHEN 'session_participants' THEN
            session_id := COALESCE(NEW.session_id, OLD.session_id);
            player_id := COALESCE(NEW.player_id, OLD.player_id);
            change_type := 'participant_update';
            
        WHEN 'character_skills' THEN
            SELECT c.player_id INTO player_id
            FROM public.characters c
            WHERE c.id = COALESCE(NEW.character_id, OLD.character_id);
            
            -- Get session if character is active
            SELECT sp.session_id INTO session_id
            FROM public.session_participants sp
            WHERE sp.character_id = COALESCE(NEW.character_id, OLD.character_id)
            AND sp.is_active = TRUE;
            
            change_type := 'skill_update';
            
        WHEN 'character_inventory' THEN
            SELECT c.player_id INTO player_id
            FROM public.characters c
            WHERE c.id = COALESCE(NEW.character_id, OLD.character_id);
            
            -- Get session if character is active
            SELECT sp.session_id INTO session_id
            FROM public.session_participants sp
            WHERE sp.character_id = COALESCE(NEW.character_id, OLD.character_id)
            AND sp.is_active = TRUE;
            
            change_type := 'inventory_update';
            
        WHEN 'character_abilities' THEN
            SELECT c.player_id INTO player_id
            FROM public.characters c
            WHERE c.id = COALESCE(NEW.character_id, OLD.character_id);
            
            -- Get session if character is active
            SELECT sp.session_id INTO session_id
            FROM public.session_participants sp
            WHERE sp.character_id = COALESCE(NEW.character_id, OLD.character_id)
            AND sp.is_active = TRUE;
            
            change_type := 'ability_update';
            
        WHEN 'guild_storage' THEN
            guild_id := COALESCE(NEW.guild_id, OLD.guild_id);
            change_type := 'guild_storage_update';
            
        ELSE
            RETURN COALESCE(NEW, OLD);
    END CASE;
    
    -- Build enhanced payload
    payload := jsonb_build_object(
        'event_type', change_type,
        'operation', TG_OP,
        'table', TG_TABLE_NAME,
        'timestamp', extract(epoch from now()),
        'session_id', session_id,
        'guild_id', guild_id,
        'player_id', player_id
    );
    
    -- Add old and new data based on operation
    IF TG_OP = 'DELETE' THEN
        payload := payload || jsonb_build_object('old_record', to_jsonb(OLD));
    ELSIF TG_OP = 'INSERT' THEN
        payload := payload || jsonb_build_object('new_record', to_jsonb(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
        payload := payload || jsonb_build_object(
            'old_record', to_jsonb(OLD),
            'new_record', to_jsonb(NEW),
            'changed_fields', (
                SELECT jsonb_object_agg(key, value)
                FROM jsonb_each(to_jsonb(NEW))
                WHERE value IS DISTINCT FROM (to_jsonb(OLD) -> key)
            )
        );
    END IF;
    
    -- Broadcast to session channel if in session
    IF session_id IS NOT NULL THEN
        PERFORM realtime.broadcast_changes(
            get_session_channel(session_id),
            TG_OP,
            change_type,
            TG_TABLE_NAME,
            TG_TABLE_SCHEMA,
            NEW,
            OLD
        );
    END IF;
    
    -- Broadcast to guild channel if guild operation
    IF guild_id IS NOT NULL THEN
        PERFORM realtime.broadcast_changes(
            get_guild_channel(guild_id),
            TG_OP,
            change_type,
            TG_TABLE_NAME,
            TG_TABLE_SCHEMA,
            NEW,
            OLD
        );
    END IF;
    
    -- Broadcast to player channel for personal updates
    IF player_id IS NOT NULL THEN
        PERFORM realtime.broadcast_changes(
            get_player_channel(player_id),
            TG_OP,
            change_type,
            TG_TABLE_NAME,
            TG_TABLE_SCHEMA,
            NEW,
            OLD
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- ========================================
-- REAL-TIME TRIGGER ASSIGNMENTS
-- ========================================

-- Drop existing basic broadcast triggers
DROP TRIGGER IF EXISTS trigger_broadcast_character_changes ON public.characters;
DROP TRIGGER IF EXISTS trigger_broadcast_participant_changes ON public.session_participants;
DROP TRIGGER IF EXISTS trigger_broadcast_inventory_changes ON public.character_inventory;
DROP TRIGGER IF EXISTS trigger_broadcast_skill_changes ON public.character_skills;

-- Create enhanced real-time triggers
CREATE TRIGGER trigger_realtime_characters
    AFTER INSERT OR UPDATE OR DELETE ON public.characters
    FOR EACH ROW
    EXECUTE FUNCTION broadcast_enhanced_game_state();

CREATE TRIGGER trigger_realtime_participants
    AFTER INSERT OR UPDATE OR DELETE ON public.session_participants
    FOR EACH ROW
    EXECUTE FUNCTION broadcast_enhanced_game_state();

CREATE TRIGGER trigger_realtime_skills
    AFTER INSERT OR UPDATE OR DELETE ON public.character_skills
    FOR EACH ROW
    EXECUTE FUNCTION broadcast_enhanced_game_state();

CREATE TRIGGER trigger_realtime_inventory
    AFTER INSERT OR UPDATE OR DELETE ON public.character_inventory
    FOR EACH ROW
    EXECUTE FUNCTION broadcast_enhanced_game_state();

CREATE TRIGGER trigger_realtime_abilities
    AFTER INSERT OR UPDATE OR DELETE ON public.character_abilities
    FOR EACH ROW
    EXECUTE FUNCTION broadcast_enhanced_game_state();

CREATE TRIGGER trigger_realtime_guild_storage
    AFTER INSERT OR UPDATE OR DELETE ON public.guild_storage
    FOR EACH ROW
    EXECUTE FUNCTION broadcast_enhanced_game_state();

-- ========================================
-- REAL-TIME EVENT TYPES
-- ========================================

-- Create enum for standardized event types
CREATE TYPE realtime_event_type AS ENUM (
    'character_update',
    'participant_update', 
    'skill_update',
    'inventory_update',
    'ability_update',
    'guild_storage_update',
    'turn_start',
    'turn_end',
    'action_performed',
    'damage_dealt',
    'skill_trained',
    'ability_learned',
    'item_equipped',
    'item_unequipped',
    'session_state_change',
    'guild_notification'
);

-- ========================================
-- REAL-TIME HELPER FUNCTIONS FOR CLIENT
-- ========================================

-- Function to get session real-time data
CREATE OR REPLACE FUNCTION get_session_realtime_data(session_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    session_data JSONB;
    participants_data JSONB;
    characters_data JSONB;
BEGIN
    -- Check if user has access to this session
    IF NOT user_in_session(session_id) THEN
        RETURN jsonb_build_object('error', 'Access denied');
    END IF;
    
    -- Get session basic info
    SELECT to_jsonb(gs.*) INTO session_data
    FROM public.game_sessions gs
    WHERE gs.id = session_id;
    
    -- Get participants
    SELECT jsonb_agg(to_jsonb(sp.*)) INTO participants_data
    FROM public.session_participants sp
    WHERE sp.session_id = get_session_realtime_data.session_id
    AND sp.is_active = TRUE;
    
    -- Get character data for participants
    SELECT jsonb_agg(
        jsonb_build_object(
            'character', to_jsonb(c.*),
            'skills', (
                SELECT jsonb_agg(to_jsonb(cs.*))
                FROM public.character_skills cs
                WHERE cs.character_id = c.id
            ),
            'inventory', (
                SELECT jsonb_agg(to_jsonb(ci.*))
                FROM public.character_inventory ci
                WHERE ci.character_id = c.id
                AND ci.is_equipped = TRUE
            ),
            'abilities', (
                SELECT jsonb_agg(to_jsonb(ca.*))
                FROM public.character_abilities ca
                WHERE ca.character_id = c.id
                AND ca.is_available = TRUE
            )
        )
    ) INTO characters_data
    FROM public.characters c
    WHERE EXISTS (
        SELECT 1 FROM public.session_participants sp
        WHERE sp.session_id = get_session_realtime_data.session_id
        AND sp.character_id = c.id
        AND sp.is_active = TRUE
    );
    
    RETURN jsonb_build_object(
        'session', session_data,
        'participants', COALESCE(participants_data, '[]'::jsonb),
        'characters', COALESCE(characters_data, '[]'::jsonb),
        'channel', get_session_channel(session_id),
        'timestamp', extract(epoch from now())
    );
END;
$$;

-- Function to get guild real-time data
CREATE OR REPLACE FUNCTION get_guild_realtime_data(guild_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    guild_data JSONB;
    members_data JSONB;
    storage_data JSONB;
BEGIN
    -- Check if user has access to this guild
    IF NOT user_in_guild(guild_id) THEN
        RETURN jsonb_build_object('error', 'Access denied');
    END IF;
    
    -- Get guild basic info
    SELECT to_jsonb(g.*) INTO guild_data
    FROM public.guilds g
    WHERE g.id = guild_id;
    
    -- Get members
    SELECT jsonb_agg(
        jsonb_build_object(
            'member', to_jsonb(gm.*),
            'player', to_jsonb(pa.*)
        )
    ) INTO members_data
    FROM public.guild_members gm
    JOIN public.player_accounts pa ON gm.player_id = pa.id
    WHERE gm.guild_id = get_guild_realtime_data.guild_id
    AND gm.member_status = 'active';
    
    -- Get storage (limited by access level)
    SELECT jsonb_agg(to_jsonb(gs.*)) INTO storage_data
    FROM public.guild_storage gs
    WHERE gs.guild_id = get_guild_realtime_data.guild_id
    AND (
        gs.access_level = 'all' OR
        (gs.access_level = 'officer' AND user_guild_admin(guild_id)) OR
        (gs.access_level = 'leader' AND EXISTS (
            SELECT 1 FROM public.guild_members gm
            WHERE gm.guild_id = guild_id
            AND gm.player_id = get_user_player_id()
            AND gm.member_role = 'leader'
        ))
    );
    
    RETURN jsonb_build_object(
        'guild', guild_data,
        'members', COALESCE(members_data, '[]'::jsonb),
        'storage', COALESCE(storage_data, '[]'::jsonb),
        'channel', get_guild_channel(guild_id),
        'timestamp', extract(epoch from now())
    );
END;
$$;

-- ========================================
-- REAL-TIME PERFORMANCE OPTIMIZATION
-- ========================================

-- Function to cleanup old broadcast messages (call periodically)
CREATE OR REPLACE FUNCTION cleanup_realtime_messages()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Remove broadcast messages older than 1 hour
    DELETE FROM realtime.messages
    WHERE inserted_at < NOW() - INTERVAL '1 hour';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Index for realtime message cleanup
CREATE INDEX IF NOT EXISTS idx_realtime_messages_cleanup 
ON realtime.messages(inserted_at);

-- ========================================
-- CLIENT-SIDE SUBSCRIPTION HELPERS
-- ========================================

-- These comments provide JavaScript examples for the client-side implementation

/*
// Session real-time subscription example
const sessionChannel = supabase
  .channel(`game_session:${sessionId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'characters',
    filter: `id=in.(${characterIds.join(',')})`
  }, (payload) => {
    handleCharacterUpdate(payload);
  })
  .on('postgres_changes', {
    event: '*',
    schema: 'public', 
    table: 'session_participants',
    filter: `session_id=eq.${sessionId}`
  }, (payload) => {
    handleParticipantUpdate(payload);
  })
  .on('broadcast', {
    event: 'turn_start'
  }, (payload) => {
    handleTurnStart(payload);
  })
  .on('broadcast', {
    event: 'action_performed'
  }, (payload) => {
    handleActionPerformed(payload);
  })
  .subscribe();

// Guild real-time subscription example
const guildChannel = supabase
  .channel(`guild:${guildId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'guild_storage',
    filter: `guild_id=eq.${guildId}`
  }, (payload) => {
    handleStorageUpdate(payload);
  })
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'guild_members', 
    filter: `guild_id=eq.${guildId}`
  }, (payload) => {
    handleMemberUpdate(payload);
  })
  .subscribe();

// Player-specific updates
const playerChannel = supabase
  .channel(`player:${playerId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'character_skills',
    filter: `character_id=in.(${myCharacterIds.join(',')})`
  }, (payload) => {
    handleSkillUpdate(payload);
  })
  .on('broadcast', {
    event: 'skill_trained'
  }, (payload) => {
    handleSkillTrained(payload);
  })
  .subscribe();
*/

-- ========================================
-- COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON FUNCTION get_session_channel IS 'Generates standardized channel name for session real-time subscriptions';
COMMENT ON FUNCTION get_guild_channel IS 'Generates standardized channel name for guild real-time subscriptions';
COMMENT ON FUNCTION get_player_channel IS 'Generates standardized channel name for player-specific real-time subscriptions';
COMMENT ON FUNCTION broadcast_enhanced_game_state IS 'Enhanced broadcast function with detailed payloads and multiple channel routing';
COMMENT ON FUNCTION get_session_realtime_data IS 'Returns complete session data for real-time initialization';
COMMENT ON FUNCTION get_guild_realtime_data IS 'Returns complete guild data for real-time initialization';
COMMENT ON FUNCTION cleanup_realtime_messages IS 'Removes old real-time broadcast messages to maintain performance';

-- Configuration summary
COMMENT ON SCHEMA public IS 'Real-time configuration enables live multiplayer game state synchronization with optimized channel routing and detailed event payloads';