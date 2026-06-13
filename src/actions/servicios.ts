"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { ServiceCategory, ServicePlan } from "@/lib/servicios-types";
import { uuidSchema } from "@/lib/validations/common-schema";
import { parseInput } from "@/lib/validations/parse";
import {
  publishServiceSchema,
  serviceStatusSchema,
} from "@/lib/validations/servicios-schema";

export type PublishServiceInput = {
  providerName: string;
  category: ServiceCategory;
  description: string;
  coverageZone: string;
  availability: string;
  phoneWhatsapp: string;
  email: string;
  plan: ServicePlan;
};

export async function publishServiceAction(
  form: PublishServiceInput
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión requerida." };

  const parsed = parseInput(publishServiceSchema, form);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const input = parsed.data;

  const { error } = await supabase.from("services").insert({
    owner_user_id: user.id,
    provider_name: input.providerName,
    category: input.category,
    description: input.description,
    coverage_zone: input.coverageZone,
    availability: input.availability,
    phone_whatsapp: input.phoneWhatsapp,
    email: input.email,
    plan: input.plan,
    featured: input.plan !== "Basico",
  });

  if (error) {
    console.error("publishService", error);
    return {
      ok: false,
      error: error.message.includes("services")
        ? "Falta la tabla de servicios. Ejecuta supabase/phase4.sql."
        : error.message,
    };
  }

  revalidatePath("/servicios");
  return { ok: true };
}

export async function setServiceStatusAction(
  serviceId: string,
  status: "publicado" | "pausado"
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión requerida." };

  const idParsed = parseInput(uuidSchema, serviceId);
  if (!idParsed.ok) return { ok: false, error: idParsed.error };
  const statusParsed = parseInput(serviceStatusSchema, status);
  if (!statusParsed.ok) return { ok: false, error: statusParsed.error };

  const { error } = await supabase
    .from("services")
    .update({ status: statusParsed.data })
    .eq("id", idParsed.data)
    .eq("owner_user_id", user.id);

  if (error) {
    console.error("setServiceStatus", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/servicios");
  return { ok: true };
}
