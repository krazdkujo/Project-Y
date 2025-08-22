-- ========================================
-- TACTICAL ASCII ROGUELIKE - ITEMS & CONSUMABLES DATABASE
-- ========================================
-- Version: 1.0
-- Database: Supabase PostgreSQL
-- Purpose: Complete items system with consumables, tools, materials, and crafting components
-- Requires: 001_skills_data.sql to be run first
-- ========================================

-- ========================================
-- ITEMS TABLE STRUCTURE
-- ========================================

CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_name TEXT NOT NULL,
    item_category TEXT CHECK (item_category IN ('consumable', 'material', 'tool', 'quest', 'treasure', 'component', 'book', 'scroll')) NOT NULL,
    item_subcategory TEXT, -- healing, poison, crafting, etc.
    rarity TEXT CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary', 'artifact')) DEFAULT 'common',
    
    -- Usage Properties
    is_consumable BOOLEAN DEFAULT FALSE,
    is_stackable BOOLEAN DEFAULT TRUE,
    max_stack_size INTEGER CHECK (max_stack_size > 0) DEFAULT 99,
    use_ap_cost INTEGER CHECK (use_ap_cost >= 0) DEFAULT 1,
    
    -- Effects and Properties
    effects JSONB DEFAULT '{}', -- Healing, damage, buffs, etc.
    duration_turns INTEGER CHECK (duration_turns >= 0) DEFAULT 0, -- 0 = instant
    cooldown_turns INTEGER CHECK (cooldown_turns >= 0) DEFAULT 0,
    
    -- Requirements
    required_skill_id UUID REFERENCES public.skills(id), -- Skill needed to use effectively
    required_skill_level INTEGER CHECK (required_skill_level >= 0) DEFAULT 0,
    
    -- Economic Data
    base_value INTEGER CHECK (base_value >= 0) DEFAULT 1,
    weight DECIMAL(4,2) CHECK (weight >= 0) DEFAULT 0.1,
    
    -- Crafting Data
    crafting_skill_id UUID REFERENCES public.skills(id), -- Skill needed to craft
    crafting_difficulty INTEGER CHECK (crafting_difficulty >= 0) DEFAULT 0,
    crafting_materials JSONB DEFAULT '{}',
    crafting_yields INTEGER CHECK (crafting_yields > 0) DEFAULT 1,
    
    -- Description and Display
    description TEXT,
    flavor_text TEXT,
    ascii_representation TEXT DEFAULT '?',
    
    -- Metadata
    is_magical BOOLEAN DEFAULT FALSE,
    is_cursed BOOLEAN DEFAULT FALSE,
    is_blessed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(item_name)
);

-- ========================================
-- HEALING CONSUMABLES (25 items)
-- ========================================

INSERT INTO public.items (item_name, item_category, item_subcategory, rarity, is_consumable, max_stack_size, use_ap_cost, effects, base_value, description, ascii_representation) VALUES

-- Basic Healing (Common)
('Healing Potion', 'consumable', 'healing', 'common', TRUE, 10, 1, '{"heal": {"amount": "2d4+2", "type": "instant"}}', 50, 'A red liquid that heals minor wounds.', '!'),
('Herb Bundle', 'consumable', 'healing', 'common', TRUE, 20, 0, '{"heal": {"amount": "1d4+1", "type": "instant"}}', 20, 'Medicinal herbs that provide basic healing.', '&'),
('Bandages', 'consumable', 'healing', 'common', TRUE, 15, 0, '{"heal": {"amount": "1d6", "type": "over_time", "duration": 3}}', 15, 'Clean cloth strips for wound care.', '&'),
('Bread Loaf', 'consumable', 'healing', 'common', TRUE, 5, 0, '{"heal": {"amount": "1d3", "type": "instant"}, "stamina": 10}', 5, 'Nourishing bread that restores vitality.', '%'),
('Water Flask', 'consumable', 'healing', 'common', TRUE, 3, 0, '{"stamina": 20, "thirst": 100}', 3, 'Clean water for sustenance.', '!'),

