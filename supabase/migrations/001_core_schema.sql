-- ========================================
-- TACTICAL ASCII ROGUELIKE - CORE SCHEMA
-- ========================================
-- Version: 1.0
-- Database: Supabase PostgreSQL
-- Purpose: Core tables for game entities, players, sessions
-- ========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ========================================
-- PLAYERS & ACCOUNTS
-- ========================================

-- Player accounts (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.player_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
    display_name TEXT CHECK (char_length(display_name) <= 50),
    total_playtime_minutes INTEGER DEFAULT 0 CHECK (total_playtime_minutes >= 0),
    characters_created INTEGER DEFAULT 0 CHECK (characters_created >= 0),
    characters_lost INTEGER DEFAULT 0 CHECK (characters_lost >= 0),
    account_created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    preferences JSONB DEFAULT '{}',
    
    CONSTRAINT valid_username CHECK (username ~ '^[a-zA-Z0-9_-]+$')
);

-- Enable RLS
ALTER TABLE public.player_accounts ENABLE ROW LEVEL SECURITY;

-- ========================================
-- GAME SESSIONS & MULTIPLAYER
-- ========================================

-- Game sessions (up to 8 players)
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_name TEXT NOT NULL CHECK (char_length(session_name) >= 1 AND char_length(session_name) <= 100),
    host_player_id UUID REFERENCES public.player_accounts(id) ON DELETE CASCADE,
    max_players INTEGER DEFAULT 8 CHECK (max_players >= 1 AND max_players <= 8),
    current_players INTEGER DEFAULT 0 CHECK (current_players >= 0 AND current_players <= max_players),
    session_status TEXT DEFAULT 'lobby' CHECK (session_status IN ('lobby', 'active', 'paused', 'completed', 'abandoned')),
    difficulty_level TEXT DEFAULT 'normal' CHECK (difficulty_level IN ('easy', 'normal', 'hard', 'elite', 'nightmare')),
    dungeon_floor INTEGER DEFAULT 1 CHECK (dungeon_floor >= 1),
    turn_timer_seconds INTEGER DEFAULT 10 CHECK (turn_timer_seconds >= 5 AND turn_timer_seconds <= 30),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    session_config JSONB DEFAULT '{}',
    
    CONSTRAINT valid_turn_range CHECK (turn_timer_seconds BETWEEN 5 AND 30)
);

-- Enable RLS
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Session participants (player membership in sessions)
CREATE TABLE IF NOT EXISTS public.session_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    player_id UUID REFERENCES public.player_accounts(id) ON DELETE CASCADE,
    character_id UUID, -- Will reference characters table
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    turn_order INTEGER CHECK (turn_order >= 1 AND turn_order <= 8),
    player_status TEXT DEFAULT 'alive' CHECK (player_status IN ('alive', 'unconscious', 'dead', 'soul_departed', 'disconnected')),
    
    UNIQUE(session_id, player_id),
    UNIQUE(session_id, turn_order)
);

-- Enable RLS
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;

-- ========================================
-- CHARACTERS & PROGRESSION
-- ========================================

-- Player characters
CREATE TABLE IF NOT EXISTS public.characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES public.player_accounts(id) ON DELETE CASCADE,
    character_name TEXT NOT NULL CHECK (char_length(character_name) >= 2 AND char_length(character_name) <= 30),
    current_health INTEGER DEFAULT 50 CHECK (current_health >= 0),
    max_health INTEGER DEFAULT 50 CHECK (max_health > 0),
    current_mana INTEGER DEFAULT 25 CHECK (current_mana >= 0),
    max_mana INTEGER DEFAULT 25 CHECK (max_mana >= 0),
    action_points INTEGER DEFAULT 8 CHECK (action_points >= 0 AND action_points <= 12),
    max_action_points INTEGER DEFAULT 8 CHECK (max_action_points >= 6 AND max_action_points <= 12),
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    facing_direction TEXT DEFAULT 'north' CHECK (facing_direction IN ('north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest')),
    character_status TEXT DEFAULT 'alive' CHECK (character_status IN ('alive', 'unconscious', 'dead', 'soul_departed')),
    death_count INTEGER DEFAULT 0 CHECK (death_count >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_played_at TIMESTAMPTZ DEFAULT NOW(),
    total_playtime_minutes INTEGER DEFAULT 0 CHECK (total_playtime_minutes >= 0),
    is_permadead BOOLEAN DEFAULT FALSE,
    character_data JSONB DEFAULT '{}',
    
    CONSTRAINT valid_character_name CHECK (character_name ~ '^[a-zA-Z0-9 _-]+$'),
    CONSTRAINT health_constraints CHECK (current_health <= max_health),
    CONSTRAINT mana_constraints CHECK (current_mana <= max_mana),
    CONSTRAINT ap_constraints CHECK (action_points <= max_action_points)
);

