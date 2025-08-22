-- ========================================
-- TACTICAL ASCII ROGUELIKE - SKILLS PROGRESSION DATA
-- ========================================
-- Version: 1.0
-- Database: Supabase PostgreSQL
-- Purpose: Detailed skill progression with level-by-level abilities and bonuses
-- Requires: 001_skills_data.sql to be run first
-- ========================================

-- ========================================
-- SKILL PROGRESSION TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.skill_progression (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
    skill_level INTEGER CHECK (skill_level >= 1 AND skill_level <= 100),
    experience_required INTEGER CHECK (experience_required >= 0),
    bonus_type TEXT CHECK (bonus_type IN ('accuracy', 'damage', 'defense', 'speed', 'efficiency', 'range', 'area', 'duration', 'critical', 'resistance')),
    bonus_value DECIMAL(5,2) DEFAULT 0,
    ability_unlocked TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(skill_id, skill_level)
);

-- ========================================
-- WEAPON SKILLS PROGRESSION (7 Skills)
-- ========================================

-- SWORDS PROGRESSION
INSERT INTO public.skill_progression (skill_id, skill_level, experience_required, bonus_type, bonus_value, ability_unlocked, description) VALUES
-- Basic progression (1-25)
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 1, 0, 'accuracy', 2.0, NULL, 'Basic sword stance and grip'),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 5, 125, 'damage', 1.0, NULL, 'Improved cutting technique'),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 10, 300, 'critical', 1.0, NULL, 'Better targeting of vital areas'),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 15, 525, 'accuracy', 3.0, 'Precise Strike', 'Unlock precise strike ability (1 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 20, 800, 'defense', 2.0, NULL, 'Defensive sword positioning'),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 25, 1125, 'damage', 2.0, 'Quick Slash', 'Unlock quick slash ability (1 AP)'),

-- Intermediate progression (26-50)
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 30, 1500, 'accuracy', 4.0, NULL, 'Advanced sword work'),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 35, 1925, 'critical', 2.0, 'Defensive Strike', 'Unlock defensive strike (2 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 40, 2400, 'damage', 3.0, NULL, 'Masterful blade control'),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 45, 2925, 'speed', 0.5, 'Power Slash', 'Unlock power slash (3 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 50, 3500, 'accuracy', 5.0, 'Riposte', 'Unlock riposte counter-attack (3 AP)'),

-- Advanced progression (51-75)
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 55, 4125, 'damage', 4.0, NULL, 'Expert swordsman techniques'),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 60, 4800, 'critical', 3.0, 'Whirling Blade', 'Unlock whirling blade (4 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 65, 5525, 'defense', 3.0, NULL, 'Perfect defensive form'),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 70, 6300, 'accuracy', 6.0, 'Perfect Strike', 'Unlock perfect strike (5 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 75, 7125, 'damage', 5.0, 'Blade Dance', 'Unlock blade dance (5 AP)'),

-- Master progression (76-100)
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 80, 8000, 'critical', 4.0, NULL, 'Legendary sword mastery begins'),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 85, 8925, 'speed', 1.0, NULL, 'Lightning-fast sword work'),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 90, 9900, 'damage', 6.0, 'Legendary Technique', 'Unlock legendary sword technique (6 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 95, 10925, 'accuracy', 8.0, NULL, 'Near-perfect sword mastery'),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 100, 12000, 'critical', 5.0, 'Sword Saint', 'Master of all sword techniques');

-- MACES PROGRESSION  
INSERT INTO public.skill_progression (skill_id, skill_level, experience_required, bonus_type, bonus_value, ability_unlocked, description) VALUES
-- Basic progression (1-25)
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 1, 0, 'damage', 2.0, NULL, 'Basic crushing technique'),
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 5, 125, 'accuracy', 1.0, NULL, 'Improved mace handling'),
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 10, 300, 'damage', 3.0, NULL, 'Enhanced crushing power'),
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 15, 525, 'resistance', 1.0, 'Shield Breaking', 'Can damage shields and armor'),
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 20, 800, 'damage', 4.0, NULL, 'Devastating impact strikes'),
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 25, 1125, 'accuracy', 3.0, 'Armor Crush', 'Unlock armor crush (2 AP)'),

-- Intermediate progression (26-50)
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 30, 1500, 'damage', 5.0, NULL, 'Advanced crushing techniques'),
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 35, 1925, 'resistance', 2.0, 'Stunning Blow', 'Unlock stunning blow (3 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 40, 2400, 'damage', 6.0, NULL, 'Bone-crushing force'),
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 45, 2925, 'accuracy', 4.0, 'Shield Bash', 'Unlock shield bash (2 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 50, 3500, 'damage', 7.0, 'Smite', 'Unlock holy smite (3 AP)'),

