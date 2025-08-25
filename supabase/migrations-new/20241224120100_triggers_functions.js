/**
 * Migration: Triggers & Functions
 * 
 * Creates database functions and triggers for:
 * - Automatic calculations and state management
 * - Business logic enforcement  
 * - Real-time broadcasting
 * - Performance monitoring
 * - Data cleanup automation
 */

exports.up = (pgm) => {
  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  // Function to calculate skill experience required for next level
  pgm.createFunction('calculate_experience_to_next', 
    [
      { name: 'current_level', type: 'INTEGER' },
      { name: 'base_cost', type: 'INTEGER', default: 100 }
    ],
    {
      returns: 'INTEGER',
      language: 'plpgsql',
      behavior: 'IMMUTABLE',
      definition: `
      BEGIN
          -- Exponential scaling: base_cost * (1.1 ^ current_level)
          RETURN FLOOR(base_cost * POWER(1.1, current_level));
      END;`
    }
  );

  // Function to calculate character max health based on skills
  pgm.createFunction('calculate_max_health',
    [{ name: 'character_id', type: 'UUID' }],
    {
      returns: 'INTEGER',
      language: 'plpgsql',
      behavior: 'STABLE',
      definition: `
      DECLARE
          base_health INTEGER := 50;
          health_bonus INTEGER := 0;
          heavy_armor_skill INTEGER;
          athletics_skill INTEGER;
          survival_skill INTEGER;
      BEGIN
          -- Get relevant skill levels
          SELECT 
              COALESCE(MAX(CASE WHEN s.skill_name = 'Heavy_Armor' THEN cs.current_level END), 0),
              COALESCE(MAX(CASE WHEN s.skill_name = 'Athletics' THEN cs.current_level END), 0),
              COALESCE(MAX(CASE WHEN s.skill_name = 'Survival' THEN cs.current_level END), 0)
          INTO heavy_armor_skill, athletics_skill, survival_skill
          FROM public.character_skills cs
          JOIN public.skills s ON cs.skill_id = s.id
          WHERE cs.character_id = calculate_max_health.character_id
          AND s.skill_name IN ('Heavy_Armor', 'Athletics', 'Survival');
          
          -- Calculate health bonuses from skills
          health_bonus := 
              (heavy_armor_skill * 2) +  -- Heavy armor gives 2 health per level
              (athletics_skill * 1) +    -- Athletics gives 1 health per level
              (survival_skill * 1);      -- Survival gives 1 health per level
          
          RETURN base_health + health_bonus;
      END;`
    }
  );

  // Function to calculate character max mana based on magic skills
  pgm.createFunction('calculate_max_mana',
    [{ name: 'character_id', type: 'UUID' }],
    {
      returns: 'INTEGER',
      language: 'plpgsql',
      behavior: 'STABLE',
      definition: `
      DECLARE
          base_mana INTEGER := 25;
          mana_bonus INTEGER := 0;
          total_magic_levels INTEGER;
      BEGIN
          -- Sum all magic school skill levels
          SELECT COALESCE(SUM(cs.current_level), 0)
          INTO total_magic_levels
          FROM public.character_skills cs
          JOIN public.skills s ON cs.skill_id = s.id
          WHERE cs.character_id = calculate_max_mana.character_id
          AND s.skill_category = 'magic';
          
          -- Each magic level gives 1 mana
          mana_bonus := total_magic_levels;
          
          RETURN base_mana + mana_bonus;
      END;`
    }
  );

  // Function to check if character meets ability requirements
  pgm.createFunction('check_ability_requirements',
    [
      { name: 'character_id', type: 'UUID' },
      { name: 'ability_id', type: 'UUID' }
    ],
    {
      returns: 'BOOLEAN',
      language: 'plpgsql',
      behavior: 'STABLE',
      definition: `
      DECLARE
          required_skills JSONB;
          skill_requirement JSONB;
          skill_name TEXT;
          required_level INTEGER;
          current_level INTEGER;
      BEGIN
          -- Get ability requirements
          SELECT a.required_skills INTO required_skills
          FROM public.abilities a
          WHERE a.id = ability_id;
          
          -- Check each skill requirement
          FOR skill_requirement IN SELECT * FROM jsonb_array_elements(required_skills)
          LOOP
              skill_name := skill_requirement->>'skill';
              required_level := (skill_requirement->>'level')::INTEGER;
              
              -- Get character's current level in this skill
              SELECT COALESCE(cs.current_level, 0) INTO current_level
              FROM public.character_skills cs
              JOIN public.skills s ON cs.skill_id = s.id
              WHERE cs.character_id = check_ability_requirements.character_id
              AND s.skill_name = skill_name;
              
              -- If requirement not met, return false
              IF current_level < required_level THEN
                  RETURN FALSE;
              END IF;
          END LOOP;
          
          RETURN TRUE;
      END;`
    }
  );

  // Function to award skill experience
  pgm.createFunction('award_skill_experience',
    [
      { name: 'character_id', type: 'UUID' },
      { name: 'skill_name', type: 'TEXT' },
      { name: 'experience_amount', type: 'INTEGER' }
    ],
    {
      returns: 'BOOLEAN',
      language: 'plpgsql',
      definition: `
      DECLARE
          skill_id UUID;
          current_skill_record RECORD;
          new_experience INTEGER;
          levels_gained INTEGER := 0;
          experience_needed INTEGER;
      BEGIN
          -- Get skill ID
          SELECT id INTO skill_id
          FROM public.skills
          WHERE skills.skill_name = award_skill_experience.skill_name;
          
          IF skill_id IS NULL THEN
              RETURN FALSE;
          END IF;
          
          -- Get or create character skill record
          SELECT * INTO current_skill_record
          FROM public.character_skills
          WHERE character_skills.character_id = award_skill_experience.character_id
          AND character_skills.skill_id = award_skill_experience.skill_id;
          
          IF NOT FOUND THEN
              -- Create new skill record
              INSERT INTO public.character_skills (character_id, skill_id, experience_points, experience_to_next)
              VALUES (character_id, skill_id, experience_amount, calculate_experience_to_next(0));
              RETURN TRUE;
          END IF;
          
          -- Add experience
          new_experience := current_skill_record.experience_points + experience_amount;
          
          -- Check for level ups
          WHILE new_experience >= current_skill_record.experience_to_next AND current_skill_record.current_level < 100
          LOOP
              new_experience := new_experience - current_skill_record.experience_to_next;
              levels_gained := levels_gained + 1;
              current_skill_record.current_level := current_skill_record.current_level + 1;
              current_skill_record.experience_to_next := calculate_experience_to_next(current_skill_record.current_level);
          END LOOP;
          
          -- Update skill record
          UPDATE public.character_skills
          SET 
              current_level = current_skill_record.current_level,
              experience_points = new_experience,
              experience_to_next = current_skill_record.experience_to_next,
              times_used = times_used + 1,
              last_trained_at = NOW()
          WHERE character_skills.character_id = award_skill_experience.character_id
          AND character_skills.skill_id = award_skill_experience.skill_id;
          
          -- If levels were gained, update character stats
          IF levels_gained > 0 THEN
              PERFORM update_character_derived_stats(character_id);
          END IF;
          
          RETURN TRUE;
      END;`
    }
  );

  // Function to update character derived stats (health, mana, AP)
  pgm.createFunction('update_character_derived_stats',
    [{ name: 'character_id', type: 'UUID' }],
    {
      returns: 'VOID',
      language: 'plpgsql',
      definition: `
      DECLARE
          new_max_health INTEGER;
          new_max_mana INTEGER;
          current_char RECORD;
      BEGIN
          -- Get current character stats
          SELECT * INTO current_char
          FROM public.characters
          WHERE id = character_id;
          
          IF NOT FOUND THEN
              RETURN;
          END IF;
          
          -- Calculate new maximums
          new_max_health := calculate_max_health(character_id);
          new_max_mana := calculate_max_mana(character_id);
          
          -- Update character with new maximums, preserve current values if they're not over the new max
          UPDATE public.characters
          SET 
              max_health = new_max_health,
              current_health = LEAST(current_health, new_max_health),
              max_mana = new_max_mana,
              current_mana = LEAST(current_mana, new_max_mana)
          WHERE id = character_id;
      END;`
    }
  );

  // ========================================
  // AUTOMATIC TRIGGER FUNCTIONS
  // ========================================

  // Trigger function to update player account activity
  pgm.createFunction('update_player_last_active',
    [],
    {
      returns: 'TRIGGER',
      language: 'plpgsql',
      definition: `
      BEGIN
          UPDATE public.player_accounts
          SET last_active_at = NOW()
          WHERE user_id = auth.uid();
          
          RETURN NEW;
      END;`
    }
  );

  // Trigger function to update session participant count
  pgm.createFunction('update_session_participant_count',
    [],
    {
      returns: 'TRIGGER',
      language: 'plpgsql',
      definition: `
      DECLARE
          session_id UUID;
          new_count INTEGER;
      BEGIN
          -- Get session ID from the operation
          IF TG_OP = 'DELETE' THEN
              session_id := OLD.session_id;
          ELSE
              session_id := NEW.session_id;
          END IF;
          
          -- Count active participants
          SELECT COUNT(*) INTO new_count
          FROM public.session_participants
          WHERE session_participants.session_id = update_session_participant_count.session_id
          AND is_active = TRUE;
          
          -- Update session
          UPDATE public.game_sessions
          SET current_players = new_count
          WHERE id = session_id;
          
          RETURN COALESCE(NEW, OLD);
      END;`
    }
  );

  // Trigger function to update guild member count
  pgm.createFunction('update_guild_member_count',
    [],
    {
      returns: 'TRIGGER',
      language: 'plpgsql',
      definition: `
      DECLARE
          guild_id UUID;
          new_count INTEGER;
      BEGIN
          -- Get guild ID from the operation
          IF TG_OP = 'DELETE' THEN
              guild_id := OLD.guild_id;
          ELSE
              guild_id := NEW.guild_id;
          END IF;
          
          -- Count active members
          SELECT COUNT(*) INTO new_count
          FROM public.guild_members
          WHERE guild_members.guild_id = update_guild_member_count.guild_id
          AND member_status = 'active';
          
          -- Update guild
          UPDATE public.guilds
          SET current_members = new_count
          WHERE id = guild_id;
          
          RETURN COALESCE(NEW, OLD);
      END;`
    }
  );

  // Trigger function to validate equipment slots
  pgm.createFunction('validate_equipment_slot',
    [],
    {
      returns: 'TRIGGER',
      language: 'plpgsql',
      definition: `
      DECLARE
          item_type TEXT;
          valid_slots TEXT[];
      BEGIN
          -- Only validate if item is being equipped
          IF NEW.is_equipped = FALSE OR NEW.equipment_slot IS NULL THEN
              RETURN NEW;
          END IF;
          
          -- Get item type
          SELECT it.item_type INTO item_type
          FROM public.item_templates it
          WHERE it.id = NEW.item_template_id;
          
          -- Define valid slots for each item type
          valid_slots := CASE item_type
              WHEN 'weapon' THEN ARRAY['main_hand', 'off_hand']
              WHEN 'armor' THEN ARRAY['head', 'chest', 'legs', 'feet']
              WHEN 'shield' THEN ARRAY['off_hand']
              ELSE ARRAY[]::TEXT[]
          END;
          
          -- Check if equipment slot is valid for this item type
          IF NOT (NEW.equipment_slot = ANY(valid_slots)) THEN
              RAISE EXCEPTION 'Invalid equipment slot % for item type %', NEW.equipment_slot, item_type;
          END IF;
          
          RETURN NEW;
      END;`
    }
  );

  // Trigger function to automatically learn new abilities when skill requirements are met
  pgm.createFunction('check_new_abilities',
    [],
    {
      returns: 'TRIGGER',
      language: 'plpgsql',
      definition: `
      DECLARE
          ability_record RECORD;
      BEGIN
          -- Check all abilities that aren't already learned
          FOR ability_record IN
              SELECT a.id, a.ability_name
              FROM public.abilities a
              WHERE a.is_active = TRUE
              AND NOT EXISTS (
                  SELECT 1 FROM public.character_abilities ca
                  WHERE ca.character_id = NEW.character_id
                  AND ca.ability_id = a.id
              )
          LOOP
              -- Check if requirements are now met
              IF check_ability_requirements(NEW.character_id, ability_record.id) THEN
                  INSERT INTO public.character_abilities (character_id, ability_id)
                  VALUES (NEW.character_id, ability_record.id);
              END IF;
          END LOOP;
          
          RETURN NEW;
      END;`
    }
  );

  // Trigger function to ensure equipped items don't exceed equipment slot limits
  pgm.createFunction('enforce_equipment_limits',
    [],
    {
      returns: 'TRIGGER',
      language: 'plpgsql',
      definition: `
      BEGIN
          -- If equipping an item, unequip other items in the same slot
          IF NEW.is_equipped = TRUE AND NEW.equipment_slot IS NOT NULL THEN
              UPDATE public.character_inventory
              SET is_equipped = FALSE
              WHERE character_id = NEW.character_id
              AND equipment_slot = NEW.equipment_slot
              AND id != NEW.id;
          END IF;
          
          RETURN NEW;
      END;`
    }
  );

  // Function to broadcast game state changes
  pgm.createFunction('broadcast_game_state_change',
    [],
    {
      returns: 'TRIGGER',
      language: 'plpgsql',
      definition: `
      DECLARE
          session_id UUID;
          payload JSONB;
      BEGIN
          -- Get session ID
          IF TG_TABLE_NAME = 'characters' THEN
              SELECT sp.session_id INTO session_id
              FROM public.session_participants sp
              WHERE sp.character_id = COALESCE(NEW.id, OLD.id)
              AND sp.is_active = TRUE;
          ELSIF TG_TABLE_NAME = 'session_participants' THEN
              session_id := COALESCE(NEW.session_id, OLD.session_id);
          END IF;
          
          -- Only broadcast if character is in an active session
          IF session_id IS NOT NULL THEN
              payload := jsonb_build_object(
                  'table', TG_TABLE_NAME,
                  'operation', TG_OP,
                  'session_id', session_id,
                  'timestamp', extract(epoch from now()),
                  'old', to_jsonb(OLD),
                  'new', to_jsonb(NEW)
              );
              
              -- Note: realtime.broadcast_changes may not be available in all environments
              -- This is a Supabase-specific function
              BEGIN
                  PERFORM realtime.broadcast_changes(
                      'game_session:' || session_id::text,
                      TG_OP,
                      TG_OP,
                      TG_TABLE_NAME,
                      TG_TABLE_SCHEMA,
                      NEW,
                      OLD
                  );
              EXCEPTION WHEN OTHERS THEN
                  -- Silently continue if realtime broadcast is not available
                  NULL;
              END;
          END IF;
          
          RETURN COALESCE(NEW, OLD);
      END;`
    }
  );

  // ========================================
  // PERFORMANCE MONITORING
  // ========================================

  // Create performance logging table
  pgm.createTable('performance_logs', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    operation_type: {
      type: 'text',
      notNull: true,
    },
    duration_ms: {
      type: 'integer',
      notNull: true,
    },
    details: {
      type: 'jsonb',
      default: '{}',
    },
    logged_at: {
      type: 'timestamptz',
      default: pgm.func('NOW()'),
    },
  });

  // Index for performance log cleanup
  pgm.createIndex('performance_logs', 'logged_at', { name: 'idx_performance_logs_cleanup' });

  // Function to log expensive operations
  pgm.createFunction('log_expensive_operation',
    [
      { name: 'operation_type', type: 'TEXT' },
      { name: 'duration_ms', type: 'INTEGER' },
      { name: 'details', type: 'JSONB', default: '{}' }
    ],
    {
      returns: 'VOID',
      language: 'plpgsql',
      definition: `
      BEGIN
          -- Only log operations that take longer than 100ms
          IF duration_ms > 100 THEN
              INSERT INTO public.performance_logs (
                  operation_type,
                  duration_ms,
                  details,
                  logged_at
              ) VALUES (
                  operation_type,
                  duration_ms,
                  details,
                  NOW()
              );
          END IF;
      END;`
    }
  );

  // ========================================
  // CLEANUP FUNCTIONS
  // ========================================

  // Function to clean up old performance logs
  pgm.createFunction('cleanup_performance_logs',
    [],
    {
      returns: 'INTEGER',
      language: 'plpgsql',
      definition: `
      DECLARE
          deleted_count INTEGER;
      BEGIN
          DELETE FROM public.performance_logs
          WHERE logged_at < NOW() - INTERVAL '7 days';
          
          GET DIAGNOSTICS deleted_count = ROW_COUNT;
          RETURN deleted_count;
      END;`
    }
  );

  // Function to clean up inactive sessions
  pgm.createFunction('cleanup_inactive_sessions',
    [],
    {
      returns: 'INTEGER',
      language: 'plpgsql',
      definition: `
      DECLARE
          deleted_count INTEGER;
      BEGIN
          -- Mark sessions as abandoned if no activity for 2 hours
          UPDATE public.game_sessions
          SET session_status = 'abandoned'
          WHERE session_status IN ('lobby', 'active', 'paused')
          AND created_at < NOW() - INTERVAL '2 hours'  -- Use created_at since last_activity_at doesn't exist yet
          AND started_at IS NULL;  -- Only affect sessions that haven't started
          
          GET DIAGNOSTICS deleted_count = ROW_COUNT;
          RETURN deleted_count;
      END;`
    }
  );

  // ========================================
  // CREATE TRIGGERS
  // ========================================

  // Player activity tracking
  pgm.createTrigger('characters', 'trigger_update_player_activity', {
    when: 'AFTER',
    operation: ['INSERT', 'UPDATE'],
    level: 'ROW',
    function: 'update_player_last_active',
  });

  // Session participant counting
  pgm.createTrigger('session_participants', 'trigger_session_participant_count', {
    when: 'AFTER',
    operation: ['INSERT', 'UPDATE', 'DELETE'],
    level: 'ROW',
    function: 'update_session_participant_count',
  });

  // Guild member counting
  pgm.createTrigger('guild_members', 'trigger_guild_member_count', {
    when: 'AFTER',
    operation: ['INSERT', 'UPDATE', 'DELETE'],
    level: 'ROW',
    function: 'update_guild_member_count',
  });

  // Equipment validation
  pgm.createTrigger('character_inventory', 'trigger_validate_equipment', {
    when: 'BEFORE',
    operation: ['INSERT', 'UPDATE'],
    level: 'ROW',
    function: 'validate_equipment_slot',
  });

  // Equipment slot enforcement
  pgm.createTrigger('character_inventory', 'trigger_enforce_equipment_limits', {
    when: 'AFTER',
    operation: ['INSERT', 'UPDATE'],
    level: 'ROW',
    function: 'enforce_equipment_limits',
  });

  // Ability learning automation
  pgm.createTrigger('character_skills', 'trigger_check_new_abilities', {
    when: 'AFTER',
    operation: 'UPDATE',
    level: 'ROW',
    function: 'check_new_abilities',
    condition: 'OLD.current_level < NEW.current_level',
  });

  // Character stat updates (create a custom trigger since node-pg-migrate doesn't support function parameters in triggers)
  pgm.sql(`
    CREATE TRIGGER trigger_update_character_stats
        AFTER UPDATE ON public.character_skills
        FOR EACH ROW
        WHEN (OLD.current_level < NEW.current_level)
        EXECUTE FUNCTION update_character_derived_stats(NEW.character_id);
  `);

  // Broadcast triggers for real-time updates
  pgm.createTrigger('characters', 'trigger_broadcast_character_changes', {
    when: 'AFTER',
    operation: ['INSERT', 'UPDATE', 'DELETE'],
    level: 'ROW',
    function: 'broadcast_game_state_change',
  });

  pgm.createTrigger('session_participants', 'trigger_broadcast_participant_changes', {
    when: 'AFTER',
    operation: ['INSERT', 'UPDATE', 'DELETE'],
    level: 'ROW',
    function: 'broadcast_game_state_change',
  });

  pgm.createTrigger('character_inventory', 'trigger_broadcast_inventory_changes', {
    when: 'AFTER',
    operation: ['INSERT', 'UPDATE', 'DELETE'],
    level: 'ROW',
    function: 'broadcast_game_state_change',
  });

  pgm.createTrigger('character_skills', 'trigger_broadcast_skill_changes', {
    when: 'AFTER',
    operation: 'UPDATE',
    level: 'ROW',
    function: 'broadcast_game_state_change',
    condition: 'OLD.current_level < NEW.current_level',
  });

  // ========================================
  // COMMENTS FOR DOCUMENTATION
  // ========================================

  pgm.sql("COMMENT ON FUNCTION calculate_experience_to_next IS 'Calculates experience points needed for next skill level using exponential scaling'");
  pgm.sql("COMMENT ON FUNCTION calculate_max_health IS 'Calculates character maximum health based on relevant skill levels'");
  pgm.sql("COMMENT ON FUNCTION calculate_max_mana IS 'Calculates character maximum mana based on magic school skill levels'");
  pgm.sql("COMMENT ON FUNCTION check_ability_requirements IS 'Checks if character meets all skill requirements for an ability'");
  pgm.sql("COMMENT ON FUNCTION award_skill_experience IS 'Awards experience to a skill and handles automatic level ups'");
  pgm.sql("COMMENT ON FUNCTION update_character_derived_stats IS 'Updates character health and mana maximums based on skill changes'");
  pgm.sql("COMMENT ON FUNCTION broadcast_game_state_change IS 'Broadcasts real-time game state changes to active session participants'");
  pgm.sql("COMMENT ON FUNCTION cleanup_performance_logs IS 'Removes performance logs older than 7 days'");
  pgm.sql("COMMENT ON FUNCTION cleanup_inactive_sessions IS 'Marks inactive sessions as abandoned after 2 hours of inactivity'");
};

