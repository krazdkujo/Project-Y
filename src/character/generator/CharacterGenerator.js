/**
 * Character Generation System
 * Handles character creation, skill allocation, and starting equipment
 */

class CharacterGenerator {
  constructor(eventSystem, skillSystem, weaponSystem) {
    this.events = eventSystem;
    this.skillSystem = skillSystem;
    this.weaponSystem = weaponSystem;
    
    // Character creation state
    this.characterBuilder = null;
    this.isInitialized = false;
  }

  // Initialize character builder
  initializeBuilder() {
    this.characterBuilder = {
      name: '',
      skillPoints: 25,
      allocatedSkills: {},
      selectedWeapon: null,
      availablePoints: 25
    };
    this.isInitialized = true;
  }

  // Open character creation interface
  openCharacterCreation() {
    this.resetCharacterBuilder();
    this.initializeSkillAllocation();
    this.initializeWeaponSelection();
    document.getElementById('character-creation-interface').classList.add('active');
    this.updateCharacterPreview();
  }

  // Close character creation interface
  closeCharacterCreation() {
    document.getElementById('character-creation-interface').classList.remove('active');
    this.resetCharacterBuilder();
  }

  // Reset character builder to default state
  resetCharacterBuilder() {
    // Initialize character builder object
    this.characterBuilder = {
      name: '',
      skillPoints: 25,
      allocatedSkills: {},
      selectedWeapon: null,
      availablePoints: 25
    };

    // Reset form elements (with safety checks)
    const nameInput = document.getElementById('character-name-input');
    if (nameInput) nameInput.value = '';
    
    const pointsDisplay = document.getElementById('available-skill-points');
    if (pointsDisplay) pointsDisplay.textContent = '25';
    
    // Clear weapon selections
    document.querySelectorAll('.weapon-option.selected').forEach(el => {
      el.classList.remove('selected');
    });
    
    // Reset skill point displays
    Object.keys(SKILL_CATEGORIES).forEach(categoryKey => {
      const category = SKILL_CATEGORIES[categoryKey];
      Object.keys(category.skills).forEach(skillKey => {
        const skillDisplay = document.getElementById(`skill-${skillKey}`);
        if (skillDisplay) skillDisplay.textContent = '0';
      });
    });
    
    const createBtn = document.getElementById('create-character-btn');
    if (createBtn) createBtn.disabled = true;
    
    this.updateCharacterPreview();
  }

  // Initialize skill allocation interface
  initializeSkillAllocation() {
    const container = document.getElementById('skill-allocation-grid');
    container.innerHTML = '';

    Object.keys(SKILL_CATEGORIES).forEach(categoryKey => {
      const category = SKILL_CATEGORIES[categoryKey];
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'skill-category';
      
      categoryDiv.innerHTML = `
        <div style="color: #0f0; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #333; padding-bottom: 3px;">
          ${category.name}
        </div>
      `;

      Object.keys(category.skills).forEach(skillKey => {
        const skill = category.skills[skillKey];
        const skillDiv = document.createElement('div');
        skillDiv.className = 'skill-item';
        
        skillDiv.innerHTML = `
          <span title="${skill.description}">${skill.name}</span>
          <div class="skill-points">
            <button class="point-button" onclick="characterGenerator.adjustSkillPoints('${skillKey}', -1)">-</button>
            <span id="skill-${skillKey}" style="min-width: 20px; text-align: center;">0</span>
            <button class="point-button" onclick="characterGenerator.adjustSkillPoints('${skillKey}', 1)">+</button>
          </div>
        `;
        
        categoryDiv.appendChild(skillDiv);
      });

      container.appendChild(categoryDiv);
    });
  }

  // Initialize weapon selection interface
  initializeWeaponSelection() {
    const container = document.getElementById('weapon-selection-grid');
    container.innerHTML = '';

    const startingWeapons = this.weaponSystem.getStartingWeapons();
    
    startingWeapons.forEach(weapon => {
      const weaponDiv = document.createElement('div');
      weaponDiv.className = 'weapon-option';
      weaponDiv.setAttribute('data-weapon-id', weapon.id);
      weaponDiv.onclick = () => this.selectWeapon(weapon.id);
      
      weaponDiv.innerHTML = `
        <div class="weapon-name">${weapon.name}</div>
        <div class="weapon-stats">
          Damage: ${weapon.damage[0]}-${weapon.damage[1]}<br>
          Accuracy: ${weapon.accuracy}%<br>
          Skill: ${weapon.skillRequired}<br>
          Weight: ${weapon.weight}
        </div>
        <div style="font-size: 9px; color: #666; margin-top: 5px;">
          ${weapon.description}
        </div>
      `;
      
      container.appendChild(weaponDiv);
    });
  }

  // Adjust skill points allocation
  adjustSkillPoints(skillKey, change) {
    if (!this.characterBuilder) return; // Safety check
    
    const currentPoints = this.characterBuilder.allocatedSkills[skillKey] || 0;
    const newPoints = Math.max(0, Math.min(10, currentPoints + change)); // Max 10 points per skill
    
    const pointsDifference = newPoints - currentPoints;
    
    // Check if we have enough points
    if (pointsDifference > 0 && this.characterBuilder.availablePoints < pointsDifference) {
      return; // Not enough points
    }
    
    // Update allocation
    this.characterBuilder.allocatedSkills[skillKey] = newPoints;
    this.characterBuilder.availablePoints -= pointsDifference;
    
    // Update display
    const skillDisplay = document.getElementById(`skill-${skillKey}`);
    if (skillDisplay) skillDisplay.textContent = newPoints;
    
    const pointsDisplay = document.getElementById('available-skill-points');
    if (pointsDisplay) pointsDisplay.textContent = this.characterBuilder.availablePoints;
    
    // Update button states
    this.updateSkillButtons();
    this.updateCharacterPreview();
    this.validateCharacterCreation();
  }

