// Character Select Screen - Static frame with dynamic character data
class CharacterSelectScreen {
    constructor(frameSystem, onCharacterSelect) {
        this.frameSystem = frameSystem;
        this.onCharacterSelect = onCharacterSelect;
        this.screen = null;
        this.characters = [];
        this.selectedCharacterIndex = 0;
        
        this.createCharacterSelectScreen();
        this.loadCharacterData();
    }

    createCharacterSelectScreen() {
        // Register static character select template
        this.frameSystem.registerTemplate('character_select', {
            width: 80,
            height: 25,
            template: `
╔══════════════════════════════════════════════════════════════════════════════╗
║                          CHARACTER SELECTION                                 ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║ ┌─ Character 1 ─────────────────┐  ┌─ Character Stats ──────────────────────┐ ║
║ │                               │  │                                        │ ║
║ │                               │  │ Name:                                  │ ║
║ │                               │  │ Level:                                 │ ║
║ │                               │  │ Class:                                 │ ║
║ │                               │  │ Health:                                │ ║
║ │                               │  │ Experience:                            │ ║
║ │                               │  │                                        │ ║
║ │                               │  │ Primary Skills:                        │ ║
║ │                               │  │ • Combat:                              │ ║
║ │                               │  │ • Magic:                               │ ║
║ │                               │  │ • Crafting:                            │ ║
║ └───────────────────────────────┘  │                                        │ ║
║                                    │ Equipment:                             │ ║
║ [ Previous ]  [ Select ]  [ Next ] │ • Weapon:                              │ ║
║                                    │ • Armor:                               │ ║
║                                    └────────────────────────────────────────┘ ║
║                                                                              ║
║                           [ New Character ]                                  ║
║                                                                              ║
║                 Use ARROWS to navigate • ENTER to select                     ║
╚══════════════════════════════════════════════════════════════════════════════╝`.trim(),
            regions: {
                // Character portrait area (static frame, dynamic content)
                characterPortrait: { row: 5, col: 3, width: 29, height: 10 },
                
                // Character info area (static frame, dynamic stats)
                charName: { row: 6, col: 46, width: 30, height: 1 },
                charLevel: { row: 7, col: 46, width: 30, height: 1 },
                charClass: { row: 8, col: 46, width: 30, height: 1 },
                charHealth: { row: 9, col: 46, width: 30, height: 1 },
                charExp: { row: 10, col: 46, width: 30, height: 1 },
                
                // Skills area (dynamic skill values)
                combatSkill: { row: 13, col: 46, width: 30, height: 1 },
                magicSkill: { row: 14, col: 46, width: 30, height: 1 },
                craftingSkill: { row: 15, col: 46, width: 30, height: 1 },
                
                // Equipment area (dynamic equipment names)
                weapon: { row: 18, col: 46, width: 30, height: 1 },
                armor: { row: 19, col: 46, width: 30, height: 1 },
                
                // Navigation instructions (static)
                instructions: { row: 22, col: 2, width: 76, height: 1 }
            }
        });

        // Create the screen
        this.screen = this.frameSystem.createScreen('character_select', {
            onAction: this.handleAction.bind(this)
        });

        // Add navigation buttons (positions are static, states change)
        this.prevButton = this.screen.addButton('Previous', this.previousCharacter.bind(this), { row: 16, col: 3 });
        this.selectButton = this.screen.addButton('Select', this.selectCharacter.bind(this), { row: 16, col: 16 });
        this.nextButton = this.screen.addButton('Next', this.nextCharacter.bind(this), { row: 16, col: 26 });
        this.newButton = this.screen.addButton('New Character', this.createNewCharacter.bind(this), { row: 20, col: 30 });
        
        // Set static instructions
        this.screen.setText('instructions', 
            'Use ARROWS to navigate • ENTER to select', {
            color: this.frameSystem.colors.text,
            align: 'center'
        });
    }

    loadCharacterData() {
        // Mock character data - in real implementation this would come from server
        this.characters = [
            {
                id: 'char_001',
                name: 'Thorgar the Bold',
                level: 12,
                class: 'Warrior',
                health: 180,
                maxHealth: 180,
                experience: 8450,
                experienceToNext: 10000,
                portrait: this.generateASCIIPortrait('warrior'),
                skills: {
                    combat: 85,
                    magic: 25,
                    crafting: 40
                },
                equipment: {
                    weapon: 'Steel Longsword +2',
                    armor: 'Chainmail Armor +1'
                }
            },
            {
                id: 'char_002',
                name: 'Lyralei Swiftarrow',
                level: 8,
                class: 'Ranger',
                health: 120,
                maxHealth: 120,
                experience: 3200,
                experienceToNext: 4500,
                portrait: this.generateASCIIPortrait('ranger'),
                skills: {
                    combat: 65,
                    magic: 45,
                    crafting: 70
                },
                equipment: {
                    weapon: 'Elven Bow +1',
                    armor: 'Leather Armor'
                }
            },
            {
                id: 'char_003',
                name: 'Zephyr Stormcaller',
                level: 15,
                class: 'Mage',
                health: 95,
                maxHealth: 95,
                experience: 12800,
                experienceToNext: 15000,
                portrait: this.generateASCIIPortrait('mage'),
                skills: {
                    combat: 30,
                    magic: 92,
                    crafting: 55
                },
                equipment: {
                    weapon: 'Staff of Lightning',
                    armor: 'Robes of Protection'
                }
            }
        ];
        
        // Update display with first character
        this.updateCharacterDisplay();
    }

