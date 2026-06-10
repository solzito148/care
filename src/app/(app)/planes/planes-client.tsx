"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { cancelSubscriptionAction, selectPlanAction } from "@/actions/planes";
import { FormMessage } from "@/components/forms/form-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { SubscriptionRow } from "@/lib/data/planes";
import type { PlanItem } from "@/lib/monetizacion-types";

const stateTone = {
  activa: "success",
  "pendiente-pago": "warning",
  vencida: "danger",
  cancelada: "danger",
} as const;

type Props = {
  plans: PlanItem[];
  subscription: SubscriptionRow | null;
  paymentsEnabled: boolean;
};

export function PlanesClient({ plans, subscription, paymentsEnabled }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const onSelect = (plan: PlanItem) => {
    startTransition(async () => {
      const res = await selectPlanAction(plan.id);
      if (res.ok) {
        if (res.checkoutUrl) {
          window.location.assign(res.checkoutUrl);
          return;
        }
        setMessageType("success");
        setMessage(
          plan.precioMensual === "$0"
            ? `Plan ${plan.nombre} activado.`
            : `Plan ${plan.nombre} reservado: queda pendiente de pago hasta integrar el cobro online.`
        );
        router.refresh();
      } else {
        setMessageType("error");
        setMessage(res.error ?? "No se pudo seleccionar el plan.");
      }
    });
  };

  const onCancel = () => {
    if (!subscription) return;
    startTransition(async () => {
      const res = await cancelSubscriptionAction(subscription.id);
      if (res.ok) {
        setMessageType("success");
        setMessage("Suscripcion cancelada.");
        router.refresh();
      } else {
        setMessageType("error");
        setMessage(res.error ?? "No se pudo cancelar.");
      }
    });
  };

  return (
    <>
      {subscription ? (
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold text-slate-900">
              Tu plan: {subscription.plan_name}
            </h2>
            <Badge tone={stateTone[subscription.status]}>{subscription.status}</Badge>
          </div>
          <p className="mt-2 text-sm text-slate-700">
            <strong>Monto:</strong> {subscription.amount} / {subscription.billing_cycle}
          </p>
          {subscription.next_due_date ? (
            <p className="text-sm text-slate-700">
              <strong>Proximo vencimiento:</strong> {subscription.next_due_date}
            </p>
          ) : null}
          {subscription.status === "pendiente-pago" ? (
            <p className="mt-2 text-sm text-slate-600">
              {paymentsEnabled
                ? "Tu pago esta pendiente de confirmacion. En cuanto Mercado Pago lo acredite, el plan se activa automaticamente."
                : "El cobro online (Mercado Pago) todavia no esta habilitado en este entorno. El equipo CARE activara tu plan manualmente."}
            </p>
          ) : null}
          <div className="mt-4">
            <Button variant="secondary" disabled={pending} onClick={onCancel}>
              Cancelar suscripcion
            </Button>
          </div>
        </Card>
      ) : null}

      <FormMessage message={message} type={messageType} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent =
            subscription !== null &&
            subscription.plan_id === plan.id &&
            subscription.status !== "cancelada";
          return (
            <Card key={plan.id} className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-900">{plan.nombre}</h2>
                <div className="flex gap-1">
                  {plan.destacado ? <Badge tone="success">Destacado</Badge> : null}
                  {isCurrent ? <Badge tone="info">Plan actual</Badge> : null}
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-700">
                <strong>Cliente:</strong> {plan.cliente}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                <strong>Modalidad:</strong> {plan.modalidad}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                <strong>Precio mensual:</strong> {plan.precioMensual}
              </p>
              <p className="mt-1 text-sm text-slate-700">{plan.descripcion}</p>
              <div className="mt-4">
                <Button
                  className="w-full"
                  variant="secondary"
                  disabled={pending || isCurrent}
                  onClick={() => onSelect(plan)}
                >
                  {isCurrent ? "Plan actual" : "Seleccionar plan"}
                </Button>
              </div>
            </Card>
          );
        })}
      </section>
    </>
  );
}
