import { redirect } from "next/navigation";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ seccion?: string | string[] }>;
}) {
  const { seccion } = await searchParams;
  const value = Array.isArray(seccion) ? seccion[0] : seccion;
  redirect(value ? `/servicios?seccion=${encodeURIComponent(value)}` : "/servicios");
}
