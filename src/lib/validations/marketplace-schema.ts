import { z } from "zod";

import { phoneSchema, shortText } from "@/lib/validations/common-schema";

export const marketplaceListingTypeSchema = z.enum([
  "venta",
  "alquiler",
  "intercambio",
  "donaciones",
]);

export const publishMarketplaceItemSchema = z.object({
  title: shortText(160).min(3, "Indica un titulo (minimo 3 caracteres)."),
  category: shortText(80).default(""),
  zone: shortText(120).default(""),
  condition: shortText(80).default(""),
  price: shortText(40).default(""),
  listingType: marketplaceListingTypeSchema,
  contactPhone: phoneSchema.default(""),
});

export const marketplaceItemStatusSchema = z.enum(["publicado", "pausado"]);
