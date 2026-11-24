import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";

function renderWithAuth(node: React.ReactNode) {
  return render(<AuthProvider>{node}</AuthProvider>);
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("AppShell e Header", () => {
  it("abre e fecha o menu móvel", async () => {
    renderWithAuth(<AppShell><p>Conteúdo</p></AppShell>);
    await waitFor(() => expect(screen.getByText("Conteúdo")).toBeInTheDocument());

    await userEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
    expect(screen.getAllByRole("button", { name: "Fechar menu" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("navigation", { name: "Menu móvel" })).toBeInTheDocument();

    await userEvent.click(screen.getAllByRole("button", { name: "Fechar menu" })[0]!);
    expect(screen.queryByRole("navigation", { name: "Menu móvel" })).not.toBeInTheDocument();
  });

  it("mostra o nome do usuário autenticado no header", async () => {
    window.localStorage.setItem(
      "meuradar-user-v1",
      JSON.stringify({ id: "u1", email: "maria@exemplo.com", name: "Maria" })
    );
    renderWithAuth(<Header onMenuClick={() => undefined} />);
    expect(await screen.findByText("Olá, Maria")).toBeInTheDocument();
    expect(screen.getByText("M")).toBeInTheDocument();
  });

  it("mostra fallback para visitante", async () => {
    renderWithAuth(<Header onMenuClick={() => undefined} />);
    await waitFor(() => expect(screen.getByRole("link", { name: /Entrar/ })).toBeInTheDocument());
    expect(screen.getByRole("link", { name: "Conta demo" })).toBeInTheDocument();
  });
});
