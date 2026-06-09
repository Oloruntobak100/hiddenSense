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
          last_name: string;
          email: string;
          phone: string;
          email_opt_in: boolean;
          sms_opt_in: boolean;
          alcohol_policy: "adult" | "minor";
          auth_user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name?: string;
          email: string;
          phone: string;
          email_opt_in?: boolean;
          sms_opt_in?: boolean;
          alcohol_policy?: "adult" | "minor";
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
      cocktail_recommendations: {
        Row: {
          id: string;
          cocktail_name: string;
          alcohol_category: string;
          mood_tags: string[];
          flavor_profile: string;
          emotional_tags: string[];
          atmosphere_tags: string[];
          description: string;
          square_checkout_url: string;
          image_url: string | null;
          food_pairings: string[];
          food_name: string | null;
          food_image_url: string | null;
          priority_score: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          cocktail_name: string;
          alcohol_category: string;
          mood_tags?: string[];
          flavor_profile: string;
          emotional_tags?: string[];
          atmosphere_tags?: string[];
          description?: string;
          square_checkout_url: string;
          image_url?: string | null;
          food_pairings?: string[];
          food_name?: string | null;
          food_image_url?: string | null;
          priority_score?: number;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["cocktail_recommendations"]["Insert"]>;
        Relationships: [];
      };
      user_sessions: {
        Row: {
          id: string;
          profile_id: string;
          route: string;
          session_duration_seconds: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          route?: string;
          session_duration_seconds?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_sessions"]["Insert"]>;
        Relationships: [];
      };
      mood_results: {
        Row: {
          id: string;
          quiz_session_id: string;
          profile_id: string;
          mood_key: string;
          mood_name: string;
          confidence_score: number;
          secondary_mood_key: string | null;
          secondary_mood_name: string | null;
          emotional_profile: Json;
          flavor_profile: string;
          atmosphere_profile: string;
          recommendation_source: string;
          recommendation_id: string | null;
          recommendation_payload: Json;
          ai_reasoning: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_session_id: string;
          profile_id: string;
          mood_key: string;
          mood_name: string;
          confidence_score: number;
          secondary_mood_key?: string | null;
          secondary_mood_name?: string | null;
          emotional_profile: Json;
          flavor_profile: string;
          atmosphere_profile: string;
          recommendation_source: string;
          recommendation_id?: string | null;
          recommendation_payload: Json;
          ai_reasoning: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["mood_results"]["Insert"]>;
        Relationships: [];
      };
      recommendation_clicks: {
        Row: {
          id: string;
          mood_result_id: string;
          profile_id: string;
          recommendation_id: string | null;
          click_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          mood_result_id: string;
          profile_id: string;
          recommendation_id?: string | null;
          click_type?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["recommendation_clicks"]["Insert"]>;
        Relationships: [];
      };
      feedback_responses: {
        Row: {
          id: string;
          mood_result_id: string;
          profile_id: string;
          response: "absolutely" | "close_enough" | "not_really";
          created_at: string;
        };
        Insert: {
          id?: string;
          mood_result_id: string;
          profile_id: string;
          response: "absolutely" | "close_enough" | "not_really";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["feedback_responses"]["Insert"]>;
        Relationships: [];
      };
      mood_analytics: {
        Row: {
          id: string;
          mood_result_id: string;
          profile_id: string;
          energy_score: number;
          emotional_weight: number;
          social_score: number;
          mental_clarity: number;
          behavioral_intent: number;
          flavor_preference: number;
          atmosphere_preference: number;
          recommendation_clicked: boolean;
          purchase_initiated: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          mood_result_id: string;
          profile_id: string;
          energy_score: number;
          emotional_weight: number;
          social_score: number;
          mental_clarity: number;
          behavioral_intent: number;
          flavor_preference: number;
          atmosphere_preference: number;
          recommendation_clicked?: boolean;
          purchase_initiated?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["mood_analytics"]["Insert"]>;
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
      media_assets: {
        Row: {
          id: string;
          label: string;
          slug: string;
          public_url: string;
          storage_path: string;
          kind: "drink" | "food" | "general";
          created_at: string;
        };
        Insert: {
          id?: string;
          label: string;
          slug: string;
          public_url: string;
          storage_path: string;
          kind?: "drink" | "food" | "general";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["media_assets"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      registered_email_exists: {
        Args: { lookup_email: string };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
