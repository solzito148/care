export type CaregiverSearchItem = {
  id: string;
  foto: string;
  nombre: string;
  zonasTrabajo: string[];
  localidad: string;
  modalidades: string[];
  disponibilidadEspecial: string[];
  experiencia: number;
  tareas: string[];
  calificacion: number;
  perfilCompleto: boolean;
  referenciasCargadas: boolean;
  referenciasVerificadas: boolean;
  recomendadoCare: boolean;
  datosActualizados: boolean;
  estadoActualizacionPerfil: "datos-actualizados" | "pendiente-actualizacion" | "datos-vencidos" | "perfil-pausado";
  altaDisponibilidad: boolean;
  ultimaActualizacion: string;
  /** Recomendaciones aprobadas y publicas (alimentan el ranking). */
  recomendacionesCount: number;
  recomendacionesPromedio: number;
};

export type CaregiverApprovedRecommendation = {
  id: string;
  personaQueRecomienda: string;
  zonaServicio: string;
  modalidadServicio: string;
  tareasRealizadas: string;
  calificacionGeneral: number;
  comentario: string;
  loVolveriaAContratar: boolean;
};

export type CaregiverReferencePublic = {
  nombreContratante: string;
  zona: string;
  periodo: string;
  modalidad: string;
  tareas: string;
  telefono?: string;
};

export type RecommendationStatus = "pendiente-revision" | "aprobada" | "rechazada";

export type CaregiverRecommendation = {
  id: string;
  caregiverId: string;
  cuidadorSeleccionado: string;
  personaQueRecomienda: string;
  periodoDesde: string;
  periodoHasta: string;
  zonaServicio: string;
  modalidadServicio: string;
  tareasRealizadas: string;
  calificacionGeneral: number;
  puntualidad: number;
  tratoHumano: number;
  responsabilidad: number;
  comunicacion: number;
  confiabilidad: number;
  comentario: string;
  loVolveriaAContratar: boolean;
  autorizaMostrarRecomendacion: boolean;
  autorizaContactoReferencia: boolean;
  status: RecommendationStatus;
};

export type ReminderDeliveryStatus = "enviado" | "confirmado" | "vencido";

export type CaregiverReminderStatus = {
  caregiverId: string;
  caregiverNombre: string;
  estadoActualizacionPerfil: CaregiverSearchItem["estadoActualizacionPerfil"];
  ultimaActualizacionPerfil: string;
  ultimoRecordatorioWhatsApp: string;
  ultimoRecordatorioEmail: string;
  estadoEnvio: ReminderDeliveryStatus;
};
