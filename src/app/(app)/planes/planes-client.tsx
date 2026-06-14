"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { cancelSubscriptionAction, selectPlanAction } from "@/actions/planes";
import { FormMessage } from "@/components/forms/form-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { SubscriptionRow } from "@/lib/data/planes";
import type { MonetizationLine, PlanItem } from "@/lib/monetizacion-types";
import { LINE_LABELS, LINE_ORDER } from "@/lib/plans";

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

  const groups = useMemo(() => {
    return LINE_ORDER.map((line) => ({
      line,
      label: LINE_LABELS[line],
      items: plans.filter((plan) => plan.linea === line),
    })).filter((group) => group.items.length > 0);
  }, [plans]);

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
        setMessage("Suscripción cancelada.");
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
              <strong>Próximo vencimiento:</strong> {subscription.next_due_date}
            </p>
          ) : null}
          {subscription.status === "pendiente-pago" ? (
            <p className="mt-2 text-sm text-slate-600">
              {paymentsEnabled
                ? "Tu pago está pendiente de confirmación. En cuanto Mercado Pago lo acredite, el plan se activa automáticamente."
                : "El cobro online (Mercado Pago) todavía no está habilitado en este entorno. El equipo CARE activará tu plan manualmente."}
            </p>
          ) : null}
          <div className="mt-4">
            <Button variant="secondary" disabled={pending} onClick={onCancel}>
              Cancelar suscripción
            </Button>
          </div>
        </Card>
      ) : null}

      <FormMessage message={message} type={messageType} />

      {groups.map((group) => (
        <section key={group.line} className="space-y-4">
          <VerticalHeading line={group.line} label={group.label} />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {group.items.map((plan) => {
              const isCurrent =
                subscription !== null &&
                subscription.plan_id === plan.id &&
                subscription.status !== "cancelada";
              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isCurrent={isCurrent}
                  disabled={pending}
                  onSelect={() => onSelect(plan)}
                />
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}

function VerticalHeading({ line, label }: { line: MonetizationLine; label: string }) {
  const subtitles: Record<MonetizationLine, string> = {
    familias: "Para tutores y familias que organizan el cuidado.",
    profesionales:
      "Para cuidadores, médicos, enfermeros, terapeutas, abogados y contadores.",
    empresas: "Para farmacias, ortopedias, residencias y empresas de servicios.",
    "intercambio-donaciones": "Beneficio transversal, siempre gratuito.",
  };
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900">{label}</h2>
      <p className="text-sm text-slate-600">{subtitles[line]}</p>
    </div>
  );
}

function PlanCard({
  plan,
  isCurrent,
  disabled,
  onSelect,
}: {
  plan: PlanItem;
  isCurrent: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const isFree = plan.precioMensual === "$0";
  return (
    <Card className={`flex flex-col p-6 ${plan.destacado ? "ring-2 ring-care-300" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-900">{plan.nombre}</h3>
        <div className="flex gap-1">
          {plan.destacado ? <Badge tone="success">Recomendado</Badge> : null}
          {isCurrent ? <Badge tone="info">Plan actual</Badge> : null}
        </div>
      </div>

      <p className="mt-2">
        <span className="text-2xl font-bold text-slate-900">{plan.precioMensual}</span>
        {!isFree ? <span className="text-sm text-slate-600"> / mes</span> : null}
      </p>
      <p className="mt-2 text-sm text-slate-700">{plan.descripcion}</p>

      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span aria-hidden className="mt-0.5 font-bold text-care-600">
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 pt-2">
        <Button
          className="w-full"
          variant={plan.destacado ? "primary" : "secondary"}
          disabled={disabled || isCurrent}
          onClick={onSelect}
        >
          {isCurrent ? "Plan actual" : isFree ? "Activar gratis" : "Seleccionar plan"}
        </Button>
      </div>
    </Card>
  );
}
