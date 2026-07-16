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
          created_at: string
          family: Json
          first_name: string
          history: string[]
          id: string
          lifestyle: Json
          name: string
          region: string
          sex: string
        }
        Insert: {
          age?: number
          allergies?: string[]
          blood_group?: string
          created_at?: string
          family?: Json
          first_name?: string
          history?: string[]
          id: string
          lifestyle?: Json
          name?: string
          region?: string
          sex?: string
        }
        Update: {
          age?: number
          allergies?: string[]
          blood_group?: string
          created_at?: string
          family?: Json
          first_name?: string
          history?: string[]
          id?: string
          lifestyle?: Json
          name?: string
          region?: string
          sex?: string
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
