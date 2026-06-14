"use server";

import { revalidatePath } from "next/cache";

import { personaToCareRecipientUpdate } from "@/lib/data/persona-map";
import { ensureCareContext } from "@/lib/data/care-context";
import type { PersonaCuidada } from "@/lib/persona-cuidada-types";
import { createClient } from "@/lib/supabase/server";
import { parseInput } from "@/lib/validations/parse";
import { savePersonaCuidadaSchema } from "@/lib/validations/persona-cuidada-schema";

export async function savePersonaCuidada(form: PersonaCuidada): Promise<{ ok: boolean; error?: string }> {
  const ctx = await ensureCareContext();
  if (!ctx) {
    return { ok: false, error: "Sesión requerida." };
  }

  const parsed = parseInput(savePersonaCuidadaSchema, form);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const supabase = await createClient();
  const payload = personaToCareRecipientUpdate(parsed.data as PersonaCuidada);

  const { error } = await supabase.from("care_recipients").update(payload).eq("id", ctx.careRecipientId);

  if (error) {
    console.error("savePersonaCuidada", error);
    if (error.code === "23505") {
      return {
        ok: false,
        error:
          "Ese DNI ya pertenece a otro adulto mayor registrado. Verificá el número.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/persona-cuidada");
  return { ok: true };
}
