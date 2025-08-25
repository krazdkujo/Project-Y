-- ========================================
-- TACTICAL ASCII ROGUELIKE - TRIGGERS & FUNCTIONS (FIXED)
-- ========================================
-- Version: 1.0 - Fixed trigger syntax errors
-- Database: Supabase PostgreSQL
-- Purpose: Automatic calculations, state management, and business logic
-- ========================================

-- ========================================
-- UTILITY FUNCTIONS
-- ========================================

-- Function to calculate skill experience required for next level
CREATE OR REPLACE FUNCTION calculate_experience_to_next(current_level INTEGER, base_cost INTEGER DEFAULT 100)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- Exponential scaling: base_cost * (1.1 ^ current_level)
    RETURN FLOOR(base_cost * POWER(1.1, current_level));
END;
$$;

-- Function to calculate character max health based on skills
CREATE OR REPLACE FUNCTION calculate_max_health(character_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
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
END;
$$;

-- Function to calculate character max mana based on magic skills
CREATE OR REPLACE FUNCTION calculate_max_mana(character_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    base_mana INTEGER := 20;
    mana_bonus INTEGER := 0;
    destruction_skill INTEGER;
    restoration_skill INTEGER;
    illusion_skill INTEGER;
    conjuration_skill INTEGER;
    alteration_skill INTEGER;
BEGIN
    -- Get magic skill levels
    SELECT 
        COALESCE(MAX(CASE WHEN s.skill_name = 'Destruction_Magic' THEN cs.current_level END), 0),
        COALESCE(MAX(CASE WHEN s.skill_name = 'Restoration_Magic' THEN cs.current_level END), 0),
        COALESCE(MAX(CASE WHEN s.skill_name = 'Illusion_Magic' THEN cs.current_level END), 0),
        COALESCE(MAX(CASE WHEN s.skill_name = 'Conjuration_Magic' THEN cs.current_level END), 0),
        COALESCE(MAX(CASE WHEN s.skill_name = 'Alteration_Magic' THEN cs.current_level END), 0)
    INTO destruction_skill, restoration_skill, illusion_skill, conjuration_skill, alteration_skill
    FROM public.character_skills cs
    JOIN public.skills s ON cs.skill_id = s.id
    WHERE cs.character_id = calculate_max_mana.character_id
    AND s.skill_name IN ('Destruction_Magic', 'Restoration_Magic', 'Illusion_Magic', 'Conjuration_Magic', 'Alteration_Magic');
    
    -- Calculate mana bonuses from magic skills
    mana_bonus := 
        (destruction_skill * 3) +  -- Destruction gives 3 mana per level
        (restoration_skill * 2) +  -- Restoration gives 2 mana per level
        (illusion_skill * 2) +     -- Illusion gives 2 mana per level
        (conjuration_skill * 2) +  -- Conjuration gives 2 mana per level
        (alteration_skill * 2);    -- Alteration gives 2 mana per level
    
    RETURN base_mana + mana_bonus;
END;
$$;

-- Function to check if character meets ability requirements
CREATE OR REPLACE FUNCTION check_ability_requirements(character_id UUID, ability_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    ability_record RECORD;
    requirement JSONB;
    required_skill TEXT;
    required_level INTEGER;
    character_skill_level INTEGER;
BEGIN
    -- Get ability requirements
    SELECT * INTO ability_record
    FROM public.abilities
    WHERE id = ability_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check each skill requirement
    FOR requirement IN SELECT * FROM jsonb_array_elements(ability_record.skill_requirements)
    LOOP
        required_skill := requirement->>'skill';
        required_level := (requirement->>'level')::INTEGER;
        
        -- Get character skill level
        SELECT COALESCE(cs.current_level, 0) INTO character_skill_level
        FROM public.character_skills cs
        JOIN public.skills s ON cs.skill_id = s.id
        WHERE cs.character_id = check_ability_requirements.character_id
        AND s.skill_name = required_skill;
        
        -- Check if requirement is met
        IF character_skill_level < required_level THEN
            RETURN FALSE;
        END IF;
    END LOOP;
    
    RETURN TRUE;
END;
$$;

-- Function to award skill experience and handle level ups
CREATE OR REPLACE FUNCTION award_skill_experience(character_id UUID, skill_name TEXT, experience_amount INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
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
        levels_gained := levels_gained + 1;
        new_experience := new_experience - current_skill_record.experience_to_next;
        current_skill_record.current_level := current_skill_record.current_level + 1;
        current_skill_record.experience_to_next := calculate_experience_to_next(current_skill_record.current_level);
    END LOOP;
    
    -- Update character skill record
    UPDATE public.character_skills
    SET 
        current_level = current_skill_record.current_level,
        experience_points = new_experience,
        experience_to_next = current_skill_record.experience_to_next,
        updated_at = NOW()
    WHERE character_skills.character_id = award_skill_experience.character_id
    AND character_skills.skill_id = award_skill_experience.skill_id;
    
    -- If levels were gained, update character stats
    IF levels_gained > 0 THEN
        PERFORM update_character_derived_stats(character_id);
    END IF;
    
    RETURN TRUE;
END;
$$;

-- Function to update character derived stats (health, mana, AP)
CREATE OR REPLACE FUNCTION update_character_derived_stats(character_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    new_max_health INTEGER;
    new_max_mana INTEGER;
BEGIN
    -- Calculate new max health and mana
    new_max_health := calculate_max_health(character_id);
    new_max_mana := calculate_max_mana(character_id);
    
    -- Update character record
    UPDATE public.characters
    SET 
        max_health = new_max_health,
        max_mana = new_max_mana,
        updated_at = NOW()
    WHERE id = character_id;
END;
$$;

-- FIXED: Trigger function for character stat updates
CREATE OR REPLACE FUNCTION trigger_update_character_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only update when level increases
    IF NEW.current_level > OLD.current_level THEN
        PERFORM update_character_derived_stats(NEW.character_id);
    END IF;
    
    RETURN NEW;
END;
$$;

-- ========================================
-- REAL-TIME BROADCAST FUNCTIONS
-- ========================================

-- Function to broadcast game state changes
CREATE OR REPLACE FUNCTION broadcast_game_state_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    session_id UUID;
    payload JSONB;
BEGIN
    -- Get session ID
    IF TG_TABLE_NAME = 'characters' THEN
        SELECT sp.session_id INTO session_id
        FROM public.session_participants sp
        WHERE sp.character_id = COALESCE(NEW.id, OLD.id);
    ELSIF TG_TABLE_NAME = 'session_participants' THEN
        session_id := COALESCE(NEW.session_id, OLD.session_id);
    END IF;
    
    -- Broadcast change if we have a session
    IF session_id IS NOT NULL THEN
        PERFORM pg_notify(
            'game_session:' || session_id::text,
            json_build_object(
                'table', TG_TABLE_NAME,
                'action', TG_OP,
                'data', COALESCE(NEW, OLD)
            )::text
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- ========================================
-- MAINTENANCE FUNCTIONS
-- ========================================

-- Function to cleanup old performance logs
CREATE OR REPLACE FUNCTION cleanup_performance_logs()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.performance_logs
    WHERE logged_at < NOW() - INTERVAL '7 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Function to cleanup inactive sessions
CREATE OR REPLACE FUNCTION cleanup_inactive_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Mark sessions as abandoned if no activity for 2 hours
    UPDATE public.game_sessions
    SET 
        session_status = 'abandoned',
        updated_at = NOW()
    WHERE session_status IN ('lobby', 'active', 'paused')
    AND updated_at < NOW() - INTERVAL '2 hours';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- ========================================
-- TRIGGERS
-- ========================================

-- Character stat updates (FIXED SYNTAX)
CREATE TRIGGER trigger_update_character_stats
    AFTER UPDATE ON public.character_skills
    FOR EACH ROW
    WHEN (OLD.current_level < NEW.current_level)
    EXECUTE FUNCTION trigger_update_character_stats();

-- Real-time broadcasts
CREATE TRIGGER trigger_broadcast_participant_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.session_participants
    FOR EACH ROW
    EXECUTE FUNCTION broadcast_game_state_change();

CREATE TRIGGER trigger_broadcast_character_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.characters
    FOR EACH ROW
    EXECUTE FUNCTION broadcast_game_state_change();

-- ========================================
-- FUNCTION COMMENTS
-- ========================================

COMMENT ON FUNCTION calculate_experience_to_next IS 'Calculates experience points needed for next skill level using exponential scaling';
COMMENT ON FUNCTION calculate_max_health IS 'Calculates character maximum health based on relevant skill levels';
COMMENT ON FUNCTION calculate_max_mana IS 'Calculates character maximum mana based on magic school skill levels';
COMMENT ON FUNCTION check_ability_requirements IS 'Checks if character meets all skill requirements for an ability';
COMMENT ON FUNCTION award_skill_experience IS 'Awards experience to a skill and handles automatic level ups';
COMMENT ON FUNCTION update_character_derived_stats IS 'Updates character health and mana maximums based on skill changes';
COMMENT ON FUNCTION broadcast_game_state_change IS 'Broadcasts real-time game state changes to active session participants';
COMMENT ON FUNCTION cleanup_performance_logs IS 'Removes performance logs older than 7 days';
COMMENT ON FUNCTION cleanup_inactive_sessions IS 'Marks inactive sessions as abandoned after 2 hours of inactivity';