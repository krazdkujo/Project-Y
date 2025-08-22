-- ========================================
-- TACTICAL ASCII ROGUELIKE - ARMOR DATABASE
-- ========================================
-- Version: 1.0
-- Database: Supabase PostgreSQL
-- Purpose: Complete armor system with defensive strategies and progression
-- Requires: 001_skills_data.sql to be run first
-- ========================================

-- ========================================
-- ARMOR TABLE STRUCTURE
-- ========================================

CREATE TABLE IF NOT EXISTS public.armor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    armor_name TEXT NOT NULL,
    armor_type TEXT CHECK (armor_type IN ('light', 'medium', 'heavy', 'shield', 'clothing', 'robes')),
    armor_slot TEXT CHECK (armor_slot IN ('head', 'chest', 'legs', 'feet', 'hands', 'shield', 'cloak', 'full_body')),
    rarity TEXT CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary', 'artifact')) DEFAULT 'common',
    required_skill_id UUID REFERENCES public.skills(id),
    required_skill_level INTEGER CHECK (required_skill_level >= 0 AND required_skill_level <= 100) DEFAULT 0,
    
    -- Core Defensive Stats
    armor_value INTEGER CHECK (armor_value >= 0) DEFAULT 0, -- Physical damage reduction
    magic_resistance INTEGER CHECK (magic_resistance >= 0) DEFAULT 0, -- Magical damage reduction
    evasion_bonus INTEGER DEFAULT 0, -- Dodge chance modifier
    block_bonus INTEGER DEFAULT 0, -- Blocking effectiveness
    
    -- Movement and Initiative
    initiative_modifier INTEGER DEFAULT 0, -- Can be negative for heavy armor
    movement_penalty INTEGER CHECK (movement_penalty >= 0) DEFAULT 0, -- Reduced movement
    stealth_penalty INTEGER CHECK (stealth_penalty >= 0) DEFAULT 0, -- Stealth difficulty
    
    -- Special Resistances
    fire_resistance INTEGER CHECK (fire_resistance >= 0) DEFAULT 0,
    ice_resistance INTEGER CHECK (ice_resistance >= 0) DEFAULT 0,
    lightning_resistance INTEGER CHECK (lightning_resistance >= 0) DEFAULT 0,
    poison_resistance INTEGER CHECK (poison_resistance >= 0) DEFAULT 0,
    
    -- Durability and Maintenance
    durability_max INTEGER CHECK (durability_max > 0) DEFAULT 100,
    weight DECIMAL(4,1) CHECK (weight > 0) DEFAULT 1.0,
    
    -- Economic Data
    base_value INTEGER CHECK (base_value >= 0) DEFAULT 100,
    crafting_materials JSONB DEFAULT '{}',
    
    -- Description and Properties
    description TEXT,
    special_properties TEXT[], -- Array of special armor properties
    ascii_representation TEXT, -- Character for inventory display
    
    -- Metadata
    is_magical BOOLEAN DEFAULT FALSE,
    is_cursed BOOLEAN DEFAULT FALSE,
    is_blessed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(armor_name)
);

-- ========================================
-- LIGHT ARMOR (10 pieces)
-- ========================================

INSERT INTO public.armor (armor_name, armor_type, armor_slot, rarity, required_skill_id, required_skill_level, armor_value, evasion_bonus, initiative_modifier, stealth_penalty, base_value, description, ascii_representation, special_properties) VALUES

-- Common Light Armor (0-20 skill)
('Leather Tunic', 'light', 'chest', 'common', (SELECT id FROM public.skills WHERE skill_name = 'Light_Armor'), 0, 2, 3, 1, 0, 80, 'Basic leather protection for agile fighters.', '[', ARRAY['Flexible']),
('Padded Cloth', 'light', 'chest', 'common', (SELECT id FROM public.skills WHERE skill_name = 'Light_Armor'), 5, 1, 5, 2, 0, 60, 'Quilted cloth armor for maximum mobility.', '[', ARRAY['Silent', 'Comfortable']),
('Leather Cap', 'light', 'head', 'common', (SELECT id FROM public.skills WHERE skill_name = 'Light_Armor'), 3, 1, 1, 0, 0, 25, 'Simple leather cap for head protection.', '^', NULL),

-- Uncommon Light Armor (15-35 skill)
('Studded Leather', 'light', 'chest', 'uncommon', (SELECT id FROM public.skills WHERE skill_name = 'Light_Armor'), 15, 4, 4, 1, 1, 200, 'Leather reinforced with metal studs.', '[', ARRAY['Reinforced']),
('Elven Cloak', 'light', 'cloak', 'uncommon', (SELECT id FROM public.skills WHERE skill_name = 'Light_Armor'), 20, 1, 8, 3, -2, 400, 'Magical cloak that aids concealment.', '(', ARRAY['Camouflage', 'Magical']),
('Shadow Boots', 'light', 'feet', 'uncommon', (SELECT id FROM public.skills WHERE skill_name = 'Light_Armor'), 25, 1, 3, 2, -3, 300, 'Boots that muffle footsteps.', '^', ARRAY['Silent_Step', 'Shadow_Walk']),

