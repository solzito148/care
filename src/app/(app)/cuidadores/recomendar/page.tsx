import { RecomendarCuidadorClient } from "@/app/(app)/cuidadores/recomendar/recomendar-client";
import { listCaregiverProfiles } from "@/lib/data/caregivers";

export default async function RecomendarCuidadorPage() {
  const caregivers = await listCaregiverProfiles();

  return <RecomendarCuidadorClient key={caregivers.map((c) => c.id).join(",")} caregivers={caregivers} />;
}
