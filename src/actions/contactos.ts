"use server";

import { revalidatePath } from "next/cache";

import { ensureCareContext } from "@/lib/data/care-context";
import type { ContactCategory } from "@/lib/contactos-types";
import { createClient } from "@/lib/supabase/server";
import { contactSchema } from "@/lib/validations/contacto-schema";
import { uuidSchema } from "@/lib/validations/common-schema";
import { parseInput } from "@/lib/validations/parse";

export type ContactInput = {
  fullName: string;
  relationship: string;
  category: ContactCategory;
  phone: string;
  email: string;
  notes: string;
  isPrimary: boolean;
};

export async function addContactAction(form: ContactInput): Promise<{ ok: boolean; error?: string }> {
  const context = await ensureCareContext();
  if (!context) return { ok: false, error: "No se pudo determinar el hogar." };

  const parsed = parseInput(contactSchema, form);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const input = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("contacts").insert({
    household_id: context.householdId,
    full_name: input.fullName,
    relationship: input.relationship,
    category: input.category,
    phone: input.phone,
    email: input.email,
    notes: input.notes,
    is_primary: input.isPrimary,
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

  const idParsed = parseInput(uuidSchema, contactId);
  if (!idParsed.ok) return { ok: false, error: idParsed.error };

  const { error } = await supabase.from("contacts").delete().eq("id", idParsed.data);
  if (error) {
    console.error("deleteContact", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/contactos");
  return { ok: true };
}
