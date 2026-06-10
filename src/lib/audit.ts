import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

type AuditInput = {
  entityType: string;
  entityId?: string | null;
  action: string;
  payload?: Json;
};

/**
 * Registra un evento auditable en `public.audit_logs`. Best-effort: si falla
 * (tabla ausente o RLS) no interrumpe la accion de negocio, solo loguea.
 * El `actor_user_id` se deja en null para que la policy lo complete con auth.uid().
 */
export async function recordAuditLog({
  entityType,
  entityId = null,
  action,
  payload = {},
}: AuditInput): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("audit_logs").insert({
      actor_user_id: user.id,
      entity_type: entityType,
      entity_id: entityId,
      action,
      payload,
    });

    if (error) console.warn("recordAuditLog", error.message);
  } catch (err) {
    console.warn("recordAuditLog", err);
  }
}
