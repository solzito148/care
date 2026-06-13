import { z } from "zod";

import { longText, shortText } from "@/lib/validations/common-schema";

export const createAppointmentSchema = z.object({
  titulo: shortText(160).default(""),
  profesional: shortText(120).default(""),
  lugar: shortText(200).default(""),
  fecha: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha invalida."),
  hora: z.string().trim().regex(/^\d{1,2}:\d{2}(?::\d{2})?$/, "Hora invalida."),
  notas: longText(1000).default(""),
  tzOffsetMinutes: z.number().finite().default(0),
});

export const appointmentStatusSchema = z.enum([
  "scheduled",
  "confirmed",
  "done",
  "cancelled",
]);
