import { test, expect } from "@playwright/test";

test("abre /precos com resumo e formulário @smoke", async ({ page }) => {
  const res = await page.goto("/precos");
  expect(res?.status()).toBe(200);

  await expect(page.getByText("Monitorando")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Monitorar novo produto" })).toBeVisible();
  await expect(page.getByLabel("Produto")).toBeVisible();
  await expect(page.getByRole("button", { name: "Começar a monitorar" })).toBeVisible();
});

test("produto de exemplo aparece na lista", async ({ page }) => {
  await page.goto("/precos");
  await expect(page.getByText(/Monitor LG UltraGear/).first()).toBeVisible();
});

test("adiciona um produto manualmente e ele aparece @smoke", async ({ page }) => {
  await page.goto("/precos");

  await page.getByLabel("Produto").fill("Cadeira Gamer Pro");
  await page.getByLabel("Loja (opcional)").fill("Kabum");
  await page.getByLabel("Preço-alvo").fill("900");
  await page.getByLabel("Preço atual").fill("1200");
  await page.getByRole("button", { name: "Começar a monitorar" }).click();

  await expect(page.getByRole("heading", { name: "Cadeira Gamer Pro" })).toBeVisible();
  await expect(page.getByText("Kabum", { exact: true })).toBeVisible();
});

test("validação bloqueia envio vazio", async ({ page }) => {
  await page.goto("/precos");
  await page.getByRole("button", { name: "Começar a monitorar" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: /Informe o produto/ })
  ).toBeVisible();
});
