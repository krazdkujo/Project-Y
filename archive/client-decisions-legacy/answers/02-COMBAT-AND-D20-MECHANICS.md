# Combat and D20 Mechanics - RECOMMENDED ANSWERS

**Category**: Core Gameplay Systems  
**Priority**: HIGH - Required for MVP combat engine  
**Decision Date**: 2025-08-19  
**Recommended By**: Story-Writer/DM (Game Balance Specialist)

---

## ⚔️ D20 Combat Resolution

### Question 1.1: Attack Resolution System

**RECOMMENDED ANSWERS:**

1. **Attack Formula Approval**: YES - The d20 + floor(Combat_Skill / 4) formula is excellent for skill-based progression without levels.
   
2. **Weapon Type Skills**: YES - Use separate skills:
   - **Melee Combat** (swords, axes, maces, polearms)
   - **Ranged Combat** (bows, crossbows, throwing weapons)
   - **Magic Combat** (spells, wands, staves)
   
3. **Critical Hits**: YES - Natural 20s deal double damage and always hit regardless of AC.

4. **Critical Failures**: YES - Natural 1s always miss and trigger minor complications:
   - Melee: Weapon gets stuck, lose next attack
   - Ranged: Drop/break ammunition  
   - Magic: Spell backfire, lose mana

5. **Advantage/Disadvantage**: Roll twice, take higher/lower. Triggered by:
   - Advantage: Flanking, surprise, beneficial positioning
   - Disadvantage: Prone, blinded, disadvantageous positioning

**BALANCE RATIONALE**: This system rewards skill investment while maintaining D20 excitement and tactical positioning.

---

### Question 1.2: Damage and Health System

**RECOMMENDED ANSWERS:**

1. **Damage Calculation**: **Option D - Hybrid**
   ```
   Damage = Base Weapon Damage + floor(Combat_Skill / 10)
   ```
   - Short Sword: 4 + skill modifier
   - Battleaxe: 8 + skill modifier  
   - Longbow: 6 + skill modifier

2. **Weapon Damage Ranges**: YES - Different weapons have different base damage:
   - Light weapons (4-6): Fast, skill-dependent
   - Medium weapons (6-8): Balanced damage/speed
   - Heavy weapons (8-12): High damage, slower

3. **Character Health**: Skill-based scaling:
   ```
   Health = 30 + (Defense_Skill × 2) + (Constitution_Skill × 1)
   Range: 30 (new character) to 530 (maxed skills)
   ```

4. **Temporary Hit Points**: NO - Keep system simple with just permanent health and healing.

5. **Death at 0 HP**: **Unconscious system** - Characters fall unconscious at 0 HP, die at negative Constitution skill value. Allows revival during combat.

**BALANCE RATIONALE**: Provides clear power progression while keeping new players viable in 8-player groups.

---

## 🎯 Initiative and Action Timing

### Question 2.1: Initiative System [MODIFIED FOR REAL-TIME]

**RECOMMENDED ANSWERS:**

Since this is REAL-TIME with environmental ticks, traditional initiative doesn't apply. Instead:

1. **Action Speed System**: 
   ```
   Action Speed = Base Speed + floor(Tactics_Skill / 5)
   - Fast actions: 1 tick
   - Normal actions: 2 ticks  
   - Slow actions: 3+ ticks
   ```

2. **Environmental Tick Frequency**: Every 30 seconds (configurable), monsters act and environmental effects trigger.

3. **Player Action Priority**: Players can act any time between ticks, actions resolve in order submitted.

4. **Tied Actions**: Resolved by Tactics skill, then random.

5. **Action Types**:
   - **Fast**: Simple attacks, movement, item use (1 tick)
   - **Normal**: Complex attacks, short spells (2 ticks)
   - **Slow**: Powerful spells, special abilities (3+ ticks)

**BALANCE RATIONALE**: Rewards tactical skill investment while maintaining real-time flow with meaningful environmental pacing.

