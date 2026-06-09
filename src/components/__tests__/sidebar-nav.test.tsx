import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  BottomNavView,
  SidebarNavView,
} from "@/components/layout/nav-list";
import {
  appNavItems,
  filterNavItemsByRoles,
  getMobileNavItems,
} from "@/lib/navigation";

describe("SidebarNav", () => {
  it("muestra Cuidadores para tutor", () => {
    const items = filterNavItemsByRoles(appNavItems, ["tutor"]);
    render(<SidebarNavView items={items} pathname="/dashboard" />);
    expect(screen.getByRole("link", { name: "Cuidadores" })).toBeInTheDocument();
  });

  it("oculta Cuidadores para caregiver", () => {
    const items = filterNavItemsByRoles(appNavItems, ["caregiver"]);
    render(<SidebarNavView items={items} pathname="/dashboard" />);
    expect(screen.queryByRole("link", { name: "Cuidadores" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Agenda" })).toBeInTheDocument();
  });

  it("muestra Legales para legal_admin", () => {
    const items = filterNavItemsByRoles(appNavItems, ["legal_admin"]);
    render(<SidebarNavView items={items} pathname="/dashboard" />);
    expect(
      screen.getByRole("link", { name: /Legales/ }),
    ).toBeInTheDocument();
  });

  it("oculta Legales para tutor", () => {
    const items = filterNavItemsByRoles(appNavItems, ["tutor"]);
    render(<SidebarNavView items={items} pathname="/dashboard" />);
    expect(screen.queryByRole("link", { name: /Legales/ })).not.toBeInTheDocument();
  });
});

describe("BottomNav", () => {
  it("filtra items móviles por rol", () => {
    const items = getMobileNavItems(
      filterNavItemsByRoles(appNavItems, ["provider"]),
    );
    render(<BottomNavView items={items} pathname="/dashboard" />);
    expect(screen.getByRole("link", { name: "Inicio" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Agenda" })).not.toBeInTheDocument();
  });
});
