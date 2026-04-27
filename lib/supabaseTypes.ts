// lib/supabaseTypes.ts
// Database types derived from the live Supabase schema (public schema, all tables).
// Generated manually from information_schema on 2026-04-27.
//
// When Supabase CLI is linked:
//   npx supabase gen types typescript --linked > lib/database.types.ts
// then migrate callers to that file and delete this one.
//
// RULE: Do not hand-edit column types here — re-run the information_schema query
// and regenerate instead. Nullability matches the real schema (NOT NULL → non-null).

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ── Full table row types ──────────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      analytics_events: {
        Row: {
          id: number;
          user_id: string | null;
          event: string;
          source: string | null;
          created_at: string;
        };
        Insert: {
          id?: never; // bigserial
          user_id?: string | null;
          event: string;
          source?: string | null;
          created_at?: string;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          tx_type: string;
          related_feature: string | null;
          description: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          tx_type: string;
          related_feature?: string | null;
          description?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      email_subscribe_attempts: {
        Row: {
          id: number;
          ip: string;
          created_at: string;
        };
        Insert: {
          id?: never; // nextval sequence
          ip: string;
          created_at?: string;
        };
      };
      email_subscribers: {
        Row: {
          id: string;
          email: string;
          source: string;
          subscribed_at: string;
          unsubscribed_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          source?: string;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
        };
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string | null;
          created_at: string | null;
          mood: number | null;
          title: string | null;
          content: string | null;
          ai_response: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          created_at?: string | null;
          mood?: number | null;
          title?: string | null;
          content?: string | null;
          ai_response?: string | null;
        };
        Update: {
          mood?: number | null;
          title?: string | null;
          content?: string | null;
          ai_response?: string | null;
        };
      };
      plan_history: {
        Row: {
          id: string;
          user_id: string;
          old_plan_type: string | null;
          new_plan_type: string;
          reason: string | null;
          changed_by: string | null;
          changed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          old_plan_type?: string | null;
          new_plan_type: string;
          reason?: string | null;
          changed_by?: string | null;
          changed_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          created_at: string | null;
          display_name: string | null;
          main_focus: string | null;
          stripe_customer_id: string | null;
          weekly_summary: string | null;
          weekly_summary_generated_at: string | null;
          dodo_customer_id: string | null;
          dodo_subscription_id: string | null;
        };
        Insert: {
          id: string;
          created_at?: string | null;
          display_name?: string | null;
          main_focus?: string | null;
          stripe_customer_id?: string | null;
          weekly_summary?: string | null;
          weekly_summary_generated_at?: string | null;
          dodo_customer_id?: string | null;
          dodo_subscription_id?: string | null;
        };
        Update: {
          display_name?: string | null;
          main_focus?: string | null;
          stripe_customer_id?: string | null;
          weekly_summary?: string | null;
          weekly_summary_generated_at?: string | null;
          dodo_customer_id?: string | null;
          dodo_subscription_id?: string | null;
        };
      };
      reflection_usage: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          created_at?: string | null;
        };
      };
      upgrade_intents: {
        Row: {
          id: string;
          user_id: string | null;
          source: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          source?: string | null;
          created_at?: string | null;
        };
      };
      user_credits: {
        Row: {
          user_id: string;
          plan_type: string;
          remaining_credits: number;
          updated_at: string | null;
          renewal_date: string | null;
        };
        Insert: {
          user_id: string;
          plan_type?: string;
          remaining_credits?: number;
          updated_at?: string | null;
          renewal_date?: string | null;
        };
        Update: {
          plan_type?: string;
          remaining_credits?: number;
          updated_at?: string | null;
          renewal_date?: string | null;
        };
      };
      user_plans: {
        Row: {
          id: string;
          user_id: string;
          plan_type: string;
          credits_balance: number;
          renewal_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_type?: string;
          credits_balance?: number;
          renewal_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          plan_type?: string;
          credits_balance?: number;
          renewal_date?: string | null;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          tier: string | null;
          subscription_status: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          tier?: string | null;
          subscription_status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          tier?: string | null;
          subscription_status?: string | null;
          updated_at?: string | null;
        };
      };
    };
  };
}

// ── Convenience aliases (backward-compatible with existing callers) ────────────
// Derived from Database so they stay in sync automatically.

/** Full row from user_credits — callers that cast `.data as UserCreditsRow` */
export type UserCreditsRow =
  Database["public"]["Tables"]["user_credits"]["Row"];

/** Narrow view used by insights/page.tsx — only plan_type is selected */
export type UserPlanRow = Pick<UserCreditsRow, "plan_type">;
