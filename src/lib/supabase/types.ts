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
          is_public: boolean;
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
          is_public?: boolean;
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
          is_public?: boolean;
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
      email_log: {
        Row: {
          id: string;
          user_id: string;
          email_type: string;
          project_id: string | null;
          resend_message_id: string | null;
          sent_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email_type: string;
          project_id?: string | null;
          resend_message_id?: string | null;
          sent_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email_type?: string;
          project_id?: string | null;
          resend_message_id?: string | null;
          sent_at?: string;
        };
        Relationships: [];
      };
      email_preferences: {
        Row: {
          user_id: string;
          unsubscribed_all: boolean;
          unsubscribed_drip: boolean;
          unsubscribed_reengagement: boolean;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          unsubscribed_all?: boolean;
          unsubscribed_drip?: boolean;
          unsubscribed_reengagement?: boolean;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          unsubscribed_all?: boolean;
          unsubscribed_drip?: boolean;
          unsubscribed_reengagement?: boolean;
          updated_at?: string;
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
    Functions: {
      get_generated_never_published: {
        Args: Record<string, never>;
        Returns: {
          user_id: string;
          email: string;
          project_id: string;
          project_name: string;
        }[];
      };
      get_created_never_edited: {
        Args: Record<string, never>;
        Returns: {
          user_id: string;
          email: string;
          project_id: string;
          project_name: string;
        }[];
      };
      get_published_no_edits: {
        Args: Record<string, never>;
        Returns: {
          user_id: string;
          email: string;
          project_id: string;
          project_name: string;
        }[];
      };
      get_has_credits_idle: {
        Args: Record<string, never>;
        Returns: {
          user_id: string;
          email: string;
          available_credits: number;
        }[];
      };
      get_purchased_never_generated: {
        Args: Record<string, never>;
        Returns: { user_id: string; email: string }[];
      };
      get_drip_eligible: {
        Args: { p_drip_type: string; p_days_after_signup: number };
        Returns: { user_id: string; email: string }[];
      };
      get_credit_balance: {
        Args: { p_user_id: string };
        Returns: { available_credits: number; reserved_credits: number }[];
      };
      reserve_credits_for_generation: {
        Args: {
          p_user_id: string;
          p_reserved_credits: number;
          p_idempotency_key: string;
          p_project_id: string | null;
        };
        Returns: string;
      };
      finalize_generation_credits: {
        Args: {
          p_user_id: string;
          p_generation_id: string;
          p_success: boolean;
          p_actual_credits: number | null;
          p_input_tokens: number | null;
          p_output_tokens: number | null;
          p_total_tokens: number | null;
          p_error: string | null;
        };
        Returns: undefined;
      };
      add_credits_from_purchase: {
        Args: {
          p_user_id: string;
          p_credits: number;
          p_stripe_event_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
