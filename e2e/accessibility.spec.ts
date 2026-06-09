import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Accesibilidad E2E (WCAG AA)", () => {
  test("login cumple axe sin violaciones críticas", async ({ page }) => {
    await page.goto("/login");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("403 cumple axe sin violaciones críticas", async ({ page }) => {
    await page.goto("/403");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
