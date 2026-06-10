"use server";

import { revalidatePath } from "next/cache";

import { ensureCareContext } from "@/lib/data/care-context";
import { createNotification } from "@/lib/notify";
import { createClient } from "@/lib/supabase/server";

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

  const fecha = form.fecha.trim();
  const hora = form.hora.trim();
  if (!fecha || !hora) {
    return { ok: false, error: "Indica fecha y hora." };
  }

  const dateMatch = fecha.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timeMatch = hora.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!dateMatch || !timeMatch) {
    return { ok: false, error: "Fecha u hora invalida." };
  }

  const [, yyyy, mm, dd] = dateMatch;
  const [, hh, mi] = timeMatch;
  const tzOffset = Number.isFinite(form.tzOffsetMinutes) ? form.tzOffsetMinutes : 0;

  const utcMs =
    Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(mi)) +
    tzOffset * 60 * 1000;
  const starts = new Date(utcMs);

  if (Number.isNaN(starts.getTime())) {
    return { ok: false, error: "Fecha u hora invalida." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const title = form.titulo.trim() || "Turno";
  const { error } = await supabase.from("appointments").insert({
    care_recipient_id: ctx.careRecipientId,
    title,
    provider_name: form.profesional.trim() || null,
    location: form.lugar.trim() || null,
    starts_at: starts.toISOString(),
    status: "scheduled",
    notes: form.notas.trim() || null,
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

export type AppointmentStatus = "scheduled" | "confirmed" | "done" | "cancelled";

const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "scheduled",
  "confirmed",
  "done",
  "cancelled",
];

export async function updateAppointmentStatusAction(
  appointmentId: string,
  status: AppointmentStatus
): Promise<{ ok: boolean; error?: string }> {
  const ctx = await ensureCareContext();
  if (!ctx) return { ok: false, error: "Sesion requerida." };
  if (!APPOINTMENT_STATUSES.includes(status)) {
    return { ok: false, error: "Estado invalido." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", appointmentId)
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