-- Advanced progression (51-75)
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 55, 4125, 'resistance', 3.0, NULL, 'Armor-piercing expertise'),
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 60, 4800, 'damage', 8.0, 'Divine Protection', 'Unlock divine protection (4 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 65, 5525, 'accuracy', 5.0, NULL, 'Precise crushing strikes'),
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 70, 6300, 'damage', 9.0, 'Pulverize', 'Unlock pulverize (5 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 75, 7125, 'resistance', 4.0, 'Devastating Blow', 'Unlock devastating blow (6 AP)'),

-- Master progression (76-100)
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 80, 8000, 'damage', 10.0, NULL, 'Legendary crushing power'),
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 85, 8925, 'accuracy', 6.0, NULL, 'Perfect mace control'),
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 90, 9900, 'resistance', 5.0, 'Mace Master', 'Ultimate mace mastery'),
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 95, 10925, 'damage', 12.0, NULL, 'Unstoppable force'),
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 100, 12000, 'resistance', 6.0, 'Divine Warrior', 'Blessed weapon mastery');

-- AXES PROGRESSION
INSERT INTO public.skill_progression (skill_id, skill_level, experience_required, bonus_type, bonus_value, ability_unlocked, description) VALUES
-- Basic progression (1-25)
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 1, 0, 'damage', 3.0, NULL, 'Basic chopping technique'),
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 5, 125, 'area', 0.1, NULL, 'Slight cleave chance'),
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 10, 300, 'damage', 4.0, NULL, 'Improved axe strikes'),
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 15, 525, 'area', 0.15, 'Intimidating Presence', 'Fear effect on enemies'),
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 20, 800, 'damage', 5.0, NULL, 'Ferocious attacks'),
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 25, 1125, 'area', 0.2, 'Throwing Axe', 'Unlock ranged axe attack (2 AP)'),

-- Intermediate progression (26-50)
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 30, 1500, 'damage', 6.0, NULL, 'Berserker techniques'),
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 35, 1925, 'area', 0.25, 'Great Cleave', 'Unlock great cleave (3 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 40, 2400, 'damage', 7.0, NULL, 'Devastating chops'),
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 45, 2925, 'critical', 2.0, 'Whirlwind', 'Unlock whirlwind attack (4 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 50, 3500, 'area', 0.3, NULL, 'Enhanced cleave range'),

-- Advanced progression (51-75)
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 55, 4125, 'damage', 8.0, NULL, 'Master axe techniques'),
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 60, 4800, 'critical', 3.0, NULL, 'Brutal critical strikes'),
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 65, 5525, 'area', 0.35, NULL, 'Wide cleave arcs'),
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 70, 6300, 'damage', 9.0, 'Execution', 'Unlock execution (5 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 75, 7125, 'area', 0.4, 'Legendary Cleave', 'Unlock legendary cleave (6 AP)'),

-- Master progression (76-100)
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 80, 8000, 'damage', 10.0, NULL, 'Legendary berserker'),
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 85, 8925, 'critical', 4.0, NULL, 'Devastating criticals'),
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 90, 9900, 'area', 0.45, 'Axe Lord', 'Ultimate axe mastery'),
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 95, 10925, 'damage', 12.0, NULL, 'Unstoppable fury'),
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 100, 12000, 'area', 0.5, 'Berserker Lord', 'Master of destruction');

-- DAGGERS PROGRESSION
INSERT INTO public.skill_progression (skill_id, skill_level, experience_required, bonus_type, bonus_value, ability_unlocked, description) VALUES
-- Basic progression (1-25)
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 1, 0, 'speed', 1.0, NULL, 'Fast dagger strikes'),
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 5, 125, 'accuracy', 2.0, NULL, 'Precise strikes'),
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 10, 300, 'critical', 2.0, NULL, 'Enhanced critical chance'),
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 15, 525, 'speed', 1.5, 'Poison Strike', 'Unlock poison strike (1 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 20, 800, 'critical', 3.0, NULL, 'Deadly precision'),
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 25, 1125, 'accuracy', 4.0, 'Sneak Attack', 'Unlock sneak attack (2 AP)'),

-- Intermediate progression (26-50)
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 30, 1500, 'speed', 2.0, NULL, 'Lightning-fast strikes'),
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 35, 1925, 'critical', 4.0, 'Backstab', 'Unlock backstab (3 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 40, 2400, 'accuracy', 6.0, NULL, 'Perfect accuracy'),
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 45, 2925, 'speed', 2.5, 'Flurry', 'Unlock flurry attack (3 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 50, 3500, 'critical', 5.0, 'Dual Strike', 'Unlock dual strike (2 AP)'),

