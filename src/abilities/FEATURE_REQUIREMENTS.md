# Feature Requirements for Non-Combat Abilities

**Status:** CRITICAL - 32+ abilities need actual game systems to function  
**Priority:** These abilities are currently unusable without feature implementation  
**Scope:** Non-combat systems that extend beyond balancing into core gameplay mechanics

## Overview

While combat abilities work within the existing combat system and only need balancing, **32+ non-combat abilities require entirely new game systems** to be functional. These abilities currently have effects defined but no underlying systems to support them.

---

## HIGH PRIORITY SYSTEMS (Core Dungeon Interaction)

### 1. LOCKPICKING & SECURITY SYSTEM 
NOTE: Let's make locked chests in the dungeon, and lockboxes that can be looted that have loot based on their tier.
**Required for 5 abilities:** `pick_lock`, `disable_trap`, `master_lockpick`, `pickpocket`, `grand_heist`

#### Core Requirements:
- **Lockable Objects:** Doors, chests, containers with difficulty ratings (1-20)
- **Lock Types:** Simple, Complex, Magical, Trapped with different skill requirements
- **Dungeon Integration:** Locked doors block progression, locked chests contain better loot
- **Failure Consequences:** Broken lockpicks, triggered alarms, damaged locks
- **Time System:** Lockpicking takes time, can be interrupted by enemies

#### Implementation Files Needed:
```
src/systems/LockpickingSystem.js - Core mechanics
src/dungeon/LockableObjects.js - Object definitions  
src/ui/LockpickingUI.js - Player interaction interface
```

#### Integration Points:
- **DungeonGenerator:** Place locked objects with appropriate difficulty
- **GameState:** Track lockpick tools, lock states, attempted break-ins
- **EventSystem:** Lock picked events, security alerts, trap triggers

---

### 2. CRAFTING & ITEM CREATION SYSTEM
Notes: This is a good implementation system
**Required for 4 abilities:** `basic_smithing`, `brew_potion`, `enchant_item`, `masterwork_creation`

#### Core Requirements:
- **Crafting Stations:** Forge, Alchemy Table, Enchanting Altar locations in world
- **Recipe System:** Ingredient requirements, skill thresholds, success rates  
- **Material Collection:** Raw materials, reagents, components found in exploration
- **Item Generation:** Create weapons, armor, potions, enchanted items with random properties
- **Quality Tiers:** Basic, Fine, Masterwork, Legendary crafted items

#### Implementation Files Needed:
```
src/systems/CraftingSystem.js - Core crafting mechanics
src/equipment/CraftingRecipes.js - All recipe definitions
src/equipment/Materials.js - Raw materials and components
src/ui/CraftingUI.js - Crafting interface and recipe browser
```

#### Integration Points:
- **Equipment System:** Generated items integrate with existing weapons/armor
- **SkillSystem:** Crafting success based on relevant skills (blacksmithing, alchemy)
- **Inventory:** Material storage, component requirements checking

---

## MEDIUM PRIORITY SYSTEMS (World Interaction)

### 3. SOCIAL & NPC INTERACTION SYSTEM
Notes: Let's make this coming soon, we will do NPC's and quests later.
**Required for 6 abilities:** `fast_talk`, `gather_information`, `negotiate_price`, `diplomatic_immunity`, `master_performer`, `legendary_presence`

#### Core Requirements:
- **NPC System:** Named characters with personalities, attitudes, knowledge
- **Dialogue Trees:** Branching conversations with skill-based options
- **Reputation System:** Faction standing, personal relationships, consequences
- **Merchant Integration:** Dynamic pricing, reputation discounts, exclusive items
- **Information Networks:** NPCs share rumors, quests, world state information

#### Implementation Files Needed:
```
src/systems/SocialSystem.js - NPC interactions and reputation
src/npcs/NPCDefinitions.js - Character personalities and knowledge
src/dialogue/DialogueSystem.js - Conversation trees and outcomes  
src/ui/DialogueUI.js - Conversation interface
```

#### Integration Points:
- **DungeonGenerator:** Place NPCs in appropriate locations
- **QuestSystem:** NPCs provide information and missions
- **GameState:** Track reputation, completed conversations, known information

---

### 4. SURVIVAL & RESOURCE MANAGEMENT SYSTEM  
Notes: We can implement outdoor dungeons that go deeper into a jungle or outdoor areas that implement these features, build shelter could be something that has a high resource cost but you can build a camp in a dungeons. The tier of the camp vs the tier of the dungeon tells you if you get attacked along with some skill checks. weather could be used to apply buffs and weaknesses. Track creature could be used for quests.
**Required for 7 abilities:** `track_creature`, `find_water`, `forage_food`, `weather_prediction`, `build_shelter`, `master_tracker`, `wilderness_mastery`

#### Core Requirements:
- **Basic Needs:** Hunger, thirst, fatigue systems affecting player performance
- **Weather System:** Dynamic weather affecting visibility, movement, resource needs
- **Tracking System:** Creature trails, environmental clues, time-based information decay
- **Resource Gathering:** Food sources, water locations, material collection points
- **Environmental Hazards:** Exposure damage, dangerous terrain, survival challenges

#### Implementation Files Needed:
```
src/systems/SurvivalSystem.js - Hunger, thirst, exposure mechanics
src/systems/WeatherSystem.js - Dynamic weather effects
src/systems/TrackingSystem.js - Creature trail detection and following
src/environment/ResourceNodes.js - Gathering locations and yields
```

