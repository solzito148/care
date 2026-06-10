"use server";

import { revalidatePath } from "next/cache";

import { recordAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notify";
import { getCurrentUser } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { ok: boolean; error?: string };

async function requireAdmin(): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesion requerida." };
  if (!user.roles.includes("admin")) return { ok: false, error: "Acceso solo para administradores." };
  return { ok: true };
}

type ModerationStatus = "publicado" | "pausado" | "bloqueado";

export async function reviewRecommendationAction(
  recommendationId: string,
  decision: "aprobada" | "rechazada"
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("caregiver_recommendations")
    .update({ status: decision })
    .eq("id", recommendationId)
    .select("recommender_user_id, caregiver_profile_id")
    .single();

  if (error) {
    console.error("reviewRecommendation", error);
    return { ok: false, error: error.message };
  }

  await recordAuditLog({
    entityType: "caregiver_recommendation",
    entityId: recommendationId,
    action: `recommendation_${decision}`,
  });

  if (data?.recommender_user_id) {
    await createNotification({
      userId: data.recommender_user_id,
      title: decision === "aprobada" ? "Tu recomendacion fue aprobada" : "Tu recomendacion fue revisada",
      body:
        decision === "aprobada"
          ? "Gracias. Tu recomendacion ya es visible en el perfil del cuidador."
          : "Tu recomendacion no fue publicada. Podes enviar otra si lo deseas.",
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

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .update({ status })
    .eq("id", serviceId)
    .select("owner_user_id, provider_name")
    .single();

  if (error) {
    console.error("moderateService", error);
    return { ok: false, error: error.message };
  }

  await recordAuditLog({
    entityType: "service",
    entityId: serviceId,
    action: `service_${status}`,
  });

  if (status === "bloqueado" && data?.owner_user_id) {
    await createNotification({
      userId: data.owner_user_id,
      title: "Tu servicio fue bloqueado",
      body: `El servicio "${data.provider_name}" fue bloqueado por moderacion. Contactá al equipo CARE para mas informacion.`,
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

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketplace_items")
    .update({ status })
    .eq("id", itemId)
    .select("owner_user_id, title")
    .single();

  if (error) {
    console.error("moderateMarketplaceItem", error);
    return { ok: false, error: error.message };
  }

  await recordAuditLog({
    entityType: "marketplace_item",
    entityId: itemId,
    action: `item_${status}`,
  });

  if (status === "bloqueado" && data?.owner_user_id) {
    await createNotification({
      userId: data.owner_user_id,
      title: "Tu publicacion fue bloqueada",
      body: `La publicacion "${data.title}" fue bloqueada por moderacion.`,
      kind: "warning",
      href: "/marketplace",
    });
  }

  revalidatePath("/admin");
  revalidatePath("/marketplace");
  return { ok: true };
}

export async function sendCaregiverUpdateReminderAction(
  caregiverId: string
): Promise<ActionResult & { delivered?: boolean }> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("caregiver_profiles")
    .select("id, full_name, linked_user_id")
    .eq("id", caregiverId)
    .maybeSingle();

  if (error) {
    console.error("sendCaregiverUpdateReminder", error);
    return { ok: false, error: error.message };
  }
  if (!data) return { ok: false, error: "Cuidador inexistente." };

  await recordAuditLog({
    entityType: "caregiver_profile",
    entityId: caregiverId,
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
    href: `/cuidadores/${caregiverId}`,
  });

  revalidatePath("/cuidadores/admin-actualizacion");
  return { ok: result.ok, delivered: result.ok };
}

export async function activateSubscriptionAction(subscriptionId: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .update({ status: "activa" })
    .eq("id", subscriptionId)
    .select("user_id, plan_name")
    .single();

  if (error) {
    console.error("activateSubscription", error);
    return { ok: false, error: error.message };
  }

  await recordAuditLog({
    entityType: "subscription",
    entityId: subscriptionId,
    action: "subscription_activated_admin",
  });

  if (data?.user_id) {
    await createNotification({
      userId: data.user_id,
      title: `Plan ${data.plan_name} activado`,
      body: "El equipo CARE activo tu suscripcion. Ya tenes acceso completo.",
      kind: "billing",
      href: "/mi-cuenta",
    });
  }

  revalidatePath("/admin");
  return { ok: true };
}
