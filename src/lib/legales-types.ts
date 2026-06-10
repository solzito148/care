import type { Database } from "@/lib/supabase/types";

export type LegalDocumentRow = Database["public"]["Tables"]["legal_documents"]["Row"];
export type LegalDocType = LegalDocumentRow["doc_type"];
export type LegalDocStatus = LegalDocumentRow["status"];

export const LEGAL_DOC_TYPE_LABELS: Record<LegalDocType, string> = {
  poder: "Poder",
  "directiva-anticipada": "Directiva anticipada",
  curatela: "Curatela",
  tramite: "Tramite",
  seguro: "Seguro",
  otro: "Otro",
};

export const LEGAL_DOC_STATUS_LABELS: Record<LegalDocStatus, string> = {
  pendiente: "Pendiente",
  "en-tramite": "En tramite",
  vigente: "Vigente",
  vencido: "Vencido",
};
