# Group-Only Permadeath System

**Document Version**: 1.0  
**Date**: 2025-08-19  
**Status**: Core System Design  
**Maintained By**: Development-Manager Agent

---

## Permadeath Philosophy

**Group Survival** - Only total party wipe results in true permadeath
**Revival Mechanics** - Dead players can be revived while party members remain alive
**Tactical Coordination** - Protecting vulnerable members becomes crucial
**Progressive Stakes** - Deeper dungeon levels increase revival difficulty
**Meaningful Consequences** - Death has penalties but doesn't end progression

---

## Death and Revival Mechanics

### Individual Death States
```yaml
Unconscious: (0 health, but not dead)
  duration: 10 ticks without intervention
  revival: Any party member can revive with first aid (5 ticks)
  penalties: None if revived within time limit
  progression: Becomes "Dead" if time expires

Dead: (health reaches negative threshold)
  duration: Permanent until revived
  revival: Requires resurrection spell or ability
  penalties: -25% health for remainder of dungeon run
  restrictions: Cannot be revived again in same combat

Soul_Departed: (dead for 60+ ticks without revival)
  duration: Until manual restoration
  revival: Requires rare revival items or powerful magic
  penalties: -50% health and -25% all skills for remainder of run
  restrictions: Can only be revived at specific shrine locations
```

### Revival Methods by Priority
```yaml
First_Aid: (For unconscious players)
  requirements: Any living party member
  tick_cost: 5 ticks
  success_rate: 90%
  result: "Restore to 25% health, no penalties"
  restrictions: "Only works on unconscious, not dead"

Basic_Resurrection: (Healing magic)
  requirements: [Healing_Magic: 25, 30 mana]
  tick_cost: 30 ticks
  success_rate: 75% + (Healing_Magic skill / 4)
  result: "Restore to 15% health, -25% health penalty"
  restrictions: "Cannot revive Soul_Departed state"

Advanced_Resurrection: (Master healing)
  requirements: [Healing_Magic: 50, 80 mana]
  tick_cost: 60 ticks
  success_rate: 90% + (Healing_Magic skill / 5)
  result: "Restore to 50% health, no penalties"
  restrictions: "Can revive Soul_Departed if at shrine"

Divine_Resurrection: (Paladin class ability)
  requirements: [Paladin class, 150 mana]
  tick_cost: 45 ticks
  success_rate: 95%
  result: "Restore to 75% health, temporary divine blessing"
  restrictions: "Once per dungeon per paladin"

Resurrection_Item: (Rare consumables)
  requirements: [Phoenix_Feather or similar rare item]
  tick_cost: 15 ticks
  success_rate: 100%
  result: "Restore to 100% health, all penalties removed"
  restrictions: "Extremely rare, expensive items"
```

### Group Death Escalation
```yaml
1_Player_Dead: (87.5% party strength)
  - Standard revival mechanics apply
  - No additional penalties
  - Combat continues normally
  - Dead player becomes observer

2_Players_Dead: (75% party strength)
  - Revival becomes more difficult (+10 ticks to all revival attempts)
  - Party gains "Desperation" bonus: +25% damage for living members
  - Enemy AI becomes more aggressive
  - Group morale effects begin

3_Players_Dead: (62.5% party strength)
  - Automatic "Retreat Available" option appears
  - Revival difficulty increases significantly (+20 ticks)
  - Living members gain "Last Stand" bonus: +50% damage, +25% defense
  - Environmental dangers may increase

4_Players_Dead: (50% party strength)
  - Forced Retreat becomes available with severe penalties
  - Revival extremely difficult (+30 ticks, -25% success rate)
  - "Final Stand" mode: Living members gain massive bonuses but cannot heal
  - Some enemies may flee, sensing weakness

5_Players_Dead: (37.5% party strength)
  - Automatic Retreat triggers unless overridden
  - Revival nearly impossible without rare items
  - Living members gain "Heroic Desperation": Double all bonuses
  - Environmental collapse may begin (timed escape)

6_Players_Dead: (25% party strength)
  - Mandatory Retreat countdown begins (30 ticks)
  - Revival requires divine intervention or artifacts
  - Survivor bonuses reach maximum
  - Dungeon begins actively trying to eliminate remaining players

7_Players_Dead: (12.5% party strength)
  - Emergency Evacuation: 15 tick countdown
  - Revival only possible with resurrection items
  - Sole survivor gains "Legendary Survivor" status
  - All enemies focus on eliminating final threats

8_Players_Dead: (0% party strength)
  - TOTAL PARTY WIPE
  - True permadeath triggers
  - All characters lost
  - Account progression penalties apply
```

---

## Retreat and Evacuation System

### Voluntary Retreat Options
```yaml
Safe_Retreat: (Available when 6+ players alive)
  requirements: "Majority vote (75% of living players)"
  penalties: "Lose 50% of current floor loot"
  benefits: "Keep all experience gained, equipment intact"
  restrictions: "Cannot retreat during active combat"

Emergency_Retreat: (Available when 4+ players alive)
  requirements: "Simple majority vote"
  penalties: "Lose 75% of current floor loot, -10% equipment durability"
  benefits: "Keep core equipment and most experience"
  restrictions: "5 tick casting time, interruptible"

Desperate_Escape: (Available when 2+ players alive)
  requirements: "Any living player can trigger"
  penalties: "Lose all current floor loot, -25% equipment durability"
  benefits: "Preserve characters and basic equipment"
  restrictions: "15 tick casting time, very interruptible"
```

