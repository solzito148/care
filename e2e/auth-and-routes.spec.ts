import { expect, test } from "@playwright/test";

test.describe("Autenticación y rutas públicas", () => {
  test("login es accesible y muestra formulario", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Ingresar a CARE" })).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Contrasena/i)).toBeVisible();
  });

  test("dashboard redirige a login sin sesión", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("página 403 es accesible", async ({ page }) => {
    await page.goto("/403");
    await expect(
      page.getByRole("heading", { name: /Acceso denegado \(403\)/i }),
    ).toBeVisible();
  });
});
