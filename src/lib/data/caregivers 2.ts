import { createClient } from "@/lib/supabase/server";

import { profileRowToSearchItem, referenceRowToPublic } from "@/lib/data/caregivers-map";
import type { CaregiverReferencePublic, CaregiverSearchItem } from "@/lib/cuidadores-types";

export async function listCaregiverProfiles(): Promise<CaregiverSearchItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("caregiver_profiles").select("*").order("full_name");

  if (error || !data?.length) return [];

  return data.map((row) => profileRowToSearchItem(row));
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
