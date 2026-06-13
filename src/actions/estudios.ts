"use server";

import { revalidatePath } from "next/cache";

import { ensureCareContext } from "@/lib/data/care-context";
import type { StudyStatus } from "@/lib/data/estudios";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { createStudySchema } from "@/lib/validations/estudio-schema";
import { parseInput } from "@/lib/validations/parse";

export type CreateStudyInput = {
  title: string;
  studyType: string;
  doctor: string;
  fecha: string;
  hora: string;
  preparationNotes: string;
  /** new Date().getTimezoneOffset() en el cliente */
  tzOffsetMinutes: number;
};

const STUDY_STATUSES: StudyStatus[] = [
  "pending",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
];

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

// Whitelist de adjuntos de estudios: documentos e imagenes medicas. Se valida
// tanto el MIME declarado como la extension para rechazar ejecutables.
const ALLOWED_ATTACHMENT_TYPES: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

function isAllowedAttachment(file: File): boolean {
  const allowedExts = ALLOWED_ATTACHMENT_TYPES[file.type];
  if (!allowedExts) return false;
  const lowerName = file.name.toLowerCase();
  return allowedExts.some((ext) => lowerName.endsWith(ext));
}

function buildScheduledAt(
  fecha: string,
  hora: string,
  tzOffsetMinutes: number
): string | null {
  const dateMatch = fecha.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateMatch) return null;
  const timeMatch = hora.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  const [, yyyy, mm, dd] = dateMatch;
  const hh = timeMatch ? Number(timeMatch[1]) : 9;
  const mi = timeMatch ? Number(timeMatch[2]) : 0;
  const tz = Number.isFinite(tzOffsetMinutes) ? tzOffsetMinutes : 0;
  const utcMs =
    Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd), hh, mi) + tz * 60 * 1000;
  const d = new Date(utcMs);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export async function createStudyAction(
  form: CreateStudyInput
): Promise<{ ok: boolean; error?: string }> {
  const ctx = await ensureCareContext();
  if (!ctx) return { ok: false, error: "Sesion requerida." };

  const parsed = parseInput(createStudySchema, form);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const input = parsed.data;

  const scheduledAt = input.fecha
    ? buildScheduledAt(input.fecha, input.hora, input.tzOffsetMinutes)
    : null;

  const supabase = await createClient();
  const { error } = await supabase.from("medical_studies").insert({
    care_recipient_id: ctx.careRecipientId,
    title: input.title,
    study_type: input.studyType || null,
    prescribing_doctor: input.doctor || null,
    scheduled_at: scheduledAt,
    preparation_notes: input.preparationNotes || null,
    status: scheduledAt ? "scheduled" : "pending",
  });

  if (error) {
    console.error("createStudy", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/estudios");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateStudyStatusAction(
  studyId: string,
  status: StudyStatus,
  resultSummary?: string
): Promise<{ ok: boolean; error?: string }> {
  const ctx = await ensureCareContext();
  if (!ctx) return { ok: false, error: "Sesion requerida." };
  if (!STUDY_STATUSES.includes(status)) {
    return { ok: false, error: "Estado invalido." };
  }

  const supabase = await createClient();
  const update: Database["public"]["Tables"]["medical_studies"]["Update"] = {
    status,
  };
  if (status === "completed") {
    update.completed_at = new Date().toISOString();
  }
  if (resultSummary !== undefined) {
    update.result_summary = resultSummary.trim() || null;
  }

  const { error } = await supabase
    .from("medical_studies")
    .update(update)
    .eq("id", studyId)
    .eq("care_recipient_id", ctx.careRecipientId);

  if (error) {
    console.error("updateStudyStatus", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/estudios");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function uploadStudyAttachmentAction(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const ctx = await ensureCareContext();
  if (!ctx) return { ok: false, error: "Sesion requerida." };

  const studyId = formData.get("studyId");
  const file = formData.get("file");

  if (typeof studyId !== "string" || !studyId) {
    return { ok: false, error: "Estudio invalido." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Selecciona un archivo." };
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return { ok: false, error: "El archivo supera los 10 MB." };
  }
  if (!isAllowedAttachment(file)) {
    return { ok: false, error: "Formato no permitido. Sube un PDF o una imagen (JPG, PNG, WEBP)." };
  }

  const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(-80);
  const path = `${ctx.careRecipientId}/${crypto.randomUUID()}-${safeName}`;

  const supabase = await createClient();
  const { error: uploadErr } = await supabase.storage
    .from("estudios")
    .upload(path, file, { contentType: file.type });

  if (uploadErr) {
    console.error("uploadStudyAttachment", uploadErr);
    return {
      ok: false,
      error:
        "No se pudo subir el archivo. Verifica que el bucket 'estudios' exista (supabase/phase3.sql).",
    };
  }

  const { error: updateErr } = await supabase
    .from("medical_studies")
    .update({ attachment_url: path })
    .eq("id", studyId)
    .eq("care_recipient_id", ctx.careRecipientId);

  if (updateErr) {
    console.error("uploadStudyAttachment update", updateErr);
    return { ok: false, error: updateErr.message };
  }

  revalidatePath("/estudios");
  return { ok: true };
}
