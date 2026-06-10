"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { sendCaregiverUpdateReminderAction } from "@/actions/admin";
import { FormMessage } from "@/components/forms/form-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CaregiverUpdateStatus } from "@/lib/data/admin";

const statusTone = {
  "datos-actualizados": "success",
  "pendiente-actualizacion": "warning",
  "datos-vencidos": "danger",
  "perfil-pausado": "danger",
} as const;

type Props = {
  caregivers: CaregiverUpdateStatus[];
};

export function ReminderList({ caregivers }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const onSend = (caregiverId: string) => {
    startTransition(async () => {
      const res = await sendCaregiverUpdateReminderAction(caregiverId);
      if (res.ok && res.delivered) {
        setMessageType("success");
        setMessage("Recordatorio enviado.");
        router.refresh();
      } else if (res.ok) {
        setMessageType("error");
        setMessage(res.error ?? "Registrado, pero sin destinatario para el aviso.");
      } else {
        setMessageType("error");
        setMessage(res.error ?? "No se pudo enviar el recordatorio.");
      }
    });
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-slate-900">Cuidadores con datos por actualizar</h2>
      <FormMessage message={message} type={messageType} />
      <div className="mt-4 space-y-3">
        {caregivers.length === 0 ? (
          <p className="text-sm text-slate-600">Todos los perfiles estan al dia.</p>
        ) : (
          caregivers.map((c) => (
            <article key={c.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-base font-semibold text-slate-900">{c.fullName}</p>
                <Badge tone={statusTone[c.profileStatus]}>{c.profileStatus}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-700">
                Ultima actualizacion: {c.lastProfileUpdate ?? "sin registro"}
              </p>
              {!c.linkedUserId ? (
                <p className="text-sm text-warning-700">Sin cuenta vinculada.</p>
              ) : null}
              <div className="mt-3">
                <Button variant="secondary" disabled={pending} onClick={() => onSend(c.id)}>
                  Enviar recordatorio
                </Button>
              </div>
            </article>
          ))
        )}
      </div>
    </Card>
  );
}
