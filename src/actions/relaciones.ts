"use server";

import { revalidatePath } from "next/cache";

import { recordAuditLog } from "@/lib/audit";
import { ensureCareContext } from "@/lib/data/care-context";
import { familyLimitsForPlanId } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { RelationshipType } from "@/lib/supabase/types";
import { uuidSchema } from "@/lib/validations/common-schema";
import {
  createRelationshipSchema,
  relationshipDecisionSchema,
  relationshipManagerSchema,
} from "@/lib/validations/relacion-schema";
import { parseInput } from "@/lib/validations/parse";

export type CreateRelationshipInput = {
  careRecipientId: string;
  relationshipType: RelationshipType;
  subjectUserId?: string;
  subjectName?: string;
  subjectRelation?: string;
  subjectPhone?: string;
  subjectEmail?: string;
  notes?: string;
};

export type RelationshipDecisionInput = {
  relationshipId: string;
  decision: "approved" | "rejected" | "revoked";
};

export type RelationshipManagerInput = {
  relationshipId: string;
  isManager: boolean;
};

const TYPE_LABELS: Record<RelationshipType, string> = {
  caregiver: "cuidador",
  professional: "profesional de salud",
  family: "familiar",
  legal: "responsable legal",
  other: "vínculo",
};

async function recipientOwnerAndName(
  careRecipientId: string,
): Promise<{ ownerId: string | null; name: string }> {
  const service = createServiceClient();
  if (!service) return { ownerId: null, name: "la persona cuidada" };

  const { data: recipient } = await service
    .from("care_recipients")
    .select("household_id, full_name, preferred_name")
    .eq("id", careRecipientId)
    .maybeSingle();

  if (!recipient) return { ownerId: null, name: "la persona cuidada" };

  const { data: household } = await service
    .from("households")
    .select("owner_user_id")
    .eq("id", recipient.household_id)
    .maybeSingle();

  const name =
    recipient.preferred_name?.trim() || recipient.full_name || "la persona cuidada";

  return { ownerId: household?.owner_user_id ?? null, name };
}

/**
 * Hace cumplir el tope de cuidadores/medicos del plan de la familia (vertical
 * Familias). Solo aplica a vinculos `caregiver` (cuidadores) y `professional`
 * (medicos). Cuenta los vinculos activos + pendientes para no superar el limite.
 * Si no hay service client o no se puede resolver el owner, no bloquea.
 */
async function checkFamilyLinkLimit(
  careRecipientId: string,
  relationshipType: RelationshipType,
): Promise<{ ok: boolean; error?: string }> {
  if (relationshipType !== "caregiver" && relationshipType !== "professional") {
    return { ok: true };
  }

  const service = createServiceClient();
  if (!service) return { ok: true };

  const { data: recipient } = await service
    .from("care_recipients")
    .select("household_id")
    .eq("id", careRecipientId)
    .maybeSingle();
  if (!recipient) return { ok: true };

  const { data: household } = await service
    .from("households")
    .select("owner_user_id")
    .eq("id", recipient.household_id)
    .maybeSingle();
  const ownerId = household?.owner_user_id ?? null;
  if (!ownerId) return { ok: true };

  const { data: sub } = await service
    .from("subscriptions")
    .select("plan_id, line")
    .eq("user_id", ownerId)
    .eq("status", "activa")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const planId = sub?.line === "familias" ? sub.plan_id : null;
  const limits = familyLimitsForPlanId(planId);
  const max = relationshipType === "caregiver" ? limits.cuidadores : limits.medicos;
  if (max === null) return { ok: true };

  const { count } = await service
    .from("care_relationships")
    .select("id", { count: "exact", head: true })
    .eq("care_recipient_id", careRecipientId)
    .eq("relationship_type", relationshipType)
    .in("status", ["pending", "approved"]);

  if ((count ?? 0) >= max) {
    const tipo = relationshipType === "caregiver" ? "cuidadores" : "médicos";
    const sugerencia =
      max === 0
        ? "Activá un plan Familiar (Esencial o Premium) para vincular profesionales."
        : "Pasá a Familiar Premium para vincular cuidadores y médicos ilimitados.";
    return {
      ok: false,
      error: `Alcanzaste el máximo de ${tipo} de tu plan (${max}). ${sugerencia}`,
    };
  }

  return { ok: true };
}

