"use server";

import { revalidatePath } from "next/cache";

import { recordAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notify";
import { getCurrentUser } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";
import {
  moderationStatusSchema,
  reviewDecisionSchema,
} from "@/lib/validations/admin-schema";
import { uuidSchema } from "@/lib/validations/common-schema";
import { parseInput } from "@/lib/validations/parse";
import type { z } from "zod";

type ActionResult = { ok: boolean; error?: string };

async function requireAdmin(): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión requerida." };
  if (!user.roles.includes("admin")) return { ok: false, error: "Acceso solo para administradores." };
  return { ok: true };
}

type ModerationStatus = z.infer<typeof moderationStatusSchema>;

export async function reviewRecommendationAction(
  recommendationId: string,
  decision: "aprobada" | "rechazada"
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const idParsed = parseInput(uuidSchema, recommendationId);
  if (!idParsed.ok) return { ok: false, error: idParsed.error };
  const decisionParsed = parseInput(reviewDecisionSchema, decision);
  if (!decisionParsed.ok) return { ok: false, error: decisionParsed.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("caregiver_recommendations")
    .update({ status: decisionParsed.data })
    .eq("id", idParsed.data)
    .select("recommender_user_id, caregiver_profile_id")
    .single();

  if (error) {
    console.error("reviewRecommendation", error);
    return { ok: false, error: error.message };
  }

  await recordAuditLog({
    entityType: "caregiver_recommendation",
    entityId: idParsed.data,
    action: `recommendation_${decisionParsed.data}`,
  });

  if (data?.recommender_user_id) {
    await createNotification({
      userId: data.recommender_user_id,
      title:
        decisionParsed.data === "aprobada"
          ? "Tu recomendación fue aprobada"
          : "Tu recomendación fue revisada",
      body:
        decisionParsed.data === "aprobada"
          ? "Gracias. Tu recomendación ya es visible en el perfil del cuidador."
          : "Tu recomendación no fue publicada. Podés enviar otra si lo deseás.",
      kind: "info",
      href: data.caregiver_profile_id ? `/cuidadores/${data.caregiver_profile_id}` : "/cuidadores",
    });
  }

  revalidatePath("/admin");
  revalidatePath("/cuidadores");
  if (data?.caregiver_profile_id) revalidatePath(`/cuidadores/${data.caregiver_profile_id}`);
  return { ok: true };
}

export async function moderateServiceAction(
  serviceId: string,
  status: ModerationStatus
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const idParsed = parseInput(uuidSchema, serviceId);
  if (!idParsed.ok) return { ok: false, error: idParsed.error };
  const statusParsed = parseInput(moderationStatusSchema, status);
  if (!statusParsed.ok) return { ok: false, error: statusParsed.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .update({ status: statusParsed.data })
    .eq("id", idParsed.data)
    .select("owner_user_id, provider_name")
    .single();

  if (error) {
    console.error("moderateService", error);
    return { ok: false, error: error.message };
  }

  await recordAuditLog({
    entityType: "service",
    entityId: idParsed.data,
    action: `service_${statusParsed.data}`,
  });

  if (statusParsed.data === "bloqueado" && data?.owner_user_id) {
    await createNotification({
      userId: data.owner_user_id,
      title: "Tu servicio fue bloqueado",
      body: `El servicio "${data.provider_name}" fue bloqueado por moderación. Contactá al equipo CARE para más información.`,
      kind: "warning",
      href: "/servicios",
    });
  }

  revalidatePath("/admin");
  revalidatePath("/servicios");
  return { ok: true };
}

export async function moderateMarketplaceItemAction(
  itemId: string,
  status: ModerationStatus
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const idParsed = parseInput(uuidSchema, itemId);
  if (!idParsed.ok) return { ok: false, error: idParsed.error };
  const statusParsed = parseInput(moderationStatusSchema, status);
  if (!statusParsed.ok) return { ok: false, error: statusParsed.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketplace_items")
    .update({ status: statusParsed.data })
    .eq("id", idParsed.data)
    .select("owner_user_id, title")
    .single();

  if (error) {
    console.error("moderateMarketplaceItem", error);
    return { ok: false, error: error.message };
  }

  await recordAuditLog({
    entityType: "marketplace_item",
    entityId: idParsed.data,
    action: `item_${statusParsed.data}`,
  });

  if (statusParsed.data === "bloqueado" && data?.owner_user_id) {
    await createNotification({
      userId: data.owner_user_id,
      title: "Tu publicación fue bloqueada",
      body: `La publicación "${data.title}" fue bloqueada por moderación.`,
      kind: "warning",
      href: "/servicios?seccion=venta",
    });
  }

  revalidatePath("/admin");
  revalidatePath("/servicios");
  return { ok: true };
}

export async function sendCaregiverUpdateReminderAction(
  caregiverId: string
): Promise<ActionResult & { delivered?: boolean }> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const idParsed = parseInput(uuidSchema, caregiverId);
  if (!idParsed.ok) return { ok: false, error: idParsed.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("caregiver_profiles")
    .select("id, full_name, linked_user_id")
    .eq("id", idParsed.data)
    .maybeSingle();

  if (error) {
    console.error("sendCaregiverUpdateReminder", error);
    return { ok: false, error: error.message };
  }
  if (!data) return { ok: false, error: "Cuidador inexistente." };

  await recordAuditLog({
    entityType: "caregiver_profile",
    entityId: idParsed.data,
    action: "caregiver_update_reminder_sent",
  });

  if (!data.linked_user_id) {
    return {
      ok: true,
      delivered: false,
      error: "El cuidador no tiene una cuenta vinculada: no se pudo enviar el recordatorio in-app.",
    };
  }

  const result = await createNotification({
    userId: data.linked_user_id,
    title: "Actualiza tus datos en CARE",
    body: "Para mantener tu perfil visible y recomendado, confirma o actualiza tus datos este mes.",
    kind: "warning",
    href: `/cuidadores/${idParsed.data}`,
  });

  revalidatePath("/cuidadores/admin-actualizacion");
  return { ok: result.ok, delivered: result.ok };
}

export async function activateSubscriptionAction(subscriptionId: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const idParsed = parseInput(uuidSchema, subscriptionId);
  if (!idParsed.ok) return { ok: false, error: idParsed.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .update({ status: "activa" })
    .eq("id", idParsed.data)
    .select("user_id, plan_name")
    .single();

  if (error) {
    console.error("activateSubscription", error);
    return { ok: false, error: error.message };
  }

  await recordAuditLog({
    entityType: "subscription",
    entityId: idParsed.data,
    action: "subscription_activated_admin",
  });

  if (data?.user_id) {
    await createNotification({
      userId: data.user_id,
      title: `Plan ${data.plan_name} activado`,
      body: "El equipo CARE activó tu suscripción. Ya tenés acceso completo.",
      kind: "billing",
      href: "/mi-cuenta",
    });
  }

  revalidatePath("/admin");
  return { ok: true };
}
