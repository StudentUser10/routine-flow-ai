export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          block_id: string | null
          created_at: string
          id: string
          is_read: boolean
          is_sent: boolean
          message: string
          scheduled_time: string
          user_id: string
        }
        Insert: {
          block_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          is_sent?: boolean
          message: string
          scheduled_time: string
          user_id: string
        }
        Update: {
          block_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          is_sent?: boolean
          message?: string
          scheduled_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "routine_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      block_status: {
        Row: {
          block_id: string
          completed_at: string | null
          created_at: string
          date: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          block_id: string
          completed_at?: string | null
          created_at?: string
          date?: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          block_id?: string
          completed_at?: string | null
          created_at?: string
          date?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "block_status_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "routine_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_progress: {
        Row: {
          blocks_completed: number
          blocks_skipped: number
          blocks_total: number
          completion_percentage: number
          created_at: string
          date: string
          id: string
          streak_maintained: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          blocks_completed?: number
          blocks_skipped?: number
          blocks_total?: number
          completion_percentage?: number
          created_at?: string
          date?: string
          id?: string
          streak_maintained?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          blocks_completed?: number
          blocks_skipped?: number
          blocks_total?: number
          completion_percentage?: number
          created_at?: string
          date?: string
          id?: string
          streak_maintained?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_versions: {
        Row: {
          created_at: string
          id: string
          responses: Json
          source: string
          user_id: string
          version: number
        }
        Insert: {
          created_at?: string
          id?: string
          responses?: Json
          source: string
          user_id: string
          version?: number
        }
        Update: {
          created_at?: string
          id?: string
          responses?: Json
          source?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          adjustments_limit: number
          adjustments_used: number
          created_at: string
          email: string
          id: string
          name: string
          onboarding_completed: boolean
          plan: Database["public"]["Enums"]["subscription_plan"]
          updated_at: string
          user_id: string
        }
        Insert: {
          adjustments_limit?: number
          adjustments_used?: number
          created_at?: string
          email: string
          id?: string
          name: string
          onboarding_completed?: boolean
          plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
          user_id: string
        }
        Update: {
          adjustments_limit?: number
          adjustments_used?: number
          created_at?: string
          email?: string
          id?: string
          name?: string
          onboarding_completed?: boolean
          plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      questionnaire_responses: {
        Row: {
          created_at: string
          energy_peak: string
          fixed_commitments: Json
          focus_duration: number
          has_fixed_work: boolean
          id: string
          main_goals: Json
          priorities: Json
          sleep_time: string
          updated_at: string
          user_id: string
          wake_time: string
          work_days: Json
          work_hours: string
        }
        Insert: {
          created_at?: string
          energy_peak: string
          fixed_commitments?: Json
          focus_duration: number
          has_fixed_work?: boolean
          id?: string
          main_goals?: Json
          priorities?: Json
          sleep_time: string
          updated_at?: string
          user_id: string
          wake_time: string
          work_days?: Json
          work_hours: string
        }
        Update: {
          created_at?: string
          energy_peak?: string
          fixed_commitments?: Json
          focus_duration?: number
          has_fixed_work?: boolean
          id?: string
          main_goals?: Json
          priorities?: Json
          sleep_time?: string
          updated_at?: string
          user_id?: string
          wake_time?: string
          work_days?: Json
          work_hours?: string
        }
        Relationships: []
      }
      routine_adjustments: {
        Row: {
          changes: Json
          created_at: string
          description: string
          id: string
          routine_id: string | null
          source: string
          user_id: string
        }
        Insert: {
          changes?: Json
          created_at?: string
          description: string
          id?: string
          routine_id?: string | null
          source: string
          user_id: string
        }
        Update: {
          changes?: Json
          created_at?: string
          description?: string
          id?: string
          routine_id?: string | null
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routine_adjustments_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      routine_blocks: {
        Row: {
          block_type: Database["public"]["Enums"]["block_type"]
          created_at: string
          day_of_week: number
          description: string | null
          end_time: string
          id: string
          is_fixed: boolean
          priority: number
          routine_id: string
          start_time: string
          title: string
        }
        Insert: {
          block_type: Database["public"]["Enums"]["block_type"]
          created_at?: string
          day_of_week: number
          description?: string | null
          end_time: string
          id?: string
          is_fixed?: boolean
          priority?: number
          routine_id: string
          start_time: string
          title: string
        }
        Update: {
          block_type?: Database["public"]["Enums"]["block_type"]
          created_at?: string
          day_of_week?: number
          description?: string | null
          end_time?: string
          id?: string
          is_fixed?: boolean
          priority?: number
          routine_id?: string
          start_time?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "routine_blocks_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      routine_feedback: {
        Row: {
          block_id: string
          created_at: string
          id: string
          notes: string | null
          user_id: string
          worked: boolean
        }
        Insert: {
          block_id: string
          created_at?: string
          id?: string
          notes?: string | null
          user_id: string
          worked: boolean
        }
        Update: {
          block_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          user_id?: string
          worked?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "routine_feedback_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "routine_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
          version: number
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
          version?: number
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
          version?: number
          week_start?: string
        }
        Relationships: []
      }
      user_gamification: {
        Row: {
          created_at: string
          current_level: string
          current_streak: number
          id: string
          last_active_date: string | null
          longest_streak: number
          streak_minimum_percentage: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: string
          current_streak?: number
          id?: string
          last_active_date?: string | null
          longest_streak?: number
          streak_minimum_percentage?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: string
          current_streak?: number
          id?: string
          last_active_date?: string | null
          longest_streak?: number
          streak_minimum_percentage?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      block_type: "focus" | "rest" | "personal" | "fixed"
      subscription_plan: "free" | "pro" | "annual"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      block_type: ["focus", "rest", "personal", "fixed"],
      subscription_plan: ["free", "pro", "annual"],
    },
  },
} as const