async function notifyUser(input: {
  userId: string;
  title: string;
  body: string;
  href?: string;
}): Promise<void> {
  const service = createServiceClient();
  if (!service) return;
  const { error } = await service.from("notifications").insert({
    user_id: input.userId,
    title: input.title,
    body: input.body,
    kind: "info",
    href: input.href ?? null,
  });
  if (error) console.warn("notifyUser", error.message);
}

/**
 * Crea una relación entre una persona y un adulto mayor. El trigger de la base
 * fija el estado: si la crea el tutor/owner queda `approved`; si la crea un
 * cuidador/profesional queda `pending` hasta que el tutor la apruebe.
 */
export async function createRelationshipAction(
  form: CreateRelationshipInput,
): Promise<{ ok: boolean; error?: string; status?: string; id?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión requerida." };

  const parsed = parseInput(createRelationshipSchema, form);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const input = parsed.data;

  const limitCheck = await checkFamilyLinkLimit(
    input.careRecipientId,
    input.relationshipType,
  );
  if (!limitCheck.ok) return { ok: false, error: limitCheck.error };

  const { data, error } = await supabase
    .from("care_relationships")
    .insert({
      care_recipient_id: input.careRecipientId,
      relationship_type: input.relationshipType,
      subject_user_id: input.subjectUserId ? input.subjectUserId : null,
      subject_name: input.subjectName ? input.subjectName : null,
      subject_relation: input.subjectRelation ? input.subjectRelation : null,
      subject_phone: input.subjectPhone ? input.subjectPhone : null,
      subject_email: input.subjectEmail ? input.subjectEmail : null,
      notes: input.notes ?? "",
    })
    .select("id, status")
    .single();

  if (error || !data) {
    console.error("createRelationship", error);
    if (error?.code === "23505") {
      return { ok: false, error: "Esa relación ya existe para esta persona." };
    }
    if (error?.code === "42P01") {
      return {
        ok: false,
        error: "Falta la tabla de relaciones. Ejecutá supabase/phase7.sql.",
      };
    }
    return {
      ok: false,
      error: error?.message ?? "No se pudo crear la relación.",
    };
  }

  await recordAuditLog({
    entityType: "care_relationship",
    entityId: data.id,
    action: "relationship_requested",
    payload: { type: input.relationshipType, status: data.status },
  });

  const typeLabel = TYPE_LABELS[input.relationshipType];
  const subjectLabel = input.subjectName || "una persona con cuenta CARE";

  if (data.status === "pending") {
    const { ownerId, name } = await recipientOwnerAndName(input.careRecipientId);
    if (ownerId) {
      await notifyUser({
        userId: ownerId,
        title: "Nueva relación pendiente de aprobación",
        body: `Se propuso agregar a ${subjectLabel} como ${typeLabel} de ${name}. Revisá y aprobá o rechazá la solicitud.`,
        href: "/persona-cuidada",
      });
    }
  }

  revalidatePath("/persona-cuidada");
  revalidatePath("/cuidadores");
  return { ok: true, status: data.status, id: data.id };
}

/**
 * Vincula un cuidador del directorio público a la persona cuidada activa del
 * tutor. Como lo hace el tutor/owner, queda aprobado automáticamente.
 */
export async function assignCaregiverFromDirectoryAction(
  caregiverProfileId: string,
): Promise<{ ok: boolean; error?: string; status?: string }> {
  const idParsed = parseInput(uuidSchema, caregiverProfileId);
  if (!idParsed.ok) return { ok: false, error: idParsed.error };

  const context = await ensureCareContext();
  if (!context) return { ok: false, error: "No se encontró una persona cuidada." };

  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("caregiver_profiles")
    .select("full_name, linked_user_id")
    .eq("id", idParsed.data)
    .maybeSingle();

  if (error || !profile) {
    return { ok: false, error: "No se encontró el perfil del cuidador." };
  }

  return createRelationshipAction({
    careRecipientId: context.careRecipientId,
    relationshipType: "caregiver",
    subjectUserId: profile.linked_user_id ?? "",
    subjectName: profile.full_name,
    notes: `Asignado desde el directorio (perfil ${idParsed.data}).`,
  });
}