-- Intermediate Healing (Uncommon)
('Greater Healing Potion', 'consumable', 'healing', 'uncommon', TRUE, 8, 1, '{"heal": {"amount": "3d4+4", "type": "instant"}}', 150, 'More potent healing elixir.', '!'),
('Regeneration Elixir', 'consumable', 'healing', 'uncommon', TRUE, 5, 2, '{"heal": {"amount": "1d4+1", "type": "over_time", "duration": 10}}', 200, 'Slowly regenerates health over time.', '!'),
('Antidote', 'consumable', 'healing', 'uncommon', TRUE, 10, 1, '{"cure": ["poison", "disease"], "heal": {"amount": "1d4"}}', 100, 'Neutralizes poisons and diseases.', '!'),
('Stamina Tonic', 'consumable', 'healing', 'uncommon', TRUE, 8, 1, '{"stamina": 50, "fatigue_resistance": 5}', 80, 'Restores energy and reduces fatigue.', '!'),
('Mana Potion', 'consumable', 'healing', 'uncommon', TRUE, 8, 1, '{"mana": 30, "spell_efficiency": 10}', 120, 'Restores magical energy.', '!'),

-- Advanced Healing (Rare)
('Superior Healing Potion', 'consumable', 'healing', 'rare', TRUE, 5, 1, '{"heal": {"amount": "4d4+8", "type": "instant"}}', 400, 'Powerful healing draught.', '!'),
('Elixir of Life', 'consumable', 'healing', 'rare', TRUE, 3, 2, '{"heal": {"amount": "full"}, "resurrection": 1}', 1000, 'Legendary healing elixir.', '!'),
('Phoenix Feather Tea', 'consumable', 'healing', 'rare', TRUE, 2, 1, '{"heal": {"amount": "2d6+6"}, "fire_resistance": 50}', 800, 'Tea brewed with phoenix feather.', '!'),
('Dragon''s Blood Tonic', 'consumable', 'healing', 'rare', TRUE, 2, 2, '{"heal": {"amount": "3d6+9"}, "temp_hp": 20}', 1200, 'Powerful tonic made from dragon blood.', '!'),
('Blessed Water', 'consumable', 'healing', 'rare', TRUE, 5, 1, '{"heal": {"amount": "2d4+4"}, "holy_blessing": 10, "undead_protection": 100}', 300, 'Water blessed by divine powers.', '!'),

-- Specialized Healing (Epic)
('Ambrosia', 'consumable', 'healing', 'epic', TRUE, 1, 3, '{"heal": {"amount": "full"}, "all_stats": 5, "temp_hp": 50}', 3000, 'Food of the gods.', '!'),
('Unicorn Tears', 'consumable', 'healing', 'epic', TRUE, 1, 2, '{"heal": {"amount": "full"}, "purity": 100, "curse_removal": true}', 5000, 'Tears of a pure unicorn.', '!'),
('Philosopher''s Elixir', 'consumable', 'healing', 'epic', TRUE, 1, 3, '{"heal": {"amount": "full"}, "mana": "full", "temporary_immortality": 3}', 8000, 'Alchemical masterpiece.', '!'),

-- Legendary Healing (Legendary)
('Nectar of Immortality', 'consumable', 'healing', 'legendary', TRUE, 1, 5, '{"heal": {"amount": "full"}, "resurrection": "unlimited", "age_reverse": 1}', 15000, 'Grants temporary immortality.', '!'),
('World Tree Sap', 'consumable', 'healing', 'legendary', TRUE, 1, 4, '{"heal": {"amount": "full"}, "nature_blessing": "permanent", "growth": true}', 12000, 'Sap from the world tree.', '!'),

-- Artifact Healing (Artifact)
('Grail of Eternal Life', 'consumable', 'healing', 'artifact', TRUE, 1, 8, '{"heal": {"amount": "full"}, "true_immortality": 1, "divine_ascension": true}', 50000, 'The ultimate healing artifact.', '!');

-- ========================================
-- COMBAT CONSUMABLES (20 items)
-- ========================================

INSERT INTO public.items (item_name, item_category, item_subcategory, rarity, is_consumable, max_stack_size, use_ap_cost, effects, duration_turns, base_value, description, ascii_representation) VALUES

