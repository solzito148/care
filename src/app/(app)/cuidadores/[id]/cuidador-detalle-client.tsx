"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  confirmCaregiverDataUpdatedAction,
  requestCaregiverContactAction,
} from "@/actions/cuidadores";
import { assignCaregiverFromDirectoryAction } from "@/actions/relaciones";
import { VerifiedBadge } from "@/app/(app)/cuidadores/cuidadores-client";
import { FormMessage } from "@/components/forms/form-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type {
  CaregiverApprovedRecommendation,
  CaregiverReferencePublic,
  CaregiverSearchItem,
} from "@/lib/cuidadores-types";
import { tierCapabilities, telLink, whatsappLink } from "@/lib/professional-tier";

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
  const caps = tierCapabilities(caregiver.tier);
  const directWhatsapp = caps.showDirectContact ? caregiver.whatsappContacto : undefined;
  const directPhone = caps.showDirectContact ? caregiver.telefonoContacto : undefined;

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, okMsg: string) => {
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        setMessageType("success");
        setMessage(okMsg);
        router.refresh();
      } else {
        setMessageType("error");
        setMessage(res.error ?? "No se pudo completar la acción.");
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
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{caregiver.nombre}</h1>
              {caps.isVerified ? <VerifiedBadge /> : null}
            </div>
            <p className="text-sm text-slate-600">Última actualización: {caregiver.ultimaActualizacion}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">Calificación: {caregiver.calificacion.toFixed(1)}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {caregiver.recomendadoCare ? <Badge tone="success">Recomendado CARE</Badge> : null}
          {caregiver.referenciasVerificadas ? (
            <Badge tone="success">Referencias verificadas</Badge>
          ) : (
            <Badge tone="warning">Referencias en revisión</Badge>
          )}
          {caregiver.datosActualizados ? <Badge tone="info">Datos actualizados</Badge> : null}
          {caregiver.estadoActualizacionPerfil === "pendiente-actualizacion" ? <Badge tone="warning">Pendiente de actualización</Badge> : null}
          {caregiver.estadoActualizacionPerfil === "datos-vencidos" ? <Badge tone="danger">Datos vencidos</Badge> : null}
          {caregiver.estadoActualizacionPerfil === "perfil-pausado" ? <Badge tone="danger">Perfil pausado</Badge> : null}
        </div>
        <p className="mt-3 text-sm text-slate-700">Última actualización del perfil: {caregiver.ultimaActualizacion}</p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-900">Datos generales</h2>
          <p className="mt-2 text-sm text-slate-700">Zona principal: {caregiver.localidad}</p>
          <p className="mt-1 text-sm text-slate-700">Experiencia: {caregiver.experiencia} años</p>
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
                  Teléfono: {isAuthorizedTutor ? ref.telefono : "Visible solo para tutores autorizados"}
                </p>
              </article>
            ))
          )}
        </div>
      </Card>

      {caps.showReviews ? (
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
              Este cuidador todavía no tiene recomendaciones aprobadas.
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
                  <p className="mt-1 text-sm font-medium text-success-700">Lo volvería a contratar</p>
                ) : null}
              </article>
            ))
          )}
        </div>
      </Card>
      ) : null}

      {caps.hasIntegratedAgenda ? (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-900">Agenda integrada</h2>
          <p className="mt-2 text-sm text-slate-700">
            Este profesional ofrece reserva de turnos y entrevistas online. Elegí un horario y CARE coordina la confirmación.
          </p>
          <div className="mt-3">
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() =>
                run(
                  () => requestCaregiverContactAction(caregiver.id, "entrevista"),
                  "Solicitud de reserva enviada. Coordinamos el horario."
                )
              }
            >
              Reservar turno / entrevista
            </Button>
          </div>
        </Card>
      ) : null}

      {caps.hasProfileStats ? (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-900">Estadísticas de perfil</h2>
          <p className="mt-1 text-sm text-slate-600">
            Panel Premium, visible para el profesional dueño del perfil.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <StatBox label="Vistas del perfil" value="—" />
            <StatBox label="Clics en WhatsApp" value="—" />
            <StatBox label="Solicitudes de contacto" value="—" />
          </div>
        </Card>
      ) : null}

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900">Acciones</h2>
        {directWhatsapp || directPhone ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {directWhatsapp ? (
              <a
                href={whatsappLink(directWhatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-xl2 bg-care-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-care-800"
              >
                Enviar WhatsApp
              </a>
            ) : null}
            {directPhone ? (
              <a
                href={telLink(directPhone)}
                className="inline-flex min-h-11 items-center justify-center rounded-xl2 border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Llamar
              </a>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">
            Este perfil tiene contacto por chat interno de CARE. Coordinamos el contacto sin
            exponer datos directos.
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            disabled={pending}
            onClick={() =>
              run(
                () => assignCaregiverFromDirectoryAction(caregiver.id),
                "Cuidador asignado a tu adulto mayor."
              )
            }
          >
            Asignar a mi adulto mayor
          </Button>
          <Button
            variant="secondary"
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
            Contactar por Chat de CARE
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
            Confirmar que mis datos están actualizados
          </Button>
          <Button href="/cuidadores/recomendar" variant="secondary">
            Recomendar cuidador
          </Button>
          <Button href="/cuidadores" variant="ghost">
            Volver a búsqueda
          </Button>
        </div>
        <div className="mt-3">
          <FormMessage message={message} type={messageType} />
        </div>
      </Card>
    </section>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-600">{label}</p>
    </div>
  );
}
