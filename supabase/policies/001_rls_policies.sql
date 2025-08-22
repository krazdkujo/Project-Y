-- ========================================
-- TACTICAL ASCII ROGUELIKE - ROW LEVEL SECURITY POLICIES
-- ========================================
-- Version: 1.0
-- Database: Supabase PostgreSQL
-- Purpose: Secure multiplayer data access with optimized RLS policies
-- ========================================

-- ========================================
-- SECURITY HELPER FUNCTIONS
-- ========================================

-- Helper function to get user's player account ID
CREATE OR REPLACE FUNCTION get_user_player_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT id FROM public.player_accounts WHERE user_id = (SELECT auth.uid());
$$;

-- Helper function to check if user is in a specific session
CREATE OR REPLACE FUNCTION user_in_session(session_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.session_participants sp
        WHERE sp.session_id = user_in_session.session_id
        AND sp.player_id = get_user_player_id()
        AND sp.is_active = TRUE
    );
$$;

-- Helper function to check if user owns a character
CREATE OR REPLACE FUNCTION user_owns_character(character_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.characters c
        WHERE c.id = user_owns_character.character_id
        AND c.player_id = get_user_player_id()
    );
$$;

-- Helper function to check if user is in same session as character
CREATE OR REPLACE FUNCTION user_in_character_session(character_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.session_participants sp1
        JOIN public.session_participants sp2 ON sp1.session_id = sp2.session_id
        WHERE sp1.character_id = user_in_character_session.character_id
        AND sp2.player_id = get_user_player_id()
        AND sp1.is_active = TRUE
        AND sp2.is_active = TRUE
    );
$$;

-- Helper function to check if user is guild member
CREATE OR REPLACE FUNCTION user_in_guild(guild_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.guild_members gm
        WHERE gm.guild_id = user_in_guild.guild_id
        AND gm.player_id = get_user_player_id()
        AND gm.member_status = 'active'
    );
$$;

-- Helper function to check if user is guild leader or officer
CREATE OR REPLACE FUNCTION user_guild_admin(guild_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.guild_members gm
        WHERE gm.guild_id = user_guild_admin.guild_id
        AND gm.player_id = get_user_player_id()
        AND gm.member_role IN ('leader', 'officer')
        AND gm.member_status = 'active'
    );
$$;

-- ========================================
-- PLAYER ACCOUNTS POLICIES
-- ========================================

-- Players can view their own account
CREATE POLICY "Users can view own account"
ON public.player_accounts
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- Players can update their own account
CREATE POLICY "Users can update own account"
ON public.player_accounts
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Players can create their own account
CREATE POLICY "Users can create own account"
ON public.player_accounts
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Allow public read access to basic player info for matchmaking
CREATE POLICY "Public basic player info"
ON public.player_accounts
FOR SELECT
TO authenticated
USING (TRUE);

-- ========================================
-- GAME SESSIONS POLICIES
-- ========================================

-- Anyone can view active sessions for joining
CREATE POLICY "View active sessions"
ON public.game_sessions
FOR SELECT
TO authenticated
USING (session_status IN ('lobby', 'active'));

-- Session host can update their session
CREATE POLICY "Host can update session"
ON public.game_sessions
FOR UPDATE
TO authenticated
USING (host_player_id = get_user_player_id())
WITH CHECK (host_player_id = get_user_player_id());

-- Any authenticated user can create a session
CREATE POLICY "Users can create sessions"
ON public.game_sessions
FOR INSERT
TO authenticated
WITH CHECK (host_player_id = get_user_player_id());

-- Session participants can view session details
CREATE POLICY "Participants can view session details"
ON public.game_sessions
FOR SELECT
TO authenticated
USING (
    host_player_id = get_user_player_id() OR
    user_in_session(id)
);

-- ========================================
-- SESSION PARTICIPANTS POLICIES
-- ========================================

-- Participants can view other participants in their session
CREATE POLICY "View session participants"
ON public.session_participants
FOR SELECT
TO authenticated
USING (user_in_session(session_id));

-- Users can join sessions (insert themselves)
CREATE POLICY "Users can join sessions"
ON public.session_participants
FOR INSERT
TO authenticated
WITH CHECK (player_id = get_user_player_id());

-- Users can leave sessions (update their own participation)
CREATE POLICY "Users can update own participation"
ON public.session_participants
FOR UPDATE
TO authenticated
USING (player_id = get_user_player_id())
WITH CHECK (player_id = get_user_player_id());

-- Session host can manage all participants
CREATE POLICY "Host can manage participants"
ON public.session_participants
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.game_sessions gs
        WHERE gs.id = session_id
        AND gs.host_player_id = get_user_player_id()
    )
);

-- ========================================
-- CHARACTERS POLICIES
-- ========================================

-- Users can view their own characters
CREATE POLICY "Users can view own characters"
ON public.characters
FOR SELECT
TO authenticated
USING (player_id = get_user_player_id());