-- Damage Potions (Common)
('Liquid Fire', 'consumable', 'damage', 'common', TRUE, 10, 2, '{"damage": {"amount": "2d4", "type": "fire", "area": 1}}', 0, 60, 'Throwable vial of alchemical fire.', '!'),
('Acid Vial', 'consumable', 'damage', 'common', TRUE, 10, 2, '{"damage": {"amount": "1d6", "type": "acid", "armor_damage": 5}}', 3, 50, 'Corrosive acid that damages armor.', '!'),
('Poison Dart', 'consumable', 'damage', 'common', TRUE, 20, 1, '{"damage": {"amount": "1d4", "type": "poison"}, "poison": 3}', 0, 25, 'Small dart coated with poison.', '-'),
('Smoke Bomb', 'consumable', 'damage', 'common', TRUE, 8, 1, '{"concealment": 5, "area": 2, "vision_block": true}', 5, 40, 'Creates a cloud of concealing smoke.', '*'),
('Flash Powder', 'consumable', 'damage', 'common', TRUE, 8, 1, '{"blind": 2, "stun": 1, "area": 1}', 0, 45, 'Blinds and stuns nearby enemies.', '*'),

-- Buff Potions (Uncommon)
('Strength Elixir', 'consumable', 'buff', 'uncommon', TRUE, 5, 1, '{"damage_bonus": 5, "carry_capacity": 20}', 10, 150, 'Increases physical power temporarily.', '!'),
('Speed Potion', 'consumable', 'buff', 'uncommon', TRUE, 5, 1, '{"initiative": 5, "movement": 1, "attack_speed": 0.5}', 8, 120, 'Grants supernatural speed.', '!'),
('Eagle Eye Elixir', 'consumable', 'buff', 'uncommon', TRUE, 5, 1, '{"accuracy": 10, "critical_chance": 5, "perception": 5}', 10, 100, 'Enhances aim and perception.', '!'),
('Iron Skin Potion', 'consumable', 'buff', 'uncommon', TRUE, 5, 1, '{"armor_value": 5, "damage_resistance": 10}', 12, 180, 'Hardens skin like metal.', '!'),
('Mage Shield', 'consumable', 'buff', 'uncommon', TRUE, 5, 2, '{"magic_resistance": 30, "spell_reflection": 20}', 8, 200, 'Protects against magical attacks.', '!'),

-- Tactical Items (Rare)
('Explosive Charge', 'consumable', 'damage', 'rare', TRUE, 3, 3, '{"damage": {"amount": "4d6", "type": "explosive", "area": 3}}', 0, 500, 'Powerful explosive device.', '*'),
('Invisibility Potion', 'consumable', 'buff', 'rare', TRUE, 2, 2, '{"invisibility": true, "stealth": 20}', 5, 800, 'Grants true invisibility.', '!'),
('Berserker Rage', 'consumable', 'buff', 'rare', TRUE, 2, 1, '{"damage": 10, "attack_speed": 1.0, "pain_immunity": true}', 6, 600, 'Induces battle frenzy.', '!'),
('Time Dilation', 'consumable', 'buff', 'rare', TRUE, 1, 4, '{"extra_actions": 2, "time_slow": true}', 3, 1500, 'Slows time around the user.', '!'),
('Dragon''s Breath', 'consumable', 'damage', 'rare', TRUE, 2, 4, '{"damage": {"amount": "6d6", "type": "fire", "line": 5}}', 0, 1200, 'Unleashes a line of dragon fire.', '!'),

-- Legendary Combat Items (Epic/Legendary)
('God''s Wrath', 'consumable', 'damage', 'epic', TRUE, 1, 6, '{"damage": {"amount": "10d6", "type": "divine", "area": 5}}', 0, 4000, 'Divine punishment in liquid form.', '!'),
('Titan''s Strength', 'consumable', 'buff', 'epic', TRUE, 1, 3, '{"damage": 20, "size": 2, "titan_power": true}', 10, 3500, 'Grants the strength of titans.', '!'),
('Phoenix Essence', 'consumable', 'buff', 'legendary', TRUE, 1, 4, '{"resurrection": "automatic", "fire_immunity": true, "phoenix_form": true}', 20, 8000, 'Essence of a legendary phoenix.', '!'),
('Void Bomb', 'consumable', 'damage', 'legendary', TRUE, 1, 8, '{"damage": {"amount": "reality", "type": "void", "area": 10}}', 0, 15000, 'Weapon of ultimate destruction.', '*'),
('Elixir of Godhood', 'consumable', 'buff', 'artifact', TRUE, 1, 10, '{"ascension": true, "divine_power": "unlimited", "immortality": "permanent"}', 99, 100000, 'Grants temporary divinity.', '!');

