import { describe, expect, it } from "vitest";

import {
  appNavItems,
  canSeeNavItem,
  filterNavItemsByRoles,
} from "@/lib/navigation";

describe("navigation", () => {
  it("oculta Cuidadores para caregiver", () => {
    const items = filterNavItemsByRoles(appNavItems, ["caregiver"]);
    expect(items.some((item) => item.href === "/cuidadores")).toBe(false);
    expect(items.some((item) => item.href === "/agenda")).toBe(true);
  });

  it("solo legal_admin ve Legales", () => {
    const legales = appNavItems.find((i) => i.href === "/legales")!;
    expect(canSeeNavItem(["legal_admin"], legales)).toBe(true);
    expect(canSeeNavItem(["tutor"], legales)).toBe(false);
    expect(canSeeNavItem(["caregiver"], legales)).toBe(false);
  });

  it("provider ve servicios y no marketplace", () => {
    const items = filterNavItemsByRoles(appNavItems, ["provider"]);
    expect(items.some((item) => item.href === "/servicios")).toBe(true);
    expect(items.some((item) => item.href === "/marketplace")).toBe(false);
    expect(items.some((item) => item.href === "/cuidadores")).toBe(false);
  });

  it("admin ve todos los items", () => {
    const items = filterNavItemsByRoles(appNavItems, ["admin"]);
    expect(items).toHaveLength(appNavItems.length);
  });
});
