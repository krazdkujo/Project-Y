# Abilities Use Cases Documentation

**Status:** REQUIRED - All 135+ abilities need defined use cases  
**Last Updated:** Current Analysis  

## Overview

Every ability in the tactical ASCII roguelike requires a comprehensive use case definition to guide:
- **Player Decision Making:** When and why to slot/use each ability
- **Enemy AI Behavior:** How enemies should prioritize and use abilities  
- **Game Balance:** Ensuring each ability has distinct tactical value
- **9+5 Slotting System:** Strategic choices for limited ability slots

## Use Case Template Structure

Each ability needs the following use case components:

### Required Fields
- **tacticalScenario:** Primary situation when this ability excels
- **combatExample:** Specific battle scenario demonstrating optimal use
- **skillSynergies:** Which skills enhance this ability's effectiveness
- **strategicValue:** Role within the 9+5 slotting limitation system
- **enemyAIConsiderations:** How enemies should prioritize and use this ability

### Optional Fields  
- **counters:** What abilities or tactics counter this
- **combinations:** Synergistic ability combinations
- **timing:** Turn order considerations (early/mid/late combat)

---

## COMBAT ABILITIES (84 total)

### Melee Abilities (12 abilities)

#### ❌ `precise_strike` - NEEDS USE CASE
**Current:** A careful attack aimed at weak points, trading power for accuracy
**Missing:** Tactical scenario, skill synergies, strategic value

#### ❌ `power_strike` - NEEDS USE CASE  
**Current:** A forceful blow that sacrifices accuracy for raw damage
**Missing:** Combat examples, enemy AI considerations

#### ❌ `whirlwind_strike` - NEEDS USE CASE
**Current:** Spin attack hitting all adjacent enemies
**Missing:** Area control scenarios, positioning tactics

#### ❌ `one_handed_mastery` - NEEDS USE CASE
**Current:** Passive mastery with one-handed weapons
**Missing:** When to slot vs other weapon masteries

#### ❌ `heavy_swing` - NEEDS USE CASE
**Current:** A slow but devastating two-handed attack  
**Missing:** Trade-off analysis with speed vs damage

#### ❌ `cleave` - NEEDS USE CASE
**Current:** Hit primary target and adjacent enemies
**Missing:** Positioning requirements, multi-target scenarios

#### ❌ `two_handed_mastery` - NEEDS USE CASE
**Current:** Expertise with large weapons grants damage and improves AP efficiency
**Missing:** Strategic slotting considerations vs other masteries

#### ❌ `dual_strike` - NEEDS USE CASE
**Current:** Attack with both weapons simultaneously
**Missing:** Dual-wield build synergies, skill requirements

#### ❌ `flurry` - NEEDS USE CASE  
**Current:** Multiple rapid strikes with increasing accuracy
**Missing:** Action economy analysis, turn optimization

#### ❌ `punch` - NEEDS USE CASE
**Current:** Basic unarmed attack
**Missing:** Disarmed scenarios, backup options

#### ❌ `grapple` - NEEDS USE CASE
**Current:** Grab and restrain an enemy
**Missing:** Control tactics, positioning advantages

---

### Ranged Abilities (11 abilities)

#### ❌ `aimed_shot` - NEEDS USE CASE
**Current:** Take extra time to line up a precise shot
**Missing:** High-value target prioritization, accuracy vs speed

#### ❌ `rapid_fire` - NEEDS USE CASE
**Current:** Sacrifice accuracy for multiple quick shots  
**Missing:** Suppression tactics, ammo management

#### ❌ `piercing_shot` - NEEDS USE CASE
**Current:** Shot that penetrates through multiple enemies
**Missing:** Formation breaking, line positioning

#### ❌ `archery_mastery` - NEEDS USE CASE
**Current:** Passive expertise with bows
**Missing:** Range advantage scenarios, stealth synergies

#### ❌ `thrown_weapon` - NEEDS USE CASE
**Current:** Hurl a weapon at distant target
**Missing:** Disarming tactics, retrieval considerations

#### ❌ `multi_throw` - NEEDS USE CASE
**Current:** Throw multiple projectiles at once
**Missing:** Area denial, crowd control applications

#### ❌ `precise_shot` - NEEDS USE CASE
**Current:** Extremely accurate shot with high critical chance
**Missing:** Called shot scenarios, weak point targeting

#### ❌ `gunslinger_reload` - NEEDS USE CASE  
**Current:** Quick reload technique for firearms
**Missing:** Action economy optimization, sustained fire

