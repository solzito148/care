import { z } from "zod";

import { emailOptionalSchema, longText, phoneSchema, shortText } from "@/lib/validations/common-schema";

export const serviceCategorySchema = z.enum([
  "traslados-y-acompanamiento",
  "desarme-y-organizacion-del-hogar",
  "adaptacion-del-hogar",
  "tramites-y-gestiones",
  "servicios-domiciliarios-complementarios",
]);

export const servicePlanSchema = z.enum(["Basico", "Destacado", "Premium"]);

export const publishServiceSchema = z.object({
  providerName: shortText(120).min(2, "Indica el nombre del proveedor."),
  category: serviceCategorySchema,
  description: longText(2000).default(""),
  coverageZone: shortText(120).default(""),
  availability: shortText(200).default(""),
  phoneWhatsapp: phoneSchema.default(""),
  email: emailOptionalSchema.default(""),
  plan: servicePlanSchema.default("Basico"),
});

export const serviceStatusSchema = z.enum(["publicado", "pausado"]);
