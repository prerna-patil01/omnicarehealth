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
      appointments: {
        Row: {
          created_at: string
          date: string
          doctor: string
          hospital: string
          id: string
          is_past: boolean
          ride: boolean
          specialty: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          doctor: string
          hospital: string
          id?: string
          is_past?: boolean
          ride?: boolean
          specialty: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          doctor?: string
          hospital?: string
          id?: string
          is_past?: boolean
          ride?: boolean
          specialty?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      biomarkers: {
        Row: {
          flag: string
          id: string
          name: string
          ref: string
          report_id: string | null
          sort_order: number
          unit: string
          user_id: string
          value: string
        }
        Insert: {
          flag: string
          id?: string
          name: string
          ref: string
          report_id?: string | null
          sort_order?: number
          unit: string
          user_id: string
          value: string
        }
        Update: {
          flag?: string
          id?: string
          name?: string
          ref?: string
          report_id?: string | null
          sort_order?: number
          unit?: string
          user_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "biomarkers_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      care_workers: {
        Row: {
          area: string
          availability: string
          id: string
          name: string
          rate: number
          rating: number
          role: string
        }
        Insert: {
          area?: string
          availability: string
          id: string
          name: string
          rate: number
          rating?: number
          role: string
        }
        Update: {
          area?: string
          availability?: string
          id?: string
          name?: string
          rate?: number
          rating?: number
          role?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          medicine_id: string
          qty: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          medicine_id: string
          qty?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          medicine_id?: string
          qty?: number
          user_id?: string
        }
        Relationships: []
      }
      consent_grants: {
        Row: {
          granted: boolean
          id: string
          scope: string
          updated_at: string
          user_id: string
        }
        Insert: {
          granted?: boolean
          id?: string
          scope: string
          updated_at?: string
          user_id: string
        }
        Update: {
          granted?: boolean
          id?: string
          scope?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          messages: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      doctors: {
        Row: {
          distance: string
          fee: number
          hospital: string
          id: number
          name: string
          rating: number
          slot: string
          specialty: string
        }
        Insert: {
          distance: string
          fee: number
          hospital: string
          id: number
          name: string
          rating: number
          slot: string
          specialty: string
        }
        Update: {
          distance?: string
          fee?: number
          hospital?: string
          id?: number
          name?: string
          rating?: number
          slot?: string
          specialty?: string
        }
        Relationships: []
      }
      medicines: {
        Row: {
          eta: string
          generic: string
          id: string
          name: string
          price: number
          rx: boolean
          tag: string | null
        }
        Insert: {
          eta: string
          generic: string
          id: string
          name: string
          price: number
          rx?: boolean
          tag?: string | null
        }
        Update: {
          eta?: string
          generic?: string
          id?: string
          name?: string
          price?: number
          rx?: boolean
          tag?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          medicine_id: string
          name: string
          order_id: string
          price: number
          qty: number
          user_id: string
        }
        Insert: {
          id?: string
          medicine_id: string
          name: string
          order_id: string
          price: number
          qty?: number
          user_id: string
        }
        Update: {
          id?: string
          medicine_id?: string
          name?: string
          order_id?: string
          price?: number
          qty?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          status: string
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          total: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number
          allergies: string[]
          blood_group: string
          bmi: number | null
          conditions: string[] | null
          created_at: string
          devices: Json | null
          diet: string | null
          dob: string | null
          drinking: string | null
          emergency_contact: Json | null
          exercise: string | null
          family: Json
          first_name: string
          height_cm: number | null
          history: string[]
          id: string
          junk_frequency: string | null
          lifestyle: Json
          medications: string[] | null
          name: string
          onboarded: boolean | null
          region: string
          sex: string
          smoking: string | null
          surgeries: string[] | null
          weight_kg: number | null
        }
        Insert: {
          age?: number
          allergies?: string[]
          blood_group?: string
          bmi?: number | null
          conditions?: string[] | null
          created_at?: string
          devices?: Json | null
          diet?: string | null
          dob?: string | null
          drinking?: string | null
          emergency_contact?: Json | null
          exercise?: string | null
          family?: Json
          first_name?: string
          height_cm?: number | null
          history?: string[]
          id: string
          junk_frequency?: string | null
          lifestyle?: Json
          medications?: string[] | null
          name?: string
          onboarded?: boolean | null
          region?: string
          sex?: string
          smoking?: string | null
          surgeries?: string[] | null
          weight_kg?: number | null
        }
        Update: {
          age?: number
          allergies?: string[]
          blood_group?: string
          bmi?: number | null
          conditions?: string[] | null
          created_at?: string
          devices?: Json | null
          diet?: string | null
          dob?: string | null
          drinking?: string | null
          emergency_contact?: Json | null
          exercise?: string | null
          family?: Json
          first_name?: string
          height_cm?: number | null
          history?: string[]
          id?: string
          junk_frequency?: string | null
          lifestyle?: Json
          medications?: string[] | null
          name?: string
          onboarded?: boolean | null
          region?: string
          sex?: string
          smoking?: string | null
          surgeries?: string[] | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          file_path: string | null
          id: string
          name: string
          report_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_path?: string | null
          id?: string
          name: string
          report_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_path?: string | null
          id?: string
          name?: string
          report_date?: string
          user_id?: string
        }
        Relationships: []
      }
      twin_snapshots: {
        Row: {
          bio_age: number
          created_at: string
          health_score: number
          id: string
          prone_to: Json
          systems: Json
          user_id: string
        }
        Insert: {
          bio_age: number
          created_at?: string
          health_score: number
          id?: string
          prone_to: Json
          systems: Json
          user_id: string
        }
        Update: {
          bio_age?: number
          created_at?: string
          health_score?: number
          id?: string
          prone_to?: Json
          systems?: Json
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
