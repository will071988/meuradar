import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PriceTrack } from "@/types";

// Estado controlável do "Supabase" falso
const state: {
  rows: Record<string, unknown>[];
  selectError: { message: string } | null;
  insertId: string | null;
  insertError: { message: string } | null;
  updateError: { message: string } | null;
  deleteError: { message: string } | null;
  calls: string[];
} = {
  rows: [],
  selectError: null,
  insertId: null,
  insertError: null,
  updateError: null,
  deleteError: null,
  calls: [],
};

function buildClient() {
  // Um único builder "multifuncional": qualquer método encadeia, e o objeto
  // também é awaitable (caso de update(...).eq(...) e delete(...).eq(...)).
  function builder(): Record<string, unknown> {
    const b: Record<string, unknown> = {};
    const chain = () => b;
    b.select = () => {
      state.calls.push("select");
      return b;
    };
    b.insert = () => {
      state.calls.push("insert");
      return b;
    };
    b.update = () => {
      state.calls.push("update");
      return b;
    };
    b.delete = () => {
      state.calls.push("delete");
      return b;
    };
    b.order = () => {
      state.calls.push("order");
      return Promise.resolve({ data: state.rows, error: state.selectError });
    };
    b.single = () => {
      state.calls.push("single");
      return Promise.resolve({
        data: state.insertId ? { id: state.insertId } : null,
        error: state.insertError,
      });
    };
    b.eq = () => {
      state.calls.push("eq");
      return chain();
    };
    // awaitável → resolve conforme a operação em andamento
    b.then = (
      onFulfilled: (v: unknown) => unknown,
      onRejected?: (e: unknown) => unknown
    ) => {
      const error = state.updateError ?? state.deleteError ?? null;
      return Promise.resolve({ data: null, error }).then(onFulfilled, onRejected);
    };
    return b;
  }

  return {
    from(table: string) {
      state.calls.push(`from:${table}`);
      return builder();
    },
  };
}

vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: () => true,
  getSupabaseBrowserClient: () => buildClient(),
}));

const row = {
  id: "uuid-1",
  user_id: "u1",
  product: "Monitor LG",
  store: "Loja",
  target_price: 1899,
  current_price: 2249,
  history: [{ at: "2026-01-01T00:00:00Z", price: 2249 }],
  active: true,
  created_at: "2026-01-01T00:00:00Z",
};

beforeEach(() => {
  state.rows = [];
  state.selectError = null;
  state.insertId = null;
  state.insertError = null;
  state.updateError = null;
  state.deleteError = null;
  state.calls = [];
});

describe("precosCloud — somente cloud", () => {
  it("mapeia linhas do banco para PriceTrack", async () => {
    const { fetchCloudTracks } = await import("@/lib/pricesCloud");
    state.rows = [row];

    const tracks = await fetchCloudTracks("u1");
    expect(tracks).toHaveLength(1);
    expect(tracks?.[0]).toMatchObject({
      id: "cloud-uuid-1",
      cloudId: "uuid-1",
      product: "Monitor LG",
      targetPrice: 1899,
      currentPrice: 2249,
      active: true,
    });
  });

  it("retorna lista vazia quando não há linhas", async () => {
    const { fetchCloudTracks } = await import("@/lib/pricesCloud");
    state.rows = [];
    expect(await fetchCloudTracks("u1")).toEqual([]);
  });

  it("retorna null quando o banco responde erro", async () => {
    const { fetchCloudTracks } = await import("@/lib/pricesCloud");
    state.selectError = { message: "RLS" };
    expect(await fetchCloudTracks("u1")).toBeNull();
  });

  it("insert devolve o id criado", async () => {
    const { insertCloudTrack } = await import("@/lib/pricesCloud");
    state.insertId = "novo-id";
    const track: PriceTrack = {
      id: "local-1",
      product: "Teclado",
      store: "Kabum",
      targetPrice: 300,
      currentPrice: 450,
      history: [],
      active: true,
      createdAt: "2026-01-01T00:00:00Z",
    };
    expect(await insertCloudTrack("u1", track)).toBe("novo-id");
    expect(state.calls).toContain("insert");
  });

  it("insert devolve null em erro", async () => {
    const { insertCloudTrack } = await import("@/lib/pricesCloud");
    state.insertError = { message: "violou constraint" };
    const track: PriceTrack = {
      id: "local-1",
      product: "Teclado",
      store: "Kabum",
      targetPrice: 300,
      currentPrice: 450,
      history: [],
      active: true,
      createdAt: "2026-01-01T00:00:00Z",
    };
    expect(await insertCloudTrack("u1", track)).toBeNull();
  });

  it("update/delete devolvem booleano conforme erro", async () => {
    const { updateCloudTrack, deleteCloudTrack } = await import("@/lib/pricesCloud");
    state.updateError = null;
    expect(await updateCloudTrack("uuid-1", { active: false })).toBe(true);
    state.deleteError = { message: "negado" };
    expect(await deleteCloudTrack("uuid-1")).toBe(false);
  });
});

describe("precosCloud — sem credencial (guard)", () => {
  it("desliga o sync quando o Supabase não está configurado", async () => {
    vi.resetModules();
    vi.doMock("@/lib/supabase", () => ({
      isSupabaseConfigured: () => false,
      getSupabaseBrowserClient: () => null,
    }));
    const mod = await import("@/lib/pricesCloud");

    expect(mod.canSyncPrices()).toBe(false);
    expect(await mod.fetchCloudTracks("u1")).toBeNull();
    expect(
      await mod.insertCloudTrack("u1", {
        id: "x",
        product: "P",
        store: "S",
        targetPrice: 1,
        currentPrice: 2,
        history: [],
        active: true,
        createdAt: "2026-01-01T00:00:00Z",
      })
    ).toBeNull();
    expect(await mod.updateCloudTrack("id", { active: true })).toBe(false);
    expect(await mod.deleteCloudTrack("id")).toBe(false);

    vi.resetModules();
    vi.doUnmock("@/lib/supabase");
  });
});
