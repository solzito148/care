import type { CareContext } from "@/lib/data/care-context";
import { loadAgendaItems, type AgendaServerItem } from "@/lib/data/agenda";
import { loadMedicationData } from "@/lib/data/medicacion";
import { careRecipientToPersona } from "@/lib/data/persona-map";
import type { DailyMedication } from "@/lib/medicacion-types";
import type { PersonaCuidada } from "@/lib/persona-cuidada-types";
import { createClient } from "@/lib/supabase/server";

export type DashboardAlert = {
  text: string;
  status: "urgente" | "alerta" | "pendiente";
};

export type DashboardSummaryCard = {
  title: string;
  value: string;
  detail: string;
};

export type DashboardData = {
  summaryCards: DashboardSummaryCard[];
  alerts: DashboardAlert[];
};

export type PersonaViewActivity = {
  key: string;
  type: "Medicamento" | "Turno";
  text: string;
  timeLabel: string;
  status: "pendiente" | "confirmado" | "proximo" | "completado";
  /** solo para medicamentos pendientes: habilita "Ya lo tome" */
  scheduleId?: string;
};

export type PersonaViewData = {
  displayName: string;
  activities: PersonaViewActivity[];
  current: PersonaViewActivity | null;
  tomorrowReminders: string[];
  tutorPhone: string | null;
  caregiverPhone: string | null;
};

function isToday(iso: string, now: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isTomorrow(iso: string, now: Date): boolean {
  const t = new Date(now);
  t.setDate(t.getDate() + 1);
  const d = new Date(iso);
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

const timeFmt = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
});

/** "HH:MM" del dia actual ya paso? */
function timeIsPast(hhmm: string, now: Date): boolean {
  const [h, m] = hhmm.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return false;
  return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
}

async function loadPersonaRecord(careRecipientId: string): Promise<{
  displayName: string;
  persona: PersonaCuidada | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("care_recipients")
    .select("full_name, preferred_name, birth_date, emergency_notes, metadata")
    .eq("id", careRecipientId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("loadPersonaRecord", error);
    return { displayName: "Persona cuidada", persona: null };
  }

  return {
    displayName: data.preferred_name?.trim() || data.full_name,
    persona: careRecipientToPersona({ ...data, metadata: data.metadata ?? {} }),
  };
}

async function countHouseholdCaregivers(householdId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("household_members")
    .select("id", { count: "exact", head: true })
    .eq("household_id", householdId)
    .eq("member_role", "caregiver");
  if (error) {
    console.error("countHouseholdCaregivers", error);
    return 0;
  }
  return count ?? 0;
}

async function countCareRecipients(householdId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("care_recipients")
    .select("id", { count: "exact", head: true })
    .eq("household_id", householdId);
  if (error) {
    console.error("countCareRecipients", error);
    return 0;
  }
  return count ?? 1;
}

async function countMedicalStudies(careRecipientId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("medical_studies")
    .select("id", { count: "exact", head: true })
    .eq("care_recipient_id", careRecipientId);
  if (error) {
    console.error("countMedicalStudies", error);
    return 0;
  }
  return count ?? 0;
}

function upcomingAppointments(items: AgendaServerItem[], now: Date): AgendaServerItem[] {
  return items.filter(
    (it) => it.estado !== "completado" && new Date(it.startsAt).getTime() >= now.getTime()
  );
}