-- Enable RLS
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- ========================================
-- SKILL SYSTEM (34 Skills)
-- ========================================

-- Skill definitions (static reference data)
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_name TEXT UNIQUE NOT NULL,
    skill_category TEXT NOT NULL CHECK (skill_category IN ('weapon', 'armor', 'magic', 'combat', 'crafting', 'passive')),
    skill_type TEXT NOT NULL,
    description TEXT NOT NULL,
    max_level INTEGER DEFAULT 100 CHECK (max_level > 0),
    base_training_cost INTEGER DEFAULT 100 CHECK (base_training_cost > 0),
    is_active BOOLEAN DEFAULT TRUE,
    skill_order INTEGER,
    
    CONSTRAINT unique_skill_order UNIQUE(skill_order)
);

-- Enable RLS
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- Character skill progression
CREATE TABLE IF NOT EXISTS public.character_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
    current_level INTEGER DEFAULT 0 CHECK (current_level >= 0),
    experience_points INTEGER DEFAULT 0 CHECK (experience_points >= 0),
    experience_to_next INTEGER DEFAULT 100 CHECK (experience_to_next > 0),
    times_used INTEGER DEFAULT 0 CHECK (times_used >= 0),
    last_trained_at TIMESTAMPTZ DEFAULT NOW(),
    training_modifier DECIMAL(3,2) DEFAULT 1.00 CHECK (training_modifier > 0),
    
    UNIQUE(character_id, skill_id),
    CONSTRAINT level_cap CHECK (current_level <= 100)
);

-- Enable RLS
ALTER TABLE public.character_skills ENABLE ROW LEVEL SECURITY;

-- ========================================
-- ITEM SYSTEM (180+ Items)
-- ========================================

-- Item templates (static reference data)
CREATE TABLE IF NOT EXISTS public.item_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_name TEXT UNIQUE NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('weapon', 'armor', 'shield', 'consumable', 'material', 'tool', 'treasure')),
    item_subtype TEXT NOT NULL,
    item_quality TEXT DEFAULT 'common' CHECK (item_quality IN ('poor', 'common', 'uncommon', 'rare', 'epic', 'legendary', 'artifact')),
    base_value INTEGER DEFAULT 1 CHECK (base_value > 0),
    weight DECIMAL(5,2) DEFAULT 1.0 CHECK (weight >= 0),
    durability INTEGER DEFAULT 100 CHECK (durability >= 0),
    required_skills JSONB DEFAULT '[]',
    stat_modifiers JSONB DEFAULT '{}',
    special_properties JSONB DEFAULT '{}',
    description TEXT,
    ascii_symbol CHAR(1) DEFAULT '?',
    color_code TEXT DEFAULT '#FFFFFF',
    is_stackable BOOLEAN DEFAULT FALSE,
    max_stack_size INTEGER DEFAULT 1 CHECK (max_stack_size > 0),
    is_active BOOLEAN DEFAULT TRUE,
    item_order INTEGER,
    
    CONSTRAINT valid_ascii_symbol CHECK (ascii_symbol ~ '^[!-~]$')
);

-- Enable RLS
ALTER TABLE public.item_templates ENABLE ROW LEVEL SECURITY;

-- Character inventory
CREATE TABLE IF NOT EXISTS public.character_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE,
    item_template_id UUID REFERENCES public.item_templates(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    current_durability INTEGER CHECK (current_durability >= 0),
    is_equipped BOOLEAN DEFAULT FALSE,
    equipment_slot TEXT CHECK (equipment_slot IN ('main_hand', 'off_hand', 'head', 'chest', 'legs', 'feet', 'ring1', 'ring2', 'neck', 'back')),
    custom_properties JSONB DEFAULT '{}',
    acquired_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_equipment_slot UNIQUE(character_id, equipment_slot) DEFERRABLE INITIALLY DEFERRED
);

-- Enable RLS
ALTER TABLE public.character_inventory ENABLE ROW LEVEL SECURITY;

-- ========================================
-- ABILITIES SYSTEM (175+ Abilities)
-- ========================================

