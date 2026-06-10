import type { ServiceItem } from "@/lib/servicios-types";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type ServiceRow = Database["public"]["Tables"]["services"]["Row"];

export type ServiceListItem = ServiceItem & {
  /** true si la publicacion pertenece al usuario actual */
  own: boolean;
  status: ServiceRow["status"];
};

function rowToItem(row: ServiceRow, currentUserId: string | null): ServiceListItem {
  return {
    id: row.id,
    nombreProveedor: row.provider_name,
    categoria: row.category,
    descripcion: row.description,
    zonaCobertura: row.coverage_zone,
    telefonoWhatsapp: row.phone_whatsapp,
    email: row.email,
    plan: row.plan,
    destacado: row.featured,
    disponibilidad: row.availability,
    own: Boolean(currentUserId && row.owner_user_id === currentUserId),
    status: row.status,
  };
}

export async function loadServices(): Promise<ServiceListItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("loadServices", error);
    return [];
  }

  return ((data ?? []) as ServiceRow[]).map((row) =>
    rowToItem(row, user?.id ?? null)
  );
}
