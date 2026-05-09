"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  caregiverReminderStatusMock,
  EMAIL_UPDATE_REMINDER_SUBJECT,
  WHATSAPP_UPDATE_REMINDER_TEXT,
  sendCaregiverUpdateReminderEmailMock,
  sendCaregiverUpdateReminderWhatsAppMock,
} from "@/lib/caregiver-reminders-mock";

const deliveryStyles = {
  enviado: "bg-info-100 text-info-700",
  confirmado: "bg-success-100 text-success-700",
  vencido: "bg-danger-100 text-danger-700",
} as const;

export default function AdminActualizacionCuidadoresPage() {
  const [message, setMessage] = useState("");

  const sendBothMock = async (caregiverId: string) => {
    const wa = await sendCaregiverUpdateReminderWhatsAppMock(caregiverId);
    const email = await sendCaregiverUpdateReminderEmailMock(caregiverId);
    setMessage(
      `Recordatorios mock enviados para ${caregiverId}: WhatsApp ${wa.status}, Email ${email.status}.`
    );
  };

  return (
    <section className="space-y-4 pb-8">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Admin - Actualizacion de perfiles de cuidadores
        </h1>
        <p className="mt-2 text-slate-700">
          Recordatorio mensual por WhatsApp y email para verificar y actualizar datos.
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900">Plantillas de mensaje</h2>
        <p className="mt-3 text-sm text-slate-700">
          <strong>WhatsApp:</strong> {WHATSAPP_UPDATE_REMINDER_TEXT}
        </p>
        <p className="mt-2 text-sm text-slate-700">
          <strong>Email asunto:</strong> {EMAIL_UPDATE_REMINDER_SUBJECT}
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900">Estado de recordatorios</h2>
        <div className="mt-4 space-y-3">
          {caregiverReminderStatusMock.map((item) => (
            <article key={item.caregiverId} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-base font-semibold text-slate-900">{item.caregiverNombre}</p>
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${deliveryStyles[item.estadoEnvio]}`}>
                  {item.estadoEnvio}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700">
                Estado actualizacion perfil: {item.estadoActualizacionPerfil}
              </p>
              <p className="text-sm text-slate-700">
                Ultima actualizacion del perfil: {item.ultimaActualizacionPerfil}
              </p>
              <p className="text-sm text-slate-700">
                Ultimo recordatorio WhatsApp: {item.ultimoRecordatorioWhatsApp}
              </p>
              <p className="text-sm text-slate-700">
                Ultimo recordatorio email: {item.ultimoRecordatorioEmail}
              </p>
              <div className="mt-3">
                <Button variant="secondary" onClick={() => void sendBothMock(item.caregiverId)}>
                  Simular envio mensual
                </Button>
              </div>
            </article>
          ))}
        </div>
        {message ? <p className="mt-3 text-sm font-semibold text-success-700">{message}</p> : null}
      </Card>
    </section>
  );
}
