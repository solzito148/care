import type { ActiveMedication, DailyMedication, MedicationHistoryItem } from "@/lib/medicacion-types";
import type { Json } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/server";

type MedRow = {
  id: string;
  care_recipient_id: string;
  name: string;
  dosage: string;
  route: string | null;
  instructions: string | null;
  active: boolean;
  metadata: Json;
};

type ScheduleRow = {
  id: string;
  medication_id: string;
  frequency: string;
  time_of_day: string;
  start_date: string;
  end_date: string | null;
};

type IntakeRow = {
  id: string;
  schedule_id: string;
  taken_at: string | null;
  status: "pending" | "taken" | "skipped" | "late";
  created_at: string;
};

function formatTime(t: string): string {
  const m = t.match(/^(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : t.slice(0, 5);
}

function isUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

function intakeStatusToUi(s: IntakeRow["status"]): DailyMedication["estado"] {
  switch (s) {
    case "taken":
      return "tomado";
    case "skipped":
      return "omitido";
    case "late":
      return "sin-respuesta";
    default:
      return "pendiente";
  }
}

function historyStatus(s: IntakeRow["status"]): MedicationHistoryItem["estado"] {
  switch (s) {
    case "taken":
      return "tomado";
    case "skipped":
      return "omitido";
    case "late":
      return "confirmado-cuidador";
    default:
      return "pendiente";
  }
}

function rowToActiveMedication(m: MedRow, schedules: ScheduleRow[]): ActiveMedication {
  const meta =
    m.metadata &&
    typeof m.metadata === "object" &&
    "ui" in m.metadata &&
    typeof (m.metadata as { ui?: ActiveMedication }).ui === "object"
      ? (m.metadata as { ui?: ActiveMedication }).ui
      : undefined;

  const horarios = schedules.map((s) => formatTime(s.time_of_day)).join(", ");
  const starts = schedules.map((s) => s.start_date).sort();
  const ends = schedules.map((s) => s.end_date).filter(Boolean) as string[];
  const fechaInicio = starts[0] ?? new Date().toISOString().slice(0, 10);
  const fechaFin = ends.length ? ends.sort()[ends.length - 1] : "";

  const base: ActiveMedication = meta
    ? { ...meta, id: m.id, nombre: meta.nombre || m.name, dosis: meta.dosis || m.dosage, activo: m.active }
    : {
        id: m.id,
        nombre: m.name,
        dosis: m.dosage,
        frecuencia: schedules[0]?.frequency ?? "",
        horarios: horarios || "08:00",
        fechaInicio,
        fechaFin: fechaFin || undefined,
        indicaciones: m.instructions ?? "",
        fotoMedicamento: "",
        responsableAdministracion: "",
        requiereConfirmacion: false,
        alertarTutorSiNoConfirma: false,
        tiempoEsperaAlertaMinutos: 30,
        stockActual: 0,
        recordatorioReposicion: 0,
        recetaAsociada: "",
        activo: m.active,
      };

  return {
    ...base,
    id: m.id,
    horarios: horarios || base.horarios,
    fechaInicio: fechaInicio || base.fechaInicio,
    fechaFin: fechaFin || base.fechaFin,
    activo: m.active,
  };
}

export async function loadMedicationData(careRecipientId: string): Promise<{
  active: ActiveMedication[];
  daily: DailyMedication[];
  history: MedicationHistoryItem[];
}> {
  const supabase = await createClient();

  const { data: meds, error: medErr } = await supabase
    .from("medications")
    .select("*")
    .eq("care_recipient_id", careRecipientId)
    .order("created_at", { ascending: false });

  if (medErr || !meds?.length) {
    return { active: [], daily: [], history: [] };
  }

  const medRows = meds as MedRow[];
  const medIds = medRows.map((m) => m.id);

  const { data: schedData } = await supabase.from("medication_schedules").select("*").in("medication_id", medIds);

  const schedules = (schedData ?? []) as ScheduleRow[];
  const byMed = new Map<string, ScheduleRow[]>();
  for (const s of schedules) {
    const list = byMed.get(s.medication_id) ?? [];
    list.push(s);
    byMed.set(s.medication_id, list);
  }

  const active = medRows.map((m) => rowToActiveMedication(m, byMed.get(m.id) ?? []));

  const scheduleIds = schedules.map((s) => s.id);
  let intakes: IntakeRow[] = [];
  if (scheduleIds.length) {
    const { data: intakeData } = await supabase
      .from("medication_intakes")
      .select("*")
      .in("schedule_id", scheduleIds)
      .order("created_at", { ascending: false })
      .limit(80);
    intakes = (intakeData ?? []) as IntakeRow[];
  }

  const today = new Date().toISOString().slice(0, 10);
  const intakesBySchedule = new Map<string, IntakeRow[]>();
  for (const i of intakes) {
    const list = intakesBySchedule.get(i.schedule_id) ?? [];
    list.push(i);
    intakesBySchedule.set(i.schedule_id, list);
  }

  const daily: DailyMedication[] = [];
  for (const m of medRows) {
    if (!m.active) continue;
    const ss = byMed.get(m.id) ?? [];
    for (const s of ss) {
      if (s.start_date > today) continue;
      if (s.end_date && s.end_date < today) continue;
      const dayIntakes = (intakesBySchedule.get(s.id) ?? []).filter((i) => i.created_at.slice(0, 10) === today);
      const last = dayIntakes[0];
      const meta =
        m.metadata && typeof m.metadata === "object" && "ui" in m.metadata
          ? (m.metadata as { ui?: ActiveMedication }).ui
          : undefined;
      daily.push({
        id: last?.id ?? `${m.id}-${s.id}-${today}`,
        scheduleId: s.id,
        nombre: meta?.nombre ?? m.name,
        dosis: meta?.dosis ?? m.dosage,
        horario: formatTime(s.time_of_day),
        estado: last ? intakeStatusToUi(last.status) : "pendiente",
        responsable: meta?.responsableAdministracion ?? "—",
      });
    }
  }

  const medById = new Map(medRows.map((m) => [m.id, m]));
  const schedById = new Map(schedules.map((s) => [s.id, s]));

  const history: MedicationHistoryItem[] = intakes.slice(0, 40).map((i) => {
    const sched = schedById.get(i.schedule_id);
    const med = sched ? medById.get(sched.medication_id) : undefined;
    const meta =
      med?.metadata && typeof med.metadata === "object" && "ui" in med.metadata
        ? (med.metadata as { ui?: ActiveMedication }).ui
        : undefined;
    return {
      id: i.id,
      fecha: i.created_at.slice(0, 10),
      horario: sched ? formatTime(sched.time_of_day) : "",
      estado: historyStatus(i.status),
      confirmadoPor: meta?.responsableAdministracion ?? "Registro de cumplimiento",
    };
  });

  return { active, daily, history };
}

export { isUuid };
