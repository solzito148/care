import { z } from "zod";

import { longText, optionalDateSchema, shortText } from "@/lib/validations/common-schema";

export const legalDocTypeSchema = z.enum([
  "poder",
  "directiva-anticipada",
  "curatela",
  "tramite",
  "seguro",
  "otro",
]);

export const legalDocStatusSchema = z.enum([
  "pendiente",
  "en-tramite",
  "vigente",
  "vencido",
]);

export const legalDocumentSchema = z.object({
  title: shortText(160).min(2, "Indica un titulo para el documento."),
  docType: legalDocTypeSchema,
  status: legalDocStatusSchema,
  responsible: shortText(120).default(""),
  dueDate: optionalDateSchema.default(""),
  notes: longText(1000).default(""),
});
