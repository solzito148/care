import { z } from "zod";

import { longText, shortText } from "@/lib/validations/common-schema";

export const caregiverProfileSchema = z.object({
  fullName: shortText(120).min(2, "Indica el nombre completo."),
  locality: shortText(120).min(1, "Indica la localidad."),
  zones: longText(500).default(""),
  modalities: longText(500).default(""),
  availabilitySpecial: longText(500).default(""),
  experienceYears: z.string().trim().max(3).default("0"),
  tasks: longText(500).default(""),
  highAvailability: z.boolean().default(false),
});

export const recommendationSchema = z.object({
  caregiverId: z.string().uuid("Selecciona un cuidador."),
  personaQueRecomienda: shortText(120).min(1, "Indica quien recomienda."),
  periodoDesde: z.string().trim().max(10).default(""),
  periodoHasta: z.string().trim().max(10).default(""),
  zonaServicio: shortText(120).default(""),
  modalidadServicio: shortText(120).default(""),
  tareasRealizadas: longText(1000).default(""),
  calificacionGeneral: z.string().trim().max(2).default("5"),
  puntualidad: z.string().trim().max(2).default("5"),
  tratoHumano: z.string().trim().max(2).default("5"),
  responsabilidad: z.string().trim().max(2).default("5"),
  comunicacion: z.string().trim().max(2).default("5"),
  confiabilidad: z.string().trim().max(2).default("5"),
  comentario: longText(2000).default(""),
  loVolveriaAContratar: z.boolean().default(false),
  autorizaMostrarRecomendacion: z.boolean().default(false),
  autorizaContactoReferencia: z.boolean().default(false),
});

export const caregiverContactKindSchema = z.enum(["entrevista", "contacto"]);
