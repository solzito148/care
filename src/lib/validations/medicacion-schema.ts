import { z } from "zod";

import { longText, shortText } from "@/lib/validations/common-schema";

export const upsertMedicationSchema = z.object({
  id: z.string().trim().max(40),
  nombre: shortText(160).min(1, "Indica el nombre del medicamento."),
  dosis: shortText(80).default(""),
  frecuencia: shortText(80).default(""),
  horarios: shortText(200).default(""),
  fechaInicio: z.string().trim().max(10).default(""),
  fechaFin: z.string().trim().max(10).optional(),
  indicaciones: longText(1000).default(""),
  fotoMedicamento: shortText(200).optional(),
  responsableAdministracion: shortText(120).default(""),
  requiereConfirmacion: z.boolean().default(false),
  alertarTutorSiNoConfirma: z.boolean().default(false),
  tiempoEsperaAlertaMinutos: z.number().finite().min(0).max(1440).default(0),
  stockActual: z.number().finite().min(0).max(99999).default(0),
  recordatorioReposicion: z.number().finite().min(0).max(99999).default(0),
  recetaAsociada: shortText(200).default(""),
  activo: z.boolean().default(true),
});

export const medicationIntakeStatusSchema = z.enum(["taken", "skipped"]);
