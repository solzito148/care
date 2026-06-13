"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validations/common-schema";
import { parseInput } from "@/lib/validations/parse";

export async function markNotificationReadAction(
  notificationId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión requerida." };

  const idParsed = parseInput(uuidSchema, notificationId);
  if (!idParsed.ok) return { ok: false, error: idParsed.error };

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", idParsed.data)
    .eq("user_id", user.id);

  if (error) {
    console.error("markNotificationRead", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/mi-cuenta");
  revalidatePath("/dashboard");
  return { ok: true };
}
