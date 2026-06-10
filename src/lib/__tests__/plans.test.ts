import { describe, expect, it } from "vitest";

import { PLAN_CATALOG, findPlan, isFreePlan, planPriceToNumber } from "@/lib/plans";

describe("plans", () => {
  it("parsea precios con separador de miles", () => {
    expect(planPriceToNumber("$19.900")).toBe(19900);
    expect(planPriceToNumber("$0")).toBe(0);
    expect(planPriceToNumber("")).toBe(0);
  });

  it("detecta planes gratuitos", () => {
    const free = PLAN_CATALOG.find((p) => p.precioMensual === "$0")!;
    const paid = PLAN_CATALOG.find((p) => p.precioMensual !== "$0")!;
    expect(isFreePlan(free)).toBe(true);
    expect(isFreePlan(paid)).toBe(false);
  });

  it("encuentra un plan por id y devuelve undefined si no existe", () => {
    expect(findPlan("pf-1")?.nombre).toBe("Gratis");
    expect(findPlan("inexistente")).toBeUndefined();
  });

  it("todos los ids del catalogo son unicos", () => {
    const ids = PLAN_CATALOG.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
