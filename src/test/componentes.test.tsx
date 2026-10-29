import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RadarForm } from "@/components/radars/RadarForm";
import { RadarCard } from "@/components/radars/RadarCard";
import { ModulePage } from "@/components/layout/ModulePage";
import { AppShell } from "@/components/layout/AppShell";
import { NotificationsBell } from "@/components/notifications/NotificationsBell";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { apiResponse } from "@/test/setup";
import { marketMock, weatherMock } from "@/data/mock";
import type { Radar } from "@/types";

const baseRadar: Radar = {
  id: "r-1",
  title: "Notebook barato",
  type: "preco",
  target: "4000",
  city: "",
  active: true,
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("RadarForm", () => {
  it("cria um radar com os dados preenchidos", async () => {
    const onCreate = vi.fn();
    render(<RadarForm onCreate={onCreate} />);

    await userEvent.type(screen.getByLabelText("O que monitorar?"), "Passagem para Lisboa");
    await userEvent.click(screen.getByRole("button", { name: "Ativar radar" }));

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Passagem para Lisboa", type: "preco" })
    );
    // formulário limpo após criar
    expect(screen.getByLabelText("O que monitorar?")).toHaveValue("");
  });

  it("exige nome e mostra alerta acessível", async () => {
    const onCreate = vi.fn();
    render(<RadarForm onCreate={onCreate} />);

    await userEvent.click(screen.getByRole("button", { name: "Ativar radar" }));

    expect(screen.getByRole("alert")).toHaveTextContent(/Dê um nome ao radar/);
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("trocar o tipo para Clima ajusta rótulo e expõe campo de cidade", async () => {
    render(<RadarForm onCreate={vi.fn()} />);

    await userEvent.selectOptions(screen.getByLabelText("Tipo"), "clima");
    expect(screen.getByLabelText("Temperatura de alerta (°C)")).toBeInTheDocument();
    expect(screen.getByLabelText("Cidade (clima)")).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText("Tipo"), "preco");
    expect(screen.queryByLabelText("Cidade (clima)")).not.toBeInTheDocument();
  });

  it("semeia a cidade salva nas preferências", async () => {
    window.localStorage.setItem(
      "meuradar-preferences-v1",
      JSON.stringify({ city: "Niterói, RJ" })
    );
    render(<RadarForm onCreate={vi.fn()} />);
    await userEvent.selectOptions(screen.getByLabelText("Tipo"), "clima");
    await waitFor(() => expect(screen.getByLabelText("Cidade (clima)")).toHaveValue("Niterói, RJ"));
  });
});

describe("RadarCard", () => {
  it("aciona pausar e excluir com os rótulos corretos", async () => {
    const onToggle = vi.fn();
    const onDelete = vi.fn();
    render(<RadarCard radar={baseRadar} onToggle={onToggle} onDelete={onDelete} />);

    await userEvent.click(screen.getByRole("button", { name: "Pausar Notebook barato" }));
    expect(onToggle).toHaveBeenCalledWith("r-1");

    await userEvent.click(screen.getByRole("button", { name: "Excluir Notebook barato" }));
    expect(onDelete).toHaveBeenCalledWith("r-1");
  });

  it("mostra o alerta quando ativo", () => {
    render(
      <RadarCard
        radar={baseRadar}
        alert={{ radarId: "r-1", title: "Preço", message: "Atingiu o alvo" }}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText("Atingiu o alvo")).toBeInTheDocument();
  });

  it("sem alerta mostra mensagem de monitoramento", () => {
    render(<RadarCard radar={baseRadar} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/Monitorando/)).toBeInTheDocument();
    expect(screen.getByText("Alvo: 4000")).toBeInTheDocument();
  });

  it("radar pausado não mostra monitoramento e permite reativar", () => {
    render(
      <RadarCard radar={{ ...baseRadar, active: false }} onToggle={vi.fn()} onDelete={vi.fn()} />
    );
    expect(screen.queryByText(/Monitorando/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ativar Notebook barato" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ativar Notebook barato" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("radar de clima exibe a cidade", () => {
    render(
      <RadarCard
        radar={{ ...baseRadar, type: "clima", city: "Recife, PE" }}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText(/Recife, PE/)).toBeInTheDocument();
  });
});

describe("ModulePage", () => {
  it("renderiza título, descrição e placeholder do módulo", () => {
    render(<ModulePage title="Encomendas" description="Rastreio de encomendas" />);
    expect(screen.getByRole("heading", { name: "Encomendas" })).toBeInTheDocument();
    expect(screen.getByText("Rastreio de encomendas")).toBeInTheDocument();
    expect(screen.getByText("Módulo em preparação")).toBeInTheDocument();
    expect(screen.getByText(/módulo de encomendas/)).toBeInTheDocument();
  });
});

describe("ServiceWorkerRegister", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    Reflect.deleteProperty(navigator, "serviceWorker");
  });

  it("não registra em ambiente de desenvolvimento", () => {
    const register = vi.fn().mockResolvedValue({});
    Object.defineProperty(navigator, "serviceWorker", {
      value: { register },
      configurable: true,
    });
    render(<ServiceWorkerRegister />);
    expect(register).not.toHaveBeenCalled();
  });

  it("registra /sw.js em produção quando suportado", () => {
    vi.stubEnv("NODE_ENV", "production");
    const register = vi.fn().mockResolvedValue({});
    Object.defineProperty(navigator, "serviceWorker", {
      value: { register },
      configurable: true,
    });
    render(<ServiceWorkerRegister />);
    expect(register).toHaveBeenCalledWith("/sw.js");
  });

  it("ignora navegador sem suporte a service worker", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(() => render(<ServiceWorkerRegister />)).not.toThrow();
  });
});

