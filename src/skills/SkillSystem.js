/**
 * Skill System for Character Progression
 * Handles skill leveling, XP calculation, and use-based advancement
 */

// Browser/Node compatibility
let SKILL_CATEGORIES;
if (typeof require !== 'undefined') {
  SKILL_CATEGORIES = require('./SkillCategories').SKILL_CATEGORIES;
} else {
  SKILL_CATEGORIES = window.SKILL_CATEGORIES;
}

class SkillSystem {
  constructor(eventSystem) {
    this.events = eventSystem;
    
    // XP requirements for each level (exponential growth)
    this.xpRequirements = this.generateXPRequirements();
    
    // Skill use multipliers based on difficulty/context
    this.useMultipliers = {
      trivial: 0.1,    // Much easier than skill level
      easy: 0.5,       // Somewhat easier
      normal: 1.0,     // At skill level
      hard: 1.5,       // Somewhat harder
      very_hard: 2.0,  // Much harder
      legendary: 3.0   // Extremely challenging
    };
  }

  // Generate XP requirements for levels 1-100
  generateXPRequirements() {
    const requirements = [0]; // Level 0 (no XP needed)
    
    for (let level = 1; level <= 100; level++) {
      // Exponential growth: base 100 * level^1.8
      const xpNeeded = Math.floor(100 * Math.pow(level, 1.8));
      requirements[level] = requirements[level - 1] + xpNeeded;
    }
    
    return requirements;
  }

  // Initialize character skills (all at level 0 with 0 XP)
  initializeCharacterSkills() {
    const skills = {};
    
    Object.keys(SKILL_CATEGORIES).forEach(categoryKey => {
      const category = SKILL_CATEGORIES[categoryKey];
      Object.keys(category.skills).forEach(skillKey => {
        skills[skillKey] = {
          level: 0,
          xp: 0,
          uses: 0,
          lastUsed: null
        };
      });
    });
    
    return skills;
  }

  // Award XP for skill use
  awardSkillUse(character, skillKey, difficulty = 'normal', baseXP = 10) {
    if (!character.skills[skillKey]) {
      console.warn(`Skill ${skillKey} not found on character ${character.id}`);
      return false;
    }

    const skill = character.skills[skillKey];
    const multiplier = this.useMultipliers[difficulty] || 1.0;
    
    // Calculate XP gain with diminishing returns for easy tasks
    const levelDifference = this.calculateDifficultyLevel(difficulty) - skill.level;
    const xpGain = Math.max(1, Math.floor(baseXP * multiplier * this.getDiminishingReturns(levelDifference)));
    
    // Award XP
    skill.xp += xpGain;
    skill.uses++;
    skill.lastUsed = Date.now();
    
    // Check for level up
    const newLevel = this.calculateLevel(skill.xp);
    if (newLevel > skill.level) {
      const oldLevel = skill.level;
      skill.level = newLevel;
      
      this.events.emit('CHARACTER_SKILL_GAINED', {
        characterId: character.id,
        skillKey,
        oldLevel,
        newLevel,
        xpGain
      });
      
      // Check for class unlocks
      this.checkClassUnlocks(character, skillKey, newLevel);
    }
    
    return {
      success: true,
      xpGained: xpGain,
      newLevel: skill.level,
      levelUp: newLevel > (skill.level || 0)
    };
  }

  // Calculate what level a given XP amount represents
  calculateLevel(xp) {
    for (let level = 100; level >= 0; level--) {
      if (xp >= this.xpRequirements[level]) {
        return level;
      }
    }
    return 0;
  }

  // Calculate XP needed for next level
  getXPToNextLevel(currentXP) {
    const currentLevel = this.calculateLevel(currentXP);
    if (currentLevel >= 100) {
      return 0; // Already at max level
    }
    
    return this.xpRequirements[currentLevel + 1] - currentXP;
  }

  // Get diminishing returns multiplier based on difficulty vs skill level
  getDiminishingReturns(levelDifference) {
    if (levelDifference > 10) return 1.0;    // Much harder - full XP
    if (levelDifference > 5) return 0.8;     // Somewhat harder - reduced XP
    if (levelDifference > 0) return 0.6;     // At level - some XP
    if (levelDifference > -10) return 0.3;   // Easier - minimal XP
    return 0.1;                              // Much easier - tiny XP
  }

  // Convert difficulty string to approximate level
  calculateDifficultyLevel(difficulty) {
    const difficultyLevels = {
      trivial: 1,
      easy: 10,
      normal: 25,
      hard: 50,
      very_hard: 75,
      legendary: 100
    };
    
    return difficultyLevels[difficulty] || 25;
  }