-- Advanced progression (51-75)
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 55, 4125, 'speed', 3.0, NULL, 'Assassin techniques'),
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 60, 4800, 'critical', 6.0, 'Shadow Strike', 'Unlock shadow strike (4 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 65, 5525, 'accuracy', 8.0, NULL, 'Flawless precision'),
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 70, 6300, 'speed', 3.5, 'Thousand Cuts', 'Unlock thousand cuts (4 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 75, 7125, 'critical', 7.0, 'Death Strike', 'Unlock death strike (5 AP)'),

-- Master progression (76-100)
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 80, 8000, 'speed', 4.0, NULL, 'Master assassin'),
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 85, 8925, 'critical', 8.0, NULL, 'Lethal precision'),
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 90, 9900, 'accuracy', 10.0, 'Shadow Master', 'Ultimate dagger mastery'),
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 95, 10925, 'speed', 4.5, NULL, 'Inhuman speed'),
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 100, 12000, 'critical', 10.0, 'Death Lord', 'Master of silent death');

-- Continue with remaining weapon skills...
-- STAVES, BOWS, CROSSBOWS progression would follow similar patterns

-- ========================================
-- MAGIC SCHOOLS PROGRESSION (6 Skills)  
-- ========================================

-- FIRE MAGIC PROGRESSION
INSERT INTO public.skill_progression (skill_id, skill_level, experience_required, bonus_type, bonus_value, ability_unlocked, description) VALUES
-- Basic progression (1-25)
((SELECT id FROM public.skills WHERE skill_name = 'Fire_Magic'), 1, 0, 'damage', 2.0, 'Spark', 'Basic fire manipulation (1 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Fire_Magic'), 5, 150, 'resistance', 1.0, NULL, 'Fire resistance begins'),
((SELECT id FROM public.skills WHERE skill_name = 'Fire_Magic'), 10, 360, 'damage', 3.0, 'Light', 'Create magical light (1 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Fire_Magic'), 15, 630, 'area', 0.1, 'Warm', 'Comfort and warmth (1 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Fire_Magic'), 20, 960, 'damage', 4.0, NULL, 'Enhanced fire damage'),
((SELECT id FROM public.skills WHERE skill_name = 'Fire_Magic'), 25, 1350, 'resistance', 2.0, 'Flame Arrow', 'Unlock flame arrow (2 AP)'),

-- Intermediate progression (26-50)
((SELECT id FROM public.skills WHERE skill_name = 'Fire_Magic'), 30, 1800, 'damage', 5.0, NULL, 'Advanced pyromancy'),
((SELECT id FROM public.skills WHERE skill_name = 'Fire_Magic'), 35, 2310, 'area', 0.2, 'Fireball', 'Unlock fireball (3 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Fire_Magic'), 40, 2880, 'damage', 6.0, NULL, 'Master fire control'),
((SELECT id FROM public.skills WHERE skill_name = 'Fire_Magic'), 45, 3510, 'resistance', 3.0, 'Fire Shield', 'Unlock fire shield (4 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Fire_Magic'), 50, 4200, 'area', 0.3, NULL, 'Wider area effects'),

-- Advanced progression (51-75)
((SELECT id FROM public.skills WHERE skill_name = 'Fire_Magic'), 55, 4950, 'damage', 7.0, 'Wall of Fire', 'Unlock wall of fire (5 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Fire_Magic'), 60, 5760, 'area', 0.4, NULL, 'Large area control'),
((SELECT id FROM public.skills WHERE skill_name = 'Fire_Magic'), 65, 6630, 'damage', 8.0, 'Flame Strike', 'Unlock flame strike (6 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Fire_Magic'), 70, 7560, 'resistance', 4.0, NULL, 'Fire immunity'),
((SELECT id FROM public.skills WHERE skill_name = 'Fire_Magic'), 75, 8550, 'area', 0.5, 'Inferno', 'Unlock inferno (7 AP)'),

-- Master progression (76-100)
((SELECT id FROM public.skills WHERE skill_name = 'Fire_Magic'), 80, 9600, 'damage', 10.0, NULL, 'Legendary pyromancer'),
((SELECT id FROM public.skills WHERE skill_name = 'Fire_Magic'), 85, 10710, 'area', 0.6, NULL, 'Massive devastation'),
((SELECT id FROM public.skills WHERE skill_name = 'Fire_Magic'), 90, 11880, 'damage', 12.0, 'Meteor', 'Unlock meteor (8 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Fire_Magic'), 95, 13110, 'resistance', 5.0, NULL, 'Perfect fire mastery'),
((SELECT id FROM public.skills WHERE skill_name = 'Fire_Magic'), 100, 14400, 'area', 0.7, 'Fire Lord', 'Master of all flames');

