"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

export default function PersonaPage() {
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

  const todayActivities = [
    { text: "Tomar Losartan - 1 comprimido - 09:00", status: "pendiente" as const, type: "Medicamento" },
    { text: "Turno clinica medica - 11:30", status: "proximo" as const, type: "Turno" },
    { text: "Kinesiologia - 16:00", status: "confirmado" as const, type: "Terapia" },
    { text: "Control de laboratorio - 18:00", status: "proximo" as const, type: "Estudio" },
  ];

  const tomorrowReminder = "Manana 10:30 - Estudio de sangre (ayuno de 8 horas).";

  return (
    <section className="space-y-4 pb-40">
      <Card className="p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">Vista simple</p>
        <h1 className="mt-2 text-simple-title text-slate-900">Rosa Martinez</h1>
        <p className="mt-3 text-simple-text capitalize text-slate-700">{todayLabel}</p>
        <p className="mt-1 text-4xl font-bold text-care-800">{timeLabel}</p>
      </Card>

      <Card className="p-6 sm:p-8">
        <h2 className="text-3xl font-bold text-slate-900">Ahora</h2>
        <p className="mt-4 text-2xl font-semibold text-slate-900">
          Tomar Losartan - 1 comprimido - 09:00
        </p>
        <div className="mt-4">
          <StatusBadge status="pendiente" />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Button size="lg" className="min-h-14 text-lg">
            Ya lo tome
          </Button>
          <Button variant="secondary" size="lg" className="min-h-14 text-lg">
            Necesito ayuda
          </Button>
        </div>
      </Card>

      <Card className="p-6 sm:p-8">
        <h2 className="text-3xl font-bold text-slate-900">Hoy</h2>
        <div className="mt-4 space-y-3">
          {todayActivities.map((activity) => (
            <article key={activity.text} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-600">{activity.type}</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{activity.text}</p>
              <div className="mt-3">
                <StatusBadge status={activity.status} />
              </div>
            </article>
          ))}
        </div>
      </Card>

      <Card className="p-6 sm:p-8">
        <h2 className="text-3xl font-bold text-slate-900">Manana</h2>
        <p className="mt-4 text-xl font-semibold text-slate-900">{tomorrowReminder}</p>
        <p className="mt-2 text-base text-slate-700">Recordatorio anticipado de 1 dia.</p>
        <div className="mt-3">
          <StatusBadge status="urgente" />
        </div>
      </Card>

      <div className="fixed inset-x-0 bottom-16 z-20 bg-white/95 px-3 py-3 backdrop-blur lg:bottom-0 lg:px-6">
        <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-2 sm:grid-cols-3">
          <a
            href="tel:+541100000001"
            className="inline-flex min-h-14 items-center justify-center rounded-xl2 border border-slate-300 bg-white px-4 text-lg font-semibold text-slate-900"
          >
            Llamar tutor
          </a>
          <a
            href="tel:+541100000002"
            className="inline-flex min-h-14 items-center justify-center rounded-xl2 border border-slate-300 bg-white px-4 text-lg font-semibold text-slate-900"
          >
            Llamar cuidador
          </a>
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
