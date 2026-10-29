import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FerramentasPage from "@/app/ferramentas/page";
import { apiResponse } from "@/test/setup";
import { marketMock } from "@/data/mock";

function renderPage() {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify(apiResponse(marketMock)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })) as typeof fetch;
  return render(<FerramentasPage />);
}

/** Cartão (section com rounded-2xl) que contém o heading informado. */
function cardOf(heading: string): HTMLElement {
  const h = screen.getByRole("heading", { name: heading });
  let node: HTMLElement | null = h.parentElement;
  while (node && !node.classList.contains("rounded-2xl")) node = node.parentElement;
  if (!node) throw new Error(`cartão "${heading}" não encontrado`);
  return node;
}

async function calcularIMC(peso: string, altura: string) {
  renderPage();
  await userEvent.type(screen.getByLabelText("Peso (kg)"), peso);
  await userEvent.type(screen.getByLabelText("Altura (m)"), altura);
}

describe("Ferramentas — Calculadora de IMC", () => {
  it("calcula IMC válido: 80 kg / 1,80 m ≈ 24,7", async () => {
    await calcularIMC("80", "1,80");
    expect(screen.getByText("24.7")).toBeInTheDocument();
    expect(screen.getByText("Peso normal")).toBeInTheDocument();
  });

  it("classifica obesidade", async () => {
    await calcularIMC("95", "1,70");
    // 95 / 1.7² = 32,87 → exibido com 1 casa: 32.9
    expect(screen.getByText("32.9")).toBeInTheDocument();
    expect(screen.getByText("Obesidade")).toBeInTheDocument();
  });

  it("classifica abaixo do peso", async () => {
    await calcularIMC("50", "1,80");
    // 50 / 3,24 = 15,4
    expect(screen.getByText("15.4")).toBeInTheDocument();
    expect(screen.getByText("Abaixo do peso")).toBeInTheDocument();
  });

  it("altura zero não calcula", async () => {
    await calcularIMC("80", "0");
    const card = cardOf("Calculadora de IMC");
    expect(within(card).getByText("—")).toBeInTheDocument();
    expect(within(card).queryByText(/Peso normal|Obesidade|Abaixo do peso/)).not.toBeInTheDocument();
  });

  it("peso inválido não calcula", async () => {
    await calcularIMC("abc", "1,80");
    expect(within(cardOf("Calculadora de IMC")).getByText("—")).toBeInTheDocument();
  });

  it("campos vazios mostram traço", () => {
    renderPage();
    expect(within(cardOf("Calculadora de IMC")).getByText("—")).toBeInTheDocument();
  });

  it("é acessível: campos com label associado", () => {
    renderPage();
    expect(screen.getByLabelText("Peso (kg)")).toBeInTheDocument();
    expect(screen.getByLabelText("Altura (m)")).toBeInTheDocument();
    expect(screen.getByLabelText("Valor")).toBeInTheDocument();
  });
});

describe("Ferramentas — Conversor de moeda", () => {
  it("converte USD para BRL com a cotação do mercado", async () => {
    renderPage();
    await userEvent.type(screen.getByLabelText("Valor"), "100");
    // 100 × 5,02 = R$ 502,00
    expect(screen.getByText("R$ 502,00")).toBeInTheDocument();
  });

  it("mostra resultado vazio sem valor", () => {
    renderPage();
    expect(within(cardOf("Conversor de moeda")).getByText("—")).toBeInTheDocument();
  });
});

describe("Ferramentas — Calculadora de desconto", () => {
  it("calcula valor final e economia", async () => {
    renderPage();
    await userEvent.type(screen.getByLabelText("Preço original (R$)"), "2000");
    await userEvent.type(screen.getByLabelText("Desconto (%)"), "25");
    expect(screen.getByText("R$ 1.500,00")).toBeInTheDocument();
    expect(screen.getByText(/Economia de/)).toBeInTheDocument();
  });

  it("desconto acima de 100% é ignorado", async () => {
    renderPage();
    await userEvent.type(screen.getByLabelText("Preço original (R$)"), "1000");
    await userEvent.type(screen.getByLabelText("Desconto (%)"), "150");
    expect(within(cardOf("Calculadora de desconto")).getByText("—")).toBeInTheDocument();
  });
});
