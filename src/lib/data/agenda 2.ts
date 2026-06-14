import type { AgendaEventStatus } from "@/lib/agenda-types";
import { createClient } from "@/lib/supabase/server";

type AppointmentRow = {
  id: string;
  title: string;
  provider_name: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  status: "scheduled" | "confirmed" | "done" | "cancelled";
  notes: string | null;
};

/**
 * Item del feed de agenda preparado para enviar al client component.
 * Mantenemos `startsAt` como ISO (UTC con offset) para que el cliente
 * formatee fecha y hora segun su zona horaria local.
 */
export type AgendaServerItem = {
  id: string;
  startsAt: string;
  endsAt: string | null;
  titulo: string;
  lugar: string | null;
  responsable: string | null;
  estado: AgendaEventStatus;
  notas: string | null;
};

function mapStatus(s: AppointmentRow["status"]): AgendaEventStatus {
  switch (s) {
    case "confirmed":
      return "confirmado";
    case "scheduled":
      return "pendiente";
    case "done":
    case "cancelled":
      return "completado";
    default:
      return "pendiente";
  }
}

function rowToItem(row: AppointmentRow): AgendaServerItem {
  return {
    id: row.id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    titulo: row.title,
    lugar: row.location,
    responsable: row.provider_name,
    estado: mapStatus(row.status),
    notas: row.notes,
  };
}

export async function loadAgendaItems(careRecipientId: string): Promise<AgendaServerItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("care_recipient_id", careRecipientId)
    .order("starts_at", { ascending: true });

  if (error) {
    console.error("loadAgendaItems", error);
    return [];
  }
  if (!data?.length) return [];

  return (data as AppointmentRow[]).map(rowToItem);
}