---

### Question 2.2: Action Economy

**RECOMMENDED ANSWERS:**

1. **Action System**: **Option A - Simple** with enhancements:
   - One primary action per turn
   - Free movement (up to speed limit)
   - Unlimited communication/chat

2. **Movement Integration**: Movement is separate and free within speed limits.

3. **Free Actions**: YES - Communication, looking around, basic item interactions.

4. **Ready Actions**: YES - Players can set conditional triggers: "Attack the first enemy that enters range."

5. **Spell Casting Time**: Varies by spell power:
   - Cantrips: Instant (resolve immediately)
   - Level 1-3 spells: 1 tick delay
   - Level 4-6 spells: 2 tick delay
   - Level 7+ spells: 3+ tick delay

**BALANCE RATIONALE**: Keeps gameplay flowing while allowing tactical depth and coordination.

---

## 🛡️ Defense and Armor Class

### Question 3.1: Armor Class Calculation

**RECOMMENDED ANSWERS:**

1. **AC Formula**: **Option C - Hybrid**
   ```
   AC = 10 + Armor Bonus + floor(Defense_Skill / 5)
   ```

2. **Armor Types**: YES - Different armor provides different base AC:
   - No Armor: +0 AC
   - Light Armor: +2 AC  
   - Medium Armor: +4 AC
   - Heavy Armor: +6 AC

3. **AC Improvement**: Both equipment AND skills improve AC.

4. **AC Types**: NO - Single AC value to keep system streamlined.

5. **Damage Reduction**: NO - AC represents complete defense, no separate DR system.

**BALANCE RATIONALE**: Rewards both equipment acquisition and skill development, scales well from 0-100 skills.

---

## ✨ Magic and Special Abilities

### Question 4.1: Magic System Integration

**RECOMMENDED ANSWERS:**

1. **Magic Attack Rolls**: YES - Magic uses d20 + Magic_Combat_Skill vs target AC for attack spells.

2. **Spell Hit Rules**: 
   - Attack spells: Require attack roll
   - Utility spells: Automatic success
   - Area spells: Hit automatically, targets make saving throws

3. **Saving Throws**: YES - Targets roll d20 + relevant skill vs Spell DC
   ```
   Spell DC = 10 + floor(Magic_Skill / 4) + Spell Level
   ```

4. **Spell Power Scaling**: Damage/effects scale with Magic skill:
   ```
   Spell Damage = Base Damage + floor(Magic_Skill / 8)
   ```

5. **Spell Components**: NO - Skills only, no component management for streamlined play.

6. **Spell Slots**: NO - Mana point system:
   ```
   Mana = Magic_Skill × 2 (0-200 range)
   Spells cost mana based on power level
   ```

**BALANCE RATIONALE**: Integrates seamlessly with D20 system while scaling with skill investment.

---

### Question 4.2: Skill-Based Abilities

**RECOMMENDED ANSWERS:**

1. **Ability Unlock Levels**: Every 20 skill levels (20, 40, 60, 80, 100).

2. **Ability Types**: Mix of passive bonuses and active powers:
   - **Passive**: Always active improvements
   - **Active**: Triggered abilities with cooldowns

3. **Abilities Per Skill**: 5 abilities per skill tree (one every 20 levels).

4. **Combo Abilities**: YES - At level 80+, some abilities require multiple skills:
   ```
   Example: "Spell Sword" requires Magic 80 + Melee 80
   Effect: Weapon attacks deal bonus magical damage
   ```

5. **Ultimate Abilities**: YES - Level 100 abilities are significantly powerful:
   ```
   Combat 100: "Weapon Master" - Critical hits on 18-20
   Magic 100: "Archmage" - Cast two spells per action
   Stealth 100: "Shadow Step" - Teleport + massive sneak attack
   ```