-- Ability definitions (static reference data)
CREATE TABLE IF NOT EXISTS public.abilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ability_name TEXT UNIQUE NOT NULL,
    ability_category TEXT NOT NULL CHECK (ability_category IN ('combat', 'magic', 'stealth', 'utility', 'crafting', 'leadership', 'passive')),
    ability_type TEXT NOT NULL CHECK (ability_type IN ('active', 'passive', 'reactive', 'toggle')),
    ap_cost INTEGER DEFAULT 0 CHECK (ap_cost >= 0 AND ap_cost <= 12),
    mana_cost INTEGER DEFAULT 0 CHECK (mana_cost >= 0),
    cooldown_turns INTEGER DEFAULT 0 CHECK (cooldown_turns >= 0),
    cast_time_ticks INTEGER DEFAULT 1 CHECK (cast_time_ticks >= 0),
    range_tiles INTEGER DEFAULT 1 CHECK (range_tiles >= 0),
    area_of_effect INTEGER DEFAULT 0 CHECK (area_of_effect >= 0),
    required_skills JSONB NOT NULL DEFAULT '[]',
    required_equipment JSONB DEFAULT '[]',
    forbidden_equipment JSONB DEFAULT '[]',
    skill_scaling JSONB DEFAULT '{}',
    base_effects JSONB DEFAULT '{}',
    description TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    ability_order INTEGER,
    
    CONSTRAINT valid_costs CHECK (ap_cost > 0 OR mana_cost > 0 OR ability_type = 'passive')
);

-- Enable RLS
ALTER TABLE public.abilities ENABLE ROW LEVEL SECURITY;

-- Character learned abilities
CREATE TABLE IF NOT EXISTS public.character_abilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE,
    ability_id UUID REFERENCES public.abilities(id) ON DELETE CASCADE,
    learned_at TIMESTAMPTZ DEFAULT NOW(),
    times_used INTEGER DEFAULT 0 CHECK (times_used >= 0),
    last_used_at TIMESTAMPTZ,
    hotkey_slot INTEGER CHECK (hotkey_slot >= 1 AND hotkey_slot <= 12),
    is_available BOOLEAN DEFAULT TRUE,
    mastery_level INTEGER DEFAULT 1 CHECK (mastery_level >= 1 AND mastery_level <= 10),
    
    UNIQUE(character_id, ability_id),
    UNIQUE(character_id, hotkey_slot)
);

-- Enable RLS
ALTER TABLE public.character_abilities ENABLE ROW LEVEL SECURITY;

-- ========================================
-- GUILD SYSTEM
-- ========================================

-- Guilds (8-player cooperation hubs)
CREATE TABLE IF NOT EXISTS public.guilds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_name TEXT UNIQUE NOT NULL CHECK (char_length(guild_name) >= 3 AND char_length(guild_name) <= 50),
    guild_description TEXT CHECK (char_length(guild_description) <= 500),
    leader_player_id UUID REFERENCES public.player_accounts(id) ON DELETE CASCADE,
    max_members INTEGER DEFAULT 8 CHECK (max_members >= 1 AND max_members <= 8),
    current_members INTEGER DEFAULT 1 CHECK (current_members >= 0 AND current_members <= max_members),
    guild_level INTEGER DEFAULT 1 CHECK (guild_level >= 1),
    guild_experience INTEGER DEFAULT 0 CHECK (guild_experience >= 0),
    guild_treasury INTEGER DEFAULT 0 CHECK (guild_treasury >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    guild_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT valid_guild_name CHECK (guild_name ~ '^[a-zA-Z0-9 _-]+$')
);

-- Enable RLS
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;

