export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          pages: Json;
          conversation: Json;
          created_at: string;
          updated_at: string;
          cf_project_name: string | null;
          deployed_url: string | null;
          last_deployed_at: string | null;
          custom_domain: string | null;
          custom_domain_status: "pending" | "active" | "error" | null;
          custom_domain_added_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string;
          pages?: Json;
          conversation?: Json;
          created_at?: string;
          updated_at?: string;
          cf_project_name?: string | null;
          deployed_url?: string | null;
          last_deployed_at?: string | null;
          custom_domain?: string | null;
          custom_domain_status?: "pending" | "active" | "error" | null;
          custom_domain_added_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          pages?: Json;
          conversation?: Json;
          created_at?: string;
          updated_at?: string;
          cf_project_name?: string | null;
          deployed_url?: string | null;
          last_deployed_at?: string | null;
          custom_domain?: string | null;
          custom_domain_status?: "pending" | "active" | "error" | null;
          custom_domain_added_at?: string | null;
        };
        Relationships: [];
      };
      generations: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          reserved_credits: number;
          actual_credits: number | null;
          input_tokens: number | null;
          output_tokens: number | null;
          total_tokens: number | null;
          status: "reserved" | "completed" | "failed";
          idempotency_key: string;
          error: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          reserved_credits: number;
          actual_credits?: number | null;
          input_tokens?: number | null;
          output_tokens?: number | null;
          total_tokens?: number | null;
          status?: "reserved" | "completed" | "failed";
          idempotency_key: string;
          error?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string | null;
          reserved_credits?: number;
          actual_credits?: number | null;
          input_tokens?: number | null;
          output_tokens?: number | null;
          total_tokens?: number | null;
          status?: "reserved" | "completed" | "failed";
          idempotency_key?: string;
          error?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      pending_generations: {
        Row: {
          id: string;
          checkout_session_id: string;
          user_id: string;
          prompt_token: string;
          created_at: string;
          consumed_at: string | null;
          expires_at: string;
        };
        Insert: {
          id?: string;
          checkout_session_id: string;
          user_id: string;
          prompt_token: string;
          created_at?: string;
          consumed_at?: string | null;
          expires_at?: string;
        };
        Update: {
          id?: string;
          checkout_session_id?: string;
          user_id?: string;
          prompt_token?: string;
          created_at?: string;
          consumed_at?: string | null;
          expires_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
