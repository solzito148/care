"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { markNotificationReadAction } from "@/actions/notifications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { NotificationRow } from "@/lib/data/notifications";

const kindTone = {
  info: "info",
  warning: "warning",
  urgent: "danger",
  billing: "neutral",
} as const;

const kindLabel = {
  info: "Info",
  warning: "Atencion",
  urgent: "Urgente",
  billing: "Facturacion",
} as const;

type Props = {
  notifications: NotificationRow[];
};

export function NotificationsCard({ notifications }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onMarkRead = (id: string) => {
    startTransition(async () => {
      const res = await markNotificationReadAction(id);
      if (res.ok) router.refresh();
    });
  };

  return (
    <Card className="p-6 sm:p-7">
      <h2 className="text-xl font-semibold text-slate-900">Notificaciones</h2>
      <div className="mt-4 space-y-3">
        {notifications.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-700">
            No tenes notificaciones.
          </p>
        ) : (
          notifications.map((n) => (
            <article
              key={n.id}
              className={`rounded-xl border p-4 ${
                n.read_at ? "border-slate-200 bg-slate-50" : "border-care-200 bg-care-50"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-base font-semibold text-slate-900">{n.title}</p>
                <Badge tone={kindTone[n.kind]}>{kindLabel[n.kind]}</Badge>
              </div>
              {n.body ? <p className="mt-1 text-sm text-slate-700">{n.body}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {n.href ? (
                  <Button variant="ghost" href={n.href}>
                    Ver mas
                  </Button>
                ) : null}
                {!n.read_at ? (
                  <Button
                    variant="secondary"
                    disabled={pending}
                    onClick={() => onMarkRead(n.id)}
                  >
                    Marcar como leida
                  </Button>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>
    </Card>
  );
}
