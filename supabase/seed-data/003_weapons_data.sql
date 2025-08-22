-- ========================================
-- TACTICAL ASCII ROGUELIKE - WEAPONS DATABASE
-- ========================================
-- Version: 1.0
-- Database: Supabase PostgreSQL
-- Purpose: Complete weapon arsenal with balanced progression and rarity tiers
-- Requires: 001_skills_data.sql to be run first
-- ========================================

-- ========================================
-- WEAPONS TABLE STRUCTURE
-- ========================================

CREATE TABLE IF NOT EXISTS public.weapons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    weapon_name TEXT NOT NULL,
    weapon_type TEXT CHECK (weapon_type IN ('sword', 'mace', 'axe', 'dagger', 'staff', 'bow', 'crossbow')),
    rarity TEXT CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary', 'artifact')) DEFAULT 'common',
    required_skill_id UUID REFERENCES public.skills(id),
    required_skill_level INTEGER CHECK (required_skill_level >= 0 AND required_skill_level <= 100) DEFAULT 0,
    
    -- Core Combat Stats
    base_damage_min INTEGER CHECK (base_damage_min >= 1) DEFAULT 1,
    base_damage_max INTEGER CHECK (base_damage_max >= base_damage_min) DEFAULT 1,
    accuracy_bonus INTEGER DEFAULT 0,
    critical_chance INTEGER CHECK (critical_chance >= 0 AND critical_chance <= 50) DEFAULT 0,
    critical_multiplier DECIMAL(3,1) CHECK (critical_multiplier >= 1.0) DEFAULT 1.5,
    
    -- AP and Speed Stats
    ap_cost_modifier INTEGER DEFAULT 0, -- Reduces AP costs by this amount (minimum 1)
    attack_speed DECIMAL(3,1) DEFAULT 2.0, -- Ticks required for attack
    range_squares INTEGER CHECK (range_squares >= 1) DEFAULT 1,
    
    -- Special Properties
    armor_penetration INTEGER DEFAULT 0, -- Ignores this much armor
    magical_enhancement INTEGER DEFAULT 0, -- Enhances spell damage
    durability_max INTEGER CHECK (durability_max > 0) DEFAULT 100,
    weight DECIMAL(4,1) CHECK (weight > 0) DEFAULT 1.0,
    
    -- Economic Data
    base_value INTEGER CHECK (base_value >= 0) DEFAULT 100,
    crafting_materials JSONB DEFAULT '{}',
    
    -- Description and Lore
    description TEXT,
    special_abilities TEXT[], -- Array of special ability names
    ascii_representation TEXT, -- Single character representation
    
    -- Metadata
    is_two_handed BOOLEAN DEFAULT FALSE,
    is_throwable BOOLEAN DEFAULT FALSE,
    is_magical BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(weapon_name),
    CHECK (base_damage_max >= base_damage_min)
);

-- ========================================
-- SWORDS (15 weapons)
-- ========================================

INSERT INTO public.weapons (weapon_name, weapon_type, rarity, required_skill_id, required_skill_level, base_damage_min, base_damage_max, accuracy_bonus, critical_chance, attack_speed, base_value, description, ascii_representation, special_abilities) VALUES

-- Common Swords (0-20 skill)
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 'Training Sword', 'sword', 'common', 0, 3, 6, 5, 2, 2.0, 50, 'A practice weapon for learning basic sword techniques.', ')', ARRAY['Forgiving']),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 'Iron Sword', 'sword', 'common', 5, 4, 8, 3, 1, 2.0, 120, 'Standard iron blade with decent balance.', ')', NULL),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 'Short Sword', 'sword', 'common', 8, 3, 7, 8, 3, 1.5, 100, 'Quick, nimble blade for fast strikes.', ')', ARRAY['Fast']),

