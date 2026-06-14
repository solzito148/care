import { z } from "zod";

import { uuidSchema } from "@/lib/validations/common-schema";

export const moderationStatusSchema = z.enum(["publicado", "pausado", "bloqueado"]);

export const reviewDecisionSchema = z.enum(["aprobada", "rechazada"]);

export const idParamSchema = z.object({ id: uuidSchema });

export const planIdSchema = z.string().trim().min(2, "Plan invalido.").max(40);
