"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { registerIntakeAction } from "@/actions/medicacion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { PersonaViewData } from "@/lib/data/dashboard";

type Props = {
  data: PersonaViewData;
};

export function PersonaClient({ data }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const todayLabel = useMemo(
    () =>
      now.toLocaleDateString("es-AR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    [now]
  );

  const timeLabel = useMemo(
    () => now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
    [now]
  );

  const onConfirmIntake = (scheduleId: string) => {
    startTransition(async () => {
      const res = await registerIntakeAction(scheduleId, "taken");
      if (res.ok) {
        setMessage("Registrado. Buen trabajo.");
        router.refresh();
      } else {
        setMessage(res.error ?? "No pudimos registrarlo. Pedí ayuda.");
      }
    });
  };

  const current = data.current;

  return (
    <section className="space-y-4 pb-40">
      <Card className="p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">Vista simple</p>
        <h1 className="mt-2 text-simple-title text-slate-900">{data.displayName}</h1>
        <p className="mt-3 text-simple-text capitalize text-slate-700">{todayLabel}</p>
        <p className="mt-1 text-4xl font-bold text-care-800">{timeLabel}</p>
      </Card>

      <Card className="p-6 sm:p-8">
        <h2 className="text-3xl font-bold text-slate-900">Ahora</h2>
        {current ? (
          <>
            <p className="mt-4 text-2xl font-semibold text-slate-900">
              {current.text} - {current.timeLabel}
            </p>
            <div className="mt-4">
              <StatusBadge status={current.status} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {current.scheduleId ? (
                <Button
                  size="lg"
                  className="min-h-14 text-lg"
                  disabled={pending}
                  onClick={() => onConfirmIntake(current.scheduleId!)}
                >
                  Ya lo tomé
                </Button>
              ) : null}
              {data.tutorPhone || data.caregiverPhone ? (
                <Button
                  variant="secondary"
                  size="lg"
                  className="min-h-14 text-lg"
                  href={`tel:${data.tutorPhone ?? data.caregiverPhone}`}
                >
                  Necesito ayuda
                </Button>
              ) : null}
            </div>
            {message ? (
              <p className="mt-4 text-lg font-semibold text-care-800" role="status">
                {message}
              </p>
            ) : null}
          </>
        ) : (
          <p className="mt-4 text-2xl font-semibold text-slate-700">
            No hay actividades pendientes ahora.
          </p>
        )}
      </Card>

      <Card className="p-6 sm:p-8">
        <h2 className="text-3xl font-bold text-slate-900">Hoy</h2>
        <div className="mt-4 space-y-3">
          {data.activities.length === 0 ? (
            <p className="text-xl font-semibold text-slate-700">
              No hay actividades cargadas para hoy.
            </p>
          ) : (
            data.activities.map((activity) => (
              <article
                key={activity.key}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-sm font-semibold text-slate-600">{activity.type}</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {activity.text} - {activity.timeLabel}
                </p>
                <div className="mt-3">
                  <StatusBadge status={activity.status} />
                </div>
              </article>
            ))
          )}
        </div>
      </Card>

      <Card className="p-6 sm:p-8">
        <h2 className="text-3xl font-bold text-slate-900">Mañana</h2>
        {data.tomorrowReminders.length === 0 ? (
          <p className="mt-4 text-xl font-semibold text-slate-700">
            No hay recordatorios para mañana.
          </p>
        ) : (
          data.tomorrowReminders.map((reminder) => (
            <p key={reminder} className="mt-4 text-xl font-semibold text-slate-900">
              {reminder}
            </p>
          ))
        )}
      </Card>

      <div className="fixed inset-x-0 bottom-16 z-20 bg-white/95 px-3 py-3 backdrop-blur lg:bottom-0 lg:px-6">
        <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-2 sm:grid-cols-3">
          {data.tutorPhone ? (
            <a
              href={`tel:${data.tutorPhone}`}
              className="inline-flex min-h-14 items-center justify-center rounded-xl2 border border-slate-300 bg-white px-4 text-lg font-semibold text-slate-900"
            >
              Llamar tutor
            </a>
          ) : null}
          {data.caregiverPhone ? (
            <a
              href={`tel:${data.caregiverPhone}`}
              className="inline-flex min-h-14 items-center justify-center rounded-xl2 border border-slate-300 bg-white px-4 text-lg font-semibold text-slate-900"
            >
              Llamar cuidador
            </a>
          ) : null}
          <a
            href="tel:107"
            className="inline-flex min-h-14 items-center justify-center rounded-xl2 bg-danger-700 px-4 text-lg font-semibold text-white"
          >
            Emergencia
          </a>
        </div>
      </div>
    </section>
  );
}