**Example Progression (Combat Skill)**:
- Combat 20: Power Strike (+3 damage, costs stamina)
- Combat 40: Cleave (hit multiple adjacent enemies)
- Combat 60: Parry Master (counterattack when missed)
- Combat 80: Combat Reflexes (extra attack per turn)
- Combat 100: Weapon Master (critical hits on 18-20)

**BALANCE RATIONALE**: Provides clear progression goals and meaningful choices at each milestone.

---

## 🏹 Ranged Combat and Positioning

### Question 5.1: Range and Positioning

**RECOMMENDED ANSWERS:**

1. **Range Penalties**: YES - Long range attacks have -2 penalty to hit beyond optimal range.

2. **Cover Mechanics**: YES - Basic cover system:
   - **Partial Cover**: +2 AC when behind allies/objects
   - **Full Cover**: Cannot be targeted directly

3. **Melee Positioning**: YES - Basic flanking:
   - **Flanking**: +2 attack bonus when attacking from opposite sides
   - **Surrounded**: +1 attack bonus per extra attacker (max +3)

4. **AoE with 8 Players**: Careful targeting required:
   - **Precise AoE**: Can exclude specific squares
   - **Indiscriminate AoE**: Hits everything in area
   - **Friendly Fire Warning**: System warns before friendly fire

5. **Accidental Friendly Fire**: YES - Adds tactical depth:
   - Natural 1 on ranged attacks may hit allies in line of fire
   - AoE spells can hit allies if they're in the area

**BALANCE RATIONALE**: Encourages tactical positioning and careful coordination among 8 players.

---

## 🎲 Skill Checks and Non-Combat

### Question 6.1: Skill Check Difficulty

**RECOMMENDED ANSWERS:**

1. **Difficulty Classes**: APPROVED - The proposed DCs are well-balanced:
   ```
   Easy: DC 10-12
   Medium: DC 13-15  
   Hard: DC 16-18
   Very Hard: DC 19-21
   Nearly Impossible: DC 22+
   ```

2. **DC Scaling**: YES - DCs increase with dungeon depth:
   ```
   Floor 1-5: Base DCs
   Floor 6-10: +2 to all DCs
   Floor 11-15: +4 to all DCs
   Floor 16+: +6 to all DCs
   ```

3. **Multiple Attempts**: Group decides - Some checks allow retries, others don't.

4. **Aid System**: YES - Helpers provide +2 bonus (max one helper per check).

5. **Group Checks**: YES - For certain situations, majority must succeed:
   - Stealth checks (entire group)
   - Knowledge checks (someone must know)
   - Social encounters (group impression)

**BALANCE RATIONALE**: Scales with character growth while maintaining challenge at all levels.

---

### Question 6.2: Skill Check Consequences

**RECOMMENDED ANSWERS:**

1. **Failure Consequences**:
   - **Simple Checks**: Retry allowed with +1 DC
   - **Complex Checks**: Partial success or complications
   - **Dangerous Checks**: Consequences regardless of retry
   - **Time-Sensitive**: No retry opportunity

2. **Critical Successes (Natural 20)**: YES - Provide bonus effects:
   - Extra information discovered
   - Reduced time/resource costs
   - Unexpected positive consequences

3. **Critical Failures (Natural 1)**: YES - Always cause minor complications:
   - Not catastrophic failures
   - Add interesting twists to story
   - Create problem-solving opportunities

4. **Degrees of Success**: YES - Beat DC by 5+ for enhanced results:
   - DC +5: Superior success with bonus benefits
   - DC +10: Exceptional success with major benefits

**BALANCE RATIONALE**: Creates engaging risk/reward decisions and narrative opportunities.

---

## ⚡ Combat Pacing and Timers

### Question 7.1: Turn Timer Integration

**RECOMMENDED ANSWERS:**

1. **Combat vs Exploration Timers**: YES - Different timer types:
   - **Combat**: 2-5 minutes for tactical decisions
   - **Exploration**: 5-30 minutes for movement/interaction
   - **Critical Decisions**: Up to 1 hour for major choices