-- ========================================
-- CRAFTING MATERIALS (30 items)
-- ========================================

INSERT INTO public.items (item_name, item_category, item_subcategory, rarity, is_stackable, max_stack_size, base_value, description, ascii_representation, crafting_skill_id) VALUES

-- Basic Materials (Common)
('Iron Ore', 'material', 'metal', 'common', TRUE, 50, 10, 'Raw iron for smithing.', '*', (SELECT id FROM public.skills WHERE skill_name = 'Smithing')),
('Leather Scraps', 'material', 'organic', 'common', TRUE, 99, 5, 'Pieces of animal hide.', '&', (SELECT id FROM public.skills WHERE skill_name = 'Smithing')),
('Wood Planks', 'material', 'organic', 'common', TRUE, 50, 3, 'Processed lumber for crafting.', '|', (SELECT id FROM public.skills WHERE skill_name = 'Smithing')),
('Cotton Cloth', 'material', 'textile', 'common', TRUE, 99, 2, 'Basic textile material.', '&', (SELECT id FROM public.skills WHERE skill_name = 'Smithing')),
('Glass Vials', 'material', 'container', 'common', TRUE, 30, 8, 'Empty vials for alchemy.', '!', (SELECT id FROM public.skills WHERE skill_name = 'Alchemy')),

-- Herbs and Reagents (Common to Uncommon)
('Healing Herbs', 'material', 'herb', 'common', TRUE, 99, 15, 'Basic medicinal plants.', '&', (SELECT id FROM public.skills WHERE skill_name = 'Alchemy')),
('Fire Blossom', 'material', 'herb', 'uncommon', TRUE, 50, 25, 'Flower with fire-magical properties.', '&', (SELECT id FROM public.skills WHERE skill_name = 'Alchemy')),
('Frost Mint', 'material', 'herb', 'uncommon', TRUE, 50, 25, 'Herb that contains ice essence.', '&', (SELECT id FROM public.skills WHERE skill_name = 'Alchemy')),
('Thunder Root', 'material', 'herb', 'uncommon', TRUE, 50, 30, 'Root charged with electrical energy.', '&', (SELECT id FROM public.skills WHERE skill_name = 'Alchemy')),
('Poison Ivy', 'material', 'herb', 'common', TRUE, 99, 12, 'Toxic plant for poison crafting.', '&', (SELECT id FROM public.skills WHERE skill_name = 'Alchemy')),

-- Metal Materials (Uncommon to Rare)
('Steel Ingot', 'material', 'metal', 'uncommon', TRUE, 30, 50, 'Refined steel for quality weapons.', '*', (SELECT id FROM public.skills WHERE skill_name = 'Smithing')),
('Silver Bar', 'material', 'metal', 'uncommon', TRUE, 20, 100, 'Pure silver with anti-undead properties.', '*', (SELECT id FROM public.skills WHERE skill_name = 'Smithing')),
('Gold Bar', 'material', 'metal', 'rare', TRUE, 10, 500, 'Precious gold for enchantments.', '*', (SELECT id FROM public.skills WHERE skill_name = 'Enchanting')),
('Mithril Ore', 'material', 'metal', 'rare', TRUE, 5, 1000, 'Legendary lightweight metal.', '*', (SELECT id FROM public.skills WHERE skill_name = 'Smithing')),
('Adamantine Shard', 'material', 'metal', 'epic', TRUE, 3, 3000, 'Fragment of indestructible metal.', '*', (SELECT id FROM public.skills WHERE skill_name = 'Smithing')),

