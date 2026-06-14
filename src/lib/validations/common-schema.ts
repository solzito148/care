import { z } from "zod";

export const uuidSchema = z.string().uuid("Id invalido.");

export const optionalDateSchema = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Fecha invalida.");

export const shortText = (max = 120) => z.string().trim().max(max);
export const mediumText = (max = 500) => z.string().trim().max(max);
export const longText = (max = 2000) => z.string().trim().max(max);

export const phoneSchema = z.string().trim().max(30);
export const emailOptionalSchema = z.union([
  z.literal(""),
  z.string().trim().email("Email invalido.").max(160),
]);

// DNI argentino: 7 u 8 digitos. Normaliza descartando puntos/espacios.
export const dniSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/\D/g, ""))
  .refine((value) => value.length >= 7 && value.length <= 8, "DNI invalido (7 u 8 digitos).");

// Igual que dniSchema pero acepta vacio (campos opcionales).
export const dniOptionalSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/\D/g, ""))
  .refine(
    (value) => value === "" || (value.length >= 7 && value.length <= 8),
    "DNI invalido (7 u 8 digitos).",
  );
