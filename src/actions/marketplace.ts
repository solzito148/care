"use server";

import { revalidatePath } from "next/cache";

import type { MarketplaceTab } from "@/lib/marketplace-types";
import { createClient } from "@/lib/supabase/server";

export type PublishItemInput = {
  title: string;
  category: string;
  zone: string;
  condition: string;
  price: string;
  listingType: MarketplaceTab;
  contactPhone: string;
};

const LISTING_TYPES: MarketplaceTab[] = [
  "venta",
  "alquiler",
  "intercambio",
  "donaciones",
];

export async function publishMarketplaceItemAction(
  form: PublishItemInput
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesion requerida." };

  const title = form.title.trim();
  if (title.length < 3) return { ok: false, error: "Indica un titulo (minimo 3 caracteres)." };
  if (!LISTING_TYPES.includes(form.listingType)) {
    return { ok: false, error: "Seccion invalida." };
  }

  const isPaidSection = form.listingType === "venta" || form.listingType === "alquiler";
  const price = form.price.trim();
  if (!isPaidSection && price) {
    return {
      ok: false,
      error: "Intercambio y donaciones son gratuitos: no se permite indicar precio.",
    };
  }

  const { error } = await supabase.from("marketplace_items").insert({
    owner_user_id: user.id,
    title,
    category: form.category.trim(),
    zone: form.zone.trim(),
    condition: form.condition.trim(),
    price: isPaidSection ? price || null : null,
    listing_type: form.listingType,
    contact_phone: form.contactPhone.trim(),
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

  const { error } = await supabase
    .from("marketplace_items")
    .update({ status })
    .eq("id", itemId)
    .eq("owner_user_id", user.id);

  if (error) {
    console.error("setMarketplaceItemStatus", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/marketplace");
  return { ok: true };
}
