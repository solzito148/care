import {
  AgendaEvent,
  MedicalAppointmentForm,
  MedicalStudyForm,
} from "@/lib/agenda-types";
import { careMockData } from "@/lib/mock-data";

export const agendaEventsMock: AgendaEvent[] = careMockData.agenda.eventos;

export const medicalAppointmentInitialForm: MedicalAppointmentForm = {
  profesional: "",
  especialidad: "",
  fecha: "",
  hora: "",
  direccion: "",
  telefono: "",
  obraSocialPrepaga: "",
  documentacionLlevar: "",
  acompananteAsignado: "",
  recordatorioDiaAntes: true,
  recordatorioMismoDia: true,
};

export const medicalStudyInitialForm: MedicalStudyForm = {
  tipoEstudio: "",
  fecha: "",
  hora: "",
  lugar: "",
  indicacionesPrevias: "",
  requiereAyuno: false,
  requiereEstudiosAnteriores: false,
  requiereOrdenMedica: true,
  recordatorioTresDiasAntes: true,
  recordatorioDiaAntes: true,
  recordatorioMismoDia: true,
};
