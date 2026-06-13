"use server";

import { revalidatePath } from "next/cache";

import { ensureCareContext } from "@/lib/data/care-context";
import type { LegalDocStatus, LegalDocType } from "@/lib/legales-types";
import { createClient } from "@/lib/supabase/server";
import {
  legalDocStatusSchema,
  legalDocumentSchema,
} from "@/lib/validations/legal-schema";
import { uuidSchema } from "@/lib/validations/common-schema";
import { parseInput } from "@/lib/validations/parse";

export type LegalDocumentInput = {
  title: string;
  docType: LegalDocType;
  status: LegalDocStatus;
  responsible: string;
  dueDate: string;
  notes: string;
};

function dateOrNull(value: string): string | null {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim()) ? value.trim() : null;
}

export async function addLegalDocumentAction(
  form: LegalDocumentInput
): Promise<{ ok: boolean; error?: string }> {
  const context = await ensureCareContext();
  if (!context) return { ok: false, error: "No se pudo determinar el hogar." };

  const parsed = parseInput(legalDocumentSchema, form);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const input = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("legal_documents").insert({
    household_id: context.householdId,
    title: input.title,
    doc_type: input.docType,
    status: input.status,
    responsible: input.responsible,
    due_date: dateOrNull(input.dueDate),
    notes: input.notes,
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

  const idParsed = parseInput(uuidSchema, documentId);
  if (!idParsed.ok) return { ok: false, error: idParsed.error };
  const statusParsed = parseInput(legalDocStatusSchema, status);
  if (!statusParsed.ok) return { ok: false, error: statusParsed.error };

  const { error } = await supabase
    .from("legal_documents")
    .update({ status: statusParsed.data })
    .eq("id", idParsed.data);

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

  const idParsed = parseInput(uuidSchema, documentId);
  if (!idParsed.ok) return { ok: false, error: idParsed.error };

  const { error } = await supabase.from("legal_documents").delete().eq("id", idParsed.data);
  if (error) {
    console.error("deleteLegalDocument", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/legales");
  return { ok: true };
}
