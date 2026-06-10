"use server";

import { revalidatePath } from "next/cache";

import { recordAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notify";
import { createCheckoutPreference, isMercadoPagoEnabled } from "@/lib/payments/mercadopago";
import { findPlan, isFreePlan } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

export type SelectPlanResult = {
  ok: boolean;
  error?: string;
  /** URL de checkout de Mercado Pago cuando hay cobro online disponible. */
  checkoutUrl?: string;
};

/**
 * Selecciona un plan. Flujo:
 *  - gratuito: crea suscripcion `activa`.
 *  - pago + Mercado Pago configurado: crea `pendiente-pago` y devuelve la URL de
 *    checkout; el webhook la pasa a `activa` al confirmarse el pago.
 *  - pago sin Mercado Pago: crea `pendiente-pago` (activacion manual por admin).
 */
export async function selectPlanAction(planId: string): Promise<SelectPlanResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesion requerida." };

  const plan = findPlan(planId);
  if (!plan) return { ok: false, error: "Plan inexistente." };

  const free = isFreePlan(plan);

  const { error: cancelError } = await supabase
    .from("subscriptions")
    .update({ status: "cancelada" })
    .eq("user_id", user.id)
    .neq("status", "cancelada");
  if (cancelError) {
    console.error("selectPlan: cancel previous", cancelError);
  }

  const nextDue = new Date();
  nextDue.setMonth(nextDue.getMonth() + 1);

  const { error } = await supabase.from("subscriptions").insert({
    user_id: user.id,
    plan_id: plan.id,
    plan_name: plan.nombre,
    line: plan.linea,
    status: free ? "activa" : "pendiente-pago",
    amount: plan.precioMensual,
    billing_cycle: "Mensual",
    next_due_date: nextDue.toISOString().slice(0, 10),
  });

  if (error) {
    console.error("selectPlan: insert", error);
    return {
      ok: false,
      error: error.message.includes("subscriptions")
        ? "Falta la tabla de suscripciones. Ejecuta supabase/phase5.sql."
        : error.message,
    };
  }

  await recordAuditLog({
    entityType: "subscription",
    action: free ? "plan_activated_free" : "plan_selected_pending",
    payload: { plan_id: plan.id, plan_name: plan.nombre },
  });

  let checkoutUrl: string | undefined;
  if (!free && isMercadoPagoEnabled()) {
    const preference = await createCheckoutPreference(plan, user.id);
    checkoutUrl = preference?.initPoint;
  }

  await createNotification({
    userId: user.id,
    title: free
      ? `Plan ${plan.nombre} activado`
      : `Plan ${plan.nombre} pendiente de pago`,
    body: free
      ? "Tu plan gratuito ya esta activo."
      : checkoutUrl
        ? `Completa el pago de ${plan.precioMensual}/mes para activar tu plan.`
        : `Cuando integremos el cobro online vas a poder abonar ${plan.precioMensual}/mes desde la app. Por ahora el equipo CARE te va a contactar para activarlo.`,
    kind: "billing",
    href: "/planes",
  });

  revalidatePath("/planes");
  revalidatePath("/mi-cuenta");
  return { ok: true, checkoutUrl };
}

export async function cancelSubscriptionAction(
  subscriptionId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesion requerida." };

  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "cancelada" })
    .eq("id", subscriptionId)
    .eq("user_id", user.id);

  if (error) {
    console.error("cancelSubscription", error);
    return { ok: false, error: error.message };
  }

  await recordAuditLog({
    entityType: "subscription",
    entityId: subscriptionId,
    action: "subscription_cancelled",
  });

  revalidatePath("/planes");
  revalidatePath("/mi-cuenta");
  return { ok: true };
}
