"use server";

import { revalidatePath } from "next/cache";

import { isUuid } from "@/lib/data/medicacion";
import { ensureCareContext } from "@/lib/data/care-context";
import type { ActiveMedication } from "@/lib/medicacion-types";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
import { uuidSchema } from "@/lib/validations/common-schema";
import {
  medicationIntakeStatusSchema,
  upsertMedicationSchema,
} from "@/lib/validations/medicacion-schema";
import { parseInput } from "@/lib/validations/parse";

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

  const parsed = parseInput(upsertMedicationSchema, form);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const input = parsed.data;

  const supabase = await createClient();
  const metadata = { ui: { ...input } } as Json;
  const insertRow = {
    care_recipient_id: ctx.careRecipientId,
    name: input.nombre,
    dosage: input.dosis,
    instructions: input.indicaciones || null,
    active: input.activo,
    metadata,
  };

  const updateRow = {
    name: input.nombre,
    dosage: input.dosis,
    instructions: input.indicaciones || null,
    active: input.activo,
    metadata,
  };

  let medId = input.id;

  if (isUuid(input.id)) {
    const { error } = await supabase.from("medications").update(updateRow).eq("id", input.id);
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

  const times = parseHorarios(input.horarios);
  const start = input.fechaInicio || new Date().toISOString().slice(0, 10);
  const end = input.fechaFin?.trim() ? input.fechaFin : null;

  const rows = times.map((time_of_day) => ({
    medication_id: medId,
    frequency: input.frecuencia || "diaria",
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

  const scheduleParsed = parseInput(uuidSchema, scheduleId);
  if (!scheduleParsed.ok) return { ok: false, error: scheduleParsed.error };
  const statusParsed = parseInput(medicationIntakeStatusSchema, status);
  if (!statusParsed.ok) return { ok: false, error: statusParsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("medication_intakes").insert({
    schedule_id: scheduleParsed.data,
    status: statusParsed.data,
    taken_at: statusParsed.data === "taken" ? new Date().toISOString() : null,
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

  const idParsed = parseInput(uuidSchema, medicationId);
  if (!idParsed.ok) return { ok: false, error: idParsed.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("medications")
    .update({ active: activo })
    .eq("id", idParsed.data);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/medicacion");
  return { ok: true };
}
