"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CaregiverReferencePublic, CaregiverSearchItem } from "@/lib/cuidadores-types";

type Props = {
  caregiver: CaregiverSearchItem;
  references: CaregiverReferencePublic[];
};

export function CuidadorDetalleClient({ caregiver, references }: Props) {
  const searchParams = useSearchParams();
  const [confirmedUpdated, setConfirmedUpdated] = useState(false);

  const isAuthorizedTutor = searchParams.get("authorized") === "1";

  return (
    <section className="space-y-4 pb-8">
      <Card className="p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-care-100 text-xl font-bold text-care-800">
            {caregiver.foto}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{caregiver.nombre}</h1>
            <p className="text-sm text-slate-600">Ultima actualizacion: {caregiver.ultimaActualizacion}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">Calificacion: {caregiver.calificacion.toFixed(1)}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {caregiver.recomendadoCare ? <Badge tone="success">Recomendado CARE</Badge> : null}
          {caregiver.referenciasVerificadas ? (
            <Badge tone="success">Referencias verificadas</Badge>
          ) : (
            <Badge tone="warning">Referencias en revision</Badge>
          )}
          {caregiver.datosActualizados ? <Badge tone="info">Datos actualizados</Badge> : null}
          {caregiver.estadoActualizacionPerfil === "pendiente-actualizacion" ? <Badge tone="warning">Pendiente de actualizacion</Badge> : null}
          {caregiver.estadoActualizacionPerfil === "datos-vencidos" ? <Badge tone="danger">Datos vencidos</Badge> : null}
          {caregiver.estadoActualizacionPerfil === "perfil-pausado" ? <Badge tone="danger">Perfil pausado</Badge> : null}
        </div>
        <p className="mt-3 text-sm text-slate-700">Ultima actualizacion del perfil: {caregiver.ultimaActualizacion}</p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-900">Datos generales</h2>
          <p className="mt-2 text-sm text-slate-700">Zona principal: {caregiver.localidad}</p>
          <p className="mt-1 text-sm text-slate-700">Experiencia: {caregiver.experiencia} anios</p>
          <p className="mt-1 text-sm text-slate-700">Zonas donde trabaja: {caregiver.zonasTrabajo.join(", ")}</p>
          <p className="mt-1 text-sm text-slate-700">Modalidades aceptadas: {caregiver.modalidades.join(", ")}</p>
          <p className="mt-1 text-sm text-slate-700">Disponibilidad especial: {caregiver.disponibilidadEspecial.join(", ")}</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-900">Experiencia y tareas</h2>
          <ul className="mt-3 space-y-1 text-sm text-slate-700">
            {caregiver.tareas.map((task) => (
              <li key={task}>- {task}</li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900">Referencias laborales</h2>
        <div className="mt-4 space-y-3">
          {references.length === 0 ? (
            <p className="text-sm text-slate-600">No hay referencias cargadas para este perfil.</p>
          ) : (
            references.map((ref) => (
              <article key={`${ref.nombreContratante}-${ref.periodo}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{ref.nombreContratante}</p>
                <p className="text-sm text-slate-700">
                  {ref.zona} - {ref.periodo}
                </p>
                <p className="text-sm text-slate-700">Modalidad: {ref.modalidad}</p>
                <p className="text-sm text-slate-700">Tareas: {ref.tareas}</p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  Telefono: {isAuthorizedTutor ? ref.telefono : "Visible solo para tutores autorizados"}
                </p>
              </article>
            ))
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900">Recomendaciones CARE aprobadas</h2>
        <p className="mt-2 text-sm text-slate-600">
          Las recomendaciones verificadas se integraran en una siguiente iteracion (tabla dedicada).
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900">Acciones</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button>Solicitar entrevista</Button>
          <Button variant="secondary">Contactar</Button>
          <Button variant="secondary" onClick={() => setConfirmedUpdated(true)}>
            Confirmar que mis datos estan actualizados
          </Button>
          <Button href="/cuidadores/recomendar" variant="secondary">
            Recomendar cuidador
          </Button>
          <Button href="/cuidadores" variant="ghost">
            Volver a busqueda
          </Button>
        </div>
        {confirmedUpdated ? (
          <p className="mt-3 text-sm font-semibold text-success-700">
            Confirmacion registrada localmente. Persistencia de esta accion puede agregarse con auditoria en backend.
          </p>
        ) : null}
      </Card>
    </section>
  );
}
