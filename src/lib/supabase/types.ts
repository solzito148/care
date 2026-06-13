// Tipos minimos hand-rolled de la base de datos publica.
// Mantener en sync con supabase/schema.sql.
// Solo cubren las tablas que ya consumimos desde el frontend (Fase 1 y borrador
// de Fase 2). Ampliar a medida que se sumen modulos.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RoleCode =
  | "admin"
  | "tutor"
  | "caregiver"
  | "professional"
  | "legal_admin"
  | "provider"
  | "care_recipient";

export type AccountTypeCode =
  | "tutor-familiar-encargado"
  | "cuidador"
  | "profesional-salud"
  | "profesional-legal-administrativo"
  | "proveedor-marketplace"
  | "proveedor-servicios";

export type RelationshipType =
  | "caregiver"
  | "professional"
  | "family"
  | "legal"
  | "other";

export type RelationshipStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "revoked";

// Nota: dejamos `Relationships: []` vacio porque modelamos la BD a mano.
// Si en el futuro generamos los tipos con `supabase gen types typescript`,
// se va a poblar automaticamente y los embeds (`tabla!fk(col)`) van a tipar
// correctamente. Mientras tanto, evitar embeds y hacer queries en pasos
// (mirar `lib/permissions.ts`).

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          birth_date: string | null;
          account_type: AccountTypeCode | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          birth_date?: string | null;
          account_type?: AccountTypeCode | null;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]> & {
          updated_at?: string;
        };
        Relationships: [];
      };
      roles: {
        Row: {
          id: string;
          code: RoleCode;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role_id: string;
          created_at: string;
        };
        Insert: { user_id: string; role_id: string };
        Update: never;
        Relationships: [];
      };
      households: {
        Row: {
          id: string;
          name: string;
          owner_user_id: string;
          created_at: string;
        };
        Insert: {
          name: string;
          owner_user_id: string;
        };
        Update: Partial<{ name: string }>;
        Relationships: [];
      };
      household_members: {
        Row: {
          id: string;
          household_id: string;
          user_id: string;
          member_role: "owner" | "family" | "caregiver" | "professional";
          created_at: string;
        };
        Insert: {
          household_id: string;
          user_id: string;
          member_role: "owner" | "family" | "caregiver" | "professional";
        };
        Update: never;
        Relationships: [];
      };
      care_recipients: {
        Row: {
          id: string;
          household_id: string;
          full_name: string;
          preferred_name: string | null;
          birth_date: string | null;
          blood_type: string | null;
          emergency_notes: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          household_id: string;
          full_name: string;
          preferred_name?: string | null;
          birth_date?: string | null;
          blood_type?: string | null;
          emergency_notes?: string | null;
          metadata?: Json;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["care_recipients"]["Insert"], "household_id">> & {
          updated_at?: string;
        };
        Relationships: [];
      };
      medications: {
        Row: {
          id: string;
          care_recipient_id: string;
          name: string;
          dosage: string;
          route: string | null;
          instructions: string | null;
          active: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          care_recipient_id: string;
          name: string;
          dosage: string;
          route?: string | null;
          instructions?: string | null;
          active?: boolean;
          metadata?: Json;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["medications"]["Insert"], "care_recipient_id">>;
        Relationships: [];
      };
      medication_schedules: {
        Row: {
          id: string;
          medication_id: string;
          frequency: string;
          time_of_day: string;
          start_date: string;
          end_date: string | null;
          created_at: string;
        };
        Insert: {
          medication_id: string;
          frequency: string;
          time_of_day: string;
          start_date: string;
          end_date?: string | null;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["medication_schedules"]["Insert"], "medication_id">>;
        Relationships: [];
      };
      medication_intakes: {
        Row: {
          id: string;
          schedule_id: string;
          taken_at: string | null;
          status: "pending" | "taken" | "skipped" | "late";
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          schedule_id: string;
          taken_at?: string | null;
          status: "pending" | "taken" | "skipped" | "late";
          notes?: string | null;
          created_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["medication_intakes"]["Insert"]>;
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          care_recipient_id: string;
          title: string;
          provider_name: string | null;
          location: string | null;
          starts_at: string;
          ends_at: string | null;
          status: "scheduled" | "confirmed" | "done" | "cancelled";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          care_recipient_id: string;
          title: string;
          provider_name?: string | null;
          location?: string | null;
          starts_at: string;
          ends_at?: string | null;
          status?: "scheduled" | "confirmed" | "done" | "cancelled";
          notes?: string | null;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["appointments"]["Insert"], "care_recipient_id">>;
        Relationships: [];
      };
      caregiver_profiles: {
        Row: {
          id: string;
          display_initials: string;
          full_name: string;
          zones: string[];
          locality: string;
          modalities: string[];
          availability_special: string[];
          experience_years: number;
          tasks: string[];
          rating: string;
          profile_complete: boolean;
          references_loaded: boolean;
          references_verified: boolean;
          recommended_care: boolean;
          data_updated: boolean;
          profile_status:
            | "datos-actualizados"
            | "pendiente-actualizacion"
            | "datos-vencidos"
            | "perfil-pausado";
          high_availability: boolean;
          last_profile_update: string | null;
          linked_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          display_initials: string;
          full_name: string;
          zones?: string[];
          locality?: string;
          modalities?: string[];
          availability_special?: string[];
          experience_years?: number;
          tasks?: string[];
          rating?: string;
          profile_complete?: boolean;
          references_loaded?: boolean;
          references_verified?: boolean;
          recommended_care?: boolean;
          data_updated?: boolean;
          profile_status?:
            | "datos-actualizados"
            | "pendiente-actualizacion"
            | "datos-vencidos"
            | "perfil-pausado";
          high_availability?: boolean;
          last_profile_update?: string | null;
          linked_user_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["caregiver_profiles"]["Insert"]>;
        Relationships: [];
      };
      caregiver_reference_entries: {
        Row: {
          id: string;
          caregiver_profile_id: string;
          hirer_name: string;
          zone: string | null;
          period: string | null;
          modality: string | null;
          tasks_summary: string | null;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          caregiver_profile_id: string;
          hirer_name: string;
          zone?: string | null;
          period?: string | null;
          modality?: string | null;
          tasks_summary?: string | null;
          phone?: string | null;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["caregiver_reference_entries"]["Insert"], "caregiver_profile_id">>;
        Relationships: [];
      };
      caregiver_recommendations: {
        Row: {
          id: string;
          caregiver_profile_id: string;
          recommender_user_id: string;
          recommender_name: string;
          period_from: string | null;
          period_to: string | null;
          zone: string | null;
          modality: string | null;
          tasks_summary: string | null;
          score_general: number;
          score_punctuality: number;
          score_treatment: number;
          score_responsibility: number;
          score_communication: number;
          score_reliability: number;
          comment: string | null;
          would_rehire: boolean;
          allow_public: boolean;
          allow_contact: boolean;
          status: "pendiente-revision" | "aprobada" | "rechazada";
          created_at: string;
        };
        Insert: {
          id?: string;
          caregiver_profile_id: string;
          recommender_user_id: string;
          recommender_name: string;
          period_from?: string | null;
          period_to?: string | null;
          zone?: string | null;
          modality?: string | null;
          tasks_summary?: string | null;
          score_general?: number;
          score_punctuality?: number;
          score_treatment?: number;
          score_responsibility?: number;
          score_communication?: number;
          score_reliability?: number;
          comment?: string | null;
          would_rehire?: boolean;
          allow_public?: boolean;
          allow_contact?: boolean;
          status?: "pendiente-revision" | "aprobada" | "rechazada";
        };
        Update: Partial<Omit<Database["public"]["Tables"]["caregiver_recommendations"]["Insert"], "caregiver_profile_id" | "recommender_user_id">>;
        Relationships: [];
      };
      medical_studies: {
        Row: {
          id: string;
          care_recipient_id: string;
          title: string;
          study_type: string | null;
          prescribing_doctor: string | null;
          scheduled_at: string | null;
          completed_at: string | null;
          preparation_notes: string | null;
          result_summary: string | null;
          attachment_url: string | null;
          status: "pending" | "scheduled" | "in_progress" | "completed" | "cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          care_recipient_id: string;
          title: string;
          study_type?: string | null;
          prescribing_doctor?: string | null;
          scheduled_at?: string | null;
          completed_at?: string | null;
          preparation_notes?: string | null;
          result_summary?: string | null;
          attachment_url?: string | null;
          status?: "pending" | "scheduled" | "in_progress" | "completed" | "cancelled";
        };
        Update: Partial<Omit<Database["public"]["Tables"]["medical_studies"]["Insert"], "care_recipient_id">>;
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          owner_user_id: string | null;
          provider_name: string;
          category:
            | "traslados-y-acompanamiento"
            | "desarme-y-organizacion-del-hogar"
            | "adaptacion-del-hogar"
            | "tramites-y-gestiones"
            | "servicios-domiciliarios-complementarios";
          description: string;
          coverage_zone: string;
          availability: string;
          phone_whatsapp: string;
          email: string;
          plan: "Basico" | "Destacado" | "Premium";
          featured: boolean;
          status: "publicado" | "pausado" | "bloqueado";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_user_id?: string | null;
          provider_name: string;
          category: Database["public"]["Tables"]["services"]["Row"]["category"];
          description?: string;
          coverage_zone?: string;
          availability?: string;
          phone_whatsapp?: string;
          email?: string;
          plan?: "Basico" | "Destacado" | "Premium";
          featured?: boolean;
          status?: "publicado" | "pausado" | "bloqueado";
        };
        Update: Partial<Omit<Database["public"]["Tables"]["services"]["Insert"], "owner_user_id">>;
        Relationships: [];
      };
      marketplace_items: {
        Row: {
          id: string;
          owner_user_id: string | null;
          title: string;
          category: string;
          zone: string;
          condition: string;
          price: string | null;
          listing_type: "venta" | "alquiler" | "intercambio" | "donaciones";
          contact_phone: string;
          status: "publicado" | "pausado" | "bloqueado";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_user_id?: string | null;
          title: string;
          category?: string;
          zone?: string;
          condition?: string;
          price?: string | null;
          listing_type: "venta" | "alquiler" | "intercambio" | "donaciones";
          contact_phone?: string;
          status?: "publicado" | "pausado" | "bloqueado";
        };
        Update: Partial<Omit<Database["public"]["Tables"]["marketplace_items"]["Insert"], "owner_user_id">>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          plan_name: string;
          line:
            | "planes-familiares"
            | "profesionales"
            | "proveedores-marketplace"
            | "servicios"
            | "legales-administrativos"
            | "intercambio-donaciones";
          status: "activa" | "pendiente-pago" | "vencida" | "cancelada";
          amount: string;
          billing_cycle: string;
          next_due_date: string | null;
          payment_external_ref: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          plan_name: string;
          line: Database["public"]["Tables"]["subscriptions"]["Row"]["line"];
          status?: "activa" | "pendiente-pago" | "vencida" | "cancelada";
          amount?: string;
          billing_cycle?: string;
          next_due_date?: string | null;
          payment_external_ref?: string | null;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["subscriptions"]["Insert"], "user_id">>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          kind: "info" | "warning" | "urgent" | "billing";
          href: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body?: string;
          kind?: "info" | "warning" | "urgent" | "billing";
          href?: string | null;
          read_at?: string | null;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["notifications"]["Insert"], "user_id">>;
        Relationships: [];
      };
      contacts: {
        Row: {
          id: string;
          household_id: string;
          full_name: string;
          relationship: string;
          category: "familia" | "medico" | "emergencia" | "servicio" | "otro";
          phone: string;
          email: string;
          notes: string;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          full_name: string;
          relationship?: string;
          category?: "familia" | "medico" | "emergencia" | "servicio" | "otro";
          phone?: string;
          email?: string;
          notes?: string;
          is_primary?: boolean;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["contacts"]["Insert"], "household_id">>;
        Relationships: [];
      };
      legal_documents: {
        Row: {
          id: string;
          household_id: string;
          title: string;
          doc_type: "poder" | "directiva-anticipada" | "curatela" | "tramite" | "seguro" | "otro";
          status: "pendiente" | "en-tramite" | "vigente" | "vencido";
          responsible: string;
          due_date: string | null;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          title: string;
          doc_type?: "poder" | "directiva-anticipada" | "curatela" | "tramite" | "seguro" | "otro";
          status?: "pendiente" | "en-tramite" | "vigente" | "vencido";
          responsible?: string;
          due_date?: string | null;
          notes?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["legal_documents"]["Insert"], "household_id">>;
        Relationships: [];
      };
      care_relationships: {
        Row: {
          id: string;
          care_recipient_id: string;
          relationship_type: RelationshipType;
          subject_user_id: string | null;
          subject_name: string | null;
          subject_phone: string | null;
          subject_email: string | null;
          status: RelationshipStatus;
          requested_by: string | null;
          approved_by: string | null;
          approved_at: string | null;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          care_recipient_id: string;
          relationship_type: RelationshipType;
          subject_user_id?: string | null;
          subject_name?: string | null;
          subject_phone?: string | null;
          subject_email?: string | null;
          status?: RelationshipStatus;
          requested_by?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          notes?: string;
        };
        Update: Partial<
          Omit<
            Database["public"]["Tables"]["care_relationships"]["Insert"],
            "care_recipient_id"
          >
        > & { updated_at?: string };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_user_id: string | null;
          entity_type: string;
          entity_id: string | null;
          action: string;
          payload: Json;
          created_at: string;
        };
        Insert: {
          actor_user_id?: string | null;
          entity_type: string;
          entity_id?: string | null;
          action: string;
          payload?: Json;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
