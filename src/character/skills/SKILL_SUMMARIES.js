/**
 * Skill Summaries
 * Complete reference for all skills in the game
 * Organized by category for easy reference
 */

// WEAPON SKILLS - Combat effectiveness with different weapon types
const WEAPON_SKILLS = {
  'one_handed': 'One-handed weapons (swords, maces, axes) - Unlocks melee combat abilities and weapon techniques',
  'two_handed': 'Two-handed weapons (greatswords, mauls) - High damage combat with powerful strikes and sweeps', 
  'polearms': 'Spears, halberds, pikes - Reach combat with thrusting attacks and formations',
  'dual_wielding': 'Fighting with two weapons - Fast attacks and complex combos requiring coordination',
  'unarmed': 'Hand-to-hand combat - Martial arts, grappling, and body weaponization techniques',
  'archery': 'Bows and crossbows - Ranged precision combat with special arrows and shooting techniques',
  'throwing': 'Thrown weapons (knives, axes, javelins) - Versatile ranged attacks and trick shots',
  'firearms': 'Guns and black powder weapons - Modern ranged combat with reload mechanics'
};

// ARMOR & DEFENSE SKILLS - Protection and defensive techniques  
const ARMOR_SKILLS = {
  'shields': 'Shield use and blocking - Defensive techniques, shield bashes, and formation fighting',
  'light_armor': 'Leather, cloth armor - Mobility-focused defense with evasion bonuses',
  'heavy_armor': 'Plate, chain mail - Maximum protection with strength requirements',
  'evasion': 'Dodging and mobility - Avoiding attacks through speed and positioning',
  'toughness': 'Physical resilience - Natural armor, pain tolerance, and damage resistance'
};

// MAGIC SCHOOLS - Supernatural abilities and spell casting
const MAGIC_SKILLS = {
  'elemental_fire': 'Fire magic - Burning attacks, heat manipulation, and flame barriers',
  'elemental_ice': 'Ice magic - Freezing attacks, slowing effects, and protective barriers', 
  'elemental_lightning': 'Lightning magic - Fast electrical attacks with stunning and chaining',
  'elemental_earth': 'Earth magic - Stone attacks, defensive buffs, and terrain manipulation',
  'healing': 'Restoration magic - Health recovery, poison curing, and protective wards',
  'necromancy': 'Death magic - Undead summoning, life drain, and fear effects',
  'illusion': 'Mind magic - Invisibility, confusion, and sensory manipulation',
  'transmutation': 'Matter changing - Object transformation and enhancement magic',
  'divination': 'Information magic - Future sight, detection, and knowledge gathering',
  'enchantment': 'Item magic - Weapon enhancement, temporary buffs, and magical crafting',
  'arcane_lore': 'Magical theory - Improves all magic through deep understanding',
  'concentration': 'Focus and meditation - Reduces magic costs and improves control',
  'metamagic': 'Spell modification - Altering magical effects for greater power'
};

// COMBAT TACTICS - Strategic fighting and specialized techniques
const COMBAT_SKILLS = {
  'tactical_combat': 'Battle strategy - Formation fighting, terrain use, and group tactics',
  'combat_reflexes': 'Quick reactions - Initiative bonuses and defensive responses',
  'intimidation': 'Psychological warfare - Fear effects and morale damage',
  'precision': 'Accurate attacks - Critical hit chances and called shots',
  'suppression': 'Area control - Limiting enemy movement and actions',
  'quick_draw': 'Fast weapon access - Initiative bonuses and surprise attacks',
  'called_shots': 'Targeted attacks - Hitting specific body parts for special effects',
  'penetrating_shots': 'Armor piercing - Bypassing defensive equipment',
  'multitasking': 'Multiple actions - Handling complex combat situations'
};

