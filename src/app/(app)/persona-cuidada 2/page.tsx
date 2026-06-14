import { redirect } from "next/navigation";

import { PersonaCuidadaClient } from "@/app/(app)/persona-cuidada/persona-cuidada-client";
import { careRecipientToPersona } from "@/lib/data/persona-map";
import { ensureCareContext } from "@/lib/data/care-context";
import { createClient } from "@/lib/supabase/server";

export default async function PersonaCuidadaPage() {
  const ctx = await ensureCareContext();
  if (!ctx) redirect("/login");

  const supabase = await createClient();
  const { data: row, error } = await supabase.from("care_recipients").select("*").eq("id", ctx.careRecipientId).maybeSingle();

  if (error || !row) {
    redirect("/login");
  }

  const initial = careRecipientToPersona(row);

  return <PersonaCuidadaClient initial={initial} />;
}
