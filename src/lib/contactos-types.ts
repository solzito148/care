import type { Database } from "@/lib/supabase/types";

export type ContactRow = Database["public"]["Tables"]["contacts"]["Row"];
export type ContactCategory = ContactRow["category"];

export const CONTACT_CATEGORY_LABELS: Record<ContactCategory, string> = {
  familia: "Familia",
  medico: "Medico / salud",
  emergencia: "Emergencia",
  servicio: "Servicio",
  otro: "Otro",
};