describe("AppShell (Header + navegação)", () => {
  function renderShell() {
    return render(
      <AuthProvider>
        <AppShell>
          <p>Conteúdo da página</p>
        </AppShell>
      </AuthProvider>
    );
  }

  it("renderiza header, sidebar e o conteúdo dos filhos", () => {
    renderShell();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Navegação principal" })).toBeInTheDocument();
    expect(screen.getByText("Conteúdo da página")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Busca").length).toBeGreaterThanOrEqual(1);
  });

  it("mostra a saudação padrão no avatar do header", async () => {
    renderShell();
    await waitFor(() => expect(screen.getByText("Olá, William")).toBeInTheDocument());
  });

  it("botão do menu abre o drawer móvel", async () => {
    renderShell();
    expect(screen.queryByRole("navigation", { name: "Menu móvel" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
    expect(screen.getByRole("navigation", { name: "Menu móvel" })).toBeInTheDocument();
  });
});

describe("NotificationsBell", () => {
  beforeEach(() => {
    window.localStorage.clear();
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      const data = url.includes("clima") ? weatherMock : marketMock;
      return new Response(JSON.stringify(apiResponse(data)), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;
  });

  it("sem radares ativos mostra estado vazio", async () => {
    // lista explícita vazia → sem seed de exemplo
    window.localStorage.setItem("meuradar-radars-v1", "[]");
    render(<NotificationsBell />);
    await userEvent.click(screen.getByRole("button", { name: /Notificações/ }));
    expect(screen.getByText(/Nenhum alerta agora/)).toBeInTheDocument();
  });

  it("com radares ativos exibe alertas e permite marcar como lidas", async () => {
    window.localStorage.setItem(
      "meuradar-radars-v1",
      JSON.stringify([
        {
          id: "r-1",
          title: "Notebook barato",
          type: "preco",
          target: "4000",
          city: "",
          active: true,
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ])
    );

    render(<NotificationsBell />);

    const bell = await screen.findByRole("button", { name: /não lidas/ });
    expect(bell).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(bell);
    expect(screen.getByText("Alertas dos seus radares")).toBeInTheDocument();
    // alerta de preço do radar (mensagem com o preço atual do mock)
    expect(await screen.findByText(/1\.899/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Marcar lidas" }));
    await waitFor(() => {
      expect(screen.queryByText(/1\.899/)).not.toBeInTheDocument();
    });
    // persistido: reload não repete o alerta
    expect(window.localStorage.getItem("meuradar-read-v1")).toContain("r-1");
  });
});
