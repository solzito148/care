import { ensureCareContext } from "@/lib/data/care-context";
import { createClient } from "@/lib/supabase/server";
import type { LegalDocumentRow } from "@/lib/legales-types";

export type { LegalDocumentRow, LegalDocType, LegalDocStatus } from "@/lib/legales-types";
export { LEGAL_DOC_TYPE_LABELS, LEGAL_DOC_STATUS_LABELS } from "@/lib/legales-types";

export async function loadLegalDocuments(): Promise<LegalDocumentRow[]> {
  const context = await ensureCareContext();
  if (!context) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("legal_documents")
    .select("*")
    .eq("household_id", context.householdId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("loadLegalDocuments", error);
    return [];
  }
  return (data ?? []) as LegalDocumentRow[];
}