#### ❌ `headshot` - NEEDS USE CASE
**Current:** Aimed shot at the head for massive damage
**Missing:** Execution scenarios, high-risk/reward analysis

#### ❌ `disabling_shot` - NEEDS USE CASE
**Current:** Shot aimed to disable rather than kill
**Missing:** Crowd control applications, non-lethal tactics

#### ❌ `suppressing_fire` - NEEDS USE CASE
**Current:** Area attack that prevents enemy actions
**Missing:** Area control strategy, team coordination

---

### Defensive Abilities (12 abilities)

#### ❌ `shield_bash` - NEEDS USE CASE
**Current:** Strike with your shield to damage and stun the enemy
**Missing:** Interrupt tactics, stunning priority targets

#### ❌ `shield_wall` - NEEDS USE CASE
**Current:** Defensive formation with allies
**Missing:** Chokepoint control, team positioning

#### ❌ `shield_mastery` - NEEDS USE CASE
**Current:** Passive shield expertise with AP efficiency
**Missing:** Tank build optimization, defensive slotting

#### ❌ `parry` - NEEDS USE CASE
**Current:** Deflect an incoming attack
**Missing:** Reactive defense timing, skill-based mitigation

#### ❌ `riposte` - NEEDS USE CASE
**Current:** Counterattack after successful parry
**Missing:** Counter-offensive strategies, timing windows

#### ❌ `perfect_parry` - NEEDS USE CASE
**Current:** Flawless parry that opens enemy to critical hits
**Missing:** Master-level defensive tactics, opening creation

#### ❌ `dodge_roll` - NEEDS USE CASE
**Current:** Evasive movement that avoids attacks
**Missing:** Positioning tactics, mobility vs armor trade-offs

#### ❌ `evasive_maneuvers` - NEEDS USE CASE
**Current:** Continuous defensive movement
**Missing:** Kiting strategies, ranged defense

#### ❌ `uncanny_dodge` - NEEDS USE CASE
**Current:** Passive ability to avoid surprise attacks
**Missing:** Ambush protection, stealth encounter survival

#### ❌ `endure_pain` - NEEDS USE CASE  
**Current:** Push through injuries to keep fighting
**Missing:** Last stand scenarios, pain threshold tactics

#### ❌ `damage_resistance` - NEEDS USE CASE
**Current:** Passive reduction to all damage types
**Missing:** Tanking optimization, damage mitigation strategy

#### ❌ `armor_expertise` - NEEDS USE CASE
**Current:** Enhanced effectiveness with armor
**Missing:** Protection vs mobility analysis

#### ❌ `heavy_armor_mastery` - NEEDS USE CASE
**Current:** Mastery of heavy armor reduces penalties  
**Missing:** Full tank builds, movement penalty mitigation

#### ❌ `last_stand` - NEEDS USE CASE
**Current:** Gain bonuses when near death
**Missing:** Desperate situations, clutch performance scenarios

---

### Physical Damage Abilities (25 abilities)

#### Warrior Abilities (6)
- ❌ `shield_slam` - NEEDS USE CASE
- ❌ `battle_cry` - NEEDS USE CASE  
- ❌ `weapon_throw` - NEEDS USE CASE
- ❌ `berserker_rage` - NEEDS USE CASE
- ❌ `spinning_strike` - NEEDS USE CASE
- ❌ `weapon_master_stance` - NEEDS USE CASE

#### Ranger Abilities (6)
- ❌ `hunters_mark` - NEEDS USE CASE
- ❌ `twin_shot` - NEEDS USE CASE
- ❌ `animal_companion_strike` - NEEDS USE CASE  
- ❌ `volley` - NEEDS USE CASE
- ❌ `nature_step` - NEEDS USE CASE
- ❌ `apex_predator` - NEEDS USE CASE

#### Pirate Abilities (6)
- ❌ `cutlass_slash` - NEEDS USE CASE
- ❌ `dirty_fighting` - NEEDS USE CASE
- ❌ `sea_legs` - NEEDS USE CASE
- ❌ `pistol_shot` - NEEDS USE CASE  
- ❌ `boarding_action` - NEEDS USE CASE
- ❌ `pirate_legend` - NEEDS USE CASE

#### Barbarian Abilities (5)
- ❌ `primal_roar` - NEEDS USE CASE
- ❌ `savage_bite` - NEEDS USE CASE
- ❌ `blood_frenzy` - NEEDS USE CASE
- ❌ `tribal_tattoos` - NEEDS USE CASE
- ❌ `unstoppable_fury` - NEEDS USE CASE

