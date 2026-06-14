import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { currentSubscriptionMock } from "@/lib/monetizacion-mock";
import { ACCOUNT_TYPE_LABELS, getCurrentUser } from "@/lib/permissions";

const stateTone = {
  activa: "success",
  "pendiente-pago": "warning",
  vencida: "danger",
  cancelada: "danger",
} as const;

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  tutor: "Tutor / Familiar",
  caregiver: "Cuidador",
  professional: "Profesional de salud",
  legal_admin: "Profesional legal/administrativo",
  provider: "Proveedor",
  care_recipient: "Persona cuidada",
};

export default async function MiCuentaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const accountTypeLabel = user.profile?.account_type
    ? ACCOUNT_TYPE_LABELS[user.profile.account_type] ?? user.profile.account_type
    : "Sin definir";

  return (
    <section className="space-y-4 pb-8">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Mi cuenta</h1>
        <p className="mt-2 text-slate-700">
          Datos personales, tipo de cuenta y suscripcion. Pagos aun no integrados.
        </p>
      </Card>

      <Card className="p-6 sm:p-7">
        <h2 className="text-xl font-semibold text-slate-900">Datos personales</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-600">Nombre</dt>
            <dd className="text-slate-900">
              {user.profile?.full_name?.trim() || "Sin nombre cargado"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-600">Email</dt>
            <dd className="text-slate-900">{user.email ?? "-"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-600">Telefono</dt>
            <dd className="text-slate-900">{user.profile?.phone ?? "-"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-600">Tipo de cuenta</dt>
            <dd className="text-slate-900">{accountTypeLabel}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-medium text-slate-600">Roles asignados</dt>
            <dd className="mt-1 flex flex-wrap gap-2">
              {user.roles.length === 0 ? (
                <span className="text-slate-700">Sin roles cargados.</span>
              ) : (
                user.roles.map((code) => (
                  <Badge key={code} tone="info">
                    {ROLE_LABEL[code] ?? code}
                  </Badge>
                ))
              )}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold text-slate-900">
            {currentSubscriptionMock.planNombre}
          </h2>
          <Badge tone={stateTone[currentSubscriptionMock.estado]}>
            {currentSubscriptionMock.estado}
          </Badge>
        </div>
        <p className="mt-3 text-sm text-slate-700">
          <strong>Cuenta:</strong> {currentSubscriptionMock.cuenta}
        </p>
        <p className="text-sm text-slate-700">
          <strong>Monto:</strong> {currentSubscriptionMock.monto}
        </p>
        <p className="text-sm text-slate-700">
          <strong>Ciclo:</strong> {currentSubscriptionMock.cicloFacturacion}
        </p>
        <p className="text-sm text-slate-700">
          <strong>Proximo vencimiento:</strong> {currentSubscriptionMock.proximoVencimiento}
        </p>
        <p className="mt-2 text-sm text-slate-600">
          {currentSubscriptionMock.notaIntegracion}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button href="/planes">Ver planes</Button>
          <Button variant="secondary">Cambiar plan</Button>
          <Button variant="secondary">Cancelar suscripcion</Button>
        </div>
      </Card>
    </section>
  );
}
