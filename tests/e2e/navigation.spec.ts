import { test, expect } from "@playwright/test";

const ROUTES = [
  "/clima",
  "/noticias",
  "/mercado",
  "/precos",
  "/vagas",
  "/esportes",
  "/ferramentas",
  "/meu-radar",
  "/configuracoes",
];

test.describe("navegação entre módulos", () => {
  for (const route of ROUTES) {
    test(`${route} responde 200 sem erro fatal @smoke`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(String(err)));

      const res = await page.goto(route);
      expect(res?.status()).toBe(200);
      await expect(page.getByRole("heading").first()).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test("sidebar leva ao módulo de Clima", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Navegação principal" })
      .getByRole("link", { name: "Clima" })
      .click();
    await expect(page).toHaveURL(/\/clima$/);
    await expect(page.getByRole("heading", { name: "Clima" }).first()).toBeVisible();
  });

  test("nenhuma rota principal devolve 404", async ({ page }) => {
    for (const route of ROUTES) {
      const res = await page.goto(route);
      expect(res?.status(), `status de ${route}`).toBe(200);
    }
  });
});
