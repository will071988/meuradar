import { test, expect } from "@playwright/test";

test("exibe as abas Hoje, Amanhã e Em alta @smoke", async ({ page }) => {
  const res = await page.goto("/esportes");
  expect(res?.status()).toBe(200);

  const tablist = page.getByRole("tablist", { name: "Seções de esportes" });
  await expect(tablist.getByRole("tab", { name: "Hoje" })).toBeVisible();
  await expect(tablist.getByRole("tab", { name: "Amanhã" })).toBeVisible();
  await expect(tablist.getByRole("tab", { name: "Em alta" })).toBeVisible();
});

test("trocar de aba altera o conteúdo", async ({ page }) => {
  await page.goto("/esportes");
  const tablist = page.getByRole("tablist", { name: "Seções de esportes" });

  await tablist.getByRole("tab", { name: "Amanhã" }).click();
  await expect(tablist.getByRole("tab", { name: "Amanhã" })).toHaveAttribute(
    "aria-selected",
    "true"
  );

  await tablist.getByRole("tab", { name: "Em alta" }).click();
  await expect(page.getByText("Brasileirão Série A — topo")).toBeVisible();
});

test("nenhum erro de página ao interagir com as abas", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(String(err)));

  await page.goto("/esportes");
  const tablist = page.getByRole("tablist", { name: "Seções de esportes" });
  for (const name of ["Amanhã", "Em alta", "Hoje"]) {
    await tablist.getByRole("tab", { name }).click();
  }
  expect(errors).toEqual([]);
});
