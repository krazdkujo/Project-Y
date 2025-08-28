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
    this.setupEventListeners();
    this.updateCharacterPreview();
  }

  // Close character creation interface
  closeCharacterCreation() {
    // Use UI state system to return to guild
    if (window.switchToGuildState) {
      window.switchToGuildState();
    }
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
    const allSkillsInfo = this.skillSystem ? this.skillSystem.getAllSkillsInfo() : {};
    Object.keys(allSkillsInfo).forEach(categoryKey => {
      const category = allSkillsInfo[categoryKey];
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
    if (!container) {
      console.warn('Skill allocation container not found');
      return;
    }
    
    container.innerHTML = '';

    // Use dynamic skill system API instead of direct SKILL_CATEGORIES access
    const allSkillsInfo = this.skillSystem ? this.skillSystem.getAllSkillsInfo() : null;
    if (!allSkillsInfo) {
      container.innerHTML = '<div style="color: #f00; text-align: center; padding: 20px;">Skill system not available</div>';
      console.error('SkillSystem not available for character creation');
      return;
    }

    Object.keys(allSkillsInfo).forEach(categoryKey => {
      const category = allSkillsInfo[categoryKey];
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'skill-category';
      
      // Create category header with enhanced styling
      const categoryHeader = document.createElement('div');
      categoryHeader.className = 'skill-category-header';
      categoryHeader.title = category.description || 'No description available';
      categoryHeader.textContent = `${category.name} (${Object.keys(category.skills).length} skills)`;
      categoryDiv.appendChild(categoryHeader);
      
      // Create grid container for skills
      const skillsGrid = document.createElement('div');
      skillsGrid.className = 'skill-items-grid';
      
      Object.keys(category.skills).forEach(skillKey => {
        const skill = category.skills[skillKey];
        const skillDiv = document.createElement('div');
        skillDiv.className = 'skill-item';
        
        skillDiv.innerHTML = `
          <span class="skill-name" title="${skill.description}">${skill.name}</span>
          <div class="skill-points">
            <button class="point-button" onclick="characterGenerator.adjustSkillPoints('${skillKey}', -1)">-</button>
            <span id="skill-${skillKey}" class="skill-point-display">0</span>
            <button class="point-button" onclick="characterGenerator.adjustSkillPoints('${skillKey}', 1)">+</button>
          </div>
        `;
        
        skillsGrid.appendChild(skillDiv);
      });
      
      categoryDiv.appendChild(skillsGrid);
      container.appendChild(categoryDiv);
    });
  }

  // Initialize weapon selection interface
  initializeWeaponSelection() {
    const container = document.getElementById('weapon-selection-grid');
    if (!container) {
      console.warn('Weapon selection container not found');
      return;
    }
    
    container.innerHTML = '';

    // Use dynamic weapon system API
    const startingWeapons = this.weaponSystem ? this.weaponSystem.getStartingWeapons() : [];
    if (!startingWeapons || startingWeapons.length === 0) {
      container.innerHTML = '<div style="color: #f00; text-align: center; padding: 20px;">No starting weapons available</div>';
      console.error('WeaponSystem not available or no starting weapons found');
      return;
    }
    
    // Add weapon grid class for better layout
    container.className = 'weapon-selection-grid';
    
    startingWeapons.forEach(weapon => {
      const weaponDiv = document.createElement('div');
      weaponDiv.className = 'weapon-option';
      weaponDiv.setAttribute('data-weapon-id', weapon.id);
      weaponDiv.onclick = () => this.selectWeapon(weapon.id);
      
      weaponDiv.innerHTML = `
        <div class="weapon-name">${weapon.name}</div>
        <div class="weapon-stats">
          <div>Damage: ${weapon.damage[0]}-${weapon.damage[1]}</div>
          <div>Accuracy: ${weapon.accuracy}%</div>
          <div>Skill: ${weapon.skillRequired}</div>
          <div>Weight: ${weapon.weight}${weapon.category ? ` • ${weapon.category}` : ''}</div>
        </div>
        <div style="font-size: 9px; color: #666; margin-top: 6px; font-style: italic;">
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
    
    const allSkillsInfo = this.skillSystem ? this.skillSystem.getAllSkillsInfo() : {};
    Object.keys(allSkillsInfo).forEach(categoryKey => {
      const category = allSkillsInfo[categoryKey];
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
          const skillInfo = this.skillSystem ? this.skillSystem.getSkillInfo(skillKey) : null;
          return `${skillInfo ? skillInfo.name : skillKey}: ${points}`;
        }).join('<br>');
      } else {
        skillsDiv.textContent = 'None allocated';
      }
    }
    
    // Update ability preview
    this.updateAbilityPreview();
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
  // Setup event listeners for character creation interface
  setupEventListeners() {
    // Character name input
    const nameInput = document.getElementById('character-name-input');
    if (nameInput) {
      nameInput.addEventListener('input', (e) => {
        this.characterBuilder.name = e.target.value;
        this.updateCharacterPreview();
        this.validateCharacterCreation();
      });
    }
    
    // Create character button
    const createBtn = document.getElementById('create-character-btn');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        this.handleCreateCharacter();
      });
    }
  }
  
  // Handle create character button click
  handleCreateCharacter() {
    if (window.gameState) {
      const character = this.createCharacterFromBuilder(window.gameState);
      if (character) {
        // Add to guild storage
        window.gameState.guild.storedCharacters.set(character.id, character);
        
        // Initialize abilities
        if (window.gameManager && window.gameManager.initializeCharacterAbilities) {
          window.gameManager.initializeCharacterAbilities(character);
        }
        
        // Update UI
        if (window.addLog) {
          window.addLog(`Created character: ${character.name}`, 'system');
        }
        
        if (window.updateGuildInterface) {
          window.updateGuildInterface();
        }
        
        // Close character creation and return to guild
        this.closeCharacterCreation();
        if (window.switchToGuildState) {
          window.switchToGuildState();
        }
      }
    }
  }

  // Randomize skill allocation with 25 points total
  randomizeSkills() {
    if (!this.characterBuilder) {
      console.warn('Character builder not initialized');
      return;
    }
    
    // Get all available skills
    const allSkillsInfo = this.skillSystem ? this.skillSystem.getAllSkillsInfo() : null;
    if (!allSkillsInfo) {
      console.error('SkillSystem not available for randomization');
      return;
    }
    
    // Collect all skill keys
    const allSkills = [];
    Object.keys(allSkillsInfo).forEach(categoryKey => {
      const category = allSkillsInfo[categoryKey];
      Object.keys(category.skills).forEach(skillKey => {
        allSkills.push(skillKey);
      });
    });
    
    if (allSkills.length === 0) {
      console.warn('No skills available for randomization');
      return;
    }
    
    // Reset skill allocation
    this.characterBuilder.allocatedSkills = {};
    let remainingPoints = 25;
    
    // Randomize skill distribution
    while (remainingPoints > 0 && allSkills.length > 0) {
      const randomIndex = Math.floor(Math.random() * allSkills.length);
      const skillKey = allSkills[randomIndex];
      const currentPoints = this.characterBuilder.allocatedSkills[skillKey] || 0;
      
      if (currentPoints < 5) {
        // Add 1-3 points randomly, but don't exceed limits
        const maxAddable = Math.min(
          Math.floor(Math.random() * 3) + 1, // Random 1-3 points
          5 - currentPoints, // Don't exceed skill max
          remainingPoints // Don't exceed total
        );
        
        this.characterBuilder.allocatedSkills[skillKey] = currentPoints + maxAddable;
        remainingPoints -= maxAddable;
      } else {
        // Remove skills that are at max from future selection
        allSkills.splice(randomIndex, 1);
      }
      
      // Safety check to prevent infinite loops
      if (allSkills.length === 0 && remainingPoints > 0) {
        // If all skills are at max but we have points left, distribute randomly
        const availableSkills = Object.keys(allSkillsInfo).flatMap(categoryKey => 
          Object.keys(allSkillsInfo[categoryKey].skills)
        ).filter(skillKey => (this.characterBuilder.allocatedSkills[skillKey] || 0) < 5);
        
        if (availableSkills.length > 0) {
          allSkills.push(...availableSkills);
        } else {
          break; // All skills at max, exit
        }
      }
    }
    
    // Update available points
    this.characterBuilder.availablePoints = remainingPoints;
    
    console.log('Skills randomized:', this.characterBuilder.allocatedSkills);
    
    // Update displays
    this.updateSkillDisplays();
    this.updateCharacterPreview();
  }
  
  // Clear all skill allocations
  clearSkills() {
    if (!this.characterBuilder) {
      console.warn('Character builder not initialized');
      return;
    }
    
    // Reset all skill allocations
    this.characterBuilder.allocatedSkills = {};
    this.characterBuilder.availablePoints = 25;
    
    console.log('All skills cleared');
    
    // Update displays
    this.updateSkillDisplays();
    this.updateCharacterPreview();
  }
  
  // Update skill point displays in UI
  updateSkillDisplays() {
    // Update available points display
    const availablePointsDisplay = document.getElementById('available-skill-points');
    if (availablePointsDisplay) {
      availablePointsDisplay.textContent = this.characterBuilder.availablePoints;
    }
    
    // Update individual skill point displays
    Object.keys(this.characterBuilder.allocatedSkills).forEach(skillKey => {
      const skillDisplay = document.getElementById(`skill-${skillKey}`);
      if (skillDisplay) {
        skillDisplay.textContent = this.characterBuilder.allocatedSkills[skillKey];
      }
    });
    
    // Reset skills that aren't allocated
    const allSkillsInfo = this.skillSystem ? this.skillSystem.getAllSkillsInfo() : null;
    if (allSkillsInfo) {
      Object.keys(allSkillsInfo).forEach(categoryKey => {
        const category = allSkillsInfo[categoryKey];
        Object.keys(category.skills).forEach(skillKey => {
          if (!this.characterBuilder.allocatedSkills[skillKey]) {
            const skillDisplay = document.getElementById(`skill-${skillKey}`);
            if (skillDisplay) {
              skillDisplay.textContent = '0';
            }
          }
        });
      });
    }
  }
  
  // Update ability preview based on current skill allocation
  updateAbilityPreview() {
    const abilitiesDiv = document.getElementById('preview-abilities');
    if (!abilitiesDiv) return;
    
    if (!this.characterBuilder) {
      abilitiesDiv.innerHTML = '<div style="color: #888; font-style: italic;">Character builder not ready</div>';
      return;
    }
    
    // Create a mock character with current skill allocation for ability checking
    const mockCharacter = {
      skills: { ...this.characterBuilder.allocatedSkills }
    };
    
    // Check if we have access to the ability system
    const hasAbilitySystem = window.abilityEngine && window.abilityRegistry;
    if (!hasAbilitySystem) {
      abilitiesDiv.innerHTML = '<div style="color: #888; font-style: italic;">Ability system not available</div>';
      return;
    }
    
    try {
      // Get unlocked abilities using the ability system
      const unlockedAbilities = window.abilityRegistry.getUnlockedAbilities(mockCharacter);
      
      if (!unlockedAbilities || unlockedAbilities.length === 0) {
        abilitiesDiv.innerHTML = '<div style="color: #888; font-style: italic;">No abilities unlocked yet</div>';
        return;
      }
      
      // Group abilities by category
      const abilityGroups = this.groupAbilitiesByCategory(unlockedAbilities);
      
      // Generate display HTML
      let abilityHTML = '';
      Object.entries(abilityGroups).forEach(([category, abilities]) => {
        if (abilities.length > 0) {
          abilityHTML += `
            <div style="margin-bottom: 8px;">
              <div style="color: #0f0; font-weight: bold; font-size: 10px; margin-bottom: 4px;">${category}</div>
              ${abilities.map(ability => `
                <div style="margin-left: 8px; font-size: 9px; color: #ccc; line-height: 1.2;">
                  <span style="color: #0f0;">•</span> ${ability.name}
                  ${ability.description ? `<div style="color: #888; font-size: 8px; margin-left: 10px;">${ability.description.substring(0, 50)}${ability.description.length > 50 ? '...' : ''}</div>` : ''}
                </div>
              `).join('')}
            </div>
          `;
        }
      });
      
      abilitiesDiv.innerHTML = abilityHTML || '<div style="color: #888; font-style: italic;">No abilities unlocked yet</div>';
      
    } catch (error) {
      console.error('Error updating ability preview:', error);
      abilitiesDiv.innerHTML = '<div style="color: #f44; font-style: italic;">Error loading abilities</div>';
    }
  }
  
  // Group abilities by category for better organization
  groupAbilitiesByCategory(abilities) {
    const groups = {
      'Combat': [],
      'Magic': [],
      'Exploration': [],
      'Passive': [],
      'Utility': []
    };
    
    abilities.forEach(ability => {
      // Determine category based on ability properties or name
      let category = 'Utility'; // Default category
      
      if (ability.category) {
        category = ability.category;
      } else if (ability.name) {
        const name = ability.name.toLowerCase();
        if (name.includes('attack') || name.includes('strike') || name.includes('slash') || name.includes('stab')) {
          category = 'Combat';
        } else if (name.includes('magic') || name.includes('spell') || name.includes('enchant')) {
          category = 'Magic';
        } else if (name.includes('explore') || name.includes('search') || name.includes('lockpick')) {
          category = 'Exploration';
        } else if (name.includes('passive') || name.includes('boost') || name.includes('enhance')) {
          category = 'Passive';
        }
      }
      
      if (groups[category]) {
        groups[category].push(ability);
      } else {
        groups['Utility'].push(ability);
      }
    });
    
    return groups;
  }
}

// Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CharacterGenerator;
} else {
  window.CharacterGenerator = CharacterGenerator;
}