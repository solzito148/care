"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { ACTIVE_RECIPIENT_COOKIE, ensureCareContext } from "@/lib/data/care-context";
import { createClient } from "@/lib/supabase/server";

export type AddCareRecipientInput = {
  fullName: string;
  preferredName: string;
  birthDate: string;
  emergencyNotes: string;
};

function dateOrNull(value: string): string | null {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim()) ? value.trim() : null;
}

export async function addCareRecipientAction(
  form: AddCareRecipientInput
): Promise<{ ok: boolean; error?: string; id?: string }> {
  const context = await ensureCareContext();
  if (!context) return { ok: false, error: "No se pudo determinar el hogar." };

  const fullName = form.fullName.trim();
  if (fullName.length < 2) return { ok: false, error: "Indica el nombre de la persona cuidada." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("care_recipients")
    .insert({
      household_id: context.householdId,
      full_name: fullName,
      preferred_name: form.preferredName.trim() || null,
      birth_date: dateOrNull(form.birthDate),
      emergency_notes: form.emergencyNotes.trim() || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("addCareRecipient", error);
    return { ok: false, error: error?.message ?? "No se pudo crear la persona cuidada." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/persona-cuidada");
  return { ok: true, id: data.id };
}

/** Selecciona la persona cuidada activa (cookie consumida por ensureCareContext). */
export async function setActiveCareRecipientAction(
  recipientId: string
): Promise<{ ok: boolean; error?: string }> {
  const context = await ensureCareContext();
  if (!context) return { ok: false, error: "Sesion requerida." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("care_recipients")
    .select("id")
    .eq("id", recipientId)
    .eq("household_id", context.householdId)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: "Persona cuidada invalida." };
  }

  const store = await cookies();
  store.set(ACTIVE_RECIPIENT_COOKIE, recipientId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/", "layout");
  return { ok: true };
}
