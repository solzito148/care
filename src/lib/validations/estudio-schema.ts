import { z } from "zod";

export const createStudySchema = z.object({
  title: z.string().trim().min(1, "Indica el nombre del estudio.").max(160),
  studyType: z.string().trim().max(80).default(""),
  doctor: z.string().trim().max(120).default(""),
  fecha: z.string().trim().max(10).default(""),
  hora: z.string().trim().max(8).default(""),
  preparationNotes: z.string().trim().max(1000).default(""),
  tzOffsetMinutes: z.number().finite().default(0),
});

export type CreateStudySchema = z.infer<typeof createStudySchema>;
