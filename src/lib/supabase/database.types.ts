export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          created_at: string
          subscription_tier: 'free' | 'premium' | 'pro'
          assessment_completed: boolean
          onboarding_completed: boolean
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          subscription_tier?: 'free' | 'premium' | 'pro'
          assessment_completed?: boolean
          onboarding_completed?: boolean
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          subscription_tier?: 'free' | 'premium' | 'pro'
          assessment_completed?: boolean
          onboarding_completed?: boolean
        }
      }
      cognitive_profiles: {
        Row: {
          id: string
          user_id: string
          memory_score: number
          memory_difficulty: number
          attention_score: number
          attention_difficulty: number
          speed_score: number
          speed_difficulty: number
          problem_solving_score: number
          problem_solving_difficulty: number
          flexibility_score: number
          flexibility_difficulty: number
          overall_score: number
          strongest_domain: string
          weakest_domain: string
          last_assessment_date: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          memory_score?: number
          memory_difficulty?: number
          attention_score?: number
          attention_difficulty?: number
          speed_score?: number
          speed_difficulty?: number
          problem_solving_score?: number
          problem_solving_difficulty?: number
          flexibility_score?: number
          flexibility_difficulty?: number
          overall_score?: number
          strongest_domain?: string
          weakest_domain?: string
          last_assessment_date?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          memory_score?: number
          memory_difficulty?: number
          attention_score?: number
          attention_difficulty?: number
          speed_score?: number
          speed_difficulty?: number
          problem_solving_score?: number
          problem_solving_difficulty?: number
          flexibility_score?: number
          flexibility_difficulty?: number
          overall_score?: number
          strongest_domain?: string
          weakest_domain?: string
          last_assessment_date?: string
          updated_at?: string
        }
      }
      game_sessions: {
        Row: {
          id: string
          user_id: string
          game_id: string
          domain: string
          score: number
          accuracy: number
          average_reaction_time: number | null
          difficulty: number
          duration: number
          rounds_completed: number
          perfect_rounds: number
          streak: number
          completed_at: string
          session_data: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          game_id: string
          domain: string
          score: number
          accuracy: number
          average_reaction_time?: number | null
          difficulty: number
          duration: number
          rounds_completed: number
          perfect_rounds?: number
          streak?: number
          completed_at?: string
          session_data?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          game_id?: string
          domain?: string
          score?: number
          accuracy?: number
          average_reaction_time?: number | null
          difficulty?: number
          duration?: number
          rounds_completed?: number
          perfect_rounds?: number
          streak?: number
          completed_at?: string
          session_data?: Json | null
        }
      }
      daily_plans: {
        Row: {
          id: string
          user_id: string
          date: string
          games: Json
          completed: boolean
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          games: Json
          completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          games?: Json
          completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
      }
      streaks: {
        Row: {
          id: string
          user_id: string
          current_streak: number
          longest_streak: number
          last_training_date: string | null
        }
        Insert: {
          id?: string
          user_id: string
          current_streak?: number
          longest_streak?: number
          last_training_date?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          current_streak?: number
          longest_streak?: number
          last_training_date?: string | null
        }
      }
      progress_snapshots: {
        Row: {
          id: string
          user_id: string
          date: string
          memory_score: number
          attention_score: number
          speed_score: number
          problem_solving_score: number
          flexibility_score: number
          overall_score: number
          games_played: number
          training_minutes: number
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          memory_score: number
          attention_score: number
          speed_score: number
          problem_solving_score: number
          flexibility_score: number
          overall_score: number
          games_played: number
          training_minutes: number
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          memory_score?: number
          attention_score?: number
          speed_score?: number
          problem_solving_score?: number
          flexibility_score?: number
          overall_score?: number
          games_played?: number
          training_minutes?: number
        }
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
