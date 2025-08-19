# Dungeon Progression System: Group Coordination & Difficulty Selection

**Document Version**: 1.0  
**Date**: 2025-08-19  
**Status**: Core System Design  
**Maintained By**: Development-Manager Agent

---

## Dungeon Philosophy

**Group Unity** - All players must progress floors together or leave together
**Difficulty Choice** - Party selects challenge level before entering
**Progressive Rewards** - Deeper floors and higher difficulties offer better loot
**Risk/Reward Balance** - Greater challenges yield proportionally greater rewards
**Final Boss Focus** - Each dungeon culminates in challenging boss encounter

---

## Dungeon Structure System

### Dungeon Categories
```yaml
Tutorial_Dungeons: (Levels 1-3, 3 floors each)
  purpose: "Learn basic mechanics and group coordination"
  difficulty_options: [Easy, Normal]
  max_players: 4
  boss_type: "Basic monsters with simple mechanics"
  special_features: "Resurrection shrines on each floor"

Standard_Dungeons: (Levels 4-6, 5 floors each)
  purpose: "Core gameplay experience"
  difficulty_options: [Easy, Normal, Hard]
  max_players: 8
  boss_type: "Tactical bosses requiring coordination"
  special_features: "Environmental puzzles and traps"

Advanced_Dungeons: (Levels 7-9, 7 floors each)
  purpose: "High-skill gameplay with complex mechanics"
  difficulty_options: [Normal, Hard, Elite]
  max_players: 8
  boss_type: "Multi-phase bosses with unique abilities"
  special_features: "Dynamic environments and advanced tactics"

Elite_Dungeons: (Levels 10+, 10+ floors each)
  purpose: "Ultimate challenge for master players"
  difficulty_options: [Hard, Elite, Nightmare]
  max_players: 8
  boss_type: "Legendary encounters requiring perfect execution"
  special_features: "Everything, plus unique mechanics per dungeon"
```

### Floor Structure Template
```yaml
Floor_Layout: (Standard 5-floor dungeon)
  Floor_1: "Introduction" - Basic enemies, simple layout
  Floor_2: "Escalation" - More enemies, introduce mechanics
  Floor_3: "Challenge" - Complex encounters, environmental hazards
  Floor_4: "Preparation" - Elite enemies, best pre-boss loot
  Floor_5: "Boss Floor" - Final boss encounter with arena

Floor_Properties:
  size: "Scales with difficulty (Easy: 30x20, Elite: 60x40)"
  monster_density: "Scales with difficulty and party size"
  loot_quality: "Improves with floor depth and difficulty"
  environmental_hazards: "More complex at deeper floors"
  escape_routes: "Multiple exits available until final floor"
```

---

## Difficulty Selection System

### Pre-Entry Difficulty Selection
```yaml
Difficulty_Voting:
  trigger: "When party approaches dungeon entrance"
  requirement: "All party members must vote"
  options: "Based on dungeon type and party average level"
  time_limit: "60 seconds to vote or defaults to easiest available"
  change_restriction: "Cannot change difficulty once entered"

Recommended_Levels: (Party average skill levels)
  Easy: "Average 15-25 in primary skills"
  Normal: "Average 25-40 in primary skills" 
  Hard: "Average 40-60 in primary skills"
  Elite: "Average 60-80 in primary skills"
  Nightmare: "Average 80+ in primary skills"

Warning_System:
  under_recommended: "Clear warnings about increased danger"
  over_recommended: "Reduced loot quality notifications"
  mixed_party: "Warnings when party has wide skill gaps"
  first_time: "Extra warnings for players new to difficulty"
```

### Difficulty Scaling Mechanics
```yaml
Easy_Difficulty: (Learning and casual play)
  monster_health: "-25% from base"
  monster_damage: "-30% from base"
  monster_accuracy: "-20% from base"
  loot_quality: "-25% from base"
  experience_gain: "-10% from base"
  special_features: "Extra revival shrines, longer revival windows"

Normal_Difficulty: (Standard experience)
  monster_health: "Base values"
  monster_damage: "Base values"
  monster_accuracy: "Base values"
  loot_quality: "Base values"
  experience_gain: "Base values"
  special_features: "Standard mechanics as designed"

Hard_Difficulty: (Challenging gameplay)
  monster_health: "+50% from base"
  monster_damage: "+25% from base"
  monster_accuracy: "+15% from base"
  loot_quality: "+50% from base"
  experience_gain: "+25% from base"
  special_features: "Additional monster abilities, environmental hazards"

Elite_Difficulty: (Expert challenge)
  monster_health: "+100% from base"
  monster_damage: "+50% from base"
  monster_accuracy: "+30% from base"
  loot_quality: "+100% from base"
  experience_gain: "+50% from base"
  special_features: "Advanced AI, unique monster variants, complex mechanics"

Nightmare_Difficulty: (Legendary challenge)
  monster_health: "+200% from base"
  monster_damage: "+100% from base"
  monster_accuracy: "+50% from base"
  loot_quality: "+300% from base"
  experience_gain: "+100% from base"
  special_features: "Everything + permadeath consequences even with party alive"
```

