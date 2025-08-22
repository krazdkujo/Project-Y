-- ========================================
-- TACTICAL ASCII ROGUELIKE - SKILLS SEED DATA
-- ========================================
-- Version: 1.0
-- Database: Supabase PostgreSQL
-- Purpose: Insert 34 skills with balanced progression and categories
-- ========================================

-- Clear existing data (for re-seeding)
DELETE FROM public.skills;

-- ========================================
-- WEAPON SKILLS (7 skills)
-- ========================================

INSERT INTO public.skills (id, skill_name, skill_category, skill_type, description, max_level, base_training_cost, skill_order) VALUES
(uuid_generate_v4(), 'Swords', 'weapon', 'Sword Combat', 'Balanced weapons with good accuracy and damage. Enables precise strikes and defensive techniques.', 100, 100, 1),
(uuid_generate_v4(), 'Maces', 'weapon', 'Blunt Combat', 'Crushing weapons effective against armor. High damage with armor penetration bonuses.', 100, 100, 2),
(uuid_generate_v4(), 'Axes', 'weapon', 'Axe Combat', 'High damage weapons with cleave potential. Can hit multiple enemies with proper positioning.', 100, 100, 3),
(uuid_generate_v4(), 'Daggers', 'weapon', 'Light Combat', 'Fast, precise weapons for stealth attacks. Enhanced critical hit chance and speed.', 100, 100, 4),
(uuid_generate_v4(), 'Staves', 'weapon', 'Staff Combat', 'Magic-focused weapons with spell enhancement. Reduces casting costs and improves accuracy.', 100, 100, 5),
(uuid_generate_v4(), 'Bows', 'weapon', 'Ranged Combat', 'Precise ranged weapons with good range. High accuracy with distance bonuses.', 100, 100, 6),
(uuid_generate_v4(), 'Crossbows', 'weapon', 'Heavy Ranged', 'Powerful ranged weapons with slow reload. Extreme damage with armor penetration.', 100, 100, 7);

-- ========================================
-- ARMOR SKILLS (4 skills)
-- ========================================

INSERT INTO public.skills (id, skill_name, skill_category, skill_type, description, max_level, base_training_cost, skill_order) VALUES
(uuid_generate_v4(), 'Light_Armor', 'armor', 'Light Protection', 'Minimal protection, maximum mobility. Enhances evasion and movement speed.', 100, 100, 8),
(uuid_generate_v4(), 'Medium_Armor', 'armor', 'Balanced Protection', 'Balanced protection and mobility. Good compromise between defense and agility.', 100, 100, 9),
(uuid_generate_v4(), 'Heavy_Armor', 'armor', 'Heavy Protection', 'Maximum protection, reduced mobility. Massive damage reduction with health bonuses.', 100, 100, 10),
(uuid_generate_v4(), 'Shields', 'armor', 'Active Defense', 'Active blocking and protection enhancement. Enables advanced defensive techniques.', 100, 100, 11);

-- ========================================
-- MAGIC SCHOOLS (6 skills)
-- ========================================

INSERT INTO public.skills (id, skill_name, skill_category, skill_type, description, max_level, base_training_cost, skill_order) VALUES
(uuid_generate_v4(), 'Fire_Magic', 'magic', 'Elemental Fire', 'Offensive magic with burning and explosion effects. High damage with area devastation.', 100, 120, 12),
(uuid_generate_v4(), 'Ice_Magic', 'magic', 'Elemental Ice', 'Control magic with slowing and freezing effects. Battlefield control and defense.', 100, 120, 13),
(uuid_generate_v4(), 'Lightning_Magic', 'magic', 'Elemental Lightning', 'Fast magic with chain effects and stunning. Instant damage with paralysis.', 100, 120, 14),
(uuid_generate_v4(), 'Earth_Magic', 'magic', 'Elemental Earth', 'Defensive magic with barriers and area control. Protection and terrain manipulation.', 100, 120, 15),
(uuid_generate_v4(), 'Healing_Magic', 'magic', 'Divine Magic', 'Restoration magic for health and status effects. Essential for group survival.', 100, 120, 16),
(uuid_generate_v4(), 'Necromancy', 'magic', 'Dark Magic', 'Dark magic with life drain and undead control. Power through death and decay.', 100, 120, 17);

-- ========================================
-- COMBAT SKILLS (4 skills)
-- ========================================

INSERT INTO public.skills (id, skill_name, skill_category, skill_type, description, max_level, base_training_cost, skill_order) VALUES
(uuid_generate_v4(), 'Evasion', 'combat', 'Defensive Technique', 'Avoiding attacks through speed and agility. Increases dodge chance and movement.', 100, 110, 18),
(uuid_generate_v4(), 'Blocking', 'combat', 'Defensive Technique', 'Active defense with weapons and shields. Reduces damage and enables counters.', 100, 110, 19),
(uuid_generate_v4(), 'Dual_Wielding', 'combat', 'Fighting Style', 'Fighting with weapons in both hands. Multiple attacks with reduced penalties.', 100, 130, 20),
(uuid_generate_v4(), 'Two_Handed', 'combat', 'Fighting Style', 'Mastery of large weapons requiring both hands. Massive damage with reach advantage.', 100, 130, 21);

