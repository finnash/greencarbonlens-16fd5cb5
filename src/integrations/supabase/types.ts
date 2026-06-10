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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["activity_category"]
          created_at: string
          factor_slug: string
          id: string
          kg_co2e: number
          notes: string | null
          occurred_at: string
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: Database["public"]["Enums"]["activity_category"]
          created_at?: string
          factor_slug: string
          id?: string
          kg_co2e: number
          notes?: string | null
          occurred_at?: string
          unit: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["activity_category"]
          created_at?: string
          factor_slug?: string
          id?: string
          kg_co2e?: number
          notes?: string | null
          occurred_at?: string
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_factor_slug_fkey"
            columns: ["factor_slug"]
            isOneToOne: false
            referencedRelation: "activity_factors"
            referencedColumns: ["slug"]
          },
        ]
      }
      activity_factors: {
        Row: {
          category: Database["public"]["Enums"]["activity_category"]
          created_at: string
          id: string
          kg_co2e_per_unit: number
          name: string
          region: string | null
          slug: string
          source: string | null
          unit: string
        }
        Insert: {
          category: Database["public"]["Enums"]["activity_category"]
          created_at?: string
          id?: string
          kg_co2e_per_unit: number
          name: string
          region?: string | null
          slug: string
          source?: string | null
          unit: string
        }
        Update: {
          category?: Database["public"]["Enums"]["activity_category"]
          created_at?: string
          id?: string
          kg_co2e_per_unit?: number
          name?: string
          region?: string | null
          slug?: string
          source?: string | null
          unit?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          category: Database["public"]["Enums"]["activity_category"]
          created_at: string
          description: string
          difficulty: number
          duration_days: number
          expected_kg_co2e_saved: number
          id: string
          is_active: boolean
          slug: string
          title: string
        }
        Insert: {
          category: Database["public"]["Enums"]["activity_category"]
          created_at?: string
          description: string
          difficulty?: number
          duration_days: number
          expected_kg_co2e_saved?: number
          id?: string
          is_active?: boolean
          slug: string
          title: string
        }
        Update: {
          category?: Database["public"]["Enums"]["activity_category"]
          created_at?: string
          description?: string
          difficulty?: number
          duration_days?: number
          expected_kg_co2e_saved?: number
          id?: string
          is_active?: boolean
          slug?: string
          title?: string
        }
        Relationships: []
      }
      coach_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["coach_role"]
          token_count: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["coach_role"]
          token_count?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["coach_role"]
          token_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          baseline_kg_co2e_year: number | null
          country_code: string | null
          created_at: string
          display_name: string | null
          handle: string | null
          id: string
          onboarding_completed: boolean
          quiz_answers: Json | null
          updated_at: string
        }
        Insert: {
          baseline_kg_co2e_year?: number | null
          country_code?: string | null
          created_at?: string
          display_name?: string | null
          handle?: string | null
          id: string
          onboarding_completed?: boolean
          quiz_answers?: Json | null
          updated_at?: string
        }
        Update: {
          baseline_kg_co2e_year?: number | null
          country_code?: string | null
          created_at?: string
          display_name?: string | null
          handle?: string | null
          id?: string
          onboarding_completed?: boolean
          quiz_answers?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          bucket: string
          count: number
          id: string
          user_id: string
          window_start: string
        }
        Insert: {
          bucket: string
          count?: number
          id?: string
          user_id: string
          window_start?: string
        }
        Update: {
          bucket?: string
          count?: number
          id?: string
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      user_challenges: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string
          ends_at: string
          id: string
          kg_co2e_saved: number
          started_at: string
          status: Database["public"]["Enums"]["challenge_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string
          ends_at: string
          id?: string
          kg_co2e_saved?: number
          started_at?: string
          status?: Database["public"]["Enums"]["challenge_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string
          ends_at?: string
          id?: string
          kg_co2e_saved?: number
          started_at?: string
          status?: Database["public"]["Enums"]["challenge_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      activity_category:
        | "transport"
        | "energy"
        | "food"
        | "shopping"
        | "travel"
        | "waste"
        | "other"
      app_role: "admin" | "user"
      challenge_status: "active" | "completed" | "abandoned"
      coach_role: "user" | "assistant" | "system"
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
      activity_category: [
        "transport",
        "energy",
        "food",
        "shopping",
        "travel",
        "waste",
        "other",
      ],
      app_role: ["admin", "user"],
      challenge_status: ["active", "completed", "abandoned"],
      coach_role: ["user", "assistant", "system"],
    },
  },
} as const
