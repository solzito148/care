"use client";

import { ChangeEvent, FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { addContactAction, deleteContactAction, type ContactInput } from "@/actions/contactos";
import { FormMessage } from "@/components/forms/form-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CONTACT_CATEGORY_LABELS, type ContactCategory, type ContactRow } from "@/lib/contactos-types";

const categories = Object.entries(CONTACT_CATEGORY_LABELS) as [ContactCategory, string][];

const categoryTone: Record<ContactCategory, "neutral" | "info" | "danger"> = {
  familia: "info",
  medico: "info",
  emergencia: "danger",
  servicio: "neutral",
  otro: "neutral",
};

const initialForm: ContactInput = {
  fullName: "",
  relationship: "",
  category: "familia",
  phone: "",
  email: "",
  notes: "",
  isPrimary: false,
};

type Props = {
  contacts: ContactRow[];
};

export function ContactosClient({ contacts }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const updateField =
    (key: keyof ContactInput) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const onAdd = (event: FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const res = await addContactAction(form);
      if (res.ok) {
        setForm(initialForm);
        setMessageType("success");
        setMessage("Contacto agregado.");
        router.refresh();
      } else {
        setMessageType("error");
        setMessage(res.error ?? "No se pudo agregar el contacto.");
      }
    });
  };

  const onDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteContactAction(id);
      if (res.ok) {
        router.refresh();
      } else {
        setMessageType("error");
        setMessage(res.error ?? "No se pudo eliminar.");
      }
    });
  };

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {contacts.length === 0 ? (
          <Card className="p-6 text-sm text-slate-600 md:col-span-2 xl:col-span-3">
            Todavía no hay contactos cargados.
          </Card>
        ) : (
          contacts.map((contact) => (
            <Card key={contact.id} className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-900">{contact.full_name}</h2>
                <div className="flex gap-1">
                  <Badge tone={categoryTone[contact.category]}>
                    {CONTACT_CATEGORY_LABELS[contact.category]}
                  </Badge>
                  {contact.is_primary ? <Badge tone="success">Principal</Badge> : null}
                </div>
              </div>
              {contact.relationship ? (
                <p className="mt-1 text-sm text-slate-600">{contact.relationship}</p>
              ) : null}
              {contact.phone ? (
                <p className="mt-2 text-sm text-slate-700">
                  <strong>Teléfono:</strong>{" "}
                  <a className="text-care-800 underline" href={`tel:${contact.phone}`}>
                    {contact.phone}
                  </a>
                </p>
              ) : null}
              {contact.email ? (
                <p className="mt-1 text-sm text-slate-700">
                  <strong>Email:</strong> {contact.email}
                </p>
              ) : null}
              {contact.notes ? <p className="mt-1 text-sm text-slate-700">{contact.notes}</p> : null}
              <div className="mt-4">
                <Button variant="secondary" disabled={pending} onClick={() => onDelete(contact.id)}>
                  Eliminar
                </Button>
              </div>
            </Card>
          ))
        )}
      </section>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900">Agregar contacto</h2>
        <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={onAdd}>
          <Input label="Nombre completo" value={form.fullName} onChange={updateField("fullName")} />
          <Input
            label="Relación / rol"
            value={form.relationship}
            onChange={updateField("relationship")}
            placeholder="Ej: Hija, Cardióloga"
          />
          <label className="block text-sm font-medium text-slate-800">
            Categoría
            <select
              value={form.category}
              onChange={updateField("category")}
              className="mt-2 min-h-12 w-full rounded-xl2 border border-slate-300 px-4"
            >
              {categories.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <Input label="Teléfono" value={form.phone} onChange={updateField("phone")} />
          <Input type="email" label="Email" value={form.email} onChange={updateField("email")} />
          <label className="flex items-end">
            <span className="inline-flex min-h-12 w-full items-center gap-2 rounded-xl2 border border-slate-300 px-4">
              <input
                type="checkbox"
                checked={form.isPrimary}
                onChange={(event) => setForm((prev) => ({ ...prev, isPrimary: event.target.checked }))}
              />
              <span className="text-sm font-medium text-slate-800">Contacto principal</span>
            </span>
          </label>
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
              Agregar contacto
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
