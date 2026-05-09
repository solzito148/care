export type AgendaView = "dia" | "semana" | "mes" | "lista";

export type AgendaEventType =
  | "medicacion"
  | "turnos-medicos"
  | "estudios"
  | "terapias"
  | "cuidadores"
  | "enfermeria"
  | "tramites"
  | "vencimientos";

export type AgendaEventStatus = "pendiente" | "confirmado" | "urgente" | "completado";

export type AgendaEvent = {
  id: string;
  type: AgendaEventType;
  titulo: string;
  fecha: string;
  hora: string;
  lugar: string;
  personaAsociada: string;
  responsable: string;
  estado: AgendaEventStatus;
  notas: string;
  contactoRelacionado: string;
};

export type MedicalAppointmentForm = {
  profesional: string;
  especialidad: string;
  fecha: string;
  hora: string;
  direccion: string;
  telefono: string;
  obraSocialPrepaga: string;
  documentacionLlevar: string;
  acompananteAsignado: string;
  recordatorioDiaAntes: boolean;
  recordatorioMismoDia: boolean;
};

export type MedicalStudyForm = {
  tipoEstudio: string;
  fecha: string;
  hora: string;
  lugar: string;
  indicacionesPrevias: string;
  requiereAyuno: boolean;
  requiereEstudiosAnteriores: boolean;
  requiereOrdenMedica: boolean;
  recordatorioTresDiasAntes: boolean;
  recordatorioDiaAntes: boolean;
  recordatorioMismoDia: boolean;
};
