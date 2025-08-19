# CLIENT REQUIREMENTS QUESTIONNAIRE
## Roguelike Dungeon Crawler - Vercel/Supabase Migration


**Document Version**: 1.0  
**Date**: 2025-08-13  
**Purpose**: Comprehensive requirements gathering from client before project planning begins


---


## INSTRUCTIONS FOR CLIENT


Please answer all applicable questions in detail. Your responses will help the development team make appropriate architecture decisions and ensure the final product meets your expectations.


- **Required Questions**: Marked with [REQUIRED]
- **Optional Questions**: Provide additional clarity but can be deferred
- **Format**: You can answer directly in this document or provide a separate response document
- **Timeline**: Please provide responses before the team begins technical planning


---


## SECTION 1: GAME DESIGN & MECHANICS
*Agent-03 (Frontend Specialist) & Agent-02 (Lead Developer)*


### 1.1 Core Gameplay Loop [REQUIRED]


1. **Turn Timer Preferences**: You've specified configurable turn timers (1min to 1 day).
   - What should be the DEFAULT timer setting for new players? 1 minute for public games, no turn timer for single player.
   - Should different game modes have different timer options (e.g., quick play vs strategic)? Not needed at this time, the game is meant to play like a roguelike.
   - Can players change timer settings mid-game or only at game creation? No
   - Should there be a "no timer" option for purely asynchronous play? Yes, but the party leader or a simple majority can still force progression in case someone leaves.


2. **Combat Mechanics**:
   - What happens when a player's turn timer expires in combat? (Skip turn, auto-defend, AI takes over, other?) AI will take over
   - Should there be a "ready" button to skip remaining timer if all players have acted? Yes
   - How should initiative/turn order be determined? (Speed stat, random, fixed order?)the game has no stats, is skill based. It can be a formula using the relevant skills.
   - Maximum party size for combat encounters? (4 players as mentioned, or flexible?) 4 for now


3. **Death and Revival**:
   - When a character dies in combat, how long can they remain dead before permanent consequences? Down until the end of fight and you can be revived or if the entire party is downed everyone dies.
   - What resources are required for mid-combat resurrection? Abilities and skills
   - Can dead players still communicate with their party? Sure
   - Are there any permanent death scenarios? Whole party wipe.


### 1.2 Dungeon Exploration Mechanics [REQUIRED]


4. **Room Navigation**:
   - How do players vote on which direction to go? (Majority, party leader decides, consensus required?) simple mJority
   - What happens if the party can't agree on a direction within the timer? Random the options that are tied.
   - Can the party split up, or must they stay together? Stay together always.
   - How far ahead can players see in the dungeon map? They can see visible doorways and room silhouettes for the next room over


5. **Encounter Distribution** (You specified 70% combat, 5% traps, 25% other):
   - Should this distribution be strict or have some randomness? Random but more combat heavy
   - Do deeper dungeon levels have different distributions? Unknown yet but they will get more difficult in DC to get past checks and monster strength
   - Are there safe rooms or checkpoints within dungeons? Random encounter with someone who can extract some gear for you for a cost.




6. **Loot Distribution**:
   - How is loot distributed among party members? (Roll system, leader distributes, automatic based on class?) individual loot
   - Can players trade items during dungeon exploration? Not 
   - Is there a shared party inventory separate from individual inventories? No


### 1.3 Character Progression [REQUIRED]


7. **Adaptive Mastery System**:  -I want to rethink the mastery system-
   - How frequently should the system analyze and adapt to playstyle? (You mentioned weekly - is this real-time weeks or in-game time?)
   - Should players be able to see their playstyle analysis and predictions?
   - Can players manually influence or guide their mastery evolution?
   - Are there any masteries that are mutually exclusive?


8. **Level and Experience**:
   - Maximum character level? No character level or experience. You have skills that level up by using them which make you stronger and give you better rolls.
   - How is experience distributed in parties? (Split evenly, based on contribution, based on level difference?) no character experience, you get 1 cp in a skill when you use it whether you succeeed or fail and the amount of xp needed per level will be scaling as well.
   - Are there experience penalties for dying? No
   - Can high-level players boost low-level players? There is no boosting, there is skill successes.


### 1.4 Visual Design Preferences


9. **SNES JRPG Aesthetic**:
   - Any specific SNES games that should serve as visual inspiration? (Final Fantasy VI, Chrono Trigger, Secret of Mana, etc.) not really, just the general aesthetic 
   - Preferred color palette limitations? (16-bit constraints or modern interpretation?) let’s look at modern
   - Should character sprites have multiple poses/animations or remain static? Static, characters don’t move the rooms and encounters load like a background in front of the characters.
   - Preference for UI border/frame design? (Ornate fantasy, minimal, tech-themed?) tv frame with knobs