-- Rare Light Armor (30-50 skill)
('Ranger''s Garb', 'light', 'full_body', 'rare', (SELECT id FROM public.skills WHERE skill_name = 'Light_Armor'), 30, 6, 8, 3, -1, 1000, 'Complete outfit for wilderness survival.', '[', ARRAY['Weather_Resistant', 'Camouflage']),
('Assassin''s Leather', 'light', 'chest', 'rare', (SELECT id FROM public.skills WHERE skill_name = 'Light_Armor'), 40, 5, 6, 2, -4, 1500, 'Black leather armor for silent killing.', '[', ARRAY['Assassination', 'Poison_Resistant']),

-- Epic Light Armor (45-70 skill)
('Shadowmeld Armor', 'light', 'full_body', 'epic', (SELECT id FROM public.skills WHERE skill_name = 'Light_Armor'), 50, 8, 12, 4, -5, 3000, 'Armor that blends with shadows.', '[', ARRAY['Shadow_Immunity', 'Phase_Step']),

-- Legendary Light Armor (65+ skill)
('Whisper of the Wind', 'light', 'full_body', 'legendary', (SELECT id FROM public.skills WHERE skill_name = 'Light_Armor'), 70, 10, 20, 8, -3, 8000, 'Legendary armor of the wind masters.', '[', ARRAY['Wind_Walk', 'Ethereal', 'Storm_Resistance']);

-- ========================================
-- MEDIUM ARMOR (8 pieces)
-- ========================================

INSERT INTO public.armor (armor_name, armor_type, armor_slot, rarity, required_skill_id, required_skill_level, armor_value, evasion_bonus, initiative_modifier, movement_penalty, base_value, description, ascii_representation, special_properties) VALUES

-- Common Medium Armor (0-20 skill)
('Chain Shirt', 'medium', 'chest', 'common', (SELECT id FROM public.skills WHERE skill_name = 'Medium_Armor'), 0, 5, 1, 0, 0, 150, 'Flexible chain mail for balanced protection.', '[', ARRAY['Balanced']),
('Scale Mail', 'medium', 'chest', 'common', (SELECT id FROM public.skills WHERE skill_name = 'Medium_Armor'), 10, 6, 0, -1, 1, 250, 'Overlapping scales provide good protection.', '[', ARRAY['Flexible', 'Durable']),

-- Uncommon Medium Armor (15-35 skill)
('Chainmail Hauberk', 'medium', 'chest', 'uncommon', (SELECT id FROM public.skills WHERE skill_name = 'Medium_Armor'), 20, 8, 2, -1, 1, 500, 'Full chain mail shirt with good coverage.', '[', ARRAY['Complete_Coverage']),
('Brigandine', 'medium', 'chest', 'uncommon', (SELECT id FROM public.skills WHERE skill_name = 'Medium_Armor'), 25, 9, 1, 0, 1, 600, 'Fabric with hidden metal plates.', '[', ARRAY['Hidden_Protection', 'Stylish']),

-- Rare Medium Armor (30-50 skill)
('Elven Chain', 'medium', 'chest', 'rare', (SELECT id FROM public.skills WHERE skill_name = 'Medium_Armor'), 35, 10, 4, 1, 0, 1500, 'Incredibly fine elven chainmail.', '[', ARRAY['Magical', 'Weightless', 'Elegant']),
('Dragon Scale', 'medium', 'chest', 'rare', (SELECT id FROM public.skills WHERE skill_name = 'Medium_Armor'), 45, 12, 2, 0, 2, 2000, 'Armor made from actual dragon scales.', '[', ARRAY['Fire_Resistance', 'Dragon_Blessing']),

-- Epic Medium Armor (45-70 skill)
('Mithril Chain', 'medium', 'full_body', 'epic', (SELECT id FROM public.skills WHERE skill_name = 'Medium_Armor'), 55, 15, 6, 2, 0, 4000, 'Legendary mithril provides ultimate protection.', '[', ARRAY['Unbreakable', 'Lightweight', 'Magical']),

-- Legendary Medium Armor (65+ skill)
('Harmony of Elements', 'medium', 'full_body', 'legendary', (SELECT id FROM public.skills WHERE skill_name = 'Medium_Armor'), 75, 18, 8, 3, 0, 10000, 'Armor attuned to all elemental forces.', '[', ARRAY['Elemental_Immunity', 'Balance_Mastery']);

-- ========================================
-- HEAVY ARMOR (8 pieces)
-- ========================================

