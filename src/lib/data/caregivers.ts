import { createClient } from "@/lib/supabase/server";

import { profileRowToSearchItem, referenceRowToPublic } from "@/lib/data/caregivers-map";
import type {
  CaregiverApprovedRecommendation,
  CaregiverReferencePublic,
  CaregiverSearchItem,
} from "@/lib/cuidadores-types";
import { tierCapabilities } from "@/lib/professional-tier";
import type { Database } from "@/lib/supabase/types";

type RecommendationRow = Database["public"]["Tables"]["caregiver_recommendations"]["Row"];

type RecommendationStats = { count: number; average: number };

/**
 * Score de ranking CARE: combina el nivel de suscripcion (Premium prioritario,
 * luego Destacado, luego Basico al final), recomendacion CARE (badge), promedio
 * de recomendaciones aprobadas y cantidad de recomendaciones. Mayor es mejor.
 */
export function rankingScore(item: CaregiverSearchItem): number {
  const tierBoost = tierCapabilities(item.tier).rankBoost;
  const careBoost = item.recomendadoCare ? 100 : 0;
  const verifiedBoost = item.referenciasVerificadas ? 10 : 0;
  const avgBoost = item.recomendacionesPromedio * 5;
  const volumeBoost = Math.min(item.recomendacionesCount, 10);
  return tierBoost + careBoost + verifiedBoost + avgBoost + volumeBoost + item.calificacion;
}

async function loadApprovedRecommendationStats(): Promise<Map<string, RecommendationStats>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("caregiver_recommendations")
    .select("caregiver_profile_id, score_general")
    .eq("status", "aprobada")
    .eq("allow_public", true);

  const stats = new Map<string, RecommendationStats>();
  if (error || !data?.length) return stats;

  const sums = new Map<string, { total: number; count: number }>();
  for (const row of data as Pick<RecommendationRow, "caregiver_profile_id" | "score_general">[]) {
    const current = sums.get(row.caregiver_profile_id) ?? { total: 0, count: 0 };
    current.total += row.score_general;
    current.count += 1;
    sums.set(row.caregiver_profile_id, current);
  }

  for (const [id, { total, count }] of sums) {
    stats.set(id, { count, average: count ? total / count : 0 });
  }
  return stats;
}

export async function listCaregiverProfiles(): Promise<CaregiverSearchItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("caregiver_profiles").select("*");

  if (error || !data?.length) return [];

  const stats = await loadApprovedRecommendationStats();

  const items = data.map((row) => {
    const item = profileRowToSearchItem(row);
    const stat = stats.get(item.id);
    if (stat) {
      item.recomendacionesCount = stat.count;
      item.recomendacionesPromedio = Number(stat.average.toFixed(1));
    }
    return item;
  });

  return items.sort((a, b) => rankingScore(b) - rankingScore(a));
}

export async function getCaregiverProfile(id: string): Promise<CaregiverSearchItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("caregiver_profiles").select("*").eq("id", id).maybeSingle();

  if (error || !data) return null;
  return profileRowToSearchItem(data);
}

export async function listCaregiverReferences(caregiverId: string): Promise<CaregiverReferencePublic[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("caregiver_reference_entries")
    .select("*")
    .eq("caregiver_profile_id", caregiverId)
    .order("created_at", { ascending: true });

  if (error || !data?.length) return [];

  return data.map((row) => referenceRowToPublic(row));
}

export async function listApprovedRecommendations(
  caregiverId: string
): Promise<CaregiverApprovedRecommendation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("caregiver_recommendations")
    .select("*")
    .eq("caregiver_profile_id", caregiverId)
    .eq("status", "aprobada")
    .eq("allow_public", true)
    .order("created_at", { ascending: false });

  if (error || !data?.length) return [];

  return (data as RecommendationRow[]).map((row) => ({
    id: row.id,
    personaQueRecomienda: row.recommender_name,
    zonaServicio: row.zone ?? "",
    modalidadServicio: row.modality ?? "",
    tareasRealizadas: row.tasks_summary ?? "",
    calificacionGeneral: row.score_general,
    comentario: row.comment ?? "",
    loVolveriaAContratar: row.would_rehire,
  }));
}
