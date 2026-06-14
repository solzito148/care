import { redirect } from "next/navigation";
import { accountTypeOptions } from "@/lib/auth-types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-2xl p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Onboarding CARE</h1>
        <p className="mt-3 text-slate-700">
          {selectedType
            ? `Bienvenido. Iniciemos el onboarding para: ${selectedType.label}.`
            : "Tipo de cuenta no reconocido. Puedes volver a registro y seleccionarlo nuevamente."}
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Este flujo esta mockeado y preparado para integrar autenticacion real en la siguiente
          etapa.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/dashboard">Ir al panel inicial</Button>
          <Button href="/registro" variant="secondary">
            Volver a registro
          </Button>
        </div>
      </Card>
    </main>
  );
}
