import { redirect } from "next/navigation";

import { OnboardingForm } from "@/app/onboarding/[tipo]/onboarding-form";
import { accountTypeOptions, type AccountType } from "@/lib/auth-types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/permissions";

type OnboardingPageProps = {
  params: Promise<{
    tipo: string;
  }>;
};

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  const { tipo } = await params;
  const selectedType = accountTypeOptions.find((option) => option.value === tipo);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-2xl p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Onboarding CARE</h1>
        {selectedType ? (
          <>
            <p className="mt-2 text-slate-700">
              Completá tus datos para configurar tu cuenta de {selectedType.label}.
            </p>
            <OnboardingForm
              accountType={selectedType.value as AccountType}
              defaultFullName={user.profile?.full_name ?? ""}
              defaultPhone={user.profile?.phone ?? ""}
            />
          </>
        ) : (
          <>
            <p className="mt-3 text-slate-700">
              Tipo de cuenta no reconocido. Volvé a registro y seleccioná uno nuevamente.
            </p>
            <div className="mt-6">
              <Button href="/registro" variant="secondary">
                Volver a registro
              </Button>
            </div>
          </>
        )}
      </Card>
    </main>
  );
}
