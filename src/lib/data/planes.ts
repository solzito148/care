import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];

/**
 * Suscripcion vigente del usuario: la mas reciente que no este cancelada.
 */
export async function loadCurrentSubscription(): Promise<SubscriptionRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .neq("status", "cancelada")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("loadCurrentSubscription", error);
    return null;
  }

  return (data?.[0] as SubscriptionRow | undefined) ?? null;
}
