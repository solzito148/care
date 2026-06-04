import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  BottomNavView,
  SidebarNavView,
} from "@/components/layout/nav-list";
import { filterNavItemsByRoles, NAV_ITEMS } from "@/lib/navigation";

describe("SidebarNav", () => {
  it("muestra Cuidadores para tutor", () => {
    const items = filterNavItemsByRoles(NAV_ITEMS, ["tutor"]);
    render(<SidebarNavView items={items} pathname="/dashboard" />);
    expect(screen.getByRole("link", { name: "Cuidadores" })).toBeInTheDocument();
  });

  it("oculta Cuidadores para caregiver", () => {
    const items = filterNavItemsByRoles(NAV_ITEMS, ["caregiver"]);
    render(<SidebarNavView items={items} pathname="/dashboard" />);
    expect(screen.queryByRole("link", { name: "Cuidadores" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Agenda" })).toBeInTheDocument();
  });

  it("muestra Legales para legal_admin", () => {
    const items = filterNavItemsByRoles(NAV_ITEMS, ["legal_admin"]);
    render(<SidebarNavView items={items} pathname="/dashboard" />);
    expect(screen.getByRole("link", { name: "Legales" })).toBeInTheDocument();
  });

  it("oculta Legales para tutor", () => {
    const items = filterNavItemsByRoles(NAV_ITEMS, ["tutor"]);
    render(<SidebarNavView items={items} pathname="/dashboard" />);
    expect(screen.queryByRole("link", { name: "Legales" })).not.toBeInTheDocument();
  });
});

describe("BottomNav", () => {
  it("filtra items móviles por rol", () => {
    const items = filterNavItemsByRoles(NAV_ITEMS, ["provider"]).filter(
      (item) => item.mobile,
    );
    render(<BottomNavView items={items.slice(0, 5)} pathname="/dashboard" />);
    expect(screen.getByRole("link", { name: "Inicio" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Agenda" })).not.toBeInTheDocument();
  });
});