---

## Group Progression Requirements

### Movement Coordination
```yaml
Floor_Advancement:
  requirement: "All living party members must be at stairs location"
  vote_system: "Simple majority (50%+) to advance to next floor"
  dead_players: "Dead players automatically vote 'Yes' to advance"
  time_limit: "5 minutes to decide, then automatic retreat vote"
  
Retreat_Coordination:
  requirement: "Any player can call retreat vote"
  vote_threshold: "Simple majority to approve retreat"
  override_conditions: "Automatic retreat when 75% of party dead"
  retreat_timer: "30 seconds to execute retreat once approved"

No_Solo_Advancement:
  restriction: "Individual players cannot advance floors alone"
  enforcement: "Stairs sealed until group coordination"
  emergency_exception: "Solo advance allowed if 75%+ of party dead"
  rejoining: "Advanced players can return to help if retreat called"
```

### Abandonment Penalties
```yaml
Party_Abandonment: (Leave dungeon while others remain)
  loot_penalty: "Lose 75% of current loot by value (random selection)"
  social_penalty: "Reputation loss with abandoned party members"
  restriction_penalty: "Cannot rejoin party for remainder of dungeon run"
  progression_penalty: "Reduced experience gain for 24 hours real-time"

Abandonment_Triggers:
  voluntary_leave: "Player chooses to exit while party continues"
  vote_against_retreat: "Party votes to retreat, player refuses"
  timeout_abandonment: "Player disconnects for 10+ minutes in dungeon"
  grief_abandonment: "Player deliberately sabotages group progression"

Abandonment_Exceptions:
  emergency_disconnect: "No penalty if reconnects within 5 minutes"
  mutual_agreement: "Reduced penalties if all parties agree to split"
  solo_rescue: "No penalty if attempting to rescue dead party members"
  time_constraints: "Reduced penalties for real-life emergency situations"
```

### Group Communication Systems
```yaml
Progression_Voting_Interface:
  visual_display: "Clear vote status for all party members"
  timer_display: "Countdown for decision time limits"
  reason_system: "Players can explain their votes"
  quick_votes: "Pre-set options like 'Need healing', 'Low on supplies'"

Decision_Broadcasting:
  floor_advancement: "Clear notification when group decides to advance"
  retreat_calls: "Obvious alerts when retreat is proposed"
  difficulty_warnings: "Automatic warnings about challenge increases"
  loot_notifications: "Updates when valuable items are found"
```

---

## Progressive Reward System

### Loot Quality Scaling
```yaml
Floor_Depth_Bonuses:
  floor_1: "Base loot quality"
  floor_2: "+25% loot quality"
  floor_3: "+50% loot quality"
  floor_4: "+75% loot quality"
  floor_5_boss: "+200% loot quality + guaranteed rare items"

Difficulty_Multipliers:
  easy: "0.75x loot quality"
  normal: "1.0x loot quality"
  hard: "1.5x loot quality"
  elite: "2.0x loot quality"
  nightmare: "4.0x loot quality"

Combined_Scaling: (Floor depth × Difficulty multiplier)
  example_normal_floor_4: "Base × 1.75 × 1.0 = 175% loot quality"
  example_elite_boss: "Base × 3.0 × 2.0 = 600% loot quality"
  example_nightmare_boss: "Base × 3.0 × 4.0 = 1200% loot quality"
```

### Boss Encounter Rewards
```yaml
Boss_Defeat_Bonuses:
  guaranteed_rare: "Every boss drops at least one rare item"
  unique_items: "Bosses can drop items not found elsewhere"
  crafting_materials: "High-quality materials for master crafting"
  skill_books: "Tomes that provide skill bonuses or unlock abilities"
  
Boss_Specific_Loot:
  difficulty_scaling: "Higher difficulties unlock exclusive boss loot tables"
  class_appropriate: "Loot tables adjusted based on party composition"
  progression_items: "Items that unlock access to higher dungeons"
  prestige_rewards: "Cosmetic items that show achievement level"

Special_Boss_Mechanics:
  loot_choice: "Party can choose from multiple reward options"
  crafting_opportunity: "Use boss materials immediately for upgrades"
  power_inheritance: "Weapons can inherit defeated boss abilities"
  dungeon_mastery: "Perfect boss defeats unlock dungeon variants"
```