-- ========================================
-- CRAFTING SKILLS (5 skills)
-- ========================================

INSERT INTO public.skills (id, skill_name, skill_category, skill_type, description, max_level, base_training_cost, skill_order) VALUES
(uuid_generate_v4(), 'Smithing', 'crafting', 'Item Creation', 'Creating and repairing metal weapons and armor. Forge legendary equipment.', 100, 150, 22),
(uuid_generate_v4(), 'Alchemy', 'crafting', 'Potion Creation', 'Creating potions, poisons, and magical compounds. Transform raw materials into power.', 100, 150, 23),
(uuid_generate_v4(), 'Enchanting', 'crafting', 'Magic Infusion', 'Imbuing items with magical properties. Add supernatural abilities to equipment.', 100, 180, 24),
(uuid_generate_v4(), 'Cooking', 'crafting', 'Food Preparation', 'Preparing food with beneficial effects. Sustenance with magical enhancements.', 100, 100, 25),
(uuid_generate_v4(), 'Trap_Making', 'crafting', 'Device Creation', 'Creating and disarming mechanical devices. Master of hidden dangers and defenses.', 100, 140, 26);

-- ========================================
-- PASSIVE SKILLS (8 skills)
-- ========================================

INSERT INTO public.skills (id, skill_name, skill_category, skill_type, description, max_level, base_training_cost, skill_order) VALUES
(uuid_generate_v4(), 'Stealth', 'passive', 'Concealment', 'Moving unseen and unheard. Master of shadows and silent approaches.', 100, 130, 27),
(uuid_generate_v4(), 'Perception', 'passive', 'Awareness', 'Detecting hidden things and danger. Nothing escapes your keen senses.', 100, 110, 28),
(uuid_generate_v4(), 'Survival', 'passive', 'Wilderness Lore', 'Wilderness skills and environmental resistance. Thrive in any hostile environment.', 100, 120, 29),
(uuid_generate_v4(), 'Athletics', 'passive', 'Physical Prowess', 'Physical prowess and movement abilities. Enhanced strength and endurance.', 100, 100, 30),
(uuid_generate_v4(), 'Leadership', 'passive', 'Group Coordination', 'Inspiring and coordinating group actions. Rally allies and boost morale.', 100, 140, 31),
(uuid_generate_v4(), 'Lockpicking', 'passive', 'Lock Manipulation', 'Opening locks and mechanical devices. Bypass any barrier with finesse.', 100, 120, 32),
(uuid_generate_v4(), 'Intimidation', 'passive', 'Psychological Warfare', 'Frightening enemies and controlling situations. Strike fear into hearts.', 100, 110, 33),
(uuid_generate_v4(), 'Diplomacy', 'passive', 'Social Interaction', 'Peaceful resolution and social interaction. Words as weapons, allies as shields.', 100, 110, 34);

-- ========================================
-- SKILL TRAINING MODIFIERS
-- ========================================

-- Create table for skill training modifiers based on combinations
CREATE TABLE IF NOT EXISTS public.skill_synergies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    primary_skill_id UUID REFERENCES public.skills(id),
    synergy_skill_id UUID REFERENCES public.skills(id),
    training_bonus DECIMAL(3,2) DEFAULT 1.1,
    description TEXT,
    
    UNIQUE(primary_skill_id, synergy_skill_id)
);

-- Insert skill synergies for faster training
INSERT INTO public.skill_synergies (primary_skill_id, synergy_skill_id, training_bonus, description) VALUES
-- Weapon synergies
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), (SELECT id FROM public.skills WHERE skill_name = 'Dual_Wielding'), 1.15, 'Swords benefit from dual wielding practice'),
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), (SELECT id FROM public.skills WHERE skill_name = 'Two_Handed'), 1.15, 'Axes benefit from two-handed techniques'),
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), (SELECT id FROM public.skills WHERE skill_name = 'Stealth'), 1.20, 'Daggers excel with stealth training'),
((SELECT id FROM public.skills WHERE skill_name = 'Staves'), (SELECT id FROM public.skills WHERE skill_name = 'Fire_Magic'), 1.10, 'Staves enhance fire magic'),
((SELECT id FROM public.skills WHERE skill_name = 'Staves'), (SELECT id FROM public.skills WHERE skill_name = 'Ice_Magic'), 1.10, 'Staves enhance ice magic'),
((SELECT id FROM public.skills WHERE skill_name = 'Staves'), (SELECT id FROM public.skills WHERE skill_name = 'Lightning_Magic'), 1.10, 'Staves enhance lightning magic'),