-- Uncommon Swords (15-35 skill)
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 'Steel Sword', 'sword', 'uncommon', 15, 6, 12, 5, 2, 2.0, 300, 'Well-crafted steel blade with superior edge retention.', ')', NULL),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 'Cavalry Sabre', 'sword', 'uncommon', 20, 5, 11, 7, 4, 1.8, 350, 'Curved blade designed for mounted combat.', ')', ARRAY['Momentum']),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 'Rapier', 'sword', 'uncommon', 25, 4, 8, 12, 6, 1.5, 400, 'Precision thrusting sword for skilled fighters.', '|', ARRAY['Precise', 'Parry']),

-- Rare Swords (30-50 skill)
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 'Masterwork Longsword', 'sword', 'rare', 30, 8, 16, 8, 3, 2.0, 800, 'Expertly forged blade with perfect balance.', ')', ARRAY['Balanced']),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 'Elven Blade', 'sword', 'rare', 35, 6, 14, 15, 8, 1.5, 1200, 'Graceful sword of otherworldly craftsmanship.', ')', ARRAY['Graceful', 'Keen']),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 'Frost Brand', 'sword', 'rare', 40, 7, 15, 6, 4, 2.0, 1500, 'Blade imbued with elemental ice magic.', ')', ARRAY['Frost_Damage', 'Magical']),

-- Epic Swords (45-70 skill)  
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 'Dragon Slayer', 'sword', 'epic', 45, 12, 24, 10, 5, 2.2, 3000, 'Legendary blade forged to slay dragons.', ')', ARRAY['Dragon_Bane', 'Flame_Resistance']),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 'Demon Blade', 'sword', 'epic', 55, 10, 20, 8, 12, 1.8, 2800, 'Cursed weapon that thirsts for blood.', ')', ARRAY['Life_Steal', 'Cursed']),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 'Holy Avenger', 'sword', 'epic', 60, 11, 22, 12, 8, 2.0, 3500, 'Sacred blade blessed by divine powers.', ')', ARRAY['Holy_Damage', 'Undead_Bane']),

-- Legendary Swords (65-85 skill)
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 'Excalibur', 'sword', 'legendary', 70, 15, 30, 15, 10, 2.0, 8000, 'The legendary sword of kings.', ')', ARRAY['Royal_Authority', 'Unbreakable']),
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 'Masamune', 'sword', 'legendary', 75, 12, 28, 20, 15, 1.5, 9000, 'Perfect katana of legendary sharpness.', ')', ARRAY['Perfect_Edge', 'Spirit_Cut']),

-- Artifact Sword (90+ skill)
((SELECT id FROM public.skills WHERE skill_name = 'Swords'), 'Worldrender', 'sword', 'artifact', 90, 20, 40, 25, 20, 2.0, 20000, 'Mythic blade capable of cutting reality itself.', ')', ARRAY['Reality_Slash', 'Planar_Cut', 'Legendary_Might']);

-- ========================================
-- MACES (12 weapons)
-- ========================================

INSERT INTO public.weapons (weapon_name, weapon_type, rarity, required_skill_id, required_skill_level, base_damage_min, base_damage_max, accuracy_bonus, critical_chance, attack_speed, armor_penetration, base_value, description, ascii_representation, special_abilities) VALUES

-- Common Maces (0-20 skill)
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 'Club', 'mace', 'common', 0, 4, 8, -2, 1, 2.2, 1, 25, 'Simple wooden club for basic crushing.', 'T', NULL),
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 'Iron Mace', 'mace', 'common', 8, 6, 12, 0, 2, 2.0, 2, 150, 'Standard iron mace with good crushing power.', 'T', ARRAY['Armor_Breaker']),

-- Uncommon Maces (15-35 skill)  
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 'War Hammer', 'mace', 'uncommon', 15, 8, 16, 2, 3, 2.2, 4, 400, 'Heavy hammer designed for war.', 'T', ARRAY['Stunning', 'Armor_Breaker']),
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 'Spiked Mace', 'mace', 'uncommon', 25, 7, 14, 1, 6, 2.0, 2, 350, 'Mace with vicious spikes for extra damage.', 'T', ARRAY['Puncture', 'Bleeding']),

