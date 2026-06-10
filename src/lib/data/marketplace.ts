import type { MarketplaceItem } from "@/lib/marketplace-types";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type ItemRow = Database["public"]["Tables"]["marketplace_items"]["Row"];

export type MarketplaceListItem = MarketplaceItem & {
  contactPhone: string;
  own: boolean;
  status: ItemRow["status"];
};

function initials(title: string): string {
  return (
    title
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((t) => t[0]?.toUpperCase() ?? "")
      .join("") || "MP"
  );
}

function rowToItem(row: ItemRow, currentUserId: string | null): MarketplaceListItem {
  return {
    id: row.id,
    foto: initials(row.title),
    titulo: row.title,
    categoria: row.category,
    zona: row.zone,
    estado: row.condition,
    precio: row.price ?? undefined,
    tipo: row.listing_type,
    contactPhone: row.contact_phone,
    own: Boolean(currentUserId && row.owner_user_id === currentUserId),
    status: row.status,
  };
}

export async function loadMarketplaceItems(): Promise<MarketplaceListItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("marketplace_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("loadMarketplaceItems", error);
    return [];
  }

  return ((data ?? []) as ItemRow[]).map((row) => rowToItem(row, user?.id ?? null));
}
