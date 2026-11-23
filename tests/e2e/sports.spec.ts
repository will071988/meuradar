import { test, expect } from "@playwright/test";

const overview = {
  live: [{
    id: "m1", competition: "Brasileirão Série A", leagueId: "bra.1",
    home: "Flamengo", away: "Vasco", time: "70'", status: "live",
    homeScore: 1, awayScore: 0, live: true,
  }],
  upcoming: [{
    id: "m2", competition: "Libertadores", leagueId: "conmebol.libertadores",
    home: "Palmeiras", away: "Bolívar", time: "16:00", status: "pre",
    startsAt: "2026-11-29T19:00:00Z", startTime: "16:00",
  }],
  finished: [{
    id: "m3", competition: "Copa do Brasil", leagueId: "bra.copa_do_brazil",
    home: "Cruzeiro", away: "Grêmio", time: "Encerrado", status: "post",
    homeScore: 2, awayScore: 1,
  }],
  standings: [{
    leagueId: "bra.1", name: "Brasileirão Série A",
    groups: [{ name: "Única", entries: [{ pos: 1, team: "Flamengo", pts: 33, games: 15 }] }],
  }],
};

const tracker = {
  eventId: "m1", status: "in", clock: "70'",
  home: {
    id: "1", name: "Flamengo", abbreviation: "FLA", color: "#0B2D5B", score: 1,
    players: [{ id: "p1", teamId: "1", homeAway: "home", jersey: "9", name: "Atacante", position: "F", formationPlace: 9 }],
  },
  away: {
    id: "2", name: "Vasco", abbreviation: "VAS", color: "#FF8A3D", score: 0,
    players: [{ id: "p2", teamId: "2", homeAway: "away", jersey: "1", name: "Goleiro", position: "G", formationPlace: 1 }],
  },
  events: [{ id: "ev1", type: "Goal", text: "Gol do Flamengo", minute: 66, period: 2, teamId: "1", x: 96, y: 50 }],
};

test.beforeEach(async ({ page }) => {
  await page.route("**/api/esportes/tracker?event=*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ source: "live", updatedAt: new Date().toISOString(), data: tracker }),
    })
  );
  await page.route("**/api/esportes", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ source: "live", updatedAt: new Date().toISOString(), data: overview }),
    })
  );
});

test("exibe as quatro seções e o resultado final @smoke", async ({ page }) => {
  const res = await page.goto("/esportes");
  expect(res?.status()).toBe(200);

  await expect(page.getByRole("heading", { name: /Ao vivo/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Próximos jogos/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Resultados/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Classificações/i })).toBeVisible();
  await expect(page.getByText("Encerrado").first()).toBeVisible();
  await expect(page.getByText("2 x 1")).toBeVisible();
});

test("mostra o horário de início e a classificação", async ({ page }) => {
  await page.goto("/esportes");
  await expect(page.getByText("16:00")).toBeVisible();

  const table = page.getByRole("table");
  await expect(table.getByText("Flamengo")).toBeVisible();
  await expect(table.getByText("33")).toBeVisible();
});

test("abre o rastreador tático com campo e formação", async ({ page }) => {
  await page.goto("/esportes");
  await page.getByRole("button", { name: /Abrir rastreador tático/ }).first().click();

  await expect(page.getByText("Rastreador tático")).toBeVisible();
  await expect(page.getByRole("img", { name: /Campo tático/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Reiniciar" })).toBeVisible();
});

test("nenhum erro de página ao usar o filtro de campeonato", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(String(err)));

  await page.goto("/esportes");
  await page.getByRole("combobox", { name: /Filtrar campeonato/i }).selectOption("bra.1");
  expect(errors).toEqual([]);
});
