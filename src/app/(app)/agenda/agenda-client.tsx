"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAppointmentAction } from "@/actions/agenda";
import { AddressAutocomplete } from "@/components/forms/address-autocomplete";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AgendaEventStatus } from "@/lib/agenda-types";
import { AR_PROVINCIAS } from "@/lib/ar-provincias";
import type { AgendaServerItem } from "@/lib/data/agenda";

const estadoStyles: Record<AgendaEventStatus, string> = {
  pendiente: "bg-warning-100 text-warning-700",
  confirmado: "bg-info-100 text-info-700",
  urgente: "bg-danger-100 text-danger-700",
  completado: "bg-success-100 text-success-700",
};

const dateFmt = new Intl.DateTimeFormat("es-AR", {
  weekday: "short",
  day: "2-digit",
  month: "short",
});
const timeFmt = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
});

type Props = {
  items: AgendaServerItem[];
};

type FormatItem = AgendaServerItem & { fechaLabel: string; horaLabel: string };

export function AgendaClient({ items }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [titulo, setTitulo] = useState("");
  const [profesional, setProfesional] = useState("");
  const [lugar, setLugar] = useState("");
  const [direccion, setDireccion] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [provincia, setProvincia] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [notas, setNotas] = useState("");
  const [msg, setMsg] = useState("");

  const formatted = useMemo<FormatItem[]>(
    () =>
      items.map((it) => {
        const d = new Date(it.startsAt);
        return {
          ...it,
          fechaLabel: dateFmt.format(d),
          horaLabel: timeFmt.format(d),
        };
      }),
    [items]
  );

  const onCreate = (e: FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const tzOffsetMinutes = new Date().getTimezoneOffset();
      const res = await createAppointmentAction({
        titulo,
        profesional,
        lugar,
        direccion,
        localidad,
        provincia,
        fecha,
        hora,
        notas,
        tzOffsetMinutes,
      });
      if (res.ok) {
        setTitulo("");
        setProfesional("");
        setLugar("");
        setDireccion("");
        setLocalidad("");
        setProvincia("");
        setFecha("");
        setHora("");
        setNotas("");
        setMsg("Turno guardado.");
        router.refresh();
      } else {
        setMsg(res.error ?? "Error");
      }
    });
  };

  return (
    <section className="space-y-6 pb-10">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Agenda</h1>
        <p className="mt-2 text-slate-700">
          Turnos y actividades del cuidado. Los eventos se guardan en tu cuenta y son visibles para miembros del hogar.
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900">Próximos turnos</h2>
        <div className="mt-4 space-y-3">
          {formatted.length === 0 ? (
            <p className="text-sm text-slate-600">No hay turnos cargados. Agrega uno con el formulario.</p>
          ) : (
            formatted.map((ev) => (
              <article key={ev.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-lg font-semibold text-slate-900">{ev.titulo}</p>
                <p className="text-sm text-slate-700">
                  {ev.fechaLabel} {ev.horaLabel}
                  {ev.lugar ? ` — ${ev.lugar}` : ""}
                </p>
                {ev.direccion ? <p className="mt-1 text-sm text-slate-600">{ev.direccion}</p> : null}
                {ev.localidad || ev.provincia ? (
                  <p className="text-sm text-slate-600">
                    {[ev.localidad, ev.provincia].filter(Boolean).join(", ")}
                  </p>
                ) : null}
                {ev.responsable ? <p className="mt-1 text-sm text-slate-600">Con: {ev.responsable}</p> : null}
                {ev.notas ? <p className="mt-2 text-sm text-slate-700">{ev.notas}</p> : null}
                <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${estadoStyles[ev.estado]}`}>
                  {ev.estado}
                </span>
              </article>
            ))
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900">Nuevo turno médico</h2>
        <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={onCreate}>
          <Input label="Título" className="sm:col-span-2" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          <Input label="Profesional / institución" value={profesional} onChange={(e) => setProfesional(e.target.value)} />
          <Input
            label="Lugar"
            hint="Nombre del lugar, ej: Hospital Italiano - Consultorio 3"
            value={lugar}
            onChange={(e) => setLugar(e.target.value)}
          />
          <AddressAutocomplete
            className="sm:col-span-2"
            value={direccion}
            hint="Escribí calle y altura; se valida con GeoRef (Argentina) y completa localidad y provincia."
            onChange={setDireccion}
            onSelect={(sel) => {
              setDireccion(sel.direccion);
              setLocalidad(sel.localidad);
              setProvincia(sel.provincia);
            }}
          />
          <label className="block text-sm font-medium text-slate-800">
            Provincia
            <select
              value={provincia}
              onChange={(e) => setProvincia(e.target.value)}
              className="mt-2 min-h-12 w-full rounded-xl2 border border-slate-300 bg-white px-4 text-base text-slate-900 shadow-sm transition focus:border-care-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-care-200"
            >
              <option value="">Seleccioná una provincia</option>
              {provincia && !AR_PROVINCIAS.includes(provincia as (typeof AR_PROVINCIAS)[number]) ? (
                <option value={provincia}>{provincia}</option>
              ) : null}
              {AR_PROVINCIAS.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Localidad"
            hint="Se completa con la dirección; podés editarla."
            value={localidad}
            onChange={(e) => setLocalidad(e.target.value)}
          />
          <Input type="date" label="Fecha" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          <Input type="time" label="Hora" value={hora} onChange={(e) => setHora(e.target.value)} />
          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-slate-800">Notas</span>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="mt-2 min-h-24 w-full rounded-xl2 border border-slate-300 px-4 py-3 text-base"
            />
          </label>
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <Button type="submit" disabled={pending}>
              Guardar turno
            </Button>
          </div>
        </form>
        {msg ? <p className="mt-3 text-sm font-medium text-slate-700">{msg}</p> : null}
      </Card>
    </section>
  );
}
