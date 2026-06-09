import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type StudyRow = Database["public"]["Tables"]["medical_studies"]["Row"];

export type StudyStatus = StudyRow["status"];

export type StudyItem = {
  id: string;
  title: string;
  studyType: string | null;
  doctor: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
  preparationNotes: string | null;
  resultSummary: string | null;
  /** path interno en el bucket "estudios" */
  attachmentPath: string | null;
  /** URL firmada de corta duracion para descargar el adjunto */
  attachmentSignedUrl: string | null;
  status: StudyStatus;
};

const SIGNED_URL_SECONDS = 60 * 30;

export async function loadStudies(careRecipientId: string): Promise<StudyItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("medical_studies")
    .select("*")
    .eq("care_recipient_id", careRecipientId)
    .order("scheduled_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("loadStudies", error);
    return [];
  }
  if (!data?.length) return [];

  const rows = data as StudyRow[];

  const paths = rows
    .map((r) => r.attachment_url)
    .filter((p): p is string => Boolean(p));

  const signedByPath = new Map<string, string>();
  if (paths.length) {
    const { data: signed, error: signErr } = await supabase.storage
      .from("estudios")
      .createSignedUrls(paths, SIGNED_URL_SECONDS);
    if (signErr) {
      console.error("loadStudies signed urls", signErr);
    } else {
      for (const s of signed ?? []) {
        if (s.path && s.signedUrl) signedByPath.set(s.path, s.signedUrl);
      }
    }
  }

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    studyType: r.study_type,
    doctor: r.prescribing_doctor,
    scheduledAt: r.scheduled_at,
    completedAt: r.completed_at,
    preparationNotes: r.preparation_notes,
    resultSummary: r.result_summary,
    attachmentPath: r.attachment_url,
    attachmentSignedUrl: r.attachment_url
      ? (signedByPath.get(r.attachment_url) ?? null)
      : null,
    status: r.status,
  }));
}
