"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  updateAppointmentStatusAction,
  type AppointmentStatus,
} from "@/actions/agenda";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { AgendaServerItem } from "@/lib/data/agenda";

const dateFmt = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
});
const timeFmt = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
});

type Props = {
  items: AgendaServerItem[];
  nowMs: number;
};

type TurnoItem = AgendaServerItem & {
  fechaLabel: string;
  horaLabel: string;
  isPast: boolean;
};

export function TurnosClient({ items, nowMs }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const { upcoming, past } = useMemo(() => {
    const mapped: TurnoItem[] = items.map((it) => {
      const d = new Date(it.startsAt);
      return {
        ...it,
        fechaLabel: dateFmt.format(d),
        horaLabel: timeFmt.format(d),
        isPast: d.getTime() < nowMs,
      };
    });
    return {
      upcoming: mapped.filter((it) => !it.isPast && it.estado !== "completado"),
      past: mapped
        .filter((it) => it.isPast || it.estado === "completado")
        .reverse()
        .slice(0, 10),
    };
  }, [items, nowMs]);

  const onUpdate = (id: string, status: AppointmentStatus) => {
    startTransition(async () => {
      const res = await updateAppointmentStatusAction(id, status);
      if (res.ok) {
        setMessage("Turno actualizado.");
        router.refresh();
      } else {
        setMessage(res.error ?? "No se pudo actualizar.");
      }
    });
  };

  return (
    <section className="space-y-6 pb-10">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Turnos</h1>
        <p className="mt-2 text-slate-700">
          Gestión de turnos médicos: confirmaciones, asistencia y cancelaciones. Para crear un
          turno nuevo usá la Agenda.
        </p>
        <div className="mt-4">
          <Button href="/agenda" variant="secondary">
            Crear turno en Agenda
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900">Próximos turnos</h2>
        <div className="mt-4 space-y-3">
          {upcoming.length === 0 ? (
            <p className="text-sm text-slate-600">
              No hay turnos próximos. Creá uno desde la Agenda.
            </p>
          ) : (
            upcoming.map((turno) => (
              <article
                key={turno.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{turno.titulo}</p>
                    <p className="text-sm capitalize text-slate-700">
                      {turno.fechaLabel} - {turno.horaLabel}
                      {turno.lugar ? ` — ${turno.lugar}` : ""}
                    </p>
                    {turno.responsable ? (
                      <p className="mt-1 text-sm text-slate-600">Con: {turno.responsable}</p>
                    ) : null}
                    {turno.notas ? (
                      <p className="mt-2 text-sm text-slate-700">{turno.notas}</p>
                    ) : null}
                  </div>
                  <StatusBadge status={turno.estado} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {turno.estado === "pendiente" ? (
                    <Button
                      size="md"
                      disabled={pending}
                      onClick={() => onUpdate(turno.id, "confirmed")}
                    >
                      Confirmar asistencia
                    </Button>
                  ) : null}
                  <Button
                    size="md"
                    variant="secondary"
                    disabled={pending}
                    onClick={() => onUpdate(turno.id, "done")}
                  >
                    Marcar realizado
                  </Button>
                  <Button
                    size="md"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => onUpdate(turno.id, "cancelled")}
                  >
                    Cancelar turno
                  </Button>
                </div>
              </article>
            ))
          )}
        </div>
        {message ? (
          <p className="mt-4 text-sm font-medium text-slate-700" role="status">
            {message}
          </p>
        ) : null}
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900">Historial reciente</h2>
        <div className="mt-4 space-y-3">
          {past.length === 0 ? (
            <p className="text-sm text-slate-600">Sin turnos pasados.</p>
          ) : (
            past.map((turno) => (
              <article
                key={turno.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 p-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">{turno.titulo}</p>
                  <p className="text-sm capitalize text-slate-600">
                    {turno.fechaLabel} - {turno.horaLabel}
                  </p>
                </div>
                <StatusBadge status={turno.estado} />
              </article>
            ))
          )}
        </div>
      </Card>
    </section>
  );
}
