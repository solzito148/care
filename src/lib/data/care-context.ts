import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";

export const ACTIVE_RECIPIENT_COOKIE = "care_recipient_id";

export type CareContext = {
  householdId: string;
  careRecipientId: string;
};

async function readActiveRecipientCookie(): Promise<string | null> {
  try {
    const store = await cookies();
    return store.get(ACTIVE_RECIPIENT_COOKIE)?.value ?? null;
  } catch {
    return null;
  }
}

type SupabaseSrv = Awaited<ReturnType<typeof createClient>>;

const PG_UNIQUE_VIOLATION = "23505";

/**
 * Garantiza un hogar y al menos una persona cuidada para el usuario autenticado.
 *
 * Es resistente a race conditions (dos requests en paralelo del mismo usuario):
 *   - usa `limit(1)` en lugar de `maybeSingle()` para tolerar duplicados accidentales
 *     creados antes de la unique constraint;
 *   - si el insert de `households` choca con la unique key, hace re-fetch del existente;
 *   - cuando ya existe el hogar pero falta la fila en `household_members` (caso owner
 *     "huerfano"), la inserta de forma idempotente para mantener RLS coherente.
 */
export async function ensureCareContext(): Promise<CareContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const ownedId = await findOwnedHouseholdId(supabase, user.id);
  if (ownedId) {
    await ensureOwnerMembership(supabase, ownedId, user.id);
    return ensureRecipientForHousehold(supabase, ownedId);
  }

  const memberId = await findFirstMembershipHouseholdId(supabase, user.id);
  if (memberId) {
    return ensureRecipientForHousehold(supabase, memberId);
  }

  const createdId = await createOwnedHousehold(supabase, user.id);
  if (!createdId) return null;

  await ensureOwnerMembership(supabase, createdId, user.id);
  return ensureRecipientForHousehold(supabase, createdId);
}

async function findOwnedHouseholdId(
  supabase: SupabaseSrv,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("households")
    .select("id")
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1);
  if (error) {
    console.error("ensureCareContext: lookup owned household", error);
    return null;
  }
  return data?.[0]?.id ?? null;
}

async function findFirstMembershipHouseholdId(
  supabase: SupabaseSrv,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1);
  if (error) {
    console.error("ensureCareContext: lookup membership", error);
    return null;
  }
  return data?.[0]?.household_id ?? null;
}

async function createOwnedHousehold(
  supabase: SupabaseSrv,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("households")
    .insert({ name: "Mi hogar CARE", owner_user_id: userId })
    .select("id")
    .single();

  if (!error && data?.id) return data.id;

  if (error?.code === PG_UNIQUE_VIOLATION) {
    return findOwnedHouseholdId(supabase, userId);
  }

  console.error("ensureCareContext: insert household", error);
  return null;
}

async function ensureOwnerMembership(
  supabase: SupabaseSrv,
  householdId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase.from("household_members").insert({
    household_id: householdId,
    user_id: userId,
    member_role: "owner",
  });
  if (!error) return;
  if (error.code === PG_UNIQUE_VIOLATION) return;
  console.warn("ensureCareContext: insert membership", error);
}

async function ensureRecipientForHousehold(
  supabase: SupabaseSrv,
  householdId: string
): Promise<CareContext | null> {
  const { data: existing, error: lookupErr } = await supabase
    .from("care_recipients")
    .select("id")
    .eq("household_id", householdId)
    .order("created_at", { ascending: true });

  if (lookupErr) {
    console.error("ensureRecipientForHousehold: lookup", lookupErr);
    return null;
  }

  if (existing?.length) {
    const ids = existing.map((row) => row.id);
    const preferred = await readActiveRecipientCookie();
    const careRecipientId = preferred && ids.includes(preferred) ? preferred : ids[0];
    return { householdId, careRecipientId };
  }

  const { data: inserted, error } = await supabase
    .from("care_recipients")
    .insert({
      household_id: householdId,
      full_name: "Persona cuidada",
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error(
      "ensureRecipientForHousehold: insert",
      error?.message ?? error?.code ?? "unknown",
      error?.details ?? "",
      error?.hint ?? ""
    );
    return null;
  }

  return { householdId, careRecipientId: inserted.id };
}
