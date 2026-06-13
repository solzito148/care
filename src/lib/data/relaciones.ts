import { ensureCareContext } from "@/lib/data/care-context";
import { createClient } from "@/lib/supabase/server";
import type {
  RelationshipStatus,
  RelationshipType,
} from "@/lib/supabase/types";

export type RelationshipView = {
  id: string;
  type: RelationshipType;
  status: RelationshipStatus;
  subjectUserId: string | null;
  subjectName: string;
  subjectPhone: string | null;
  subjectEmail: string | null;
  notes: string;
  createdAt: string;
};

export type RelationshipsState = {
  careRecipientId: string;
  active: RelationshipView[];
  pending: RelationshipView[];
};

const EMPTY: RelationshipsState = {
  careRecipientId: "",
  active: [],
  pending: [],
};

/**
 * Relaciones (cuidadores, médicos, familia, legal) de la persona cuidada activa.
 * Respeta RLS: el tutor/owner ve todas; un sujeto vinculado ve la suya.
 */
export async function loadRelationships(): Promise<RelationshipsState> {
  const context = await ensureCareContext();
  if (!context) return EMPTY;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("care_relationships")
    .select(
      "id, relationship_type, status, subject_user_id, subject_name, subject_phone, subject_email, notes, created_at",
    )
    .eq("care_recipient_id", context.careRecipientId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("loadRelationships", error.message);
    return { ...EMPTY, careRecipientId: context.careRecipientId };
  }

  const rows = data ?? [];

  // Resolver nombre de los sujetos con cuenta CARE (segunda query, sin embeds).
  const userIds = Array.from(
    new Set(rows.map((r) => r.subject_user_id).filter((id): id is string => Boolean(id))),
  );
  const nameByUserId = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);
    for (const profile of profiles ?? []) {
      if (profile.full_name?.trim()) nameByUserId.set(profile.id, profile.full_name.trim());
    }
  }

  const items: RelationshipView[] = rows.map((row) => ({
    id: row.id,
    type: row.relationship_type,
    status: row.status,
    subjectUserId: row.subject_user_id,
    subjectName:
      (row.subject_user_id && nameByUserId.get(row.subject_user_id)) ||
      row.subject_name?.trim() ||
      row.subject_email?.trim() ||
      "Persona vinculada",
    subjectPhone: row.subject_phone,
    subjectEmail: row.subject_email,
    notes: row.notes,
    createdAt: row.created_at,
  }));

  return {
    careRecipientId: context.careRecipientId,
    active: items.filter((i) => i.status === "approved"),
    pending: items.filter((i) => i.status === "pending"),
  };
}
