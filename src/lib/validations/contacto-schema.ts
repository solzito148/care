import { z } from "zod";

export const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Indica el nombre del contacto.").max(120),
  relationship: z.string().trim().max(80).default(""),
  category: z.enum(["familia", "medico", "emergencia", "servicio", "otro"]),
  phone: z.string().trim().max(30).default(""),
  email: z.union([z.literal(""), z.string().trim().email("Email invalido.").max(160)]).default(""),
  notes: z.string().trim().max(1000).default(""),
  isPrimary: z.boolean().default(false),
});

export type ContactSchema = z.infer<typeof contactSchema>;
