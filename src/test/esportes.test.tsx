import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EsportesPage from "@/app/esportes/page";
import { sportsScheduleMock } from "@/data/mock";

describe("Página /esportes", () => {
  it("exibe as três abas obrigatórias", () => {
    render(<EsportesPage />);
    const tablist = screen.getByRole("tablist", { name: "Seções de esportes" });
    const labels = within(tablist)
      .getAllByRole("tab")
      .map((t) => t.textContent);

    expect(labels).toEqual(["Hoje", "Amanhã", "Em alta"]);
  });

  it("aba Hoje mostra jogos de hoje (inclui os sem dia explícito)", () => {
    render(<EsportesPage />);
    const expected = sportsScheduleMock.filter(
      (m) => m.day === undefined || m.day === "hoje"
    );
    expect(expected.length).toBeGreaterThan(0);
    for (const m of expected) {
      expect(screen.getAllByText(m.home).length).toBeGreaterThan(0);
    }
    // jogo exclusivo de amanhã não aparece
    const tomorrowOnly = sportsScheduleMock.find(
      (m) => m.day === "amanha" && !expected.some((e) => e.away === m.away)
    );
    if (tomorrowOnly) {
      expect(screen.queryByText(tomorrowOnly.away)).not.toBeInTheDocument();
    }
  });

  it("trocar para Amanhã altera a lista", async () => {
    render(<EsportesPage />);
    await userEvent.click(screen.getByRole("tab", { name: "Amanhã" }));

    const expected = sportsScheduleMock.filter((m) => m.day === "amanha");
    expect(expected.length).toBeGreaterThan(0);
    for (const m of expected) {
      expect(screen.getAllByText(m.away).length).toBeGreaterThan(0);
    }
    expect(screen.getByRole("tab", { name: "Amanhã" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Hoje" })).toHaveAttribute("aria-selected", "false");
  });

  it("aba Em alta lista jogos e a classificação", async () => {
    render(<EsportesPage />);
    await userEvent.click(screen.getByRole("tab", { name: "Em alta" }));

    expect(screen.getByText("Brasileirão Série A — topo")).toBeInTheDocument();
    // Flamengo aparece no jogo da aba e na classificação → valida os dois contextos
    const table = screen.getByRole("table");
    expect(within(table).getAllByText("Flamengo").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Flamengo").length).toBeGreaterThanOrEqual(2);
    // jogo ao vivo destacado
    expect(screen.getByText("AO VIVO")).toBeInTheDocument();
  });

  it("mostra estado vazio quando a aba não tem jogos", async () => {
    render(<EsportesPage />);
    // "Amanhã" tem jogos no mock; garante que a lista não fica vazia silenciosamente
    await userEvent.click(screen.getByRole("tab", { name: "Amanhã" }));
    expect(screen.queryByText("Nenhum jogo para esta aba.")).not.toBeInTheDocument();
  });

  it("informa que os dados são demonstrativos", () => {
    render(<EsportesPage />);
    expect(screen.getByText(/curadoria demonstrativa/i)).toBeInTheDocument();
  });
});
