import { describe, expect, it } from "vitest";

import {
  canSeeNavItem,
  filterNavItemsByRoles,
  NAV_ITEMS,
} from "@/lib/navigation";

describe("navigation", () => {
  it("oculta Cuidadores para caregiver", () => {
    const items = filterNavItemsByRoles(NAV_ITEMS, ["caregiver"]);
    expect(items.some((item) => item.href === "/cuidadores")).toBe(false);
    expect(items.some((item) => item.href === "/agenda")).toBe(true);
  });

  it("solo legal_admin ve Legales", () => {
    expect(canSeeNavItem(["legal_admin"], NAV_ITEMS.find((i) => i.href === "/legales")!)).toBe(true);
    expect(canSeeNavItem(["tutor"], NAV_ITEMS.find((i) => i.href === "/legales")!)).toBe(false);
    expect(canSeeNavItem(["caregiver"], NAV_ITEMS.find((i) => i.href === "/legales")!)).toBe(false);
  });

  it("provider ve marketplace y servicios", () => {
    const items = filterNavItemsByRoles(NAV_ITEMS, ["provider"]);
    expect(items.some((item) => item.href === "/marketplace")).toBe(true);
    expect(items.some((item) => item.href === "/servicios")).toBe(true);
    expect(items.some((item) => item.href === "/cuidadores")).toBe(false);
  });
});