-- Guild memberships
CREATE TABLE IF NOT EXISTS public.guild_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id UUID REFERENCES public.guilds(id) ON DELETE CASCADE,
    player_id UUID REFERENCES public.player_accounts(id) ON DELETE CASCADE,
    member_role TEXT DEFAULT 'member' CHECK (member_role IN ('leader', 'officer', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    contribution_points INTEGER DEFAULT 0 CHECK (contribution_points >= 0),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    member_status TEXT DEFAULT 'active' CHECK (member_status IN ('active', 'inactive', 'suspended')),
    
    UNIQUE(guild_id, player_id)
);

-- Enable RLS
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;

-- Guild shared storage
CREATE TABLE IF NOT EXISTS public.guild_storage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id UUID REFERENCES public.guilds(id) ON DELETE CASCADE,
    item_template_id UUID REFERENCES public.item_templates(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    contributed_by UUID REFERENCES public.player_accounts(id),
    contributed_at TIMESTAMPTZ DEFAULT NOW(),
    storage_type TEXT DEFAULT 'vault' CHECK (storage_type IN ('vault', 'crafting', 'consumables')),
    access_level TEXT DEFAULT 'all' CHECK (access_level IN ('leader', 'officer', 'all')),
    custom_properties JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.guild_storage ENABLE ROW LEVEL SECURITY;

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Player accounts indexes
CREATE INDEX IF NOT EXISTS idx_player_accounts_user_id ON public.player_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_player_accounts_username ON public.player_accounts(username);
CREATE INDEX IF NOT EXISTS idx_player_accounts_active ON public.player_accounts(is_active) WHERE is_active = TRUE;

-- Game sessions indexes
CREATE INDEX IF NOT EXISTS idx_game_sessions_host ON public.game_sessions(host_player_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON public.game_sessions(session_status);
CREATE INDEX IF NOT EXISTS idx_game_sessions_active ON public.game_sessions(session_status) WHERE session_status IN ('lobby', 'active');

-- Session participants indexes
CREATE INDEX IF NOT EXISTS idx_session_participants_session ON public.session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_player ON public.session_participants(player_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_active ON public.session_participants(session_id, is_active) WHERE is_active = TRUE;

-- Characters indexes
CREATE INDEX IF NOT EXISTS idx_characters_player ON public.characters(player_id);
CREATE INDEX IF NOT EXISTS idx_characters_active ON public.characters(player_id, is_permadead) WHERE is_permadead = FALSE;
CREATE INDEX IF NOT EXISTS idx_characters_position ON public.characters(position_x, position_y);

-- Character skills indexes
CREATE INDEX IF NOT EXISTS idx_character_skills_character ON public.character_skills(character_id);
CREATE INDEX IF NOT EXISTS idx_character_skills_skill ON public.character_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_character_skills_level ON public.character_skills(character_id, current_level);

-- Character inventory indexes
CREATE INDEX IF NOT EXISTS idx_character_inventory_character ON public.character_inventory(character_id);
CREATE INDEX IF NOT EXISTS idx_character_inventory_equipped ON public.character_inventory(character_id, is_equipped) WHERE is_equipped = TRUE;
CREATE INDEX IF NOT EXISTS idx_character_inventory_item ON public.character_inventory(item_template_id);

-- Character abilities indexes
CREATE INDEX IF NOT EXISTS idx_character_abilities_character ON public.character_abilities(character_id);
CREATE INDEX IF NOT EXISTS idx_character_abilities_ability ON public.character_abilities(ability_id);
CREATE INDEX IF NOT EXISTS idx_character_abilities_hotkey ON public.character_abilities(character_id, hotkey_slot);

-- Guild indexes
CREATE INDEX IF NOT EXISTS idx_guilds_leader ON public.guilds(leader_player_id);
CREATE INDEX IF NOT EXISTS idx_guilds_active ON public.guilds(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_guild_members_guild ON public.guild_members(guild_id);
CREATE INDEX IF NOT EXISTS idx_guild_members_player ON public.guild_members(player_id);
CREATE INDEX IF NOT EXISTS idx_guild_storage_guild ON public.guild_storage(guild_id);

-- Text search indexes
CREATE INDEX IF NOT EXISTS idx_player_accounts_username_trgm ON public.player_accounts USING gin(username gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_guilds_name_trgm ON public.guilds USING gin(guild_name gin_trgm_ops);

-- ========================================
-- COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.player_accounts IS 'Player account data linked to Supabase auth, tracks overall progress and preferences';
COMMENT ON TABLE public.game_sessions IS 'Active and historical game sessions supporting up to 8 players with turn-based mechanics';
COMMENT ON TABLE public.session_participants IS 'Player participation in game sessions with turn order and status tracking';
COMMENT ON TABLE public.characters IS 'Individual character instances with stats, position, and progression data';
COMMENT ON TABLE public.skills IS 'Static skill definitions for the 34-skill system';
COMMENT ON TABLE public.character_skills IS 'Character skill progression with experience and training tracking';
COMMENT ON TABLE public.item_templates IS 'Static item definitions for 180+ items with stats and properties';
COMMENT ON TABLE public.character_inventory IS 'Character item ownership and equipment state';
COMMENT ON TABLE public.abilities IS 'Static ability definitions for 175+ abilities with requirements and costs';
COMMENT ON TABLE public.character_abilities IS 'Character learned abilities with usage tracking and hotkey assignments';
COMMENT ON TABLE public.guilds IS 'Guild organizations for 8-player cooperation and resource sharing';
COMMENT ON TABLE public.guild_members IS 'Guild membership with roles and contribution tracking';
COMMENT ON TABLE public.guild_storage IS 'Shared guild storage for collaborative item management';

-- Set table replica identity for real-time subscriptions
ALTER TABLE public.game_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.session_participants REPLICA IDENTITY FULL;
ALTER TABLE public.characters REPLICA IDENTITY FULL;
ALTER TABLE public.character_skills REPLICA IDENTITY FULL;
ALTER TABLE public.character_inventory REPLICA IDENTITY FULL;
ALTER TABLE public.character_abilities REPLICA IDENTITY FULL;