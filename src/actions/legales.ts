"use server";

import { revalidatePath } from "next/cache";

import { ensureCareContext } from "@/lib/data/care-context";
import type { LegalDocStatus, LegalDocType } from "@/lib/legales-types";
import { createClient } from "@/lib/supabase/server";

export type LegalDocumentInput = {
  title: string;
  docType: LegalDocType;
  status: LegalDocStatus;
  responsible: string;
  dueDate: string;
  notes: string;
};

const DOC_TYPES: LegalDocType[] = [
  "poder",
  "directiva-anticipada",
  "curatela",
  "tramite",
  "seguro",
  "otro",
];
const STATUSES: LegalDocStatus[] = ["pendiente", "en-tramite", "vigente", "vencido"];

function dateOrNull(value: string): string | null {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim()) ? value.trim() : null;
}

export async function addLegalDocumentAction(
  form: LegalDocumentInput
): Promise<{ ok: boolean; error?: string }> {
  const context = await ensureCareContext();
  if (!context) return { ok: false, error: "No se pudo determinar el hogar." };

  const title = form.title.trim();
  if (title.length < 2) return { ok: false, error: "Indica un titulo para el documento." };

  const supabase = await createClient();
  const { error } = await supabase.from("legal_documents").insert({
    household_id: context.householdId,
    title,
    doc_type: DOC_TYPES.includes(form.docType) ? form.docType : "otro",
    status: STATUSES.includes(form.status) ? form.status : "pendiente",
    responsible: form.responsible.trim(),
    due_date: dateOrNull(form.dueDate),
    notes: form.notes.trim(),
  });

  if (error) {
    console.error("addLegalDocument", error);
    return {
      ok: false,
      error: error.message.includes("legal_documents")
        ? "Falta la tabla de documentos legales. Ejecuta supabase/phase6.sql."
        : error.message,
    };
  }

  revalidatePath("/legales");
  return { ok: true };
}

export async function setLegalDocumentStatusAction(
  documentId: string,
  status: LegalDocStatus
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesion requerida." };

  if (!STATUSES.includes(status)) return { ok: false, error: "Estado invalido." };

  const { error } = await supabase
    .from("legal_documents")
    .update({ status })
    .eq("id", documentId);

  if (error) {
    console.error("setLegalDocumentStatus", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/legales");
  return { ok: true };
}

export async function deleteLegalDocumentAction(
  documentId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesion requerida." };

  const { error } = await supabase.from("legal_documents").delete().eq("id", documentId);
  if (error) {
    console.error("deleteLegalDocument", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/legales");
  return { ok: true };
}
