import { z } from "zod";

import { longText, optionalDateSchema, phoneSchema, shortText } from "@/lib/validations/common-schema";

const accountTypeSchema = z.enum([
  "tutor-familiar-encargado",
  "cuidador",
  "profesional-salud",
  "profesional-legal-administrativo",
  "proveedor-marketplace",
  "proveedor-servicios",
]);

export const onboardingSchema = z.object({
  accountType: accountTypeSchema,
  fullName: shortText(120).min(2, "Indica tu nombre completo."),
  phone: phoneSchema.default(""),
  recipientName: shortText(120).default(""),
  recipientPreferredName: shortText(80).default(""),
  recipientBirthDate: optionalDateSchema.default(""),
  recipientEmergencyNotes: longText(1000).default(""),
  locality: shortText(120).default(""),
  experienceYears: z.string().trim().max(3).default(""),
});