-- Users can view characters in their active session
CREATE POLICY "View characters in same session"
ON public.characters
FOR SELECT
TO authenticated
USING (user_in_character_session(id));

-- Users can create their own characters
CREATE POLICY "Users can create characters"
ON public.characters
FOR INSERT
TO authenticated
WITH CHECK (player_id = get_user_player_id());

-- Users can update their own characters
CREATE POLICY "Users can update own characters"
ON public.characters
FOR UPDATE
TO authenticated
USING (player_id = get_user_player_id())
WITH CHECK (player_id = get_user_player_id());

-- Users cannot delete characters (preserve game history)
-- No DELETE policy - characters are marked as permadead instead

-- ========================================
-- SKILLS POLICIES (Static Reference Data)
-- ========================================

-- All authenticated users can read skill definitions
CREATE POLICY "Anyone can read skills"
ON public.skills
FOR SELECT
TO authenticated
USING (is_active = TRUE);

-- Only admins can modify skills (no admin policies in this implementation)

-- ========================================
-- CHARACTER SKILLS POLICIES
-- ========================================

-- Users can view their own character skills
CREATE POLICY "Users can view own character skills"
ON public.character_skills
FOR SELECT
TO authenticated
USING (user_owns_character(character_id));

-- Users can view character skills in their session
CREATE POLICY "View character skills in session"
ON public.character_skills
FOR SELECT
TO authenticated
USING (user_in_character_session(character_id));

-- Users can update their own character skills
CREATE POLICY "Users can update own character skills"
ON public.character_skills
FOR UPDATE
TO authenticated
USING (user_owns_character(character_id))
WITH CHECK (user_owns_character(character_id));

-- System can create character skills (via triggers)
CREATE POLICY "System can create character skills"
ON public.character_skills
FOR INSERT
TO authenticated
WITH CHECK (user_owns_character(character_id));

-- ========================================
-- ITEM TEMPLATES POLICIES (Static Reference Data)
-- ========================================

-- All authenticated users can read item templates
CREATE POLICY "Anyone can read item templates"
ON public.item_templates
FOR SELECT
TO authenticated
USING (is_active = TRUE);

-- ========================================
-- CHARACTER INVENTORY POLICIES
-- ========================================

-- Users can view their own character inventory
CREATE POLICY "Users can view own character inventory"
ON public.character_inventory
FOR SELECT
TO authenticated
USING (user_owns_character(character_id));

-- Users can view equipped items of characters in their session
CREATE POLICY "View equipped items in session"
ON public.character_inventory
FOR SELECT
TO authenticated
USING (
    is_equipped = TRUE AND
    user_in_character_session(character_id)
);

-- Users can manage their own character inventory
CREATE POLICY "Users can manage own character inventory"
ON public.character_inventory
FOR ALL
TO authenticated
USING (user_owns_character(character_id))
WITH CHECK (user_owns_character(character_id));

-- ========================================
-- ABILITIES POLICIES (Static Reference Data)
-- ========================================

-- All authenticated users can read ability definitions
CREATE POLICY "Anyone can read abilities"
ON public.abilities
FOR SELECT
TO authenticated
USING (is_active = TRUE);

-- ========================================
-- CHARACTER ABILITIES POLICIES
-- ========================================

-- Users can view their own character abilities
CREATE POLICY "Users can view own character abilities"
ON public.character_abilities
FOR SELECT
TO authenticated
USING (user_owns_character(character_id));

-- Users can view character abilities in their session (for coordination)
CREATE POLICY "View character abilities in session"
ON public.character_abilities
FOR SELECT
TO authenticated
USING (user_in_character_session(character_id));

-- Users can update their own character abilities (hotkeys, etc.)
CREATE POLICY "Users can update own character abilities"
ON public.character_abilities
FOR UPDATE
TO authenticated
USING (user_owns_character(character_id))
WITH CHECK (user_owns_character(character_id));

-- System can create character abilities (via triggers)
CREATE POLICY "System can create character abilities"
ON public.character_abilities
FOR INSERT
TO authenticated
WITH CHECK (user_owns_character(character_id));

-- ========================================
-- GUILDS POLICIES
-- ========================================

-- All authenticated users can view active guilds
CREATE POLICY "Anyone can view active guilds"
ON public.guilds
FOR SELECT
TO authenticated
USING (is_active = TRUE);

-- Guild leaders can update their guild
CREATE POLICY "Leaders can update guild"
ON public.guilds
FOR UPDATE
TO authenticated
USING (leader_player_id = get_user_player_id())
WITH CHECK (leader_player_id = get_user_player_id());

-- Any authenticated user can create a guild
CREATE POLICY "Users can create guilds"
ON public.guilds
FOR INSERT
TO authenticated
WITH CHECK (leader_player_id = get_user_player_id());

-- ========================================
-- GUILD MEMBERS POLICIES
-- ========================================

