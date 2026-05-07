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
      profiles: {
        Row: {
          id: string;
          first_name: string;
          email: string;
          phone: string;
          email_opt_in: boolean;
          sms_opt_in: boolean;
          auth_user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          email: string;
          phone: string;
          email_opt_in?: boolean;
          sms_opt_in?: boolean;
          auth_user_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      quiz_sessions: {
        Row: {
          id: string;
          profile_id: string;
          answers: Json;
          attribute_profile: Json;
          mood_key: string;
          mood_name: string;
          confidence_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          answers: Json;
          attribute_profile: Json;
          mood_key: string;
          mood_name: string;
          confidence_score: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["quiz_sessions"]["Insert"]>;
        Relationships: [];
      };
      feedback: {
        Row: {
          id: string;
          quiz_session_id: string;
          mood_accurate: boolean;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_session_id: string;
          mood_accurate: boolean;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["feedback"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
