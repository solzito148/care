"use server";

import { revalidatePath } from "next/cache";

import { recordAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notify";
import { createClient } from "@/lib/supabase/server";
import {
  caregiverContactKindSchema,
  caregiverProfileSchema,
  recommendationSchema,
} from "@/lib/validations/caregiver-profile-schema";
import { uuidSchema } from "@/lib/validations/common-schema";
import { parseInput } from "@/lib/validations/parse";

export type CreateCaregiverProfileInput = {
  fullName: string;
  locality: string;
  zones: string;
  modalities: string;
  availabilitySpecial: string;
  experienceYears: string;
  tasks: string;
  highAvailability: boolean;
};

function splitList(value: string): string[] {
  return value
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function initialsOf(fullName: string): string {
  return (
    fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((token) => token[0]?.toUpperCase() ?? "")
      .join("") || "CU"
  );
}

export async function createCaregiverProfileAction(
  form: CreateCaregiverProfileInput
): Promise<{ ok: boolean; error?: string; id?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión requerida." };

  const parsed = parseInput(caregiverProfileSchema, form);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const input = parsed.data;

  const zones = splitList(input.zones);
  const modalities = splitList(input.modalities);
  const tasks = splitList(input.tasks);
  const experienceYears = Math.max(0, Math.min(60, Number(input.experienceYears) || 0));

  const { data, error } = await supabase
    .from("caregiver_profiles")
    .insert({
      display_initials: initialsOf(input.fullName),
      full_name: input.fullName,
      zones,
      locality: input.locality,
      modalities,
      availability_special: splitList(input.availabilitySpecial),
      experience_years: experienceYears,
      tasks,
      profile_complete: Boolean(zones.length && modalities.length && tasks.length),
      profile_status: "datos-actualizados",
      high_availability: input.highAvailability,
      last_profile_update: new Date().toISOString().slice(0, 10),
      linked_user_id: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("createCaregiverProfile", error);
    return {
      ok: false,
      error:
        error?.message ??
        "No se pudo crear el perfil. Verifica haber ejecutado supabase/phase3.sql.",
    };
  }

  revalidatePath("/cuidadores");
  return { ok: true, id: data.id };
}

export type SubmitRecommendationInput = {
  caregiverId: string;
  personaQueRecomienda: string;
  periodoDesde: string;
  periodoHasta: string;
  zonaServicio: string;
  modalidadServicio: string;
  tareasRealizadas: string;
  calificacionGeneral: string;
  puntualidad: string;
  tratoHumano: string;
  responsabilidad: string;
  comunicacion: string;
  confiabilidad: string;
  comentario: string;
  loVolveriaAContratar: boolean;
  autorizaMostrarRecomendacion: boolean;
  autorizaContactoReferencia: boolean;
};

function score(value: string): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 5;
  return Math.max(1, Math.min(5, Math.round(n)));
}

function dateOrNull(value: string): string | null {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim()) ? value.trim() : null;
}

export async function submitRecommendationAction(
  form: SubmitRecommendationInput
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión requerida." };

  const parsed = parseInput(recommendationSchema, form);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const input = parsed.data;

  const { error } = await supabase.from("caregiver_recommendations").insert({
    caregiver_profile_id: input.caregiverId,
    recommender_user_id: user.id,
    recommender_name: input.personaQueRecomienda,
    period_from: dateOrNull(input.periodoDesde),
    period_to: dateOrNull(input.periodoHasta),
    zone: input.zonaServicio || null,
    modality: input.modalidadServicio || null,
    tasks_summary: input.tareasRealizadas || null,
    score_general: score(input.calificacionGeneral),
    score_punctuality: score(input.puntualidad),
    score_treatment: score(input.tratoHumano),
    score_responsibility: score(input.responsabilidad),
    score_communication: score(input.comunicacion),
    score_reliability: score(input.confiabilidad),
    comment: input.comentario || null,
    would_rehire: input.loVolveriaAContratar,
    allow_public: input.autorizaMostrarRecomendacion,
    allow_contact: input.autorizaContactoReferencia,
  });

  if (error) {
    console.error("submitRecommendation", error);
    return {
      ok: false,
      error:
        error.message.includes("caregiver_recommendations")
          ? "Falta la tabla de recomendaciones. Ejecutá supabase/phase3.sql."
          : error.message,
    };
  }

  revalidatePath("/cuidadores");
  revalidatePath(`/cuidadores/${input.caregiverId}`);
  return { ok: true };
}

/**
 * El cuidador (dueno del perfil) confirma que sus datos estan vigentes.
 * Persiste la fecha y deja traza de auditoria. Solo el propio cuidador puede.
 */
export async function confirmCaregiverDataUpdatedAction(
  caregiverId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión requerida." };

  const idParsed = parseInput(uuidSchema, caregiverId);
  if (!idParsed.ok) return { ok: false, error: idParsed.error };

  const { data, error } = await supabase
    .from("caregiver_profiles")
    .update({
      data_updated: true,
      profile_status: "datos-actualizados",
      last_profile_update: new Date().toISOString().slice(0, 10),
    })
    .eq("id", idParsed.data)
    .eq("linked_user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("confirmCaregiverDataUpdated", error);
    return { ok: false, error: error.message };
  }
  if (!data) {
    return { ok: false, error: "Solo el cuidador dueño del perfil puede confirmar sus datos." };
  }

  await recordAuditLog({
    entityType: "caregiver_profile",
    entityId: idParsed.data,
    action: "caregiver_data_confirmed",
  });

  revalidatePath(`/cuidadores/${idParsed.data}`);
  revalidatePath("/cuidadores");
  return { ok: true };
}

/**
 * Un tutor solicita contacto o entrevista con un cuidador. Como el contacto se
 * media a traves de CARE (no exponemos telefonos directos), registramos la
 * solicitud y notificamos al tutor que quedo encolada.
 */
export async function requestCaregiverContactAction(
  caregiverId: string,
  kind: "entrevista" | "contacto"
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión requerida." };

  const idParsed = parseInput(uuidSchema, caregiverId);
  if (!idParsed.ok) return { ok: false, error: idParsed.error };
  const kindParsed = parseInput(caregiverContactKindSchema, kind);
  if (!kindParsed.ok) return { ok: false, error: kindParsed.error };

  await recordAuditLog({
    entityType: "caregiver_profile",
    entityId: idParsed.data,
    action:
      kindParsed.data === "entrevista"
        ? "caregiver_interview_requested"
        : "caregiver_contact_requested",
  });

  await createNotification({
    userId: user.id,
    title:
      kindParsed.data === "entrevista"
        ? "Solicitud de entrevista enviada"
        : "Solicitud de contacto enviada",
    body: "El equipo CARE coordina el contacto con el cuidador y te avisa por este medio.",
    kind: "info",
    href: `/cuidadores/${idParsed.data}`,
  });

  revalidatePath(`/cuidadores/${idParsed.data}`);
  return { ok: true };
}
