import { z } from "zod";

export const medicacionSchema = z.object({
  name: z.string().min(2, "Nombre del medicamento requerido"),
  dose: z.string().min(1, "Dosis requerida"),
  frequency: z.string().min(1, "Frecuencia requerida"),
  startDate: z.string().min(1, "Fecha de inicio requerida"),
});

export type MedicacionInput = z.infer<typeof medicacionSchema>;