#### Centurion Abilities (5)  
- ❌ `formation_fighting` - NEEDS USE CASE
- ❌ `gladius_thrust` - NEEDS USE CASE
- ❌ `phalanx_formation` - NEEDS USE CASE
- ❌ `tactical_command` - NEEDS USE CASE
- ❌ `legion_commander` - NEEDS USE CASE

---

## MAGIC ABILITIES (49 total)

### Elemental Magic (16 abilities)

#### Fire Magic (4)
- ❌ `flame_bolt` - NEEDS USE CASE
- ❌ `fireball` - NEEDS USE CASE  
- ❌ `wall_of_flame` - NEEDS USE CASE
- ❌ `fire_mastery` - NEEDS USE CASE

#### Ice Magic (3)
- ❌ `frost_shard` - NEEDS USE CASE
- ❌ `ice_armor` - NEEDS USE CASE
- ❌ `blizzard` - NEEDS USE CASE

#### Lightning Magic (3)
- ❌ `lightning_bolt` - NEEDS USE CASE
- ❌ `chain_lightning` - NEEDS USE CASE  
- ❌ `lightning_reflexes` - NEEDS USE CASE

#### Earth Magic (4)
- ❌ `stone_throw` - NEEDS USE CASE
- ❌ `stone_skin` - NEEDS USE CASE
- ❌ `earthquake` - NEEDS USE CASE
- ❌ `earth_mastery` - NEEDS USE CASE

### Class Magic (33 abilities)

#### White Mage Abilities (6)
- ❌ `lesser_heal` - NEEDS USE CASE
- ❌ `bless` - NEEDS USE CASE
- ❌ `turn_undead` - NEEDS USE CASE  
- ❌ `greater_heal` - NEEDS USE CASE
- ❌ `sanctuary` - NEEDS USE CASE
- ❌ `divine_intervention` - NEEDS USE CASE

#### Sorcerer Abilities (6)
- ❌ `magic_missile` - NEEDS USE CASE
- ❌ `mage_armor` - NEEDS USE CASE
- ❌ `dispel_magic` - NEEDS USE CASE
- ❌ `metamagic_enhance` - NEEDS USE CASE  
- ❌ `arcane_explosion` - NEEDS USE CASE
- ❌ `arcane_mastery` - NEEDS USE CASE

#### Necromancer Abilities (6)
- ❌ `drain_life` - NEEDS USE CASE
- ❌ `bone_armor` - NEEDS USE CASE
- ❌ `animate_skeleton` - NEEDS USE CASE
- ❌ `corpse_explosion` - NEEDS USE CASE
- ❌ `death_aura` - NEEDS USE CASE  
- ❌ `undead_mastery` - NEEDS USE CASE

#### Druid Abilities (5)
- ❌ `natures_touch` - NEEDS USE CASE
- ❌ `animal_speech` - NEEDS USE CASE
- ❌ `wild_shape` - NEEDS USE CASE
- ❌ `call_lightning` - NEEDS USE CASE
- ❌ `force_of_nature` - NEEDS USE CASE

#### Warlock Abilities (4)
- ❌ `eldritch_blast` - NEEDS USE CASE  
- ❌ `dark_pact` - NEEDS USE CASE
- ❌ `summon_demon` - NEEDS USE CASE
- ❌ `curse` - NEEDS USE CASE

---

## EXPLORATION ABILITIES (30 total)

### Survival Abilities (7)
- ❌ `track_creature` - NEEDS USE CASE
- ❌ `find_water` - NEEDS USE CASE
- ❌ `forage_food` - NEEDS USE CASE  
- ❌ `weather_prediction` - NEEDS USE CASE
- ❌ `build_shelter` - NEEDS USE CASE
- ❌ `master_tracker` - NEEDS USE CASE
- ❌ `wilderness_mastery` - NEEDS USE CASE

### Crafting Abilities (4)
- ❌ `basic_smithing` - NEEDS USE CASE
- ❌ `brew_potion` - NEEDS USE CASE
- ❌ `enchant_item` - NEEDS USE CASE  
- ❌ `masterwork_creation` - NEEDS USE CASE

### Social Abilities (6)
- ❌ `fast_talk` - NEEDS USE CASE
- ❌ `gather_information` - NEEDS USE CASE
- ❌ `negotiate_price` - NEEDS USE CASE
- ❌ `diplomatic_immunity` - NEEDS USE CASE
- ❌ `master_performer` - NEEDS USE CASE
- ❌ `legendary_presence` - NEEDS USE CASE