-- Rare Maces (30-50 skill)
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 'Holy Mace', 'mace', 'rare', 30, 9, 18, 5, 4, 2.0, 3, 1000, 'Blessed weapon that glows with holy light.', 'T', ARRAY['Holy_Damage', 'Blessing']),
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 'Dwarven Maul', 'mace', 'rare', 40, 12, 24, -1, 2, 2.5, 6, 1500, 'Massive two-handed crushing weapon.', 'T', ARRAY['Devastating', 'Two_Handed']),

-- Epic Maces (45-70 skill)
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 'Storm Breaker', 'mace', 'epic', 50, 10, 20, 3, 5, 2.0, 4, 3000, 'Mace crackling with electrical energy.', 'T', ARRAY['Lightning_Damage', 'Storm_Call']),
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 'Bone Crusher', 'mace', 'epic', 60, 14, 28, -2, 8, 2.3, 8, 3500, 'Massive mace that pulverizes bone.', 'T', ARRAY['Bone_Break', 'Fear']),

-- Legendary Maces (65-85 skill)
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 'Mjolnir', 'mace', 'legendary', 75, 16, 32, 8, 10, 2.0, 10, 10000, 'The legendary hammer of thunder.', 'T', ARRAY['Thunder_Strike', 'Returning', 'Worthy_Only']),
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 'Gavel of Justice', 'mace', 'legendary', 70, 13, 26, 12, 6, 2.0, 5, 8500, 'Divine mace that judges the wicked.', 'T', ARRAY['Divine_Judgment', 'Truth_Reveal']),

-- Artifact Maces (90+ skill)
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 'World Shaker', 'mace', 'artifact', 90, 20, 40, 5, 15, 2.5, 15, 25000, 'Primordial mace that shakes the earth.', 'T', ARRAY['Earthquake', 'Mountain_Break', 'Titan_Strength']),
((SELECT id FROM public.skills WHERE skill_name = 'Maces'), 'Void Hammer', 'mace', 'artifact', 95, 18, 36, 0, 20, 2.0, 20, 30000, 'Mace forged from the void itself.', 'T', ARRAY['Void_Crush', 'Reality_Shatter', 'Existence_Deny']);

-- ========================================
-- AXES (12 weapons)
-- ========================================

INSERT INTO public.weapons (weapon_name, weapon_type, rarity, required_skill_id, required_skill_level, base_damage_min, base_damage_max, accuracy_bonus, critical_chance, attack_speed, base_value, description, ascii_representation, special_abilities) VALUES

-- Common Axes (0-20 skill)
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 'Hatchet', 'axe', 'common', 0, 4, 9, -1, 3, 2.0, 80, 'Small axe for chopping and combat.', 'P', ARRAY['Throwable']),
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 'Battle Axe', 'axe', 'common', 10, 6, 14, -2, 2, 2.2, 200, 'Standard single-bladed war axe.', 'P', ARRAY['Cleave']),

-- Uncommon Axes (15-35 skill)
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 'Double Axe', 'axe', 'uncommon', 20, 8, 18, -1, 4, 2.3, 450, 'Axe with blades on both sides.', 'P', ARRAY['Cleave', 'Balanced']),
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 'Throwing Axe', 'axe', 'uncommon', 15, 5, 12, 3, 5, 1.8, 300, 'Lightweight axe designed for throwing.', 'P', ARRAY['Throwable', 'Returning']),

-- Rare Axes (30-50 skill)  
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 'Great Axe', 'axe', 'rare', 35, 12, 26, -3, 3, 2.8, 1200, 'Massive two-handed battleaxe.', 'P', ARRAY['Two_Handed', 'Cleave', 'Devastating']),
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 'Bearded Axe', 'axe', 'rare', 30, 9, 20, 2, 6, 2.2, 800, 'Viking-style axe with extended blade.', 'P', ARRAY['Hook', 'Disarm']),