10. **Asset Priorities**:
    - Which of the 273 game assets are MOST critical for initial release? Use what is usable, replace what isn’t.
    - Are there any assets that need to be replaced or updated? That is up to ui/ux
    - Do you have specific requirements for new assets that might be needed? No, but I want the game to feel like the outer frame of a TV with a game playing inside it. The character sprites in the foreground and the enemies or encounter in the background with room for text boxes to pop up. The background should just be a static image. Under the players is the jrpg style menu with the abilities that can be used which are decided by the levels of your skills 


---


## SECTION 2: MULTIPLAYER & SOCIAL FEATURES
*Agent-05 (QA Engineer) & Agent-09 (API Integration Specialist)*


### 2.1 Party Formation and Management [REQUIRED]


11. **Party Creation**:
    - Can players belong to multiple parties simultaneously? Players can have multiple characters but a character can only be in one party at a time.
    - Are parties persistent or session-based? Parties are created when your joining a dungeon and disbanded when it’s over.
    - Should there be party rankings or leaderboards? No
    - Can parties have custom emblems or identifiers? No


12. **Party Roles and Permissions**:
    - What specific permissions does a party leader have? None.
    - Can leadership be transferred? If so, how? Leader can transfer
    - Should there be roles beyond leader/member (e.g., officer, quartermaster)? Not yet.
    - Can party members be kicked? What happens to their loot/progress? For now no


13. **Communication Features**:
    - Do you want in-game chat? Text only
    - Should there be voice chat integration? No
    - Are there preset communication options for common situations? Yes
    - Should communication be logged for moderation purposes? Yes


### 2.2 Matchmaking and Social Discovery


14. **Finding Parties**:
    - Should there be automatic matchmaking based on level/skill? Yes
    - Can players post "looking for party" requests? Create party, join party, or matchmaking
    - Should there be a guild/clan system above parties? Yes
    - Regional matchmaking or global? Global, asynchronous has low overhead


15. **Friend System**:
    - Should there be a friends list? Yes
    - Can players block/mute other players? Yes
    - Should there be a reputation/karma system? Upvotes and downvotes when completing a dungeon. 


### 2.3 Competitive Features


16. **PvP Elements**: eventually
    - Will there be any player vs player combat?
    - Should there be competitive leaderboards?
    - Any plans for tournaments or seasonal events?
    - Should there be spectator mode for non-participants?


---


## SECTION 3: ECONOMY & MONETIZATION
*Agent-08 (Database Administrator) & Agent-11 (Documentation Lead)*


### 3.1 Game Economy [REQUIRED]


17. **Currency System**:
    - How many types of currency? Gold, premium currency for cosmetics only
    - Can currency be traded between players? No
    - Are there currency caps or storage limits? Yes, whatever makes sense from a data storage standpoint 
    - How is currency earned? Combat, quest, daily rewards 


18. **Item Economy**: no trading
    - Can all items be traded, or are some bound to characters? Bound to character.
    - Should there be an auction house or marketplace? No.
    - Are there item durability and repair costs? No.
    - How should item rarity affect stats and value? It will have an effect on the stats, but not value.


19. **Crafting Economy**:
    - Can crafted items be traded? No
    - Are crafting recipes tradeable/sellable? No.
    - Should master crafters be able to sign their items? No
    - Are there crafting specialization limits per character? No. The idea is that anybody can get math with all stats.


### 3.2 Monetization Model


20. **Business Model**:
    - Free-to-play with microtransactions, one-time purchase, or subscription? Micro transactions for now.
    - What types of items/features would be acceptable for monetization? Cosmetics only.
    - Should there be cosmetic-only purchases or gameplay advantages? Only cosmetics for cosmetics.
    - Any plans for battle passes or seasonal content? Not yet.


21. **Premium Features**:
    - Should there be VIP/Premium account benefits? No.
    - Are there any features that should NEVER be monetized? Nothing that can provide a gameplay advantage.
    - Thoughts on ads (if free-to-play)? Open to on page ads, but not full page ads.


---


## SECTION 4: TECHNICAL PREFERENCES & CONSTRAINTS
*Agent-06 (DevOps Engineer) & Agent-01 (System Architect)*


### 4.1 Performance Requirements [REQUIRED]


22. **Scale Expectations**:
    - Expected number of concurrent players at launch? 1000
    - Target number of concurrent players at peak (6 months)? 100000
    - Expected number of total registered users? 250000
    - Acceptable downtime for maintenance?


23. **Geographic Distribution**: US only to start
    - Primary target regions/countries?
    - Is regional data isolation required for compliance?
    - Different content for different regions?
    - Language localization plans?


24. **Performance Tolerances**:
    - Maximum acceptable latency for turn-based actions?
    - Acceptable page load time for initial game load?
    - How important is offline mode for single-player?


