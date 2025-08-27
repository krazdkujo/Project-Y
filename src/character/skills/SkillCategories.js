/**
 * Skill Categories and Definitions
 * 15 categories with 10-15 skills each = 150+ total skills
 */

const SKILL_CATEGORIES = {
  // 1. COMBAT (15 skills)
  combat: {
    name: 'Combat',
    description: 'Physical combat and martial prowess',
    skills: {
      one_handed: { name: 'One-Handed Weapons', description: 'Swords, axes, maces, and similar weapons' },
      two_handed: { name: 'Two-Handed Weapons', description: 'Great swords, war hammers, and large weapons' },
      dual_wielding: { name: 'Dual Wielding', description: 'Fighting with two weapons simultaneously' },
      polearms: { name: 'Polearms', description: 'Spears, halberds, and reach weapons' },
      unarmed: { name: 'Unarmed Combat', description: 'Fighting with fists and martial arts' },
      shields: { name: 'Shield Use', description: 'Defensive fighting with shields' },
      parrying: { name: 'Parrying', description: 'Deflecting attacks with weapons' },
      riposte: { name: 'Riposte', description: 'Counter-attacking after successful blocks' },
      critical_strikes: { name: 'Critical Strikes', description: 'Landing devastating blows' },
      weapon_mastery: { name: 'Weapon Mastery', description: 'Understanding weapon properties and techniques' },
      combat_reflexes: { name: 'Combat Reflexes', description: 'Quick reactions in battle' },
      berserking: { name: 'Berserking', description: 'Fighting in uncontrolled fury' },
      tactical_combat: { name: 'Tactical Combat', description: 'Strategic positioning and battlefield awareness' },
      disarming: { name: 'Disarming', description: 'Removing opponents\' weapons' },
      intimidation: { name: 'Intimidation', description: 'Frightening enemies in combat' }
    }
  },

  // 2. RANGED (12 skills)
  ranged: {
    name: 'Ranged Combat',
    description: 'Projectile weapons and distance fighting',
    skills: {
      archery: { name: 'Archery', description: 'Bows and crossbows' },
      throwing: { name: 'Throwing Weapons', description: 'Knives, axes, and javelins' },
      firearms: { name: 'Firearms', description: 'Guns and gunpowder weapons' },
      slings: { name: 'Slings', description: 'Simple projectile weapons' },
      precision: { name: 'Precision', description: 'Accurate targeting and aiming' },
      quick_draw: { name: 'Quick Draw', description: 'Rapidly readying ranged weapons' },
      moving_shots: { name: 'Moving Shots', description: 'Shooting while in motion' },
      penetrating_shots: { name: 'Penetrating Shots', description: 'Piercing armor and shields' },
      multishot: { name: 'Multishot', description: 'Firing multiple projectiles' },
      ricochet: { name: 'Ricochet', description: 'Bouncing shots off surfaces' },
      called_shots: { name: 'Called Shots', description: 'Targeting specific body parts' },
      suppression: { name: 'Suppression', description: 'Area denial with ranged attacks' }
    }
  },

  // 3. MAGIC (15 skills)
  magic: {
    name: 'Magic',
    description: 'Arcane arts and spellcasting',
    skills: {
      elemental_fire: { name: 'Fire Magic', description: 'Flames, heat, and burning' },
      elemental_ice: { name: 'Ice Magic', description: 'Cold, frost, and freezing' },
      elemental_lightning: { name: 'Lightning Magic', description: 'Electricity and storms' },
      elemental_earth: { name: 'Earth Magic', description: 'Stone, metal, and gravity' },
      necromancy: { name: 'Necromancy', description: 'Death magic and undead' },
      healing: { name: 'Healing Magic', description: 'Restoration and regeneration' },
      illusion: { name: 'Illusion Magic', description: 'Deception and mind tricks' },
      enchantment: { name: 'Enchantment', description: 'Mind control and charm' },
      divination: { name: 'Divination', description: 'Seeing the future and hidden things' },
      teleportation: { name: 'Teleportation', description: 'Instant movement and portals' },
      summoning: { name: 'Summoning', description: 'Calling creatures and objects' },
      protection: { name: 'Protection Magic', description: 'Shields and defensive spells' },
      dispelling: { name: 'Dispelling', description: 'Removing and countering magic' },
      metamagic: { name: 'Metamagic', description: 'Modifying and enhancing spells' },
      ritual_magic: { name: 'Ritual Magic', description: 'Complex ceremonial spells' }
    }
  },

  // 4. DEFENSE (10 skills)
  defense: {
    name: 'Defense',
    description: 'Protection and damage mitigation',
    skills: {
      armor_use: { name: 'Armor Use', description: 'Wearing and moving in armor effectively' },
      dodging: { name: 'Dodging', description: 'Avoiding attacks through movement' },
      toughness: { name: 'Toughness', description: 'Resisting damage and effects' },
      damage_reduction: { name: 'Damage Reduction', description: 'Minimizing incoming harm' },
      spell_resistance: { name: 'Spell Resistance', description: 'Resisting magical effects' },
      endurance: { name: 'Endurance', description: 'Lasting longer in combat and exertion' },
      recovery: { name: 'Recovery', description: 'Healing and recuperating quickly' },
      iron_will: { name: 'Iron Will', description: 'Mental resistance and determination' },
      evasion: { name: 'Evasion', description: 'Completely avoiding area effects' },
      last_stand: { name: 'Last Stand', description: 'Fighting effectively when near death' }
    }
  },

  // 5. STEALTH (12 skills)
  stealth: {
    name: 'Stealth',
    description: 'Sneaking, hiding, and covert operations',
    skills: {
      sneaking: { name: 'Sneaking', description: 'Moving silently and unseen' },
      hiding: { name: 'Hiding', description: 'Concealing oneself from view' },
      lockpicking: { name: 'Lockpicking', description: 'Opening locks without keys' },
      pickpocketing: { name: 'Pickpocketing', description: 'Stealing from others unnoticed' },
      trap_detection: { name: 'Trap Detection', description: 'Finding hidden dangers' },
      trap_disarmament: { name: 'Trap Disarmament', description: 'Safely removing traps' },
      backstab: { name: 'Backstab', description: 'Devastating attacks from behind' },
      assassination: { name: 'Assassination', description: 'Killing with precision and stealth' },
      disguise: { name: 'Disguise', description: 'Changing appearance to blend in' },
      shadow_step: { name: 'Shadow Step', description: 'Moving through darkness rapidly' },
      misdirection: { name: 'Misdirection', description: 'Confusing and distracting enemies' },
      escape_artistry: { name: 'Escape Artistry', description: 'Getting out of restraints and tight spots' }
    }
  },

  // 6. ATHLETICS (10 skills)
  athletics: {
    name: 'Athletics',
    description: 'Physical prowess and bodily conditioning',
    skills: {
      climbing: { name: 'Climbing', description: 'Scaling walls and obstacles' },
      jumping: { name: 'Jumping', description: 'Leaping distances and heights' },
      swimming: { name: 'Swimming', description: 'Moving through water efficiently' },
      running: { name: 'Running', description: 'Moving quickly over land' },
      acrobatics: { name: 'Acrobatics', description: 'Agile movement and tumbling' },
      balance: { name: 'Balance', description: 'Maintaining footing in difficult situations' },
      strength: { name: 'Strength', description: 'Raw physical power' },
      flexibility: { name: 'Flexibility', description: 'Bending and stretching ability' },
      coordination: { name: 'Coordination', description: 'Body control and precision' },
    }
  },

  // 7. CRAFTING (15 skills)
  crafting: {
    name: 'Crafting',
    description: 'Creating and improving items',
    skills: {
      blacksmithing: { name: 'Blacksmithing', description: 'Forging metal weapons and armor' },
      alchemy: { name: 'Alchemy', description: 'Creating potions and chemical compounds' },
      enchanting: { name: 'Enchanting', description: 'Adding magical properties to items' },
      tailoring: { name: 'Tailoring', description: 'Creating and repairing cloth items' },
      leatherworking: { name: 'Leatherworking', description: 'Working with leather and hides' },
      woodworking: { name: 'Woodworking', description: 'Crafting with wood and plant materials' },
      gemcutting: { name: 'Gemcutting', description: 'Preparing precious stones' },
      cooking: { name: 'Cooking', description: 'Preparing food and beverages' },
      trap_making: { name: 'Trap Making', description: 'Creating mechanical and magical traps' },
      engineering: { name: 'Engineering', description: 'Complex mechanical devices' },
      fletching: { name: 'Fletching', description: 'Making arrows and bolts' },
      brewing: { name: 'Brewing', description: 'Creating alcoholic beverages' },
      inscription: { name: 'Inscription', description: 'Creating scrolls and written magic' },
      jewelcrafting: { name: 'Jewelcrafting', description: 'Making rings, amulets, and accessories' },
      repair: { name: 'Repair', description: 'Fixing and maintaining equipment' }
    }
  },

  // 8. SOCIAL (12 skills)
  social: {
    name: 'Social',
    description: 'Interaction and influence with others',
    skills: {
      persuasion: { name: 'Persuasion', description: 'Convincing others through logic and charm' },
      deception: { name: 'Deception', description: 'Lying and misleading effectively' },
      leadership: { name: 'Leadership', description: 'Inspiring and commanding others' },
      diplomacy: { name: 'Diplomacy', description: 'Negotiating and resolving conflicts' },
      bargaining: { name: 'Bargaining', description: 'Getting better deals in trade' },
      entertainment: { name: 'Entertainment', description: 'Amusing and engaging others' },
      seduction: { name: 'Seduction', description: 'Attracting and manipulating through charm' },
      interrogation: { name: 'Interrogation', description: 'Extracting information from unwilling subjects' },
      networking: { name: 'Networking', description: 'Building and maintaining relationships' },
      reputation: { name: 'Reputation', description: 'Managing public perception' },
      etiquette: { name: 'Etiquette', description: 'Proper behavior in social situations' },
      empathy: { name: 'Empathy', description: 'Understanding others\' emotions and motivations' }
    }
  },

  // 9. SURVIVAL (11 skills)
  survival: {
    name: 'Survival',
    description: 'Thriving in harsh environments',
    skills: {
      foraging: { name: 'Foraging', description: 'Finding food and resources in the wild' },
      tracking: { name: 'Tracking', description: 'Following trails and signs' },
      navigation: { name: 'Navigation', description: 'Finding direction and avoiding getting lost' },
      weather_sense: { name: 'Weather Sense', description: 'Predicting weather changes' },
      animal_handling: { name: 'Animal Handling', description: 'Working with animals' },
      herbalism: { name: 'Herbalism', description: 'Knowledge of plants and natural remedies' },
      fire_making: { name: 'Fire Making', description: 'Creating and maintaining fires' },
      shelter_building: { name: 'Shelter Building', description: 'Constructing temporary dwellings' },
      water_finding: { name: 'Water Finding', description: 'Locating clean water sources' },
      poison_resistance: { name: 'Poison Resistance', description: 'Resisting toxins and venoms' },
      wilderness_lore: { name: 'Wilderness Lore', description: 'General knowledge of wild places' }
    }
  },

  // 10. ACADEMICS (14 skills)
  academics: {
    name: 'Academics',
    description: 'Knowledge and intellectual pursuits',
    skills: {
      history: { name: 'History', description: 'Knowledge of past events and civilizations' },
      religion: { name: 'Religion', description: 'Understanding of faiths and divine matters' },
      arcane_lore: { name: 'Arcane Lore', description: 'Theoretical knowledge of magic' },
      alchemy_theory: { name: 'Alchemy Theory', description: 'Understanding chemical processes' },
      monster_lore: { name: 'Monster Lore', description: 'Knowledge of creatures and their habits' },
      geography: { name: 'Geography', description: 'Knowledge of lands and locations' },
      linguistics: { name: 'Linguistics', description: 'Understanding languages and communication' },
      mathematics: { name: 'Mathematics', description: 'Numerical and logical reasoning' },
      astronomy: { name: 'Astronomy', description: 'Knowledge of celestial bodies and movements' },
      planar_lore: { name: 'Planar Lore', description: 'Understanding of other dimensions' },
      nobility: { name: 'Nobility', description: 'Knowledge of courts, titles, and politics' },
      law: { name: 'Law', description: 'Understanding legal systems and procedures' },
      engineering_theory: { name: 'Engineering Theory', description: 'Theoretical knowledge of construction' },
      military_tactics: { name: 'Military Tactics', description: 'Strategic and tactical warfare knowledge' }
    }
  },

  // 11. PERCEPTION (10 skills)
  perception: {
    name: 'Perception',
    description: 'Awareness and sensory abilities',
    skills: {
      alertness: { name: 'Alertness', description: 'General awareness of surroundings' },
      spot_danger: { name: 'Spot Danger', description: 'Detecting threats and hazards' },
      listen: { name: 'Listen', description: 'Hearing sounds and conversations' },
      search: { name: 'Search', description: 'Finding hidden objects and secrets' },
      intuition: { name: 'Intuition', description: 'Gut feelings and hunches' },
      lip_reading: { name: 'Lip Reading', description: 'Understanding speech without hearing' },
      body_language: { name: 'Body Language', description: 'Reading nonverbal communication' },
      aura_sight: { name: 'Aura Sight', description: 'Seeing magical and spiritual energies' },
      danger_sense: { name: 'Danger Sense', description: 'Feeling when threat is near' },
      investigation: { name: 'Investigation', description: 'Systematic examination and deduction' }
    }
  },

  // 12. MENTAL (11 skills)
  mental: {
    name: 'Mental',
    description: 'Intellectual and psychological abilities',
    skills: {
      concentration: { name: 'Concentration', description: 'Maintaining focus under stress' },
      memory: { name: 'Memory', description: 'Recalling information and experiences' },
      logic: { name: 'Logic', description: 'Reasoning and problem-solving' },
      creativity: { name: 'Creativity', description: 'Innovative thinking and solutions' },
      meditation: { name: 'Meditation', description: 'Mental discipline and inner peace' },
      mental_resistance: { name: 'Mental Resistance', description: 'Resisting mental effects' },
      pattern_recognition: { name: 'Pattern Recognition', description: 'Seeing connections and trends' },
      quick_thinking: { name: 'Quick Thinking', description: 'Rapid mental processing' },
      multitasking: { name: 'Multitasking', description: 'Handling multiple mental tasks' },
      wisdom: { name: 'Wisdom', description: 'Good judgment and understanding' },
      teaching: { name: 'Teaching', description: 'Effectively instructing others' }
    }
  },

  // 13. LUCK (8 skills)
  luck: {
    name: 'Luck',
    description: 'Fortune and chance manipulation',
    skills: {
      fortune: { name: 'Fortune', description: 'General good luck in all endeavors' },
      critical_luck: { name: 'Critical Luck', description: 'Increased chance of critical successes' },
      loot_finding: { name: 'Loot Finding', description: 'Discovering valuable items' },
      dodge_luck: { name: 'Dodge Luck', description: 'Miraculous avoidance of attacks' },
      timing: { name: 'Timing', description: 'Being in the right place at the right time' },
      serendipity: { name: 'Serendipity', description: 'Happy accidents and fortunate discoveries' },
      karmic_balance: { name: 'Karmic Balance', description: 'Evening out of good and bad fortune' },
      fate_manipulation: { name: 'Fate Manipulation', description: 'Subtle influence over destiny' }
    }
  },

  // 14. PERFORMANCE (10 skills)
  performance: {
    name: 'Performance',
    description: 'Artistic expression and entertainment',
    skills: {
      singing: { name: 'Singing', description: 'Vocal music and performance' },
      dancing: { name: 'Dancing', description: 'Physical artistic expression' },
      acting: { name: 'Acting', description: 'Portraying characters and emotions' },
      storytelling: { name: 'Storytelling', description: 'Engaging narrative presentation' },
      comedy: { name: 'Comedy', description: 'Humor and comedic timing' },
      oratory: { name: 'Oratory', description: 'Public speaking and rhetoric' },
      musical_instrument: { name: 'Musical Instrument', description: 'Playing various instruments' },
      juggling: { name: 'Juggling', description: 'Dexterous manipulation of objects' },
      mime: { name: 'Mime', description: 'Silent physical performance' },
      bardic_magic: { name: 'Bardic Magic', description: 'Magic through artistic expression' }
    }
  },

  // 15. RIDING (9 skills)
  riding: {
    name: 'Riding',
    description: 'Mounted movement and animal partnership',
    skills: {
      horsemanship: { name: 'Horsemanship', description: 'Riding and caring for horses' },
      exotic_mounts: { name: 'Exotic Mounts', description: 'Riding unusual creatures' },
      mounted_combat: { name: 'Mounted Combat', description: 'Fighting while mounted' },
      mounted_archery: { name: 'Mounted Archery', description: 'Ranged combat from mounts' },
      animal_bonding: { name: 'Animal Bonding', description: 'Deep connection with mount' },
      aerial_riding: { name: 'Aerial Riding', description: 'Riding flying creatures' },
      mounted_charge: { name: 'Mounted Charge', description: 'Devastating charging attacks' },
      trick_riding: { name: 'Trick Riding', description: 'Acrobatic mounted maneuvers' },
      pack_leading: { name: 'Pack Leading', description: 'Managing multiple animals' }
    }
  }
};

// Calculate total skills
const getTotalSkillCount = () => {
  let total = 0;
  Object.values(SKILL_CATEGORIES).forEach(category => {
    total += Object.keys(category.skills).length;
  });
  return total;
};

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SKILL_CATEGORIES, getTotalSkillCount };
} else {
  window.SKILL_CATEGORIES = SKILL_CATEGORIES;
  window.getTotalSkillCount = getTotalSkillCount;
}