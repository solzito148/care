"use client";

import { ChangeEvent, FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createStudyAction,
  updateStudyStatusAction,
  uploadStudyAttachmentAction,
} from "@/actions/estudios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import type { StudyItem, StudyStatus } from "@/lib/data/estudios";

const statusLabels: Record<StudyStatus, string> = {
  pending: "Pendiente",
  scheduled: "Programado",
  in_progress: "En curso",
  completed: "Completado",
  cancelled: "Cancelado",
};

const statusStyles: Record<StudyStatus, string> = {
  pending: "bg-warning-100 text-warning-700",
  scheduled: "bg-info-100 text-info-700",
  in_progress: "bg-info-100 text-info-700",
  completed: "bg-success-100 text-success-700",
  cancelled: "bg-slate-200 text-slate-700",
};

const dateTimeFmt = new Intl.DateTimeFormat("es-AR", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

type Props = {
  studies: StudyItem[];
};

const initialForm = {
  title: "",
  studyType: "",
  doctor: "",
  fecha: "",
  hora: "",
  preparationNotes: "",
};

export function EstudiosClient({ studies }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [resultDrafts, setResultDrafts] = useState<Record<string, string>>({});
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const { activos, historial } = useMemo(
    () => ({
      activos: studies.filter(
        (s) => s.status !== "completed" && s.status !== "cancelled"
      ),
      historial: studies.filter(
        (s) => s.status === "completed" || s.status === "cancelled"
      ),
    }),
    [studies]
  );

  const updateField =
    (key: keyof typeof initialForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  const onCreate = (event: FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const res = await createStudyAction({
        ...form,
        tzOffsetMinutes: new Date().getTimezoneOffset(),
      });
      if (res.ok) {
        setForm(initialForm);
        setMessage("Estudio guardado.");
        router.refresh();
      } else {
        setMessage(res.error ?? "Error al guardar.");
      }
    });
  };

  const onStatus = (id: string, status: StudyStatus) => {
    startTransition(async () => {
      const res = await updateStudyStatusAction(id, status, resultDrafts[id]);
      if (res.ok) {
        setMessage("Estudio actualizado.");
        router.refresh();
      } else {
        setMessage(res.error ?? "Error al actualizar.");
      }
    });
  };

  const onUpload = (id: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.set("studyId", id);
    data.set("file", file);
    setUploadingId(id);
    startTransition(async () => {
      const res = await uploadStudyAttachmentAction(data);
      setUploadingId(null);
      if (res.ok) {
        setMessage("Archivo adjuntado.");
        router.refresh();
      } else {
        setMessage(res.error ?? "Error al subir archivo.");
      }
    });
  };

  const renderStudy = (study: StudyItem, withActions: boolean) => (
    <article
      key={study.id}
      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-lg font-semibold text-slate-900">{study.title}</p>
          <p className="text-sm text-slate-700">
            {study.studyType ? `${study.studyType} — ` : ""}
            {study.scheduledAt
              ? dateTimeFmt.format(new Date(study.scheduledAt))
              : "Sin fecha programada"}
          </p>
          {study.doctor ? (
            <p className="mt-1 text-sm text-slate-600">Indicado por: {study.doctor}</p>
          ) : null}
          {study.preparationNotes ? (
            <p className="mt-2 text-sm font-medium text-warning-700">
              Preparación: {study.preparationNotes}
            </p>
          ) : null}
          {study.resultSummary ? (
            <p className="mt-2 text-sm text-slate-700">Resultado: {study.resultSummary}</p>
          ) : null}
          {study.attachmentSignedUrl ? (
            <a
              href={study.attachmentSignedUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm font-semibold text-care-700 underline"
            >
              Ver adjunto
            </a>
          ) : null}
        </div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[study.status]}`}
        >
          {statusLabels[study.status]}
        </span>
      </div>

      {withActions ? (
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-slate-800">
              Resumen de resultado (opcional)
            </span>
            <textarea
              value={resultDrafts[study.id] ?? study.resultSummary ?? ""}
              onChange={(e) =>
                setResultDrafts((prev) => ({ ...prev, [study.id]: e.target.value }))
              }
              className="mt-2 min-h-20 w-full rounded-xl2 border border-slate-300 px-4 py-3 text-base"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-800">
              Adjuntar resultado (PDF o imagen, máx 10 MB)
            </span>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => onUpload(study.id, e)}
              disabled={pending}
              className="mt-2 block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-care-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
            {uploadingId === study.id ? (
              <span className="mt-1 block text-xs text-slate-600">Subiendo...</span>
            ) : null}
          </label>
          <div className="flex flex-wrap gap-2">
            <Button size="md" disabled={pending} onClick={() => onStatus(study.id, "completed")}>
              Marcar completado
            </Button>
            <Button
              size="md"
              variant="ghost"
              disabled={pending}
              onClick={() => onStatus(study.id, "cancelled")}
            >
              Cancelar estudio
            </Button>
          </div>
        </div>
      ) : null}
    </article>
  );

  return (
    <section className="space-y-6 pb-10">
      <PageHeader
        title="Estudios médicos"
        description="Historial de estudios, preparaciones previas y resultados adjuntos. Visible para miembros del hogar según permisos."
      />

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900">Próximos y en curso</h2>
        <div className="mt-4 space-y-3">
          {activos.length === 0 ? (
            <p className="text-sm text-slate-600">
              No hay estudios pendientes. Agrega uno con el formulario.
            </p>
          ) : (
            activos.map((s) => renderStudy(s, true))
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900">Nuevo estudio</h2>
        <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={onCreate}>
          <Input
            label="Nombre del estudio"
            className="sm:col-span-2"
            value={form.title}
            onChange={updateField("title")}
          />
          <Input
            label="Tipo (laboratorio, imagen, etc.)"
            value={form.studyType}
            onChange={updateField("studyType")}
          />
          <Input label="Médico que lo indica" value={form.doctor} onChange={updateField("doctor")} />
          <Input type="date" label="Fecha" value={form.fecha} onChange={updateField("fecha")} />
          <Input type="time" label="Hora" value={form.hora} onChange={updateField("hora")} />
          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-slate-800">
              Preparación previa (ayuno, medicación, etc.)
            </span>
            <textarea
              value={form.preparationNotes}
              onChange={updateField("preparationNotes")}
              className="mt-2 min-h-24 w-full rounded-xl2 border border-slate-300 px-4 py-3 text-base"
            />
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending}>
              Guardar estudio
            </Button>
          </div>
        </form>
        {message ? (
          <p className="mt-3 text-sm font-medium text-slate-700" role="status">
            {message}
          </p>
        ) : null}
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900">Historial</h2>
        <div className="mt-4 space-y-3">
          {historial.length === 0 ? (
            <p className="text-sm text-slate-600">Sin estudios completados.</p>
          ) : (
            historial.map((s) => renderStudy(s, false))
          )}
        </div>
      </Card>
    </section>
  );
}
