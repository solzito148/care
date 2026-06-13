import { redirect } from "next/navigation";

import { PersonaCuidadaClient } from "@/app/(app)/persona-cuidada/persona-cuidada-client";
import { RelacionesSection } from "@/app/(app)/persona-cuidada/relaciones-section";
import { careRecipientToPersona } from "@/lib/data/persona-map";
import { ensureCareContext } from "@/lib/data/care-context";
import { loadRelationships } from "@/lib/data/relaciones";
import { getCurrentUser } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";
import type { RelationshipType } from "@/lib/supabase/types";

export default async function PersonaCuidadaPage() {
  const ctx = await ensureCareContext();
  if (!ctx) redirect("/login");

  const supabase = await createClient();
  const { data: row, error } = await supabase.from("care_recipients").select("*").eq("id", ctx.careRecipientId).maybeSingle();

  if (error || !row) {
    redirect("/login");
  }

  const initial = careRecipientToPersona(row);

  const [user, relationships, household] = await Promise.all([
    getCurrentUser(),
    loadRelationships(),
    supabase
      .from("households")
      .select("owner_user_id")
      .eq("id", ctx.householdId)
      .maybeSingle(),
  ]);

  const isOwner = Boolean(user && household.data?.owner_user_id === user.id);
  const roles = user?.roles ?? [];
  const canModerate = isOwner || roles.includes("admin");
  const canPropose =
    canModerate || roles.includes("caregiver") || roles.includes("professional");
  const allowedTypes: RelationshipType[] = canModerate
    ? ["caregiver", "professional", "family", "legal", "other"]
    : ["professional"];

  return (
    <div className="space-y-6">
      <PersonaCuidadaClient initial={initial} />
      <RelacionesSection
        careRecipientId={ctx.careRecipientId}
        canModerate={canModerate}
        canPropose={canPropose}
        active={relationships.active}
        pending={relationships.pending}
        allowedTypes={allowedTypes}
      />
    </div>
  );
}