// CRAFTING & CREATION - Item making and enhancement
const CRAFTING_SKILLS = {
  'blacksmithing': 'Metal working - Weapon and armor creation and repair',
  'leatherworking': 'Hide processing - Light armor and accessory crafting',
  'woodworking': 'Carpentry - Weapon handles, bows, and wooden items',
  'alchemy': 'Potion making - Consumable creation and chemical knowledge',
  'cooking': 'Food preparation - Beneficial meals and ingredient processing',
  'herbalism': 'Plant knowledge - Ingredient gathering and natural remedies',
  'gemcutting': 'Jewelry making - Valuable items and magical focuses',
  'fletching': 'Arrow crafting - Ammunition creation with special properties'
};

// EXPLORATION & SURVIVAL - World interaction and navigation
const EXPLORATION_SKILLS = {
  'tracking': 'Following trails - Monster and player movement detection',
  'stealth': 'Hidden movement - Avoiding detection and surprise attacks',
  'climbing': 'Vertical movement - Accessing elevated areas and shortcuts',
  'swimming': 'Water navigation - Underwater exploration and water combat',
  'survival': 'Wilderness skills - Resource gathering and environmental adaptation',
  'navigation': 'Pathfinding - Efficient travel and map knowledge',
  'weather_sense': 'Climate awareness - Predicting conditions and environmental bonuses',
  'monster_lore': 'Creature knowledge - Understanding enemy weaknesses and behaviors'
};

// SOCIAL & MENTAL - Interaction and intelligence skills  
const SOCIAL_SKILLS = {
  'persuasion': 'Social influence - Convincing others and negotiation',
  'deception': 'Lies and misdirection - Hiding truth and creating false information',
  'leadership': 'Group coordination - Party bonuses and command abilities',
  'empathy': 'Emotional intelligence - Understanding others and social bonuses',
  'quick_thinking': 'Mental agility - Fast problem solving and reaction bonuses',
  'coordination': 'Physical harmony - Complex movements and teamwork bonuses',
  'meditation': 'Mental discipline - Focus improvement and stress resistance'
};

// SPECIALIZED - Unique or advanced skills
const SPECIALIZED_SKILLS = {
  'religion': 'Divine knowledge - Holy magic bonuses and undead resistance',
  'protection': 'Defensive mastery - Shielding others and damage mitigation', 
  'alertness': 'Awareness - Detecting hidden threats and avoiding surprise',
  'strength': 'Physical power - Damage bonuses and feat requirements',
  'anatomy': 'Body knowledge - Medical skills and critical strike bonuses'
};

// Combine all skill categories
const ALL_SKILLS = {
  ...WEAPON_SKILLS,
  ...ARMOR_SKILLS, 
  ...MAGIC_SKILLS,
  ...COMBAT_SKILLS,
  ...CRAFTING_SKILLS,
  ...EXPLORATION_SKILLS,
  ...SOCIAL_SKILLS,
  ...SPECIALIZED_SKILLS
};

// Skill categories for organization
const SKILL_CATEGORIES = {
  WEAPON_SKILLS,
  ARMOR_SKILLS,
  MAGIC_SKILLS, 
  COMBAT_SKILLS,
  CRAFTING_SKILLS,
  EXPLORATION_SKILLS,
  SOCIAL_SKILLS,
  SPECIALIZED_SKILLS
};

// Helper function to get skill description
function getSkillDescription(skillKey) {
  return ALL_SKILLS[skillKey] || `Unknown skill: ${skillKey}`;
}

// Helper function to get skills by category
function getSkillsByCategory(categoryName) {
  return SKILL_CATEGORIES[categoryName] || {};
}

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ALL_SKILLS,
    SKILL_CATEGORIES,
    getSkillDescription,
    getSkillsByCategory,
    WEAPON_SKILLS,
    ARMOR_SKILLS,
    MAGIC_SKILLS,
    COMBAT_SKILLS,
    CRAFTING_SKILLS,
    EXPLORATION_SKILLS,
    SOCIAL_SKILLS,
    SPECIALIZED_SKILLS
  };
} else {
  window.SKILL_SUMMARIES = {
    ALL_SKILLS,
    SKILL_CATEGORIES,
    getSkillDescription,
    getSkillsByCategory
  };
}