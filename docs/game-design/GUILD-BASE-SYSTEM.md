# Guild Base System: 8-Player Shared Hub

**Document Version**: 1.0  
**Date**: 2025-08-19  
**Status**: Core System Design (Replaces Auction House)  
**Maintained By**: Development-Manager Agent

---

## System Overview

**Purpose** - Replace MMO-style auction house with appropriate 8-player shared facilities
**Scope** - Central hub for party coordination, storage, and progression
**Scale** - Designed specifically for 8-player groups, not larger populations
**Integration** - Works with existing 30+ skill system and dynamic classes

---

## Guild Hall Structure

### Central Facilities

```yaml
Guild_Vault: (Shared Storage)
  capacity: "Unlimited storage for party equipment"
  access_control: "All 8 party members can deposit/withdraw"
  organization:
    categories: [Weapons, Armor, Consumables, Materials, Rare_Items]
    auto_sorting: "Items automatically categorized by type and quality"
    search_function: "Find specific items quickly"
  security: "Theft-proof - only current party members have access"
  
Private_Chambers: (8 Individual Rooms)
  personal_storage: "50 slots private storage per player"
  customization:
    trophy_display: "Show rare items and achievements"
    skill_focus: "Display current class and specializations"
    personal_notes: "Planning and goal tracking"
  meditation_bonus: "Skill training 25% faster when resting here"
  resurrection_point: "Respawn location after permadeath"

Crafting_Stations: (Collaborative Workshops)
  smithing_forge:
    requirements: "Smithing skill to operate"
    benefits: "+25% success rate, access to rare materials"
    cooperation: "Multiple players can contribute materials/skills"
  alchemy_laboratory:
    requirements: "Alchemy skill to operate"  
    benefits: "+25% potion effectiveness, combine rare ingredients"
    cooperation: "Players can share recipes and materials"
  enchanting_circle:
    requirements: "Enchanting skill to operate"
    benefits: "+25% enchantment power, access to unique effects"
    cooperation: "Multiple enchanters can combine efforts"
```

### Coordination Facilities

```yaml
Planning_Room: (Tactical Preparation)
  dungeon_maps: "3D visualization of explored dungeons"
  party_planning: "Coordinate skill builds and class development"
  loot_distribution: "Fair allocation system with voting"
  expedition_scheduling: "Plan dungeon runs and coordinate timing"

Communication_Hub:
  message_board: "Leave notes for offline party members"
  skill_requests: "Request specific skills for planned expeditions"
  resource_sharing: "Coordinate material and equipment needs"
  achievement_tracking: "Group progress and individual contributions"

Training_Grounds: (Practice Area)
  skill_dummies: "Practice combat skills safely"
  spell_ranges: "Test magic abilities without consequences"
  cooperation_drills: "Practice multi-player skill combinations"
  class_testing: "Experiment with different class builds"
```

---

## Storage and Trading Systems

### Shared Storage Mechanics

```yaml
Guild_Vault_Operations:
  deposit_item: "Any party member can add items to shared storage"
  withdraw_item: "Any party member can take items (with optional approval system)"
  reserve_item: "Mark items for specific party member or purpose"
  contribution_tracking: "Track who contributed what for fair distribution"

Access_Control:
  party_membership: "Only current 8-player party has access"
  temporary_access: "Short-term guests for trading purposes"
  leadership_permissions: "Party leader can set additional restrictions"
  audit_trail: "Complete log of all storage transactions"

Organization_System:
  smart_categorization: "Items auto-sorted by type, quality, level requirements"
  skill_filtering: "Show only items usable with current character skills"
  class_recommendations: "Highlight items useful for current/planned classes"
  party_optimization: "Suggest item distribution for party balance"
```

### Direct Trading System

```yaml
Player_to_Player_Trading:
  initiate_trade: "Right-click player → 'Propose Trade'"
  trade_window:
    item_display: "Drag items to trade slots"
    skill_verification: "Show if items are usable by recipient"
    value_estimation: "Rough gold value for reference"
    confirmation: "Both players must confirm before completion"
  
Party_Pool_System:
  consumable_sharing: "Potions, arrows, food automatically shared"
  emergency_access: "Critical items (healing) available to all in danger"
  resource_pooling: "Materials for group crafting projects"
  expedition_supplies: "Pre-distributed supplies for dungeon runs"

External_Trading: (With NPCs and Other Parties)
  vendor_sales: "Simple fixed-price transactions with NPCs"
  inter_party_trade: "Trading with other 8-player groups"
  material_exchange: "Bulk trading of crafting materials"
  reputation_benefits: "Better prices based on party achievements"
```

---

## Skill Integration

### Crafting Collaboration

```yaml
Multi_Player_Crafting:
  skill_combination:
    primary_crafter: "Player with highest relevant skill leads"
    assistants: "Other players provide materials or secondary skills"
    quality_bonus: "Multiple skilled players improve outcome"
    learning_opportunity: "Assistants gain skill experience"

Guild_Craft_Projects:
  base_improvements: "Upgrade guild facilities through group effort"
  legendary_items: "Create artifacts requiring multiple master crafters"
  research_projects: "Discover new recipes through combined knowledge"
  monument_creation: "Build trophies commemorating party achievements"

Skill_Synergy_Stations:
  combination_forge: "Smithing + Enchanting for magical weapons"
  alchemical_research: "Alchemy + multiple magic schools for unique potions"
  tactical_planning: "Leadership + multiple combat skills for party buffs"
  survival_preparation: "Survival + various skills for expedition advantages"
```

