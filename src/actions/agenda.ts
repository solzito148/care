"use server";

import { revalidatePath } from "next/cache";

import { ensureCareContext } from "@/lib/data/care-context";
import { createNotification } from "@/lib/notify";
import { createClient } from "@/lib/supabase/server";
import {
  appointmentStatusSchema,
  createAppointmentSchema,
} from "@/lib/validations/agenda-schema";
import { uuidSchema } from "@/lib/validations/common-schema";
import { parseInput } from "@/lib/validations/parse";
import type { z } from "zod";

export type CreateAppointmentInput = {
  titulo: string;
  profesional: string;
  lugar: string;
  fecha: string;
  hora: string;
  notas: string;
  /**
   * Resultado de `new Date().getTimezoneOffset()` en el cliente.
   * Positivo si el cliente esta detras de UTC (ej: AR = 180 minutos).
   * Sin esto, el server (UTC en Vercel) malinterpretaria la hora local del usuario.
   */
  tzOffsetMinutes: number;
};

export async function createAppointmentAction(
  form: CreateAppointmentInput
): Promise<{ ok: boolean; error?: string }> {
  const ctx = await ensureCareContext();
  if (!ctx) return { ok: false, error: "Sesion requerida." };

  const parsed = parseInput(createAppointmentSchema, form);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const input = parsed.data;

  const [, yyyy, mm, dd] = input.fecha.match(/^(\d{4})-(\d{2})-(\d{2})$/)!;
  const timeMatch = input.hora.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  const hh = timeMatch ? Number(timeMatch[1]) : 0;
  const mi = timeMatch ? Number(timeMatch[2]) : 0;
  const tzOffset = input.tzOffsetMinutes;

  const utcMs =
    Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd), hh, mi) +
    tzOffset * 60 * 1000;
  const starts = new Date(utcMs);

  if (Number.isNaN(starts.getTime())) {
    return { ok: false, error: "Fecha u hora invalida." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const title = input.titulo || "Turno";
  const { error } = await supabase.from("appointments").insert({
    care_recipient_id: ctx.careRecipientId,
    title,
    provider_name: input.profesional || null,
    location: input.lugar || null,
    starts_at: starts.toISOString(),
    status: "scheduled",
    notes: input.notas || null,
  });

  if (error) {
    console.error("createAppointment", error);
    return { ok: false, error: error.message };
  }

  if (user) {
    const whenLabel = starts.toLocaleString("es-AR", { dateStyle: "full", timeStyle: "short" });
    await createNotification({
      userId: user.id,
      title: `Turno agendado: ${title}`,
      body: `Quedo registrado para el ${whenLabel}.`,
      kind: "info",
      href: "/turnos",
      channels: user.email ? { email: user.email } : undefined,
    });
  }

  revalidatePath("/agenda");
  revalidatePath("/turnos");
  return { ok: true };
}

export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>;

export async function updateAppointmentStatusAction(
  appointmentId: string,
  status: AppointmentStatus
): Promise<{ ok: boolean; error?: string }> {
  const ctx = await ensureCareContext();
  if (!ctx) return { ok: false, error: "Sesion requerida." };

  const idParsed = parseInput(uuidSchema, appointmentId);
  if (!idParsed.ok) return { ok: false, error: idParsed.error };
  const statusParsed = parseInput(appointmentStatusSchema, status);
  if (!statusParsed.ok) return { ok: false, error: statusParsed.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("appointments")
    .update({ status: statusParsed.data })
    .eq("id", idParsed.data)
    .eq("care_recipient_id", ctx.careRecipientId);

  if (error) {
    console.error("updateAppointmentStatus", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/agenda");
  revalidatePath("/turnos");
  revalidatePath("/dashboard");
  return { ok: true };
}
