"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

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
  if (!user) return { ok: false, error: "Sesion requerida." };

  const fullName = form.fullName.trim();
  if (fullName.length < 2) return { ok: false, error: "Indica el nombre completo." };

  const locality = form.locality.trim();
  if (!locality) return { ok: false, error: "Indica la localidad." };

  const zones = splitList(form.zones);
  const modalities = splitList(form.modalities);
  const tasks = splitList(form.tasks);
  const experienceYears = Math.max(0, Math.min(60, Number(form.experienceYears) || 0));

  const { data, error } = await supabase
    .from("caregiver_profiles")
    .insert({
      display_initials: initialsOf(fullName),
      full_name: fullName,
      zones,
      locality,
      modalities,
      availability_special: splitList(form.availabilitySpecial),
      experience_years: experienceYears,
      tasks,
      profile_complete: Boolean(zones.length && modalities.length && tasks.length),
      profile_status: "datos-actualizados",
      high_availability: form.highAvailability,
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
  if (!user) return { ok: false, error: "Sesion requerida." };

  if (!form.caregiverId) return { ok: false, error: "Selecciona un cuidador." };
  const recommenderName = form.personaQueRecomienda.trim();
  if (!recommenderName) return { ok: false, error: "Indica quien recomienda." };

  const { error } = await supabase.from("caregiver_recommendations").insert({
    caregiver_profile_id: form.caregiverId,
    recommender_user_id: user.id,
    recommender_name: recommenderName,
    period_from: dateOrNull(form.periodoDesde),
    period_to: dateOrNull(form.periodoHasta),
    zone: form.zonaServicio.trim() || null,
    modality: form.modalidadServicio.trim() || null,
    tasks_summary: form.tareasRealizadas.trim() || null,
    score_general: score(form.calificacionGeneral),
    score_punctuality: score(form.puntualidad),
    score_treatment: score(form.tratoHumano),
    score_responsibility: score(form.responsabilidad),
    score_communication: score(form.comunicacion),
    score_reliability: score(form.confiabilidad),
    comment: form.comentario.trim() || null,
    would_rehire: form.loVolveriaAContratar,
    allow_public: form.autorizaMostrarRecomendacion,
    allow_contact: form.autorizaContactoReferencia,
  });

  if (error) {
    console.error("submitRecommendation", error);
    return {
      ok: false,
      error:
        error.message.includes("caregiver_recommendations")
          ? "Falta la tabla de recomendaciones. Ejecuta supabase/phase3.sql."
          : error.message,
    };
  }

  revalidatePath("/cuidadores");
  revalidatePath(`/cuidadores/${form.caregiverId}`);
  return { ok: true };
}
