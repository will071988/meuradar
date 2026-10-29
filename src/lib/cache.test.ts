import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchWithTimeout, getCache, setCache } from "@/lib/cache";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("cache", () => {
  it("armazena e recupera payload", () => {
    setCache("k1", { a: 1 }, 60_000);
    expect(getCache<{ a: number }>("k1")).toEqual({ a: 1 });
  });

  it("retorna null para chave inexistente", () => {
    expect(getCache("nao-existe")).toBeNull();
  });

  it("expira após o TTL", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    setCache("k2", "valor", 1000);

    vi.setSystemTime(new Date("2026-01-01T00:00:00.500Z"));
    expect(getCache<string>("k2")).toBe("valor");

    vi.setSystemTime(new Date("2026-01-01T00:00:02.000Z"));
    expect(getCache<string>("k2")).toBeNull();
  });
});

describe("fetchWithTimeout", () => {
  it("resolve a resposta normal", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("ok"))
    );
    const res = await fetchWithTimeout("https://example.com", 5000);
    expect(await res.text()).toBe("ok");
  });

  it("aborta quando excede o timeout", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
          })
      )
    );

    vi.useFakeTimers();
    const promise = fetchWithTimeout("https://lento.example", 100);
    const assertion = expect(promise).rejects.toMatchObject({ name: "AbortError" });
    await vi.advanceTimersByTimeAsync(150);
    await assertion;
  });

  it("propaga erro de rede", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("rede fora");
      })
    );
    await expect(fetchWithTimeout("https://example.com")).rejects.toThrow("rede fora");
  });
});
