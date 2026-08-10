import type { SupabaseClient } from "@supabase/supabase-js";

export type Json
  = | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      entities: {
        Row: {
          created_at: string;
          id: number;
          kind: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          kind: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          kind?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      entity_metadata: {
        Row: {
          data: Json;
          entity_id: number;
          updated_at: string;
        };
        Insert: {
          data: Json;
          entity_id: number;
          updated_at?: string;
        };
        Update: {
          data?: Json;
          entity_id?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "entity_metadata_entity_id_fkey";
            columns: ["entity_id"];
            isOneToOne: true;
            referencedRelation: "entities";
            referencedColumns: ["id"];
          },
        ];
      };
      relationships: {
        Row: {
          child_entity_id: number;
          created_at: string;
          id: number;
          parent_entity_id: number;
          relationship_type: string;
        };
        Insert: {
          child_entity_id: number;
          created_at?: string;
          id?: number;
          parent_entity_id: number;
          relationship_type: string;
        };
        Update: {
          child_entity_id?: number;
          created_at?: string;
          id?: number;
          parent_entity_id?: number;
          relationship_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "relationships_child_entity_id_fkey";
            columns: ["child_entity_id"];
            isOneToOne: false;
            referencedRelation: "entities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "relationships_parent_entity_id_fkey";
            columns: ["parent_entity_id"];
            isOneToOne: false;
            referencedRelation: "entities";
            referencedColumns: ["id"];
          },
        ];
      };
      source_identities: {
        Row: {
          created_at: string;
          entity_id: number;
          external_id: string;
          id: number;
          source: string;
        };
        Insert: {
          created_at?: string;
          entity_id: number;
          external_id: string;
          id?: number;
          source: string;
        };
        Update: {
          created_at?: string;
          entity_id?: number;
          external_id?: string;
          id?: number;
          source?: string;
        };
        Relationships: [
          {
            foreignKeyName: "source_identities_entity_id_fkey";
            columns: ["entity_id"];
            isOneToOne: false;
            referencedRelation: "entities";
            referencedColumns: ["id"];
          },
        ];
      };
      source_identity_sync_state: {
        Row: {
          last_error: string | null;
          last_sync_status: string | null;
          last_synced_at: string | null;
          source_identity_id: number;
        };
        Insert: {
          last_error?: string | null;
          last_sync_status?: string | null;
          last_synced_at?: string | null;
          source_identity_id: number;
        };
        Update: {
          last_error?: string | null;
          last_sync_status?: string | null;
          last_synced_at?: string | null;
          source_identity_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "source_identity_sync_state_source_identity_id_fkey";
            columns: ["source_identity_id"];
            isOneToOne: true;
            referencedRelation: "source_identities";
            referencedColumns: ["id"];
          },
        ];
      };
      source_syncs: {
        Row: {
          error_message: string | null;
          finished_at: string | null;
          id: number;
          source: string;
          started_at: string;
          stats: Json | null;
          status: string;
        };
        Insert: {
          error_message?: string | null;
          finished_at?: string | null;
          id?: number;
          source: string;
          started_at?: string;
          stats?: Json | null;
          status: string;
        };
        Update: {
          error_message?: string | null;
          finished_at?: string | null;
          id?: number;
          source?: string;
          started_at?: string;
          stats?: Json | null;
          status?: string;
        };
        Relationships: [];
      };
      time_state: {
        Row: {
          entity_id: number;
          total_seconds: number;
          updated_at: string;
        };
        Insert: {
          entity_id: number;
          total_seconds?: number;
          updated_at?: string;
        };
        Update: {
          entity_id?: number;
          total_seconds?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "time_state_entity_id_fkey";
            columns: ["entity_id"];
            isOneToOne: true;
            referencedRelation: "entities";
            referencedColumns: ["id"];
          },
        ];
      };
      trackable_state: {
        Row: {
          entity_id: number;
          finished_at: string | null;
          progress: number | null;
          started_at: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          entity_id: number;
          finished_at?: string | null;
          progress?: number | null;
          started_at?: string | null;
          status: string;
          updated_at?: string;
        };
        Update: {
          entity_id?: number;
          finished_at?: string | null;
          progress?: number | null;
          started_at?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "trackable_state_entity_id_fkey";
            columns: ["entity_id"];
            isOneToOne: true;
            referencedRelation: "entities";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      [_ in never]: never
    };
    Enums: {
      [_ in never]: never
    };
    CompositeTypes: {
      [_ in never]: never
    };
  };
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"]
    & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"]
    & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
  ? R
  : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I;
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I;
  }
  ? I
  : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U;
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U;
  }
  ? U
  : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;

export type TrackerDatabase = SupabaseClient<Database>;
