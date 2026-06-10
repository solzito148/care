"use server";

import { revalidatePath } from "next/cache";

import { monetizationPlansMock } from "@/lib/monetizacion-mock";
import { createClient } from "@/lib/supabase/server";

/**
 * Selecciona un plan: crea una suscripcion `pendiente-pago` (o `activa` si es
 * gratuita) y cancela la vigente anterior. El cobro real con Mercado Pago se
 * integra en una fase posterior via `payment_external_ref` + webhook.
 */
export async function selectPlanAction(
  planId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesion requerida." };

  const plan = monetizationPlansMock.find((p) => p.id === planId);
  if (!plan) return { ok: false, error: "Plan inexistente." };

  const isFree = plan.precioMensual === "$0";

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
    status: isFree ? "activa" : "pendiente-pago",
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

  await supabase.from("notifications").insert({
    user_id: user.id,
    title: isFree
      ? `Plan ${plan.nombre} activado`
      : `Plan ${plan.nombre} pendiente de pago`,
    body: isFree
      ? "Tu plan gratuito ya esta activo."
      : `Cuando integremos el cobro online vas a poder abonar ${plan.precioMensual}/mes desde la app. Por ahora el equipo CARE te va a contactar para activarlo.`,
    kind: "billing",
    href: "/planes",
  });

  revalidatePath("/planes");
  revalidatePath("/mi-cuenta");
  return { ok: true };
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

  revalidatePath("/planes");
  revalidatePath("/mi-cuenta");
  return { ok: true };
}
