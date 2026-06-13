"use server";

import { recordAuditLog } from "@/lib/audit";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Elimina de forma permanente la cuenta del usuario autenticado (requisito de
 * App Store / Google Play y buena practica de privacidad).
 *
 * Orden de borrado:
 * 1. Households de los que es owner (FK `on delete restrict`): se borran primero
 *    para liberar la restriccion; su cascade limpia miembros, personas cuidadas,
 *    estudios, medicacion, contactos, etc.
 * 2. El usuario de auth: su cascade limpia profile, roles, membresias en otros
 *    hogares, notificaciones y suscripciones.
 *
 * No recibe datos del cliente: solo opera sobre la sesion vigente.
 */
export async function deleteAccountAction(): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión requerida." };

  const service = createServiceClient();
  if (!service) {
    console.error("deleteAccount: missing SUPABASE_SERVICE_ROLE_KEY");
    return { ok: false, error: "No se pudo eliminar la cuenta. Intentá más tarde." };
  }

  // Auditar antes de borrar: despues el actor ya no existe.
  await recordAuditLog({
    entityType: "account",
    entityId: user.id,
    action: "account_deletion_requested",
  });

  const { error: householdError } = await service
    .from("households")
    .delete()
    .eq("owner_user_id", user.id);

  if (householdError) {
    console.error("deleteAccount households", householdError.message);
    return { ok: false, error: "No se pudo eliminar la cuenta. Intentá más tarde." };
  }

  const { error: userError } = await service.auth.admin.deleteUser(user.id);
  if (userError) {
    console.error("deleteAccount user", userError.message);
    return { ok: false, error: "No se pudo eliminar la cuenta. Intentá más tarde." };
  }

  await supabase.auth.signOut();
  return { ok: true };
}
