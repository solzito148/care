"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createRelationshipAction,
  decideRelationshipAction,
  setRelationshipManagerAction,
} from "@/actions/relaciones";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { RelationshipView } from "@/lib/data/relaciones";
import type { RelationshipType } from "@/lib/supabase/types";

const TYPE_LABELS: Record<RelationshipType, string> = {
  caregiver: "Cuidador/a",
  professional: "Profesional de salud",
  family: "Familiar",
  legal: "Responsable legal",
  other: "Otro vínculo",
};

// Parentesco que se deriva cuando el Tipo es "Familiar".
const FAMILY_RELATION_OPTIONS = [
  "Hija/o",
  "Hermano/a",
  "Tío/Tía",
  "Primo/a",
  "Cónyuge",
  "Concubino/a",
  "Nieto/a",
  "Sobrino/a",
  "Otro",
];

type Props = {
  careRecipientId: string;
  canModerate: boolean;
  canDelegate: boolean;
  canPropose: boolean;
  ownerName: string;
  ownerIsYou: boolean;
  active: RelationshipView[];
  pending: RelationshipView[];
  allowedTypes: RelationshipType[];
};

export function RelacionesSection({
  careRecipientId,
  canModerate,
  canDelegate,
  canPropose,
  ownerName,
  ownerIsYou,
  active,
  pending,
  allowedTypes,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  const [type, setType] = useState<RelationshipType>(allowedTypes[0] ?? "other");
  const [relation, setRelation] = useState(FAMILY_RELATION_OPTIONS[0]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const decide = (relationshipId: string, decision: "approved" | "rejected" | "revoked") => {
    setMessage(null);
    startTransition(async () => {
      const res = await decideRelationshipAction({ relationshipId, decision });
      if (res.ok) {
        router.refresh();
      } else {
        setMessage({ ok: false, text: res.error ?? "No se pudo actualizar." });
      }
    });
  };

  const delegate = (relationshipId: string, isManager: boolean) => {
    setMessage(null);
    startTransition(async () => {
      const res = await setRelationshipManagerAction({ relationshipId, isManager });
      if (res.ok) {
        router.refresh();
      } else {
        setMessage({ ok: false, text: res.error ?? "No se pudo actualizar la delegación." });
      }
    });
  };

  const submit = () => {
    setMessage(null);
    startTransition(async () => {
      const res = await createRelationshipAction({
        careRecipientId,
        relationshipType: type,
        subjectName: name,
        subjectRelation: type === "family" ? relation : "",
        subjectPhone: phone,
        subjectEmail: email,
        notes,
      });
      if (res.ok) {
        setName("");
        setPhone("");
        setEmail("");
        setNotes("");
        setMessage({
          ok: true,
          text:
            res.status === "approved"
              ? "Relación agregada."
              : "Solicitud enviada. Queda pendiente de aprobación del tutor.",
        });
        router.refresh();
      } else {
        setMessage({ ok: false, text: res.error ?? "No se pudo crear la relación." });
      }
    });
  };

  const inputClass =
    "min-h-11 w-full rounded-xl2 border border-slate-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-care-300";

  return (
    <Card className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Relaciones y accesos
        </h2>
        <p className="text-sm text-slate-600">
          Quiénes acompañan a esta persona cuidada. El tutor aprueba las
          relaciones que se agregan.
        </p>
      </div>

      {message ? (
        <p
          className={`rounded-xl2 px-3 py-2 text-sm ${
            message.ok
              ? "bg-success-100 text-success-700"
              : "bg-danger-100 text-danger-700"
          }`}
          role="status"
        >
          {message.text}
        </p>
      ) : null}

      {pending.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Pendientes de aprobación
          </h3>
          <ul className="space-y-2">
            {pending.map((rel) => (
              <li
                key={rel.id}
                className="flex flex-col gap-2 rounded-xl2 border border-warning-100 bg-warning-100/40 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">{rel.subjectName}</p>
                  <p className="text-sm text-slate-600">
                    {TYPE_LABELS[rel.type]}
                    {rel.subjectRelation ? ` · ${rel.subjectRelation}` : ""}
                    {rel.subjectPhone ? ` · ${rel.subjectPhone}` : ""}
                  </p>
                </div>
                {canModerate ? (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => decide(rel.id, "approved")}
                      disabled={isPending}
                    >
                      Aprobar
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => decide(rel.id, "rejected")}
                      disabled={isPending}
                    >
                      Rechazar
                    </Button>
                  </div>
                ) : (
                  <Badge tone="warning">Pendiente</Badge>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Red de cuidado
        </h3>
        <ul className="space-y-2">
          {ownerName ? (
            <li className="flex flex-col gap-2 rounded-xl2 border border-care-200 bg-care-50 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">
                  {ownerName}
                  {ownerIsYou ? " (vos)" : ""}
                </p>
                <p className="text-sm text-slate-600">Tutor legal · administra la red</p>
              </div>
              <Badge tone="info">Tutor legal</Badge>
            </li>
          ) : null}

          {active.length === 0 ? (
            <li className="text-sm text-slate-500">Todavía no hay otros vínculos activos.</li>
          ) : (
            active.map((rel) => {
              const isCaregiver = rel.type === "caregiver";
              return (
                <li
                  key={rel.id}
                  className="flex flex-col gap-2 rounded-xl2 border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{rel.subjectName}</p>
                    <p className="text-sm text-slate-600">
                      {TYPE_LABELS[rel.type]}
                      {rel.subjectRelation ? ` · ${rel.subjectRelation}` : ""}
                      {rel.subjectPhone ? ` · ${rel.subjectPhone}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {rel.isManager ? <Badge tone="info">Administra</Badge> : null}
                    <Badge tone="success">Activo</Badge>
                    {canDelegate && isCaregiver ? (
                      <Button
                        variant="ghost"
                        onClick={() => delegate(rel.id, !rel.isManager)}
                        disabled={isPending}
                      >
                        {rel.isManager ? "Quitar administración" : "Delegar administración"}
                      </Button>
                    ) : null}
                    {canModerate ? (
                      <Button
                        variant="ghost"
                        onClick={() => decide(rel.id, "revoked")}
                        disabled={isPending}
                      >
                        Dar de baja
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </section>

      {canPropose ? (
        <section className="space-y-3 border-t border-slate-200 pt-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {canModerate ? "Agregar relación" : "Proponer relación"}
          </h3>
          {!canModerate ? (
            <p className="text-sm text-slate-600">
              La solicitud queda pendiente hasta que el tutor la apruebe.
            </p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Tipo
              <select
                value={type}
                onChange={(event) =>
                  setType(event.target.value as RelationshipType)
                }
                className={inputClass}
              >
                {allowedTypes.map((value) => (
                  <option key={value} value={value}>
                    {TYPE_LABELS[value]}
                  </option>
                ))}
              </select>
            </label>
            {type === "family" ? (
              <label className="text-sm font-medium text-slate-700">
                Parentesco
                <select
                  value={relation}
                  onChange={(event) => setRelation(event.target.value)}
                  className={inputClass}
                >
                  {FAMILY_RELATION_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="text-sm font-medium text-slate-700">
              Nombre
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={inputClass}
                placeholder="Nombre y apellido"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Teléfono
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className={inputClass}
                placeholder="Opcional"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Email
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass}
                placeholder="Opcional"
              />
            </label>
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Notas
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className={`${inputClass} min-h-20 py-2`}
              placeholder="Opcional"
            />
          </label>
          <Button onClick={submit} disabled={isPending || name.trim().length < 2}>
            {canModerate ? "Agregar" : "Enviar solicitud"}
          </Button>
        </section>
      ) : null}
    </Card>
  );
}
