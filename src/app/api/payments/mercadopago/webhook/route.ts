import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { captureError } from "@/lib/observability";
import { fetchPayment } from "@/lib/payments/mercadopago";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

type SignatureResult = "valid" | "invalid" | "missing-secret";

/**
 * Verifica la firma `x-signature` de Mercado Pago segun el esquema ts/v1.
 * Sin secreto configurado devuelve "missing-secret": el caller decide
 * (fail-closed en produccion, fail-open solo fuera de produccion para sandbox).
 */
function verifySignature(request: Request, dataId: string): SignatureResult {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return "missing-secret";

  const signature = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");
  if (!signature) return "invalid";

  const parts = Object.fromEntries(
    signature.split(",").map((kv) => kv.split("=").map((s) => s.trim()) as [string, string])
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return "invalid";

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(v1)) ? "valid" : "invalid";
  } catch {
    return "invalid";
  }
}

export async function POST(request: Request) {
  let body: { type?: string; action?: string; data?: { id?: string } };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const isPayment = body.type === "payment" || body.action?.startsWith("payment");
  const paymentId = body.data?.id;
  if (!isPayment || !paymentId) {
    // Otros eventos (merchant_order, etc.): se aceptan sin procesar.
    return NextResponse.json({ ok: true, ignored: true });
  }

  const signatureResult = verifySignature(request, String(paymentId));
  if (signatureResult === "missing-secret") {
    // Fail-closed en produccion: sin secreto no se puede verificar el origen,
    // por lo que un atacante podria activar suscripciones falsas. Fuera de
    // produccion se permite para pruebas en sandbox.
    if (process.env.NODE_ENV === "production") {
      console.error("mercadopago webhook: missing MERCADOPAGO_WEBHOOK_SECRET in production");
      return NextResponse.json({ ok: false, error: "Webhook not configured" }, { status: 503 });
    }
  } else if (signatureResult === "invalid") {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
  }

  const payment = await fetchPayment(String(paymentId));
  if (!payment) {
    return NextResponse.json({ ok: false, error: "Payment not found" }, { status: 404 });
  }

  if (payment.status !== "approved") {
    return NextResponse.json({ ok: true, status: payment.status });
  }

  const [userId, planId] = (payment.externalReference ?? "").split(":");
  if (!userId || !planId) {
    return NextResponse.json({ ok: false, error: "Missing external_reference" }, { status: 422 });
  }

  const service = createServiceClient();
  if (!service) {
    console.error("mercadopago webhook: missing SUPABASE_SERVICE_ROLE_KEY");
    return NextResponse.json({ ok: false, error: "Service unavailable" }, { status: 503 });
  }

  const { error: updateError } = await service
    .from("subscriptions")
    .update({ status: "activa", payment_external_ref: String(paymentId) })
    .eq("user_id", userId)
    .eq("plan_id", planId)
    .eq("status", "pendiente-pago");

  if (updateError) {
    captureError(updateError, { scope: "mercadopago-webhook", userId, planId, paymentId });
    return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 });
  }

  await service.from("notifications").insert({
    user_id: userId,
    title: "Pago confirmado",
    body: "Tu plan CARE quedo activo. Gracias por tu suscripcion.",
    kind: "billing",
    href: "/mi-cuenta",
  });

  return NextResponse.json({ ok: true, activated: true });
}