#### Integration Points:
- **GameState:** Track hunger/thirst levels, weather conditions, known trails
- **CombatSystem:** Survival conditions affect combat performance
- **DungeonGenerator:** Place resource nodes, vary by biome/environment

---

### 5. INVESTIGATION & KNOWLEDGE SYSTEM
Notes: This is good, but it should also have something about spellcasting scrolls and books. 
**Required for 6 abilities:** `examine_closely`, `research_topic`, `identify_magic`, `forensic_analysis`, `ancient_knowledge`, `omniscient_scholar`

#### Core Requirements:  
- **Object Inspection:** Multi-layer information revelation based on skills
- **Lore Database:** Historical information, magical knowledge, world facts
- **Research Mechanics:** Libraries, books, scrolls with searchable information
- **Evidence System:** Crime scenes, clues, deductive reasoning chains
- **Knowledge Progression:** Information unlocks leading to deeper secrets

#### Implementation Files Needed:
```
src/systems/InvestigationSystem.js - Clue gathering and analysis
src/lore/KnowledgeDatabase.js - All world information and lore
src/systems/MagicIdentification.js - Magic item and effect analysis
src/ui/InvestigationUI.js - Evidence tracking and research interface
```

#### Integration Points:
- **Equipment:** Magic item identification reveals properties
- **QuestSystem:** Investigation abilities unlock quest information
- **DungeonGenerator:** Place clues, books, research materials

---

## SPECIALIZED SYSTEMS (Advanced Features)

### 6. SUMMONING & COMPANION SYSTEM
Note: For sustained skills/and pets they can have an ongoing AP cost.
**Required for 4 abilities:** `animal_companion_strike`, `animate_skeleton`, `summon_demon`, `animal_speech`

#### Core Requirements:
- **Companion AI:** Pet pathfinding, combat behavior, command following
- **Summoning Mechanics:** Temporary vs permanent creatures, upkeep costs
- **Creature Database:** Stats, abilities, and behaviors for summoned entities
- **Communication:** Animal speech creates temporary NPC interactions
- **Resource Management:** Summoning materials, corpse availability for necromancy

#### Implementation Files Needed:
```
src/systems/SummoningSystem.js - Creature summoning and control
src/entities/SummonedCreatures.js - Companion and summon definitions
src/ai/CompanionAI.js - Pet behavior and command processing
```

---

### 7. TRANSFORMATION & ADVANCED MAGIC SYSTEM
Notes: These seem okay
**Required for 7 abilities:** `wild_shape`, `dispel_magic`, `sanctuary`, `divine_intervention`, `curse`, `dark_pact`, `corpse_explosion`

#### Core Requirements:
- **Shapeshift System:** Player form changes with different stats/abilities
- **Magic Interaction:** Spell removal, protection zones, effect modification
- **Persistent Effects:** Long-term curses, blessings, supernatural consequences
- **Divine Mechanics:** Favor systems, miracle chances, divine intervention triggers
- **Corpse Tracking:** Dead body persistence, explosion targeting, necromantic resources

#### Implementation Files Needed:
```
src/systems/TransformationSystem.js - Shapeshifting mechanics
src/systems/MagicInteraction.js - Spell interaction and modification
src/systems/PersistentEffects.js - Long-term magical consequences
src/systems/DivineSystem.js - Divine favor and intervention
```

---

## IMPLEMENTATION ROADMAP

### Phase 1: Core Dungeon Systems (High Impact)
1. **Lockpicking System** - Immediate dungeon progression improvement
2. **Basic Crafting** - Item creation and material collection
3. **Simple NPC Interactions** - Merchants and information gathering

### Phase 2: World Systems (Medium Impact)
1. **Survival Mechanics** - Basic hunger/thirst/weather
2. **Investigation Tools** - Object examination and lore access  
3. **Social Reputation** - NPC relationships and consequences

### Phase 3: Advanced Systems (Lower Priority)
1. **Summoning & Companions** - Complex AI and creature management
2. **Transformation Magic** - Advanced magical mechanics
3. **Divine/Supernatural** - High-level magical consequences

### Phase 4: Integration & Polish
1. **System Interconnections** - How all systems work together
2. **UI/UX Polish** - Streamlined interfaces for all systems
3. **Balance & Testing** - Ensure all systems enhance rather than complicate gameplay

---

## MINIMUM VIABLE PRODUCT (MVP) APPROACH

For each system, implement basic functionality first:

**Lockpicking MVP:** Simple success/failure with skill checks
**Crafting MVP:** Basic recipes with common materials  
**Social MVP:** Simple merchant interactions and information gathering
**Survival MVP:** Hunger/thirst bars with basic resource gathering
**Investigation MVP:** Multi-level object examination
**Summoning MVP:** Single companion type with basic AI

Advanced features can be added iteratively once core systems are stable.

---

## CURRENT STATUS: BLOCKED

**32+ abilities are currently non-functional** without these underlying systems. Combat abilities work because the combat system exists, but exploration abilities are essentially placeholder code until these systems are implemented.

**Recommended Next Steps:**
1. Choose 1-2 high-priority systems for immediate implementation
2. Design system interfaces and integration points
3. Implement MVP versions focusing on core functionality
4. Test integration with existing ability system
5. Iterate and expand based on gameplay feedback