import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];

export async function loadNotifications(limit = 10): Promise<NotificationRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("loadNotifications", error);
    return [];
  }

  return (data ?? []) as NotificationRow[];
}
