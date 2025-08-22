# Supabase Integration Guide for Tactical ASCII Roguelike

## Overview

This guide provides complete instructions for integrating the Supabase database framework with your existing tactical ASCII roguelike codebase. The database supports 34+ skills, 180+ items, 175+ abilities, and 8-player real-time sessions.

## Prerequisites

- Supabase account and project
- Node.js 18+ with npm/yarn
- Existing game codebase in TypeScript
- Basic understanding of PostgreSQL and real-time subscriptions

## 1. Supabase Project Setup

### Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create new project
2. Note your project URL and anon key
3. Save database password securely

### Environment Configuration

Create or update `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

## 2. Database Schema Deployment

### Apply Migrations

Run the SQL files in order through Supabase Dashboard > SQL Editor:

1. `migrations/001_core_schema.sql` - Core tables and relationships
2. `migrations/002_triggers_functions.sql` - Business logic and automation
3. `policies/001_rls_policies.sql` - Row Level Security policies
4. `real-time/realtime_config.sql` - Real-time subscriptions setup
5. `indexes/performance_indexes.sql` - Performance optimization indexes
6. `seed-data/001_skills_data.sql` - Game content data

### Verify Schema

Run this query to confirm all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'player_accounts', 'game_sessions', 'session_participants',
    'characters', 'skills', 'character_skills', 'item_templates',
    'character_inventory', 'abilities', 'character_abilities',
    'guilds', 'guild_members', 'guild_storage'
);
```

## 3. Client Library Installation

### Install Dependencies

```bash
npm install @supabase/supabase-js
# For TypeScript support
npm install -D @types/node
```

### Create Supabase Client

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// For server-side operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

## 4. Type Definitions

### Generate TypeScript Types

Run in your project root:

```bash
npx supabase gen types typescript --project-id your-project-id > src/types/database.types.ts
```

### Core Game Types

Create `src/types/game.types.ts`:

```typescript
import { Database } from './database.types'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Core game entities
export type PlayerAccount = Tables<'player_accounts'>
export type GameSession = Tables<'game_sessions'>
export type Character = Tables<'characters'>
export type Skill = Tables<'skills'>
export type CharacterSkill = Tables<'character_skills'>
export type ItemTemplate = Tables<'item_templates'>
export type CharacterInventory = Tables<'character_inventory'>
export type Ability = Tables<'abilities'>
export type CharacterAbility = Tables<'character_abilities'>
export type Guild = Tables<'guilds'>

// Extended types for UI
export interface CharacterWithSkills extends Character {
  character_skills: CharacterSkill[]
  character_inventory: CharacterInventory[]
  character_abilities: CharacterAbility[]
}

export interface GameSessionWithParticipants extends GameSession {
  session_participants: {
    id: string
    player_id: string
    character_id: string
    turn_order: number
    player_status: string
    characters: Character
    player_accounts: PlayerAccount
  }[]
}

// Real-time event types
export interface GameStateUpdate {
  event_type: string
  operation: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  session_id?: string
  guild_id?: string
  player_id?: string
  old_record?: any
  new_record?: any
  changed_fields?: Record<string, any>
  timestamp: number
}
```

## 5. Core Integration Services

### Database Service

Create `src/services/database.service.ts`:

```typescript
import { supabase, supabaseAdmin } from '../lib/supabase'
import type { CharacterWithSkills, GameSessionWithParticipants } from '../types/game.types'

export class DatabaseService {
  // Character management
  static async getCharacterWithSkills(characterId: string): Promise<CharacterWithSkills | null> {
    const { data, error } = await supabase
      .from('characters')
      .select(`
        *,
        character_skills!inner(
          *,
          skills(*)
        ),
        character_inventory!inner(
          *,
          item_templates(*)
        ),
        character_abilities!inner(
          *,
          abilities(*)
        )
      `)
      .eq('id', characterId)
      .single()

    if (error) throw error
    return data
  }

  // Session management
  static async getActiveSession(sessionId: string): Promise<GameSessionWithParticipants | null> {
    const { data, error } = await supabase
      .from('game_sessions')
      .select(`
        *,
        session_participants!inner(
          *,
          characters(*),
          player_accounts(username, display_name)
        )
      `)
      .eq('id', sessionId)
      .eq('session_participants.is_active', true)
      .single()

    if (error) throw error
    return data
  }

  // Skill progression
  static async awardSkillExperience(
    characterId: string, 
    skillName: string, 
    experienceAmount: number
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc('award_skill_experience', {
      character_id: characterId,
      skill_name: skillName,
      experience_amount: experienceAmount
    })

    if (error) throw error
    return data
  }

  // Equipment management
  static async equipItem(characterId: string, inventoryItemId: string, slot: string) {
    const { error } = await supabase
      .from('character_inventory')
      .update({ 
        is_equipped: true, 
        equipment_slot: slot 
      })
      .eq('id', inventoryItemId)
      .eq('character_id', characterId)

    if (error) throw error
  }

  // Guild operations
  static async getGuildData(guildId: string) {
    return await supabase.rpc('get_guild_realtime_data', { guild_id: guildId })
  }
}
```

