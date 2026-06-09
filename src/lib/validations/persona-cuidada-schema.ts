import { z } from "zod";

export const personaCuidadaSchema = z.object({
  fullName: z.string().min(2, "Nombre requerido"),
  birthDate: z.string().min(1, "Fecha de nacimiento requerida"),
  notes: z.string().max(500, "Máximo 500 caracteres").optional(),
});

export type PersonaCuidadaInput = z.infer<typeof personaCuidadaSchema>;