### Class Development Support

```yaml
Class_Planning_Tools:
  skill_calculator: "Plan skill point allocation for desired classes"
  prerequisite_tracking: "Monitor progress toward class requirements"
  synergy_analysis: "Identify beneficial class combinations within party"
  timeline_planning: "Coordinate class unlocks with party development"

Mentorship_System:
  skill_teaching: "Experienced players help others train skills faster"
  class_guidance: "Players who unlocked classes share knowledge"
  ability_demonstration: "Show new abilities to help party planning"
  coordination_training: "Practice multi-class ability combinations"
```

---

## Party Coordination

### Leadership and Decision Making

```yaml
Party_Leadership:
  leader_designation: "Simple selection, can be changed anytime"
  leadership_abilities: "Utilize Leadership skill for party benefits"
  tactical_authority: "Make quick decisions during combat/exploration"
  resource_allocation: "Distribute loot and manage party resources"

Group_Decision_System:
  major_choices: "Vote on important expedition decisions"
  resource_usage: "Decide on consumption of rare/valuable items"
  risk_assessment: "Evaluate dangerous opportunities as group"
  member_changes: "Vote on adding/removing party members"

Coordination_Tools:
  real_time_chat: "Communication during expeditions"
  tactical_markers: "Mark important locations and objectives"
  status_sharing: "Share health, mana, skill status with party"
  emergency_signals: "Quick distress calls and assistance requests"
```

### Progression Tracking

```yaml
Party_Achievements:
  dungeon_completions: "Track successful expeditions by difficulty"
  boss_defeats: "Record major enemies conquered"
  rare_discoveries: "Document unique items and locations found"
  skill_milestones: "Celebrate individual and group skill achievements"

Contribution_Recognition:
  individual_contributions: "Track each player's role in successes"
  skill_specialization: "Recognize mastery in specific areas"
  support_contributions: "Acknowledge healing, buffing, coordination"
  leadership_moments: "Record instances of excellent party leadership"

Goal_Setting:
  short_term_objectives: "Next dungeon, skill targets, equipment goals"
  long_term_planning: "Class development, legendary item creation"
  party_specialization: "Develop complementary skill distributions"
  achievement_hunting: "Target specific accomplishments as group"
```

---

## Implementation Technical Requirements

### Data Structures

```typescript
interface GuildBase {
  readonly PARTY_SIZE: 8
  readonly SHARED_STORAGE_UNLIMITED: true
  readonly PRIVATE_STORAGE_SLOTS: 50
  
  partyId: string
  members: PartyMember[]
  sharedVault: GuildVault
  privateRooms: Map<PlayerId, PrivateRoom>
  craftingStations: CraftingStation[]
  coordinationTools: CoordinationFacility[]
}

interface GuildVault {
  items: StoredItem[]
  categories: ItemCategory[]
  accessLog: VaultTransaction[]
  reservations: ItemReservation[]
  
  // Optimized for 8-player access
  concurrentAccessLock: boolean
  transactionQueue: VaultOperation[]
}

interface PrivateRoom {
  ownerId: PlayerId
  storage: PrivateStorage
  trophyDisplay: DisplayedItem[]
  personalNotes: string[]
  lastVisited: Date
}
```

### Performance Considerations

```yaml
Optimization_Strategy:
  concurrent_access: "Support up to 8 simultaneous users efficiently"
  storage_efficiency: "Unlimited shared + (8 × 50) private = manageable"
  real_time_sync: "Compatible with 2-second tick system"
  skill_calculations: "Cache complex skill synergy computations"

Scalability_Limits:
  party_size: "Hard-coded for 8 players, no scaling needed"
  storage_growth: "Monitor shared vault size, implement cleanup tools"
  interaction_complexity: "Limit simultaneous operations per tick"
  skill_integration: "Optimize for 30+ skill system calculations"
```

---

## Migration from Auction House

### Removal Strategy

```yaml
Auction_House_Elimination:
  remove_systems:
    - Complex bidding and listing mechanisms
    - Multiple currency types (Trade Tokens, Crafting Credits)
    - Market manipulation detection
    - Regional pricing variations
    - Cross-account transaction monitoring
  
  preserve_functionality:
    - Basic item storage needs → Guild Vault
    - Player-to-player trading → Direct Trade System
    - Crafting material management → Crafting Stations
    - Cross-character storage → Private Rooms

Simplified_Economy:
  single_currency: "Gold only"
  fixed_pricing: "NPC vendors with stable prices"
  direct_trading: "Player-to-player without fees or restrictions"
  shared_resources: "Party-based resource management"
```

This guild base system provides all the functionality needed for 8-player cooperation while eliminating the unnecessary complexity of MMO-style auction houses. It integrates seamlessly with the existing 30+ skill system and supports the dynamic class emergence mechanics.