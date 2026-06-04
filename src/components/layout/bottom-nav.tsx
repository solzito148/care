"use client";

import { usePathname } from "next/navigation";

import { BottomNavView } from "@/components/layout/nav-list";
import { useFilteredMobileNavItems } from "@/hooks/useCurrentUser";

export { BottomNavView } from "@/components/layout/nav-list";

export function BottomNav() {
  const pathname = usePathname();
  const items = useFilteredMobileNavItems();
  return <BottomNavView items={items} pathname={pathname} />;
}
