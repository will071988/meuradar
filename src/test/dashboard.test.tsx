import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import HomePage from "@/app/page";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { apiResponse } from "@/test/setup";
import { marketMock, newsMock, weatherMock } from "@/data/mock";
import type { EsportsOverview, RemoteJob } from "@/types";

const sports: EsportsOverview = {
  live: [{
    id: "m1",
    competition: "Brasileirão Série A",
    home: "Flamengo",
    away: "Vasco",
    time: "70'",
    live: true,
    status: "live",
  }],
  upcoming: [],
  finished: [],
  standings: [],
};

const jobs: RemoteJob[] = [{
  id: "j1",
  title: "Desenvolvedor(a) Front-end",
  company: "Empresa",
  location: "Remoto",
  remote: true,
  url: "https://exemplo.com/vaga",
  postedAt: "hoje",
}];

beforeAll(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      let data: unknown = [];
      if (url.includes("/api/clima")) data = weatherMock;
      else if (url.includes("/api/mercado")) data = marketMock;
      else if (url.includes("/api/noticias")) data = newsMock;
      else if (url.includes("/api/esportes")) data = sports;
      else if (url.includes("/api/vagas")) data = jobs;
      return new Response(JSON.stringify(apiResponse(data)), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    })
  );
});

function renderDashboard() {
  return render(
    <AuthProvider>
      <HomePage />
    </AuthProvider>
  );
}

describe("Dashboard (painel Hoje)", () => {
  it("monta 'Seu Radar de Hoje' com dados vindos das APIs", async () => {
    renderDashboard();
    expect(screen.getByRole("heading", { name: "Seu Radar de Hoje" })).toBeInTheDocument();
    expect(await screen.findByText(weatherMock.alertTitle)).toBeInTheDocument();
    expect(screen.getByText(/Dólar:/)).toBeInTheDocument();
    expect(screen.getByText(/Flamengo x Vasco/)).toBeInTheDocument();
    expect(screen.getAllByText(newsMock[0]?.title ?? "").length).toBeGreaterThan(0);
    expect(screen.getByText(/Vaga:/)).toBeInTheDocument();
  });

  it("exibe clima com temperatura e cidade", async () => {
    renderDashboard();
    expect(await screen.findByText(`${weatherMock.temperature}°C`)).toBeInTheDocument();
    expect(screen.getByText(weatherMock.city)).toBeInTheDocument();
    expect(screen.getByText("Ver detalhes")).toBeInTheDocument();
  });

  it("exibe seção Mercado com os ativos principais", async () => {
    renderDashboard();
    expect(await screen.findByRole("heading", { name: "Mercado" })).toBeInTheDocument();
    expect(screen.getByText("Dólar")).toBeInTheDocument();
    expect(screen.getByText("Bitcoin")).toBeInTheDocument();
    expect(screen.getByText("Ibovespa")).toBeInTheDocument();
  });

  it("exibe seções de Notícias, Vagas, Esportes, Preços e Encomendas", () => {
    renderDashboard();
    expect(screen.getByRole("heading", { name: "Notícias para você" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Vagas e Concursos" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Esportes" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Alerta de Preços" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Rastreio de Encomendas" })).toBeInTheDocument();
  });

  it("exibe abas de esportes Hoje / Amanhã / Em alta", () => {
    renderDashboard();
    expect(screen.getByRole("tablist", { name: "Filtro de jogos" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Hoje" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Amanhã" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Em alta" })).toBeInTheDocument();
  });

  it("exibe o calendário com a data de hoje e sem lembrete salvo", () => {
    renderDashboard();
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = today.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase();
    expect(screen.getByRole("heading", { name: "Seu Calendário" })).toBeInTheDocument();
    expect(screen.getByText(day)).toBeInTheDocument();
    expect(screen.getByText(month)).toBeInTheDocument();
    expect(screen.getByText(/Nenhum lembrete salvo/)).toBeInTheDocument();
  });

  it("não exibe dados de encomenda quando não há rastreio salvo", () => {
    renderDashboard();
    expect(screen.getByText(/Nenhum rastreio salvo/)).toBeInTheDocument();
  });

  it("sauda o usuário sem lançar erro de contexto", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/William/)).toBeInTheDocument();
    });
  });

  it("não lança erros de console graves durante a renderização", async () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => undefined);
    renderDashboard();
    await waitFor(() => expect(screen.getByRole("heading", { name: "Mercado" })).toBeInTheDocument());
    const severe = errors.mock.calls.filter(
      (c) => typeof c[0] === "string" && /Each child|unique .key|unmounted|act\(/.test(c[0])
    );
    expect(severe).toEqual([]);
    errors.mockRestore();
  });
});
