"use server";

import { revalidatePath } from "next/cache";

import { personaToCareRecipientUpdate } from "@/lib/data/persona-map";
import { ensureCareContext } from "@/lib/data/care-context";
import type { PersonaCuidada } from "@/lib/persona-cuidada-types";
import { createClient } from "@/lib/supabase/server";

export async function savePersonaCuidada(form: PersonaCuidada): Promise<{ ok: boolean; error?: string }> {
  const ctx = await ensureCareContext();
  if (!ctx) {
    return { ok: false, error: "Sesion requerida." };
  }

  const supabase = await createClient();
  const payload = personaToCareRecipientUpdate(form);

  const { error } = await supabase.from("care_recipients").update(payload).eq("id", ctx.careRecipientId);

  if (error) {
    console.error("savePersonaCuidada", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/persona-cuidada");
  return { ok: true };
}