### Abandonment Penalties
```yaml
Solo_Abandonment: (Leave party to save yourself)
  loot_penalty: "Lose 75% of current loot by value (randomly selected)"
  social_penalty: "Reputation hit with all party members"
  restriction_penalty: "Cannot join parties for 24 hours real-time"
  skill_penalty: "All social skills reduced by 10% for next character"

Group_Abandonment: (2-3 players abandon rest of party)
  loot_penalty: "Abandoning players lose 50% of loot"
  social_penalty: "Moderate reputation hit"
  restriction_penalty: "Cannot rejoin abandoned players for 12 hours"
  moral_penalty: "Temporary -5% to all healing received"
```

---

## Death Consequences and Benefits

### Individual Death Penalties
```yaml
Temporary_Penalties: (For remainder of current dungeon run)
  health_reduction: "-25% maximum health after revival"
  skill_debuff: "-10% effectiveness to all skills if Soul_Departed"
  equipment_damage: "Random equipment loses 10-25% durability"
  experience_loss: "Lose any unbanked experience from current floor"

Persistent_Penalties: (Carry to next character/session)
  resurrection_sickness: "-50% effectiveness for first 10 minutes of next session"
  death_mark: "Undead enemies +25% more likely to target you"
  fear_effect: "10% chance to hesitate before entering combat"
  equipment_trauma: "Cannot use same weapon type for 1 hour real-time"
```

### Death Benefits (Experience Through Adversity)
```yaml
Survival_Experience: (For players who witness deaths)
  combat_awareness: "+5% dodge chance for remainder of run"
  protective_instinct: "+25% healing effectiveness when healing recently dead"
  tactical_knowledge: "+10% accuracy when protecting vulnerable allies"
  leadership_growth: "Gain leadership experience when helping revive"

Resurrection_Mastery: (For players who perform revivals)
  healing_expertise: "+10% effectiveness to all healing magic"
  divine_favor: "Rare chance for divine intervention in future deaths"
  medical_knowledge: "Faster first aid application (-1 tick cost)"
  heroic_reputation: "+20% NPC reaction bonuses"

Death_Wisdom: (For players who are revived)
  death_resistance: "+25% resistance to instant death effects"
  second_chance: "10% chance to automatically stabilize at 1 HP"
  afterlife_insight: "+50% effectiveness vs undead enemies"
  appreciation_bonus: "+15% experience when helping other players"
```

---

## Dungeon-Specific Mechanics

### Difficulty-Based Revival Scaling
```yaml
Easy_Dungeons: (Tutorial and low-level areas)
  revival_bonus: "+25% success rate to all revival attempts"
  time_bonus: "+50% time before unconscious becomes dead"
  penalty_reduction: "Death penalties reduced by 50%"
  item_bonus: "Basic revival items occasionally found"

Normal_Dungeons: (Standard gameplay)
  standard_mechanics: "All revival mechanics work as designed"
  balanced_risk: "Death is meaningful but not devastating"
  fair_consequences: "Penalties match the risk undertaken"

Hard_Dungeons: (High-risk, high-reward)
  revival_penalty: "-25% success rate to all revival attempts"
  time_pressure: "-25% time before unconscious becomes dead"
  harsh_penalties: "Death penalties increased by 50%"
  rare_rewards: "Powerful revival items more likely to be found"

Elite_Dungeons: (Extreme challenge)
  minimal_revival: "-50% success rate, double tick costs"
  instant_death: "Unconscious state lasts only 3 ticks"
  severe_penalties: "Death penalties doubled"
  legendary_rewards: "Artifacts and resurrection items available"
```

### Environmental Revival Factors
```yaml
Sacred_Areas: (Temples, shrines, holy ground)
  revival_bonus: "+50% success rate to resurrection attempts"
  penalty_reduction: "Death penalties reduced by 75%"
  divine_intervention: "5% chance of automatic resurrection"
  mana_restoration: "Healers regain mana when performing revivals"

Cursed_Areas: (Necromantic zones, evil temples)
  revival_penalty: "-50% success rate to all attempts"
  corruption_risk: "5% chance revived player gains curse"
  undead_attraction: "Revival attempts attract undead enemies"
  soul_risk: "Players who die here progress to Soul_Departed faster"

Neutral_Areas: (Most dungeon floors)
  standard_mechanics: "Normal revival rules apply"
  environmental_effects: "Room-specific bonuses or penalties"
  tactical_considerations: "Cover and positioning affect revival safety"
```

---

## Group Coordination Systems

### Revival Coordination Interface
```yaml
Death_Notifications:
  - Clear visual and audio alerts when player goes unconscious
  - Death timer displayed prominently for all party members
  - Revival requirements and success chances shown
  - Multiple revival options displayed with costs and benefits

Priority_Systems:
  - Healers automatically highlighted as primary revivers
  - Backup revivers identified if primary is busy/dead
  - Danger assessment for revival attempts
  - Suggested positioning for safe revival

Communication_Tools:
  - Quick commands for "Need Revival", "Can't Reach", "Cover Me"
  - Automatic callouts when starting revival attempts
  - Timer notifications for critical revival deadlines
  - Status updates for revival progress
```

### Tactical Coordination Bonuses
```yaml
Protective_Formation:
  - Living players adjacent to revival location provide +25% success rate
  - Each protector reduces revival time by 1 tick (minimum 3 ticks)
  - Attackers targeting reviver take automatic attacks of opportunity
  - Coordinated defense grants temporary damage resistance

Team_Revival:
  - Multiple healers can combine efforts for faster revival
  - Primary + Assistant = -50% tick cost, +25% success rate
  - Three+ healers = guaranteed success, minimal time
  - Team revival provides bonus protection against interruption
```

This group permadeath system creates intense tactical cooperation where protecting vulnerable party members becomes crucial, while ensuring that individual deaths don't end the adventure. The revival mechanics add depth and meaningful choices to combat while maintaining the stakes that make victory meaningful.