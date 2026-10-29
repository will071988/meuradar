import { test, expect } from "@playwright/test";

/** Coleta erros graves de página para todos os testes do arquivo. */
function trackErrors(page: import("@playwright/test").Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  return errors;
}

test("home renderiza o dashboard @smoke", async ({ page }) => {
  const errors = trackErrors(page);

  const res = await page.goto("/");
  expect(res?.status()).toBe(200);

  await expect(page).toHaveTitle(/MeuRadar/);
  await expect(page.getByRole("heading", { name: "Seu Radar de Hoje" })).toBeVisible();
  await expect(page.getByText("MeuRadar").first()).toBeVisible();

  expect(errors).toEqual([]);
});

test("dashboard exibe os módulos essenciais", async ({ page }) => {
  await page.goto("/");
  // headings reais do painel (WeatherCard não tem heading próprio)
  for (const heading of ["Mercado", "Notícias para você", "Vagas e Concursos", "Esportes"]) {
    await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible();
  }
});

test("nenhum erro de console grave na home @smoke", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});