exports.down = (pgm) => {
  // Drop triggers first
  pgm.dropTrigger('character_skills', 'trigger_broadcast_skill_changes', { ifExists: true });
  pgm.dropTrigger('character_inventory', 'trigger_broadcast_inventory_changes', { ifExists: true });
  pgm.dropTrigger('session_participants', 'trigger_broadcast_participant_changes', { ifExists: true });
  pgm.dropTrigger('characters', 'trigger_broadcast_character_changes', { ifExists: true });
  pgm.dropTrigger('character_skills', 'trigger_update_character_stats', { ifExists: true });
  pgm.dropTrigger('character_skills', 'trigger_check_new_abilities', { ifExists: true });
  pgm.dropTrigger('character_inventory', 'trigger_enforce_equipment_limits', { ifExists: true });
  pgm.dropTrigger('character_inventory', 'trigger_validate_equipment', { ifExists: true });
  pgm.dropTrigger('guild_members', 'trigger_guild_member_count', { ifExists: true });
  pgm.dropTrigger('session_participants', 'trigger_session_participant_count', { ifExists: true });
  pgm.dropTrigger('characters', 'trigger_update_player_activity', { ifExists: true });

  // Drop functions
  pgm.dropFunction('cleanup_inactive_sessions', [], { ifExists: true });
  pgm.dropFunction('cleanup_performance_logs', [], { ifExists: true });
  pgm.dropFunction('log_expensive_operation', ['TEXT', 'INTEGER', 'JSONB'], { ifExists: true });
  pgm.dropFunction('broadcast_game_state_change', [], { ifExists: true });
  pgm.dropFunction('enforce_equipment_limits', [], { ifExists: true });
  pgm.dropFunction('check_new_abilities', [], { ifExists: true });
  pgm.dropFunction('validate_equipment_slot', [], { ifExists: true });
  pgm.dropFunction('update_guild_member_count', [], { ifExists: true });
  pgm.dropFunction('update_session_participant_count', [], { ifExists: true });
  pgm.dropFunction('update_player_last_active', [], { ifExists: true });
  pgm.dropFunction('update_character_derived_stats', ['UUID'], { ifExists: true });
  pgm.dropFunction('award_skill_experience', ['UUID', 'TEXT', 'INTEGER'], { ifExists: true });
  pgm.dropFunction('check_ability_requirements', ['UUID', 'UUID'], { ifExists: true });
  pgm.dropFunction('calculate_max_mana', ['UUID'], { ifExists: true });
  pgm.dropFunction('calculate_max_health', ['UUID'], { ifExists: true });
  pgm.dropFunction('calculate_experience_to_next', ['INTEGER', 'INTEGER'], { ifExists: true });

  // Drop tables
  pgm.dropTable('performance_logs', { ifExists: true });
};