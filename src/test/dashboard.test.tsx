import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import HomePage from "@/app/page";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { apiResponse } from "@/test/setup";
import { marketMock, newsMock, weatherMock } from "@/data/mock";

beforeAll(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      let data: unknown = [];
      if (url.includes("/api/mercado")) data = marketMock;
      else if (url.includes("/api/noticias")) data = newsMock;
      else if (url.includes("/api/vagas")) data = [];
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
  it("renderiza 'Seu Radar de Hoje' com 5 cartões", () => {
    renderDashboard();
    expect(screen.getByRole("heading", { name: "Seu Radar de Hoje" })).toBeInTheDocument();
    expect(screen.getByText("Chuva forte prevista para sua região")).toBeInTheDocument();
    expect(screen.getByText("Sua encomenda está em trânsito")).toBeInTheDocument();
    expect(screen.getByText("Novo concurso disponível")).toBeInTheDocument();
    expect(screen.getByText("Seu time joga hoje")).toBeInTheDocument();
    expect(screen.getByText("Produto monitorado caiu 15%")).toBeInTheDocument();
  });

  it("exibe clima com temperatura e cidade", () => {
    renderDashboard();
    expect(screen.getByText(`${weatherMock.temperature}°C`)).toBeInTheDocument();
    expect(screen.getByText(weatherMock.city)).toBeInTheDocument();
    expect(screen.getByText("Ver detalhes")).toBeInTheDocument();
  });

  it("exibe seção Mercado com os ativos principais", () => {
    renderDashboard();
    expect(screen.getByRole("heading", { name: "Mercado" })).toBeInTheDocument();
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

  it("exibe calendário com data 21 MAI", () => {
    renderDashboard();
    expect(screen.getByRole("heading", { name: "Seu Calendário" })).toBeInTheDocument();
    expect(screen.getByText("21")).toBeInTheDocument();
    expect(screen.getByText("MAI")).toBeInTheDocument();
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