2. **Timer Expiration Action**: **AI takes optimal action**:
   - AI analyzes situation and takes best available action
   - Follows established player patterns when possible
   - Prioritizes survival and team coordination

3. **Timer Adjustments**: YES - Shorter during active combat:
   - **Active Combat**: 2 minutes
   - **Exploration**: 15 minutes  
   - **Safe Areas**: 30+ minutes

4. **Timer Extensions**: YES - Once per session, group can vote to extend timer by 50% for complex decisions.

**BALANCE RATIONALE**: Maintains game flow while allowing tactical depth when needed.

---

### Question 7.2: AI Substitution Quality

**RECOMMENDED ANSWERS:**

1. **AI Intelligence Level**: **Moderate** - AI should:
   - Use abilities appropriately for situation
   - Follow basic tactical principles
   - Coordinate with team strategy when obvious
   - NOT play optimally (that would be unfair to human players)

2. **AI Learning**: NO - Too complex for MVP, use rule-based decision making.

3. **AI Play Style**: Match player's established patterns:
   - Track player's recent action choices
   - Prefer conservative vs aggressive approaches
   - Use same abilities/spells player typically uses

4. **Player Suggestions**: YES - Party members can suggest actions via chat, AI considers suggestions.

5. **AI Control Limits**: NO limits - AI can act for disconnected players indefinitely.

**BALANCE RATIONALE**: Provides helpful substitution without replacing human decision-making quality.

---

## 🛠️ Equipment and Weapons

### Question 8.1: Weapon Categories

**RECOMMENDED ANSWERS:**

1. **Weapon Skills**: Three main categories:
   - **Melee Combat**: All close weapons (swords, axes, maces, polearms)
   - **Ranged Combat**: All projectile weapons (bows, crossbows, thrown)
   - **Magic Combat**: All magical implements (wands, staves, orbs)

2. **Weapon-Specific Abilities**: YES - Weapon types unlock abilities:
   - **Swords**: Precise Strike (extra accuracy)
   - **Axes**: Cleaving (hit multiple enemies)
   - **Maces**: Armor Breaker (ignore some AC)
   - **Polearms**: Reach attacks
   - **Bows**: Called shots (target specific areas)

3. **Tactical Significance**: YES - Weapon choice affects available strategies and party composition.

**BALANCE RATIONALE**: Provides weapon variety without excessive skill splitting.

---

### Question 8.2: Equipment Scaling

**RECOMMENDED ANSWERS:**

1. **Equipment Scaling**: NO - Equipment stats are fixed, skills provide the scaling.

2. **Magic Weapons**: YES - Special properties beyond damage:
   - **Enchanted**: +1 to +3 attack/damage bonuses
   - **Special Properties**: Fire damage, armor piercing, etc.
   - **Legendary**: Unique abilities and significant bonuses

3. **Equipment Modification**: YES - Crafting system allows:
   - Basic repairs and maintenance
   - Minor enchantments and improvements
   - Combining materials for better gear

4. **Equipment Rarity**: 
   - **Common**: Basic stats
   - **Uncommon**: +10% better stats
   - **Rare**: +25% better stats + minor property
   - **Epic**: +50% better stats + major property
   - **Legendary**: +100% better stats + unique abilities

5. **High-Skill Equipment Requirements**: NO - Any character can use any equipment, but skills determine effectiveness.

**BALANCE RATIONALE**: Equipment provides progression while skills remain the primary power source.

---

## 🏆 Victory and Defeat Conditions

### Question 9.1: Character Death

**RECOMMENDED ANSWERS:**

1. **Downed Communication**: YES - Unconscious players can still communicate via party chat.

2. **Revival Requirements**: **Healing skill check**:
   ```
   DC = 15 + (rounds unconscious)
   Successful Healing skill check revives to 1 HP
   Magical healing automatically revives
   ```

