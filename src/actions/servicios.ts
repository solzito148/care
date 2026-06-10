"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { ServiceCategory, ServicePlan } from "@/lib/servicios-types";

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

const CATEGORIES: ServiceCategory[] = [
  "traslados-y-acompanamiento",
  "desarme-y-organizacion-del-hogar",
  "adaptacion-del-hogar",
  "tramites-y-gestiones",
  "servicios-domiciliarios-complementarios",
];

const PLANS: ServicePlan[] = ["Basico", "Destacado", "Premium"];

export async function publishServiceAction(
  form: PublishServiceInput
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesion requerida." };

  const providerName = form.providerName.trim();
  if (providerName.length < 2) return { ok: false, error: "Indica el nombre del proveedor." };
  if (!CATEGORIES.includes(form.category)) return { ok: false, error: "Categoria invalida." };
  const plan = PLANS.includes(form.plan) ? form.plan : "Basico";

  const { error } = await supabase.from("services").insert({
    owner_user_id: user.id,
    provider_name: providerName,
    category: form.category,
    description: form.description.trim(),
    coverage_zone: form.coverageZone.trim(),
    availability: form.availability.trim(),
    phone_whatsapp: form.phoneWhatsapp.trim(),
    email: form.email.trim(),
    plan,
    featured: plan !== "Basico",
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
  if (!user) return { ok: false, error: "Sesion requerida." };

  const { error } = await supabase
    .from("services")
    .update({ status })
    .eq("id", serviceId)
    .eq("owner_user_id", user.id);

  if (error) {
    console.error("setServiceStatus", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/servicios");
  return { ok: true };
}
