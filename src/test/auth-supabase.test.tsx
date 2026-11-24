import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const calls = {
  signIn: vi.fn(async () => ({ error: null })),
  signUp: vi.fn(async () => ({ error: { message: "e-mail já cadastrado" } })),
  signOut: vi.fn(async () => undefined),
  updateUser: vi.fn(async () => undefined),
  upsert: vi.fn(async () => undefined),
  getSession: vi.fn(
    async (): Promise<{
      data: { session: { user: { id: string; email: string; user_metadata?: { name?: string } } } | null };
    }> => ({ data: { session: null } })
  ),
  onAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } },
  })),
};

let authCallback: ((event: string, session: unknown) => void) | null = null;
let clientAvailable = true;

vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: () => true,
  getSupabaseBrowserClient: () =>
    clientAvailable
      ? {
          auth: {
            getSession: calls.getSession,
            onAuthStateChange: (cb: (event: string, session: unknown) => void) => {
              authCallback = cb;
              return calls.onAuthStateChange();
            },
            signInWithPassword: calls.signIn,
            signUp: calls.signUp,
            signOut: calls.signOut,
            updateUser: calls.updateUser,
          },
          from: () => ({ upsert: calls.upsert }),
        }
      : null,
}));

import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";

function Probe() {
  const { user, loading, isMock, signIn, signUp, signOut, updateName } = useAuth();
  return (
    <div>
      <p data-testid="loading">{String(loading)}</p>
      <p data-testid="isMock">{String(isMock)}</p>
      <p data-testid="user">{user ? `${user.name}|${user.email}` : "anonimo"}</p>
      <button onClick={() => void signIn("  WILLIAM@EXEMPLO.COM ", "123456")}>entrar</button>
      <button onClick={() => void signUp("Novo", "novo@exemplo.com", "123456")}>cadastrar</button>
      <button onClick={() => void signOut()}>sair</button>
      <button onClick={() => void updateName("Alterado")}>renomear</button>
    </div>
  );
}

function renderAuth() {
  return render(<AuthProvider><Probe /></AuthProvider>);
}

beforeEach(() => {
  window.localStorage.clear();
  authCallback = null;
  clientAvailable = true;
  vi.clearAllMocks();
  calls.getSession.mockResolvedValue({ data: { session: null } });
  calls.signUp.mockResolvedValue({ error: { message: "e-mail já cadastrado" } });
});

describe("AuthProvider com Supabase", () => {
  it("carrega sessão existente com nome do metadata", async () => {
    calls.getSession.mockResolvedValue({
      data: { session: { user: { id: "u1", email: "ana@exemplo.com", user_metadata: { name: "Ana" } } } },
    });
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("Ana|ana@exemplo.com"));
    expect(screen.getByTestId("isMock")).toHaveTextContent("false");
    expect(calls.getSession).toHaveBeenCalled();
  });

  it("usa o prefixo do e-mail quando não há nome", async () => {
    calls.getSession.mockResolvedValue({
      data: { session: { user: { id: "u1", email: "bruno@exemplo.com" } } },
    });
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("bruno|bruno@exemplo.com"));
  });

  it("faz login e normaliza o e-mail", async () => {
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    await userEvent.click(screen.getByRole("button", { name: "entrar" }));
    expect(calls.signIn).toHaveBeenCalledWith({ email: "william@exemplo.com", password: "123456" });
  });

  it("propaga erro do cadastro", async () => {
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    await userEvent.click(screen.getByRole("button", { name: "cadastrar" }));
    expect(calls.signUp).toHaveBeenCalledWith({
      email: "novo@exemplo.com",
      password: "123456",
      options: { data: { name: "Novo" } },
    });
  });

  it("atualiza usuário por auth state change", async () => {
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    expect(authCallback).not.toBeNull();
    authCallback!("SIGNED_IN", {
      user: { id: "u2", email: "carla@exemplo.com", user_metadata: { name: "Carla" } },
    });
    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("Carla|carla@exemplo.com"));
  });

  it("limpa usuário quando a sessão termina", async () => {
    calls.getSession.mockResolvedValue({
      data: { session: { user: { id: "u1", email: "ana@exemplo.com" } } },
    });
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("user")).not.toHaveTextContent("anonimo"));
    authCallback!("SIGNED_OUT", null);
    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("anonimo"));
  });

  it("logout e renomear chamam o Supabase", async () => {
    calls.getSession.mockResolvedValue({
      data: { session: { user: { id: "u1", email: "ana@exemplo.com" } } },
    });
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("user")).not.toHaveTextContent("anonimo"));
    await userEvent.click(screen.getByRole("button", { name: "renomear" }));
    expect(calls.updateUser).toHaveBeenCalled();
    expect(calls.upsert).toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "sair" }));
    expect(calls.signOut).toHaveBeenCalled();
  });

  it("sem cliente mantém sessão local e não autentica", async () => {
    clientAvailable = false;
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    expect(screen.getByTestId("user")).toHaveTextContent("anonimo");
    await userEvent.click(screen.getByRole("button", { name: "entrar" }));
    expect(screen.getByTestId("user")).toHaveTextContent("anonimo");
    expect(calls.signIn).not.toHaveBeenCalled();
  });
});