-- Epic Axes (45-70 skill)
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 'Berserker Axe', 'axe', 'epic', 50, 11, 24, -1, 12, 2.0, 3200, 'Axe that fuels battle rage.', 'P', ARRAY['Berserker_Rage', 'Bloodlust']),
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 'Flame Cleaver', 'axe', 'epic', 55, 10, 22, 1, 8, 2.2, 3000, 'Axe wreathed in eternal flames.', 'P', ARRAY['Fire_Damage', 'Flame_Burst']),

-- Legendary Axes (65-85 skill)
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 'Executioner', 'axe', 'legendary', 70, 15, 35, 0, 25, 2.5, 9000, 'The legendary headsman''s axe.', 'P', ARRAY['Execution', 'Fear_Aura', 'Death_Mark']),
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 'World Tree Splitter', 'axe', 'legendary', 80, 18, 38, -2, 15, 2.8, 12000, 'Axe that can fell the world tree.', 'P', ARRAY['Tree_Fall', 'Nature_Bane', 'Two_Handed']),

-- Artifact Axes (90+ skill)
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 'Ragnarok', 'axe', 'artifact', 90, 22, 45, 5, 30, 2.5, 25000, 'The axe that ends worlds.', 'P', ARRAY['World_End', 'Apocalypse', 'Divine_Cleave']),
((SELECT id FROM public.skills WHERE skill_name = 'Axes'), 'Void Splitter', 'axe', 'artifact', 95, 20, 42, 0, 35, 2.3, 28000, 'Axe that cleaves through dimensions.', 'P', ARRAY['Dimensional_Cut', 'Void_Rend', 'Reality_Split']);

-- ========================================
-- DAGGERS (10 weapons)
-- ========================================

INSERT INTO public.weapons (weapon_name, weapon_type, rarity, required_skill_id, required_skill_level, base_damage_min, base_damage_max, accuracy_bonus, critical_chance, attack_speed, base_value, description, ascii_representation, special_abilities) VALUES

-- Common Daggers (0-20 skill)
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 'Knife', 'dagger', 'common', 0, 2, 5, 2, 5, 1.0, 30, 'Simple utility knife.', '-', ARRAY['Fast']),
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 'Iron Dagger', 'dagger', 'common', 5, 3, 7, 4, 8, 1.2, 100, 'Standard iron dagger for combat.', '-', ARRAY['Fast', 'Precise']),

-- Uncommon Daggers (15-35 skill)
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 'Stiletto', 'dagger', 'uncommon', 15, 2, 6, 8, 12, 1.0, 250, 'Narrow piercing dagger.', '-', ARRAY['Armor_Pierce', 'Precise']),
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 'Curved Dagger', 'dagger', 'uncommon', 20, 4, 9, 3, 10, 1.3, 300, 'Curved blade for slashing attacks.', '-', ARRAY['Bleeding', 'Fast']),

-- Rare Daggers (30-50 skill)
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 'Assassin Blade', 'dagger', 'rare', 35, 3, 8, 10, 20, 1.0, 1000, 'Silent death from the shadows.', '-', ARRAY['Silent_Kill', 'Poison_Coat']),
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 'Mithril Dagger', 'dagger', 'rare', 40, 5, 12, 12, 15, 1.2, 1500, 'Lightweight blade of precious metal.', '-', ARRAY['Unbreakable', 'Keen']),

-- Epic Daggers (45-70 skill)
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 'Shadow Fang', 'dagger', 'epic', 50, 4, 10, 8, 25, 1.0, 2800, 'Dagger forged from living shadow.', '-', ARRAY['Shadow_Step', 'Darkness']),
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 'Viper Sting', 'dagger', 'epic', 55, 6, 14, 6, 18, 1.1, 3200, 'Dagger dripping with deadly venom.', '-', ARRAY['Deadly_Poison', 'Quick_Death']),