### 4.2 Platform Support [REQUIRED]


25. **Device Support**:
    - Minimum mobile device specifications? The last 3 years of hardware
    - Should it work on tablets differently than phones? No
    - Any plans for desktop app (Electron) vs web-only? Web only
    - Console support in the future? No


26. **Browser Support**:
    - Minimum browser versions to support? Chromium, new versions
    - Is Internet Explorer/Legacy Edge support needed? No
    - Progressive Web App installation priority? Unknown - we should discuss this


### 4.3 Data and Analytics


27. **Analytics Requirements**:
    - What player behaviors are most important to track? Deaths, where and how. As well as progression, dungeons, enemies, fights, damage
    - How long should player data be retained? Discuss this
    - Do you need real-time analytics or daily reports sufficient? Daily reports are fine
    - Any specific KPIs that must be tracked? 


28. **Data Export**:
    - Should players be able to export their game data? No
    - What format for data exports? (JSON, CSV, etc.)
    - Should there be an API for third-party tools? No


---


## SECTION 5: CONTENT & PROGRESSION
*Agent-04 (Backend Engineer) & Agent-10 (Performance Analyst)*


### 5.1 Content Scope [REQUIRED]


29. **Launch Content**:
    - How many character classes at launch? No actual classes, classes are titles you can have for having skills of different types. A white mage might heave healing magic 5 but a paladin might have defenses 5, healing magic 3, and heavy armor 5 - things like that. 
    - Number of dungeons available at launch? 3
    - How many crafting recipes initially? 20
    - Number of unique items/equipment at launch? We need to go over this, but more is better. Dozens of types of items with dozens of items. Weapons->Swords->Short Sword - Bastard Sword || Weapons->Axes->Hatches - Great Axes || etc


30. **Content Updates**:
    - How frequently do you plan to add new content? Very often
    - Will content updates require downtime? I hope not, but if so hopefully short
    - Should old content remain accessible or rotate out? Remain accessible
    - Any seasonal or time-limited content plans? Not yet


31. **Endgame Content**:
    - What should max-level players do? Dungeons scale, players can keep doing them at higher difficulties for better rewards
    - Are there prestige/paragon levels beyond max? There are no levels, there are only skill levels.
    - Raid-style content for large groups? I’m open to it, but I would need to see how it works in a static asynchronous game like this.
    - New Game+ or rebirth mechanics? Maybe an option to retire a character, since you’ll have a roster of characters to choose from.


### 5.2 Difficulty and Balance


32. **Difficulty Settings**:
    - Should there be difficulty modes? If so, what differentiates them? The difficulties should be selected when creating a party for a dungeon. The more difficult the better the rewards
    - Dynamic difficulty adjustment based on party performance? No
    - Are there hardcore/permadeath modes? Yes
    - How should content scale with party size? We need to account for party size to make sure the game is as difficult as it should be.


33. **Balance Philosophy**:
    - Is perfect balance important, or is some asymmetry acceptable? Asymmetry is okay, especially when you get to higher skill levels. We will have time to tune it
    - How quickly should balance patches be deployed? As quickly as possible
    - Should there be public test servers for balance testing? Yes
    - Player feedback integration into balance decisions? We will definitely look at them


---


## SECTION 6: SECURITY & MODERATION
*Agent-07 (Security Specialist)*


### 6.1 Security Requirements [REQUIRED]


34. **Anti-Cheat Priorities**:
    - Most important exploits to prevent? (item duplication, stat manipulation, etc.) It’s all equally as important, cheating kills reputation
    - Tolerance for false positives in cheat detection? Push to manual review right away
    - Should there be permanent bans or temporary suspensions? Both
    - Hardware bans or account-only bans? Account bans


35. **Account Security**:
    - Should 2FA be mandatory or optional? optional
    - Account recovery process preferences? Look at the LOE to add SSO options to save accounts
    - Should there be login notifications?
    - Session timeout requirements? None


### 6.2 Content Moderation


36. **Player-Generated Content**:
    - Will players be able to create custom content? (names, descriptions, etc.) No, the characters are essentially drafted to the players roster and leveled individually.
    - What content should be filtered/moderated? We will need standard content moderation for vulgarity
    - Automated moderation vs manual review? Both
    - Appeals process for moderation actions? Send appeals via email


37. **Community Standards**:
    - What behaviors should result in immediate bans? 
    - Should there be a strike/warning system?
    - How should toxic behavior in parties be handled?
    - Should there be a reporting system?


---


## SECTION 7: LEGAL & COMPLIANCE
*Agent-07 (Security Specialist) & Agent-08 (Database Administrator)*


### 7.1 Regulatory Compliance