3. **Revival Time Limits**: YES - Characters die permanently after (Constitution Skill ÷ 10) rounds unconscious.

4. **Revival Penalties**: YES - Minor penalties:
   - Revived characters have -2 to all rolls for 10 minutes
   - Cannot be revived again until full rest

5. **Permadeath Modes**: NO - Not for MVP, keep resurrection system for all players.

**BALANCE RATIONALE**: Allows tactical revival decisions without excessive death penalties.

---

### Question 9.2: Combat Resolution

**RECOMMENDED ANSWERS:**

1. **Combat End Conditions**:
   - **All enemies defeated**
   - **Enemies flee when reduced to 25% of original numbers**
   - **Players can retreat** (group decision)
   - **Surrender/negotiation** possible with intelligent enemies

2. **Reward Timing**: After combat ends for safety and discussion.

3. **Morale System**: YES - Enemies flee when:
   - Reduced to 25% numbers
   - Leader defeated
   - Surprise tactics cause fear

4. **Non-Lethal Combat**: YES - Players can choose to subdue rather than kill for interrogation or moral choices.

**BALANCE RATIONALE**: Provides tactical options and story opportunities beyond simple combat.

---

## 📊 Balance and Scaling

### Question 10.1: Power Scaling

**RECOMMENDED ANSWERS:**

1. **Power Scaling**: **Linear with plateau**:
   ```
   Skill Levels 0-60: Linear progression (major gains)
   Skill Levels 60-80: Slower progression (moderate gains)  
   Skill Levels 80-100: Plateau (minor gains, major abilities)
   ```

2. **8-Player Scaling**: YES - Encounters scale for group size:
   - More enemies rather than stronger enemies
   - Complex tactical challenges
   - Multi-stage encounters requiring coordination

3. **Solo vs Group Power**: Solo players should be viable for appropriate content:
   - Solo areas with different challenges
   - Group areas require cooperation
   - Skill-based solutions for smaller groups

4. **Content Scaling**: **Level-appropriate with challenge options**:
   - Dungeon floors scale with party average skills
   - Optional hard mode areas for experienced groups
   - Multiple solution paths for different group compositions

**BALANCE RATIONALE**: Maintains long-term engagement while accommodating different play styles.

---

## 📋 Implementation Priority

**RECOMMENDED PRIORITY ORDER (1 = most critical):**

1. **Basic d20 attack resolution** - Core system foundation
2. **Damage and health calculations** - Character survivability  
3. **Action economy (what players can do per turn)** - Real-time system flow
4. **Skill-based abilities/powers** - Character progression rewards
5. **Equipment and weapon mechanics** - Tactical variety
6. **Magic system integration** - Major character archetype
7. **Death and revival system** - Stakes and consequences
8. **Action timing system (replaces initiative)** - Real-time coordination
9. **AI substitution for disconnected players** - 8-player reliability

**RATIONALE**: Focus on core mechanics first, then build complexity for multiplayer coordination.

---

## 🎯 IMPLEMENTATION NOTES

**Key Design Principles Applied:**
- Real-time gameplay with meaningful environmental ticks
- Skill-based progression without artificial level caps
- 8-player coordination emphasis over individual optimization
- Balanced complexity - deep enough for strategy, simple enough for flow
- Clear risk/reward decisions at all levels

**Technical Requirements:**
- Tick-based timing system for environmental actions
- Real-time action queue with skill-based speed modifiers
- AI decision tree for player substitution
- Scalable encounter generation for 8-player groups

**Balance Testing Priorities:**
- Solo player viability vs 8-player group balance
- Skill progression curve validation (0-100 meaningful throughout)
- Equipment power level vs skill contribution ratio
- Environmental tick frequency for optimal pacing

---

**COMPLETED BY**: Story-Writer/DM  
**STATUS**: Ready for Client Review and Development Implementation