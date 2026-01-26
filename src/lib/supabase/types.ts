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
          created_at: string;
          updated_at: string;
          cf_project_name: string | null;
          deployed_url: string | null;
          last_deployed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string;
          pages?: Json;
          created_at?: string;
          updated_at?: string;
          cf_project_name?: string | null;
          deployed_url?: string | null;
          last_deployed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          pages?: Json;
          created_at?: string;
          updated_at?: string;
          cf_project_name?: string | null;
          deployed_url?: string | null;
          last_deployed_at?: string | null;
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
