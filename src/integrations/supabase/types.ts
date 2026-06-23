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
      approvals: {
        Row: {
          amount: number | null
          amount_original: number | null
          created_at: string
          currency: string | null
          decided_at: string | null
          decided_by: string | null
          fx_rate: number | null
          id: string
          notes: string | null
          source_id: string
          source_type: string
          status: string
          submitter: string | null
          summary: Json | null
          team: string | null
          title: string
        }
        Insert: {
          amount?: number | null
          amount_original?: number | null
          created_at?: string
          currency?: string | null
          decided_at?: string | null
          decided_by?: string | null
          fx_rate?: number | null
          id?: string
          notes?: string | null
          source_id: string
          source_type: string
          status?: string
          submitter?: string | null
          summary?: Json | null
          team?: string | null
          title: string
        }
        Update: {
          amount?: number | null
          amount_original?: number | null
          created_at?: string
          currency?: string | null
          decided_at?: string | null
          decided_by?: string | null
          fx_rate?: number | null
          id?: string
          notes?: string | null
          source_id?: string
          source_type?: string
          status?: string
          submitter?: string | null
          summary?: Json | null
          team?: string | null
          title?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number | null
          amount_inr: number | null
          approval_status: string
          cost_center: string | null
          created_at: string
          currency: string | null
          decided_at: string | null
          decided_by: string | null
          fx_rate: number | null
          gst_amount: number | null
          id: string
          invoice_date: string | null
          invoice_number: string | null
          kind: string
          line_summary: string | null
          party_gstin: string | null
          party_name: string | null
          party_status: string | null
          raw_fields: Json | null
          source_filename: string
          taxable_amount: number | null
        }
        Insert: {
          amount?: number | null
          amount_inr?: number | null
          approval_status?: string
          cost_center?: string | null
          created_at?: string
          currency?: string | null
          decided_at?: string | null
          decided_by?: string | null
          fx_rate?: number | null
          gst_amount?: number | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          kind: string
          line_summary?: string | null
          party_gstin?: string | null
          party_name?: string | null
          party_status?: string | null
          raw_fields?: Json | null
          source_filename: string
          taxable_amount?: number | null
        }
        Update: {
          amount?: number | null
          amount_inr?: number | null
          approval_status?: string
          cost_center?: string | null
          created_at?: string
          currency?: string | null
          decided_at?: string | null
          decided_by?: string | null
          fx_rate?: number | null
          gst_amount?: number | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          kind?: string
          line_summary?: string | null
          party_gstin?: string | null
          party_name?: string | null
          party_status?: string | null
          raw_fields?: Json | null
          source_filename?: string
          taxable_amount?: number | null
        }
        Relationships: []
      }
      pnl_lines: {
        Row: {
          amount: number | null
          created_at: string
          id: number
          line_group: string | null
          line_key: string
          line_label: string
          project_code: string
          project_name: string | null
          segment: string | null
          upload_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          id?: number
          line_group?: string | null
          line_key: string
          line_label: string
          project_code: string
          project_name?: string | null
          segment?: string | null
          upload_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          id?: number
          line_group?: string | null
          line_key?: string
          line_label?: string
          project_code?: string
          project_name?: string | null
          segment?: string | null
          upload_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pnl_lines_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "pnl_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      pnl_meta: {
        Row: {
          created_at: string
          fte_billed: number | null
          fte_onsite: number | null
          fte_paid: number | null
          fte_total: number | null
          id: number
          leave_gratuity_count: number | null
          mgmt_count: number | null
          project_code: string
          seat_utilized: number | null
          total_count_billed: number | null
          upload_id: string
        }
        Insert: {
          created_at?: string
          fte_billed?: number | null
          fte_onsite?: number | null
          fte_paid?: number | null
          fte_total?: number | null
          id?: number
          leave_gratuity_count?: number | null
          mgmt_count?: number | null
          project_code: string
          seat_utilized?: number | null
          total_count_billed?: number | null
          upload_id: string
        }
        Update: {
          created_at?: string
          fte_billed?: number | null
          fte_onsite?: number | null
          fte_paid?: number | null
          fte_total?: number | null
          id?: number
          leave_gratuity_count?: number | null
          mgmt_count?: number | null
          project_code?: string
          seat_utilized?: number | null
          total_count_billed?: number | null
          upload_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pnl_meta_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "pnl_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      pnl_runs: {
        Row: {
          computed: Json
          created_at: string
          id: string
          period: string | null
          published: boolean
          upload_id: string | null
        }
        Insert: {
          computed: Json
          created_at?: string
          id?: string
          period?: string | null
          published?: boolean
          upload_id?: string | null
        }
        Update: {
          computed?: Json
          created_at?: string
          id?: string
          period?: string | null
          published?: boolean
          upload_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pnl_runs_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "pnl_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      pnl_uploads: {
        Row: {
          created_at: string
          filename: string
          id: string
          period: string | null
          persona: string
          project_codes: string[] | null
          raw_json: Json | null
          sheet_kind: string
        }
        Insert: {
          created_at?: string
          filename: string
          id?: string
          period?: string | null
          persona?: string
          project_codes?: string[] | null
          raw_json?: Json | null
          sheet_kind?: string
        }
        Update: {
          created_at?: string
          filename?: string
          id?: string
          period?: string | null
          persona?: string
          project_codes?: string[] | null
          raw_json?: Json | null
          sheet_kind?: string
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