-- ICE MAGIC PROGRESSION
INSERT INTO public.skill_progression (skill_id, skill_level, experience_required, bonus_type, bonus_value, ability_unlocked, description) VALUES
-- Basic progression (1-25)
((SELECT id FROM public.skills WHERE skill_name = 'Ice_Magic'), 1, 0, 'duration', 1.0, 'Chill', 'Basic cold manipulation (1 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Ice_Magic'), 5, 150, 'resistance', 1.0, NULL, 'Cold resistance begins'),
((SELECT id FROM public.skills WHERE skill_name = 'Ice_Magic'), 10, 360, 'duration', 1.5, 'Freeze', 'Lock mechanisms (1 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Ice_Magic'), 15, 630, 'area', 0.1, 'Cool', 'Temperature control (1 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Ice_Magic'), 20, 960, 'duration', 2.0, NULL, 'Enhanced control effects'),
((SELECT id FROM public.skills WHERE skill_name = 'Ice_Magic'), 25, 1350, 'damage', 3.0, 'Ice Shard', 'Unlock ice shard (2 AP)'),

-- Intermediate progression (26-50)
((SELECT id FROM public.skills WHERE skill_name = 'Ice_Magic'), 30, 1800, 'duration', 2.5, NULL, 'Advanced cryomancy'),
((SELECT id FROM public.skills WHERE skill_name = 'Ice_Magic'), 35, 2310, 'defense', 2.0, 'Ice Armor', 'Unlock ice armor (3 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Ice_Magic'), 40, 2880, 'area', 0.2, NULL, 'Wider freezing effects'),
((SELECT id FROM public.skills WHERE skill_name = 'Ice_Magic'), 45, 3510, 'duration', 3.0, 'Sleet', 'Unlock sleet (4 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Ice_Magic'), 50, 4200, 'resistance', 3.0, NULL, 'Cold immunity'),

-- Advanced progression (51-75)
((SELECT id FROM public.skills WHERE skill_name = 'Ice_Magic'), 55, 4950, 'area', 0.3, 'Blizzard', 'Unlock blizzard (5 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Ice_Magic'), 60, 5760, 'duration', 4.0, NULL, 'Extended freeze duration'),
((SELECT id FROM public.skills WHERE skill_name = 'Ice_Magic'), 65, 6630, 'defense', 4.0, 'Ice Prison', 'Unlock ice prison (6 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Ice_Magic'), 70, 7560, 'area', 0.4, NULL, 'Battlefield control'),
((SELECT id FROM public.skills WHERE skill_name = 'Ice_Magic'), 75, 8550, 'duration', 5.0, NULL, 'Master control effects'),

-- Master progression (76-100)
((SELECT id FROM public.skills WHERE skill_name = 'Ice_Magic'), 80, 9600, 'area', 0.5, NULL, 'Legendary cryomancer'),
((SELECT id FROM public.skills WHERE skill_name = 'Ice_Magic'), 85, 10710, 'duration', 6.0, NULL, 'Perfect control mastery'),
((SELECT id FROM public.skills WHERE skill_name = 'Ice_Magic'), 90, 11880, 'damage', 8.0, 'Absolute Zero', 'Unlock absolute zero (7 AP)'),
((SELECT id FROM public.skills WHERE skill_name = 'Ice_Magic'), 95, 13110, 'area', 0.6, NULL, 'Domain of ice'),
((SELECT id FROM public.skills WHERE skill_name = 'Ice_Magic'), 100, 14400, 'duration', 8.0, 'Ice Lord', 'Master of eternal winter');

-- ========================================
-- EXPERIENCE SCALING FORMULA
-- ========================================

-- Experience required = base_cost * (level^1.5) for exponential scaling
-- This ensures meaningful progression while preventing easy maxing

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_skill_progression_lookup ON public.skill_progression(skill_id, skill_level);
CREATE INDEX IF NOT EXISTS idx_skill_progression_abilities ON public.skill_progression(ability_unlocked) WHERE ability_unlocked IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_skill_progression_bonuses ON public.skill_progression(bonus_type, bonus_value);

-- ========================================
-- COMMENTS AND DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.skill_progression IS 'Level-by-level skill progression with bonuses and ability unlocks';
COMMENT ON COLUMN public.skill_progression.experience_required IS 'Cumulative experience needed to reach this level';
COMMENT ON COLUMN public.skill_progression.bonus_value IS 'Numerical bonus granted at this level';
COMMENT ON COLUMN public.skill_progression.ability_unlocked IS 'Name of ability unlocked at this level';

-- ========================================
-- VALIDATION QUERIES
-- ========================================

-- Verify progression data integrity
-- SELECT s.skill_name, COUNT(sp.skill_level) as levels_defined
-- FROM public.skills s
-- LEFT JOIN public.skill_progression sp ON s.id = sp.skill_id
-- GROUP BY s.skill_name
-- ORDER BY s.skill_order;