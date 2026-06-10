"use server";

import { revalidatePath } from "next/cache";

import type { AccountType } from "@/lib/auth-types";
import { recordAuditLog } from "@/lib/audit";
import { ensureCareContext } from "@/lib/data/care-context";
import { createClient } from "@/lib/supabase/server";

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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesion requerida." };

  const fullName = form.fullName.trim();
  if (fullName.length < 2) return { ok: false, error: "Indica tu nombre completo." };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone: form.phone.trim() || null })
    .eq("id", user.id);
  if (profileError) {
    console.error("completeOnboarding: profile", profileError);
    return { ok: false, error: profileError.message };
  }

  if (form.accountType === "tutor-familiar-encargado") {
    const context = await ensureCareContext();
    if (context && form.recipientName.trim()) {
      const { error } = await supabase
        .from("care_recipients")
        .update({
          full_name: form.recipientName.trim(),
          preferred_name: form.recipientPreferredName.trim() || null,
          birth_date: dateOrNull(form.recipientBirthDate),
          emergency_notes: form.recipientEmergencyNotes.trim() || null,
        })
        .eq("id", context.careRecipientId);
      if (error) console.error("completeOnboarding: recipient", error);
    }
  }

  if (form.accountType === "cuidador") {
    const { data: existing } = await supabase
      .from("caregiver_profiles")
      .select("id")
      .eq("linked_user_id", user.id)
      .maybeSingle();

    if (!existing) {
      const experienceYears = Math.max(0, Math.min(60, Number(form.experienceYears) || 0));
      const { error } = await supabase.from("caregiver_profiles").insert({
        display_initials: initialsOf(fullName),
        full_name: fullName,
        locality: form.locality.trim(),
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
    payload: { account_type: form.accountType },
  });

  revalidatePath("/dashboard");
  return { ok: true };
}
