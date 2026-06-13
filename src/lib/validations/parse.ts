import type { z } from "zod";

export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * Valida `input` contra un esquema Zod y normaliza el resultado al shape
 * `{ ok, error }` que usan las server actions. Devuelve el primer mensaje de
 * error para mostrar al usuario.
 */
export function parseInput<T>(schema: z.ZodType<T>, input: unknown): ParseResult<T> {
  const result = schema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  const first = result.error.issues[0]?.message ?? "Datos invalidos.";
  return { ok: false, error: first };
}
