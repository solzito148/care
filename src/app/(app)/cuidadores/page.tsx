import { CuidadoresClient } from "@/app/(app)/cuidadores/cuidadores-client";
import { listCaregiverProfiles } from "@/lib/data/caregivers";

export default async function CuidadoresPage() {
  const caregivers = await listCaregiverProfiles();

  return <CuidadoresClient caregivers={caregivers} />;
}