### Real-time Service

Create `src/services/realtime.service.ts`:

```typescript
import { supabase } from '../lib/supabase'
import type { GameStateUpdate } from '../types/game.types'

export class RealtimeService {
  private static channels = new Map<string, any>()

  // Subscribe to session updates
  static subscribeToSession(
    sessionId: string,
    onUpdate: (update: GameStateUpdate) => void
  ) {
    const channelName = `game_session:${sessionId}`
    
    if (this.channels.has(channelName)) {
      this.channels.get(channelName).unsubscribe()
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'characters'
      }, (payload) => {
        onUpdate({
          event_type: 'character_update',
          operation: payload.eventType,
          table: 'characters',
          session_id: sessionId,
          old_record: payload.old,
          new_record: payload.new,
          timestamp: Date.now()
        })
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'session_participants',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        onUpdate({
          event_type: 'participant_update',
          operation: payload.eventType,
          table: 'session_participants',
          session_id: sessionId,
          old_record: payload.old,
          new_record: payload.new,
          timestamp: Date.now()
        })
      })
      .on('broadcast', {
        event: 'turn_start'
      }, (payload) => {
        onUpdate({
          event_type: 'turn_start',
          operation: 'INSERT',
          table: 'game_events',
          session_id: sessionId,
          new_record: payload,
          timestamp: Date.now()
        })
      })
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  // Broadcast game events
  static async broadcastTurnStart(sessionId: string, playerId: string, turnData: any) {
    const channel = this.channels.get(`game_session:${sessionId}`)
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'turn_start',
        payload: {
          player_id: playerId,
          turn_data: turnData,
          timestamp: Date.now()
        }
      })
    }
  }

  // Unsubscribe from session
  static unsubscribeFromSession(sessionId: string) {
    const channelName = `game_session:${sessionId}`
    const channel = this.channels.get(channelName)
    if (channel) {
      channel.unsubscribe()
      this.channels.delete(channelName)
    }
  }

  // Clean up all subscriptions
  static cleanup() {
    this.channels.forEach(channel => channel.unsubscribe())
    this.channels.clear()
  }
}
```

## 6. Authentication Integration

### Auth Service

Create `src/services/auth.service.ts`:

```typescript
import { supabase } from '../lib/supabase'

export class AuthService {
  // Sign up with automatic player account creation
  static async signUp(email: string, password: string, username: string) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        }
      }
    })

    if (authError) throw authError

    // Player account will be created automatically via trigger
    return authData
  }

  // Get current player account
  static async getCurrentPlayer() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('player_accounts')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) throw error
    return data
  }

  // Create character for current player
  static async createCharacter(characterName: string) {
    const player = await this.getCurrentPlayer()
    if (!player) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('characters')
      .insert({
        player_id: player.id,
        character_name: characterName
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}
```

## 7. Game State Integration

### Update Existing Game Components

#### Character Component Integration

```typescript
// src/components/Character.tsx
import { useEffect, useState } from 'react'
import { DatabaseService } from '../services/database.service'
import type { CharacterWithSkills } from '../types/game.types'

export function CharacterComponent({ characterId }: { characterId: string }) {
  const [character, setCharacter] = useState<CharacterWithSkills | null>(null)

  useEffect(() => {
    const loadCharacter = async () => {
      try {
        const data = await DatabaseService.getCharacterWithSkills(characterId)
        setCharacter(data)
      } catch (error) {
        console.error('Failed to load character:', error)
      }
    }
    
    loadCharacter()
  }, [characterId])

  const handleSkillTrain = async (skillName: string) => {
    try {
      await DatabaseService.awardSkillExperience(characterId, skillName, 100)
      // Character will be updated via real-time subscription
    } catch (error) {
      console.error('Failed to train skill:', error)
    }
  }

  if (!character) return <div>Loading character...</div>

  return (
    <div className="character-panel">
      <h2>{character.character_name}</h2>
      <div className="stats">
        <p>Health: {character.current_health}/{character.max_health}</p>
        <p>Mana: {character.current_mana}/{character.max_mana}</p>
        <p>AP: {character.action_points}/{character.max_action_points}</p>
      </div>
      
      <div className="skills">
        {character.character_skills.map(skill => (
          <div key={skill.id} className="skill">
            <span>{skill.skills.skill_name}: {skill.current_level}</span>
            <button onClick={() => handleSkillTrain(skill.skills.skill_name)}>
              Train
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

#### Game Session Integration

```typescript
// src/components/GameSession.tsx
import { useEffect, useState } from 'react'
import { RealtimeService } from '../services/realtime.service'
import { DatabaseService } from '../services/database.service'
import type { GameSessionWithParticipants, GameStateUpdate } from '../types/game.types'