INSERT INTO public.armor (armor_name, armor_type, armor_slot, rarity, required_skill_id, required_skill_level, armor_value, initiative_modifier, movement_penalty, base_value, description, ascii_representation, special_properties) VALUES

-- Common Heavy Armor (0-20 skill)
('Ring Mail', 'heavy', 'chest', 'common', (SELECT id FROM public.skills WHERE skill_name = 'Heavy_Armor'), 0, 8, -1, 1, 200, 'Interlocked rings provide solid protection.', '[', ARRAY['Solid']),
('Splint Mail', 'heavy', 'chest', 'common', (SELECT id FROM public.skills WHERE skill_name = 'Heavy_Armor'), 15, 12, -2, 2, 400, 'Metal strips over leather backing.', '[', ARRAY['Reinforced', 'Intimidating']),

-- Uncommon Heavy Armor (15-35 skill)
('Plate Mail', 'heavy', 'chest', 'uncommon', (SELECT id FROM public.skills WHERE skill_name = 'Heavy_Armor'), 25, 16, -2, 2, 800, 'Full metal plates for maximum protection.', '[', ARRAY['Heavy_Protection', 'Imposing']),
('Tower Shield Armor', 'heavy', 'full_body', 'uncommon', (SELECT id FROM public.skills WHERE skill_name = 'Heavy_Armor'), 30, 14, -3, 3, 1000, 'Armor designed to work with large shields.', '[', ARRAY['Shield_Synergy', 'Fortress']),

-- Rare Heavy Armor (30-50 skill)
('Dwarven Plate', 'heavy', 'full_body', 'rare', (SELECT id FROM public.skills WHERE skill_name = 'Heavy_Armor'), 40, 20, -1, 2, 2500, 'Masterwork dwarven craftsmanship.', '[', ARRAY['Masterwork', 'Rune_Carved', 'Durable']),
('Knight''s Harness', 'heavy', 'full_body', 'rare', (SELECT id FROM public.skills WHERE skill_name = 'Heavy_Armor'), 45, 18, -2, 2, 2000, 'Full plate armor of a noble knight.', '[', ARRAY['Noble', 'Blessed', 'Honorable']),

-- Epic Heavy Armor (45-70 skill)
('Adamantine Plate', 'heavy', 'full_body', 'epic', (SELECT id FROM public.skills WHERE skill_name = 'Heavy_Armor'), 60, 25, -1, 3, 5000, 'Nearly indestructible adamantine armor.', '[', ARRAY['Indestructible', 'Magic_Resistant', 'Legendary_Material']),

-- Legendary Heavy Armor (65+ skill)
('Aegis of the Titans', 'heavy', 'full_body', 'legendary', (SELECT id FROM public.skills WHERE skill_name = 'Heavy_Armor'), 80, 30, 0, 2, 15000, 'Divine armor of the ancient titans.', '[', ARRAY['Divine_Protection', 'Titan_Strength', 'Immunity']);

-- ========================================
-- SHIELDS (6 pieces)
-- ========================================

INSERT INTO public.armor (armor_name, armor_type, armor_slot, rarity, required_skill_id, required_skill_level, armor_value, block_bonus, initiative_modifier, base_value, description, ascii_representation, special_properties) VALUES

-- Common Shields (0-20 skill)
('Buckler', 'shield', 'shield', 'common', (SELECT id FROM public.skills WHERE skill_name = 'Shields'), 0, 2, 8, 1, 60, 'Small round shield for parrying.', 'o', ARRAY['Parry', 'Quick']),
('Round Shield', 'shield', 'shield', 'common', (SELECT id FROM public.skills WHERE skill_name = 'Shields'), 10, 4, 12, 0, 120, 'Standard wooden and leather shield.', 'O', ARRAY['Balanced']),

-- Uncommon Shields (15-35 skill)
('Kite Shield', 'shield', 'shield', 'uncommon', (SELECT id FROM public.skills WHERE skill_name = 'Shields'), 20, 6, 15, -1, 300, 'Large cavalry shield with good coverage.', 'O', ARRAY['Coverage', 'Mounted_Combat']),
('Tower Shield', 'shield', 'shield', 'uncommon', (SELECT id FROM public.skills WHERE skill_name = 'Shields'), 30, 8, 20, -2, 500, 'Massive shield for maximum protection.', 'O', ARRAY['Full_Cover', 'Wall']),

-- Epic Shields (45+ skill)
('Aegis Shield', 'shield', 'shield', 'epic', (SELECT id FROM public.skills WHERE skill_name = 'Shields'), 50, 10, 25, 0, 3500, 'Legendary shield of divine protection.', 'O', ARRAY['Divine_Block', 'Fear_Immunity', 'Blessed']),