export async function loadDashboardData(ctx: CareContext): Promise<DashboardData> {
  const now = new Date();

  const [meds, agenda, persona, caregiversCount, recipientsCount, studiesCount] =
    await Promise.all([
      loadMedicationData(ctx.careRecipientId),
      loadAgendaItems(ctx.careRecipientId),
      loadPersonaRecord(ctx.careRecipientId),
      countHouseholdCaregivers(ctx.householdId),
      countCareRecipients(ctx.householdId),
      countMedicalStudies(ctx.careRecipientId),
    ]);

  const pendingToday = meds.daily.filter((d) => d.estado === "pendiente");
  const overdueToday = pendingToday.filter((d) => timeIsPast(d.horario, now));

  const upcoming = upcomingAppointments(agenda, now);
  const next = upcoming[0];
  const nextLabel = next
    ? `${new Intl.DateTimeFormat("es-AR", { weekday: "short", day: "2-digit", month: "short" }).format(new Date(next.startsAt))} ${timeFmt.format(new Date(next.startsAt))}`
    : "Sin turnos próximos";
  const unconfirmed = upcoming.filter((it) => it.estado === "pendiente");

  const lowStock = meds.active.filter(
    (m) => m.activo && m.recordatorioReposicion > 0 && m.stockActual <= m.recordatorioReposicion
  );

  const emergencyContacts = persona.persona?.contactosEmergencia?.length ?? 0;

  const summaryCards: DashboardSummaryCard[] = [
    {
      title: "Personas cuidadas asociadas",
      value: String(recipientsCount),
      detail: persona.displayName,
    },
    {
      title: "Medicación de hoy",
      value: String(meds.daily.length),
      detail: pendingToday.length
        ? `${pendingToday.length} sin confirmar`
        : "Todo confirmado",
    },
    {
      title: "Turnos próximos",
      value: String(upcoming.length),
      detail: nextLabel,
    },
    {
      title: "Estudios médicos",
      value: String(studiesCount),
      detail: studiesCount ? "Ver historial en Estudios" : "Sin estudios cargados",
    },
    {
      title: "Cuidadores en el hogar",
      value: String(caregiversCount),
      detail: caregiversCount ? "Miembros con rol cuidador" : "Sin cuidadores asociados",
    },
    {
      title: "Contactos de emergencia",
      value: String(emergencyContacts),
      detail: emergencyContacts ? "Cargados en Persona cuidada" : "Carga al menos uno",
    },
  ];

  const alerts: DashboardAlert[] = [];
  for (const d of overdueToday) {
    alerts.push({
      text: `Medicación no confirmada: ${d.nombre} (${d.horario})`,
      status: "urgente",
    });
  }
  for (const it of unconfirmed.slice(0, 3)) {
    const dt = new Date(it.startsAt);
    alerts.push({
      text: `Turno sin confirmar: ${it.titulo} (${timeFmt.format(dt)} ${dt.toLocaleDateString("es-AR")})`,
      status: "alerta",
    });
  }
  for (const m of lowStock.slice(0, 3)) {
    alerts.push({
      text: `Stock bajo: ${m.nombre} (${m.stockActual} restantes)`,
      status: "pendiente",
    });
  }

  return { summaryCards, alerts };
}

export async function loadPersonaViewData(ctx: CareContext): Promise<PersonaViewData> {
  const now = new Date();

  const [meds, agenda, persona] = await Promise.all([
    loadMedicationData(ctx.careRecipientId),
    loadAgendaItems(ctx.careRecipientId),
    loadPersonaRecord(ctx.careRecipientId),
  ]);

  const medActivities: PersonaViewActivity[] = meds.daily.map(
    (d: DailyMedication) => ({
      key: `med-${d.id}`,
      type: "Medicamento",
      text: `${d.nombre} - ${d.dosis}`,
      timeLabel: d.horario,
      status: d.estado === "tomado" ? "completado" : d.estado === "pendiente" ? "pendiente" : "proximo",
      scheduleId: d.estado === "pendiente" ? d.scheduleId : undefined,
    })
  );

  const todayAppointments: PersonaViewActivity[] = agenda
    .filter((it) => isToday(it.startsAt, now))
    .map((it) => ({
      key: `turno-${it.id}`,
      type: "Turno",
      text: it.lugar ? `${it.titulo} - ${it.lugar}` : it.titulo,
      timeLabel: timeFmt.format(new Date(it.startsAt)),
      status:
        it.estado === "completado"
          ? "completado"
          : it.estado === "confirmado"
            ? "confirmado"
            : "proximo",
    }));

  const activities = [...medActivities, ...todayAppointments].sort((a, b) =>
    a.timeLabel.localeCompare(b.timeLabel)
  );

  const current =
    activities.find((a) => a.status === "pendiente" && timeIsPast(a.timeLabel, now)) ??
    activities.find((a) => a.status === "pendiente" || a.status === "proximo") ??
    null;

  const tomorrowReminders = agenda
    .filter((it) => isTomorrow(it.startsAt, now) && it.estado !== "completado")
    .map((it) => {
      const dt = new Date(it.startsAt);
      const prep = it.notas ? ` (${it.notas})` : "";
      return `Mañana ${timeFmt.format(dt)} - ${it.titulo}${prep}`;
    });

  const tutorPhone =
    persona.persona?.contactosEmergencia?.find((c) =>
      /tutor|famil|hij|madre|padre/i.test(c.relacion)
    )?.telefono ??
    persona.persona?.contactosEmergencia?.[0]?.telefono ??
    null;

  const caregiverPhone =
    persona.persona?.cuidadores?.[0]?.contacto?.trim() || null;

  return {
    displayName: persona.displayName,
    activities,
    current,
    tomorrowReminders,
    tutorPhone,
    caregiverPhone,
  };
}
