"use server";

import { revalidatePath } from "next/cache";

import { ensureCareContext } from "@/lib/data/care-context";
import type { ContactCategory } from "@/lib/contactos-types";
import { createClient } from "@/lib/supabase/server";

export type ContactInput = {
  fullName: string;
  relationship: string;
  category: ContactCategory;
  phone: string;
  email: string;
  notes: string;
  isPrimary: boolean;
};

const CATEGORIES: ContactCategory[] = ["familia", "medico", "emergencia", "servicio", "otro"];

export async function addContactAction(form: ContactInput): Promise<{ ok: boolean; error?: string }> {
  const context = await ensureCareContext();
  if (!context) return { ok: false, error: "No se pudo determinar el hogar." };

  const fullName = form.fullName.trim();
  if (fullName.length < 2) return { ok: false, error: "Indica el nombre del contacto." };
  const category = CATEGORIES.includes(form.category) ? form.category : "otro";

  const supabase = await createClient();
  const { error } = await supabase.from("contacts").insert({
    household_id: context.householdId,
    full_name: fullName,
    relationship: form.relationship.trim(),
    category,
    phone: form.phone.trim(),
    email: form.email.trim(),
    notes: form.notes.trim(),
    is_primary: form.isPrimary,
  });

  if (error) {
    console.error("addContact", error);
    return {
      ok: false,
      error: error.message.includes("contacts")
        ? "Falta la tabla de contactos. Ejecuta supabase/phase6.sql."
        : error.message,
    };
  }

  revalidatePath("/contactos");
  return { ok: true };
}

export async function deleteContactAction(contactId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesion requerida." };

  const { error } = await supabase.from("contacts").delete().eq("id", contactId);
  if (error) {
    console.error("deleteContact", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/contactos");
  return { ok: true };
}
