import type { PlanItem } from "@/lib/monetizacion-types";
import { planPriceToNumber } from "@/lib/plans";

// Integracion con Mercado Pago. Toda la app sigue funcionando sin credenciales:
// cuando `MERCADOPAGO_ACCESS_TOKEN` no esta seteado, `isMercadoPagoEnabled()` es
// false y el flujo de planes cae al modo "pendiente-pago" (activacion manual).

export function isMercadoPagoEnabled(): boolean {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  );
}

export type CheckoutPreference = {
  id: string;
  initPoint: string;
};

/**
 * Crea una preferencia de checkout (pago unico mensual) para un plan.
 * Devuelve null si MP no esta configurado o la API falla.
 */
export async function createCheckoutPreference(
  plan: PlanItem,
  userId: string
): Promise<CheckoutPreference | null> {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) return null;

  const amount = planPriceToNumber(plan.precioMensual);
  const base = appBaseUrl();

  try {
    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            id: plan.id,
            title: `CARE ${plan.nombre}`,
            quantity: 1,
            unit_price: amount,
            currency_id: "ARS",
          },
        ],
        external_reference: `${userId}:${plan.id}`,
        metadata: { user_id: userId, plan_id: plan.id },
        back_urls: {
          success: `${base}/planes?pago=ok`,
          pending: `${base}/planes?pago=pendiente`,
          failure: `${base}/planes?pago=error`,
        },
        auto_return: "approved",
        notification_url: `${base}/api/payments/mercadopago/webhook`,
      }),
    });

    if (!res.ok) {
      // PCI: no volcar el body de la respuesta de MP (puede traer metadata
      // sensible). Solo el status alcanza para diagnosticar.
      console.error("createCheckoutPreference failed", { status: res.status });
      return null;
    }

    const data = (await res.json()) as {
      id?: string;
      init_point?: string;
      sandbox_init_point?: string;
    };
    const initPoint = data.init_point ?? data.sandbox_init_point;
    if (!data.id || !initPoint) return null;

    return { id: data.id, initPoint };
  } catch (err) {
    console.error("createCheckoutPreference", err);
    return null;
  }
}

export type PaymentInfo = {
  status: string;
  externalReference: string | null;
  preapprovalId: string | null;
};

/** Consulta un pago por id usando el access token (para el webhook). */
export async function fetchPayment(paymentId: string): Promise<PaymentInfo | null> {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      status?: string;
      external_reference?: string;
      metadata?: { preapproval_id?: string };
    };
    return {
      status: data.status ?? "unknown",
      externalReference: data.external_reference ?? null,
      preapprovalId: data.metadata?.preapproval_id ?? null,
    };
  } catch (err) {
    console.error("fetchPayment", err);
    return null;
  }
}
