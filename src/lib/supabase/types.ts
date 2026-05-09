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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
