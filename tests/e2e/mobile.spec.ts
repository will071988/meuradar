import { test, expect } from "@playwright/test";

/** Falha se a página tem overflow horizontal crítico no viewport mobile. */
async function expectNoHorizontalOverflow(page: import("@playwright/test").Page, label: string) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  // 8px de folga para scrollbar/rounding
  expect(overflow.scrollWidth, `overflow horizontal em ${label}`).toBeLessThanOrEqual(
    overflow.innerWidth + 8
  );
}

test("menu mobile abre e navega @smoke", async ({ page }) => {
  await page.goto("/");
  const menuButton = page.getByRole("button", { name: "Abrir menu" });
  await expect(menuButton).toBeVisible();
  await menuButton.click();

  const drawer = page.getByRole("navigation", { name: "Menu móvel" });
  await expect(drawer).toBeVisible();
  await drawer.getByRole("link", { name: "Clima" }).click();
  await expect(page).toHaveURL(/\/clima$/);
});

for (const route of ["/", "/precos", "/esportes", "/ferramentas"]) {
  test(`${route} sem overflow horizontal @smoke`, async ({ page }) => {
    await page.goto(route);
    await expect(page.getByRole("heading").first()).toBeVisible();
    await expectNoHorizontalOverflow(page, route);
  });
}
