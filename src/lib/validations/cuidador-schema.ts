import { z } from "zod";

export const cuidadorSchema = z.object({
  fullName: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(9, "Teléfono inválido"),
  relationship: z.string().min(2, "Relación requerida"),
});

export type CuidadorInput = z.infer<typeof cuidadorSchema>;
