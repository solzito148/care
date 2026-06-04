"use client";

import { usePathname } from "next/navigation";

import { SidebarNavView } from "@/components/layout/nav-list";
import { useFilteredNavItems } from "@/hooks/useCurrentUser";

export { SidebarNavView } from "@/components/layout/nav-list";

export function SidebarNav() {
  const pathname = usePathname();
  const items = useFilteredNavItems();
  return <SidebarNavView items={items} pathname={pathname} />;
}
