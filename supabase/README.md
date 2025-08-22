# Supabase Database Framework for Tactical ASCII Roguelike

This directory contains the complete Supabase database architecture for the tactical ASCII roguelike game, supporting:

- **34+ Skills System** with progression tracking
- **180+ Items** (50+ weapons, 30+ armor, 100+ consumables)  
- **175+ Abilities** (magic spells, weapon techniques, utility skills)
- **8-Player Real-time Sessions** with multiplayer state management
- **Leveless Character Progression** with skill-based advancement

## Directory Structure

```
/supabase
├── migrations/           # SQL migration files for schema creation
├── functions/           # Database functions and triggers  
├── policies/            # Row Level Security policies
├── indexes/             # Performance optimization indexes
├── real-time/           # Real-time subscription configurations
├── seed-data/           # Initial data for skills, items, abilities
├── types/               # TypeScript type definitions
└── integration/         # Integration guides and examples
```

## Key Features

- **Optimized PostgreSQL Schema** for game data relationships
- **Row Level Security** for secure multiplayer data access
- **Real-time Subscriptions** for live game state synchronization
- **Performance Indexes** for fast game queries
- **Automatic Triggers** for skill progression and calculations
- **Comprehensive Seed Data** for all game content

## Getting Started

1. Review the migration files in `/migrations` for database schema
2. Configure Supabase project settings from `/real-time`
3. Apply RLS policies from `/policies` for data security
4. Import seed data from `/seed-data` for game content
5. Follow integration guide in `/integration`

---

**Generated with Context7 training for optimal Supabase database design patterns**