38. **Age Requirements**:
    - Minimum age for players? 
    - Should there be parental controls? Yes
    - Different features for different age groups?
    - Age verification requirements?


39. **Regional Compliance**:
    - GDPR compliance level needed? (EU players expected?) 
    - COPPA compliance needed? (Under-13 players in US?)
    - Any specific regional laws to consider?
    - Loot box/gambling law considerations?


40. **Data Privacy**:
    - Can player data be used for marketing? No
    - Third-party analytics tools acceptable? No
    - Data sharing with partners allowed? No
    - Anonymized data usage for research? No


---


## SECTION 8: LAUNCH & POST-LAUNCH
*Agent-02 (Lead Developer) & Agent-11 (Documentation Lead)*


### 8.1 Launch Strategy [REQUIRED]


41. **Launch Phases**:
    - Soft launch in specific regions first?
    - Open beta vs closed beta preferences?
    - Early access for specific user groups?
    - Marketing embargo until specific date?


42. **Success Metrics**:
    - What metrics define a successful launch?
    - Acceptable bug threshold for launch?
    - Required features for MVP vs nice-to-have?
    - When should launch be delayed vs patched post-launch?


### 8.2 Post-Launch Support


43. **Update Cadence**:
    - How often should patches be released?
    - Preferred maintenance windows?
    - How much downtime is acceptable for updates?
    - Should there be a public roadmap?


44. **Community Engagement**:
    - Official forums or third-party platforms (Reddit, Discord)?
    - Developer communication frequency expectations?
    - Community events and engagement plans?
    - Bug bounty program interest?


---


## SECTION 9: SPECIAL FEATURES & INNOVATIONS
*Agent-01 (System Architect) & Agent-03 (Frontend Specialist)*


### 9.1 Unique Selling Points


45. **Differentiators**:
    - What makes this game unique compared to competitors?
    - Which features are absolutely essential to the game's identity?
    - Any innovative features not mentioned in the PRD?
    - Patents or proprietary technology to integrate?


46. **Future Innovations**:
    - Any AI/ML features planned? (procedural content, difficulty adjustment, etc.) Not Yet
    - Blockchain/NFT integration thoughts? No
    - Cross-game compatibility or shared universe plans? None
    - AR/VR considerations for the future? None


---


## SECTION 10: DEVELOPMENT PREFERENCES
*Agent-06 (DevOps Engineer) & Agent-05 (QA Engineer)*


### 10.1 Development Process


47. **Code Quality Standards**:
    - Acceptable technical debt level for launch?
    - Code coverage requirements for testing?
    - Documentation standards for code?
    - Open-source contributions acceptable?


48. **Development Tools**:
    - Any required or forbidden technologies?
    - Preference for specific monitoring tools?
    - Required integrations with existing systems?
    - Custom tooling needs?


### 10.2 Team Collaboration


49. **Communication Preferences**:
    - Preferred communication channels with dev team?
    - Frequency of progress updates?
    - Level of technical detail in updates?
    - Decision escalation process? If there are any questions, create a new Client Requirement Doc and move past it if possible, if not pause development and point men to it.


50. **Change Management**:
    - How should scope changes be handled?
    - Feature freeze timing before launch?
    - Post-launch feature request process?
    - Emergency hotfix approval process?


---


## ADDITIONAL COMMENTS SECTION


Please provide any additional information, requirements, or concerns not covered above:
The idea of the game is to be leveless in the traditional sense. We’ll have as many skills as we can launch with, in different categories. Those will have a max level of 100. Each skill will provide a bonus when it’s being applied based on the total level. Levels in skills will give you access to abilities you can use and titles for classes that provide bonuses. Every skill use raises it’s XP, skills get progressively harder to level the higher the level.

The non-combat encounters should be non-combat events that can use any number of skills to get through them. A collapsed tunnel could use a physical strength skill or some sort of mining skill or thought related skill or mage hand - whatever you have the most points in.


The deeper you go into the dungeon the more difficult it gets to progress but the better the rewards get.  You can either progress or leave after any combat, but leaving will cost you random loot from your inventory.

If you get downed, you can be revived after a fight or by a healing or revive skill but if the whole party dies it’s a wipe and everything is lost.


Players can have up to 5 characters and they can be in different dungeons. 


---


## PRIORITY RANKING


Please rank these aspects from 1-10 (1 being most important):


- [3] Performance and Scalability
- [4] Visual Polish and Aesthetics  
- [1] Multiplayer Features
- [5] Game Balance
- [2] Security and Anti-Cheat
- [8] Mobile Experience
- [6] Content Quantity
- [7] Monetization Systems
- [9] Social Features
- [10] Innovation/Unique Features


---


**End of Questionnaire**


*Please save your responses and provide them to the development team before technical planning begins.*

