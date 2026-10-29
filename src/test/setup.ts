import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

/**
 * Estado do router controlável pelos testes.
 * Precisa ser criado com vi.hoisted para ser usado dentro dos factories de mock;
 * por isso é exposto via getters/setters (vi.hoisted não pode ser exportado).
 */
const routerState = vi.hoisted(() => ({ pathname: "/" }));

export function setPathname(pathname: string): void {
  routerState.pathname = pathname;
}

export function getPathname(): string {
  return routerState.pathname;
}

// Mocks do Next aplicados a todos os testes (top-level é exigido pelo Vitest).
vi.mock("next/link", async () => {
  const { createElement } = await import("react");
  const DROP = ["prefetch", "replace", "scroll", "passHref", "legacyBehavior", "shallow", "locale"];

  return {
    default: (props: {
      href?: string | { pathname?: string };
      children?: unknown;
      [key: string]: unknown;
    }) => {
      const { href, children, ...rest } = props;
      const target = typeof href === "string" ? href : (href?.pathname ?? "#");
      const anchor: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(rest)) {
        if (!DROP.includes(k)) anchor[k] = v;
      }
      return createElement("a", { href: target, ...anchor }, children as never);
    },
  };
});

vi.mock("next/navigation", () => ({
  usePathname: () => routerState.pathname,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

afterEach(() => {
  cleanup();
  if (typeof window !== "undefined") window.localStorage.clear();
  routerState.pathname = "/";
  vi.restoreAllMocks();
});


/** Resposta padrão para chamadas de API feitas pelos hooks useApi em testes de UI. */
export function apiResponse<T>(data: T, source: "live" | "demo" = "demo"): unknown {
  return { source, updatedAt: "2026-01-01T12:00:00.000Z", data };
}

/** Instala um fetch determinístico que responde JSON sem rede. */
export function stubFetch(handler: (url: string) => unknown): ReturnType<typeof vi.fn> {
  const fn = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();
    const body = handler(url);
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}
