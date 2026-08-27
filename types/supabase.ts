export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analytics_events: {
        Row: {
          id: string
          user_id: string | null
          event_name: string
          properties: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_name: string
          properties?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_name?: string
          properties?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: string
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }
      email_subscribe_attempts: {
        Row: {
          id: string
          email: string
          created_at: string
          status: string | null
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          status?: string | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          status?: string | null
        }
        Relationships: []
      }
      email_subscribers: {
        Row: {
          id: string
          email: string
          subscribed_at: string
          unsubscribed_at: string | null
          status: string
        }
        Insert: {
          id?: string
          email: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          status?: string
        }
        Update: {
          id?: string
          email?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          status?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          content: string
          reflection: string | null
          created_at: string
          updated_at: string
          locale: string | null
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          reflection?: string | null
          created_at?: string
          updated_at?: string
          locale?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          reflection?: string | null
          created_at?: string
          updated_at?: string
          locale?: string | null
        }
        Relationships: []
      }
      plan_history: {
        Row: {
          id: string
          user_id: string
          plan: string
          started_at: string
          ended_at: string | null
          provider: string | null
        }
        Insert: {
          id?: string
          user_id: string
          plan: string
          started_at?: string
          ended_at?: string | null
          provider?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          plan?: string
          started_at?: string
          ended_at?: string | null
          provider?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          locale: string | null
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          locale?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          locale?: string | null
        }
        Relationships: []
      }
      reflection_usage: {
        Row: {
          id: string
          user_id: string
          used_at: string
          entry_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          used_at?: string
          entry_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          used_at?: string
          entry_id?: string | null
        }
        Relationships: []
      }
      upgrade_intents: {
        Row: {
          id: string
          user_id: string
          created_at: string
          source: string | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          source?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          source?: string | null
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          id: string
          user_id: string
          balance: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          balance?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          balance?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_plans: {
        Row: {
          id: string
          user_id: string
          plan: string
          status: string
          provider: string | null
          provider_customer_id: string | null
          provider_subscription_id: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan: string
          status: string
          provider?: string | null
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: string
          status?: string
          provider?: string | null
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