export function GameSessionComponent({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<GameSessionWithParticipants | null>(null)
  const [gameUpdates, setGameUpdates] = useState<GameStateUpdate[]>([])

  useEffect(() => {
    const loadSession = async () => {
      try {
        const data = await DatabaseService.getActiveSession(sessionId)
        setSession(data)
      } catch (error) {
        console.error('Failed to load session:', error)
      }
    }

    const handleGameUpdate = (update: GameStateUpdate) => {
      setGameUpdates(prev => [...prev.slice(-10), update]) // Keep last 10 updates
      
      // Update session state based on update type
      if (update.event_type === 'participant_update') {
        loadSession() // Reload session data
      }
    }

    loadSession()
    RealtimeService.subscribeToSession(sessionId, handleGameUpdate)

    return () => {
      RealtimeService.unsubscribeFromSession(sessionId)
    }
  }, [sessionId])

  const handleTurnStart = async (playerId: string) => {
    await RealtimeService.broadcastTurnStart(sessionId, playerId, {
      turn_type: 'player_turn',
      timestamp: Date.now()
    })
  }

  if (!session) return <div>Loading session...</div>

  return (
    <div className="game-session">
      <h2>{session.session_name}</h2>
      <div className="session-info">
        <p>Players: {session.current_players}/{session.max_players}</p>
        <p>Status: {session.session_status}</p>
        <p>Difficulty: {session.difficulty_level}</p>
      </div>

      <div className="participants">
        {session.session_participants.map(participant => (
          <div key={participant.id} className="participant">
            <span>{participant.player_accounts.username}</span>
            <span>Turn: {participant.turn_order}</span>
            <span>Status: {participant.player_status}</span>
            {participant.characters && (
              <span>Playing: {participant.characters.character_name}</span>
            )}
          </div>
        ))}
      </div>

      <div className="game-updates">
        <h3>Recent Updates</h3>
        {gameUpdates.map((update, index) => (
          <div key={index} className="update">
            {update.event_type}: {update.operation} on {update.table}
          </div>
        ))}
      </div>
    </div>
  )
}
```

## 8. Performance Optimization

### Connection Pooling

Update your database connection for high-load scenarios:

```typescript
// src/lib/supabase-admin.ts
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'x-client-info': 'tactical-roguelike-admin'
      }
    }
  }
)
```

### Query Optimization

Use the provided indexes and optimize queries:

```typescript
// Optimized query with explicit filters
const { data } = await supabase
  .from('characters')
  .select('id, character_name, current_health, max_health')
  .eq('player_id', playerId)
  .eq('is_permadead', false)
  .order('last_played_at', { ascending: false })
  .limit(10)
```

## 9. Error Handling

### Database Error Service

Create `src/services/error.service.ts`:

```typescript
import { PostgrestError } from '@supabase/supabase-js'

export class DatabaseErrorService {
  static handleError(error: PostgrestError | Error): string {
    if ('code' in error) {
      // PostgreSQL error codes
      switch (error.code) {
        case '23505': // Unique violation
          return 'That name is already taken'
        case '23503': // Foreign key violation
          return 'Invalid reference to related data'
        case '42501': // Insufficient privilege (RLS)
          return 'You do not have permission to access this data'
        default:
          console.error('Database error:', error)
          return 'A database error occurred'
      }
    }
    
    console.error('General error:', error)
    return error.message || 'An unexpected error occurred'
  }
}
```

## 10. Testing

### Database Tests

Create `src/tests/database.test.ts`:

```typescript
import { DatabaseService } from '../services/database.service'
import { supabase } from '../lib/supabase'

describe('Database Integration', () => {
  beforeAll(async () => {
    // Set up test user
    await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword'
    })
  })

  test('should create character with skills', async () => {
    const character = await DatabaseService.createCharacter('Test Character')
    expect(character).toBeDefined()
    expect(character.character_name).toBe('Test Character')
  })

  test('should award skill experience', async () => {
    const result = await DatabaseService.awardSkillExperience(
      'character-id',
      'Swords',
      100
    )
    expect(result).toBe(true)
  })
})
```

## 11. Deployment

### Environment Setup

Production environment variables:

```bash
# Production Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key

# Database
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres

# Optional: Enable edge functions
SUPABASE_FUNCTIONS_URL=https://your-project.supabase.co/functions/v1
```

### Production Checklist

- [ ] All migrations applied to production database
- [ ] RLS policies tested and verified
- [ ] Real-time subscriptions configured
- [ ] Performance indexes created
- [ ] Authentication flow tested
- [ ] Error handling implemented
- [ ] Connection pooling configured
- [ ] Monitoring and logging set up

## 12. Monitoring

### Database Monitoring

Use these queries to monitor performance:

```sql
-- Check active connections
SELECT COUNT(*) as active_connections 
FROM pg_stat_activity 
WHERE state = 'active';

-- Monitor slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
WHERE mean_exec_time > 1000 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Check index usage
SELECT * FROM analyze_index_usage() 
WHERE scans < 100;
```

## Support

For issues with this integration:

1. Check Supabase logs in dashboard
2. Verify RLS policies are correctly applied
3. Test database queries directly in SQL editor
4. Monitor real-time subscription status
5. Check browser console for JavaScript errors

The database framework is designed to scale with your game's growth while maintaining optimal performance for real-time multiplayer gameplay.