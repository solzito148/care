import { describe, expect, it } from "vitest";

import {
  appNavItems,
  filterNavItemsByRoles,
  getMobileNavItems,
} from "@/lib/navigation";

const labels = (items: { label: string }[]) => items.map((item) => item.label);

describe("filtrado de navegación por rol", () => {
  it("muestra Cuidadores para tutor", () => {
    const items = filterNavItemsByRoles(appNavItems, ["tutor"]);
    expect(labels(items)).toContain("Cuidadores");
  });

  it("oculta Cuidadores para caregiver pero mantiene Agenda", () => {
    const items = filterNavItemsByRoles(appNavItems, ["caregiver"]);
    expect(labels(items)).not.toContain("Cuidadores");
    expect(labels(items)).toContain("Agenda");
  });

  it("muestra Legales para legal_admin", () => {
    const items = filterNavItemsByRoles(appNavItems, ["legal_admin"]);
    expect(labels(items).some((label) => /Legales/.test(label))).toBe(true);
  });

  it("oculta Legales para tutor", () => {
    const items = filterNavItemsByRoles(appNavItems, ["tutor"]);
    expect(labels(items).some((label) => /Legales/.test(label))).toBe(false);
  });
});

describe("navegación móvil", () => {
  it("filtra items móviles por rol", () => {
    const items = getMobileNavItems(filterNavItemsByRoles(appNavItems, ["provider"]));
    expect(items.map((item) => item.shortLabel)).toContain("Inicio");
    expect(labels(items)).not.toContain("Agenda");
  });
});
