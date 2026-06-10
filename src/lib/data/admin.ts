import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type RecommendationRow = Database["public"]["Tables"]["caregiver_recommendations"]["Row"];
type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
type ItemRow = Database["public"]["Tables"]["marketplace_items"]["Row"];
type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];
type CaregiverProfileRow = Database["public"]["Tables"]["caregiver_profiles"]["Row"];

export type CaregiverUpdateStatus = {
  id: string;
  fullName: string;
  profileStatus: CaregiverProfileRow["profile_status"];
  lastProfileUpdate: string | null;
  linkedUserId: string | null;
};

export type AdminRecommendation = RecommendationRow & {
  caregiverName: string;
};

export type AdminOverview = {
  pendingRecommendations: number;
  blockedServices: number;
  blockedItems: number;
  pendingSubscriptions: number;
  activeSubscriptions: number;
};

export async function listPendingRecommendations(): Promise<AdminRecommendation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("caregiver_recommendations")
    .select("*")
    .eq("status", "pendiente-revision")
    .order("created_at", { ascending: true });

  if (error || !data?.length) {
    if (error) console.error("listPendingRecommendations", error);
    return [];
  }

  const rows = data as RecommendationRow[];
  const profileIds = [...new Set(rows.map((r) => r.caregiver_profile_id))];
  const { data: profiles } = await supabase
    .from("caregiver_profiles")
    .select("id, full_name")
    .in("id", profileIds);

  const names = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return rows.map((row) => ({
    ...row,
    caregiverName: names.get(row.caregiver_profile_id) ?? "Cuidador",
  }));
}

export async function listAllServices(): Promise<ServiceRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("listAllServices", error);
    return [];
  }
  return (data ?? []) as ServiceRow[];
}

export async function listAllMarketplaceItems(): Promise<ItemRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketplace_items")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("listAllMarketplaceItems", error);
    return [];
  }
  return (data ?? []) as ItemRow[];
}

export async function listAllSubscriptions(): Promise<SubscriptionRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("listAllSubscriptions", error);
    return [];
  }
  return (data ?? []) as SubscriptionRow[];
}

/** Cuidadores cuyo perfil no esta marcado como actualizado (para recordatorios). */
export async function listCaregiversNeedingUpdate(): Promise<CaregiverUpdateStatus[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("caregiver_profiles")
    .select("id, full_name, profile_status, last_profile_update, linked_user_id")
    .neq("profile_status", "datos-actualizados")
    .order("last_profile_update", { ascending: true });

  if (error) {
    console.error("listCaregiversNeedingUpdate", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    profileStatus: row.profile_status,
    lastProfileUpdate: row.last_profile_update,
    linkedUserId: row.linked_user_id,
  }));
}

export function buildAdminOverview(
  recommendations: AdminRecommendation[],
  services: ServiceRow[],
  items: ItemRow[],
  subscriptions: SubscriptionRow[]
): AdminOverview {
  return {
    pendingRecommendations: recommendations.length,
    blockedServices: services.filter((s) => s.status === "bloqueado").length,
    blockedItems: items.filter((i) => i.status === "bloqueado").length,
    pendingSubscriptions: subscriptions.filter((s) => s.status === "pendiente-pago").length,
    activeSubscriptions: subscriptions.filter((s) => s.status === "activa").length,
  };
}
