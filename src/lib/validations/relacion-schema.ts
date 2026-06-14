import { z } from "zod";

import {
  emailOptionalSchema,
  mediumText,
  phoneSchema,
  uuidSchema,
} from "./common-schema";

export const relationshipTypeSchema = z.enum([
  "caregiver",
  "professional",
  "family",
  "legal",
  "other",
]);

export const createRelationshipSchema = z
  .object({
    careRecipientId: uuidSchema,
    relationshipType: relationshipTypeSchema,
    subjectUserId: z.union([z.literal(""), uuidSchema]).default(""),
    subjectName: z.string().trim().max(120).default(""),
    subjectRelation: z.string().trim().max(40).default(""),
    subjectPhone: phoneSchema.default(""),
    subjectEmail: emailOptionalSchema.default(""),
    notes: mediumText(1000).default(""),
  })
  .refine(
    (data) => data.subjectUserId.length > 0 || data.subjectName.length > 0,
    {
      message: "Indicá una persona vinculada o un nombre de contacto.",
      path: ["subjectName"],
    },
  );

export type CreateRelationshipSchema = z.infer<typeof createRelationshipSchema>;

export const relationshipDecisionSchema = z.object({
  relationshipId: uuidSchema,
  decision: z.enum(["approved", "rejected", "revoked"]),
});

export type RelationshipDecisionSchema = z.infer<
  typeof relationshipDecisionSchema
>;

export const relationshipManagerSchema = z.object({
  relationshipId: uuidSchema,
  isManager: z.boolean(),
});

export type RelationshipManagerSchema = z.infer<
  typeof relationshipManagerSchema
>;
