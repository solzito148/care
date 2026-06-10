"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  confirmCaregiverDataUpdatedAction,
  requestCaregiverContactAction,
} from "@/actions/cuidadores";
import { FormMessage } from "@/components/forms/form-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type {
  CaregiverApprovedRecommendation,
  CaregiverReferencePublic,
  CaregiverSearchItem,
} from "@/lib/cuidadores-types";

type Props = {
  caregiver: CaregiverSearchItem;
  references: CaregiverReferencePublic[];
  recommendations: CaregiverApprovedRecommendation[];
};

export function CuidadorDetalleClient({ caregiver, references, recommendations }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const isAuthorizedTutor = searchParams.get("authorized") === "1";

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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold text-slate-900">Recomendaciones CARE aprobadas</h2>
          {caregiver.recomendacionesCount > 0 ? (
            <Badge tone="success">
              {caregiver.recomendacionesPromedio.toFixed(1)} promedio · {caregiver.recomendacionesCount}
            </Badge>
          ) : null}
        </div>
        <div className="mt-4 space-y-3">
          {recommendations.length === 0 ? (
            <p className="text-sm text-slate-600">
              Este cuidador todavia no tiene recomendaciones aprobadas.
            </p>
          ) : (
            recommendations.map((rec) => (
              <article key={rec.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold text-slate-900">{rec.personaQueRecomienda}</p>
                  <Badge tone="info">{rec.calificacionGeneral}/5</Badge>
                </div>
                {rec.zonaServicio || rec.modalidadServicio ? (
                  <p className="text-sm text-slate-700">
                    {[rec.zonaServicio, rec.modalidadServicio].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
                {rec.comentario ? <p className="mt-1 text-sm text-slate-700">{rec.comentario}</p> : null}
                {rec.loVolveriaAContratar ? (
                  <p className="mt-1 text-sm font-medium text-success-700">Lo volveria a contratar</p>
                ) : null}
              </article>
            ))
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900">Acciones</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            disabled={pending}
            onClick={() =>
              run(
                () => requestCaregiverContactAction(caregiver.id, "entrevista"),
                "Solicitud de entrevista enviada. CARE coordina el contacto."
              )
            }
          >
            Solicitar entrevista
          </Button>
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() =>
              run(
                () => requestCaregiverContactAction(caregiver.id, "contacto"),
                "Solicitud de contacto enviada. CARE coordina el contacto."
              )
            }
          >
            Contactar
          </Button>
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() =>
              run(
                () => confirmCaregiverDataUpdatedAction(caregiver.id),
                "Datos confirmados como actualizados."
              )
            }
          >
            Confirmar que mis datos estan actualizados
          </Button>
          <Button href="/cuidadores/recomendar" variant="secondary">
            Recomendar cuidador
          </Button>
          <Button href="/cuidadores" variant="ghost">
            Volver a busqueda
          </Button>
        </div>
        <div className="mt-3">
          <FormMessage message={message} type={messageType} />
        </div>
      </Card>
    </section>
  );
}
