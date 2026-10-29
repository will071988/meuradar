import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";

/** Registra cada transição de `loading` para podermos asertir a sequência real. */
const loadingHistory: boolean[] = [];
function LoadingHistory({ loading }: { loading: boolean }) {
  loadingHistory.push(loading);
  return null;
}

/** Espelho do contexto para inspecionar o comportamento observável. */
function Probe() {
  const { user, loading, isMock, signIn, signUp, signOut, updateName } = useAuth();
  return (
    <div>
      <p data-testid="loading">{String(loading)}</p>
      <span data-testid="loading-history" hidden>
        <LoadingHistory loading={loading} />
      </span>
      <p data-testid="isMock">{String(isMock)}</p>
      <p data-testid="user">{user ? `${user.name}|${user.email}` : "anonimo"}</p>
      <button type="button" onClick={() => void signIn("william@exemplo.com", "123456")}>
        entrar
      </button>
      <button
        type="button"
        onClick={() => void signIn("email-invalido", "123")}
      >
        entrar-invalido
      </button>
      <button
        type="button"
        onClick={() => void signUp("William", "william@exemplo.com", "123456")}
      >
        cadastrar
      </button>
      <button
        type="button"
        onClick={() => void signUp("", "", "")}
      >
        cadastrar-invalido
      </button>
      <button type="button" onClick={() => void updateName("Will")}>
        renomear
      </button>
      <button type="button" onClick={() => void signOut()}>
        sair
      </button>
    </div>
  );
}

function renderAuth() {
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  loadingHistory.length = 0;
});

describe("AuthProvider — comportamento da aplicação", () => {
  it("passa por loading e termina como anônimo (sem sessão)", async () => {
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

    // sequência real: começa em true e assenta em false
    expect(loadingHistory[0]).toBe(true);
    expect(loadingHistory[loadingHistory.length - 1]).toBe(false);

    expect(screen.getByTestId("user")).toHaveTextContent("anonimo");
    expect(window.localStorage.getItem("meuradar-user-v1")).toBeNull();
  });

  it("modo demo sem Supabase", async () => {
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    expect(screen.getByTestId("isMock")).toHaveTextContent("true");
  });

  it("login bem-sucedido persiste a sessão local", async () => {
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

    await userEvent.click(screen.getByRole("button", { name: "entrar" }));

    await waitFor(() =>
      expect(screen.getByTestId("user")).toHaveTextContent("william@exemplo.com")
    );
    expect(window.localStorage.getItem("meuradar-user-v1")).toContain("william@exemplo.com");
  });

  it("login com credenciais inválidas é bloqueado e não altera o estado", async () => {
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

    await userEvent.click(screen.getByRole("button", { name: "entrar-invalido" }));

    // não faz chamada: continua anônimo
    expect(screen.getByTestId("user")).toHaveTextContent("anonimo");
    expect(window.localStorage.getItem("meuradar-user-v1")).toBeNull();
  });

  it("cadastro exige nome, e-mail e senha", async () => {
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

    await userEvent.click(screen.getByRole("button", { name: "cadastrar-invalido" }));
    expect(screen.getByTestId("user")).toHaveTextContent("anonimo");

    await userEvent.click(screen.getByRole("button", { name: "cadastrar" }));
    await waitFor(() =>
      expect(screen.getByTestId("user")).toHaveTextContent("William|william@exemplo.com")
    );
  });

  it("logout limpa a sessão", async () => {
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

    await userEvent.click(screen.getByRole("button", { name: "entrar" }));
    await waitFor(() =>
      expect(screen.getByTestId("user")).not.toHaveTextContent("anonimo")
    );

    await userEvent.click(screen.getByRole("button", { name: "sair" }));
    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("anonimo"));
    expect(window.localStorage.getItem("meuradar-user-v1")).toBeNull();
  });

  it("renomear persiste o novo nome", async () => {
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

    await userEvent.click(screen.getByRole("button", { name: "entrar" }));
    await waitFor(() =>
      expect(screen.getByTestId("user")).not.toHaveTextContent("anonimo")
    );

    await userEvent.click(screen.getByRole("button", { name: "renomear" }));
    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("Will|"));
  });

  it("useAuth fora do provider lança erro claro", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    function Orphan() {
      useAuth();
      return null;
    }
    expect(() => render(<Orphan />)).toThrow(/AuthProvider/);
    spy.mockRestore();
  });
});