-- Armor synergies
((SELECT id FROM public.skills WHERE skill_name = 'Light_Armor'), (SELECT id FROM public.skills WHERE skill_name = 'Evasion'), 1.15, 'Light armor enhances evasion training'),
((SELECT id FROM public.skills WHERE skill_name = 'Heavy_Armor'), (SELECT id FROM public.skills WHERE skill_name = 'Blocking'), 1.15, 'Heavy armor enhances blocking training'),
((SELECT id FROM public.skills WHERE skill_name = 'Shields'), (SELECT id FROM public.skills WHERE skill_name = 'Blocking'), 1.20, 'Shields excel with blocking practice'),

-- Magic synergies
((SELECT id FROM public.skills WHERE skill_name = 'Fire_Magic'), (SELECT id FROM public.skills WHERE skill_name = 'Earth_Magic'), 1.10, 'Fire and earth magic complement each other'),
((SELECT id FROM public.skills WHERE skill_name = 'Ice_Magic'), (SELECT id FROM public.skills WHERE skill_name = 'Lightning_Magic'), 1.10, 'Ice and lightning create powerful combinations'),
((SELECT id FROM public.skills WHERE skill_name = 'Healing_Magic'), (SELECT id FROM public.skills WHERE skill_name = 'Leadership'), 1.15, 'Healing enhances leadership abilities'),

-- Crafting synergies
((SELECT id FROM public.skills WHERE skill_name = 'Smithing'), (SELECT id FROM public.skills WHERE skill_name = 'Enchanting'), 1.15, 'Smithing and enchanting work together'),
((SELECT id FROM public.skills WHERE skill_name = 'Alchemy'), (SELECT id FROM public.skills WHERE skill_name = 'Cooking'), 1.10, 'Alchemy enhances cooking knowledge'),
((SELECT id FROM public.skills WHERE skill_name = 'Trap_Making'), (SELECT id FROM public.skills WHERE skill_name = 'Lockpicking'), 1.15, 'Trap making and lockpicking share techniques'),

-- Passive synergies
((SELECT id FROM public.skills WHERE skill_name = 'Stealth'), (SELECT id FROM public.skills WHERE skill_name = 'Perception'), 1.10, 'Stealth and perception complement each other'),
((SELECT id FROM public.skills WHERE skill_name = 'Survival'), (SELECT id FROM public.skills WHERE skill_name = 'Athletics'), 1.10, 'Survival and athletics work together'),
((SELECT id FROM public.skills WHERE skill_name = 'Leadership'), (SELECT id FROM public.skills WHERE skill_name = 'Diplomacy'), 1.15, 'Leadership enhances diplomatic skills'),
((SELECT id FROM public.skills WHERE skill_name = 'Intimidation'), (SELECT id FROM public.skills WHERE skill_name = 'Leadership'), 1.10, 'Intimidation can enhance leadership');

-- ========================================
-- SKILL LEVEL THRESHOLDS
-- ========================================

-- Create table for skill milestone rewards
CREATE TABLE IF NOT EXISTS public.skill_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_id UUID REFERENCES public.skills(id),
    milestone_level INTEGER CHECK (milestone_level > 0 AND milestone_level <= 100),
    reward_type TEXT CHECK (reward_type IN ('stat_bonus', 'ability_unlock', 'passive_effect', 'crafting_unlock')),
    reward_value JSONB DEFAULT '{}',
    description TEXT,
    
    UNIQUE(skill_id, milestone_level)
);

-- Insert important skill milestones
INSERT INTO public.skill_milestones (skill_id, milestone_level, reward_type, reward_value, description) VALUES
-- Combat skill milestones
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 25, 'stat_bonus', '{"accuracy": 5, "damage": 2}', 'Sword mastery improves accuracy and damage'),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 50, 'ability_unlock', '{"ability": "Perfect_Strike"}', 'Unlock perfect strike ability'),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 75, 'passive_effect', '{"crit_chance": 10}', 'Increased critical hit chance'),

-- Magic milestones  
((SELECT id FROM public.skills WHERE skill_name = 'Fire_Magic'), 25, 'stat_bonus', '{"spell_damage": 15, "mana_efficiency": 5}', 'Fire magic becomes more powerful and efficient'),
((SELECT id FROM public.skills WHERE skill_name = 'Fire_Magic'), 50, 'ability_unlock', '{"ability": "Fireball"}', 'Unlock fireball spell'),
((SELECT id FROM public.skills WHERE skill_name = 'Fire_Magic'), 75, 'ability_unlock', '{"ability": "Meteor"}', 'Unlock devastating meteor spell'),

