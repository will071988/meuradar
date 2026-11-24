import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/vagas*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        source: "live",
        updatedAt: new Date().toISOString(),
        data: [{
          id: "j1", title: "Desenvolvedor(a) Front-end", company: "Empresa", location: "Remoto",
          remote: true, url: "https://exemplo.com/vaga", postedAt: "hoje",
        }],
      }),
    })
  );
  await page.route("**/api/concursos", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        source: "live",
        updatedAt: new Date().toISOString(),
        data: [{
          id: "c1", title: "Prefeitura abre concurso com 93 vagas",
          description: "Salário de até R$ 15 mil.", time: "Há 2 horas", category: "Concurso",
        }],
      }),
    })
  );
});

test("exibe concursos reais na página de vagas @smoke", async ({ page }) => {
  const res = await page.goto("/vagas");
  expect(res?.status()).toBe(200);

  await expect(page.getByText("Concursos em destaque")).toBeVisible();
  await expect(page.getByText("Prefeitura abre concurso com 93 vagas")).toBeVisible();
  await expect(page.getByText("Salário de até R$ 15 mil.")).toBeVisible();
});
