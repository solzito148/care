"use server";

import { revalidatePath } from "next/cache";

import type { AccountType } from "@/lib/auth-types";
import { recordAuditLog } from "@/lib/audit";
import { ensureCareContext } from "@/lib/data/care-context";
import { createClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validations/onboarding-schema";
import { parseInput } from "@/lib/validations/parse";

export type OnboardingInput = {
  accountType: AccountType;
  fullName: string;
  phone: string;
  // tutor / familiar
  recipientName: string;
  recipientPreferredName: string;
  recipientBirthDate: string;
  recipientEmergencyNotes: string;
  // cuidador
  locality: string;
  experienceYears: string;
};

function dateOrNull(value: string): string | null {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim()) ? value.trim() : null;
}

function initialsOf(fullName: string): string {
  return (
    fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((token) => token[0]?.toUpperCase() ?? "")
      .join("") || "CU"
  );
}

export async function completeOnboardingAction(
  form: OnboardingInput
): Promise<{ ok: boolean; error?: string }> {
  const parsed = parseInput(onboardingSchema, form);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const input = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión requerida." };

  const { data: profile, error: profileReadError } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .maybeSingle();
  if (profileReadError) {
    console.error("completeOnboarding: profile read", profileReadError);
    return { ok: false, error: profileReadError.message };
  }
  if (!profile?.account_type) {
    return { ok: false, error: "Falta el tipo de cuenta. Volvé a registrarte." };
  }
  if (input.accountType !== profile.account_type) {
    return { ok: false, error: "El tipo de cuenta no coincide con tu registro." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: input.fullName, phone: input.phone || null })
    .eq("id", user.id);
  if (profileError) {
    console.error("completeOnboarding: profile", profileError);
    return { ok: false, error: profileError.message };
  }

  const { error: roleError } = await supabase.rpc("sync_user_role_from_account_type", {
    p_user_id: user.id,
  });
  if (roleError) {
    console.error("completeOnboarding: role sync", roleError);
    return {
      ok: false,
      error: roleError.message.includes("sync_user_role_from_account_type")
        ? "Falta la funcion de roles en Supabase. Ejecuta supabase/migrate-all.sql."
        : roleError.message,
    };
  }

  if (profile.account_type === "tutor-familiar-encargado") {
    const context = await ensureCareContext();
    if (context && input.recipientName) {
      const { error } = await supabase
        .from("care_recipients")
        .update({
          full_name: input.recipientName,
          preferred_name: input.recipientPreferredName || null,
          birth_date: dateOrNull(input.recipientBirthDate),
          emergency_notes: input.recipientEmergencyNotes || null,
        })
        .eq("id", context.careRecipientId);
      if (error) console.error("completeOnboarding: recipient", error);
    }
  }

  if (profile.account_type === "cuidador") {
    const { data: existing } = await supabase
      .from("caregiver_profiles")
      .select("id")
      .eq("linked_user_id", user.id)
      .maybeSingle();

    if (!existing) {
      const experienceYears = Math.max(0, Math.min(60, Number(input.experienceYears) || 0));
      const { error } = await supabase.from("caregiver_profiles").insert({
        display_initials: initialsOf(input.fullName),
        full_name: input.fullName,
        locality: input.locality,
        experience_years: experienceYears,
        profile_status: "pendiente-actualizacion",
        last_profile_update: new Date().toISOString().slice(0, 10),
        linked_user_id: user.id,
      });
      if (error) console.error("completeOnboarding: caregiver", error);
    }
  }

  await recordAuditLog({
    entityType: "onboarding",
    action: "onboarding_completed",
    payload: { account_type: profile.account_type },
  });

  revalidatePath("/dashboard");
  return { ok: true };
}
