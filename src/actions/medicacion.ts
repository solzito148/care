"use server";

import { revalidatePath } from "next/cache";

import { isUuid } from "@/lib/data/medicacion";
import { ensureCareContext } from "@/lib/data/care-context";
import type { ActiveMedication } from "@/lib/medicacion-types";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

function parseHorarios(horarios: string): string[] {
  const raw = horarios
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!raw.length) return ["08:00:00"];
  return raw.map((t) => {
    const m = t.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return "08:00:00";
    const h = m[1].padStart(2, "0");
    return `${h}:${m[2]}:00`;
  });
}

export async function upsertMedicationAction(form: ActiveMedication): Promise<{ ok: boolean; error?: string }> {
  const ctx = await ensureCareContext();
  if (!ctx) return { ok: false, error: "Sesion requerida." };

  const supabase = await createClient();
  const metadata = { ui: { ...form } } as Json;
  const insertRow = {
    care_recipient_id: ctx.careRecipientId,
    name: form.nombre,
    dosage: form.dosis,
    instructions: form.indicaciones || null,
    active: form.activo,
    metadata,
  };

  const updateRow = {
    name: form.nombre,
    dosage: form.dosis,
    instructions: form.indicaciones || null,
    active: form.activo,
    metadata,
  };

  let medId = form.id;

  if (isUuid(form.id)) {
    const { error } = await supabase.from("medications").update(updateRow).eq("id", form.id);
    if (error) {
      console.error("upsertMedication update", error);
      return { ok: false, error: error.message };
    }
  } else {
    const { data, error } = await supabase.from("medications").insert(insertRow).select("id").single();
    if (error || !data) {
      console.error("upsertMedication insert", error);
      return { ok: false, error: error?.message ?? "No se pudo crear." };
    }
    medId = data.id;
  }

  await supabase.from("medication_schedules").delete().eq("medication_id", medId);

  const times = parseHorarios(form.horarios);
  const start = form.fechaInicio || new Date().toISOString().slice(0, 10);
  const end = form.fechaFin?.trim() ? form.fechaFin : null;

  const rows = times.map((time_of_day) => ({
    medication_id: medId,
    frequency: form.frecuencia || "diaria",
    time_of_day,
    start_date: start,
    end_date: end,
  }));

  if (rows.length) {
    const { error: schErr } = await supabase.from("medication_schedules").insert(rows);
    if (schErr) {
      console.error("upsertMedication schedules", schErr);
      return { ok: false, error: schErr.message };
    }
  }

  revalidatePath("/medicacion");
  return { ok: true };
}

export async function registerIntakeAction(
  scheduleId: string,
  status: "taken" | "skipped"
): Promise<{ ok: boolean; error?: string }> {
  const ctx = await ensureCareContext();
  if (!ctx) return { ok: false, error: "Sesion requerida." };
  if (!isUuid(scheduleId)) return { ok: false, error: "Horario invalido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("medication_intakes").insert({
    schedule_id: scheduleId,
    status,
    taken_at: status === "taken" ? new Date().toISOString() : null,
    created_by: user?.id ?? null,
  });

  if (error) {
    console.error("registerIntake", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/medicacion");
  revalidatePath("/persona");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function setMedicationActiveAction(
  medicationId: string,
  activo: boolean
): Promise<{ ok: boolean; error?: string }> {
  const ctx = await ensureCareContext();
  if (!ctx) return { ok: false, error: "Sesion requerida." };
  if (!isUuid(medicationId)) return { ok: false, error: "Id invalido." };

  const supabase = await createClient();
  const { error } = await supabase.from("medications").update({ active: activo }).eq("id", medicationId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/medicacion");
  return { ok: true };
}