-- Magical Components (Rare to Legendary)
('Magic Crystal', 'material', 'magical', 'rare', TRUE, 10, 800, 'Crystal infused with raw magic.', '*', (SELECT id FROM public.skills WHERE skill_name = 'Enchanting')),
('Dragon Scale', 'material', 'magical', 'epic', TRUE, 5, 2000, 'Scale from an ancient dragon.', '&', (SELECT id FROM public.skills WHERE skill_name = 'Enchanting')),
('Phoenix Feather', 'material', 'magical', 'epic', TRUE, 3, 2500, 'Feather of rebirth and fire.', '&', (SELECT id FROM public.skills WHERE skill_name = 'Enchanting')),
('Unicorn Hair', 'material', 'magical', 'epic', TRUE, 2, 3000, 'Hair from a pure unicorn.', '&', (SELECT id FROM public.skills WHERE skill_name = 'Enchanting')),
('Demon Heart', 'material', 'magical', 'epic', TRUE, 2, 2800, 'Still-beating heart of a demon.', '*', (SELECT id FROM public.skills WHERE skill_name = 'Enchanting')),

-- Legendary Materials (Legendary to Artifact)
('Starlight Essence', 'material', 'magical', 'legendary', TRUE, 1, 8000, 'Condensed light from distant stars.', '*', (SELECT id FROM public.skills WHERE skill_name = 'Enchanting')),
('Void Crystal', 'material', 'magical', 'legendary', TRUE, 1, 10000, 'Crystal formed in the void between worlds.', '*', (SELECT id FROM public.skills WHERE skill_name = 'Enchanting')),
('Time Shard', 'material', 'magical', 'legendary', TRUE, 1, 12000, 'Fragment of crystallized time.', '*', (SELECT id FROM public.skills WHERE skill_name = 'Enchanting')),
('God''s Tear', 'material', 'magical', 'artifact', TRUE, 1, 25000, 'Tear shed by a divine being.', '*', (SELECT id FROM public.skills WHERE skill_name = 'Enchanting')),
('World Seed', 'material', 'magical', 'artifact', TRUE, 1, 50000, 'Seed capable of growing new worlds.', '*', (SELECT id FROM public.skills WHERE skill_name = 'Enchanting')),

-- Gemstones (Uncommon to Epic)
('Ruby', 'material', 'gem', 'uncommon', TRUE, 10, 200, 'Red gemstone associated with fire.', '*', (SELECT id FROM public.skills WHERE skill_name = 'Enchanting')),
('Sapphire', 'material', 'gem', 'uncommon', TRUE, 10, 200, 'Blue gemstone associated with ice.', '*', (SELECT id FROM public.skills WHERE skill_name = 'Enchanting')),
('Emerald', 'material', 'gem', 'uncommon', TRUE, 10, 200, 'Green gemstone associated with earth.', '*', (SELECT id FROM public.skills WHERE skill_name = 'Enchanting')),
('Diamond', 'material', 'gem', 'rare', TRUE, 5, 1000, 'Perfect crystal of pure carbon.', '*', (SELECT id FROM public.skills WHERE skill_name = 'Enchanting')),
('Black Opal', 'material', 'gem', 'epic', TRUE, 3, 2000, 'Rare gemstone with dark powers.', '*', (SELECT id FROM public.skills WHERE skill_name = 'Enchanting')),
('Philosopher''s Stone', 'material', 'gem', 'legendary', TRUE, 1, 15000, 'Legendary stone of transformation.', '*', (SELECT id FROM public.skills WHERE skill_name = 'Alchemy'));

-- ========================================
-- TOOLS AND EQUIPMENT (15 items)
-- ========================================

INSERT INTO public.items (item_name, item_category, item_subcategory, rarity, is_stackable, max_stack_size, use_ap_cost, effects, base_value, description, ascii_representation) VALUES

-- Basic Tools (Common)
('Rope', 'tool', 'utility', 'common', TRUE, 10, 2, '{"climbing_aid": true, "binding": true}', 20, '50 feet of strong rope.', '~'),
('Torch', 'tool', 'utility', 'common', TRUE, 20, 1, '{"light_radius": 3, "fire_source": true}', 5, 'Wooden torch for illumination.', '|'),
('Lockpicks', 'tool', 'utility', 'common', FALSE, 1, 2, '{"lockpicking_bonus": 10}', 100, 'Tools for opening locks.', '-'),
('Shovel', 'tool', 'utility', 'common', FALSE, 1, 3, '{"digging": true, "impromptu_weapon": true}', 50, 'Tool for digging and excavation.', '|'),
('Grappling Hook', 'tool', 'utility', 'uncommon', FALSE, 1, 3, '{"climbing_aid": true, "ranged_utility": true}', 150, 'Hook and rope for climbing.', '}'),

