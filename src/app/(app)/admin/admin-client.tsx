"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  activateSubscriptionAction,
  moderateMarketplaceItemAction,
  moderateServiceAction,
  reviewRecommendationAction,
} from "@/actions/admin";
import { FormMessage } from "@/components/forms/form-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AdminOverview, AdminRecommendation } from "@/lib/data/admin";
import type { Database } from "@/lib/supabase/types";

type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
type ItemRow = Database["public"]["Tables"]["marketplace_items"]["Row"];
type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];

type Tab = "recomendaciones" | "servicios" | "marketplace" | "suscripciones";

const statusTone = {
  publicado: "success",
  pausado: "warning",
  bloqueado: "danger",
} as const;

const subTone = {
  activa: "success",
  "pendiente-pago": "warning",
  vencida: "danger",
  cancelada: "danger",
} as const;

type Props = {
  overview: AdminOverview;
  recommendations: AdminRecommendation[];
  services: ServiceRow[];
  items: ItemRow[];
  subscriptions: SubscriptionRow[];
};

export function AdminClient({ overview, recommendations, services, items, subscriptions }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("recomendaciones");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, okMsg: string) => {
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        setMessageType("success");
        setMessage(okMsg);
        router.refresh();
      } else {
        setMessageType("error");
        setMessage(res.error ?? "No se pudo completar la accion.");
      }
    });
  };

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "recomendaciones", label: "Recomendaciones", count: overview.pendingRecommendations },
    { id: "servicios", label: "Servicios", count: services.length },
    { id: "marketplace", label: "Marketplace", count: items.length },
    { id: "suscripciones", label: "Suscripciones", count: subscriptions.length },
  ];

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <OverviewStat label="Recomendaciones pendientes" value={overview.pendingRecommendations} />
        <OverviewStat label="Servicios bloqueados" value={overview.blockedServices} />
        <OverviewStat label="Items bloqueados" value={overview.blockedItems} />
        <OverviewStat label="Pagos pendientes" value={overview.pendingSubscriptions} />
        <OverviewStat label="Suscripciones activas" value={overview.activeSubscriptions} />
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Secciones de administracion">
        {tabs.map((t) => (
          <Button
            key={t.id}
            variant={tab === t.id ? "primary" : "secondary"}
            onClick={() => setTab(t.id)}
          >
            {t.label} ({t.count})
          </Button>
        ))}
      </div>

      <FormMessage message={message} type={messageType} />

      {tab === "recomendaciones" ? (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-900">Recomendaciones pendientes</h2>
          <div className="mt-4 space-y-3">
            {recommendations.length === 0 ? (
              <p className="text-sm text-slate-600">No hay recomendaciones por revisar.</p>
            ) : (
              recommendations.map((rec) => (
                <article key={rec.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{rec.caregiverName}</p>
                      <p className="text-sm text-slate-600">
                        Recomienda: {rec.recommender_name} · General {rec.score_general}/5
                      </p>
                    </div>
                    <Badge tone="warning">Pendiente</Badge>
                  </div>
                  {rec.comment ? <p className="mt-2 text-sm text-slate-700">{rec.comment}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      disabled={pending}
                      onClick={() => run(() => reviewRecommendationAction(rec.id, "aprobada"), "Recomendacion aprobada.")}
                    >
                      Aprobar
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={pending}
                      onClick={() => run(() => reviewRecommendationAction(rec.id, "rechazada"), "Recomendacion rechazada.")}
                    >
                      Rechazar
                    </Button>
                  </div>
                </article>
              ))
            )}
          </div>
        </Card>
      ) : null}

      {tab === "servicios" ? (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-900">Servicios publicados</h2>
          <div className="mt-4 space-y-3">
            {services.length === 0 ? (
              <p className="text-sm text-slate-600">No hay servicios cargados.</p>
            ) : (
              services.map((service) => (
                <article key={service.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{service.provider_name}</p>
                      <p className="text-sm text-slate-600">{service.category}</p>
                    </div>
                    <Badge tone={statusTone[service.status]}>{service.status}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {service.status === "bloqueado" ? (
                      <Button
                        disabled={pending}
                        onClick={() => run(() => moderateServiceAction(service.id, "publicado"), "Servicio restaurado.")}
                      >
                        Restaurar
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        disabled={pending}
                        onClick={() => run(() => moderateServiceAction(service.id, "bloqueado"), "Servicio bloqueado.")}
                      >
                        Bloquear
                      </Button>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </Card>
      ) : null}

      {tab === "marketplace" ? (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-900">Publicaciones de marketplace</h2>
          <div className="mt-4 space-y-3">
            {items.length === 0 ? (
              <p className="text-sm text-slate-600">No hay publicaciones cargadas.</p>
            ) : (
              items.map((item) => (
                <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-600">
                        {item.listing_type} · {item.zone}
                      </p>
                    </div>
                    <Badge tone={statusTone[item.status]}>{item.status}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.status === "bloqueado" ? (
                      <Button
                        disabled={pending}
                        onClick={() => run(() => moderateMarketplaceItemAction(item.id, "publicado"), "Publicacion restaurada.")}
                      >
                        Restaurar
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        disabled={pending}
                        onClick={() => run(() => moderateMarketplaceItemAction(item.id, "bloqueado"), "Publicacion bloqueada.")}
                      >
                        Bloquear
                      </Button>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </Card>
      ) : null}

      {tab === "suscripciones" ? (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-900">Suscripciones</h2>
          <div className="mt-4 space-y-3">
            {subscriptions.length === 0 ? (
              <p className="text-sm text-slate-600">No hay suscripciones registradas.</p>
            ) : (
              subscriptions.map((sub) => (
                <article key={sub.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{sub.plan_name}</p>
                      <p className="text-sm text-slate-600">
                        {sub.amount} / {sub.billing_cycle}
                      </p>
                    </div>
                    <Badge tone={subTone[sub.status]}>{sub.status}</Badge>
                  </div>
                  {sub.status === "pendiente-pago" ? (
                    <div className="mt-3">
                      <Button
                        disabled={pending}
                        onClick={() => run(() => activateSubscriptionAction(sub.id), "Suscripcion activada.")}
                      >
                        Activar manualmente
                      </Button>
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </Card>
      ) : null}
    </>
  );
}

function OverviewStat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-600">{label}</p>
    </Card>
  );
}