  // Get skill bonus based on level (0-100 = 0% to 500% bonus)
  getSkillBonus(skillLevel) {
    return skillLevel * 5; // 5% bonus per level
  }

  // Get all skills in a category
  getCategorySkills(character, categoryKey) {
    const category = SKILL_CATEGORIES[categoryKey];
    if (!category) return {};
    
    const categorySkills = {};
    Object.keys(category.skills).forEach(skillKey => {
      if (character.skills[skillKey]) {
        categorySkills[skillKey] = {
          ...character.skills[skillKey],
          name: category.skills[skillKey].name,
          description: category.skills[skillKey].description,
          bonus: this.getSkillBonus(character.skills[skillKey].level)
        };
      }
    });
    
    return categorySkills;
  }

  // Get character's highest skills
  getTopSkills(character, count = 10) {
    const allSkills = [];
    
    Object.keys(character.skills).forEach(skillKey => {
      const skill = character.skills[skillKey];
      if (skill.level > 0) {
        // Find skill info
        let skillInfo = null;
        Object.keys(SKILL_CATEGORIES).forEach(catKey => {
          if (SKILL_CATEGORIES[catKey].skills[skillKey]) {
            skillInfo = SKILL_CATEGORIES[catKey].skills[skillKey];
          }
        });
        
        if (skillInfo) {
          allSkills.push({
            key: skillKey,
            name: skillInfo.name,
            level: skill.level,
            xp: skill.xp,
            uses: skill.uses,
            bonus: this.getSkillBonus(skill.level)
          });
        }
      }
    });
    
    return allSkills
      .sort((a, b) => b.level - a.level || b.xp - a.xp)
      .slice(0, count);
  }

  // Check for class unlocks based on skill thresholds
  checkClassUnlocks(character, skillKey, newLevel) {
    // This will be implemented when we create the class system
    // For now, emit an event that the class system can listen to
    this.events.emit('SKILL_LEVEL_CHANGED', {
      characterId: character.id,
      skillKey,
      newLevel
    });
  }

  // Bulk skill advancement (for testing or special events)
  advanceSkill(character, skillKey, levels) {
    if (!character.skills[skillKey]) {
      return { success: false, reason: 'Skill not found' };
    }
    
    const currentLevel = character.skills[skillKey].level;
    const targetLevel = Math.min(100, currentLevel + levels);
    
    character.skills[skillKey].level = targetLevel;
    character.skills[skillKey].xp = this.xpRequirements[targetLevel];
    
    this.events.emit('CHARACTER_SKILL_GAINED', {
      characterId: character.id,
      skillKey,
      oldLevel: currentLevel,
      newLevel: targetLevel,
      xpGain: this.xpRequirements[targetLevel] - this.xpRequirements[currentLevel]
    });
    
    this.checkClassUnlocks(character, skillKey, targetLevel);
    
    return {
      success: true,
      oldLevel: currentLevel,
      newLevel: targetLevel
    };
  }

  // Get skill information by key
  getSkillInfo(skillKey) {
    for (const categoryKey of Object.keys(SKILL_CATEGORIES)) {
      const category = SKILL_CATEGORIES[categoryKey];
      if (category.skills[skillKey]) {
        return {
          ...category.skills[skillKey],
          category: categoryKey,
          categoryName: category.name
        };
      }
    }
    return null;
  }

  // Get all available skills with their categories
  getAllSkillsInfo() {
    const allSkills = {};
    
    Object.keys(SKILL_CATEGORIES).forEach(categoryKey => {
      const category = SKILL_CATEGORIES[categoryKey];
      allSkills[categoryKey] = {
        name: category.name,
        description: category.description,
        skills: category.skills
      };
    });
    
    return allSkills;
  }

  // Calculate character's total skill points
  getTotalSkillPoints(character) {
    let total = 0;
    Object.values(character.skills).forEach(skill => {
      total += skill.level;
    });
    return total;
  }

  // Get character's skill mastery level (based on high-level skills)
  getMasteryLevel(character) {
    const topSkills = this.getTopSkills(character, 5);
    if (topSkills.length === 0) return 'Novice';
    
    const averageTopLevel = topSkills.reduce((sum, skill) => sum + skill.level, 0) / topSkills.length;
    
    if (averageTopLevel >= 90) return 'Grandmaster';
    if (averageTopLevel >= 80) return 'Master';
    if (averageTopLevel >= 60) return 'Expert';
    if (averageTopLevel >= 40) return 'Adept';
    if (averageTopLevel >= 20) return 'Skilled';
    return 'Novice';
  }
}

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SkillSystem;
} else {
  window.SkillSystem = SkillSystem;
}