"use server";

import { revalidatePath } from "next/cache";

import type { MarketplaceTab } from "@/lib/marketplace-types";
import { createClient } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validations/common-schema";
import {
  marketplaceItemStatusSchema,
  publishMarketplaceItemSchema,
} from "@/lib/validations/marketplace-schema";
import { parseInput } from "@/lib/validations/parse";

export type PublishItemInput = {
  title: string;
  category: string;
  zone: string;
  condition: string;
  price: string;
  listingType: MarketplaceTab;
  contactPhone: string;
};

export async function publishMarketplaceItemAction(
  form: PublishItemInput
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesion requerida." };

  const parsed = parseInput(publishMarketplaceItemSchema, form);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const input = parsed.data;

  const isPaidSection = input.listingType === "venta" || input.listingType === "alquiler";
  const price = input.price;
  if (!isPaidSection && price) {
    return {
      ok: false,
      error: "Intercambio y donaciones son gratuitos: no se permite indicar precio.",
    };
  }

  const { error } = await supabase.from("marketplace_items").insert({
    owner_user_id: user.id,
    title: input.title,
    category: input.category,
    zone: input.zone,
    condition: input.condition,
    price: isPaidSection ? price || null : null,
    listing_type: input.listingType,
    contact_phone: input.contactPhone,
  });

  if (error) {
    console.error("publishMarketplaceItem", error);
    return {
      ok: false,
      error: error.message.includes("marketplace_items")
        ? "Falta la tabla de marketplace. Ejecuta supabase/phase4.sql."
        : error.message,
    };
  }

  revalidatePath("/marketplace");
  return { ok: true };
}

export async function setMarketplaceItemStatusAction(
  itemId: string,
  status: "publicado" | "pausado"
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesion requerida." };

  const idParsed = parseInput(uuidSchema, itemId);
  if (!idParsed.ok) return { ok: false, error: idParsed.error };
  const statusParsed = parseInput(marketplaceItemStatusSchema, status);
  if (!statusParsed.ok) return { ok: false, error: statusParsed.error };

  const { error } = await supabase
    .from("marketplace_items")
    .update({ status: statusParsed.data })
    .eq("id", idParsed.data)
    .eq("owner_user_id", user.id);

  if (error) {
    console.error("setMarketplaceItemStatus", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/marketplace");
  return { ok: true };
}