-- Advanced Tools (Uncommon to Rare)
('Master Lockpicks', 'tool', 'utility', 'uncommon', FALSE, 1, 2, '{"lockpicking_bonus": 20, "silent": true}', 300, 'High-quality lockpicking tools.', '-'),
('Magic Compass', 'tool', 'utility', 'rare', FALSE, 1, 1, '{"navigation": true, "magic_detection": true}', 500, 'Compass that points to magical sources.', 'o'),
('Portable Anvil', 'tool', 'crafting', 'rare', FALSE, 1, 0, '{"smithing_bonus": 15, "field_repair": true}', 800, 'Lightweight anvil for field smithing.', '^'),
('Alchemist Kit', 'tool', 'crafting', 'uncommon', FALSE, 1, 0, '{"alchemy_bonus": 10, "potion_brewing": true}', 400, 'Complete alchemy laboratory.', '&'),
('Enchanter''s Focus', 'tool', 'crafting', 'rare', FALSE, 1, 0, '{"enchanting_bonus": 20, "magic_amplification": true}', 1200, 'Crystal focus for enchantment work.', '*'),

-- Legendary Tools (Epic to Legendary)
('Thieves'' Guild Kit', 'tool', 'utility', 'epic', FALSE, 1, 1, '{"lockpicking_bonus": 30, "trap_detection": 20, "stealth_bonus": 10}', 2500, 'Master thief''s complete toolkit.', '-'),
('Bag of Holding', 'tool', 'utility', 'epic', FALSE, 1, 0, '{"extra_inventory": 100, "weight_reduction": 90}', 5000, 'Magical bag with extra-dimensional space.', '('),
('Wand of Wonder', 'tool', 'utility', 'legendary', FALSE, 1, 3, '{"random_magic": true, "unpredictable": true}', 8000, 'Unpredictable magical wand.', '-'),
('Portable Hole', 'tool', 'utility', 'legendary', FALSE, 1, 2, '{"instant_storage": true, "dimensional_pocket": true}', 12000, 'Creates temporary dimensional storage.', 'o'),
('Staff of Creation', 'tool', 'crafting', 'artifact', FALSE, 1, 5, '{"instant_crafting": true, "material_transmutation": true}', 50000, 'Legendary crafting implement.', '|');

-- ========================================
-- SCROLLS AND BOOKS (10 items)
-- ========================================

INSERT INTO public.items (item_name, item_category, item_subcategory, rarity, is_consumable, max_stack_size, use_ap_cost, effects, base_value, description, ascii_representation) VALUES

-- Spell Scrolls (Common to Rare)
('Scroll of Healing', 'scroll', 'spell', 'common', TRUE, 5, 2, '{"heal": {"amount": "3d4+3", "type": "instant"}}', 80, 'Single-use healing spell.', '?'),
('Scroll of Fireball', 'scroll', 'spell', 'uncommon', TRUE, 3, 3, '{"damage": {"amount": "4d6", "type": "fire", "area": 2}}', 200, 'Explosive fire magic.', '?'),
('Scroll of Lightning', 'scroll', 'spell', 'uncommon', TRUE, 3, 2, '{"damage": {"amount": "3d6", "type": "lightning", "line": 4}}', 180, 'Chain lightning spell.', '?'),
('Scroll of Teleport', 'scroll', 'spell', 'rare', TRUE, 2, 4, '{"teleport": {"range": 10, "instant": true}}', 600, 'Instant transportation magic.', '?'),
('Scroll of Time Stop', 'scroll', 'spell', 'epic', TRUE, 1, 8, '{"time_stop": {"duration": 3, "extra_actions": 5}}', 3000, 'Stops time for strategic advantage.', '?'),

