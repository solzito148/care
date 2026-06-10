import { Suspense } from "react";
import { notFound } from "next/navigation";

import { CuidadorDetalleClient } from "@/app/(app)/cuidadores/[id]/cuidador-detalle-client";
import {
  getCaregiverProfile,
  listApprovedRecommendations,
  listCaregiverReferences,
} from "@/lib/data/caregivers";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CuidadorPerfilPage({ params }: Props) {
  const { id } = await params;
  const caregiver = await getCaregiverProfile(id);
  if (!caregiver) notFound();

  const [references, recommendations] = await Promise.all([
    listCaregiverReferences(id),
    listApprovedRecommendations(id),
  ]);

  return (
    <Suspense fallback={<p className="p-6 text-slate-600">Cargando perfil…</p>}>
      <CuidadorDetalleClient
        caregiver={caregiver}
        references={references}
        recommendations={recommendations}
      />
    </Suspense>
  );
}
