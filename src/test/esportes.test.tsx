import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EsportesPage from "@/app/esportes/page";
import { apiResponse, stubFetch } from "@/test/setup";
import type { EsportsOverview } from "@/types";

const overview: EsportsOverview = {
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

beforeEach(() => {
  stubFetch((url) => {
    if (url.includes("/api/esportes/tracker")) return apiResponse(tracker);
    if (url.includes("/api/esportes")) return apiResponse(overview);
    return apiResponse([]);
  });
});

describe("Página /esportes", () => {
  it("exibe as quatro seções", async () => {
    render(<EsportesPage />);
    expect(await screen.findByRole("heading", { name: /Ao vivo/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Próximos jogos/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Resultados/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Classificações/i })).toBeInTheDocument();
  });

  it("mostra status AO VIVO com placar parcial", async () => {
    render(<EsportesPage />);
    expect((await screen.findAllByText("AO VIVO")).length).toBeGreaterThan(0);
    expect(await screen.findByText("1 x 0")).toBeInTheDocument();
  });

  it("mostra o horário de início dos jogos a iniciar", async () => {
    render(<EsportesPage />);
    expect(await screen.findByText("16:00")).toBeInTheDocument();
  });

  it("mostra Encerrado e o placar final", async () => {
    render(<EsportesPage />);
    expect((await screen.findAllByText("Encerrado")).length).toBeGreaterThan(0);
    expect(await screen.findByText("2 x 1")).toBeInTheDocument();
  });

  it("exibe a classificação com posição, pontos e jogos", async () => {
    render(<EsportesPage />);
    const table = await screen.findByRole("table");
    expect(within(table).getByText("Flamengo")).toBeInTheDocument();
    expect(within(table).getByText("33")).toBeInTheDocument();
    expect(within(table).getByText("15")).toBeInTheDocument();
  });

  it("filtra por campeonato", async () => {
    render(<EsportesPage />);
    const select = screen.getByRole("combobox", { name: /Filtrar campeonato/i });
    await waitFor(() => expect(select.querySelector('option[value="bra.1"]')).not.toBeNull());
    await userEvent.selectOptions(select, "bra.1");
    expect(screen.getAllByText("Flamengo").length).toBeGreaterThan(0);
    expect(screen.queryByText("Bolívar")).not.toBeInTheDocument();
  });

  it("abre o rastreador tático ao clicar em Campo", async () => {
    render(<EsportesPage />);
    const buttons = await screen.findAllByRole("button", { name: /Abrir rastreador tático/ });
    await userEvent.click(buttons[0]!);
    expect(await screen.findByText("Rastreador tático")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Campo tático/ })).toBeInTheDocument();
  });
});