-- Skill Books (Uncommon to Epic)
('Combat Manual', 'book', 'skill', 'uncommon', TRUE, 1, 0, '{"skill_bonus": {"combat": 5}, "permanent": true}', 500, 'Increases combat skill permanently.', '?'),
('Tome of Fire Magic', 'book', 'skill', 'rare', TRUE, 1, 0, '{"skill_bonus": {"fire_magic": 10}, "permanent": true}', 1200, 'Advanced fire magic techniques.', '?'),
('Master''s Smithing Guide', 'book', 'skill', 'rare', TRUE, 1, 0, '{"skill_bonus": {"smithing": 8}, "crafting_recipes": 10}', 1000, 'Legendary smithing knowledge.', '?'),
('Codex of Shadows', 'book', 'skill', 'epic', TRUE, 1, 0, '{"skill_bonus": {"stealth": 15}, "shadow_abilities": true}', 2500, 'Secrets of shadow mastery.', '?'),
('Akashic Records', 'book', 'skill', 'artifact', TRUE, 1, 0, '{"all_skills": 20, "unlimited_knowledge": true}', 25000, 'Contains all knowledge of the universe.', '?');

-- ========================================
-- ITEM INTERACTION SYSTEM
-- ========================================

CREATE TABLE IF NOT EXISTS public.item_combinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    primary_item_id UUID REFERENCES public.items(id),
    secondary_item_id UUID REFERENCES public.items(id),
    result_item_id UUID REFERENCES public.items(id),
    required_skill_id UUID REFERENCES public.skills(id),
    required_skill_level INTEGER DEFAULT 0,
    success_chance DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Example combinations
INSERT INTO public.item_combinations (primary_item_id, secondary_item_id, result_item_id, required_skill_id, required_skill_level, success_chance) VALUES
((SELECT id FROM public.items WHERE item_name = 'Healing Herbs'), 
 (SELECT id FROM public.items WHERE item_name = 'Glass Vials'), 
 (SELECT id FROM public.items WHERE item_name = 'Healing Potion'),
 (SELECT id FROM public.skills WHERE skill_name = 'Alchemy'), 15, 0.8),
 
((SELECT id FROM public.items WHERE item_name = 'Fire Blossom'), 
 (SELECT id FROM public.items WHERE item_name = 'Glass Vials'), 
 (SELECT id FROM public.items WHERE item_name = 'Liquid Fire'),
 (SELECT id FROM public.skills WHERE skill_name = 'Alchemy'), 25, 0.7);

-- ========================================
-- ITEM CONDITION SYSTEM
-- ========================================

CREATE TABLE IF NOT EXISTS public.item_condition (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
    current_durability INTEGER CHECK (current_durability >= 0),
    effectiveness_penalty INTEGER CHECK (effectiveness_penalty >= 0) DEFAULT 0,
    is_broken BOOLEAN DEFAULT FALSE,
    repair_cost INTEGER CHECK (repair_cost >= 0) DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_items_category_subcategory ON public.items(item_category, item_subcategory);
CREATE INDEX IF NOT EXISTS idx_items_rarity ON public.items(rarity);
CREATE INDEX IF NOT EXISTS idx_items_consumable ON public.items(is_consumable);
CREATE INDEX IF NOT EXISTS idx_items_name_search ON public.items USING gin(item_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_item_combinations_lookup ON public.item_combinations(primary_item_id, secondary_item_id);

-- ========================================
-- COMMENTS AND DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.items IS 'Complete items system including consumables, materials, tools, and books';
COMMENT ON TABLE public.item_combinations IS 'Crafting and combination recipes for creating new items';
COMMENT ON TABLE public.item_condition IS 'Durability and condition tracking for non-consumable items';

COMMENT ON COLUMN public.items.effects IS 'JSON object defining item effects and bonuses';
COMMENT ON COLUMN public.items.crafting_materials IS 'JSON object listing required materials for crafting';
COMMENT ON COLUMN public.items.use_ap_cost IS 'Action Points required to use this item in combat';

-- ========================================
-- ITEM BALANCE VALIDATION
-- ========================================

-- Verify item distribution across categories and rarities
-- SELECT item_category, rarity, COUNT(*) as item_count,
--        AVG(base_value) as avg_value
-- FROM public.items
-- GROUP BY item_category, rarity
-- ORDER BY item_category,
--   CASE rarity
--     WHEN 'common' THEN 1
--     WHEN 'uncommon' THEN 2
--     WHEN 'rare' THEN 3
--     WHEN 'epic' THEN 4
--     WHEN 'legendary' THEN 5
--     WHEN 'artifact' THEN 6
--   END;