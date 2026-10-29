import { test, expect } from "@playwright/test";

const marketFixture = {
  source: "demo" as const,
  updatedAt: "2026-01-01T12:00:00.000Z",
  data: [
    { id: "usd", name: "Dólar", value: "R$ 5,02", variation: "+0,38%", trend: "up" },
    { id: "eur", name: "Euro", value: "R$ 5,45", variation: "+0,21%", trend: "up" },
    { id: "btc", name: "Bitcoin", value: "R$ 312.450", variation: "-1,12%", trend: "down" },
    { id: "ibov", name: "Ibovespa", value: "127.846 pts", variation: "+0,67%", trend: "up" },
  ],
};

test("abre /ferramentas com as três calculadoras @smoke", async ({ page }) => {
  const res = await page.goto("/ferramentas");
  expect(res?.status()).toBe(200);

  await expect(page.getByRole("heading", { name: "Calculadora de IMC" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Conversor de moeda" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Calculadora de desconto" })).toBeVisible();
});

test("calcula IMC 80 kg / 1,80 m ≈ 24,7 @smoke", async ({ page }) => {
  await page.goto("/ferramentas");

  await page.getByLabel("Peso (kg)").fill("80");
  await page.getByLabel("Altura (m)").fill("1,80");

  await expect(page.getByText("24.7")).toBeVisible();
  await expect(page.getByText("Peso normal")).toBeVisible();
});

test("IMC com altura zero não calcula", async ({ page }) => {
  await page.goto("/ferramentas");
  await page.getByLabel("Peso (kg)").fill("80");
  await page.getByLabel("Altura (m)").fill("0");
  await expect(page.getByText("Peso normal")).toHaveCount(0);
});

test("converte USD para BRL com cotação interceptada (sem API externa)", async ({ page }) => {
  // Intercepta a API interna para não depender da cotação real
  await page.route("**/api/mercado*", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(marketFixture) })
  );

  await page.goto("/ferramentas");
  await page.getByLabel("Valor").fill("100");

  await expect(page.getByText("R$ 502,00")).toBeVisible();
});

test("calculadora de desconto devolve valor final e economia", async ({ page }) => {
  await page.goto("/ferramentas");
  await page.getByLabel("Preço original (R$)").fill("2000");
  await page.getByLabel("Desconto (%)").fill("25");

  await expect(page.getByText("R$ 1.500,00")).toBeVisible();
  await expect(page.getByText(/Economia de/)).toBeVisible();
});
