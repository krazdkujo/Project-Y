/**
 * Migration: Core Schema
 * 
 * Creates the foundational database schema for the Tactical ASCII Roguelike:
 * - Players & Accounts
 * - Game Sessions & Multiplayer
 * - Characters & Progression
 * - Skill System (34 Skills)
 * - Item System (180+ Items)  
 * - Abilities System (175+ Abilities)
 * - Guild System
 * - Performance Indexes
 */

exports.up = (pgm) => {
  // Enable required extensions
  pgm.createExtension('uuid-ossp', { ifNotExists: true });
  pgm.createExtension('pg_trgm', { ifNotExists: true });

  // ========================================
  // PLAYERS & ACCOUNTS
  // ========================================

  // Player accounts (linked to Supabase auth.users)
  pgm.createTable('player_accounts', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    user_id: {
      type: 'uuid',
      references: 'auth.users(id)',
      onDelete: 'CASCADE',
    },
    username: {
      type: 'text',
      unique: true,
      notNull: true,
      check: 'char_length(username) >= 3 AND char_length(username) <= 20 AND username ~ \'^[a-zA-Z0-9_-]+$\'',
    },
    display_name: {
      type: 'text',
      check: 'char_length(display_name) <= 50',
    },
    total_playtime_minutes: {
      type: 'integer',
      default: 0,
      check: 'total_playtime_minutes >= 0',
    },
    characters_created: {
      type: 'integer',
      default: 0,
      check: 'characters_created >= 0',
    },
    characters_lost: {
      type: 'integer',
      default: 0,
      check: 'characters_lost >= 0',
    },
    account_created_at: {
      type: 'timestamptz',
      default: pgm.func('NOW()'),
    },
    last_active_at: {
      type: 'timestamptz',
      default: pgm.func('NOW()'),
    },
    is_active: {
      type: 'boolean',
      default: true,
    },
    preferences: {
      type: 'jsonb',
      default: '{}',
    },
  });

  // Enable RLS
  pgm.sql('ALTER TABLE public.player_accounts ENABLE ROW LEVEL SECURITY');

  // ========================================
  // GAME SESSIONS & MULTIPLAYER
  // ========================================

  // Game sessions (up to 8 players)
  pgm.createTable('game_sessions', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    session_name: {
      type: 'text',
      notNull: true,
      check: 'char_length(session_name) >= 1 AND char_length(session_name) <= 100',
    },
    host_player_id: {
      type: 'uuid',
      references: 'public.player_accounts(id)',
      onDelete: 'CASCADE',
    },
    max_players: {
      type: 'integer',
      default: 8,
      check: 'max_players >= 1 AND max_players <= 8',
    },
    current_players: {
      type: 'integer',
      default: 0,
      check: 'current_players >= 0 AND current_players <= max_players',
    },
    session_status: {
      type: 'text',
      default: 'lobby',
      check: 'session_status IN (\'lobby\', \'active\', \'paused\', \'completed\', \'abandoned\')',
    },
    difficulty_level: {
      type: 'text',
      default: 'normal',
      check: 'difficulty_level IN (\'easy\', \'normal\', \'hard\', \'elite\', \'nightmare\')',
    },
    dungeon_floor: {
      type: 'integer',
      default: 1,
      check: 'dungeon_floor >= 1',
    },
    turn_timer_seconds: {
      type: 'integer',
      default: 10,
      check: 'turn_timer_seconds >= 5 AND turn_timer_seconds <= 30',
    },
    created_at: {
      type: 'timestamptz',
      default: pgm.func('NOW()'),
    },
    started_at: {
      type: 'timestamptz',
    },
    completed_at: {
      type: 'timestamptz',
    },
    session_config: {
      type: 'jsonb',
      default: '{}',
    },
  });

  // Enable RLS
  pgm.sql('ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY');

  // Session participants (player membership in sessions)
  pgm.createTable('session_participants', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    session_id: {
      type: 'uuid',
      references: 'public.game_sessions(id)',
      onDelete: 'CASCADE',
    },
    player_id: {
      type: 'uuid',
      references: 'public.player_accounts(id)',
      onDelete: 'CASCADE',
    },
    character_id: {
      type: 'uuid', // Will reference characters table
    },
    joined_at: {
      type: 'timestamptz',
      default: pgm.func('NOW()'),
    },
    left_at: {
      type: 'timestamptz',
    },
    is_active: {
      type: 'boolean',
      default: true,
    },
    turn_order: {
      type: 'integer',
      check: 'turn_order >= 1 AND turn_order <= 8',
    },
    player_status: {
      type: 'text',
      default: 'alive',
      check: 'player_status IN (\'alive\', \'unconscious\', \'dead\', \'soul_departed\', \'disconnected\')',
    },
  });

  // Add unique constraints
  pgm.addConstraint('session_participants', 'unique_session_player', {
    unique: ['session_id', 'player_id'],
  });
  pgm.addConstraint('session_participants', 'unique_session_turn_order', {
    unique: ['session_id', 'turn_order'],
  });

  // Enable RLS
  pgm.sql('ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY');

  // ========================================
  // CHARACTERS & PROGRESSION
  // ========================================

  // Player characters
  pgm.createTable('characters', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    player_id: {
      type: 'uuid',
      references: 'public.player_accounts(id)',
      onDelete: 'CASCADE',
    },
    character_name: {
      type: 'text',
      notNull: true,
      check: 'char_length(character_name) >= 2 AND char_length(character_name) <= 30 AND character_name ~ \'^[a-zA-Z0-9 _-]+$\'',
    },
    current_health: {
      type: 'integer',
      default: 50,
      check: 'current_health >= 0',
    },
    max_health: {
      type: 'integer',
      default: 50,
      check: 'max_health > 0',
    },
    current_mana: {
      type: 'integer',
      default: 25,
      check: 'current_mana >= 0',
    },
    max_mana: {
      type: 'integer',
      default: 25,
      check: 'max_mana >= 0',
    },
    action_points: {
      type: 'integer',
      default: 8,
      check: 'action_points >= 0 AND action_points <= 12',
    },
    max_action_points: {
      type: 'integer',
      default: 8,
      check: 'max_action_points >= 6 AND max_action_points <= 12',
    },
    position_x: {
      type: 'integer',
      default: 0,
    },
    position_y: {
      type: 'integer',
      default: 0,
    },
    facing_direction: {
      type: 'text',
      default: 'north',
      check: 'facing_direction IN (\'north\', \'south\', \'east\', \'west\', \'northeast\', \'northwest\', \'southeast\', \'southwest\')',
    },
    character_status: {
      type: 'text',
      default: 'alive',
      check: 'character_status IN (\'alive\', \'unconscious\', \'dead\', \'soul_departed\')',
    },
    death_count: {
      type: 'integer',
      default: 0,
      check: 'death_count >= 0',
    },
    created_at: {
      type: 'timestamptz',
      default: pgm.func('NOW()'),
    },
    last_played_at: {
      type: 'timestamptz',
      default: pgm.func('NOW()'),
    },
    total_playtime_minutes: {
      type: 'integer',
      default: 0,
      check: 'total_playtime_minutes >= 0',
    },
    is_permadead: {
      type: 'boolean',
      default: false,
    },
    character_data: {
      type: 'jsonb',
      default: '{}',
    },
  });

  // Add additional constraints
  pgm.addConstraint('characters', 'health_constraints', {
    check: 'current_health <= max_health',
  });
  pgm.addConstraint('characters', 'mana_constraints', {
    check: 'current_mana <= max_mana',
  });
  pgm.addConstraint('characters', 'ap_constraints', {
    check: 'action_points <= max_action_points',
  });

  // Enable RLS
  pgm.sql('ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY');

  // ========================================
  // SKILL SYSTEM (34 Skills)
  // ========================================

  // Skill definitions (static reference data)
  pgm.createTable('skills', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    skill_name: {
      type: 'text',
      unique: true,
      notNull: true,
    },
    skill_category: {
      type: 'text',
      notNull: true,
      check: 'skill_category IN (\'weapon\', \'armor\', \'magic\', \'combat\', \'crafting\', \'passive\')',
    },
    skill_type: {
      type: 'text',
      notNull: true,
    },
    description: {
      type: 'text',
      notNull: true,
    },
    max_level: {
      type: 'integer',
      default: 100,
      check: 'max_level > 0',
    },
    base_training_cost: {
      type: 'integer',
      default: 100,
      check: 'base_training_cost > 0',
    },
    is_active: {
      type: 'boolean',
      default: true,
    },
    skill_order: {
      type: 'integer',
      unique: true,
    },
  });

  // Enable RLS
  pgm.sql('ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY');

  // Character skill progression
  pgm.createTable('character_skills', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    character_id: {
      type: 'uuid',
      references: 'public.characters(id)',
      onDelete: 'CASCADE',
    },
    skill_id: {
      type: 'uuid',
      references: 'public.skills(id)',
      onDelete: 'CASCADE',
    },
    current_level: {
      type: 'integer',
      default: 0,
      check: 'current_level >= 0 AND current_level <= 100',
    },
    experience_points: {
      type: 'integer',
      default: 0,
      check: 'experience_points >= 0',
    },
    experience_to_next: {
      type: 'integer',
      default: 100,
      check: 'experience_to_next > 0',
    },
    times_used: {
      type: 'integer',
      default: 0,
      check: 'times_used >= 0',
    },
    last_trained_at: {
      type: 'timestamptz',
      default: pgm.func('NOW()'),
    },
    training_modifier: {
      type: 'decimal(3,2)',
      default: 1.00,
      check: 'training_modifier > 0',
    },
  });

  // Add unique constraint
  pgm.addConstraint('character_skills', 'unique_character_skill', {
    unique: ['character_id', 'skill_id'],
  });

  // Enable RLS
  pgm.sql('ALTER TABLE public.character_skills ENABLE ROW LEVEL SECURITY');

  // ========================================
  // ITEM SYSTEM (180+ Items)
  // ========================================

  // Item templates (static reference data)
  pgm.createTable('item_templates', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    item_name: {
      type: 'text',
      unique: true,
      notNull: true,
    },
    item_type: {
      type: 'text',
      notNull: true,
      check: 'item_type IN (\'weapon\', \'armor\', \'shield\', \'consumable\', \'material\', \'tool\', \'treasure\')',
    },
    item_subtype: {
      type: 'text',
      notNull: true,
    },
    item_quality: {
      type: 'text',
      default: 'common',
      check: 'item_quality IN (\'poor\', \'common\', \'uncommon\', \'rare\', \'epic\', \'legendary\', \'artifact\')',
    },
    base_value: {
      type: 'integer',
      default: 1,
      check: 'base_value > 0',
    },
    weight: {
      type: 'decimal(5,2)',
      default: 1.0,
      check: 'weight >= 0',
    },
    durability: {
      type: 'integer',
      default: 100,
      check: 'durability >= 0',
    },
    required_skills: {
      type: 'jsonb',
      default: '[]',
    },
    stat_modifiers: {
      type: 'jsonb',
      default: '{}',
    },
    special_properties: {
      type: 'jsonb',
      default: '{}',
    },
    description: {
      type: 'text',
    },
    ascii_symbol: {
      type: 'char(1)',
      default: '?',
      check: 'ascii_symbol ~ \'^[!-~]$\'',
    },
    color_code: {
      type: 'text',
      default: '#FFFFFF',
    },
    is_stackable: {
      type: 'boolean',
      default: false,
    },
    max_stack_size: {
      type: 'integer',
      default: 1,
      check: 'max_stack_size > 0',
    },
    is_active: {
      type: 'boolean',
      default: true,
    },
    item_order: {
      type: 'integer',
    },
  });

  // Enable RLS
  pgm.sql('ALTER TABLE public.item_templates ENABLE ROW LEVEL SECURITY');

  // Character inventory
  pgm.createTable('character_inventory', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    character_id: {
      type: 'uuid',
      references: 'public.characters(id)',
      onDelete: 'CASCADE',
    },
    item_template_id: {
      type: 'uuid',
      references: 'public.item_templates(id)',
      onDelete: 'CASCADE',
    },
    quantity: {
      type: 'integer',
      default: 1,
      check: 'quantity > 0',
    },
    current_durability: {
      type: 'integer',
      check: 'current_durability >= 0',
    },
    is_equipped: {
      type: 'boolean',
      default: false,
    },
    equipment_slot: {
      type: 'text',
      check: 'equipment_slot IN (\'main_hand\', \'off_hand\', \'head\', \'chest\', \'legs\', \'feet\', \'ring1\', \'ring2\', \'neck\', \'back\')',
    },
    custom_properties: {
      type: 'jsonb',
      default: '{}',
    },
    acquired_at: {
      type: 'timestamptz',
      default: pgm.func('NOW()'),
    },
  });

  // Add unique constraint for equipment slots
  pgm.addConstraint('character_inventory', 'unique_equipment_slot', {
    unique: ['character_id', 'equipment_slot'],
    deferrable: true,
    deferred: true,
  });

  // Enable RLS
  pgm.sql('ALTER TABLE public.character_inventory ENABLE ROW LEVEL SECURITY');

  // ========================================
  // ABILITIES SYSTEM (175+ Abilities)
  // ========================================

  // Ability definitions (static reference data)
  pgm.createTable('abilities', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    ability_name: {
      type: 'text',
      unique: true,
      notNull: true,
    },
    ability_category: {
      type: 'text',
      notNull: true,
      check: 'ability_category IN (\'combat\', \'magic\', \'stealth\', \'utility\', \'crafting\', \'leadership\', \'passive\')',
    },
    ability_type: {
      type: 'text',
      notNull: true,
      check: 'ability_type IN (\'active\', \'passive\', \'reactive\', \'toggle\')',
    },
    ap_cost: {
      type: 'integer',
      default: 0,
      check: 'ap_cost >= 0 AND ap_cost <= 12',
    },
    mana_cost: {
      type: 'integer',
      default: 0,
      check: 'mana_cost >= 0',
    },
    cooldown_turns: {
      type: 'integer',
      default: 0,
      check: 'cooldown_turns >= 0',
    },
    cast_time_ticks: {
      type: 'integer',
      default: 1,
      check: 'cast_time_ticks >= 0',
    },
    range_tiles: {
      type: 'integer',
      default: 1,
      check: 'range_tiles >= 0',
    },
    area_of_effect: {
      type: 'integer',
      default: 0,
      check: 'area_of_effect >= 0',
    },
    required_skills: {
      type: 'jsonb',
      notNull: true,
      default: '[]',
    },
    required_equipment: {
      type: 'jsonb',
      default: '[]',
    },
    forbidden_equipment: {
      type: 'jsonb',
      default: '[]',
    },
    skill_scaling: {
      type: 'jsonb',
      default: '{}',
    },
    base_effects: {
      type: 'jsonb',
      default: '{}',
    },
    description: {
      type: 'text',
      notNull: true,
    },
    is_active: {
      type: 'boolean',
      default: true,
    },
    ability_order: {
      type: 'integer',
    },
  });

  // Add constraint for valid costs
  pgm.addConstraint('abilities', 'valid_costs', {
    check: 'ap_cost > 0 OR mana_cost > 0 OR ability_type = \'passive\'',
  });

  // Enable RLS
  pgm.sql('ALTER TABLE public.abilities ENABLE ROW LEVEL SECURITY');

  // Character learned abilities
  pgm.createTable('character_abilities', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    character_id: {
      type: 'uuid',
      references: 'public.characters(id)',
      onDelete: 'CASCADE',
    },
    ability_id: {
      type: 'uuid',
      references: 'public.abilities(id)',
      onDelete: 'CASCADE',
    },
    learned_at: {
      type: 'timestamptz',
      default: pgm.func('NOW()'),
    },
    times_used: {
      type: 'integer',
      default: 0,
      check: 'times_used >= 0',
    },
    last_used_at: {
      type: 'timestamptz',
    },
    hotkey_slot: {
      type: 'integer',
      check: 'hotkey_slot >= 1 AND hotkey_slot <= 12',
    },
    is_available: {
      type: 'boolean',
      default: true,
    },
    mastery_level: {
      type: 'integer',
      default: 1,
      check: 'mastery_level >= 1 AND mastery_level <= 10',
    },
  });

  // Add unique constraints
  pgm.addConstraint('character_abilities', 'unique_character_ability', {
    unique: ['character_id', 'ability_id'],
  });
  pgm.addConstraint('character_abilities', 'unique_character_hotkey', {
    unique: ['character_id', 'hotkey_slot'],
  });

  // Enable RLS
  pgm.sql('ALTER TABLE public.character_abilities ENABLE ROW LEVEL SECURITY');

  // ========================================
  // GUILD SYSTEM
  // ========================================

  // Guilds (8-player cooperation hubs)
  pgm.createTable('guilds', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    guild_name: {
      type: 'text',
      unique: true,
      notNull: true,
      check: 'char_length(guild_name) >= 3 AND char_length(guild_name) <= 50 AND guild_name ~ \'^[a-zA-Z0-9 _-]+$\'',
    },
    guild_description: {
      type: 'text',
      check: 'char_length(guild_description) <= 500',
    },
    leader_player_id: {
      type: 'uuid',
      references: 'public.player_accounts(id)',
      onDelete: 'CASCADE',
    },
    max_members: {
      type: 'integer',
      default: 8,
      check: 'max_members >= 1 AND max_members <= 8',
    },
    current_members: {
      type: 'integer',
      default: 1,
      check: 'current_members >= 0 AND current_members <= max_members',
    },
    guild_level: {
      type: 'integer',
      default: 1,
      check: 'guild_level >= 1',
    },
    guild_experience: {
      type: 'integer',
      default: 0,
      check: 'guild_experience >= 0',
    },
    guild_treasury: {
      type: 'integer',
      default: 0,
      check: 'guild_treasury >= 0',
    },
    created_at: {
      type: 'timestamptz',
      default: pgm.func('NOW()'),
    },
    guild_config: {
      type: 'jsonb',
      default: '{}',
    },
    is_active: {
      type: 'boolean',
      default: true,
    },
  });

  // Enable RLS
  pgm.sql('ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY');

  // Guild memberships
  pgm.createTable('guild_members', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    guild_id: {
      type: 'uuid',
      references: 'public.guilds(id)',
      onDelete: 'CASCADE',
    },
    player_id: {
      type: 'uuid',
      references: 'public.player_accounts(id)',
      onDelete: 'CASCADE',
    },
    member_role: {
      type: 'text',
      default: 'member',
      check: 'member_role IN (\'leader\', \'officer\', \'member\')',
    },
    joined_at: {
      type: 'timestamptz',
      default: pgm.func('NOW()'),
    },
    contribution_points: {
      type: 'integer',
      default: 0,
      check: 'contribution_points >= 0',
    },
    last_active_at: {
      type: 'timestamptz',
      default: pgm.func('NOW()'),
    },
    member_status: {
      type: 'text',
      default: 'active',
      check: 'member_status IN (\'active\', \'inactive\', \'suspended\')',
    },
  });

  // Add unique constraint
  pgm.addConstraint('guild_members', 'unique_guild_player', {
    unique: ['guild_id', 'player_id'],
  });

  // Enable RLS
  pgm.sql('ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY');

  // Guild shared storage
  pgm.createTable('guild_storage', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    guild_id: {
      type: 'uuid',
      references: 'public.guilds(id)',
      onDelete: 'CASCADE',
    },
    item_template_id: {
      type: 'uuid',
      references: 'public.item_templates(id)',
      onDelete: 'CASCADE',
    },
    quantity: {
      type: 'integer',
      default: 1,
      check: 'quantity > 0',
    },
    contributed_by: {
      type: 'uuid',
      references: 'public.player_accounts(id)',
    },
    contributed_at: {
      type: 'timestamptz',
      default: pgm.func('NOW()'),
    },
    storage_type: {
      type: 'text',
      default: 'vault',
      check: 'storage_type IN (\'vault\', \'crafting\', \'consumables\')',
    },
    access_level: {
      type: 'text',
      default: 'all',
      check: 'access_level IN (\'leader\', \'officer\', \'all\')',
    },
    custom_properties: {
      type: 'jsonb',
      default: '{}',
    },
  });

  // Enable RLS
  pgm.sql('ALTER TABLE public.guild_storage ENABLE ROW LEVEL SECURITY');

  // ========================================
  // INDEXES FOR PERFORMANCE
  // ========================================

  // Player accounts indexes
  pgm.createIndex('player_accounts', 'user_id', { name: 'idx_player_accounts_user_id' });
  pgm.createIndex('player_accounts', 'username', { name: 'idx_player_accounts_username' });
  pgm.createIndex('player_accounts', 'is_active', { 
    name: 'idx_player_accounts_active',
    where: 'is_active = TRUE'
  });

  // Game sessions indexes
  pgm.createIndex('game_sessions', 'host_player_id', { name: 'idx_game_sessions_host' });
  pgm.createIndex('game_sessions', 'session_status', { name: 'idx_game_sessions_status' });
  pgm.createIndex('game_sessions', 'session_status', { 
    name: 'idx_game_sessions_active',
    where: 'session_status IN (\'lobby\', \'active\')'
  });

  // Session participants indexes
  pgm.createIndex('session_participants', 'session_id', { name: 'idx_session_participants_session' });
  pgm.createIndex('session_participants', 'player_id', { name: 'idx_session_participants_player' });
  pgm.createIndex('session_participants', ['session_id', 'is_active'], { 
    name: 'idx_session_participants_active',
    where: 'is_active = TRUE'
  });

  // Characters indexes
  pgm.createIndex('characters', 'player_id', { name: 'idx_characters_player' });
  pgm.createIndex('characters', ['player_id', 'is_permadead'], { 
    name: 'idx_characters_active',
    where: 'is_permadead = FALSE'
  });
  pgm.createIndex('characters', ['position_x', 'position_y'], { name: 'idx_characters_position' });

  // Character skills indexes
  pgm.createIndex('character_skills', 'character_id', { name: 'idx_character_skills_character' });
  pgm.createIndex('character_skills', 'skill_id', { name: 'idx_character_skills_skill' });
  pgm.createIndex('character_skills', ['character_id', 'current_level'], { name: 'idx_character_skills_level' });

  // Character inventory indexes
  pgm.createIndex('character_inventory', 'character_id', { name: 'idx_character_inventory_character' });
  pgm.createIndex('character_inventory', ['character_id', 'is_equipped'], { 
    name: 'idx_character_inventory_equipped',
    where: 'is_equipped = TRUE'
  });
  pgm.createIndex('character_inventory', 'item_template_id', { name: 'idx_character_inventory_item' });

  // Character abilities indexes
  pgm.createIndex('character_abilities', 'character_id', { name: 'idx_character_abilities_character' });
  pgm.createIndex('character_abilities', 'ability_id', { name: 'idx_character_abilities_ability' });
  pgm.createIndex('character_abilities', ['character_id', 'hotkey_slot'], { name: 'idx_character_abilities_hotkey' });

  // Guild indexes
  pgm.createIndex('guilds', 'leader_player_id', { name: 'idx_guilds_leader' });
  pgm.createIndex('guilds', 'is_active', { 
    name: 'idx_guilds_active',
    where: 'is_active = TRUE'
  });
  pgm.createIndex('guild_members', 'guild_id', { name: 'idx_guild_members_guild' });
  pgm.createIndex('guild_members', 'player_id', { name: 'idx_guild_members_player' });
  pgm.createIndex('guild_storage', 'guild_id', { name: 'idx_guild_storage_guild' });

  // Text search indexes using GIN
  pgm.createIndex('player_accounts', 'username', { 
    name: 'idx_player_accounts_username_trgm',
    method: 'gin',
    opclass: { username: 'gin_trgm_ops' }
  });
  pgm.createIndex('guilds', 'guild_name', { 
    name: 'idx_guilds_name_trgm',
    method: 'gin',
    opclass: { guild_name: 'gin_trgm_ops' }
  });

  // ========================================
  // COMMENTS FOR DOCUMENTATION
  // ========================================

  pgm.sql('COMMENT ON TABLE public.player_accounts IS \'Player account data linked to Supabase auth, tracks overall progress and preferences\'');
  pgm.sql('COMMENT ON TABLE public.game_sessions IS \'Active and historical game sessions supporting up to 8 players with turn-based mechanics\'');
  pgm.sql('COMMENT ON TABLE public.session_participants IS \'Player participation in game sessions with turn order and status tracking\'');
  pgm.sql('COMMENT ON TABLE public.characters IS \'Individual character instances with stats, position, and progression data\'');
  pgm.sql('COMMENT ON TABLE public.skills IS \'Static skill definitions for the 34-skill system\'');
  pgm.sql('COMMENT ON TABLE public.character_skills IS \'Character skill progression with experience and training tracking\'');
  pgm.sql('COMMENT ON TABLE public.item_templates IS \'Static item definitions for 180+ items with stats and properties\'');
  pgm.sql('COMMENT ON TABLE public.character_inventory IS \'Character item ownership and equipment state\'');
  pgm.sql('COMMENT ON TABLE public.abilities IS \'Static ability definitions for 175+ abilities with requirements and costs\'');
  pgm.sql('COMMENT ON TABLE public.character_abilities IS \'Character learned abilities with usage tracking and hotkey assignments\'');
  pgm.sql('COMMENT ON TABLE public.guilds IS \'Guild organizations for 8-player cooperation and resource sharing\'');
  pgm.sql('COMMENT ON TABLE public.guild_members IS \'Guild membership with roles and contribution tracking\'');
  pgm.sql('COMMENT ON TABLE public.guild_storage IS \'Shared guild storage for collaborative item management\'');

  // Set table replica identity for real-time subscriptions
  pgm.sql('ALTER TABLE public.game_sessions REPLICA IDENTITY FULL');
  pgm.sql('ALTER TABLE public.session_participants REPLICA IDENTITY FULL');
  pgm.sql('ALTER TABLE public.characters REPLICA IDENTITY FULL');
  pgm.sql('ALTER TABLE public.character_skills REPLICA IDENTITY FULL');
  pgm.sql('ALTER TABLE public.character_inventory REPLICA IDENTITY FULL');
  pgm.sql('ALTER TABLE public.character_abilities REPLICA IDENTITY FULL');
};

exports.down = (pgm) => {
  // Drop tables in reverse order of creation to handle dependencies
  pgm.dropTable('guild_storage', { cascade: true });
  pgm.dropTable('guild_members', { cascade: true });
  pgm.dropTable('guilds', { cascade: true });
  pgm.dropTable('character_abilities', { cascade: true });
  pgm.dropTable('abilities', { cascade: true });
  pgm.dropTable('character_inventory', { cascade: true });
  pgm.dropTable('item_templates', { cascade: true });
  pgm.dropTable('character_skills', { cascade: true });
  pgm.dropTable('skills', { cascade: true });
  pgm.dropTable('characters', { cascade: true });
  pgm.dropTable('session_participants', { cascade: true });
  pgm.dropTable('game_sessions', { cascade: true });
  pgm.dropTable('player_accounts', { cascade: true });

  // Drop extensions if needed (usually not recommended in production)
  // pgm.dropExtension('pg_trgm', { ifExists: true });
  // pgm.dropExtension('uuid-ossp', { ifExists: true });
};