### Experience and Skill Progression
```yaml
Dungeon_Completion_Bonuses:
  skill_experience: "Large skill gains for primary skills used"
  knowledge_points: "Account progression bonuses"
  class_progression: "Progress toward class requirements"
  mastery_unlocks: "Access to advanced abilities and techniques"

Group_Coordination_Bonuses:
  teamwork_bonus: "+25% experience when entire party survives"
  revival_experience: "Bonus for successfully reviving party members"
  leadership_growth: "Leadership skill gains for party coordination"
  teaching_bonus: "Higher skilled players gain bonus for helping others"
```

---

## Dungeon Navigation System

### Floor Layout Principles
```yaml
Exploration_Progression:
  entrance_area: "Safe zone for party coordination and preparation"
  main_floor: "Primary exploration and combat area"
  elite_area: "Optional high-risk, high-reward section"
  boss_approach: "Preparation area before final encounter"
  escape_routes: "Multiple paths back to entrance (until boss floor)"

Navigation_Aids:
  party_markers: "Always show party member locations"
  objective_markers: "Clear indication of stairs and important areas"
  danger_warnings: "Visual indicators for high-risk areas"
  loot_highlights: "Subtle indicators for valuable item locations"

Environmental_Storytelling:
  progressive_decay: "Floors become more dangerous-looking as you descend"
  thematic_consistency: "Each dungeon has coherent theme and atmosphere"
  foreshadowing: "Hints about boss and final floor mechanics"
  interactive_elements: "Environmental objects that provide tactical options"
```

### Dynamic Floor Generation
```yaml
Procedural_Elements: (Randomized each visit)
  room_layout: "Different configuration of rooms and corridors"
  monster_placement: "Varied enemy positions and patrol routes"
  loot_distribution: "Different treasure locations"
  trap_placement: "Randomized hazard positions"

Fixed_Elements: (Consistent each visit)
  floor_theme: "Same visual style and environment type"
  boss_encounter: "Identical boss mechanics and arena"
  progression_path: "Same general route to stairs and boss"
  key_landmarks: "Important navigation points remain constant"

Scaling_Elements: (Adjust based on party and difficulty)
  monster_types: "Different enemies based on party composition"
  encounter_frequency: "Adjusted for party size and skill"
  resource_availability: "Healing items and supplies scaled appropriately"
  environmental_hazards: "Complexity adjusted for difficulty level"
```

---

## Dungeon Completion Tracking

### Progress Metrics
```yaml
Individual_Tracking:
  dungeons_completed: "Count by difficulty and dungeon type"
  floors_reached: "Deepest floor achieved in each dungeon"
  bosses_defeated: "Record of boss encounters won"
  solo_achievements: "Special recognition for exceptional individual performance"

Group_Tracking:
  party_synergy: "Measure of group coordination effectiveness"
  mutual_aid: "Count of revivals and assistance provided"
  leadership_moments: "Recognition for guiding party through challenges"
  collective_achievements: "Rewards that require entire party cooperation"

Dungeon_Mastery:
  perfect_runs: "Complete dungeon without any party deaths"
  speed_runs: "Complete within time limits for bonus rewards"
  challenge_runs: "Special restrictions like no magic or no heavy armor"
  discovery_runs: "Find all secrets and optional areas"
```

### Unlock Progression
```yaml
Dungeon_Access: (New dungeons unlock based on completion)
  linear_progression: "Must complete easier dungeons to access harder ones"
  branching_paths: "Some dungeons require multiple prerequisite completions"
  skill_gates: "High-level dungeons require specific skill minimums"
  story_progression: "Narrative dungeons unlock based on previous story completion"

Difficulty_Unlocks:
  progressive_access: "Must complete Normal to unlock Hard, etc."
  mastery_requirements: "Higher difficulties require multiple completions"
  group_coordination: "Some difficulties require proven group coordination"
  individual_skill: "Personal skill minimums for highest difficulties"
```

This dungeon progression system creates a structured but flexible advancement path that emphasizes group cooperation while providing clear goals and meaningful rewards for different play styles and skill levels.