-- Healing milestones
((SELECT id FROM public.skills WHERE skill_name = 'Healing_Magic'), 25, 'ability_unlock', '{"ability": "Smite"}', 'Unlock holy smite ability'),
((SELECT id FROM public.skills WHERE skill_name = 'Healing_Magic'), 40, 'ability_unlock', '{"ability": "Mass_Heal"}', 'Unlock mass healing'),
((SELECT id FROM public.skills WHERE skill_name = 'Healing_Magic'), 60, 'passive_effect', '{"healing_bonus": 25}', 'All healing effects enhanced'),

-- Stealth milestones
((SELECT id FROM public.skills WHERE skill_name = 'Stealth'), 20, 'ability_unlock', '{"ability": "Backstab"}', 'Unlock backstab ability'),
((SELECT id FROM public.skills WHERE skill_name = 'Stealth'), 45, 'ability_unlock', '{"ability": "Shadow_Step"}', 'Unlock shadow step teleportation'),
((SELECT id FROM public.skills WHERE skill_name = 'Stealth'), 60, 'ability_unlock', '{"ability": "Invisibility"}', 'Unlock true invisibility'),

-- Crafting milestones
((SELECT id FROM public.skills WHERE skill_name = 'Smithing'), 30, 'crafting_unlock', '{"tier": "masterwork"}', 'Can craft masterwork quality items'),
((SELECT id FROM public.skills WHERE skill_name = 'Smithing'), 60, 'crafting_unlock', '{"tier": "legendary"}', 'Can craft legendary quality items'),
((SELECT id FROM public.skills WHERE skill_name = 'Smithing'), 75, 'ability_unlock', '{"ability": "Legendary_Smith"}', 'Master smithing techniques'),

-- Athletic milestones for health bonuses
((SELECT id FROM public.skills WHERE skill_name = 'Athletics'), 20, 'stat_bonus', '{"health": 10, "stamina": 5}', 'Improved physical conditioning'),
((SELECT id FROM public.skills WHERE skill_name = 'Athletics'), 50, 'stat_bonus', '{"health": 15, "movement": 1}', 'Enhanced endurance and speed'),
((SELECT id FROM public.skills WHERE skill_name = 'Athletics'), 80, 'passive_effect', '{"fatigue_resistance": 50}', 'Resist fatigue and exhaustion');

-- ========================================
-- SKILL CATEGORIES METADATA
-- ========================================

-- Create table for skill category information
CREATE TABLE IF NOT EXISTS public.skill_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name TEXT UNIQUE NOT NULL,
    description TEXT,
    color_code TEXT DEFAULT '#FFFFFF',
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO public.skill_categories (category_name, description, color_code, sort_order) VALUES
('weapon', 'Combat skills for various weapon types, each with unique techniques and advantages', '#FF6B6B', 1),
('armor', 'Protective skills for different armor types, balancing defense and mobility', '#4ECDC4', 2), 
('magic', 'Mystical arts for casting spells and manipulating elemental forces', '#45B7D1', 3),
('combat', 'General combat techniques including defense and fighting styles', '#96CEB4', 4),
('crafting', 'Creation skills for equipment, consumables, and magical enhancements', '#FFEAA7', 5),
('passive', 'Utility skills for exploration, social interaction, and survival', '#DDA0DD', 6);

-- ========================================
-- VALIDATION AND CONSTRAINTS
-- ========================================

-- Add constraint to ensure skill order uniqueness
ALTER TABLE public.skills ADD CONSTRAINT unique_skill_order UNIQUE (skill_order);

-- Add constraint to ensure reasonable training costs
ALTER TABLE public.skills ADD CONSTRAINT reasonable_training_cost 
CHECK (base_training_cost >= 50 AND base_training_cost <= 300);

-- Add indexes for skill queries
CREATE INDEX IF NOT EXISTS idx_skills_category_order ON public.skills(skill_category, skill_order);
CREATE INDEX IF NOT EXISTS idx_skills_name_search ON public.skills USING gin(skill_name gin_trgm_ops);

-- ========================================
-- COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.skills IS 'Complete 34-skill system with balanced progression and category organization';
COMMENT ON TABLE public.skill_synergies IS 'Skill combinations that provide training bonuses for realistic character development';
COMMENT ON TABLE public.skill_milestones IS 'Important skill level thresholds that unlock abilities and bonuses';
COMMENT ON TABLE public.skill_categories IS 'Metadata for skill categories including display information';

-- Skill system summary
COMMENT ON COLUMN public.skills.base_training_cost IS 'Base experience cost for first level, scales exponentially';
COMMENT ON COLUMN public.skills.skill_order IS 'Display order within category for consistent UI presentation';
COMMENT ON COLUMN public.skill_synergies.training_bonus IS 'Multiplier for experience gain when both skills are being trained';