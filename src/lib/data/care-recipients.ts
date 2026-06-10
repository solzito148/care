import { ensureCareContext } from "@/lib/data/care-context";
import { createClient } from "@/lib/supabase/server";

export type CareRecipientOption = {
  id: string;
  name: string;
};

export type CareRecipientsState = {
  recipients: CareRecipientOption[];
  activeId: string;
};

/**
 * Personas cuidadas del hogar activo + la seleccionada (segun cookie / fallback).
 * Alimenta el selector del header.
 */
export async function loadCareRecipients(): Promise<CareRecipientsState> {
  const context = await ensureCareContext();
  if (!context) return { recipients: [], activeId: "" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("care_recipients")
    .select("id, full_name, preferred_name")
    .eq("household_id", context.householdId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("loadCareRecipients", error);
    return { recipients: [], activeId: context.careRecipientId };
  }

  const recipients = (data ?? []).map((row) => ({
    id: row.id,
    name: row.preferred_name?.trim() || row.full_name,
  }));

  return { recipients, activeId: context.careRecipientId };
}