### Investigation Abilities (6)
- ❌ `examine_closely` - NEEDS USE CASE  
- ❌ `research_topic` - NEEDS USE CASE
- ❌ `identify_magic` - NEEDS USE CASE
- ❌ `forensic_analysis` - NEEDS USE CASE
- ❌ `ancient_knowledge` - NEEDS USE CASE
- ❌ `omniscient_scholar` - NEEDS USE CASE

### Thievery Abilities (5)
- ❌ `pick_lock` - NEEDS USE CASE
- ❌ `pickpocket` - NEEDS USE CASE  
- ❌ `disable_trap` - NEEDS USE CASE
- ❌ `master_lockpick` - NEEDS USE CASE
- ❌ `grand_heist` - NEEDS USE CASE

---

## PASSIVE ABILITIES (25 total)

### Tank Passives (5)
- ❌ `stalwart_defender` - NEEDS USE CASE
- ❌ `fortress_stance` - NEEDS USE CASE
- ❌ `guardian_instinct` - NEEDS USE CASE
- ❌ `armor_expertise` - NEEDS USE CASE  
- ❌ `immovable_object` - NEEDS USE CASE

### Damage Passives (5)
- ❌ `weapon_focus` - NEEDS USE CASE
- ❌ `berserker_resilience` - NEEDS USE CASE
- ❌ `deadly_precision` - NEEDS USE CASE
- ❌ `dual_wield_mastery` - NEEDS USE CASE
- ❌ `legendary_warrior` - NEEDS USE CASE

### Utility Passives (5)
- ❌ `keen_senses` - NEEDS USE CASE  
- ❌ `silver_tongue` - NEEDS USE CASE
- ❌ `nimble_fingers` - NEEDS USE CASE
- ❌ `wilderness_survivor` - NEEDS USE CASE
- ❌ `master_craftsman` - NEEDS USE CASE

### Magical Passives (5)
- ❌ `arcane_efficiency` - NEEDS USE CASE
- ❌ `spell_penetration` - NEEDS USE CASE
- ❌ `elemental_affinity` - NEEDS USE CASE  
- ❌ `arcane_sight` - NEEDS USE CASE
- ❌ `metamagic_mastery` - NEEDS USE CASE

### Leadership Passives (14) 
- ❌ `inspiring_presence` - NEEDS USE CASE
- ❌ `tactical_mind` - NEEDS USE CASE
- ❌ `field_medic` - NEEDS USE CASE
- ❌ `battle_commander` - NEEDS USE CASE
- ❌ `shadow_walker` - NEEDS USE CASE  
- ❌ `fleet_footed` - NEEDS USE CASE
- ❌ `acrobatic_fighter` - NEEDS USE CASE
- ❌ `master_thief` - NEEDS USE CASE
- ❌ `iron_mind` - NEEDS USE CASE
- ❌ `quick_learner` - NEEDS USE CASE
- ❌ `scholars_insight` - NEEDS USE CASE
- ❌ `zen_master` - NEEDS USE CASE  
- ❌ `lucky_break` - NEEDS USE CASE
- ❌ `uncanny_luck` - NEEDS USE CASE

---

## HYBRID ABILITIES (11 total)

- ❌ `divine_smite` - NEEDS USE CASE (Maces 10 + Healing 15 + Religion 5)  
- ❌ `shadow_strike` - NEEDS USE CASE
- ❌ `elemental_weapon` - NEEDS USE CASE
- ❌ `mounted_charge` - NEEDS USE CASE
- ❌ `bardic_inspiration` - NEEDS USE CASE
- ❌ `nature_bond` - NEEDS USE CASE
- ❌ `tactical_strike` - NEEDS USE CASE
- ❌ `battle_meditation` - NEEDS USE CASE  
- ❌ `assassinate` - NEEDS USE CASE
- ❌ `weapon_master` - NEEDS USE CASE
- ❌ `elemental_attunement` - NEEDS USE CASE

---

## SUMMARY

**Total Abilities Needing Use Cases: 135+**

- ❌ Combat Abilities: 84
- ❌ Magic Abilities: 49  
- ❌ Exploration Abilities: 30
- ❌ Passive Abilities: 25
- ❌ Hybrid Abilities: 11

**Next Steps:**
1. Define use case template structure for each ability type
2. Create tactical scenarios for combat situational awareness
3. Establish skill synergy documentation for build optimization  
4. Define enemy AI decision trees based on use cases
5. Implement use cases into ability definitions for runtime access

**Priority Order:**
1. **Combat Abilities** - Core gameplay mechanics
2. **Hybrid Abilities** - Complex multi-skill interactions  
3. **Magic Abilities** - Varied tactical applications
4. **Passive Abilities** - Build optimization guidance
5. **Exploration Abilities** - Non-combat utility scenarios