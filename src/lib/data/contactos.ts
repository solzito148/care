import { ensureCareContext } from "@/lib/data/care-context";
import { createClient } from "@/lib/supabase/server";
import type { ContactRow } from "@/lib/contactos-types";

export type { ContactRow, ContactCategory } from "@/lib/contactos-types";
export { CONTACT_CATEGORY_LABELS } from "@/lib/contactos-types";

export async function loadContacts(): Promise<ContactRow[]> {
  const context = await ensureCareContext();
  if (!context) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("household_id", context.householdId)
    .order("is_primary", { ascending: false })
    .order("full_name", { ascending: true });

  if (error) {
    console.error("loadContacts", error);
    return [];
  }
  return (data ?? []) as ContactRow[];
}
