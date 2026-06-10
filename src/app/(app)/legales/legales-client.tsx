"use client";

import { ChangeEvent, FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  addLegalDocumentAction,
  deleteLegalDocumentAction,
  setLegalDocumentStatusAction,
  type LegalDocumentInput,
} from "@/actions/legales";
import { FormMessage } from "@/components/forms/form-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  LEGAL_DOC_STATUS_LABELS,
  LEGAL_DOC_TYPE_LABELS,
  type LegalDocStatus,
  type LegalDocType,
  type LegalDocumentRow,
} from "@/lib/legales-types";

const docTypes = Object.entries(LEGAL_DOC_TYPE_LABELS) as [LegalDocType, string][];
const statuses = Object.entries(LEGAL_DOC_STATUS_LABELS) as [LegalDocStatus, string][];

const statusTone: Record<LegalDocStatus, "neutral" | "warning" | "success" | "danger"> = {
  pendiente: "neutral",
  "en-tramite": "warning",
  vigente: "success",
  vencido: "danger",
};

const initialForm: LegalDocumentInput = {
  title: "",
  docType: "poder",
  status: "pendiente",
  responsible: "",
  dueDate: "",
  notes: "",
};

type Props = {
  documents: LegalDocumentRow[];
};

export function LegalesClient({ documents }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const updateField =
    (key: keyof LegalDocumentInput) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const onAdd = (event: FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const res = await addLegalDocumentAction(form);
      if (res.ok) {
        setForm(initialForm);
        setMessageType("success");
        setMessage("Documento agregado.");
        router.refresh();
      } else {
        setMessageType("error");
        setMessage(res.error ?? "No se pudo agregar el documento.");
      }
    });
  };

  const onStatus = (id: string, status: LegalDocStatus) => {
    startTransition(async () => {
      const res = await setLegalDocumentStatusAction(id, status);
      if (res.ok) router.refresh();
      else {
        setMessageType("error");
        setMessage(res.error ?? "No se pudo actualizar.");
      }
    });
  };

  const onDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteLegalDocumentAction(id);
      if (res.ok) router.refresh();
      else {
        setMessageType("error");
        setMessage(res.error ?? "No se pudo eliminar.");
      }
    });
  };

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2">
        {documents.length === 0 ? (
          <Card className="p-6 text-sm text-slate-600 md:col-span-2">
            Todavia no hay documentos cargados.
          </Card>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id} className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-900">{doc.title}</h2>
                <Badge tone={statusTone[doc.status]}>{LEGAL_DOC_STATUS_LABELS[doc.status]}</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-600">{LEGAL_DOC_TYPE_LABELS[doc.doc_type]}</p>
              {doc.responsible ? (
                <p className="mt-2 text-sm text-slate-700">
                  <strong>Responsable:</strong> {doc.responsible}
                </p>
              ) : null}
              {doc.due_date ? (
                <p className="text-sm text-slate-700">
                  <strong>Vencimiento:</strong> {doc.due_date}
                </p>
              ) : null}
              {doc.notes ? <p className="mt-1 text-sm text-slate-700">{doc.notes}</p> : null}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <label className="text-sm font-medium text-slate-800">
                  Estado
                  <select
                    value={doc.status}
                    onChange={(event) => onStatus(doc.id, event.target.value as LegalDocStatus)}
                    disabled={pending}
                    className="ml-2 min-h-11 rounded-xl2 border border-slate-300 px-3"
                  >
                    {statuses.map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <Button variant="secondary" disabled={pending} onClick={() => onDelete(doc.id)}>
                  Eliminar
                </Button>
              </div>
            </Card>
          ))
        )}
      </section>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900">Agregar documento</h2>
        <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={onAdd}>
          <div className="sm:col-span-2">
            <Input label="Titulo" value={form.title} onChange={updateField("title")} />
          </div>
          <label className="block text-sm font-medium text-slate-800">
            Tipo
            <select
              value={form.docType}
              onChange={updateField("docType")}
              className="mt-2 min-h-12 w-full rounded-xl2 border border-slate-300 px-4"
            >
              {docTypes.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-800">
            Estado
            <select
              value={form.status}
              onChange={updateField("status")}
              className="mt-2 min-h-12 w-full rounded-xl2 border border-slate-300 px-4"
            >
              {statuses.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <Input label="Responsable" value={form.responsible} onChange={updateField("responsible")} />
          <Input type="date" label="Vencimiento" value={form.dueDate} onChange={updateField("dueDate")} />
          <label className="block text-sm font-medium text-slate-800 sm:col-span-2">
            Notas
            <textarea
              value={form.notes}
              onChange={updateField("notes")}
              className="mt-2 min-h-24 w-full rounded-xl2 border border-slate-300 px-4 py-3 text-base"
            />
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending}>
              Agregar documento
            </Button>
          </div>
        </form>
        <div className="mt-3">
          <FormMessage message={message} type={messageType} />
        </div>
      </Card>
    </>
  );
}
