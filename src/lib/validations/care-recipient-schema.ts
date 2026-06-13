import { z } from "zod";

export const addCareRecipientSchema = z.object({
  fullName: z.string().trim().min(2, "Indica el nombre de la persona cuidada.").max(120),
  preferredName: z.string().trim().max(80).default(""),
  birthDate: z.string().trim().max(10).default(""),
  emergencyNotes: z.string().trim().max(1000).default(""),
});

export type AddCareRecipientSchema = z.infer<typeof addCareRecipientSchema>;
