export type MedicationState =
  | "pendiente"
  | "tomado"
  | "omitido"
  | "sin-respuesta"
  | "confirmado-cuidador";

export type DailyMedication = {
  id: string;
  nombre: string;
  dosis: string;
  horario: string;
  estado: MedicationState;
  responsable: string;
};

export type ActiveMedication = {
  id: string;
  nombre: string;
  dosis: string;
  frecuencia: string;
  horarios: string;
  fechaInicio: string;
  fechaFin?: string;
  indicaciones: string;
  fotoMedicamento?: string;
  responsableAdministracion: string;
  requiereConfirmacion: boolean;
  alertarTutorSiNoConfirma: boolean;
  tiempoEsperaAlertaMinutos: number;
  stockActual: number;
  recordatorioReposicion: number;
  recetaAsociada: string;
  activo: boolean;
};

export type MedicationHistoryItem = {
  id: string;
  fecha: string;
  horario: string;
  estado: MedicationState;
  confirmadoPor: string;
};
