// ========================================
// TACTICAL ASCII ROGUELIKE - DATABASE TYPES
// ========================================
// Generated TypeScript types for Supabase database schema
// This file should be regenerated when schema changes
// ========================================

export interface Database {
  public: {
    Tables: {
      abilities: {
        Row: {
          id: string
          ability_name: string
          ability_category: 'combat' | 'magic' | 'stealth' | 'utility' | 'crafting' | 'leadership' | 'passive'
          ability_type: 'active' | 'passive' | 'reactive' | 'toggle'
          ap_cost: number
          mana_cost: number
          cooldown_turns: number
          cast_time_ticks: number
          range_tiles: number
          area_of_effect: number
          required_skills: Json
          required_equipment: Json
          forbidden_equipment: Json
          skill_scaling: Json
          base_effects: Json
          description: string
          is_active: boolean
          ability_order: number | null
        }
        Insert: {
          id?: string
          ability_name: string
          ability_category: 'combat' | 'magic' | 'stealth' | 'utility' | 'crafting' | 'leadership' | 'passive'
          ability_type: 'active' | 'passive' | 'reactive' | 'toggle'
          ap_cost?: number
          mana_cost?: number
          cooldown_turns?: number
          cast_time_ticks?: number
          range_tiles?: number
          area_of_effect?: number
          required_skills?: Json
          required_equipment?: Json
          forbidden_equipment?: Json
          skill_scaling?: Json
          base_effects?: Json
          description: string
          is_active?: boolean
          ability_order?: number | null
        }
        Update: {
          id?: string
          ability_name?: string
          ability_category?: 'combat' | 'magic' | 'stealth' | 'utility' | 'crafting' | 'leadership' | 'passive'
          ability_type?: 'active' | 'passive' | 'reactive' | 'toggle'
          ap_cost?: number
          mana_cost?: number
          cooldown_turns?: number
          cast_time_ticks?: number
          range_tiles?: number
          area_of_effect?: number
          required_skills?: Json
          required_equipment?: Json
          forbidden_equipment?: Json
          skill_scaling?: Json
          base_effects?: Json
          description?: string
          is_active?: boolean
          ability_order?: number | null
        }
      }
      character_abilities: {
        Row: {
          id: string
          character_id: string
          ability_id: string
          learned_at: string
          times_used: number
          last_used_at: string | null
          hotkey_slot: number | null
          is_available: boolean
          mastery_level: number
        }
        Insert: {
          id?: string
          character_id: string
          ability_id: string
          learned_at?: string
          times_used?: number
          last_used_at?: string | null
          hotkey_slot?: number | null
          is_available?: boolean
          mastery_level?: number
        }
        Update: {
          id?: string
          character_id?: string
          ability_id?: string
          learned_at?: string
          times_used?: number
          last_used_at?: string | null
          hotkey_slot?: number | null
          is_available?: boolean
          mastery_level?: number
        }
      }
      character_inventory: {
        Row: {
          id: string
          character_id: string
          item_template_id: string
          quantity: number
          current_durability: number | null
          is_equipped: boolean
          equipment_slot: 'main_hand' | 'off_hand' | 'head' | 'chest' | 'legs' | 'feet' | 'ring1' | 'ring2' | 'neck' | 'back' | null
          custom_properties: Json
          acquired_at: string
        }
        Insert: {
          id?: string
          character_id: string
          item_template_id: string
          quantity?: number
          current_durability?: number | null
          is_equipped?: boolean
          equipment_slot?: 'main_hand' | 'off_hand' | 'head' | 'chest' | 'legs' | 'feet' | 'ring1' | 'ring2' | 'neck' | 'back' | null
          custom_properties?: Json
          acquired_at?: string
        }
        Update: {
          id?: string
          character_id?: string
          item_template_id?: string
          quantity?: number
          current_durability?: number | null
          is_equipped?: boolean
          equipment_slot?: 'main_hand' | 'off_hand' | 'head' | 'chest' | 'legs' | 'feet' | 'ring1' | 'ring2' | 'neck' | 'back' | null
          custom_properties?: Json
          acquired_at?: string
        }
      }
      character_skills: {
        Row: {
          id: string
          character_id: string
          skill_id: string
          current_level: number
          experience_points: number
          experience_to_next: number
          times_used: number
          last_trained_at: string
          training_modifier: number
        }
        Insert: {
          id?: string
          character_id: string
          skill_id: string
          current_level?: number
          experience_points?: number
          experience_to_next?: number
          times_used?: number
          last_trained_at?: string
          training_modifier?: number
        }
        Update: {
          id?: string
          character_id?: string
          skill_id?: string
          current_level?: number
          experience_points?: number
          experience_to_next?: number
          times_used?: number
          last_trained_at?: string
          training_modifier?: number
        }
      }
      characters: {
        Row: {
          id: string
          player_id: string
          character_name: string
          current_health: number
          max_health: number
          current_mana: number
          max_mana: number
          action_points: number
          max_action_points: number
          position_x: number
          position_y: number
          facing_direction: 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest'
          character_status: 'alive' | 'unconscious' | 'dead' | 'soul_departed'
          death_count: number
          created_at: string
          last_played_at: string
          total_playtime_minutes: number
          is_permadead: boolean
          character_data: Json
        }
        Insert: {
          id?: string
          player_id: string
          character_name: string
          current_health?: number
          max_health?: number
          current_mana?: number
          max_mana?: number
          action_points?: number
          max_action_points?: number
          position_x?: number
          position_y?: number
          facing_direction?: 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest'
          character_status?: 'alive' | 'unconscious' | 'dead' | 'soul_departed'
          death_count?: number
          created_at?: string
          last_played_at?: string
          total_playtime_minutes?: number
          is_permadead?: boolean
          character_data?: Json
        }
        Update: {
          id?: string
          player_id?: string
          character_name?: string
          current_health?: number
          max_health?: number
          current_mana?: number
          max_mana?: number
          action_points?: number
          max_action_points?: number
          position_x?: number
          position_y?: number
          facing_direction?: 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest'
          character_status?: 'alive' | 'unconscious' | 'dead' | 'soul_departed'
          death_count?: number
          created_at?: string
          last_played_at?: string
          total_playtime_minutes?: number
          is_permadead?: boolean
          character_data?: Json
        }
      }
      game_sessions: {
        Row: {
          id: string
          session_name: string
          host_player_id: string
          max_players: number
          current_players: number
          session_status: 'lobby' | 'active' | 'paused' | 'completed' | 'abandoned'
          difficulty_level: 'easy' | 'normal' | 'hard' | 'elite' | 'nightmare'
          dungeon_floor: number
          turn_timer_seconds: number
          created_at: string
          started_at: string | null
          completed_at: string | null
          session_config: Json
        }
        Insert: {
          id?: string
          session_name: string
          host_player_id: string
          max_players?: number
          current_players?: number
          session_status?: 'lobby' | 'active' | 'paused' | 'completed' | 'abandoned'
          difficulty_level?: 'easy' | 'normal' | 'hard' | 'elite' | 'nightmare'
          dungeon_floor?: number
          turn_timer_seconds?: number
          created_at?: string
          started_at?: string | null
          completed_at?: string | null
          session_config?: Json
        }
        Update: {
          id?: string
          session_name?: string
          host_player_id?: string
          max_players?: number
          current_players?: number
          session_status?: 'lobby' | 'active' | 'paused' | 'completed' | 'abandoned'
          difficulty_level?: 'easy' | 'normal' | 'hard' | 'elite' | 'nightmare'
          dungeon_floor?: number
          turn_timer_seconds?: number
          created_at?: string
          started_at?: string | null
          completed_at?: string | null
          session_config?: Json
        }
      }
      guild_members: {
        Row: {
          id: string
          guild_id: string
          player_id: string
          member_role: 'leader' | 'officer' | 'member'
          joined_at: string
          contribution_points: number
          last_active_at: string
          member_status: 'active' | 'inactive' | 'suspended'
        }
        Insert: {
          id?: string
          guild_id: string
          player_id: string
          member_role?: 'leader' | 'officer' | 'member'
          joined_at?: string
          contribution_points?: number
          last_active_at?: string
          member_status?: 'active' | 'inactive' | 'suspended'
        }
        Update: {
          id?: string
          guild_id?: string
          player_id?: string
          member_role?: 'leader' | 'officer' | 'member'
          joined_at?: string
          contribution_points?: number
          last_active_at?: string
          member_status?: 'active' | 'inactive' | 'suspended'
        }
      }
      guild_storage: {
        Row: {
          id: string
          guild_id: string
          item_template_id: string
          quantity: number
          contributed_by: string | null
          contributed_at: string
          storage_type: 'vault' | 'crafting' | 'consumables'
          access_level: 'leader' | 'officer' | 'all'
          custom_properties: Json
        }
        Insert: {
          id?: string
          guild_id: string
          item_template_id: string
          quantity?: number
          contributed_by?: string | null
          contributed_at?: string
          storage_type?: 'vault' | 'crafting' | 'consumables'
          access_level?: 'leader' | 'officer' | 'all'
          custom_properties?: Json
        }
        Update: {
          id?: string
          guild_id?: string
          item_template_id?: string
          quantity?: number
          contributed_by?: string | null
          contributed_at?: string
          storage_type?: 'vault' | 'crafting' | 'consumables'
          access_level?: 'leader' | 'officer' | 'all'
          custom_properties?: Json
        }
      }
      guilds: {
        Row: {
          id: string
          guild_name: string
          guild_description: string | null
          leader_player_id: string
          max_members: number
          current_members: number
          guild_level: number
          guild_experience: number
          guild_treasury: number
          created_at: string
          guild_config: Json
          is_active: boolean
        }
        Insert: {
          id?: string
          guild_name: string
          guild_description?: string | null
          leader_player_id: string
          max_members?: number
          current_members?: number
          guild_level?: number
          guild_experience?: number
          guild_treasury?: number
          created_at?: string
          guild_config?: Json
          is_active?: boolean
        }
        Update: {
          id?: string
          guild_name?: string
          guild_description?: string | null
          leader_player_id?: string
          max_members?: number
          current_members?: number
          guild_level?: number
          guild_experience?: number
          guild_treasury?: number
          created_at?: string
          guild_config?: Json
          is_active?: boolean
        }
      }
      item_templates: {
        Row: {
          id: string
          item_name: string
          item_type: 'weapon' | 'armor' | 'shield' | 'consumable' | 'material' | 'tool' | 'treasure'
          item_subtype: string
          item_quality: 'poor' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'artifact'
          base_value: number
          weight: number
          durability: number
          required_skills: Json
          stat_modifiers: Json
          special_properties: Json
          description: string | null
          ascii_symbol: string
          color_code: string
          is_stackable: boolean
          max_stack_size: number
          is_active: boolean
          item_order: number | null
        }
        Insert: {
          id?: string
          item_name: string
          item_type: 'weapon' | 'armor' | 'shield' | 'consumable' | 'material' | 'tool' | 'treasure'
          item_subtype: string
          item_quality?: 'poor' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'artifact'
          base_value?: number
          weight?: number
          durability?: number
          required_skills?: Json
          stat_modifiers?: Json
          special_properties?: Json
          description?: string | null
          ascii_symbol?: string
          color_code?: string
          is_stackable?: boolean
          max_stack_size?: number
          is_active?: boolean
          item_order?: number | null
        }
        Update: {
          id?: string
          item_name?: string
          item_type?: 'weapon' | 'armor' | 'shield' | 'consumable' | 'material' | 'tool' | 'treasure'
          item_subtype?: string
          item_quality?: 'poor' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'artifact'
          base_value?: number
          weight?: number
          durability?: number
          required_skills?: Json
          stat_modifiers?: Json
          special_properties?: Json
          description?: string | null
          ascii_symbol?: string
          color_code?: string
          is_stackable?: boolean
          max_stack_size?: number
          is_active?: boolean
          item_order?: number | null
        }
      }
      performance_logs: {
        Row: {
          id: string
          operation_type: string
          duration_ms: number
          details: Json
          logged_at: string
        }
        Insert: {
          id?: string
          operation_type: string
          duration_ms: number
          details?: Json
          logged_at?: string
        }
        Update: {
          id?: string
          operation_type?: string
          duration_ms?: number
          details?: Json
          logged_at?: string
        }
      }
      player_accounts: {
        Row: {
          id: string
          user_id: string
          username: string
          display_name: string | null
          total_playtime_minutes: number
          characters_created: number
          characters_lost: number
          account_created_at: string
          last_active_at: string
          is_active: boolean
          preferences: Json
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          display_name?: string | null
          total_playtime_minutes?: number
          characters_created?: number
          characters_lost?: number
          account_created_at?: string
          last_active_at?: string
          is_active?: boolean
          preferences?: Json
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          display_name?: string | null
          total_playtime_minutes?: number
          characters_created?: number
          characters_lost?: number
          account_created_at?: string
          last_active_at?: string
          is_active?: boolean
          preferences?: Json
        }
      }
      session_participants: {
        Row: {
          id: string
          session_id: string
          player_id: string
          character_id: string | null
          joined_at: string
          left_at: string | null
          is_active: boolean
          turn_order: number | null
          player_status: 'alive' | 'unconscious' | 'dead' | 'soul_departed' | 'disconnected'
        }
        Insert: {
          id?: string
          session_id: string
          player_id: string
          character_id?: string | null
          joined_at?: string
          left_at?: string | null
          is_active?: boolean
          turn_order?: number | null
          player_status?: 'alive' | 'unconscious' | 'dead' | 'soul_departed' | 'disconnected'
        }
        Update: {
          id?: string
          session_id?: string
          player_id?: string
          character_id?: string | null
          joined_at?: string
          left_at?: string | null
          is_active?: boolean
          turn_order?: number | null
          player_status?: 'alive' | 'unconscious' | 'dead' | 'soul_departed' | 'disconnected'
        }
      }
      skill_categories: {
        Row: {
          id: string
          category_name: string
          description: string | null
          color_code: string
          sort_order: number | null
          is_active: boolean
        }
        Insert: {
          id?: string
          category_name: string
          description?: string | null
          color_code?: string
          sort_order?: number | null
          is_active?: boolean
        }
        Update: {
          id?: string
          category_name?: string
          description?: string | null
          color_code?: string
          sort_order?: number | null
          is_active?: boolean
        }
      }
      skill_milestones: {
        Row: {
          id: string
          skill_id: string
          milestone_level: number
          reward_type: 'stat_bonus' | 'ability_unlock' | 'passive_effect' | 'crafting_unlock'
          reward_value: Json
          description: string | null
        }
        Insert: {
          id?: string
          skill_id: string
          milestone_level: number
          reward_type: 'stat_bonus' | 'ability_unlock' | 'passive_effect' | 'crafting_unlock'
          reward_value?: Json
          description?: string | null
        }
        Update: {
          id?: string
          skill_id?: string
          milestone_level?: number
          reward_type?: 'stat_bonus' | 'ability_unlock' | 'passive_effect' | 'crafting_unlock'
          reward_value?: Json
          description?: string | null
        }
      }
      skill_synergies: {
        Row: {
          id: string
          primary_skill_id: string | null
          synergy_skill_id: string | null
          training_bonus: number
          description: string | null
        }
        Insert: {
          id?: string
          primary_skill_id?: string | null
          synergy_skill_id?: string | null
          training_bonus?: number
          description?: string | null
        }
        Update: {
          id?: string
          primary_skill_id?: string | null
          synergy_skill_id?: string | null
          training_bonus?: number
          description?: string | null
        }
      }
      skills: {
        Row: {
          id: string
          skill_name: string
          skill_category: 'weapon' | 'armor' | 'magic' | 'combat' | 'crafting' | 'passive'
          skill_type: string
          description: string
          max_level: number
          base_training_cost: number
          is_active: boolean
          skill_order: number | null
        }
        Insert: {
          id?: string
          skill_name: string
          skill_category: 'weapon' | 'armor' | 'magic' | 'combat' | 'crafting' | 'passive'
          skill_type: string
          description: string
          max_level?: number
          base_training_cost?: number
          is_active?: boolean
          skill_order?: number | null
        }
        Update: {
          id?: string
          skill_name?: string
          skill_category?: 'weapon' | 'armor' | 'magic' | 'combat' | 'crafting' | 'passive'
          skill_type?: string
          description?: string
          max_level?: number
          base_training_cost?: number
          is_active?: boolean
          skill_order?: number | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_skill_experience: {
        Args: {
          character_id: string
          skill_name: string
          experience_amount: number
        }
        Returns: boolean
      }
      calculate_experience_to_next: {
        Args: {
          current_level: number
          base_cost?: number
        }
        Returns: number
      }
      calculate_max_health: {
        Args: {
          character_id: string
        }
        Returns: number
      }
      calculate_max_mana: {
        Args: {
          character_id: string
        }
        Returns: number
      }
      check_ability_requirements: {
        Args: {
          character_id: string
          ability_id: string
        }
        Returns: boolean
      }
      cleanup_inactive_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_performance_logs: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_realtime_messages: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_guild_channel: {
        Args: {
          guild_id: string
        }
        Returns: string
      }
      get_guild_realtime_data: {
        Args: {
          guild_id: string
        }
        Returns: Json
      }
      get_player_channel: {
        Args: {
          player_id: string
        }
        Returns: string
      }
      get_session_channel: {
        Args: {
          session_id: string
        }
        Returns: string
      }
      get_session_realtime_data: {
        Args: {
          session_id: string
        }
        Returns: Json
      }
      get_user_player_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      log_expensive_operation: {
        Args: {
          operation_type: string
          duration_ms: number
          details?: Json
        }
        Returns: undefined
      }
      maintain_game_indexes: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      update_character_derived_stats: {
        Args: {
          character_id: string
        }
        Returns: undefined
      }
      user_guild_admin: {
        Args: {
          guild_id: string
        }
        Returns: boolean
      }
      user_in_character_session: {
        Args: {
          character_id: string
        }
        Returns: boolean
      }
      user_in_guild: {
        Args: {
          guild_id: string
        }
        Returns: boolean
      }
      user_in_session: {
        Args: {
          session_id: string
        }
        Returns: boolean
      }
      user_owns_character: {
        Args: {
          character_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      realtime_event_type: 
        | 'character_update'
        | 'participant_update'
        | 'skill_update'
        | 'inventory_update'
        | 'ability_update'
        | 'guild_storage_update'
        | 'turn_start'
        | 'turn_end'
        | 'action_performed'
        | 'damage_dealt'
        | 'skill_trained'
        | 'ability_learned'
        | 'item_equipped'
        | 'item_unequipped'
        | 'session_state_change'
        | 'guild_notification'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper type for JSON columns
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// Utility types for common operations
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]