/**
 * El tutor/owner aprueba, rechaza o revoca una relación. RLS garantiza que solo
 * el owner del hogar (o admin) pueda decidir.
 */
export async function decideRelationshipAction(
  form: RelationshipDecisionInput,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión requerida." };

  const parsed = parseInput(relationshipDecisionSchema, form);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const { relationshipId, decision } = parsed.data;

  const { data, error } = await supabase
    .from("care_relationships")
    .update({ status: decision })
    .eq("id", relationshipId)
    .select("id, subject_user_id, relationship_type, care_recipient_id")
    .maybeSingle();

  if (error) {
    console.error("decideRelationship", error);
    return { ok: false, error: error.message };
  }
  if (!data) {
    return {
      ok: false,
      error: "Solo el tutor responsable puede decidir sobre esta relación.",
    };
  }

  await recordAuditLog({
    entityType: "care_relationship",
    entityId: data.id,
    action: `relationship_${decision}`,
  });

  if (data.subject_user_id) {
    const { name } = await recipientOwnerAndName(data.care_recipient_id);
    const relationType = data.relationship_type as RelationshipType;
    const decisionText =
      decision === "approved"
        ? `Tu vínculo como ${TYPE_LABELS[relationType]} de ${name} fue aprobado.`
        : decision === "rejected"
          ? `Tu vínculo con ${name} fue rechazado por el tutor responsable.`
          : `Tu vínculo con ${name} fue dado de baja.`;

    await notifyUser({
      userId: data.subject_user_id,
      title:
        decision === "approved"
          ? "Vínculo aprobado"
          : decision === "rejected"
            ? "Vínculo rechazado"
            : "Vínculo dado de baja",
      body: decisionText,
      href: "/dashboard",
    });
  }

  revalidatePath("/persona-cuidada");
  return { ok: true };
}

/**
 * El tutor legal (owner) delega o revoca la administración de un cuidador
 * aprobado. El trigger de la base impide que cualquiera que no sea el owner/admin
 * cambie `is_manager`, así que solo el tutor puede delegar de verdad.
 */
export async function setRelationshipManagerAction(
  form: RelationshipManagerInput,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión requerida." };

  const parsed = parseInput(relationshipManagerSchema, form);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const { relationshipId, isManager } = parsed.data;

  const { data, error } = await supabase
    .from("care_relationships")
    .update({ is_manager: isManager })
    .eq("id", relationshipId)
    .eq("relationship_type", "caregiver")
    .eq("status", "approved")
    .select("id, is_manager, subject_user_id, care_recipient_id")
    .maybeSingle();

  if (error) {
    console.error("setRelationshipManager", error);
    return { ok: false, error: error.message };
  }
  if (!data) {
    return {
      ok: false,
      error: "Solo el tutor responsable puede delegar la administración.",
    };
  }
  if (data.is_manager !== isManager) {
    return {
      ok: false,
      error: "Solo el tutor responsable puede delegar la administración.",
    };
  }

  await recordAuditLog({
    entityType: "care_relationship",
    entityId: data.id,
    action: isManager ? "relationship_manager_granted" : "relationship_manager_revoked",
  });

  if (data.subject_user_id) {
    const { name } = await recipientOwnerAndName(data.care_recipient_id);
    await notifyUser({
      userId: data.subject_user_id,
      title: isManager ? "Administración delegada" : "Administración revocada",
      body: isManager
        ? `El tutor de ${name} te delegó la administración del cuidado.`
        : `El tutor de ${name} revocó tu administración del cuidado.`,
      href: "/persona-cuidada",
    });
  }

  revalidatePath("/persona-cuidada");
  return { ok: true };
}