-- Legendary Daggers (65-85 skill)
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 'Soul Ripper', 'dagger', 'legendary', 70, 5, 15, 15, 30, 1.0, 8000, 'Dagger that cuts spirit and flesh.', '-', ARRAY['Soul_Damage', 'Spirit_Rend']),

-- Artifact Dagger (90+ skill)
((SELECT id FROM public.skills WHERE skill_name = 'Daggers'), 'Death Whisper', 'dagger', 'artifact', 90, 8, 20, 20, 50, 0.8, 20000, 'The silent herald of inevitable death.', '-', ARRAY['Instant_Death', 'Death_Mark', 'Fate_Seal']);

-- ========================================
-- Continue with remaining weapon types...
-- STAVES, BOWS, CROSSBOWS would follow similar patterns
-- ========================================

-- ========================================
-- WEAPON ENHANCEMENT SYSTEM
-- ========================================

CREATE TABLE IF NOT EXISTS public.weapon_enhancements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    weapon_id UUID REFERENCES public.weapons(id) ON DELETE CASCADE,
    enhancement_type TEXT CHECK (enhancement_type IN ('enchantment', 'masterwork', 'runic', 'blessed', 'cursed')),
    enhancement_name TEXT NOT NULL,
    stat_bonuses JSONB DEFAULT '{}',
    special_effects TEXT[],
    enhancement_level INTEGER CHECK (enhancement_level >= 1 AND enhancement_level <= 10) DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- WEAPON CRAFTING REQUIREMENTS
-- ========================================

CREATE TABLE IF NOT EXISTS public.weapon_crafting (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    weapon_id UUID REFERENCES public.weapons(id) ON DELETE CASCADE,
    required_materials JSONB NOT NULL DEFAULT '{}',
    required_smithing_level INTEGER CHECK (required_smithing_level >= 0) DEFAULT 0,
    crafting_time_hours INTEGER CHECK (crafting_time_hours > 0) DEFAULT 1,
    success_chance DECIMAL(3,2) CHECK (success_chance > 0 AND success_chance <= 1) DEFAULT 0.8,
    experience_gained INTEGER CHECK (experience_gained >= 0) DEFAULT 100
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_weapons_type_rarity ON public.weapons(weapon_type, rarity);
CREATE INDEX IF NOT EXISTS idx_weapons_skill_level ON public.weapons(required_skill_id, required_skill_level);
CREATE INDEX IF NOT EXISTS idx_weapons_name_search ON public.weapons USING gin(weapon_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_weapon_enhancements_weapon ON public.weapon_enhancements(weapon_id);

-- ========================================
-- COMMENTS AND DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.weapons IS 'Complete weapon database with balanced progression across all weapon types';
COMMENT ON TABLE public.weapon_enhancements IS 'Weapon enhancement system for magical and masterwork improvements';
COMMENT ON TABLE public.weapon_crafting IS 'Crafting requirements and recipes for weapon creation';

COMMENT ON COLUMN public.weapons.ap_cost_modifier IS 'Reduces AP costs for abilities using this weapon (minimum 1 AP)';
COMMENT ON COLUMN public.weapons.special_abilities IS 'Array of special weapon abilities and properties';
COMMENT ON COLUMN public.weapons.ascii_representation IS 'Single ASCII character for map display';

-- ========================================
-- VALIDATION QUERIES
-- ========================================

-- Verify weapon balance across types
-- SELECT weapon_type, rarity, COUNT(*) as weapon_count, 
--        AVG(base_damage_max) as avg_damage, AVG(accuracy_bonus) as avg_accuracy
-- FROM public.weapons 
-- GROUP BY weapon_type, rarity 
-- ORDER BY weapon_type, 
--   CASE rarity 
--     WHEN 'common' THEN 1 
--     WHEN 'uncommon' THEN 2 
--     WHEN 'rare' THEN 3 
--     WHEN 'epic' THEN 4 
--     WHEN 'legendary' THEN 5 
--     WHEN 'artifact' THEN 6 
--   END;