-- Guild members can view other members in their guild
CREATE POLICY "Guild members can view other members"
ON public.guild_members
FOR SELECT
TO authenticated
USING (user_in_guild(guild_id));

-- Users can join guilds (insert themselves)
CREATE POLICY "Users can join guilds"
ON public.guild_members
FOR INSERT
TO authenticated
WITH CHECK (player_id = get_user_player_id());

-- Users can leave guilds (update their own membership)
CREATE POLICY "Users can update own membership"
ON public.guild_members
FOR UPDATE
TO authenticated
USING (player_id = get_user_player_id())
WITH CHECK (player_id = get_user_player_id());

-- Guild leaders and officers can manage members
CREATE POLICY "Guild admins can manage members"
ON public.guild_members
FOR UPDATE
TO authenticated
USING (user_guild_admin(guild_id))
WITH CHECK (user_guild_admin(guild_id));

-- Guild leaders and officers can remove members
CREATE POLICY "Guild admins can remove members"
ON public.guild_members
FOR DELETE
TO authenticated
USING (user_guild_admin(guild_id));

-- ========================================
-- GUILD STORAGE POLICIES
-- ========================================

-- Guild members can view guild storage
CREATE POLICY "Guild members can view storage"
ON public.guild_storage
FOR SELECT
TO authenticated
USING (user_in_guild(guild_id));

-- Guild members can add items to storage
CREATE POLICY "Guild members can add to storage"
ON public.guild_storage
FOR INSERT
TO authenticated
WITH CHECK (
    user_in_guild(guild_id) AND
    contributed_by = get_user_player_id()
);

-- Guild members can take items based on access level
CREATE POLICY "Guild members can take from storage"
ON public.guild_storage
FOR DELETE
TO authenticated
USING (
    user_in_guild(guild_id) AND
    (
        access_level = 'all' OR
        (access_level = 'officer' AND user_guild_admin(guild_id)) OR
        (access_level = 'leader' AND EXISTS (
            SELECT 1 FROM public.guild_members gm
            WHERE gm.guild_id = guild_storage.guild_id
            AND gm.player_id = get_user_player_id()
            AND gm.member_role = 'leader'
        ))
    )
);

-- Guild admins can manage storage access levels
CREATE POLICY "Guild admins can manage storage"
ON public.guild_storage
FOR UPDATE
TO authenticated
USING (user_guild_admin(guild_id))
WITH CHECK (user_guild_admin(guild_id));

-- ========================================
-- PERFORMANCE LOGS POLICIES
-- ========================================

-- Only authenticated users can view performance logs (for debugging)
CREATE POLICY "Authenticated users can view performance logs"
ON public.performance_logs
FOR SELECT
TO authenticated
USING (TRUE);

-- System can insert performance logs
CREATE POLICY "System can log performance"
ON public.performance_logs
FOR INSERT
TO authenticated
WITH CHECK (TRUE);

-- ========================================
-- OPTIMIZATIONS FOR RLS PERFORMANCE
-- ========================================

-- Create indexes specifically for RLS policy performance
CREATE INDEX IF NOT EXISTS idx_rls_player_accounts_user_id 
ON public.player_accounts(user_id) 
WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_rls_characters_player_id 
ON public.characters(player_id) 
WHERE is_permadead = FALSE;

CREATE INDEX IF NOT EXISTS idx_rls_session_participants_active
ON public.session_participants(session_id, player_id, is_active) 
WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_rls_guild_members_active
ON public.guild_members(guild_id, player_id, member_status) 
WHERE member_status = 'active';

-- Composite indexes for complex RLS queries
CREATE INDEX IF NOT EXISTS idx_rls_character_session_lookup
ON public.session_participants(character_id, session_id, is_active) 
WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_rls_guild_member_role
ON public.guild_members(guild_id, player_id, member_role, member_status) 
WHERE member_status = 'active';

-- ========================================
-- REAL-TIME PUBLICATION SETUP
-- ========================================

-- Enable real-time for game tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.characters;
ALTER PUBLICATION supabase_realtime ADD TABLE public.character_skills;
ALTER PUBLICATION supabase_realtime ADD TABLE public.character_inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.character_abilities;

-- ========================================
-- COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON FUNCTION get_user_player_id IS 'Security definer function to get authenticated users player account ID';
COMMENT ON FUNCTION user_in_session IS 'Checks if authenticated user is active participant in specified session';
COMMENT ON FUNCTION user_owns_character IS 'Checks if authenticated user owns the specified character';
COMMENT ON FUNCTION user_in_character_session IS 'Checks if authenticated user is in same session as specified character';
COMMENT ON FUNCTION user_in_guild IS 'Checks if authenticated user is active member of specified guild';
COMMENT ON FUNCTION user_guild_admin IS 'Checks if authenticated user is leader or officer of specified guild';

-- Policy summary comment
COMMENT ON SCHEMA public IS 'RLS policies ensure users can only access their own data and data from their active sessions/guilds. Security definer functions optimize policy performance by caching auth.uid() results.';