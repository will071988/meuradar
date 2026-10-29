import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PrecosPage from "@/app/precos/page";
import { AuthProvider } from "@/components/auth/AuthProvider";

function renderPage() {
  return render(
    <AuthProvider>
      <PrecosPage />
    </AuthProvider>
  );
}

describe("Página /precos", () => {
  it("mostra resumo e formulário de monitoramento", async () => {
    renderPage();
    expect(screen.getByText("Monitorando")).toBeInTheDocument();
    expect(screen.getByText("No alvo")).toBeInTheDocument();
    expect(screen.getByText("Economia total")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Monitorar novo produto" })).toBeInTheDocument();
    // seed do monitor LG
    await waitFor(() =>
      expect(screen.getAllByText(/Monitor LG UltraGear/).length).toBeGreaterThan(0)
    );
  });

  it("adiciona um produto manualmente e ele aparece na lista", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByLabelText("Produto")).toBeInTheDocument());

    await userEvent.type(screen.getByLabelText("Produto"), "Cadeira Gamer");
    await userEvent.type(screen.getByLabelText("Loja (opcional)"), "Kabum");
    await userEvent.type(screen.getByLabelText("Preço-alvo"), "1000");
    await userEvent.type(screen.getByLabelText("Preço atual"), "1500");
    await userEvent.click(screen.getByRole("button", { name: "Começar a monitorar" }));

    await waitFor(() => expect(screen.getByText("Cadeira Gamer")).toBeInTheDocument());
    expect(screen.getByText("Kabum")).toBeInTheDocument();
    // contador do resumo sobe
    await waitFor(() => expect(screen.getByText("2")).toBeInTheDocument());
  });

  it("valida campos obrigatórios sem adicionar produto", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Começar a monitorar" })).toBeInTheDocument()
    );

    await userEvent.click(screen.getByRole("button", { name: "Começar a monitorar" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/Informe o produto/);
    expect(screen.queryByText("Cadeira Gamer")).not.toBeInTheDocument();
  });

  it("valida preço inválido", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByLabelText("Produto")).toBeInTheDocument());

    await userEvent.type(screen.getByLabelText("Produto"), "Notebook");
    await userEvent.type(screen.getByLabelText("Preço-alvo"), "abc");
    await userEvent.type(screen.getByLabelText("Preço atual"), "abc");
    await userEvent.click(screen.getByRole("button", { name: "Começar a monitorar" }));

    expect(screen.getByRole("alert")).toHaveTextContent(/Preços inválidos/);
  });

  it("mostra aviso para sincronizar quando não há usuário logado", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("Entre para sincronizar na nuvem")).toBeInTheDocument()
    );
  });

  it("sem Supabase configurado não exibe badge 'Nuvem ativa'", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText("Monitorar novo produto")).toBeInTheDocument());
    expect(screen.queryByText("Nuvem ativa")).not.toBeInTheDocument();
  });
});