  // Update skill point button states
  updateSkillButtons() {
    if (!this.characterBuilder) return; // Safety check
    
    Object.keys(SKILL_CATEGORIES).forEach(categoryKey => {
      const category = SKILL_CATEGORIES[categoryKey];
      Object.keys(category.skills).forEach(skillKey => {
        const currentPoints = this.characterBuilder.allocatedSkills[skillKey] || 0;
        const minusButton = document.querySelector(`button[onclick="characterGenerator.adjustSkillPoints('${skillKey}', -1)"]`);
        const plusButton = document.querySelector(`button[onclick="characterGenerator.adjustSkillPoints('${skillKey}', 1)"]`);
        
        if (minusButton) minusButton.disabled = currentPoints <= 0;
        if (plusButton) plusButton.disabled = this.characterBuilder.availablePoints <= 0 || currentPoints >= 10;
      });
    });
  }

  // Select weapon for character
  selectWeapon(weaponId) {
    if (!this.characterBuilder) return; // Safety check
    
    // Clear previous selection
    document.querySelectorAll('.weapon-option.selected').forEach(el => {
      el.classList.remove('selected');
    });
    
    // Select new weapon
    const weaponElement = document.querySelector(`[data-weapon-id="${weaponId}"]`);
    if (weaponElement) {
      weaponElement.classList.add('selected');
      this.characterBuilder.selectedWeapon = weaponId;
      this.updateCharacterPreview();
      this.validateCharacterCreation();
    }
  }

  // Update character preview display
  updateCharacterPreview() {
    if (!this.characterBuilder) return; // Safety check
    
    // Update name
    const nameInput = document.getElementById('character-name-input');
    const name = nameInput ? nameInput.value.trim() || 'Unnamed' : 'Unnamed';
    this.characterBuilder.name = name;
    
    const nameDisplay = document.getElementById('preview-name');
    if (nameDisplay) nameDisplay.textContent = name;
    
    // Update weapon
    const weapon = this.characterBuilder.selectedWeapon ? 
      this.weaponSystem.getWeapon(this.characterBuilder.selectedWeapon) : null;
    const weaponDisplay = document.getElementById('preview-weapon');
    if (weaponDisplay) weaponDisplay.textContent = weapon ? weapon.name : 'None Selected';
    
    // Update skills
    const skillsDiv = document.getElementById('preview-skills');
    if (skillsDiv) {
      const allocatedSkills = Object.entries(this.characterBuilder.allocatedSkills)
        .filter(([key, value]) => value > 0)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
        
      if (allocatedSkills.length > 0) {
        skillsDiv.innerHTML = allocatedSkills.map(([skillKey, points]) => {
          const skillInfo = this.skillSystem.getSkillInfo(skillKey);
          return `${skillInfo ? skillInfo.name : skillKey}: ${points}`;
        }).join('<br>');
      } else {
        skillsDiv.textContent = 'None allocated';
      }
    }
  }

  // Validate character creation form
  validateCharacterCreation() {
    if (!this.characterBuilder) return; // Safety check
    
    const nameValid = this.characterBuilder.name.trim().length > 0;
    const weaponSelected = this.characterBuilder.selectedWeapon !== null;
    const skillsAllocated = Object.values(this.characterBuilder.allocatedSkills).some(points => points > 0);
    
    const isValid = nameValid && weaponSelected && skillsAllocated;
    const createBtn = document.getElementById('create-character-btn');
    if (createBtn) createBtn.disabled = !isValid;
  }

  // Create character from builder data
  createCharacterFromBuilder(gameState) {
    if (!this.characterBuilder) {
      alert('Character builder not initialized');
      return null;
    }
    
    if (!this.characterBuilder.name.trim() || !this.characterBuilder.selectedWeapon) {
      alert('Please complete all required fields');
      return null;
    }

    // Create new character with allocated skills
    const character = {
      id: `char_${Date.now()}`,
      name: this.characterBuilder.name,
      health: 100,
      maxHealth: 100,
      ap: 3,
      maxAP: 3,
      level: 1,
      x: 12, // Starting position
      y: 10,
      initiative: 0,
      skills: this.skillSystem.initializeCharacterSkills(),
      equipment: {
        weapon: this.weaponSystem.createWeaponInstance(this.characterBuilder.selectedWeapon, `char_${Date.now()}`),
        armor: null,
        accessory: null
      },
      inventory: []
    };

    // Apply allocated skill points
    Object.entries(this.characterBuilder.allocatedSkills).forEach(([skillKey, points]) => {
      if (points > 0) {
        this.skillSystem.advanceSkill(character, skillKey, points);
      }
    });

    return character;
  }

  // Handle name input changes
  handleNameInput() {
    this.updateCharacterPreview();
    this.validateCharacterCreation();
  }
}

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CharacterGenerator;
} else {
  window.CharacterGenerator = CharacterGenerator;
}