-- Artifact Shield (90+ skill)
('Mirror of Truth', 'shield', 'shield', 'artifact', (SELECT id FROM public.skills WHERE skill_name = 'Shields'), 85, 15, 35, 2, 20000, 'Shield that reflects all attacks.', 'O', ARRAY['Perfect_Reflection', 'Truth_Reveal', 'Reality_Shield']);

-- ========================================
-- ARMOR SET BONUSES
-- ========================================

CREATE TABLE IF NOT EXISTS public.armor_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    set_name TEXT UNIQUE NOT NULL,
    set_description TEXT,
    required_pieces INTEGER CHECK (required_pieces >= 2) DEFAULT 2,
    set_bonus_2_pieces JSONB DEFAULT '{}',
    set_bonus_3_pieces JSONB DEFAULT '{}',
    set_bonus_4_pieces JSONB DEFAULT '{}',
    set_bonus_full JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.armor_sets (set_name, set_description, required_pieces, set_bonus_2_pieces, set_bonus_3_pieces, set_bonus_full) VALUES
('Shadow Walker Set', 'Complete assassin gear for stealth operations', 4, 
 '{"stealth_bonus": 5, "critical_chance": 3}',
 '{"movement_bonus": 1, "poison_resistance": 20}',
 '{"shadow_step": true, "invisibility": true}'),
 
('Knight''s Honor', 'Noble armor set for righteous warriors', 4,
 '{"armor_value": 5, "holy_resistance": 10}',
 '{"damage_bonus": 3, "fear_immunity": true}',
 '{"divine_blessing": true, "undead_turning": true}'),
 
('Elemental Harmony', 'Robes attuned to magical forces', 3,
 '{"magic_resistance": 15, "mana_bonus": 20}',
 '{"spell_damage": 10, "elemental_resistance": 25}',
 '{"elemental_mastery": true, "spell_immunity": true}');

-- ========================================
-- ARMOR ENHANCEMENT SYSTEM
-- ========================================

CREATE TABLE IF NOT EXISTS public.armor_enhancements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    armor_id UUID REFERENCES public.armor(id) ON DELETE CASCADE,
    enhancement_type TEXT CHECK (enhancement_type IN ('enchantment', 'masterwork', 'runic', 'blessed', 'reinforced')),
    enhancement_name TEXT NOT NULL,
    stat_bonuses JSONB DEFAULT '{}',
    special_effects TEXT[],
    enhancement_level INTEGER CHECK (enhancement_level >= 1 AND enhancement_level <= 10) DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ARMOR CONDITION SYSTEM
-- ========================================

CREATE TABLE IF NOT EXISTS public.armor_condition (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    armor_id UUID REFERENCES public.armor(id) ON DELETE CASCADE,
    current_durability INTEGER CHECK (current_durability >= 0),
    damage_reduction_penalty INTEGER CHECK (damage_reduction_penalty >= 0) DEFAULT 0,
    repair_cost INTEGER CHECK (repair_cost >= 0) DEFAULT 0,
    is_broken BOOLEAN DEFAULT FALSE,
    last_repaired TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_armor_type_slot ON public.armor(armor_type, armor_slot);
CREATE INDEX IF NOT EXISTS idx_armor_skill_level ON public.armor(required_skill_id, required_skill_level);
CREATE INDEX IF NOT EXISTS idx_armor_rarity ON public.armor(rarity);
CREATE INDEX IF NOT EXISTS idx_armor_name_search ON public.armor USING gin(armor_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_armor_sets_name ON public.armor_sets(set_name);

-- ========================================
-- COMMENTS AND DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.armor IS 'Complete armor system with defensive strategies and progression';
COMMENT ON TABLE public.armor_sets IS 'Armor set bonuses for wearing complete matching sets';
COMMENT ON TABLE public.armor_enhancements IS 'Enhancement system for magical and masterwork armor improvements';
COMMENT ON TABLE public.armor_condition IS 'Armor durability and repair system';

COMMENT ON COLUMN public.armor.armor_value IS 'Physical damage reduction provided by this armor';
COMMENT ON COLUMN public.armor.magic_resistance IS 'Magical damage reduction provided by this armor';
COMMENT ON COLUMN public.armor.special_properties IS 'Array of special armor abilities and properties';

-- ========================================
-- ARMOR BALANCE VALIDATION
-- ========================================

-- Verify armor progression balance
-- SELECT armor_type, rarity, COUNT(*) as armor_count,
--        AVG(armor_value) as avg_protection, AVG(initiative_modifier) as avg_initiative_impact
-- FROM public.armor
-- GROUP BY armor_type, rarity
-- ORDER BY armor_type,
--   CASE rarity
--     WHEN 'common' THEN 1
--     WHEN 'uncommon' THEN 2  
--     WHEN 'rare' THEN 3
--     WHEN 'epic' THEN 4
--     WHEN 'legendary' THEN 5
--     WHEN 'artifact' THEN 6
--   END;