    generateASCIIPortrait(characterClass) {
        // Static ASCII portraits for different classes
        const portraits = {
            warrior: `
      ╔═══╗
      ║ ● ║  ⚔
      ║ ∩ ║  
      ║ ∪ ║
      ╚═══╝
    ▄▄█████▄▄
   █████████████
   █████████████
      ███████`,
            
            ranger: `
      ╔═══╗
      ║ ◐ ║  🏹
      ║ ∩ ║  
      ║ ∪ ║
      ╚═══╝
     ▄▄█████▄▄
    ████▄█▄████
    ████▄█▄████
      ███████`,
            
            mage: `
      ╔═══╗  ★
      ║ ◑ ║ 
      ║ ∩ ║  
      ║ ∪ ║
      ╚═══╝
     ▄▄█████▄▄
    ▓▓▓▓▓▓▓▓▓▓▓
    ▓▓▓▓▓▓▓▓▓▓▓
      ▓▓▓▓▓▓▓`
        };
        
        return portraits[characterClass] || portraits.warrior;
    }

    updateCharacterDisplay() {
        if (this.characters.length === 0) {
            this.displayNoCharacters();
            return;
        }

        const char = this.characters[this.selectedCharacterIndex];
        
        // Update only the dynamic content - frame stays static
        this.screen.setText('characterPortrait', char.portrait, { 
            color: this.frameSystem.colors.highlight 
        });
        
        this.screen.setText('charName', char.name, { 
            color: this.frameSystem.colors.title 
        });
        
        this.screen.setText('charLevel', `Level ${char.level}`, { 
            color: this.frameSystem.colors.text 
        });
        
        this.screen.setText('charClass', char.class, { 
            color: this.frameSystem.colors.button 
        });
        
        this.screen.setText('charHealth', `${char.health}/${char.maxHealth} HP`, { 
            color: this.getHealthColor(char.health, char.maxHealth) 
        });
        
        this.screen.setText('charExp', `${char.experience}/${char.experienceToNext} XP`, { 
            color: this.frameSystem.colors.text 
        });
        
        // Update skill displays
        this.screen.setText('combatSkill', `• Combat: ${char.skills.combat} ${this.generateSkillBar(char.skills.combat)}`, { 
            color: this.frameSystem.colors.text 
        });
        
        this.screen.setText('magicSkill', `• Magic: ${char.skills.magic} ${this.generateSkillBar(char.skills.magic)}`, { 
            color: this.frameSystem.colors.text 
        });
        
        this.screen.setText('craftingSkill', `• Crafting: ${char.skills.crafting} ${this.generateSkillBar(char.skills.crafting)}`, { 
            color: this.frameSystem.colors.text 
        });
        
        // Update equipment
        this.screen.setText('weapon', `• Weapon: ${char.equipment.weapon}`, { 
            color: this.frameSystem.colors.highlight 
        });
        
        this.screen.setText('armor', `• Armor: ${char.equipment.armor}`, { 
            color: this.frameSystem.colors.highlight 
        });
        
        // Update button states
        this.prevButton.disabled = this.selectedCharacterIndex === 0;
        this.nextButton.disabled = this.selectedCharacterIndex === this.characters.length - 1;
    }

    generateSkillBar(skillLevel) {
        const maxBars = 5;
        const filledBars = Math.floor(skillLevel / 20); // 0-100 skill -> 0-5 bars
        return '█'.repeat(filledBars) + '░'.repeat(maxBars - filledBars);
    }

    getHealthColor(current, max) {
        const percentage = current / max;
        if (percentage < 0.25) return this.frameSystem.colors.error;
        if (percentage < 0.5) return '#ffff00';
        return this.frameSystem.colors.success;
    }

    displayNoCharacters() {
        this.screen.setText('characterPortrait', 
            'No characters found.\n\nCreate a new character\nto begin your adventure!', {
            color: this.frameSystem.colors.text,
            align: 'center'
        });
        
        // Clear other regions
        ['charName', 'charLevel', 'charClass', 'charHealth', 'charExp', 
         'combatSkill', 'magicSkill', 'craftingSkill', 'weapon', 'armor'].forEach(region => {
            this.screen.setText(region, '', { color: this.frameSystem.colors.text });
        });
    }

    previousCharacter() {
        if (this.selectedCharacterIndex > 0) {
            this.selectedCharacterIndex--;
            this.updateCharacterDisplay();
        }
    }

    nextCharacter() {
        if (this.selectedCharacterIndex < this.characters.length - 1) {
            this.selectedCharacterIndex++;
            this.updateCharacterDisplay();
        }
    }

    selectCharacter() {
        if (this.characters.length > 0) {
            const selectedChar = this.characters[this.selectedCharacterIndex];
            if (this.onCharacterSelect) {
                this.onCharacterSelect(selectedChar);
            }
        }
    }

    createNewCharacter() {
        // TODO: Implement character creation screen
        console.log('Creating new character...');
        if (this.onCharacterSelect) {
            this.onCharacterSelect({ createNew: true });
        }
    }

    handleAction(type, item) {
        console.log('Character select action:', type, item);
    }

    show() {
        this.frameSystem.showScreen(this.screen);
    }

    cleanup() {
        if (this.screen) {
            this.screen.cleanup();
        }
    }
}

// Make available globally
window.CharacterSelectScreen = CharacterSelectScreen;